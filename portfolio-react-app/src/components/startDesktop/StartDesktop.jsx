import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "../../contexts/AuthContext.jsx";
import { PortfolioPublicProvider } from "../../contexts/PortfolioPublicContext.jsx";
import PortfolioShowcaseContent from "../portfolio/PortfolioShowcaseContent.jsx";
import AdminHubContent from "../portfolio/AdminHubContent.jsx";
import AdminAboutContent from "../portfolio/AdminAboutContent.jsx";
import AdminProjectsContent from "../portfolio/AdminProjectsContent.jsx";
import AdminEducationContent from "../portfolio/AdminEducationContent.jsx";
import AdminSkillsContent from "../portfolio/AdminSkillsContent.jsx";
import AdminWorkExperienceContent from "../portfolio/AdminWorkExperienceContent.jsx";
import "./StartDesktop.css";

const LS_ICONS = "xp-portfolio-icon-positions";

const defaultPositions = () => ({
  myComputer: { x: 16, y: 16 },
  recycleBin: { x: 16, y: 120 },
  portfolioStudio: { x: 16, y: 224 },
  portfolioViewer: { x: 16, y: 328 },
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
  portfolioShowcase: { title: "Mi portfolio", icon: myComputerIcon },
  adminHub: { title: "Edición del portfolio", icon: myComputerIcon },
  adminAbout: { title: "Sobre mí — edición", icon: myComputerIcon },
  adminProjects: { title: "Proyectos — edición", icon: myComputerIcon },
  adminEducation: { title: "Educación — edición", icon: myComputerIcon },
  adminSkills: { title: "Habilidades — edición", icon: myComputerIcon },
  adminWork: { title: "Experiencia laboral — edición", icon: myComputerIcon },
};

const WINDOW_RESTORE_DEFAULTS = {
  myComputer: { x: 48, y: 36, w: 560, h: 440 },
  recycleBin: { x: 72, y: 64, w: 520, h: 400 },
  portfolioShowcase: { x: 40, y: 28, w: 620, h: 520 },
  adminHub: { x: 72, y: 48, w: 360, h: 320 },
  adminAbout: { x: 88, y: 44, w: 520, h: 480 },
  adminProjects: { x: 100, y: 52, w: 560, h: 560 },
  adminEducation: { x: 112, y: 60, w: 520, h: 520 },
  adminSkills: { x: 124, y: 68, w: 480, h: 500 },
  adminWork: { x: 136, y: 76, w: 520, h: 520 },
};

const defaultExplorerNav = () => ({
  myComputer: { path: DEFAULT_EXPLORER_PATH, past: [], future: [] },
  recycleBin: { path: "bin", past: [], future: [] },
});

const StartDesktop = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isGuest } = useAuth();
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
    portfolioShowcase: createWinState(40, 28, 620, 520),
    adminHub: createWinState(72, 48, 360, 320),
    adminAbout: createWinState(88, 44, 520, 480),
    adminProjects: createWinState(100, 52, 560, 560),
    adminEducation: createWinState(112, 60, 520, 520),
    adminSkills: createWinState(124, 68, 480, 500),
    adminWork: createWinState(136, 76, 520, 520),
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

  useEffect(() => {
    if (!isAuthenticated && !isGuest) {
      navigate("/welcome", { replace: true });
    }
  }, [isAuthenticated, isGuest, navigate]);

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

  const handleOpenPortfolioStudio = useCallback(() => {
    if (isAuthenticated) openWindow("adminHub");
    else navigate("/welcome");
  }, [isAuthenticated, openWindow, navigate]);

  const handleOpenPortfolioViewer = useCallback(() => {
    openWindow("portfolioShowcase");
  }, [openWindow]);

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

  const resizeWindow = useCallback((winId, rect) => {
    setWindows((prev) => ({
      ...prev,
      [winId]: { ...prev[winId], x: rect.x, y: rect.y, w: rect.w, h: rect.h },
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
      resizeWindow,
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
      resizeWindow,
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
              const order = [
                "myComputer",
                "recycleBin",
                "portfolioStudio",
                "portfolioViewer",
              ].sort((a, b) => {
                const labels = {
                  myComputer: "Mi PC",
                  recycleBin: "Papelera",
                  portfolioStudio: "Estudio del portfolio",
                  portfolioViewer: "Mi portfolio",
                };
                return labels[a].localeCompare(labels[b], "es");
              });
              arrangeColumn(order);
            },
          },
          {
            label: "Por tipo",
            onClick: () => {
              const order = [
                "recycleBin",
                "myComputer",
                "portfolioStudio",
                "portfolioViewer",
              ];
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
              icons: 4,
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
        {
          label: "Abrir",
          onClick: () => {
            if (id === "portfolioStudio") handleOpenPortfolioStudio();
            else if (id === "portfolioViewer") handleOpenPortfolioViewer();
            else openWindowFromIcon(id);
          },
        },
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
    [openWindowFromIcon, openOverlay, handleOpenPortfolioStudio, handleOpenPortfolioViewer]
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

  const windowContentFor = (winId) => {
    if (winId === "myComputer") {
      return <ExplorerView variant="myComputer" />;
    }
    if (winId === "recycleBin") {
      return <ExplorerView variant="recycleBin" />;
    }
    if (winId === "portfolioShowcase") return <PortfolioShowcaseContent />;
    if (winId === "adminHub") return <AdminHubContent />;
    if (winId === "adminAbout") return <AdminAboutContent />;
    if (winId === "adminProjects") return <AdminProjectsContent />;
    if (winId === "adminEducation") return <AdminEducationContent />;
    if (winId === "adminSkills") return <AdminSkillsContent />;
    if (winId === "adminWork") return <AdminWorkExperienceContent />;
    return null;
  };

  return (
    <PortfolioPublicProvider>
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
          onOpenPortfolioStudio={handleOpenPortfolioStudio}
          onOpenPortfolioViewer={handleOpenPortfolioViewer}
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
          const explorer = winId === "myComputer" || winId === "recycleBin";
          return (
            <WindowComponent
              key={winId}
              winId={winId}
              title={cfg.title}
              layout={explorer ? "explorer" : "default"}
              content={windowContentFor(winId)}
              iconSrc={cfg.icon}
              state={stateForChild}
              isActive={focusedWinId === winId}
              desktopRef={desktopRef}
              onFocus={() => bringToFront(winId)}
              onClose={closeWindow}
              onMinimize={minimizeWindow}
              onToggleMaximize={toggleMaximize}
              onMove={moveWindow}
              onResize={resizeWindow}
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
    </PortfolioPublicProvider>
  );
};

export default StartDesktop;
