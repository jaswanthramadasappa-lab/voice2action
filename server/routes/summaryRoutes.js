require("dotenv").config();

const express = require("express");
const { generateStructuredSummary } = require("../services/aiService");

const router = express.Router();

// =========================
// POST /generate
// =========================

router.post("/generate", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required",
      });
    }

    console.log("=================================");
    console.log("🧠 AI SUMMARY REQUEST");
    console.log("=================================");
    console.log("📝 Transcript:", transcript);

    const result = await generateStructuredSummary(transcript);

    console.log("✅ Summary generated successfully (Provider:", result.provider, ")");

    return res.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error("❌ SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate summary",
    });
  }
});

module.exports = router;