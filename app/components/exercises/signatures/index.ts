import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Per-week SIGNATURE mini-games — one bespoke activity unique to a week (the
 * body-exercise counterpart to each week's bespoke boss). A week's screen uses
 * `{ type: "signature", mechanic: "<key>" }`; DynamicLesson mounts the matching
 * component below and passes `onComplete` to advance. Add a new signature by
 * dropping its component in this folder and registering one line here.
 */
export interface SignatureProps {
  onComplete: () => void;
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
  greatClimbOut: dynamic(() => import("./GreatClimbOut"), { ssr: false }),
};
