"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Avatar, CameraPicture, Icon, type IconName } from "../office/apps/icons";
import { avatarColour } from "../office/meetings";
import { D, W } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace, shuffle } from "./ui";

/* Module 3 practice: answering invites and finding a free slot, joining
 * a call (Teams and Zoom), the call's controls and the Share tray, chat
 * or email, and turning a meeting into actions. Each is a small
 * look-alike the learner works with their own hands, scored on what they
 * did right first time. A wrong click changes nothing and says why, so no
 * step can become impossible. */

const appWindow: CSSProperties = { border: `1px solid ${W.edge}`, borderRadius: 10, overflow: "hidden", background: W.page, color: W.ink, fontFamily: W.font, boxShadow: W.float, colorScheme: "light" };

function Say({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div role="status" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: ok ? D.goodSoft : D.badSoft, border: `1px solid ${ok ? D.goodEdge : D.badEdge}`, color: D.body, fontSize: 16.5, lineHeight: 1.55 }}>
      {ok ? <Tick /> : <Cross />}
      <div>{children}</div>
    </div>
  );
}

function Job({ children }: { children: ReactNode }) {
  return (
    <div style={{ marginTop: 14, padding: "13px 16px", borderRadius: 14, background: D.accentSoft, border: `1px solid ${D.accentEdge}`, color: D.body, fontSize: 16.5, lineHeight: 1.6 }}>
      <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
      {children}
    </div>
  );
}

function Finished({ children }: { children: ReactNode }) {
  return <Say ok>{children}</Say>;
}

/* After a result, bring it into view: on a phone it lands below the fold. */
function useReveal<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (dep) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [dep]);
  return ref;
}

function TitleStrip({ app, colour, children }: { app: string; colour: string; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 36, padding: "0 12px", background: colour, color: "#fff", fontSize: 14 }}>
      <b>{app}</b>
      {children && <span style={{ opacity: 0.92, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{children}</span>}
    </div>
  );
}

const appBtn = (on = false, colour = W.outlook): CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44, padding: "6px 14px", borderRadius: 6, border: `1px solid ${on ? colour : W.edge}`, background: on ? W.select : W.page, color: W.ink, fontFamily: W.font, fontSize: 15, fontWeight: on ? 700 : 500, cursor: "pointer" });

/* ================================================================== */
/* Lesson 1: answer four invites, then find the free slot.             */
/* ================================================================== */

type Answer = "Accept" | "Tentative" | "Decline" | "Propose new time";

interface InviteStep {
  from: string;
  title: string;
  day: string;
  time: string;
  where: string;
  note: string;
  /* your calendar that day: [start, end, title] in hours */
  mine: [number, number, string][];
  meeting: [number, number];
  right: Answer;
  why: Record<Answer, string>;
  /* for Propose: times to offer, and which one is free */
  offers?: { label: string; free: boolean; why: string }[];
}

const INVITES: InviteStep[] = [
  {
    from: "Priya Shah",
    title: "Invoice check",
    day: "Tuesday 10 November",
    time: "11:00 to 11:30",
    where: "Room 1",
    note: "Can you sit with me and match this week's invoices to the delivery notes?",
    mine: [
      [9, 9.25, "Morning huddle"],
      [14, 15.5, "Order desk shadowing"],
    ],
    meeting: [11, 11.5],
    right: "Accept",
    why: {
      Accept: "Your calendar is clear at 11:00, and Priya needs you. Accept, and it goes in your calendar.",
      Tentative: "Tentative means maybe. You're free and it's your job, so there's nothing to be unsure about.",
      Decline: "You're free at 11:00 and Priya needs you there. Declining for no reason leaves her stuck.",
      "Propose new time": "11:00 is free in your calendar, so there's no need to ask for another time.",
    },
  },
  {
    from: "Sarah Patel",
    title: "Warehouse walk-round",
    day: "Wednesday 11 November",
    time: "15:00 to 16:00",
    where: "Warehouse, meet at reception",
    note: "I'd like to show you where everything is before the stock count. You need to see this.",
    mine: [
      [9, 9.25, "Morning huddle"],
      [15, 15.5, "Call Kent Bakery"],
    ],
    meeting: [15, 16],
    right: "Propose new time",
    why: {
      Accept: "You'd be on the phone to Kent Bakery for the first half hour. Accepting a clash means letting someone down.",
      Tentative: "Maybe doesn't fix the clash with your Kent Bakery call. Sarah still won't know when you can come.",
      Decline: "Sarah says you need to see this. When you should be there but can't make the time, offer another one.",
      "Propose new time": "You clash with your Kent Bakery call, but you need to go. Proposing a new time keeps both.",
    },
    offers: [
      { label: "Wednesday 15:30 to 16:30", free: true, why: "Your call ends at 15:30, so you're free from then." },
      { label: "Wednesday 15:00 to 16:00", free: false, why: "That's the same time again: you're on the Kent Bakery call until 15:30." },
      { label: "Wednesday 09:00 to 10:00", free: false, why: "The morning huddle is at 09:00. " },
    ],
  },
  {
    from: "Emma Clarke",
    title: "Christmas party: volunteers",
    day: "Thursday 12 November",
    time: "11:30 to 12:00",
    where: "Room 2",
    note: "Optional! Anyone who'd like to help plan the Christmas party is welcome.",
    mine: [
      [9, 9.25, "Morning huddle"],
      [11.5, 12.5, "Health and safety induction"],
    ],
    meeting: [11.5, 12],
    right: "Decline",
    why: {
      Accept: "Your health and safety induction is at the same time, and you have to do that one.",
      Tentative: "You already know you can't go: the induction clashes. Say no, so Emma can count heads.",
      Decline: "It's optional and you have your induction then. Declining tells Emma straight away.",
      "Propose new time": "It's an optional group meeting. You can't move it for everyone just for you.",
    },
  },
  {
    from: "Daniel Okafor",
    title: "Fire warden training",
    day: "Friday 13 November",
    time: "10:00 to 12:00",
    where: "Boardroom",
    note: "You can go if Emma can cover the phones. She'll let you know on Thursday.",
    mine: [[9, 9.25, "Morning huddle"]],
    meeting: [10, 12],
    right: "Tentative",
    why: {
      Accept: "You don't know yet: it depends on Emma covering the phones. A yes might have to become a no.",
      Tentative: "You're free, but it depends on Emma. Tentative says maybe, and you change it once she tells you.",
      Decline: "You might be able to go. Saying no now could lose your place for nothing.",
      "Propose new time": "The time is fine. What you don't know yet is whether you can leave the phones.",
    },
  },
];

