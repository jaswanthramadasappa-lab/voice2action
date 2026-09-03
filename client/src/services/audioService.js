// ========================================
// Voice2Action API Service
// ========================================

// Local:
// http://localhost:5000
//
// Production:
// https://voice2action-n302.onrender.com

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://voice2action-n302.onrender.com";

console.log("🌐 API URL:", API_URL);


// ========================================
// Upload Audio
// ========================================

export async function uploadAudio(file, filename) {
  try {
    if (!file) {
      throw new Error("Audio file is required.");
    }

    const formData = new FormData();

    formData.append("audio", file);

    if (filename) {
      formData.append("filename", filename);
    }

    console.log("📤 Uploading audio:", file.name);
    console.log(
      "📡 Upload URL:",
      `${API_URL}/api/audio/upload`
    );

    const response = await fetch(
      `${API_URL}/api/audio/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const responseText = await response.text();

    console.log(
      "📥 Upload response:",
      responseText
    );

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new Error(
        `Server returned an invalid response: ${responseText.substring(
          0,
          150
        )}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Audio upload failed."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "❌ Upload Audio Error:",
      error
    );

    throw error;
  }
}


// ========================================
// Transcribe Audio
// ========================================

export async function transcribeAudio(filename) {
  try {
    if (!filename) {
      throw new Error(
        "Audio filename is required."
      );
    }

    console.log(
      "🎙️ Transcribing:",
      filename
    );

    console.log(
      "📡 Transcription URL:",
      `${API_URL}/api/transcription/transcribe`
    );

    const response = await fetch(
      `${API_URL}/api/transcription/transcribe`,
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

    const responseText =
      await response.text();

    console.log(
      "📥 Transcription response:",
      responseText
    );

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new Error(
        `Server returned an invalid response: ${responseText.substring(
          0,
          150
        )}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Transcription failed."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "❌ Transcription Error:",
      error
    );

    throw error;
  }
}


// ========================================
// Export API URL
// ========================================

export { API_URL };