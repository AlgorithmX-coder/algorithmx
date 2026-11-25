"use client";

/**
 * /explorers — Cyber Explorers entry: the MISSION MAP as a neon cyber
 * terminal. Multi-colour matrix rain + CRT chrome; each of the 4 clearance
 * blocks owns a neon colour (cyan / pink / amber / violet) so the page has
 * real colour variety for a young-teen audience while staying a cool hacker
 * terminal. Every case is playable in any order.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import MissionRuntime from "./engine/MissionRuntime";
import PhoneRuntime from "./phone/PhoneRuntime";
import { case06Phone } from "./phone/case06";
import { case07Phone } from "./phone/case07";
import { case08Phone } from "./phone/case08";
import { case09Phone } from "./phone/case09";
import { case10Phone } from "./phone/case10";
import type { PhoneCase } from "./phone/case06";
import ConsoleRuntime from "./console/ConsoleRuntime";
import { case11Console } from "./console/case11";
import { case12Console } from "./console/case12";
import { case13Console } from "./console/case13";
import { case14Console } from "./console/case14";
import { case15Console } from "./console/case15";
import type { ConsoleCase } from "./console/case11";
import WarRoomRuntime from "./warroom/WarRoomRuntime";
import { case16War } from "./warroom/case16";
import { case17War } from "./warroom/case17";
import { case18War } from "./warroom/case18";
import { case19War } from "./warroom/case19";
import { case20War } from "./warroom/case20";
import type { WarCase } from "./warroom/case16";
import BlockIntro from "./phone/BlockIntro";
import { block1Intro, block2Intro, block3Intro, block4Intro } from "./phone/blockIntroData";
import type { BlockIntroData } from "./phone/blockIntroData";
import MissionIntro from "./MissionIntro";
import SignalMissionIntro from "./engine/SignalMissionIntro";
import PhoneMissionIntro from "./phone/PhoneMissionIntro";
import ConsoleMissionIntro from "./console/ConsoleMissionIntro";
import WarRoomMissionIntro from "./warroom/WarRoomMissionIntro";
import { MISSION_INTROS } from "./missionIntroData";
import { useReducedMotion } from "./engine/primitives";
import { MONO } from "./engine/tokens";
import type { AwardEvent, MissionManifest } from "./engine/types";
import { checkpointStorageKey, xpForEvent, XP_RULES } from "./engine/types";
import { getExplorersRank, EXPLORERS_RANKS, type ExplorersRankInfo } from "./engine/rank";
import { getStreak, recordDailyActivity } from "./engine/streak";
import { RankUpMoment } from "./engine/RankUpMoment";
import { ClearanceUpMoment } from "./engine/ClearanceUpMoment";
import { blockBonusXP, hasBlockBonus, awardBlockBonus } from "./engine/blockBonus";
import { resetZeroFile, ZERO_CLUES } from "./engine/zeroFile";
import { VillainGallery } from "./VillainGallery";
import { loadExplorersProgress } from "@/app/lib/explorersProgress.actions";
import { CaseGlyph } from "./CaseGlyphs";
import CourseHomeShell, { CourseHomePause } from "@/app/components/course-home/CourseHomeShell";
import { CourseHomeLockup, ExplorersMark } from "@/app/components/course-home/marks";
import { mission01 } from "./missions/mission01";
import { mission02 } from "./missions/mission02";
import { mission03 } from "./missions/mission03";
import { mission04 } from "./missions/mission04";
import { mission05 } from "./missions/mission05";
import { mission06 } from "./missions/mission06";
import { mission07 } from "./missions/mission07";
import { mission08 } from "./missions/mission08";
import { mission09 } from "./missions/mission09";
import { mission10 } from "./missions/mission10";
import { mission11 } from "./missions/mission11";
import { mission12 } from "./missions/mission12";
import { mission13 } from "./missions/mission13";
import { mission14 } from "./missions/mission14";
import { mission15 } from "./missions/mission15";
import { mission16 } from "./missions/mission16";
import { mission17 } from "./missions/mission17";
import { mission18 } from "./missions/mission18";
import { mission19 } from "./missions/mission19";
import { mission20 } from "./missions/mission20";

const CASES: MissionManifest[] = [
  mission01, mission02, mission03, mission04, mission05,
  mission06, mission07, mission08, mission09, mission10,
  mission11, mission12, mission13, mission14, mission15,
  mission16, mission17, mission18, mission19, mission20,
];

// neon colour per clearance block (young-teen colour variety)
const BLOCKS = [
  { n: 1, name: "SIGNALS", slug: "signals", classification: "CONFIDENTIAL", color: "#34E1FF", blurb: "learn to spot the scam", sev: 2 },
  { n: 2, name: "THE HUMAN FACTOR", slug: "human_factor", classification: "SECRET", color: "#FF5CA8", blurb: "the tricks aimed at people", sev: 3 },
  { n: 3, name: "SYSTEMS", slug: "systems", classification: "TOP SECRET", color: "#FFB23E", blurb: "how the tech really works", sev: 4 },
  { n: 4, name: "THE LONG GAME", slug: "long_game", classification: "ULTRA", color: "#B98BFF", blurb: "the big picture, and the mastermind", sev: 5 },
] as const;

/** Plain-English gloss under each case's technique title. */
const TOPICS: Record<string, string> = {
  "explorers-m01": "spot the fake message",
  "explorers-m02": "too-good-to-be-true scams",
  "explorers-m03": "how passwords fall",
  "explorers-m04": "your public data trail",
  "explorers-m05": "targeted attacks",
  "explorers-m06": "manipulation tactics",
  "explorers-m07": "hijacked accounts",
  "explorers-m08": "fake online identities",
  "explorers-m09": "the slow trust trap",
  "explorers-m10": "voice-clone calls",
  "explorers-m11": "lock every account",
  "explorers-m12": "wi-fi eavesdropping",
  "explorers-m13": "stolen logins & side doors",
  "explorers-m14": "malware in disguise",
  "explorers-m15": "fake look-alike sites",
  "explorers-m16": "who buys your data",
  "explorers-m17": "faked images & media",
  "explorers-m18": "cybercrime & the choice",
  "explorers-m19": "the full attack, end to end",
  "explorers-m20": "unmask the coordinator",
};