const ANSWERS: [Answer, IconName, string][] = [
  ["Accept", "check", "#0e700e"],
  ["Tentative", "question", "#8a6d12"],
  ["Decline", "cross", "#c4314b"],
  ["Propose new time", "clock", W.outlook],
];

function DayStrip({ mine, meeting, title }: { mine: [number, number, string][]; meeting: [number, number]; title: string }) {
  const from = Math.max(8, Math.floor(Math.min(meeting[0], ...mine.map((m) => m[0]))) - 0);
  const to = Math.min(18, Math.ceil(Math.max(meeting[1], ...mine.map((m) => m[1]))));
  const px = 26;
  const y = (h: number) => (h - from) * px;
  const clash = mine.some(([s, e]) => s < meeting[1] && meeting[0] < e);
  return (
    <div style={{ position: "relative", height: (to - from) * px + 4, marginLeft: 40 }}>
      {Array.from({ length: to - from + 1 }, (_, i) => from + i).map((h) => (
        <div key={h} style={{ position: "absolute", left: -40, right: 0, top: y(h), borderTop: `1px solid ${W.edge}`, fontSize: 11, color: W.muted }}>
          <span style={{ position: "absolute", top: -8, left: 0, background: W.chrome, paddingRight: 3 }}>{`${String(h).padStart(2, "0")}:00`}</span>
        </div>
      ))}
      {mine.map(([s, e, t]) => (
        <div key={t} style={{ position: "absolute", left: clash ? "50%" : 2, right: 2, top: y(s) + 1, height: Math.max(15, (e - s) * px - 2), background: "#dbe8f8", borderLeft: `3px solid ${W.outlook}`, borderRadius: 3, fontSize: 11, lineHeight: "13px", padding: "1px 4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {t}
        </div>
      ))}
      <div style={{ position: "absolute", left: 2, right: clash ? "51%" : 2, top: y(meeting[0]) + 1, height: Math.max(15, (meeting[1] - meeting[0]) * px - 2), background: "repeating-linear-gradient(135deg, #ffffff 0 5px, #dbe8f8 5px 10px)", border: `1px dashed ${clash ? "#c4314b" : W.outlook}`, borderRadius: 3, fontSize: 11, lineHeight: "13px", fontWeight: 600, padding: "1px 4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {title}
      </div>
    </div>
  );
}

/* Friday morning: who's busy when, for the find-the-slot step. */
const FIND_ROWS: { name: string; busy: [number, number][] }[] = [
  { name: "You", busy: [[9, 9.25], [11, 12]] },
  { name: "Sarah Patel", busy: [[9, 10]] },
  { name: "Emma Clarke", busy: [[9, 9.25], [10.5, 11]] },
];
const hm = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 ? "30" : "00"}`;

function FindSlot({ onAnswer }: { onAnswer: (right: boolean) => void }) {
  const [start, setStart] = useState<number | null>(null);
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const [tries, setTries] = useState(0);
  const halfHours = [9, 9.5, 10, 10.5, 11, 11.5];
  const busyNow = (s: number) => FIND_ROWS.filter((r) => r.busy.some(([a, b]) => a < s + 0.5 && s < b));
  const check = () => {
    if (start === null) return;
    const hit = busyNow(start);
    const ok = hit.length === 0;
    setSaid({ ok, text: ok ? `Everyone is free ${hm(start)} to ${hm(start + 0.5)}. That's the slot: Send the invite.` : `At ${hm(start)}, ${hit.map((r) => (r.name === "You" ? "you are" : `${r.name} is`)).join(" and ")} busy. Look for the column with no blue in any row.` });
    if (ok) onAnswer(tries === 0);
    setTries((t) => t + 1);
  };
  const ref = useReveal<HTMLDivElement>(said);
  return (
    <div>
      <Job>Daniel wants 30 minutes with Sarah and Emma on Friday morning (09:00 to 12:00). Click the half hour when all three of you are free, then press Check.</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div style={appWindow}>
          <TitleStrip app="Outlook" colour={W.outlook}>
            Scheduling Assistant · Friday 13 November
          </TitleStrip>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 120 + halfHours.length * 52, padding: 10 }}>
              <div style={{ display: "flex", fontSize: 12, color: W.muted }}>
                <span style={{ width: 120, flexShrink: 0 }} />
                {halfHours.map((h) => (
                  <span key={h} style={{ width: 52, flexShrink: 0, paddingLeft: 3 }}>
                    {h % 1 ? "" : hm(h)}
                  </span>
                ))}
              </div>
              {FIND_ROWS.map((r) => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", height: 40, borderBottom: `1px solid ${W.edge}` }}>
                  <span style={{ width: 120, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                    <Avatar name={r.name} colour={avatarColour(r.name)} size={22} />
                    {r.name.split(" ")[0]}
                  </span>
                  <span style={{ position: "relative", display: "flex", height: "100%" }}>
                    {halfHours.map((h) => (
                      <button
                        key={h}
                        type="button"
                        aria-label={`${hm(h)} to ${hm(h + 0.5)}`}
                        onClick={() => {
                          setStart(h);
                          setSaid(null);
                        }}
                        style={{ width: 52, height: "100%", padding: 0, border: "none", borderLeft: `1px ${h % 1 ? "dotted" : "solid"} ${W.edge}`, background: start === h ? (busyNow(h).length ? "rgba(196,49,75,0.14)" : "rgba(19,161,14,0.14)") : "transparent", cursor: "pointer" }}
                      />
                    ))}
                    {r.busy.map(([a, b], i) => (
                      <span key={i} style={{ position: "absolute", left: (a - 9) * 104 + 1, width: (b - a) * 104 - 2, top: 10, bottom: 10, borderRadius: 3, background: "#2f6ab3", pointerEvents: "none" }} />
                    ))}
                  </span>
                </div>
              ))}
              <p style={{ margin: "10px 0 0", fontSize: 14, color: start === null ? W.muted : W.ink }}>{start === null ? "Click a half hour on the timeline." : `Your meeting: ${hm(start)} to ${hm(start + 0.5)}`}</p>
            </div>
          </div>
        </div>
      </Workspace>
      <div style={{ marginTop: 14 }}>
        <Button onClick={check} disabled={start === null || !!said?.ok}>
          Check
        </Button>
      </div>
      <div ref={ref}>{said && <Say ok={said.ok}>{said.text}</Say>}</div>
    </div>
  );
}

