import type { JSX } from "react";
import type { SceneArt } from "@/app/ai-cleared/engine/types";
import { K } from "@/app/ai-cleared/engine/tokens";

/* The drawings behind Cyber Awareness's "spot the risk" practice, drawn
 * here in SVG so nothing is a photo and nothing is hotlinked. They are
 * pictures only: every word the learner needs (what each spot is, what is
 * there, why) comes from the manifest, and the spots themselves are real
 * buttons the engine lays over the drawing. Both share one 640 by 400
 * frame, so a spot's x and y in percent land on the same place at every
 * width. The few words drawn in are labels on things, never instructions. */

const W = 640;
const H = 400;

/* Colours for the drawings only, kept beside the course tokens. */
const C = {
  wall: "#efe5d6",
  floor: "#e2d4bf",
  frame: "#cdbfa8",
  skyTop: "#cfe6ea",
  skyLow: "#eef4ef",
  town: "#a9cdd1",
  townFar: "#c4dde0",
  counter: "#d8c6aa",
  counterTop: "#bfa682",
  wood: "#c49a6c",
  woodEdge: "#a97f53",
  woodDark: "#7a5a3f",
  skinA: "#c99a76",
  skinB: "#8a6f5a",
  skinC: "#e0b48f",
  coatGrey: "#9aa3ad",
  coatPlum: "#8f6a8a",
  coatSand: "#b9a27f",
  metal: "#c7ccd3",
  metalDark: "#9ea5af",
  violet: "#5744c9",
  violetSoft: "#efeaff",
  paper: "#ffffff",
  chrome: "#e9e4da",
  page: "#f6f3ee",
};

