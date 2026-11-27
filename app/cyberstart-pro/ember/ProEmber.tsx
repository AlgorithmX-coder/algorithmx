"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from "react";
import Link from "next/link";
import { Chakra_Petch, Inter, JetBrains_Mono } from "next/font/google";
import type { Product } from "@prisma/client";
import CourseLockup from "@/app/components/CourseLockup";
import ByAlgorithmX from "@/app/components/ByAlgorithmX";
import { reduced, reveal } from "@/app/components/home-holo/fx";
import { CONSUMER_CHECKOUT_OPEN } from "@/app/lib/launchSwitch";
import { AXP, moduleReadout, pad2, stackDepth, type TermLine } from "./content";
import { EMPTY_COLOUR, crackEstimate, poolSize } from "./crack";
import "./pro-ember.css";

/* Ember Console, the /pro page (landing lab round 9, version A, the owner's
 * pick on 2026-11-27: "I like version A"). The grown-up sibling of the Ops
 * Glass Console: light grid paper, white glass cards, warm-black terminal
 * windows, mono "$" labels, the moving strip of the 21 module names, one
 * dark closing band. Keyed to the Pro lockup's ember (#a63a08) with an amber
 * second note.
 *
 * What stayed real from the Hologram page it replaces: the password lab's
 * maths and strings (crack.ts), price and status from the Product row, the
 * PURCHASE_OPEN gate and every CTA href, the waitlist's POST to
 * /api/waitlist with its strings, the nav and footer links. The nav lockup
 * is the live one, unchanged (owner ruling: logos never change).
 *
 * Everything is scoped under .pr9a. Reveal and pause state are data
 * attributes (data-in, data-still); ?all=1 or reduced motion shows every
 * section at once and the terminals finished. */

const display = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-chakra", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--pr9a-mono", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--pr9a-sans", display: "swap" });

const ENROL_ANCHOR = `#${AXP.enrol.anchorId}`;

/* Whether the paid checkout is open to the public: the one launch switch,
 * CONSUMER_CHECKOUT_OPEN in app/lib/launchSwitch.ts. While it is false the
 * course shows as live but every buy action routes to the enrol band's
 * waitlist; once true, to /purchase/cyberstart-pro. */
const PURCHASE_OPEN = CONSUMER_CHECKOUT_OPEN;

const Arrow = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
);
const CHECK = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>;
const ROCKET = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><path d="M14 4c3-1 6-1 6-1s0 3-1 6-5 6-9 8l-4-4c2-4 5-7 8-9z" /><circle cx="15" cy="9" r="1.5" />
  </svg>
);
const PAUSE = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" /><rect x="7" y="1.5" width="3" height="9" /></svg>;
const PLAY = <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>;

const d = (i: number) => ({ "--i": i }) as CSSProperties;
const col = (c: string) => ({ "--c": c }) as CSSProperties;

function Eyebrow({ children, reveal: rv = true }: { children: string; reveal?: boolean }) {
  return <span className="pr9a-cmd" data-reveal={rv ? "" : undefined}>{children}</span>;
}

/* Arrow-key roving for a row of tabs: Left/Up and Right/Down move and pick,
 * Home and End jump to the ends. */
function rove(e: KeyboardEvent<HTMLButtonElement>, i: number, n: number, pick: (j: number) => void, refs: RefObject<(HTMLButtonElement | null)[]>) {
  const k = e.key;
  let j: number | null = null;
  if (k === "ArrowDown" || k === "ArrowRight") j = (i + 1) % n;
  else if (k === "ArrowUp" || k === "ArrowLeft") j = (i - 1 + n) % n;
  else if (k === "Home") j = 0;
  else if (k === "End") j = n - 1;
  if (j === null) return;
  e.preventDefault();
  refs.current?.[j]?.focus();
  pick(j);
}

/* Types `lines` into a <pre>: typed lines letter by letter, the rest whole,
 * a blinking caret at the end. When `instant`, writes them all at once.
 * `onDone` runs 2.8 s after the last line. Returns a stop function. */
