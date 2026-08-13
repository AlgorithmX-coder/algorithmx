"use client";

import { useEffect, useRef } from "react";
import CodeRainBackground from "@/app/components/CodeRainBackground";
import WaitlistForm from "@/app/components/WaitlistForm";

/**
 * Cyber Ops - the 14-17 tier landing page (route stays /cyberstart).
 *
 * Ported from the design mockup. All marketing copy is authored and
 * hardcoded here on purpose (not catalogue data). Fonts are loaded via
 * next/font in page.tsx and exposed as --font-* CSS variables, which the
 * scoped tokens below map onto --display / --mono / --sans.
 *
 * The hero terminal + star-fort backdrop are the only motion; both live
 * in the effect and clean themselves up on unmount. Everything else is
 * visible by default (no scroll-reveal) so the page never depends on JS.
 */

const CSS = `
.cyops-root{
  color-scheme:dark;
  --carbon:#0A0B0F; --panel:#0F1119; --raised:#151824; --raised-2:#1B1F2C;
  --hairline:#262A38; --hairline-soft:#1E2230;
  --text:#E4E9F1; --text-dim:#98A3B5; --muted:#6B7688;
  --ind:#8B7BFF; --ind-soft:#B4AAFF; --ind-glow:rgba(139,123,255,.35);
  --threat:#FF5B62; --added:#4ADE80; --amber:#E8A33D;
  --display:var(--font-chakra),ui-sans-serif,system-ui,sans-serif;
  --mono:var(--font-plex-mono),ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --sans:var(--font-plex-sans),ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  position:relative;min-height:100vh;overflow-x:hidden;
  background:var(--carbon);color:var(--text);font-family:var(--sans);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;
}
.cyops-root, .cyops-root *{box-sizing:border-box}
.cyops-root #bg{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.cyops-root .veil{position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,rgba(10,11,15,.52),rgba(10,11,15,.4) 34%,rgba(10,11,15,.58)),radial-gradient(120% 90% at 72% 8%,transparent 48%,rgba(6,7,12,.5) 88%)}
.cyops-root main, .cyops-root nav, .cyops-root footer{position:relative;z-index:1}
.cyops-root .wrap{max-width:1180px;margin:0 auto;padding:0 24px}
.cyops-root a{color:inherit;text-decoration:none}
.cyops-root .k{font-family:var(--display);font-weight:600;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--ind-soft)}
.cyops-root h1, .cyops-root h2, .cyops-root h3{font-family:var(--display);font-weight:700;letter-spacing:.005em;text-wrap:balance;margin:0}
.cyops-root h2{font-size:clamp(1.7rem,3.5vw,2.5rem);line-height:1.08}
.cyops-root p{margin:0}
.cyops-root .lead{color:var(--text-dim);font-size:1.06rem;line-height:1.62;max-width:60ch}
.cyops-root .mono{font-family:var(--mono)}
.cyops-root section{padding:clamp(64px,9vw,120px) 0;position:relative}
.cyops-root .ey{display:flex;align-items:center;gap:11px;margin-bottom:18px}
.cyops-root .ey::before{content:"";width:26px;height:1px;background:var(--ind);opacity:.7}

.cyops-root nav{position:sticky;top:0;z-index:40;backdrop-filter:blur(14px);background:rgba(10,11,15,.68);border-bottom:1px solid var(--hairline-soft)}
.cyops-root .navrow{display:flex;align-items:center;gap:20px;height:64px}
.cyops-root .brand{display:flex;align-items:center;gap:11px;font-family:var(--display);font-weight:700;font-size:18px;letter-spacing:.16em}
.cyops-root .brand .dot{width:11px;height:11px;border-radius:3px;background:var(--ind);box-shadow:0 0 14px var(--ind-glow)}
.cyops-root .brand small{font-family:var(--sans);font-weight:400;font-size:10px;letter-spacing:.16em;color:var(--muted);text-transform:uppercase}
.cyops-root .navlinks{display:flex;gap:26px;margin-left:auto}
.cyops-root .navlinks a{font-family:var(--display);font-weight:500;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);transition:.15s}
.cyops-root .navlinks a:hover{color:var(--text)}
.cyops-root .cta{font-family:var(--display);font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;
  padding:10px 18px;border-radius:9px;background:var(--ind);color:#0a0a12;border:1px solid var(--ind);white-space:nowrap;cursor:pointer;transition:.15s;
  box-shadow:0 0 0 1px rgba(139,123,255,.2),0 8px 24px -10px var(--ind-glow)}
.cyops-root .cta:hover{filter:brightness(1.08);transform:translateY(-1px)}
.cyops-root .cta.ghost{background:transparent;color:var(--text);border-color:var(--hairline);box-shadow:none}
.cyops-root .cta.ghost:hover{border-color:var(--ind);color:var(--ind-soft)}
@media(max-width:760px){.cyops-root .navlinks{display:none}}

.cyops-root .hero{padding-top:clamp(48px,7vw,90px);padding-bottom:clamp(48px,7vw,96px)}
.cyops-root .hgrid{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center}
@media(max-width:940px){.cyops-root .hgrid{grid-template-columns:1fr;gap:36px}}
.cyops-root .chiprow{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:22px}
.cyops-root .chip{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11.5px;letter-spacing:.04em;color:var(--text-dim);
  padding:6px 11px;border:1px solid var(--hairline);border-radius:999px;background:var(--panel)}
.cyops-root .chip .pip{width:7px;height:7px;border-radius:50%;background:var(--amber);box-shadow:0 0 8px rgba(232,163,61,.6)}
.cyops-root .chip.range{color:var(--added)} .cyops-root .chip.range .pip{background:var(--added);box-shadow:0 0 8px rgba(74,222,128,.6)}
.cyops-root .hero h1{font-size:clamp(2.5rem,6vw,4.3rem);line-height:1.02;margin-bottom:22px}
.cyops-root .hero h1 .g{color:transparent;background:linear-gradient(120deg,var(--ind-soft),var(--ind));-webkit-background-clip:text;background-clip:text}
.cyops-root .hbtns{display:flex;flex-wrap:wrap;gap:14px;margin-top:32px}
.cyops-root .hnote{margin-top:20px;font-family:var(--mono);font-size:12px;color:var(--muted)}

.cyops-root .miniwrap{position:relative}
.cyops-root .mini{border:1px solid var(--hairline);border-radius:14px;overflow:hidden;background:#08090D;
  box-shadow:0 40px 80px -40px rgba(0,0,0,.8),0 0 0 1px rgba(139,123,255,.06)}
.cyops-root .mini::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;border-radius:14px 14px 0 0;
  background:linear-gradient(90deg,var(--ind),rgba(139,123,255,0) 55%);z-index:3}
.cyops-root .mbar{display:flex;align-items:center;gap:9px;padding:11px 14px;border-bottom:1px solid var(--hairline-soft);background:linear-gradient(180deg,var(--raised-2),var(--raised))}
.cyops-root .mbar .dots{display:flex;gap:6px}.cyops-root .mbar .dots i{width:9px;height:9px;border-radius:50%;background:var(--hairline)}
.cyops-root .mbar .t{font-family:var(--display);font-weight:600;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-dim)}
.cyops-root .mbar .t b{color:var(--ind-soft)}
.cyops-root .mbar .live{margin-left:auto;font-family:var(--display);font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--ind-soft);padding:2px 8px;border:1px solid rgba(139,123,255,.32);border-radius:5px;background:rgba(139,123,255,.12)}
.cyops-root .mbody{padding:16px 16px 18px;font-family:var(--mono);font-size:13px;line-height:1.7;min-height:230px}
.cyops-root .mln{white-space:pre-wrap;display:block}
.cyops-root .mln .pr{color:var(--ind)} .cyops-root .mln .cm{color:#49526e} .cyops-root .mln .ok{color:var(--added)} .cyops-root .mln .er{color:var(--threat)} .cyops-root .mln .hi{color:var(--ind-soft)}
.cyops-root .cur{display:inline-block;width:8px;height:15px;vertical-align:-2px;background:var(--ind);box-shadow:0 0 8px var(--ind-glow);animation:cyopsblink 1.05s steps(1) infinite}
.cyops-root .reelframe{display:block;width:100%;aspect-ratio:16/9;border:0;background:#0a0b0f}

.cyops-root .band{background:linear-gradient(180deg,rgba(15,17,25,.55),rgba(15,17,25,.15));border-top:1px solid var(--hairline-soft);border-bottom:1px solid var(--hairline-soft)}
.cyops-root .two{display:grid;grid-template-columns:.9fr 1.1fr;gap:44px;align-items:start}
@media(max-width:880px){.cyops-root .two{grid-template-columns:1fr;gap:28px}}

.cyops-root .tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:38px}
@media(max-width:820px){.cyops-root .tiers{grid-template-columns:1fr}}
.cyops-root .tier{border:1px solid var(--hairline);border-radius:14px;padding:22px;background:var(--panel);position:relative;overflow:hidden}
.cyops-root .tier .vb{font-family:var(--display);font-weight:700;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.cyops-root .tier h3{font-size:1.15rem;margin:12px 0 4px}
.cyops-root .tier .ages{font-family:var(--mono);font-size:12px;color:var(--text-dim)}
.cyops-root .tier p{color:var(--muted);font-size:.92rem;margin-top:12px;line-height:1.55}
.cyops-root .tier.on{border-color:rgba(139,123,255,.5);background:linear-gradient(180deg,rgba(139,123,255,.08),var(--panel));box-shadow:0 0 0 1px rgba(139,123,255,.18),0 24px 50px -30px var(--ind-glow)}
.cyops-root .tier.on::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--ind),transparent 60%)}
.cyops-root .tier.on .vb{color:var(--ind-soft)} .cyops-root .tier.on h3{color:#fff}
.cyops-root .tier .now{position:absolute;top:16px;right:16px;font-family:var(--display);font-size:9px;font-weight:700;letter-spacing:.14em;color:var(--ind-soft);
  border:1px solid rgba(139,123,255,.32);background:rgba(139,123,255,.12);border-radius:5px;padding:3px 7px}

.cyops-root .loop{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:36px}
@media(max-width:880px){.cyops-root .loop{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.cyops-root .loop{grid-template-columns:1fr}}
.cyops-root .step{border:1px solid var(--hairline-soft);border-radius:12px;padding:16px;background:var(--panel);position:relative}
.cyops-root .step .n{font-family:var(--mono);font-size:11px;color:var(--ind-soft)}
.cyops-root .step h4{font-family:var(--display);font-weight:600;font-size:13.5px;letter-spacing:.08em;text-transform:uppercase;margin:9px 0 6px;color:var(--text)}
.cyops-root .step p{color:var(--muted);font-size:.82rem;line-height:1.5}

.cyops-root .acts{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:38px}
@media(max-width:960px){.cyops-root .acts{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.cyops-root .acts{grid-template-columns:1fr}}
.cyops-root .act{border:1px solid var(--hairline-soft);border-radius:12px;overflow:hidden;background:var(--panel)}
.cyops-root .act .ah{padding:12px 14px;border-bottom:1px solid var(--hairline-soft);background:var(--raised)}
.cyops-root .act .ah .wk{font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;color:var(--ind-soft)}
.cyops-root .act .ah h4{font-family:var(--display);font-weight:600;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:var(--text);margin:5px 0 0}
.cyops-root .act ul{list-style:none;margin:0;padding:11px 14px;display:flex;flex-direction:column;gap:8px}
.cyops-root .act li{font-family:var(--mono);font-size:12px;color:var(--text-dim);display:flex;gap:8px;align-items:baseline;line-height:1.4}
.cyops-root .act li b{color:var(--muted);font-weight:600;flex:0 0 auto}
.cyops-root .act.flip .ah{background:linear-gradient(180deg,rgba(74,222,128,.08),var(--raised))}
.cyops-root .act.flip .ah .wk{color:var(--added)}
.cyops-root .act.cap .ah{background:linear-gradient(180deg,rgba(139,123,255,.1),var(--raised))}

.cyops-root .finding{border:1px solid var(--hairline);border-radius:14px;overflow:hidden;background:var(--panel);position:relative}
.cyops-root .finding::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--threat),transparent 60%);z-index:2}
.cyops-root .finding .fh{padding:14px 16px;border-bottom:1px solid var(--hairline-soft);background:var(--raised)}
.cyops-root .finding .fh .fr{display:flex;align-items:center;gap:9px}
.cyops-root .sev{font-family:var(--display);font-weight:700;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--threat);
  background:rgba(255,91,98,.1);border:1px solid rgba(255,91,98,.3);border-radius:5px;padding:3px 8px}
.cyops-root .finding .fh .cv{font-family:var(--mono);font-size:11px;color:var(--muted)}
.cyops-root .finding .fh .fid{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--muted)}
.cyops-root .finding .ft{font-family:var(--display);font-weight:600;font-size:15px;color:var(--text);margin-top:9px;line-height:1.3}
.cyops-root .finding .fb{padding:14px 16px;display:flex;flex-direction:column;gap:6px}
.cyops-root .finding .fb .lbl{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.cyops-root .finding .fb p{font-size:.88rem;color:var(--text-dim);line-height:1.5}
.cyops-root .finding .fb .tgt{font-family:var(--mono);font-size:11.5px;color:var(--ind-soft)}
.cyops-root .ranks{display:flex;flex-direction:column;gap:10px;margin-top:8px}
.cyops-root .rank{display:flex;align-items:center;gap:14px;padding:12px 14px;border:1px solid var(--hairline-soft);border-radius:10px;background:var(--panel)}
.cyops-root .rank .rn{font-family:var(--display);font-weight:600;font-size:13.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-dim)}
.cyops-root .rank .bar{flex:1;height:5px;border-radius:3px;background:var(--hairline);overflow:hidden}
.cyops-root .rank .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--ind),var(--ind-soft))}
.cyops-root .rank .pct{font-family:var(--mono);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.cyops-root .rank.on{border-color:rgba(139,123,255,.45);background:linear-gradient(180deg,rgba(139,123,255,.08),var(--panel))}
.cyops-root .rank.on .rn{color:var(--ind-soft)}

.cyops-root .safe{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:36px}
@media(max-width:720px){.cyops-root .safe{grid-template-columns:1fr}}
.cyops-root .scard{border:1px solid var(--hairline-soft);border-radius:12px;padding:20px;background:var(--panel);display:flex;gap:15px}
.cyops-root .scard .ic{flex:0 0 auto;width:40px;height:40px;border-radius:10px;display:grid;place-items:center;color:var(--added);
  border:1px solid rgba(74,222,128,.3);background:rgba(74,222,128,.07)}
.cyops-root .scard .ic svg{width:20px;height:20px}
.cyops-root .scard h4{font-family:var(--display);font-weight:600;font-size:15px;margin:0 0 6px;color:var(--text)}
.cyops-root .scard p{font-size:.9rem;color:var(--muted);line-height:1.55}

.cyops-root .faq{margin-top:34px;border-top:1px solid var(--hairline-soft)}
.cyops-root details{border-bottom:1px solid var(--hairline-soft)}
.cyops-root summary{cursor:pointer;list-style:none;padding:19px 4px;display:flex;align-items:center;gap:14px;
  font-family:var(--display);font-weight:600;font-size:1.02rem;color:var(--text)}
.cyops-root summary::-webkit-details-marker{display:none}
.cyops-root summary .pl{margin-left:auto;color:var(--ind-soft);font-family:var(--mono);font-size:18px;transition:.2s}
.cyops-root details[open] summary .pl{transform:rotate(45deg)}
.cyops-root details p{padding:0 4px 20px;color:var(--text-dim);font-size:.96rem;max-width:70ch}

.cyops-root .final{text-align:center;padding:clamp(70px,10vw,130px) 0}
.cyops-root .final h2{font-size:clamp(2rem,5vw,3.2rem);margin-bottom:16px}
.cyops-root .finalnote{margin-top:16px;font-family:var(--mono);font-size:12px;color:var(--muted)}

.cyops-root footer{border-top:1px solid var(--hairline-soft);padding:44px 0 60px}
.cyops-root .frow{display:flex;flex-wrap:wrap;gap:22px;align-items:center}
.cyops-root .frow .fl{display:flex;gap:22px;margin-left:auto;flex-wrap:wrap}
.cyops-root .frow .fl a{font-family:var(--mono);font-size:12px;color:var(--muted)}
.cyops-root .frow .fl a:hover{color:var(--text-dim)}
.cyops-root .fine{margin-top:22px;font-family:var(--mono);font-size:11.5px;color:#5a6274;line-height:1.7;max-width:75ch}

.cyops-root :focus-visible{outline:2px solid var(--ind);outline-offset:3px;border-radius:4px}
@keyframes cyopsblink{0%,50%{opacity:1}50.01%,100%{opacity:0}}
@media(prefers-reduced-motion:reduce){.cyops-root .cur{animation:none}}
`;

