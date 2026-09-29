"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Board, Html } from "./Scenes";
import type { Pack as PackData, Slide } from "./packs/types";

/**
 * One week of Cyber Heroes, for the adult at the front of the room.
 *
 * One rule runs the whole interface: a slide either TELLS the class something
 * or ASKS them something, and forward goes forward. Nothing is hidden, nothing
 * is timed, there is no mode to learn. A primary teacher has thirty children
 * and no prep time, and every extra control is something to wade through.
 *
 * There are two views of the same list of slides. The CLASS DECK is what goes
 * on the screen behind the teacher. The TEACHER DECK is the same board with
 * the script beside it, for the laptop in front of them. Answers live only in
 * the script: never on the board, where a child reads them before they have
 * had a chance to think.
 */

type Mode = "teach" | "board";

const KIND: Record<Slide["kind"], { cls: string; label: string; mark: string }> = {
  tell: { cls: "k-say", label: "You tell them", mark: "▸" },
  ask: { cls: "k-ask", label: "You ask the class", mark: "?" },
  do: { cls: "k-talk", label: "They do it", mark: "✦" },
};

const SHEET_LABEL: Record<Slide["kind"], { cls: string; label: string }> = {
  tell: { cls: "s-say", label: "You tell them" },
  ask: { cls: "s-ask", label: "You ask the class" },
  do: { cls: "s-talk", label: "They do it" },
};

const WHAT_IS: Record<Mode, string> = {
  board:
    "<b>What the children see.</b> The screen behind you, and nothing else. "
    + "Use it to check how a slide looks big.",
  teach:
    "<b>The slide, and what to say for it.</b> Keep this on your laptop while the class deck "
    + "is on the screen behind you. The game tests them at the end of the week, so the slides "
    + "after the break are a conversation, not a quiz.",
};

/** How far a light slide is allowed to grow into an empty board. */
const MAX_GROW = 1.5;