function typeInto(el: HTMLElement, lines: readonly TermLine[], instant: boolean, onDone?: () => void): () => void {
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
  el.textContent = "";
  const line = (cls: string, text: string) => { const s = document.createElement("span"); s.className = `t-${cls}`; s.textContent = text; return s; };
  if (instant) {
    lines.forEach(([cls, text], i) => { el.appendChild(line(cls, text)); if (i < lines.length - 1) el.appendChild(document.createTextNode("\n")); });
    el.removeAttribute("aria-busy");
    return () => {};
  }
  el.setAttribute("aria-busy", "true");
  const caret = document.createElement("span");
  caret.className = "pr9a-caret";
  let li = 0, ci = 0;
  let cur: HTMLSpanElement | null = null;
  const tick = () => {
    if (li >= lines.length) {
      el.appendChild(caret);
      el.removeAttribute("aria-busy");
      if (onDone) later(onDone, 2800);
      return;
    }
    const [cls, text, typed] = lines[li];
    if (!cur) { cur = line(cls, ""); el.appendChild(cur); el.appendChild(caret); }
    if (typed) {
      cur.textContent = text.slice(0, ++ci);
      if (ci < text.length) { later(tick, cls === "p" ? 28 : 22); return; }
    } else cur.textContent = text;
    caret.remove();
    el.appendChild(document.createTextNode("\n"));
    el.appendChild(caret);
    li++; ci = 0; cur = null;
    later(tick, typed ? 380 : 300);
  };
  tick();
  return () => timers.forEach((t) => window.clearTimeout(t));
}

/* A tabbed terminal: a picked index that auto-advances through `count`
 * until the visitor picks one, typing that item's lines. */
function useAutoTerminal(count: number, linesOf: (i: number) => readonly TermLine[], still: boolean, calm: boolean) {
  const [view, setView] = useState({ i: 0, auto: true });
  const pre = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const el = pre.current;
    if (!el) return;
    const instant = still || calm;
    const next = view.auto && !instant ? () => setView((v) => ({ ...v, i: (v.i + 1) % count })) : undefined;
    return typeInto(el, linesOf(view.i), instant, next);
  }, [view, still, calm, count, linesOf]);
  const pick = (i: number) => setView({ i, auto: false });
  return { i: view.i, pick, pre };
}

/* The live Pro lockup: CourseLockup pro/sand with the stacked
 * "by AlgorithmX [cube]" byline under the name. */
function Lockup() {
  const N = AXP.nav;
  return (
    <Link className="pr9a-lock" href={N.logo.href} aria-label={N.logo.ariaLabel}>
      <CourseLockup id="pro" tone="sand" size={0.835} />
      <span className="lk-by" aria-hidden="true"><ByAlgorithmX wordClassName="dim" /></span>
    </Link>
  );
}

/* The real password lab (a slice of Module 3) in a terminal window. 2.6 s
 * after mount it types a wordlist entry, holds, then erases. Any focus,
 * pointer or keystroke from the visitor takes over at once. Under reduced
 * motion (or ?all) it shows the entry already typed, and the first focus
 * clears it. */
