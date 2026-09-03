import { useState } from "react";

import Header from "../components/Header";
import AudioRecorder from "../components/AudioRecorder";
import AudioUploader from "../components/AudioUploader";
import RecentNotes from "../components/RecentNotes";
import AIResults from "../components/AIResults";

import { generateSummary } from "../services/audioService";

function Dashboard() {
  const [transcript, setTranscript] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Used to refresh Recent Notes after saving
  const [notesRefresh, setNotesRefresh] = useState(0);

  // =========================
  // Generate AI Summary
  // =========================

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      alert("Please transcribe an audio first.");
      return;
    }

    try {
      setAnalyzing(true);
      setAiResult(null);

      console.log("🧠 Sending transcript for AI analysis...");

      const result = await generateSummary(transcript);

      console.log("✅ AI analysis received:", result);

      setAiResult(result);

    } catch (error) {
      console.error("❌ AI analysis failed:", error);

      alert(error.message || "AI analysis failed");

    } finally {
      setAnalyzing(false);
    }
  };

  // =========================
  // Refresh Recent Notes
  // =========================

  const handleNoteSaved = () => {
    setNotesRefresh((previous) => previous + 1);
  };

  return (
    <div className="main-content">

      {/* =========================
          Header
      ========================= */}

      <Header />


      {/* =========================
          Hero
      ========================= */}

      <section className="hero">

        <div>

          <span className="hero-badge">
            ✨ AI-Powered Productivity
          </span>

          <h1>
            Turn your <span>voice</span> into action.
          </h1>

          <p>
            Record or upload a voice note and let AI transform
            your thoughts into summaries, decisions and actionable tasks.
          </p>

        </div>

      </section>


      {/* =========================
          Audio Section
      ========================= */}

      <section className="audio-section">

        {/* Record Audio */}

        <AudioRecorder
          setTranscript={setTranscript}
        />


        {/* Upload Audio */}

        <AudioUploader
          setTranscript={setTranscript}
        />

      </section>


      {/* =========================
          Transcript
      ========================= */}

      {transcript && (

        <section className="transcript-section">

          <div className="transcript-header">

            <div>

              <span>📝</span>

              <h2>
                Transcript
              </h2>

            </div>

          </div>


          {/* Transcript Text */}

          <div className="transcript-box">

            {transcript}

          </div>


          {/* =========================
              Analyze Button
          ========================= */}

          <button
            type="button"
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={analyzing}
          >

            {analyzing
              ? "🧠 Analyzing..."
              : "🤖 Generate Summary & Action Items"}

          </button>

        </section>

      )}


      {/* =========================
          AI Results
      ========================= */}

      <AIResults
  result={aiResult}
  transcript={transcript}
/>


      {/* =========================
          Recent Notes
      ========================= */}

      <RecentNotes
        refresh={notesRefresh}
      />

    </div>
  );
}

export default Dashboard;