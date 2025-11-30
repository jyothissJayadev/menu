// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(401).json({ error: "Unauthorized" });
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  } catch (err) {
    console.error("auth error", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorizeRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };

export const signJwt = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
};
