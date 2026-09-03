import { useRef, useState } from "react";

import {
  uploadAudio,
  transcribeAudio,
} from "../services/audioService";

function AudioRecorder({ setTranscript }) {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const [audioURL, setAudioURL] = useState("");
  const [filename, setFilename] = useState("");
  const [message, setMessage] = useState("");

  // =========================
  // Start Recording
  // =========================

  const startRecording = async () => {
    try {
      setMessage("");
      setAudioURL("");
      setFilename("");

      if (setTranscript) {
        setTranscript("");
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Receive recorded audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // When recording stops
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        );

        // Create browser preview
        const url = URL.createObjectURL(audioBlob);

        setAudioURL(url);

        console.log("🎵 Recording created");
        console.log("📦 Recording size:", audioBlob.size);

        // Stop microphone
        stream
          .getTracks()
          .forEach((track) => track.stop());

        // Upload automatically
        await uploadRecording(audioBlob);
      };

      mediaRecorder.start();

      setRecording(true);
      setMessage("🔴 Recording...");

      console.log("🎙️ Recording started");

    } catch (error) {
      console.error(
        "❌ Microphone error:",
        error
      );

      setMessage(
        "❌ Microphone access denied. Please allow microphone permission."
      );
    }
  };

  // =========================
  // Stop Recording
  // =========================

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
    setMessage("⏳ Processing recording...");

    console.log("🛑 Recording stopped");
  };

  // =========================
  // Upload Recording
  // =========================

  const uploadRecording = async (audioBlob) => {
    try {
      setUploading(true);

      setMessage(
        "📤 Uploading recording..."
      );

      const result = await uploadAudio(
        audioBlob,
        "recording.webm"
      );

      console.log(
        "✅ Upload result:",
        result
      );

      const uploadedFilename =
        result.filename ||
        result.file?.filename;

      if (!uploadedFilename) {
        throw new Error(
          "Filename was not returned by server."
        );
      }

      setFilename(uploadedFilename);

      console.log(
        "📁 Uploaded filename:",
        uploadedFilename
      );

      setMessage(
        "✅ Recording uploaded. Starting transcription..."
      );

      // Automatically transcribe
      await transcribeRecording(
        uploadedFilename
      );

    } catch (error) {
      console.error(
        "❌ Recording upload failed:",
        error
      );

      setMessage(
        `❌ ${
          error.message ||
          "Recording upload failed"
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // Transcribe Recording
  // =========================

  const transcribeRecording = async (
    uploadedFilename
  ) => {
    try {
      setTranscribing(true);

      setMessage(
        "🤖 Transcribing recording..."
      );

      console.log(
        "🎙️ Sending for transcription:",
        uploadedFilename
      );

      const result =
        await transcribeAudio(
          uploadedFilename
        );

      console.log(
        "✅ Transcription result:",
        result
      );

      if (!result.success) {
        throw new Error(
          result.message ||
          "Transcription failed"
        );
      }

      if (!result.text) {
        throw new Error(
          "No transcript was returned."
        );
      }

      // Send transcript to Dashboard
      if (setTranscript) {
        setTranscript(result.text);
      }

      setMessage(
        "✅ Transcription completed. Generate AI analysis below."
      );

    } catch (error) {
      console.error(
        "❌ Transcription failed:",
        error
      );

      setMessage(
        `❌ ${
          error.message ||
          "Transcription failed"
        }`
      );
    } finally {
      setTranscribing(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="record-card">

      {/* Icon */}

      <div className="record-icon">
        🎙️
      </div>

      {/* Title */}

      <h3>
        Record Audio
      </h3>

      <p>
        Record your voice and let AI turn
        your thoughts into actionable
        information.
      </p>

      {/* Record Button */}

      {!recording ? (
        <button
          type="button"
          className="record-button"
          onClick={startRecording}
          disabled={
            uploading ||
            transcribing
          }
        >
          🎙️ Start Recording
        </button>
      ) : (
        <button
          type="button"
          className="record-button stop-recording"
          onClick={stopRecording}
        >
          ⏹️ Stop Recording
        </button>
      )}

      {/* Audio Preview */}

      {audioURL && (
        <div className="record-preview">

          <p>
            🎵 Recorded Audio
          </p>

          <audio
            controls
            src={audioURL}
            className="audio-player"
          />

          <small>
            ▶️ Click play to listen to your recording
          </small>

        </div>
      )}

      {/* Status Message */}

      {message && (
        <p className="upload-message">
          {message}
        </p>
      )}

      {/* Processing Status */}

      {(uploading || transcribing) && (
        <div className="record-status">

          {uploading
            ? "📤 Uploading recording..."
            : "🤖 Transcribing recording..."}

        </div>
      )}

      {/* Uploaded filename */}

      {filename && !transcribing && (
        <small className="uploaded-file">
          ✅ Audio processed successfully
        </small>
      )}

      {/* Supported Format */}

      <small className="supported">
        Recording format: WebM
      </small>

    </div>
  );
}

export default AudioRecorder;