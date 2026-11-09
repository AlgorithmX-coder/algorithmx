/* Desk Ready surface tokens. Single source: a hex or font stack appearing
 * anywhere else under app/desk-ready is a bug (the rule from the Pro and
 * Explorers engines). The learner is an adult who is new to computers and
 * nervous about it, so: a light warm paper ground, high-contrast ink, large
 * reading type, one calm blue for anything you can press, and nothing that
 * looks like a hacker film. The simulated Outlook and Excel windows are
 * the one exception, because they recreate the real apps' chrome. The
 * landing (DeskReadyLanding, DeskHeroSim) is the other: it is built on the
 * shared AlgorithmX landing system (landing-v2) and its palette, not on D. */
export const D = Object.freeze({
  ground: "#f6f3ee",
  panel: "#ffffff",
  panelSoft: "#faf8f4",
  sunk: "#efeae1",
  edge: "#dcd5c8",
  edgeSoft: "rgba(23,25,31,0.08)",

  ink: "#17191f", // headings
  body: "#2a2e36", // reading text
  muted: "#4f5560", // secondary text
  faint: "#767c87", // hints, labels

  accent: "#2b59c3", // the one "you can press this" colour
  accentHover: "#234aa6",
  accentSoft: "rgba(43,89,195,0.10)",
  onAccent: "#ffffff",

  good: "#1b7a43",
  goodSoft: "rgba(27,122,67,0.10)",
  warn: "#8a5400",
  warnSoft: "rgba(138,84,0,0.10)",
  bad: "#b3261e",
  badSoft: "rgba(179,38,30,0.09)",

  lift: "0 14px 40px rgba(23,25,31,0.10)",

  /* the real apps' title-bar colours, for drawn Outlook and Excel windows */
  outlook: "#0f6cbd",
  excel: "#107c41",
  /* printed paperwork (a delivery note) laid beside a sheet */
  paper: "#fffdf6",
  /* the pretend desktop in Module 0: folders, the File Explorer bar, wallpaper */
  folder: "#f2b84b",
  folderLight: "#f8cf6f",
  files: "#c28a14",
  desktop: "linear-gradient(160deg, #3b6fd1, #22468f)",

  display: "var(--font-desk-display), 'Lexend', system-ui, sans-serif",
  sans: "var(--font-desk-sans), 'Atkinson Hyperlegible Next', system-ui, sans-serif",
});
