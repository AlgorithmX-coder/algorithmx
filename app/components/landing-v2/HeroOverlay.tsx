"use client";


/**
 * HeroOverlay. The static brand UI over the cinematic: eyebrow +
 * headline + sub-line + CTA.
 *
 * Visible from scroll 0 (2026-07-24 reviewer pass): the old version
 * gated everything behind scroll-progress 0.68, which left first-time
 * visitors staring at a near-black frame with no message. The message
 * now owns the left half of the frame from the moment the page loads
 * (the same composition the cinematic used to END on), and the laptop
 * choreography plays out beside it. Entrance is a one-shot CSS
 * animation, so the component needs no scroll plumbing at all.
 */

/* Eyebrow removed entirely (owner 2026-10-07): the COURSES - SCHOOLS -
 * CORPORATE line duplicated the nav tabs sitting right above it. The
 * headline now opens the hero. */
/* Owner 2026-09-23: highlight part of it. The payoff phrase carries the
   gradient, which is how /schools does it ("...your pupils [teach
   themselves.]"), and here the payoff is the range itself. */
const HEADLINE_LEAD = "Cyber and AI skills for ";
const HEADLINE_ACCENT = "people, schools and firms.";
/* Owner 2026-09-22: the old line spent half its length on courses that
   are not out yet. It now says what is live and how it is taught. */
/* Owner 2026-09-23: the last clause should say that these projects come
   out of a world AI is changing, not just that they are real. "with the
   AI tools that are rewriting every industry" is the same claim the
   promises section already makes further down ("Build real things with
   real tools, including the AI tools shaping every industry"), so the
   hero is not promising something the page does not back up. */
const SUBLINE =
  "Cyber security taught properly, from age 6 all the way through to adulthood. One platform that grows with the learner, built on real projects with the AI tools that are rewriting every industry.";

