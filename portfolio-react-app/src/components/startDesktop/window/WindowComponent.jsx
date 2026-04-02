import React, { useRef, useCallback, isValidElement, cloneElement } from "react";
import "./window.css";

const TitleBtn = ({ type, label, onClick }) => (
  <button
    type="button"
    className={`win-cbtn win-cbtn--${type}`}
    aria-label={label}
    onPointerDown={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.stopPropagation()}
    onDoubleClick={(e) => e.stopPropagation()}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  />
);

const WindowComponent = ({
  winId,
  title,
  content,
  iconSrc,
  state,
  isActive,
  desktopRef,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  layout = "default",
}) => {
  const dragRef = useRef(null);

  const handleTitlePointerDown = useCallback(
    (e) => {
      if (e.button !== 0 || state.maximized) return;
      if (e.target.closest?.(".xp-window-controls")) return;
      onFocus();
      const desk = desktopRef.current?.getBoundingClientRect();
      if (!desk) return;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: state.x,
        origY: state.y,
        desk,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [state.maximized, state.x, state.y, onFocus, desktopRef]
  );

  const handleTitlePointerMove = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const nw = state.w;
      const nh = state.h;
      let nx = d.origX + dx;
      let ny = d.origY + dy;
      const maxX = Math.max(0, d.desk.width - nw);
      const maxY = Math.max(0, d.desk.height - nh);
      nx = Math.max(0, Math.min(nx, maxX));
      ny = Math.max(0, Math.min(ny, maxY));
      onMove(winId, nx, ny);
    },
    [winId, onMove, state.w, state.h]
  );

  const endTitleDrag = useCallback((e) => {
    if (dragRef.current && e?.currentTarget?.releasePointerCapture && e.pointerId != null) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    dragRef.current = null;
  }, []);

  const handleTitleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.target.closest?.(".xp-window-controls")) return;
      if (!state.maximized) onFocus();
      onToggleMaximize(winId);
    },
    [winId, onFocus, onToggleMaximize, state.maximized]
  );

  if (!state.running || state.minimized) return null;

  const maximized = state.maximized;

  const frameStyle = maximized
    ? { zIndex: state.z }
    : {
        left: state.x,
        top: state.y,
        width: state.w,
        height: state.h,
        zIndex: state.z,
      };

  return (
    <div
      className={`xp-window${isActive ? " xp-window--active" : ""}${
        maximized ? " xp-window--maximized" : ""
      }`}
      style={frameStyle}
      onMouseDown={() => onFocus()}
      role="dialog"
      aria-labelledby={`${winId}-title`}
    >
      <header
        className="xp-window-titlebar"
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={endTitleDrag}
        onPointerCancel={endTitleDrag}
        onDoubleClick={handleTitleDoubleClick}
      >
        <div className="xp-window-titlebar-main">
          {iconSrc && (
            <img src={iconSrc} alt="" className="xp-window-title-icon" draggable={false} />
          )}
          <span id={`${winId}-title`} className="xp-window-title-text">
            {title}
          </span>
        </div>
        <div className="xp-window-controls">
          <TitleBtn type="min" label="Minimizar" onClick={() => onMinimize(winId)} />
          <TitleBtn
            type={maximized ? "restore" : "max"}
            label={maximized ? "Restaurar" : "Maximizar"}
            onClick={() => onToggleMaximize(winId)}
          />
          <TitleBtn type="close" label="Cerrar" onClick={() => onClose(winId)} />
        </div>
      </header>
      <div className="xp-window-body">
        <div
          className={`xp-window-content${
            layout === "explorer" ? " xp-window-content--explorer" : ""
          }`}
        >
          {isValidElement(content)
            ? cloneElement(content, { windowId: winId })
            : content}
        </div>
      </div>
    </div>
  );
};

export default WindowComponent;
