"use client";

/* Module 8 - Cryptography (DEPTH STANDARD, built to the M5 framework).
 *
 * Real crypto, computed in the browser (zero egress): decode a base64 "token",
 * brute-force a Caesar shift with live decoding, brute-force a single-byte XOR
 * key by scoring printability, and classify what's actually encrypted vs merely
 * encoded. Teaches encoding vs hashing vs encryption, why tiny keyspaces fall,
 * and what real protection looks like. Shape mirrors M5: hover glossary,
 * interactive lesson lab, de-biased check, a FOUR-stage capture with a hint
 * ladder, FOUR drills, and a chained capstone. */

import { useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, AnswerReveal } from "./Engagement";

/* ───────────────────────── real transforms ───────────────────────── */

function b64decode(s: string): string { try { return atob(s.trim()); } catch { return ""; } }
function caesar(s: string, n: number): string { return s.replace(/[a-z]/gi, (c) => { const b = c <= "Z" ? 65 : 97; return String.fromCharCode(((c.charCodeAt(0) - b + n) % 26) + b); }); }
function xorHex(hex: string, key: number): string {
  const h = hex.replace(/[^0-9a-f]/gi, "");
  let out = "";
  for (let i = 0; i < h.length; i += 2) out += String.fromCharCode(parseInt(h.slice(i, i + 2), 16) ^ key);
  return out;
}
function printableRatio(s: string): number { if (!s) return 0; let n = 0; for (const c of s) { const x = c.charCodeAt(0); if (x >= 32 && x <= 126) n++; } return n / s.length; }

const B64_TOKEN = "YWRtaW46U3VuZjFzaCE5Mg=="; // "admin:Sunf1sh!92"
const CAESAR_CT = "aol chbsa jvkl pz 7741";    // caesar(+7); decode at shift 19
const XOR_HEX = "4f535e1b5f49544b1b4b5452554f1b52481b4b525e491b5552555e"; // XOR key 0x3b -> "the drop point is pier nine"

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "encoding", definition: "Reformatting data so it travels safely (like base64). Reversible by anyone with no key - it protects nothing.", example: "base64 is like writing a note in neat block capitals: anyone can read it straight back, it only changes the shape, it hides nothing." },
  { term: "hashing", definition: "A one-way fingerprint of data. You can't reverse it; used for passwords and integrity, not secrecy.", example: "A hash is like blending a smoothie: easy to make from the fruit, impossible to get the whole fruit back out of the glass." },
  { term: "encryption", definition: "Scrambling data so only someone with the secret key can get it back. The only one of the three that actually hides a secret.", example: "Locking a diary with a key only you own is encryption: without the key the pages are just useless scribble." },
  { term: "base64", definition: "An encoding that writes any data in plain letters, digits, + and /, often padded with =. Looks scrambled, isn't secret.", example: "When you paste a picture into an email it often travels as a long base64 string of letters ending in '=' signs; it looks like gibberish but it is trivial to turn back into the image." },
  { term: "cipher", definition: "A method of scrambling a message. Classic ones (Caesar, simple XOR) are weak because their keys are tiny.", example: "A secret-decoder ring that shifts every letter is a cipher, but with so few settings a friend could crack your note over breakfast." },
  { term: "Caesar cipher", definition: "Shifts every letter by a fixed amount. Only 25 possible shifts, so you can just try them all.", example: "Shift every letter forward by 3 and 'HELLO' becomes 'KHOOR'; since there are only 25 shifts, you can simply try them all by hand." },
  { term: "XOR", definition: "A bitwise operation used in simple ciphers. XORing with the same key twice returns the original - and a one-byte key has only 256 possibilities.", example: "XOR is like a flip switch: run the data through the same one-byte key a second time and it flips right back to the original, and there are only 256 keys to test." },
  { term: "key", definition: "The secret that encryption depends on. Security comes from the key being secret and the keyspace being huge - not from hiding the method.", example: "A good padlock isn't a secret, everyone knows how padlocks work; the safety is entirely in your key being secret and hard to copy." },
  { term: "keyspace", definition: "How many possible keys there are. 25 (Caesar) or 256 (one-byte XOR) is trivially brute-forced; a real key has astronomically more.", example: "A 4-digit phone PIN has a keyspace of only 10,000, which a thief can grind through; a real encryption key has so many that you couldn't test them all in a billion years." },
  { term: "plaintext", definition: "The original, readable message - before encryption or after you've broken it.", example: "'the drop point is pier nine' is the plaintext: the plain readable message before it gets scrambled into code." },
  { term: "ciphertext", definition: "The scrambled output of a cipher - what you intercept and try to break.", example: "The scrambled jumble '4f535e1b...' you grab off the wire is the ciphertext, meaningless to you until you crack it." },
  { term: "brute force", definition: "Trying every possible key until the output is readable. Devastating against small keyspaces, hopeless against real ones.", example: "Trying 0000, then 0001, then 0002 on a bike lock until it clicks open is brute force: quick on 4 digits, impossible on a long key." },
  { term: "AES", definition: "A modern, strong encryption algorithm with a huge keyspace - the right kind of tool when you genuinely need secrecy.", example: "When WhatsApp and online banking protect your data they reach for AES, whose keyspace is far too vast to ever brute-force." },
  { term: "key management", definition: "Keeping keys secret and separate from the data - the hard, important part. A key left in the code protects nothing.", example: "Writing the safe's combination on a sticky note stuck to the safe defeats the point; key management is keeping the key somewhere the data isn't." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13 };
