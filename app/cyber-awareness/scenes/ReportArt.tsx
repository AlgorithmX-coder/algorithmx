import { K } from "@/app/ai-cleared/engine/tokens";

/* The small picture at the head of each incident in Cyber Awareness's
 * "write the report" practice, drawn here in SVG: nothing is a photo and
 * nobody's face is drawn. A screen with a sign-in box for a link clicked, a
 * sent email for the wrong recipient, a phone for a call, an empty luggage
 * rack for a lost laptop. The words the learner needs are text beside it;
 * the picture only sets the scene, so it is one labelled image. */

const W = 320;
const H = 120;
const INK = "#1d2230";
const SOFT = "#e9e4f7";
const WARM = "#f3e7d6";
const RED = "#c2493f";

function Link() {
  return (
    <>
      <rect width={W} height={H} fill={SOFT} />
      {/* a laptop, its screen showing a sign-in box */}
      <rect x="92" y="14" width="136" height="84" rx="6" fill={INK} />
      <rect x="99" y="21" width="122" height="70" rx="3" fill="#f7f7fb" />
      <rect x="99" y="21" width="122" height="10" fill="#d9d4ee" />
      <circle cx="105" cy="26" r="2" fill={RED} />
      <rect x="114" y="23.5" width="70" height="5" rx="2.5" fill="#ffffff" />
      <rect x="120" y="40" width="80" height="9" rx="2" fill="#ffffff" stroke="#b9b3d6" />
      <rect x="120" y="54" width="80" height="9" rx="2" fill="#ffffff" stroke="#b9b3d6" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={126 + i * 7} cy={58.5} r="1.8" fill={INK} />)}
      <rect x="138" y="70" width="44" height="11" rx="3" fill="#5744c9" />
      <path d="M76 104h168l-10 8H86z" fill="#3a4152" />
      {/* the pointer, just clicked */}
      <path d="M186 74l0 16 4-4 3 7 3-1.4-3-6.8 5.6-.2z" fill="#ffffff" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </>
  );
}

function Mail() {
  return (
    <>
      <rect width={W} height={H} fill={WARM} />
      {/* the email, sent */}
      <rect x="54" y="16" width="150" height="88" rx="6" fill="#ffffff" stroke="#d8cbb5" />
      <rect x="64" y="26" width="18" height="8" rx="2" fill="#d8cbb5" />
      <rect x="86" y="26" width="92" height="8" rx="4" fill={RED} opacity="0.85" />
      <rect x="64" y="42" width="120" height="5" rx="2.5" fill="#e6dccd" />
      <rect x="64" y="52" width="104" height="5" rx="2.5" fill="#e6dccd" />
      <rect x="64" y="70" width="58" height="22" rx="3" fill="#e1efe6" stroke="#9cc3a9" />
      <rect x="70" y="76" width="30" height="3" rx="1.5" fill="#6b9a7a" />
      <rect x="70" y="83" width="42" height="3" rx="1.5" fill="#6b9a7a" />
      {/* where it went: two people with the same name, the wrong one reached */}
      <path d="M210 60c18 0 26-26 46-26" fill="none" stroke={RED} strokeWidth="2.4" strokeDasharray="5 4" />
      <path d="M252 28l8 6-9 4z" fill={RED} />
      <circle cx="272" cy="34" r="12" fill="#b88d6c" />
      <circle cx="272" cy="84" r="12" fill="#8a6f5a" opacity="0.45" />
      <text x="272" y="58" textAnchor="middle" fontFamily={K.sans} fontSize="9" fontWeight="700" fill={RED}>not this Sam</text>
      <text x="272" y="108" textAnchor="middle" fontFamily={K.sans} fontSize="9" fontWeight="700" fill="#6b5a4a" opacity="0.7">your Sam</text>
    </>
  );
}

function Phone() {
  return (
    <>
      <rect width={W} height={H} fill="#dde4e3" />
      {/* a desk phone's handset, put down, and the call that just ended */}
      <rect x="110" y="20" width="100" height="80" rx="16" fill={INK} />
      <rect x="120" y="30" width="80" height="34" rx="4" fill="#2f3a4a" />
      <text x="160" y="44" textAnchor="middle" fontFamily={K.mono} fontSize="8" fill="#b7d3d7">CALL ENDED</text>
      <text x="160" y="56" textAnchor="middle" fontFamily={K.mono} fontSize="8" fill="#ffffff">00:02:41</text>
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={128 + c * 22} y={70 + r * 9} width="16" height="6" rx="2" fill="#3a4152" />))}
      {/* the doubt */}
      <circle cx="246" cy="36" r="17" fill="#ffffff" stroke="#9fb3b0" strokeWidth="2" />
      <text x="246" y="43" textAnchor="middle" fontFamily={K.sans} fontSize="20" fontWeight="700" fill="#3f5f5a">?</text>
      <circle cx="226" cy="58" r="4" fill="#ffffff" stroke="#9fb3b0" strokeWidth="1.5" />
    </>
  );
}

function Laptop() {
  return (
    <>
      <rect width={W} height={H} fill="#e1e0ea" />
      {/* a train window at dusk */}
      <rect x="16" y="14" width="96" height="58" rx="12" fill="#3c4a6b" />
      <rect x="16" y="52" width="96" height="20" rx="0" fill="#2a3450" />
      <circle cx="86" cy="32" r="6" fill="#efe0b8" opacity="0.85" />
      {/* the luggage rack, with a gap where the bag was */}
      <rect x="128" y="20" width="176" height="5" rx="2" fill="#8a8aa0" />
      <rect x="128" y="36" width="176" height="3" rx="1.5" fill="#8a8aa0" />
      <rect x="138" y="7" width="40" height="29" rx="4" fill="#5d6b7a" />
      <rect x="196" y="9" width="58" height="27" rx="4" fill="none" stroke={RED} strokeWidth="2" strokeDasharray="5 4" />
      <text x="225" y="27" textAnchor="middle" fontFamily={K.sans} fontSize="9" fontWeight="700" fill={RED}>gone</text>
      <rect x="264" y="13" width="30" height="23" rx="4" fill="#7a5d6f" />
      {/* the seats */}
      <rect x="128" y="62" width="70" height="46" rx="10" fill="#4a5d8a" />
      <rect x="208" y="62" width="70" height="46" rx="10" fill="#4a5d8a" />
      <rect x="134" y="54" width="58" height="14" rx="6" fill="#5a6e9c" />
      <rect x="214" y="54" width="58" height="14" rx="6" fill="#5a6e9c" />
    </>
  );
}

export default function ReportArt({ art, label }: { art: "link" | "mail" | "phone" | "laptop"; label: string }) {
  return (
    <svg className={`cl-rp-art ${art}`} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      {art === "link" ? <Link /> : art === "mail" ? <Mail /> : art === "phone" ? <Phone /> : <Laptop />}
    </svg>
  );
}
