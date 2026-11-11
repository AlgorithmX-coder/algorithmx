import type { CSSProperties } from "react";

/* Line icons for the Calendar and Teams look-alikes (Module 3), and the
 * figures that draw them. Drawn in code, in the spirit of Microsoft's
 * Fluent icons, with no vendor artwork. Every one is inline-block, since
 * Tailwind's preflight would make a bare svg a block on its own line. */

const PATHS = {
  calendar: "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM4 9h16M8 2.5v3M16 2.5v3",
  clock: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5V12l3 2",
  people: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.3a3.3 3.3 0 0 1 0 6.4M18 14.4c2.1.7 3.5 2.6 3.5 5.6",
  pin: "M12 21s-6.5-6-6.5-11a6.5 6.5 0 1 1 13 0c0 5-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  door: "M6 20.5V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5v16M3.5 20.5h17M14.5 12.5v.5",
  text: "M4 6h16M4 10h16M4 14h10M4 18h7",
  video: "M3.5 7.5A1.5 1.5 0 0 1 5 6h9a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 14 18H5a1.5 1.5 0 0 1-1.5-1.5zM15.5 10.5l5-3v9l-5-3",
  videoOff: "M3.5 7.5A1.5 1.5 0 0 1 5 6h9a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 14 18H5a1.5 1.5 0 0 1-1.5-1.5zM15.5 10.5l5-3v9l-5-3M2.5 3.5l19 17",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3",
  micOff: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M3 3l18 18",
  share: "M3.5 5.5A1.5 1.5 0 0 1 5 4h14a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 19 17H5a1.5 1.5 0 0 1-1.5-1.5zM8 21h8M12 13.5v-6M9 10l3-3 3 3",
  leave: "M3.2 13.6c4.9-4.4 12.7-4.4 17.6 0 .6.6.6 1.6 0 2.2l-1.4 1.4c-.5.5-1.3.6-1.9.2l-2-1.3c-.5-.3-.7-.8-.7-1.4v-1.4c-2.4-.8-5.2-.8-7.6 0v1.4c0 .6-.2 1.1-.7 1.4l-2 1.3c-.6.4-1.4.3-1.9-.2l-1.4-1.4c-.6-.6-.6-1.6 0-2.2z",
  chat: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z",
  send: "M3.5 11.5l17-8-6 17-3-7.5zM11.5 13L20 3.5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  question: "M9 9a3 3 0 1 1 4.2 2.7c-.8.4-1.2 1-1.2 1.8v.5M12 17.5v.5",
  cross: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  left: "M14.5 5.5L8 12l6.5 6.5",
  right: "M9.5 5.5L16 12l-6.5 6.5",
  bell: "M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15zM10 20.5a2.2 2.2 0 0 0 4 0",
  teams: "M4 6.5h9.5v11H4zM8.75 9.5v6M6.5 9.5h4.5M16 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM15.5 11.5h4.5v4.5a3 3 0 0 1-4.5 2.6",
  phone: "M5 3.5h3.5l1.5 4.5-2.2 1.4a11 11 0 0 0 4.8 4.8L14 12l4.5 1.5V17a2 2 0 0 1-2 2A13.5 13.5 0 0 1 3 5.5a2 2 0 0 1 2-2z",
  pencil: "M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 7.5l3 3",
  hand: "M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7.5-6.5 7.5-2.5 0-4-1.2-5.5-3.5L3.5 13.5a1.5 1.5 0 0 1 2.4-1.8L8 14",
  more: "M6 12h.01M12 12h.01M18 12h.01",
  search: "M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM15.5 15.5l5 5",
  screen: "M3.5 5.5A1.5 1.5 0 0 1 5 4h14a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 19 17H5a1.5 1.5 0 0 1-1.5-1.5zM8 21h8M12 17v4",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13z",
  speaker: "M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11",
  blur: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM8 8h.01M12 7h.01M16 8h.01M7 12h.01M17 12h.01M8 16h.01M12 17h.01M16 16h.01",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.4 7.4 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.4z",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, stroke = 1.8, style, title }: { name: IconName; size?: number; stroke?: number; style?: CSSProperties; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "more" ? 3.2 : stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} style={{ display: "inline-block", flexShrink: 0, verticalAlign: "middle", ...style }}>
      {title && <title>{title}</title>}
      <path d={PATHS[name]} />
    </svg>
  );
}

/* A round avatar with initials and, in Teams, a presence dot. */
export function Avatar({ name, colour, size = 32, presence, ring }: { name: string; colour: string; size?: number; presence?: "available" | "busy" | "away" | "offline"; ring?: string }) {
  const dot = { available: "#13a10e", busy: "#d13438", away: "#eaa300", offline: "#8a8886" } as const;
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span aria-hidden style={{ position: "relative", display: "inline-flex", flexShrink: 0, width: size, height: size }}>
      <span style={{ width: size, height: size, borderRadius: "50%", background: colour, color: "#ffffff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.38), fontWeight: 700, letterSpacing: "0.02em", boxShadow: ring ? `0 0 0 2px ${ring}` : "none" }}>{letters}</span>
      {presence && <span style={{ position: "absolute", right: -1, bottom: -1, width: Math.max(9, size * 0.3), height: Math.max(9, size * 0.3), borderRadius: "50%", background: dot[presence], border: "2px solid #ffffff" }} />}
    </span>
  );
}

/* A stand-in for someone's camera picture: a soft room and a head and
 * shoulders, in their own colour. */
export function CameraPicture({ colour, style }: { colour: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ display: "block", ...style }}>
      <defs>
        <linearGradient id={`room-${colour.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9d2c5" />
          <stop offset="1" stopColor="#a99f90" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill={`url(#room-${colour.slice(1)})`} />
      <rect x="104" y="14" width="40" height="30" rx="2" fill="#ece6da" opacity="0.8" />
      <rect x="10" y="20" width="14" height="70" rx="2" fill="#8d8273" opacity="0.5" />
      <path d="M38 120c0-26 19-40 42-40s42 14 42 40z" fill={colour} />
      <circle cx="80" cy="56" r="21" fill="#e9c3a0" />
      <path d="M58 54c0-15 10-25 22-25s23 9 23 23c-6-7-15-9-23-9s-16 3-22 11z" fill="#3b2a20" />
    </svg>
  );
}
