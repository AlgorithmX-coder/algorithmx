import Link from "next/link";
import type { ReactNode } from "react";
import { K } from "./engine/tokens";
import { COURSES, type CourseSlug } from "./engine/courses";
import Aurora from "./Aurora";

/* The frame for every page outside the player: the aurora backdrop, a
 * glass header strip, a two-column body (the action on the left, the
 * context on the right) and a footer line. Server component; the
 * responsive rules live in a plain style tag with cf- prefixed classes.
 * Both courses use it; the wordmark and the home link follow `course`. */
export default function Frame({
  firmName,
  meta,
  aside,
  children,
  courseLink,
  course = "ai-cleared",
}: {
  firmName?: string;
  meta?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  courseLink?: boolean;
  course?: CourseSlug;
}) {
  const c = COURSES[course];
  return (
    <div className="cf-page">
      <Aurora />
      <header className="cf-top">
        <div className="cf-top-left">
          <Link href={c.base} className="cf-brand">
            <span className="cf-spark" aria-hidden />
            <span className="cf-word">{c.brand}</span>
          </Link>
          {firmName && (
            <>
              <span className="cf-sep" />
              <span className="cf-firm">{firmName}</span>
            </>
          )}
        </div>
        <div className="cf-top-right">
          {meta}
          {courseLink && <Link href={c.base} className="cf-link">Course</Link>}
        </div>
      </header>
      <div className={`cf-body ${aside ? "two" : ""}`}>
        <main className="cf-main">{children}</main>
        {aside && <aside className="cf-aside">{aside}</aside>}
      </div>
      <footer className="cf-foot">
        <span>Nothing in the course is real data, and nothing you type in it is stored.</span>
        <span>Questions about your seat: <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a></span>
      </footer>
      <style>{`
        .cf-page { position: relative; min-height: 100svh; display: flex; flex-direction: column; background: ${K.ground}; color: ${K.body}; font-family: ${K.sans}; overflow: hidden; }
        .cf-top { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 28px; border-bottom: 1px solid ${K.glassEdge}; background: ${K.headerBg}; backdrop-filter: blur(14px); }
        .cf-top-left, .cf-top-right { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .cf-brand { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; }
        .cf-spark { width: 14px; height: 14px; border-radius: 4px; background: ${K.grad}; box-shadow: 0 0 0 4px rgba(87,68,201,0.12); transform: rotate(45deg); animation: cf-pulse 3.2s ease-in-out infinite; }
        .cf-word { font-family: ${K.mono}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.22em; color: ${K.accentInk}; white-space: nowrap; }
        .cf-sep { width: 1px; height: 14px; background: ${K.edge}; }
        .cf-firm { color: ${K.ink}; font-weight: 600; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cf-meta { color: ${K.muted}; font-size: 13px; }
        .cf-link { color: ${K.ink}; font-size: 13px; text-decoration: none; border: 1px solid ${K.edge}; border-radius: 999px; padding: 6px 13px; background: ${K.glassStrong}; }
        .cf-link:hover { border-color: ${K.accent}; }
        .cf-body { position: relative; z-index: 1; flex: 1; width: 100%; max-width: 1180px; margin: 0 auto; padding: 52px 28px 64px; box-sizing: border-box; display: grid; grid-template-columns: minmax(0, 1fr); gap: 44px; align-items: start; }
        .cf-body.two { grid-template-columns: minmax(0, 1fr) 400px; }
        .cf-main { min-width: 0; animation: cf-rise 520ms cubic-bezier(.2,.7,.2,1) both; }
        .cf-aside { min-width: 0; display: flex; flex-direction: column; gap: 14px; position: sticky; top: 24px; animation: cf-rise 640ms cubic-bezier(.2,.7,.2,1) 80ms both; }
        .cf-foot { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 16px 28px 22px; border-top: 1px solid ${K.glassEdge}; background: ${K.headerBg}; font-size: 12.5px; color: ${K.faint}; }
        .cf-foot a { color: ${K.accentInk}; }

        .cf-card { background: ${K.glass}; backdrop-filter: blur(16px); border: 1px solid ${K.glassEdge}; border-radius: 18px; padding: 18px 20px; box-shadow: 0 8px 30px rgba(20,22,29,0.06); }
        .cf-label { font-family: ${K.mono}; font-size: 10.5px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${K.faint}; margin-bottom: 10px; }
        .cf-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-family: ${K.mono}; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${K.accentInk}; margin-bottom: 18px; padding: 6px 12px; border-radius: 999px; background: ${K.glassStrong}; border: 1px solid ${K.glassEdge}; }
        .cf-h1 { font-family: ${K.display}; font-size: 44px; line-height: 1.06; font-weight: 600; letter-spacing: -0.025em; color: ${K.ink}; margin: 0 0 16px; text-wrap: balance; max-width: 20ch; }
        .cf-grad { background: ${K.grad}; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .cf-lead { font-size: 17.5px; line-height: 1.55; color: ${K.body}; margin: 0 0 26px; max-width: 56ch; }
        .cf-note { font-size: 14px; color: ${K.muted}; }
        .cf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font: inherit; font-size: 15px; font-weight: 600; border-radius: 12px; padding: 13px 22px; text-decoration: none; cursor: pointer; border: 1px solid ${K.edge}; color: ${K.ink}; background: ${K.glassStrong}; transition: transform 160ms ease, box-shadow 160ms ease; }
        .cf-btn:hover { border-color: ${K.accent}; transform: translateY(-1px); }
        .cf-btn-pri { background: ${K.grad}; border-color: transparent; color: ${K.onAccent}; box-shadow: ${K.glow}; }
        .cf-btn-pri:hover { filter: brightness(1.05); }

        .cf-firmcard { display: flex; gap: 14px; align-items: center; }
        .cf-avatar { flex-shrink: 0; width: 46px; height: 46px; border-radius: 14px; background: ${K.grad}; color: ${K.onAccent}; font-weight: 700; font-size: 18px; display: inline-flex; align-items: center; justify-content: center; box-shadow: ${K.glow}; }
        .cf-firmcard b { display: block; color: ${K.ink}; font-size: 16px; }
        .cf-firmcard small { display: block; color: ${K.muted}; font-size: 13px; margin-top: 2px; }
        .cf-modules { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
        .cf-modules li { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-top: 1px solid ${K.edgeSoft}; font-size: 14px; color: ${K.body}; }
        .cf-modules li:first-child { border-top: none; padding-top: 0; }
        .cf-mod-n { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; border: 1px solid ${K.edge}; font-family: ${K.mono}; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; color: ${K.muted}; background: ${K.glassStrong}; }
        .cf-mod-n.done { border-color: transparent; color: ${K.onAccent}; background: ${K.grad}; }
        .cf-mod-t { flex: 1; min-width: 0; color: ${K.ink}; }
        .cf-mod-m { font-family: ${K.mono}; font-size: 11px; color: ${K.faint}; white-space: nowrap; }
        .cf-window { position: relative; border-radius: 16px; box-shadow: ${K.lift}; animation: cf-float 7s ease-in-out infinite; }
        .cf-window::before { content: ""; position: absolute; inset: -14px; border-radius: 26px; background: ${K.gradSoft}; filter: blur(22px); z-index: -1; }
        .cf-window > * { border-radius: 16px; overflow: hidden; }
        .cf-window-cap { font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: ${K.faint}; margin-top: 12px; }

        @keyframes cf-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes cf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes cf-pulse { 0%, 100% { box-shadow: 0 0 0 4px rgba(87,68,201,0.12); } 50% { box-shadow: 0 0 0 7px rgba(87,68,201,0.06); } }
        @media (prefers-reduced-motion: reduce) { .cf-main, .cf-aside, .cf-window, .cf-spark { animation: none; } }
        @media (max-width: 980px) {
          .cf-body.two { grid-template-columns: minmax(0, 1fr); }
          .cf-aside { position: static; }
          .cf-body { padding: 28px 18px 40px; gap: 28px; }
          .cf-top, .cf-foot { padding-left: 18px; padding-right: 18px; }
          .cf-h1 { font-size: 32px; }
          .cf-lead { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
