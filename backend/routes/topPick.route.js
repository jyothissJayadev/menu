// routes/topPick.route.js
import express from "express";
import TopPick from "../models/TopPick.schema.js";
import Item from "../models/Item.schema.js";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });

/**
 * GET /api/companies/:companyId/top-picks
 */
router.get("/", async (req, res) => {
  try {
    const companyId = req.params.companyId || req.companyId;
    const picks = await TopPick.find({ companyId, included: true })
      .populate("itemId")
      .sort({ position: 1 })
      .lean();
    res.json(picks);
  } catch (err) {
    console.error("get top picks err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/companies/:companyId/top-picks
 */
router.post(
  "/",
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

/**
 * DELETE /api/companies/:companyId/top-picks/:id
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      await TopPick.findByIdAndDelete(id);
      res.json({ ok: true });
    } catch (err) {
      console.error("delete top pick err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
