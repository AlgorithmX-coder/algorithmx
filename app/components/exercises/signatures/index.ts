import dynamic from "next/dynamic";
import { createElement, type ComponentType } from "react";

/**
 * Per-week SIGNATURE mini-games — one bespoke activity unique to a week (the
 * body-exercise counterpart to each week's bespoke boss). A week's screen uses
 * `{ type: "signature", mechanic: "<key>" }`; DynamicLesson mounts the matching
 * component below and passes `onComplete` to advance. Add a new signature by
 * dropping its component in this folder and registering one line here.
 */
export interface SignatureProps {
  onComplete: () => void;
  /**
   * Optional spoken "here's what to do" instruction (Sarah), authored on the
   * week's signature screen def. Games that own a themed intro render this
   * inside it (a themed InfoNarration: auto-play + Read-aloud + Listen-first
   * gate) so the child hears the task before playing. Colour it to the game's
   * own palette so it never clashes.
   */
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  /**
   * Optional spoken closing payoff (Sarah), read aloud on the game's WIN
   * screen: "well done, now you can do X — carry it into the real world."
   * Games that have a win overlay render this inside it.
   */
  winNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /**
   * The week's theme accent (hex), passed so the game can tint its spoken-
   * instruction block to match the week — keeping one colour per week with no
   * jarring contrasts. Falls back to the game's own colour when absent.
   */
  accent?: string;
  /**
   * Optional first-round WALKTHROUGH (Sarah) for games that support a guided
   * first round with on-screen arrows. `claim`/`evidence` are the two spoken
   * steps. Only the Proof Scale (W15) uses this today; other games ignore it.
   */
  guide?: { speaker?: "adam" | "layla"; claim: string; evidence: string };
}

