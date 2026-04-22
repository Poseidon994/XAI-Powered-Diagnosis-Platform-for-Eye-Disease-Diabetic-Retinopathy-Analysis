

const { Pool } = require("pg");

// ── Connection ────────────────────────────────────────────────────────────────
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        // ssl: { rejectUnauthorized: false }  // uncomment for cloud providers
      }
    : {
        host:     process.env.DB_HOST     || "localhost",
        port:     parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME     || "ocula",
        user:     process.env.DB_USER     || "postgres",
        password: process.env.DB_PASSWORD || "",
      }
);

// ── Schema ────────────────────────────────────────────────────────────────────
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT        PRIMARY KEY,
    name          TEXT        NOT NULL,
    email         TEXT        UNIQUE NOT NULL,
    password_hash TEXT        NOT NULL,
    role          TEXT        NOT NULL CHECK (role IN ('clinician','patient')),
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS scans (
    id                       TEXT        PRIMARY KEY,
    patient_id               TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name             TEXT,
    binary_label             INTEGER,
    binary_prediction        TEXT,
    dr_confidence            REAL,
    multiclass_label         INTEGER,
    multiclass_prediction    TEXT,
    stage_guess              INTEGER,
    gradcam_base64           TEXT,
    lime_base64              TEXT,
    shap_base64              TEXT,
    ai_explanation_clinical  TEXT,
    ai_explanation_patient   TEXT,
    processing_time_ms       INTEGER,
    created_at               TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_scans_patient    ON scans(patient_id);
  CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
`;

/**
 * Initialise schema. Called once at server startup.
 * Resolves quietly on success, rejects with the pg error on failure.
 */
async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(SCHEMA_SQL);
    console.log("✅ PostgreSQL schema ready");
  } finally {
    client.release();
  }
}

/**
 * Convenience wrapper — runs a parameterised query and returns rows.
 * @param {string} text   SQL with $1, $2 … placeholders
 * @param {any[]}  params Parameter array
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query, initSchema };