export function InviteLab({ onDone }: LabProps) {
  const total = INVITES.length + 1;
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<Answer[]>([]);
  const [offer, setOffer] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [offers] = useState(() => INVITES.map((s) => (s.offers ? shuffle(s.offers.map((_, i) => i)) : [])));
  const say = useReveal<HTMLDivElement>(picked.length + (offer ?? 0));

  if (finished) return <Finished>All done. You got <b>{right} of {total}</b> right first time.</Finished>;

  const next = () => {
    if (at + 1 < total) {
      setAt(at + 1);
      setPicked([]);
      setOffer(null);
      setSolved(false);
    } else {
      setFinished(true);
      onDone({ correct: right, total });
    }
  };

  if (at === INVITES.length) {
    return (
      <div>
        <StepBar at={total} of={total} label="Step" />
        <FindSlot
          onAnswer={(first) => {
            const n = right + (first ? 1 : 0);
            setRight(n);
            setFinished(true);
            onDone({ correct: n, total });
          }}
        />
      </div>
    );
  }

  const s = INVITES[at];
  const last = picked[picked.length - 1];
  const choose = (a: Answer) => {
    if (solved) return;
    const first = picked.length === 0;
    setPicked((p) => [...p, a]);
    if (a === s.right && !s.offers) {
      setSolved(true);
      if (first) setRight((n) => n + 1);
    }
  };
  const proposing = last === "Propose new time" && s.right === "Propose new time";
  const pickOffer = (i: number) => {
    if (solved) return;
    setOffer(i);
    if (s.offers?.[i].free) {
      setSolved(true);
      if (picked.length === 1 && offer === null) setRight((n) => n + 1);
    }
  };

  return (
    <div>
      <StepBar at={at + 1} of={total} label="Step" />
      <Job>
        {s.from} has sent you an invite. Look at your own calendar for that day, drawn beside it, then answer the way you would at work.
      </Job>
      <Workspace style={{ marginTop: 14 }}>
        <div style={appWindow}>
          <TitleStrip app="Outlook" colour={W.outlook}>
            Inbox
          </TitleStrip>
          <div style={{ padding: "14px 16px 16px" }}>
            <div style={{ fontSize: 19, fontWeight: 600 }}>{s.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 14.5 }}>
              <Avatar name={s.from} colour={avatarColour(s.from)} size={28} />
              <span>
                <b style={{ fontWeight: 600 }}>{s.from}</b> <span style={{ color: W.muted }}>invited you</span>
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12, padding: 12, border: `1px solid ${W.edge}`, borderRadius: 8 }}>
              <div style={{ flex: "1 1 230px", display: "grid", gap: 8, fontSize: 14.5, lineHeight: 1.45, alignContent: "start" }}>
                <span style={{ display: "flex", gap: 8 }}>
                  <Icon name="clock" size={17} style={{ color: W.muted }} />
                  <span>
                    <b style={{ fontWeight: 600 }}>{s.day}</b>, {s.time}
                  </span>
                </span>
                <span style={{ display: "flex", gap: 8 }}>
                  <Icon name="pin" size={17} style={{ color: W.muted }} />
                  {s.where}
                </span>
                <span style={{ display: "flex", gap: 8 }}>
                  <Icon name="text" size={17} style={{ color: W.muted }} />
                  {s.note}
                </span>
              </div>
              <div aria-label="Your calendar" style={{ flex: "1 1 180px", maxWidth: 260, padding: "8px 10px 10px", borderRadius: 6, background: W.chrome }}>
                <b style={{ display: "block", fontSize: 12.5, color: W.muted, marginBottom: 10 }}>Your calendar</b>
                <DayStrip mine={s.mine} meeting={s.meeting} title={s.title} />
              </div>
            </div>
            <div role="group" aria-label="Your answer" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {ANSWERS.map(([a, icon, c]) => (
                <button key={a} type="button" onClick={() => choose(a)} disabled={solved} style={{ ...appBtn(last === a), opacity: solved && last !== a ? 0.55 : 1, cursor: solved ? "default" : "pointer" }}>
                  <span style={{ color: c, display: "inline-flex" }}>
                    <Icon name={icon} size={17} stroke={2.4} />
                  </span>
                  {a}
                </button>
              ))}
            </div>
            {proposing && s.offers && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: W.chrome }}>
                <b style={{ display: "block", fontSize: 14.5, marginBottom: 8 }}>Propose a new time: pick one you&apos;re free for</b>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {offers[at].map((i) => (
                    <button key={i} type="button" onClick={() => pickOffer(i)} disabled={solved} style={{ ...appBtn(offer === i), cursor: solved ? "default" : "pointer" }}>
                      {s.offers![i].label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Workspace>
      <div ref={say}>
        {last && !(proposing && offer === null) && (
          <Say ok={last === s.right && (!s.offers || (offer !== null && !!s.offers[offer].free))}>
            {proposing && offer !== null && s.offers ? (
              <>
                {s.offers[offer].free ? <b>Right. </b> : <b>Not that one. </b>}
                {s.offers[offer].free ? `${s.why["Propose new time"]} ${s.offers[offer].why}` : `${s.offers[offer].why} Pick another.`}
              </>
            ) : (
              <>
                {last === s.right ? <b>Right. </b> : <b>Not quite. </b>}
                {s.why[last]}
                {last !== s.right && " Have another go."}
              </>
            )}
          </Say>
        )}
        {proposing && offer === null && <Say ok>{s.why["Propose new time"]} Now pick the time you&apos;re free for.</Say>}
      </div>
      {solved && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={next}>{at + 1 < total ? "Next" : "Finish"}</Button>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* Lesson 2: join a Teams call and a Zoom call the way you're asked.   */
/* ================================================================== */

function Toggle({ on, label, onClick, colour }: { on: boolean; label: string; onClick: () => void; colour: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} style={{ position: "relative", width: 46, height: 26, flexShrink: 0, padding: 0, border: `1.5px solid ${on ? colour : W.muted}`, borderRadius: 13, background: on ? colour : W.page, cursor: "pointer" }}>
      <span style={{ position: "absolute", top: 4, left: on ? 24 : 4, width: 15, height: 15, borderRadius: "50%", background: on ? "#fff" : W.muted, transition: "left .15s ease" }} />
    </button>
  );
}

function Preview({ camera }: { camera: boolean }) {
  return (
    <div style={{ position: "relative", aspectRatio: "16 / 9", background: W.call, borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {camera ? <CameraPicture colour="#8a4fd8" /> : <Avatar name="You" colour="#8a4fd8" size={54} />}
      {!camera && <span style={{ position: "absolute", left: 0, right: 0, bottom: 8, textAlign: "center", fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}>Your camera is off</span>}
    </div>
  );
}

export function JoinLab({ onDone }: LabProps) {
  const [task, setTask] = useState(0);
  const [stage, setStage] = useState<"invite" | "prejoin" | "audio" | "in">("invite");
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(true);
  const [zVideoOff, setZVideoOff] = useState(false);
  const [zMute, setZMute] = useState(false);
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const [misses, setMisses] = useState(0);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);
  const ref = useReveal<HTMLDivElement>(said);

  if (finished) return <Finished>All done. You joined <b>{right} of 2</b> calls right first time.</Finished>;

  const teams = task === 0;
  const colour = teams ? W.teams : "#0b5cff";
  const restart = () => {
    setStage("prejoin");
    setSaid(null);
  };
  const joinTeams = () => {
    const errs = [mic && "your microphone was on: switch it off so you join muted", !camera && "your camera was off: switch it on before you join"].filter(Boolean);
    setStage("in");
    if (errs.length) {
      setMisses((m) => m + 1);
      setSaid({ ok: false, text: `You're in, but ${errs.join(", and ")}. Emma asked for mics on mute and cameras on. Press Leave and join again.` });
    } else {
      setSaid({ ok: true, text: "You're in, muted, with your camera on: exactly what Emma asked. Nobody hears the office behind you." });
      if (misses === 0) setRight((r) => r + 1);
    }
  };
  const joinZoom = (audio: boolean) => {
    if (!audio) {
      setMisses((m) => m + 1);
      setSaid({ ok: false, text: "Without computer audio you can't hear anyone, and they can't hear you. Press Leave and join again, then choose Join with Computer Audio." });
      setStage("in");
      return;
    }
    if (!zVideoOff) {
      setMisses((m) => m + 1);
      setSaid({ ok: false, text: "You joined with your video on, but your camera isn't working today: they'll see a black or frozen box. Press Leave, and tick \"Turn off my video\" this time." });
      setStage("in");
      return;
    }
    setStage("in");
    setSaid({ ok: true, text: "You're in with computer audio and your video off. Imran can hear you, and nobody's staring at a broken picture." });
    if (misses === 0) setRight((r) => r + 1);
  };
  const next = () => {
    if (task === 0) {
      setTask(1);
      setStage("invite");
      setSaid(null);
      setMisses(0);
    } else {
      setFinished(true);
      onDone({ correct: right, total: 2 });
    }
  };

  return (
    <div>
      <StepBar at={task + 1} of={2} label="Call" />
      <Job>
        {teams ? (
          <>
            Emma&apos;s invite says: <b>&ldquo;Cameras on and microphones on mute when you join, please.&rdquo;</b>{" "}It&apos;s 14:00. Join her Teams call the way she asks.
          </>
        ) : (
          <>
            Imran at Kent Bakery has sent a Zoom link for 15:00. Your laptop camera isn&apos;t working today. Join <b>with your video off</b>, and make sure they can hear you.
          </>
        )}
      </Job>
      <Workspace style={{ marginTop: 14 }}>
        <div style={appWindow}>
          <TitleStrip app={stage === "invite" ? "Outlook" : teams ? "Microsoft Teams" : "Zoom"} colour={stage === "invite" ? W.outlook : colour}>
            {stage === "invite" ? "Calendar" : teams ? "Rota walk-through" : "Kent Bakery: Christmas orders"}
          </TitleStrip>
          {stage === "invite" && (
            <div style={{ padding: 16, display: "grid", gap: 10, fontSize: 15 }}>
              <b style={{ fontSize: 18, fontWeight: 600 }}>{teams ? "Rota walk-through" : "Kent Bakery: Christmas orders"}</b>
              <span style={{ display: "flex", gap: 8, color: W.body }}>
                <Icon name="clock" size={17} style={{ color: W.muted }} />
                {teams ? "Today, 14:00 to 14:30" : "Today, 15:00 to 15:30"}
              </span>
              <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <Icon name="video" size={17} style={{ color: W.muted }} />
                {teams ? "Microsoft Teams meeting" : "Zoom meeting: zoom.example/j/0000000000"}
                <button type="button" onClick={() => setStage("prejoin")} style={{ minHeight: 40, padding: "4px 18px", border: "none", borderRadius: 6, background: colour, color: "#fff", fontFamily: W.font, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  Join
                </button>
              </span>
            </div>
          )}
          {stage === "prejoin" && teams && (
            <div style={{ padding: 14, background: "#f5f5f5", display: "grid", gap: 12 }}>
              <span style={{ fontSize: 14, color: W.muted }}>Choose your video and audio options</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <Preview camera={camera} />
                </div>
                <div style={{ flex: "1 1 200px", display: "grid", gap: 10, alignContent: "start", padding: 12, borderRadius: 8, background: W.page }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, fontSize: 15 }}>
                    <Icon name={camera ? "video" : "videoOff"} size={20} />
                    <Toggle on={camera} label="Camera" onClick={() => setCamera(!camera)} colour={colour} />
                    Camera {camera ? "on" : "off"}
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, fontSize: 15 }}>
                    <Icon name={mic ? "mic" : "micOff"} size={20} />
                    <Toggle on={mic} label="Microphone" onClick={() => setMic(!mic)} colour={colour} />
                    Microphone {mic ? "on" : "off (muted)"}
                  </label>
                  <span style={{ fontSize: 13.5, color: W.muted }}>Computer audio</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={joinTeams} style={{ minHeight: 44, padding: "6px 22px", border: "none", borderRadius: 6, background: colour, color: "#fff", fontFamily: W.font, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>
                  Join now
                </button>
              </div>
            </div>
          )}
          {stage === "prejoin" && !teams && (
            <div style={{ padding: 14, display: "grid", gap: 12 }}>
              <div style={{ maxWidth: 360 }}>
                <Preview camera={!zVideoOff} />
              </div>
              {(
                [
                  [zVideoOff, setZVideoOff, "Turn off my video"],
                  [zMute, setZMute, "Mute my microphone"],
                ] as const
              ).map(([on, set, label]) => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40, fontSize: 15, cursor: "pointer" }}>
                  <input type="checkbox" checked={on} onChange={() => set(!on)} style={{ width: 20, height: 20, accentColor: colour }} />
                  {label}
                </label>
              ))}
              <div>
                <button type="button" onClick={() => setStage("audio")} style={{ minHeight: 44, padding: "6px 26px", border: "none", borderRadius: 8, background: colour, color: "#fff", fontFamily: W.font, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>
                  Join
                </button>
              </div>
            </div>
          )}
          {stage === "audio" && (
            <div style={{ padding: 18, display: "grid", gap: 12, justifyItems: "center", textAlign: "center" }}>
              <b style={{ fontSize: 16 }}>Choose how you&apos;ll hear the meeting</b>
              <button type="button" onClick={() => joinZoom(true)} style={{ minHeight: 46, padding: "6px 26px", border: "none", borderRadius: 8, background: "#0e8a3e", color: "#fff", fontFamily: W.font, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>
                Join with Computer Audio
              </button>
              <button type="button" onClick={() => joinZoom(false)} style={{ minHeight: 40, padding: "4px 14px", border: `1px solid ${W.edge}`, borderRadius: 8, background: W.page, fontFamily: W.font, fontSize: 14.5, cursor: "pointer" }}>
                Close, and join without audio
              </button>
            </div>
          )}
          {stage === "in" && (
            <div style={{ position: "relative", background: W.call, color: "#fff", padding: 12 }}>
              <div style={{ position: "relative", height: "clamp(180px, 44vw, 260px)", borderRadius: 8, overflow: "hidden", background: "#3b3a39" }}>
                <span style={{ position: "absolute", inset: 0 }}><CameraPicture colour={avatarColour(teams ? "emma.clarke@northfieldsupplies.example" : "imran.ahmed@kentbakery.example")} /></span>
                <span style={{ position: "absolute", left: 8, bottom: 8, padding: "2px 7px", borderRadius: 4, background: "rgba(0,0,0,0.55)", fontSize: 12.5 }}>{teams ? "Emma Clarke" : "Imran Ahmed"}</span>
                <div style={{ position: "absolute", right: 8, bottom: 8, width: 120, aspectRatio: "16 / 10", borderRadius: 6, overflow: "hidden", background: "#2b2b2b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {(teams ? camera : !zVideoOff) ? <CameraPicture colour="#8a4fd8" /> : <Avatar name="You" colour="#8a4fd8" size={30} />}
                  <span style={{ position: "absolute", left: 4, bottom: 4, display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 5px", borderRadius: 3, background: "rgba(0,0,0,0.6)", fontSize: 11 }}>
                    {(teams ? !mic : zMute) && <Icon name="micOff" size={11} />}You
                  </span>
                </div>
              </div>
              {said && !said.ok && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <button type="button" onClick={restart} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "4px 16px", border: "none", borderRadius: 6, background: "#c4314b", color: "#fff", fontFamily: W.font, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>
                    <Icon name="leave" size={16} /> Leave
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Workspace>
      <div ref={ref}>{said && <Say ok={said.ok}>{said.text}</Say>}</div>
      {said?.ok && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={next}>{task === 0 ? "Next call" : "Finish"}</Button>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* Lesson 3: the controls in a call, and the Share tray.               */
/* ================================================================== */

type CallAct = "mic" | "camera" | "share" | "excel" | "outlook" | "screen" | "stop" | "leave";

const CALL_STEPS: { say: string; want: CallAct; done: string }[] = [
  { say: "Daniel's call has started, and a lorry is reversing outside your window. Mute your microphone.", want: "mic", done: "Muted. The line through the Mic button, and on your picture, shows nobody can hear you." },
  { say: "Daniel asks to see the stock sheet. Press Share.", want: "share", done: "The Share tray opens: your whole screen, or one window." },
  { say: "Share only the Excel window with the stock sheet. Your email has something private in it.", want: "excel", done: "Only Excel is on show. The red bar says exactly what Daniel can see." },
  { say: "You've finished going through it. Stop sharing.", want: "stop", done: "Sharing's off. Daniel sees you again, not your screen." },
  { say: "Your connection is slow and your picture keeps freezing. Turn your camera off.", want: "camera", done: "Camera off. Your sound will be clearer, and they'll see your initials." },
  { say: "Daniel asks you a question. Unmute so you can answer.", want: "mic", done: "Unmuted: they can hear you now." },
  { say: "The meeting's over. Leave the call.", want: "leave", done: "You've left. The meeting carries on for anyone still in it." },
];

/* A tiny window drawing for the Share tray: a sheet's grid, or an inbox. */
const thumbLook = (app: "excel" | "outlook"): CSSProperties =>
  app === "excel"
    ? { background: "#fff", borderTop: `6px solid ${W.excel}`, backgroundImage: `linear-gradient(${W.edge} 1px, transparent 1px), linear-gradient(90deg, ${W.edge} 1px, transparent 1px)`, backgroundSize: "24px 10px" }
    : { borderTop: `6px solid ${W.outlook}`, background: `linear-gradient(90deg, ${W.chrome} 0 28%, #fff 28%)`, backgroundImage: `linear-gradient(#a4262c, #a4262c), linear-gradient(${W.edge}, ${W.edge}), linear-gradient(${W.edge}, ${W.edge}), linear-gradient(90deg, ${W.chrome} 0 28%, #fff 28%)`, backgroundSize: "45% 3px, 55% 3px, 50% 3px, 100% 100%", backgroundPosition: "36% 18%, 40% 38%, 38% 54%, 0 0", backgroundRepeat: "no-repeat" };

const WRONG: Partial<Record<CallAct, string>> = {
  screen: "Your whole screen shows every window, including the private email in Outlook. Pick only the Excel window.",
  outlook: "That's your Outlook window, with the private email. Daniel asked for the stock sheet: pick Excel.",
  leave: "Not yet: that would end the call for you. Read the instruction again.",
};

export function CallLab({ onDone }: LabProps) {
  const [step, setStep] = useState(0);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [tray, setTray] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [left, setLeft] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [missed, setMissed] = useState<number[]>([]);
  const finished = step >= CALL_STEPS.length;
  const ref = useReveal<HTMLDivElement>(wrong);

  const act = (a: CallAct) => {
    if (finished) return;
    const want = CALL_STEPS[step].want;
    if (a !== want) {
      setMissed((m) => (m.includes(step) ? m : [...m, step]));
      setWrong(WRONG[a] ?? "Not that one. Read the instruction again and look for the button it names.");
      return;
    }
    setWrong(null);
    if (a === "mic") setMic(!mic);
    if (a === "camera") setCamera(!camera);
    if (a === "share") setTray(true);
    if (a === "excel") {
      setTray(false);
      setSharing(true);
    }
    if (a === "stop") setSharing(false);
    if (a === "leave") setLeft(true);
    const n = step + 1;
    setStep(n);
    if (n >= CALL_STEPS.length) onDone({ correct: CALL_STEPS.length - missed.length, total: CALL_STEPS.length });
  };

  const ctl = (k: CallAct, icon: IconName, label: string, on?: boolean) => (
    <button type="button" onClick={() => act(k)} aria-pressed={on} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 54, minHeight: 52, padding: "4px 6px", border: "none", borderRadius: 6, background: on ? "rgba(255,255,255,0.14)" : "transparent", color: "#fff", fontFamily: W.font, fontSize: 12, cursor: "pointer" }}>
      <Icon name={icon} size={21} />
      {label}
    </button>
  );

  return (
    <div>
      <StepBar at={Math.min(step + 1, CALL_STEPS.length)} of={CALL_STEPS.length} label="Step" />
      {finished ? (
        <Finished>
          All done. You got <b>{CALL_STEPS.length - missed.length} of {CALL_STEPS.length}</b> right first time.
        </Finished>
      ) : (
        <p style={{ margin: "14px 0 12px", fontSize: 18.5, fontWeight: 700, lineHeight: 1.45, color: D.ink }}>{CALL_STEPS[step].say}</p>
      )}
      {step > 0 && !finished && !wrong && <p style={{ margin: "0 0 12px", display: "flex", gap: 8, fontSize: 15.5, color: D.muted }}><Tick size={16} /> {CALL_STEPS[step - 1].done}</p>}
      <Workspace>
        <div style={{ ...appWindow, background: W.call, color: "#fff", position: "relative" }}>
          <TitleStrip app="Microsoft Teams" colour={W.teams}>
            Stock check-in
          </TitleStrip>
          {left ? (
            <div style={{ padding: "60px 16px", textAlign: "center", fontSize: 17 }}>You left the meeting.</div>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, padding: "6px 8px", background: "#2b2b2b" }}>
                <span style={{ flex: "1 1 80px", fontSize: 13, color: "rgba(255,255,255,0.75)", paddingLeft: 6 }}>12:04</span>
                {ctl("camera", camera ? "video" : "videoOff", "Camera", camera)}
                {ctl("mic", mic ? "mic" : "micOff", "Mic", mic)}
                {ctl("share", "share", "Share", tray || sharing)}
                <button type="button" onClick={() => act("leave")} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, marginLeft: 4, padding: "0 14px", border: "none", borderRadius: 6, background: "#c4314b", color: "#fff", fontFamily: W.font, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>
                  <Icon name="leave" size={17} /> Leave
                </button>
              </div>
              {sharing && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10, padding: "6px 10px", background: "#c4314b", fontSize: 14 }}>
                  You&apos;re sharing: <b>Excel · Stock November.xlsx</b>
                  <button type="button" onClick={() => act("stop")} style={{ minHeight: 34, padding: "0 12px", border: "1px solid rgba(255,255,255,0.85)", borderRadius: 4, background: "transparent", color: "#fff", fontFamily: W.font, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                    Stop sharing
                  </button>
                </div>
              )}
              <div style={{ position: "relative", padding: 10 }}>
                <div style={{ position: "relative", height: "clamp(190px, 46vw, 270px)", borderRadius: 8, overflow: "hidden", background: "#3b3a39" }}>
                  {sharing ? (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
                      <div style={{ width: "86%", height: "84%", background: "#fff", borderRadius: 4, overflow: "hidden", display: "grid", gridTemplateRows: "16px 1fr" }}>
                        <span style={{ background: W.excel }} />
                        <span style={{ backgroundImage: `linear-gradient(${W.edge} 1px, transparent 1px), linear-gradient(90deg, ${W.edge} 1px, transparent 1px)`, backgroundSize: "48px 18px" }} />
                      </div>
                    </div>
                  ) : (
                    <span style={{ position: "absolute", inset: 0 }}>
                      <CameraPicture colour={avatarColour("daniel.okafor@northfieldsupplies.example")} />
                    </span>
                  )}
                  <span style={{ position: "absolute", left: 8, bottom: 8, padding: "2px 7px", borderRadius: 4, background: "rgba(0,0,0,0.55)", fontSize: 12.5 }}>{sharing ? "What Daniel sees" : "Daniel Okafor"}</span>
                  <div style={{ position: "absolute", right: 8, bottom: 8, width: "min(130px, 34%)", aspectRatio: "16 / 10", borderRadius: 6, overflow: "hidden", background: "#2b2b2b", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    {camera ? <CameraPicture colour="#8a4fd8" /> : <Avatar name="You" colour="#8a4fd8" size={30} />}
                    <span style={{ position: "absolute", left: 4, bottom: 4, display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 5px", borderRadius: 3, background: "rgba(0,0,0,0.6)", fontSize: 11 }}>
                      {!mic && <Icon name="micOff" size={11} />}You
                    </span>
                  </div>
                </div>
                {tray && (
                  <div role="dialog" aria-label="Share content" style={{ position: "absolute", left: 10, right: 10, top: 10, padding: 12, borderRadius: 8, background: "#2b2b2b", border: "1px solid #444", boxShadow: "0 12px 30px rgba(0,0,0,0.6)" }}>
                    <b style={{ fontSize: 14.5 }}>Share content</b>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(118px, 170px))", gap: 8, marginTop: 10 }}>
                      {(
                        [
                          ["screen", "Screen 1 (whole screen)"],
                          ["excel", "Excel · Stock November.xlsx"],
                          ["outlook", "Outlook · Private: your salary"],
                        ] as [CallAct, string][]
                      ).map(([k, label]) => (
                        <button key={k} type="button" onClick={() => act(k)} style={{ display: "grid", gap: 5, padding: 6, border: "2px solid transparent", borderRadius: 7, background: "#3a3a3a", color: "#fff", fontFamily: W.font, fontSize: 12, textAlign: "left", cursor: "pointer" }}>
                          <span style={{ display: "block", aspectRatio: "16 / 10", borderRadius: 3, overflow: "hidden", background: k === "screen" ? W.desktop : "#fff", position: "relative" }}>
                            <span style={{ position: "absolute", left: k === "screen" ? "8%" : 0, right: k === "screen" ? "30%" : 0, top: k === "screen" ? "10%" : 0, height: k === "screen" ? "60%" : "100%", ...thumbLook(k === "outlook" ? "outlook" : "excel") }} />
                            {k === "screen" && <span style={{ position: "absolute", left: "38%", right: "6%", top: "28%", height: "60%", ...thumbLook("outlook"), boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }} />}
                          </span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Workspace>
      <div ref={ref}>
        {wrong && (
          <p role="status" style={{ margin: "12px 0 0", display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 14, background: D.badSoft, border: `1px solid ${D.badEdge}`, fontSize: 16, lineHeight: 1.5, color: D.body }}>
            <Cross /> {wrong}
          </p>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Lesson 4: chat or email? Send each one the right way.               */
/* ================================================================== */

interface Message {
  to: string;
  text: string;
  chat: boolean;
  why: string;
}

const MESSAGES: Message[] = [
  { to: "Sarah Patel", text: "Is the warehouse printer working again?", chat: true, why: "A quick yes-or-no question. Nobody needs to find it again next month." },
  { to: "Daniel Okafor", text: "The signed contract for the new cleaning company, attached", chat: false, why: "A signed document is a record, and people will need to find it later. Email, with the file." },
  { to: "Emma Clarke", text: "Running 10 minutes late, my bus is stuck in traffic", chat: true, why: "Short, and needs seeing now. A chat pops up straight away." },
  { to: "Bright Cafe (a customer)", text: "Your price for 15 cases of cups, with VAT", chat: false, why: "Customers are outside the company, and a price is something both sides need in writing." },
  { to: "Priya Shah", text: "Is our meeting in Room 1 or Room 2?", chat: true, why: "A quick question with a one-word answer." },
  { to: "Daniel Okafor", text: "Kent Bakery's complaint: what happened and what we'll do about it", chat: false, why: "It needs a record, and Daniel may forward it on. Email." },
  { to: "Emma Clarke", text: "Thanks, got it!", chat: true, why: "A quick thank-you. An email for this just fills an inbox." },
  { to: "Sarah, Priya and Daniel", text: "The actions from this morning's stock meeting", chat: false, why: "Actions are a record of who agreed to do what. People look them up later." },
];

export function ChatOrEmailLab({ onDone }: LabProps) {
  const [order] = useState(() => shuffle(MESSAGES.map((_, i) => i)));
  const [at, setAt] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [sent, setSent] = useState<{ m: Message; chat: boolean }[]>([]);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);
  const m = MESSAGES[order[at]];
  const ref = useReveal<HTMLDivElement>(choice !== null ? at + 1 : null);

  const choose = (chat: boolean) => {
    if (choice !== null) return;
    setChoice(chat);
    setSent((s) => [...s, { m, chat }]);
    if (chat === m.chat) setRight((n) => n + 1);
  };
  const next = () => {
    if (at + 1 < MESSAGES.length) {
      setAt(at + 1);
      setChoice(null);
    } else {
      setFinished(true);
      onDone({ correct: right, total: MESSAGES.length });
    }
  };
  const chats = sent.filter((x) => x.chat);
  const mails = sent.filter((x) => !x.chat);
  const mark = (x: { m: Message; chat: boolean }) => (x.chat === x.m.chat ? <Tick size={15} color="#0e700e" /> : <Cross size={15} color="#c4314b" />);

  return (
    <div>
      {finished ? (
        <Finished>
          All sent. You got <b>{right} of {MESSAGES.length}</b> going the right way.
        </Finished>
      ) : (
        <>
          <StepBar at={at + 1} of={MESSAGES.length} label="Message" />
          <div className="dr-glass" style={{ position: "relative", marginTop: 16, padding: "20px 20px", borderRadius: 18, background: D.card, border: `1px solid ${D.edgeStrong}`, boxShadow: D.lift }}>
            <Kicker>To {m.to}</Kicker>
            <p style={{ margin: "8px 0 0", fontSize: 21, fontWeight: 600, lineHeight: 1.4, color: D.ink }}>&ldquo;{m.text}&rdquo;</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 10, marginTop: 12 }}>
            {[true, false].map((chat) => {
              const picked = choice === chat;
              const isRight = choice !== null && chat === m.chat;
              return (
                <button key={String(chat)} type="button" onClick={() => choose(chat)} disabled={choice !== null} className="dr-option" style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 60, padding: "12px 16px", borderRadius: 14, border: `1px solid ${isRight ? D.good : picked ? D.bad : D.edge}`, background: isRight ? D.goodSoft : picked ? D.badSoft : D.glass, color: D.ink, fontFamily: D.sans, fontSize: 17, fontWeight: 600, textAlign: "left", cursor: choice !== null ? "default" : "pointer" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 8, background: chat ? W.teams : W.outlook, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={chat ? "chat" : "send"} size={19} />
                  </span>
                  {chat ? "Send as a Teams chat" : "Send as an email"}
                </button>
              );
            })}
          </div>
          <div ref={ref}>
            {choice !== null && (
              <>
                <Say ok={choice === m.chat}>
                  {choice === m.chat ? <b>Right. </b> : <b>{m.chat ? "That one's for chat. " : "That one needs an email. "}</b>}
                  {m.why}
                </Say>
                <div style={{ marginTop: 14 }}>
                  <Button onClick={next}>{at + 1 < MESSAGES.length ? "Next message" : "Finish"}</Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
      {/* where they went */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12, marginTop: 18 }}>
        <div style={appWindow}>
          <TitleStrip app="Teams" colour={W.teams}>
            Chats you sent
          </TitleStrip>
          <div style={{ minHeight: 90, padding: 10, background: "#f5f5f5", display: "grid", gap: 6, alignContent: "start" }}>
            {chats.length === 0 && <span style={{ fontSize: 13.5, color: W.muted }}>Nothing yet.</span>}
            {chats.map((x, i) => (
              <div key={i} style={{ justifySelf: "end", maxWidth: "92%", display: "flex", gap: 6, alignItems: "flex-start", padding: "6px 10px", borderRadius: 7, background: W.teamsSoft, fontSize: 13.5, lineHeight: 1.4 }}>
                {mark(x)}
                <span>
                  <b style={{ fontWeight: 600 }}>To {x.m.to}:</b> {x.m.text}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={appWindow}>
          <TitleStrip app="Outlook" colour={W.outlook}>
            Sent items
          </TitleStrip>
          <div style={{ minHeight: 90 }}>
            {mails.length === 0 && <span style={{ display: "block", padding: 10, fontSize: 13.5, color: W.muted }}>Nothing yet.</span>}
            {mails.map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "7px 10px", borderBottom: `1px solid ${W.edge}`, fontSize: 13.5, lineHeight: 1.4 }}>
                {mark(x)}
                <span>
                  <b style={{ display: "block", fontWeight: 600 }}>To: {x.m.to}</b>
                  <span style={{ color: W.body }}>{x.m.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Lesson 5: the meeting chat, for the actions email.                  */
/* ================================================================== */

export function MeetingChat({ title, lines }: { title: string; lines: { who: string; time: string; text: string }[] }) {
  return (
    <Workspace style={{ marginTop: 4 }}>
      <div style={appWindow}>
        <TitleStrip app="Microsoft Teams" colour={W.teams}>
          {title}
        </TitleStrip>
        <div style={{ padding: "12px 14px", background: "#f5f5f5", display: "grid", gap: 10 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Avatar name={l.who} colour={avatarColour(l.who)} size={28} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: W.muted }}>
                  <b style={{ color: W.body, fontWeight: 600, marginRight: 6 }}>{l.who}</b>
                  {l.time}
                </div>
                <div style={{ marginTop: 2, padding: "6px 10px", borderRadius: 7, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.08)", fontSize: 15, lineHeight: 1.5 }}>{l.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Workspace>
  );
}
