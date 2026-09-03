const express = require("express");

const router = express.Router();

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

    const text = transcript.trim();

    // Convert transcript into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    // -------------------------
    // Generate Summary
    // -------------------------

    let summary = text;

    if (summary.length > 250) {
      summary = summary.substring(0, 250) + "...";
    }

    // -------------------------
    // Key Points
    // -------------------------

    const keyPoints =
      sentences.length > 0
        ? sentences.slice(0, 5)
        : ["No key points detected."];

    // -------------------------
    // Action Items
    // -------------------------

    const actionItems = [];

    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("finish") ||
      lowerText.includes("complete")
    ) {
      actionItems.push({
        task: "Complete the project",
        priority: "High",
      });
    }

    if (
      lowerText.includes("report") ||
      lowerText.includes("prepare")
    ) {
      actionItems.push({
        task: "Prepare the project report",
        priority: "High",
      });
    }

    if (
      lowerText.includes("send") ||
      lowerText.includes("share")
    ) {
      actionItems.push({
        task: "Send the completed work to the team",
        priority: "Medium",
      });
    }

    if (
      lowerText.includes("tomorrow") ||
      lowerText.includes("today")
    ) {
      actionItems.push({
        task: "Complete the planned work within the mentioned deadline",
        priority: "High",
      });
    }

    // Fallback
    if (actionItems.length === 0) {
      actionItems.push({
        task: "Review the discussed tasks",
        priority: "Medium",
      });
    }

    // -------------------------
    // Decisions
    // -------------------------

    const decisions = [];

    if (
      lowerText.includes("need to") ||
      lowerText.includes("plan to") ||
      lowerText.includes("decided")
    ) {
      decisions.push(
        "The discussed tasks should be completed and tracked."
      );
    }

    if (decisions.length === 0) {
      decisions.push(
        "No specific decisions were detected."
      );
    }

    // -------------------------
    // Response
    // -------------------------

    const result = {
      success: true,
      summary,
      keyPoints,
      actionItems,
      decisions,
    };

    console.log("✅ Summary generated");

    res.json(result);

  } catch (error) {
    console.error("❌ SUMMARY ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate summary",
    });
  }
});

module.exports = router;