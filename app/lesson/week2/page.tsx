import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

/**
 * Week 2 lesson route - currently locked.
 *
 * The Week2Player.tsx file in this directory contains in-progress
 * lesson code (cases 0–3 wired, 4+ stubbed). Until those are
 * finished, this route renders a clean "Coming Soon" screen and
 * never mounts the player. That keeps the codebase honest: people
 * who paid for "Cyber Heroes Academy" don't accidentally hit a
 * half-built screen by typing the URL.
 *
 * To go live: import Week2Player here and pass the same props the
 * Week 1 page does once the case stubs are filled in.
 */
export default async function Week2Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{
        background:
          "radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, #080a16 70%, #04050d 100%)",
        color: "#e8edff",
        fontFamily:
          "'Fredoka', 'Nunito', ui-rounded, system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        className="relative max-w-[560px] w-full rounded-3xl text-center"
        style={{
          padding: "44px 36px",
          background: "rgba(15, 21, 48, 0.78)",
          border: "1px solid rgba(0, 229, 255, 0.35)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow:
            "0 0 50px rgba(124, 92, 255, 0.20), 0 24px 50px -16px rgba(8, 10, 22, 0.6)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 14px",
            borderRadius: 999,
            background: "rgba(124, 92, 255, 0.16)",
            border: "1px solid rgba(124, 92, 255, 0.45)",
            color: "#c4b5fd",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          ✦ Week 2 ✦
        </div>

        <h1
          className="text-3xl sm:text-4xl font-black mb-4"
          style={{
            background:
              "linear-gradient(135deg, #00e5ff, #7c5cff, #ff5fb3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          Week 2 launches soon.
        </h1>

        <p
          className="text-base sm:text-lg leading-relaxed mb-8"
          style={{ color: "#c5cdf0" }}
        >
          Adam &amp; Layla are still training for the next mission. Your
          Week 1 progress is saved - keep it fresh until Week 2 unlocks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full font-black"
            style={{
              padding: "13px 28px",
              fontSize: 15,
              background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
              color: "#0a0e22",
              textDecoration: "none",
              boxShadow:
                "0 14px 28px -8px rgba(124,92,255,0.55), 0 0 0 1px rgba(255,235,200,0.40) inset",
              letterSpacing: "0.02em",
            }}
          >
            ← Back to Dashboard
          </Link>
          <Link
            href="/lesson"
            className="inline-flex items-center justify-center rounded-full font-bold"
            style={{
              padding: "13px 24px",
              fontSize: 14,
              background: "rgba(0, 229, 255, 0.08)",
              color: "#7df0ff",
              textDecoration: "none",
              border: "1px solid rgba(0, 229, 255, 0.35)",
              letterSpacing: "0.02em",
            }}
          >
            Replay Week 1
          </Link>
        </div>
      </div>
    </div>
  );
}
