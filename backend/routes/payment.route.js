// routes/payment.route.js
import express from "express";
import PaymentHistory from "../models/PaymentHistory.schema.js";
import Company from "../models/Company.schema.js";
import Plan from "../models/Plan.schema.js";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router({ mergeParams: true });

/**
 * POST /api/companies/:companyId/payments/create
 * body: { paymentId, amount, planId, gateway }
 * -> creates PaymentHistory (pending)
 */
router.post(
  "/create",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const companyId = req.params.companyId || req.companyId;
      const { paymentId, amount, planId, gateway, rawResponse = {} } = req.body;
      if (!paymentId || !amount)
        return res.status(400).json({ error: "Missing fields" });
      const ph = await PaymentHistory.create({
        paymentId,
        companyId,
        amount,
        planId,
        gateway,
        status: "pending",
        rawResponse,
      });
      res.status(201).json(ph);
    } catch (err) {
      console.error("create payment err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * POST /api/companies/:companyId/payments/webhook
 * Called by gateway with verification (you should secure this route)
 */
router.post("/webhook", async (req, res) => {
  try {
    const {
      paymentId,
      status,
      gatewayResponse = {},
      companyId,
      planId,
    } = req.body;
    if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });
    const ph = await PaymentHistory.findOneAndUpdate(
      { paymentId },
      { status, rawResponse: gatewayResponse },
      { new: true, upsert: false }
    );
    // If success, set company planActive and attach plan
    if (status === "success" && ph) {
      await Company.findByIdAndUpdate(ph.companyId, {
        planId: ph.planId,
        planActive: true,
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("payment webhook err", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/companies/:companyId/payments
 */
router.get(
  "/",
  authenticate,
  authorizeRole("owner", "manager"),
  async (req, res) => {
    try {
      const companyId = req.params.companyId || req.companyId;
      const list = await PaymentHistory.find({ companyId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.json(list);
    } catch (err) {
      console.error("list payments err", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
