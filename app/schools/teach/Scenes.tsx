"use client";

import { ART } from "./packs/art";
import type { Pack, SceneKey, Slide } from "./packs/types";

/**
 * What goes on the board behind the teacher.
 *
 * Each scene is the picture for one kind of slide. They are deliberately dumb:
 * a scene gets the slide and the week and returns markup, and every size in the
 * stylesheet is in `cqw` against the board itself, so one composition holds
 * from a laptop preview to a hall projector with no breakpoints to go wrong in
 * a room nobody has stood in yet.
 *
 * Adding a week may add a scene. Nothing else has to change.
 */

/** Authored copy carries real markup (`<b>`, `<em>`, `<br>`) because a script
 *  a teacher reads at a glance needs emphasis. It is written by us and checked
 *  in, never user supplied, which is what makes this safe. See packs/types.ts. */
export function Html({ html, as: As = "span", ...rest }: {
  html: string;
  as?: "span" | "p" | "h2" | "h4" | "div" | "b" | "small";
} & React.HTMLAttributes<HTMLElement>) {
  return <As {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── the cast, standing in the scene ───────────────────────────────────── */

function Figure({ who, alt, right }: { who: "racc" | "adam" | "layla"; alt: string; right?: boolean }) {
  return (
    <div className={"cast " + who + (right ? " r" : "")}>
      {/* plain img: these are sized in container units against the board, which
          next/image cannot express, and they are already small flat PNGs */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ART[who]} alt={alt} />
    </div>
  );
}

const PAIR = (
  <>
    <Figure who="adam" alt="Adam" right />
    <Figure who="layla" alt="Layla" right />
  </>
);

/** Who is standing in each scene. A week with no villain simply has no entry,
 *  which is how week 11 gets a board with nobody threatening on it. */
const CAST: Partial<Record<SceneKey, React.ReactNode>> = {
  racc: <Figure who="racc" alt="The Hacker Raccoon" />,
  heroes: PAIR,
  grad: PAIR,
  tonight: PAIR,
};

/** How much room the cast needs, so the words never run underneath them. The
 *  raccoon art is 1232x900, so 60cqh makes him 46cqw wide starting at 53.8cqw:
 *  that is the number `castright` has to clear. */
const CAST_PAD: Partial<Record<SceneKey, string>> = {
  racc: "castright",
  tonight: "castr",
  heroes: "castr",
  grad: "castr",
};

/* ── the scenes ────────────────────────────────────────────────────────── */

function Tiles({ word, hot }: { word: string; hot?: string }) {
  return (
    <div className="tset">
      {[...word].map((c, n) => (
        <span key={n} className={"tile" + (hot?.includes(c) ? " add" : "")}>{c}</span>
      ))}
    </div>
  );
}

function Wall({ five, bare }: { five: Pack["five"]; bare?: boolean }) {
  return (
    <div className={"wall" + (bare ? " bare" : "")}>
      {five.map((f) => (
        <div key={f.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.art} alt={bare ? f.name : ""} />
          {!bare && <><b>{f.name}</b><i>{f.line}</i></>}
        </div>
      ))}
    </div>
  );
}

/** The same three cards before and after. Afterwards each carries a STOPPED
 *  pill and the layout is otherwise identical on purpose, so the mirror is
 *  obvious from the back of the room. */
const RISKS: readonly [string, string, string][] = [
  [ART.gamepad, "Takes your stuff", "coins, skins, everything you earned"],
  [ART.mask, "Pretends to be you", "messages your friends, and they believe him"],
  [ART.locked, "Locks you out", "changes it, and you never get back in"],
];

const SCENARIOS: readonly [string, string][] = [
  [ART.gamepad, "Somebody you did not know started talking to you in a game"],
  [ART.mask, "Somebody asked you for your login, or offered you free stuff for it"],
  [ART.mail, "A message said you had won something, or that your account was in trouble"],
];

const MEET: readonly [string, string, string][] = [
  [ART.adam, "Adam", "you play as him"],
  [ART.layla, "Layla", "and as her"],
  [ART.racc, "The Hacker Raccoon", "he wants your password"],
];

const PROTOCOL: readonly [string, string, string][] = [
  ["1", "Stop", "hands off, do not reply"],
  ["2", "Screenshot", "before you block, or it vanishes"],
  ["3", "Block", "shut the door"],
  ["4", "Tell", "somebody on your team"],
];

function Scene({ slide, pack }: { slide: Slide; pack: Pack }) {
  switch (slide.scene) {
    case "racc":
      return slide.bubble ? <Html as="div" className="bubble" html={slide.bubble} /> : null;

    case "risks":
      return (
        <div className="cards risks">
          {RISKS.map(([art, head, sub]) => (
            <div key={head} className="card risk">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={art} alt="" />
              <b>{head}</b>
              <small>{sub}</small>
              {slide.safe && <span className="stamp good">stopped</span>}
            </div>
          ))}
        </div>
      );

    case "scenarios":
      return (
        <div className="cards risks">
          {SCENARIOS.map(([art, line]) => (
            <div key={line} className="card risk">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={art} alt="" />
              <small className="big-s">{line}</small>
            </div>
          ))}
        </div>
      );

    case "meet":
      return (
        <div className="cards meet">
          {MEET.map(([art, name, role]) => (
            <div key={name} className="card who">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={art} alt="" />
              <b>{name}</b>
              <small>{role}</small>
            </div>
          ))}
        </div>
      );

    /* the two halves of a team: people you name, and a number that never
       sleeps. The number is the centre's to supply, never ours. */
    case "team":
      return (
        <div className="cards">
          <div className="card risk">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ART.team} alt="" />
            <b>Grown-ups you name</b>
            <small>a parent, a teacher, a grandparent, an aunt</small>
          </div>
          <div className="card risk gold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ART.mail} alt="" />
            <b>{pack.helpline?.label}</b>
            <Html as="small" html={pack.helpline?.note ?? ""} />
          </div>
        </div>
      );

    case "protocol":
      return (
        <div className="cards risks">
          {PROTOCOL.map(([n, head, sub]) => (
            <div key={n} className="card risk step">
              <span className="stepno">{n}</span>
              <b>{head}</b>
              <small>{sub}</small>
            </div>
          ))}
        </div>
      );

    case "five":
      return <Wall five={pack.five} />;

    /* slide 14 has just shown all five, so this one shows the single thing it
       is actually about: one password, being changed tonight */
    case "tonight":
      /* eslint-disable-next-line @next/next/no-img-element */
      return <img className="bigicon" src={ART.key} alt="" />;

    case "grad":
      /* eslint-disable-next-line @next/next/no-img-element */
      return <img className="bigicon" src={ART.trophy} alt="" />;

    case "solo":
      /* eslint-disable-next-line @next/next/no-img-element */
      return slide.art ? <img className="bigicon" src={slide.art} alt="" /> : null;

    /* three words they invent, then the three things that go on top. The
       teacher fills the blanks out loud with whatever the class shouts. */
    case "recipe":
      return (
        <div className="tiles">
          <div className="trow">
            <span className="rword">word</span><span className="plus">+</span>
            <span className="rword">word</span><span className="plus">+</span>
            <span className="rword">word</span>
          </div>
          <div className="trow">
            <span className="rthen">then add</span>
            <span className="radd">a Capital</span>
            <span className="radd">a 7</span>
            <span className="radd">a !</span>
          </div>
          <div className="trow">
            <span className="rtest">and now say it back without looking</span>
          </div>
        </div>
      );

    /* countable letter tiles: length stops being an idea and becomes objects */
    case "tiles":
      return (
        <div className="tiles">
          <div className="trow">
            <span className="no">1</span>
            <Tiles word="Tr1cky!" />
            <span className="len"><b>7</b> letters</span>
            {slide.clocks && <span className="clock fast">seconds</span>}
          </div>
          <div className="trow">
            <span className="no">2</span>
            <Tiles word="bananacloudpirate" />
            <span className="len"><b>17</b> letters</span>
            {slide.clocks && <span className="clock slow">centuries</span>}
          </div>
          {slide.clocks && <p className="clocklab">How long a hacker would need to guess it</p>}
        </div>
      );

    /* week 11 has no villain by design, so the pair stand alone */
    case "heroes":
    default:
      return null;
  }
}

/** The mark in the eyebrow that says, at a glance, which kind of slide this
 *  is. `tell` gets none: it is the quiet default. */
const MARK: Record<Slide["kind"], string> = { tell: "", ask: "?", do: "✦" };

export function Board({ slide, pack }: { slide: Slide; pack: Pack }) {
  return (
    <div className="pane">
      <Starfield />
      {slide.scene && CAST[slide.scene]}
      <div className={"inner " + (slide.scene ? CAST_PAD[slide.scene] ?? "" : "")}>
        <div className="fit">
          <div className="eyebrow">
            {MARK[slide.kind] && <span className="mark">{MARK[slide.kind]}</span>}
            <Html html={slide.eyebrow} />
          </div>
          <Html as="h2" className="big" html={slide.title} />
          {slide.under && <Html as="p" className="under" html={slide.under} />}
          <Scene slide={slide} pack={pack} />
        </div>
      </div>
    </div>
  );
}

/* ── the drifting starfield ────────────────────────────────────────────── */

import { useEffect, useRef } from "react";

/** A flat gradient on a projector reads as a broken screen, so the board has a
 *  quiet drifting starfield behind it. Static when the viewer asks for less
 *  motion, and it stops animating the moment the board goes away. */
function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let stars: { x: number; y: number; r: number; a: number; t: number; v: number }[] = [];

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.max(1, r.width * dpr);
      cv.height = Math.max(1, r.height * dpr);
      stars = Array.from({ length: 90 }, () => ({
        x: Math.random(), y: Math.random(), r: (Math.random() * 1.6 + 0.4) * dpr,
        a: Math.random() * 0.5 + 0.2, t: Math.random() * 6.28,
        v: Math.random() * 0.00004 + 0.00001,
      }));
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const s of stars) {
        if (!calm) { s.x -= s.v; if (s.x < 0) s.x = 1; }
        const tw = calm ? 1 : 0.65 + 0.35 * Math.sin(s.t + now * 0.0012);
        ctx.fillStyle = "rgba(200,220,255," + (s.a * tw).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(s.x * cv.width, s.y * cv.height, s.r, 0, 6.2832);
        ctx.fill();
      }
      if (!calm) raf = requestAnimationFrame(draw);
    };

    size();
    draw(0);
    const ro = new ResizeObserver(() => { size(); if (calm) draw(0); });
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="stars" aria-hidden="true" />;
}
