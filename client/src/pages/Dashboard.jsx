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
  const [copied, setCopied] = useState(false);

  // Used to refresh Recent Notes after saving
  const [notesRefresh, setNotesRefresh] = useState(0);

  // =========================
  // Generate AI Summary
  // =========================

  const handleAnalyze = async (overrideText) => {
    const textToAnalyze = (typeof overrideText === "string" ? overrideText : transcript).trim();

    if (!textToAnalyze) {
      alert("Please record or upload an audio note first.");
      return;
    }

    try {
      setAnalyzing(true);
      setAiResult(null);

      console.log("🧠 Sending transcript for AI analysis:", textToAnalyze);

      const result = await generateSummary(textToAnalyze);

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
  // Real-time Auto-Analyze
  // =========================

  const handleAutoAnalyze = async (capturedText) => {
    if (!capturedText || !capturedText.trim()) return;
    setTranscript(capturedText);
    await handleAnalyze(capturedText);
  };

  // =========================
  // Refresh Recent Notes
  // =========================

  const handleNoteSaved = () => {
    setNotesRefresh((previous) => previous + 1);
  };

  // =========================
  // Copy Transcript
  // =========================

  const handleCopyTranscript = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const chars = transcript.length;
  const estimatedReadTime = Math.max(1, Math.ceil(words / 130)); // 130 words per minute average speech

  return (
    <div className="main-content">
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="hero">
        <div>
          <div className="hero-badge-row">
            <span className="hero-badge">
              ✨ Real-Time Voice Intelligence
            </span>
            <span className="hero-status-pill">
              <span className="pulse-dot"></span> Live Ready
            </span>
          </div>

          <h1>
            Turn your <span>voice</span> into action in real time.
          </h1>

          <p>
            Speak freely into your microphone. Watch your words stream live
            on-screen, and let Voice2Action instantly distill executive summaries,
            key decisions, and prioritized tasks.
          </p>
        </div>
      </section>

      {/* Audio Input Section */}
      <section className="audio-section">
        {/* Real-Time Voice Recorder */}
        <AudioRecorder
          setTranscript={setTranscript}
          onAutoAnalyze={handleAutoAnalyze}
        />

        {/* File Uploader */}
        <AudioUploader
          setTranscript={setTranscript}
        />
      </section>

      {/* Transcript Workspace Section */}
      {transcript && (
        <section className="transcript-section">
          <div className="transcript-header">
            <div>
              <span>📝</span>
              <h2>Live Transcript</h2>
            </div>

            <div className="transcript-metrics">
              <span className="metric-tag">{words} {words === 1 ? "word" : "words"}</span>
              <span className="metric-tag">{chars} chars</span>
              <span className="metric-tag">~{estimatedReadTime} min read</span>
            </div>
          </div>

          {/* Editable Transcript Textarea */}
          <div className="transcript-edit-wrapper">
            <textarea
              className="transcript-textarea"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your live transcript appears here. You can also edit it directly..."
              rows={4}
            />
          </div>

          {/* Action Row */}
          <div className="transcript-actions-bar">
            <div className="transcript-utility-btns">
              <button
                type="button"
                className="utility-btn"
                onClick={handleCopyTranscript}
                title="Copy transcript to clipboard"
              >
                {copied ? "✅ Copied!" : "📋 Copy Transcript"}
              </button>
              <button
                type="button"
                className="utility-btn btn-secondary"
                onClick={() => setTranscript("")}
                title="Clear transcript"
              >
                🧹 Clear
              </button>
            </div>

            <button
              type="button"
              className="analyze-button realtime-analyze-btn"
              onClick={() => handleAnalyze()}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <span className="loading-spinner-sm"></span>
                  <span>🧠 Analyzing in Real Time...</span>
                </>
              ) : (
                "🤖 Generate Summary & Action Items"
              )}
            </button>
          </div>
        </section>
      )}

      {/* AI Intelligence Results */}
      <AIResults
        result={aiResult}
        transcript={transcript}
        onNoteSaved={handleNoteSaved}
      />

      {/* Recent Notes Library */}
      <RecentNotes
        refresh={notesRefresh}
      />
    </div>
  );
}

export default Dashboard;