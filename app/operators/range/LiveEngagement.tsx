"use client";

/* LiveEngagement — the Engagement shell wired to persistence.
 *
 * Wraps the pure <Engagement> (which the /dev + preview routes use without a
 * backend) and, when the learner reaches the report beat, files the module's
 * finding + saves progress/reputation via the fileEngagement server action.
 * The save is fire-and-forget from the UI's point of view — the celebration
 * never waits on the network — but a soft note appears if nothing could be
 * saved (e.g. the family account has no learner profile yet). */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Engagement, { type ModuleDef, C, MONO } from "./Engagement";
import { fileEngagement } from "@/app/lib/opsPortfolio.actions";
import type { OpsSeverity } from "@prisma/client";

const SEVERITY_MAP: Record<string, OpsSeverity> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  critical: "CRITICAL",
};

function toSeverity(display: string): OpsSeverity {
  return SEVERITY_MAP[display.trim().toLowerCase()] ?? "MEDIUM";
}

export default function LiveEngagement({ mod }: { mod: ModuleDef }) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);

  async function persist(callsign: string) {
    try {
      const res = await fileEngagement({
        module: mod.moduleNo,
        callsign,
        rep: mod.rep,
        flag: mod.flag,
        finding: {
          title: mod.finding.title,
          severity: toSeverity(mod.finding.severity),
          cvss: mod.finding.cvss,
          location: mod.finding.where,
          impact: mod.finding.impact,
          fix: mod.finding.fix,
        },
      });
      if (!res.ok) {
        setNote(
          res.reason === "no_learner"
            ? "Heads up — add a learner profile to save this to a portfolio."
            : "Your capture stands, but progress couldn't be saved just now.",
        );
      }
    } catch {
      setNote("Your capture stands, but progress couldn't be saved just now.");
    }
  }

  return (
    <>
      <Engagement mod={mod} onReport={persist} onExit={() => router.push("/operators/portfolio")} />
      {note && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 18,
            transform: "translateX(-50%)",
            maxWidth: 520,
            width: "calc(100% - 32px)",
            padding: "11px 15px",
            borderRadius: 11,
            background: "rgba(232,163,61,0.12)",
            border: `1px solid ${C.amber}66`,
            color: C.ink,
            fontFamily: MONO,
            fontSize: 12.5,
            lineHeight: 1.5,
            textAlign: "center",
            zIndex: 50,
          }}
        >
          {note}
        </div>
      )}
    </>
  );
}
