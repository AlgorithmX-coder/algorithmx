// Pure grid/maze helpers — no React, no DOM. Kept in a separate file so they
// can be unit-tested without mounting the CyberMaze component.

export const MAZE_COLS = 9;
export const MAZE_ROWS = 7;

export interface Cell {
  row: number;
  col: number;
}

export function bfs(
  grid: number[][],
  rows = MAZE_ROWS,
  cols = MAZE_COLS
): number[][] {
  const dist: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(Infinity)
  );
  if (grid[0]?.[0] === 1) return dist;
  const q: Array<[number, number]> = [[0, 0]];
  dist[0][0] = 0;
  while (q.length) {
    const [r, c] = q.shift()!;
    const d = dist[r][c];
    const neigh: Array<[number, number]> = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    for (const [nr, nc] of neigh) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] !== 0) continue;
      if (dist[nr][nc] !== Infinity) continue;
      dist[nr][nc] = d + 1;
      q.push([nr, nc]);
    }
  }
  return dist;
}

/**
 * Ensure (0,0) → (rows-1, cols-1) is reachable. If the given grid has no
 * open path, rescue by opening the full perimeter (top + bottom rows +
 * left + right columns) — that always connects start to exit via the
 * outer frame regardless of interior walls. Returns the sanitised grid
 * and its BFS distances.
 */
export function validateMaze(
  src: number[][],
  rows = MAZE_ROWS,
  cols = MAZE_COLS
): { grid: number[][]; dist: number[][] } {
  const grid = src.map((row) => row.slice());
  let dist = bfs(grid, rows, cols);
  if (dist[rows - 1][cols - 1] === Infinity) {
    for (let c = 0; c < cols; c++) {
      grid[0][c] = 0;
      grid[rows - 1][c] = 0;
    }
    for (let r = 0; r < rows; r++) {
      grid[r][0] = 0;
      grid[r][cols - 1] = 0;
    }
    dist = bfs(grid, rows, cols);
  }
  return { grid, dist };
}

/**
 * Walk back from the exit to (0,0) via BFS distances. Returns cells in
 * start→exit order. Empty array if the exit isn't reachable.
 */
export function pathFromExit(
  grid: number[][],
  dist: number[][],
  rows = MAZE_ROWS,
  cols = MAZE_COLS
): Cell[] {
  const path: Cell[] = [];
  let r = rows - 1;
  let c = cols - 1;
  if (dist[r][c] === Infinity) return path;
  while (!(r === 0 && c === 0)) {
    path.push({ row: r, col: c });
    const d = dist[r][c];
    const neigh: Array<[number, number]> = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    let moved = false;
    for (const [nr, nc] of neigh) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] !== 0) continue;
      if (dist[nr][nc] === d - 1) {
        r = nr;
        c = nc;
        moved = true;
        break;
      }
    }
    if (!moved) break;
  }
  path.push({ row: 0, col: 0 });
  return path.reverse();
}

// ── Scoring helpers ────────────────────────────────────────────────

/** MemoryMatch: ≤14 flips = 3 stars, ≤20 = 2, more = 1. */
export function memoryMatchStars(flipCount: number): 1 | 2 | 3 {
  if (flipCount <= 14) return 3;
  if (flipCount <= 20) return 2;
  return 1;
}

/** ProtectTheData: ≥10 correct = 3, ≥8 = 2, else 1. */
export function protectDataStars(correct: number): 1 | 2 | 3 {
  if (correct >= 10) return 3;
  if (correct >= 8) return 2;
  return 1;
}

/** SpamBlaster: 0 viruses = 3, 1 = 2, 2+ = 1. */
export function spamBlasterStars(viruses: number): 1 | 2 | 3 {
  if (viruses === 0) return 3;
  if (viruses === 1) return 2;
  return 1;
}

/** FirewallBuilder: won with no viruses = 3, 12+ good = 2, else 1. */
export function firewallStars(
  won: boolean,
  goodLanded: number,
  badLanded: number
): 1 | 2 | 3 {
  if (won && badLanded === 0) return 3;
  if (goodLanded >= 12) return 2;
  return 1;
}

/** CyberMaze: 0 wrong = 3, 1-2 wrong = 2, else 1. */
export function mazeStars(wrongCount: number): 1 | 2 | 3 {
  if (wrongCount === 0) return 3;
  if (wrongCount <= 2) return 2;
  return 1;
}
