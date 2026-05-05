"use client";

import { useMemo } from "react";
import PhaserExercise from "./PhaserExercise";
import PhaserMemoryMatch, {
  type PhaserMemoryPair,
} from "./PhaserMemoryMatch";

export interface MemoryMatchPhaserProps {
  pairs?: PhaserMemoryPair[];
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const DEFAULT_PAIRS: PhaserMemoryPair[] = [
  { term: "Strong Password", match: "Tr0pic4l$unR1se!", colour: "#7eff97" },
  { term: "Phishing", match: "A fake email that wants to trick you", colour: "#ff5fb3" },
  { term: "Two-Step Lock", match: "A second check to prove it's you", colour: "#00e5ff" },
  { term: "Firewall", match: "Stops bad stuff getting in", colour: "#3a7bff" },
  { term: "Digital Footprint", match: "Everything you do online", colour: "#7c5cff" },
  { term: "Private Info", match: "Your name, address, phone", colour: "#ff7a59" },
];

export default function MemoryMatchPhaser({
  pairs,
  onComplete,
  onCorrect,
  onWrong,
}: MemoryMatchPhaserProps) {
  const sceneData = useMemo(
    () => ({ pairs: pairs ?? DEFAULT_PAIRS }),
    [pairs],
  );
  const callbacks = useMemo(
    () => ({ onComplete, onCorrect, onWrong }),
    [onComplete, onCorrect, onWrong],
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 600,
        position: "relative",
      }}
    >
      <PhaserExercise
        Scene={PhaserMemoryMatch}
        sceneData={sceneData}
        callbacks={callbacks}
      />
    </div>
  );
}
