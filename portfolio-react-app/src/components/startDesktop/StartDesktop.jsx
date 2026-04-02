import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import IconList from "./IconList";
import TaskBar from "./taskbar/TaskBar";
import ContextMenu from "./contextMenu/ContextMenu";
import WindowComponent from "./window/WindowComponent";
import ExplorerView from "./window/ExplorerView";
import DesktopOverlays from "./DesktopOverlays";
import { DesktopActionsContext } from "./context/DesktopActionsContext";
import { EXPLORER_PATHS, DEFAULT_EXPLORER_PATH } from "./context/explorerFs";
import myComputerIcon from "../../assets/mycomputer.png";
import recycleBinIcon from "../../assets/recyclebin.png";
import "./StartDesktop.css";

const LS_ICONS = "xp-portfolio-icon-positions";

const defaultPositions = () => ({
  myComputer: { x: 16, y: 16 },
  recycleBin: { x: 16, y: 120 },
});

function loadPositions() {
  try {
    const raw = localStorage.getItem(LS_ICONS);
    if (!raw) return defaultPositions();
    const parsed = JSON.parse(raw);
    return { ...defaultPositions(), ...parsed };
  } catch {
    return defaultPositions();
  }
}

const createWinState = (x, y, w, h) => ({
  running: false,
  minimized: false,
  maximized: false,
  x,
  y,
  w,
  h,
  z: 100,
  restore: null,
});

const WIN_META = {
  myComputer: { title: "Mi PC", icon: myComputerIcon },
  recycleBin: { title: "Papelera", icon: recycleBinIcon },
};

const WINDOW_RESTORE_DEFAULTS = {
  myComputer: { x: 48, y: 36, w: 560, h: 440 },
  recycleBin: { x: 72, y: 64, w: 520, h: 400 },
};

const defaultExplorerNav = () => ({
  myComputer: { path: DEFAULT_EXPLORER_PATH, past: [], future: [] },
  recycleBin: { path: "bin", past: [], future: [] },
});

