"use client";

import { WEEK_BADGES } from "@/app/lib/progression";

export interface BadgeSlotsProps {
  earnedBadges: string[];
  onBadgeClick?: (weekNumber: number) => void;
}

export default function BadgeSlots({
  earnedBadges,
  onBadgeClick,
}: BadgeSlotsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 14,
        maxWidth: 480,
        margin: "0 auto",
      }}
      className="badge-grid"
    >
      {WEEK_BADGES.map((b, i) => {
        const earned = earnedBadges.includes(b.id);
        const commonStyle = {
          animation: `badgeSlotPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
          animationDelay: `${i * 0.05}s`,
        } as const;
        return earned ? (
          <button
            key={b.id}
            type="button"
            className="bs-slot bs-slot-earned"
            title={`Week ${b.week}: ${b.name}`}
            aria-label={`Week ${b.week}: ${b.name} — earned`}
            onClick={() => onBadgeClick?.(b.week)}
            style={commonStyle}
          >
            <span className="bs-week-num">{b.week}</span>
          </button>
        ) : (
          <div
            key={b.id}
            className="bs-slot bs-slot-locked"
            title={`Week ${b.week}: ${b.name} (locked)`}
            aria-label={`Week ${b.week}: ${b.name} — locked`}
            style={commonStyle}
          >
            <span className="bs-week-num">{b.week}</span>
            <svg
              className="bs-lock"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
        );
      })}

      <style>{`
        @keyframes badgeSlotPop {
          0% { opacity: 0; transform: scale(0.3); }
          60% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .bs-slot {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          padding: 0;
          cursor: default;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .bs-slot .bs-week-num {
          font-size: 18px;
          line-height: 1;
        }
        .bs-slot-earned {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border: 2px solid #fde047;
          color: #1a0f00;
          cursor: pointer;
          box-shadow: 0 0 14px rgba(251,191,36,0.45), 0 4px 10px rgba(0,0,0,0.35);
        }
        .bs-slot-earned:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 22px rgba(251,191,36,0.75), 0 6px 14px rgba(0,0,0,0.4);
        }
        .bs-slot-locked {
          background: #111827;
          border: 2px solid #374151;
          color: #475569;
        }
        .bs-slot-locked .bs-lock {
          position: absolute;
          bottom: 8px;
          right: 8px;
          color: #64748b;
        }
        @media (min-width: 960px) {
          .badge-grid {
            grid-template-columns: repeat(10, 1fr);
            max-width: 880px;
          }
        }
      `}</style>
    </div>
  );
}
