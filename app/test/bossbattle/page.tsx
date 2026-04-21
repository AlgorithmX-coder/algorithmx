"use client";

import BossBattle from "@/app/components/game/BossBattle";

export default function TestBoss() {
  return (
    <BossBattle onEnd={(won, stats) => console.log("Game ended:", won, stats)} />
  );
}
