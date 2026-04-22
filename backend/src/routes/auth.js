/**
 * routes/auth.js
 * ──────────────
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */

const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { query } = require("../db/database");

const router      = express.Router();
const JWT_SECRET  = process.env.JWT_SECRET  || "ocula_dev_secret_change_in_prod";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function makeToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/* ── POST /api/auth/register ─────────────────────────────────────── */
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ success: false, error: "All fields are required." });

  if (!["clinician", "patient"].includes(role))
    return res.status(400).json({ success: false, error: "Role must be 'clinician' or 'patient'." });

  if (password.length < 6)
    return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });

  const normalEmail = email.toLowerCase().trim();

  // Check duplicate
  const existing = await query("SELECT id FROM users WHERE email = $1", [normalEmail]);
  if (existing.rows.length > 0)
    return res.status(409).json({ success: false, error: "An account with this email already exists." });

  const id            = uuidv4();
  const password_hash = await bcrypt.hash(password, 10);
  const trimmedName   = name.trim();

  await query(
    "INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)",
    [id, trimmedName, normalEmail, password_hash, role]
  );

  const token = makeToken({ id, name: trimmedName, email: normalEmail, role });

  return res.status(201).json({
    success: true,
    token,
    user: { id, name: trimmedName, email: normalEmail, role },
  });
});

/* ── POST /api/auth/login ────────────────────────────────────────── */
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role)
    return res.status(400).json({ success: false, error: "Email, password, and role are required." });

  const normalEmail = email.toLowerCase().trim();
  const result      = await query("SELECT * FROM users WHERE email = $1", [normalEmail]);
  const user        = result.rows[0];

  if (!user)
    return res.status(401).json({ success: false, error: "Invalid email or password." });

  if (user.role !== role)
    return res.status(401).json({
      success: false,
      error: `This account is registered as a ${user.role}, not a ${role}.`,
    });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    return res.status(401).json({ success: false, error: "Invalid email or password." });

  const token = makeToken({ id: user.id, name: user.name, email: user.email, role: user.role });

  return res.status(200).json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

/* ── GET /api/auth/me ────────────────────────────────────────────── */
router.get("/me", (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, error: "No token." });

  try {
    const user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    return res.json({ success: true, user });
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
});

module.exports = router;