function PasswordLab({ calm }: { calm: boolean }) {
  const PL = AXP.passwordLab;
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(true);
  const r = useMemo(() => crackEstimate(pw), [pw]);
  const inputRef = useRef<HTMLInputElement>(null);
  const demo = useRef<{ on: boolean; timers: number[] }>({ on: false, timers: [] });

  const stopDemo = (clear: boolean) => {
    const dm = demo.current;
    if (!dm.on) return;
    dm.on = false;
    dm.timers.forEach((t) => window.clearTimeout(t));
    dm.timers = [];
    if (clear) setPw("");
  };

  useEffect(() => {
    const dm = demo.current;
    const word = PL.demoWord;
    const t = (fn: () => void, ms: number) => { dm.timers.push(window.setTimeout(fn, ms)); };
    dm.on = true;
    if (calm) {
      t(() => { if (dm.on) setPw(word); }, 0);
    } else {
      let i = 0;
      const erase = () => {
        if (!dm.on) return;
        i -= 1;
        setPw(word.slice(0, Math.max(0, i)));
        if (i > 0) t(erase, 38); else dm.on = false;
      };
      const type = () => {
        if (!dm.on) return;
        i += 1;
        setPw(word.slice(0, i));
        if (i < word.length) t(type, 95); else t(erase, 2200);
      };
      t(type, 2600);
    }
    return () => { dm.on = false; dm.timers.forEach((x) => window.clearTimeout(x)); dm.timers = []; };
  }, [calm, PL.demoWord]);

  return (
    <div className="pr9a-win pr9a-lab" data-reveal style={d(2)}>
      <div className="bar"><i /><i /><i /><span>{PL.titleBar}</span><em>{PL.badge}</em></div>
      <div className="body">
        <label htmlFor="pr9a-pw">{PL.fieldLabel}</label>
        <div className="row">
          <input
            id="pr9a-pw"
            ref={inputRef}
            type={show ? "text" : "password"}
            value={pw}
            maxLength={PL.inputMaxLength}
            onChange={(e) => { stopDemo(false); setPw(e.target.value.slice(0, PL.inputMaxLength)); }}
            onFocus={() => stopDemo(true)}
            onPointerDown={() => stopDemo(true)}
            placeholder={PL.placeholder}
            autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
            aria-label={PL.inputAriaLabel}
          />
          <button type="button" className="tog" onClick={() => { setShow((s) => !s); inputRef.current?.focus(); }} aria-label={show ? PL.toggle.ariaShown : PL.toggle.ariaHidden}>
            {show ? PL.toggle.shown : PL.toggle.hidden}
          </button>
        </div>
        <div className="pr9a-meter" aria-hidden="true"><i style={{ width: `${r.pct}%`, background: r.colour }} /></div>
        <div className="pr9a-verdict" aria-live="polite" style={{ color: r.colour === EMPTY_COLOUR ? "#bba998" : r.colour }}>{r.verdict}</div>
        <div className="pr9a-detail">{r.detail}</div>
        <dl className="pr9a-stats" aria-hidden="true">
          <div><dt>{PL.stats.length}</dt><dd>{pw.length}</dd></div>
          <div><dt>{PL.stats.charset}</dt><dd>{pw ? poolSize(pw) : 0}</dd></div>
          <div><dt>{PL.stats.rig}</dt><dd>{PL.stats.rigValue}</dd></div>
        </dl>
      </div>
      <div className="foot"><b aria-hidden="true">{PL.footer.chevron}</b><span>{PL.footer.text}</span></div>
    </div>
  );
}

const labLines = (i: number) => AXP.labs.items[i].lines;
const stepLines = (i: number) => AXP.how.steps[i].lines;

/* "Next, you'll do this": three lab tabs driving a typed terminal. */
function Labs({ still, calm }: { still: boolean; calm: boolean }) {
  const L = AXP.labs;
  const { i, pick, pre } = useAutoTerminal(L.items.length, labLines, still, calm);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const x = L.items[i];
  return (
    <div className="pr9a-wrap pr9a-labs">
      <div>
        <Eyebrow>{L.eyebrow}</Eyebrow>
        <h2 data-reveal style={d(1)}>{L.h2Plain} <mark>{L.h2Accent}</mark></h2>
        <p className="pr9a-sub" data-reveal style={d(2)}>{L.sub}</p>
        <div className="pr9a-tabs" role="tablist" aria-label={L.tabsAriaLabel} data-reveal style={d(3)}>
          {L.items.map((it, j) => (
            <button
              key={it.mod}
              ref={(el) => { refs.current[j] = el; }}
              className="pr9a-tab"
              type="button"
              role="tab"
              id={`pr9a-labtab${j}`}
              aria-controls="pr9a-labpanel"
              aria-selected={i === j}
              tabIndex={i === j ? 0 : -1}
              onClick={() => pick(j)}
              onKeyDown={(e) => rove(e, j, L.items.length, pick, refs)}
            >
              <span className="n">Module {it.mod}</span><b>{it.title}</b><Arrow />
            </button>
          ))}
        </div>
      </div>
      <div className="pr9a-win pr9a-tterm" role="tabpanel" id="pr9a-labpanel" aria-labelledby={`pr9a-labtab${i}`} data-reveal style={d(2)}>
        <div className="bar"><i /><i /><i /><span>{L.barPrefix} {x.mod}</span><em>{L.badge}</em></div>
        <pre ref={pre} aria-live="polite" />
        <div className="desc"><b>{x.title}</b>{x.desc}</div>
      </div>
    </div>
  );
}

