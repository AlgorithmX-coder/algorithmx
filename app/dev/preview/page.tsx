"use client";

/*
 * Dev-only preview harness for lesson cases.
 *
 * Renders any one case in isolation with mock state. No auth, no DB,
 * no LessonPlayer wrapper — just the case's scene component on a clean
 * canvas. Lets us iterate on visual design 10× faster than the full
 * lesson flow (which requires login + walking through prior cases).
 *
 * Usage: /dev/preview?case=1&phase=3
 *
 * As cases get redesigned, extract them into standalone components and
 * register them in the CASES table below.
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MissionBriefScene = dynamic(
  () => import("@/app/components/game/MissionBriefScene"),
  { ssr: false }
);
const WelcomeScene = dynamic(
  () => import("@/app/components/game/WelcomeScene"),
  { ssr: false }
);
const GraduationScene = dynamic(
  () => import("@/app/components/game/GraduationScene"),
  { ssr: false }
);
const VictoryScene = dynamic(
  () => import("@/app/components/game/VictoryScene"),
  { ssr: false }
);
const OutroScene = dynamic(
  () => import("@/app/components/game/OutroScene"),
  { ssr: false }
);

/* ───────────────────────── MOCK DATA ───────────────────────── */

const MOCK_MISSIONS = [
  {
    icon: "🔐",
    text: "Learn what passwords are",
    colour: "#22d3ee",
    glow: "rgba(34,211,238,0.55)",
  },
  {
    icon: "🛡️",
    text: "Build a super strong password",
    colour: "#a78bfa",
    glow: "rgba(167,139,250,0.55)",
  },
  {
    icon: "🦝",
    text: "Defeat the Hacker Raccoon",
    colour: "#f59e0b",
    glow: "rgba(245,158,11,0.6)",
  },
];

/* ───────────────────────── CASE REGISTRY ───────────────────────── */

type CaseEntry = {
  id: number;
  name: string;
  status: "redesigned" | "todo";
  render?: (params: { phase: number; onAccept: () => void }) => React.ReactNode;
};

const CASES: CaseEntry[] = [
  {
    id: 0,
    name: "Video Welcome",
    status: "redesigned",
    render: ({ onAccept }) => <WelcomeScene onContinue={onAccept} />,
  },
  {
    id: 1,
    name: "Mission Brief",
    status: "redesigned",
    render: ({ phase, onAccept }) => (
      <MissionBriefScene
        phase={phase}
        missions={MOCK_MISSIONS}
        onAccept={onAccept}
      />
    ),
  },
  { id: 2, name: "Lock Game", status: "todo" },
  { id: 3, name: "Cyber Scanner", status: "todo" },
  { id: 4, name: "Protect the Data", status: "todo" },
  { id: 5, name: "Cyber Maze", status: "todo" },
  { id: 6, name: "Password Lab", status: "todo" },
  { id: 7, name: "Crack the Code", status: "todo" },
  { id: 8, name: "Memory Match", status: "todo" },
  { id: 9, name: "Conveyor Belt", status: "todo" },
  { id: 10, name: "5 Golden Rules", status: "todo" },
  { id: 11, name: "Firewall Builder", status: "todo" },
  { id: 12, name: "Phishing Explainer", status: "todo" },
  { id: 13, name: "Spam Blaster", status: "todo" },
  { id: 14, name: "Choose Your Path", status: "todo" },
  { id: 15, name: "Boss Battle", status: "todo" },
  {
    id: 16,
    name: "Adam & Layla Safe",
    status: "redesigned",
    render: ({ onAccept }) => <VictoryScene onContinue={onAccept} />,
  },
  {
    id: 17,
    name: "Certificate / Graduation",
    status: "redesigned",
    render: ({ onAccept }) => (
      <GraduationScene
        childName="Asad"
        weekNumber={1}
        weekTitle="Passwords — The Secret Code"
        starsCount={3}
        totalCoins={142}
        isMilestoneWeek={false}
        onContinue={onAccept}
        onDownloadCertificate={() => alert("Download certificate (preview)")}
      />
    ),
  },
  {
    id: 18,
    name: "Outro Video",
    status: "redesigned",
    render: ({ onAccept }) => (
      <OutroScene
        childName="Asad"
        totalCoins={142}
        nextWeekTitle="Private Info: Guard Your Secrets"
        onBackToDashboard={onAccept}
        onPlayAgain={() => alert("Play again (preview)")}
      />
    ),
  },
];

/* ───────────────────────── PAGE ───────────────────────── */

