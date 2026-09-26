"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import Nav from "@/app/components/landing-v2/Nav";
import Footer from "@/app/components/landing-v2/Footer";
import { FadeUp } from "@/app/components/landing-v2/utilities";
import { sectionMark, sectionMarkBare } from "@/app/components/sectionMark";

/**
 * The chrome for a /corporate sub-page: one column of plain sections, the
 * sand tone, the same one-bar nav as the landing with AI Cleared as the way
 * back. Built for the regulation pages, which are read rather than scanned.
 */

export interface SubSection {
  heading: string;
  body: ReactNode;
}

export default function CorporateSubpage({
  eyebrow,
  title,
  lede,
  sections,
  maps,
  asOf,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: string;
  sections: SubSection[];
  /** How AI Cleared answers the duty, as short points. */
  maps: string[];
  /** The date the reading was checked. */
  asOf: string;
}) {
  return (
    <div className="corp-page corp-sub" style={{ display: "contents" }}>
      <Nav
        tone="sand"
        showTelemetry={false}
        showSiteLinks={false}
        cta={{ label: "Get in touch", href: "/corporate#enquiry" }}
        aside={{ label: "AI Cleared", href: "/corporate" }}
      />
      <main className="corp-sub-main">
        <article className="corp-sub-article">
          <FadeUp>
            <div className="corp-sub-toprow">
              <Link href="/corporate" className="corp-sub-toplink"><span aria-hidden>←</span> AI Cleared</Link>
            </div>
            <p style={sectionMarkBare}>{eyebrow}</p>
            <h1 className="corp-sub-h1">{title}</h1>
            <p className="corp-sub-lede">{lede}</p>
          </FadeUp>

          {sections.map((s, i) => (
            <FadeUp key={s.heading} delay={0.04 * Math.min(i, 4)}>
              <section className="corp-sub-section">
                <h2>{s.heading}</h2>
                <div className="corp-sub-body">{s.body}</div>
              </section>
            </FadeUp>
          ))}

          <FadeUp>
            <aside className="corp-sub-map">
              <p style={sectionMark}>{"// How AI Cleared answers it"}</p>
              <ul>{maps.map((m) => <li key={m}>{m}</li>)}</ul>
              <div className="corp-sub-doors">
                <Link href="/corporate#enquiry" className="corp-sub-pri">Register your interest <span aria-hidden>&rarr;</span></Link>
                <Link href="/corporate#policy" className="corp-sub-ghost">Write our AI policy, free</Link>
              </div>
            </aside>
          </FadeUp>

          <p className="corp-sub-asof">This page sets out our reading of the position as of {asOf}. It is general information for firms, and your own legal advice governs.</p>
        </article>
      </main>
      <Footer tone="sand" />

      <style>{`
        .corp-page, .corp-page :is(section, div, nav, header, footer, main, span, p, li, a, article, aside, h1, h2) {
          --lv2-cyan: #0a7085; --lv2-cyan-soft: #0a7085; --lv2-lime: #0e7a45; --lv2-cosmic: #5744c9; --lv2-text-muted: #5d6472; --lv2-ink: #14161d;
        }
        html, .corp-page { background: #f3ede4; }
        .corp-sub-main { position: relative; color: var(--lv2-ink); min-height: 100vh; overflow-x: clip; padding-top: 68px; }
        .corp-sub-article { max-width: 760px; margin: 0 auto; padding: clamp(26px, 2.2vw, 44px) var(--lv2-rail) calc(var(--lv2-rail) * 2); }
        .corp-sub-toprow { margin-bottom: 26px; }
        .corp-sub-toplink { display: inline-flex; align-items: center; gap: 6px; font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; color: var(--lv2-cyan-soft); }
        .corp-sub-h1 { margin: 18px 0 0; font-family: var(--lv2-font-display); font-size: clamp(2.1rem, 4.2vw, 3.4rem); line-height: 1.04; letter-spacing: -0.03em; font-weight: 400; text-wrap: balance; }
        .corp-sub-grad { background: linear-gradient(92deg, #0a7085 0%, #5744c9 55%, #a5117f 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .corp-sub-lede { margin: 18px 0 0; font-family: var(--lv2-font-display); font-size: clamp(1.05rem, 1.35vw, 1.2rem); line-height: 1.6; color: rgba(17,22,38,0.82); }
        .corp-sub-section { margin-top: clamp(30px, 3.4vw, 48px); padding-top: 22px; border-top: 1px solid rgba(20,22,29,0.14); }
        .corp-sub-section h2 { margin: 0 0 10px; font-family: var(--lv2-font-display); font-size: clamp(1.3rem, 2vw, 1.7rem); line-height: 1.15; letter-spacing: -0.02em; font-weight: 500; }
        .corp-sub-body p { margin: 0 0 12px; font-family: var(--lv2-font-display); font-size: 16px; line-height: 1.65; color: rgba(17,22,38,0.86); max-width: 66ch; }
        .corp-sub-body p:last-child { margin-bottom: 0; }
        .corp-sub-body ul { margin: 6px 0 12px; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .corp-sub-body li { position: relative; padding-left: 22px; font-family: var(--lv2-font-display); font-size: 15.5px; line-height: 1.55; color: rgba(17,22,38,0.86); }
        .corp-sub-body li::before { content: ""; position: absolute; left: 2px; top: 10px; width: 6px; height: 6px; border-radius: 50%; background: #0a7085; }
        .corp-sub-body blockquote { margin: 8px 0 14px; padding: 12px 16px; border-left: 2px solid #0a7085; background: rgba(255,253,248,0.7); border-radius: 0 10px 10px 0; font-family: var(--lv2-font-display); font-size: 15px; line-height: 1.6; color: rgba(17,22,38,0.86); font-style: italic; }
        .corp-sub-body strong { font-weight: 600; color: #14161d; }
        .corp-sub-map { margin-top: clamp(34px, 4vw, 56px); padding: 26px 26px 24px; border-radius: 18px; border: 1px solid rgba(10,112,133,0.35); background: linear-gradient(180deg, rgba(244,239,231,0.78), rgba(255,253,248,0.78)); box-shadow: 0 20px 50px -30px rgba(10,112,133,0.5); }
        .corp-sub-map ul { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
        .corp-sub-map li { position: relative; padding: 9px 0 0 22px; border-top: 1px solid rgba(86,68,45,0.14); font-family: var(--lv2-font-display); font-size: 15px; line-height: 1.5; color: rgba(17,22,38,0.88); }
        .corp-sub-map li:first-child { border-top: 0; padding-top: 0; }
        .corp-sub-map li::before { content: ""; position: absolute; left: 2px; top: 16px; width: 6px; height: 6px; border-radius: 999px; background: #0e7a45; }
        .corp-sub-map li:first-child::before { top: 7px; }
        .corp-sub-doors { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }
        .corp-sub-pri { display: inline-flex; align-items: center; gap: 10px; height: 54px; padding: 0 28px; border-radius: 999px; text-decoration: none; background: linear-gradient(135deg, #0a7085 0%, #086072 55%, #075464 100%); color: #fffdfa; font-family: var(--lv2-font-display); font-size: 15.5px; font-weight: 700; box-shadow: 0 16px 38px -12px rgba(10,112,133,0.9), inset 0 1px 0 rgba(255,255,255,0.4); white-space: nowrap; }
        .corp-sub-ghost { display: inline-flex; align-items: center; height: 54px; padding: 0 22px; border-radius: 999px; text-decoration: none; border: 1px solid rgba(20,22,29,0.22); background: rgba(255,253,248,0.8); color: #14161d; font-family: var(--lv2-font-display); font-size: 15px; font-weight: 600; white-space: nowrap; }
        .corp-sub-asof { margin: 26px 0 0; font-family: var(--lv2-font-mono); font-size: 11.5px; letter-spacing: 0.04em; line-height: 1.6; color: rgba(17,22,38,0.62); }
        .corp-sub-article :is(a, button):focus-visible { outline: 2px solid #0a7085; outline-offset: 3px; }
      `}</style>
    </div>
  );
}
