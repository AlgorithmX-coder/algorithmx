"use client";

/**
 * Dev-only preview harness for BOSS SIGNATURE mechanics.
 *
 * The real mechanics live INSIDE the boss fight (behind hero-select), which is
 * awkward to reach in automated QA. This route mounts any registered mechanic
 * standalone with stub judge/done so it can be screenshotted and iterated on in
 * isolation. Middleware 404s /dev in production, so this never ships.
 *
 * Usage:  /dev/boss-sig?m=<mechanicKey>[&accent=%23ff4e6a]
 */

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BOSS_SIGNATURES } from "@/app/components/game/bossSignatures";

// useSearchParams() needs a Suspense boundary above it or `next build` fails to
// prerender this route (missing-suspense-with-csr-bailout). The default export
// provides that boundary; the inner component holds the actual preview.
export default function BossSignaturePreviewPage() {
  return (
    <Suspense fallback={null}>
      <BossSignaturePreview />
    </Suspense>
  );
}

function BossSignaturePreview() {
  const params = useSearchParams();
  const mechanic = params?.get("m") ?? "";
  const accent = params?.get("accent") ?? "#ff4e6a";
  const Mechanic = BOSS_SIGNATURES[mechanic];
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const push = (s: string) => setLog((l) => [s, ...l].slice(0, 8));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 30%, #14204a 0%, #070a18 70%)",
        color: "#e7ecff",
        fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, opacity: 0.8 }}>
        BOSS-SIGNATURE PREVIEW · mechanic=<b>{mechanic || "(none — pass ?m=key)"}</b> · accent={accent}
        {done && <span style={{ color: "#7eff97", marginLeft: 10 }}>done() fired ✓</span>}
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 520,
          borderRadius: 20,
          overflow: "hidden",
          border: `1px solid ${accent}55`,
          background: "rgba(9,12,30,0.6)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {Mechanic ? (
          <Mechanic
            config={undefined}
            accent={accent}
            reduce={false}
            judge={(key, wasCorrect, sel, cor) =>
              push(`judge ${key} · ${wasCorrect ? "CORRECT" : "wrong"} (sel ${sel} / cor ${cor})`)
            }
            done={() => {
              setDone(true);
              push("done()");
            }}
          />
        ) : (
          <div style={{ margin: "auto", opacity: 0.7 }}>
            {mechanic ? `No mechanic registered for "${mechanic}".` : "Pass ?m=<mechanicKey>"}
            <div style={{ marginTop: 8, fontSize: 12 }}>
              Registered: {Object.keys(BOSS_SIGNATURES).join(", ") || "(none yet)"}
            </div>
          </div>
        )}
      </div>

      <pre style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, opacity: 0.7, margin: 0, minHeight: 40 }}>
        {log.join("\n")}
      </pre>
    </div>
  );
}
