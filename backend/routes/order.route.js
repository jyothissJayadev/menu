// routes/order.route.js
import express from "express";
import Order from "../models/Order.schema.js";
import Item from "../models/Item.schema.js";
import Addon from "../models/Addon.schema.js";

const router = express.Router({ mergeParams: true });

/**
 * POST /api/companies/:companyId/orders
 * Body: { items: [{ itemId, qty, addons: [addonId] }], table, name, phone, notes }
 * Public endpoint used by customer Web Menu to place orders.
 */
router.post("/", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const { items, table = "Takeaway", name = "Guest", phone = "", notes = "" } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided in order" });
    }

    // fetch item docs
    const itemIds = items.map((i) => i.itemId);
    const itemDocs = await Item.find({ _id: { $in: itemIds } }).lean();
    const itemMap = {};
    itemDocs.forEach((it) => (itemMap[String(it._id)] = it));

    // fetch addons for snapshot if present
    const addonIds = [].concat(...items.map((i) => i.addons || []));
    const addonDocs = addonIds.length
      ? await Addon.find({ _id: { $in: addonIds } }).lean()
      : [];
    const addonMap = {};
    addonDocs.forEach((a) => (addonMap[String(a._id)] = a));

    const orderItems = items.map((i) => {
      const it = itemMap[String(i.itemId)];
      const variantName = i.variant || i.weight || "";
      const itemPrice = typeof i.price === "number" && i.price > 0
        ? i.price
        : it
        ? (it.offer && it.offerPrice ? it.offerPrice : it.price)
        : 0;

      if (!it) {
        // Fallback if item was passed with name & price directly
        return {
          itemId: i.itemId,
          name: i.name || "Special Item",
          variant: variantName,
          qty: i.qty || 1,
          price: itemPrice,
          addons: [],
        };
      }

      const selectedAddons = (i.addons || [])
        .map((aid) => {
          const a = addonMap[String(aid)];
          if (!a) return null;
          return { addonId: a._id, name: a.name, price: a.price };
        })
        .filter(Boolean);
      const addonsTotal = selectedAddons.reduce(
        (s, a) => s + (a.price || 0),
        0
      );
      return {
        itemId: it._id,
        name: it.name,
        variant: variantName,
        qty: i.qty || 1,
        price: itemPrice + addonsTotal,
        addons: selectedAddons.map((a) => a.addonId),
      };
    });

    const total = orderItems.reduce((s, it) => s + it.price * it.qty, 0);

    // Continuous sequential order numbering (starting at 101)
    const lastOrder = await Order.findOne({ companyId }).sort({ orderNumber: -1 }).lean();
    const nextOrderNumber = lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 101;
    const orderNo = `ORD-${nextOrderNumber}`;

    // Standardize Indian phone number (+91 XXXXXXXXXX)
    let formattedPhone = phone ? String(phone).trim() : "";
    const digitsOnly = formattedPhone.replace(/\D/g, "");
    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
      formattedPhone = `+91 ${digitsOnly.slice(2)}`;
    } else if (digitsOnly.length === 10) {
      formattedPhone = `+91 ${digitsOnly}`;
    }

    const order = await Order.create({
      companyId,
      orderNo,
      orderNumber: nextOrderNumber,
      items: orderItems,
      table: table || "Takeaway",
      name: name || "Customer",
      phone: formattedPhone,
      notes: notes || "",
      total,
      status: "pending",
      startTime: new Date(),
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("create order err", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

/**
 * GET /api/companies/:companyId/orders/:orderId
 * Public tracking endpoint for customer on web menu.
 */
router.get("/:orderId", async (req, res) => {
  try {
    const { companyId, orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, companyId }).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PATCH /api/companies/:companyId/orders/:orderId/status
 * body: { status }
 * Used by phone app to advance or revert status
 */
router.patch("/:orderId/status", async (req, res) => {
  try {
    const { companyId, orderId } = req.params;
    const { status } = req.body;
    const allowed = [
      "pending",
      "preparing",
      "cooking",
      "served",
      "completed",
      "delivered",
      "cancelled",
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status: " + status });
    }

    const order = await Order.findOne({ _id: orderId, companyId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;

    if (status === "completed" || status === "served" || status === "delivered") {
      if (!order.endTime) {
        order.endTime = new Date();
      }
      if (order.startTime && order.endTime) {
        order.durationMinutes = Math.max(
          1,
          Math.round((order.endTime - order.startTime) / 60000)
        );
      }
    } else if (status === "pending" || status === "cooking" || status === "preparing") {
      // Reverted status: clear end time
      order.endTime = undefined;
      order.durationMinutes = undefined;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("update order status err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/companies/:companyId/orders
 * query: ?status=&table=
 * Lists company orders for staff mobile app
 */
router.get("/", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status, table } = req.query;
    const q = { companyId };
    if (status) q.status = status;
    if (table) q.table = table;

    const orders = await Order.find(q)
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();
    res.json(orders);
  } catch (err) {
    console.error("list orders err", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
