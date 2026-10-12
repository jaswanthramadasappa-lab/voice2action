const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://voice2action-n302.onrender.com");

const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
const CLOUD_URL = "https://voice2action-n302.onrender.com";

// =========================
// Save Note
// =========================

export async function saveNote({ transcript, result }) {
  if (!transcript || !result) {
    throw new Error("Transcript or AI result is missing.");
  }

  let response;
  try {
    response = await fetch(
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
  } catch (netErr) {
    if (API_URL !== CLOUD_URL) {
      console.warn("Local backend unreachable, failing over to cloud database...", netErr.message);
      response = await fetch(
        `${CLOUD_URL}/api/notes/save`,
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
    } else {
      throw new Error(`Connection error: ${netErr.message}`);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    throw new Error(`Server returned unexpected format (status ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Failed to save note (status ${response.status})`
    );
  }

  return data.note;
}


// =========================
// Get Notes
// =========================

export async function getNotes() {
  let response;
  try {
    response = await fetch(`${API_URL}/api/notes`);
  } catch (netErr) {
    if (API_URL !== CLOUD_URL) {
      console.warn("Local backend unreachable, loading notes from cloud database...");
      response = await fetch(`${CLOUD_URL}/api/notes`);
    } else {
      throw new Error(`Connection error: ${netErr.message}`);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    throw new Error(`Server returned unexpected format (status ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Failed to fetch notes (status ${response.status})`
    );
  }

  return data.notes || [];
}


// =========================
// Delete Note
// =========================

export async function deleteNote(id) {
  let response;
  try {
    response = await fetch(
      `${API_URL}/api/notes/${id}`,
      { method: "DELETE" }
    );
  } catch (netErr) {
    if (API_URL !== CLOUD_URL) {
      response = await fetch(
        `${CLOUD_URL}/api/notes/${id}`,
        { method: "DELETE" }
      );
    } else {
      throw new Error(`Connection error: ${netErr.message}`);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonErr) {
    throw new Error(`Server returned unexpected format`);
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete note."
    );
  }

  return data;
}