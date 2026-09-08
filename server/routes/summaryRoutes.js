require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

// =========================
// AI Configuration
// =========================

const USE_MOCK_AI =
  String(process.env.USE_MOCK_AI).toLowerCase() === "true";

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log("✅ OpenAI API enabled for Summary routes");
} else {
  console.log("🧪 OpenAI API key not found in Summary routes");
  console.log("🧪 Mock AI / Heuristic summary mode will be used");
}

// =========================
// Heuristic / Mock Generator
// =========================

function generateHeuristicResult(transcript) {
  const text = transcript.trim();

  // Convert transcript into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  // Summary
  let summary = text;
  if (summary.length > 250) {
    summary = summary.substring(0, 250) + "...";
  }

  // Key Points
  const keyPoints =
    sentences.length > 0
      ? sentences.slice(0, 5)
      : ["No key points detected."];

  // Action Items
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

  // Fallback Action Items
  if (actionItems.length === 0) {
    actionItems.push({
      task: "Review the discussed tasks",
      priority: "Medium",
    });
  }

  // Decisions
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
    decisions.push("No specific decisions were detected.");
  }

  return {
    summary,
    keyPoints,
    actionItems,
    decisions,
  };
}

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

    const text = transcript.trim();

    // =========================
    // Mock AI / Heuristic Mode
    // =========================

    if (USE_MOCK_AI || !openai) {
      console.log("🧪 Using Mock / Heuristic AI Summary Generator...");
      const mockResult = generateHeuristicResult(text);

      console.log("✅ Summary generated (Mock mode)");
      return res.json({
        success: true,
        ...mockResult,
        mock: true,
      });
    }

    // =========================
    // Real OpenAI GPT-4o-mini Mode
    // =========================

    console.log("🤖 Sending transcript to OpenAI (gpt-4o-mini)...");

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert AI productivity assistant. Analyze the given speech transcript and extract structured information.\n" +
              "Return a valid JSON object with the following exact keys:\n" +
              "- summary (string): A concise, well-written executive summary (2-3 sentences).\n" +
              "- keyPoints (array of strings): 2 to 5 distinct highlights and key points.\n" +
              "- actionItems (array of objects): Each with 'task' (string description) and 'priority' ('High', 'Medium', or 'Low').\n" +
              "- decisions (array of strings): Key decisions or agreed-upon points made in the discussion.\n" +
              "Ensure all fields are populated with helpful and accurate insights from the transcript.",
          },
          {
            role: "user",
            content: `Transcript:\n"""\n${text}\n"""`,
          },
        ],
        temperature: 0.3,
      });

      const rawContent = response.choices[0]?.message?.content;
      console.log("📥 Raw OpenAI response:", rawContent);

      const parsed = JSON.parse(rawContent || "{}");

      const result = {
        success: true,
        summary: parsed.summary || text.substring(0, 250),
        keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
          ? parsed.keyPoints
          : ["No key points detected."],
        actionItems: Array.isArray(parsed.actionItems) && parsed.actionItems.length > 0
          ? parsed.actionItems
          : [{ task: "Review the discussion", priority: "Medium" }],
        decisions: Array.isArray(parsed.decisions) && parsed.decisions.length > 0
          ? parsed.decisions
          : ["No specific decisions detected."],
        mock: false,
      };

      console.log("✅ AI Summary generated successfully via GPT-4o-mini");
      return res.json(result);

    } catch (apiError) {
      console.error("⚠️ OpenAI GPT-4o-mini API call failed:", apiError.message);

      // Gracefully fall back to heuristic generator if API fails
      console.log("🔄 Falling back to heuristic summary generator...");
      const fallbackResult = generateHeuristicResult(text);

      return res.json({
        success: true,
        ...fallbackResult,
        mock: true,
        fallbackReason: apiError.message,
      });
    }

  } catch (error) {
    console.error("❌ SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate summary",
    });
  }
});

module.exports = router;