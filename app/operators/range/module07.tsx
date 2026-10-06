"use client";

/* Module 7 — Broken Access Control (IDOR). The record API returns any record by
 * its ID without checking it belongs to the requester, so changing the number in
 * the request hands the learner someone else's data. No new heavy engine — a
 * small record store + an editable ID. Teaches authorization vs authentication,
 * IDOR/forced-browsing/priv-esc, and deny-by-default server-side checks. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

const MY_ID = 1042;
type Rec = { id: number; name: string; role: string; detail: string; sensitive?: boolean };
const RECORDS: Record<number, Rec> = {
  1042: { id: 1042, name: "You (driver)", role: "driver", detail: "Route: North depot · licence valid" },
  1041: { id: 1041, name: "Sam Okoro", role: "driver", detail: "Route: East depot · licence valid" },
  1000: { id: 1000, name: "R. Fenwick", role: "manager", detail: "Salary £58,400 · admin portal key: MGR-9F2A · home address on file", sensitive: true },
};

function IdorAct({ onCapture }: { onCapture: () => void }) {
  const [id, setId] = useState(String(MY_ID));
  const [shown, setShown] = useState<Rec | null>(RECORDS[MY_ID]);
  const [missing, setMissing] = useState(false);

  function fetchRec() {
    const n = Number(id);
    const rec = RECORDS[n];
    if (!rec) { setShown(null); setMissing(true); return; }
    setMissing(false);
    setShown(rec);
    if (n !== MY_ID) onCapture(); // accessed a record that isn't yours
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
          <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>portal.northwind.range · my record</span>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// you&rsquo;re logged in as driver #{MY_ID}. the app fetches records by id</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: "#8fa0c8" }}>GET /api/record?id=</span>
            <input value={id} onChange={(e) => setId(e.target.value)} style={{ width: 90, padding: "6px 10px", borderRadius: 7, background: C.carbon, color: C.amber, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13 }} />
            <Btn tone="i" onClick={fetchRec}>FETCH →</Btn>
          </div>

          {missing && <div style={{ fontFamily: MONO, fontSize: 13, color: C.red }}>404 · no record with that id</div>}
          {shown && (
            <div style={{ padding: "13px 15px", borderRadius: 10, background: C.carbon, border: `1px solid ${shown.id !== MY_ID ? C.green : C.lineSoft}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-chakra),system-ui", fontWeight: 700, fontSize: 15 }}>{shown.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: shown.sensitive ? C.red : C.mute, border: `1px solid ${shown.sensitive ? C.red : C.line}55`, padding: "2px 8px", borderRadius: 6 }}>#{shown.id} · {shown.role}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, color: shown.sensitive ? C.amber : C.soft, marginTop: 8, lineHeight: 1.5 }}>{shown.detail}</div>
              {shown.id !== MY_ID && <div style={{ fontFamily: MONO, fontSize: 12, color: C.green, marginTop: 10 }}>✓ that isn&rsquo;t your record — the server never checked</div>}
            </div>
          )}

          <button onClick={() => { setId("1000"); }} style={{ marginTop: 12, background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? try id 1000, then fetch</button>
        </div>
      </div>
    </div>
  );
}

function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

export const MODULE7: ModuleDef = {
  code: "M-07",
  moduleNo: 7,
  title: "Broken Access Control",
  client: "Northwind Foods",
  brief:
    "Last stop on Northwind’s web app. As a driver you can view your own record through the portal. The question for this engagement: can you view records that aren’t yours? Logging in proved who you are — now test what the app actually lets you reach.",
  lesson: {
    blocks: [
      { h: "Authentication vs authorization", body: "Two different checks. Authentication answers ‘who are you?’ — the login you broke in module 4. Authorization answers ‘are you allowed to do this?’ — and it has to happen on every single action, not just at the door. Broken access control is when that second check is missing, weak, or trusts something it shouldn’t." },
      { h: "IDOR: just change the number", body: "Apps refer to things by an ID — /api/record?id=1042. If the server fetches whatever ID you ask for without checking that record belongs to you, you can simply change 1042 to 1000 and read someone else’s data. That’s an Insecure Direct Object Reference (IDOR), and it’s everywhere because the ID is sitting right there in the request." },
      { h: "Forced browsing & privilege escalation", body: "Related moves: forced browsing is visiting a privileged URL directly (typing /admin) that was only ever hidden from the menu. Privilege escalation is ending up with more access than intended — reaching another user’s data (horizontal) or gaining admin powers (vertical). Hiding a link is not access control; only a server-side check is." },
    ],
    example: {
      caption: "The server looks up whatever ID is asked for and returns it — no check that it belongs to the requester. One digit later, you’re reading the manager’s record.",
      lines: [
        { t: "GET /api/record?id=1042  -> your own record" },
        { t: "GET /api/record?id=1000  -> the manager's record", leak: true },
        { t: "   (salary, admin key, home address — no check)", leak: true },
      ],
    },
    check: {
      q: "Why does changing the id return someone else’s record?",
      options: [
        { text: "The server looks up the record by id but never checks it belongs to the logged-in user.", correct: true, feedback: "Exactly — authentication happened, but authorization on the object didn’t." },
        { text: "The attacker guessed the manager’s password.", feedback: "No password involved — you’re already logged in as yourself and just changing an ID." },
        { text: "The IDs are encrypted and you decrypted one.", feedback: "The ID is plain in the request; the flaw is the missing ownership check, not crypto." },
      ],
    },
  },
  scope: {
    target: "portal.northwind.range · GET /api/record",
    inScope: "the record endpoint and its id parameter",
    offLimits: "modifying or deleting records, acting on the data you find, other hosts",
    timebox: "this session",
  },
  handler: "You can see your own record at id 1042. The app fetches by id with no ownership check — so change the number. Record 1000 is where it gets interesting. Read only; don’t touch what you find.",
  hint: "Change the id in the request from 1042 to another number and fetch. Try 1000 — that’s the manager, and the app won’t stop you.",
  Act: IdorAct,
  flag: "flag{1d0r_wr0ng_rec0rd}",
  defend: {
    blocks: [
      { h: "The fix: check on every access", body: "The server must verify, on every request, that the logged-in user is allowed to touch that specific object — e.g. ‘does record 1000 belong to this user, or is this user a manager?’ — and deny by default if not. The check belongs on the server, every time; it can never be the client’s job or something you skip because the ID is hard to guess." },
      { h: "Don’t rely on secrets or hiding", body: "Two tempting non-fixes: making IDs long and random, and hiding privileged links from the menu. Both are ‘security by obscurity’ — the ID still leaks (logs, referrers, sharing) and the hidden URL is still reachable by typing it. Only an actual authorization check stops the access. Broken access control is consistently one of the most common serious web flaws for exactly this reason." },
    ],
    check: {
      q: "What correctly fixes the IDOR?",
      options: [
        { text: "Use long random IDs that are hard to guess.", feedback: "Obscurity only — the ID leaks and the access still isn’t checked. Not a fix." },
        { text: "On every access, the server checks the current user is authorized for that specific record; deny by default.", correct: true, feedback: "Right — authorization enforced server-side, per object, every time." },
        { text: "Remove the link to other records from the menu.", feedback: "Hiding the link changes nothing — the endpoint is still reachable directly." },
      ],
    },
  },
  finding: {
    title: "Broken access control (IDOR) on record endpoint",
    where: "portal.northwind.range · GET /api/record?id= · no ownership check",
    severity: "High",
    cvss: "7.7",
    impact: "Any logged-in driver can read any record — including a manager’s salary, home address, and admin portal key — by changing the id in the request. The server never checks ownership.",
    fix: "Enforce authorization server-side on every object access (verify the record belongs to, or is permitted for, the requester); deny by default. Never rely on unguessable IDs or hidden links.",
  },
  rep: 60,
  repRank: "Operator",
  repTo: "300 / 600 to Lead Operator",
  next: "NEXT MODULE · Cryptography →",
};

export default function Module7() {
  return <Engagement mod={MODULE7} />;
}
