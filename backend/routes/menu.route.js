// routes/menu.route.js
import express from "express";
import Category from "../models/Category.schema.js";
import Item from "../models/Item.schema.js";
import Addon from "../models/Addon.schema.js";
import TopPick from "../models/TopPick.schema.js";
import { isNowInWindows } from "../utils/timing.js";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });

/**
 * GET /api/companies/:companyId/menu
 * returns categories with items filtered by availability/timing
 */
router.get("/", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const categories = await Category.find({ companyId })
      .sort({ position: 1 })
      .lean();
    const items = await Item.find({ companyId }).lean();

    // filter items by available flag and item timing
    const nowFiltered = items.filter(
      (it) => it.available && isNowInWindows(it.timing)
    );
    const mapByCat = {};
    nowFiltered.forEach((it) => {
      const key = String(it.categoryId);
      if (!mapByCat[key]) mapByCat[key] = [];
      mapByCat[key].push(it);
    });

    const result = categories.map((cat) => ({
      ...cat,
      items: (mapByCat[String(cat._id)] || []).filter((it) =>
        isNowInWindows(cat.timing)
      ),
    }));

    res.json({ categories: result });
  } catch (err) {
    console.error("get menu err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/companies/:companyId/menu/categories
 * create category (owner/manager)
 */
router.post(
  "/categories",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const companyId = req.params.companyId || req.companyId;
      const { name, timing = [], position = 0 } = req.body;
      if (!name) return res.status(400).json({ error: "Name required" });
      const cat = await Category.create({ companyId, name, timing, position });
      res.status(201).json(cat);
    } catch (err) {
      console.error("create category err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * POST /api/companies/:companyId/menu/items
 * create item (owner/manager)
 */
router.post(
  "/items",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const companyId = req.params.companyId || req.companyId;
      const {
        categoryId,
        name,
        description = "",
        price,
        image = "",
        veg = true,
        offer = false,
        offerPrice = null,
        timing = [],
        available = true,
      } = req.body;
      if (!categoryId || !name || typeof price === "undefined")
        return res.status(400).json({ error: "Missing fields" });
      const item = await Item.create({
        companyId,
        categoryId,
        name,
        description,
        price,
        image,
        veg,
        offer,
        offerPrice,
        timing,
        available,
      });
      res.status(201).json(item);
    } catch (err) {
      console.error("create item err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * PUT /api/companies/:companyId/menu/items/:itemId
 * update item (owner/manager)
 */
router.put(
  "/items/:itemId",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const companyId = req.params.companyId || req.companyId;
      const { itemId } = req.params;
      const changes = req.body;
      const item = await Item.findOneAndUpdate(
        { _id: itemId, companyId },
        changes,
        { new: true }
      );
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (err) {
      console.error("update item err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * GET /api/companies/:companyId/items/:itemId/addons
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
 * POST /api/companies/:companyId/items/:itemId/addons
 */
router.post(
  "/items/:itemId/addons",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const companyId = req.params.companyId || req.companyId;
      const { itemId } = req.params;
      const {
        categoryName = "Addons",
        name,
        price = 0,
        included = false,
      } = req.body;
      if (!name) return res.status(400).json({ error: "Name required" });
      const addon = await Addon.create({
        companyId,
        itemId,
        categoryName,
        name,
        price,
        included,
      });
      res.status(201).json(addon);
    } catch (err) {
      console.error("create addon err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * GET /api/companies/:companyId/top-picks
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

/**
 * POST /api/companies/:companyId/top-picks
 */
router.post(
  "/top-picks",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const companyId = req.params.companyId || req.companyId;
      const { itemId, included = true, position = 0 } = req.body;
      if (!itemId) return res.status(400).json({ error: "itemId required" });
      const tp = await TopPick.create({
        companyId,
        itemId,
        included,
        position,
      });
      res.status(201).json(tp);
    } catch (err) {
      console.error("create top pick err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
