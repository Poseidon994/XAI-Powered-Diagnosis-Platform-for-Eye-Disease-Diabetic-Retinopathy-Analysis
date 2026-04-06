const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const { upload, handleMulterError } = require("../middleware/upload");

const router = express.Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/predict
 * Accepts: multipart/form-data with field "file" (JPEG/PNG fundus image)
 * Returns: full ML service prediction JSON
 *
 * Response shape (from ML service):
 * {
 *   binary: { label, confidence },
 *   multiclass: { label, probabilities },
 *   gradcam_base64: "...",
 *   report: { patient_summary, clinical_notes }
 * }
 */
router.post(
  "/predict",
  upload.single("file"),
  handleMulterError,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided. Send a JPEG or PNG as field 'file'.",
      });
    }

    // Build a FormData payload to forward to FastAPI
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120_000, // 2 min — inference + report generation can be slow
      });
    } catch (err) {
      // ML service is down or returned an error
      const status = err.response?.status || 502;
      const detail = err.response?.data?.detail || err.message;

      console.error("[predict] ML service error:", detail);
      return res.status(status).json({
        success: false,
        error: `ML service error: ${detail}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: mlResponse.data,
    });
  }
);

/**
 * GET /api/predict/health
 * Pings the ML service health endpoint and reports combined status.
 */
router.get("/predict/health", async (req, res) => {
  try {
    const { data } = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5_000,
    });
    return res.status(200).json({
      backend: "ok",
      ml_service: data,
    });
  } catch (err) {
    return res.status(502).json({
      backend: "ok",
      ml_service: "unreachable",
      error: err.message,
    });
  }
});

module.exports = router;