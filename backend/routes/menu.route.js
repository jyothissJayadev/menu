// routes/menu.route.js
import express from "express";
import Category from "../models/Category.schema.js";
import Item from "../models/Item.schema.js";
import Addon from "../models/Addon.schema.js";
import TopPick from "../models/TopPick.schema.js";
import { isNowInWindows } from "../utils/timing.js";

const router = express.Router({ mergeParams: true });

/**
 * GET /api/companies/:companyId/menu
 * Returns categories with items.
 * Query: ?all=true => returns all items for staff app (including out-of-stock items)
 */
router.get("/", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const includeAll = req.query.all === "true";

    const categories = await Category.find({ companyId })
      .sort({ position: 1, createdAt: 1 })
      .lean();
    const items = await Item.find({ companyId }).lean();

    // Map items by category
    const mapByCat = {};
    items.forEach((it) => {
      const key = String(it.categoryId);
      if (!mapByCat[key]) mapByCat[key] = [];

      // For customer menu, filter by timing windows; staff gets all
      if (includeAll || isNowInWindows(it.timing)) {
        mapByCat[key].push(it);
      }
    });

    // Only categories that have items (or all categories if staff requested)
    const resultCategories = categories
      .map((cat) => ({
        ...cat,
        items: mapByCat[String(cat._id)] || [],
      }))
      .filter((cat) => (includeAll ? true : cat.items.length > 0));

    res.json({ categories: resultCategories, allItems: items });
  } catch (err) {
    console.error("get menu err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/companies/:companyId/menu/categories
 * Create category
 */
router.post("/categories", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const { name, position = 0 } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Category name required" });

    // Check if category name exists
    let cat = await Category.findOne({
      companyId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (!cat) {
      cat = await Category.create({ companyId, name: name.trim(), position });
    }

    res.status(201).json(cat);
  } catch (err) {
    console.error("create category err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PATCH /api/companies/:companyId/menu/categories/reorder
 * Reorder categories by updating their sequential positions
 */
router.patch("/categories/reorder", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds array is required" });
    }

    const updateOps = orderedIds.map((id, index) =>
      Category.updateOne(
        { _id: id, companyId },
        { $set: { position: index + 1 } }
      )
    );
    await Promise.all(updateOps);

    const updatedCategories = await Category.find({ companyId })
      .sort({ position: 1, createdAt: 1 })
      .lean();

    res.json({ success: true, categories: updatedCategories });
  } catch (err) {
    console.error("reorder categories err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/companies/:companyId/menu/categories/:categoryId
 */
router.delete("/categories/:categoryId", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const { categoryId } = req.params;

    await Category.deleteOne({ _id: categoryId, companyId });
    await Item.deleteMany({ categoryId, companyId });

    res.json({ success: true, message: "Category and associated items deleted" });
  } catch (err) {
    console.error("delete category err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/companies/:companyId/menu/items
 * Create new cake / menu item
 */
router.post("/items", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const {
      categoryId,
      categoryName,
      name,
      description = "",
      price,
      image = "",
      veg = true,
      offer = false,
      offerPrice = null,
      available = true,
    } = req.body;

    if (!name || typeof price === "undefined") {
      return res.status(400).json({ error: "Name and price are required" });
    }

    let targetCatId = categoryId;

    // If new category name provided, find or create it
    if (categoryName && categoryName.trim()) {
      let cat = await Category.findOne({
        companyId,
        name: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
      });
      if (!cat) {
        cat = await Category.create({
          companyId,
          name: categoryName.trim(),
          position: 99,
        });
      }
      targetCatId = cat._id;
    }

    if (!targetCatId) {
      return res.status(400).json({ error: "Valid categoryId or categoryName is required" });
    }

    const item = await Item.create({
      companyId,
      categoryId: targetCatId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image,
      veg,
      offer: Boolean(offer),
      offerPrice: offer && offerPrice ? Number(offerPrice) : null,
      available: available !== undefined ? Boolean(available) : true,
      timing: [],
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("create item err", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

/**
 * PUT /api/companies/:companyId/menu/items/:itemId
 * Update cake / menu item (e.g. stock toggle, price edit)
 */
router.put("/items/:itemId", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const { itemId } = req.params;
    const updates = req.body;

    // If changing category name
    if (updates.categoryName && updates.categoryName.trim()) {
      let cat = await Category.findOne({
        companyId,
        name: { $regex: new RegExp(`^${updates.categoryName.trim()}$`, "i") },
      });
      if (!cat) {
        cat = await Category.create({
          companyId,
          name: updates.categoryName.trim(),
          position: 99,
        });
      }
      updates.categoryId = cat._id;
      delete updates.categoryName;
    }

    const item = await Item.findOneAndUpdate(
      { _id: itemId, companyId },
      updates,
      { new: true }
    );

    if (!item) return res.status(404).json({ error: "Item not found" });

    // Check if any category is left with 0 items and prune it
    const allItems = await Item.find({ companyId }).lean();
    const activeCatIds = new Set(allItems.map((i) => String(i.categoryId)));
    await Category.deleteMany({
      companyId,
      _id: { $nin: Array.from(activeCatIds) },
    });

    res.json(item);
  } catch (err) {
    console.error("update item err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/companies/:companyId/menu/items/:itemId
 * Delete an item and automatically prune empty categories!
 */
router.delete("/items/:itemId", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const { itemId } = req.params;

    const item = await Item.findOneAndDelete({ _id: itemId, companyId });
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Auto-prune categories that now have 0 items
    const remainingItems = await Item.find({ companyId }).lean();
    const activeCatIds = new Set(remainingItems.map((i) => String(i.categoryId)));
    await Category.deleteMany({
      companyId,
      _id: { $nin: Array.from(activeCatIds) },
    });

    res.json({ success: true, deletedId: itemId });
  } catch (err) {
    console.error("delete item err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/companies/:companyId/menu/items/:itemId/addons
 */
router.get("/items/:itemId/addons", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const { itemId } = req.params;
    const addons = await Addon.find({ companyId, itemId }).lean();
    res.json(addons);
  } catch (err) {
    console.error("get addons err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/companies/:companyId/menu/top-picks
 */
router.get("/top-picks", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const picks = await TopPick.find({ companyId, included: true })
      .populate("itemId")
      .sort({ position: 1 })
      .lean();
    res.json(picks);
  } catch (err) {
    console.error("top picks err", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