export const SIGNATURES: Record<string, ComponentType<SignatureProps>> = {
  // Week 1 · Passwords — spin brass dials to compose a strong password.
  tumblerDials: dynamic(() => import("./TumblerDials"), { ssr: false }),
  // Week 2 · Private Info — steer a torch to find & seal info leaks.
  leakTorch: dynamic(() => import("./LeakTorch"), { ssr: false }),
  // Week 3 · Stranger Danger — track your real friend through the mask waltz.
  maskWaltz: dynamic(() => import("./MaskWaltz"), { ssr: false }),
  // Week 5 · Cyberbullying — hold the river stone to starve the mean spark.
  dontFeedTheFire: dynamic(() => import("./DontFeedTheFire"), { ssr: false }),
  // Week 7 · In-Game Spending — pull the truth lever to see the real price.
  truePriceLever: dynamic(() => import("./TruePriceLever"), { ssr: false }),
  // Week 8 · Photos — rub to develop the photo; can't share till you've seen it.
  developingTray: dynamic(() => import("./DevelopingTray"), { ssr: false }),
  // Week 9 · Apps — flip the box to check maker/reviews/permissions.
  flipTheBox: dynamic(() => import("./FlipTheBox"), { ssr: false }),
  // Week 10 · YouTube — climb the ladder out of the autoplay rabbit-hole.
  // The Learn-Loop rebuild is data-driven and reports a score, so its
  // `onComplete(score)` does not fit this registry's score-less `onComplete()`.
  // This adapter keeps the legacy mount compiling and playable on the game's
  // built-in default rungs, and passes the screen's spoken intro and payoff
  // through to the beats that speak them.
  greatClimbOut: dynamic(
    async () => {
      const { default: GreatClimbOut } = await import("./GreatClimbOut");
      function GreatClimbOutSignature({ onComplete, narration, winNarration }: SignatureProps) {
        return createElement(GreatClimbOut, {
          onComplete: () => onComplete(),
          introNarration: narration,
          completeNarration: winNarration,
        });
      }
      GreatClimbOutSignature.displayName = "GreatClimbOutSignature";
      return GreatClimbOutSignature;
    },
    { ssr: false },
  ),
  // Week 4 · Scams — the rigged carnival booth you can't win; spot & close it.
  riggedRingToss: dynamic(() => import("./RiggedRingToss"), { ssr: false }),
  // Week 11 · Emergency — tap-paced breaths, then lift the blame-stones off.
  // Rebuilt to the Learn-Loop standard (data-driven, tap-only, untimed), so its
  // `onComplete(score)` does not fit this registry's score-less `onComplete()`.
  // This adapter keeps the legacy mount compiling and playable on the game's
  // built-in default stones, and passes the screen's spoken intro and payoff
  // through to the beats that speak them.
  calmDownConsole: dynamic(
    async () => {
      const { default: CalmDownConsole } = await import("./CalmDownConsole");
      function CalmDownConsoleSignature({ onComplete, narration, winNarration }: SignatureProps) {
        return createElement(CalmDownConsole, {
          onComplete: () => onComplete(),
          introNarration: narration,
          completeNarration: winNarration,
        });
      }
      CalmDownConsoleSignature.displayName = "CalmDownConsoleSignature";
      return CalmDownConsoleSignature;
    },
    { ssr: false },
  ),
  // Week 12 · Footprint — walk your own trail back and read it like a stranger.
  // Rebuilt to the Learn-Loop standard (data-driven, tap-only, untimed), so its
  // `onComplete(score)` does not fit this registry's score-less `onComplete()`.
  // This adapter keeps the legacy mount compiling and playable on the game's
  // built-in default stretches, and passes the screen's spoken intro and payoff
  // through to the beats that speak them.
  trailPlanner: dynamic(
    async () => {
      const { default: TrailPlanner } = await import("./TrailPlanner");
      function TrailPlannerSignature({ onComplete, narration, winNarration }: SignatureProps) {
        return createElement(TrailPlanner, {
          onComplete: () => onComplete(),
          introNarration: narration,
          completeNarration: winNarration,
        });
      }
      TrailPlannerSignature.displayName = "TrailPlannerSignature";
      return TrailPlannerSignature;
    },
    { ssr: false },
  ),
  // Week 13 · Screen time — trade the finite day-jug across the cups below it.
  // Rebuilt to the Learn-Loop standard (data-driven, tap-only, untimed), so its
  // `onComplete(score)` does not fit this registry's score-less `onComplete()`.
  // This adapter keeps the legacy mount compiling and playable on the game's
  // built-in default pours, and passes the screen's spoken intro and payoff
  // through to the beats that speak them.
  dayJug: dynamic(
    async () => {
      const { default: DayJug } = await import("./DayJug");
      function DayJugSignature({ onComplete, narration, winNarration }: SignatureProps) {
        return createElement(DayJug, {
          onComplete: () => onComplete(),
          introNarration: narration,
          completeNarration: winNarration,
        });
      }
      DayJugSignature.displayName = "DayJugSignature";
      return DayJugSignature;
    },
    { ssr: false },
  ),
  // Week 14 · Smart devices — put each sensing gadget to sleep its own way.
  goodnightGadgets: dynamic(() => import("./GoodnightGadgets"), { ssr: false }),
  // Week 15 · AI — weigh each robot claim against real evidence.
  proofScale: dynamic(() => import("./ProofScale"), { ssr: false }),
  // Week 6 · Safe Sharing — goalkeeper block: high-five badges, deny imposters.
  lobbyKeeper: dynamic(() => import("./LobbyKeeper"), { ssr: false }),
  // Week 16 · QR & Links — hunt your keyring for the sender each door claims.
  // Rebuilt to the Learn-Loop standard (data-driven, tap-only, untimed), so its
  // `onComplete(score)` does not fit this registry's score-less `onComplete()`.
  // This adapter keeps the legacy mount compiling and playable on the game's
  // built-in default keyring and doors, and passes the screen's spoken intro
  // and payoff through to the beats that speak them.
  keyholeCheck: dynamic(
    async () => {
      const { default: KeyholeCheck } = await import("./KeyholeCheck");
      function KeyholeCheckSignature({ onComplete, narration, winNarration }: SignatureProps) {
        return createElement(KeyholeCheck, {
          onComplete: () => onComplete(),
          introNarration: narration,
          completeNarration: winNarration,
        });
      }
      KeyholeCheckSignature.displayName = "KeyholeCheckSignature";
      return KeyholeCheckSignature;
    },
    { ssr: false },
  ),
  // Week 17 · Followers — pick the gold out of a scoop of the Feed river,
  // then tip the pan and watch the rest wash through.
  // Rebuilt to the Learn-Loop standard (data-driven, TAP-ONLY, untimed): the
  // original wanted a wiggle-drag shake, which is a wrist game rather than a
  // thinking game and the one input a six year old on a tablet cannot reliably
  // produce. Its `onComplete(score)` no longer fits this registry's score-less
  // `onComplete()`, so this adapter keeps the legacy mount compiling and
  // playable on the game's built-in fallback scoop, and passes the screen's
  // spoken intro and payoff through to the beats that speak them.
  friendPanner: dynamic(
    async () => {
      const { default: FriendPanner } = await import("./FriendPanner");
      function FriendPannerSignature({ onComplete, narration, winNarration }: SignatureProps) {
        return createElement(FriendPanner, {
          scoops: [],
          onComplete: () => onComplete(),
          introNarration: narration,
          completeNarration: winNarration,
        });
      }
      FriendPannerSignature.displayName = "FriendPannerSignature";
      return FriendPannerSignature;
    },
    { ssr: false },
  ),
  // Week 18 . Shared Devices - close every card off the shared tablet, lock
  // it, then look back when the goblin sneaks one open again.
  // Rebuilt to the Learn-Loop standard (data-driven, TAP-ONLY, untimed): the
  // original wanted a press-and-swipe-down flick, a gesture with a velocity
  // threshold that a six year old on a tablet cannot produce on demand, so a
  // child who could not flick could not finish. Its onComplete(score) no
  // longer fits this registry, so this adapter keeps the legacy mount
  // compiling and playable on the built-in fallback cards.
  logOutFlick: dynamic(
    async () => {
      const { default: LogOutFlick } = await import("./LogOutFlick");
      function LogOutFlickSignature({ onComplete, narration, winNarration }: SignatureProps) {
        return createElement(LogOutFlick, {
          cards: [],
          onComplete: () => onComplete(),
          introNarration: narration,
          completeNarration: winNarration,
        });
      }
      LogOutFlickSignature.displayName = "LogOutFlickSignature";
      return LogOutFlickSignature;
    },
    { ssr: false },
  ),
  // Week 19 . Family Firewall - judge each proposed house rule: does it go in
  // the family quilt, or does it single somebody out?
  // Rebuilt to the Learn-Loop standard (data-driven, TAP-ONLY, untimed) AND
  // RE-VERBED. The original dragged a glowing thread from a defence charm to
  // the family member it fitted: a drag on SVG lines, and a match-the-charm
  // verb that SignBingo and MemoryMatch already spend their whole three-use
  // caps on. It now judges a rule for FAIRNESS, which nothing else does. Its
  // onComplete(score) no longer fits this registry, so this adapter keeps the
  // legacy mount compiling on the built-in fallback rules.
  hearthLoom: dynamic(
    async () => {
      const { default: HearthLoom } = await import("./HearthLoom");
      function HearthLoomSignature({ onComplete, narration, winNarration }: SignatureProps) {
        return createElement(HearthLoom, {
          rules: [],
          onComplete: () => onComplete(),
          introNarration: narration,
          completeNarration: winNarration,
        });
      }
      HearthLoomSignature.displayName = "HearthLoomSignature";
      return HearthLoomSignature;
    },
    { ssr: false },
  ),
  // Week 20 · Graduation — Simon echo of all twenty week emblems.
  encoreOfTwenty: dynamic(() => import("./EncoreOfTwenty"), { ssr: false }),
};
