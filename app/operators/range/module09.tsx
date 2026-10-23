"use client";

/* Module 9 - Passwords & Hashes (DEPTH STANDARD, built to the M5 framework).
 *
 * Real cracking: hashes are computed in the browser with the Web Crypto API
 * (crypto.subtle, SHA-256) - zero egress. The learner genuinely hashes candidate
 * words and matches the digest, watches salting break a plain wordlist and then
 * cracks with the salt, and sees the avalanche effect live. The target digests
 * are precomputed SHA-256 constants, so the plaintext is NOT in the source - the
 * only way to the password is to actually hash the list.
 *
 * Shape mirrors M5: hover glossary, interactive lesson lab, de-biased check, a
 * FOUR-stage capture with a hint ladder, FOUR drills, and a chained capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";

/* ───────────────────────── real hashing ───────────────────────── */

async function sha256hex(s: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch { return ""; }
}

/* Precomputed SHA-256 targets (the leaked "hashes"). Plaintext is deliberately
 * absent from the source - the learner recovers it only by hashing the list. */
const T_SUNSHINE = "a941a4c4fd0c01cddef61b8be963bf4c1e2b0811c037ce3f1835fddf6ef6c223"; // sha256("sunshine")
const SALT = "k3f9";
const T_SALTED = "4803071c7c173eb6abd1789c343aacc911f29a2aebef233e67444cbc9b91ecda"; // sha256("k3f9dragon")
const T_LETMEIN = "9b0eb22aef89516d6fb4b31ccf008a68abe0d10a3fc606316389613eccf96854"; // sha256("letmein123")

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "hash", definition: "A one-way fingerprint of some data. Easy to compute, meant to be impossible to reverse - sites store a password's hash, not the password.", example: "When you set a password, a well-built site stores a scrambled fingerprint like 'a941a4...' instead of the word itself, so a leak doesn't hand over your actual password." },
  { term: "one-way", definition: "You can turn a password into its hash, but you can't turn the hash back into the password - you can only guess and check.", example: "It's like mincing beef: trivial to turn the steak into mince, but no machine turns the mince back into a steak." },
  { term: "digest", definition: "The output of a hash - the fixed-length fingerprint string, like a 64-character SHA-256 value.", example: "Hashing 'sunshine' always spits out the same 64-character digest like 'a941a4c4...', no matter how long or short the input was." },
  { term: "MD5", definition: "An old, fast hash (32 hex characters). Far too fast and broken for passwords - crackable almost instantly.", example: "MD5 is so fast that a single gaming graphics card can test billions of guesses a second, so an MD5 password hash falls in moments." },
  { term: "SHA-256", definition: "A modern general-purpose hash (64 hex characters). Strong for files, but too fast to be safe for passwords on its own.", example: "SHA-256 is perfect for checking a downloaded game file hasn't been tampered with, but it's far too fast to safely store passwords by itself." },
  { term: "bcrypt", definition: "A password-hashing algorithm that salts automatically and is deliberately slow - one of the right choices for storing passwords.", example: "bcrypt is built to take a noticeable slice of a second per guess, so an attacker who could test billions a second is slowed to a crawl." },
  { term: "Argon2", definition: "A modern, deliberately slow and memory-hard password hash - a current best choice for storing passwords.", example: "Argon2 deliberately hogs lots of memory as well as time, which makes the mega-fast cracking rigs attackers rent far less effective." },
  { term: "rainbow table", definition: "A huge precomputed list of hash -> password. If a hash is unsalted, an attacker just looks it up.", example: "Because millions of people pick 'password123', a rainbow table already lists its hash, so an unsalted leak is cracked by a simple lookup." },
  { term: "salt", definition: "A unique random value added to each password before hashing, so identical passwords get different hashes and precomputed tables fail.", example: "Add a random 'k3f9' to each password before hashing and two people who both chose 'dragon' end up with totally different hashes, so cracking one doesn't break the other." },
  { term: "dictionary attack", definition: "Cracking by hashing a list of likely passwords and checking each against the target hash.", example: "An attacker feeds in a list of the 10 million most common passwords, hashes each one, and checks them against the stolen hash until something matches." },
  { term: "brute force", definition: "Trying every possible combination. Feasible against fast hashes and short passwords; hopeless against slow, salted ones.", example: "Grinding through 'aaaa', 'aaab', 'aaac' and onward will crack 'cat' in a flash, but a 16-character passphrase would take longer than the age of the universe." },
  { term: "plaintext", definition: "The actual password, unhashed. The thing you must never store, and the prize an attacker is cracking toward.", example: "'letmein123' is the plaintext password: the real word an attacker is working to recover from the leaked hash." },
  { term: "avalanche effect", definition: "Changing one character of the input changes the whole hash - a property of good hash functions.", example: "Hash 'password' and then 'Password' and the two digests look completely unrelated, even though you only changed one letter to a capital." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13 };
