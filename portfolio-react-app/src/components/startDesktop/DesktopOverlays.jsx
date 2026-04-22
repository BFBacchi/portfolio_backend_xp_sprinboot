import React, { useCallback, useId, useRef, useState } from "react";
import { useDesktopActions } from "./context/DesktopActionsContext";
import MinesweeperGame from "./games/MinesweeperGame";
import SolitaireGame from "./games/SolitaireGame";
import "./DesktopOverlays.css";

function OverlayFrame({ overlayId, title, children, footer, dialogClassName }) {
  const { closeOverlay } = useDesktopActions();
  const titleId = useId();
  const close = () => closeOverlay(overlayId);
  const dialogCls = ["xp-overlay-dialog", dialogClassName].filter(Boolean).join(" ");
  return (
    <div
      className="xp-overlay-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className={dialogCls} onMouseDown={(e) => e.stopPropagation()}>
        <div className="xp-overlay-titlebar">
          <span id={titleId}>{title}</span>
          <button
            type="button"
            className="xp-overlay-close"
            aria-label="Cerrar"
            onClick={close}
          >
            ×
          </button>
        </div>
        <div className="xp-overlay-body">{children}</div>
        {footer}
      </div>
    </div>
  );
}

function NotepadOverlay({ overlayId, payload }) {
  const storageKey = payload?.storageKey ?? "xp-portfolio-notepad";
  const initialFromPayload = payload?.initialText;
  const [text, setText] = useState(() => {
    if (initialFromPayload != null) return initialFromPayload;
    try {
      return localStorage.getItem(storageKey) || "";
    } catch {
      return "";
    }
  });
  const { closeOverlay } = useDesktopActions();

  const save = useCallback(() => {
    try {
      localStorage.setItem(storageKey, text);
      window.alert("Texto guardado en el almacenamiento local del navegador.");
    } catch {
      window.alert("No se pudo guardar.");
    }
  }, [text, storageKey]);

  const frameTitle = payload?.windowTitle || "Bloc de notas";

  return (
    <OverlayFrame
      overlayId={overlayId}
      title={frameTitle}
      footer={
        <div className="xp-overlay-actions">
          <button type="button" className="xp-overlay-btn" onClick={save}>
            Guardar
          </button>
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Cerrar
          </button>
        </div>
      }
    >
      <textarea
        className="xp-notepad-ta"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
    </OverlayFrame>
  );
}

function CalculatorOverlay({ overlayId }) {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState(null);
  const [pendingOp, setPendingOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const readNum = () => parseFloat(display) || 0;

  const applyOp = (a, b, op) => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? a : a / b;
      default:
        return b;
    }
  };

  const num = (n) => {
    if (fresh) {
      setDisplay(String(n));
      setFresh(false);
    } else {
      setDisplay((d) => (d === "0" && n !== "." ? String(n) : d + n));
    }
  };

  const dot = () => {
    if (fresh) {
      setDisplay("0.");
      setFresh(false);
    } else if (!display.includes(".")) setDisplay((d) => d + ".");
  };

  const pickOp = (op) => {
    const v = readNum();
    if (stored !== null && pendingOp && !fresh) {
      const r = applyOp(stored, v, pendingOp);
      setDisplay(String(Math.round(r * 1e8) / 1e8));
      setStored(r);
    } else {
      setStored(v);
    }
    setPendingOp(op);
    setFresh(true);
  };

  const equals = () => {
    if (pendingOp === null || stored === null) return;
    const v = readNum();
    const r = applyOp(stored, v, pendingOp);
    setDisplay(String(Math.round(r * 1e8) / 1e8));
    setStored(null);
    setPendingOp(null);
    setFresh(true);
  };

  const clear = () => {
    setDisplay("0");
    setStored(null);
    setPendingOp(null);
    setFresh(true);
  };

  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"];

  return (
    <OverlayFrame overlayId={overlayId} title="Calculadora" footer={null}>
      <div className="xp-calc">
        <div className="xp-calc-display">{display}</div>
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              if (k === "=") equals();
              else if ("+-*/".includes(k)) pickOp(k);
              else if (k === ".") dot();
              else num(k);
            }}
          >
            {k}
          </button>
        ))}
        <button type="button" style={{ gridColumn: "1 / -1" }} onClick={clear}>
          Borrar
        </button>
      </div>
    </OverlayFrame>
  );
}

