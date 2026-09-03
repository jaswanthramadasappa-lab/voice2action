import { useState } from "react";
import { saveNote } from "../services/notesService";

function AIResults({ result, transcript }) {
  const [completedItems, setCompletedItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // No AI Result
  // =========================

  if (!result) return null;

  // =========================
  // Toggle Action Item
  // =========================

  const toggleTask = (index) => {
    setCompletedItems((previous) => {
      if (previous.includes(index)) {
        return previous.filter(
          (item) => item !== index
        );
      }

      return [...previous, index];
    });
  };

  // =========================
  // Save Note to MongoDB
  // =========================

  const handleSaveNote = async () => {
    if (!transcript) {
      setMessage("❌ Transcript is missing.");
      return;
    }

    if (!result) {
      setMessage("❌ AI result is missing.");
      return;
    }

    try {
      setSaving(true);
      setMessage("💾 Saving note...");

      console.log("💾 Saving note...");
      console.log("📝 Transcript:", transcript);
      console.log("🧠 AI Result:", result);

      await saveNote({
        transcript,
        result,
      });

      setMessage("✅ Note saved successfully!");

      console.log("✅ Note saved successfully!");

    } catch (error) {
      console.error(
        "❌ Save note failed:",
        error
      );

      setMessage(
        `❌ ${
          error.message ||
          "Failed to save note."
        }`
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Render
  // =========================

  return (
    <section className="ai-results">

      {/* =========================
          Header
      ========================= */}

      <div className="results-header">

        <span>🧠</span>

        <div>
          <h2>
            AI Analysis
          </h2>

          <p>
            Here's what your voice note means.
          </p>
        </div>

      </div>


      {/* =========================
          Summary
      ========================= */}

      <div className="result-card summary-card">

        <h3>
          📝 Summary
        </h3>

        <p>
          {result.summary ||
            "No summary available."}
        </p>

      </div>


      {/* =========================
          Key Points
      ========================= */}

      <div className="result-card">

        <h3>
          💡 Key Points
        </h3>

        {result.keyPoints &&
        result.keyPoints.length > 0 ? (

          <ul>

            {result.keyPoints.map(
              (point, index) => (

                <li key={index}>
                  {point}
                </li>

              )
            )}

          </ul>

        ) : (

          <p>
            No key points detected.
          </p>

        )}

      </div>


      {/* =========================
          Action Items
      ========================= */}

      <div className="result-card">

        <div className="section-title-row">

          <h3>
            ✅ Action Items
          </h3>

          <span className="task-count">

            {completedItems.length}/
            {result.actionItems?.length || 0}
            {" "}completed

          </span>

        </div>


        <div className="action-list">

          {result.actionItems &&
          result.actionItems.length > 0 ? (

            result.actionItems.map(
              (item, index) => {

                const completed =
                  completedItems.includes(
                    index
                  );

                return (

                  <div
                    className={`action-item ${
                      completed
                        ? "completed"
                        : ""
                    }`}
                    key={index}
                  >

                    {/* Checkbox */}

                    <input
                      type="checkbox"
                      checked={completed}
                      onChange={() =>
                        toggleTask(index)
                      }
                    />


                    {/* Task */}

                    <div className="action-content">

                      <strong>
                        {item.task}
                      </strong>


                      {/* Priority */}

                      {item.priority && (

                        <span
                          className={`priority ${
                            item.priority.toLowerCase()
                          }`}
                        >
                          {item.priority}
                        </span>

                      )}

                    </div>

                  </div>

                );
              }
            )

          ) : (

            <p>
              No action items detected.
            </p>

          )}

        </div>

      </div>


      {/* =========================
          Decisions
      ========================= */}

      <div className="result-card">

        <h3>
          🎯 Decisions
        </h3>

        {result.decisions &&
        result.decisions.length > 0 ? (

          <ul>

            {result.decisions.map(
              (decision, index) => (

                <li key={index}>
                  {decision}
                </li>

              )
            )}

          </ul>

        ) : (

          <p>
            No decisions detected.
          </p>

        )}

      </div>


      {/* =========================
          Save Note
      ========================= */}

      <div className="save-note-section">

        <button
          type="button"
          className="save-note-button"
          onClick={handleSaveNote}
          disabled={saving}
        >

          {saving
            ? "⏳ Saving..."
            : "💾 Save to Recent Notes"}

        </button>


        {/* Save Message */}

        {message && (

          <p
            className={`save-note-message ${
              message.startsWith("✅")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </p>

        )}

      </div>

    </section>
  );
}

export default AIResults;