export default function PreviewPage() {
  const [caseId, setCaseId] = useState<number>(1);
  const [phase, setPhase] = useState<number>(3);

  // Sync from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = Number(params.get("case") ?? "1");
    const p = Number(params.get("phase") ?? "3");
    if (Number.isFinite(c)) setCaseId(c);
    if (Number.isFinite(p)) setPhase(p);
  }, []);

  // Push URL changes as state changes (so reload preserves selection)
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("case", String(caseId));
    url.searchParams.set("phase", String(phase));
    window.history.replaceState({}, "", url.toString());
  }, [caseId, phase]);

  const entry = useMemo(() => CASES.find((c) => c.id === caseId), [caseId]);
  const onAccept = () => alert("Accept Mission tapped (preview mode)");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0410",
        color: "#ffe9c8",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar
        cases={CASES}
        caseId={caseId}
        phase={phase}
        onSetCase={setCaseId}
        onSetPhase={setPhase}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ width: "min(96vw, 1100px)" }}>
          {entry?.render ? (
            entry.render({ phase, onAccept })
          ) : (
            <Placeholder caseId={caseId} name={entry?.name ?? "Unknown"} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ───────────────────────── TOOLBAR ───────────────────────── */

function Toolbar({
  cases,
  caseId,
  phase,
  onSetCase,
  onSetPhase,
}: {
  cases: CaseEntry[];
  caseId: number;
  phase: number;
  onSetCase: (id: number) => void;
  onSetPhase: (p: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderBottom: "1px solid rgba(255, 220, 180, 0.15)",
        background: "rgba(20, 8, 24, 0.85)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        href="/"
        style={{
          color: "#ffd58a",
          textDecoration: "none",
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 1,
        }}
      >
        ← AlgorithmX
      </Link>
      <div
        style={{
          width: 1,
          height: 20,
          background: "rgba(255, 220, 180, 0.25)",
          margin: "0 6px",
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 3,
          color: "#ffd58a",
          textTransform: "uppercase",
        }}
      >
        Preview
      </span>

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 12, opacity: 0.7 }}>Phase:</span>
      {[0, 1, 2, 3].map((p) => (
        <button
          key={p}
          onClick={() => onSetPhase(p)}
          style={{
            ...pillBtn,
            ...(phase === p ? pillBtnActive : {}),
          }}
        >
          {p}
        </button>
      ))}

      <div
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 8,
        }}
      >
        {cases.map((c) => (
          <button
            key={c.id}
            onClick={() => onSetCase(c.id)}
            style={{
              ...caseBtn,
              ...(caseId === c.id ? caseBtnActive : {}),
              opacity: c.status === "redesigned" ? 1 : 0.55,
            }}
            title={c.status === "todo" ? "Not yet redesigned" : "Redesigned"}
          >
            <span style={{ fontWeight: 800 }}>{String(c.id).padStart(2, "0")}</span>
            <span style={{ marginLeft: 6, fontSize: 11 }}>{c.name}</span>
            {c.status === "redesigned" && (
              <span style={{ marginLeft: 6, color: "#7adc8a" }}>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const pillBtn: React.CSSProperties = {
  padding: "4px 12px",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "rgba(255, 220, 180, 0.35)",
  borderRadius: 999,
  background: "rgba(50, 20, 35, 0.4)",
  color: "#ffe9c8",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

const pillBtnActive: React.CSSProperties = {
  background: "linear-gradient(135deg, #ffd58a, #ff9b4a)",
  color: "#3a1a06",
  borderColor: "transparent",
};

const caseBtn: React.CSSProperties = {
  padding: "5px 10px",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "rgba(255, 220, 180, 0.2)",
  borderRadius: 8,
  background: "rgba(50, 20, 35, 0.4)",
  color: "#ffe9c8",
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
};

const caseBtnActive: React.CSSProperties = {
  background: "rgba(255, 178, 110, 0.2)",
  borderColor: "rgba(255, 200, 130, 0.7)",
  color: "#fff",
};

/* ───────────────────────── PLACEHOLDER ───────────────────────── */

function Placeholder({ caseId, name }: { caseId: number; name: string }) {
  return (
    <div
      style={{
        height: "min(82vh, 760px)",
        borderRadius: 28,
        border: "2px dashed rgba(255, 220, 180, 0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        color: "rgba(255, 233, 200, 0.5)",
        textAlign: "center",
        padding: 40,
      }}
    >
      <div
        style={{
          fontSize: 64,
          opacity: 0.5,
        }}
      >
        🚧
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#ffe9c8" }}>
        Case {String(caseId).padStart(2, "0")} — {name}
      </div>
      <div style={{ fontSize: 14, maxWidth: 480, lineHeight: 1.5 }}>
        Not yet redesigned. To preview here, extract this case&apos;s scene
        from <code style={{ color: "#ffd58a" }}>app/lesson/LessonPlayer.tsx</code>{" "}
        into a standalone component and register it in{" "}
        <code style={{ color: "#ffd58a" }}>CASES</code> in this file.
      </div>
    </div>
  );
}
