/**
 * routes/scans.js
 * ───────────────
 * GET  /api/scans         — list scans (metadata only, no base64)
 * GET  /api/scans/:id     — full single scan including base64 fields
 * POST /api/scans         — manually save a scan (used as fallback)
 */

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { query } = require("../db/database");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

/* ── POST /api/scans ─────────────────────────────────────────────── */
router.post("/", requireAuth, async (req, res) => {
  const { user } = req;
  const data = req.body;

  if (!data?.binary_prediction)
    return res.status(400).json({ success: false, error: "No scan data provided." });

  const patientResult = await query("SELECT name FROM users WHERE id = $1", [user.id]);
  const patientName   = patientResult.rows[0]?.name || user.name;
  const id            = uuidv4();

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
      id, user.id, patientName,
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

  return res.status(201).json({ success: true, scan_id: id });
});

/* ── GET /api/scans ──────────────────────────────────────────────── */
router.get("/", requireAuth, async (req, res) => {
  const { user } = req;

  let result;
  if (user.role === "clinician") {
    result = await query(`
      SELECT s.id, s.patient_id, s.patient_name,
             s.binary_prediction, s.dr_confidence,
             s.multiclass_prediction, s.stage_guess,
             s.processing_time_ms, s.created_at
      FROM scans s
      ORDER BY s.created_at DESC
      LIMIT 200
    `);
  } else {
    result = await query(`
      SELECT id, patient_id, patient_name,
             binary_prediction, dr_confidence,
             multiclass_prediction, stage_guess,
             processing_time_ms, created_at
      FROM scans
      WHERE patient_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [user.id]);
  }

  return res.json({ success: true, scans: result.rows });
});

/* ── GET /api/scans/:id ──────────────────────────────────────────── */
router.get("/:id", requireAuth, async (req, res) => {
  const { user } = req;

  const result = await query("SELECT * FROM scans WHERE id = $1", [req.params.id]);
  const scan   = result.rows[0];

  if (!scan)
    return res.status(404).json({ success: false, error: "Scan not found." });

  if (user.role === "patient" && scan.patient_id !== user.id)
    return res.status(403).json({ success: false, error: "Access denied." });

  return res.json({ success: true, scan });
});

module.exports = router;