function Cafe() {
  return (
    <>
      <defs>
        <linearGradient id="sa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyTop} />
          <stop offset="1" stopColor={C.skyLow} />
        </linearGradient>
        <clipPath id="sa-window">
          <rect x="24" y="26" width="230" height="170" rx="10" />
        </clipPath>
        <linearGradient id="sa-desk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e3f1f2" />
          <stop offset="1" stopColor="#ece8fb" />
        </linearGradient>
      </defs>
      {/* the room */}
      <rect width={W} height={H} fill={C.wall} />
      <rect y="292" width={W} height={H - 292} fill={C.floor} />
      {/* the window, with the street outside */}
      <rect x="24" y="26" width="230" height="170" rx="10" fill="url(#sa-sky)" />
      <g clipPath="url(#sa-window)">
        <rect x="30" y="120" width="44" height="80" fill={C.townFar} />
        <rect x="80" y="96" width="38" height="104" fill={C.town} />
        <rect x="124" y="132" width="52" height="68" fill={C.townFar} />
        <rect x="182" y="104" width="40" height="96" fill={C.town} />
        <rect x="226" y="140" width="30" height="60" fill={C.townFar} />
      </g>
      <rect x="24" y="26" width="230" height="170" rx="10" fill="none" stroke={C.frame} strokeWidth="6" />
      <line x1="139" y1="26" x2="139" y2="196" stroke={C.frame} strokeWidth="5" />
      <line x1="24" y1="111" x2="254" y2="111" stroke={C.frame} strokeWidth="5" />
      {/* lamps */}
      <line x1="300" y1="0" x2="300" y2="34" stroke={K.ink} strokeWidth="2" />
      <path d="M282 52 a18 18 0 0 1 36 0 z" fill={K.accent} />
      <line x1="560" y1="0" x2="560" y2="24" stroke={K.ink} strokeWidth="2" />
      <path d="M542 42 a18 18 0 0 1 36 0 z" fill={C.violet} />
      {/* the menu board and the counter */}
      <rect x="380" y="34" width="132" height="72" rx="6" fill={K.ink} />
      <rect x="394" y="48" width="70" height="6" rx="3" fill="#5b6572" />
      <rect x="394" y="62" width="96" height="5" rx="2.5" fill="#5b6572" />
      <rect x="394" y="74" width="84" height="5" rx="2.5" fill="#5b6572" />
      <rect x="394" y="86" width="90" height="5" rx="2.5" fill="#5b6572" />
      <rect x="352" y="150" width="288" height="120" fill={C.counter} />
      <rect x="344" y="140" width="296" height="14" rx="4" fill={C.counterTop} />
      <rect x="566" y="96" width="56" height="46" rx="6" fill="#6b7280" />
      <rect x="578" y="108" width="32" height="10" rx="3" fill={C.metal} />
      {/* the queue: someone ahead of you, then you */}
      <circle cx="420" cy="118" r="15" fill={C.skinB} />
      <rect x="400" y="136" width="40" height="112" rx="18" fill={C.coatGrey} />
      <circle cx="478" cy="124" r="15" fill={C.skinA} />
      <rect x="458" y="142" width="40" height="106" rx="18" fill={K.accent} />
      <rect x="500" y="112" width="44" height="20" rx="10" fill={K.ink} />
      <path d="M501 117 L495 122 L501 127 Z" fill={K.ink} />
      <text x="522" y="127.5" textAnchor="middle" fontFamily={K.sans} fontSize="12" fontWeight="700" fill={K.onAccent}>You</text>
      {/* the next table, close by, two people with coffee */}
      <circle cx="528" cy="196" r="14" fill={C.skinC} />
      <rect x="510" y="212" width="36" height="58" rx="16" fill={C.coatPlum} />
      <circle cx="604" cy="198" r="14" fill={C.skinB} />
      <rect x="586" y="214" width="36" height="56" rx="16" fill={C.coatSand} />
      <ellipse cx="566" cy="268" rx="78" ry="13" fill={C.wood} />
      <rect x="560" y="278" width="12" height="40" fill={C.woodDark} />
      <rect x="548" y="250" width="14" height="14" rx="3" fill={C.paper} />
      <rect x="576" y="252" width="12" height="12" rx="3" fill={C.paper} />
      {/* your empty chair, your scarf over it */}
      <rect x="262" y="206" width="80" height="96" rx="12" fill={C.woodDark} />
      <rect x="272" y="216" width="60" height="70" rx="8" fill="#8d6b4e" />
      <path d="M300 206 q8 40 -6 92 l14 0 q12 -48 4 -92 z" fill={K.accent} />
      {/* your table */}
      <path d="M26 292 L460 292 L494 400 L-6 400 Z" fill={C.wood} />
      <path d="M26 292 L460 292 L462 298 L24 298 Z" fill={C.woodEdge} />
      {/* the laptop, open on a working desktop */}
      <rect x="70" y="200" width="172" height="126" rx="7" fill={K.ink} />
      <rect x="78" y="208" width="156" height="110" rx="3" fill="url(#sa-desk)" />
      <rect x="88" y="218" width="88" height="62" rx="3" fill={C.paper} />
      <rect x="88" y="218" width="88" height="10" rx="3" fill={K.accent} />
      <rect x="94" y="236" width="60" height="4" rx="2" fill={C.metal} />
      <rect x="94" y="246" width="70" height="4" rx="2" fill={C.metal} />
      <rect x="94" y="256" width="52" height="4" rx="2" fill={C.metal} />
      <rect x="160" y="252" width="66" height="54" rx="3" fill={C.paper} />
      <rect x="160" y="252" width="66" height="10" rx="3" fill={C.violet} />
      <rect x="166" y="270" width="48" height="4" rx="2" fill={C.metal} />
      <rect x="166" y="280" width="40" height="4" rx="2" fill={C.metal} />
      <rect x="78" y="308" width="156" height="10" fill="rgba(255,255,255,0.7)" />
      <path d="M58 326 L254 326 L274 350 L38 350 Z" fill={C.metal} />
      <path d="M58 326 L254 326 L256 330 L56 330 Z" fill={C.metalDark} />
      {/* coffee */}
      <ellipse cx="306" cy="334" rx="26" ry="7" fill={C.paper} />
      <path d="M290 306 L322 306 L318 332 L294 332 Z" fill={C.paper} />
      <path d="M322 312 q12 2 0 14" stroke={C.paper} strokeWidth="4" fill="none" />
      <ellipse cx="306" cy="307" rx="16" ry="4" fill="#6f4a2e" />
      {/* the USB stick from the car park, with its paper tag */}
      <rect x="350" y="352" width="34" height="14" rx="3" fill={C.violet} />
      <rect x="384" y="355" width="11" height="8" rx="1" fill={C.metal} />
      <line x1="350" y1="359" x2="336" y2="370" stroke={K.muted} strokeWidth="1.5" />
      <rect x="306" y="364" width="34" height="20" rx="3" fill={C.paper} transform="rotate(-8 323 374)" />
      <rect x="312" y="371" width="20" height="3" rx="1.5" fill={C.metal} transform="rotate(-8 323 374)" />
      {/* your phone, face down, sharing its connection */}
      <g transform="rotate(-10 444 352)">
        <rect x="426" y="322" width="36" height="62" rx="7" fill="#2b2f36" />
        <circle cx="436" cy="332" r="3" fill="#5b6572" />
      </g>
      <path d="M432 312 a14 14 0 0 1 24 0" stroke={K.accent} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M426 304 a22 22 0 0 1 36 0" stroke={K.accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    </>
  );
}

