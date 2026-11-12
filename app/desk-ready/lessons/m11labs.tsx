"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChoiceLab } from "../learn/labs";
import type { LabProps } from "../learn/types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace, shuffle } from "../learn/ui";
import { money, totals } from "../office/admin";
import { ExternalTag, MailTip, People } from "../office/apps/Outlook";
import { CallPlayer, PHONE_COLOUR } from "../office/apps/Phone";
import { AuthLogo, LockArt, PromptCard, StatusBar, WinLogo } from "../office/apps/Security";
import { CONTACTS, PEOPLE, YOU } from "../office/northfield";
import { EMMA_CLARKSON, FAKE_INVOICE, isInternal, REAL_INVOICE, SCAM_CALL, SCAM_NUMBER, TOM_CALL, TOM_NUMBER } from "../office/safety";
import type { BizDoc, Contact, Person, PhoneCall } from "../office/types";
import { OFFICE_CSS } from "../office/ui";
import { D, W } from "../tokens";

/* Module 11's Try labs: each one makes the learner do the safe thing on a
 * look-alike of the real screen, and scores it. The scam email to inspect
 * by pointing, the real and fake invoice to compare, the desk phone to
 * ring the right number, a change-password page with a strength meter, an
 * authenticator prompt, Outlook's own To box with its suggestions and
 * warning, and a desktop to lock. */

/* ── shared bits ─────────────────────────────────────────────────────── */

export function Job({ children }: { children: ReactNode }) {
  return (
    <div style={{ whiteSpace: "pre-wrap", background: D.accentSoft, border: `1px solid ${D.accentEdge}`, borderRadius: 14, padding: "13px 16px", fontSize: 16.5, lineHeight: 1.6, color: D.body }}>
      <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
      <div>{children}</div>
    </div>
  );
}

export function Said({ ok, children }: { ok: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [children]);
  return (
    <div ref={ref} role="status" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: ok ? D.goodSoft : D.badSoft, border: `1px solid ${ok ? D.goodEdge : D.badEdge}`, color: D.body, fontSize: 16.5, lineHeight: 1.55 }}>
      {ok ? <Tick /> : <Cross />}
      <div>{children}</div>
    </div>
  );
}

const pane: CSSProperties = { background: W.page, color: W.ink, fontFamily: W.font, borderRadius: 8, boxShadow: W.float, colorScheme: "light", overflow: "visible" };

function Done({ correct, total, children }: { correct: number; total: number; children: ReactNode }) {
  return (
    <Said ok>
      Done. You got <b>{correct} of {total}</b> right first time. {children}
    </Said>
  );
}

/* ═══ Lesson 1: Spot the scam (point, don't click) ════════════════════ */

interface Mail {
  from: Person;
  subject: string;
  greeting: string;
  body: string[];
  link?: { text: string; url: string };
  scam: boolean;
  why: string;
}

const MAILS: Mail[] = [
  {
    from: { name: "IT Service Desk", address: "it-support@northfield-supplies-helpdesk.example" },
    subject: "Action needed: your password expires today",
    greeting: "Dear user,",
    body: ["Your mailbox password expires at 5pm today. To keep your emails, confirm your password now.", "If you do nothing, your account will be closed."],
    link: { text: "Keep my password", url: "https://northfield-supplies-helpdesk.example/keep-password" },
    scam: true,
    why: "The name says IT, but the address isn't ours: our emails end @northfieldsupplies.example, with no dashes. \"Dear user\", a deadline today, a threat, and a link to a look-alike site. IT never ask for your password.",
  },
  {
    from: PEOPLE.tom,
    subject: "Your 2 missing pallets: Thursday morning",
    greeting: "Hi,",
    body: ["The 2 pallets missing from PO 3307 will come on Thursday morning, before 10am, with our usual driver.", "Nothing for you to do. The credit note is already with Priya."],
    scam: false,
    why: "Tom's real address (harlowpackaging.example), our order number, no link, no rush and no money asked for. It fits what you already know.",
  },
  {
    from: { name: "Hopwell Couriers", address: "noreply@hopwell-delivery-fee.example" },
    subject: "We missed you: pay £1.99 to rebook your parcel",
    greeting: "Dear customer,",
    body: ["We tried to deliver your parcel today but nobody was in.", "Pay a £1.99 redelivery fee within 12 hours, or your parcel will go back to the sender."],
    link: { text: "Pay £1.99 now", url: "https://hopwell-delivery-fee.example/pay?ref=88213" },
    scam: true,
    why: "A real courier's name with a made-up address, a small fee to get your card details, and a 12-hour deadline. Goods-in is staffed all day, so no delivery was missed.",
  },
  {
    from: PEOPLE.sarah,
    subject: "Stock count sheet for Friday",
    greeting: "Hi,",
    body: ["Here's the link to this week's stock count sheet on the team site. Could you fill in aisle C by Friday?", "Thanks, Sarah"],
    link: { text: "Stock count November.xlsx", url: "https://northfieldsupplies.sharepoint.example/sites/Operations/Documents/Stock" },
    scam: false,
    why: "Sarah's real address, a job she would ask for, and the link really goes to our own team site. Pointing at a link works both ways: it can tell you it's fine.",
  },
];

