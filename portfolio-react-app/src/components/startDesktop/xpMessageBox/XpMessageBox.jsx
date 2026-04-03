import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./XpMessageBox.css";

function XpIconQuestion() {
  return (
    <svg
      className="xp-msgbox-icon-svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path
        fill="#ffcc00"
        stroke="#c4a000"
        strokeWidth="1"
        d="M16 2.5 L29.5 27.5 H2.5 Z"
      />
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fill="#003399"
        fontSize="17"
        fontWeight="bold"
        fontFamily="Tahoma, Arial, sans-serif"
      >
        ?
      </text>
    </svg>
  );
}

/**
 * Diálogo modal estilo mensaje de Windows XP (pregunta Sí / No).
 */
export default function XpMessageBox({
  open,
  title = "Windows",
  children,
  confirmLabel = "Sí",
  cancelLabel = "No",
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => confirmRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onCancel?.();
  };

  return createPortal(
    <div
      className="xp-msgbox-backdrop"
      role="presentation"
      onMouseDown={handleBackdrop}
    >
      <div
        className="xp-msgbox-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="xp-msgbox-titlebar">
          <span id={titleId} className="xp-msgbox-titlebar-text">
            {title}
          </span>
          <button
            type="button"
            className="xp-msgbox-titlebar-x"
            aria-label="Cerrar"
            onClick={() => onCancel?.()}
          >
            ×
          </button>
        </div>
        <div className="xp-msgbox-main">
          <div className="xp-msgbox-icon-wrap">
            <XpIconQuestion />
          </div>
          <div className="xp-msgbox-text">{children}</div>
        </div>
        <div className="xp-msgbox-footer">
          <button
            ref={confirmRef}
            type="button"
            className="xp-msgbox-btn xp-msgbox-btn--default"
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </button>
          <button type="button" className="xp-msgbox-btn" onClick={() => onCancel?.()}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
