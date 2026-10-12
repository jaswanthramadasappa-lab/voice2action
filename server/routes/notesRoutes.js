const express = require("express");
const mongoose = require("mongoose");
const Note = require("../models/Note");

const router = express.Router();

async function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
    console.log("🔄 Reconnecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Reconnected to MongoDB");
  }
}

// =========================
// Save Note
// =========================

router.post("/save", async (req, res) => {
  try {
    await ensureDbConnected();

    let { transcript, result } = req.body;

    if (!transcript || !result) {
      return res.status(400).json({
        success: false,
        message: "Transcript and AI result are required.",
      });
    }

    // Clone and sanitize result structure
    const sanitizedResult = typeof result === "object" ? { ...result } : { summary: String(result) };

    // Normalize actionItems so it is always a valid array of objects
    if (Array.isArray(sanitizedResult.actionItems)) {
      sanitizedResult.actionItems = sanitizedResult.actionItems.map((item) => {
        if (typeof item === "string") {
          return { task: item, priority: "Medium" };
        }
        if (item && typeof item === "object") {
          return {
            task: String(item.task || item.description || item.text || "Action item"),
            priority: String(item.priority || "Medium"),
          };
        }
        return { task: String(item), priority: "Medium" };
      });
    } else {
      sanitizedResult.actionItems = [];
    }

    // Normalize keyPoints
    if (Array.isArray(sanitizedResult.keyPoints)) {
      sanitizedResult.keyPoints = sanitizedResult.keyPoints.map((k) =>
        typeof k === "string" ? k : String(k?.point || k?.text || JSON.stringify(k))
      );
    } else {
      sanitizedResult.keyPoints = [];
    }

    // Normalize decisions
    if (Array.isArray(sanitizedResult.decisions)) {
      sanitizedResult.decisions = sanitizedResult.decisions.map((d) =>
        typeof d === "string" ? d : String(d?.decision || d?.text || JSON.stringify(d))
      );
    } else {
      sanitizedResult.decisions = [];
    }

    const note = await Note.create({
      transcript: typeof transcript === "string" ? transcript : JSON.stringify(transcript),
      result: sanitizedResult,
    });

    console.log("✅ Note saved successfully:", note._id);

    res.status(201).json({
      success: true,
      message: "Note saved successfully.",
      note,
    });
  } catch (error) {
    console.error("❌ SAVE NOTE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to save note.",
    });
  }
});

// =========================
// Get Notes
// =========================

router.get("/", async (req, res) => {
  try {
    await ensureDbConnected();

    const notes = await Note.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("❌ GET NOTES ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notes.",
    });
  }
});

// =========================
// Delete Note
// =========================

router.delete("/:id", async (req, res) => {
  try {
    await ensureDbConnected();

    await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("❌ DELETE NOTE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete note.",
    });
  }
});

module.exports = router;