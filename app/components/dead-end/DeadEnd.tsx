import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Fredoka, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import DeadEndPause from "./DeadEndPause";
import "./dead-end.css";

/**
 * A dead end: a page that cannot give the visitor what they came for and
 * shows them one calm way forward instead. The 404, a bad or spent invite or
 * share link, a teacher whose school holds no licence, a pupil whose course
 * is closed.
 *
 * The owner-approved round 8 design (landing lab, r8-state.html + r8.css,
 * ".r8-end"): the light Hologram house, one white panel with the words on
 * the left and a ringed glyph on the right, the ways back in along the
 * bottom (404) or a "Signed in as" strip (a signed-in adult). This only
 * draws the room: every caller passes its own words, buttons and forms, so
 * the copy and behaviour stay where they were.
 *
 * Styles are one scoped sheet (dead-end.css, prefix r8-); the accent and the
 * Pause state live in data attributes on the root.
 */

const disp = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--r8-disp", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--r8-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["600", "700"], variable: "--r8-mono", display: "swap" });
const kid = Fredoka({ subsets: ["latin"], weight: ["600"], variable: "--r8-kid", display: "swap" });

const svg = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/** The design's line icons (r8.js "I"), by name. */
export const R8_ICON = {
  shield: svg("M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4"),
  arrow: svg("M5 12h14 M13 6l6 6-6 6"),
  back: svg("M19 12H5 M11 6l-6 6 6 6"),
  lock: svg("M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 017 0v3"),
  unlink: svg("M9.5 14.5l5-5 M8 11l-2.5 2.5a3.5 3.5 0 005 5L13 16 M16 13l2.5-2.5a3.5 3.5 0 00-5-5L11 8 M4 4l2 2 M18 18l2 2"),
  home: svg("M4 11l8-7 8 7v9h-5v-6H9v6H4z"),
  cap: svg("M2 9l10-5 10 5-10 5L2 9z M6 11.5V16c2 2 10 2 12 0v-4.5 M22 9v6"),
  case: svg("M3 8h18v12H3z M9 8V5h6v3 M3 13h18"),
  signin: svg("M14 4h6v16h-6 M4 12h11 M11 8l4 4-4 4"),
  wave: svg("M7 11V6a1.5 1.5 0 013 0v4 M10 10V4.5a1.5 1.5 0 013 0V10 M13 10V6a1.5 1.5 0 013 0v7 M16 11a1.5 1.5 0 013 0v3c0 4-2.5 7-6.5 7S6 19 5 16l-1.4-3.4a1.4 1.4 0 012.5-1.2L7 13"),
} as const;

export type R8Glyph = "404" | "unlink" | "lock" | "wave";
export type R8Lockup = "ax" | "school" | "secured";
export type R8Way = { href: string; icon: keyof typeof R8_ICON; tint: string; title: string; sub: string };

/** Spreads the staggered rise-in onto an element. */
export const r8Rise = (i: number) => ({ "data-rise": "", style: { "--i": i } as CSSProperties });

function Lockup({ kind, link }: { kind: R8Lockup; link: boolean }) {
  if (kind === "ax") {
    return (
      <Link className="r8-lock" href="/" aria-label="AlgorithmX home">
        <span className="mark" data-ax="">
          {/* eslint-disable-next-line @next/next/no-img-element -- a 32px static mark */}
          <img src="/favicon.svg" alt="" width={22} height={22} />
        </span>
        <span className="col">
          <span className="name" data-ax="">Algorithm<em>X</em></span>
        </span>
      </Link>
    );
  }
  const school = kind === "school";
  const label = school ? "Cyber School by AlgorithmX" : "Cyber Secured by AlgorithmX";
  const inner = (
    <>
      <span className="mark">{school ? R8_ICON.cap : R8_ICON.shield}</span>
      <span className="col">
        <span className="name">Cyber <em>{school ? "School" : "Secured"}</em></span>
        <span className="by">
          by
          {/* eslint-disable-next-line @next/next/no-img-element -- a 9px static mark */}
          <img src="/favicon.svg" alt="" width={9} height={9} />
          AlgorithmX
        </span>
      </span>
    </>
  );
  /* Not a link on a pupil's page: a child is never sent to a page with prices on it. */
  if (!link) return <span className="r8-lock" role="img" aria-label={label}>{inner}</span>;
  return <Link className="r8-lock" href={school ? "/schools" : "/corporate"} aria-label={label}>{inner}</Link>;
}

