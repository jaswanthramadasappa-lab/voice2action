require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const router = express.Router();

const USE_MOCK_AI =
  String(process.env.USE_MOCK_AI).toLowerCase() === "true";

let openai = null;

if (!USE_MOCK_AI) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// =========================
// POST /transcribe
// =========================

router.post("/transcribe", async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Audio filename is required",
      });
    }

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

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({
        success: false,
        message: "Audio file not found on server",
      });
    }

    // =========================
    // MOCK AI MODE
    // =========================

    if (USE_MOCK_AI) {
      console.log("🧪 MOCK AI MODE ENABLED");
      console.log("⏳ Generating mock transcript...");

      const mockTranscript =
        "This is a sample transcript generated for testing. " +
        "The user wants to complete the project, " +
        "prepare the report, and share the completed work with the team.";

      return res.json({
        success: true,
        text: mockTranscript,
        filename,
        mock: true,
      });
    }

    // =========================
    // REAL OPENAI MODE
    // =========================

    console.log("🤖 Sending audio to OpenAI...");

    const transcription =
      await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "gpt-4o-mini-transcribe",
      });

    console.log("✅ Transcription completed");

    return res.json({
      success: true,
      text: transcription.text,
      filename,
      mock: false,
    });

  } catch (error) {
    console.error("❌ TRANSCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Speech-to-text failed",
    });
  }
});

module.exports = router;