// Page-level block-intro slides (ATLAS briefings), shown once when a kid opens
// the FIRST case of a block. Block 2 self-briefs inside the phone, so it's not
// listed here.
const BLOCK_INTROS: Record<number, BlockIntroData> = { 1: block1Intro, 2: block2Intro, 3: block3Intro, 4: block4Intro };

// Block 2 cases run in THE PHONE (not the Signal Room engine), one PhoneCase each.
const PHONE_CASES: Record<string, PhoneCase> = {
  "explorers-m06": case06Phone,
  "explorers-m07": case07Phone,
  "explorers-m08": case08Phone,
  "explorers-m09": case09Phone,
  "explorers-m10": case10Phone,
};

// Block 3 cases run in THE CONSOLE (an amber control panel), one ConsoleCase each.
const CONSOLE_CASES: Record<string, ConsoleCase> = {
  "explorers-m11": case11Console,
  "explorers-m12": case12Console,
  "explorers-m13": case13Console,
  "explorers-m14": case14Console,
  "explorers-m15": case15Console,
};

// Block 4 cases run in THE WAR ROOM (a violet evidence board), one WarCase each.
const WAR_CASES: Record<string, WarCase> = {
  "explorers-m16": case16War,
  "explorers-m17": case17War,
  "explorers-m18": case18War,
  "explorers-m19": case19War,
  "explorers-m20": case20War,
};


// the next case (the board itself is styled by app/components/course-home)
const AMBER = "#FFC24B";
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

// The agent ID card's rank badge: a hex security-clearance shield
// (the two-layer clip-path lives in course-home.css, .ch6-hex) with a glyph that
// changes per rank — not just a recoloured icon — so RECRUIT through
// MAVERICK each read as a distinct clearance tier, cybersecurity-styled
// to match the rest of /explorers (hex grids, scan rings, terminal chrome).
const BADGE_STAR = "M12 1.5 14.9 8.6 22.5 9.3 16.7 14.3 18.5 21.8 12 17.8 5.5 21.8 7.3 14.3 1.5 9.3 9.1 8.6Z";
const BADGE_SPECIALIST_RAY = "M12 0l1 2.4-1 1-1-1Z";

/** Per-rank clearance glyph — RECRUIT (bare access) through MAVERICK
 * (elite, winged) escalate in visual complexity so the rank reads from
 * the icon alone, not just the badge colour. */
