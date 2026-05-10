import { describe, it, expect } from "vitest";
import {
  bfs,
  validateMaze,
  pathFromExit,
  memoryMatchStars,
  protectDataStars,
  spamBlasterStars,
  firewallStars,
  mazeStars,
} from "./maze-helpers";

const ROWS = 7;
const COLS = 9;

// Tiny 3×3 reachable grid: all open.
const OPEN_GRID_3x3 = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

// 3×3 with the bottom-right exit walled off on every approach.
const BLOCKED_EXIT_3x3 = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
];

describe("bfs", () => {
  it("returns distance 0 at the start cell", () => {
    const d = bfs(OPEN_GRID_3x3, 3, 3);
    expect(d[0][0]).toBe(0);
  });

  it("measures Manhattan-like distance through open cells", () => {
    const d = bfs(OPEN_GRID_3x3, 3, 3);
    // bottom-right of a 3x3 open grid is 4 steps from top-left
    expect(d[2][2]).toBe(4);
  });

  it("returns Infinity for unreachable cells", () => {
    const d = bfs(BLOCKED_EXIT_3x3, 3, 3);
    expect(d[2][2]).toBe(Infinity);
  });

  it("returns Infinity for the start cell if it is a wall", () => {
    const wallStart = [
      [1, 0],
      [0, 0],
    ];
    const d = bfs(wallStart, 2, 2);
    expect(d[0][0]).toBe(Infinity);
  });
});

describe("validateMaze", () => {
  it("leaves a reachable maze unchanged", () => {
    const before = OPEN_GRID_3x3.map((r) => r.slice());
    const { grid, dist } = validateMaze(before, 3, 3);
    expect(grid).toEqual(OPEN_GRID_3x3);
    expect(dist[2][2]).toBe(4);
  });

  it("forces a path when the exit would be unreachable", () => {
    const { grid, dist } = validateMaze(BLOCKED_EXIT_3x3, 3, 3);
    // Bottom row + right column should now be fully open
    for (let c = 0; c < 3; c++) expect(grid[2][c]).toBe(0);
    for (let r = 0; r < 3; r++) expect(grid[r][2]).toBe(0);
    expect(dist[2][2]).not.toBe(Infinity);
  });

  it("does not mutate the input grid", () => {
    const input = BLOCKED_EXIT_3x3.map((r) => r.slice());
    const snapshot = BLOCKED_EXIT_3x3.map((r) => r.slice());
    validateMaze(input, 3, 3);
    expect(input).toEqual(snapshot);
  });
});

describe("pathFromExit", () => {
  it("returns a start→exit ordered path for an open grid", () => {
    const { grid, dist } = validateMaze(OPEN_GRID_3x3, 3, 3);
    const path = pathFromExit(grid, dist, 3, 3);
    expect(path[0]).toEqual({ row: 0, col: 0 });
    expect(path[path.length - 1]).toEqual({ row: 2, col: 2 });
    // Every step should be a 1-cell move
    for (let i = 1; i < path.length; i++) {
      const d =
        Math.abs(path[i].row - path[i - 1].row) +
        Math.abs(path[i].col - path[i - 1].col);
      expect(d).toBe(1);
    }
  });

  it("returns [] if the exit is unreachable", () => {
    const unreachable = [
      [0, 1],
      [1, 0],
    ];
    const d = bfs(unreachable, 2, 2);
    const path = pathFromExit(unreachable, d, 2, 2);
    expect(path).toEqual([]);
  });
});

describe("real maze size validation (7×9)", () => {
  it("validates a fully-open maze and reaches the exit", () => {
    const open: number[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(0)
    );
    const { dist } = validateMaze(open, ROWS, COLS);
    expect(dist[ROWS - 1][COLS - 1]).toBe(ROWS - 1 + COLS - 1);
  });

  it("rescues a maze with the exit surrounded by walls", () => {
    const walled: number[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(0)
    );
    // Wall off the entire bottom row and right column from above
    for (let c = 0; c < COLS; c++) walled[ROWS - 2][c] = 1;
    for (let r = 0; r < ROWS; r++) walled[r][COLS - 2] = 1;
    // Plus the exit itself has to be reached somehow - the rescue opens it.
    const { dist } = validateMaze(walled, ROWS, COLS);
    expect(dist[ROWS - 1][COLS - 1]).not.toBe(Infinity);
  });
});

describe("scoring", () => {
  it("memoryMatchStars uses flip thresholds", () => {
    expect(memoryMatchStars(10)).toBe(3);
    expect(memoryMatchStars(14)).toBe(3);
    expect(memoryMatchStars(15)).toBe(2);
    expect(memoryMatchStars(20)).toBe(2);
    expect(memoryMatchStars(21)).toBe(1);
    expect(memoryMatchStars(99)).toBe(1);
  });

  it("protectDataStars rewards 10+ correct", () => {
    expect(protectDataStars(12)).toBe(3);
    expect(protectDataStars(10)).toBe(3);
    expect(protectDataStars(9)).toBe(2);
    expect(protectDataStars(8)).toBe(2);
    expect(protectDataStars(7)).toBe(1);
    expect(protectDataStars(0)).toBe(1);
  });

  it("spamBlasterStars penalises each virus", () => {
    expect(spamBlasterStars(0)).toBe(3);
    expect(spamBlasterStars(1)).toBe(2);
    expect(spamBlasterStars(2)).toBe(1);
    expect(spamBlasterStars(99)).toBe(1);
  });

  it("firewallStars requires a clean win for 3 stars", () => {
    expect(firewallStars(true, 15, 0)).toBe(3);
    expect(firewallStars(true, 15, 1)).toBe(2); // any virus drops you to 2
    expect(firewallStars(false, 12, 3)).toBe(2);
    expect(firewallStars(false, 8, 5)).toBe(1);
  });

  it("mazeStars rewards accuracy", () => {
    expect(mazeStars(0)).toBe(3);
    expect(mazeStars(1)).toBe(2);
    expect(mazeStars(2)).toBe(2);
    expect(mazeStars(3)).toBe(1);
  });
});
