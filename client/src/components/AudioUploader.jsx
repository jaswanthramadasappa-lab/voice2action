import { useState } from "react";

import {
  uploadAudio,
  transcribeAudio,
} from "../services/audioService";

function AudioUploader({ setTranscript }) {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // Upload Audio
  // =========================

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setFilename("");
    setMessage("");

    // Clear previous transcript
    if (setTranscript) {
      setTranscript("");
    }

    setUploading(true);

    try {
      console.log("📤 Uploading:", selectedFile.name);

      const result = await uploadAudio(
        selectedFile,
        selectedFile.name
      );

      console.log("✅ Upload result:", result);

      setMessage(
        `✅ ${result.message || "Audio uploaded successfully."}`
      );

      // Save filename returned by backend
      if (result.filename) {
        setFilename(result.filename);
      } else if (result.file?.filename) {
        setFilename(result.file.filename);
      }

    } catch (error) {
      console.error("❌ Audio upload failed:", error);

      setMessage(
        `❌ ${error.message || "Audio upload failed"}`
      );
    } finally {
      setUploading(false);

      // Allow selecting the same file again
      event.target.value = "";
    }
  };


  // =========================
  // Transcribe Audio
  // =========================

  const handleTranscribe = async () => {
    if (!filename) {
      setMessage("❌ Audio filename is missing.");
      return;
    }

    setTranscribing(true);
    setMessage("🤖 Transcribing audio...");

    try {
      console.log("🎙️ Transcribing:", filename);

      const result = await transcribeAudio(filename);

      console.log("✅ Transcription result:", result);

      if (!result.text) {
        throw new Error("No transcript was returned.");
      }

      // Send transcript to Dashboard
      if (setTranscript) {
        setTranscript(result.text);
      }

      if (result.mock) {
        setMessage(
          "⚠️ AI Speech-to-Text API quota exhausted (OpenAI credits: 0). Fallback text loaded. Add a free Groq or Gemini API key to server/.env for real audio file transcription, or use 'Start Real-Time Recording' with your mic."
        );
      } else {
        setMessage(`✅ Audio transcribed successfully via ${result.provider || "AI"}!`);
      }

    } catch (error) {
      console.error("❌ Transcription failed:", error);

      setMessage(
        `❌ ${error.message || "Transcription failed"}`
      );
    } finally {
      setTranscribing(false);
    }
  };


  return (
    <div className="upload-card">

      {/* =========================
          Icon
      ========================= */}

      <div className="upload-icon">
        📁
      </div>


      {/* =========================
          Title
      ========================= */}

      <h3>
        Upload an Audio File
      </h3>


      <p>
        Upload an existing voice note and let AI turn
        it into actionable information.
      </p>


      {/* =========================
          File Picker
      ========================= */}

      <label
        className="upload-button"
        style={{
          opacity: uploading ? 0.65 : 1,
        }}
      >
        {uploading
          ? "⏳ Uploading..."
          : "📁 Choose Audio File"}

        <input
          type="file"
          accept=".mp3,.wav,.m4a,.webm,audio/*"
          onChange={handleFileChange}
          hidden
          disabled={uploading}
        />
      </label>


      {/* =========================
          Selected File
      ========================= */}

      {file && (
        <div className="selected-file">

          <span>
            🎵
          </span>

          <div>

            <strong>
              {file.name}
            </strong>

            <small>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </small>

          </div>

        </div>
      )}


      {/* =========================
          Upload / Transcription Message
      ========================= */}

      {message && (
        <p className="upload-message">
          {message}
        </p>
      )}


      {/* =========================
          Transcribe Button
      ========================= */}

      {filename && (
        <button
          type="button"
          className="transcribe-button"
          onClick={handleTranscribe}
          disabled={transcribing || uploading}
        >
          {transcribing
            ? "🤖 Transcribing..."
            : "🤖 Transcribe Audio"}
        </button>
      )}


      {/* =========================
          Supported Formats
      ========================= */}

      <small className="supported">
        Supported audio formats:
        MP3, WAV, M4A, WebM
      </small>

    </div>
  );
}

export default AudioUploader;