/* How it works: four step tabs over a text panel and a typed terminal. */
function Stepper({ still, calm }: { still: boolean; calm: boolean }) {
  const H = AXP.how;
  const { i, pick, pre } = useAutoTerminal(H.steps.length, stepLines, still, calm);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = H.steps[i];
  return (
    <>
      <ol className="pr9a-stepper" role="tablist" aria-label={H.stepsAriaLabel} data-reveal style={d(3)}>
        {H.steps.map((st, j) => (
          <li key={st.title} role="presentation">
            <button
              ref={(el) => { refs.current[j] = el; }}
              className="pr9a-step"
              type="button"
              role="tab"
              id={`pr9a-step${j}`}
              aria-controls="pr9a-steppanel"
              aria-selected={i === j}
              tabIndex={i === j ? 0 : -1}
              onClick={() => pick(j)}
              onKeyDown={(e) => rove(e, j, H.steps.length, pick, refs)}
            >
              <span className="n">{pad2(j + 1)}</span><b>{st.title}</b>
            </button>
          </li>
        ))}
      </ol>
      <div className="pr9a-glass pr9a-demo" role="tabpanel" id="pr9a-steppanel" aria-labelledby={`pr9a-step${i}`} data-reveal style={d(4)}>
        <div className="txt"><span className="k">STEP {pad2(i + 1)} OF {pad2(H.steps.length)}</span><h3>{s.title}</h3><p>{s.desc}</p></div>
        <div className="pr9a-win"><div className="bar"><i /><i /><i /><span>{H.bar}</span><em>{H.badge}</em></div><pre ref={pre} aria-live="polite" /></div>
      </div>
    </>
  );
}

