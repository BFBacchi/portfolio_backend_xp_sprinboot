import React, { useCallback, useMemo, useState } from "react";
import "./minesweeper.css";

const ROWS = 9;
const COLS = 9;
const MINE_COUNT = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function neighbors(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push([nr, nc]);
    }
  }
  return out;
}

function buildField(safeR, safeC) {
  const mines = new Set();
  const positions = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r === safeR && c === safeC) continue;
      positions.push([r, c]);
    }
  }
  shuffle(positions)
    .slice(0, MINE_COUNT)
    .forEach(([r, c]) => mines.add(`${r},${c}`));

  const adjacent = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (mines.has(`${r},${c}`)) continue;
      let n = 0;
      neighbors(r, c).forEach(([nr, nc]) => {
        if (mines.has(`${nr},${nc}`)) n++;
      });
      adjacent[r][c] = n;
    }
  }
  return { mines, adjacent };
}

function revealBoard(mines, adjacent, revealed, r, c, flagged) {
  const next = revealed.map((row) => [...row]);
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue;
    if (next[cr][cc] || flagged[cr][cc]) continue;
    if (mines.has(`${cr},${cc}`)) continue;
    next[cr][cc] = true;
    if (adjacent[cr][cc] === 0) {
      neighbors(cr, cc).forEach(([nr, nc]) => {
        if (!next[nr][nc] && !flagged[nr][nc] && !mines.has(`${nr},${nc}`)) {
          stack.push([nr, nc]);
        }
      });
    }
  }
  return next;
}

export default function MinesweeperGame() {
  const [phase, setPhase] = useState("init");
  const [mines, setMines] = useState(null);
  const [adjacent, setAdjacent] = useState(null);
  const [revealed, setRevealed] = useState(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  );
  const [flagged, setFlagged] = useState(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  );
  const [dead, setDead] = useState(null);
  const [win, setWin] = useState(false);

  const flagsLeft = useMemo(() => {
    let f = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (flagged[r][c]) f++;
      }
    }
    return Math.max(0, MINE_COUNT - f);
  }, [flagged]);

  const checkWin = useCallback((rev, mineSet) => {
    let hidden = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!rev[r][c] && !mineSet.has(`${r},${c}`)) hidden++;
      }
    }
    return hidden === 0;
  }, []);

  const reset = useCallback(() => {
    setPhase("init");
    setMines(null);
    setAdjacent(null);
    setRevealed(Array.from({ length: ROWS }, () => Array(COLS).fill(false)));
    setFlagged(Array.from({ length: ROWS }, () => Array(COLS).fill(false)));
    setDead(null);
    setWin(false);
  }, []);

  const onCellClick = useCallback(
    (r, c, e) => {
      e.preventDefault();
      if (win || dead) return;
      if (e.button === 2 || e.ctrlKey) {
        if (phase === "init") return;
        if (revealed[r][c]) return;
        setFlagged((prev) => {
          const n = prev.map((row) => [...row]);
          n[r][c] = !n[r][c];
          return n;
        });
        return;
      }
      if (e.button !== 0) return;
      if (flagged[r][c]) return;

      if (phase === "init") {
        const field = buildField(r, c);
        setMines(field.mines);
        setAdjacent(field.adjacent);
        setPhase("play");
        const rev = revealBoard(field.mines, field.adjacent, revealed, r, c, flagged);
        setRevealed(rev);
        if (checkWin(rev, field.mines)) setWin(true);
        return;
      }

      if (revealed[r][c]) return;
      if (mines.has(`${r},${c}`)) {
        setDead([r, c]);
        const allRev = revealed.map((row) => [...row]);
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            if (mines.has(`${i},${j}`)) allRev[i][j] = true;
          }
        }
        setRevealed(allRev);
        return;
      }

      const rev = revealBoard(mines, adjacent, revealed, r, c, flagged);
      setRevealed(rev);
      if (checkWin(rev, mines)) setWin(true);
    },
    [phase, mines, adjacent, revealed, flagged, dead, win, checkWin]
  );

  const face = dead ? "😵" : win ? "😎" : "🙂";

  return (
    <div className="ms-root">
      <div className="ms-header">
        <div className="ms-counter" aria-live="polite">
          {String(flagsLeft).padStart(3, "0")}
        </div>
        <button type="button" className="ms-face" onClick={reset} aria-label="Nuevo juego">
          {face}
        </button>
        <div className="ms-counter">000</div>
      </div>
      <div
        className="ms-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 18px)` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const isRev = revealed[r][c];
            const isMine = mines?.has(`${r},${c}`);
            const isDead = dead && dead[0] === r && dead[1] === c;
            const n = adjacent?.[r]?.[c] ?? 0;
            const flag = flagged[r][c];
            let cls = "ms-cell";
            let content = null;
            if (isRev) {
              cls += " ms-cell--revealed";
              if (isMine) {
                cls += " ms-cell--mine";
                content = isDead ? "💥" : "●";
                if (isDead) cls += " ms-cell--hit";
              } else if (n > 0) {
                cls += ` ms-n${n}`;
                content = String(n);
              }
            } else if (flag) {
              cls += " ms-cell--flag";
            }
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className={cls}
                onMouseDown={(e) => onCellClick(r, c, e)}
                disabled={win || !!dead}
                aria-label={`celda ${r + 1} ${c + 1}`}
              >
                {content}
              </button>
            );
          })
        )}
      </div>
      <p className="ms-help">
        Clic izquierdo: revelar · Clic derecho (o Ctrl+clic): bandera · Principiante 9×9, 10 minas.
      </p>
    </div>
  );
}