const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, margin: "0 0 6px", letterSpacing: ".06em" };

function Hints({ hints, revealLabel, onReveal }: { hints: string[]; revealLabel?: string; onReveal?: () => void }) {
  const [shown, setShown] = useState(0);
  return (
    <div style={{ marginTop: 12 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div key={i} style={{ marginBottom: 6, padding: "9px 12px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{hints[i]}</div>
      ))}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        {shown < hints.length && <button onClick={() => setShown(shown + 1)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{shown === 0 ? "hint" : "another hint"}</button>}
        {shown >= hints.length && revealLabel && onReveal && <button onClick={onReveal} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{revealLabel}</button>}
      </div>
    </div>
  );
}

/* ── identify: classify each hash by its algorithm (format recognition) ── */
type IdRow = { hash: string; algo: string; note: string };
function IdentifySurface({ rows, options, hint, onSolved }: { rows: IdRow[]; options: string[]; hint: string; onSolved: () => void }) {
  const [pick, setPick] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const all = rows.every((r) => pick[r.hash]);
  function check() { setChecked(true); if (rows.every((r) => pick[r.hash] === r.algo)) { setSolved(true); onSolved(); } }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// the format gives the algorithm away. Classify each leaked hash.</div>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((r) => {
          const right = checked && pick[r.hash] === r.algo;
          const wrong = checked && pick[r.hash] && pick[r.hash] !== r.algo;
          return (
            <div key={r.hash} style={{ padding: "10px 12px", borderRadius: 9, background: C.carbon, border: `1px solid ${right ? C.green : wrong ? C.red : C.lineSoft}` }}>
              <div style={{ fontFamily: MONO, fontSize: 12, color: "#8fa0c8", wordBreak: "break-all", marginBottom: 8 }}>{r.hash}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {options.map((o) => (
                  <button key={o} onClick={() => { setPick((x) => ({ ...x, [r.hash]: o })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${pick[r.hash] === o ? C.indigo : C.line}`, background: pick[r.hash] === o ? "rgba(139,123,255,.1)" : "transparent", color: pick[r.hash] === o ? C.indigo2 : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>{o}</button>
                ))}
              </div>
              {((checked && wrong) || solved) && <div style={{ marginTop: 7, fontFamily: MONO, fontSize: 11.5, color: solved ? C.green : C.amber }}>↳ {r.note}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={!all || solved}>CHECK →</Btn></div>
      {checked && !solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Some are wrong (red). Look at the length and any prefix.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ All identified - length and prefix tell you the algorithm.</div>}
      <Hints hints={[hint]} />
    </div>
  );
}

/* ── crack: really hash candidate words and match the target digest ── */
function CrackSurface({ target, salt, words, hint, reveal, onSolved }: { target: string; salt?: string; words: string[]; hint: string; reveal: string; onSolved: () => void }) {
  const [results, setResults] = useState<Record<string, { hash: string; match: boolean }>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [useSalt, setUseSalt] = useState(false);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);

  // Hashing a word only REVEALS its digest (and selects it); it never wins, and
  // the digest shows in a neutral colour so you have to actually compare it to
  // the target. Hash as many as you like, then CONFIRM the one that matches.
  async function crack(word: string) {
    const w = word.trim();
    if (!w || solved) return;
    const h = await sha256hex((salt && useSalt ? salt : "") + w);
    setResults((r) => ({ ...r, [w]: { hash: h, match: h === target } }));
    setSelected(w);
    setWrong(false);
  }
  function confirm() {
    if (!selected || solved) return;
    if (results[selected]?.match) { setSolved(true); onSolved(); }
    else setWrong(true);
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 6 }}>TARGET HASH (SHA-256)</div>
      <div style={{ fontFamily: MONO, fontSize: 12, color: C.amber, background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "9px 11px", wordBreak: "break-all" }}>{target}</div>
      {salt && (
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, fontFamily: MONO, fontSize: 12.5, color: C.soft, cursor: "pointer" }}>
          <input type="checkbox" checked={useSalt} onChange={(e) => { setUseSalt(e.target.checked); setResults({}); setSelected(null); }} />
          apply the leaked salt <span style={{ color: C.indigo2 }}>{salt}</span> before hashing (hashes {salt}+word)
        </label>
      )}
      <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, fontWeight: 700 }}>⌦ WORDLIST · tap to hash, compare the digests to the target, then confirm the match</div>
      <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
        {words.map((w) => {
          const res = results[w];
          const isSel = selected === w;
          const good = solved && res?.match;
          return (
            <button key={w} onClick={() => crack(w)} disabled={solved} className="co-opt" style={{ textAlign: "left", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "8px 12px", borderRadius: 8, border: `1px solid ${good ? C.green : isSel ? C.indigo : res ? C.lineSoft : C.line}`, background: isSel ? "rgba(139,123,255,0.08)" : C.carbon, cursor: solved ? "default" : "pointer" }}>
              <span style={{ fontFamily: MONO, fontSize: 12.5, color: good ? C.green : C.ink }}>{good ? "✓ " : ""}{w}</span>
              {res && <span style={{ fontFamily: MONO, fontSize: 11, color: good ? C.green : "#9fb0d8", wordBreak: "break-all" }}>{res.hash.slice(0, 24)}…</span>}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={lab}>or hash your own guess</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input style={{ ...inp, flex: "1 1 200px" }} value={input} onChange={(e) => setInput(e.target.value)} placeholder="type a candidate word" />
          <Btn tone="i" onClick={() => crack(input)} disabled={solved}>HASH &amp; COMPARE →</Btn>
        </div>
        {input && results[input.trim()] && <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12, color: C.soft }}>that digest is {results[input.trim()].hash.slice(0, 32)}… - does it match the target above?</div>}
      </div>
      {!solved && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Btn tone="g" onClick={confirm} disabled={!selected}>This hash matches →</Btn>
          {selected && !wrong && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>selected: {selected}</span>}
          {wrong && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.amber }}>that digest doesn&apos;t match the target. Compare again.</span>}
        </div>
      )}
      {solved && <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Cracked - that word&apos;s real SHA-256 matches the leaked hash exactly.</div>}
      <Hints hints={[hint]} revealLabel="stuck? reveal the word" onReveal={() => setInput(reveal)} />
    </div>
  );
}

/* ── a stage ── */
type Stage =
  | { kind: "identify"; title: string; goal: string; rows: IdRow[]; options: string[]; hint: string }
  | { kind: "crack"; title: string; goal: string; target: string; salt?: string; words: string[]; hint: string; reveal: string };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "identify"
        ? <IdentifySurface rows={stage.rows} options={stage.options} hint={stage.hint} onSolved={onSolved} />
        : <CrackSurface target={stage.target} salt={stage.salt} words={stage.words} hint={stage.hint} reveal={stage.reveal} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Harbour Systems) ───────────────────────── */

const ACT_STAGES: Stage[] = [
  {
    kind: "identify", title: "Identify", goal: "Stage 1 - Know what you're looking at. Before cracking, identify each leaked hash by its format - length and any prefix give the algorithm away.",
    rows: [
      { hash: "5f4dcc3b5aa765d61d8327deb882cf99", algo: "MD5", note: "32 hex characters = MD5 (old and fast)." },
      { hash: T_SUNSHINE, algo: "SHA-256", note: "64 hex characters = SHA-256." },
      { hash: "$2b$12$Kq8s3f9aBcD1eFgHiJkLuO", algo: "bcrypt", note: "Starts with $2b$ = bcrypt (salted and slow)." },
    ],
    options: ["MD5", "SHA-256", "bcrypt"],
    hint: "MD5 is 32 hex chars, SHA-256 is 64, and bcrypt starts with $2b$. The bcrypt one is the only safe choice here.",
  },
  {
    kind: "crack", title: "Crack", goal: "Stage 2 - Crack an unsalted hash. Harbour hashed passwords with a fast, unsalted SHA-256. Hash the wordlist for real and find the one whose digest matches.",
    target: T_SUNSHINE, words: ["password", "123456", "sunshine", "qwerty", "football", "monkey"],
    hint: "Tap each word to hash it live and compare. One of these common passwords matches exactly.", reveal: "sunshine",
  },
  {
    kind: "crack", title: "Salt", goal: "Stage 3 - What salt does. The admin's hash didn't match any plain word, because it's salted. Tap a few with the salt OFF to see them fail, then flip the salt on (the leak exposed it) and crack it.",
    target: T_SALTED, salt: SALT, words: ["admin", "dragon", "shadow", "master"],
    hint: "With the salt off, nothing matches - that's the whole point of salting. Tick 'apply the leaked salt', then the right word matches.", reveal: "dragon",
  },
  {
    kind: "crack", title: "Length isn't strength", goal: "Stage 4 - Longer, still weak. This password is longer, so the dev thought it was safe. Crack it to show that length doesn't help a guessable password against a fast hash.",
    target: T_LETMEIN, words: ["letmein", "password1", "welcome1", "letmein123", "iloveyou"],
    hint: "It's a classic with digits bolted on. Tap the longer variant of a very common one.", reveal: "letmein123",
  },
];

function HashAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STAGES.map(() => false));
  const stage = ACT_STAGES[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { if (si + 1 < ACT_STAGES.length) setSi(si + 1); else onCapture(); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ACT_STAGES.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? C.indigo : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? C.indigo2 : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{s.title}</span>
          </div>
        ))}
      </div>
      <StageView key={si} stage={stage} onSolved={solved} />
      {cleared[si] && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STAGES.length ? "Next stage →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: live hash + avalanche ───────────────────────── */

function LiveHashLab({ onDone }: { onDone: () => void }) {
  const [a, setA] = useState("password");
  const [b, setB] = useState("Password");
  const [ha, setHa] = useState(""); const [hb, setHb] = useState("");
  useEffect(() => { let live = true; sha256hex(a).then((h) => live && setHa(h)); return () => { live = false; }; }, [a]);
  useEffect(() => { let live = true; sha256hex(b).then((h) => live && setHb(h)); return () => { live = false; }; }, [b]);
  const changed = a !== "password" || b !== "Password";
  useEffect(() => { if (changed) onDone(); }, [changed, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · hashing is one-way, and tiny changes explode</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>These two words differ by one capital letter. Watch how completely different their real SHA-256 hashes are - and that you can&apos;t read the word back from the hash.</div>
      <div style={{ display: "grid", gap: 10 }}>
        {[[a, setA, ha] as const, [b, setB, hb] as const].map(([val, set, h], i) => (
          <div key={i}>
            <input style={inp} value={val} onChange={(e) => set(e.target.value)} />
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: "#8fa0c8", wordBreak: "break-all", marginTop: 4 }}>{h || "…"}</div>
          </div>
        ))}
      </div>
      {changed && <div style={{ marginTop: 11, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>One character changed the entire digest - that&apos;s the <b>avalanche effect</b>. And there&apos;s no way back from the hash to the word except guessing.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: pick the right storage ───────────────────────── */

function PickStorageLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => shuffle([
    { code: "Store it as a fast, old-style hash with no salt added (MD5)", ok: false, why: "Fast and unsalted (MD5), exactly what you cracked with a wordlist in seconds." },
    { code: "Store it as a fast general-purpose hash with no salt added (SHA-256)", ok: false, why: "Still a fast, unsalted general-purpose hash (SHA-256). A dictionary attack walks right through it, as in stage two." },
    { code: "Store it as a fast general-purpose hash run through twice, still no salt", ok: false, why: "Running a fast hash twice (SHA-256 of SHA-256) is still fast, and still unsalted. It barely slows a wordlist attack down." },
    { code: "Store it with a slow, automatically salted password hash (bcrypt)", ok: true, why: "bcrypt salts every password automatically and is deliberately slow, defeating rainbow tables and making brute force impractical. Argon2 and scrypt do the same." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · how should Harbour store passwords?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
        doShuffle={false}
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };

const DRILLS: DrillCfg[] = [
  {
    client: "Brightpost Media",
    brief: "Brightpost leaked a hash. Identify its algorithm, then crack it for real. No walkthrough.",
    stages: [{ kind: "crack", title: "Crack", goal: "Hash the list and crack Brightpost's unsalted SHA-256.", target: T_SUNSHINE, words: ["letmein", "sunshine", "welcome", "abc123"], hint: "A cheerful common password - tap to hash each.", reveal: "sunshine" }],
    success: "Cracked an unsalted SHA-256 by hashing a wordlist - fast hashes fall to a dictionary. Finding logged.",
  },
  {
    client: "Tideway Council",
    brief: "Tideway's hashes are salted, but the salt leaked too. Crack the account.",
    stages: [{ kind: "crack", title: "Salted", goal: "Flip the leaked salt on, then crack it.", target: T_SALTED, salt: SALT, words: ["dragon", "council", "tideway"], hint: "Nothing matches until you apply the salt - then the right word does.", reveal: "dragon" }],
    success: "A leaked salt makes salting worthless - cracked it with salt+word. Finding logged.",
  },
  {
    client: "Flux Fitness",
    brief: "Flux's dump has mixed hash types. Identify each before you waste time cracking. Trickier.",
    stages: [{ kind: "identify", title: "Identify", goal: "Classify each hash by algorithm.", rows: [
      { hash: "098f6bcd4621d373cade4e832627b4f6", algo: "MD5", note: "32 hex = MD5." },
      { hash: "$2b$10$abcdefghijklmnopqrstuv", algo: "bcrypt", note: "$2b$ = bcrypt." },
    ], options: ["MD5", "SHA-256", "bcrypt"], hint: "32 hex = MD5; $2b$ = bcrypt. Don't waste time cracking the bcrypt one." }],
    success: "Identified the types so you only attack the crackable one - bcrypt isn't worth your time. Finding logged.",
  },
  {
    client: "Oakline Store",
    brief: "The full field job to finish on. Identify Oakline's hash, then crack it. Chain it yourself.",
    stages: [
      { kind: "identify", title: "Identify", goal: "Step 1: identify the hash type.", rows: [{ hash: T_LETMEIN, algo: "SHA-256", note: "64 hex = SHA-256." }], options: ["MD5", "SHA-256", "bcrypt"], hint: "64 hex characters." },
      { kind: "crack", title: "Crack", goal: "Step 2: crack it for real.", target: T_LETMEIN, words: ["password", "letmein123", "oakline", "welcome"], hint: "A classic with digits appended.", reveal: "letmein123" },
    ],
    success: "Identified then cracked an unsalted SHA-256, start to finish. Finding logged.",
  },
];

function DrillRunner({ stages, success, onSolved }: { stages: Stage[]; success: string; onSolved: () => void }) {
  const [si, setSi] = useState(0);
  const [done, setDone] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (si + 1 < stages.length) { setSi((n) => n + 1); setCleared(false); } else { setDone(true); onSolved(); } }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {stages.length > 1 && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>Step {si + 1} of {stages.length}</div>}
      {!done && <StageView key={si} stage={stages[si]} onSolved={() => setCleared(true)} />}
      {!done && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {si + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{si + 1 < stages.length ? "Next step →" : "Done →"}</Btn>
        </div>
      )}
      {done && <div className="co-anim co-pop" style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55`, fontSize: 13, color: "#bff3d3", lineHeight: 1.5 }}>✓ {success}</div>}
    </div>
  );
}

function ConsolidationDrills({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(DRILLS.map(() => false));
  const d = DRILLS[i];
  function onSolved() { setSolved((s) => { const n = [...s]; n[i] = true; return n; }); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DRILLS.map((dr, k) => (
          <div key={dr.client} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${k === i ? C.indigo : C.lineSoft}`, background: solved[k] ? "rgba(85,217,140,.08)" : k === i ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: solved[k] ? C.green : k === i ? C.indigo2 : C.mute, fontWeight: 700 }}>{solved[k] ? "✓" : `drill ${k + 1}`}</span>
          </div>
        ))}
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{d.client}</div>
        <p style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>{d.brief}</p>
      </div>
      <DrillRunner key={d.client} stages={d.stages} success={d.success} onSolved={onSolved} />
      {solved[i] && (
        <div style={{ display: "flex" }}>
          <Btn tone="g" onClick={() => { if (i + 1 < DRILLS.length) setI(i + 1); else onDone(); }} style={{ marginLeft: "auto" }}>{i + 1 < DRILLS.length ? "Next drill →" : "On to the debrief →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── capstone ───────────────────────── */

const CAP_STAGES: Stage[] = [
  { kind: "identify", title: "Triage", goal: "Sableline's whole user table leaked. Triage it: identify each hash so you know which are worth attacking.", rows: [
    { hash: T_SUNSHINE, algo: "SHA-256", note: "64 hex = SHA-256 (crackable)." },
    { hash: "$2b$12$Zx9kLmNoPqRsTuVwXyZ01a", algo: "bcrypt", note: "$2b$ = bcrypt (leave it)." },
  ], options: ["MD5", "SHA-256", "bcrypt"], hint: "64 hex = SHA-256; $2b$ = bcrypt. Only the SHA-256 one is worth cracking." },
  { kind: "crack", title: "Crack", goal: "Crack the SHA-256 account for real.", target: T_SUNSHINE, words: ["summer", "sunshine", "sableline", "password"], hint: "A warm, common one.", reveal: "sunshine" },
  { kind: "crack", title: "Salted admin", goal: "Finish it: the admin is salted, but the salt leaked. Apply it and crack the admin.", target: T_SALTED, salt: SALT, words: ["dragon", "admin", "sableline"], hint: "Apply the salt, then the right word matches.", reveal: "dragon" },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (phase + 1 < CAP_STAGES.length) { setPhase((p) => p + 1); setCleared(false); } else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full crack · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={() => setCleared(true)} />}
      {!won && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {phase + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{phase + 1 < CAP_STAGES.length ? "Next step →" : "Finish the challenge →"}</Btn>
        </div>
      )}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}hashes_are_0nly_as_g00d_as_the_alg0{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Triaged, cracked the fast hashes, and beat a leaked salt - real hashing, start to finish, in your own browser.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE9: ModuleDef = {
  code: "M-09",
  moduleNo: 9,
  title: "Passwords & Hashes",
  client: "Harbour Systems",
  brief:
    "A deep engagement on how passwords are stored - and how badly it's often done. Harbour Systems had a database leak and the user table is now a test copy in your hands. The full job, with real hashing in your own browser: identify each hash, crack an unsalted one against a wordlist, watch a salt defeat your list and then beat it with the leaked salt, and prove that length alone doesn't save a guessable password. Then four field jobs for new clients, and a final challenge you run start to finish. Every hash is computed for real; nothing leaves your machine.",
  industry: {
    tag: "Sites don't store your password, they store a hash of it. Store that badly and a laptop cracks it in seconds.",
    motif: { pre: "leaked hash == ", hit: "sha256('sunshine')", note: "they match, so the password was 'sunshine'" },
    primer: {
      term: "Hashing",
      what: "A website should never store your actual password. Instead it stores a hash: a one-way scramble that is easy to compute but cannot be reversed. When you log in, it hashes what you typed and checks it matches the stored hash. The catch: if the hash is fast and unsalted, an attacker who steals the database can just hash millions of common passwords and look for matches.",
      example: "sha256(\"sunshine\") = 9f86d081...",
      returns: "Hashes can't be reversed, but they CAN be guessed: hash a wordlist and compare. A fast hash like SHA-256 lets a single graphics card try billions of guesses a second, which is exactly what you will do here, for real.",
    },
    learn: [
      "Identify a hash by its format: length and prefix give the algorithm away.",
      "Crack an unsalted hash by hashing a wordlist and matching the digest.",
      "See what a salt does, then crack past it using the leaked salt.",
      "Prove that length alone doesn't save a guessable password against a fast hash.",
    ],
    engines: [
      { name: "hashcat", color: "#4ade80", blurb: "The fastest GPU password-cracker: runs wordlists and rules against stolen hashes. You'll do its core move by hand.", here: true, icon: "tool" },
      { name: "John the Ripper", color: "#5fe6ff", blurb: "The classic open-source cracker; auto-detects the hash type and goes to work.", icon: "tool" },
      { name: "MD5 / SHA-256", color: "#f26d72", blurb: "Fast, general-purpose hashes: billions of guesses a second on a GPU, so wrong for storing passwords.", icon: "key" },
      { name: "bcrypt", color: "#ffb347", blurb: "A deliberately slow, salted password hash: thousands a second, not billions. The old reliable.", icon: "lock" },
      { name: "Argon2", color: "#8b7bff", blurb: "The modern winner: slow AND memory-hard, so even custom hardware struggles. OWASP's first choice.", icon: "lock" },
    ],
    headline: {
      masthead: "THE LEAK LEDGER",
      dateline: "2009 · BREACH DISCLOSURE + SECURITY ANALYSIS",
      title: "32 million passwords stored in plain text, and crackers still use the list",
      body: "RockYou, a maker of social-media apps, kept all its users' passwords as plain text, no hashing at all, behind a database flaw anyone could exploit. When it leaked, about 32 million passwords spilled out, the most common being '123456'. Stripped of duplicates, that list became 'rockyou.txt', and more than fifteen years later it is still the first wordlist password-crackers reach for.",
      stat: "32M",
      statLabel: "PASSWORDS, IN PLAIN TEXT",
      why: "One careless site armed every attacker since with a ready-made list of what people actually choose. Passwords are the lock on almost everything, which is why how they're stored, and cracked, is worth knowing cold.",
    },
    realWorld:
      "Passwords protect almost every account, but they're only as safe as the way a site stores them. Store them in plain text or behind a fast, unsalted hash, and a single stolen database hands an attacker millions of real passwords in minutes on ordinary hardware. The defence, slow salted hashing plus a second factor, is well known; the attack is one wordlist away.",
    now: {
      stat: "#7",
      body: "Password problems fall under Authentication Failures, ranked seventh (A07) on the 2025 OWASP Top 10. And people still make it easy: the most common password in NordPass's 2024 list is '123456', and surveys find most people reuse a password across several accounts, so one leak unlocks many.",
    },
    recent: {
      year: "2024",
      title: "Ten billion passwords in one file",
      body: "In July 2024 someone posted 'rockyou2024.txt', a compilation of nearly 10 billion unique passwords gathered from thousands of past breaches, the largest such list ever assembled. On modern hardware the scale barely matters: a single high-end graphics card can try billions of fast-hash guesses every second, so a weak password falls almost instantly.",
    },
    ahead:
      "AI is being pointed at guessing too: tools trained on billions of leaked passwords learn the patterns people actually use and generate better guesses than old rules alone. The long-term answer is to stop using passwords: passkeys replace them with a device key that can't be guessed, phished or cracked, and adoption is climbing fast, with billions already in use. Until then, slow salted hashing plus a second factor is what buys a stolen database time.",
    role:
      "This is day-one knowledge for penetration testers, security engineers and identity (IAM) specialists. Knowing how hashes fall is how you learn to store them so they don't.",
    roles: ["Penetration tester", "Security engineer", "Identity & access (IAM) engineer", "SOC analyst"],
  },
  lesson: {
    blocks: [
      { h: "Hashing stores passwords - in theory", body: "A site should never store your actual password. Instead it stores a hash: a one-way fingerprint. When you log in, it hashes what you typed and compares fingerprints. Done right, even someone who steals the database can't turn the hashes back into passwords. Done wrong, they barely have to try." },
      { h: "Why weak hashing falls", body: "Two problems. First, people pick common passwords, and a fast hash of '123456' is always the same value - so attackers precompute huge rainbow tables of hash to password and just look yours up, or hash a wordlist and compare (a dictionary attack). Second, speed: fast hashes let an attacker try millions of guesses a second." },
      { h: "Unsalted means one crack hits everyone", body: "If there's no salt, identical passwords produce identical hashes. So the moment you crack one person's 'password123', you've cracked everyone who used it, and your precomputed table covers the whole database at once. Unsalted fast hashing is the difference between a leak that's a non-event and one that's a catastrophe." },
      { h: "Salt, and slow", body: "A salt is a unique random value added to each password before hashing, so the same password gets a different hash every time - which makes precomputed tables useless and forces the attacker to crack each account separately. On top of that, proper password hashes (bcrypt, scrypt, Argon2) are deliberately slow, so even one-at-a-time guessing is painfully expensive." },
      { h: "Even SHA-256 is wrong for passwords", body: "The surprise: a strong hash like SHA-256 is still the wrong choice for passwords, because it's fast. Fast is exactly what you don't want when someone is guessing billions of times. Use a purpose-built, slow, salted password hash - bcrypt, scrypt or Argon2 - never a general-purpose one, however modern." },
    ],
    Interactive: LiveHashLab,
    summary: [
      "Sites store a one-way hash of your password, not the password itself.",
      "Fast hashes + common passwords = crackable by rainbow tables or a dictionary attack.",
      "Unsalted means identical passwords share a hash, so one crack hits everyone.",
      "A salt makes each hash unique (defeating tables); slow hashing makes guessing expensive.",
      "Use a slow, salted password hash (bcrypt/scrypt/Argon2) - even SHA-256 is too fast for passwords.",
    ],
    check: {
      q: "Why does salting defeat a rainbow table?",
      options: [
        { text: "It makes each password's stored hash unique, so a precomputed table matches none of them.", correct: true, feedback: "Right. The attacker would have to rebuild a whole table per salt, which is impractical." },
        { text: "It encrypts the stored hash so an attacker who steals it cannot read it back.", feedback: "Salting isn't encryption. The hash is still visible; it is just unique per user now." },
        { text: "It lengthens each user's password, so guessing the password itself takes far longer.", feedback: "The salt isn't part of the user's password; it changes the stored hash, not the password's length." },
        { text: "It slows the hashing down, so trying millions of guesses becomes far too expensive.", feedback: "That is what a slow hash does; salt is a separate idea that makes each stored hash unique." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Harbour Systems leaked user table (test copy)",
    inScope: "cracking the hashes in the provided dump, in your browser",
    offLimits: "logging into real accounts, the live database, other systems",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Identify the hashes, crack an unsalted one against the wordlist, see what a salt does and beat the leaked one, then crack a longer-but-weak password. Every hash is computed for real in your browser - tap a word to hash it and compare. The bcrypt ones aren't worth your time; that's the point.",
  hint: "Work the stages in order. Tap a word to hash it live and compare to the target. For the salted stage, nothing matches until you tick 'apply the leaked salt'. MD5 is 32 hex, SHA-256 is 64, bcrypt starts $2b$.",
  plan: [
    { label: "Identify", goal: "Identify each leaked hash by its format: length and any prefix give the algorithm away." },
    { label: "Crack", goal: "Hash the wordlist for real and find the one whose SHA-256 digest matches the unsalted hash." },
    { label: "Salt", goal: "The admin's hash is salted. Watch plain words fail, then apply the leaked salt and crack it." },
    { label: "Length isn't strength", goal: "Crack a longer but still guessable password, proving length alone doesn't beat a fast hash." },
  ],
  Act: HashAct,
  flag: "flag{unsalt3d_hash_cr4cked}",
  defend: {
    blocks: [
      { h: "The fix: salted, slow hashes", body: "Store passwords with a modern password-hashing algorithm - bcrypt, scrypt, or Argon2 - which salt automatically and are deliberately slow. Never use fast general-purpose hashes like MD5, SHA-1 or even SHA-256 for passwords, and never store them unsalted. This single change is what separates a 'we leaked hashes but nobody could crack them' incident from a total compromise." },
      { h: "Keep the salt's value", body: "A salt only helps while it's secret per-record and random. The common mistake you exploited is leaking or reusing it; store each password's unique salt alongside its hash, generated fresh and randomly. Modern password hashes handle this for you, which is another reason to use them instead of rolling your own." },
      { h: "Defence in depth", body: "Hashing protects the stored password; the rest protects the account. Encourage long passphrases and check them against known-breached lists so 'letmein123' is rejected outright. Add multi-factor authentication so a cracked password still isn't enough. And respond to leaks fast - the sooner you force resets, the less a stolen hash is worth." },
    ],
    Interactive: PickStorageLab,
    check: {
      q: "Two breached sites both salt their passwords - one used SHA-256, the other bcrypt. Why do the bcrypt site's users fare far better?",
      options: [
        { text: "bcrypt is deliberately slow, so each guess costs the attacker far more; salt stops precomputed tables but doesn't slow guessing a single known hash.", correct: true, feedback: "Right - salt and slowness do different jobs. Salt kills rainbow tables; the deliberate slowness is what makes brute-forcing each hash impractical." },
        { text: "bcrypt encrypts the password with a secret key, so the attacker can't read it back without stealing that key too.", feedback: "bcrypt hashes, it doesn't encrypt - there's no key to steal. Its advantage here is that it's slow by design." },
        { text: "bcrypt hides the salt inside the hash, so unlike SHA-256 the attacker never gets to see the salt at all.", feedback: "The salt isn't meant to be secret - it's stored with the hash in both cases. The real difference is bcrypt's cost, not a hidden salt." },
        { text: "SHA-256 produces a shorter output, which leaves the attacker fewer possibilities to search through.", feedback: "Hash length isn't the issue; SHA-256 being fast is - it lets an attacker try millions of guesses a second." },
      ],
    },
  },
  finding: {
    title: "Passwords stored as fast, unsalted hashes",
    where: "Harbour Systems · users table · password_hash column",
    severity: "High",
    cvss: "7.5",
    impact: "Most password hashes are fast and unsalted, and crack instantly against a dictionary of common passwords, exposing plaintext passwords for reuse across accounts and services. A leaked per-record salt provided no protection.",
    fix: "Rehash all passwords with a salted, slow algorithm (bcrypt/scrypt/Argon2) on next login; store a fresh random salt per password; force resets for cracked accounts; add MFA and breached-password checks.",
  },
  cheatsheet: {
    title: "Passwords & hashing quick reference",
    blurb: "How passwords are stored, how they get cracked, and how to store them so they don't, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "How a password is stored decides how fast it falls. Same password, three storage choices, three very different outcomes.",
      cols: ["the leak holds", "what it is", "how fast it falls"],
      rows: [
        ["5f4dcc3b... (32 hex)", "an MD5 hash", "billions/sec on a GPU: instant"],
        ["unsalted SHA-256", "a fast hash, no salt", "hash a wordlist, compare: seconds"],
        ["$2b$12$... ", "a slow, salted bcrypt hash", "thousands/sec: deliberately painful"],
      ],
    },
    groups: [
      {
        heading: "How passwords are stored",
        entries: [
          { code: "hash", what: "A one-way scramble of your password. The site stores this, not the password, and compares hashes at login.", example: "sha256('sunshine') = 9f86d081..." },
          { code: "salt", what: "A random value mixed in before hashing, unique per user, so identical passwords get different hashes.", example: "hash(salt + password); salt stored alongside" },
          { code: "slow hash", what: "A hash made deliberately slow (bcrypt/Argon2) so guessing is expensive even on a GPU.", example: "bcrypt does thousands/sec, not billions" },
          { code: "identify by format", what: "Length and prefix reveal the algorithm.", example: "32 hex = MD5, 64 hex = SHA-256, $2b$ = bcrypt" },
        ],
      },
      {
        heading: "How they get cracked",
        entries: [
          { code: "wordlist (dictionary)", what: "Hash every word in a list of common and leaked passwords, then compare to the stolen hash.", example: "rockyou.txt, ~14M real passwords" },
          { code: "unsalted + fast = instant", what: "A fast, unsalted hash lets a GPU try billions a second, so common passwords fall immediately.", example: "MD5: ~150 billion guesses/sec on one card" },
          { code: "password reuse", what: "People reuse passwords, so one cracked hash often unlocks their other accounts too.", example: "same password on email + bank + game" },
          { code: "length isn't enough", what: "A long but predictable password still falls to a wordlist; randomness and slowness are what matter.", example: "'letmein123' is long and still instant" },
        ],
      },
      {
        heading: "The fix",
        entries: [
          { code: "Argon2 / bcrypt", what: "Store passwords with a slow, salted hash; Argon2 is the current first choice, bcrypt is fine.", example: "Argon2id with sensible cost settings" },
          { code: "salt every hash", what: "Use a unique random salt per user so identical passwords never share a hash.", example: "16+ random bytes per password" },
          { code: "MFA", what: "A second factor means a cracked password alone still isn't enough to get in.", example: "password + an app code or a passkey" },
          { code: "passkeys", what: "Replace the password entirely with a device key that can't be guessed, phished or cracked.", example: "sign in with Face ID / fingerprint, no password" },
        ],
      },
    ],
  },
  takeaway: "A fast, unsalted hash is a password waiting to be read. Store passwords with a slow, salted algorithm like bcrypt or Argon2.",
  outcome: [
    "Identify a leaked hash from its length and prefix - 32 hex is MD5, 64 is SHA-256, a $2b$ prefix is bcrypt.",
    "Crack a fast, unsalted hash by hashing a wordlist until a digest matches, recovering the plaintext password.",
    "Explain why a per-user salt and a deliberately slow hash like bcrypt or Argon2 defeat your wordlist, and why even SHA-256 is too fast for passwords.",
  ],
  rep: 50,
  repRank: "Operator",
  repTo: "395 / 600 to Lead Operator",
  next: "NEXT MODULE · Network Recon →",
};

export default function Module9() {
  return <Engagement mod={MODULE9} />;
}
