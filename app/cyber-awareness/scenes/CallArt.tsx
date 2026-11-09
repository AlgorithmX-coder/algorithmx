import { K } from "@/app/ai-cleared/engine/tokens";

/* The picture on an incoming call in Cyber Awareness's calls practice,
 * drawn here in SVG so nothing is a photo, nothing is generated and no
 * face is drawn: a video call shows a room and a plain head-and-shoulders
 * shape, a voice call shows the caller's initials. Genuine and impostor
 * callers are drawn exactly alike, because a good fake looks like the real
 * person; the lesson is the check, never the picture. Every word the
 * learner needs (who, what they say) is text the engine shows beside it. */

const W = 320;
const H = 200;

/* Colours for the drawings only, kept beside the course tokens. */
const ROOMS = [
  { wall: "#e6dccd", shelf: "#cdbb9f", coat: "#5d6b7a", accent: "#b7d3d7" },
  { wall: "#dde4e3", shelf: "#b9c8c6", coat: "#7a5d6f", accent: "#efe0b8" },
  { wall: "#e9e1d7", shelf: "#d2c2ad", coat: "#3f5f5a", accent: "#d9cdf2" },
  { wall: "#e1e0ea", shelf: "#c4c2d6", coat: "#8a6a4f", accent: "#cfe6ea" },
];
const SKIN = ["#c99a76", "#8a6f5a", "#e0b48f", "#a9805f"];
const VOICE = ["#0a7085", "#5744c9", "#7a4b8f", "#3c6e5a"];

function seedOf(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function initialsOf(name: string): string {
  const words = name.replace(/,.*$/, "").split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
}

/* A head-and-shoulders shape, no features: a circle and a rounded body. */
function Figure({ cx, top, scale, skin, coat }: { cx: number; top: number; scale: number; skin: string; coat: string }) {
  const r = 30 * scale;
  return (
    <g>
      <path d={`M${cx - 74 * scale} ${H} C${cx - 72 * scale} ${top + 2.6 * r} ${cx - 44 * scale} ${top + 2.25 * r} ${cx} ${top + 2.25 * r} C${cx + 44 * scale} ${top + 2.25 * r} ${cx + 72 * scale} ${top + 2.6 * r} ${cx + 74 * scale} ${H} Z`} fill={coat} />
      <rect x={cx - 11 * scale} y={top + 1.7 * r} width={22 * scale} height={0.7 * r} rx={6 * scale} fill={skin} />
      <circle cx={cx} cy={top + r} r={r} fill={skin} />
    </g>
  );
}

export default function CallArt({ kind, name, ringing, label }: { kind: "voice" | "video"; name: string; ringing?: boolean; label: string }) {
  const s = seedOf(name);
  if (kind === "voice" || ringing) {
    const ink = VOICE[s % VOICE.length];
    return (
      <svg className={`cl-call-art voice ${ringing ? "ringing" : ""}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
        <rect width={W} height={H} fill="#1d2230" />
        <circle className="cl-call-ring r2" cx={W / 2} cy={H / 2} r="70" fill="none" stroke={ink} strokeOpacity="0.35" strokeWidth="2" />
        <circle className="cl-call-ring r1" cx={W / 2} cy={H / 2} r="56" fill="none" stroke={ink} strokeOpacity="0.55" strokeWidth="2" />
        <circle cx={W / 2} cy={H / 2} r="44" fill={ink} />
        <text x={W / 2} y={H / 2 + 10} textAnchor="middle" fontFamily={K.sans} fontSize="28" fontWeight="700" fill={K.onAccent}>{initialsOf(name)}</text>
      </svg>
    );
  }
  const room = ROOMS[s % ROOMS.length];
  const skin = SKIN[(s >> 3) % SKIN.length];
  return (
    <svg className="cl-call-art video" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      {/* the room behind them */}
      <rect width={W} height={H} fill={room.wall} />
      <rect x="22" y="26" width="86" height="64" rx="4" fill={room.accent} />
      <rect x="22" y="26" width="86" height="64" rx="4" fill="none" stroke={room.shelf} strokeWidth="4" />
      <rect x="226" y="40" width="74" height="6" rx="2" fill={room.shelf} />
      <rect x="232" y="22" width="9" height="18" rx="1" fill={room.coat} opacity="0.55" />
      <rect x="244" y="26" width="7" height="14" rx="1" fill={room.shelf} />
      <rect x="254" y="20" width="10" height="20" rx="1" fill={room.accent} />
      <rect x="226" y="86" width="74" height="6" rx="2" fill={room.shelf} />
      <circle cx="262" cy="74" r="10" fill={room.accent} />
      {/* them */}
      <Figure cx={W / 2} top={46} scale={1} skin={skin} coat={room.coat} />
      {/* you, in the corner */}
      <g>
        <rect x={W - 76} y={H - 56} width="66" height="46" rx="6" fill="#2a3040" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" />
        <svg x={W - 76} y={H - 56} width="66" height="46" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
          <Figure cx={W / 2} top={50} scale={1} skin="#b88d6c" coat="#46506a" />
        </svg>
        <text x={W - 70} y={H - 15} fontFamily={K.sans} fontSize="9" fontWeight="700" fill="#ffffff">You</text>
      </g>
    </svg>
  );
}
