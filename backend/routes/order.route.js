// routes/order.route.js
import express from "express";
import Order from "../models/Order.schema.js";
import Item from "../models/Item.schema.js";
import Addon from "../models/Addon.schema.js";
import { generateOrderNo } from "../utils/orderNumber.js";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });

/**
 * POST /api/companies/:companyId/orders
 * Body: { items: [{ itemId, qty, addons: [addonId] }], table, name, phone }
 */
router.post("/", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const { items, table = null, name = null, phone = null } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "No items provided" });

    // fetch item docs
    const itemIds = items.map((i) => i.itemId);
    const itemDocs = await Item.find({ _id: { $in: itemIds } }).lean();
    const itemMap = {};
    itemDocs.forEach((it) => (itemMap[String(it._id)] = it));

    // fetch addons for snapshot
    const addonIds = [].concat(...items.map((i) => i.addons || []));
    const addonDocs = addonIds.length
      ? await Addon.find({ _id: { $in: addonIds } }).lean()
      : [];
    const addonMap = {};
    addonDocs.forEach((a) => (addonMap[String(a._id)] = a));

    const orderItems = items.map((i) => {
      const it = itemMap[String(i.itemId)];
      if (!it) throw new Error("Item not found: " + i.itemId);
      const price = it.offer ? it.offerPrice ?? it.price : it.price;
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
        qty: i.qty || 1,
        price: price + addonsTotal,
        addons: selectedAddons.map((a) => a.addonId),
      };
    });

    const total = orderItems.reduce((s, it) => s + it.price * it.qty, 0);
    const orderNo = await generateOrderNo("orders");

    const order = await Order.create({
      companyId,
      orderNo,
      items: orderItems,
      table,
      name,
      phone,
      total,
      status: "pending",
      startTime: new Date(),
    });

    // TODO: push realtime update to kitchen via socket / pusher
    res.status(201).json(order);
  } catch (err) {
    console.error("create order err", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

/**
 * GET /api/companies/:companyId/orders/:orderId
 */
router.get("/:orderId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { orderId } = req.params;
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
 * protected route (owner/manager/staff)
 */
router.patch(
  "/:orderId/status",
  authenticate,
  authorizeRole("owner", "manager", "staff"),
  async (req, res) => {
    try {
      const { companyId } = req.params;
      const { orderId } = req.params;
      const { status } = req.body;
      const allowed = [
        "pending",
        "preparing",
        "served",
        "completed",
        "cancelled",
      ];
      if (!allowed.includes(status))
        return res.status(400).json({ error: "Invalid status" });
      const order = await Order.findOneAndUpdate(
        { _id: orderId, companyId },
        {
          status,
          endTime:
            status === "served" || status === "completed"
              ? new Date()
              : undefined,
        },
        { new: true }
      );
      if (!order) return res.status(404).json({ error: "Order not found" });
      // Optionally compute durationMinutes
      if (order.startTime && order.endTime) {
        order.durationMinutes = Math.round(
          (order.endTime - order.startTime) / 60000
        );
        await order.save();
      }
      res.json(order);
    } catch (err) {
      console.error("update order status err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * GET /api/companies/:companyId/orders
 * query: ?status=&table=
 */
router.get(
  "/",
  authenticate,
  authorizeRole("owner", "manager", "staff"),
  async (req, res) => {
    try {
      const { companyId } = req.params;
      const { status, table } = req.query;
      const q = { companyId };
      if (status) q.status = status;
      if (table) q.table = table;
      const orders = await Order.find(q)
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();
      res.json(orders);
    } catch (err) {
      console.error("list orders err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
