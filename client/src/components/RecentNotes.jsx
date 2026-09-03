import { useEffect, useState } from "react";
import {
  getNotes,
  deleteNote,
} from "../services/notesService";

function RecentNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =========================
  // Load Notes From MongoDB
  // =========================

  const loadNotes = async () => {
    try {
      setLoading(true);

      const data = await getNotes();

      setNotes(data);

    } catch (error) {
      console.error("❌ Failed to load notes:", error);

      setMessage(
        "❌ Failed to load recent notes."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Load On Page Open
  // =========================

  useEffect(() => {
    loadNotes();
  }, []);

  // =========================
  // Delete Note
  // =========================

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);

      setNotes((previous) =>
        previous.filter(
          (note) => note._id !== id
        )
      );

      setMessage("✅ Note deleted successfully.");

    } catch (error) {
      console.error(
        "❌ Delete note failed:",
        error
      );

      setMessage(
        "❌ Failed to delete note."
      );
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <section className="recent-notes">

        <h2>🕘 Recent Notes</h2>

        <div className="empty-notes">
          <span>⏳</span>

          <h3>
            Loading notes...
          </h3>

          <p>
            Fetching your saved notes.
          </p>
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
            <h2>
              🕘 Recent Notes
            </h2>

            <p>
              Your recently saved voice notes
            </p>
          </div>

        </div>

        <div className="empty-notes">

          <span>📝</span>

          <h3>
            No recent notes
          </h3>

          <p>
            Your saved voice notes
            will appear here.
          </p>

        </div>

      </section>
    );
  }

  // =========================
  // Notes
  // =========================

  return (
    <section className="recent-notes">

      <div className="recent-header">

        <div>
          <h2>
            🕘 Recent Notes
          </h2>

          <p>
            Your recently saved voice notes
          </p>
        </div>

      </div>

      {message && (
        <p className="save-note-message">
          {message}
        </p>
      )}

      <div className="notes-list">

        {notes.map((note) => (

          <div
            className="note-card"
            key={note._id}
          >

            {/* Header */}

            <div className="note-card-header">

              <div>
                <span className="note-icon">
                  🎙️
                </span>

                <strong>
                  Voice Note
                </strong>
              </div>

              <button
                type="button"
                className="delete-note"
                onClick={() =>
                  handleDelete(note._id)
                }
                title="Delete note"
              >
                🗑️
              </button>

            </div>


            {/* Date */}

            <small className="note-date">

              {note.createdAt
                ? new Date(
                    note.createdAt
                  ).toLocaleString()
                : "Unknown date"}

            </small>


            {/* Summary */}

            <div className="note-summary">

              <h4>
                📝 Summary
              </h4>

              <p>
                {note.result?.summary ||
                  "No summary available."}
              </p>

            </div>


            {/* Statistics */}

            <div className="note-stats">

              <span>
                💡{" "}
                {note.result?.keyPoints
                  ?.length || 0}{" "}
                Key Points
              </span>

              <span>
                ✅{" "}
                {note.result?.actionItems
                  ?.length || 0}{" "}
                Actions
              </span>

              <span>
                🎯{" "}
                {note.result?.decisions
                  ?.length || 0}{" "}
                Decisions
              </span>

            </div>


            {/* Transcript */}

            {note.transcript && (

              <div className="note-transcript">

                <strong>
                  📝 Transcript
                </strong>

                <p>
                  {note.transcript}
                </p>

              </div>

            )}


            {/* Action Items */}

            {note.result?.actionItems?.length > 0 && (

              <div className="saved-actions">

                <h4>
                  ✅ Action Items
                </h4>

                <ul>

                  {note.result.actionItems.map(
                    (item, index) => (

                      <li key={index}>

                        <span>
                          {item.task}
                        </span>

                        {item.priority && (

                          <strong
                            className={`priority ${item.priority.toLowerCase()}`}
                          >
                            {item.priority}
                          </strong>

                        )}

                      </li>

                    )
                  )}

                </ul>

              </div>

            )}


            {/* Decisions */}

            {note.result?.decisions?.length > 0 && (

              <div className="saved-decisions">

                <h4>
                  🎯 Decisions
                </h4>

                <ul>

                  {note.result.decisions.map(
                    (decision, index) => (

                      <li key={index}>
                        {decision}
                      </li>

                    )
                  )}

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