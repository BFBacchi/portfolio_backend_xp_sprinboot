import React, { useEffect, useRef, useState } from "react";
import StartMenu from "./StartMenu";
import "./taskbar.css";

function StartFlag() {
  return (
    <svg
      className="start-flag"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="8" height="8" fill="#f65314" rx="0.5" />
      <rect x="11" y="1" width="8" height="8" fill="#7cbb00" rx="0.5" />
      <rect x="1" y="11" width="8" height="8" fill="#00a1f1" rx="0.5" />
      <rect x="11" y="11" width="8" height="8" fill="#ffbb00" rx="0.5" />
    </svg>
  );
}

const TaskBar = ({
  taskbarWindows = [],
  activeTaskId = null,
  onTaskbarWindowClick = () => {},
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const startBtnRef = useRef(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timeLine = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateLine = now.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <>
      <div id="taskbar" role="navigation" aria-label="Barra de tareas">
        <button
          ref={startBtnRef}
          id="start-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="start-menu-root"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <StartFlag />
          <span className="start-button-text">Inicio</span>
        </button>
        <div className="taskbar-apps" role="list">
          {taskbarWindows.length === 0 && (
            <div className="taskbar-apps-placeholder" aria-hidden="true" />
          )}
          {taskbarWindows.map((w) => {
            const isActive = activeTaskId === w.id;
            return (
              <button
                key={w.id}
                type="button"
                className={`task-btn${isActive ? " task-btn--active" : ""}${
                  w.minimized ? " task-btn--minimized" : ""
                }`}
                role="listitem"
                title={w.title}
                onClick={() => onTaskbarWindowClick(w.id)}
              >
                <img src={w.icon} alt="" className="task-btn-icon" draggable={false} />
                <span className="task-btn-label">{w.title}</span>
              </button>
            );
          })}
        </div>
        <div className="tray" role="status" aria-live="polite">
          <div className="tray-inner">
            <div className="tray-clock">
              <div className="tray-time">{timeLine}</div>
              <div className="tray-date">{dateLine}</div>
            </div>
          </div>
        </div>
      </div>
      <StartMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={startBtnRef}
      />
    </>
  );
};

export default TaskBar;
