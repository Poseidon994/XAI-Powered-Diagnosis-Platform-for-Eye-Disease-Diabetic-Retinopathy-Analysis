// require("dotenv").config();
// require("express-async-errors");

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");

// const predictRouter = require("./routes/predict");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ─── Security & Logging ──────────────────────────────────────────────────────
// app.use(helmet());
// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
//     methods: ["GET", "POST"],
//   })
// );
// app.use(morgan("dev"));
// app.use(express.json({ limit: "50mb" }));

// // ─── Body Parsing ─────────────────────────────────────────────────────────────
// // Note: multipart/form-data is handled by multer in routes; we only need JSON
// // parsing for any future non-file endpoints.
// app.use(express.json());

// // ─── Routes ──────────────────────────────────────────────────────────────────
// app.use("/api", predictRouter);

// // Root health check — useful for Docker / load-balancer probes
// app.get("/", (req, res) => {
//   res.json({ service: "DR Screening Backend", status: "ok" });
// });

// // ─── Global Error Handler ────────────────────────────────────────────────────
// // Catches anything thrown (or passed to next()) that wasn't handled above.
// // express-async-errors automatically forwards async throws here.
// // eslint-disable-next-line no-unused-vars
// app.use((err, req, res, next) => {
//   console.error("[unhandled]", err);
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || "Internal server error",
//   });
// });

// // ─── Start ───────────────────────────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`✅ Backend running on http://localhost:${PORT}`);
//   console.log(`   ML Service → ${process.env.ML_SERVICE_URL || "http://localhost:8000"}`);
//   console.log(`   CORS origin → ${process.env.CLIENT_ORIGIN || "http://localhost:3000"}`);
// });

// module.exports = app; // exported for potential test suites
require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const { initSchema } = require("./db/database");
const predictRouter  = require("./routes/predict");
const authRouter     = require("./routes/auth");
const scansRouter    = require("./routes/scans");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin:  process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.use("/api",       predictRouter);
app.use("/api/auth",  authRouter);
app.use("/api/scans", scansRouter);

app.get("/", (req, res) =>
  res.json({ service: "Ocula DR Backend", status: "ok" })
);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[unhandled]", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

async function start() {
  try {
    await initSchema();
    app.listen(PORT, () => {
      const dbStr = process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@")  // hide password
        : `${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "ocula"}`;
      console.log(`✅ Ocula backend   http://localhost:${PORT}`);
      console.log(`   ML Service  →   ${process.env.ML_SERVICE_URL || "http://localhost:8001"}`);
      console.log(`   PostgreSQL  →   ${dbStr}`);
    });
  } catch (err) {
    console.error("❌ Startup failed — cannot connect to PostgreSQL:", err.message);
    console.error("   Fix DATABASE_URL or DB_* variables in backend/.env and try again.");
    process.exit(1);
  }
}

start();
module.exports = app;