"use client";

import VictoryScene from "@/app/components/game/VictoryScene";
import FullScene from "@/app/lesson/cases/FullScene";

/**
 * Case 16 — "Adam and Layla are Safe" victory beat.
 *
 * One-line wrapper around VictoryScene. Extracted from the
 * 5,400-line LessonPlayer monolith so future polish on this case
 * doesn't require touching that whole file. Sets the pattern for
 * other case extractions.
 */

export interface Case16VictoryProps {
  onContinue: () => void;
}

export default function Case16Victory({ onContinue }: Case16VictoryProps) {
  return (
    // Cyber abyss → midnight gradient. Pulled here from the inline
    // wrapper in LessonPlayer so this case owns its own visual frame.
    <FullScene bg="linear-gradient(180deg, #0f1530 0%, #04050d 100%)">
      <VictoryScene onContinue={onContinue} />
    </FullScene>
  );
}