export default function Pack({ pack, weeks, shared = false }: {
  pack: PackData;
  weeks: number[];
  /** Rendered from a read-only share link, so the reader has no account and
   *  this is the only week they hold. Changes what is said, not what is shown:
   *  a school judging the product should see exactly what a teacher gets. */
  shared?: boolean;
}) {
  const [mode, setMode] = useState<Mode>("teach");
  const [i, setI] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const slides = pack.slides;
  const slide = slides[i];
  const next = slides[i + 1];

  /* A link names a slide by id, never by number, so reordering the deck can
     never silently produce a wrong reference. A missing id renders loudly
     rather than pointing somewhere plausible and wrong. */
  const linkText = useCallback((link: { to: string; text: string }) => {
    const at = slides.findIndex((x) => x.id === link.to);
    return at < 0
      ? "BROKEN LINK: no slide with id " + link.to
      : link.text.replace("%s", String(at + 1));
  }, [slides]);

  /* ── scale the slide to FILL the board ──────────────────────────────────
     The smaller of the width and height ratios, so a thin slide grows into
     its board and a heavy one shrinks to fit. Runs before paint so nobody
     ever sees the unscaled frame. */
  const fit = useCallback(() => {
    const box = stageRef.current?.querySelector<HTMLElement>(".fit");
    const inner = box?.parentElement;
    if (!box || !inner) return;
    box.style.transform = "none";
    const cs = getComputedStyle(inner);
    const roomH = inner.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const roomW = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const r = box.getBoundingClientRect();
    if (!r.height || !r.width) return;
    const k = Math.min(roomH / r.height, roomW / r.width, MAX_GROW);
    if (Math.abs(k - 1) > 0.01) box.style.transform = "scale(" + k.toFixed(4) + ")";
  }, []);

  useLayoutEffect(fit, [fit, i, mode, isFull]);

  useEffect(() => {
    /* a web font landing after first paint changes every measurement the fit
       was based on, so measure again once the faces are actually in */
    document.fonts?.ready.then(fit).catch(() => {});
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, [fit]);

  /* ── arrow keys, in full screen too ─────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      /* never steal the key from somebody typing */
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setI((n) => Math.min(slides.length - 1, n + 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [slides.length]);

  useEffect(() => {
    const onFs = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  /* Full screen needs no second layout: the board is a size container measured
     in cqw, so it composes identically at 600px and on a hall projector. */
  const fullscreen = () => {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    setMode("board");
    stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  const before = slide.at === "before";

  const dots = (at: Slide["at"]) => (
    <div className="dots">
      {slides.map((x, n) => [x, n] as const).filter(([x]) => x.at === at).map(([x, n]) => (
        <button
          key={n}
          className={"d-" + x.kind}
          aria-current={n === i}
          title={x.title.replace(/<br>/g, " ").replace(/"/g, "")}
          onClick={() => setI(n)}
        >
          {n + 1}
        </button>
      ))}
    </div>
  );

  return (
    <div className={"axtp" + (mode === "board" ? " boardonly" : "")}>
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">
              Cyber <span>Heroes</span> &middot; <i>Week {pack.n} &middot; {pack.title}</i>
            </div>
            <div className="sub">
              {pack.sub} &middot; ages 6&ndash;9 &middot; you set it up, they play and are tested
              by the game, then you talk it through
            </div>
            {/* No picker on a share link: it names one week, and holding a
                link to week 1 should not hand over weeks 11 and 20. */}
            {weeks.length > 0 && (
              <div className="weeks" role="group" aria-label="Week">
                {/* real links, not buttons: each week is its own route, so
                    these open in a new tab and come back through history like
                    anything else a teacher clicks */}
                {weeks.map((n) => (
                  <Link key={n} href={`/schools/teach/${n}`} aria-current={n === pack.n ? "page" : undefined}>
                    Week {n}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="modes" role="group" aria-label="View">
            <button aria-pressed={mode === "teach"} onClick={() => setMode("teach")}>Teacher deck</button>
            <button aria-pressed={mode === "board"} onClick={() => setMode("board")}>Class deck</button>
            <button onClick={fullscreen} title="Put the board on the projector">
              {isFull ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        </header>

        {/* a week can carry a briefing the teacher must read before slide 1 */}
        {pack.brief && (
          <div className="brief">
            <h4>{pack.brief.head}</h4>
            {pack.brief.body.map((p, n) => <Html key={n} as="p" html={p} />)}
            {pack.helpline && <Html as="p" className="line" html={pack.helpline.setup} />}
          </div>
        )}

        {/* Somebody sent this to a school. Say which week it is and that there
            are twenty, because the whole point of the link is to stand in for
            the other nineteen they cannot see. */}
        {shared && (
          <p className="whatis">
            <b>This is one week of twenty.</b> Week {pack.n} of Cyber Heroes, exactly as a teacher
            gets it: the board for the screen, the script to read from, and a printable sheet.
            Every week in the course has one.{" "}
            <Link href="/schools">See what a school licence includes</Link>.
          </p>
        )}

        <Html as="p" className="whatis" html={WHAT_IS[mode]} />

        {/* the whole lesson at a glance, in its three phases, so a teacher can
            see what is taught when and what comes back. Clickable. */}
        <div className="run">
          <div className={"leg" + (before ? " now" : "")}>
            <h5>10 min &middot; you teach</h5>
            {dots("before")}
          </div>
          <div className="leg play">
            <b>45 min &middot; they play</b>
            <span>
              Let them log on and get going. The game teaches and tests them.<br />
              <b>Bring everyone back together 10 minutes before the end.</b>
            </span>
          </div>
          <div className={"leg" + (before ? "" : " now")}>
            <h5>10 min &middot; you talk it through</h5>
            {dots("after")}
          </div>
        </div>

        <div className="deck">
          <div className={"sbs" + (mode === "board" ? " solo" : "")}>
            <div ref={stageRef} className={"stage board " + slide.kind}>
              <Board slide={slide} pack={pack} />
            </div>

            {mode === "teach" && (
              <aside className="notes">
                <div className="nhead">
                  <span className={"tkind " + KIND[slide.kind].cls}>
                    <span className="dot">{KIND[slide.kind].mark}</span>
                    {KIND[slide.kind].label}
                  </span>
                  <span className="nnum">{i + 1} of {slides.length}</span>
                </div>

                {slide.link && <p className="link">{linkText(slide.link)}</p>}

                <p className="yousay">
                  <span className="lead">You say</span>
                  <Html html={slide.say} />
                </p>

                {/* what a child actually says, and the sentence that takes it
                    somewhere. The most used part of the pack in a real room. */}
                {slide.hear && (
                  <div className="hear">
                    <h4>You might hear</h4>
                    {slide.hear.map(([said, back], n) => (
                      <div key={n} className="hr">
                        <Html as="p" className="said" html={said} />
                        <Html as="p" className="back" html={back} />
                      </div>
                    ))}
                  </div>
                )}

                {slide.warn && (
                  <div className={slide.handover ? "hand" : "warn"}>
                    <h4>{slide.handover ? "Now they play" : "Worth knowing"}</h4>
                    <Html as="p" html={slide.warn} />
                  </div>
                )}

                {next ? (
                  <p className={"nnext" + (next.at !== slide.at ? " gap" : "")}>
                    {next.at !== slide.at
                      ? "After the 45 minutes, when you are back together: "
                      : "Next: "}
                    <b>{next.title.replace(/<br>/g, " ")}</b>
                  </p>
                ) : (
                  <p className="nnext">Last slide. Send them off.</p>
                )}
              </aside>
            )}
          </div>

          <div className="bar">
            <div className="nav">
              <button onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label="Back">&larr;</button>
              <button onClick={() => setI((n) => Math.min(slides.length - 1, n + 1))} disabled={i === slides.length - 1} aria-label="Next">&rarr;</button>
              <span className="count">Slide {i + 1} of {slides.length}</span>
            </div>
            <span className="hint">
              Arrow keys move, in full screen too. Print this page for the whole lesson on paper.
            </span>
          </div>
        </div>

        <Sheet pack={pack} linkText={linkText} />

        <footer className="note">
          The ideas, the characters and the wording are taken from the Week {pack.n} course, so the
          board matches the screens the children play on. Games this week: {pack.games}.
        </footer>
      </div>
    </div>
  );
}

/**
 * The printed lesson.
 *
 * On screen it is not there at all; on paper it is the only thing there. It is
 * rendered from the week currently open, which is the fix for a real bug in the
 * prototype: the sheet was built once at startup from hard coded Week 1 copy,
 * so a teacher who printed while looking at Week 11 was handed Week 1's script,
 * with none of the safeguarding briefing on it.
 */
function Sheet({ pack, linkText }: {
  pack: PackData;
  linkText: (link: { to: string; text: string }) => string;
}) {
  const rows = (at: Slide["at"]) =>
    pack.slides.map((s, n) => [s, n] as const).filter(([s]) => s.at === at).map(([s, n]) => (
      <div key={n} className="row">
        <span className="rn">{n + 1}</span>
        <div className="rb">
          {s.title.replace(/<br>/g, " ")}
          <small className={SHEET_LABEL[s.kind].cls}>{SHEET_LABEL[s.kind].label}</small>
        </div>
        <div className="rs">
          {s.link && <p className="lk">{linkText(s.link)}</p>}
          <Html as="p" html={s.say} />
          {s.hear && (
            <div className="sh">
              {s.hear.map(([said, back], k) => (
                <p key={k}>
                  <Html as="b" html={said} />
                  <br />
                  {"→ "}
                  <Html html={back} />
                </p>
              ))}
            </div>
          )}
          {s.warn && (
            <p className="w"><b>Worth knowing</b> <Html html={s.warn} /></p>
          )}
        </div>
      </div>
    ));

  return (
    <div className="printable" aria-hidden="true">
      <div className="sheet">
        <h2>Week {pack.n} &middot; {pack.title}</h2>
        <p className="lede">
          Everything in quote marks is yours to read out. Up front, a question is always followed
          by its answer on the very next slide. Afterwards there are no right answers: the game has
          already tested them, so the last part is a conversation about how they use it.
        </p>

        {pack.brief && (
          <>
            <div className="phase">{pack.brief.head}</div>
            {pack.brief.body.map((p, n) => <Html key={n} as="p" html={p} />)}
            {pack.helpline && <Html as="p" html={pack.helpline.setup} />}
          </>
        )}

        <div className="phase">10 minutes with you</div>
        {rows("before")}

        <div className="phase">45 minutes on the computers</div>
        <div className="row">
          <span className="rn" />
          <div className="rb">They play Week {pack.n}</div>
          <div className="rs">
            <p>
              {pack.games}, then the Week {pack.n} boss quiz. Sarah talks them through it, so you
              are free to move around the room. <b>The quiz is the test</b>, so you do not need to
              test them again afterwards. <b>Set an alarm for 10 minutes before the lesson ends</b>,
              stop them wherever they have got to, and bring everyone back together for the rest of
              this sheet.
            </p>
          </div>
        </div>

        <div className="phase">10 minutes talking it through</div>
        {rows("after")}
      </div>
    </div>
  );
}
