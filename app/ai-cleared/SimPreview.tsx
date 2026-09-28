"use client";

import Simulator from "./sims";
import type { Tool } from "./engine/types";
import type { SimTier } from "./sims/types";

/* A read-only compact simulator window for the outer pages. Client-side so
 * a server component can place it without passing handlers across. */
export default function SimPreview({ tool = "copilot", tier = "enterprise", firmName, learnerName }: { tool?: Tool; tier?: SimTier; firmName: string; learnerName: string }) {
  return <Simulator tool={tool} tier={tier} compact firmName={firmName} learnerName={learnerName} messages={[]} draft="" onSend={() => {}} canSend={false} />;
}
