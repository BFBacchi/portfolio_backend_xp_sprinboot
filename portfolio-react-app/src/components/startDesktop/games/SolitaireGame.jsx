import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./solitaire.css";

const SUITS = ["S", "H", "D", "C"];
const SUIT_SYM = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RANK_LABEL = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck() {
  const deck = [];
  for (const s of SUITS) {
    for (let r = 1; r <= 13; r++) deck.push({ suit: s, rank: r });
  }
  return shuffle(deck);
}

function initialDeal() {
  const deck = createDeck();
  const tableau = [];
  let i = 0;
  for (let col = 0; col < 7; col++) {
    const hidden = [];
    const visible = [];
    for (let row = 0; row < col; row++) hidden.push(deck[i++]);
    visible.push(deck[i++]);
    tableau.push({ hidden, visible });
  }
  return {
    tableau,
    stock: deck.slice(i),
    waste: [],
    foundations: [[], [], [], []],
  };
}

function isRed(suit) {
  return suit === "H" || suit === "D";
}

function canTableau(targetTop, card) {
  if (!targetTop) return card.rank === 13;
  return targetTop.rank === card.rank + 1 && isRed(targetTop.suit) !== isRed(card.suit);
}

function foundationIdx(suit) {
  return SUITS.indexOf(suit);
}

