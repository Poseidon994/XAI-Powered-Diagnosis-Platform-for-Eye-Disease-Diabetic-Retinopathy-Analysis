const multer = require("multer");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage(); // keep file in memory as Buffer

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Only JPEG/PNG images are accepted. Received: ${file.mimetype}`
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Multer error → clean JSON response
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: `File too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
      LIMIT_UNEXPECTED_FILE: err.field || "Unexpected file field.",
    };
    return res.status(400).json({
      success: false,
      error: messages[err.code] || err.message,
    });
  }
  next(err);
};

module.exports = { upload, handleMulterError };