const box: React.CSSProperties = { fontFamily: MONO, fontSize: 13, background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 9, padding: "10px 12px", wordBreak: "break-all" };

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

/* ── stage 1: pick the right transform (encoding is not encryption) ── */
function TransformSurface({ onSolved }: { onSolved: () => void }) {
  const [out, setOut] = useState<{ kind: string; label: string; text: string; readable: boolean } | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  // Trying a transform only SHOWS its output; it never wins. Try as many as you
  // like, see which one turns the token into something readable, then confirm it.
  function go(kind: "b64" | "rot13" | "hex" | "enc") {
    if (solved) return;
    if (kind === "b64") { const t = b64decode(B64_TOKEN); setOut({ kind, label: "base64 decode", text: t || "(not valid base64)", readable: t.includes(":") }); }
    else if (kind === "rot13") setOut({ kind, label: "ROT13", text: caesar(B64_TOKEN, 13), readable: false });
    else if (kind === "hex") setOut({ kind, label: "hex decode", text: "(not valid hex - it's base64)", readable: false });
    else setOut({ kind, label: "assume encrypted", text: "If it were truly encrypted you'd need the key. But look at the shape: it ends in = and uses only base64 characters.", readable: false });
    setWrong(false);
  }
  function confirm() { if (!out || solved) return; if (out.readable) { setSolved(true); onSolved(); } else setWrong(true); }
  const B = (kind: "b64" | "rot13" | "hex" | "enc", label: string) => <Btn tone={out?.kind === kind ? "i" : "ghost"} onClick={() => go(kind)} disabled={solved}>{label}</Btn>;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 10 }}>// intercepted from a config file, labelled &quot;encrypted auth token&quot;</div>
      <div style={{ ...box, color: C.amber }}>{B64_TOKEN}</div>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute, margin: "12px 0 8px" }}>try a few ways to read it, then confirm the one that actually works</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {B("b64", "Decode base64")}{B("rot13", "Try ROT13")}{B("hex", "Try hex")}{B("enc", "Assume encrypted")}
      </div>
      {out && (
        <div style={{ marginTop: 14, ...box, borderColor: solved && out.readable ? C.green : C.lineSoft }}>
          <div style={{ fontSize: 10.5, letterSpacing: ".1em", color: C.mute, marginBottom: 7 }}>{out.label.toUpperCase()}</div>
          <div style={{ color: solved && out.readable ? C.green : "#8fa0c8" }}>{out.text}</div>
          {solved && out.readable && <div style={{ color: C.green, marginTop: 9 }}>✓ Only base64 - reversible by anyone, no key. The &quot;token&quot; is a plaintext admin credential.</div>}
        </div>
      )}
      {!solved && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Btn tone="g" onClick={confirm} disabled={!out}>This reveals the credential →</Btn>
          {wrong && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.amber }}>that output still isn&apos;t readable. Try another transform.</span>}
        </div>
      )}
      <Hints hints={["It ends in = and uses only base64 characters. Decode base64 - encoding needs no key."]} />
    </div>
  );
}

/* ── stage 2: Caesar brute force with live decode ── */
function CaesarSurface({ onSolved, ct = CAESAR_CT, win = "vault", answerShift = 19 }: { onSolved: () => void; ct?: string; win?: string; answerShift?: number }) {
  const [shift, setShift] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  const decoded = caesar(ct, shift);
  // Stepping the shift only re-decodes; it never wins, and the output stays a
  // neutral colour so you have to actually read it. Stop on the shift that
  // turns it into English, then confirm.
  function set(n: number) { setShift(((n % 26) + 26) % 26); setWrong(false); }
  function confirm() { if (solved) return; if (decoded.includes(win)) { setSolved(true); onSolved(); } else setWrong(true); }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 6 }}>INTERCEPTED CIPHERTEXT (Caesar)</div>
      <div style={{ ...box, color: C.amber }}>{ct}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "14px 0 10px" }}>
        <Btn tone="ghost" onClick={() => set(shift - 1)}>- shift</Btn>
        <span style={{ fontFamily: MONO, fontSize: 14, color: C.indigo2, minWidth: 70, textAlign: "center" }}>shift {shift}</span>
        <Btn tone="ghost" onClick={() => set(shift + 1)}>+ shift</Btn>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>only 25 possibilities - just try them</span>
      </div>
      <div style={{ ...box, color: solved ? C.green : "#8fa0c8", borderColor: solved ? C.green : C.lineSoft }}>{decoded}</div>
      {!solved && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
          <Btn tone="g" onClick={confirm}>This is readable →</Btn>
          {wrong && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.amber }}>that still isn&apos;t English. Keep stepping the shift.</span>}
        </div>
      )}
      {solved && <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, marginTop: 10 }}>✓ Readable - a 25-key cipher falls to brute force in seconds.</div>}
      <Hints hints={[`Step the shift until the text turns into English. The right shift is ${answerShift}.`]} revealLabel="stuck? jump to the shift" onReveal={() => set(answerShift)} />
    </div>
  );
}

