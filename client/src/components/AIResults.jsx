import { useState } from "react";
import { saveNote } from "../services/notesService";

function AIResults({ result, transcript, onNoteSaved }) {
  const [completedItems, setCompletedItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // =========================
  // No AI Result
  // =========================

  if (!result) return null;

  const totalTasks = result.actionItems?.length || 0;
  const completedCount = completedItems.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // =========================
  // Toggle Action Item
  // =========================

  const toggleTask = (index) => {
    setCompletedItems((previous) => {
      if (previous.includes(index)) {
        return previous.filter((item) => item !== index);
      }
      return [...previous, index];
    });
  };

  // =========================
  // Copy All Insights to Clipboard
  // =========================

  const handleCopyInsights = () => {
    let markdown = `# AI Voice Intelligence Report\n\n`;
    if (result.summary) {
      markdown += `## 📝 Summary\n${result.summary}\n\n`;
    }
    if (result.keyPoints && result.keyPoints.length > 0) {
      markdown += `## 💡 Key Points\n`;
      result.keyPoints.forEach((point) => {
        markdown += `- ${point}\n`;
      });
      markdown += `\n`;
    }
    if (result.actionItems && result.actionItems.length > 0) {
      markdown += `## ✅ Action Items\n`;
      result.actionItems.forEach((item, i) => {
        const isDone = completedItems.includes(i) ? "[x]" : "[ ]";
        markdown += `- ${isDone} ${item.task} (${item.priority || "Medium"})\n`;
      });
      markdown += `\n`;
    }
    if (result.decisions && result.decisions.length > 0) {
      markdown += `## 🎯 Decisions\n`;
      result.decisions.forEach((dec) => {
        markdown += `- ${dec}\n`;
      });
      markdown += `\n`;
    }

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // =========================
  // Download Markdown file
  // =========================

  const handleDownloadMarkdown = () => {
    let markdown = `# AI Voice Intelligence Report\nGenerated: ${new Date().toLocaleString()}\n\n`;
    markdown += `## 🎙️ Transcript\n${transcript}\n\n`;
    markdown += `## 📝 Summary\n${result.summary || "N/A"}\n\n`;
    if (result.keyPoints?.length) {
      markdown += `## 💡 Key Points\n` + result.keyPoints.map((k) => `- ${k}`).join("\n") + "\n\n";
    }
    if (result.actionItems?.length) {
      markdown += `## ✅ Action Items\n` + result.actionItems.map((a) => `- [ ] ${a.task} [${a.priority || "Medium"}]`).join("\n") + "\n\n";
    }
    if (result.decisions?.length) {
      markdown += `## 🎯 Decisions\n` + result.decisions.map((d) => `- ${d}`).join("\n") + "\n";
    }

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `voice-action-notes-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      setMessage("💾 Saving note to cloud database...");

      await saveNote({
        transcript,
        result,
      });

      setMessage("✅ Note saved successfully!");

      // Trigger instant refresh of Recent Notes component
      if (onNoteSaved) {
        onNoteSaved();
      }

    } catch (error) {
      console.error("❌ Save note failed:", error);
      setMessage(`❌ ${error.message || "Failed to save note."}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="ai-results">
      {/* Header with Quick Actions */}
      <div className="results-header">
        <div className="results-header-left">
          <span>🧠</span>
          <div>
            <h2>Real-Time AI Intelligence</h2>
            <p>Actionable intelligence synthesized directly from your voice note.</p>
          </div>
        </div>

        <div className="results-header-actions">
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleCopyInsights}
            title="Copy formatted markdown report"
          >
            {copied ? "✅ Copied!" : "📋 Copy Report"}
          </button>
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleDownloadMarkdown}
            title="Download as Markdown file"
          >
            📥 Export MD
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="result-card summary-card">
        <div className="card-top-row">
          <h3>📝 Executive Summary</h3>
          <span className="badge-tag">AI Distilled</span>
        </div>
        <p className="summary-text">
          {result.summary || "No summary available."}
        </p>
      </div>

      {/* Key Points */}
      <div className="result-card">
        <h3>💡 Key Discussion Points</h3>
        {result.keyPoints && result.keyPoints.length > 0 ? (
          <ul className="points-list">
            {result.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-subtext">No key points detected.</p>
        )}
      </div>

      {/* Action Items with Live Progress Tracker */}
      <div className="result-card action-items-card">
        <div className="section-title-row">
          <div>
            <h3>✅ Action Items & Tasks</h3>
            <p className="sub-helper">Check off tasks as you execute them</p>
          </div>

          <div className="task-tracker-status">
            <span className="task-count">
              {completedCount} / {totalTasks} Completed ({completionPercentage}%)
            </span>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        {totalTasks > 0 && (
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        )}

        <div className="action-list">
          {result.actionItems && result.actionItems.length > 0 ? (
            result.actionItems.map((item, index) => {
              const completed = completedItems.includes(index);
              const priorityClass = (item.priority || "Medium").toLowerCase();

              return (
                <div
                  className={`action-item ${completed ? "completed" : ""}`}
                  key={index}
                  onClick={() => toggleTask(index)}
                >
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => toggleTask(index)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="action-content">
                    <strong className="action-title">{item.task}</strong>

                    {item.priority && (
                      <span className={`priority-tag priority-${priorityClass}`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="empty-subtext">No action items detected.</p>
          )}
        </div>
      </div>

      {/* Decisions */}
      <div className="result-card">
        <h3>🎯 Decisions & Agreements</h3>
        {result.decisions && result.decisions.length > 0 ? (
          <ul className="decisions-list">
            {result.decisions.map((decision, index) => (
              <li key={index}>{decision}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-subtext">No decisions detected.</p>
        )}
      </div>

      {/* Save Note to MongoDB */}
      <div className="save-note-section">
        <button
          type="button"
          className="save-note-button"
          onClick={handleSaveNote}
          disabled={saving}
        >
          {saving ? "⏳ Saving Note..." : "💾 Save Note to Library"}
        </button>

        {message && (
          <p
            className={`save-note-message ${
              message.startsWith("✅") ? "success" : "error"
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