require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const predictRouter = require("./routes/predict");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Logging ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
// Note: multipart/form-data is handled by multer in routes; we only need JSON
// parsing for any future non-file endpoints.
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api", predictRouter);

// Root health check — useful for Docker / load-balancer probes
app.get("/", (req, res) => {
  res.json({ service: "DR Screening Backend", status: "ok" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// Catches anything thrown (or passed to next()) that wasn't handled above.
// express-async-errors automatically forwards async throws here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[unhandled]", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`   ML Service → ${process.env.ML_SERVICE_URL || "http://localhost:8000"}`);
  console.log(`   CORS origin → ${process.env.CLIENT_ORIGIN || "http://localhost:3000"}`);
});

module.exports = app; // exported for potential test suites