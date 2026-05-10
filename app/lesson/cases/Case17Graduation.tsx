"use client";

import GraduationScene from "@/app/components/game/GraduationScene";
import FullScene from "@/app/lesson/cases/FullScene";

/**
 * Case 17 - Certificate / graduation beat.
 *
 * Owns its own star-tier calculation given raw score numbers, so the
 * parent player doesn't have to know the threshold heuristic.
 */

export interface Case17GraduationProps {
  childName: string;
  weekNumber: number;
  weekTitle: string;
  totalCoins: number;
  isMilestoneWeek: boolean;
  /** Total score the child achieved across all exercises this week. */
  totalScore: number;
  /** Maximum possible score across all exercises this week. */
  totalPossible: number;
  onContinue: () => void;
  /** If null, the certificate download button is hidden. */
  onDownloadCertificate?: () => void;
}

export default function Case17Graduation({
  childName,
  weekNumber,
  weekTitle,
  totalCoins,
  isMilestoneWeek,
  totalScore,
  totalPossible,
  onContinue,
  onDownloadCertificate,
}: Case17GraduationProps) {
  // 80%+ → 3 stars, 50%+ → 2 stars, otherwise 1.
  const starsCount: 1 | 2 | 3 =
    totalScore >= totalPossible * 0.8
      ? 3
      : totalScore >= totalPossible * 0.5
        ? 2
        : 1;

  return (
    <FullScene bg="linear-gradient(180deg, #1a2147 0%, #04050d 100%)">
      <GraduationScene
        childName={childName}
        weekNumber={weekNumber}
        weekTitle={weekTitle}
        starsCount={starsCount}
        totalCoins={totalCoins}
        isMilestoneWeek={isMilestoneWeek}
        onContinue={onContinue}
        onDownloadCertificate={onDownloadCertificate}
      />
    </FullScene>
  );
}
