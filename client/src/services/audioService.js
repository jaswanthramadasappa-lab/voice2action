const API_URL = "/api";

// =========================
// Upload Audio
// =========================

export const uploadAudio = async (
  audioBlob,
  fileName = "recording.webm"
) => {
  const formData = new FormData();

  formData.append("audio", audioBlob, fileName);

  const response = await fetch(`${API_URL}/audio/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Audio upload failed"
    );
  }

  return data;
};


// =========================
// Transcribe Audio
// =========================

export const transcribeAudio = async (filename) => {
  const response = await fetch(
    `${API_URL}/transcription/transcribe`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        filename,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Transcription failed"
    );
  }

  return data;
};


// =========================
// Generate AI Summary
// =========================

export const generateSummary = async (transcript) => {
  const response = await fetch(
    `${API_URL}/summary/generate`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        transcript,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "AI analysis failed"
    );
  }

  return data;
};
