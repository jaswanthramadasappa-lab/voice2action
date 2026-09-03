function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon">🎙️</span>
        <span>Voice2Action</span>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item active">
          <span>🏠</span>
          Dashboard
        </button>

        <button className="nav-item">
          <span>🎙️</span>
          New Voice Note
        </button>

        <button className="nav-item">
          <span>📁</span>
          History
        </button>

        <button className="nav-item">
          <span>⚙️</span>
          Settings
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="ai-status">
          <span className="status-dot"></span>
          <div>
            <strong>AI Ready</strong>
            <small>System operational</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
