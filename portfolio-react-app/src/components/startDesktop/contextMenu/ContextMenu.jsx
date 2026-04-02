import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import "./contextMenu.css";

function MenuBlock({ items, onSelect, depth = 0 }) {
  const [openIdx, setOpenIdx] = useState(null);
  const blockRef = useRef(null);

  const handleEnter = (i, hasSub) => {
    if (hasSub) setOpenIdx(i);
    else setOpenIdx(null);
  };

  return (
    <ul
      className="ctx-menu-block"
      ref={blockRef}
      role="menu"
      onMouseLeave={() => depth === 0 && setOpenIdx(null)}
    >
      {items.map((item, i) => {
        if (item.type === "separator") {
          return <li key={`s-${i}`} className="ctx-separator" role="separator" />;
        }
        const hasSub = Array.isArray(item.submenu) && item.submenu.length > 0;
        const disabled = item.disabled;
        return (
          <li
            key={i}
            className={`ctx-item${disabled ? " ctx-disabled" : ""}${
              openIdx === i && hasSub ? " ctx-open" : ""
            }`}
            role="menuitem"
            aria-disabled={disabled}
            onMouseEnter={() => handleEnter(i, hasSub)}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              if (hasSub) return;
              item.onClick?.();
              onSelect();
            }}
          >
            <span className="ctx-item-label">{item.label}</span>
            {hasSub && <span className="ctx-chevron">▸</span>}
            {openIdx === i && hasSub && (
              <div className="ctx-flyout">
                <MenuBlock
                  items={item.submenu}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const ContextMenu = ({ open, x, y, items, onClose }) => {
  const rootRef = useRef(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    let detach = () => {};
    const t = window.setTimeout(() => {
      const onDoc = (e) => {
        if (rootRef.current && !rootRef.current.contains(e.target)) {
          handleClose();
        }
      };
      const onKey = (e) => {
        if (e.key === "Escape") handleClose();
      };
      document.addEventListener("mousedown", onDoc, true);
      document.addEventListener("contextmenu", onDoc, true);
      document.addEventListener("keydown", onKey, true);
      detach = () => {
        document.removeEventListener("mousedown", onDoc, true);
        document.removeEventListener("contextmenu", onDoc, true);
        document.removeEventListener("keydown", onKey, true);
      };
    }, 0);
    return () => {
      window.clearTimeout(t);
      detach();
    };
  }, [open, handleClose]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const el = rootRef.current;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    let nx = x;
    let ny = y;
    if (nx + rect.width > window.innerWidth - pad) {
      nx = window.innerWidth - rect.width - pad;
    }
    if (ny + rect.height > window.innerHeight - pad) {
      ny = window.innerHeight - rect.height - pad;
    }
    nx = Math.max(pad, nx);
    ny = Math.max(pad, ny);
    el.style.left = `${nx}px`;
    el.style.top = `${ny}px`;
  }, [open, x, y, items]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className="ctx-menu-root"
      style={{ left: x, top: y }}
      role="presentation"
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuBlock items={items} onSelect={handleClose} depth={0} />
    </div>
  );
};

export default ContextMenu;
