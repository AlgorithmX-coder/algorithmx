import { TRACKS, type ModuleManifest, type TrackBlock } from "@/app/ai-cleared/engine/types";

/* Cyber Awareness is the same for every desk: a phishing email does not
 * care whether it lands in Finance or HR. AI Fluent gets the same effect
 * by authoring a General block that resolveTrack falls back to; here the
 * one block is set on every track explicitly, so a learner on any desk
 * (General included) plays exactly the same module, and nothing depends
 * on the fallback order. */
export function everyDesk(block: TrackBlock): ModuleManifest["tracks"] {
  return Object.fromEntries(TRACKS.map((t) => [t, block])) as ModuleManifest["tracks"];
}
