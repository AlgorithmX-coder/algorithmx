/* Desk Ready tokens. Single source: a hex or font stack appearing anywhere
 * else under app/desk-ready is a bug. Design: docs/desk-ready/design-system.md.
 *
 * Owner 2026-11-09: every screen inside the course must match how it is
 * sold, so the course is now the landing's dark, glowing desk (D), and the
 * apps the learner practises in (Outlook, Excel, a Windows desktop, a Save
 * As box) are light, realistic windows floating on it (W). The landing and
 * PartPreview are built on the shared landing-v2 system and are exempt. */

/* The course shell: dark glass. */
export const D = Object.freeze({
  ground: "#070b17",
  ground2: "#0b1226",
  /* a solid card, and the navy gradient every glass card is drawn with */
  panel: "#0f172e",
  card: "linear-gradient(170deg, #111a33, #090e1c)",
  glass: "rgba(255,255,255,0.045)",
  glassStrong: "rgba(255,255,255,0.08)",
  edge: "rgba(255,255,255,0.10)",
  edgeStrong: "rgba(255,255,255,0.20)",
  grid: "rgba(127,178,255,0.06)",

  ink: "#ffffff", // headings
  body: "rgba(236,241,252,0.92)", // reading text
  muted: "rgba(222,230,250,0.74)", // secondary text
  faint: "rgba(200,212,240,0.58)", // labels, hints

  /* links, focus rings, highlights; the action gradient is for buttons */
  accent: "#7fb2ff",
  accentSoft: "rgba(127,178,255,0.12)",
  accentEdge: "rgba(127,178,255,0.42)",
  action: "linear-gradient(135deg, #3a6ee0 0%, #2b59c3 55%, #23489f 100%)",
  actionGlow: "0 16px 38px -12px rgba(43,89,195,0.95), 0 0 0 1px rgba(43,89,195,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
  onAccent: "#ffffff",

  good: "#4cc38a",
  goodSoft: "rgba(76,195,138,0.13)",
  goodEdge: "rgba(76,195,138,0.5)",
  warn: "#f0b450",
  warnSoft: "rgba(240,180,80,0.12)",
  warnEdge: "rgba(240,180,80,0.45)",
  bad: "#ff7a8a",
  badSoft: "rgba(255,122,138,0.12)",
  badEdge: "rgba(255,122,138,0.5)",

  lift: "0 24px 50px -28px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.07)",

  display: "var(--lv2-font-display), 'Inter', system-ui, sans-serif",
  sans: "var(--lv2-font-display), 'Inter', system-ui, sans-serif",
  mono: "var(--lv2-font-mono), 'Geist Mono', ui-monospace, monospace",
});

/* The practice apps: light, realistic Office-style windows. */
export const W = Object.freeze({
  page: "#ffffff",
  chrome: "#f3f2f1",
  sunk: "#edebe9",
  edge: "#e1dfdd",
  edgeSoft: "rgba(0,0,0,0.07)",
  ink: "#242424",
  body: "#323130",
  muted: "#605e5c",
  faint: "#8a8886",
  select: "rgba(15,108,189,0.10)",

  outlook: "#0f6cbd",
  excel: "#107c41",
  word: "#185abd",
  /* Module 3: Teams' purple, and the dark of a video call */
  teams: "#5b5fc7",
  teamsSoft: "#e8ebfa",
  call: "#1f1f1f",
  /* printed paperwork (a delivery note) laid beside a sheet */
  paper: "#fffdf6",
  /* the pretend desktop: folders, the File Explorer bar, wallpaper */
  folder: "#f2b84b",
  folderLight: "#f8cf6f",
  files: "#c28a14",
  desktop: "linear-gradient(160deg, #3b6fd1, #22468f)",

  /* how an app window sits on the dark desk: deep shadow, faint rim, blue glow */
  float: "0 30px 70px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08), 0 0 44px -14px rgba(127,178,255,0.5)",
  font: "'Segoe UI', var(--lv2-font-display), system-ui, sans-serif",
});

/* One bright accent per course part, in syllabus order (shared with the
 * landing's part cards). */
export const PART_ACCENT = ["#f0b450", "#7fb2ff", "#4cc38a", "#5fd0d8", "#9d8cff", "#ff8fe0"] as const;
