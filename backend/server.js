// server.js  (ES MODULE VERSION)
// Make sure your package.json contains:  "type": "module"

import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Convert __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env first, then root ../.env
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Env & config
const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/qr-menu-hub";
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();

/* -----------------------------
   Middlewares
   ----------------------------- */
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* -----------------------------
   Health Check
   ----------------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* -----------------------------
   Import Routes (ESM imports)
   ----------------------------- */
// (these imports can remain at top; they don't require DB connection to be defined)
import authRoute from "./routes/auth.route.js";
import companyRoute from "./routes/company.route.js";
import planRoute from "./routes/plan.route.js";
import menuRoute from "./routes/menu.route.js";
import orderRoute from "./routes/order.route.js";
import paymentRoute from "./routes/payment.route.js";
import topPickRoute from "./routes/topPick.route.js";
import uploadRoute from "./routes/upload.route.js";

/* -----------------------------
   Route Mounting
   ----------------------------- */
// Serve local uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Uploads (Multer + Cloudinary / Cloudflare R2)
app.use("/api/upload", uploadRoute);
app.use(
  "/api/companies/:companyId/upload",
  (req, res, next) => {
    req.companyId = req.params.companyId;
    next();
  },
  uploadRoute
);

app.use("/api/auth", authRoute);

app.use("/api/companies", companyRoute);
app.use("/api/plans", planRoute);

// Menu (companyId injection)
app.use(
  "/api/companies/:companyId/menu",
  (req, res, next) => {
    req.companyId = req.params.companyId;
    next();
  },
  menuRoute
);

// Orders
app.use(
  "/api/companies/:companyId/orders",
  (req, res, next) => {
    req.companyId = req.params.companyId;
    next();
  },
  orderRoute
);

// Payments
app.use(
  "/api/companies/:companyId/payments",
  (req, res, next) => {
    req.companyId = req.params.companyId;
    next();
  },
  paymentRoute
);

// Top Picks
app.use(
  "/api/companies/:companyId/top-picks",
  (req, res, next) => {
    req.companyId = req.params.companyId;
    next();
  },
  topPickRoute
);

/* -----------------------------
   404 Handler
   ----------------------------- */
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

/* -----------------------------
   Central Error Handler
   ----------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    ...(NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

/* -----------------------------
   Start Server (after DB connect)
   ----------------------------- */
let server;

/**
 * Connect to MongoDB and start the HTTP server.
 * Uses modern mongoose.connect(MONGO_URI) without deprecated options.
 */
async function startServer() {
  try {
    mongoose.set("strictQuery", true);

    console.log("Connecting to MongoDB...", MONGO_URI);
    // Do NOT pass useNewUrlParser / useUnifiedTopology — modern driver handles this.
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (env: ${NODE_ENV})`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    console.log("this is the mongourl ", MONGO_URI);
    // Exit with failure (nodemon will keep restart attempts)
    process.exit(1);
  }
}

startServer();

/* -----------------------------
   Graceful Shutdown
   ----------------------------- */
const shutdown = (signal) => {
  console.log(`\nReceived ${signal} — closing server...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      mongoose.connection.close(false, () => {
        console.log("MongoDB disconnected.");
        process.exit(0);
      });
    });
  } else {
    // If server not started, just close mongoose and exit
    mongoose.connection.close(false, () => {
      console.log("MongoDB disconnected (server not started).");
      process.exit(0);
    });
  }

  // Hard-exit fallback after 10s
  setTimeout(() => {
    console.error("Force exit.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});