function canFoundation(pile, card) {
  if (pile.length === 0) return card.rank === 1;
  const top = pile[pile.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

/** Secuencia visible de abajo a arriba: cada carta encaja sobre la anterior */
function isValidTableauRun(stack) {
  for (let i = 0; i < stack.length - 1; i++) {
    const a = stack[i];
    const b = stack[i + 1];
    if (a.rank !== b.rank + 1 || isRed(a.suit) === isRed(b.suit)) return false;
  }
  return stack.length > 0;
}

function removeStackFromTableau(tabCol, startIdx) {
  const t = { ...tabCol, visible: [...tabCol.visible], hidden: [...tabCol.hidden] };
  t.visible = t.visible.slice(0, startIdx);
  if (t.visible.length === 0 && t.hidden.length > 0) {
    t.visible.push(t.hidden.pop());
  }
  return t;
}

function canDropOnTableau(g, payload, toCol) {
  if (!payload) return false;
  const to = g.tableau[toCol];
  const targetTop = to.visible.length ? to.visible[to.visible.length - 1] : null;
  if (payload.source === "waste") {
    if (!g.waste.length) return false;
    return canTableau(targetTop, g.waste[g.waste.length - 1]);
  }
  if (payload.source === "tableau") {
    const { col: fromCol, from: startIdx } = payload;
    if (fromCol === toCol) return false;
    const from = g.tableau[fromCol];
    const stack = from.visible.slice(startIdx);
    if (!isValidTableauRun(stack)) return false;
    return canTableau(targetTop, stack[0]);
  }
  return false;
}

function canDropOnFoundation(g, payload, fi) {
  if (!payload) return false;
  if (payload.source === "waste") {
    if (!g.waste.length) return false;
    const card = g.waste[g.waste.length - 1];
    if (foundationIdx(card.suit) !== fi) return false;
    return canFoundation(g.foundations[fi], card);
  }
  if (payload.source === "tableau") {
    const { col: fromCol, from: startIdx } = payload;
    const from = g.tableau[fromCol];
    if (startIdx !== from.visible.length - 1) return false;
    if (!from.visible.length) return false;
    const card = from.visible[from.visible.length - 1];
    if (foundationIdx(card.suit) !== fi) return false;
    return canFoundation(g.foundations[fi], card);
  }
  return false;
}

function applyDropOnTableau(g, payload, toCol) {
  const to = g.tableau[toCol];
  const targetTop = to.visible.length ? to.visible[to.visible.length - 1] : null;
  if (payload.source === "waste") {
    if (!g.waste.length) return null;
    const card = g.waste[g.waste.length - 1];
    if (!canTableau(targetTop, card)) return null;
    return {
      ...g,
      waste: g.waste.slice(0, -1),
      tableau: g.tableau.map((c, i) =>
        i === toCol ? { ...c, visible: [...c.visible, card] } : c
      ),
    };
  }
  if (payload.source === "tableau") {
    const { col: fromCol, from: startIdx } = payload;
    if (fromCol === toCol) return null;
    const from = g.tableau[fromCol];
    const stack = from.visible.slice(startIdx);
    if (!isValidTableauRun(stack) || !canTableau(targetTop, stack[0])) return null;
    const newFrom = removeStackFromTableau(from, startIdx);
    const newTo = { ...to, visible: [...to.visible, ...stack] };
    return {
      ...g,
      tableau: g.tableau.map((c, i) => {
        if (i === fromCol) return newFrom;
        if (i === toCol) return newTo;
        return c;
      }),
    };
  }
  return null;
}

function applyDropOnFoundation(g, payload, fi) {
  if (payload.source === "waste") {
    if (!g.waste.length) return null;
    const card = g.waste[g.waste.length - 1];
    if (foundationIdx(card.suit) !== fi) return null;
    const pile = g.foundations[fi];
    if (!canFoundation(pile, card)) return null;
    return {
      ...g,
      waste: g.waste.slice(0, -1),
      foundations: g.foundations.map((p, i) => (i === fi ? [...p, card] : p)),
    };
  }
  if (payload.source === "tableau") {
    const { col: fromCol, from: startIdx } = payload;
    const from = g.tableau[fromCol];
    if (startIdx !== from.visible.length - 1 || !from.visible.length) return null;
    const card = from.visible[from.visible.length - 1];
    if (foundationIdx(card.suit) !== fi) return null;
    const pile = g.foundations[fi];
    if (!canFoundation(pile, card)) return null;
    const newFrom = removeStackFromTableau(from, startIdx);
    return {
      ...g,
      tableau: g.tableau.map((c, i) => (i === fromCol ? newFrom : c)),
      foundations: g.foundations.map((p, i) => (i === fi ? [...p, card] : p)),
    };
  }
  return null;
}

function parseDragPayload(e) {
  const raw = e.dataTransfer?.getData("text/plain");
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (p.source === "waste") return p;
    if (p.source === "tableau" && typeof p.col === "number" && typeof p.from === "number") return p;
  } catch {
    /* ignore */
  }
  return null;
}

function CardFace({
  card,
  selected,
  onClick,
  onDoubleClick,
  as = "button",
  draggable,
  onDragStart,
  onDragEnd,
}) {
  const red = isRed(card.suit);
  const cls = `sol-card ${red ? "sol-card--red" : "sol-card--black"}${selected ? " sol-card--sel" : ""}${
    draggable ? " sol-card--draggable" : ""
  }`;
  const inner = (
    <>
      <span className="sol-card-rank">
        {RANK_LABEL[card.rank]}
        {SUIT_SYM[card.suit]}
      </span>
      <span className="sol-card-suit">{SUIT_SYM[card.suit]}</span>
    </>
  );
  const dragProps =
    draggable === true
      ? {
          draggable: true,
          onDragStart,
          onDragEnd,
        }
      : {};
  if (as === "div") {
    return (
      <div
        className={cls}
        onClick={onClick}
        onDoubleClick={(e) => {
          e.preventDefault();
          onDoubleClick?.();
        }}
        role="presentation"
        {...dragProps}
      >
        {inner}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      onDoubleClick={(e) => {
        e.preventDefault();
        onDoubleClick?.();
      }}
      {...dragProps}
    >
      {inner}
    </button>
  );
}

export default function SolitaireGame() {
  const [game, setGame] = useState(() => initialDeal());
  const [sel, setSel] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const gameRef = useRef(game);
  const dndPayloadRef = useRef(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const won = useMemo(
    () => game.foundations.every((p) => p.length === 13),
    [game.foundations]
  );

  const clearDnD = useCallback(() => {
    dndPayloadRef.current = null;
    setDragOver(null);
  }, []);

  const reset = useCallback(() => {
    setGame(initialDeal());
    setSel(null);
    clearDnD();
  }, [clearDnD]);

  const drawStock = useCallback(() => {
    setGame((g) => {
      if (g.stock.length === 0) {
        return { ...g, stock: [...g.waste].reverse(), waste: [] };
      }
      const n = Math.min(3, g.stock.length);
      const drawn = g.stock.slice(-n);
      const newStock = g.stock.slice(0, -n);
      return { ...g, stock: newStock, waste: [...g.waste, ...drawn] };
    });
    setSel(null);
    clearDnD();
  }, [clearDnD]);

  const moveWasteToFoundation = useCallback(() => {
    setGame((g) => {
      if (!g.waste.length) return g;
      const card = g.waste[g.waste.length - 1];
      const fi = foundationIdx(card.suit);
      return applyDropOnFoundation(g, { source: "waste" }, fi) ?? g;
    });
    setSel(null);
  }, []);

  const moveWasteToTableau = useCallback((col) => {
    setGame((g) => applyDropOnTableau(g, { source: "waste" }, col) ?? g);
    setSel(null);
  }, []);

  const moveTableauTopTo = useCallback((fromCol, toCol) => {
    setGame((g) => {
      const from = g.tableau[fromCol];
      if (!from.visible.length) return g;
      const startIdx = from.visible.length - 1;
      return applyDropOnTableau(g, { source: "tableau", col: fromCol, from: startIdx }, toCol) ?? g;
    });
    setSel(null);
  }, []);

  const moveTableauTopToFoundation = useCallback((fromCol) => {
    setGame((g) => {
      const from = g.tableau[fromCol];
      if (!from.visible.length) return g;
      const startIdx = from.visible.length - 1;
      const card = from.visible[startIdx];
      const fi = foundationIdx(card.suit);
      return applyDropOnFoundation(g, { source: "tableau", col: fromCol, from: startIdx }, fi) ?? g;
    });
    setSel(null);
  }, []);

  const onClickWaste = useCallback(() => {
    if (game.waste.length === 0) return;
    if (sel?.type === "waste") {
      setSel(null);
      return;
    }
    setSel({ type: "waste" });
  }, [game.waste.length, sel]);

  const onClickTableau = useCallback(
    (col) => {
      if (won) return;
      if (sel?.type === "waste") {
        moveWasteToTableau(col);
        return;
      }
      if (sel?.type === "tableau" && sel.col === col) {
        setSel(null);
        return;
      }
      if (sel?.type === "tableau" && sel.col !== col) {
        moveTableauTopTo(sel.col, col);
        return;
      }
      if (game.tableau[col].visible.length === 0) return;
      setSel({ type: "tableau", col });
    },
    [game.tableau, sel, moveWasteToTableau, moveTableauTopTo, won]
  );

  const onDoubleTableau = useCallback(
    (col) => {
      moveTableauTopToFoundation(col);
    },
    [moveTableauTopToFoundation]
  );

  const onClickFoundation = useCallback(
    (fi) => {
      if (sel?.type === "waste") {
        const card = game.waste[game.waste.length - 1];
        if (!card || foundationIdx(card.suit) !== fi) return;
        moveWasteToFoundation();
        return;
      }
      if (sel?.type === "tableau") {
        const col = sel.col;
        const from = game.tableau[col];
        if (from.visible.length === 0) return;
        const card = from.visible[from.visible.length - 1];
        if (foundationIdx(card.suit) !== fi) return;
        moveTableauTopToFoundation(col);
      }
    },
    [sel, game.waste, game.tableau, moveWasteToFoundation, moveTableauTopToFoundation]
  );

  const startDragPayload = useCallback((payload) => {
    dndPayloadRef.current = payload;
  }, []);

  const handleDragStart = useCallback(
    (e, payload) => {
      if (won) {
        e.preventDefault();
        return;
      }
      startDragPayload(payload);
      e.dataTransfer.setData("text/plain", JSON.stringify(payload));
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setDragImage(e.currentTarget, 20, 30);
      } catch {
        /* IE / algunos navegadores */
      }
    },
    [startDragPayload, won]
  );

  const handleDragEnd = useCallback(() => {
    clearDnD();
  }, [clearDnD]);

  const handleDragOverTableau = useCallback(
    (e, col) => {
      const p = dndPayloadRef.current;
      if (!p || !canDropOnTableau(gameRef.current, p, col)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOver((prev) => (prev?.kind === "tableau" && prev.col === col ? prev : { kind: "tableau", col }));
    },
    []
  );

  const handleDragOverFoundation = useCallback((e, fi) => {
    const p = dndPayloadRef.current;
    if (!p || !canDropOnFoundation(gameRef.current, p, fi)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver((prev) => (prev?.kind === "foundation" && prev.fi === fi ? prev : { kind: "foundation", fi }));
  }, []);

  const handleDragLeaveSlot = useCallback((e, kind, id) => {
    const related = e.relatedTarget;
    if (related && e.currentTarget.contains(related)) return;
    setDragOver((prev) => {
      if (!prev) return null;
      if (kind === "tableau" && prev.kind === "tableau" && prev.col === id) return null;
      if (kind === "foundation" && prev.kind === "foundation" && prev.fi === id) return null;
      return prev;
    });
  }, []);

  const handleDropTableau = useCallback(
    (e, col) => {
      e.preventDefault();
      const payload = parseDragPayload(e) ?? dndPayloadRef.current;
      clearDnD();
      setSel(null);
      if (!payload) return;
      setGame((g) => applyDropOnTableau(g, payload, col) ?? g);
    },
    [clearDnD]
  );

  const handleDropFoundation = useCallback(
    (e, fi) => {
      e.preventDefault();
      const payload = parseDragPayload(e) ?? dndPayloadRef.current;
      clearDnD();
      setSel(null);
      if (!payload) return;
      setGame((g) => applyDropOnFoundation(g, payload, fi) ?? g);
    },
    [clearDnD]
  );

  const wasteTop = game.waste.length ? game.waste[game.waste.length - 1] : null;

  return (
    <div className="sol-root">
      <div className="sol-toolbar">
        <button type="button" onClick={reset}>
          Repartir de nuevo
        </button>
        {won && <strong style={{ color: "#080" }}>¡Has ganado!</strong>}
      </div>
      <div className="sol-board">
        <div className="sol-row-top">
          <div className="sol-stock-pile">
            <button
              type="button"
              className={`sol-stock${game.stock.length === 0 && game.waste.length === 0 ? " sol-stock--empty" : ""}`}
              onClick={drawStock}
              aria-label="Mazo"
            >
              {game.stock.length > 0 ? "◆" : game.waste.length ? "↺" : ""}
            </button>
            <div
              className="sol-waste"
              onDragOver={(e) => {
                if (dndPayloadRef.current) e.preventDefault();
              }}
            >
              {wasteTop && (
                <CardFace
                  card={wasteTop}
                  selected={sel?.type === "waste"}
                  onClick={onClickWaste}
                  onDoubleClick={moveWasteToFoundation}
                  draggable={!won}
                  onDragStart={(e) => handleDragStart(e, { source: "waste" })}
                  onDragEnd={handleDragEnd}
                />
              )}
            </div>
          </div>
          <div className="sol-founds">
            {SUITS.map((s, fi) => {
              const pile = game.foundations[fi];
              const top = pile.length ? pile[pile.length - 1] : null;
              const isOver = dragOver?.kind === "foundation" && dragOver.fi === fi;
              return (
                <button
                  key={s}
                  type="button"
                  className={`sol-foundation-slot${isOver ? " sol-foundation-slot--over" : ""}`}
                  onClick={() => onClickFoundation(fi)}
                  aria-label={`Montón ${SUIT_SYM[s]}`}
                  onDragOver={(e) => handleDragOverFoundation(e, fi)}
                  onDragLeave={(e) => handleDragLeaveSlot(e, "foundation", fi)}
                  onDrop={(e) => handleDropFoundation(e, fi)}
                >
                  {top ? (
                    <CardFace
                      as="div"
                      card={top}
                      draggable={false}
                    />
                  ) : (
                    <div className="sol-slot sol-slot--empty sol-slot--foundation">
                      {SUIT_SYM[s]}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="sol-tableau">
          {game.tableau.map((col, ci) => {
            const hasCards = col.hidden.length + col.visible.length > 0;
            const isOver = dragOver?.kind === "tableau" && dragOver.col === ci;
            return (
              <div key={ci} className="sol-col">
                <div
                  className={`sol-slot${isOver ? " sol-slot--drop-over" : ""}`}
                  style={{ minHeight: Math.max(80, 20 + col.visible.length * 18) }}
                  onClick={() => onClickTableau(ci)}
                  role="presentation"
                  onDragOver={(e) => handleDragOverTableau(e, ci)}
                  onDragLeave={(e) => handleDragLeaveSlot(e, "tableau", ci)}
                  onDrop={(e) => handleDropTableau(e, ci)}
                >
                  {col.hidden.map((c, hi) => (
                    <div key={`h-${hi}`} className="sol-card sol-card--back" aria-hidden />
                  ))}
                  {col.visible.map((c, vi) => {
                    const isTop = vi === col.visible.length - 1;
                    const tail = col.visible.slice(vi);
                    const canDrag = !won && isValidTableauRun(tail);
                    return (
                      <CardFace
                        key={`v-${vi}-${c.suit}-${c.rank}`}
                        card={c}
                        selected={sel?.type === "tableau" && sel.col === ci && isTop}
                        onClick={() => {
                          if (isTop) onClickTableau(ci);
                        }}
                        onDoubleClick={isTop ? () => onDoubleTableau(ci) : undefined}
                        draggable={canDrag}
                        onDragStart={(e) =>
                          handleDragStart(e, { source: "tableau", col: ci, from: vi })
                        }
                        onDragEnd={handleDragEnd}
                      />
                    );
                  })}
                  {!hasCards && (
                    <div className="sol-slot sol-slot--empty" style={{ width: 48, minHeight: 64 }}>
                      K
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="sol-help">
        Arrastra cartas al tablero o a los montones de palo (♠♥♦♣). Puedes mover varias cartas a la vez si
        forman secuencia válida. Clic + clic sigue funcionando. Doble clic en la carta superior de una columna
        la envía al palo si se puede. Mazo: saca 3 cartas (clic en el mazo).
      </p>
    </div>
  );
}
