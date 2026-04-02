import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDesktopActions } from "../context/DesktopActionsContext";
import ContextMenu from "../contextMenu/ContextMenu";
import { EXPLORER_PATHS, DEFAULT_EXPLORER_PATH } from "../context/explorerFs";
import "./explorerView.css";

function MenuDrop({ label, open, onOpen, onClose, children }) {
  return (
    <div className="xp-ex-menu-wrap">
      <button
        type="button"
        className={`xp-ex-menu-top${open ? " xp-ex-menu-top--open" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          open ? onClose() : onOpen();
        }}
      >
        {label}
      </button>
      {open && (
        <div
          className="xp-ex-menu-dropdown"
          role="menu"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`xp-ex-drop-item${disabled ? " xp-ex-drop-item--disabled" : ""}`}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
    >
      {label}
    </button>
  );
}

function ToolBtn({ title, disabled, onClick, children }) {
  return (
    <button
      type="button"
      className="xp-ex-toolbtn"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function ExplorerView({ variant, windowId }) {
  const isBin = variant === "recycleBin";
  const {
    closeWindow,
    openWindow,
    explorerNav,
    navigateExplorer,
    explorerBack,
    explorerForward,
    explorerUp,
    openExplorerAt,
    openMyDocuments,
    trashItems,
    emptyTrash,
    removeTrashByIds,
    sendToTrash,
    openOverlay,
  } = useDesktopActions();

  const nav = explorerNav[windowId] || {
    path: isBin ? "bin" : DEFAULT_EXPLORER_PATH,
    past: [],
    future: [],
  };

  const node = !isBin ? EXPLORER_PATHS[nav.path] : null;
  const address = isBin ? "Papelera" : node?.address || "Mi PC";
  const listRows = useMemo(() => {
    if (isBin) {
      return trashItems.map((t) => ({
        ...t,
        key: t.id,
        isTrash: true,
      }));
    }
    return (node?.items || []).map((it, i) => ({ ...it, key: i, isTrash: false }));
  }, [isBin, node, trashItems]);

  const [openMenu, setOpenMenu] = useState(null);
  const [viewMode, setViewMode] = useState("details");
  const [showStatus, setShowStatus] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [addressEdit, setAddressEdit] = useState(address);
  const [rowCtx, setRowCtx] = useState({ open: false, x: 0, y: 0, items: [] });

  useEffect(() => {
    setAddressEdit(address);
  }, [address]);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const canBack = !isBin && nav.past.length > 0;
  const canForward = !isBin && nav.future.length > 0;
  const canUp = !isBin && node?.parent != null;

  const selectedItem = useMemo(() => {
    if (selectAll && listRows.length) return listRows[0];
    if (selectedKey == null) return null;
    return listRows.find((r) => r.key === selectedKey) || null;
  }, [listRows, selectedKey, selectAll]);

  const rowSelected = (row) => selectAll || selectedKey === row.key;

  const closeRowCtx = useCallback(() => setRowCtx((c) => ({ ...c, open: false })), []);

  const handleActivate = useCallback(
    (row) => {
      if (isBin) return;
      if (row.navigateTo) navigateExplorer(windowId, row.navigateTo);
      if (row.action === "notepad") openOverlay("notepad");
      if (row.action === "calc") openOverlay("calc");
    },
    [isBin, windowId, navigateExplorer, openOverlay]
  );

  const openRowMenu = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectAll(false);
      setSelectedKey(row.key);
      const items = isBin
        ? [
            {
              label: "Restaurar",
              onClick: () => {
                removeTrashByIds([row.id]);
                closeRowCtx();
              },
            },
            {
              label: "Eliminar",
              onClick: () => {
                removeTrashByIds([row.id]);
                closeRowCtx();
              },
            },
          ]
        : [
            {
              label: "Abrir",
              onClick: () => {
                handleActivate(row);
                closeRowCtx();
              },
            },
            { type: "separator" },
            {
              label: "Enviar a la papelera",
              onClick: () => {
                sendToTrash({
                  name: row.name,
                  type: row.type,
                  size: row.size || "",
                  date: row.date || "",
                });
                closeRowCtx();
              },
            },
            {
              label: "Propiedades",
              onClick: () => {
                window.alert(
                  `${row.name}\nTipo: ${row.type}\nDemostración del portfolio Windows XP.`
                );
                closeRowCtx();
              },
            },
          ];
      setRowCtx({ open: true, x: e.clientX, y: e.clientY, items });
    },
    [isBin, closeRowCtx, removeTrashByIds, sendToTrash, handleActivate]
  );

  const goAddress = () => {
    if (isBin) return;
    const key = addressEdit.trim();
    const map = {
      "mi pc": DEFAULT_EXPLORER_PATH,
      "c:": "c:",
      "c:\\": "c:",
      papelera: null,
    };
    const lower = key.toLowerCase();
    if (EXPLORER_PATHS[key]) {
      navigateExplorer(windowId, key);
      return;
    }
    if (map[lower] === null) {
      openWindow("recycleBin");
      return;
    }
    if (map[lower]) {
      navigateExplorer(windowId, map[lower]);
      return;
    }
    window.alert("No se encuentra la ruta (demostración). Pruebe: Mi PC, C:\\, Papelera.");
  };

  const menuArchivo = (
    <>
      <DropItem
        label="Cerrar"
        onClick={() => {
          closeWindow(windowId);
          setOpenMenu(null);
        }}
      />
    </>
  );

  const menuEdicion = (
    <>
      <DropItem
        label="Copiar"
        disabled={listRows.length === 0 || (!selectAll && selectedKey == null)}
        onClick={() => {
          const n = selectAll ? listRows.length : 1;
          const label = selectAll ? `${n} elementos` : selectedItem?.name || "";
          window.alert(`Copiado al portapapeles (simulado): ${label}`);
          setOpenMenu(null);
        }}
      />
      <DropItem
        label="Seleccionar todo"
        onClick={() => {
          if (listRows.length) {
            setSelectAll(true);
            setSelectedKey(null);
          }
          setOpenMenu(null);
        }}
      />
    </>
  );

  const menuVer = (
    <>
      <DropItem
        label={showStatus ? "Ocultar barra de estado" : "Mostrar barra de estado"}
        onClick={() => {
          setShowStatus((s) => !s);
          setOpenMenu(null);
        }}
      />
      <DropItem
        label="Iconos"
        onClick={() => {
          setViewMode("icons");
          setOpenMenu(null);
        }}
      />
      <DropItem
        label="Detalles"
        onClick={() => {
          setViewMode("details");
          setOpenMenu(null);
        }}
      />
    </>
  );

  const menuIr = (
    <>
      <DropItem
        label="Atrás"
        disabled={!canBack}
        onClick={() => {
          explorerBack(windowId);
          setOpenMenu(null);
        }}
      />
      <DropItem
        label="Adelante"
        disabled={!canForward}
        onClick={() => {
          explorerForward(windowId);
          setOpenMenu(null);
        }}
      />
      <DropItem
        label="Subir un nivel"
        disabled={!canUp}
        onClick={() => {
          explorerUp(windowId);
          setOpenMenu(null);
        }}
      />
      <DropItem
        label="Mi PC"
        onClick={() => {
          openExplorerAt("myComputer", DEFAULT_EXPLORER_PATH);
          setOpenMenu(null);
        }}
      />
    </>
  );

  const menuFav = (
    <DropItem
      label="Agregar a Favoritos…"
      onClick={() => {
        window.alert("Agregado a Favoritos (simulado).");
        setOpenMenu(null);
      }}
    />
  );

  const menuHerr = (
    <DropItem
      label="Opciones de carpeta…"
      onClick={() => {
        window.alert("Opciones de carpeta (demostración del portfolio).");
        setOpenMenu(null);
      }}
    />
  );

  const menuAyuda = (
    <DropItem
      label="Acerca del Explorador"
      onClick={() => {
        openOverlay("help");
        setOpenMenu(null);
      }}
    />
  );

  const barMenus = [
    { id: "Archivo", body: menuArchivo },
    { id: "Edición", body: menuEdicion },
    { id: "Ver", body: menuVer },
    { id: "Ir", body: menuIr },
    { id: "Favoritos", body: menuFav },
    { id: "Herramientas", body: menuHerr },
    { id: "Ayuda", body: menuAyuda },
  ];

  return (
    <div className="xp-explorer" onMouseDown={() => setOpenMenu(null)}>
      <div className="xp-ex-menubar" role="menubar" onMouseDown={(e) => e.stopPropagation()}>
        {barMenus.map((m) => (
          <MenuDrop
            key={m.id}
            label={m.id}
            open={openMenu === m.id}
            onOpen={() => setOpenMenu(m.id)}
            onClose={() => setOpenMenu(null)}
          >
            {m.body}
          </MenuDrop>
        ))}
      </div>

      <div className="xp-ex-toolbar">
        <div className="xp-ex-toolbar-inner">
          <ToolBtn title="Atrás" disabled={!canBack} onClick={() => explorerBack(windowId)}>
            <span className="xp-ex-ico xp-ex-ico--back" />
          </ToolBtn>
          <ToolBtn
            title="Adelante"
            disabled={!canForward}
            onClick={() => explorerForward(windowId)}
          >
            <span className="xp-ex-ico xp-ex-ico--fwd" />
          </ToolBtn>
          <ToolBtn title="Subir" disabled={!canUp} onClick={() => explorerUp(windowId)}>
            <span className="xp-ex-ico xp-ex-ico--up" />
          </ToolBtn>
          <span className="xp-ex-tb-sep" aria-hidden="true" />
          <ToolBtn title="Buscar" onClick={() => openOverlay("search")}>
            <span className="xp-ex-ico xp-ex-ico--search" />
          </ToolBtn>
          <ToolBtn
            title="Carpetas"
            onClick={() => window.alert("Panel de carpetas (no implementado en esta demo).")}
          >
            <span className="xp-ex-ico xp-ex-ico--folders" />
          </ToolBtn>
        </div>
      </div>

      <div className="xp-ex-address-row">
        <span className="xp-ex-address-label">Dirección</span>
        <input
          type="text"
          className="xp-ex-address-input"
          value={addressEdit}
          onChange={(e) => setAddressEdit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goAddress()}
        />
        <button type="button" className="xp-ex-go-btn" aria-label="Ir" onClick={goAddress}>
          Ir
        </button>
      </div>

      <div className="xp-ex-main">
        <aside className="xp-ex-sidebar">
          <div className="xp-ex-sideblock">
            <div className="xp-ex-sidehead">Tareas de carpeta</div>
            <div className="xp-ex-sidebody">
              {isBin ? (
                <>
                  <button
                    type="button"
                    className="xp-ex-side-link"
                    onClick={() => {
                      if (trashItems.length === 0) {
                        window.alert("La papelera ya está vacía.");
                        return;
                      }
                      if (window.confirm("¿Seguro que desea vaciar la papelera?")) emptyTrash();
                    }}
                  >
                    Vaciar la papelera
                  </button>
                  <button
                    type="button"
                    className="xp-ex-side-link"
                    onClick={() => {
                      if (selectAll && trashItems.length) {
                        removeTrashByIds(trashItems.map((t) => t.id));
                        setSelectAll(false);
                        return;
                      }
                      if (selectedKey == null || !selectedItem?.isTrash) {
                        window.alert("Seleccione uno o más elementos en la lista.");
                        return;
                      }
                      removeTrashByIds([selectedItem.id]);
                    }}
                  >
                    Quitar elementos de la papelera
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="xp-ex-side-link"
                    onClick={() => openOverlay("help")}
                  >
                    Ver información del sistema
                  </button>
                  <button
                    type="button"
                    className="xp-ex-side-link"
                    onClick={() => window.alert("Quitar equipo (solo demostración).")}
                  >
                    Quitar este equipo
                  </button>
                  <button
                    type="button"
                    className="xp-ex-side-link"
                    onClick={() => openOverlay("controlpanel")}
                  >
                    Agregar o quitar programas
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="xp-ex-sideblock">
            <div className="xp-ex-sidehead">Otros sitios</div>
            <div className="xp-ex-sidebody">
              <button
                type="button"
                className="xp-ex-side-link"
                onClick={() => openWindow("myComputer")}
              >
                Mi PC
              </button>
              <button type="button" className="xp-ex-side-link" onClick={() => openMyDocuments()}>
                Mis documentos
              </button>
              <button
                type="button"
                className="xp-ex-side-link"
                onClick={() => window.alert("Mis sitios de red (demostración).")}
              >
                Mis sitios de red
              </button>
              <button
                type="button"
                className="xp-ex-side-link"
                onClick={() => openWindow("recycleBin")}
              >
                Papelera de reciclaje
              </button>
            </div>
          </div>
          <div className="xp-ex-sideblock">
            <div className="xp-ex-sidehead">Detalles</div>
            <div className="xp-ex-sidebody xp-ex-details">
              {selectAll && listRows.length > 1
                ? `${listRows.length} elementos seleccionados.`
                : selectedItem
                  ? `${selectedItem.name}\n${selectedItem.type}${selectedItem.size ? ` · ${selectedItem.size}` : ""}`
                  : "Seleccione un elemento para ver una descripción de él."}
            </div>
          </div>
        </aside>

        <div className="xp-ex-list-wrap">
          {viewMode === "icons" ? (
            <div className="xp-ex-icons-view">
              {listRows.length === 0 ? (
                <div className="xp-ex-empty">{isBin ? "La papelera está vacía." : ""}</div>
              ) : (
                listRows.map((row) => (
                  <button
                    key={row.key}
                    type="button"
                    className={`xp-ex-icon-tile${rowSelected(row) ? " xp-ex-icon-tile--sel" : ""}`}
                    onClick={() => {
                      setSelectAll(false);
                      setSelectedKey(row.key);
                    }}
                    onDoubleClick={() => handleActivate(row)}
                    onContextMenu={(e) => openRowMenu(e, row)}
                  >
                    <span className={`xp-ex-tile-ico xp-ex-tile-ico--${row.icon || "folder"}`} />
                    <span className="xp-ex-tile-name">{row.name}</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="xp-ex-list-head">
                <span className="xp-ex-col xp-ex-col--name">Nombre</span>
                <span className="xp-ex-col xp-ex-col--size">Tamaño</span>
                <span className="xp-ex-col xp-ex-col--type">Tipo</span>
                <span className="xp-ex-col xp-ex-col--date">Fecha de modificación</span>
              </div>
              <div className="xp-ex-list-body" role="list">
                {listRows.length === 0 ? (
                  <div className="xp-ex-empty">{isBin ? "La papelera está vacía." : ""}</div>
                ) : (
                  listRows.map((row) => (
                    <div
                      key={row.key}
                      role="listitem"
                      className={`xp-ex-row${rowSelected(row) ? " xp-ex-row--sel" : ""}`}
                      onClick={() => {
                        setSelectAll(false);
                        setSelectedKey(row.key);
                      }}
                      onDoubleClick={() => handleActivate(row)}
                      onContextMenu={(e) => openRowMenu(e, row)}
                    >
                      <span className="xp-ex-col xp-ex-col--name">
                        <span
                          className={`xp-ex-row-ico xp-ex-row-ico--${row.icon || "folder"}`}
                          aria-hidden="true"
                        />
                        {row.name}
                      </span>
                      <span className="xp-ex-col xp-ex-col--size">{row.size || "—"}</span>
                      <span className="xp-ex-col xp-ex-col--type">{row.type}</span>
                      <span className="xp-ex-col xp-ex-col--date">{row.date || "—"}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showStatus && (
        <div className="xp-ex-statusbar">
          <span className="xp-ex-status-left">
            {isBin
              ? trashItems.length === 0
                ? "La papelera está vacía."
                : `${trashItems.length} elemento(s)`
              : `${listRows.length} objeto(s)`}
          </span>
          <span className="xp-ex-status-right">{isBin ? "Papelera" : "Mi PC"}</span>
        </div>
      )}

      <ContextMenu
        open={rowCtx.open}
        x={rowCtx.x}
        y={rowCtx.y}
        items={rowCtx.items}
        onClose={closeRowCtx}
      />
    </div>
  );
}
