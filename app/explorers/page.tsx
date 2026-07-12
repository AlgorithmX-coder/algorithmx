"use client";

/**
 * /explorers — Cyber Explorers entry. Currently runs Mission 01 through
 * the mission engine (the vertical slice). The original static art-
 * direction proof of concept lives on at /explorers/poc.
 */

import MissionRuntime from "./engine/MissionRuntime";
import { mission01 } from "./missions/mission01";

export default function ExplorersPage() {
  return <MissionRuntime manifest={mission01} />;
}