type TermLine = { c: string; t: string; k?: string };

export default function CyberStartLanding() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let cancelled = false;

    // ---- star-fort backdrop ----
    const cv = bgRef.current;
    let onResize: (() => void) | null = null;
    if (cv && cv.getContext) {
      const ctx = cv.getContext("2d")!;
      const bastion = (cx: number, cy: number, R: number, r: number, n: number, rot: number) => {
        const p: [number, number][] = [];
        for (let i = 0; i < n; i++) {
          const ao = rot + (i * 2 * Math.PI) / n;
          p.push([cx + Math.cos(ao) * R, cy + Math.sin(ao) * R]);
          const ai = rot + ((i + 0.5) * 2 * Math.PI) / n;
          p.push([cx + Math.cos(ai) * r, cy + Math.sin(ai) * r]);
        }
        return p;
      };
      const ngon = (cx: number, cy: number, R: number, n: number, rot: number) => {
        const p: [number, number][] = [];
        for (let i = 0; i < n; i++) {
          const a = rot + (i * 2 * Math.PI) / n;
          p.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
        }
        return p;
      };
      const trace = (p: [number, number][]) => {
        ctx.beginPath();
        p.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
        ctx.closePath();
      };
      const draw = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = cv.clientWidth, h = cv.clientHeight;
        cv.width = Math.max(1, w * dpr);
        cv.height = Math.max(1, h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(150,162,196,0.022)";
        const s = 46;
        ctx.beginPath();
        for (let x = s; x < w; x += s) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
        for (let y = s; y < h; y += s) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
        ctx.stroke();
        const cx = w > 900 ? w * 0.78 : w * 0.5;
        const cy = h * 0.3;
        const R = Math.min(Math.max(w, h) * 0.42, Math.min(w, h) * 0.95);
        const n = 6, rot = -Math.PI / 2, rC = R * 0.8;
        ctx.strokeStyle = "rgba(150,162,196,0.035)"; ctx.lineWidth = 1;
        trace(bastion(cx, cy, R * 1.16, R * 1.16 * 0.83, n, rot)); ctx.stroke();
        trace(bastion(cx, cy, R * 1.07, R * 1.07 * 0.82, n, rot)); ctx.stroke();
        ctx.strokeStyle = "rgba(165,176,208,0.06)"; ctx.lineWidth = 1.4;
        trace(bastion(cx, cy, R, rC, n, rot)); ctx.stroke();
        ctx.strokeStyle = "rgba(150,162,196,0.026)"; ctx.lineWidth = 1;
        const tips = ngon(cx, cy, R, n, rot);
        ctx.beginPath();
        tips.forEach((pt) => { ctx.moveTo(cx, cy); ctx.lineTo(pt[0], pt[1]); });
        ctx.stroke();
        ctx.strokeStyle = "rgba(139,123,255,0.06)"; ctx.lineWidth = 1.2;
        trace(ngon(cx, cy, R * 0.3, n, rot + Math.PI / 6)); ctx.stroke();
      };
      draw();
      let tm = 0;
      onResize = () => { clearTimeout(tm); tm = window.setTimeout(draw, 150); };
      window.addEventListener("resize", onResize);
    }

    // ---- hero terminal typing ----
    const el = termRef.current;
    if (el) {
      const lines: TermLine[] = [
        { c: "cm", t: "# engagement e-05 . scope signed . target authorized" },
        { c: "pr", t: "opr> ", k: "recon --target northwind.range" },
        { c: "ok", t: "  ✓ login form found . reflects DB errors" },
        { c: "pr", t: "opr> ", k: "inject --field email --payload \"' OR 1=1-- -\"" },
        { c: "ok", t: "  ✓ 200 . authenticated as admin  (1 row)" },
        { c: "hi", t: "  holding at one row - staying in scope" },
        { c: "pr", t: "opr> ", k: "log-finding --severity high" },
        { c: "ok", t: "  ✓ Auth bypass (SQLi)  ->  portfolio" },
      ];
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const lineHtml = (l: TermLine) =>
        `<span class="mln ${l.c}">${esc(l.t)}${l.k ? `<span class="hi">${esc(l.k)}</span>` : ""}</span>`;

      if (reduce) {
        el.innerHTML =
          lines.map(lineHtml).join("") +
          `<span class="mln"><span class="pr">opr&gt; </span><span class="cur"></span></span>`;
      } else {
        let li = 0;
        let done: TermLine[] = [];
        const schedule = (fn: () => void, ms: number) => {
          if (cancelled) return;
          timers.push(window.setTimeout(fn, ms));
        };
        const render = (cur: { c: string; head: string; typed: string } | null) => {
          if (cancelled || !el) return;
          let html = done.map(lineHtml).join("");
          if (cur) {
            html += `<span class="mln ${cur.c}">${esc(cur.head)}${cur.typed ? `<span class="hi">${esc(cur.typed)}</span>` : ""}<span class="cur"></span></span>`;
          }
          el.innerHTML = html;
        };
        function next() {
          if (cancelled) return;
          if (li >= lines.length) {
            schedule(() => { done = []; li = 0; step(); }, 2600);
            return;
          }
          const l = lines[li];
          if (l.k) { typeCmd(l); }
          else { done.push(l); li++; render(null); schedule(next, 360); }
        }
        function typeCmd(l: TermLine) {
          let i = 0;
          const tick = () => {
            if (cancelled) return;
            render({ c: l.c, head: l.t, typed: (l.k || "").slice(0, i) });
            if (i <= (l.k || "").length) { i++; schedule(tick, 34); }
            else { done.push(l); li++; render(null); schedule(next, 420); }
          };
          tick();
        }
        function step() { render(null); schedule(next, 400); }
        step();
      }
    }

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
      if (onResize) window.removeEventListener("resize", onResize);
    };
  }, []);

  // Forward the page's first interaction into the embedded film, so a click or
  // tap ANYWHERE on the page turns its sound on (browsers still require that one
  // gesture - this just means it doesn't have to land on the film itself).
  useEffect(() => {
    let done = false;
    const evs = ["pointerdown", "keydown", "touchstart"] as const;
    const tryUnmute = () => {
      if (done) return;
      const f = document.querySelector<HTMLIFrameElement>("iframe.reelframe");
      const fn = f?.contentWindow && (f.contentWindow as unknown as { __unmute?: () => void }).__unmute;
      if (typeof fn === "function") { fn(); done = true; cleanup(); }
    };
    const cleanup = () => evs.forEach((e) => window.removeEventListener(e, tryUnmute));
    evs.forEach((e) => window.addEventListener(e, tryUnmute, { passive: true }));
    return cleanup;
  }, []);

  return (
    <div className="cyops-root">
      <style>{CSS}</style>
      <CodeRainBackground bg="#0A0B0F" head="rgba(190,180,255,0.6)" accentA="rgba(74,222,128,0.5)" accentB="rgba(120,224,255,0.46)" />
      <canvas id="bg" ref={bgRef} aria-hidden="true" />
      <div className="veil" aria-hidden="true" />

      <nav>
        <div className="wrap navrow">
          <a href="#top" className="brand"><span className="dot" />CYBER OPS <small>by AlgorithmX</small></a>
          <div className="navlinks">
            <a href="#range">The Range</a>
            <a href="#curriculum">Curriculum</a>
            <a href="#outcome">Outcome</a>
            <a href="#safety">Safety</a>
            <a href="#faq">FAQ</a>
          </div>
          <a href="#join" className="cta">Join the waitlist</a>
        </div>
      </nav>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hgrid">
            <div>
              <div className="chiprow">
                <span className="chip"><span className="pip" />Coming soon</span>
                <span className="chip range"><span className="pip" />Ages 14-17</span>
                <span className="chip mono">16 weeks . 90 min/week</span>
              </div>
              <h1>Get recruited.<br /><span className="g">Do the real work.</span></h1>
              <p className="lead">Cyber Ops hires you as a junior security operator. Break into real targets, defend against real attacks, and write up real findings - inside a walled range where nothing can actually go wrong. You leave with a portfolio, not a certificate.</p>
              <div className="hbtns">
                <a href="#join" className="cta">Join the waitlist</a>
                <a href="#curriculum" className="cta ghost">See the 16 weeks &rarr;</a>
              </div>
              <p className="hnote">The top tier of AlgorithmX - after Cyber Heroes and Cyber Explorers.</p>
              {/* Aligned with the NCSC (alignment, not endorsement). */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 13,
                marginTop: 18, padding: "9px 18px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(139,123,255,0.34)",
                boxShadow: "0 0 24px -14px rgba(139,123,255,1)",
              }}>
                <span style={{
                  fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.22em",
                  textTransform: "uppercase", color: "#b9aaff",
                }}>
                  Aligned with
                </span>
                <span aria-hidden style={{ width: 1, height: 22, background: "rgba(255,255,255,0.16)" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/ncsc.svg" alt="National Cyber Security Centre" loading="lazy" style={{ height: 28, width: "auto" }} />
              </div>
            </div>

            <div className="miniwrap">
              <div className="mini reel">
                <div className="mbar">
                  <span className="dots"><i /><i /><i /></span>
                  <span className="t"><b>opr</b>@range . the reel</span>
                  <span className="live">Film . 0:29</span>
                </div>
                <iframe
                  className="reelframe"
                  src="/operators/hero?embed=1"
                  title="Cyber Ops - Get There First"
                  loading="lazy"
                  allow="autoplay; fullscreen"
                />
              </div>
            </div>
          </div>
        </section>

        {/* LADDER */}
        <section className="band" id="ladder">
          <div className="wrap">
            <div className="ey"><span className="k">The progression</span></div>
            <h2>Three tiers. One climb.</h2>
            <p className="lead" style={{ marginTop: 14 }}>AlgorithmX grows with the learner. Cyber Ops is the top rung - where it stops being a game <em>about</em> security and becomes the real thing, done for real.</p>
            <div className="tiers">
              <div className="tier">
                <div className="vb">Play</div>
                <h3>Cyber Heroes</h3>
                <div className="ages">Ages 6-9</div>
                <p>Animated missions and boss battles teach the first habits of staying safe online.</p>
              </div>
              <div className="tier">
                <div className="vb">Notice</div>
                <h3>Cyber Explorers</h3>
                <div className="ages">Ages 10-13</div>
                <p>Step into the analyst&rsquo;s room. Learn to spot the attack and reason like a defender.</p>
              </div>
              <div className="tier on">
                <span className="now">You are here</span>
                <div className="vb">Do</div>
                <h3>Cyber Ops</h3>
                <div className="ages">Ages 14-17</div>
                <p>Join a security firm and run real engagements. Attack, defend, and disclose - for real, inside the range.</p>
              </div>
            </div>
          </div>
        </section>

        {/* THE RANGE */}
        <section id="range">
          <div className="wrap two">
            <div>
              <div className="ey"><span className="k">What you actually do</span></div>
              <h2>A walled range. Real tools. Real targets.</h2>
              <p className="lead" style={{ marginTop: 16 }}>Every week, Cyber Ops hands you a client engagement. You run it the way professionals do - on genuinely vulnerable systems we build for you to break. It all lives inside a sandbox that never touches the real internet, so you can do the real thing without any of the real risk.</p>
              <p className="lead" style={{ marginTop: 14, color: "var(--muted)", fontSize: ".98rem" }}>Your payloads actually run. Your exploits actually land. Nothing ever leaves your browser.</p>
            </div>
            <div>
              <div className="loop">
                <div className="step"><div className="n">01</div><h4>Authorize</h4><p>Sign the scope. You only ever act inside written permission - the first rule of the job.</p></div>
                <div className="step"><div className="n">02</div><h4>Recon</h4><p>Map the target and find the way in before you touch a thing.</p></div>
                <div className="step"><div className="n">03</div><h4>Act</h4><p>Run the technique for real against the range - injection, cracking, or defense.</p></div>
                <div className="step"><div className="n">04</div><h4>Document</h4><p>Capture the finding: impact, proof, and the fix.</p></div>
                <div className="step"><div className="n">05</div><h4>Report</h4><p>File it. It lands in your portfolio and your standing at Cyber Ops.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* CURRICULUM */}
        <section className="band" id="curriculum">
          <div className="wrap">
            <div className="ey"><span className="k">The curriculum</span></div>
            <h2>Sixteen weeks, attacker to defender.</h2>
            <p className="lead" style={{ marginTop: 14 }}>You spend the first weeks learning to break in - then turn around and learn to catch it. That&rsquo;s the honest arc of the profession, and it&rsquo;s why this is never just a hacking course.</p>
            <div className="acts">
              <div className="act">
                <div className="ah"><div className="wk">Weeks 1-3</div><h4>Foundations</h4></div>
                <ul>
                  <li><b>01</b>Rules of Engagement</li>
                  <li><b>02</b>Recon &amp; OSINT</li>
                  <li><b>03</b>The Web Surface</li>
                </ul>
              </div>
              <div className="act">
                <div className="ah"><div className="wk">Weeks 4-7</div><h4>Web Exploitation</h4></div>
                <ul>
                  <li><b>04</b>Broken Auth</li>
                  <li><b>05</b>Injection</li>
                  <li><b>06</b>Cross-Site Scripting</li>
                  <li><b>07</b>Access Control</li>
                </ul>
              </div>
              <div className="act">
                <div className="ah"><div className="wk">Weeks 8-11</div><h4>Data &amp; Systems</h4></div>
                <ul>
                  <li><b>08</b>Cryptography</li>
                  <li><b>09</b>Passwords &amp; Hashes</li>
                  <li><b>10</b>Network Recon</li>
                  <li><b>11</b>Digital Forensics</li>
                </ul>
              </div>
              <div className="act flip">
                <div className="ah"><div className="wk">Weeks 12-14</div><h4>The Role Flip</h4></div>
                <ul>
                  <li><b>12</b>Incident Response</li>
                  <li><b>13</b>Phishing Defense</li>
                  <li><b>14</b>Disclosure &amp; Reporting</li>
                </ul>
              </div>
              <div className="act cap">
                <div className="ah"><div className="wk">Weeks 15-16</div><h4>Capstone</h4></div>
                <ul>
                  <li><b>15</b>Full Engagement I</li>
                  <li><b>16</b>Report &amp; Debrief</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* OUTCOME */}
        <section id="outcome">
          <div className="wrap two">
            <div>
              <div className="ey"><span className="k">What you leave with</span></div>
              <h2>A portfolio, not a sticker.</h2>
              <p className="lead" style={{ marginTop: 16 }}>Every engagement produces a real finding, written up the way a professional would - impact, proof, remediation. They stack into a portfolio you can actually show a teacher, a UCAS statement, or a first employer. Your standing at Cyber Ops climbs with the quality of the work, not just finishing it.</p>
              <div className="ranks">
                <div className="rank on"><span className="rn">Junior</span><span className="bar"><i style={{ width: "64%" }} /></span><span className="pct">64%</span></div>
                <div className="rank"><span className="rn">Operator</span><span className="bar"><i style={{ width: 0 }} /></span><span className="pct">&mdash;</span></div>
                <div className="rank"><span className="rn">Lead</span><span className="bar"><i style={{ width: 0 }} /></span><span className="pct">&mdash;</span></div>
                <div className="rank"><span className="rn">Principal</span><span className="bar"><i style={{ width: 0 }} /></span><span className="pct">&mdash;</span></div>
              </div>
            </div>
            <div>
              <div className="finding">
                <div className="fh">
                  <div className="fr"><span className="sev">High</span><span className="cv">CVSS 8.1</span><span className="fid">F-1 . E-05</span></div>
                  <div className="ft">Authentication bypass via SQL injection</div>
                </div>
                <div className="fb">
                  <span className="lbl">Target</span>
                  <span className="tgt">tgt-04.range.lab . POST /login</span>
                  <span className="lbl" style={{ marginTop: 8 }}>Impact</span>
                  <p>The email field is concatenated straight into the login query. A crafted value logs in as any account - including admin - with no password.</p>
                  <span className="lbl" style={{ marginTop: 8 }}>Remediation</span>
                  <p className="mono" style={{ color: "var(--added)", fontSize: ".82rem" }}>Use a parameterized query: email = $1, [email]</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SAFETY */}
        <section className="band" id="safety">
          <div className="wrap">
            <div className="ey"><span className="k">For parents</span></div>
            <h2>Real skills. Zero real risk.</h2>
            <p className="lead" style={{ marginTop: 14 }}>Cyber Ops teaches genuine offensive and defensive security - the reason it&rsquo;s safe is architecture, not promises.</p>
            <div className="safe">
              <div className="scard">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.4 7.7 8 10 4.6-2.3 8-5 8-10V6l-8-4Z" /></svg></div>
                <div><h4>A walled range</h4><p>Every target is a fake system that runs inside the browser. There is no network path out - nothing your child does can reach a real computer, ever.</p></div>
              </div>
              <div className="scard">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.4 7.7 8 10 4.6-2.3 8-5 8-10V6l-8-4Z" /><path d="m9 12 2 2 4-4" /></svg></div>
                <div><h4>Authorization first</h4><p>Every engagement begins by signing a scope. The single most important professional and legal habit - you only touch what you&rsquo;re allowed to - is practised sixteen times.</p></div>
              </div>
              <div className="scard">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg></div>
                <div><h4>Spot the con, don&rsquo;t run it</h4><p>Your child learns to recognise phishing and manipulation - never to author it. Deception aimed at people stays firmly on the defensive side.</p></div>
              </div>
              <div className="scard">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6" /></svg></div>
                <div><h4>Structured &amp; tracked</h4><p>A 16-week curriculum with clear progress, a professional tone, and law-aware framing throughout. Built for teenagers, respected as teenagers.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="wrap" style={{ maxWidth: 820 }}>
            <div className="ey"><span className="k">Questions</span></div>
            <h2>Straight answers.</h2>
            <div className="faq">
              <details open><summary>Is this teaching my child to hack?<span className="pl">+</span></summary><p>Yes - and that&rsquo;s the point. You cannot defend what you don&rsquo;t understand. Cyber Ops teaches real offensive technique against fake targets in a sealed range, then turns your child around to defend and disclose. They finish as someone who protects systems, with the professional ethics to match.</p></details>
              <details><summary>Is it actually safe and legal?<span className="pl">+</span></summary><p>Completely. Every target is simulated inside the browser with no route to any real system, and every engagement starts by signing an authorization scope - the exact habit that keeps real professionals on the right side of the law. We frame the relevant UK law (the Computer Misuse Act) throughout.</p></details>
              <details><summary>What ages is it for? Do they need to be technical?<span className="pl">+</span></summary><p>Ages 14-17. No prior experience needed - the first weeks build the ground up, and early engagements guide the commands so nobody&rsquo;s staring at a blank terminal. It gets genuinely challenging by design as they rank up.</p></details>
              <details><summary>What do they come away with?<span className="pl">+</span></summary><p>A portfolio of real security findings, written the way a professional writes them, plus a reputation rank at Cyber Ops. It&rsquo;s something they can show a teacher, put in a UCAS statement, or bring to a first conversation about a career in security.</p></details>
              <details><summary>When can we start, and how much?<span className="pl">+</span></summary><p>Cyber Ops is in development now. Join the waitlist and you&rsquo;ll be first to know when the range opens, with early-access pricing. AlgorithmX courses are a one-time payment for lifetime access.</p></details>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final band" id="join">
          <div className="wrap">
            <div className="ey" style={{ justifyContent: "center" }}><span className="k">Enlist</span></div>
            <h2>Be first into the range.</h2>
            <p className="lead" style={{ margin: "0 auto", textAlign: "center" }}>Cyber Ops opens soon. Leave your email and we&rsquo;ll bring you in the moment recruitment starts.</p>
            <div style={{ marginTop: 30 }}>
              <WaitlistForm
                courseSlug="cyberstart"
                accent="#8B7BFF"
                accentSoft="#B4AAFF"
                buttonGradient="linear-gradient(120deg,#B4AAFF,#8B7BFF)"
                buttonShadow="0 8px 24px -10px rgba(139,123,255,.6)"
                source="cyberops-landing"
              />
            </div>
            <p className="finalnote">No spam. One email when the range opens.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="frow">
            <a href="#top" className="brand"><span className="dot" />CYBER OPS <small>by AlgorithmX</small></a>
            <div className="fl">
              <a href="#range">The Range</a>
              <a href="#curriculum">Curriculum</a>
              <a href="#safety">Safety</a>
              <a href="#faq">FAQ</a>
              <a href="#join">Waitlist</a>
            </div>
          </div>
          <p className="fine">Cyber Ops is the 14-17 tier of AlgorithmX, a UK cybersecurity course for young people. All training takes place in a simulated, sandboxed range; no real systems are ever involved. &copy; AlgorithmX. Working name - brand and pricing subject to change.</p>
        </div>
      </footer>
    </div>
  );
}
