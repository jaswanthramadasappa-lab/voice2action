import { useEffect, useState } from "react";
import {
  getNotes,
  deleteNote,
} from "../services/notesService";

function RecentNotes({ refresh }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // =========================
  // Load Notes From MongoDB
  // =========================

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data || []);
    } catch (error) {
      console.error("❌ Failed to load notes:", error);
      setMessage("❌ Failed to load recent notes.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Load On Page Open and on Refresh Prop Change
  // =========================

  useEffect(() => {
    loadNotes();
  }, [refresh]);

  // =========================
  // Delete Note
  // =========================

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes((previous) => previous.filter((note) => note._id !== id));
      setMessage("✅ Note deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("❌ Delete note failed:", error);
      setMessage("❌ Failed to delete note.");
    }
  };

  // Filter notes based on search query in real time
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const summaryMatch = (n.result?.summary || "").toLowerCase().includes(query);
    const transcriptMatch = (n.transcript || "").toLowerCase().includes(query);
    const tasksMatch = (n.result?.actionItems || []).some((item) =>
      (item.task || "").toLowerCase().includes(query)
    );
    return summaryMatch || transcriptMatch || tasksMatch;
  });

  // =========================
  // Loading
  // =========================

  if (loading && notes.length === 0) {
    return (
      <section className="recent-notes">
        <h2>🕘 Recent Notes Library</h2>
        <div className="empty-notes">
          <span>⏳</span>
          <h3>Loading notes...</h3>
          <p>Fetching your saved voice notes from cloud database.</p>
        </div>
      </section>
    );
  }

  // =========================
  // Empty State
  // =========================

  if (notes.length === 0) {
    return (
      <section className="recent-notes">
        <div className="recent-header">
          <div>
            <h2>🕘 Recent Notes Library</h2>
            <p>Your saved voice notes and action items appear here.</p>
          </div>
          <button
            type="button"
            className="refresh-btn"
            onClick={loadNotes}
            title="Refresh notes from database"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="empty-notes">
          <span>📝</span>
          <h3>No saved notes yet</h3>
          <p>Record or upload a voice note above and click "Save Note to Library" to build your task archive.</p>
        </div>
      </section>
    );
  }

  // =========================
  // Notes List
  // =========================

  return (
    <section className="recent-notes">
      <div className="recent-header">
        <div>
          <h2>🕘 Recent Notes Library</h2>
          <p>Your saved voice notes and actionable intelligence ({notes.length} total)</p>
        </div>

        <div className="recent-header-tools">
          <input
            type="text"
            className="notes-search-input"
            placeholder="🔍 Search notes or tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="refresh-btn"
            onClick={loadNotes}
            title="Refresh notes from database"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {message && (
        <p className="save-note-message">
          {message}
        </p>
      )}

      {filteredNotes.length === 0 && searchQuery && (
        <div className="empty-search-state">
          <p>No notes matched "{searchQuery}". Clear search to view all notes.</p>
        </div>
      )}

      <div className="notes-list">
        {filteredNotes.map((note) => (
          <div className="note-card" key={note._id}>
            {/* Header */}
            <div className="note-card-header">
              <div className="note-title-group">
                <span className="note-icon">🎙️</span>
                <strong>Voice Note</strong>
              </div>

              <button
                type="button"
                className="delete-note"
                onClick={() => handleDelete(note._id)}
                title="Delete note"
              >
                🗑️
              </button>
            </div>

            {/* Date */}
            <small className="note-date">
              📅 {note.createdAt ? new Date(note.createdAt).toLocaleString() : "Recently saved"}
            </small>

            {/* Summary */}
            <div className="note-summary">
              <h4>📝 Summary</h4>
              <p>{note.result?.summary || "No summary available."}</p>
            </div>

            {/* Statistics */}
            <div className="note-stats">
              <span>💡 {note.result?.keyPoints?.length || 0} Key Points</span>
              <span>✅ {note.result?.actionItems?.length || 0} Actions</span>
              <span>🎯 {note.result?.decisions?.length || 0} Decisions</span>
            </div>

            {/* Transcript */}
            {note.transcript && (
              <div className="note-transcript">
                <strong>📝 Spoken Transcript:</strong>
                <p>{note.transcript}</p>
              </div>
            )}

            {/* Action Items */}
            {note.result?.actionItems?.length > 0 && (
              <div className="saved-actions">
                <h4>✅ Action Items</h4>
                <ul>
                  {note.result.actionItems.map((item, index) => (
                    <li key={index}>
                      <span>{item.task}</span>
                      {item.priority && (
                        <strong className={`priority ${item.priority.toLowerCase()}`}>
                          {item.priority}
                        </strong>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Decisions */}
            {note.result?.decisions?.length > 0 && (
              <div className="saved-decisions">
                <h4>🎯 Decisions</h4>
                <ul>
                  {note.result.decisions.map((decision, index) => (
                    <li key={index}>{decision}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentNotes;