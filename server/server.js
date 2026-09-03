require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const audioRoutes = require("./routes/audioRoutes");
const transcriptionRoutes = require("./routes/transcriptionRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const notesRoutes = require("./routes/notesRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ========================================
// Middleware
// ========================================

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// ========================================
// MongoDB Connection
// ========================================

const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing in .env");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );
  }
};

connectMongoDB();

// ========================================
// Health Check
// ========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "Voice2Action AI backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "Voice2Action AI backend",
    mongodb:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// ========================================
// API ROUTES
// ========================================

// ----------------------------------------
// Audio Upload
// ----------------------------------------

console.log("📁 Loading audio routes...");

app.use(
  "/api/audio",
  audioRoutes
);

console.log("✅ Audio routes loaded");

// ----------------------------------------
// Transcription
// ----------------------------------------

console.log("📁 Loading transcription routes...");

app.use(
  "/api/transcription",
  transcriptionRoutes
);

console.log("✅ Transcription routes loaded");

// ----------------------------------------
// AI Summary
// ----------------------------------------

console.log("📁 Loading summary routes...");

app.use(
  "/api/summary",
  summaryRoutes
);

console.log("✅ Summary routes loaded");

// ----------------------------------------
// Notes
// ----------------------------------------

console.log("📁 Loading notes routes...");

app.use(
  "/api/notes",
  notesRoutes
);

console.log("✅ Notes routes loaded");

// ========================================
// 404 Handler
// ========================================

app.use((req, res) => {
  console.log("❌ Route not found:");
  console.log(req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ========================================
// Error Handler
// ========================================

app.use((error, req, res, next) => {
  console.error("❌ SERVER ERROR:", error);

  res.status(500).json({
    success: false,
    message:
      error.message ||
      "Internal server error",
  });
});

// ========================================
// Start Server
// ========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "🎙️ Voice2Action AI Backend"
    );

    console.log(
      "========================================"
    );

    console.log(
      `🚀 Server running on http://localhost:${PORT}`
    );

    console.log(
      "❤️ Health check: http://localhost:5000/api/health"
    );

    console.log(
      "🎵 Upload API: POST /api/audio/upload"
    );

    console.log(
      "🤖 Transcription API: POST /api/transcription/transcribe"
    );

    console.log(
      "🧠 AI Summary API: POST /api/summary/generate"
    );

    console.log(
      "💾 Notes API: /api/notes"
    );

    console.log(
      "========================================"
    );

    console.log("");
  }
);