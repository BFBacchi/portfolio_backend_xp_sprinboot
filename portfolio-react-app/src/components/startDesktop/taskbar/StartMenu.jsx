import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useDesktopActions } from "../context/DesktopActionsContext";
import XpMessageBox from "../xpMessageBox/XpMessageBox.jsx";

const TASKBAR_H = 34;

function createStartMenuItems({
  navigate,
  openOverlay,
  openMyDocuments,
  openExplorerAt,
  runCommand,
  openWindow,
  isAuthenticated,
}) {
  const accesoriosSub = [
    { label: "Bloc de notas", onClick: () => openOverlay("notepad") },
    { label: "Calculadora", onClick: () => openOverlay("calc") },
    { label: "Paint", onClick: () => openOverlay("paint") },
  ];
  if (isAuthenticated) {
    accesoriosSub.push({ type: "separator" });
    accesoriosSub.push({
      label: "Centro de edición (ventanas)",
      onClick: () => openWindow("adminHub"),
    });
    accesoriosSub.push({
      label: "Editar: Sobre mí",
      onClick: () => openWindow("adminAbout"),
    });
    accesoriosSub.push({
      label: "Editar: Proyectos",
      onClick: () => openWindow("adminProjects"),
    });
    accesoriosSub.push({
      label: "Editar: Educación",
      onClick: () => openWindow("adminEducation"),
    });
    accesoriosSub.push({
      label: "Editar: Habilidades",
      onClick: () => openWindow("adminSkills"),
    });
    accesoriosSub.push({
      label: "Editar: Experiencia laboral",
      onClick: () => openWindow("adminWork"),
    });
  }
  accesoriosSub.push({ type: "separator" });
  accesoriosSub.push({
    label: "Estudio del portfolio (web)",
    onClick: () => navigate("/welcome"),
  });

  return [
    {
      label: "Todos los programas",
      submenu: [
        {
          label: "Accesorios",
          submenu: accesoriosSub,
        },
        { type: "separator" },
        {
          label: "Inicio",
          submenu: [{ label: "Inicio (vacío)", disabled: true }],
        },
        {
          label: "Juegos",
          submenu: [
            { label: "Buscaminas", onClick: () => openOverlay("minesweeper") },
            { label: "Solitario", onClick: () => openOverlay("solitaire") },
          ],
        },
      ],
    },
    {
      label: "Documentos",
      submenu: [
        {
          label: "Mi portfolio (lectura)",
          onClick: () => openWindow("portfolioShowcase"),
        },
        { type: "separator" },
        { label: "Mi documentos", onClick: () => openMyDocuments() },
        {
          label: "Mis imágenes",
          onClick: () =>
            window.alert(
              "Mis imágenes (demostración).\nAbra Mi PC → Mis documentos para una carpeta similar."
            ),
        },
        { type: "separator" },
        {
          label: "Portfolio — carpeta",
          onClick: () => openExplorerAt("myComputer", "portfolio"),
        },
      ],
    },
    {
      label: "Configuración",
      submenu: [
        { label: "Panel de control", onClick: () => openOverlay("controlpanel") },
        { label: "Impresoras y faxes", disabled: true },
        { label: "Conexiones de red", disabled: true },
      ],
    },
    {
      label: "Buscar",
      submenu: [
        { label: "Archivos o carpetas…", onClick: () => openOverlay("search") },
        {
          label: "En Internet…",
          onClick: () =>
            window.alert("Búsqueda en Internet (demostración — sin navegador integrado)."),
        },
        { label: "Personas…", disabled: true },
      ],
    },
    {
      label: "Ayuda y soporte técnico",
      onClick: () => openOverlay("help"),
    },
    {
      label: "Ejecutar…",
      onClick: () => {
        const cmd = window.prompt("Escriba el nombre del programa, carpeta o documento:", "explorer");
        if (cmd != null && cmd.trim()) runCommand(cmd.trim());
      },
    },
    { type: "separator" },
    { label: "Sincronizar", disabled: true },
  ];
}