/* ── stage 3: single-byte XOR brute force by printability ── */
function XorSurface({ onSolved, hex = XOR_HEX, win = "drop point", answerKey = 0x3b }: { onSolved: () => void; hex?: string; win?: string; answerKey?: number }) {
  const [cands, setCands] = useState<{ key: number; text: string }[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  function brute() {
    const found: { key: number; text: string }[] = [];
    for (let k = 0; k < 256; k++) { const t = xorHex(hex, k); if (printableRatio(t) > 0.95 && /[aeiou]{1}/i.test(t) && t.includes(" ")) found.push({ key: k, text: t }); }
    setCands(found.slice(0, 6)); setSelected(null); setWrong(false);
  }
  // Brute-force reveals the candidates that LOOK like text; not all are real
  // sentences. Read them, select the real message, then confirm.
  function confirm() { if (selected === null || solved) return; const c = cands?.find((x) => x.key === selected); if (c && c.text.includes(win)) { setSolved(true); onSolved(); } else setWrong(true); }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 6 }}>INTERCEPTED CIPHERTEXT (single-byte XOR, hex)</div>
      <div style={{ ...box, color: C.amber }}>{hex}</div>
      <div style={{ margin: "14px 0 10px" }}><Btn tone="i" onClick={brute} disabled={solved}>BRUTE-FORCE ALL 256 KEYS →</Btn></div>
      {cands && (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute }}>keys whose output looks like text ({cands.length}) - read them and select the real message:</div>
          {cands.map((c) => {
            const isSel = selected === c.key; const good = solved && c.text.includes(win);
            return (
              <button key={c.key} onClick={() => { if (!solved) { setSelected(c.key); setWrong(false); } }} disabled={solved} className="co-opt" style={{ textAlign: "left", display: "flex", gap: 10, flexWrap: "wrap", padding: "8px 12px", borderRadius: 8, border: `1px solid ${good ? C.green : isSel ? C.indigo : C.lineSoft}`, background: isSel ? "rgba(139,123,255,0.08)" : C.carbon, cursor: solved ? "default" : "pointer" }}>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>key 0x{c.key.toString(16).padStart(2, "0")}</span>
                <span style={{ fontFamily: MONO, fontSize: 12.5, color: good ? C.green : C.soft }}>{c.text}</span>
              </button>
            );
          })}
          {!solved && (
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
              <Btn tone="g" onClick={confirm} disabled={selected === null}>This is the real message →</Btn>
              {wrong && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.amber }}>that one isn&apos;t a real sentence. Read the others.</span>}
            </div>
          )}
        </div>
      )}
      {solved && <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, marginTop: 10 }}>✓ Cracked - 256 keys is nothing; scoring by readability finds the one instantly.</div>}
      <Hints hints={[`Brute-force all 256 keys, then read the output that's actually English (key 0x${answerKey.toString(16).padStart(2, "0")}).`]} />
    </div>
  );
}

/* ── stage 4: classify encoding/cipher (reversible, no key) vs real encryption ── */
type ClassItem = { label: string; sample: string; encrypted: boolean; note: string };
function ClassifySurface({ items, onSolved }: { items: ClassItem[]; onSolved: () => void }) {
  const [pick, setPick] = useState<Record<string, "rev" | "enc">>({});
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);
  const all = items.every((it) => pick[it.label]);
  function check() { setChecked(true); if (items.every((it) => (pick[it.label] === "enc") === it.encrypted)) { setSolved(true); onSolved(); } }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// which of these actually NEED a key to reverse, and which can anyone read?</div>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it) => {
          const p = pick[it.label]; const right = checked && (p === "enc") === it.encrypted; const wrong = checked && p && (p === "enc") !== it.encrypted;
          return (
            <div key={it.label} style={{ padding: "10px 12px", borderRadius: 9, background: C.carbon, border: `1px solid ${right ? C.green : wrong ? C.red : C.lineSoft}` }}>
              <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.ink }}>{it.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "#6b7490", wordBreak: "break-all", margin: "4px 0 8px" }}>{it.sample}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => { setPick((x) => ({ ...x, [it.label]: "rev" })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${p === "rev" ? C.amber : C.line}`, background: "transparent", color: p === "rev" ? C.amber : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>anyone can read</button>
                <button onClick={() => { setPick((x) => ({ ...x, [it.label]: "enc" })); setChecked(false); }} className="co-opt" style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${p === "enc" ? C.green : C.line}`, background: "transparent", color: p === "enc" ? C.green : C.soft, fontFamily: MONO, fontSize: 11.5, cursor: "pointer" }}>needs a key</button>
              </div>
              {((checked && wrong) || solved) && <div style={{ marginTop: 7, fontFamily: MONO, fontSize: 11.5, color: solved ? C.green : C.amber }}>↳ {it.note}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}><Btn tone="g" onClick={check} disabled={!all || solved}>CHECK →</Btn></div>
      {checked && !solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.red }}>Some are wrong (red). Only real encryption needs a key.</div>}
      {solved && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ Only the AES blob actually needs a key - the rest are reversible by anyone.</div>}
      <Hints hints={["Base64, hex and ROT13 are all reversible with no secret. Only the random-looking AES ciphertext needs a key."]} />
    </div>
  );
}

