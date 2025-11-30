// routes/auth.route.js
import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.schema.js";
import Company from "../models/Company.schema.js";
import { signJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

/**
 * POST /api/auth/register
 * body: { name, phone, password, companyId?, role? }
 */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      phone,
      password,
      companyId = null,
      role = "customer",
    } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ phone });
    if (exists)
      return res.status(400).json({ error: "Phone already registered" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      phone,
      password: hashed,
      companyId,
      role,
    });
    const token = signJwt(user);
    res
      .status(201)
      .json({
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/auth/login
 * body: { phone, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signJwt(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/auth/me
 */
router.get("/me", async (req, res) => {
  // Optional: require auth middleware upstream; if not, try to read token from header
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(200).json({ user: null });
    const token = header.split(" ")[1];
    // decode without verifying expiry for convenience? We'll verify using jwt.
    // For now just return null to keep simple. Real flow should use authenticate middleware.
    return res
      .status(200)
      .json({ msg: "Use /api/auth/me with auth middleware in routes" });
  } catch (err) {
    console.error(err);
    res.status(200).json({ user: null });
  }
});

export default router;
