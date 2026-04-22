// const express = require("express");
// const axios = require("axios");
// const FormData = require("form-data");
// const { upload, handleMulterError } = require("../middleware/upload");

// const router = express.Router();
// const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// /**
//  * POST /api/predict
//  * Accepts: multipart/form-data with field "file" (JPEG/PNG fundus image)
//  * Returns: full ML service prediction JSON
//  *
//  * Response shape (from ML service):
//  * {
//  *   binary: { label, confidence },
//  *   multiclass: { label, probabilities },
//  *   gradcam_base64: "...",
//  *   report: { patient_summary, clinical_notes }
//  * }
//  */
// router.post(
//   "/predict",
//   upload.single("file"),
//   handleMulterError,
//   async (req, res) => {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: "No image file provided. Send a JPEG or PNG as field 'file'.",
//       });
//     }

//     // Build a FormData payload to forward to FastAPI
//     const form = new FormData();
//     form.append("file", req.file.buffer, {
//       filename: req.file.originalname,
//       contentType: req.file.mimetype,
//     });

//     let mlResponse;
//     try {
//       mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
//         headers: form.getHeaders(),
//         maxContentLength: Infinity,
//         maxBodyLength: Infinity,
//         timeout: 120_000, // 2 min — inference + report generation can be slow
//       });
//     } catch (err) {
//       // ML service is down or returned an error
//       const status = err.response?.status || 502;
//       const detail = err.response?.data?.detail || err.message;

//       console.error("[predict] ML service error:", detail);
//       return res.status(status).json({
//         success: false,
//         error: `ML service error: ${detail}`,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: mlResponse.data,
//     });
//   }
// );

// /**
//  * GET /api/predict/health
//  * Pings the ML service health endpoint and reports combined status.
//  */
// router.get("/predict/health", async (req, res) => {
//   try {
//     const { data } = await axios.get(`${ML_SERVICE_URL}/health`, {
//       timeout: 5_000,
//     });
//     return res.status(200).json({
//       backend: "ok",
//       ml_service: data,
//     });
//   } catch (err) {
//     return res.status(502).json({
//       backend: "ok",
//       ml_service: "unreachable",
//       error: err.message,
//     });
//   }
// });

// module.exports = router;
/**
 * routes/predict.js
 * ─────────────────
 * POST /api/predict        — proxy image to ML service, auto-save to DB if authed
 * GET  /api/predict/health — combined health check
 */

const express  = require("express");
const axios    = require("axios");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
const { upload, handleMulterError } = require("../middleware/upload");
const { softAuth } = require("../middleware/authMiddleware");
const { query } = require("../db/database");

const router         = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

/* ── POST /api/predict ───────────────────────────────────────────── */
router.post(
  "/predict",
  softAuth,
  upload.single("file"),
  handleMulterError,
  async (req, res) => {
    if (!req.file)
      return res.status(400).json({ success: false, error: "No image file provided." });

    // Forward to ML service
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype,
    });

    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
        headers:          form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength:    Infinity,
        timeout:          180_000,
      });
    } catch (err) {
      const status = err.response?.status || 502;
      const detail = err.response?.data?.detail || err.message;
      console.error("[predict] ML service error:", detail);
      return res.status(status).json({ success: false, error: `ML service error: ${detail}` });
    }

    const data = mlResponse.data;

    // Auto-save to PostgreSQL if user is authenticated
    if (req.user) {
      try {
        const patientResult = await query("SELECT name FROM users WHERE id = $1", [req.user.id]);
        const patientName   = patientResult.rows[0]?.name || req.user.name;

        await query(
          `INSERT INTO scans (
            id, patient_id, patient_name,
            binary_label, binary_prediction, dr_confidence,
            multiclass_label, multiclass_prediction, stage_guess,
            gradcam_base64, lime_base64, shap_base64,
            ai_explanation_clinical, ai_explanation_patient,
            processing_time_ms
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [
            uuidv4(), req.user.id, patientName,
            data.binary_label, data.binary_prediction, data.dr_confidence,
            data.multiclass_label, data.multiclass_prediction, data.stage_guess,
            data.gradcam_base64         || null,
            data.lime_base64            || null,
            data.shap_base64            || null,
            data.ai_explanation         || null,
            data.ai_explanation_patient || null,
            data.processing_time_ms,
          ]
        );
      } catch (dbErr) {
        // Non-fatal — log and continue
        console.warn("[predict] DB save failed:", dbErr.message);
      }
    }

    return res.status(200).json({ success: true, data });
  }
);

/* ── GET /api/predict/health ─────────────────────────────────────── */
router.get("/predict/health", async (req, res) => {
  try {
    const { data } = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5_000 });
    return res.status(200).json({ backend: "ok", ml_service: data });
  } catch (err) {
    return res.status(502).json({ backend: "ok", ml_service: "unreachable", error: err.message });
  }
});

module.exports = router;