/* The four acts and the 21 module tiles; hover, focus or click picks one. */
function ModulePicker() {
  const J = AXP.journey;
  const [mod, setMod] = useState<number>(J.defaultModule);
  const m = moduleReadout(mod);
  const actOf = J.modules[mod].act;
  return (
    <>
      <div className="pr9a-acts" data-reveal style={d(3)}>
        {J.acts.map((a, i) => (
          <div className="pr9a-act" key={a.badge} style={col(a.colour)} data-on={actOf === i ? "" : undefined}>
            <span className="bd">{a.badge} · {a.span}</span><b>{a.title}</b>
          </div>
        ))}
      </div>
      <div className="pr9a-grid" role="group" aria-label={J.tilesAriaLabel} data-reveal style={d(3)}>
        {J.acts.map((a, ai) => {
          const mods = J.modules.map((x, i) => ({ x, i })).filter(({ x }) => x.act === ai);
          return (
            <div className={`grp g${mods.length}`} key={a.badge} style={col(a.colour)} data-label={`${a.badge} · ${a.title}`}>
              {mods.map(({ x, i }) => (
                <button
                  key={x.title}
                  className="pr9a-mod"
                  type="button"
                  aria-pressed={mod === i}
                  aria-label={`Module ${i + 1}: ${x.title}`}
                  onMouseEnter={() => setMod(i)}
                  onFocus={() => setMod(i)}
                  onClick={() => setMod(i)}
                >
                  {pad2(i + 1)}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <div className="pr9a-glass pr9a-read" aria-live="polite" data-reveal style={d(4)}>
        <div className="m"><span className="k">MODULE {m.n} OF {pad2(J.modules.length)}</span><b>{m.title}</b><p>{m.blurb}</p></div>
        <div className="a"><span className="k" style={{ color: m.act.colour }}>{m.actLabel}</span><b>{m.act.title}</b><p>{m.act.desc}</p></div>
      </div>
    </>
  );
}

/* You leave with proof: an index of the five portfolio pieces over a pile
 * of filed reports; the picked one comes to the front. */
function Proof() {
  const P = AXP.proof;
  const [front, setFront] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = P.items.length;
  return (
    <div className="pr9a-wrap pr9a-proof">
      <div>
        <Eyebrow>{P.eyebrow}</Eyebrow>
        <h2 data-reveal style={d(1)}>{P.h2Plain} <mark>{P.h2Accent}</mark></h2>
        <p className="pr9a-sub" data-reveal style={d(2)}>{P.sub}</p>
        <div className="pr9a-index" role="tablist" aria-label={P.indexAriaLabel} data-reveal style={d(3)}>
          {P.items.map((it, j) => (
            <button
              key={it.title}
              ref={(el) => { refs.current[j] = el; }}
              className="pr9a-ix"
              type="button"
              role="tab"
              id={`pr9a-ix${j}`}
              aria-controls="pr9a-stack"
              aria-selected={front === j}
              tabIndex={front === j ? 0 : -1}
              onClick={() => setFront(j)}
              onKeyDown={(e) => rove(e, j, n, setFront, refs)}
            >
              <span className="n">{pad2(j + 1)}</span>{it.title}
            </button>
          ))}
        </div>
      </div>
      <div className="pr9a-stack" id="pr9a-stack" role="tabpanel" aria-labelledby={`pr9a-ix${front}`} data-reveal style={d(2)}>
        {P.items.map((it, j) => {
          const k = stackDepth(j, front, n);
          const style: CSSProperties = {
            zIndex: 10 - k,
            transform: k === 0 ? "none" : `translate(${k * 13}px,${-k * 13}px) scale(${1 - k * 0.02})`,
            opacity: k > 3 ? 0 : 1,
          };
          return (
            <article className="pr9a-doc" key={it.title} style={style} data-front={k === 0 ? "" : undefined} aria-hidden={k !== 0}>
              <div className="hd"><span>{P.docLabel} {pad2(j + 1)} / {pad2(n)}</span><em>{P.filed}</em></div>
              <h3>{it.title}</h3>
              <p>{it.desc}</p>
              {it.lines.map((w, li) => <span className="ln" key={li} style={{ width: `${w}%` }} />)}
              <span className="sig">{P.signature}</span>
              <span className="pr9a-stamp">{P.stamp}</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* The enrol band's waitlist: the same behaviour as the live page (the
 * email test, the POST to /api/waitlist with { email, courseSlug, source },
 * the loading, error and success strings). */
function Waitlist({ courseSlug }: { courseSlug: string }) {
  const WL = AXP.waitlist;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      setErrorMsg(WL.errorInvalid);
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch(WL.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, courseSlug, source: WL.source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Server error");
      }
      setState("success");
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : WL.errorServerFallback);
    }
  };

  if (state === "success") {
    return <div className="pr9a-wlok" role="status">{CHECK}<span>{WL.success}</span></div>;
  }
  return (
    <>
      <form className="pr9a-wl" onSubmit={onSubmit} noValidate>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
          placeholder={WL.placeholder}
          aria-label={WL.inputAriaLabel}
          aria-describedby="pr9a-wlmsg"
          aria-invalid={state === "error" || undefined}
        />
        <button className="pr9a-btn" type="submit" disabled={state === "loading"}>
          {state === "loading" ? WL.buttonLoading : <>{WL.button}{ROCKET}</>}
        </button>
      </form>
      <p className="pr9a-wlmsg" id="pr9a-wlmsg" role="alert">{state === "error" ? errorMsg : ""}</p>
    </>
  );
}

export default function ProEmber({ product }: { product: Product }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  const [calm, setCalm] = useState(false);

  /* reduced motion or ?all=1: everything shown, terminals finished. Read
     after mount so the server and the first client render agree. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (reduced() || new URLSearchParams(window.location.search).has("all")) setCalm(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (new URLSearchParams(window.location.search).has("all")) {
      root.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-in", ""));
      return;
    }
    return reveal(root);
  }, []);

  const isActive = product.status === "ACTIVE";
  const priceLine = `£${Math.round(product.priceGBP / 100)}`;
  const buyHref = `/purchase/${product.slug}`;
  const canBuy = isActive && PURCHASE_OPEN;
  const ctaHref = canBuy ? buyHref : ENROL_ANCHOR;
  const ctaLabel = canBuy ? `${AXP.hero.cta.forPrice} ${priceLine}` : isActive ? AXP.hero.cta.active : AXP.hero.cta.inactive;
  const navLabel = isActive ? AXP.nav.cta.active : AXP.nav.cta.inactive;

  const N = AXP.nav, H = AXP.hero, C = AXP.career, HW = AXP.how, FY = AXP.forYou, J = AXP.journey, B = AXP.breaches, HO = AXP.honest, F = AXP.faq, E = AXP.enrol, FO = AXP.footer;
  const names = J.modules.map((m, i) => ({ n: pad2(i + 1), t: m.title.toUpperCase() }));

  return (
    <div className={`pr9a ${display.variable} ${mono.variable} ${sans.variable}`} ref={rootRef} data-still={still ? "" : undefined}>
      <div className="pr9a-wrap pr9a-navw">
        <nav className="pr9a-nav" aria-label={N.ariaLabel}>
          <Lockup />
          {N.links.map((l) => l.href.startsWith("/")
            ? <Link key={l.label} className="l" href={l.href}>{l.label}</Link>
            : <a key={l.label} className="l" href={l.href}>{l.label}</a>)}
          <Link className="l" href={N.signIn.href}>{N.signIn.label}</Link>
          <a className="pr9a-btn" href={ctaHref}>{navLabel}</a>
        </nav>
      </div>

      <main>
        {/* HERO + the password lab */}
        <section className="pr9a-hero" id="top">
          <div className="pr9a-wrap g">
            <div>
              <span className="pr9a-eyebrow" data-reveal><i aria-hidden="true" />{H.eyebrow}</span>
              <h1 data-reveal style={d(1)}>{H.h1Plain}<br /> <mark>{H.h1Accent}</mark><span className="pr9a-cur" aria-hidden="true" /></h1>
              <p className="lead" data-reveal style={d(2)}>{H.lead}</p>
              <div className="pr9a-cta" data-reveal style={d(3)}>
                <a className="pr9a-btn" href={ctaHref}>{ctaLabel}<Arrow /></a>
                <span className="pr9a-price"><b>{priceLine}<small>{H.priceStack.once}</small></b><span>{H.priceStack.line2}</span></span>
              </div>
              <div className="pr9a-srow" data-reveal style={d(4)}>
                <a href={H.secondaryRow.link.href}>{H.secondaryRow.link.label}<Arrow size={14} /></a>
                <span className="badge">{H.secondaryRow.badge}</span>
              </div>
            </div>
            <PasswordLab calm={calm} />
          </div>
        </section>

        {/* THE STRIP: the 21 module names, twice for a seamless loop */}
        <div className="pr9a-strip" aria-hidden="true">
          <div className="tr">{[...names, ...names].map((x, i) => <span key={i}><b>{x.n}</b>{x.t}</span>)}</div>
        </div>

        {/* NEXT, YOU'LL DO THIS */}
        <section className="pr9a-sec" id="real">
          <Labs still={still} calm={calm} />
        </section>

        {/* A REAL CAREER */}
        <section className="pr9a-sec pr9a-flush" id="career">
          <div className="pr9a-wrap">
            <div className="pr9a-glass pr9a-career" data-reveal>
              <div>
                <Eyebrow reveal={false}>{C.eyebrow}</Eyebrow>
                <h2>{C.h2Plain} <mark>{C.h2Accent}</mark></h2>
                <p className="pr9a-sub">{C.sub}</p>
              </div>
              <ul className="pr9a-points">
                {C.points.map((p) => (
                  <li key={p.title}>
                    <span className="ix"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p.icon} /></svg></span>
                    <div><b>{p.title}</b><span>{p.desc}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="pr9a-sec pr9a-flush" id="how">
          <div className="pr9a-wrap">
            <Eyebrow>{HW.eyebrow}</Eyebrow>
            <h2 data-reveal style={d(1)}>{HW.h2Plain} <mark>{HW.h2Accent}</mark></h2>
            <p className="pr9a-sub" data-reveal style={d(2)}>{HW.sub}</p>
            <Stepper still={still} calm={calm} />
          </div>
        </section>

        {/* MADE FOR YOU */}
        <section className="pr9a-sec pr9a-flush" id="foryou">
          <div className="pr9a-wrap">
            <Eyebrow>{FY.eyebrow}</Eyebrow>
            <h2 data-reveal style={d(1)}>{FY.h2Plain} <mark>{FY.h2Accent}</mark></h2>
            <div className="pr9a-for">
              {FY.items.map((it, i) => (
                <div key={it.title} data-reveal style={d(i)}>
                  <article className="pr9a-glass"><span className="k">{it.key}</span><h3>{it.title}</h3><p>{it.desc}</p></article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOUR ACTS, 21 MODULES */}
        <section className="pr9a-sec pr9a-flush" id="journey">
          <div className="pr9a-wrap">
            <Eyebrow>{J.eyebrow}</Eyebrow>
            <h2 data-reveal style={d(1)}>{J.h2Before} <mark>{J.h2Accent}</mark>{J.h2After}</h2>
            <p className="pr9a-sub" data-reveal style={d(2)}>{J.sub}</p>
            <ModulePicker />
          </div>
        </section>

        {/* PROOF */}
        <section className="pr9a-sec pr9a-flush" id="proof">
          <Proof />
        </section>

        {/* REAL BREACHES */}
        <section className="pr9a-sec pr9a-flush" id="breaches">
          <div className="pr9a-wrap">
            <Eyebrow>{B.eyebrow}</Eyebrow>
            <h2 data-reveal style={d(1)}>{B.h2Plain} <mark>{B.h2Accent}</mark></h2>
            <p className="pr9a-sub" data-reveal style={d(2)}>{B.sub}</p>
            <div className="pr9a-tix">
              {B.items.map((b, i) => (
                <div key={b.org} data-reveal style={d(i % 3)}>
                  <article className="pr9a-tk">
                    <div className="hd"><span>INC-{b.year}-{pad2(i + 1)}</span><em>{b.tag}</em></div>
                    <h3>{b.org}</h3>
                    <p>{b.lesson}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE HONEST VERSION + FAQ */}
        <section className="pr9a-sec pr9a-flush" id="honest">
          <div className="pr9a-wrap pr9a-hf">
            <div>
              <Eyebrow>{HO.eyebrow}</Eyebrow>
              <h2 data-reveal style={d(1)}>{HO.h2}</h2>
              <div className="pr9a-honest">
                {HO.items.map((it, i) => (
                  <div className="pr9a-glass" key={it.title} data-reveal style={d(i + 1)}>
                    {CHECK}<div><b>{it.title}</b><p>{it.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div id="faq" className="pr9a-faqcol">
              <Eyebrow>{F.eyebrow}</Eyebrow>
              <h2 data-reveal style={d(1)}>{F.h2}</h2>
              <div className="pr9a-faq" data-reveal style={d(2)}>
                {F.items.map((it) => (
                  <details key={it.q}>
                    <summary>{it.q}</summary>
                    <p>{it.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ENROL: the closing band with the pricing */}
        <section className="pr9a-sec pr9a-flush" id={E.anchorId}>
          <div className="pr9a-wrap">
            <div className="pr9a-end" data-reveal>
              <div className="hd">
                <span className="pr9a-cmd">{E.eyebrow}</span>
                <h2>{E.h2Before} <mark>{E.h2Accent}</mark>{E.h2After}<span className="pr9a-cur" aria-hidden="true" /></h2>
                <p>{E.sub}</p>
              </div>
              <div className="pr9a-buy">
                <div className="l">
                  <h3>{E.pricing.h3}</h3>
                  <p>{E.pricing.sub}</p>
                  <div className="pr9a-pricerow">
                    <div className="pr9a-big"><b>{priceLine}</b><span>{E.pricing.once}</span></div>
                    <ul className="pr9a-facts">{E.pricing.facts.map((f) => <li key={f.k}>{f.k}<b>{f.v}</b></li>)}</ul>
                  </div>
                </div>
                <div className="r">
                  {isActive && <span className="pr9a-live">{E.action.live}</span>}
                  {canBuy ? (
                    <div className="buy"><a className="pr9a-btn" href={buyHref}>{AXP.hero.cta.forPrice} {priceLine}<Arrow /></a></div>
                  ) : (
                    <>
                      <h3>{isActive ? E.action.headlineActive : E.action.headlineInactive}</h3>
                      <p className="s">{E.action.sub}</p>
                      <Waitlist courseSlug={product.slug} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="pr9a-foot">
        <div className="pr9a-wrap">
          <nav aria-label={FO.linksAriaLabel}>
            <ul className="fl">
              {FO.links.map((l) => <li key={l.href}><a href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a></li>)}
            </ul>
          </nav>
          <p>{FO.copyright}</p>
          <p>{FO.legal}</p>
        </div>
      </footer>

      <button className="pr9a-pause" type="button" onClick={() => setStill((s) => !s)} aria-pressed={still} aria-label={still ? AXP.motionButton.paused : AXP.motionButton.playing}>{still ? PLAY : PAUSE}</button>
    </div>
  );
}