function Laptop() {
  return (
    <>
      <defs>
        <linearGradient id="sa-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9eef0" />
          <stop offset="0.55" stopColor="#e4defa" />
          <stop offset="1" stopColor="#f6dcea" />
        </linearGradient>
      </defs>
      {/* the screen in its bezel */}
      <rect width={W} height={H} rx="20" fill={K.ink} />
      <rect x="16" y="14" width="608" height="356" rx="6" fill="url(#sa-wall)" />
      {/* a browser on a news page, dimmed behind a pop-up */}
      <rect x="36" y="34" width="372" height="262" rx="8" fill={C.paper} />
      <rect x="36" y="34" width="372" height="26" rx="8" fill={C.chrome} />
      <rect x="36" y="50" width="372" height="10" fill={C.chrome} />
      <circle cx="50" cy="47" r="4" fill="#e4655c" />
      <circle cx="63" cy="47" r="4" fill="#e0a040" />
      <circle cx="76" cy="47" r="4" fill="#4cc38a" />
      <rect x="92" y="40" width="250" height="14" rx="7" fill={C.paper} />
      <rect x="52" y="74" width="190" height="14" rx="3" fill={K.ink} />
      <rect x="52" y="98" width="150" height="80" rx="4" fill="#b7d3d7" />
      <rect x="214" y="100" width="176" height="6" rx="3" fill={C.metal} />
      <rect x="214" y="114" width="160" height="6" rx="3" fill={C.metal} />
      <rect x="214" y="128" width="170" height="6" rx="3" fill={C.metal} />
      <rect x="52" y="192" width="330" height="6" rx="3" fill={C.metal} />
      <rect x="52" y="206" width="300" height="6" rx="3" fill={C.metal} />
      <rect x="52" y="220" width="320" height="6" rx="3" fill={C.metal} />
      <rect x="52" y="234" width="250" height="6" rx="3" fill={C.metal} />
      <rect x="36" y="60" width="372" height="210" fill="rgba(20,22,29,0.42)" />
      <rect x="92" y="88" width="260" height="146" rx="10" fill={C.paper} />
      <path d="M92 98 a10 10 0 0 1 10 -10 L342 88 a10 10 0 0 1 10 10 L352 124 L92 124 Z" fill={K.crit} />
      <circle cx="114" cy="106" r="9" fill={C.paper} />
      <rect x="112.5" y="100" width="3" height="8" rx="1.5" fill={K.crit} />
      <circle cx="114" cy="111" r="1.6" fill={K.crit} />
      <text x="132" y="111" fontFamily={K.sans} fontSize="15" fontWeight="700" fill={K.onAccent}>Browser out of date</text>
      <rect x="110" y="140" width="220" height="6" rx="3" fill={C.metal} />
      <rect x="110" y="154" width="180" height="6" rx="3" fill={C.metal} />
      <rect x="148" y="180" width="148" height="34" rx="7" fill={K.accent} />
      <text x="222" y="202" textAnchor="middle" fontFamily={K.sans} fontSize="15" fontWeight="700" fill={K.onAccent}>Update now</text>
      {/* the browser's downloads bar: an installer */}
      <rect x="36" y="270" width="372" height="26" fill={C.page} />
      <rect x="36" y="288" width="372" height="8" rx="8" fill={C.page} />
      <rect x="48" y="275" width="12" height="16" rx="2" fill={C.violet} />
      <text x="68" y="288" fontFamily={K.sans} fontSize="12.5" fontWeight="600" fill={K.ink}>FreePDF Pro setup</text>
      <rect x="196" y="279" width="80" height="8" rx="4" fill={C.metal} />
      <rect x="196" y="279" width="54" height="8" rx="4" fill={K.accent} />
      {/* a chat message from a colleague */}
      <rect x="424" y="34" width="184" height="118" rx="8" fill={C.paper} />
      <path d="M424 42 a8 8 0 0 1 8 -8 L600 34 a8 8 0 0 1 8 8 L608 58 L424 58 Z" fill={C.violet} />
      <text x="436" y="51" fontFamily={K.sans} fontSize="12" fontWeight="700" fill={K.onAccent}>Chat</text>
      <circle cx="446" cy="82" r="12" fill={C.skinA} />
      <text x="446" y="86" textAnchor="middle" fontFamily={K.sans} fontSize="10" fontWeight="700" fill={K.onAccent}>LB</text>
      <rect x="464" y="68" width="132" height="60" rx="10" fill={C.violetSoft} />
      <rect x="474" y="80" width="104" height="5" rx="2.5" fill="#b8b0e6" />
      <rect x="474" y="92" width="112" height="5" rx="2.5" fill="#b8b0e6" />
      <rect x="474" y="104" width="86" height="5" rx="2.5" fill="#b8b0e6" />
      <rect x="474" y="116" width="60" height="5" rx="2.5" fill="#b8b0e6" />
      {/* the firm's own software app */}
      <rect x="424" y="164" width="184" height="60" rx="8" fill={C.paper} />
      <rect x="436" y="176" width="36" height="36" rx="8" fill={K.accent} />
      <rect x="445" y="188" width="18" height="14" rx="2" fill="none" stroke={K.onAccent} strokeWidth="2.5" />
      <path d="M449 188 v-4 h10 v4" fill="none" stroke={K.onAccent} strokeWidth="2.5" />
      <text x="482" y="190" fontFamily={K.sans} fontSize="13" fontWeight="700" fill={K.ink}>Software</text>
      <text x="482" y="207" fontFamily={K.sans} fontSize="11.5" fill={K.muted}>1 update ready</text>
      {/* the restart reminder */}
      <rect x="424" y="236" width="184" height="80" rx="8" fill={C.paper} />
      <rect x="424" y="236" width="6" height="80" rx="3" fill={K.warn} />
      <text x="440" y="258" fontFamily={K.sans} fontSize="13" fontWeight="700" fill={K.ink}>Restart needed</text>
      <text x="440" y="275" fontFamily={K.sans} fontSize="11.5" fill={K.muted}>Postponed 21 days</text>
      <rect x="440" y="286" width="70" height="20" rx="5" fill={K.accent} />
      <text x="475" y="300" textAnchor="middle" fontFamily={K.sans} fontSize="11" fontWeight="700" fill={K.onAccent}>Restart</text>
      <rect x="518" y="286" width="62" height="20" rx="5" fill="none" stroke={C.metalDark} strokeWidth="1.5" />
      <text x="549" y="300" textAnchor="middle" fontFamily={K.sans} fontSize="11" fontWeight="600" fill={K.muted}>Later</text>
      {/* the taskbar, with the VPN shield and the clock */}
      <rect x="16" y="334" width="608" height="36" fill="rgba(255,255,255,0.78)" />
      <rect x="30" y="343" width="8" height="8" rx="1" fill={K.accent} />
      <rect x="40" y="343" width="8" height="8" rx="1" fill={K.accent} />
      <rect x="30" y="353" width="8" height="8" rx="1" fill={K.accent} />
      <rect x="40" y="353" width="8" height="8" rx="1" fill={K.accent} />
      <rect x="66" y="342" width="20" height="20" rx="5" fill="#b7d3d7" />
      <rect x="94" y="342" width="20" height="20" rx="5" fill={C.violet} />
      <rect x="122" y="342" width="20" height="20" rx="5" fill="#e0a040" />
      <path d="M500 342 l12 -3 l12 3 v8 c0 7 -6 11 -12 13 c-6 -2 -12 -6 -12 -13 z" fill={K.ok} />
      <path d="M506 351 l4 4 l8 -8" stroke={K.onAccent} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="530" y="357" fontFamily={K.sans} fontSize="12" fontWeight="700" fill={K.ok}>VPN</text>
      <text x="606" y="357" textAnchor="end" fontFamily={K.sans} fontSize="12" fontWeight="600" fill={K.ink}>14:12</text>
    </>
  );
}

const ART: Record<SceneArt, () => JSX.Element> = { cafe: Cafe, laptop: Laptop };

export default function SceneArtView({ art, label }: { art: SceneArt; label: string }) {
  const Draw = ART[art];
  return (
    <svg className="cl-sc-art" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <Draw />
    </svg>
  );
}
