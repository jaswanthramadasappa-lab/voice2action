import { useRef, useState, useEffect } from "react";
import {
  uploadAudio,
  transcribeAudio,
} from "../services/audioService";

function AudioRecorder({ setTranscript, onAutoAnalyze }) {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const liveTranscriptRef = useRef("");

  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const [audioURL, setAudioURL] = useState("");
  const [filename, setFilename] = useState("");
  const [message, setMessage] = useState("");

  // Real-time live status
  const [liveText, setLiveText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState(new Array(16).fill(5));
  const [speechSupported, setSpeechSupported] = useState(true);

  // Timer reference
  const timerIntervalRef = useRef(null);

  // Check speech recognition capability on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSupported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
      setSpeechSupported(isSupported);
    }

    return () => {
      // Cleanup on unmount
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  // ============================================
  // Start Real-Time Recording & Live STT
  // ============================================

  const startRecording = async () => {
    try {
      setMessage("");
      setAudioURL("");
      setFilename("");
      setLiveText("");
      setInterimText("");
      setRecordingSeconds(0);
      finalTranscriptRef.current = "";
      liveTranscriptRef.current = "";

      if (setTranscript) {
        setTranscript("");
      }

      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Set up Web Audio API Real-Time Visualizer
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVisualizer = () => {
          if (!isRecordingRef.current) return;

          analyser.getByteFrequencyData(dataArray);

          // Calculate average volume level (0 - 100)
          let sum = 0;
          const bars = [];
          const step = Math.max(1, Math.floor(dataArray.length / 16));

          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * step] || 0;
            sum += val;
            // Map to percentage height between 8% and 95%
            bars.push(Math.max(8, Math.round((val / 255) * 95)));
          }

          const avgVolume = Math.min(100, Math.round((sum / (dataArray.length * 255)) * 150));
          setVolumeLevel(avgVolume);
          setFrequencyData(bars);

          animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        };

        updateVisualizer();
      } catch (audioErr) {
        console.warn("AudioContext visualizer initialization notice:", audioErr);
      }

      // 3. Set up Real-Time Speech Recognition (Streaming)
      if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        try {
          const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";
          recognition.maxAlternatives = 1;

          recognition.onresult = (event) => {
            let interim = "";
            let finalAccumulated = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const res = event.results[i];
              const textChunk = res[0].transcript;
              if (res.isFinal) {
                finalAccumulated += textChunk + " ";
              } else {
                interim += textChunk;
              }
            }

            if (finalAccumulated) {
              finalTranscriptRef.current = (finalTranscriptRef.current + " " + finalAccumulated)
                .replace(/\s+/g, " ")
                .trim();
            }

            const currentFull = (finalTranscriptRef.current + " " + interim)
              .replace(/\s+/g, " ")
              .trim();

            liveTranscriptRef.current = currentFull;
            setLiveText(finalTranscriptRef.current);
            setInterimText(interim);

            if (currentFull && setTranscript) {
              setTranscript(currentFull);
            }
          };

          recognition.onerror = (e) => {
            console.log("Real-time speech recognition note:", e.error);
            if (e.error === "not-allowed") {
              setMessage("❌ Microphone access blocked. Please check browser permissions.");
            }
          };

          recognition.onend = () => {
            // Auto-restart if user is still actively recording (browsers can pause on long silences)
            if (isRecordingRef.current) {
              try {
                recognition.start();
              } catch (restartErr) {
                // Ignore if already active
              }
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (speechErr) {
          console.warn("Speech recognition notice:", speechErr.message);
        }
      }

      // 4. Initialize MediaRecorder for Audio Blob upload
      const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/wav"];
      let selectedMime = "";
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: selectedMime || "audio/webm",
        });

        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        console.log("🎵 Real-time recording completed. Size:", audioBlob.size);

        // Stop microphone tracks
        stream.getTracks().forEach((track) => track.stop());

        // Close AudioContext
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          try {
            audioContextRef.current.close();
          } catch (e) {}
        }

        // Upload and process recording
        const capturedSpeech = liveTranscriptRef.current.trim();
        await handleRecordingUpload(audioBlob, capturedSpeech);
      };

      // Start recording
      mediaRecorder.start(250); // Emit chunks every 250ms for real-time responsiveness
      isRecordingRef.current = true;
      setRecording(true);
      setMessage("🎙️ Real-time listening active. Speak freely!");

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("❌ Microphone error:", error);
      setMessage(
        "❌ Microphone access denied. Please click allow when prompted by your browser."
      );
    }
  };

  // ============================================
  // Stop Real-Time Recording
  // ============================================

  const stopRecording = () => {
    isRecordingRef.current = false;

    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop Speech Recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    // Stop Media Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
    setMessage("⏳ Finalizing audio and syncing intelligence...");
  };

  // ============================================
  // Upload and Transcribe (Non-Destructive)
  // ============================================

  const handleRecordingUpload = async (audioBlob, realSpokenTranscript) => {
    try {
      setUploading(true);
      setMessage("📤 Saving audio to server...");

      const result = await uploadAudio(audioBlob, "recording.webm");
      const uploadedFilename = result.filename || result.file?.filename;

      if (!uploadedFilename) {
        throw new Error("Filename was not returned by server.");
      }

      setFilename(uploadedFilename);
      console.log("📁 Audio file uploaded:", uploadedFilename);

      // Now transcribe / verify
      setUploading(false);
      setTranscribing(true);
      setMessage("🤖 Verifying speech intelligence...");

      // Send the authentic client speech alongside filename
      const transcribeResult = await transcribeAudio(uploadedFilename, realSpokenTranscript);
      console.log("✅ Transcription result:", transcribeResult);

      let finalSelectedTranscript = realSpokenTranscript;

      // Only overwrite if server provided a real, verified, non-mock transcript
      if (!transcribeResult.mock && transcribeResult.text && transcribeResult.text.trim()) {
        finalSelectedTranscript = transcribeResult.text.trim();
        if (setTranscript) {
          setTranscript(finalSelectedTranscript);
        }
      } else if (realSpokenTranscript) {
        // Keep authentic user speech
        if (setTranscript) {
          setTranscript(realSpokenTranscript);
        }
      }

      setMessage("✅ Real-time speech captured successfully!");

      // Auto-analyze trigger if enabled
      if (autoAnalyze && onAutoAnalyze && finalSelectedTranscript) {
        setMessage("⚡ Real-time speech captured! Generating AI actions...");
        await onAutoAnalyze(finalSelectedTranscript);
      }

    } catch (error) {
      console.error("❌ Processing error:", error);

      // If we already have real spoken words, keep them regardless of server status!
      if (realSpokenTranscript && setTranscript) {
        setTranscript(realSpokenTranscript);
        setMessage("✅ Spoken words captured live. Ready to analyze.");
        if (autoAnalyze && onAutoAnalyze) {
          onAutoAnalyze(realSpokenTranscript);
        }
      } else {
        setMessage(`⚠️ ${error.message || "Audio processing notice."}`);
      }
    } finally {
      setUploading(false);
      setTranscribing(false);
    }
  };

  const wordCount = (liveText + " " + interimText).trim()
    ? (liveText + " " + interimText).trim().split(/\s+/).length
    : 0;

  return (
    <div className={`record-card ${recording ? "is-recording-active" : ""}`}>
      {/* Icon & Live Wave Indicator */}
      <div className={`record-icon ${recording ? "icon-pulsing" : ""}`}>
        {recording ? "🔴" : "🎙️"}
      </div>

      {/* Title */}
      <h3>Real-Time Voice Recorder</h3>

      <p>
        Speak naturally. Voice2Action captures your speech live word-for-word
        and transforms it into instant action items.
      </p>

      {/* Auto-Analyze Toggle */}
      <div className="realtime-options-bar">
        <label className="realtime-toggle-label" title="Automatically extract summary and tasks when recording finishes">
          <input
            type="checkbox"
            checked={autoAnalyze}
            onChange={(e) => setAutoAnalyze(e.target.checked)}
          />
          <span className="toggle-switch"></span>
          <span className="toggle-text">⚡ Auto-Analyze on Stop</span>
        </label>
        {speechSupported && (
          <span className="live-engine-pill" title="Web Speech Streaming Active">
            ● Real-Time STT
          </span>
        )}
      </div>

      {/* =====================================
          Active Recording Interface
      ===================================== */}
      {recording && (
        <div className="live-recording-hud">
          {/* Timer and Status Bar */}
          <div className="live-hud-header">
            <span className="live-pulse-badge">
              <span className="pulse-dot"></span> LIVE REC
            </span>
            <span className="live-timer">{formatTime(recordingSeconds)}</span>
            <span className="live-word-count">
              📝 {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
          </div>

          {/* Real-Time Audio Frequency Equalizer */}
          <div className="live-equalizer-container" title={`Mic level: ${volumeLevel}%`}>
            {frequencyData.map((height, i) => (
              <div
                key={i}
                className="equalizer-bar"
                style={{
                  height: `${height}%`,
                  opacity: Math.max(0.4, height / 100),
                }}
              />
            ))}
          </div>

          {/* Volume sensitivity indicator */}
          <div className="volume-meter-wrapper">
            <div
              className="volume-meter-fill"
              style={{ width: `${volumeLevel}%` }}
            />
          </div>

          {/* Real-Time Live Transcript Preview */}
          <div className="live-streaming-preview">
            <div className="preview-label">
              <span>⚡ Streaming Speech</span>
              {volumeLevel > 15 ? (
                <span className="speaking-tag">Speaking...</span>
              ) : (
                <span className="listening-tag">Listening...</span>
              )}
            </div>
            <div className="live-streaming-text">
              {liveText && <span className="final-speech">{liveText} </span>}
              {interimText && <span className="interim-speech">{interimText}</span>}
              {!liveText && !interimText && (
                <span className="streaming-placeholder">
                  Start speaking into your microphone...
                </span>
              )}
              <span className="streaming-cursor">▌</span>
            </div>
          </div>
        </div>
      )}

      {/* Record / Stop Button */}
      {!recording ? (
        <button
          type="button"
          className="record-button realtime-start-btn"
          onClick={startRecording}
          disabled={uploading || transcribing}
        >
          🎙️ Start Real-Time Recording
        </button>
      ) : (
        <button
          type="button"
          className="record-button stop-recording"
          onClick={stopRecording}
        >
          ⏹️ Stop Recording & Sync
        </button>
      )}

      {/* Audio Player Preview */}
      {audioURL && (
        <div className="record-preview">
          <p>🎵 Recorded Voice Audio</p>
          <audio controls src={audioURL} className="audio-player" />
          <small>▶️ Listen to your recording</small>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <p className={`upload-message ${message.startsWith("❌") ? "msg-error" : message.startsWith("✅") ? "msg-success" : ""}`}>
          {message}
        </p>
      )}

      {/* Processing Indicator */}
      {(uploading || transcribing) && (
        <div className="record-status">
          <span className="loading-spinner"></span>
          {uploading
            ? "📤 Uploading audio recording..."
            : "🤖 Syncing intelligence & action items..."}
        </div>
      )}

      {/* Browser speech capability notification */}
      {!speechSupported && (
        <small className="speech-support-notice">
          💡 For zero-delay streaming transcription, use Google Chrome, Microsoft Edge, or Safari.
        </small>
      )}

      <small className="supported">
        Format: WebM / Opus • High Fidelity 48kHz
      </small>
    </div>
  );
}

export default AudioRecorder;