function PaintOverlay({ overlayId }) {
  const ref = useRef(null);
  const [color, setColor] = useState("#000000");
  const drawing = useRef(false);
  const { closeOverlay } = useDesktopActions();

  const start = (e) => {
    drawing.current = true;
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const r = c.getBoundingClientRect();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
  };

  const move = (e) => {
    if (!drawing.current) return;
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const r = c.getBoundingClientRect();
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
  };

  return (
    <OverlayFrame
      overlayId={overlayId}
      title="Paint (demostración)"
      footer={
        <div className="xp-overlay-actions">
          <button type="button" className="xp-overlay-btn" onClick={clear}>
            Limpiar
          </button>
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="xp-paint-tools">
        <label>
          Color:{" "}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
      </div>
      <canvas
        ref={ref}
        className="xp-paint-canvas"
        width={400}
        height={260}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
    </OverlayFrame>
  );
}

function SearchOverlay({ overlayId }) {
  const [q, setQ] = useState("");
  const { closeOverlay, openWindow, openOverlay } = useDesktopActions();
  const results =
    q.trim().length > 0
      ? [
          { t: "Mi PC", a: "Abrir ventana Mi PC", fn: () => openWindow("myComputer") },
          { t: "Papelera", a: "Abrir papelera", fn: () => openWindow("recycleBin") },
          { t: "Bloc de notas", a: "Aplicación", fn: () => openOverlay("notepad") },
        ].filter((x) => x.t.toLowerCase().includes(q.toLowerCase()))
      : [];

  return (
    <OverlayFrame
      overlayId={overlayId}
      title="Resultados de la búsqueda"
      footer={
        <div className="xp-overlay-actions">
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Cerrar
          </button>
        </div>
      }
    >
      <p style={{ marginTop: 0 }}>Buscar archivos o carpetas (demostración):</p>
      <input
        className="xp-search-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Escriba parte del nombre…"
      />
      {results.length === 0 && q.trim() ? (
        <p>No se encontraron elementos.</p>
      ) : (
        <ul className="xp-cp-list">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  r.fn();
                  closeOverlay(overlayId);
                }}
              >
                <strong>{r.t}</strong> — {r.a}
              </button>
            </li>
          ))}
        </ul>
      )}
    </OverlayFrame>
  );
}

function ControlPanelOverlay({ overlayId }) {
  const { closeOverlay, openOverlay, openWindow } = useDesktopActions();
  return (
    <OverlayFrame
      overlayId={overlayId}
      title="Panel de control"
      footer={
        <div className="xp-overlay-actions">
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Cerrar
          </button>
        </div>
      }
    >
      <p style={{ marginTop: 0 }}>Elija un elemento (demostración):</p>
      <ul className="xp-cp-list">
        <li>
          <button type="button" onClick={() => openOverlay("notepad")}>
            Abrir Bloc de notas
          </button>
        </li>
        <li>
          <button type="button" onClick={() => openOverlay("calc")}>
            Abrir Calculadora
          </button>
        </li>
        <li>
          <button type="button" onClick={() => openOverlay("paint")}>
            Abrir Paint
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              openWindow("myComputer");
              closeOverlay(overlayId);
            }}
          >
            Abrir Mi PC
          </button>
        </li>
      </ul>
    </OverlayFrame>
  );
}

function HelpOverlay({ overlayId }) {
  const { closeOverlay } = useDesktopActions();
  return (
    <OverlayFrame
      overlayId={overlayId}
      title="Ayuda y soporte técnico"
      footer={
        <div className="xp-overlay-actions">
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Aceptar
          </button>
        </div>
      }
    >
      <p style={{ marginTop: 0 }}>
        <strong>Portfolio Windows XP (React)</strong>
      </p>
      <p>
        Interfaz de demostración inspirada en Windows XP. Doble clic en iconos del escritorio,
        use el menú Inicio, los menús contextuales y las ventanas del Explorador.
      </p>
      <p style={{ color: "#555" }}>Bruno Bacchi — Full stack / AI Automation</p>
    </OverlayFrame>
  );
}

function MinesweeperOverlay({ overlayId }) {
  const { closeOverlay } = useDesktopActions();
  return (
    <OverlayFrame
      overlayId={overlayId}
      title="Buscaminas"
      dialogClassName="xp-overlay-dialog--wide"
      footer={
        <div className="xp-overlay-actions">
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Cerrar
          </button>
        </div>
      }
    >
      <MinesweeperGame />
    </OverlayFrame>
  );
}

function SolitaireOverlay({ overlayId }) {
  const { closeOverlay } = useDesktopActions();
  return (
    <OverlayFrame
      overlayId={overlayId}
      title="Solitario"
      dialogClassName="xp-overlay-dialog--wide"
      footer={
        <div className="xp-overlay-actions">
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Cerrar
          </button>
        </div>
      }
    >
      <SolitaireGame />
    </OverlayFrame>
  );
}

function DesktopPropsOverlay({ overlayId, payload }) {
  const { closeOverlay } = useDesktopActions();
  return (
    <OverlayFrame
      overlayId={overlayId}
      title="Propiedades de Pantalla"
      footer={
        <div className="xp-overlay-actions">
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Aceptar
          </button>
        </div>
      }
    >
      <p style={{ marginTop: 0 }}>
        <strong>Escritorio (demostración)</strong>
      </p>
      <p>Tema visual: Windows XP Luna (réplica en CSS/React).</p>
      <p>Iconos en el escritorio: {payload?.icons ?? "—"}</p>
      <p>Resolución del dispositivo: {payload?.resolution ?? "—"}</p>
    </OverlayFrame>
  );
}

