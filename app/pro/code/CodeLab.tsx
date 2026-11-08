"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { T } from "../learn/tokens";
import CodePlayground, { type RunLine } from "../learn/CodePlayground";
import SyntaxHelp, { type SyntaxGroup } from "../learn/SyntaxHelp";

/* The free "code area": five small, security-flavoured challenges that build
 * up to a mini project the learner writes themselves. Real JavaScript, run in
 * the browser, instant feedback. No MCQs anywhere: this strand stays hands-on
 * code the whole way through. The hands-on home of Module 18. */

type Tip = { code: string; note: string };
type Challenge = {
  id: string;
  title: string;
  brief: string;
  starter: string;
  tips: Tip[];
  minRows?: number;
  ethics?: boolean;
  check: (logs: RunLine[]) => { pass: boolean; msg: string };
};

const clean = (logs: RunLine[]) => logs.filter((l) => l.kind !== "error").map((l) => l.text);
const out = (logs: RunLine[]) => clean(logs).join("\n").toLowerCase();
const hadError = (logs: RunLine[]) => logs.some((l) => l.kind === "error");

const CHALLENGES: Challenge[] = [
  {
    id: "hello",
    title: "1. Your first line of code",
    brief: "Every script starts by making the computer do something. console.log prints a message. Press Run and watch it appear in the Output, then change the message and run it again.",
    starter: `// Press Run. Then change the message and run it again.\nconsole.log("Analyst online.");`,
    tips: [
      { code: 'console.log("your text")', note: "prints a line to the Output" },
      { code: "// a comment", note: "a note to yourself; the computer ignores it" },
    ],
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
    tips: [
      { code: "password.length", note: "how many characters the text has" },
      { code: "if (x) { ... } else { ... }", note: "the else block runs when the if is false" },
      { code: 'console.log("strong")', note: "prints the word strong" },
    ],
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
    tips: [
      { code: "for (const line of lines) { ... }", note: "runs the block once for each line" },
      { code: 'line.includes("FAILED")', note: "true when the line contains FAILED" },
      { code: "failures++", note: "adds 1 to failures" },
    ],
    check: (logs) => {
      if (hadError(logs)) return { pass: false, msg: "There's an error above. Check your loop and the if statement." };
      const printed = clean(logs).map((t) => t.trim());
      if (printed.includes("3")) return { pass: true, msg: "That's log analysis in a nutshell: loop, match, count. You just did what a SIEM does at scale." };
      if (printed.includes("0")) return { pass: false, msg: "It's still 0. Inside the loop, add: if (line.includes(\"FAILED\")) failures++;" };
      return { pass: false, msg: "Not quite. Count only the lines that contain \"FAILED\". The answer should be 3." };
    },
  },
  {
    id: "func",
    title: "4. Make it reusable: a function",
    brief: "A function names a piece of logic so you can use it again and again. Finish isStrong so it returns true only when the password is at least 12 characters AND contains a number. The two checks are written for you.",
    starter: `// A function takes an input and returns an answer you can reuse.\nfunction isStrong(password) {\n  const longEnough = password.length >= 12;\n  const hasNumber = /[0-9]/.test(password);\n\n  // Your line: return true only when BOTH are true (use &&)\n\n}\n\nconsole.log(isStrong("Sunshine-River-42")); // expect: true\nconsole.log(isStrong("sunshine"));          // expect: false`,
    tips: [
      { code: "function name(input) { return answer; }", note: "defines reusable logic" },
      { code: "return a && b", note: "true only when a and b are both true" },
      { code: 'isStrong("abc123")', note: "calls the function with an input" },
    ],
    check: (logs) => {
      if (hadError(logs)) return { pass: false, msg: "There's an error above. Check the line inside the function." };
      const printed = clean(logs).map((t) => t.trim().toLowerCase());
      if (printed[0] === "true" && printed[1] === "false") return { pass: true, msg: "That's a function: write the logic once, reuse it anywhere. 'Sunshine-River-42' is long and has a number, so true; 'sunshine' is neither, so false." };
      if (printed.includes("true") && printed.includes("false")) return { pass: true, msg: "Your function returns true for the strong password and false for the weak one. That is reusable logic that answers a question, exactly what functions are for." };
      return { pass: false, msg: "It should print true then false. Inside the function, add: return longEnough && hasNumber;" };
    },
  },
  {
    id: "project",
    title: "5. Build it: your own strength checker",
    brief: "Your mini project. This one is meant to take a while, so take your time. Write the rate() function using everything so far: variables, conditions, a function, and the loop at the bottom that tests it. Score each password by points, then return weak, medium or strong.",
    minRows: 20,
    ethics: true,
    starter: `// YOUR MINI PROJECT: a password strength checker.\n//\n// The rule, keep it simple:\n//   +1 point if length is 8 or more\n//   +1 more  if length is 12 or more\n//   +1 if it has a number\n//   +1 if it has an uppercase letter\n//   +1 if it has a symbol\n// Then:  0 to 2 = "weak",  3 to 4 = "medium",  5 = "strong"\n\nfunction rate(password) {\n  let points = 0;\n\n  // Length\n  if (password.length >= 8) points++;\n  if (password.length >= 12) points++;\n\n  // These helpers each return true or false:\n  const hasNumber = /[0-9]/.test(password);\n  const hasUpper  = /[A-Z]/.test(password);\n  const hasSymbol = /[^A-Za-z0-9]/.test(password);\n\n  // Your code: add 1 point for each of hasNumber, hasUpper, hasSymbol\n\n\n  // Your code: return "weak", "medium" or "strong" based on points\n\n\n}\n\n// This tests your checker. Do not change it.\nconst tests = ["abc", "password1234", "Sunshine-River-42"];\nfor (const p of tests) {\n  console.log(p + " -> " + rate(p));\n}`,
    tips: [
      { code: "if (hasNumber) points++;", note: "add a point when a check is true" },
      { code: 'if (points >= 5) return "strong";', note: "return ends the function with an answer" },
      { code: 'return "weak";', note: "the last line catches everything else" },
      { code: "p + \" -> \" + rate(p)", note: "joins the password and its rating into one line" },
    ],
    check: (logs) => {
      if (hadError(logs)) return { pass: false, msg: "There's an error above. Read the message and check the line it points to." };
      const lines = clean(logs).map((t) => t.toLowerCase());
      if (!lines.length) return { pass: false, msg: "Nothing printed yet. The loop at the bottom prints a rating for each test password, so make sure rate() returns a word." };
      const find = (needle: string) => lines.find((t) => t.includes(needle)) ?? "";
      const abc = find("abc"), pw = find("password1234"), sun = find("sunshine-river-42");
      if (abc.includes("weak") && pw.includes("medium") && sun.includes("strong")) {
        return { pass: true, msg: "You built a real tool. It reads an input, scores it against rules, and reports a verdict: weak, medium, strong, all correct. That shape, read input then judge it, is the backbone of a huge amount of security code. That is the Code Lab done." };
      }
      return { pass: false, msg: "Close. Each test should come out as: abc -> weak, password1234 -> medium, Sunshine-River-42 -> strong. Check your points add up and your weak / medium / strong thresholds." };
    },
  },
];

