import React, { useRef, useState } from "react";
import "./icon.css";

const ICON_BOX_W = 84;
const ICON_BOX_H = 78;

const Icon = ({
  id,
  onOpen,
  image,
  name,
  left,
  top,
  desktopRef,
  onPositionChange,
  onRequestContextMenu,
}) => {
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    const desk = desktopRef.current?.getBoundingClientRect();
    if (!desk) return;
    dragMovedRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    offset.current = {
      x: e.clientX - desk.left - left,
      y: e.clientY - desk.top - top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (dx * dx + dy * dy > 25) dragMovedRef.current = true;
    const desk = desktopRef.current?.getBoundingClientRect();
    if (!desk) return;
    let nx = e.clientX - desk.left - offset.current.x;
    let ny = e.clientY - desk.top - offset.current.y;
    const maxX = Math.max(0, desk.width - ICON_BOX_W);
    const maxY = Math.max(0, desk.height - ICON_BOX_H);
    nx = Math.max(0, Math.min(nx, maxX));
    ny = Math.max(0, Math.min(ny, maxY));
    onPositionChange(id, nx, ny);
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    try {
      if (e?.currentTarget?.releasePointerCapture && e.pointerId != null) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRequestContextMenu(e, { id, name });
  };

  const handleClick = (e) => {
    if (dragMovedRef.current) {
      e.preventDefault();
      dragMovedRef.current = false;
    }
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    if (dragMovedRef.current) return;
    onOpen?.();
  };

  return (
    <div
      className={`icon${dragging ? " icon--dragging" : ""}`}
      style={{ left: `${left}px`, top: `${top}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={0}
      aria-label={name}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen?.();
      }}
    >
      <img src={image} alt="" draggable={false} />
      <p>{name}</p>
    </div>
  );
};

export default Icon;