function RankGlyph({ name, size, color }: { name: string; size: number; color: string }) {
  switch (name) {
    case "RECRUIT":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "relative" }}>
          <path d="M7 15l5-4 5 4" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "OPERATIVE":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ position: "relative" }}>
          <path d={BADGE_STAR} />
        </svg>
      );
    case "TRACKER":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "relative" }}>
          <circle cx={12} cy={12} r={7.2} fill="none" stroke={color} strokeWidth={1.6} />
          <path d="M12 5.6v3M12 15.4v3M5.6 12h3M15.4 12h3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
          <circle cx={12} cy={12} r={1.4} fill={color} />
        </svg>
      );
    case "ANALYST":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "relative" }}>
          <path d="M2 12s4-6.4 10-6.4S22 12 22 12s-4 6.4-10 6.4S2 12 2 12Z" fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
          <circle cx={12} cy={12} r={3} fill={color} />
        </svg>
      );
    case "SPECIALIST":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ position: "relative" }}>
          <path d="M12 3 13.8 8 19 8.8 15 12.2 16.2 17.4 12 14.6 7.8 17.4 9 12.2 5 8.8 10.2 8Z" />
          <path d={BADGE_SPECIALIST_RAY} />
          <g transform="rotate(90 12 12)"><path d={BADGE_SPECIALIST_RAY} /></g>
          <g transform="rotate(180 12 12)"><path d={BADGE_SPECIALIST_RAY} /></g>
          <g transform="rotate(270 12 12)"><path d={BADGE_SPECIALIST_RAY} /></g>
        </svg>
      );
    default: // MAVERICK
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ position: "relative" }}>
          <path d="M1 13.5c1.8-6 6.6-8.4 9-6.6-3 1.3-5.6 4.3-5.9 9.1-1.1 1-2.2.3-3.1-2.5Z" opacity={0.92} />
          <path d="M23 13.5c-1.8-6-6.6-8.4-9-6.6 3 1.3 5.6 4.3 5.9 9.1 1.1 1 2.2.3 3.1-2.5Z" opacity={0.92} />
          <g transform="translate(12 12) scale(0.46) translate(-12 -12)"><path d={BADGE_STAR} /></g>
        </svg>
      );
  }
}