/* ---- Syntax help: the pullout reference, always one tap away ---- */
const SYNTAX: SyntaxGroup[] = [
  { group: "Print to the Output", items: [
    { code: 'console.log("hello")', note: "print some text" },
    { code: "console.log(count)", note: "print a value you stored" },
    { code: 'console.log(a + " -> " + b)', note: "join pieces with +" },
  ] },
  { group: "Store a value", items: [
    { code: 'const name = "Sarah"', note: "a value that will not change" },
    { code: "let count = 0", note: "a value you will update" },
    { code: "count++", note: "add 1 to count" },
  ] },
  { group: "Ask a true / false question", items: [
    { code: "password.length >= 12", note: "12 or more characters" },
    { code: "a === b   a !== b", note: "equal, and not equal" },
    { code: "A && B    A || B", note: "both true, and either true" },
    { code: 'text.includes("FAILED")', note: "does the text contain this?" },
  ] },
  { group: "Does the text contain...", items: [
    { code: "/[0-9]/.test(text)", note: "a number?" },
    { code: "/[A-Z]/.test(text)", note: "an uppercase letter?" },
    { code: "/[^A-Za-z0-9]/.test(text)", note: "a symbol?" },
  ] },
  { group: "Decide", items: [
    { code: "if (condition) {\n  ...\n} else {\n  ...\n}", note: "run one block or the other" },
  ] },
  { group: "Repeat over a list", items: [
    { code: "for (const item of list) {\n  ...\n}", note: "once for each item" },
  ] },
  { group: "Reusable logic", items: [
    { code: "function rate(pw) {\n  return answer;\n}", note: "define it once" },
    { code: 'rate("abc123")', note: "call it any time" },
  ] },
  { group: "Count a pattern", items: [
    { code: "let n = 0;\nfor (const x of list) {\n  if (test) n++;\n}", note: "the loop-match-count shape" },
  ] },
];

