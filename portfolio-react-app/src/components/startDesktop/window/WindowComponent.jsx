import React, { useRef, useCallback, isValidElement, cloneElement } from "react";
import "./window.css";

/** Coincide con min-width / min-height de .xp-window */
const WIN_MIN_W = 260;
const WIN_MIN_H = 160;

/**
 * @param {string} edge — n, s, e, w, ne, nw, se, sw
 * @param {number} startX
 * @param {number} startY
 * @param {{ x: number, y: number, w: number, h: number }} orig
 * @param {{ width: number, height: number }} desk
 * @param {number} clientX
 * @param {number} clientY
 */
function edgeResizeFlags(edge) {
  return {
    e: edge === "e" || edge === "ne" || edge === "se",
    w: edge === "w" || edge === "nw" || edge === "sw",
    n: edge === "n" || edge === "nw" || edge === "ne",
    s: edge === "s" || edge === "sw" || edge === "se",
  };
}

function clampResizeRect(edge, startX, startY, orig, desk, clientX, clientY) {
  const { e: goE, w: goW, n: goN, s: goS } = edgeResizeFlags(edge);
  const dx = clientX - startX;
  const dy = clientY - startY;
  let left = orig.x;
  let top = orig.y;
  let right = orig.x + orig.w;
  let bottom = orig.y + orig.h;

  if (goE) right = orig.x + orig.w + dx;
  if (goW) left = orig.x + dx;
  if (goS) bottom = orig.y + orig.h + dy;
  if (goN) top = orig.y + dy;

  let w = right - left;
  let h = bottom - top;

  if (w < WIN_MIN_W) {
    if (goW) left = right - WIN_MIN_W;
    else right = left + WIN_MIN_W;
    w = WIN_MIN_W;
  }
  if (h < WIN_MIN_H) {
    if (goN) top = bottom - WIN_MIN_H;
    else bottom = top + WIN_MIN_H;
    h = WIN_MIN_H;
  }

  left = Math.max(0, left);
  top = Math.max(0, top);
  right = Math.min(desk.width, right);
  bottom = Math.min(desk.height, bottom);

  w = right - left;
  h = bottom - top;
  if (w < WIN_MIN_W) {
    if (goW) left = Math.max(0, right - WIN_MIN_W);
    else right = Math.min(desk.width, left + WIN_MIN_W);
    w = right - left;
  }
  if (h < WIN_MIN_H) {
    if (goN) top = Math.max(0, bottom - WIN_MIN_H);
    else bottom = Math.min(desk.height, top + WIN_MIN_H);
    h = bottom - top;
  }

  return { x: left, y: top, w, h };
}

/** Bordes primero, esquinas después (mismo z-index más alto en CSS) para priorizar el agarre en vértices */
const RESIZE_EDGES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

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
  onResize,
  layout = "default",
}) => {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

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

  const handleResizePointerDown = useCallback(
    (e) => {
      const edge = e.currentTarget.getAttribute("data-resize-edge");
      if (!edge || e.button !== 0 || state.maximized) return;
      e.stopPropagation();
      e.preventDefault();
      onFocus();
      const deskEl = desktopRef.current?.getBoundingClientRect();
      if (!deskEl) return;
      resizeRef.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        orig: { x: state.x, y: state.y, w: state.w, h: state.h },
        desk: { width: deskEl.width, height: deskEl.height },
        target: e.currentTarget,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [state.maximized, state.x, state.y, state.w, state.h, onFocus, desktopRef]
  );

  const handleResizePointerMove = useCallback(
    (e) => {
      const d = resizeRef.current;
      if (!d) return;
      const rect = clampResizeRect(
        d.edge,
        d.startX,
        d.startY,
        d.orig,
        d.desk,
        e.clientX,
        e.clientY
      );
      onResize(winId, rect);
    },
    [winId, onResize]
  );

  const endResize = useCallback((e) => {
    const r = resizeRef.current;
    if (r?.target && e?.pointerId != null) {
      try {
        r.target.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    resizeRef.current = null;
  }, []);

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
      {!maximized &&
        RESIZE_EDGES.map((edge) => (
          <div
            key={edge}
            role="presentation"
            className={`xp-win-resize xp-win-resize--${edge}`}
            data-resize-edge={edge}
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
        ))}
    </div>
  );
};

export default WindowComponent;
