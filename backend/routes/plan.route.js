// routes/plan.route.js
import express from "express";
import Plan from "../models/Plan.schema.js";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * GET /api/plans
 */
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find().lean();
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/plans
 * Create plan (admin owners)
 */
router.post(
  "/",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const { name, durationDays, planId, amount, features } = req.body;
      if (!name || !planId || !durationDays || !amount)
        return res.status(400).json({ error: "Missing fields" });
      const plan = await Plan.create({
        name,
        durationDays,
        planId,
        amount,
        features,
      });
      res.status(201).json(plan);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