export default function CodeLab() {
  const [active, setActive] = useState(0);
  const [result, setResult] = useState<{ pass: boolean; msg: string } | null>(null);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const ch = CHALLENGES[active];
  const atFirst = active === 0;
  const atLast = active === CHALLENGES.length - 1;

  useEffect(() => {
    try { const raw = localStorage.getItem("pro:code:solved"); if (raw) setSolved(new Set(JSON.parse(raw) as string[])); } catch { /* ignore */ }
  }, []);

  const markSolved = useCallback((id: string) => {
    setSolved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem("pro:code:solved", JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const select = useCallback((i: number) => {
    setActive(Math.max(0, Math.min(CHALLENGES.length - 1, i)));
    setResult(null);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const onResult = useMemo(() => (logs: RunLine[]) => {
    const r = ch.check(logs);
    setResult(r);
    if (r.pass) markSolved(ch.id);
  }, [ch, markSolved]);

  return (
    <div style={{ minHeight: "100vh", color: T.body, fontFamily: T.sans, background: `radial-gradient(1100px 560px at 50% -8%, rgba(139,109,255,0.13), transparent 60%), radial-gradient(820px 460px at 90% 2%, rgba(53,214,240,0.08), transparent 55%), ${T.bg}` }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 24px 90px" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0 18px", borderBottom: `1px solid ${T.edge}` }}>
          <a href="/pro/course" style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: T.muted, textDecoration: "none" }}>&larr; All modules</a>
          <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CODE LAB</span>
        </header>

        <main style={{ marginTop: 34 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.primary, marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.primary, boxShadow: `0 0 10px ${T.primary}` }} />Module 18 &middot; Scripting for defenders
          </div>
          <h1 style={{ fontFamily: T.display, fontSize: 38, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.01em", margin: "0 0 18px", color: T.ink }}>Your code area</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: T.body, maxWidth: "62ch", margin: "0 0 8px" }}>
            You do not need to be a programmer to work in cyber security, but a little code goes a long way: parsing logs, checking passwords, automating the boring bits. Here you write real JavaScript and run it instantly, right in your browser. Nothing to install, nothing sent anywhere.
          </p>
          <div style={{ background: T.cyanSoft, borderLeft: `3px solid ${T.cyan}`, borderRadius: "0 10px 10px 0", padding: "13px 18px", margin: "18px 0 30px", maxWidth: "62ch" }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.cyan, marginBottom: 6 }}>Why this matters</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: T.body, margin: 0 }}>As a cyber security analyst, the people who can read and write a bit of code move faster and get hired sooner. Five short tasks, each building on the last, up to a small tool you write yourself. Stuck on the syntax? Open Syntax help on the right at any time.</p>
          </div>

          {/* stepper / jump tabs, with a tick once solved */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {CHALLENGES.map((c, i) => {
              const isSolved = solved.has(c.id);
              const isActive = i === active;
              return (
                <button key={c.id} onClick={() => select(i)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: isActive ? "#fff" : T.muted, background: isActive ? `linear-gradient(135deg, ${T.primary}, ${T.cyan})` : T.panel, border: `1px solid ${isActive ? "transparent" : isSolved ? `${T.green}66` : T.edge}`, borderRadius: 9, padding: "9px 15px", cursor: "pointer" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", fontSize: 11, fontWeight: 700, color: isSolved ? "#fff" : (isActive ? "#fff" : T.faint), background: isSolved ? T.green : "transparent", border: isSolved ? "none" : `1px solid ${isActive ? "rgba(255,255,255,0.6)" : T.edge}` }}>{isSolved ? "✓" : i + 1}</span>
                  {c.title.replace(/^\d+\.\s*/, "")}
                </button>
              );
            })}
          </div>

          <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 14, padding: "20px 22px" }}>
            <h2 style={{ fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink, margin: "0 0 8px" }}>{ch.title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: T.body, margin: "0 0 16px", maxWidth: "62ch" }}>{ch.brief}</p>

            {ch.ethics && (
              <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}66`, borderRadius: 10, padding: "13px 16px", margin: "0 0 18px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.amber, marginBottom: 6 }}>Use this for good</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: T.body, margin: 0 }}>You are learning to build security tools. Only ever run a tool like this against systems, accounts and data you own or have clear written permission to test. In the UK, accessing a computer system without authorisation is a criminal offence under the Computer Misuse Act 1990. The whole point of these skills is to defend, not to attack.</p>
              </div>
            )}

            <CodePlayground key={ch.id} starter={ch.starter} onResult={onResult} minRows={ch.minRows} />

            {result && (
              <div style={{ marginTop: 14, background: result.pass ? T.greenSoft : T.amberSoft, border: `1px solid ${result.pass ? T.green : T.amber}66`, borderRadius: 10, padding: "12px 15px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: result.pass ? T.green : T.amber, marginBottom: 5 }}>{result.pass ? "Solved" : "Keep going"}</div>
                <div style={{ fontSize: 14.5, color: T.body, lineHeight: 1.55 }}>{result.msg}</div>
              </div>
            )}

            {/* syntax for THIS task, stated on screen */}
            <div style={{ marginTop: 18, borderTop: `1px solid ${T.edge}`, paddingTop: 14 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.faint, marginBottom: 10 }}>Syntax for this task</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ch.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <code style={{ fontFamily: T.mono, fontSize: 12.5, color: "#c9f7e0", background: "#0b0a16", border: `1px solid ${T.edge}`, borderRadius: 7, padding: "4px 9px", whiteSpace: "pre-wrap" }}>{tip.code}</code>
                    <span style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.5, flex: "1 1 180px", minWidth: 0 }}>{tip.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* forward / backward navigation between tasks */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 18 }}>
            <button onClick={() => select(active - 1)} disabled={atFirst}
              style={{ fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: atFirst ? T.faint : T.ink, background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 9, padding: "10px 18px", cursor: atFirst ? "default" : "pointer", opacity: atFirst ? 0.5 : 1 }}>&larr; Previous</button>
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.faint }}>Activity {active + 1} of {CHALLENGES.length}</span>
            <button onClick={() => select(active + 1)} disabled={atLast}
              style={{ fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: "#fff", background: atLast ? T.edge : `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 9, padding: "10px 18px", cursor: atLast ? "default" : "pointer", opacity: atLast ? 0.6 : 1 }}>Next &rarr;</button>
          </div>

          <p style={{ fontSize: 13, color: T.faint, marginTop: 24, maxWidth: "60ch", lineHeight: 1.5 }}>
            This is a sandbox: your code runs only in your own browser, and cannot touch anything outside this page. Experiment freely.
          </p>
        </main>
      </div>

      <SyntaxHelp label="Syntax help" intro="A quick reference for everything in the Code Lab. Copy any of these shapes into your code." groups={SYNTAX} />
    </div>
  );
}
