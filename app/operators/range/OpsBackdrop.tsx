"use client";

/* Live Exploit Terminal backdrop for the Cyber Ops portfolio (UAT pick #01).
 * Two dimmed terminal columns type real exploit chatter in the left and right
 * gutters, framing the content column in the middle; on narrow screens with no
 * room for gutters it falls back to one full-bleed stream. Fixed +
 * pointer-events:none so it never interferes with the page; pauses when the tab
 * is hidden; renders a single still frame under prefers-reduced-motion.
 * Canvas-drawn, aria-hidden. */

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

type Stream = { lines: Line[]; tgt: Line; ci: number; pi: number; acc: number };

function makeStream(start: number): Stream {
  return { lines: [], tgt: POOL[start % POOL.length], ci: 0, pi: start % POOL.length, acc: 0 };
}

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
    // layout: either two gutter columns or one full-bleed column
    let twoCol = false, gutterW = 0;
    const PAD = 18;
    // left stream starts at the top of the chain, right stream half a loop in
    const left = makeStream(0);
    const right = makeStream(Math.floor(POOL.length / 2));
    let blink = 0, last = 0, raf = 0;

    function size_() {
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = Math.round(w * DPR); canvas!.height = Math.round(h * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      lh = Math.max(18, Math.round(h / 34)); size = Math.round(lh * 0.72); rows = Math.ceil(h / lh) + 2;
      // reserve a central safe column for the page content; gutters flank it
      const safe = Math.min(w * 0.64, 840);
      gutterW = Math.max(0, (w - safe) / 2);
      twoCol = gutterW >= 190;
      ctx!.font = `${size}px 'IBM Plex Mono', ui-monospace, Menlo, monospace`;
      ctx!.textBaseline = "alphabetic";
    }

    function drawStream(st: Stream, x0: number, colW: number, align: "left" | "right") {
      ctx!.save();
      ctx!.beginPath(); ctx!.rect(x0, 0, colW, h); ctx!.clip();
      ctx!.font = `${size}px 'IBM Plex Mono', ui-monospace, Menlo, monospace`;
      ctx!.textAlign = align;
      const anchor = align === "left" ? x0 + PAD : x0 + colW - PAD;
      let y = h - lh * 0.6;
      // current (typing) line at the bottom, brightest
      const typed = st.tgt.s.slice(0, st.ci);
      ctx!.globalAlpha = 0.5; ctx!.fillStyle = st.tgt.bold ? COL.ok : st.tgt.c;
      ctx!.fillText(typed, anchor, y);
      if ((blink % 1000) < 540) {
        const wch = ctx!.measureText(typed).width;
        const cx = align === "left" ? anchor + wch + 2 : anchor - wch - size * 0.5 - 2;
        ctx!.fillStyle = COL.cursor; ctx!.globalAlpha = 0.55;
        ctx!.fillRect(cx, y - size * 0.78, size * 0.5, size * 0.92);
      }
      for (let i = st.lines.length - 1; i >= 0; i--) {
        y -= lh; if (y < -lh) break;
        const ln = st.lines[i];
        const depth = (st.lines.length - i) / rows;
        ctx!.globalAlpha = Math.max(0.08, 0.46 - depth * 0.4);
        ctx!.fillStyle = ln.bold ? COL.ok : ln.c;
        ctx!.fillText(ln.s, anchor, y);
      }
      ctx!.restore();
    }

    function render() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalAlpha = 1;
      if (twoCol) {
        drawStream(left, 0, gutterW, "left");
        drawStream(right, w - gutterW, gutterW, "right");
      } else {
        drawStream(left, 0, w, "left");
      }
      ctx!.globalAlpha = 1;
    }

    function advance(st: Stream, step: number) {
      st.acc += step;
      while (st.acc >= 1) {
        st.acc -= 1;
        if (st.ci < st.tgt.s.length) st.ci++;
        else { st.lines.push(st.tgt); if (st.lines.length > rows + 2) st.lines.shift(); st.pi = (st.pi + 1) % POOL.length; st.tgt = POOL[st.pi]; st.ci = 0; }
      }
    }

    function tick(now: number) {
      const dt = last ? Math.min(60, now - last) : 16; last = now;
      blink += dt;
      advance(left, dt * 0.06);
      if (twoCol) advance(right, dt * 0.054); // slightly different cadence so the two columns stay out of lockstep
      render();
      raf = requestAnimationFrame(tick);
    }

    // Fill a column with a full screen of history so it reads "lived-in" from
    // the first frame instead of scrolling up from an empty top.
    function prefill(st: Stream) {
      for (let i = 0; i < rows; i++) { st.lines.push(POOL[st.pi]); st.pi = (st.pi + 1) % POOL.length; }
      st.tgt = POOL[st.pi]; st.ci = 0;
    }

    size_();
    prefill(left); prefill(right);
    if (reduce) {
      left.ci = left.tgt.s.length; right.ci = right.tgt.s.length; render();
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
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 85% at 50% 32%, rgba(20,22,30,0.84), rgba(20,22,30,0.58) 55%, rgba(20,22,30,0.72))" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,22,30,0.5), rgba(20,22,30,0) 18%, rgba(20,22,30,0) 82%, rgba(20,22,30,0.7))" }} />
    </div>
  );
}
