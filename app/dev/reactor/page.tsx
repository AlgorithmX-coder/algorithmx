"use client";

import { useState } from "react";
import { AuthReactorScene, STAGE_LABEL, useAuthReactorProgress } from "@/app/components/auth-reactor";
import type { AuthMachinePhase, AuthMachineState } from "@/app/components/auth-reactor";
import { useDeviceQuality } from "@/app/components/auth-reactor/useDeviceQuality";
import { useReducedMotion } from "@/app/components/auth-reactor/useReducedMotion";

/**
 * /dev/reactor — developer preview/sandbox for the Auth Reactor. NOT linked
 * from the app and excluded from the site gate (middleware ignores /dev). Lets
 * us exercise the full activation sequence (modules 0–6 + each phase) before
 * wiring the reactor into the live signup page.
 */
export default function ReactorPreviewPage() {
  const quality = useDeviceQuality();
  const reducedMotion = useReducedMotion();
  const [modulesOnline, setModulesOnline] = useState(0);
  const [phase, setPhase] = useState<AuthMachinePhase>("idle");

  const state: AuthMachineState = { modulesOnline, focus: null, phase, reducedMotion, quality };
  const { stage } = useAuthReactorProgress(state);

  const phases: AuthMachinePhase[] = ["idle", "armed", "submitting", "success", "error"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#05060d", color: "#e8edff", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <AuthReactorScene state={state} />
      </div>

      {/* dev controls */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 16,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 14,
          borderRadius: 12,
          background: "rgba(10,12,24,0.8)",
          border: "1px solid rgba(150,168,224,0.18)",
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          maxWidth: 320,
        }}
      >
        <div style={{ opacity: 0.7 }}>AUTH REACTOR — DEV PREVIEW</div>
        <div>
          modulesOnline: <b>{modulesOnline}</b> · quality: <b>{quality}</b> · reducedMotion: <b>{String(reducedMotion)}</b>
        </div>
        <div>
          stage: <b>{stage}</b> — {STAGE_LABEL[stage]}
        </div>
        <input type="range" min={0} max={6} step={1} value={modulesOnline} onChange={(e) => setModulesOnline(Number(e.target.value))} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {phases.map((p) => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              style={{
                padding: "5px 9px",
                borderRadius: 7,
                cursor: "pointer",
                border: `1px solid ${phase === p ? "#36dbff" : "rgba(150,168,224,0.25)"}`,
                background: phase === p ? "rgba(54,219,255,0.15)" : "transparent",
                color: "inherit",
                fontFamily: "inherit",
                fontSize: 11,
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div style={{ opacity: 0.5, fontSize: 10 }}>Temporary procedural prototype — not the final GLB.</div>
      </div>
    </div>
  );
}
