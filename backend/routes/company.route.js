// routes/company.route.js
import express from "express";
import Company from "../models/Company.schema.js";

const router = express.Router();

/**
 * GET /api/companies
 * Returns all registered companies or the default cake shop
 */
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find().populate("planId").lean();
    res.json(companies);
  } catch (err) {
    console.error("list companies err", err);
    res.status(500).json({ error: "Server error" });
  }
});

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
 * POST /api/companies
 */
router.post("/", async (req, res) => {
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
});

/**
 * PUT /api/companies/:companyId
 */
router.put("/:companyId", async (req, res) => {
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
});

export default router;
