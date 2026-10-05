"use client";

/* Module 9 — Passwords & Hashes. The Act is a cracking bench: a leaked user dump
 * of unsalted hashes vs a rainbow table (precomputed hash -> word). The learner
 * matches a weak hash to its word and cracks it; the salted admin hash has no
 * match, teaching why salting defeats precomputed tables. No real hashing — the
 * hash strings are consistent constants, so matching is the whole mechanic. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO } from "./Engagement";

type Row = { user: string; hash: string; salted?: boolean };
const DUMP: Row[] = [
  { user: "j.poole", hash: "e10adc3949ba59abbe56e057f20f883e" }, // 123456
  { user: "m.reyes", hash: "5f4dcc3b5aa765d61d8327deb882cf99" }, // password
  { user: "admin",   hash: "9c1a7e2f::b83d41aa6e77c09f (salt:x9f2)", salted: true },
];
const RAINBOW: { word: string; hash: string }[] = [
  { word: "123456", hash: "e10adc3949ba59abbe56e057f20f883e" },
  { word: "password", hash: "5f4dcc3b5aa765d61d8327deb882cf99" },
  { word: "qwerty", hash: "d8578edf8458ce06fbc5bb76a58c5ca4" },
  { word: "letmein", hash: "0d107d09f5bbe40cade3de5c71e9e9b7" },
];

function HashCrackAct({ onCapture }: { onCapture: () => void }) {
  const [sel, setSel] = useState<Row | null>(null);
  const [cracked, setCracked] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  function tryWord(word: string, hash: string) {
    if (!sel) { setMsg("Pick a user from the dump first."); return; }
    if (sel.salted) { setMsg(`${sel.user}: no match — this hash is salted, so the rainbow table is useless against it.`); return; }
    if (sel.hash === hash) {
      setCracked((c) => ({ ...c, [sel.user]: word }));
      setMsg(`✓ cracked ${sel.user} → "${word}"`);
      onCapture();
    } else {
      setMsg(`“${word}” doesn't match ${sel.user}'s hash — keep going.`);
    }
  }

  const cell: React.CSSProperties = { fontFamily: MONO, fontSize: 12, padding: "8px 10px" };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* leaked dump */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>⌦ LEAKED USER DUMP · password hashes</div>
        <div style={{ display: "grid", gap: 6 }}>
          {DUMP.map((r) => (
            <button key={r.user} onClick={() => { setSel(r); setMsg(null); }} className="co-opt"
              style={{ textAlign: "left", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 9, border: `1px solid ${sel?.user === r.user ? C.indigo : C.lineSoft}`, background: C.carbon, cursor: "pointer" }}>
              <span style={{ ...cell, color: C.ink, padding: 0 }}>{r.user}</span>
              <span style={{ ...cell, color: cracked[r.user] ? C.green : (r.salted ? C.amber : "#8fa0c8"), padding: 0, wordBreak: "break-all" }}>
                {cracked[r.user] ? `cracked: ${cracked[r.user]}` : r.hash}{r.salted ? "  ⟵ salted" : ""}
              </span>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute, marginTop: 8 }}>{sel ? `selected: ${sel.user}` : "select a user, then match its hash in the table below"}</div>
      </div>

      {/* rainbow table */}
      <div style={{ background: C.carbon, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>⌦ RAINBOW TABLE · common password → hash</div>
        <div style={{ display: "grid", gap: 6 }}>
          {RAINBOW.map((e) => (
            <button key={e.word} onClick={() => tryWord(e.word, e.hash)} className="co-opt"
              style={{ textAlign: "left", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.lineSoft}`, background: C.panel, color: C.soft, cursor: "pointer" }}>
              <span style={{ ...cell, color: C.ink, padding: 0 }}>{e.word}</span>
              <span style={{ ...cell, color: "#8fa0c8", padding: 0, wordBreak: "break-all" }}>{e.hash}</span>
            </button>
          ))}
        </div>
      </div>

      {msg && <div style={{ fontFamily: MONO, fontSize: 12.5, color: msg.startsWith("✓") ? C.green : C.soft }}>{msg}</div>}
    </div>
  );
}

export const MODULE9: ModuleDef = {
  code: "M-09",
  moduleNo: 9,
  title: "Passwords & Hashes",
  client: "Harbour Systems",
  brief:
    "Harbour Systems had a database leak, and the user table is now in your hands as a test copy. The passwords are hashed, so the dev team think they’re safe. Show them how far ‘hashed’ gets you when the hashing is done badly — and which account survives, and why.",
  lesson: {
    blocks: [
      { h: "Hashing stores passwords safely — in theory", body: "A site should never store your actual password. Instead it stores a hash: a one-way fingerprint. When you log in, it hashes what you typed and compares fingerprints. Done right, even someone who steals the database can’t turn the hashes back into passwords. Done wrong, they barely have to try." },
      { h: "Why weak hashing falls", body: "Two problems. First, people pick common passwords, and a fast hash (like MD5) of ‘123456’ is always the same value — so attackers precompute huge ‘rainbow tables’ of hash→password and just look yours up. Second, if there’s no salt, identical passwords produce identical hashes, so one lookup cracks everyone who used that password." },
      { h: "Salt, and slow", body: "A salt is a unique random value added to each password before hashing, so the same password gets a different hash every time — which makes precomputed tables useless. On top of that, good password hashes (bcrypt, scrypt, Argon2) are deliberately slow, so even guessing one at a time is painfully expensive. Together they turn a stolen database from a disaster into a non-event." },
    ],
    example: {
      caption: "An unsalted MD5 of a common password is a one-line lookup. The salted hash can’t be found in any precomputed table, so it holds.",
      lines: [
        { t: "5f4dcc3b5aa765d61d8327deb882cf99  -> lookup -> 'password'", leak: true },
        { t: "e10adc3949ba59abbe56e057f20f883e  -> lookup -> '123456'", leak: true },
        { t: "9c1a7e2f… (salt:x9f2)            -> not in any table" },
      ],
    },
    check: {
      q: "Why does salting defeat a rainbow table?",
      options: [
        { text: "It encrypts the hash so it can’t be read.", feedback: "Salting isn’t encryption — the hash is still visible; it’s just unique per user now." },
        { text: "It makes each password’s hash unique, so precomputed hash→password tables don’t match.", correct: true, feedback: "Right. The attacker would have to rebuild a table per salt — impractical." },
        { text: "It makes passwords longer.", feedback: "The salt isn’t part of the user’s password; it changes the stored hash, not the password’s length." },
      ],
    },
  },
  scope: {
    target: "Harbour Systems leaked user table (test copy)",
    inScope: "cracking the hashes in the provided dump",
    offLimits: "logging into real accounts, the live database, other systems",
    timebox: "this session",
  },
  handler: "Pick a user, then find their hash in the rainbow table. The weak ones fall instantly. Try the admin too — watch what the salt does to your lovely table.",
  hint: "Select j.poole or m.reyes, then click the rainbow-table row whose hash matches. The admin’s hash is salted, so it won’t be in the table at all.",
  Act: HashCrackAct,
  flag: "flag{unsalt3d_hash_cr4cked}",
  defend: {
    blocks: [
      { h: "The fix: salted, slow hashes", body: "Store passwords with a modern password-hashing algorithm — bcrypt, scrypt, or Argon2 — which salt automatically and are deliberately slow. Never use fast general-purpose hashes like MD5 or SHA-1 for passwords, and never store them unsalted. This single change is what separates a ‘we leaked hashes but nobody could crack them’ incident from a total compromise." },
      { h: "Defence in depth", body: "Hashing protects the stored password; the rest protects the account. Encourage long passphrases and check them against known-breached lists. Add multi-factor authentication so a cracked password still isn’t enough. And detect and respond to leaks fast — the sooner you force resets, the less a stolen hash is worth." },
    ],
    check: {
      q: "How should Harbour store passwords?",
      options: [
        { text: "MD5, but applied three times.", feedback: "Still a fast, unsalted hash — rainbow tables and brute force both still work." },
        { text: "A salted, slow password hash such as bcrypt or Argon2.", correct: true, feedback: "Right — per-user salt plus deliberate slowness defeats tables and brute force." },
        { text: "Reverse the password before storing it.", feedback: "That’s trivial to undo and isn’t hashing at all — the password is effectively plaintext." },
      ],
    },
  },
  finding: {
    title: "Passwords stored as unsalted, fast hashes (MD5)",
    where: "Harbour Systems · users table · password_hash column",
    severity: "High",
    cvss: "7.5",
    impact: "Most password hashes are unsalted MD5 and crack instantly against public rainbow tables, exposing plaintext passwords for reuse across accounts and services.",
    fix: "Rehash all passwords with a salted, slow algorithm (bcrypt/scrypt/Argon2) on next login; force resets for cracked accounts; add MFA and breached-password checks.",
  },
  rep: 50,
  repRank: "Operator",
  repTo: "395 / 600 to Lead Operator",
  next: "NEXT MODULE · Network Recon →",
};

export default function Module9() {
  return <Engagement mod={MODULE9} />;
}
