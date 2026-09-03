const express = require("express");
const Note = require("../models/Note");

const router = express.Router();

// =========================
// Save Note
// =========================

router.post("/save", async (req, res) => {
  try {
    const { transcript, result } = req.body;

    if (!transcript || !result) {
      return res.status(400).json({
        success: false,
        message: "Transcript and AI result are required.",
      });
    }

    const note = await Note.create({
      transcript,
      result,
    });

    res.status(201).json({
      success: true,
      message: "Note saved successfully.",
      note,
    });
  } catch (error) {
    console.error("❌ SAVE NOTE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save note.",
    });
  }
});

// =========================
// Get Notes
// =========================

router.get("/", async (req, res) => {
  try {
    const notes = await Note.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("❌ GET NOTES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notes.",
    });
  }
});

// =========================
// Delete Note
// =========================

router.delete("/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("❌ DELETE NOTE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete note.",
    });
  }
});

module.exports = router;