const StartDesktop = () => {
  const desktopRef = useRef(null);
  const [iconPositions, setIconPositions] = useState(loadPositions);
  const [, setRefreshTick] = useState(0);
  const [ctx, setCtx] = useState({
    open: false,
    x: 0,
    y: 0,
    items: [],
  });

  const [windows, setWindows] = useState({
    myComputer: createWinState(48, 36, 560, 440),
    recycleBin: createWinState(72, 64, 520, 400),
  });

  const [focusedWinId, setFocusedWinId] = useState(null);
  const [explorerNav, setExplorerNav] = useState(defaultExplorerNav);
  const [trashItems, setTrashItems] = useState([]);
  const [overlays, setOverlays] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_ICONS, JSON.stringify(iconPositions));
    } catch {
      /* ignore */
    }
  }, [iconPositions]);

  const bringToFront = useCallback((id) => {
    setWindows((prev) => {
      const maxZ = Math.max(100, ...Object.values(prev).map((w) => w.z));
      return { ...prev, [id]: { ...prev[id], z: maxZ + 1 } };
    });
    setFocusedWinId(id);
  }, []);

  const openWindow = useCallback(
    (winId) => {
      setWindows((prev) => ({
        ...prev,
        [winId]: { ...prev[winId], running: true, minimized: false },
      }));
      bringToFront(winId);
    },
    [bringToFront]
  );

  const openWindowFromIcon = useCallback(
    (winId) => {
      if (winId === "myComputer") {
        setExplorerNav((prev) => ({
          ...prev,
          myComputer: { path: DEFAULT_EXPLORER_PATH, past: [], future: [] },
        }));
      }
      openWindow(winId);
    },
    [openWindow]
  );

  const closeWindow = useCallback((winId) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: {
        ...prev[winId],
        running: false,
        minimized: false,
        maximized: false,
        restore: null,
      },
    }));
    setFocusedWinId((cur) => (cur === winId ? null : cur));
  }, []);

  const minimizeWindow = useCallback((winId) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: { ...prev[winId], minimized: true },
    }));
  }, []);

  const toggleMaximize = useCallback((winId) => {
    setWindows((prev) => {
      const w = prev[winId];
      if (w.maximized) {
        const r = w.restore || WINDOW_RESTORE_DEFAULTS[winId];
        return {
          ...prev,
          [winId]: {
            ...w,
            maximized: false,
            x: r.x,
            y: r.y,
            w: r.w,
            h: r.h,
            restore: null,
          },
        };
      }
      return {
        ...prev,
        [winId]: {
          ...w,
          maximized: true,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
        },
      };
    });
  }, []);

  const moveWindow = useCallback((winId, x, y) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: { ...prev[winId], x, y },
    }));
  }, []);

  const onTaskbarWindowClick = useCallback(
    (winId) => {
      setWindows((prev) => {
        const w = prev[winId];
        if (!w.running) return prev;
        if (w.minimized) {
          return { ...prev, [winId]: { ...w, minimized: false } };
        }
        return prev;
      });
      bringToFront(winId);
    },
    [bringToFront]
  );

  const navigateExplorer = useCallback((winId, targetPath) => {
    if (winId === "recycleBin" || !EXPLORER_PATHS[targetPath]) return;
    setExplorerNav((prev) => {
      const cur = prev[winId];
      return {
        ...prev,
        [winId]: {
          path: targetPath,
          past: [...cur.past, cur.path],
          future: [],
        },
      };
    });
  }, []);

  const explorerBack = useCallback((winId) => {
    if (winId === "recycleBin") return;
    setExplorerNav((prev) => {
      const cur = prev[winId];
      if (!cur.past.length) return prev;
      const prevPath = cur.past[cur.past.length - 1];
      return {
        ...prev,
        [winId]: {
          path: prevPath,
          past: cur.past.slice(0, -1),
          future: [cur.path, ...cur.future],
        },
      };
    });
  }, []);

  const explorerForward = useCallback((winId) => {
    if (winId === "recycleBin") return;
    setExplorerNav((prev) => {
      const cur = prev[winId];
      if (!cur.future.length) return prev;
      const next = cur.future[0];
      return {
        ...prev,
        [winId]: {
          path: next,
          past: [...cur.past, cur.path],
          future: cur.future.slice(1),
        },
      };
    });
  }, []);

  const explorerUp = useCallback((winId) => {
    if (winId === "recycleBin") return;
    setExplorerNav((prev) => {
      const cur = prev[winId];
      const node = EXPLORER_PATHS[cur.path];
      if (!node?.parent) return prev;
      return {
        ...prev,
        [winId]: {
          path: node.parent,
          past: [...cur.past, cur.path],
          future: [],
        },
      };
    });
  }, []);

  const openExplorerAt = useCallback(
    (winId, pathKey) => {
      if (!EXPLORER_PATHS[pathKey]) return;
      setExplorerNav((prev) => ({
        ...prev,
        [winId]: { path: pathKey, past: [], future: [] },
      }));
      if (winId === "myComputer") {
        setWindows((p) => ({
          ...p,
          myComputer: { ...p.myComputer, running: true, minimized: false },
        }));
        bringToFront("myComputer");
      }
    },
    [bringToFront]
  );

  const openMyDocuments = useCallback(() => {
    setExplorerNav((prev) => ({
      ...prev,
      myComputer: { path: "documents", past: [], future: [] },
    }));
    openWindow("myComputer");
  }, [openWindow]);

  const emptyTrash = useCallback(() => {
    setTrashItems([]);
  }, []);

  const removeTrashByIds = useCallback((ids) => {
    setTrashItems((prev) => prev.filter((t) => !ids.includes(t.id)));
  }, []);

  const sendToTrash = useCallback((item) => {
    setTrashItems((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: item.name,
        type: item.type,
        size: item.size || "",
        date: item.date || new Date().toLocaleString("es-ES"),
      },
    ]);
  }, []);

  const openOverlay = useCallback((arg) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ov-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const entry =
      typeof arg === "string" ? { id, type: arg } : { ...arg, id };
    setOverlays((prev) => [...prev, entry]);
  }, []);

  const closeOverlay = useCallback((overlayId) => {
    setOverlays((prev) => prev.filter((o) => o.id !== overlayId));
  }, []);

  const runCommand = useCallback(
    (raw) => {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;
      if (cmd === "explorer" || cmd === "explorer.exe") {
        openWindow("myComputer");
        return;
      }
      if (cmd.startsWith("notepad")) {
        openOverlay("notepad");
        return;
      }
      if (cmd.startsWith("calc")) {
        openOverlay("calc");
        return;
      }
      if (cmd === "cmd" || cmd === "cmd.exe") {
        window.alert("Símbolo del sistema (demostración).\nNo hay consola real en el navegador.");
        return;
      }
      if (cmd === "mspaint" || cmd === "paint") {
        openOverlay("paint");
        return;
      }
      window.alert(
        `No se reconoce "${raw}" como comando interno o externo (demostración).\nPruebe: explorer, notepad, calc, mspaint, cmd.`
      );
    },
    [openWindow, openOverlay]
  );

  const refreshDesktop = useCallback(() => setRefreshTick((n) => n + 1), []);

  const arrangeColumn = useCallback((orderedIds) => {
    setIconPositions((prev) => {
      const next = { ...prev };
      const step = 96;
      orderedIds.forEach((key, i) => {
        if (next[key]) next[key] = { x: 16, y: 16 + i * step };
      });
      return next;
    });
  }, []);

  const desktopActionsValue = useMemo(
    () => ({
      openWindow,
      openWindowFromIcon,
      closeWindow,
      minimizeWindow,
      toggleMaximize,
      moveWindow,
      bringToFront,
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
      overlays,
      openOverlay,
      closeOverlay,
      runCommand,
      refreshDesktop,
    }),
    [
      openWindow,
      openWindowFromIcon,
      closeWindow,
      minimizeWindow,
      toggleMaximize,
      moveWindow,
      bringToFront,
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
      overlays,
      openOverlay,
      closeOverlay,
      runCommand,
      refreshDesktop,
    ]
  );

  const desktopMenuItems = useMemo(
    () => [
      {
        label: "Organizar iconos",
        submenu: [
          {
            label: "Por nombre",
            onClick: () => {
              const order = ["myComputer", "recycleBin"].sort((a, b) => {
                const labels = { myComputer: "Mi PC", recycleBin: "Papelera" };
                return labels[a].localeCompare(labels[b], "es");
              });
              arrangeColumn(order);
            },
          },
          {
            label: "Por tipo",
            onClick: () => {
              const order = ["recycleBin", "myComputer"];
              arrangeColumn(order);
            },
          },
          { label: "Mostrar iconos de red", disabled: true },
        ],
      },
      { type: "separator" },
      {
        label: "Actualizar",
        onClick: refreshDesktop,
      },
      {
        label: "Pegar",
        onClick: () =>
          window.alert(
            "El portapapeles está vacío.\n(Demostración: no hay portapapeles real entre ventanas.)"
          ),
      },
      { type: "separator" },
      {
        label: "Propiedades del menú Inicio",
        onClick: () =>
          window.alert(
            "Propiedades del menú Inicio\n\nPuede personalizar el menú Inicio desde aquí en un sistema real. En este portfolio es solo una réplica visual."
          ),
      },
      {
        label: "Propiedades",
        onClick: () =>
          openOverlay({
            type: "desktopprops",
            payload: {
              icons: 2,
              resolution: `${window.screen.width} × ${window.screen.height}`,
            },
          }),
      },
    ],
    [arrangeColumn, refreshDesktop, openOverlay]
  );

  const closeCtx = useCallback(() => {
    setCtx((c) => ({ ...c, open: false }));
  }, []);

  const handleDesktopContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      setCtx({
        open: true,
        x: e.clientX,
        y: e.clientY,
        items: desktopMenuItems,
      });
    },
    [desktopMenuItems]
  );

  const handleIconContextMenu = useCallback(
    (e, { id, name }) => {
      const items = [
        { label: "Abrir", onClick: () => openWindowFromIcon(id) },
        ...(id === "myComputer"
          ? [{ label: "Explorar", onClick: () => openWindowFromIcon(id) }]
          : []),
        { type: "separator" },
        {
          label: "Crear acceso directo",
          onClick: () =>
            window.alert(`Se crearía un acceso directo a "${name}" (demostración).`),
        },
        { label: "Eliminar", disabled: true },
        { label: "Cambiar nombre", disabled: true },
        { type: "separator" },
        {
          label: "Propiedades",
          onClick: () =>
            openOverlay({
              type: "iconprops",
              payload: { name, id },
            }),
        },
      ];
      setCtx({
        open: true,
        x: e.clientX,
        y: e.clientY,
        items,
      });
    },
    [openWindowFromIcon, openOverlay]
  );

  const onPositionChange = useCallback((id, x, y) => {
    setIconPositions((p) => ({ ...p, [id]: { x, y } }));
  }, []);

  const taskbarWindows = useMemo(
    () =>
      Object.keys(WIN_META)
        .filter((id) => windows[id].running)
        .map((id) => ({
          id,
          title: WIN_META[id].title,
          icon: WIN_META[id].icon,
          minimized: windows[id].minimized,
        })),
    [windows]
  );

  const windowIds = Object.keys(WIN_META);

  return (
    <DesktopActionsContext.Provider value={desktopActionsValue}>
      <div
        ref={desktopRef}
        className="desktop"
        onContextMenu={handleDesktopContextMenu}
      >
        <IconList
          desktopRef={desktopRef}
          positions={iconPositions}
          onPositionChange={onPositionChange}
          onOpenWindow={openWindowFromIcon}
          onIconContextMenu={handleIconContextMenu}
        />
        {windowIds.map((winId) => {
          const cfg = WIN_META[winId];
          const st = windows[winId];
          const stateForChild = {
            running: st.running,
            minimized: st.minimized,
            maximized: st.maximized,
            x: st.x,
            y: st.y,
            w: st.w,
            h: st.h,
            z: st.z,
          };
          return (
            <WindowComponent
              key={winId}
              winId={winId}
              title={cfg.title}
              layout="explorer"
              content={<ExplorerView variant={winId} />}
              iconSrc={cfg.icon}
              state={stateForChild}
              isActive={focusedWinId === winId}
              desktopRef={desktopRef}
              onFocus={() => bringToFront(winId)}
              onClose={closeWindow}
              onMinimize={minimizeWindow}
              onToggleMaximize={toggleMaximize}
              onMove={moveWindow}
            />
          );
        })}
      </div>
      <TaskBar
        taskbarWindows={taskbarWindows}
        activeTaskId={focusedWinId}
        onTaskbarWindowClick={onTaskbarWindowClick}
      />
      <ContextMenu
        open={ctx.open}
        x={ctx.x}
        y={ctx.y}
        items={ctx.items}
        onClose={closeCtx}
      />
      <DesktopOverlays />
    </DesktopActionsContext.Provider>
  );
};

export default StartDesktop;