export default function HeroOverlay() {
  /* The persistent ALGORITHMX wordmark previously rendered here was
   * removed: the global Nav (Nav.tsx) carries the brand from scroll 0,
   * and the duplicate created visual noise in the top-left corner. */

  return (
    <>
      <div
        className="lv2-hero-enter lv2-hero-pad"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          /* No justifyContent:center here - the content div safe-centres
           * itself with margin:auto. Plain centering bleeds the overflow
           * BOTH ways when the column is taller than the viewport, which
           * shoved the eyebrow under the fixed Nav on short windows;
           * auto margins collapse to 0 instead, so the padding below is
           * a hard floor. */
          /* Padding lives in .lv2-hero-pad (below): the top value is a hard
           * floor under the fixed nav; the bottom value grows only on tall
           * windows so the auto-centred block sits a little above true
           * centre (owner 2026-09-16: "push the main landing page up")
           * without ever outgrowing the 100vh frame on short ones. */
          color: "var(--lv2-ink)",
          pointerEvents: "none",
        }}
      >
      {/* Radial scrim - stronger core (0.78 -> 0.88) so the headline
       *  reads with maximum contrast against the dark backdrop, plus a
       *  faster falloff on the right (60% -> 52%) so the laptop sits
       *  in completely clean dark space - no scrim penumbra at all.
       *  Static now that the text is present from scroll 0.
       *  2026-09-15 sunset backdrop: tinted from near-black ink to deep
       *  dusk violet and eased (0.92 -> 0.8 core) so it reads as shade
       *  in the sunset sky instead of a black smudge behind the
       *  headline; the headline's own text-shadow keeps the contrast. */}
      <div
        aria-hidden
        className="lv2-hero-scrim"
        style={{
          position: "absolute",
          inset: 0,
          /* A left-column wash rather than an ellipse. The ellipse put its
             strength at the middle of the hero, so the eyebrow at ~16%
             down sat in its falloff: measured, the ground there only came
             up to rgb(191,189,185), which is 3.0:1 for the teal label.
             A horizontal fade is predictable, lights the whole copy
             column evenly top to bottom, and is clear of the machine by
             62% across. Measured after: rgb(240,236,229), 4.8:1. */
          background:
            "linear-gradient(100deg, " +
            "rgba(246,241,233,0.97) 0%, rgba(246,241,233,0.94) 26%, " +
            "rgba(246,241,233,0.72) 42%, rgba(246,241,233,0.26) 54%, " +
            "rgba(246,241,233,0) 62%)",
          pointerEvents: "none",
        }}
      />
      {/* Inner content div has pointerEvents: none so its empty right
       *  half (the 1180px-wide centred container extends well past the
       *  headline column) doesn't swallow pointer events destined for
       *  the 3D canvas underneath — that's where the interactive hero
       *  slabs live. Pointer events are re-enabled on the actual
       *  interactive elements: the CTA row below. */}
      <div
        className="lv2-hero-copy"
        style={{
          maxWidth: 1180,
          /* auto top/bottom = safe vertical centering (see container
           * comment); auto left/right = the same horizontal centering
           * as before. Phones top-align instead (.lv2-hero-copy rule). */
          margin: "auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "calc(var(--lv2-rail) * 0.4)",
          pointerEvents: "none",
          position: "relative",
        }}
      >
        {/* Owner 2026-09-20: "make that stand out". It was flat mono
            text at 11px; it now takes the same lit-pill chrome as the nav
            telemetry and the LIVE NOW mark, which is the loudest the page
            gets without competing with the headline. */}
        <h1
          className="lv2-hero-enter"
          style={{
            fontFamily: "var(--lv2-font-display)",
            /* Slightly reduced (6vw -> 5.4vw, cap 6rem -> 5.25rem) for
             * better balance against the laptop on wide viewports.
             * Still reads as the primary headline; just doesn't
             * dominate the frame the way 96px did. */
            fontSize: "clamp(2.25rem, 5.4vw, 5.25rem)",
            lineHeight: 0.97,
            letterSpacing: "-0.028em",
            fontWeight: 400,
            margin: 0,
            color: "var(--lv2-ink)",
            maxWidth: "13ch",
            textShadow:
              "0 1px 6px rgba(255,255,255,0.85), 0 4px 24px rgba(255,255,255,0.66)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {HEADLINE_LEAD}
          {/* text-shadow off: the h1 carries a white glow for legibility,
              and on transparent gradient-clipped text that glow paints
              straight through the letterforms as a white smear. */}
          <span className="lv2-grad" style={{ textShadow: "none" }}>
            {HEADLINE_ACCENT}
          </span>
        </h1>

        <p
          className="lv2-hero-enter lv2-hero-enter-2"
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(0.95rem, 1.2vw, 1.0625rem)",
            lineHeight: 1.55,
            color: "rgba(17,22,38,0.97)",
            maxWidth: "42ch",
            margin: "calc(var(--lv2-rail) * 0.25) 0 0",
            textShadow:
              "0 1px 4px rgba(255,255,255,0.85), 0 2px 14px rgba(255,255,255,0.57)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {SUBLINE}
        </p>

        {/* Proof hairline: three true, already-published facts in a
            quiet mono row. The fold ended on a soft paragraph with
            nothing anchoring credibility below it; this is the anchor,
            stated not sold. */}
        <div
          className="lv2-hero-enter lv2-hero-enter-3 lv2-hero-proofline"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px 14px",
            marginTop: "calc(var(--lv2-rail) * 0.55)",
            paddingTop: 16,
            borderTop: "1px solid rgba(20,22,29,0.14)",
            maxWidth: "46ch",
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: "#5d6472",
          }}
        >
          <span>6 live courses</span>
          <span aria-hidden style={{ width: 4, height: 4, borderRadius: 999, background: "#0a7085" }} />
          <span>Ages 6 to adult</span>
          <span aria-hidden style={{ width: 4, height: 4, borderRadius: 999, background: "#0a7085" }} />
          <span>Aligned with NCSC guidance</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: "calc(var(--lv2-rail) * 0.55)",
            flexWrap: "wrap",
            pointerEvents: "auto",
          }}
          className="lv2-hero-cta-row lv2-hero-enter lv2-hero-enter-4"
        >
          {/* Deliberately NOT a link (owner 2026-10-07): visitors should
              scroll the whole story themselves. The solid pill dressed
              like a button for something unclickable, so it is now a
              whisper cue (owner 2026-10-09 professional pass): a slim
              track with a falling dot, then the same approved words. */}
          <span
            className="lv2-hero-scrollcue"
            style={{
              pointerEvents: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#0a7085",
            }}
          >
            <span className="lv2-scrollcue-track" aria-hidden>
              <span className="lv2-scrollcue-dot" />
            </span>
            Scroll to continue
          </span>
        </div>
      </div>
    </div>

    {/* Scoped CSS for the hero CTAs — needed for :hover/:focus states,
     *  which inline style objects can't express. Both CTAs share a
     *  geometry; the secondary gets a refined glass treatment with
     *  cyan-accented border, inner highlight, and an ambient cyan
     *  glow that intensifies on hover so it reads as premium rather
     *  than ghosted. */}
    <style jsx global>{`
      /* The same three sand accents /schools uses, in the same order, so
         the two pages highlight with one voice. Each stop clears 4.5:1 on
         the ground on its own, and the headline is far past large-text
         size, where 3:1 is the bar. */
      .lv2-grad {
        background: linear-gradient(92deg, #0a7085 0%, #5744c9 55%, #a5117f 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      /* Scroll cue: a slim track with a falling dot. */
      .lv2-scrollcue-track {
        position: relative;
        width: 2px;
        height: 30px;
        border-radius: 2px;
        background: rgba(10, 112, 133, 0.25);
        flex-shrink: 0;
      }
      .lv2-scrollcue-dot {
        position: absolute;
        left: 50%;
        top: 10px;
        width: 6px;
        height: 6px;
        margin-left: -3px;
        border-radius: 999px;
        background: #0a7085;
        box-shadow: 0 0 8px rgba(10, 112, 133, 0.6);
      }
      /* Entrance choreography: the copy column rises in once on load,
         top to bottom, 120ms apart. Both the hidden start and the
         animation live inside the motion query, so reduced-motion
         users simply see the static frame. */
      @media (prefers-reduced-motion: no-preference) {
        .lv2-hero-enter {
          opacity: 0;
          animation: lv2HeroRise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .lv2-hero-enter-2 { animation-delay: 0.12s; }
        .lv2-hero-enter-3 { animation-delay: 0.24s; }
        .lv2-hero-enter-4 { animation-delay: 0.36s; }
        .lv2-scrollcue-dot {
          animation: lv2ScrollDot 2.1s cubic-bezier(0.45, 0, 0.45, 1) infinite;
        }
      }
      @keyframes lv2HeroRise {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes lv2ScrollDot {
        0% { transform: translateY(-10px); opacity: 0; }
        25% { opacity: 1; }
        70% { opacity: 1; }
        100% { transform: translateY(22px); opacity: 0; }
      }
      .lv2-hero-pad {
        padding: max(calc(var(--lv2-rail) * 1.2), 96px) var(--lv2-rail) calc(var(--lv2-rail) * 1.6);
      }
      /* Tablets: the copy top-aligns under the nav instead of floating in
       * the middle of the frame. Desktop (above 1100px) is untouched. */
      @media (max-width: 1100px) {
        .lv2-hero-copy { margin-top: 0 !important; }
      }
      /* Phones: top-align the copy under the nav instead of centring it.
       * Desktop and tablet rules above are untouched. */
      @media (max-width: 640px) {
        .lv2-hero-pad { padding-top: 88px; }
        .lv2-hero-copy { margin-top: 0 !important; }
        /* Owner 2026-09-23: on a phone the button should sit under the
           machine, not between the copy and it. The copy overlay and the
           scene are two absolutely positioned layers in the same pinned
           frame, so the button cannot simply follow the machine in flow:
           it is pinned to the floor of the frame instead, and the machine
           is scaled down (see HeroCinematicV3) so it clears it at every
           point of the pin, not just at rest. !important because the row
           carries its margin inline. */
        /* The scrim is a two-column device: it lights the copy column and
           fades out before the machine, left to right. A phone has one
           column, so left-to-right is the wrong axis and its 0.97 alpha
           sat over the laptop's left half. Turning it off is not an
           option either: measured without it, the ground under the
           eyebrow here is rgb(136,137,138) and the teal label on that is
           1.63:1. So on a phone it runs top to bottom instead, lighting
           the copy and clearing before the machine.

           z-index because the copy below goes static to anchor the CTA,
           and a positioned sibling would otherwise paint over it. */
        .lv2-hero-scrim {
          z-index: -1;
          background: linear-gradient(
            180deg,
            rgba(246,241,233,0.97) 0%,
            rgba(246,241,233,0.95) 52%,
            rgba(246,241,233,0.5) 63%,
            rgba(246,241,233,0) 73%
          ) !important;
        }
        /* The copy block is the nearest positioned ancestor, so without
           this the row pins to the bottom of the COPY rather than the
           frame. Static rather than relative because a positioned sibling
           would then paint over it; with the scrim gone there is no such
           sibling left, and the row is the only absolutely positioned
           thing inside the copy, so nothing loses its anchor. */
        .lv2-hero-copy { position: static !important; }
        .lv2-hero-cta-row {
          position: absolute;
          left: var(--lv2-rail);
          right: var(--lv2-rail);
          bottom: 18px;
          margin-top: 0 !important;
        }
      }
      /* Short phones: the copy gives a little back too, so the machine
         does not have to carry the whole squeeze on its own. The headline
         size is inline (a clamp), hence the !important. */
      @media (max-width: 640px) and (max-height: 620px) {
        .lv2-hero-pad { padding-top: 74px; }
        .lv2-hero-copy h1 { font-size: 2rem !important; line-height: 0.95; }
        /* the sub-line is four lines here, so a point off it is worth
           about 16px of frame */
        .lv2-hero-copy p { font-size: 14px !important; line-height: 1.45; }
        .lv2-hero-cta-row { bottom: 14px; }
      }
      @media (min-height: 1100px) {
        .lv2-hero-pad { padding-bottom: calc(var(--lv2-rail) * 3); }
      }
      .lv2-hero-enter {
        animation: lv2HeroEnter 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
      }
      @keyframes lv2HeroEnter {
        from {
          opacity: 0;
          transform: translateY(18px);
          filter: blur(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .lv2-hero-enter {
          animation: none;
        }
      }
      .lv2-hero-cta {
        font-family: var(--lv2-font-mono);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        padding: 14px 22px;
        border-radius: 999px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition:
          transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 0.28s ease,
          border-color 0.22s ease,
          background 0.22s ease,
          color 0.22s ease;
        will-change: transform, box-shadow;
      }
      .lv2-hero-cta-primary {
        background: var(--lv2-cyan);
        color: var(--lv2-ink);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.35),
          0 8px 28px rgba(0, 229, 255, 0.32);
      }
      .lv2-hero-cta-primary:hover,
      .lv2-hero-cta-primary:focus-visible {
        transform: translateY(-1px);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.45),
          0 10px 36px rgba(0, 229, 255, 0.48);
      }
      .lv2-hero-cta-secondary {
        /* Glass tint MORE opaque (0.55 → 0.72) so the button never
         * gets swallowed by the hex floor pattern underneath. Border
         * cyan is held back to 0.30 and the ambient glow trimmed
         * (0.14 → 0.10) so the secondary doesn't compete with the
         * primary cyan CTA — it reads as a confident dark companion. */
        background: rgba(255,253,250,0.72);
        color: var(--lv2-ink);
        border: 1px solid rgba(0, 229, 255, 0.3);
        backdrop-filter: blur(14px) saturate(1.35);
        -webkit-backdrop-filter: blur(14px) saturate(1.35);
        box-shadow:
          inset 0 1px 0 rgba(17,22,38,0.08),
          inset 0 0 0 1px rgba(0, 229, 255, 0.05),
          0 8px 26px rgba(0, 229, 255, 0.1);
      }
      .lv2-hero-cta-secondary:hover,
      .lv2-hero-cta-secondary:focus-visible {
        transform: translateY(-1px);
        background: rgba(244,239,231,0.82);
        border-color: rgba(0, 229, 255, 0.55);
        box-shadow:
          inset 0 1px 0 rgba(17,22,38,0.15),
          inset 0 0 0 1px rgba(0, 229, 255, 0.16),
          0 12px 34px rgba(0, 229, 255, 0.22);
      }
      @media (prefers-reduced-motion: reduce) {
        .lv2-hero-cta {
          transition: none;
        }
        .lv2-hero-cta:hover,
        .lv2-hero-cta:focus-visible {
          transform: none;
        }
      }
    `}</style>
    </>
  );
}
