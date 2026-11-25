"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AXP } from "./content";
import { crackEstimate } from "./crack";
import { reduced } from "@/app/components/home-holo/fx";

/* The real password lab (a slice of Module 3) inside the holographic glass
 * frame: lit rim, corner marks, the "Module 3 · Password Lab" title bar and
 * the 6 s scan. Same maths and strings as the page it replaces (crack.ts).
 * The console stays dark inside the light frame so the verdict colours keep
 * their meaning.
 *
 * Load choreography: 2.6 s after mount the lab demonstrates itself once,
 * typing a wordlist entry, holding, then erasing back to the empty verdict.
 * Any focus, pointer or keystroke from the visitor takes over at once; the
 * demo never runs under reduced motion. */

const PL = AXP.passwordLab;

export default function PasswordLab() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(true);
  const r = useMemo(() => crackEstimate(pw), [pw]);
  const inputRef = useRef<HTMLInputElement>(null);
  const demoRef = useRef<{ on: boolean; timers: number[] }>({ on: false, timers: [] });

  const stopDemo = (clear: boolean) => {
    const d = demoRef.current;
    if (!d.on) return;
    d.on = false;
    d.timers.forEach((t) => window.clearTimeout(t));
    d.timers = [];
    if (clear) setPw("");
  };

  useEffect(() => {
    if (reduced()) return;
    const d = demoRef.current;
    d.on = true;
    const word = PL.demoWord;
    let i = 0;
    const t = (fn: () => void, ms: number) => { d.timers.push(window.setTimeout(fn, ms)); };
    const erase = () => {
      if (!d.on) return;
      i -= 1;
      setPw(word.slice(0, Math.max(0, i)));
      if (i > 0) t(erase, 38); else d.on = false;
    };
    const type = () => {
      if (!d.on) return;
      i += 1;
      setPw(word.slice(0, i));
      if (i < word.length) t(type, 95); else t(erase, 2200);
    };
    t(type, 2600);
    return () => { d.on = false; d.timers.forEach((x) => window.clearTimeout(x)); d.timers = []; };
  }, []);

  return (
    <div className="stage">
      <div className="holo">
        <span className="scan" aria-hidden="true" />
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        <div className="hbar"><span className="dots" aria-hidden="true"><i /><i /><i /></span><span>{PL.titleBar}</span></div>
        <div className="lab">
          <label className="flab" htmlFor="pv1-pw">{PL.fieldLabel}</label>
          <div className="row">
            <input
              id="pv1-pw"
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
          <div className="meter" aria-hidden="true"><i style={{ width: `${r.pct}%`, background: r.colour }} /></div>
          <div className="verdict" aria-live="polite" style={{ color: r.colour }}>{r.verdict}</div>
          <div className="detail">{r.detail}</div>
          <div className="lfoot"><b aria-hidden="true">{PL.footer.chevron}</b><span>{PL.footer.text}</span></div>
        </div>
      </div>
    </div>
  );
}
