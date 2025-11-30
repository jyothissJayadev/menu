// routes/company.route.js
import express from "express";
import Company from "../models/Company.schema.js";
import Plan from "../models/Plan.schema.js";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * POST /api/companies
 * Create company (owner/admin)
 * body: { name, location, logo, planId }
 */
router.post(
  "/",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const { name, location, logo, planId } = req.body;
      if (!name) return res.status(400).json({ error: "Name required" });
      const comp = await Company.create({
        name,
        location,
        logo,
        planId,
        planActive: !!planId,
      });
      res.status(201).json(comp);
    } catch (err) {
      console.error("create company err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * GET /api/companies/:companyId
 */
router.get("/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const comp = await Company.findById(companyId).populate("planId").lean();
    if (!comp) return res.status(404).json({ error: "Company not found" });
    res.json(comp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/companies/:companyId
 * update company (owner/manager)
 */
router.put(
  "/:companyId",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const { companyId } = req.params;
      const update = req.body;
      const comp = await Company.findByIdAndUpdate(companyId, update, {
        new: true,
      });
      if (!comp) return res.status(404).json({ error: "Company not found" });
      res.json(comp);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
