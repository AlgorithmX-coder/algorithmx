"use client";

/* Module 8 — Cryptography. The Act is a decoder bench: an intercepted "auth
 * token" that a dev assumed was safe is really just Base64 (encoding, not
 * encryption) and reverses in one click to reveal a password. The learner picks
 * the right transform from Base64 / ROT13 / "it's encrypted". Teaches the three
 * categories — encoding vs hashing vs encryption — and that encoding protects
 * nothing. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

const TOKEN = "dXNlcj1hZG1pbjtwdz1zM2NyZXQ="; // base64 of "user=admin;pw=s3cret"

function rot13(s: string): string {
  return s.replace(/[a-z]/gi, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
  });
}
function b64(s: string): string {
  try { return typeof atob === "function" ? atob(s) : Buffer.from(s, "base64").toString("utf8"); }
  catch { return "⟂ not valid Base64"; }
}

function CryptoBenchAct({ onCapture }: { onCapture: () => void }) {
  const [out, setOut] = useState<{ method: string; text: string; win: boolean } | null>(null);

  function decode(method: "b64" | "rot13" | "enc") {
    if (method === "b64") { const t = b64(TOKEN); setOut({ method: "Base64 decode", text: t, win: t.includes("pw=") }); if (t.includes("pw=")) onCapture(); }
    else if (method === "rot13") setOut({ method: "ROT13", text: rot13(TOKEN), win: false });
    else setOut({ method: "assume encrypted", text: "…if it were truly encrypted you'd need the key. But is it?", win: false });
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 10 }}>// intercepted from a config file — the dev labelled it &quot;encrypted auth token&quot;</div>
        <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.amber, background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 9, padding: "11px 13px", wordBreak: "break-all" }}>{TOKEN}</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute, marginTop: 10, marginBottom: 8 }}>how would you read it?</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn tone="i" onClick={() => decode("b64")}>Decode Base64</Btn>
          <Btn tone="ghost" onClick={() => decode("rot13")}>Try ROT13</Btn>
          <Btn tone="ghost" onClick={() => decode("enc")}>Assume it&rsquo;s encrypted</Btn>
        </div>
      </div>

      {out && (
        <div style={{ background: C.carbon, border: `1px solid ${out.win ? C.green : C.line}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.mute, marginBottom: 7 }}>{out.method.toUpperCase()}</div>
          <pre style={{ margin: 0, fontFamily: MONO, fontSize: 13, color: out.win ? C.green : "#8fa0c8", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{out.text}</pre>
          {out.win && <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, marginTop: 10 }}>✓ it was only Base64 — reversible by anyone. The &quot;token&quot; is a plaintext password.</div>}
        </div>
      )}

      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, lineHeight: 1.6 }}>
        reference · <span style={{ color: C.indigo2 }}>encoding</span> (Base64) = reversible, no key, protects nothing ·{" "}
        <span style={{ color: C.indigo2 }}>hashing</span> = one-way, for integrity/passwords ·{" "}
        <span style={{ color: C.indigo2 }}>encryption</span> = reversible only with a key
      </div>
    </div>
  );
}

export const MODULE8: ModuleDef = {
  code: "M-08",
  moduleNo: 8,
  title: "Cryptography",
  client: "Harbour Systems",
  brief:
    "New client, new domain. Harbour Systems handed us a config file pulled from one of their servers, worried a value in it is sensitive. A developer swears the ‘auth token’ in it is encrypted and safe to leave lying around. Your job: find out whether that’s true.",
  lesson: {
    blocks: [
      { h: "Three things people muddle up", body: "Encoding, hashing, and encryption are constantly confused, and the confusion causes breaches. Encoding (like Base64) just reformats data so it travels safely — anyone can reverse it, no key needed. Hashing is a one-way fingerprint — you can’t turn a hash back into the input, which is why it suits passwords and integrity checks. Encryption scrambles data so that only someone with the key can get it back." },
      { h: "Encoding is not protection", body: "The classic mistake is treating Base64 as if it hides a secret. It doesn’t. Base64 exists to move binary data through text-only channels; reversing it is a single function call that every language and browser has built in. If a secret is ‘protected’ by encoding, it isn’t protected at all — it’s just wearing a disguise anyone can take off." },
      { h: "Spotting the difference", body: "You can often tell by shape. Base64 uses A–Z, a–z, 0–9, + and /, usually padded with = at the end. A hash is fixed-length hex (MD5 is 32 characters; SHA-256 is 64). Real encrypted data looks like random bytes with no structure and no reliable way back without the key. Recognising which you’re looking at tells you instantly whether you can just read it." },
    ],
    example: {
      caption: "It ends in =, uses only Base64 characters, and decodes cleanly to readable text. That’s encoding — the ‘token’ is a password in a thin disguise.",
      lines: [
        { t: 'token = "dXNlcj1hZG1pbjtwdz1zM2NyZXQ="' },
        { t: "base64-decode ->" },
        { t: "user=admin;pw=s3cret", leak: true },
      ],
    },
    check: {
      q: "What’s the key difference between encoding and encryption?",
      options: [
        { text: "Encoding needs a key; encryption doesn’t.", feedback: "It’s the other way round — encoding needs no key at all." },
        { text: "Encoding is reversible by anyone with no key; encryption needs a secret key to reverse.", correct: true, feedback: "Right. That’s exactly why Base64 protects nothing." },
        { text: "They’re two words for the same thing.", feedback: "No — conflating them is precisely the mistake that leaks secrets." },
      ],
    },
  },
  scope: {
    target: "Harbour Systems config file (provided copy)",
    inScope: "the single auth-token value you were given",
    offLimits: "live servers, other config values, acting on any credential",
    timebox: "this session",
  },
  handler: "Look at the shape of it before you believe the ‘encrypted’ label. Ends in an equals sign, all Base64 characters. Decode it the obvious way and see what falls out.",
  hint: "It’s Base64 (ends in =, only Base64 characters). Hit ‘Decode Base64’ — no key required, because encoding isn’t encryption.",
  Act: CryptoBenchAct,
  flag: "flag{3nc0d1ng_1s_n0t_crypt0}",
  defend: {
    blocks: [
      { h: "Protect secrets with real tools", body: "A secret like a password or API key should never sit in a config file, encoded or not. Keep it in a secrets manager or an environment variable, and if it must be stored at rest, encrypt it properly with a key kept somewhere separate. Encoding has its place — moving data around — but ‘make this unreadable’ is never its job." },
      { h: "Use the right primitive for the job", body: "Match the tool to the goal. Need to store a password so you can check it later but never read it back? Hash it (with a salt and a slow algorithm — next module). Need to send data secretly and recover it? Encrypt it with a managed key. Need to move bytes safely through text? Encode it. Reaching for encoding when you meant encryption is the whole bug here." },
    ],
    check: {
      q: "How should that auth token have been handled?",
      options: [
        { text: "Base64-encode it twice so it’s harder to read.", feedback: "Encoding any number of times is still trivially reversible — it adds no protection." },
        { text: "Keep the secret in a secrets manager / env var, and encrypt at rest with a separately-stored key.", correct: true, feedback: "Right — real secret management and encryption, not encoding." },
        { text: "Rename the field to something less obvious.", feedback: "Obscuring the name doesn’t protect the value; anyone who finds it can still decode it." },
      ],
    },
  },
  finding: {
    title: "Secret ‘protected’ with Base64 encoding, not encryption",
    where: "Harbour Systems · config file · auth_token value",
    severity: "Medium",
    cvss: "5.9",
    impact: "An admin credential is stored as Base64 and labelled ‘encrypted’. Anyone who reads the file can decode it in one step and obtain a working admin password.",
    fix: "Never use encoding as protection. Store secrets in a secrets manager or env var; encrypt at rest with a separately-managed key; rotate the exposed credential.",
  },
  rep: 45,
  repRank: "Operator",
  repTo: "345 / 600 to Lead Operator",
  next: "NEXT MODULE · Passwords & Hashes →",
};

export default function Module8() {
  return <Engagement mod={MODULE8} />;
}