/* ── a stage ── */
type Stage =
  | { kind: "transform"; title: string; goal: string }
  | { kind: "caesar"; title: string; goal: string; ct?: string; win?: string; answerShift?: number }
  | { kind: "xor"; title: string; goal: string; hex?: string; win?: string; answerKey?: number }
  | { kind: "classify"; title: string; goal: string; items: ClassItem[] };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "transform" && <TransformSurface onSolved={onSolved} />}
      {stage.kind === "caesar" && <CaesarSurface onSolved={onSolved} ct={stage.ct} win={stage.win} answerShift={stage.answerShift} />}
      {stage.kind === "xor" && <XorSurface onSolved={onSolved} hex={stage.hex} win={stage.win} answerKey={stage.answerKey} />}
      {stage.kind === "classify" && <ClassifySurface items={stage.items} onSolved={onSolved} />}
    </div>
  );
}

const ACT_STAGES: Stage[] = [
  { kind: "transform", title: "Encoding", goal: "Stage 1 - Encoding isn't encryption. A dev left an 'encrypted auth token' in a config file. Look at its shape, then read it the obvious way." },
  { kind: "caesar", title: "Caesar", goal: "Stage 2 - A cipher with 25 keys. This message used a Caesar cipher - each letter shifted by a fixed amount. Step through the shifts until it reads as English." },
  { kind: "xor", title: "XOR", goal: "Stage 3 - A one-byte key. This was XOR'd with a single secret byte, so there are only 256 possibilities. Brute-force them all and pick the one that decodes to real text." },
  { kind: "classify", title: "Real vs fake", goal: "Stage 4 - Tell them apart. Here are four 'protected' values. Mark which anyone can read and which genuinely need a key - that judgment is the whole module.", items: [
    { label: "base64", sample: "c2VjcmV0X3Rva2Vu", encrypted: false, note: "base64 - reversible by anyone, no key." },
    { label: "hex", sample: "73 65 63 72 65 74", encrypted: false, note: "hex encoding - just another representation, no key." },
    { label: "ROT13", sample: "frperg_cnffjbeq", encrypted: false, note: "a shift cipher with no secret - trivially reversible." },
    { label: "AES-GCM ciphertext", sample: "9f3a1c…b7e2 (iv+tag, random bytes)", encrypted: true, note: "Real encryption - random-looking and unreadable without the key." },
  ] },
];

