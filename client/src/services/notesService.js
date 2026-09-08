const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://voice2action-n302.onrender.com");

// =========================
// Save Note
// =========================

export async function saveNote({ transcript, result }) {
  if (!transcript || !result) {
    throw new Error("Transcript or AI result is missing.");
  }

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to save note."
    );
  }

  return data.note;
}


// =========================
// Get Notes
// =========================

export async function getNotes() {
  const response = await fetch(
    `${API_URL}/api/notes`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch notes."
    );
  }

  return data.notes || [];
}


// =========================
// Delete Note
// =========================

export async function deleteNote(id) {
  const response = await fetch(
    `${API_URL}/api/notes/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete note."
    );
  }

  return data;
}