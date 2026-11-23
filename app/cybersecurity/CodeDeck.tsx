"use client";

import { useEffect, useRef } from "react";
import { setupHiDpiCanvas } from "@/app/lib/gameEngine/canvas";

/* The /cybersecurity hero signature (landing lab round 6, cat v1 "Code Deck").
 *
 * Six translucent glass code panes stacked back and up to the right in
 * perspective, slowly yawing and bobbing. Each pane types a short security
 * script, shows a green "compiled" badge, clears and types again. Syntax
 * colours are the house accents at low alpha, so the deck stays pale under
 * the copy veil.
 *
 * Cost (target: under 4 ms a frame): one canvas at 30 fps, DPR capped at 1.5.
 * Each pane is an offscreen bitmap with a base layer (glass, file name,
 * finished lines, badge) rebuilt only when a line lands; a keystroke redraws
 * only the line being typed; at most two pane repaints a frame. The light
 * pool under the deck is static CSS. The loop stops offscreen, when the tab
 * is hidden and when the page's Pause is pressed; under reduced motion it
 * draws one still frame and never starts. */

type Script = { file: string; ok: string; lines: string[] };
const SCRIPTS: Script[] = [
  { file: "scan.py", ok: "scan complete · 2 open ports", lines: ["# port scan, lab range only", "import socket", "for port in range(20, 1024):", "    s = socket.socket()", "    s.settimeout(0.2)", "    if s.connect_ex((host, port)) == 0:", "        print(f\"open {port}\")", "    s.close()"] },
  { file: "auth.ts", ok: "build passed · 48/48 tests", lines: ["// session check", "const ok = await verify(token, {", "  issuer: \"algorithmx.io\",", "  maxAge: \"15m\",", "});", "if (!ok) throw new AuthError(401);", "session.rotate();"] },
  { file: "terminal", ok: "firewall rule added", lines: ["$ nmap -sV 10.0.4.12", "PORT     STATE  SERVICE", "22/tcp   open   ssh", "443/tcp  open   https", "8080/tcp closed http-proxy", "$ sudo ufw deny 8080/tcp", "Rule added"] },
  { file: "login.sql", ok: "parameterised · no injection", lines: ["-- one query, bound values", "SELECT id FROM users", " WHERE email = $1", "   AND pw_hash = crypt($2, pw_hash)", " LIMIT 1;"] },
  { file: "policy.yaml", ok: "policy valid · 0 warnings", lines: ["# access policy", "password:", "  min_length: 12", "  require_mfa: true", "  rotate_days: 90", "phishing:", "  quarantine: auto", "  report_to: soc"] },
  { file: "verify.go", ok: "integrity ok", lines: ["// checksum before install", "sum := sha256.Sum256(file)", "if hex(sum) != expected {", "    log.Fatal(\"tampered\")", "}", "fmt.Println(\"integrity ok\")"] },
];
const KW = /^(import|for|in|range|if|const|await|throw|new|return|SELECT|FROM|WHERE|AND|LIMIT|true|false|func|log|fmt|print|open|closed|auto|session|socket|sudo)$/;
type Tone = "t" | "k" | "s" | "n" | "c" | "p" | "f";
const COL: Record<Tone, string> = { t: "rgba(11,13,18,.5)", k: "rgba(87,68,201,.72)", s: "rgba(165,17,127,.62)", n: "rgba(138,84,0,.75)", c: "rgba(75,85,101,.5)", p: "rgba(10,112,133,.8)", f: "rgba(10,112,133,.7)" };
type Tok = [Tone, string];
function tok(line: string): Tok[] {
  if (/^\s*(#|\/\/|--)/.test(line)) return [["c", line]];
  const out: Tok[] = [];
  if (/^\$ /.test(line)) { out.push(["p", "$"]); line = line.slice(1); }
  line.replace(/("[^"]*"?|'[^']*'?|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z_0-9]*\b|[^\w"' ]+|\s+)/g, (m) => {
    let c: Tone = "t";
    if (m[0] === '"' || m[0] === "'") c = "s"; else if (/^\d/.test(m)) c = "n"; else if (KW.test(m)) c = "k"; else if (/^[A-Z][A-Z_]{2,}$/.test(m)) c = "f";
    out.push([c, m]); return m;
  });
  return out;
}

const PW = 300, PH = 200, LH = 15, MAXL = 9, PAD = 12, TOP = 34, FOCAL = 1300;
/* the stack: x, y, z, opacity; back and up to the right, fading with depth */
const LAYOUT: Array<[number, number, number, number]> = [[-150, 70, 120, 1], [-80, 20, 10, 0.9], [-10, -30, -100, 0.78], [60, -80, -210, 0.64], [130, -130, -320, 0.5], [200, -180, -430, 0.38]];

type Pane = {
  sc: Script; off: HTMLCanvasElement; oc: CanvasRenderingContext2D; base: HTMLCanvasElement; bc: CanvasRenderingContext2D; baseKey: string;
  li: number; ci: number; state: "type" | "ok" | "hold"; next: number; speed: number; lines: string[]; dirty: boolean; ok: number; okAt: number;
};

export default function CodeDeck({ paused }: { paused: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const ctlRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) ctlRef.current?.stop(); else ctlRef.current?.start();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current, cv = cvRef.current;
    if (!host || !cv) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx: CanvasRenderingContext2D | null = null;
    let scale = 1, W = 0, H = 0;
    /* canvas fonts cannot read CSS variables, so take the resolved family off the host */
    const family = getComputedStyle(host).fontFamily || "ui-monospace, monospace";
    const CODEFONT = `500 10.5px ${family}`, FILEFONT = `500 9px ${family}`, OKFONT = `700 9.5px ${family}`;

    const mk = () => { const c = document.createElement("canvas"); return [c, c.getContext("2d") as CanvasRenderingContext2D] as const; };
    const panes: Pane[] = SCRIPTS.map((sc, i) => {
      const [off, oc] = mk(), [base, bc] = mk();
      const start = Math.floor(sc.lines.length * ((i * 0.37) % 1));
      const p: Pane = { sc, off, oc, base, bc, baseKey: "", li: start, ci: 0, state: "type", next: 0, speed: 48 + (i % 3) * 14, lines: sc.lines.slice(0, start), dirty: true, ok: 0, okAt: 0 };
      if (reduced) { p.lines = sc.lines.slice(); p.li = sc.lines.length; p.state = "hold"; }
      return p;
    });

    /* monospace: one advance width replaces measureText per token */
    let CW = 0;
    const TOK = new Map<string, Tok[]>();
    const tokC = (l: string) => { let t = TOK.get(l); if (!t) { t = tok(l); TOK.set(l, t); } return t; };
    const drawLine = (oc: CanvasRenderingContext2D, y: number, toks: Tok[], cursor: boolean) => {
      let x = PAD;
      for (const [c, s] of toks) { oc.fillStyle = COL[c]; oc.fillText(s, x, y); x += s.length * CW; }
      if (cursor) { oc.fillStyle = "rgba(10,112,133,.6)"; oc.fillRect(x + 1, y - 10, 6, 12); }
    };

    /* the glass chrome is two shared bitmaps: typing and compiled */
    const CHROME: Array<HTMLCanvasElement | null> = [null, null];
    let chromeScale = 0;
    const chrome = (ok: 0 | 1) => {
      if (chromeScale !== scale) { CHROME[0] = CHROME[1] = null; chromeScale = scale; }
      const have = CHROME[ok]; if (have) return have;
      const [c, oc] = mk(); c.width = Math.ceil(PW * scale); c.height = Math.ceil(PH * scale); oc.setTransform(scale, 0, 0, scale, 0, 0);
      oc.beginPath(); oc.roundRect(0.5, 0.5, PW - 1, PH - 1, 12);
      oc.fillStyle = "rgba(255,255,255,.66)"; oc.fill();
      const g = oc.createLinearGradient(0, 0, PW, PH); g.addColorStop(0, "rgba(0,229,255,.07)"); g.addColorStop(0.45, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(139,123,255,.09)"); oc.fillStyle = g; oc.fill();
      oc.strokeStyle = ok ? "rgba(14,122,69,.5)" : "rgba(10,112,133,.3)"; oc.lineWidth = 1; oc.stroke();
      const hl = oc.createLinearGradient(PW * 0.12, 0, PW * 0.88, 0); hl.addColorStop(0, "rgba(0,229,255,0)"); hl.addColorStop(0.5, "rgba(0,229,255,.85)"); hl.addColorStop(1, "rgba(0,229,255,0)"); oc.fillStyle = hl; oc.fillRect(PW * 0.12, 0, PW * 0.76, 1);
      ([["rgba(10,112,133,.3)", 0], ["rgba(139,123,255,.35)", 1], ["rgba(165,17,127,.3)", 2]] as const).forEach(([col, k]) => { oc.fillStyle = col; oc.beginPath(); oc.arc(PAD + 4 + k * 11, 15, 3, 0, 6.283); oc.fill(); });
      CHROME[ok] = c; return c;
    };

    const paintBase = (p: Pane, shown: string[]) => {
      const b = p.base, oc = p.bc;
      if (b.width !== Math.ceil(PW * scale)) { b.width = Math.ceil(PW * scale); b.height = Math.ceil(PH * scale); }
      oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, b.width, b.height);
      oc.drawImage(chrome(p.ok ? 1 : 0), 0, 0);
      oc.setTransform(scale, 0, 0, scale, 0, 0);
      oc.font = FILEFONT; oc.fillStyle = "rgba(75,85,101,.6)"; oc.textBaseline = "middle"; oc.fillText(p.sc.file, PAD + 40, 15);
      oc.font = CODEFONT; oc.textBaseline = "alphabetic";
      if (!CW) CW = oc.measureText("0000000000").width / 10;
      shown.forEach((l, k) => drawLine(oc, TOP + k * LH + 11, tokC(l), false));
      if (p.ok) {
        const y = PH - 30, w = PW - PAD * 2; oc.globalAlpha = p.ok;
        oc.beginPath(); oc.roundRect(PAD, y, w, 22, 8); oc.fillStyle = "rgba(255,255,255,.85)"; oc.fill(); oc.strokeStyle = "rgba(14,122,69,.4)"; oc.lineWidth = 1; oc.stroke();
        oc.strokeStyle = "#0e7a45"; oc.lineWidth = 2.4; oc.lineCap = "round"; oc.lineJoin = "round"; oc.beginPath(); oc.moveTo(PAD + 9, y + 11); oc.lineTo(PAD + 13, y + 15); oc.lineTo(PAD + 20, y + 7); oc.stroke();
        oc.font = OKFONT; oc.fillStyle = "rgba(14,122,69,.95)"; oc.textBaseline = "middle"; oc.fillText(p.sc.ok, PAD + 28, y + 11.5);
        oc.globalAlpha = 1;
      }
    };
    const paint = (p: Pane) => {
      const off = p.off;
      if (off.width !== Math.ceil(PW * scale)) { off.width = Math.ceil(PW * scale); off.height = Math.ceil(PH * scale); }
      const shown = p.lines.slice(-MAXL + (p.state === "type" ? 1 : 0));
      const key = `${scale}|${CW}|${p.ok}|${p.lines.length}|${shown.length}`;
      if (key !== p.baseKey) { paintBase(p, shown); p.baseKey = key; }
      const oc = p.oc;
      oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height); oc.drawImage(p.base, 0, 0);
      if (p.state === "type" && p.li < p.sc.lines.length) { oc.setTransform(scale, 0, 0, scale, 0, 0); oc.font = CODEFONT; oc.textBaseline = "alphabetic"; drawLine(oc, TOP + shown.length * LH + 11, tok(p.sc.lines[p.li].slice(0, p.ci)), true); }
      p.dirty = false;
    };

    /* typing engine: a timer per pane, only the touched pane repaints */
    const type = (now: number) => {
      for (const p of panes) {
        if (p.state === "hold" || now < p.next) continue;
        if (p.state === "type") {
          p.next = now + p.speed * (0.6 + Math.random() * 0.9);
          const line = p.sc.lines[p.li];
          p.ci += 1 + (Math.random() < 0.35 ? 1 : 0);
          if (p.ci >= line.length) {
            p.lines.push(line); p.li++; p.ci = 0;
            if (p.li >= p.sc.lines.length) { p.state = "ok"; p.okAt = now; p.next = now + 2800 + Math.random() * 1200; }
            else p.next = now + 180 + Math.random() * 320;
          }
          p.dirty = true;
        } else if (p.state === "ok") { p.ok = 0; p.lines = []; p.li = 0; p.ci = 0; p.state = "type"; p.next = now + 700; p.dirty = true; }
      }
      for (const p of panes) if (p.state === "ok") { const a = Math.min(1, (now - p.okAt) / 400); if (a !== p.ok) { p.ok = a; p.dirty = true; } }
    };

    let raf = 0, running = false, visible = true, lastDraw = 0, rr = 0;
    const frame = (now: number, still: boolean) => {
      if (!ctx || !W) return;
      if (!still) type(now);
      let budget = still ? panes.length : 2;
      for (let k = 0; k < panes.length && budget > 0; k++) { const p = panes[(rr + k) % panes.length]; if (p.dirty) { paint(p); budget--; } }
      rr = (rr + 1) % panes.length;
      ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.clearRect(0, 0, W, H);
      const cx = W * 0.5, cy = H * 0.5 + 10;
      const yaw = reduced ? -0.42 : -0.42 + Math.sin(now / 7000) * 0.17, pitch = 0.19 + (reduced ? 0 : Math.sin(now / 11000) * 0.03), bob = reduced ? 0 : Math.sin(now / 4000) * 6;
      const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const proj = (x: number, y: number, z: number) => { const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw; const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp; const s = FOCAL / (FOCAL - z2); return [cx + x1 * s, cy + y2 * s, z2]; };
      const order = LAYOUT.map((L, i) => ({ i, z: proj(L[0], L[1], L[2])[2] })).sort((a, b) => a.z - b.z);
      for (const { i } of order) {
        const [x, y, z, o] = LAYOUT[i], p = panes[i];
        const tl = proj(x - PW / 2, y - PH / 2 + bob, z), tr = proj(x + PW / 2, y - PH / 2 + bob, z), bl = proj(x - PW / 2, y + PH / 2 + bob, z);
        const a = (tr[0] - tl[0]) / PW, b = (tr[1] - tl[1]) / PW, c = (bl[0] - tl[0]) / PH, d = (bl[1] - tl[1]) / PH;
        ctx.setTransform(a * scale, b * scale, c * scale, d * scale, tl[0] * scale, tl[1] * scale);
        ctx.globalAlpha = o;
        ctx.fillStyle = p.ok ? "rgba(95,255,163,.16)" : "rgba(0,229,255,.1)"; ctx.fillRect(-6, 8, PW + 12, PH + 2);
        ctx.drawImage(p.off, 0, 0, PW, PH);
      }
      ctx.globalAlpha = 1; ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const loop = (now: number) => { raf = 0; if (!running) return; if (now - lastDraw >= 31) { lastDraw = now; frame(now, false); } raf = requestAnimationFrame(loop); };
    const start = () => { if (running || reduced || pausedRef.current || document.hidden || !visible) return; running = true; raf = requestAnimationFrame(loop); };
    const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
    ctlRef.current = { start, stop };

    const size = () => {
      const r = host.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
      const set = setupHiDpiCanvas(cv, { logicalWidth: W, logicalHeight: H, maxDpr: 1.5 });
      ctx = set ? set.ctx : null; scale = cv.width / W;
      panes.forEach((p) => (p.dirty = true));
      if (!running) frame(performance.now(), true);
    };
    const ro = new ResizeObserver(size); ro.observe(host);
    const heroEl = host.closest("section") ?? host;
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { visible = en.isIntersecting; if (visible) start(); else stop(); }), { threshold: 0.02 });
    io.observe(heroEl);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    let alive = true;
    document.fonts?.ready.then(() => { if (!alive) return; CW = 0; panes.forEach((p) => { p.dirty = true; p.baseKey = ""; }); if (!running) frame(performance.now(), true); });
    size();
    if (reduced) frame(performance.now(), true); else start();
    return () => { alive = false; stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); ctlRef.current = null; };
  }, []);

  return (
    <div className="deck" ref={hostRef}>
      <div className="dpool" />
      <canvas ref={cvRef} />
    </div>
  );
}
