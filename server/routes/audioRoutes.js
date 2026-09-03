const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =========================
// Upload Audio
// =========================

router.post("/upload", upload.single("audio"), (req, res) => {
  try {
    console.log("");
    console.log("=================================");
    console.log("📥 UPLOAD REQUEST RECEIVED");
    console.log("=================================");

    // Check whether file was received
    if (!req.file) {
      console.log("❌ No audio file received");

      return res.status(400).json({
        success: false,
        message: "No audio file received",
      });
    }

    // Log file information
    console.log("📄 Original:", req.file.originalname);
    console.log("💾 Saved:", req.file.filename);
    console.log("📍 Path:", req.file.path);
    console.log("📦 Size:", req.file.size, "bytes");
    console.log("🎵 MIME:", req.file.mimetype);

    // =========================
    // Success Response
    // =========================

    res.status(200).json({
      success: true,

      message: "Audio uploaded successfully.",

      // Direct filename
      // Used by AudioUploader.jsx
      filename: req.file.filename,

      // Complete file information
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });

    console.log("✅ Upload completed");
    console.log("=================================");
    console.log("");

  } catch (error) {
    console.error("");
    console.error("❌ UPLOAD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Audio upload failed",
    });
  }
});

module.exports = router;