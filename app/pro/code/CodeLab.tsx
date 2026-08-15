"use client";

import { useMemo, useState } from "react";
import { T } from "../learn/tokens";
import CodePlayground, { type RunLine } from "../learn/CodePlayground";

/* The free "code area": pick a small, security-flavoured challenge, write
 * real JavaScript, run it in your browser, and get instant feedback. This
 * is the hands-on home of the scripting strand. */

type Challenge = {
  id: string;
  title: string;
  brief: string;
  starter: string;
  check: (logs: RunLine[]) => { pass: boolean; msg: string };
};

const out = (logs: RunLine[]) => logs.filter((l) => l.kind !== "error").map((l) => l.text).join("\n").toLowerCase();
const hadError = (logs: RunLine[]) => logs.some((l) => l.kind === "error");

const CHALLENGES: Challenge[] = [
  {
    id: "hello",
    title: "1. Your first line of code",
    brief: "Every script starts by making the computer do something. console.log prints a message. Press Run and watch it appear in the Output.",
    starter: `// Press Run. Then change the message and run it again.\nconsole.log("Analyst online.");`,
    check: (logs) => {
      if (hadError(logs)) return { pass: false, msg: "There's an error above. Check your quotes and brackets." };
      if (out(logs).trim().length > 0) return { pass: true, msg: "That's real code running in your browser. You just printed to the console, the way every script does." };
      return { pass: false, msg: "Nothing printed yet. Use console.log(\"...\") to print a message." };
    },
  },
  {
    id: "password",
    title: "2. A password strength rule",
    brief: "A common rule: passwords under 12 characters are weak. The 'weak' branch is written for you. Finish the 'strong' branch so it prints strong for this password.",
    starter: `// Passwords shorter than 12 characters are weak.\nconst password = "Sunshine-River-42";\n\nif (password.length < 12) {\n  console.log("weak");\n} else {\n  // Your line: print the word strong\n\n}`,
    check: (logs) => {
      if (hadError(logs)) return { pass: false, msg: "There's an error above. Check the code inside the else block." };
      if (out(logs).includes("strong")) return { pass: true, msg: "Nice. You just wrote a rule that judges input, which is what a lot of security code does." };
      return { pass: false, msg: "It should print 'strong' for this 17-character password. Add console.log(\"strong\") inside the else block." };
    },
  },
  {
    id: "logs",
    title: "3. Count the failed logins",
    brief: "Analysts sift logs constantly. Loop through these log lines and count how many contain FAILED, then print the number. (The answer is 3.)",
    starter: `// Each line is a login attempt.\nconst lines = [\n  "10:02 user=sarah OK",\n  "10:03 user=admin FAILED",\n  "10:03 user=admin FAILED",\n  "10:04 user=mike OK",\n  "10:05 user=admin FAILED",\n];\n\nlet failures = 0;\nfor (const line of lines) {\n  // Your code: if the line contains "FAILED", add 1 to failures\n\n}\nconsole.log(failures);`,
    check: (logs) => {
      if (hadError(logs)) return { pass: false, msg: "There's an error above. Check your loop and the if statement." };
      const printed = logs.filter((l) => l.kind !== "error").map((l) => l.text.trim());
      if (printed.includes("3")) return { pass: true, msg: "That's log analysis in a nutshell: loop, match, count. You just did what a SIEM does at scale." };
      if (printed.includes("0")) return { pass: false, msg: "It's still 0. Inside the loop, add: if (line.includes(\"FAILED\")) failures++;" };
      return { pass: false, msg: "Not quite. Count only the lines that contain \"FAILED\". The answer should be 3." };
    },
  },
];

export default function CodeLab() {
  const [active, setActive] = useState(0);
  const [result, setResult] = useState<{ pass: boolean; msg: string } | null>(null);
  const ch = CHALLENGES[active];
  const select = (i: number) => { setActive(i); setResult(null); };

  const onResult = useMemo(() => (logs: RunLine[]) => setResult(ch.check(logs)), [ch]);

  return (
    <div style={{ minHeight: "100vh", color: T.body, fontFamily: T.sans, background: `radial-gradient(1100px 560px at 50% -8%, rgba(139,109,255,0.13), transparent 60%), radial-gradient(820px 460px at 90% 2%, rgba(53,214,240,0.08), transparent 55%), ${T.bg}` }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 24px 90px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0 18px", borderBottom: `1px solid ${T.edge}` }}>
          <a href="/pro" style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: T.muted, textDecoration: "none" }}>← Cyber Pro</a>
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CODE LAB</span>
        </header>

        <main style={{ marginTop: 34 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.primary, marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.primary, boxShadow: `0 0 10px ${T.primary}` }} />Scripting for defenders
          </div>
          <h1 style={{ fontFamily: T.display, fontSize: 38, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.01em", margin: "0 0 18px", color: T.ink }}>Your code area</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: T.body, maxWidth: "62ch", margin: "0 0 8px" }}>
            You do not need to be a programmer to work in cyber security, but a little code goes a long way: parsing logs, checking passwords, automating the boring bits. Here you write real JavaScript and run it instantly, right in your browser. Nothing to install, nothing sent anywhere.
          </p>
          <div style={{ background: T.cyanSoft, borderLeft: `3px solid ${T.cyan}`, borderRadius: "0 10px 10px 0", padding: "13px 18px", margin: "18px 0 30px", maxWidth: "62ch" }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.cyan, marginBottom: 6 }}>Why this matters</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: T.body, margin: 0 }}>As a cyber security analyst, the people who can read and write a bit of code move faster and get hired sooner. You will start with three tiny, real tasks.</p>
          </div>

          {/* challenge picker */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {CHALLENGES.map((c, i) => (
              <button key={c.id} onClick={() => select(i)}
                style={{ fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: i === active ? "#fff" : T.muted, background: i === active ? `linear-gradient(135deg, ${T.primary}, ${T.cyan})` : T.panel, border: `1px solid ${i === active ? "transparent" : T.edge}`, borderRadius: 9, padding: "9px 15px", cursor: "pointer" }}>
                {c.title}
              </button>
            ))}
          </div>

          <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 14, padding: "20px 22px" }}>
            <h2 style={{ fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink, margin: "0 0 8px" }}>{ch.title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: T.body, margin: "0 0 18px", maxWidth: "62ch" }}>{ch.brief}</p>
            <CodePlayground key={ch.id} starter={ch.starter} onResult={onResult} />
            {result && (
              <div style={{ marginTop: 14, background: result.pass ? T.greenSoft : T.amberSoft, border: `1px solid ${result.pass ? T.green : T.amber}66`, borderRadius: 10, padding: "12px 15px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: result.pass ? T.green : T.amber, marginBottom: 5 }}>{result.pass ? "Solved" : "Keep going"}</div>
                <div style={{ fontSize: 14.5, color: T.body, lineHeight: 1.55 }}>{result.msg}</div>
              </div>
            )}
          </div>

          <p style={{ fontSize: 13, color: T.faint, marginTop: 20, maxWidth: "60ch", lineHeight: 1.5 }}>
            This is a sandbox: your code runs only in your own browser, and can&apos;t touch anything outside this page. Experiment freely.
          </p>
        </main>
      </div>
    </div>
  );
}
