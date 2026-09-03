// ========================================
// Voice2Action API Service
// ========================================

// Backend URL
// Local backend: http://localhost:5000
// Production backend: https://voice2action-n302.onrender.com

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://voice2action-n302.onrender.com";

console.log("🌐 Voice2Action API URL:", API_URL);


// ========================================
// Helper: Parse Server Response
// ========================================

async function parseResponse(response) {
  const responseText = await response.text();

  console.log("📥 Server response:", responseText);

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    throw new Error(
      `Server returned an invalid response: ${responseText.substring(
        0,
        200
      )}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Server request failed."
    );
  }

  return data;
}


// ========================================
// Upload Audio
// ========================================

export async function uploadAudio(file, filename) {
  try {
    if (!file) {
      throw new Error("Audio file is required.");
    }

    console.log("=================================");
    console.log("📤 AUDIO UPLOAD");
    console.log("=================================");
    console.log("File:", file.name);
    console.log("Size:", file.size);
    console.log("Type:", file.type);

    const formData = new FormData();

    // IMPORTANT:
    // This must match multer's upload.single("audio")
    // in server/routes/audioRoutes.js
    formData.append("audio", file);

    if (filename) {
      formData.append("filename", filename);
    }

    const response = await fetch(
      `${API_URL}/api/audio/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await parseResponse(response);

    console.log("✅ Audio upload successful:", data);

    return data;

  } catch (error) {
    console.error(
      "❌ Audio upload error:",
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

    console.log("=================================");
    console.log("🎙️ AUDIO TRANSCRIPTION");
    console.log("=================================");
    console.log("Filename:", filename);

    const response = await fetch(
      `${API_URL}/api/transcription/transcribe`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          filename: filename,
        }),
      }
    );

    const data = await parseResponse(response);

    console.log(
      "✅ Transcription successful:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "❌ Transcription error:",
      error
    );

    throw error;
  }
}


// ========================================
// Generate AI Summary
// ========================================

export async function generateSummary(transcript) {
  try {
    if (!transcript || !transcript.trim()) {
      throw new Error(
        "Transcript is required."
      );
    }

    console.log("=================================");
    console.log("🧠 AI SUMMARY");
    console.log("=================================");
    console.log(
      "Transcript:",
      transcript
    );

    const response = await fetch(
      `${API_URL}/api/summary/generate`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          transcript: transcript.trim(),
        }),
      }
    );

    const data = await parseResponse(response);

    console.log(
      "✅ AI summary generated:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "❌ AI summary error:",
      error
    );

    throw error;
  }
}


// ========================================
// Save Note to MongoDB
// ========================================

export async function saveNote({
  transcript,
  result,
}) {
  try {
    if (!transcript || !result) {
      throw new Error(
        "Transcript or AI result is missing."
      );
    }

    console.log("=================================");
    console.log("💾 SAVING NOTE");
    console.log("=================================");

    const response = await fetch(
      `${API_URL}/api/notes/save`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          transcript,
          result,
        }),
      }
    );

    const data = await parseResponse(response);

    console.log(
      "✅ Note saved successfully:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "❌ Save note error:",
      error
    );

    throw error;
  }
}


// ========================================
// Get Notes from MongoDB
// ========================================

export async function getNotes() {
  try {
    console.log("=================================");
    console.log("📚 GETTING NOTES");
    console.log("=================================");

    const response = await fetch(
      `${API_URL}/api/notes`,
      {
        method: "GET",
      }
    );

    const data = await parseResponse(response);

    console.log(
      "✅ Notes loaded:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "❌ Get notes error:",
      error
    );

    throw error;
  }
}


// ========================================
// Delete Note
// ========================================

export async function deleteNote(id) {
  try {
    if (!id) {
      throw new Error(
        "Note ID is required."
      );
    }

    console.log(
      "🗑️ Deleting note:",
      id
    );

    const response = await fetch(
      `${API_URL}/api/notes/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await parseResponse(response);

    console.log(
      "✅ Note deleted:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "❌ Delete note error:",
      error
    );

    throw error;
  }
}


// ========================================
// Export API URL
// ========================================

export { API_URL };