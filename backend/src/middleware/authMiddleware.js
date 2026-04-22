const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "ocula_dev_secret_change_in_prod";

/**
 * Hard auth — rejects unauthenticated requests.
 */
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Authentication required." });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
};

/**
 * Soft auth — attaches user if token present, never rejects.
 * Used for /predict so un-authenticated use still works.
 */
const softAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    }
  } catch { /* ignore */ }
  next();
};

module.exports = { requireAuth, softAuth };