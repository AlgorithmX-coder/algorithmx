"use client";

/* Live Exploit Terminal backdrop for the Cyber Ops portfolio (UAT pick #01).
 * A full-bleed, dimmed console that types real exploit chatter in the
 * background, behind a readability scrim. Fixed + pointer-events:none so it
 * never interferes with the page; pauses when the tab is hidden; renders a
 * single still frame under prefers-reduced-motion. Canvas-drawn, aria-hidden. */

import { useEffect, useRef } from "react";

const BG = "#14161e";
const COL = {
  cmd: "#5fe6ff",   // $ commands
  ok: "#55d98c",    // [+] success
  bad: "#f26d72",   // [-] failure
  pay: "#b3a8ff",   // > payloads
  flag: "#e8a33d",  // flags
  cursor: "#8b7bff",
};

type Line = { s: string; c: string; bold?: boolean };

const POOL: Line[] = [
  { s: "$ nmap -sV portal.northwind.range", c: COL.cmd },
  { s: "[+] 22/tcp  open  ssh  OpenSSH 9.6", c: COL.ok },
  { s: "[+] 443/tcp open  https nginx", c: COL.ok },
  { s: "$ curl -s portal.northwind.range/login", c: COL.cmd },
  { s: "> email: ' OR 1=1--", c: COL.pay },
  { s: "[+] auth bypass -> signed in as admin", c: COL.ok },
  { s: "$ sqlmap -u shop.northwind.range/search", c: COL.cmd },
  { s: "> ' ORDER BY 4--   [-] error, 3 columns", c: COL.pay },
  { s: "> ' UNION SELECT email,pass,role FROM users--", c: COL.pay },
  { s: "[+] 3 rows dumped", c: COL.ok },
  { s: "> ' UNION SELECT name,sql,type FROM sqlite_master--", c: COL.pay },
  { s: "[+] tables: products, users, orders, secrets", c: COL.ok },
  { s: "> ' UNION SELECT customer,card_last4,NULL FROM orders--", c: COL.pay },
  { s: "[+] 3 card records exposed", c: COL.ok },
  { s: "$ hashcat -m 0 hashes.txt wordlist.txt", c: COL.cmd },
  { s: "[+] cracked: Vantage2026!", c: COL.ok },
  { s: "> login a.flint@vantage.range : Vantage2026!", c: COL.pay },
  { s: "[-] firewall dropped a probe", c: COL.bad },
  { s: "> ' UNION SELECT label,value,NULL FROM secrets--", c: COL.pay },
  { s: "[+] flag{un10n_t0_the_v4ult}", c: COL.flag },
  { s: "ACCESS GRANTED", c: COL.ok, bold: true },
];

export default function OpsBackdrop() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* noop */ }

    let w = 0, h = 0, lh = 20, size = 14, rows = 0;
    const lines: Line[] = [];
    let tgt = POOL[0], ci = 0, pi = 0, acc = 0, blink = 0, last = 0;
    let raf = 0;

    function size_() {
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = Math.round(w * DPR); canvas!.height = Math.round(h * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      lh = Math.max(18, Math.round(h / 34)); size = Math.round(lh * 0.72); rows = Math.ceil(h / lh) + 1;
      ctx!.font = `${size}px 'IBM Plex Mono', ui-monospace, Menlo, monospace`;
      ctx!.textBaseline = "alphabetic";
    }

    function render() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.font = `${size}px 'IBM Plex Mono', ui-monospace, Menlo, monospace`;
      let y = h - lh * 0.6 - lh * (/* current line occupies bottom */ 0);
      // draw from bottom up: current (typing) line, then history above
      const typed = tgt.s.slice(0, ci);
      ctx!.globalAlpha = 0.5; ctx!.fillStyle = tgt.c; if (tgt.bold) ctx!.fillStyle = COL.ok;
      ctx!.fillText(typed, 22, y);
      if ((blink % 1000) < 540) { const wch = ctx!.measureText(typed).width; ctx!.fillStyle = COL.cursor; ctx!.globalAlpha = 0.55; ctx!.fillRect(22 + wch + 2, y - size * 0.78, size * 0.5, size * 0.92); }
      for (let i = lines.length - 1; i >= 0; i--) {
        y -= lh; if (y < -lh) break;
        const ln = lines[i];
        const depth = (lines.length - i) / rows;
        ctx!.globalAlpha = Math.max(0.08, 0.46 - depth * 0.4);
        ctx!.fillStyle = ln.bold ? COL.ok : ln.c;
        ctx!.fillText(ln.s, 22, y);
      }
      ctx!.globalAlpha = 1;
    }

    function tick(now: number) {
      const dt = last ? Math.min(60, now - last) : 16; last = now;
      acc += dt * 0.06; blink += dt;
      while (acc >= 1) {
        acc -= 1;
        if (ci < tgt.s.length) ci++;
        else { lines.push(tgt); if (lines.length > rows + 2) lines.shift(); pi = (pi + 1) % POOL.length; tgt = POOL[pi]; ci = 0; }
      }
      render();
      raf = requestAnimationFrame(tick);
    }

    size_();
    if (reduce) {
      // seed a full, static screen of history
      for (let i = 0; i < rows; i++) { lines.push(POOL[i % POOL.length]); }
      ci = tgt.s.length; render();
    } else {
      raf = requestAnimationFrame(tick);
    }

    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(size_, 150); };
    window.addEventListener("resize", onResize);
    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(tick); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVis); clearTimeout(rt); };
  }, []);

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: BG, overflow: "hidden" }}>
      <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      {/* readability scrim: darker through the centre column where the content sits */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 85% at 50% 32%, rgba(20,22,30,0.86), rgba(20,22,30,0.62) 55%, rgba(20,22,30,0.74))" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,22,30,0.5), rgba(20,22,30,0) 18%, rgba(20,22,30,0) 82%, rgba(20,22,30,0.7))" }} />
    </div>
  );
}