function IconPropsOverlay({ overlayId, payload }) {
  const { closeOverlay } = useDesktopActions();
  const name = payload?.name ?? "Elemento";
  const id = payload?.id ?? "";
  return (
    <OverlayFrame
      overlayId={overlayId}
      title={`Propiedades: ${name}`}
      footer={
        <div className="xp-overlay-actions">
          <button
            type="button"
            className="xp-overlay-btn"
            onClick={() => closeOverlay(overlayId)}
          >
            Aceptar
          </button>
        </div>
      }
    >
      <p style={{ marginTop: 0 }}>
        <strong>{name}</strong>
      </p>
      <p>Tipo: acceso directo al explorador ({id}).</p>
      <p>Ubicación: escritorio del portfolio.</p>
    </OverlayFrame>
  );
}

function isProbablyImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const path = url.split("?")[0].toLowerCase();
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(path);
}

function CertificatePreviewOverlay({ overlayId, payload }) {
  const { closeOverlay } = useDesktopActions();
  const url = payload?.url ?? "";
  const title = payload?.title ? `Certificado — ${payload.title}` : "Certificado";
  const showImg = isProbablyImageUrl(url);

  return (
    <OverlayFrame
      overlayId={overlayId}
      title={title}
      dialogClassName="xp-overlay-dialog--wide"
      footer={
        <div className="xp-overlay-actions xp-overlay-actions--spread">
          <a
            className="xp-overlay-btn xp-overlay-btn--link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir en nueva pestaña
          </a>
          <button type="button" className="xp-overlay-btn" onClick={() => closeOverlay(overlayId)}>
            Cerrar
          </button>
        </div>
      }
    >
      <div className="xp-overlay-media-scroll">
        {showImg ? (
          <img src={url} alt="" className="xp-overlay-project-img" />
        ) : (
          <iframe title="Certificado" className="xp-overlay-cert-iframe" src={url} />
        )}
        {!showImg ? (
          <p className="xp-overlay-media-hint">
            Si no se ve el contenido (p. ej. sitios que bloquean iframe), use «Abrir en nueva pestaña».
          </p>
        ) : null}
      </div>
    </OverlayFrame>
  );
}

function ProjectImagesOverlay({ overlayId, payload }) {
  const { closeOverlay } = useDesktopActions();
  const title = payload?.title ? `Capturas — ${payload.title}` : "Capturas del proyecto";
  const u1 = (payload?.imageUrl1 || "").trim();
  const u2 = (payload?.imageUrl2 || "").trim();

  return (
    <OverlayFrame
      overlayId={overlayId}
      title={title}
      dialogClassName="xp-overlay-dialog--wide"
      footer={
        <div className="xp-overlay-actions">
          <button type="button" className="xp-overlay-btn" onClick={() => closeOverlay(overlayId)}>
            Cerrar
          </button>
        </div>
      }
    >
      <div className="xp-overlay-media-scroll">
        {u1 ? (
          <>
            <div className="xp-overlay-img-label">Imagen 1</div>
            <img src={u1} alt="" className="xp-overlay-project-img" />
          </>
        ) : null}
        {u2 ? (
          <>
            <div className="xp-overlay-img-label">Imagen 2</div>
            <img src={u2} alt="" className="xp-overlay-project-img" />
          </>
        ) : null}
        {!u1 && !u2 ? <p>No hay URLs de imagen configuradas.</p> : null}
      </div>
    </OverlayFrame>
  );
}

function OverlayForEntry({ entry }) {
  switch (entry.type) {
    case "notepad":
      return <NotepadOverlay overlayId={entry.id} payload={entry.payload} />;
    case "calc":
      return <CalculatorOverlay overlayId={entry.id} />;
    case "paint":
      return <PaintOverlay overlayId={entry.id} />;
    case "search":
      return <SearchOverlay overlayId={entry.id} />;
    case "controlpanel":
      return <ControlPanelOverlay overlayId={entry.id} />;
    case "help":
      return <HelpOverlay overlayId={entry.id} />;
    case "minesweeper":
      return <MinesweeperOverlay overlayId={entry.id} />;
    case "solitaire":
      return <SolitaireOverlay overlayId={entry.id} />;
    case "desktopprops":
      return <DesktopPropsOverlay overlayId={entry.id} payload={entry.payload} />;
    case "iconprops":
      return <IconPropsOverlay overlayId={entry.id} payload={entry.payload} />;
    case "certificatePreview":
      return (
        <CertificatePreviewOverlay overlayId={entry.id} payload={entry.payload} />
      );
    case "projectImages":
      return <ProjectImagesOverlay overlayId={entry.id} payload={entry.payload} />;
    default:
      return null;
  }
}

export default function DesktopOverlays() {
  const { overlays } = useDesktopActions();
  if (!overlays.length) return null;

  return (
    <>
      {overlays.map((entry, i) => (
        <div
          key={entry.id}
          className="xp-overlay-stack-layer"
          style={{ zIndex: 25000 + i }}
        >
          <OverlayForEntry entry={entry} />
        </div>
      ))}
    </>
  );
}
