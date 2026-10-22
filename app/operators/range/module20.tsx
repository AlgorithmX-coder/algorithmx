"use client";

/* Module 20 - Deepfakes & the AI Arms Race (AI Frontier track, final module).
 *
 * Deepfakes can't be "hacked", so this module is defence-led, the attacker-vs-
 * defender arms race. The hands-on surface is a SCRIPTED, in-browser detection
 * and VERIFICATION lab: the learner examines realistic (fictional) scenarios -
 * a deepfake video call, a cloned-voice voicemail, an AI phishing email -
 * spots the tells, and makes the decision that actually beats a fake: verify
 * out-of-band. No real media is generated; everything is described text.
 *
 * Shape mirrors the other AI Frontier modules: glossary, interactive lesson lab,
 * four-stage "engagement" (video -> voice -> email -> the verification
 * protocol), a hint, four drills, a chained capstone, defend lab, report.
 * industry{} authored from the research brief (Arup, Sumsub, WPP, C2PA). */

import { useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "deepfake", definition: "AI-generated or AI-altered video, audio or imagery that convincingly shows a real person saying or doing something they never did.", example: "A video call where every 'colleague' is an AI-made copy of a real employee." },
  { term: "voice clone", definition: "An AI copy of a specific person's voice, now buildable from just a few seconds of sample audio grabbed from a video, podcast or voicemail.", example: "A fake voicemail 'from Mum' that sounds exactly like her." },
  { term: "synthetic media", definition: "Any content (text, image, audio, video) created or substantially altered by AI rather than captured from reality.", example: "An AI-generated photo of an event that never happened." },
  { term: "out-of-band verification", definition: "Confirming a request through a different, trusted channel rather than the one it arrived on, like hanging up and calling a known number back. The defence that beats any fake.", example: "Call the CFO on their saved number, not the one the caller gave you." },
  { term: "safe word", definition: "A private phrase agreed in advance with family or colleagues, used to prove identity on a call when something feels off.", example: "'What's our safe word?' stops a cloned voice cold." },
  { term: "BEC", definition: "Business Email Compromise: fraud where an attacker impersonates a trusted person to trigger a payment or data release. Deepfakes supercharge it.", example: "A fake 'CEO' ordering an urgent, secret transfer." },
  { term: "liveness check", definition: "A test that a real, present human is in front of the camera or mic right now, like asking them to turn their head or respond to a prompt, used to defeat replayed or injected fakes.", example: "'Please wave your hand in front of your face.'" },
  { term: "C2PA", definition: "Content Credentials: an open standard that attaches cryptographically signed, tamper-evident 'where did this come from' data to a media file. It proves what a signer claimed, not that the claim is true, and can be stripped.", example: "A 'nutrition label' showing a photo's origin and edits." },
  { term: "provenance", definition: "The recorded origin and edit history of a piece of media. Checking provenance ('where did this actually come from?') is replacing 'does it look fake?' as the defender's edge.", example: "A news image signed by the camera and the newsroom." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const AI = "#B15BFF";
const FAKE = "#f26d72";

/* ───────────────────────── the scenario / decision lab ───────────────────────── */

type Tell = { text: string; red: boolean; note: string };
type Decision = { text: string; ok: boolean; why: string };
type Scene = {
  medium: "video" | "voice" | "email" | "protocol";
  from?: string;
  meta?: string;
  lines: string[];
  tells?: Tell[];
  decision: Decision[];
};

function MediaCard({ scene }: { scene: Scene }) {
  if (scene.medium === "video") {
    return (
      <div style={{ background: "#0d0f16", border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 13px", background: "rgba(242,109,114,0.08)", borderBottom: `1px solid ${C.lineSoft}` }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: FAKE, boxShadow: `0 0 8px ${FAKE}` }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: FAKE, fontWeight: 700 }}>LIVE</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.soft }}>video call · {scene.meta}</span>
        </div>
        <div style={{ display: "flex", gap: 7, padding: "12px 13px", flexWrap: "wrap" }}>
          {["Renn Osei (CFO)", "L. Park (Finance)", "You"].map((n, i) => (
            <div key={i} style={{ flex: "1 1 120px", minWidth: 110, aspectRatio: "16/10", borderRadius: 8, background: i === 2 ? C.carbon : "linear-gradient(135deg,#1b2030,#2a2340)", border: `1px solid ${C.lineSoft}`, display: "grid", placeItems: "end start", padding: 7 }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.soft, background: "rgba(0,0,0,0.5)", borderRadius: 4, padding: "1px 5px" }}>{n}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 14px 13px" }}>
          {scene.lines.map((l, i) => <p key={i} style={{ margin: "4px 0", fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}><span style={{ color: FAKE, fontFamily: MONO, fontSize: 11 }}>&quot;CFO&quot;: </span>{l}</p>)}
        </div>
      </div>
    );
  }
  if (scene.medium === "voice") {
    return (
      <div style={{ background: "#0d0f16", border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px" }}>
          <span style={{ width: 30, height: 30, borderRadius: "50%", background: AI, display: "grid", placeItems: "center", color: "#0b0820", fontWeight: 700 }}>▶</span>
          <div style={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
            {Array.from({ length: 44 }).map((_, i) => <span key={i} style={{ width: 2.5, height: 5 + Math.abs(Math.sin(i * 0.9)) * 20, background: C.mute, borderRadius: 2, opacity: 0.6 }} />)}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>0:14</span>
        </div>
        <div style={{ padding: "0 14px 13px", borderTop: `1px solid ${C.lineSoft}`, paddingTop: 11 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute, marginBottom: 5 }}>voicemail · {scene.meta} · auto-transcript</div>
          {scene.lines.map((l, i) => <p key={i} style={{ margin: "3px 0", fontSize: 13.5, color: C.soft, lineHeight: 1.5, fontStyle: "italic" }}>{l}</p>)}
        </div>
      </div>
    );
  }
  if (scene.medium === "email") {
    return (
      <div style={{ background: "#0d0f16", border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.lineSoft}` }}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.ink }}><span style={{ color: C.mute }}>From: </span>{scene.from}</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.ink, marginTop: 3 }}><span style={{ color: C.mute }}>Subject: </span>{scene.meta}</div>
        </div>
        <div style={{ padding: "12px 14px" }}>
          {scene.lines.map((l, i) => <p key={i} style={{ margin: "5px 0", fontSize: 13.5, color: C.soft, lineHeight: 1.55 }}>{l}</p>)}
        </div>
      </div>
    );
  }
  // protocol
  return (
    <div style={{ background: "rgba(177,91,255,0.05)", border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
      {scene.lines.map((l, i) => <p key={i} style={{ margin: "5px 0", fontSize: 14, color: C.ink, lineHeight: 1.55 }}>{l}</p>)}
    </div>
  );
}

function TellPicker({ tells }: { tells: Tell[] }) {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  function toggle(i: number) { setPicked((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; }); }
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: C.mute, margin: "0 0 8px" }}>SPOT THE RED FLAGS · tap the ones that should make you suspicious (practice, not the pass)</div>
      <div style={{ display: "grid", gap: 7 }}>
        {tells.map((t, i) => {
          const on = picked.has(i);
          return (
            <div key={i}>
              <button onClick={() => toggle(i)} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "8px 11px", borderRadius: 8, border: `1px solid ${on ? (t.red ? C.amber : C.mute) : C.line}`, background: on ? (t.red ? "rgba(232,163,61,.08)" : "rgba(121,131,159,.08)") : C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>
                <span style={{ marginRight: 8, color: on ? (t.red ? C.amber : C.mute) : C.mute }}>{on ? (t.red ? "⚑" : "○") : "·"}</span>{t.text}
              </button>
              {on && <div style={{ padding: "5px 11px 2px", fontSize: 12, color: t.red ? "#f3d6a0" : C.mute, lineHeight: 1.45 }}>{t.red ? "Red flag: " : "Not a reliable sign: "}{t.note}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScenarioSurface({ scene, onSolved }: { scene: Scene; onSolved: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [decision] = useState(() => shuffle(scene.decision));
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <MediaCard scene={scene} />
      {scene.tells && <TellPicker tells={scene.tells} />}
      <div>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: AI, fontWeight: 700, margin: "0 0 8px" }}>YOUR DECISION · what do you do? (this is the pass)</div>
        <div style={{ display: "grid", gap: 8 }}>
          {decision.map((d, i) => {
            const isP = picked === i;
            return (
              <div key={i}>
                <button onClick={() => { setPicked(i); if (d.ok && !solved) { setSolved(true); onSolved(); } }} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${isP ? (d.ok ? C.green : C.red) : C.line}`, background: isP ? (d.ok ? "rgba(85,217,140,.08)" : "rgba(242,109,114,.06)") : C.panel, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>
                  <span style={{ color: isP ? (d.ok ? C.green : C.red) : C.mute, marginRight: 8 }}>{isP ? (d.ok ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>{d.text}
                </button>
                {isP && <div style={{ padding: "7px 12px 2px", fontSize: 12.5, color: d.ok ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{d.why}</div>}
              </div>
            );
          })}
        </div>
      </div>
      {solved && <div className="co-anim co-pop" style={{ fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ verified, not trusted. That decision beats the fake no matter how good it is.</div>}
    </div>
  );
}

/* ───────────────────────── a single step ───────────────────────── */

type Step = { title: string; goal: string; scene: Scene };

function StepView({ step, onSolved }: { step: Step; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(177,91,255,0.05)", border: `1px solid ${C.line}` }}>{G(step.goal, `step-${step.title}`)}</div>
      <ScenarioSurface scene={step.scene} onSolved={onSolved} />
    </div>
  );
}

/* ───────────────────────── the main engagement (4 scenarios) ───────────────────────── */

const VERIFY = "End the call and verify on Renn's known internal number before acting";
const ACT_STEPS: Step[] = [
  {
    title: "The video call", goal: "Scenario 1 - You join a 9am video call. The 'CFO' and two 'colleagues' are on screen and sound right. He says a confidential acquisition means you must wire GBP 185,000 to a new supplier today, and keep it off email. Decide what to do.",
    scene: {
      medium: "video", meta: "09:02 · 3 participants",
      lines: ["This is strictly confidential, do not discuss it with anyone.", "I need GBP 185,000 wired to a new supplier today, legal will brief the team later.", "Let's keep this off email for now."],
      tells: [
        { text: "He never turns his head fully sideways", red: true, note: "profiles are hard for deepfakes; reluctance to turn is a classic live tell." },
        { text: "A faint shimmer along his shirt collar", red: true, note: "warping at the edges of the face/body is a common artefact." },
        { text: "His reflection differs between his two eyes", red: true, note: "inconsistent eye reflections are a known deepfake giveaway." },
        { text: "The call is at 9am", red: false, note: "the time of day tells you nothing about authenticity." },
        { text: "He is wearing a suit", red: false, note: "appearance is not evidence; focus on the request and verification." },
      ],
      decision: [
        { text: "Wire the GBP 185,000 now, he's the CFO and it's clearly urgent", ok: false, why: "Urgency + secrecy + a new payee is the exact shape of CEO-fraud. A live video of someone you recognise is no longer proof." },
        { text: "Spot a deepfake tell first, then wire it anyway to be safe", ok: false, why: "Spotting a tell is a bonus, not a decision. Acting on the request is still the mistake." },
        { text: VERIFY, ok: true, why: "The durable defence: don't trust the channel the request arrived on. A call back on a known number plus dual authorisation beats any deepfake." },
        { text: "Reply on this same call to confirm that it's really him", ok: false, why: "You'd be verifying the fake using the fake. Confirmation has to come through a separate, trusted channel." },
      ],
    },
  },
  {
    title: "The voicemail", goal: "Scenario 2 - A voicemail 'from Mum': shaky voice, she's had an accident and needs GBP 400 sent right now, and please don't tell Dad. It genuinely sounds like her. Why is 'but it really sounds like Mum' not a reason to pay?",
    scene: {
      medium: "voice", meta: "from 'Mum'",
      lines: ["(shaky) Darling, I've had a bit of an accident, I'm okay but I need help.", "Please send GBP 400 to this account right now, I can't talk long.", "And please, don't tell your dad, I don't want to worry him."],
      tells: [
        { text: "No natural breaths between sentences", red: true, note: "cloned voices often miss breaths, lip smacks and mouth noises." },
        { text: "A faint glitch in the middle of a word", red: true, note: "digital artefacts and clipping are audio tells." },
        { text: "'Don't tell your dad' (secrecy)", red: true, note: "enforced secrecy is a core fraud red flag, in any medium." },
        { text: "She sounds upset", red: false, note: "emotion is easy to fake and easy to feel; it is not evidence." },
      ],
      decision: [
        { text: "A voice clones from seconds of audio, so sounding exactly like her proves nothing - call her back on her saved number.", ok: true, why: "Right. Out-of-band verification, plus a pre-agreed safe word, defeats a clone instantly however real it sounds." },
        { text: "It isn't a reason to pay - a voice this convincing is almost certainly really her, so sending the GBP 400 is fine.", ok: false, why: "That's the exact instinct the scam exploits. A convincing voice is now trivial to fake from a short clip." },
        { text: "A GBP 400 request is far too small for anyone to bother cloning a voice and faking an accident for.", ok: false, why: "Small, urgent sums are the staple of these scams precisely because people pay them without checking." },
        { text: "A genuine emergency would always arrive as a live phone call from her, never as a one-way voicemail.", ok: false, why: "The channel it arrives on proves nothing. Verify through one you already trust, not the one it came on." },
      ],
    },
  },
  {
    title: "The email", goal: "Scenario 3 - A clean, friendly email asks you to update a supplier's bank details before Friday's payment run. Spotless grammar, nothing obviously off. Why won't 'check the sender's address and proceed if it looks right' keep you safe?",
    scene: {
      medium: "email", from: "accounts@arup-finance-portal.com", meta: "Please update our remittance details before Friday",
      lines: ["Hi, hope you're well.", "We've changed banks. Please update our remittance details so Friday's payment reaches the new account.", "Appreciate you sorting this before the run. Thanks!"],
      tells: [
        { text: "The sender domain is arup-finance-portal.com, not the real company domain", red: true, note: "a look-alike domain is a top giveaway; always check it character by character." },
        { text: "It asks to CHANGE bank details", red: true, note: "a bank-detail change is the single most abused request in BEC; always verify it." },
        { text: "There's a Friday deadline", red: true, note: "manufactured time pressure pushes you to skip checks." },
        { text: "The grammar is perfect, so it's safe", red: false, note: "a trap: AI writes flawless phishing now, so good English is no longer reassurance." },
      ],
      decision: [
        { text: "A look-alike domain passes a glance and even a real address can be spoofed, so phone the supplier on a number you already hold.", ok: true, why: "Right. The address proves nothing; verify a bank-detail change out-of-band, through a contact you already trust." },
        { text: "It would keep you safe - if the sender's domain reads correctly then the email is confirmed genuine and you can action it.", ok: false, why: "No. Look-alike domains and spoofing both sail past that check. An address is never proof of intent." },
        { text: "It won't, because carefully reading the sender's address simply takes too long with Friday's payment run looming.", ok: false, why: "The deadline is manufactured pressure, not a reason to skip verification - just verify through a known channel." },
        { text: "It won't, because supplier bank-detail changes are routine and always genuine, so there is nothing to check.", ok: false, why: "The opposite: a bank-detail change is the single most abused request, and must always be verified out-of-band." },
      ],
    },
  },
  {
    title: "The protocol", goal: "Scenario 4 - The arms race truth. Generators keep getting better, so 'looking harder' is a losing game. What is the one move that beats ANY deepfake, however perfect?",
    scene: {
      medium: "protocol",
      lines: ["The generators improve faster than the detectors, so spotting tells gets less reliable every year.", "A payment or data request arrives and everything looks and sounds right. What is the move that still works?"],
      decision: [
        { text: "Look harder for visual glitches in the video before you decide", ok: false, why: "Detection is a losing arms race: the best fakes have no visible tells. Never rely on spotting them." },
        { text: "Ask them something personal on the call to prove who they are", ok: false, why: "Weak: attackers research their targets, and a real-time clone can improvise. Not a reliable check." },
        { text: "Verify out-of-band on a known channel, with dual approval", ok: true, why: "This is the durable defence and it works regardless of fake quality: verify through a separate trusted channel with a safe word and a second approver, not the channel it arrived on." },
        { text: "Trust it if the person seems calm, fluent and professional", ok: false, why: "Demeanour is fully fakeable. 'Seeing and hearing is believing' is exactly the instinct deepfakes exploit." },
      ],
    },
  },
];

function DeepfakeAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STEPS.map(() => false));
  const step = ACT_STEPS[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { if (si + 1 < ACT_STEPS.length) setSi(si + 1); else onCapture(); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ACT_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? AI : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(177,91,255,.08)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? AI : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{s.title}</span>
          </div>
        ))}
      </div>
      <StepView key={si} step={step} onSolved={solved} />
      {cleared[si] && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Scenario {si + 1} handled</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STEPS.length ? "Next scenario →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: detect vs verify ───────────────────────── */

function DetectVsVerifyLab({ onDone }: { onDone: () => void }) {
  const [choice, setChoice] = useState<"detect" | "verify" | null>(null);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: AI, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · a flawless fake, two responses</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 11 }}>A video call from your &quot;manager&quot; looks and sounds perfect, no glitches at all. There is money on the line. Which response actually keeps you safe?</div>
      <div style={{ display: "grid", gap: 8 }}>
        <button onClick={() => setChoice("detect")} className="co-opt" style={{ textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${choice === "detect" ? C.red : C.line}`, background: choice === "detect" ? "rgba(242,109,114,.06)" : C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>
          <span style={{ color: choice === "detect" ? C.red : C.mute, marginRight: 8 }}>{choice === "detect" ? "✗" : "A"}</span>Study the video harder for tells, then decide
        </button>
        <button onClick={() => { setChoice("verify"); onDone(); }} className="co-opt" style={{ textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${choice === "verify" ? C.green : C.line}`, background: choice === "verify" ? "rgba(85,217,140,.08)" : C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>
          <span style={{ color: choice === "verify" ? C.green : C.mute, marginRight: 8 }}>{choice === "verify" ? "✓" : "B"}</span>Hang up and call them back on a number you already trust
        </button>
      </div>
      {choice === "detect" && <div style={{ marginTop: 11, fontSize: 13, color: C.soft, lineHeight: 1.5 }}>The best fakes have no visible tells, and generators improve every month. &quot;Looking harder&quot; is a losing arms race, so it can&apos;t be your decision.</div>}
      {choice === "verify" && <div style={{ marginTop: 11, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>That is the whole module in one move. <b>Out-of-band verification</b> works no matter how perfect the fake is, because you stop trusting the channel it came on and confirm through one you already trust.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab ───────────────────────── */

function PickDefenceLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [opts] = useState(() => shuffle([
    { code: `train staff to spot deepfake tells in calls and video`, ok: false, why: "Useful awareness, but a losing bet on its own: the best fakes have no tells and detection gets weaker every year. Never the primary control." },
    { code: `buy the strongest deepfake-detection tool on the market`, ok: false, why: "Detectors help at scale but lose the arms race against new generators, and can be bypassed. A useful layer, not the foundation." },
    { code: `verify money requests out-of-band and require two approvers`, ok: true, why: "The control that moves the needle: confirm any payment or bank-detail change through a known channel, require two people for large transfers, and use a code word for sensitive requests. A process, not a detector." },
    { code: `require staff to be on camera for every payment request`, ok: false, why: "Video is exactly what deepfakes fake, so being 'on camera' proves nothing now. It adds friction without adding real verification." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: AI, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · what protects an organisation best?</div>
      <div style={{ display: "grid", gap: 8 }}>
        {opts.map((o, i) => {
          const isP = picked === i;
          return (
            <div key={i}>
              <button onClick={() => { setPicked(i); if (o.ok) onDone(); }} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${isP ? (o.ok ? C.green : C.red) : C.line}`, background: isP ? (o.ok ? "rgba(85,217,140,.08)" : "rgba(242,109,114,.06)") : C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>
                <span style={{ color: isP ? (o.ok ? C.green : C.red) : C.mute, marginRight: 8 }}>{isP ? (o.ok ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>{o.code}
              </button>
              {isP && <div style={{ padding: "7px 12px 2px", fontSize: 12.5, color: o.ok ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{o.why}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; step: Step; success: string };

const DRILLS: DrillCfg[] = [
  {
    client: "Brightpost", brief: "A WhatsApp voice note 'from your boss' asks you to urgently buy GBP 500 of gift cards and send the codes. Decide. No walkthrough.",
    step: { title: "Voice note", goal: "Gift cards, 'I'm in a meeting', 'keep it between us' - what does that combination tell you?", scene: { medium: "voice", meta: "from 'your boss'", lines: ["Quick favour, I'm in a meeting. Buy GBP 500 of gift cards and send me the codes now.", "Keep it between us, I'll explain later."], decision: [{ text: "It's the classic gift-card scam shape of urgency and secrecy, so don't act - check with your boss on their known number.", ok: true, why: "Right. That pattern is a textbook scam, and out-of-band verification kills it instantly." }, { text: "It tells you the boss is genuinely busy, so the quickest way to help is to buy the cards and send the codes over.", ok: false, why: "That's the scam working. Gift-card + urgency + secrecy should stop you, not speed you up." }, { text: "Nothing much, since gift cards are a normal and easily-refunded way to pay with very little real risk.", ok: false, why: "Gift-card codes are effectively untraceable cash; once sent they're gone. That's why scammers ask for them." }, { text: "That you should reply straight to the voice note and ask whether it is really them before buying anything.", ok: false, why: "Replying on the attacker's own channel proves nothing. Use a channel you already trust." }] } },
    success: "Verified through a trusted channel instead of trusting the voice. Finding logged.",
  },
  {
    client: "Kudos", brief: "An email from your 'landlord' at a look-alike domain says rent must now go to a new account. Decide.",
    step: { title: "Email", goal: "You're tempted to just check the new account's name matches the landlord before paying. Why isn't that enough?", scene: { medium: "email", from: "payments@kudos-lettings-portal.com", meta: "New rent payment details", lines: ["Our bank has changed. Please send this month's rent to the new account below.", "Please action today to avoid a late fee."], tells: [{ text: "Look-alike sender domain", red: true, note: "always check the domain character by character." }, { text: "Bank-detail change + deadline", red: true, note: "the most abused request in fraud." }], decision: [{ text: "Fraudsters set the account name themselves, so a match proves nothing - call the landlord on the number you already hold.", ok: true, why: "Right. Only an out-of-band check against a contact you already trust confirms a bank-detail change." }, { text: "It is enough - banks guarantee the name always matches the real account holder, so a match confirms it is genuine.", ok: false, why: "Name-checking is far weaker than that, and an attacker controls the name on their own account. Not proof." }, { text: "It isn't, because you should reply to the email first and ask the landlord to confirm the new account name.", ok: false, why: "That's replying to the attacker's look-alike address. Verify through a known channel instead." }, { text: "It isn't, because the looming late-fee deadline means there is really no time to check the name anyway.", ok: false, why: "Manufactured urgency is the pressure tactic, not a reason to skip the real check." }] } },
    success: "Confirmed the change through a known contact, not the email. Finding logged.",
  },
  {
    client: "Verge", brief: "On a video call, a 'client' you've never met insists on an immediate confidential deposit. Decide.",
    step: { title: "Video call", goal: "A client you've never met is live on camera wanting a confidential deposit within the hour. 'But they're right there on video' - why isn't that proof it's safe to pay?", scene: { medium: "video", meta: "video call · 1 participant", lines: ["I need the deposit wired in the next hour, strictly confidential.", "Don't loop in your finance team, this is sensitive."], tells: [{ text: "Won't let you involve finance (secrecy)", red: true, note: "bypassing normal process is a core red flag." }, { text: "They're on camera", red: false, note: "a live face is not proof of identity any more." }], decision: [{ text: "A live face can be deepfaked in real time, so being on camera proves nothing - decline and verify through your normal process.", ok: true, why: "Right. 'Seeing is believing' is ending; a live video isn't identity. Follow process and verify out-of-band." }, { text: "It is proof - a real-time video call simply can't be faked, so if they're on camera you can safely wire the deposit.", ok: false, why: "Real-time deepfakes on live calls are exactly the fast-rising threat here. A face on screen is no longer proof." }, { text: "It isn't proof, so you should ask the client several personal questions on the call to be sure who they are.", ok: false, why: "A real-time clone improvises and attackers prepare. Questions on the same call aren't a reliable check." }, { text: "It isn't proof, so taking a smaller deposit now and the rest once they're verified is a safe compromise.", ok: false, why: "Any money moved on an unverified request is at risk. Verify before anything is paid." }] } },
    success: "Refused to let a video call bypass your process; verified out-of-band. Finding logged.",
  },
  {
    client: "Oakline", brief: "The full job. A 'director' video-calls demanding a secret same-day transfer, says do not tell anyone. Everything looks perfect. Decide, and know why.",
    step: { title: "The protocol", goal: "A flawless fake, real pressure. Choose the move that beats it.", scene: { medium: "video", meta: "video call · director", lines: ["Same-day transfer, strictly between us, I'll explain later.", "I need this done before the markets close."], tells: [{ text: "Secrecy + extreme urgency", red: true, note: "the pressure is the attack, in any medium." }], decision: [{ text: "Look for tells, then transfer the money if it seems real", ok: false, why: "Detection is a losing game and acting on the request is the mistake." }, { text: "Refuse, verify out-of-band, and require dual authorisation", ok: true, why: "The durable defence, regardless of how perfect the fake is: verify through a trusted channel and require two people." }, { text: "Transfer it but keep a recording of the call as proof", ok: false, why: "A recording of a deepfake isn't proof, and the money is already gone. Verify first." }, { text: "Do it quietly as asked, since the director demanded secrecy", ok: false, why: "Enforced secrecy is the attack, not a reason to comply. Secrecy + urgency should raise the alarm." }] } },
    success: "Beat a flawless fake with process, not pixel-spotting: verify out-of-band, dual approval. Finding logged.",
  },
];

function DrillRunner({ cfg, onSolved }: { cfg: DrillCfg; onSolved: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!done && <StepView key={cfg.client} step={cfg.step} onSolved={() => { setDone(true); onSolved(); }} />}
      {done && <div className="co-anim co-pop" style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55`, fontSize: 13, color: "#bff3d3", lineHeight: 1.5 }}>✓ {cfg.success}</div>}
    </div>
  );
}

function ConsolidationDrills({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(DRILLS.map(() => false));
  const d = DRILLS[i];
  function onSolved() { setSolved((s) => { const n = [...s]; n[i] = true; return n; }); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DRILLS.map((dr, k) => (
          <div key={dr.client} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${k === i ? AI : C.lineSoft}`, background: solved[k] ? "rgba(85,217,140,.08)" : k === i ? "rgba(177,91,255,.08)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: solved[k] ? C.green : k === i ? AI : C.mute, fontWeight: 700 }}>{solved[k] ? "✓" : `drill ${k + 1}`}</span>
          </div>
        ))}
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{d.client}</div>
        <p style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>{d.brief}</p>
      </div>
      <DrillRunner key={d.client} cfg={d} onSolved={onSolved} />
      {solved[i] && (
        <div style={{ display: "flex" }}>
          <Btn tone="g" onClick={() => { if (i + 1 < DRILLS.length) setI(i + 1); else onDone(); }} style={{ marginLeft: "auto" }}>{i + 1 < DRILLS.length ? "Next drill →" : "On to the debrief →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── capstone ───────────────────────── */

const CAP_STEPS: Step[] = [
  { title: "The primer", goal: "A coordinated attack on Sableline begins. First, an email from a look-alike domain warns that 'the CFO will call you shortly about an urgent matter'. What do you do?", scene: { medium: "email", from: "exec-office@sableline-grp.com", meta: "The CFO will call you shortly", lines: ["Please expect an urgent call from the CFO about a confidential transfer.", "Kindly keep this discreet."], tells: [{ text: "Look-alike domain + priming you for a call + secrecy", red: true, note: "attackers now chain email, voice and video to build belief." }], decision: [{ text: "Get ready to act fast the moment the CFO's call comes in", ok: false, why: "The email is priming you to lower your guard. Recognise the setup." }, { text: "Treat it as suspicious and plan to verify any request out-of-band", ok: true, why: "Spotting the multi-channel setup early is half the defence. Decide now to verify whatever comes next." }, { text: "Reply to the email to ask the exec office whether it's genuine", ok: false, why: "You'd be replying to the attacker's own channel. A look-alike domain won't tell you the truth." }, { text: "Ignore it; it's probably just internal spam about a meeting", ok: false, why: "Dismissing it loses the warning. The right move is to stay alert and verify, not to tune it out." }] } },
  { title: "The call", goal: "Minutes later, the 'CFO' video-calls, perfectly lifelike, demanding a secret same-day transfer. Decide.", scene: { medium: "video", meta: "video call · CFO", lines: ["As my email said, I need a confidential transfer today, keep it between us.", "I'm about to go into a board meeting, please just handle it."], decision: [{ text: "Act on it; the email warned you and now the CFO is on video", ok: false, why: "That's exactly the trap the email set. A lifelike video is not proof." }, { text: "Refuse to act, and verify the CFO on a known internal number", ok: true, why: "Out-of-band verification, even after a convincing setup. The call and the email are the same attack." }, { text: "Ask the CFO a personal question on the call to be sure it's him", ok: false, why: "A real-time deepfake can improvise, and attackers research their targets. Not a reliable check." }, { text: "Start the transfer but hold it until after the board meeting ends", ok: false, why: "You'd still be acting on an unverified request. Verify first, through a separate channel, before anything moves." }] } },
  { title: "The protocol", goal: "Finish it: name the single control that would have stopped this whole chain, no matter how perfect the fakes were.", scene: { medium: "protocol", lines: ["The email, the voice, the video were all fake, and all convincing.", "What one control defeats the entire chain?"], decision: [{ text: "Roll out better deepfake detection on every incoming video feed", ok: false, why: "Loses the arms race and wouldn't stop the email or voice legs." }, { text: "Mandatory out-of-band verification plus dual authorisation for payments", ok: true, why: "One process beats every leg: no payment moves without a trusted-channel check and a second approver, however real the fakes look." }, { text: "Train all staff to spot the tells in fake audio and video", ok: false, why: "Awareness helps, but the best fakes have no tells and training fades. Not a control you can rely on." }, { text: "Require everyone to be on camera for any payment request", ok: false, why: "Video is exactly what the attacker faked. Being on camera proves nothing against a deepfake." }] } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STEPS.length) setTimeout(() => setPhase((p) => p + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STEPS.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · coordinated attack · step {Math.min(phase + 1, CAP_STEPS.length)} of {CAP_STEPS.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${FAKE}, ${AI})`, transition: "width .4s" }} /></div>
      {!won && <StepView key={phase} step={CAP_STEPS[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}v3rify_d0nt_trust_your_3y3s{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "50ch" }}>You beat a coordinated email-plus-voice-plus-video attack with one habit, not one gadget: verify through a trusted channel and require a second approver. That is the whole AI Frontier, in a single move.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE20: ModuleDef = {
  code: "M-20",
  moduleNo: 20,
  title: "Deepfakes & the AI Arms Race",
  client: "Sableline Group",
  brief:
    "The final engagement, and a different kind: you cannot hack a deepfake, so this one is about beating it. AI can now fake a voice from seconds of audio and a face on a live video call, and criminals use it to order urgent, secret payments. All in your browser, from described scenarios (no real media is made): face a deepfake video call demanding a transfer, a cloned-voice voicemail, and an AI-written phishing email, spot the tells, and make the one decision that beats any fake, no matter how perfect. Then four field jobs, and a final coordinated-attack challenge. The lesson is a habit, not a gadget.",
  industry: {
    tag: "You cannot out-stare a perfect fake. You can refuse to trust the channel it arrived on.",
    motif: { pre: "the voice says: ", hit: "it's me, send it now, don't tell anyone", post: "", note: "and it is not them at all" },
    primer: {
      term: "Deepfakes",
      what: "A deepfake is video, audio or imagery that AI has generated or altered so it looks or sounds like a real person saying or doing something they never did. They are made by training a model on real samples of the target, and the scary part is how little it now takes: a voice can be cloned from a few seconds of audio grabbed from a podcast or a social post. Because the fake can be near-perfect, the defence is not 'listen harder', it is to verify the request through another channel.",
      example: "Cloning a parent's voice from a short clip to leave a panicked fake voicemail asking the child to send money.",
      returns: "No exploit, no code. The attacker fakes a trusted face or voice and leans on urgency and secrecy to rush a payment. You cannot reliably spot the best fakes, so your win here is a decision: verify out-of-band, every time.",
    },
    learn: [
      "Spot the tells in a deepfake video, a cloned voice, and an AI phishing email.",
      "Recognise the fraud shape behind them all: urgency, secrecy, an unusual payment.",
      "Make the decision that beats any fake: verify out-of-band.",
      "Understand the arms race, and why detectors alone are a losing bet.",
    ],
    enginesTitle: "The arms race: the tools on each side",
    engines: [
      { name: "Detection & provenance (C2PA)", color: "#5fe6ff", blurb: "Where the defender works: detectors like Reality Defender and Intel FakeCatcher, and the C2PA 'Content Credentials' standard that signs where media came from. The battleground.", here: true, icon: "shield" },
      { name: "ElevenLabs (voice)", color: "#B15BFF", blurb: "A leading voice-cloning platform. A legitimate product, widely abused to mimic a voice from seconds of audio.", icon: "tool" },
      { name: "HeyGen / Synthesia (video)", color: "#ffb347", blurb: "AI video-avatar tools that turn a script into a lifelike talking presenter, the same tech behind deepfake 'executives'.", icon: "browser" },
      { name: "DeepFaceLab / FaceSwap", color: "#f26d72", blurb: "Open-source face-swapping toolkits used to build classic face-on-another-body deepfake video.", icon: "scan" },
    ],
    headline: {
      masthead: "THE SIGNAL DISPATCH",
      dateline: "HONG KONG · 2024 · SCMP / CNN / CFO DIVE",
      title: "A finance worker wired 25 million dollars after a video call with fake colleagues",
      body: "A finance employee at Arup, a major British engineering firm, was asked by a message from the 'CFO' about a confidential transaction. Suspicious at first, the employee joined a video call with the CFO and several colleagues. They looked and sounded right, so the employee complied. Every other person on the call was an AI-generated deepfake, built from publicly available footage of real staff. Over about a week the employee made 15 transfers before contacting head office and realising it was fake.",
      stat: "£20M",
      statLabel: "SENT AFTER A VIDEO CALL OF PEOPLE WHO WERE ALL FAKE",
      why: "It shattered the instinct that a live video of people you recognise is proof they are real. The attack did not hack a computer, it hacked a person, which is why the defence is a verification habit, not a piece of software.",
    },
    realWorld:
      "Deepfakes move fraud from the inbox to the face and the voice. The classic scams, a fake boss ordering an urgent secret payment, now come with a lifelike video or a cloned voice, so 'seeing and hearing is believing' no longer holds. The criminals do not break any system; they impersonate a trusted person and lean on urgency and secrecy to rush a transfer. That is why this is defence-led: the fix is a human process, not a clever exploit.",
    now: {
      stat: "4x",
      statLabel: "deepfake fraud attempts, 2023 to 2024 (Sumsub Identity Fraud Report 2024)",
      body: "Deepfake incidents roughly quadrupled between 2023 and 2024, and deepfakes made up about 7% of all identity-fraud attempts globally, according to Sumsub's 2024 report. Cloning tools are cheap, public, and need only seconds of sample audio, so the attempts keep climbing.",
    },
    recent: {
      year: "2024",
      title: "The deepfake call that targeted the world's biggest ad firm",
      body: "Fraudsters set up a fake account impersonating WPP's chief executive and arranged a video meeting using a voice clone and public footage of another executive, aiming to extract money and details. The attempt failed, because the targeted employee was suspicious and verified. The mirror image of Arup: the same attack, defeated by one vigilant human.",
    },
    ahead:
      "The generators are improving faster than the detectors, so 'spot the artefact' detection is losing reliability and the battle is shifting to provenance (signing where media came from, like C2PA) and to liveness checks that prove a real human is present in real time. Real-time deepfakes in live video calls, the Arup vector, are the fast-rising frontier, pushing banks and firms to make out-of-band verification and dual payment approval mandatory. The deeper shift is cultural: 'seeing is believing' is ending, and the durable defence is verifying through a second trusted channel.",
    role:
      "This is daily work for fraud analysts, threat intelligence analysts, trust and safety engineers and digital forensics analysts, the people who protect organisations and platforms as synthetic media goes mainstream. It is one of the most human corners of cyber security.",
    roles: ["Fraud analyst", "Threat intelligence analyst", "Trust & Safety engineer", "Digital forensics analyst"],
    readLine: "a 2 minute read before you defend",
    whyPunch: "You cannot spot the best fakes. You can refuse to be rushed.",
  },
  lesson: {
    blocks: [
      { h: "What a deepfake actually is", body: "A deepfake is video, audio or an image that AI has generated or altered to show a real person saying or doing something they never did. Models are trained on real samples of the target, and it takes shockingly little: a voice can be cloned from a few seconds of audio from a podcast, a voicemail greeting or a social post. The result can be near-perfect, in real time, on a live call." },
      { h: "Why this is a security module", body: "Deepfakes are a social-engineering weapon. The classic con, a fake boss demanding an urgent, secret payment, now arrives with a lifelike face or a familiar voice, so the victim's instinct ('I can see and hear them, it must be real') is turned against them. Nobody breaks a system; they impersonate a trusted person. The Arup fraud, 25 million dollars lost after a video call of entirely fake colleagues, is the template." },
      { h: "The tells, and why you can't rely on them", body: "There are signs: warping at the edges of a face, mismatched eye reflections, reluctance to turn sideways, missing breaths in a cloned voice, wrong hands in AI images. Learn them, but trust them only as hints. The old giveaways (no blinking, bad grammar in phishing) have already been trained out, and generators improve monthly. Spotting tells is a losing arms race, so it can inform you but never be your decision." },
      { h: "The fraud shape never changes", body: "Underneath every deepfake scam is the same pattern: urgency ('right now'), secrecy ('don't tell anyone'), and an unusual or changed payment ('new supplier', 'new account'). That shape is the reliable signal, and it does not care how good the fake is. If a request has all three, treat it as hostile no matter whose face or voice is delivering it." },
      { h: "The one move that always works", body: "Out-of-band verification: confirm the request through a different, trusted channel, hang up and call back on a number you already have, use a pre-agreed safe word, require a second person to approve a payment. It works regardless of fake quality, because you stop trusting the channel the request arrived on. Provenance standards like C2PA (signing where media came from) are the long-term technical answer, but verification is the move you can make today." },
    ],
    Interactive: DetectVsVerifyLab,
    summary: [
      "A deepfake is AI-made or AI-altered video/voice/image; a voice can be cloned from seconds of audio.",
      "It is a social-engineering weapon: a trusted face or voice ordering an urgent, secret payment (the Arup $25m fraud).",
      "Tells (edge warping, odd eyes, missing breaths) are hints only; detection is a losing arms race, never your decision.",
      "The reliable signal is the fraud shape: urgency + secrecy + an unusual or changed payment.",
      "The move that always works is out-of-band verification: confirm through a separate trusted channel, with dual approval.",
    ],
    check: {
      q: "A company plans to defend against deepfake fraud by training everyone to spot fake audio and video. Why can't that be the defence it relies on?",
      options: [
        { text: "Generators improve faster than detectors, so the best fakes have no tells - the defence that works is verifying out-of-band, not spotting.", correct: true, feedback: "Right. 'Look harder' is a losing arms race. Verifying through a trusted channel works no matter how perfect the fake is." },
        { text: "Because training staff costs far more than buying deepfake-detection software, which catches every fake automatically.", feedback: "Detection software loses the same arms race, and nothing catches everything. Process beats detection." },
        { text: "It can rely on it - a well-trained eye can spot any deepfake, so awareness training is the main control it needs.", feedback: "The best fakes now have no visible tells, and trained skills fade. Awareness helps but can't be the main control." },
        { text: "Because deepfake fraud only ever targets senior executives, so training the ordinary staff adds very little value.", feedback: "Deepfake fraud targets whoever can move money or data - often ordinary staff. Everyone needs the verify habit." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "described scenarios on the range (a deepfake video call, a cloned-voice voicemail, an AI phishing email)",
    inScope: "examining the scenarios, flagging tells, and choosing a response; the consolidation clients named in each drill",
    offLimits: "making or using real deepfakes of real people, real payments, real accounts, anything beyond the described scenarios",
    timebox: "this session",
  },
  handler: "Four scenarios, four field jobs, then one coordinated-attack challenge. Face a deepfake video call, a cloned-voice voicemail, and an AI phishing email, flag the tells (good practice), then make the decision that actually beats a fake: verify out-of-band. The last scenario names the one habit that beats them all. Nothing here is real; every scenario is described text.",
  hint: "Flag the tells to build the skill, but the pass is the DECISION. In every case the safe choice is the same: do not act on the request through the channel it arrived on. Verify out-of-band (call back on a known number, use a safe word, require a second approver).",
  plan: [
    { label: "The video call", goal: "Face a deepfake CFO demanding an urgent secret transfer, and verify instead of paying." },
    { label: "The voicemail", goal: "Handle a cloned-voice family emergency with a saved number and a safe word." },
    { label: "The email", goal: "Catch an AI phishing email (perfect grammar, look-alike domain) and verify the bank-detail change." },
    { label: "The protocol", goal: "Name the one move that beats any fake: out-of-band verification plus dual approval." },
  ],
  Act: DeepfakeAct,
  flag: "flag{v3rify_d0nt_trust_your_3y3s}",
  defend: {
    blocks: [
      { h: "Detection is a layer, not the plan", body: "It is tempting to make 'train everyone to spot deepfakes' or 'buy a detector' the answer. Both help, neither holds: the best fakes have no visible tells, detectors lose ground to new generators every month, and awareness fades. Treat detection and detectors as useful layers, and build the real defence on a process that works even when the fake is perfect." },
      { h: "Make verification mandatory, not optional", body: "The control that actually moves the needle is organisational: mandatory out-of-band verification for any payment or change of bank details (call back on a known number, never one the caller gave you), dual authorisation so two people must approve large or unusual transfers, and a culture where urgency and secrecy are themselves red flags, not reasons to hurry. A pre-agreed safe word defeats a voice clone instantly. These are processes, and processes do not care how good the fake looks." },
      { h: "Shrink the attack surface and plan for provenance", body: "Limit the raw material: the less public audio and video of your executives and staff, the harder it is to clone them, so keep personal accounts private. For the long term, provenance standards like C2PA (Content Credentials) sign where media came from so tampering is detectable, and liveness checks prove a real human is present in real time. Adopt them as they mature, but anchor today's defence on verification and dual approval." },
    ],
    Interactive: PickDefenceLab,
    check: {
      q: "What is the single most effective control against deepfake-enabled payment fraud?",
      options: [
        { text: "Mandatory out-of-band verification plus dual authorisation for payments (a process, not a detector).", correct: true, feedback: "Right. A trusted-channel check and a second approver work regardless of how perfect the fake is." },
        { text: "Train staff thoroughly to spot the tells in fake audio and video.", feedback: "Useful awareness, but the best fakes have no tells and detection loses the arms race. Not the primary control." },
        { text: "Buy the best deepfake-detection software and run it on every call.", feedback: "A helpful layer at scale, but bypassable and always one step behind new generators." },
        { text: "Ban video calls for anything that involves money or payments.", feedback: "Impractical and still leaves voice and email. The fix is verifying the request, not the medium." },
      ],
    },
  },
  finding: {
    title: "Deepfake-enabled business email compromise (CEO/CFO fraud via synthetic voice and video)",
    where: "the human layer: payment and bank-detail requests arriving by video call, voice and email",
    severity: "High",
    cvss: "Likelihood: Medium-rising · Impact: Critical",
    impact: "An attacker impersonates a trusted executive or contact with a cloned voice or a deepfake video and leans on urgency and secrecy to trigger a fraudulent payment or a bank-detail change. No system is breached; the request simply looks and sounds real. Losses are often large and unrecoverable (Arup lost about GBP 20m in a single incident), plus reputational and regulatory harm. This is scored as organisational risk (likelihood x impact), not a software CVSS.",
    fix: "Mandatory out-of-band verification for any payment or bank-detail change (call back on a known number); dual authorisation for large or unusual transfers; a pre-agreed safe word for sensitive requests; treat urgency and secrecy as red flags; limit public audio/video of staff; and adopt provenance (C2PA) and liveness checks as they mature. The control that moves the needle most is a process, not a detector.",
  },
  takeaway: "You cannot reliably spot the best fakes, and you do not need to. Verify the request through a trusted channel and 'seeing is believing' stops being a weakness.",
  outcome: [
    "Recognise deepfake video, voice and image tells, and know why they are hints, not proof.",
    "Spot the fraud shape behind any deepfake scam: urgency, secrecy, and an unusual or changed payment.",
    "Beat any fake with the right decision: verify out-of-band, with a safe word and dual approval.",
    "Explain the deepfake arms race and why organisational process, not detection, is the durable defence.",
  ],
  cheatsheet: {
    title: "Deepfakes & verification quick reference",
    blurb: "How fakes are made, the tells (and why you can't rely on them), and the one habit that beats any of them. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "The tells are hints; the fraud shape is the signal. Whatever the medium, if a request has all three of these, treat it as hostile, no matter whose face or voice delivers it.",
      cols: ["the fraud shape", "what it sounds like", "why it works"],
      rows: [
        ["urgency", "'right now', 'before the markets close'", "rushes you past your checks"],
        ["secrecy", "'keep this between us'", "stops you asking a second person"],
        ["unusual payment", "'new supplier', 'new account'", "redirects money to the attacker"],
      ],
    },
    groups: [
      {
        heading: "The tells (hints, never proof)",
        entries: [
          { code: "video", what: "Edge warping/shimmer, mismatched eye reflections, reluctance to turn sideways, odd teeth, flicker.", example: "won't turn their head" },
          { code: "voice", what: "No natural breaths, flat or odd intonation, glitches, unnatural pacing.", example: "no breaths between sentences" },
          { code: "images", what: "Wrong hands/fingers, garbled text, mismatched accessories, impossible backgrounds. Fading fast.", example: "six fingers, melted sign text" },
          { code: "text/phishing", what: "The old tell (bad grammar) is gone: AI writes flawlessly. Watch the sender domain and the request, not the spelling.", example: "look-alike domain, bank-detail change" },
        ],
      },
      {
        heading: "The defence that always works",
        entries: [
          { code: "out-of-band verification", what: "Confirm the request through a different trusted channel, like calling back on a number you already have.", example: "hang up, call the known number" },
          { code: "safe word", what: "A private phrase agreed in advance; ask for it on a suspicious call to defeat a voice clone.", example: "'what's our safe word?'" },
          { code: "dual authorisation", what: "Require two people to approve large or unusual payments, so no one person can be rushed.", example: "two approvers for big transfers" },
          { code: "urgency + secrecy = stop", what: "Treat pressure and 'don't tell anyone' as red flags in themselves, not reasons to hurry.", example: "slow down, verify" },
        ],
      },
      {
        heading: "The arms race",
        entries: [
          { code: "generation tools", what: "ElevenLabs (voice), HeyGen/Synthesia (video), DeepFaceLab (face-swap): cheap, public, fast.", example: "a voice clone from seconds of audio" },
          { code: "detection tools", what: "Reality Defender, Intel FakeCatcher, Hive: useful at scale, but always chasing the newest generators.", example: "a risk score, not a guarantee" },
          { code: "C2PA / Content Credentials", what: "Signs where media came from so tampering shows. Proves what a signer claimed, can be stripped.", example: "a media 'nutrition label'" },
          { code: "liveness checks", what: "Prove a real human is present live (turn your head, respond to a prompt), to defeat replayed fakes.", example: "'wave in front of your face'" },
        ],
      },
    ],
  },
  rep: 90,
  repRank: "Lead Operator",
  repTo: "to Principal",
  next: "AI FRONTIER COMPLETE · Back to the posting →",
};

export default function Module20() {
  return <Engagement mod={MODULE20} />;
}