function Glyph({ kind }: { kind: R8Glyph }) {
  return (
    <div className="r8-glyph" aria-hidden="true">
      <span className="orbit" />
      <span className="orbit b" />
      {kind === "404" ? <span className="num">404</span> : R8_ICON[kind]}
    </div>
  );
}

export default function DeadEnd({
  tone,
  lockup,
  lockupLink = true,
  back,
  eyebrow,
  err = false,
  title,
  children,
  asked,
  actions,
  glyph,
  ways,
  who,
  foot,
}: {
  /** The accent. Leave out for the house teal. */
  tone?: "school" | "secured" | "pupil";
  lockup: R8Lockup;
  /** False keeps the lockup from being a link (the pupil page). */
  lockupLink?: boolean;
  back?: { href: string; label: string };
  eyebrow: string;
  /** A failure (bad link, 404): the eyebrow turns red. */
  err?: boolean;
  title: ReactNode;
  /** The paragraphs under the title, each a <p>. */
  children?: ReactNode;
  /** "You asked for" chip content (the 404's missed address). */
  asked?: ReactNode;
  /** Buttons and forms; give each the class r8-btn (data-kind="ghost" for the quiet one). */
  actions?: ReactNode;
  glyph: R8Glyph;
  ways?: R8Way[];
  /** A signed-in adult: who they are, and the control that signs them out. */
  who?: { label: ReactNode; signOut: ReactNode };
  foot?: ReactNode;
}) {
  return (
    <div className={`r8 ${disp.variable} ${sans.variable} ${mono.variable} ${kid.variable}`} data-c={tone}>
      <div className="r8-ground" aria-hidden="true">
        <span className="grid" />
        <span className="pool a" />
        <span className="pool b" />
        <span className="st" style={{ left: "9%", "--s": "255,150,60", "--d": "11s" } as CSSProperties} />
        <span className="st" style={{ left: "18%", "--s": "0,190,220", "--d": "8s", "--o": "-3s" } as CSSProperties} />
        <span className="st" style={{ left: "86%", "--s": "139,123,255", "--d": "10s", "--o": "-5s" } as CSSProperties} />
        <span className="st" style={{ left: "93%", "--s": "240,106,184", "--d": "13s", "--o": "-2s" } as CSSProperties} />
      </div>

      <header className="r8-top">
        <Lockup kind={lockup} link={lockupLink} />
        {back && (
          <Link className="r8-back" href={back.href}>
            {R8_ICON.back}
            <span>{back.label}</span>
          </Link>
        )}
      </header>

      <main className="r8-stage">
        <div className="r8-end">
          <div className="main">
            <div className="copy">
              <span className="r8-eyebrow" data-err={err ? "" : undefined} {...r8Rise(0)}>
                <i />
                {eyebrow}
              </span>
              <h1 {...r8Rise(1)}>{title}</h1>
              <div {...r8Rise(2)}>{children}</div>
              {asked && (
                <span className="asked" {...r8Rise(3)}>
                  <b>You asked for</b>
                  <code>{asked}</code>
                </span>
              )}
              {actions && (
                <div className="r8-actions" {...r8Rise(3)}>
                  {actions}
                </div>
              )}
            </div>
            <Glyph kind={glyph} />
          </div>

          {ways && ways.length > 0 && (
            <nav className="r8-ways" aria-label="Ways in">
              {ways.map((w) => (
                <Link key={w.href} className="r8-way" href={w.href} style={{ "--t": w.tint } as CSSProperties}>
                  <span className="ic">{R8_ICON[w.icon]}</span>
                  <b>
                    {w.title}
                    {R8_ICON.arrow}
                  </b>
                  <span>{w.sub}</span>
                </Link>
              ))}
            </nav>
          )}

          {who && (
            <div className="r8-who">
              <span>{who.label}</span>
              {who.signOut}
            </div>
          )}
        </div>
      </main>

      {foot && <p className="r8-foot">{foot}</p>}
      <DeadEndPause />
    </div>
  );
}
