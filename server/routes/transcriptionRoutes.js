require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const { transcribeAudioFile } = require("../services/aiService");

const router = express.Router();

// =========================
// POST /transcribe
// =========================

router.post("/transcribe", async (req, res) => {
  try {
    const { filename } = req.body;

    // =========================
    // Validate filename
    // =========================

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Audio filename is required",
      });
    }

    // =========================
    // Audio path
    // =========================

    const audioPath = path.join(
      __dirname,
      "..",
      "uploads",
      filename
    );

    console.log("");
    console.log("=================================");
    console.log("🎙️ TRANSCRIPTION REQUEST");
    console.log("=================================");
    console.log("📁 Filename:", filename);
    console.log("📍 Audio path:", audioPath);

    // =========================
    // Check audio file
    // =========================

    if (!fs.existsSync(audioPath)) {
      console.error("❌ Audio file not found");

      return res.status(404).json({
        success: false,
        message: "Audio file not found on server",
      });
    }

    // =========================
    // Perform Real / Fallback Transcription
    // =========================

    const result = await transcribeAudioFile(audioPath);

    console.log("✅ Transcription completed:", result);

    return res.json({
      success: true,
      text: result.text,
      filename,
      mock: result.mock,
      provider: result.provider,
    });

  } catch (error) {
    console.error("❌ TRANSCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Speech-to-text failed",
    });
  }
});

module.exports = router;