function StartFlyout({ items, onPick }) {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <ul className="start-flyout" role="menu">
      {items.map((item, i) => {
        if (item.type === "separator") {
          return <li key={`fs-${i}`} className="start-flyout-sep" role="separator" />;
        }
        const hasSub = Array.isArray(item.submenu) && item.submenu.length > 0;
        const disabled = item.disabled;
        return (
          <li
            key={i}
            className={`start-flyout-item${disabled ? " start-flyout-item--disabled" : ""}${
              openIdx === i && hasSub ? " start-flyout-item--open" : ""
            }`}
            role="menuitem"
            onMouseEnter={() => (hasSub ? setOpenIdx(i) : setOpenIdx(null))}
            onClick={() => {
              if (disabled || hasSub) return;
              item.onClick?.();
              onPick();
            }}
          >
            <span>{item.label}</span>
            {hasSub && <span className="start-flyout-chev">▸</span>}
            {openIdx === i && hasSub && (
              <div className="start-flyout-nested">
                <StartFlyout items={item.submenu} onPick={onPick} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function StartRow({ item, onPick }) {
  const [open, setOpen] = useState(false);
  const hasSub = Array.isArray(item.submenu) && item.submenu.length > 0;
  const disabled = item.disabled;

  if (item.type === "separator") {
    return <div className="start-separator" role="separator" />;
  }

  return (
    <div
      className="start-row-wrap"
      onMouseLeave={() => setOpen(false)}
      onMouseEnter={() => {
        if (hasSub) setOpen(true);
      }}
    >
      <div
        className={`start-row${disabled ? " start-row--disabled" : ""}${
          open && hasSub ? " start-row--open" : ""
        }`}
        role="menuitem"
        onClick={() => {
          if (disabled || hasSub) return;
          item.onClick?.();
          onPick();
        }}
      >
        <span className="start-row-label">{item.label}</span>
        {hasSub && <span className="start-row-chev">▸</span>}
      </div>
      {hasSub && open && (
        <div className="start-row-flyout" role="presentation">
          <StartFlyout items={item.submenu} onPick={onPick} />
        </div>
      )}
    </div>
  );
}

const StartMenu = ({ open, onClose, anchorRef }) => {
  const rootRef = useRef(null);
  const [sysDialog, setSysDialog] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openOverlay, openMyDocuments, openExplorerAt, runCommand, openWindow } =
    useDesktopActions();

  const items = useMemo(
    () =>
      createStartMenuItems({
        navigate,
        openOverlay,
        openMyDocuments,
        openExplorerAt,
        runCommand,
        openWindow,
        isAuthenticated,
      }),
    [
      navigate,
      openOverlay,
      openMyDocuments,
      openExplorerAt,
      runCommand,
      openWindow,
      isAuthenticated,
    ]
  );

  useLayoutEffect(() => {
    if (!open || !rootRef.current || !anchorRef?.current) return;
    const btn = anchorRef.current.getBoundingClientRect();
    const menu = rootRef.current;
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let left = btn.left;
    const bottomGap = TASKBAR_H + 2;
    const bottom = window.innerHeight - bottomGap;
    let top = bottom - mh;
    if (top < 4) top = 4;
    if (left + mw > window.innerWidth - 8) {
      left = window.innerWidth - mw - 8;
    }
    left = Math.max(4, left);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return undefined;
    let detach = () => {};
    const timer = window.setTimeout(() => {
      const onDoc = (e) => {
        const t = e.target;
        if (
          rootRef.current?.contains(t) ||
          anchorRef?.current?.contains(t)
        ) {
          return;
        }
        onClose();
      };
      document.addEventListener("mousedown", onDoc, true);
      detach = () => document.removeEventListener("mousedown", onDoc, true);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      detach();
    };
  }, [open, onClose, anchorRef]);

  if (!open && !sysDialog) return null;

  const onPick = () => onClose();

  return (
    <>
      {open ? (
        <div
          id="start-menu-root"
          ref={rootRef}
          className="start-menu-xp"
          role="application"
          aria-label="Menú Inicio"
        >
          <div className="start-menu-xp-inner">
            <aside className="start-menu-xp-brand" aria-hidden="true">
              <span className="start-menu-xp-brand-text">xp</span>
            </aside>
            <div className="start-menu-xp-body">
              <header className="start-menu-xp-user">
                <div className="start-menu-xp-user-avatar" aria-hidden="true" />
                <div className="start-menu-xp-user-name">Bruno Bacchi</div>
              </header>
              <div className="start-menu-xp-list">
                {items.map((item, i) => (
                  <StartRow key={i} item={item} onPick={onPick} />
                ))}
              </div>
              <footer className="start-menu-xp-footer">
                <button
                  type="button"
                  className="start-menu-xp-foot-btn"
                  onClick={() => {
                    onClose();
                    setSysDialog("logoff");
                  }}
                >
                  <span className="start-menu-xp-foot-icon" aria-hidden="true" />
                  Cerrar sesión
                </button>
                <button
                  type="button"
                  className="start-menu-xp-foot-btn"
                  onClick={() => {
                    onClose();
                    setSysDialog("shutdown");
                  }}
                >
                  <span
                    className="start-menu-xp-foot-icon start-menu-xp-foot-icon--off"
                    aria-hidden="true"
                  />
                  Apagar el equipo
                </button>
              </footer>
            </div>
          </div>
        </div>
      ) : null}

      <XpMessageBox
        open={sysDialog === "logoff"}
        title="Cerrar sesión de Windows"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={() => {
          setSysDialog(null);
          navigate("/logoff");
        }}
        onCancel={() => setSysDialog(null)}
      >
        <p>¿Desea cerrar la sesión?</p>
        <p>Se guardará la configuración y volverá a la pantalla de bienvenida.</p>
      </XpMessageBox>

      <XpMessageBox
        open={sysDialog === "shutdown"}
        title="Apagar el equipo"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={() => {
          setSysDialog(null);
          navigate("/shutdown");
        }}
        onCancel={() => setSysDialog(null)}
      >
        <p>¿Desea apagar el equipo?</p>
        <p>Se cerrará el sistema de forma segura.</p>
      </XpMessageBox>
    </>
  );
};

export default StartMenu;