export default function ExplorersPage() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<MissionManifest | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [totalXp, setTotalXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [rankUp, setRankUp] = useState<{ from: ExplorersRankInfo; to: ExplorersRankInfo } | null>(null);
  // Blocks whose clearance-upgrade moment has already fired — read from
  // localStorage in an effect (never in the initializer: this component's
  // first render can run server-side, where localStorage doesn't exist) so
  // a reload never replays it.
  const [clearanceSeen, setClearanceSeen] = useState<Set<number>>(() => new Set());
  useEffect(() => { setClearanceSeen(new Set([3, 4].filter((b) => hasBlockBonus(b)))); }, []);
  const [showWatchlist, setShowWatchlist] = useState(false);
  // Which case (if any) the dev deep-link jumped straight to the boss on. Scoped
  // to that one case so Next-case navigation always starts the next mission fresh.
  const [devBossId, setDevBossId] = useState<string | null>(null);
  const [devAt, setDevAt] = useState<string | null>(null); // "boss" | "test"
  // When true, show the block-intro (ATLAS) slide before the active case's runtime.
  const [showBrief, setShowBrief] = useState(false);
  // When true, show the per-MISSION ATLAS briefing before the active case's
  // runtime — every one of the 20 cases gets this, not just block openers
  // (owner: "every single mission I start, I should see that screen").
  const [showMissionBrief, setShowMissionBrief] = useState(false);
  // Tester unlock, DEVELOPMENT BUILDS ONLY. Visit ?qa=1 once to persist it
  // (this browser only): it unlocks every case on the map, the end-of-case
  // shortcuts (engine/arrowAdvance.tsx) and the Zero File reset; ?qa=0 clears
  // it. Owner 2026-11-25: no tester shortcuts for customers, so a production
  // build ignores ?qa and clears any flag a browser kept from before.
  // Starts false and is set in an effect (never in the initializer) so the
  // server + first client render agree, otherwise the lock state hydration-
  // mismatches. Mirrors how `status` is read below.
  const [qa, setQa] = useState(false);
  // Set when /explorers?clues=0 has just emptied the Zero File, so the tester
  // gets an on-screen confirmation rather than having to take it on trust
  // (Abdullah, UAT, 27 October 2026 - see resetZeroFile).
  const [cluesReset, setCluesReset] = useState(false);
  useEffect(() => {
    try {
      if (process.env.NODE_ENV === "production") { localStorage.removeItem("explorers:qa"); return; }
      const p = new URLSearchParams(window.location.search);
      let on = localStorage.getItem("explorers:qa") === "1";
      if (p.get("qa") === "1") { localStorage.setItem("explorers:qa", "1"); on = true; }
      else if (p.get("qa") === "0") { localStorage.removeItem("explorers:qa"); on = false; }
      setQa(on);
      // Behind the same unlock as the ?case= deep-link below: a tester's tool,
      // never something a child can trip over by typing in the address bar.
      if (on && p.get("clues") === "0") { resetZeroFile(); setCluesReset(true); }
    } catch {}
  }, []);

  const firstIdOfBlock = useCallback((block: number) => CASES.find((m) => m.block === block)?.id, []);
  // Open a case, briefing the block first if this is the block's opening case.
  const openCase = useCallback((m: MissionManifest) => {
    setActive(m);
    setShowBrief(!!BLOCK_INTROS[m.block] && firstIdOfBlock(m.block) === m.id);
    setShowMissionBrief(!!MISSION_INTROS[m.id]);
  }, [firstIdOfBlock]);

  const refreshStatus = useCallback(() => {
    const s: Record<string, string> = {};
    let xp = 0;
    for (const m of CASES) {
      try {
        const raw = localStorage.getItem(checkpointStorageKey(m.id));
        if (raw) {
          const cp = JSON.parse(raw) as { pos?: { beat?: string }; events?: AwardEvent[] };
          s[m.id] = cp.pos?.beat === "closed" ? "CLOSED" : "IN PROGRESS";
          for (const e of cp.events ?? []) xp += xpForEvent(e);
        }
      } catch {}
    }
    setStatus(s);
    xp += blockBonusXP();
    setTotalXp(xp);
    setStreak(getStreak().count);
    // Real new progress since the last visit (not just reopening the board)
    // is what counts a day toward the streak and can trigger a rank-up.
    try {
      const lastKnown = Number(localStorage.getItem("explorers:lastKnownXP") ?? 0);
      if (xp > lastKnown) {
        setStreak(recordDailyActivity().count);
        const before = getExplorersRank(lastKnown).current;
        const after = getExplorersRank(xp).current;
        if (after.name !== before.name) setRankUp({ from: before, to: after });
        localStorage.setItem("explorers:lastKnownXP", String(xp));
      }
    } catch {}
  }, []);

  // Re-read on mount and whenever we return from a mission, so a just-closed
  // case shows as CLOSED (with its stamp) the moment you're back on the map.
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Merge account-synced progress on top of the local read: a case finished on
  // another device shows CLOSED (and unlocks the next) here too. Additive and
  // best-effort — never clears a locally-known status; no-ops when signed out.
  useEffect(() => {
    let alive = true;
    loadExplorersProgress()
      .then((prog) => {
        if (!alive) return;
        setStatus((prev) => {
          const next = { ...prev };
          for (const m of CASES) {
            const n = parseInt(m.caseNumber.replace(/\D/g, ""), 10);
            const p = prog.byCase[n];
            if (p?.completed) next[m.id] = "CLOSED";
            else if (p && next[m.id] == null) next[m.id] = "IN PROGRESS";
          }
          return next;
        });
        if (prog.totalXp > 0) setTotalXp((x) => Math.max(x, prog.totalXp));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Deep link: /explorers?case=16 opens that case; &at=boss jumps to the boss;
  // &at=test jumps straight to the end-of-case test. Development builds only:
  // on production a child could otherwise skip straight to any boss.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const p = new URLSearchParams(window.location.search);
    const c = p.get("case");
    if (!c) return;
    const found = CASES.find((m) => m.id === `explorers-m${c.padStart(2, "0")}`);
    if (found) {
      const at = p.get("at");
      setActive(found);
      setDevBossId(at === "boss" || at === "test" ? found.id : null);
      setDevAt(at);
      // Brief the block on a cold deep-link to its opening case (unless jumping to boss/test).
      setShowBrief(!at && !!BLOCK_INTROS[found.block] && CASES.find((m) => m.block === found.block)?.id === found.id);
      setShowMissionBrief(!at && !!MISSION_INTROS[found.id]);
    }
  }, [qa]);

  const closedCount = useMemo(() => CASES.filter((m) => status[m.id] === "CLOSED").length, [status]);
  const nextCase = useMemo(() => CASES.find((m) => status[m.id] !== "CLOSED") ?? null, [status]);
  // Chronological gate: the only playable case is the first unsolved one. Every
  // case after it is locked until the case before it is closed (in order).
  const nextIdx = nextCase ? CASES.indexOf(nextCase) : CASES.length;

  const blockStats = BLOCKS.map((b) => {
    const cases = CASES.filter((m) => m.block === b.n);
    const closed = cases.filter((m) => status[m.id] === "CLOSED").length;
    return { ...b, cases, closed, total: cases.length, done: closed > 0 && closed === cases.length };
  });
  const rank = useMemo(() => getExplorersRank(totalXp), [totalXp]);
  // Every rank already reached (not the current one — that one's the big
  // badge in the ring) stays pinned in the card's background like a trophy
  // case, so the card visibly fills up as the agent ranks up over the
  // course of the 20 cases, instead of resetting to a blank slate each time.
  const earnedBadges = useMemo(
    () => EXPLORERS_RANKS.filter((r) => r.minXP <= totalXp && r.name !== rank.current.name),
    [totalXp, rank.current.name],
  );

  if (active) {
    const activeIdx = CASES.findIndex((m) => m.id === active.id);
    const hasNext = activeIdx >= 0 && activeIdx < CASES.length - 1;
    // The block-intro (ATLAS) slide plays before the block's opening case.
    const pageIntro = BLOCK_INTROS[active.block];
    const isBlockOpen = !!pageIntro && showBrief && firstIdOfBlock(active.block) === active.id;
    // Blocks 3 and 4: a clearance-upgrade + XP beat plays before ATLAS,
    // once only (UAT request — "so users understand their role is more
    // important now", structured rank screen -> XP reward -> briefing last).
    if (isBlockOpen && (active.block === 3 || active.block === 4) && !clearanceSeen.has(active.block)) {
      return (
        <ClearanceUpMoment
          from={BLOCK_INTROS[active.block - 1]?.theme.classification ?? null}
          to={pageIntro.theme.classification}
          xp={XP_RULES.BLOCK_ENTERED}
          theme={pageIntro.theme}
          reduced={reduced}
          finale={active.block === 4}
          onDone={() => {
            awardBlockBonus(active.block);
            setClearanceSeen((s) => new Set(s).add(active.block));
            refreshStatus();
          }}
        />
      );
    }
    if (isBlockOpen) {
      return <BlockIntro data={pageIntro} onBegin={() => setShowBrief(false)} />;
    }
    // The per-MISSION ATLAS briefing, all 20 cases. Plays after the block
    // intro (if any) and before the case's own runtime takes over — every
    // case gets this, not just block openers. Chrome is coordinated per
    // block (owner: "based off the theme of the actual interface of the
    // UI, so it looks coordinated") — each block gets its own skin reusing
    // that runtime's own tokens, not one universal template recoloured.
    const missionIntro = MISSION_INTROS[active.id];
    if (missionIntro && showMissionBrief) {
      const onBeginBrief = () => setShowMissionBrief(false);
      if (active.block === 1) return <SignalMissionIntro data={missionIntro} onBegin={onBeginBrief} />;
      if (active.block === 2) return <PhoneMissionIntro data={missionIntro} onBegin={onBeginBrief} />;
      if (active.block === 3) return <ConsoleMissionIntro data={missionIntro} onBegin={onBeginBrief} />;
      if (active.block === 4) return <WarRoomMissionIntro data={missionIntro} onBegin={onBeginBrief} />;
      return <MissionIntro data={missionIntro} onBegin={onBeginBrief} />;
    }
    // Block 2 cases run in THE PHONE, not the Signal Room engine.
    const phoneCase = PHONE_CASES[active.id];
    if (phoneCase) {
      return (
        <PhoneRuntime
          key={active.id}
          phoneCase={phoneCase}
          autostart={!!missionIntro}
          onExit={() => { refreshStatus(); setActive(null); }}
          onNextCase={hasNext ? () => { refreshStatus(); openCase(CASES[activeIdx + 1]); } : undefined}
        />
      );
    }
    // Block 3 cases run in THE CONSOLE.
    const consoleCase = CONSOLE_CASES[active.id];
    if (consoleCase) {
      return (
        <ConsoleRuntime
          key={active.id}
          consoleCase={consoleCase}
          autostart={!!missionIntro}
          onExit={() => { refreshStatus(); setActive(null); }}
          onNextCase={hasNext ? () => { refreshStatus(); openCase(CASES[activeIdx + 1]); } : undefined}
        />
      );
    }
    // Block 4 cases run in THE WAR ROOM.
    const warCase = WAR_CASES[active.id];
    if (warCase) {
      // WarRoomRuntime's own render is an early return inside this `if
      // (active)` block, same as every branch above — the page's normal
      // `showWatchlist && <VillainGallery>` (below, outside this block)
      // never reaches render for any of them. Case 20's boss needs the
      // Watchlist reachable from its own "who is it" screen (UAT), so this
      // one branch carries its own overlay instead of restructuring every
      // branch's return just to share the one at the bottom of the page.
      return (
        <>
          <WarRoomRuntime
            key={active.id}
            warCase={warCase}
            autostart={!!missionIntro}
            onExit={() => { refreshStatus(); setActive(null); }}
            onNextCase={hasNext ? () => { refreshStatus(); openCase(CASES[activeIdx + 1]); } : undefined}
            onOpenWatchlist={() => setShowWatchlist(true)}
          />
          {showWatchlist && (
            <VillainGallery
              cases={CASES}
              status={status}
              onOpenCase={(id) => {
                setShowWatchlist(false);
                const m = CASES.find((c) => c.id === id);
                if (m) openCase(m);
              }}
              onClose={() => setShowWatchlist(false)}
            />
          )}
        </>
      );
    }
    return (
      <MissionRuntime
        key={active.id}
        manifest={active}
        devStartBeat={active.id === devBossId ? (devAt === "test" ? "catch" : "incident") : undefined}
        autostart={!!missionIntro}
        onExit={() => {
          refreshStatus();
          setActive(null);
        }}
        onNextCase={
          hasNext
            ? () => {
                refreshStatus();
                openCase(CASES[activeIdx + 1]);
              }
            : undefined
        }
      />
    );
  }

  const continueLabel = !nextCase
    ? "ALL CASES SOLVED"
    : status[nextCase.id] === "IN PROGRESS"
      ? `CONTINUE · ${nextCase.caseNumber}`
      : closedCount === 0
        ? `START · ${nextCase.caseNumber}`
        : `NEXT · ${nextCase.caseNumber}`;

  /* The first screen (landing lab round 6, homes-a explorers v1): a RESUME
   * plate for the next case, the big CONTINUE, the Watchlist and a 20-case
   * tape, with the Agent ID card beside it. Every value is the agent's own
   * (status, XP, streak, rank); nothing here is sample data. */
  const nb = nextCase ? blockStats[nextCase.block - 1] : null;
  const nextAccent = nextCase ? MISSION_INTROS[nextCase.id]?.theme.accent ?? nb?.color ?? AMBER : AMBER;
  const lastClosed = nextIdx > 0 && status[CASES[nextIdx - 1].id] === "CLOSED" ? CASES[nextIdx - 1] : null;
  const rankPct = Math.round(rank.progress * 100);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const hex = (name: string, colour: string, s: number, g: number) => (
    <span className="ch6-hex" style={{ "--rank": colour, width: s, height: s } as CSSVars} aria-hidden="true">
      <span className="h1" /><span className="h2" /><RankGlyph name={name} size={g} color={colour} />
    </span>
  );

  return (
    <>
      {cluesReset && (
        <button
          onClick={() => setCluesReset(false)}
          style={{
            position: "fixed",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 90,
            maxWidth: "calc(100vw - 28px)",
            textAlign: "left",
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: 1.45,
            color: "#E4D4D4",
            background: "linear-gradient(180deg,#1c0f10,#120a0b)",
            border: "1px solid rgba(255,77,77,0.5)",
            borderLeft: "3px solid #FF4D4D",
            borderRadius: 8,
            padding: "10px 14px",
            boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
            cursor: "pointer",
          }}
        >
          <span style={{ color: "#FF8080", fontWeight: 700, letterSpacing: ".1em", fontSize: 10 }}>
            ZERO FILE CLEARED
          </span>
          <br />
          0 of {ZERO_CLUES.length} clues. Replay a Block 4 case and the new-clue
          pop-up fires again. Your cases, xp and rank are untouched. Tap to close.
        </button>
      )}

      {rankUp && <RankUpMoment from={rankUp.from} to={rankUp.to} reduced={reduced} onDone={() => setRankUp(null)} />}
      {showWatchlist && (
        <VillainGallery
          cases={CASES}
          status={status}
          onOpenCase={(id) => {
            setShowWatchlist(false);
            const m = CASES.find((c) => c.id === id);
            if (m) openCase(m);
          }}
          onClose={() => setShowWatchlist(false)}
        />
      )}

      {/* the overlays sit outside the board shell so its scoped styles never reach them */}
      <CourseHomeShell course="explorers">
        <header className="ch6-chrome wrap" data-rise style={{ "--i": 0 } as CSSVars}>
          <CourseHomeLockup mark={<ExplorersMark />} lead="CYBER" accent="EXPLORERS" label="Cyber Explorers by AlgorithmX" />
          <div className="ch6-chrome-r">
            <span className="ch6-who"><i className="dot" aria-hidden="true" /><span className="hide">Agent ·&nbsp;</span><b>{rank.current.name}</b></span>
            <CourseHomePause />
          </div>
        </header>

        <main className="ch6-main wrap" id="main">
          <section className="ch6-now" aria-labelledby="ch6-h1">
            <div className="ch6-console" data-rise style={{ "--i": 1 } as CSSVars}>
              <i className="ch6-corner tl" aria-hidden="true" /><i className="ch6-corner tr" aria-hidden="true" /><i className="ch6-corner bl" aria-hidden="true" /><i className="ch6-corner br" aria-hidden="true" />
              <div className="ch6-tbar">
                <span className="tdot" style={{ background: "#ff5f56" }} /><span className="tdot" style={{ background: "#ffbd2e" }} /><span className="tdot" style={{ background: "#27c93f" }} />
                <span className="tname">ARC · MISSION BOARD</span>
                <span className="tstat"><i aria-hidden="true" />SECURE · ENCRYPTED</span>
              </div>
              <div className="ch6-grid">
                <div>
                  <div className="ch6-eyebrow" data-rise style={{ "--i": 2 } as CSSVars}>AGENT, YOUR MISSIONS<span className="cur" aria-hidden="true" /></div>
                  <h1 className="ch6-h1" id="ch6-h1" data-rise style={{ "--i": 3 } as CSSVars}>PICK YOUR CASE, <b>AGENT</b></h1>
                  {nextCase && nb && (
                    <div className="ch6-next" style={{ "--nx": "var(--amber)", "--i": 4 } as CSSVars} data-rise>
                      <div className="ch6-next-head">
                        <span className="ch6-chip live"><i aria-hidden="true" />{status[nextCase.id] === "IN PROGRESS" ? "RESUME" : "PLAY"}</span>
                        <span style={{ color: "var(--amber)" }}>{nextCase.caseNumber}</span>
                        <span className="ch6-chip c" style={{ "--c": nb.color } as CSSVars}>[{pad2(nb.n)}] {nb.name}</span>
                        <span className="ch6-chip c" style={{ "--c": nb.color } as CSSVars}>{nb.classification}</span>
                      </div>
                      <div className="ch6-next-body">
                        <span className="ch6-glyph" style={{ borderColor: nextAccent, color: nextAccent, boxShadow: `0 0 16px ${nextAccent}55` }}><CaseGlyph id={nextCase.id} size={30} color={nextAccent} /></span>
                        <div style={{ minWidth: 0 }}>
                          <div className="ch6-next-title">{nextCase.title}</div>
                          <div className="ch6-next-sub">{TOPICS[nextCase.id] ?? ""} · Villain: <b>{nextCase.actor.codename}</b></div>
                        </div>
                        <span className="ch6-gauge" style={{ background: `conic-gradient(${nextAccent} ${nb.sev * 20}%,rgba(255,255,255,.12) 0)` }} role="img" aria-label={`Threat level ${nb.sev} of 5`}><i>{nb.sev}/5</i></span>
                      </div>
                      <div className="ch6-next-meta">
                        <span>Block <b>{pad2(nb.n)}</b> · <b>{nb.closed}/{nb.total}</b> closed</span>
                        <span><b>{closedCount}/{CASES.length}</b> cases solved</span>
                        {lastClosed && <span>Last closed: <b>{lastClosed.caseNumber} · {lastClosed.title}</b></span>}
                      </div>
                    </div>
                  )}
                  <div className="ch6-actions" data-rise style={{ "--i": 5 } as CSSVars}>
                    <button className="ch6-cta" type="button" onClick={() => nextCase && openCase(nextCase)} disabled={!nextCase}>
                      {nextCase
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>}
                      {continueLabel}<span className="sheen" aria-hidden="true" />
                    </button>
                    <button className="ch6-ghost" type="button" onClick={() => setShowWatchlist(true)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6Z" /></svg>
                      THE WATCHLIST
                    </button>
                  </div>
                  <div className="ch6-tape" data-rise style={{ "--i": 6 } as CSSVars} role="img" aria-label={`${closedCount} of ${CASES.length} cases closed${nextCase ? `; next is ${nextCase.caseNumber}` : ""}`}>
                    {blockStats.map((b) => (
                      <div className="tb" key={b.n} style={{ "--c": b.color } as CSSVars}>
                        <div className="tl"><span>[{pad2(b.n)}] {b.name}</span><b>{b.closed}/{b.total}</b></div>
                        <div className="td">{b.cases.map((m) => <i key={m.id} className={status[m.id] === "CLOSED" ? "closed" : m.id === nextCase?.id ? "next" : ""} />)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* agent ID card: the badge is the progress ring to the next rank;
                    every rank already passed collects below it */}
                <aside className="ch6-id" style={{ "--rank": rank.current.colour, "--p": rankPct, "--i": 4 } as CSSVars} data-rise aria-label="Agent ID card">
                  <span className="ch6-ring" role="img" aria-label={rank.next ? `${rankPct}% of the way to ${rank.next.name}` : "Max rank reached"}><span className="in">{hex(rank.current.name, rank.current.colour, 48, 20)}</span></span>
                  <div className="ch6-rank">{rank.current.name}</div>
                  <div className="ch6-rank-sub">{rank.next ? `${rank.next.minXP - totalXp} XP TO ${rank.next.name}` : "MAX RANK REACHED"}</div>
                  <div className="ch6-stats">
                    <div className="ch6-stat" style={{ "--sc": "var(--green)" } as CSSVars}><b>{closedCount}<small>/{CASES.length}</small></b><span>CASES</span></div>
                    <div className="ch6-stat" style={{ "--sc": "var(--amber)" } as CSSVars}><b>{totalXp}</b><span>XP</span></div>
                    {streak > 0 && (
                      <div className="ch6-stat" style={{ "--sc": "#FF8A3D" } as CSSVars}><b><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 1-7 1-10z" /></svg>{streak}d</b><span>STREAK</span></div>
                    )}
                  </div>
                  {earnedBadges.length > 0 && (
                    <div className="ch6-prev">
                      <div className="pl">Previous ranks</div>
                      <div className="pr">{earnedBadges.map((r) => <div className="pb" key={r.name}>{hex(r.name, r.colour, 32, 14)}<span style={{ "--rc": r.colour } as CSSVars}>{r.name}</span></div>)}</div>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>

          <section className="ch6-board" aria-label="The mission board">
            {blockStats.map((b) => (
              <section className="ch6-sec" key={b.n} style={{ "--c": b.color, "--i": 0 } as CSSVars} data-reveal aria-labelledby={`ch6-b${b.n}`}>
                <div className="ch6-sech">
                  <span className="no">[{pad2(b.n)}]</span><h2 id={`ch6-b${b.n}`}>{b.name}</h2>
                  <span className="ch6-chip c" style={{ "--c": b.color } as CSSVars}>{b.classification}</span>
                  <span className={`count${b.done ? " done" : ""}`}>[{b.closed}/{b.total} CLOSED]</span>
                </div>
                <div className="ch6-blurb">{b.blurb}</div>
                <div className="ch6-cards">
                  {b.cases.map((m, ci) => {
                    const st = status[m.id];
                    const isClosed = st === "CLOSED";
                    const isNext = nextCase?.id === m.id;
                    const locked = !qa && CASES.indexOf(m) > nextIdx;
                    const active = !isClosed && !locked;
                    // every case carries its own canonical accent (missionIntroData.ts)
                    const caseAccent = MISSION_INTROS[m.id]?.theme.accent ?? b.color;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`ch6-card${isNext ? " next" : ""}${isClosed ? " closed" : ""}${locked ? " locked" : ""}`}
                        onClick={locked ? undefined : () => openCase(m)}
                        disabled={locked}
                        aria-label={`${m.caseNumber}: ${m.title}.${isClosed ? " Closed." : locked ? " Locked. Finish the earlier cases first." : isNext ? " Play next." : ""}`}
                        style={{ "--c": caseAccent, "--ct": caseAccent, "--i": ci } as CSSVars}
                      >
                        {active && (
                          <>
                            <span className="ch6-sweep" aria-hidden="true" />
                            <i className="ch6-brk tl" aria-hidden="true" /><i className="ch6-brk tr" aria-hidden="true" /><i className="ch6-brk bl" aria-hidden="true" /><i className="ch6-brk br" aria-hidden="true" />
                          </>
                        )}
                        {isClosed && <span className="ch6-stamp" aria-hidden="true">Case Closed</span>}
                        {locked && (
                          <>
                            <span className="ch6-lock" aria-hidden="true">
                              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="4" y="10.5" width="16" height="10.5" rx="2.2" stroke="currentColor" strokeWidth="2" fill="rgba(3,6,14,.6)" /><path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" strokeWidth="2" /></svg>
                            </span>
                            <span className="ch6-cipher" data-cipher aria-hidden="true" />
                          </>
                        )}
                        <div className="ch6-cb">
                          <span style={{ color: isNext ? "var(--amber)" : caseAccent }}>{m.caseNumber}</span>
                          {isClosed ? (
                            <span className="st"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg> CLOSED</span>
                          ) : locked ? (
                            <span className="st enc"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2.4" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.4" /></svg> ENCRYPTED</span>
                          ) : isNext ? (
                            <span className="st play">{"●"} {st === "IN PROGRESS" ? "RESUME" : "PLAY"}</span>
                          ) : st === "IN PROGRESS" ? (
                            <span className="st">{"◐"} STARTED</span>
                          ) : (
                            <span className="st open">{"○"} OPEN</span>
                          )}
                        </div>
                        <div className="ch6-cbody">
                          <div className="ch6-crow">
                            <span className="ch6-cglyph"><CaseGlyph id={m.id} size={24} color={isNext ? AMBER : caseAccent} /></span>
                            <span className="ch6-gauge" style={{ background: `conic-gradient(var(--c) ${b.sev * 20}%,rgba(255,255,255,.1) 0)`, margin: 0 }} aria-hidden="true"><i>{b.sev}/5</i></span>
                          </div>
                          <div className="ch6-ct">{m.title}</div>
                          <div className="ch6-ctopic">{TOPICS[m.id] ?? ""}</div>
                          <div className="ch6-cvil">Villain: {m.actor.codename}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
            <p className="ch6-foot"><b>Solve all 20 cases to reach ULTRA rank</b><span className="cur" aria-hidden="true" /></p>
          </section>
        </main>
        <CipherLines />
      </CourseHomeShell>
    </>
  );
}

/* The locked cards' cipher line scrambles a character at a time (as the live
 * encrypted cards do). Filled after mount, so the server HTML and the first
 * client render agree; still under reduced motion, paused with the page. */
const CIPHER = "0123456789ABCDEF%#@&<>=/+$";
function CipherLines() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".ch6 [data-cipher]"));
    const fresh = () => Array.from({ length: 26 }, () => CIPHER[(Math.random() * CIPHER.length) | 0]).join("");
    els.forEach((el) => { el.textContent = fresh(); });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden || document.querySelector(".ch6[data-paused]")) return;
      els.forEach((el) => {
        if (!el.isConnected) return;
        const a = (el.textContent || fresh()).split("");
        a[(Math.random() * a.length) | 0] = CIPHER[(Math.random() * CIPHER.length) | 0];
        el.textContent = a.join("");
      });
    }, 140);
    return () => clearInterval(id);
  });
  return null;
}