function CryptoAct({ onCapture }: { onCapture: () => void }) {
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

/* ───────────────────────── lesson lab: live base64 ───────────────────────── */

function LiveEncodeLab({ onDone }: { onDone: () => void }) {
  const [v, setV] = useState("secret=open-sesame");
  const [decoded, setDecoded] = useState(false);
  const enc = (() => { try { return btoa(v); } catch { return "(non-ASCII)"; } })();
  function toggle() { setDecoded((d) => !d); onDone(); }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · base64 has no key</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>Type a &quot;secret&quot;, encode it, then decode it straight back - no password anywhere. That is why encoding protects nothing.</div>
      <input style={inp} value={v} onChange={(e) => setV(e.target.value)} />
      <div style={{ ...box, color: C.amber, marginTop: 10 }}>{enc}</div>
      <div style={{ marginTop: 10 }}><Btn tone="i" onClick={toggle}>{decoded ? "ENCODED ↑" : "DECODE IT ↓"}</Btn></div>
      {decoded && <div style={{ ...box, color: C.green, marginTop: 10 }}>{(() => { try { return atob(enc); } catch { return v; } })()}</div>}
      {decoded && <div style={{ marginTop: 10, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>Straight back to your text, no key required. Encoding is a disguise, not a lock.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: pick real protection ───────────────────────── */

function PickProtectionLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => ([
    { code: "Scramble it with base64 encoding so the text no longer looks readable", ok: false, why: "Encoding, not encryption. Reversible by anyone in one call (base64), exactly what you did in stage one." },
    { code: "Hide it with a home-made cipher that mixes in a single secret byte", ok: false, why: "A 256-key cipher (single-byte XOR) you brute-forced in stage three. Never roll your own, and never use a tiny keyspace." },
    { code: "Run it through one-way SHA-256 hashing so the value can't be read back", ok: false, why: "Hashing is one-way (SHA-256), so you could never read the token back to use it. Hashes are for passwords, not secrets you must recover." },
    { code: "Encrypt it with a modern algorithm, using a key from a secrets manager", ok: true, why: "Real, modern encryption (AES-GCM) with a large key kept out of the code. This is how you actually protect a secret you need back." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · how do you actually protect a secret?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };
const DRILLS: DrillCfg[] = [
  { client: "Brightpost Media", brief: "Brightpost's 'secure cookie' is suspicious. Read it. No walkthrough.", stages: [{ kind: "transform", title: "Encoding", goal: "Read the 'encrypted' token." }], success: "Decoded a base64 'token' - encoding never protected it. Finding logged." },
  { client: "Tideway Council", brief: "An intercepted memo used a classic shift cipher. Break it.", stages: [{ kind: "caesar", title: "Caesar", goal: "Brute-force the Caesar shift until it reads as English.", ct: "iwt wpcsdktg xh pi bxscxvwi", win: "handover", answerShift: 11 }], success: "Broke a 25-key cipher by trying shifts - tiny keyspaces fall instantly. Finding logged." },
  { client: "Flux Fitness", brief: "Flux XOR'd a note with one byte. Recover it. Trickier.", stages: [{ kind: "xor", title: "XOR", goal: "Brute-force the one-byte XOR key and read the message.", hex: "2b352e397c2834397c38392c332f35287c3e257c323333327c3a2e35383d25", win: "deposit", answerKey: 0x5c }], success: "Recovered a single-byte-XOR message - 256 keys is no keyspace at all. Finding logged." },
  { client: "Oakline Store", brief: "The full field job. Decode the token, then tell real crypto from fake. Chain it yourself.", stages: [
    { kind: "transform", title: "Encoding", goal: "Step 1: decode the token." },
    { kind: "classify", title: "Real vs fake", goal: "Step 2: mark which values actually need a key.", items: [
      { label: "base64", sample: "dG9rZW4=", encrypted: false, note: "base64 - no key." },
      { label: "AES-GCM", sample: "a1f9…c2 (random bytes)", encrypted: true, note: "Real encryption - needs the key." },
    ] },
  ], success: "Decoded the fake, then correctly told encoding from real encryption. Finding logged." },
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
  { kind: "transform", title: "Encoding", goal: "Sableline's config has an 'encrypted' token. Decode it." },
  { kind: "caesar", title: "Caesar", goal: "Their ops note used a Caesar cipher. Break the shift.", ct: "nkpwpa pda gauo aranu jejapu zwuo", win: "rotate", answerShift: 4 },
  { kind: "xor", title: "XOR", goal: "Finish it: a one-byte-XOR message. Brute-force the key and read it.", hex: "5945480d5e485f5b485f0d5f4242590d5d4c5e5e5a425f490d445e0d404c5d4148", win: "password", answerKey: 0x2d },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (phase + 1 < CAP_STAGES.length) { setPhase((p) => p + 1); setCleared(false); } else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full break · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
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
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}w3ak_crypt0_always_f4lls{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Encoding, a shift cipher and a one-byte XOR - all broken by hand. Real crypto is the only kind that holds.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE8: ModuleDef = {
  code: "M-08",
  moduleNo: 8,
  title: "Cryptography",
  client: "Harbour Systems",
  brief:
    "A deep engagement on what actually keeps a secret. Harbour Systems handed us files from their servers, sure their 'encrypted' values are safe to leave lying around. The full job, all computed for real in your browser: decode a base64 'token', break a Caesar cipher by trying its 25 shifts, brute-force a one-byte XOR key, and then tell the genuinely-encrypted values from the merely-encoded ones. Then four field jobs for new clients, and a final challenge you run start to finish. Nothing leaves your machine.",
  industry: {
    tag: "Base64 is not encryption. A cipher you can brute-force in a blink is not protection either.",
    motif: { pre: '"encrypted": "', hit: "c2VjcmV0", post: '"', note: "that's just base64, anyone can read it" },
    primer: {
      term: "Encryption vs encoding",
      what: "Encryption scrambles data with a secret KEY, so only someone with the key can read it. Encoding (like base64) just rewrites data in a different alphabet with NO key, so anyone can reverse it. They look similar on screen, and mixing them up is one of the most common security mistakes there is.",
      example: "base64(\"secret\") = c2VjcmV0   ->   decode = secret",
      returns: "No key, no protection. Calling that 'encrypted' is itself the vulnerability. Real encryption needs a secret key and a strong modern cipher; weak or missing encryption is exactly what you will find and break here.",
    },
    learn: [
      "Spot encoding (base64) being passed off as encryption, and just read it.",
      "Break a Caesar cipher by trying all 25 shifts until it reads as English.",
      "Brute-force a one-byte XOR key: only 256 possibilities to try.",
      "Judge which 'protected' values genuinely need a key and which anyone can read.",
    ],
    engines: [
      { name: "AES-256", color: "#4ade80", blurb: "The modern standard: strong symmetric encryption that needs a secret key. Used everywhere.", icon: "lock" },
      { name: "TLS 1.3 / HTTPS", color: "#5fe6ff", blurb: "Encrypts data in transit, the padlock in your browser. Anything on plain HTTP is readable.", icon: "lock" },
      { name: "SHA-256", color: "#8b7bff", blurb: "A modern one-way hash for checking integrity: you cannot reverse it back to the data.", icon: "key" },
      { name: "MD5 (broken)", color: "#f26d72", blurb: "An ancient, fast hash: a GPU does billions a second, so on its own it protects nothing today.", icon: "lock" },
      { name: "ECB mode (broken)", color: "#ffb347", blurb: "An encryption mode that leaks patterns: identical inputs look identical, the famous 'ECB penguin'.", icon: "lock" },
    ],
    headline: {
      masthead: "THE VAULT GAZETTE",
      dateline: "2013 · BREACH DISCLOSURE + US STATE AG SETTLEMENT",
      title: "A giant 'encrypted' 150 million passwords, the wrong way",
      body: "Adobe scrambled its users' passwords with reversible encryption instead of proper hashing, used a weak mode (ECB) that makes identical passwords look identical, and stored everyone's plaintext password hint right next to it. Researchers recovered huge numbers of passwords without ever breaking the cipher, just by spotting patterns and reading the hints. About 152 million accounts were exposed, and Adobe later paid a settlement to US states.",
      stat: "152M",
      statLabel: "ACCOUNTS, 'ENCRYPTED' BADLY",
      why: "Using encryption the wrong way can be as bad as using none. Weak or misused crypto has exposed passwords, messages and payments for decades, which is why telling real protection from fake is a core skill.",
    },
    realWorld:
      "Encryption is what keeps data safe once someone gets hold of it: the right cipher with a secret key is effectively unbreakable, but the wrong choice is worthless. Encoding mistaken for encryption, tiny keyspaces, broken old ciphers and plaintext storage all leave data readable to anyone who looks. Getting crypto right is cheap; getting it wrong quietly exposes everything.",
    now: {
      stat: "#4",
      body: "Cryptographic Failures rank fourth (A04) on the 2025 OWASP Top 10, the industry's standard list of the most critical web risks; the category covers weak or missing encryption, broken ciphers, and sensitive data stored or sent in the clear. The classic giveaway you will practise here: base64 is encoding, not encryption, and calling it 'encrypted' is itself the bug.",
    },
    recent: {
      year: "2024",
      title: "19 million passwords, just sitting in plaintext",
      body: "In 2024, researchers found close to 19 million passwords exposed in plaintext across 916 websites and apps whose cloud databases (Google Firebase) were set up with weak or no security rules, readable by anyone who asked. Not a broken cipher, but the same root failure: sensitive data left unprotected.",
    },
    ahead:
      "The big shift is 'harvest now, decrypt later': attackers capture encrypted data today and store it, betting that quantum computers will soon crack today's public-key crypto (RSA and ECC). To get ahead of it, in 2024 the US standards body NIST published the first finished post-quantum encryption standards, and security guidance now urges high-risk systems to be quantum-ready by 2030. Knowing which crypto is strong, weak, or already broken is becoming more valuable, not less.",
    role:
      "This is day-one knowledge for security engineers, application-security engineers and cryptography specialists. Telling real protection from fake is what keeps data safe when everything else fails.",
    roles: ["Security engineer", "Application security engineer", "Cryptography engineer", "PKI / encryption engineer"],
  },
  lesson: {
    blocks: [
      { h: "Three things people muddle up", body: "Encoding, hashing, and encryption are constantly confused, and the confusion causes breaches. Encoding (like base64) just reformats data so it travels safely - anyone can reverse it, no key needed. Hashing is a one-way fingerprint - you can't turn a hash back into the input. Encryption scrambles data so that only someone with the key can get it back. Only the last one actually hides a secret." },
      { h: "Encoding is not protection", body: "The classic mistake is treating base64 as if it hides something. It doesn't. base64 exists to move data through text-only channels, and reversing it is a single built-in function in every language and browser. A secret 'protected' by encoding isn't protected at all - it's wearing a disguise anyone can take off in one step." },
      { h: "Classic ciphers have tiny keyspaces", body: "A Caesar cipher shifts every letter by a fixed amount - but there are only 25 shifts, so you just try them all. A simple XOR with a one-byte key has only 256 possibilities, brute-forced in an instant. The lesson isn't the specific cipher; it's that security comes from a huge keyspace. A key an attacker can exhaust by hand is no key at all." },
      { h: "What real encryption looks like", body: "Strong encryption (like AES) combines a proper algorithm with a key so large the entire computing power of the planet couldn't try every possibility. Its output looks like random bytes with no structure and no way back without the key. You can often recognise the categories by shape: base64 ends in = and uses a limited alphabet; a hash is fixed-length hex; real ciphertext is structureless noise." },
      { h: "The key is the whole game", body: "Encryption is only as safe as its key. A perfect algorithm protects nothing if the key is hard-coded in the app, reused everywhere, or shipped next to the data. Real protection means a strong modern algorithm AND key management: keys kept secret, rotated, and stored separately from what they protect. And never invent your own crypto - use vetted libraries." },
    ],
    Interactive: LiveEncodeLab,
    summary: [
      "Encoding (base64) is reversible with no key - it protects nothing.",
      "Hashing is one-way; encryption is reversible only with the key. Only encryption hides a secret.",
      "Classic ciphers (Caesar: 25 keys, one-byte XOR: 256) have tiny keyspaces and fall to brute force.",
      "Real encryption (AES) needs a huge key and looks like structureless random bytes.",
      "Security lives in the key: strong algorithm plus real key management, and never roll your own crypto.",
    ],
    check: {
      q: "What's the key difference between encoding and encryption?",
      options: [
        { text: "Encoding can be reversed by anyone with no key; encryption needs a secret key to undo.", correct: true, feedback: "Right. That is exactly why base64 protects nothing." },
        { text: "Encoding needs a secret key to reverse, while encryption needs no key at all.", feedback: "It is the other way round: encoding needs no key, while encryption is defined by needing one." },
        { text: "They are really two different names for one and the same process.", feedback: "No. Conflating them is precisely the mistake that leaks secrets." },
        { text: "Both hide data, but encoding is just weaker encryption that an attacker can eventually crack.", feedback: "Encoding isn't weak encryption - it uses no key and hides nothing; reversing base64 is one built-in step, not cracking." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Harbour Systems files (provided copies)",
    inScope: "the encoded/encrypted values you were given, decoded in your browser",
    offLimits: "live servers, other config values, acting on any credential",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Decode the base64 'token', step the Caesar shift until it reads, brute-force the one-byte XOR key, then classify which values truly need a key. Every transform runs for real in your browser. Judge by shape before you trust a label.",
  hint: "Work the stages in order. base64 ends in = and needs no key. Caesar has 25 shifts - try them. One-byte XOR has 256 keys - brute-force and read the English one. Only random-looking AES actually needs a key.",
  plan: [
    { label: "Encoding", goal: "An 'encrypted' token is really just base64. Spot it and read it the obvious way, no key needed." },
    { label: "Caesar", goal: "A message shifted by a fixed amount. Step through the 25 shifts until it reads as English." },
    { label: "XOR", goal: "A note XOR'd with one secret byte. Brute-force all 256 and pick the one that decodes to real text." },
    { label: "Real vs fake", goal: "Judge four 'protected' values: mark which anyone can read and which genuinely need a key." },
  ],
  Act: CryptoAct,
  flag: "flag{3nc0d1ng_1s_n0t_crypt0}",
  defend: {
    blocks: [
      { h: "Protect secrets with real tools", body: "A secret like a password or API key should never sit in a file, encoded or not. Keep it in a secrets manager or an environment variable, and if it must be stored at rest, encrypt it properly with a strong algorithm and a key kept somewhere separate. Encoding has its place - moving data around - but 'make this unreadable' is never its job." },
      { h: "Use the right primitive, and don't invent it", body: "Match the tool to the goal: hash passwords (salted, slow), encrypt data you need back (AES-GCM with a managed key), encode only to move bytes safely. And never write your own cipher - the XOR and Caesar you broke are exactly what 'home-grown crypto' looks like. Use vetted, modern libraries that experts have attacked for years." },
      { h: "Key management is the hard part", body: "Even perfect encryption fails if the key is mishandled. Keep keys out of source code and config, store them in a dedicated key manager, rotate them, and give each its smallest necessary scope. A strong algorithm with a leaked or reused key protects nothing - the key is the whole game." },
    ],
    Interactive: PickProtectionLab,
    check: {
      q: "A password you only ever check, and an API token you must use again later - how should each be stored?",
      options: [
        { text: "Hash the password one-way; encrypt the token - you need the token back later, but never the password.", correct: true, feedback: "Right - match the primitive to the goal. Hashing is for values you only compare; encryption is for secrets you need back." },
        { text: "Encrypt both, so you can always recover the original value whenever the system happens to need it.", feedback: "No - a password you can decrypt is a password an attacker can decrypt too. You never need the original back, so hash it." },
        { text: "Hash both, because hashing is simply the strongest protection available for any kind of secret.", feedback: "A hashed token is useless - you could never read it back to call the API. Hashing is one-way by design." },
        { text: "Base64-encode both, which is enough as long as the database itself is kept properly secure.", feedback: "Encoding is reversible by anyone and protects nothing; it isn't a security control at all." },
      ],
    },
  },
  finding: {
    title: "Secrets 'protected' by encoding and weak ciphers, not real encryption",
    where: "Harbour Systems · config and message files",
    severity: "Medium",
    cvss: "5.9",
    impact: "An admin credential is stored as base64 and labelled 'encrypted', and other values use a Caesar and a one-byte-XOR cipher. All are reversible by anyone who reads them - with no key - yielding working credentials and sensitive messages.",
    fix: "Never use encoding or home-grown ciphers as protection. Store secrets in a secrets manager; encrypt data at rest with a strong algorithm (AES-GCM) and a separately-managed key; rotate exposed credentials.",
  },
  cheatsheet: {
    title: "Cryptography quick reference",
    blurb: "How to tell real protection from fake: encoding, encryption and hashing, and the broken ciphers you'll crack, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "The whole skill is this one judgment. For each value, ask: can I read it with no key at all?",
      cols: ["value you find", "what it actually is", "readable without a key?"],
      rows: [
        ["c2VjcmV0", "base64 ENCODING", "yes - just decode it"],
        ["Khoor (shift 3)", "Caesar cipher, 25 keys", "yes - try all 25 shifts"],
        ["random-looking bytes", "real AES encryption", "no - needs the secret key"],
      ],
    },
    groups: [
      {
        heading: "Encoding vs encryption vs hashing",
        entries: [
          { code: "encoding (base64)", what: "Rewrites data in another alphabet with NO key. Fully reversible by anyone. Not protection.", example: "base64('secret') = c2VjcmV0 -> decode -> secret" },
          { code: "encryption", what: "Scrambles data with a secret KEY; only someone with the key can read it back.", example: "AES-256 with a key kept secret" },
          { code: "hashing", what: "A one-way scramble you can't reverse, for integrity or storing passwords (salted + slow).", example: "SHA-256 for integrity; bcrypt/Argon2 for passwords" },
          { code: "keyspace", what: "How many possible keys there are. Too few, and an attacker just tries them all.", example: "Caesar = 25; one-byte XOR = 256; AES = 2^256" },
        ],
      },
      {
        heading: "Broken / do-not-use",
        entries: [
          { code: "Caesar / shift cipher", what: "Each letter shifted by a fixed amount: only 25 keys, so it falls instantly.", example: "try shifts 1..25 until it reads as English" },
          { code: "one-byte XOR", what: "Data XOR'd with a single secret byte: only 256 possibilities to brute-force.", example: "try all 256 bytes, pick the readable one" },
          { code: "MD5 / SHA-1", what: "Old, fast hashes, broken for security: billions of guesses a second, and collisions exist.", example: "never store passwords with these" },
          { code: "ECB mode", what: "An encryption mode where identical inputs give identical outputs, leaking patterns.", example: "same password -> same ciphertext for every user (the 'ECB penguin')" },
        ],
      },
      {
        heading: "The strong, modern choices",
        entries: [
          { code: "AES-256", what: "The modern symmetric standard: fast, hardware-accelerated, effectively unbreakable with a good key.", example: "encrypt data at rest with AES-256" },
          { code: "TLS 1.3 / HTTPS", what: "Encrypts data in transit; the browser padlock. Plain HTTP is readable in the middle.", example: "always https, never http, for anything sensitive" },
          { code: "bcrypt / Argon2", what: "Slow, salted password hashing built to resist GPU cracking; Argon2 is the current first choice.", example: "store passwords with Argon2 or bcrypt" },
          { code: "post-quantum (ML-KEM)", what: "New NIST standards (2024) built to survive quantum computers, for data that must stay secret for years.", example: "FIPS 203 (ML-KEM) for future-proof key exchange" },
        ],
      },
    ],
  },
  takeaway: "Encoding is not encryption. If it reverses with no key it protects nothing: use a strong algorithm and keep the key out of the code.",
  outcome: [
    "Decode a base64 'token' in a single step and recognise that encoding protects nothing, because it needs no key.",
    "Break a Caesar cipher by trying all 25 shifts, then crack a single-byte XOR key by brute-forcing all 256 and scoring each output for readable text.",
    "Tell real encryption from encoding or a weak cipher by its shape, and reach for a strong algorithm like AES with keys kept out of the code.",
  ],
  rep: 45,
  repRank: "Operator",
  repTo: "345 / 600 to Lead Operator",
  next: "NEXT MODULE · Passwords & Hashes →",
};

export default function Module8() {
  return <Engagement mod={MODULE8} />;
}
