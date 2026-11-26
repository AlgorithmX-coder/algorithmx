"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * Order Desk: the shell of the four pre-purchase pages, /corporate/buy and
 * /organisations/buy and their thanks pages. Owner's v1 from landing lab
 * round 6 (family "buy", 2026-11-23): the last step before money, in the
 * Hologram house. Capsule nav with the real lockup and a three-step rail
 * (Your order, Pay on Stripe, Invite your staff / Make your groups), the
 * graphite ground with its grid, pools and drifting points, a footer, and
 * the Pause control (in the footer row, so it never covers a line of text). The pages put their own content (and all of their own
 * plumbing) inside; this file holds no behaviour that touches money.
 */

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import CorporateBrand from "@/app/corporate/CorporateBrand";
import { SchoolAtom } from "@/app/schools/SchoolBrand";
import { ledgerBackdrop, rise } from "./orderDeskFx";
import "./order-desk.css";

const inter = Inter({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--odk-inter", display: "swap" });
const jet = JetBrains_Mono({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--odk-jet", display: "swap" });

export type DeskFamily = "corp" | "org";

const NAV: Record<DeskFamily, { home: string; label: string; back: { label: string; href: string }; steps: [string, string, string] }> = {
  corp: { home: "/corporate", label: "Cyber Secured by AlgorithmX, corporate page", back: { label: "Corporate page", href: "/corporate" }, steps: ["Your order", "Pay on Stripe", "Invite your staff"] },
  org: { home: "/schools", label: "AlgorithmX for organisations", back: { label: "For schools and organisations", href: "/schools" }, steps: ["Your order", "Pay on Stripe", "Make your groups"] },
};

export function Svg({ d, size = 16, sw = 2 }: { d: string; size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block" }}>
      {d.split(" M").map((p, i) => <path key={i} d={i ? `M${p}` : p} />)}
    </svg>
  );
}
export const ArrowIcon = () => <Svg d="M5 12h14 M13 6l6 6-6 6" sw={2.2} />;
export const CheckIcon = ({ size = 12 }: { size?: number }) => <Svg d="M5 12l5 5L20 7" size={size} sw={3} />;
export const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block" }}>
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

/* Cyber Essentials, the NCSC crest on its dark plate, Microsoft for Startups:
   the corporate proof band's marks and wording. */
export function TrustPlates({ delay }: { delay: string }) {
  return (
    <div className="odk-trust" data-rise style={{ "--d": delay } as React.CSSProperties}>
      <span className="plate"><img src="/logos/cyber-essentials.png" alt="Cyber Essentials certified" /></span>
      <span className="plate dark"><img src="/logos/ncsc.svg" alt="Aligned with the National Cyber Security Centre" /></span>
      <span className="plate"><img src="/logos/microsoft-for-startups.webp" alt="Microsoft for Startups" /></span>
    </div>
  );
}

function Lockup({ family }: { family: DeskFamily }) {
  const N = NAV[family];
  return (
    <Link className="odk-lockup" href={N.home} aria-label={N.label}>
      {family === "corp" ? (
        <CorporateBrand />
      ) : (
        <>
          <SchoolAtom size={34} idPrefix="odkAtom" />
          <span className="lk-col">
            <span className="lk-name">ALGORITHM<span style={{ color: "#5f8dff" }}>X</span></span>
            <span className="lk-by">For organisations</span>
          </span>
        </>
      )}
    </Link>
  );
}

export default function OrderDesk({
  family,
  thanks = false,
  footLeft,
  footRight,
  children,
}: {
  family: DeskFamily;
  /** The thanks page: steps 01 and 02 ticked, 03 lit. */
  thanks?: boolean;
  footLeft: ReactNode;
  footRight: string;
  children: ReactNode;
}) {
  const N = NAV[family];
  const rootRef = useRef<HTMLDivElement>(null);
  const atmoRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const fx = useRef<ReturnType<typeof ledgerBackdrop> | null>(null);

  useEffect(() => {
    const root = rootRef.current, atmo = atmoRef.current;
    if (!root || !atmo) return;
    const stopRise = rise(root);
    const bd = ledgerBackdrop(atmo, root, () => pausedRef.current);
    fx.current = bd;
    /* an error line or the "make it 50" hint moves the text: keep the points off it */
    const main = root.querySelector("main");
    const ro = main ? new ResizeObserver(() => bd.measure()) : null;
    if (main && ro) ro.observe(main);
    return () => { stopRise(); ro?.disconnect(); bd.destroy(); fx.current = null; };
  }, []);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    fx.current?.kick();
  };

  const cur = thanks ? 2 : 0;
  return (
    <div ref={rootRef} className={`odk ${inter.variable} ${jet.variable}`} data-family={family} data-paused={paused ? "" : undefined}>
      {/* Without script the entrance never runs: show everything at once. */}
      <noscript><style>{".odk [data-rise]{opacity:1;transform:none}"}</style></noscript>
      <div className="odk-atmo" ref={atmoRef} aria-hidden="true"><span className="pool a" /><span className="pool b" /><span className="pool c" /></div>
      <header className="odk-nav odk-wrap">
        <div className="cap">
          <Lockup family={family} />
          <ol className="odk-rail" aria-label="Where you are">
            {N.steps.map((s, i) => (
              <li key={s} aria-current={i === cur ? "step" : undefined} data-done={i < cur ? "" : undefined}>
                <b>{i < cur ? <CheckIcon /> : `0${i + 1}`}</b>{s}
              </li>
            ))}
          </ol>
        </div>
        <Link className="odk-chip" href={N.back.href}><Svg d="M19 12H5 M11 18l-6-6 6-6" size={14} sw={2.2} />{N.back.label}</Link>
      </header>
      <main className={`odk-main odk-wrap${thanks ? " odk-thanks" : ""}`}>{children}</main>
      <footer className="odk-foot odk-wrap">
        <span>{footLeft}</span>
        <span className="odk-legal"><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a></span>
        <span>{footRight}</span>
        <button className="odk-pause" type="button" aria-pressed={paused} onClick={toggle}><i /><span>{paused ? "Play motion" : "Pause motion"}</span></button>
      </footer>
    </div>
  );
}
