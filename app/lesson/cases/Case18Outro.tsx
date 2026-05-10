"use client";

import OutroScene from "@/app/components/game/OutroScene";
import FullScene from "@/app/lesson/cases/FullScene";

/**
 * Case 18 - Outro video + "next week" teaser.
 *
 * The outro video is preferred but the parent player may pass
 * `videoSrc={null}` to force the fallback image (e.g. when the video
 * fetch errored at runtime).
 */

export interface Case18OutroProps {
  childName: string;
  totalCoins: number;
  nextWeekTitle: string;
  videoSrc: string | null;
  fallbackImageSrc: string;
  onBackToDashboard: () => void;
  onPlayAgain: () => void;
}

export default function Case18Outro({
  childName,
  totalCoins,
  nextWeekTitle,
  videoSrc,
  fallbackImageSrc,
  onBackToDashboard,
  onPlayAgain,
}: Case18OutroProps) {
  return (
    <FullScene bg="linear-gradient(180deg, #0f1530 0%, #04050d 100%)">
      <OutroScene
        childName={childName}
        totalCoins={totalCoins}
        nextWeekTitle={nextWeekTitle}
        videoSrc={videoSrc}
        fallbackImageSrc={fallbackImageSrc}
        onBackToDashboard={onBackToDashboard}
        onPlayAgain={onPlayAgain}
      />
    </FullScene>
  );
}