function InspectMail({ m, onLink }: { m: Mail; onLink: () => void }) {
  const [card, setCard] = useState(false);
  const [hover, setHover] = useState(false);
  const outside = !isInternal(m.from.address);
  const [user, domain] = m.from.address.split("@");
  return (
    <div className="of-office" style={{ ...pane, position: "relative", padding: "16px 18px 18px", minHeight: 330 }}>
      <style>{OFFICE_CSS}</style>
      <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{m.subject}</div>
      <div onMouseLeave={() => setCard(false)} style={{ position: "relative", marginTop: 10, fontSize: 14.5, lineHeight: 1.5 }}>
        <button
          type="button"
          onClick={() => setCard((c) => !c)}
          onMouseEnter={() => setCard(true)}
          aria-expanded={card}
          style={{ padding: 0, border: "none", background: "none", fontFamily: W.font, fontSize: 15.5, fontWeight: 600, color: W.outlook, textDecoration: "underline dotted", textUnderlineOffset: 3, cursor: "pointer" }}
        >
          {m.from.name}
        </button>
        {outside && <ExternalTag />}
        <span style={{ display: "block", color: W.muted }}>To: You · Wed 11 Nov</span>
        {card && (
          <span role="dialog" aria-label={`Who ${m.from.name} really is`} onMouseLeave={() => setCard(false)} style={{ position: "absolute", left: 0, top: "100%", zIndex: 6, marginTop: 4, width: "min(330px, 100%)", display: "block", padding: "12px 14px", background: W.page, border: `1px solid ${W.edge}`, borderRadius: 8, boxShadow: W.float }}>
            <b style={{ display: "block" }}>{m.from.name}</b>
            <span style={{ display: "block", fontSize: 12, color: W.muted, marginTop: 6 }}>Email</span>
            <span style={{ overflowWrap: "anywhere" }}>
              {user}@<b>{domain}</b>
            </span>
            <span style={{ display: "block", marginTop: 8, padding: "5px 8px", borderRadius: 4, fontSize: 13, background: outside ? "#fff4ce" : "#dff6dd", color: outside ? "#3b2e00" : "#0e700e" }}>{outside ? "Outside your organisation" : "Inside Northfield Supplies"}</span>
          </span>
        )}
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${W.edge}`, display: "grid", gap: 10, fontSize: 15.5, lineHeight: 1.55 }}>
        <p style={{ margin: 0 }}>{m.greeting}</p>
        {m.body.map((b) => (
          <p key={b} style={{ margin: 0 }}>
            {b}
          </p>
        ))}
        {m.link && (
          <p style={{ position: "relative", margin: 0, paddingBottom: 62 }}>
            <button
              type="button"
              onClick={onLink}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onFocus={() => setHover(true)}
              onBlur={() => setHover(false)}
              style={{ minHeight: 42, padding: "6px 16px", border: "none", borderRadius: 4, background: m.scam ? "#ffc83d" : "transparent", color: m.scam ? "#1b1b1b" : W.outlook, textDecoration: m.scam ? "none" : "underline", fontFamily: W.font, fontSize: 15, fontWeight: m.scam ? 700 : 400, cursor: "pointer" }}
            >
              {m.link.text}
            </button>
            {hover && (
              <span role="tooltip" style={{ position: "absolute", left: 0, top: 48, zIndex: 5, maxWidth: "min(420px, 100%)", padding: "7px 10px", borderRadius: 4, background: W.page, border: `1px solid ${W.edge}`, boxShadow: W.float, fontSize: 13, lineHeight: 1.45, overflowWrap: "anywhere" }}>
                {m.link.url}
                <span style={{ display: "block", color: W.muted }}>Click or tap to follow link.</span>
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export function InspectLab({ onDone }: LabProps) {
  const [order] = useState(() => [0, ...shuffle([1, 2, 3])]);
  const [at, setAt] = useState(0);
  const [picks, setPicks] = useState<("report" | "safe" | "click")[]>([]);
  const [first, setFirst] = useState(0);
  const [finished, setFinished] = useState(false);
  const m = MAILS[order[at]];
  const right = m.scam ? "report" : "safe";
  const solved = picks.includes(right);
  const last = picks[picks.length - 1];
  const pick = (k: "report" | "safe" | "click") => {
    if (solved) return;
    if (picks.length === 0 && k === right) setFirst((n) => n + 1);
    setPicks((p) => [...p, k]);
  };
  const next = () => {
    if (at + 1 < MAILS.length) {
      setAt(at + 1);
      setPicks([]);
    } else {
      setFinished(true);
      onDone({ correct: first, total: MAILS.length });
    }
  };
  if (finished) return <Done correct={first} total={MAILS.length}>Point first, click never: that habit stops most scams.</Done>;
  return (
    <div>
      <StepBar at={at + 1} of={MAILS.length} label="Email" />
      <div style={{ marginTop: 14 }}>
        <Job>{"Point at the sender's name (or tap it) to see who it's really from. Point at any link, without clicking, to see where it really goes. Then decide."}</Job>
      </div>
      <Workspace style={{ marginTop: 14 }}>
        <InspectMail key={at} m={m} onLink={() => pick("click")} />
      </Workspace>
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Button kind="secondary" onClick={() => pick("report")} disabled={solved}>
          ⚠ Report it
        </Button>
        <Button kind="secondary" onClick={() => pick("safe")} disabled={solved}>
          It&apos;s genuine: deal with it
        </Button>
      </div>
      {last && (
        <Said ok={last === right}>
          {last === "click" ? (
            <>
              <b>You clicked the link. </b>
              {m.scam ? "That's what the scammer wanted: it opens their site, which asks for a password or a card. Point at a link to read it; never click to find out." : "This one was safe, but clicking to find out is a habit to break. Point at it first and read the address."}{" "}
              Now decide: report it, or deal with it?
            </>
          ) : (
            <>
              <b>{last === right ? "Right. " : "Not this time. "}</b>
              {last === right ? m.why : m.scam ? "Look again at the sender's real address and where the link goes." : "Look at the address: it's one of ours. Nothing here asks for money or a password."}
              {last !== right && " Have another go."}
            </>
          )}
        </Said>
      )}
      {solved && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={next}>{at + 1 < MAILS.length ? "Next email" : "Finish"}</Button>
        </div>
      )}
    </div>
  );
}

/* ═══ Lesson 2: the real invoice, the fake one, and the phone ═════════ */

type InvKey = "look" | "email" | "phone" | "number" | "total" | "bank" | "terms";
const CHANGED: InvKey[] = ["email", "phone", "bank", "terms"];
const SAME_SAYS: Partial<Record<InvKey, string>> = {
  look: "The logo and address are the same. That's easy to copy, so it proves nothing.",
  number: "HP-2291 is on both. Scammers copy real invoice numbers.",
  total: "£691.20 on both, so Accounts wouldn't notice anything odd.",
};

function PickInvoice({ doc, pick, marks }: { doc: BizDoc; pick?: (k: InvKey) => void; marks?: Partial<Record<InvKey, "right" | "wrong">> }) {
  const t = totals(doc);
  const bit = (k: InvKey, children: ReactNode) =>
    pick ? (
      <button
        type="button"
        onClick={() => pick(k)}
        className="of-row"
        style={{ display: "block", width: "100%", textAlign: "left", padding: "5px 6px", margin: "0 -6px", border: "none", borderRadius: 4, fontFamily: W.font, color: "#222", background: marks?.[k] === "right" ? "rgba(30,142,62,0.12)" : marks?.[k] === "wrong" ? "rgba(197,34,31,0.08)" : "transparent", outline: marks?.[k] ? `2px solid ${marks[k] === "right" ? "#1e8e3e" : "#c5221f"}` : "none", cursor: "pointer" }}
      >
        {children}
      </button>
    ) : (
      <div style={{ padding: "5px 0" }}>{children}</div>
    );
  return (
    <div style={{ background: W.page, color: "#222", padding: "14px 16px", borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.18)", fontSize: 13, lineHeight: 1.5, display: "grid", gap: 4 }}>
      {bit(
        "look",
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span aria-hidden style={{ width: 28, height: 28, borderRadius: 5, background: "#0b6b62", color: "#fff", fontWeight: 800, fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>HP</span>
          <b style={{ color: "#0b6b62" }}>{doc.from.name}</b>
        </span>,
      )}
      {bit("email", <span style={{ overflowWrap: "anywhere" }}>{doc.from.email}</span>)}
      {bit("phone", <span>{doc.from.phone}</span>)}
      {bit(
        "number",
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          <b>INVOICE</b> <b>{doc.number}</b>
        </span>,
      )}
      {bit(
        "total",
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          Total due <b>{money(t.gross)}</b>
        </span>,
      )}
      {bit(
        "bank",
        <span>
          Pay to {doc.bank?.name}
          <br />
          {doc.bank?.sortCode} · {doc.bank?.account}
        </span>,
      )}
      {bit("terms", <span>{doc.terms}</span>)}
    </div>
  );
}

function DiffStep({ onSolved }: { onSolved: (clean: boolean) => void }) {
  const [found, setFound] = useState<InvKey[]>([]);
  const [wrong, setWrong] = useState<InvKey[]>([]);
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const done = CHANGED.every((k) => found.includes(k));
  const pick = (k: InvKey) => {
    if (done) return;
    if (CHANGED.includes(k)) {
      if (!found.includes(k)) setFound((f) => [...f, k]);
      setSaid({ ok: true, text: { email: "The email address: harlow-packaging-uk.co, not harlowpackaging.example.", phone: "The phone number: a mobile that isn't Harlow's.", bank: "The bank details: the money would go to the scammer.", terms: "Pay today, with a late fee: the real one gives 30 days." }[k as "email"] });
    } else {
      if (!wrong.includes(k)) setWrong((w) => [...w, k]);
      setSaid({ ok: false, text: SAME_SAYS[k] ?? "That's the same on both." });
    }
  };
  const marks = Object.fromEntries([...found.map((k) => [k, "right"]), ...wrong.map((k) => [k, "wrong"])]);
  return (
    <div>
      <Job>{"On the left, Harlow's real invoice, from Finance. On the right, the one in today's email. Click every line on the right that's different. There are 4."}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <style>{OFFICE_CSS}</style>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 16, colorScheme: "light" }}>
          <div>
            <Kicker color="#9fe0b0" style={{ marginBottom: 8 }}>
              The real one, on file
            </Kicker>
            <PickInvoice doc={REAL_INVOICE} />
          </div>
          <div>
            <Kicker color="#ffb3bd" style={{ marginBottom: 8 }}>
              The one in the email: click what&apos;s different
            </Kicker>
            <PickInvoice doc={FAKE_INVOICE} pick={pick} marks={marks} />
          </div>
        </div>
      </Workspace>
      <p style={{ margin: "12px 0 0", fontSize: 15.5, color: D.muted }}>
        Found {found.length} of {CHANGED.length}.
      </p>
      {said && !done && (
        <Said ok={said.ok}>
          <b>{said.ok ? "Yes. " : "Same on both. "}</b>
          {said.text}
        </Said>
      )}
      {done && (
        <>
          <Said ok>
            <b>All four. </b>Same look, same number, same amount: only the contact details, the bank and the deadline changed. That&apos;s a fake invoice.
          </Said>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => onSolved(wrong.length <= 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}

function RingStep({ onSolved }: { onSolved: (clean: boolean) => void }) {
  const [calls, setCalls] = useState<PhoneCall[]>([]);
  const [ended, setEnded] = useState(false);
  const live = calls[calls.length - 1];
  const rangTom = calls.some((c) => c.number === TOM_NUMBER);
  const ring = (n: string) => {
    const script = n === TOM_NUMBER ? TOM_CALL : SCAM_CALL;
    setCalls((c) => [...c, { ...script, id: `lab-${c.length}`, time: "08:44", way: "out" }]);
    setEnded(false);
  };
  const entry = (name: string, sub: string, number: string, where: string) => (
    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${W.edge}` }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: W.muted, lineHeight: 1.4 }}>
        <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", color: W.faint }}>{where}</span>
        <b style={{ display: "block", fontSize: 15, color: W.ink, fontWeight: 600 }}>{name}</b>
        {sub} · <span style={{ color: W.body }}>{number}</span>
      </span>
      <button type="button" onClick={() => ring(number)} disabled={!!live && !ended} aria-label={`Call ${number}`} style={{ minHeight: 40, padding: "0 16px", border: "none", borderRadius: 20, background: "#13a10e", color: "#fff", fontFamily: W.font, fontSize: 14.5, fontWeight: 700, cursor: "pointer", opacity: live && !ended ? 0.5 : 1 }}>
        Call
      </button>
    </div>
  );
  return (
    <div>
      <Job>{"Before anyone pays, check with Harlow by phone. Two numbers are in front of you. Ring the one you trust."}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ ...pane, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", minHeight: 38, padding: "0 12px", background: PHONE_COLOUR, color: "#fff", fontSize: 14 }}>
            <b>Phone</b>&nbsp; Your extension 431
          </div>
          {entry("Tom Hale", "Harlow Packaging, saved in Contacts", TOM_NUMBER, "IN THE PHONE'S CONTACTS")}
          {entry("\"Our accounts team\"", "printed in today's email", SCAM_NUMBER, "IN THE EMAIL")}
          {live && (
            <div style={{ padding: "14px 14px 16px" }}>
              <p style={{ margin: "0 0 10px", fontSize: 14.5 }}>
                <b>Calling {live.number}</b> <span style={{ color: W.muted }}>· {live.number === TOM_NUMBER ? "Tom Hale" : "the number in the email"}</span>
              </p>
              <CallPlayer key={live.id} call={live} auto onEnd={() => setEnded(true)} />
            </div>
          )}
        </div>
      </Workspace>
      {live && ended && live.number === SCAM_NUMBER && !rangTom && (
        <Said ok={false}>
          <b>That was the scammer. </b>Of course they said it&apos;s genuine: the number came from their own email. Now ring the number we already hold.
        </Said>
      )}
      {rangTom && ended && (
        <>
          <Said ok>
            <b>Right. </b>The number we held before the email came can&apos;t have been changed by the scammer. Tom confirms: nothing has changed. It&apos;s a scam.
          </Said>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => onSolved(calls[0]?.number === TOM_NUMBER)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}

export function FakeInvoiceLab({ onDone }: LabProps) {
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const step = (clean: boolean) => {
    if (clean) setScore((s) => s + 1);
    setAt((a) => a + 1);
  };
  if (finished) return <Done correct={score} total={3}>In the office, you will do this for real.</Done>;
  return (
    <div>
      <StepBar at={Math.min(at + 1, 3)} of={3} label="Step" />
      <div style={{ marginTop: 14 }}>
        {at === 0 && <DiffStep onSolved={step} />}
        {at === 1 && <RingStep onSolved={step} />}
        {at === 2 && (
          <ChoiceLab
            onDone={(r) => {
              const s = score + (r && r.correct === r.total ? 1 : 0);
              setScore(s);
              setFinished(true);
              onDone({ correct: s, total: 3 });
            }}
            steps={[
              {
                prompt: "Tom says Harlow's details haven't changed. What do you do now?",
                options: [
                  { text: "Report the email, and tell Priya not to pay it", correct: true, why: "The email goes to IT, and the person who pays suppliers knows to stop. Two people protected." },
                  { text: "Reply to the email and say you know it's fake", why: "Never reply. It tells the scammer someone reads this mailbox, and invites another try." },
                  { text: "Pay the old account today, to be on the safe side", why: "The invoice isn't due until December, and paying is Priya's job. Report it and tell her." },
                ],
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

/* ═══ Lesson 3: a passphrase, and two sign-in requests ════════════════ */

const WORDS = ["copper", "kettle", "harbour", "violin", "pebble", "tractor", "lemon", "glacier", "sock", "meadow", "parrot", "lantern", "biscuit", "canyon", "velvet", "tulip"];
const BANNED = ["password", "northfield", "123", "qwerty", "letmein", "welcome", "admin", "you"];

const splitWords = (p: string) =>
  p
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s\-_.0-9!?]+/)
    .filter((w) => w.length >= 3);

export function strength(p: string): { score: 0 | 1 | 2 | 3 | 4; label: string; time: string } {
  if (!p) return { score: 0, label: "", time: "" };
  const low = p.toLowerCase();
  if (BANNED.some((b) => low.includes(b)) || p.length < 8) return { score: 1, label: "Weak", time: "seconds" };
  const words = splitWords(p).length;
  if (p.length >= 16 && words >= 3) return { score: 4, label: "Very strong", time: "centuries" };
  if (p.length >= 12 && words >= 3) return { score: 3, label: "Strong", time: "hundreds of years" };
  if (p.length >= 12) return { score: 2, label: "OK", time: "a few months" };
  return { score: 1, label: "Weak", time: "a few hours" };
}

function PasswordStep({ onSolved }: { onSolved: (clean: boolean) => void }) {
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [tiles] = useState(() => shuffle(WORDS).slice(0, 8));
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<boolean[] | null>(null);
  const s = strength(pw);
  const rules: { label: string; ok: boolean; hint: string }[] = [
    { label: "At least 12 characters", ok: pw.length >= 12, hint: "Longer is stronger. Three words get you there easily." },
    { label: "Three or more words", ok: splitWords(pw).length >= 3, hint: "Click three of the words above, or type your own. Start each with a capital so they're easy to read." },
    { label: "Nothing guessable", ok: !BANNED.some((b) => pw.toLowerCase().includes(b)), hint: "No \"password\", no \"123\", no company name, nothing about you." },
    { label: "Typed the same twice", ok: !!pw && pw === again, hint: "Type it again in the second box, exactly the same." },
  ];
  const save = () => {
    const r = rules.map((x) => x.ok);
    setTries((t) => t + 1);
    setResult(r);
  };
  const ok = !!result && result.every(Boolean);
  const meter = ["#c4314b", "#c4314b", "#ca5010", "#107c10", "#0e700e"][s.score];
  const input: CSSProperties = { width: "100%", minHeight: 44, padding: "0 12px", border: `1px solid ${W.edge}`, borderRadius: 4, fontFamily: W.font, fontSize: 16, color: W.ink, background: W.page, boxSizing: "border-box" };
  return (
    <div>
      <Job>{"IT have asked everyone to change their password. Make a new one from three random words. Click words below, or type your own."}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ ...pane, overflow: "hidden" }}>
          <style>{OFFICE_CSS}</style>
          <div style={{ display: "flex", alignItems: "center", minHeight: 36, padding: "0 12px", background: "#2357c6", color: "#fff", fontSize: 14 }}>
            <b>My account</b>&nbsp; Security · Change password
          </div>
          <div style={{ padding: "16px 18px 18px", display: "grid", gap: 12, maxWidth: 520 }}>
            <label style={{ display: "grid", gap: 4, fontSize: 13.5, color: W.muted }}>
              Current password
              <input readOnly value="••••••••••••" aria-label="Current password" style={{ ...input, letterSpacing: "0.2em", color: W.muted }} />
            </label>
            <div>
              <span style={{ fontSize: 13.5, color: W.muted }}>Some random words to choose from:</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {tiles.map((w) => (
                  <button key={w} type="button" onClick={() => setPw((p) => p + w[0].toUpperCase() + w.slice(1))} className="of-btn" style={{ minHeight: 36, padding: "0 12px", border: `1px solid ${W.edge}`, borderRadius: 18, background: W.chrome, fontFamily: W.font, fontSize: 14.5, color: W.ink, cursor: "pointer" }}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <label style={{ display: "grid", gap: 4, fontSize: 13.5, color: W.muted }}>
              New password
              <span style={{ display: "flex", gap: 6 }}>
                <input aria-label="New password" type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" style={input} />
                <button type="button" onClick={() => setShow((v) => !v)} className="of-btn" style={{ minHeight: 44, padding: "0 12px", border: `1px solid ${W.edge}`, borderRadius: 4, background: W.page, fontFamily: W.font, fontSize: 13.5, color: W.ink, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {show ? "Hide" : "Show"}
                </button>
                <button type="button" onClick={() => setPw("")} className="of-btn" style={{ minHeight: 44, padding: "0 12px", border: `1px solid ${W.edge}`, borderRadius: 4, background: W.page, fontFamily: W.font, fontSize: 13.5, color: W.ink, cursor: "pointer" }}>
                  Clear
                </button>
              </span>
            </label>
            <div aria-live="polite">
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                  <i key={i} style={{ flex: 1, height: 7, borderRadius: 4, background: i <= s.score ? meter : W.sunk, transition: "background .2s" }} />
                ))}
              </div>
              {pw && (
                <p style={{ margin: "6px 0 0", fontSize: 13.5, color: W.body }}>
                  <b style={{ color: meter }}>{s.label}.</b> A computer guessing would need about {s.time}.
                </p>
              )}
            </div>
            <label style={{ display: "grid", gap: 4, fontSize: 13.5, color: W.muted }}>
              Type the new password again
              <input aria-label="Type the new password again" type={show ? "text" : "password"} value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="off" style={input} />
            </label>
            <div>
              <button type="button" onClick={save} style={{ minHeight: 42, padding: "0 22px", border: "none", borderRadius: 4, background: "#2357c6", color: "#fff", fontFamily: W.font, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      </Workspace>
      {result && (
        <div role="status" style={{ marginTop: 14, padding: "14px 16px", borderRadius: 14, background: ok ? D.goodSoft : D.warnSoft, border: `1px solid ${ok ? D.goodEdge : D.warnEdge}` }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: D.ink }}>{ok ? "Saved. That's a strong password you can remember." : "Not saved yet. Fix these:"}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "grid", gap: 8 }}>
            {rules.map((r, i) => (
              <li key={r.label} style={{ display: "flex", gap: 10, fontSize: 16, lineHeight: 1.45, color: D.body }}>
                {result[i] ? <Tick /> : <Cross />}
                <span>
                  <b style={{ color: D.ink }}>{r.label}</b>
                  {!result[i] && <span style={{ display: "block", color: D.muted }}>{r.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          {ok && (
            <div style={{ marginTop: 14 }}>
              <Button onClick={() => onSolved(tries === 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PromptRound {
  scene: string;
  screen: ReactNode;
  location: string;
  started: boolean;
}

const ROUNDS: PromptRound[] = [
  {
    scene: "It's your first morning on a new laptop. You've just typed your password into Outlook and pressed Sign in. Your phone buzzes.",
    screen: (
      <div style={{ padding: "14px 16px", display: "grid", gap: 6, justifyItems: "center", textAlign: "center" }}>
        <b style={{ fontSize: 16 }}>Approve sign-in request</b>
        <span style={{ fontSize: 13.5, color: W.body }}>Open your Authenticator app, and enter the number shown to sign in.</span>
        <span style={{ fontSize: 38, fontWeight: 600 }}>42</span>
      </div>
    ),
    location: "Leicester, United Kingdom",
    started: true,
  },
  {
    scene: "It's mid-afternoon. You're reading an email from Sarah, not signing in to anything. Your phone buzzes.",
    screen: (
      <div style={{ padding: "14px 16px", fontSize: 13.5, color: W.body, display: "grid", gap: 6 }}>
        <b style={{ fontSize: 15, color: W.ink }}>Stock count sheet for Friday</b>
        <span>Hi, here&apos;s the link to this week&apos;s stock count sheet. Could you fill in aisle C by Friday?</span>
        <span style={{ color: W.muted }}>Sarah</span>
      </div>
    ),
    location: "Amsterdam, Netherlands",
    started: false,
  },
];

function PromptStep({ round, onSolved }: { round: PromptRound; onSolved: (clean: boolean) => void }) {
  const [num, setNum] = useState("");
  const [tries, setTries] = useState<("yes" | "no" | "wrongnum")[]>([]);
  const [reported, setReported] = useState(false);
  const last = tries[tries.length - 1];
  const solved = round.started ? last === "yes" : last === "no";
  const answer = (k: "yes" | "no") => {
    if (solved) return;
    if (k === "yes" && round.started && num !== "42") return setTries((t) => [...t, "wrongnum"]);
    setTries((t) => [...t, k]);
  };
  return (
    <div>
      <Job>{round.scene}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start", justifyContent: "center", colorScheme: "light" }}>
          <div style={{ ...pane, flex: "1 1 260px", maxWidth: 380, overflow: "hidden" }}>
            <div style={{ minHeight: 30, display: "flex", alignItems: "center", padding: "0 10px", background: W.outlook, color: "#fff", fontSize: 12.5 }}>
              <b>Your screen</b>
            </div>
            {round.screen}
          </div>
          <div style={{ width: 236, padding: 8, borderRadius: 30, background: "#1b1b1f", boxShadow: "0 24px 50px -20px rgba(0,0,0,0.8), inset 0 0 0 2px #3a3a40", fontFamily: W.font, color: W.ink }}>
            <div style={{ borderRadius: 23, overflow: "hidden", background: "#f3f4f7", paddingBottom: 14 }}>
              <StatusBar time={round.started ? "08:31" : "15:02"} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px 8px", background: "#fff", borderBottom: "1px solid #e2e4ea", fontSize: 14, fontWeight: 700 }}>
                <AuthLogo size={18} /> Authenticator
              </div>
              <div style={{ padding: "12px 12px 0", display: "grid", gap: 10 }}>
                {solved && !round.started ? (
                  <div role="status" style={{ padding: "14px 12px", borderRadius: 12, background: "#fff", textAlign: "center", fontSize: 13.5, display: "grid", gap: 8 }}>
                    <b style={{ fontSize: 15 }}>{reported ? "Reported" : "Sign-in denied"}</b>
                    <span>{reported ? "IT have been told, and the sign-in was blocked." : "If it wasn't you, report it so IT can protect your account."}</span>
                    {!reported && (
                      <button type="button" onClick={() => setReported(true)} style={{ minHeight: 40, border: "none", borderRadius: 20, background: "#2357c6", color: "#fff", fontFamily: W.font, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                        Report: it wasn&apos;t me
                      </button>
                    )}
                  </div>
                ) : solved ? (
                  <div role="status" style={{ padding: "14px 12px", borderRadius: 12, background: "#fff", textAlign: "center", fontSize: 13.5 }}>
                    <b style={{ display: "block", fontSize: 15, color: "#0e700e" }}>Approved</b>
                    You&apos;re signed in on the new laptop.
                  </div>
                ) : (
                  <>
                    <PromptCard p={{ at: round.started ? "08:31" : "15:02", app: "Microsoft 365", location: round.location }} />
                    <label style={{ display: "grid", gap: 4, justifyItems: "center", fontSize: 12, color: W.body, textAlign: "center" }}>
                      Enter the number shown to sign in.
                      <input aria-label="The number shown on the sign-in screen" inputMode="numeric" value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="Number" style={{ width: 90, minHeight: 38, border: "1px solid #c8ccd6", borderRadius: 6, textAlign: "center", fontFamily: W.font, fontSize: 18, color: W.ink, background: "#fff" }} />
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 6 }}>
                      <button type="button" onClick={() => answer("no")} style={{ minHeight: 40, border: "1px solid #c8ccd6", borderRadius: 20, background: "#fff", fontFamily: W.font, fontSize: 12.5, fontWeight: 600, color: W.ink, cursor: "pointer" }}>
                        No, it&apos;s not me
                      </button>
                      <button type="button" onClick={() => answer("yes")} disabled={num.length < 2} style={{ minHeight: 40, border: "none", borderRadius: 20, background: "#2357c6", color: "#fff", fontFamily: W.font, fontSize: 12.5, fontWeight: 600, cursor: num.length < 2 ? "default" : "pointer", opacity: num.length < 2 ? 0.45 : 1 }}>
                        Yes
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Workspace>
      {last && (
        <Said ok={solved}>
          {round.started ? (
            last === "yes" ? (
              <>
                <b>Right. </b>You pressed Sign in yourself, a moment ago, and typed the number from your own screen. That&apos;s exactly when to say Yes.
              </>
            ) : last === "wrongnum" ? (
              <>
                <b>Look at your screen. </b>It shows the number to type. Type that one, then Yes.
              </>
            ) : (
              <>
                <b>This one was you. </b>You&apos;ve just signed in yourself, and the number is on your screen. Type it and press Yes.
              </>
            )
          ) : last === "no" ? (
            <>
              <b>Right. </b>No number on your screen, a place you&apos;re not in, a sign-in you didn&apos;t start. Someone has your password. {reported ? "And you reported it: IT can lock them out and help you change it." : "Now press Report on the phone."}
            </>
          ) : (
            <>
              <b>Never for one you didn&apos;t start. </b>Saying yes lets a stranger into your account: they already have your password, and you gave them the last step. Press No, it&apos;s not me.
            </>
          )}
        </Said>
      )}
      {solved && (round.started || reported) && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => onSolved(tries.length === 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

export function PasswordLab({ onDone }: LabProps) {
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const TOTAL = 5;
  const step = (clean: boolean) => {
    if (clean) setScore((s) => s + 1);
    setAt((a) => a + 1);
  };
  if (finished) return <Done correct={score} total={TOTAL}>Long, never shared, never reused, and only approve what you started.</Done>;
  return (
    <div>
      <StepBar at={Math.min(at + 1, 4)} of={4} label="Step" />
      <div style={{ marginTop: 14 }}>
        {at === 0 && <PasswordStep onSolved={step} />}
        {at === 1 && (
          <ChoiceLab
            onDone={(r) => {
              setScore((s) => s + (r?.correct ?? 0));
              setAt(2);
            }}
            steps={[
              {
                prompt: "You're off tomorrow. Daniel asks for your password, so he can keep an eye on your inbox. What do you do?",
                options: [
                  { text: "Say no, and offer to set up an out-of-office or ask IT to share it", correct: true, why: "Nobody needs your password, not even your manager. IT can give him access properly, and your out-of-office tells people who to contact." },
                  { text: "Tell him, as he's your manager and it's only for a day", why: "Whoever has your password can act as you. If anything goes wrong, it was \"you\". IT can share an inbox safely." },
                  { text: "Write it on a sticky note and leave it on your desk for him", why: "Now anyone walking past has it too. Nobody needs it: IT can share an inbox properly." },
                ],
              },
              {
                prompt: "A shopping website you use at home asks you to make a new password. What do you use?",
                options: [
                  { text: "A different one, made from three new random words", correct: true, why: "When a website is broken into, the stolen passwords get tried everywhere. One password per place keeps the damage in one place." },
                  { text: "Your new work password, so there's only one to remember", why: "If the shop is ever hacked, criminals try that password on work accounts next. Never reuse it." },
                  { text: "Your work password with a 1 added on the end", why: "That's the first thing criminals try. Use something completely different." },
                ],
              },
            ]}
          />
        )}
        {at === 2 && <PromptStep key="p0" round={ROUNDS[0]} onSolved={step} />}
        {at === 3 && (
          <PromptStep
            key="p1"
            round={ROUNDS[1]}
            onSolved={(clean) => {
              const s = score + (clean ? 1 : 0);
              setScore(s);
              setFinished(true);
              onDone({ correct: s, total: TOTAL });
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ═══ Lesson 4: the To line ═══════════════════════════════════════════ */

const TOM_REID = CONTACTS.find((c) => c.name === "Tom Reid")!;

interface ToTask {
  job: string;
  typeHint: string;
  /* who wrote to you most recently, newest first: decides the order of suggestions */
  recent: string[];
  want: string[];
  subject: string;
  attachment?: string;
  right: string;
  wrong: (got: Person[]) => string;
}

const TO_TASKS: ToTask[] = [
  {
    job: "Daniel: \"Send November's overtime sheet to Emma in HR.\" It's attached. Put Emma in To, then Send.",
    typeHint: "Emma",
    recent: [EMMA_CLARKSON.address, PEOPLE.emma.address],
    want: [PEOPLE.emma.address],
    subject: "FW: November's overtime sheet",
    attachment: "2026-11 Overtime November.xlsx",
    right: "Emma Clarke, HR Advisor, @northfieldsupplies.example. Everyone's pay went only to HR.",
    wrong: (got) =>
      got.some((p) => p.address === EMMA_CLARKSON.address)
        ? "That's Emma Clarkson at Bright Cafe, a customer. Outlook put her first because she emailed this morning, and the yellow bar warned you she's outside. With pay details, that's a data breach. Take her off (the ✕) and pick Emma Clarke, HR."
        : "Check the name and the address: you want Emma Clarke in HR, and nobody else.",
  },
  {
    job: "Emma Clarkson at Bright Cafe asked for 6 more cases of cups on Friday. Put her in To and send the confirmation.",
    typeHint: "Emma",
    recent: [EMMA_CLARKSON.address, PEOPLE.emma.address],
    want: [EMMA_CLARKSON.address],
    subject: "Re: Friday's order: 6 more cases of cups",
    right: "This time the customer is right, and the yellow bar is expected: she is outside the company. The warning isn't a stop sign, it's a check.",
    wrong: () => "This one is for the customer, Emma Clarkson at Bright Cafe (@brightcafe.example). Emma in HR doesn't need it.",
  },
  {
    job: "Tom Hale at Harlow Packaging asked for a copy of PO 3307. Put him in To and send it.",
    typeHint: "Tom",
    recent: [TOM_REID.address, PEOPLE.tom.address],
    want: [PEOPLE.tom.address],
    subject: "PO 3307",
    attachment: "2026-11-02 Purchase order 3307 Harlow.pdf",
    right: "Tom Hale, @harlowpackaging.example. Two Toms, two companies: the address told you which.",
    wrong: (got) => (got.some((p) => p.address === TOM_REID.address) ? "That's Tom Reid at Kent Bakery, a customer. Our order with Harlow isn't his business. Take him off and pick Tom Hale, Harlow Packaging." : "You want Tom Hale at Harlow Packaging, and nobody else."),
  },
];

function ToStep({ task, onSolved }: { task: ToTask; onSolved: (clean: boolean) => void }) {
  const [to, setTo] = useState<Person[]>([]);
  const [sends, setSends] = useState(0);
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const book: Contact[] = [...CONTACTS, EMMA_CLARKSON];
  const ok = said?.ok;
  const send = () => {
    if (!to.length) return;
    const right = to.length === task.want.length && to.every((p) => task.want.includes(p.address));
    setSends((n) => n + 1);
    setSaid({ ok: right, text: right ? task.right : task.wrong(to) });
  };
  return (
    <div>
      <Job>{task.job}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ ...pane }}>
          <style>{OFFICE_CSS}</style>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: W.chrome, borderBottom: `1px solid ${W.edge}`, borderRadius: "8px 8px 0 0" }}>
            <button type="button" onClick={send} disabled={!to.length || ok} style={{ minHeight: 40, padding: "0 18px", border: "none", borderRadius: 4, background: W.outlook, color: "#fff", fontFamily: W.font, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: !to.length || ok ? 0.5 : 1 }}>
              ➤ Send
            </button>
            <span style={{ fontSize: 13.5, color: W.muted }}>Type &ldquo;{task.typeHint}&rdquo; in To</span>
          </div>
          <MailTip people={to} />
          <People label="To" people={to} onChange={(p) => !ok && setTo(p)} book={book} recent={task.recent} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 46, padding: "4px 14px", borderBottom: `1px solid ${W.edge}`, fontSize: 15 }}>
            <span style={{ width: 60, color: W.muted }}>Subject</span>
            {task.subject}
          </div>
          {task.attachment && (
            <div style={{ padding: "8px 14px" }}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "4px 10px", border: `1px solid ${W.edge}`, borderRadius: 5, fontSize: 13.5 }}>📎 {task.attachment}</span>
            </div>
          )}
          <div style={{ height: 120 }} />
        </div>
      </Workspace>
      {said && (
        <Said ok={said.ok}>
          <b>{said.ok ? "Sent to the right person. " : "Wrong person. "}</b>
          {said.text}
        </Said>
      )}
      {ok && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => onSolved(sends === 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

export function ToLineLab({ onDone }: LabProps) {
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  if (finished) return <Done correct={score} total={TO_TASKS.length}>Read the address, not just the name.</Done>;
  return (
    <div>
      <StepBar at={at + 1} of={TO_TASKS.length} label="Email" />
      <div style={{ marginTop: 14 }}>
        <ToStep
          key={at}
          task={TO_TASKS[at]}
          onSolved={(clean) => {
            const s = score + (clean ? 1 : 0);
            setScore(s);
            if (at + 1 < TO_TASKS.length) setAt(at + 1);
            else {
              setFinished(true);
              onDone({ correct: s, total: TO_TASKS.length });
            }
          }}
        />
      </div>
    </div>
  );
}

/* ═══ Lesson 5: personal or not, Bcc, and lock it ═════════════════════ */

const SORT: { text: string; personal: boolean; why: string }[] = [
  { text: "Jo Marsh, 07700 900 318", personal: true, why: "A person's name with their mobile number: that reaches one person." },
  { text: "Bright Cafe, 22 Granby Street, Leicester", personal: false, why: "A shop's name and its shop address are on the sign above the door. Not personal." },
  { text: "Card ending 4417", personal: true, why: "Even the last four digits of someone's card are personal. Keep them out of emails." },
  { text: "Order 4417: 30 cases of paper cups", personal: false, why: "An order number and what was ordered. Nothing about a person." },
  { text: "imran.ahmed@kentbakery.example", personal: true, why: "Someone's own email address, with their name in it." },
  { text: "Rosa Bianchi's home address", personal: true, why: "Where someone lives is personal, always." },
  { text: "Our price list for 2027", personal: false, why: "Company information, not about anyone." },
];

function SortStep({ onSolved }: { onSolved: (right: number) => void }) {
  const [order] = useState(() => shuffle(SORT.map((_, i) => i)));
  const [at, setAt] = useState(0);
  const [pick, setPick] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const item = SORT[order[at]];
  const choose = (personal: boolean) => {
    if (pick !== null) return;
    setPick(personal);
    if (personal === item.personal) setRight((n) => n + 1);
  };
  return (
    <div>
      <Job>{"Is it personal data (it tells you about one person), or not? Seven cards."}</Job>
      <div className="dr-glass" style={{ position: "relative", marginTop: 14, padding: "24px 20px", borderRadius: 18, background: D.card, border: `1px solid ${D.edgeStrong}`, textAlign: "center", fontSize: 21, fontWeight: 600, lineHeight: 1.4, color: D.ink, overflowWrap: "anywhere" }}>
        {item.text}
        <span style={{ display: "block", marginTop: 8, fontSize: 13, fontWeight: 400, color: D.faint }}>
          Card {at + 1} of {SORT.length}
        </span>
      </div>
      <div style={{ marginTop: 12, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
        {[true, false].map((p) => {
          const isRight = pick !== null && p === item.personal;
          const isWrong = pick === p && p !== item.personal;
          return (
            <button key={String(p)} type="button" onClick={() => choose(p)} disabled={pick !== null} className="dr-option" style={{ minHeight: 54, padding: "12px 16px", fontSize: 16.5, fontWeight: 600, borderRadius: 14, fontFamily: D.sans, color: D.ink, cursor: pick !== null ? "default" : "pointer", background: isRight ? D.goodSoft : isWrong ? D.badSoft : D.glass, border: `1px solid ${isRight ? D.good : isWrong ? D.bad : D.edge}` }}>
              {p ? "Personal data" : "Not personal"}
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <>
          <Said ok={pick === item.personal}>
            <b>{pick === item.personal ? "Right. " : item.personal ? "It's personal. " : "It's not personal. "}</b>
            {item.why}
          </Said>
          <div style={{ marginTop: 16 }}>
            <Button
              onClick={() => {
                if (at + 1 < SORT.length) {
                  setAt(at + 1);
                  setPick(null);
                } else onSolved(right);
              }}
            >
              {at + 1 < SORT.length ? "Next card" : "Next"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const CUSTOMERS: Person[] = [
  { name: "Jo Marsh", address: "jo.marsh@brightcafe.example" },
  { name: "Imran Ahmed", address: "imran.ahmed@kentbakery.example" },
  { name: "Rosa Bianchi", address: "rosa@oakstreetdeli.example" },
];

function BccStep({ onSolved }: { onSolved: (clean: boolean) => void }) {
  const [to, setTo] = useState<Person[]>(CUSTOMERS);
  const [bcc, setBcc] = useState<Person[]>([]);
  const [sends, setSends] = useState(0);
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const ok = !!said?.ok;
  const move = (p: Person, toBcc: boolean) => {
    if (ok) return;
    if (toBcc) {
      setTo((t) => t.filter((x) => x.address !== p.address));
      setBcc((b) => [...b, p]);
    } else {
      setBcc((b) => b.filter((x) => x.address !== p.address));
      setTo((t) => [...t, p]);
    }
  };
  const meInTo = to.some((p) => p.address === YOU.address);
  const send = () => {
    setSends((n) => n + 1);
    const leaks = to.filter((p) => p.address !== YOU.address);
    if (leaks.length) return setSaid({ ok: false, text: `${leaks.map((p) => p.name).join(", ")} ${leaks.length === 1 ? "is" : "are"} still in To. Every customer would see the others' email addresses. Move them all to Bcc.` });
    if (bcc.length < CUSTOMERS.length) return setSaid({ ok: false, text: "Someone has dropped off the email. All three customers should be in Bcc." });
    setSaid({ ok: true, text: "Each customer gets it, and none of them sees anyone else's address. Putting yourself in To is the tidy way: there's always someone in To, and you get a copy." });
  };
  const chip = (p: Person, inBcc: boolean) => (
    <span key={p.address} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 4px 3px 10px", borderRadius: 14, background: isInternal(p.address) ? W.select : "#fff4ce", border: isInternal(p.address) ? "1px solid transparent" : "1px solid #f2d27a", fontSize: 14 }}>
      {p.name}
      {p.address !== YOU.address && (
        <button type="button" onClick={() => move(p, !inBcc)} className="of-btn" style={{ minHeight: 28, padding: "0 8px", border: `1px solid ${W.edge}`, borderRadius: 12, background: W.page, fontFamily: W.font, fontSize: 12.5, color: W.ink, cursor: "pointer" }}>
          {inBcc ? "Move to To" : "Move to Bcc"}
        </button>
      )}
      {p.address === YOU.address && (
        <button type="button" aria-label="Remove yourself" onClick={() => setTo((t) => t.filter((x) => x.address !== YOU.address))} style={{ width: 26, height: 26, border: "none", background: "transparent", color: W.muted, cursor: "pointer" }}>
          ✕
        </button>
      )}
    </span>
  );
  const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, minHeight: 50, padding: "6px 14px", borderBottom: `1px solid ${W.edge}` } as const;
  return (
    <div>
      <Job>{"You're telling three customers about Christmas opening hours. Someone has put them all in To, so each would see the others' email addresses. Fix it, then Send."}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ ...pane }}>
          <style>{OFFICE_CSS}</style>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: W.chrome, borderBottom: `1px solid ${W.edge}`, borderRadius: "8px 8px 0 0", flexWrap: "wrap" }}>
            <button type="button" onClick={send} disabled={ok} style={{ minHeight: 40, padding: "0 18px", border: "none", borderRadius: 4, background: W.outlook, color: "#fff", fontFamily: W.font, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: ok ? 0.5 : 1 }}>
              ➤ Send
            </button>
            {!meInTo && (
              <button type="button" onClick={() => setTo((t) => [YOU, ...t])} disabled={ok} className="of-btn" style={{ minHeight: 40, padding: "0 14px", border: `1px solid ${W.edge}`, borderRadius: 4, background: W.page, fontFamily: W.font, fontSize: 14, color: W.ink, cursor: "pointer" }}>
                Put yourself in To
              </button>
            )}
          </div>
          <div style={row}>
            <span style={{ width: 44, color: W.muted, fontSize: 15 }}>To</span>
            {to.map((p) => chip(p, false))}
          </div>
          <div style={row}>
            <span style={{ width: 44, color: W.muted, fontSize: 15 }}>Bcc</span>
            {bcc.map((p) => chip(p, true))}
            {!bcc.length && <span style={{ color: W.faint, fontSize: 14 }}>(nobody)</span>}
          </div>
          <div style={{ ...row, fontSize: 15 }}>
            <span style={{ width: 60, color: W.muted }}>Subject</span>Christmas opening hours
          </div>
          <div style={{ padding: "12px 14px 16px", fontSize: 15, lineHeight: 1.55, color: W.body }}>Hello, our warehouse closes at 1pm on Thursday 24 December and opens again on Monday 4 January. Orders for the new year need to reach us by 18 December.</div>
        </div>
      </Workspace>
      {said && (
        <Said ok={said.ok}>
          <b>{said.ok ? "Right. " : "Not yet. "}</b>
          {said.text}
        </Said>
      )}
      {ok && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => onSolved(sends === 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

function LockStep({ onSolved }: { onSolved: (clean: boolean) => void }) {
  const [locked, setLocked] = useState(false);
  const [menu, setMenu] = useState<null | "start" | "you">(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);
  const meta = useRef(false);
  useEffect(() => {
    if (locked) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS") meta.current = true;
      else if ((e.metaKey || meta.current) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setLocked(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS") meta.current = false;
    };
    const away = () => {
      if (meta.current) setLocked(true);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", away);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", away);
    };
  }, [locked]);
  const miss = (text: string) => {
    setWrong(text);
    setMisses((n) => n + 1);
  };
  return (
    <div>
      <Job>{"The customer list is open on your screen. Sarah calls you down to the warehouse. Before you get up, lock your screen: press the Windows key and L together, or use Start."}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ position: "relative", height: 330, borderRadius: 10, overflow: "hidden", background: W.desktop, colorScheme: "light", fontFamily: W.font, color: W.ink }}>
          <style>{OFFICE_CSS}</style>
          <div style={{ position: "absolute", left: 10, right: 10, top: 10, bottom: 52, borderRadius: 6, background: W.page, overflow: "hidden", boxShadow: W.float }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 30, padding: "0 4px 0 10px", background: W.excel, color: "#fff", fontSize: 12.5 }}>
              <b>Excel</b> Customer contacts.xlsx
              <button type="button" onClick={() => miss("Minimising hides it from you, not from anyone walking past: one click and it's back. Lock the screen instead.")} aria-label="Minimise" title="Minimise" style={{ marginLeft: "auto", width: 34, height: 26, border: "none", background: "transparent", color: "#fff", fontSize: 14, cursor: "pointer" }}>
                ─
              </button>
            </div>
            <div style={{ padding: 8, fontSize: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1.6fr", gap: 0 }}>
              {["Contact", "Phone", "Email", "Jo Marsh", "07700 900 318", "jo.marsh@brightcafe.example", "Imran Ahmed", "0116 496 0738", "imran.ahmed@kentbakery.example", "Rosa Bianchi", "07700 900 527", "rosa@oakstreetdeli.example"].map((c, i) => (
                <span key={i} style={{ padding: "5px 6px", borderBottom: `1px solid ${W.edge}`, fontWeight: i < 3 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
          {/* taskbar */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(238,242,250,0.92)" }}>
            <button type="button" aria-label="Start" onClick={() => setMenu((m) => (m ? null : "start"))} className="of-row" style={{ width: 40, height: 36, border: "none", borderRadius: 6, background: menu ? "rgba(255,255,255,0.9)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <WinLogo size={18} />
            </button>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 10px", fontSize: 13 }}>
              <i style={{ width: 16, height: 16, borderRadius: 3, background: W.excel, display: "inline-block" }} /> Excel
            </span>
            <button type="button" onClick={() => miss("Turning off the monitor just darkens the screen. Anyone can switch it back on and carry on as you. Lock it.")} className="of-row" style={{ position: "absolute", right: 8, minHeight: 32, padding: "0 10px", border: "none", borderRadius: 6, background: "transparent", fontFamily: W.font, fontSize: 12.5, color: W.ink }}>
              Turn off monitor
            </button>
          </div>
          {menu && (
            <div style={{ position: "absolute", left: "50%", bottom: 50, transform: "translateX(-50%)", width: 300, maxWidth: "calc(100% - 20px)", borderRadius: 8, background: "#f3f3f3", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.6)", padding: 10 }}>
              <p style={{ margin: "0 0 6px", fontSize: 12.5, color: W.muted }}>Pinned: Outlook, File Explorer, Excel</p>
              {menu === "you" && (
                <div role="menu" style={{ margin: "6px 0", padding: 4, borderRadius: 6, background: "#fff", border: `1px solid ${W.edge}` }}>
                  <button type="button" role="menuitem" disabled style={{ display: "block", width: "100%", minHeight: 36, textAlign: "left", padding: "0 10px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 14, color: W.faint }}>
                    Change account settings
                  </button>
                  <button type="button" role="menuitem" onClick={() => setLocked(true)} className="of-row" style={{ display: "block", width: "100%", minHeight: 36, textAlign: "left", padding: "0 10px", border: "none", borderRadius: 4, background: "transparent", fontFamily: W.font, fontSize: 14, color: W.ink }}>
                    Lock
                  </button>
                  <button type="button" role="menuitem" disabled style={{ display: "block", width: "100%", minHeight: 36, textAlign: "left", padding: "0 10px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 14, color: W.faint }}>
                    Sign out
                  </button>
                </div>
              )}
              <button type="button" onClick={() => setMenu(menu === "you" ? "start" : "you")} className="of-row" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "0 10px", border: "none", borderRadius: 6, background: "transparent", fontFamily: W.font, fontSize: 14, color: W.ink }}>
                <span aria-hidden style={{ width: 26, height: 26, borderRadius: 13, background: "#8a4fd8", color: "#fff", fontWeight: 700, fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Y</span>
                You
              </button>
            </div>
          )}
          {locked && (
            <div role="status" aria-label="Locked" style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 70% 10%, #6f8fc9 0%, #2d4e8c 45%, #13254a 100%)", color: "#fff", display: "grid", placeItems: "center", textAlign: "center" }}>
              <LockArt />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1 }}>15:04</div>
                <div style={{ marginTop: 6, fontSize: 17 }}>Wednesday 11 November</div>
              </div>
            </div>
          )}
        </div>
      </Workspace>
      {wrong && !locked && <Said ok={false}>{wrong}</Said>}
      {locked && (
        <>
          <Said ok>
            <b>Locked. </b>The customer list is still open behind it, just as you left it, but nobody passing can see it or use your computer. On a real Windows computer, Windows key + L locks it in one move: you sign back in with your PIN or password.
          </Said>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => onSolved(misses === 0)}>Finish</Button>
          </div>
        </>
      )}
    </div>
  );
}

export function PrivacyLab({ onDone }: LabProps) {
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const TOTAL = SORT.length + 2;
  if (finished) return <Done correct={score} total={TOTAL}>Know what&apos;s personal, Bcc a group, lock as you leave.</Done>;
  return (
    <div>
      <StepBar at={at + 1} of={3} label="Step" />
      <div style={{ marginTop: 14 }}>
        {at === 0 && (
          <SortStep
            onSolved={(n) => {
              setScore((s) => s + n);
              setAt(1);
            }}
          />
        )}
        {at === 1 && (
          <BccStep
            onSolved={(clean) => {
              setScore((s) => s + (clean ? 1 : 0));
              setAt(2);
            }}
          />
        )}
        {at === 2 && (
          <LockStep
            onSolved={(clean) => {
              const s = score + (clean ? 1 : 0);
              setScore(s);
              setFinished(true);
              onDone({ correct: s, total: TOTAL });
            }}
          />
        )}
      </div>
    </div>
  );
}
