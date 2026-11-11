"use client";

import type { CSSProperties, ReactNode } from "react";
import { PHONE_COLOUR } from "../../office/apps/Phone";
import { AuthLogo, LockArt, StatusBar, WinLogo } from "../../office/apps/Security";
import { money, totals } from "../../office/admin";
import { EMMA_CLARKSON, FAKE_INVOICE, REAL_INVOICE, SCAM_BANK, SCAM_LINK, SCAM_NUMBER, SCAMMER, SCAM_SUBJECT, TOM_NUMBER } from "../../office/safety";
import type { BizDoc } from "../../office/types";
import { W } from "../../tokens";
import { AppWindow, FakeButton, FigureFrame, Part, type PartInfo } from "./parts";

/* Module 11's figures (owner 2026-11-11: show the whole thing, every part
 * numbered, then light one part at a time): a whole scam email with every
 * tell numbered, the real and the fake invoice side by side, ringing the
 * number we already hold, two-step sign-in on a laptop and a phone, a
 * change-password page, the To line with Outlook's suggestions and its
 * outside-the-company warning, a sheet of customer details, and the lock
 * screen. The scam is the same one that lands in the office (office/
 * safety.ts), so the learner meets it twice. */

/* `what` overrides a part's key line for one card. */
function infoOf<K extends string>(parts: Record<K, PartInfo>, what: Partial<Record<K, string>> = {}): Record<K, PartInfo> {
  return Object.fromEntries((Object.entries(parts) as [K, PartInfo][]).map(([k, p]) => [k, { ...p, what: tidy(what[k] ?? p.what) }])) as Record<K, PartInfo>;
}

interface FigProps<K extends string> {
  focus?: K[];
  title?: string;
  what?: Partial<Record<K, string>>;
  note?: string;
}

const EXTERNAL: CSSProperties = { display: "inline-block", padding: "0 6px", borderRadius: 3, background: "#fff4ce", border: "1px solid #f2d27a", color: "#6b4f00", fontSize: 11.5, fontWeight: 600, lineHeight: "18px" };

/* A lit part gets room round its words, so its outline never sits on
 * them or on its neighbour's. The margin keeps the words where they were. */
const PAD: CSSProperties = { padding: "4px 8px", margin: "0 -8px" };
const NB: CSSProperties = { whiteSpace: "nowrap" };
/* Copy that wraps well on a phone: "30 days", a phone number, an address
 * or a domain never splits across lines (non-breaking spaces and hyphens),
 * and a paragraph never ends on one word alone. */
export function tidy(s: string): string {
  return s
    .replace(/(\d+) (days|hours|minutes|seconds)/g, "$1\u00a0$2")
    .replace(/\b(0\d{3,4}) (\d{3}) (\d{3,4})\b/g, "$1\u00a0$2\u00a0$3")
    .replace(/\b(Ext|ext) (\d+)/g, "$1\u00a0$2")
    .replace(/\S*[@.]\S*/g, (t) => t.replace(/-/g, "\u2011"))
    .replace(/ \+ /g, "\u00a0+\u00a0")
    .replace(/ (\S{1,12})$/, "\u00a0$1");
}

/* ── 1. the scam email, every tell numbered ──────────────────────────── */

export type ScamPart = "report" | "urgency" | "name" | "address" | "domain" | "greeting" | "bank" | "payment" | "number" | "link" | "linkurl";

export const SCAM_PARTS: Record<ScamPart, PartInfo> = {
  report: { n: 1, name: "Report", what: "The button for an email like this. It goes to Junk, and IT can warn everyone else." },
  urgency: { n: 2, name: "A rush", what: "\"URGENT\" and \"today\" in the subject. Scammers hurry you, so you act before you think." },
  name: { n: 3, name: "The display name", what: "Anyone can type any name here. \"Harlow Packaging Accounts\" proves nothing on its own." },
  address: { n: 4, name: "The real address", what: "Where it really came from. Point at the name, or read inside the brackets." },
  domain: { n: 5, name: "A look-alike domain", what: "The part after the @. Harlow's real one is harlowpackaging.example. This one adds dashes and \"uk.co\"." },
  greeting: { n: 6, name: "No name", what: "\"Dear Customer\". Harlow's account manager, Tom Hale, always writes to us by name. A real supplier knows who you are." },
  bank: { n: 7, name: "New bank details", what: "The biggest tell of all. Suppliers almost never change bank, and never by email alone." },
  payment: { n: 8, name: "A demand to pay now", what: "A deadline and a threat (a late fee). Real invoices give you 30 days." },
  number: { n: 9, name: "A number to call", what: "The scammer's own number. Ring it and they will say it's all genuine." },
  link: { n: 10, name: "The link", what: "A button that looks helpful. Don't click it." },
  linkurl: { n: 11, name: "Where the link really goes", what: "Point at a link without clicking and its real address shows. Here it's the look-alike site." },
};

export function ScamEmailFigure({ focus, title = "A scam email, every tell numbered", what, note }: FigProps<ScamPart>) {
  const [user, domain] = SCAMMER.address.split("@");
  const p = { margin: 0 } as const;
  /* words that are no part of their own fade with the rest when a part is lit */
  const dim = focus?.length ? { opacity: 0.32 } : {};
  const addressLit = !!focus?.includes("address");
  /* the brackets and the name before the @ fade when only the domain is lit
   * (otherwise the whole address fades, or stays lit, as one) */
  const dimAddress = focus?.includes("domain") && !addressLit ? { opacity: 0.32 } : {};
  return (
    <FigureFrame info={infoOf(SCAM_PARTS, what)} focus={focus} title={title} note={note}>
      <AppWindow
        app="Outlook"
        colour={W.outlook}
        title="Inbox"
        toolbar={
          <>
            <span style={{ display: "inline-flex", gap: 8, ...dim }}>
              <FakeButton>↩ Reply</FakeButton>
              <FakeButton>↪ Forward</FakeButton>
            </span>
            <Part k="report" block={false} badge="right" style={PAD}>
              <FakeButton>⚠ Report</FakeButton>
            </Part>
          </>
        }
      >
        <div style={{ padding: "18px 26px 24px 54px", display: "grid", gap: 14 }}>
          <Part k="urgency" style={PAD}>
            <div style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.3 }}>{SCAM_SUBJECT}</div>
          </Part>
          <div style={{ display: "grid", gap: 12, fontSize: 14.5, lineHeight: 1.5 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
              <Part k="name" block={false} style={PAD}>
                <b style={{ fontWeight: 600, fontSize: 15.5 }}>{SCAMMER.name}</b>
              </Part>
              <span style={{ ...EXTERNAL, ...dim }}>External</span>
            </div>
            <Part k="address" block={false} holds={["domain"]} style={{ ...PAD, justifySelf: "start" }}>
              <span style={{ color: W.body, fontSize: 14 }}>
                <span style={{ ...dimAddress, whiteSpace: "nowrap" }}>&lt;{user}@</span>
                {/* lit with the whole address, the domain mustn't fade inside it */}
                {addressLit && !focus?.includes("domain") ? (
                  <>
                    <b style={{ color: "#a4262c", whiteSpace: "nowrap" }}>{domain}</b>&gt;
                  </>
                ) : (
                  <Part k="domain" block={false} badge="right" style={focus?.includes("domain") ? { padding: "1px 4px", marginLeft: 8 } : undefined}>
                    <b style={{ color: "#a4262c", whiteSpace: "nowrap" }}>{domain}</b>
                    <span style={dimAddress}>&gt;</span>
                  </Part>
                )}
              </span>
            </Part>
            <span style={{ color: W.muted, ...dim }}>
              To: You · <span style={NB}>Wed 11 Nov, 08:40</span>
            </span>
          </div>
          <div style={{ borderTop: `1px solid ${W.edge}` }} />
          <div style={{ display: "grid", gap: 14, fontSize: 15, lineHeight: 1.55 }}>
            <Part k="greeting" style={{ ...PAD, justifySelf: "start" }}>
              <p style={p}>Dear Customer,</p>
            </Part>
            <p style={{ ...p, ...dim }}>Please note our new bank details below and pay invoice HP-2291 today to avoid a late fee.</p>
            <Part k="bank">
              <div style={{ padding: "8px 12px", borderRadius: 6, background: W.chrome }}>
                Account name: {SCAM_BANK.name}
                <br />
                Sort code: {SCAM_BANK.sortCode}
                <br />
                Account number: {SCAM_BANK.account}
              </div>
            </Part>
            <Part k="payment" style={PAD}>
              <p style={p}>
                Payment of £691.20 must reach us by <span style={NB}>5pm today</span>, or a £150 late fee will be added.
              </p>
            </Part>
            <Part k="number" style={PAD}>
              <p style={p}>
                Any questions, call our accounts team on <span style={NB}>{SCAM_NUMBER}</span>.
              </p>
            </Part>
            <p style={{ ...p, ...dim, whiteSpace: "pre-wrap" }}>{"Kind regards,\nAccounts Department"}</p>
            <Part k="link" style={{ justifySelf: "start", padding: 5 }}>
              <span style={{ display: "inline-flex", minHeight: 40, alignItems: "center", padding: "6px 16px", borderRadius: 4, background: "#ffc83d", fontWeight: 700 }}>{SCAM_LINK.text}</span>
            </Part>
            <Part k="linkurl" style={{ justifySelf: "start", maxWidth: "100%", padding: 5, marginTop: 4 }}>
              <span style={{ display: "block", padding: "7px 10px", borderRadius: 4, border: `1px solid ${W.edge}`, background: W.page, boxShadow: "0 6px 18px -8px rgba(0,0,0,0.35)", fontSize: 12.5, lineHeight: 1.45 }}>
                <span style={NB}>{SCAM_LINK.url.split("/pay")[0]}</span>
                <wbr />
                <span style={NB}>/pay{SCAM_LINK.url.split("/pay")[1]}</span>
                <span style={{ display: "block", color: W.muted }}>Click or tap to follow link.</span>
              </span>
            </Part>
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── 2. the real invoice and the fake, side by side ──────────────────── */

export type InvoicePairPart = "look" | "number" | "total" | "email" | "phone" | "bank" | "terms";

/* What stays the same is numbered on the real invoice (1 to 3); what the
 * scammer changed is numbered on the fake (4 to 7). */
const SAME: InvoicePairPart[] = ["look", "number", "total"];

export const INVOICE_PAIR_PARTS: Record<InvoicePairPart, PartInfo> = {
  look: { n: 1, name: "Same look", what: "The fake copies the logo, the address and the layout. Anyone can copy a letterhead." },
  number: { n: 2, name: "Same invoice number", what: "HP-2291 on both. Scammers use a real invoice, sometimes one they have seen in a hacked mailbox." },
  total: { n: 3, name: "Same amount", what: "£691.20 on both, so nothing looks odd to Accounts." },
  email: { n: 4, name: "A different email address", what: "The real one ends harlowpackaging.example. The fake one ends harlow-packaging-uk.co." },
  phone: { n: 5, name: "A different phone number", what: "The fake gives the scammer's mobile, so a call to \"check\" reaches them." },
  bank: { n: 6, name: "Different bank details", what: "The whole point of the scam: the money goes to the scammer's account, not Harlow's." },
  terms: { n: 7, name: "Pay today", what: "The real one gives 30 days. The fake wants it today, with a late fee if not." },
};

function MiniInvoice({ doc, real }: { doc: BizDoc; real: boolean }) {
  const t = totals(doc);
  /* each part is numbered on one invoice only */
  const off = (k: InvoicePairPart) => SAME.includes(k) !== real;
  const row = { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5, lineHeight: 1.6 } as const;
  return (
    <div style={{ background: W.page, color: "#222", padding: "16px 22px 18px", borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.18)", display: "grid", gap: 14, fontFamily: W.font }}>
      <Part k="look" noBadge={off("look")} style={PAD}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span aria-hidden style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 5, background: "#0b6b62", color: "#fff", fontWeight: 800, fontSize: 12.5, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>HP</span>
          <span style={{ fontSize: 12, lineHeight: 1.35 }}>
            <b style={{ display: "block", fontSize: 14, color: "#0b6b62" }}>{doc.from.name}</b>
            {doc.from.lines.join(", ")}
          </span>
        </div>
      </Part>
      <Part k="email" noBadge={off("email")} style={PAD}>
        <span style={{ display: "block", fontSize: 12.5 }}>
          <span style={NB}>{doc.from.email?.split("@")[0]}@</span>
          <wbr />
          <span style={NB}>{doc.from.email?.split("@")[1]}</span>
        </span>
      </Part>
      <Part k="phone" noBadge={off("phone")} style={PAD}>
        <span style={{ display: "block", fontSize: 12.5, whiteSpace: "nowrap" }}>{doc.from.phone}</span>
      </Part>
      <Part k="number" noBadge={off("number")} style={PAD}>
        <div style={row}>
          <b style={{ fontSize: 15, letterSpacing: "0.04em" }}>INVOICE</b>
          <b style={{ fontSize: 14 }}>{doc.number}</b>
        </div>
      </Part>
      <Part k="total" noBadge={off("total")} style={PAD}>
        <div style={{ ...row, padding: "6px 8px", background: "#f4f4f2", borderRadius: 3 }}>
          <span>Total due</span>
          <b>{money(t.gross)}</b>
        </div>
      </Part>
      <Part k="bank" noBadge={off("bank")} style={PAD}>
        <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", color: "#777" }}>PAY TO</span>
          <br />
          {doc.bank?.name}
          <br />
          <span style={NB}>Sort code {doc.bank?.sortCode}</span> · <span style={NB}>Account {doc.bank?.account}</span>
        </div>
      </Part>
      <Part k="terms" noBadge={off("terms")} style={PAD}>
        <div style={{ fontSize: 12.5 }}>
          <span style={{ color: "#666" }}>Terms:</span> {tidy(doc.terms ?? "")} {doc.due && doc.terms?.startsWith("30") ? <span style={NB}>Due {doc.due}.</span> : ""}
        </div>
      </Part>
    </div>
  );
}

export function InvoicePairFigure({ focus, title = "The real invoice and the fake one", what, note }: FigProps<InvoicePairPart>) {
  const label = (text: string, colour: string) => <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: colour }}>{text}</p>;
  return (
    <FigureFrame info={infoOf(INVOICE_PAIR_PARTS, what)} focus={focus} title={title} note={note}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "26px 48px", padding: "0 0 0 40px" }}>
        <div>
          {label("First, the real one, on file", "#9fe0b0")}
          <MiniInvoice doc={REAL_INVOICE} real />
        </div>
        <div>
          {label("Then the fake one, in the email", "#ffb3bd")}
          <MiniInvoice doc={FAKE_INVOICE} real={false} />
        </div>
      </div>
    </FigureFrame>
  );
}

function CallGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block" }}>
      <path d="M6.6 10.8 a15 15 0 0 0 6.6 6.6 l2.2-2.2 a1 1 0 0 1 1-.25 a11.4 11.4 0 0 0 3.6.6 a1 1 0 0 1 1 1 V20 a1 1 0 0 1-1 1 A17 17 0 0 1 3 4 a1 1 0 0 1 1-1 h3.5 a1 1 0 0 1 1 1 c0 1.25.2 2.45.6 3.6 a1 1 0 0 1-.25 1 Z" fill="#fff" />
    </svg>
  );
}

/* ── 3. ring the number we already hold ──────────────────────────────── */

export type CallPart = "contacts" | "tom" | "held" | "call" | "emailnum";

export const CALL_SCRIPT = "We've had an email saying your bank details have changed. Is that right?";

export const CALL_PARTS: Record<CallPart, PartInfo> = {
  contacts: { n: 1, name: "Contacts", what: "The numbers the company already holds, saved in the desk phone long before any email arrived." },
  tom: { n: 2, name: "The supplier's contact", what: "Tom Hale, our account manager at Harlow. The person who would know about a change." },
  held: { n: 3, name: "The number on file", what: `${TOM_NUMBER}. Use this one: a scammer can't change what we already have.` },
  call: { n: 4, name: "Call", what: `Rings it from the desk phone. Then ask: "${CALL_SCRIPT}"` },
  emailnum: { n: 5, name: "The number in the email", what: "Never this one. It rings the scammer, who will happily say it's all genuine." },
};

function CallButton() {
  return (
    <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 16, background: "#13a10e", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <CallGlyph />
    </span>
  );
}

export function CallCheckFigure({ focus, title = "Check by phone, on the number you already hold", what, note }: FigProps<CallPart>) {
  const lit = (k: CallPart) => !focus?.length || focus.includes(k);
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0.32 });
  const entry = (name: string, role: string, number: string, tom?: boolean) => {
    const inner = (
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${W.edge}`, ...(tom ? {} : fade(!focus?.length)) }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: W.muted, lineHeight: 1.4 }}>
          <span style={tom ? fade(lit("tom")) : undefined}>
            <b style={{ display: "block", fontSize: 14, color: W.ink, fontWeight: 600 }}>{name}</b>
            {role}
          </span>
          {tom ? (
            <Part k="held" block={false} style={{ ...PAD, marginTop: 4 }}>
              <span style={{ color: W.ink, fontWeight: 600, whiteSpace: "nowrap" }}>{number}</span>
            </Part>
          ) : (
            <span style={{ display: "block", color: W.body, whiteSpace: "nowrap" }}>{number}</span>
          )}
        </span>
        {tom ? (
          <Part k="call" block={false} badge="corner" style={{ padding: 3, borderRadius: 20 }}>
            <CallButton />
          </Part>
        ) : (
          <span style={{ padding: 3 }}>
            <CallButton />
          </span>
        )}
      </div>
    );
    return tom ? (
      <Part k="tom" holds={["held", "call"]} badge="top">
        {inner}
      </Part>
    ) : (
      inner
    );
  };
  return (
    <FigureFrame info={infoOf(CALL_PARTS, what)} focus={focus} title={title} note={note}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "30px 52px", alignItems: "start", padding: "0 6px 0 40px" }}>
        <div style={{ paddingRight: 16 }}>
          <AppWindow app="Phone" colour={PHONE_COLOUR}>
            <div style={{ display: "flex", borderBottom: `1px solid ${W.edge}`, fontSize: 13.5 }}>
              {["Recent", "Contacts", "Keypad"].map((t) =>
                t === "Contacts" ? (
                  <Part key={t} k="contacts" badge="top" style={{ flex: 1, borderRadius: 2 }}>
                    <span style={{ display: "block", textAlign: "center", padding: "8px 0", fontWeight: 700, borderBottom: `3px solid ${PHONE_COLOUR}` }}>{t}</span>
                  </Part>
                ) : (
                  <span key={t} style={{ flex: 1, textAlign: "center", padding: "8px 0", ...fade(!focus?.length) }}>
                    {t}
                  </span>
                ),
              )}
            </div>
            <p style={{ margin: 0, padding: "10px 12px 30px", fontSize: 11.5, fontWeight: 700, color: W.muted, ...fade(!focus?.length) }}>Suppliers</p>
            {entry("Tom Hale", "Account Manager, Harlow Packaging", TOM_NUMBER, true)}
            {entry("Harlow Packaging", "Main line", "01632 960 552")}
            {entry("Kent Flour Mills", "Orders", "01632 960 870")}
          </AppWindow>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffb3bd" }}>In the scam email</p>
          <Part k="emailnum">
            <div style={{ padding: "12px 14px", borderRadius: 6, background: W.page, fontSize: 14.5, lineHeight: 1.55, boxShadow: W.float }}>
              Any questions, call our accounts team on <span style={{ whiteSpace: "nowrap", textDecoration: "line-through", textDecorationColor: "#c4314b", textDecorationThickness: 2 }}>{SCAM_NUMBER}</span>.
            </div>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 4. two-step sign-in: the laptop and the phone ───────────────────── */

export type SignInPart = "account" | "password" | "signin" | "screennum" | "screen" | "prompt" | "where" | "numbox" | "deny" | "yes";

export const SIGNIN_PARTS: Record<Exclude<SignInPart, "screen">, PartInfo> = {
  account: { n: 1, name: "Your account", what: "Your work email address. It's how Microsoft 365 knows it's you." },
  password: { n: 2, name: "Your password", what: "The first step: something you know. If it's all there is, anyone who learns it gets in." },
  signin: { n: 3, name: "Sign in", what: "You press it. Now the second step starts." },
  screennum: { n: 4, name: "The number on your screen", what: "Only shown to whoever is signing in. You type it into your phone, to prove the phone and the screen are both yours." },
  prompt: { n: 5, name: "The request on your phone", what: "The second step: something you have. Your phone asks if this sign-in is you." },
  where: { n: 6, name: "App, place and time", what: "Which app, roughly where, and when. Does it match what you're doing right now?" },
  numbox: { n: 7, name: "Type the number", what: "The number from your own screen. No number on your screen means you didn't start this." },
  deny: { n: 8, name: "No, it's not me", what: "For any request you didn't start. The app then offers to report it: say yes." },
  yes: { n: 9, name: "Yes", what: "Only when you have just signed in yourself, and typed the number from your own screen." },
};

export const UNEXPECTED_PARTS: Record<"screen" | "prompt" | "where" | "numbox" | "deny" | "yes", PartInfo> = {
  screen: { n: 1, name: "Your screen", what: "You're reading email. You haven't pressed Sign in anywhere, so there's no number." },
  prompt: { n: 2, name: "The request", what: "It arrives anyway. Someone, somewhere, has typed your password." },
  where: { n: 3, name: "App, place and time", what: "Amsterdam, at 15:02. You're at your desk in Leicester." },
  numbox: { n: 4, name: "Type the number", what: "There's nothing to type. That alone tells you it isn't you." },
  deny: { n: 5, name: "No, it's not me", what: "Press this. The app then offers to report it: say yes, so IT can lock them out." },
  yes: { n: 6, name: "Yes", what: "Never, for a request you didn't start. Saying yes lets them in." },
};

function PhoneFace({ where, children }: { where: string; children?: ReactNode }) {
  return (
    <div style={{ width: 236, padding: 8, borderRadius: 30, background: "#1b1b1f", boxShadow: "0 24px 50px -20px rgba(0,0,0,0.8), inset 0 0 0 2px #3a3a40" }}>
      <div style={{ borderRadius: 23, background: "#f3f4f7", paddingBottom: 14 }}>
        <div style={{ borderRadius: "23px 23px 0 0", overflow: "hidden" }}>
          <StatusBar time="15:02" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px 8px", background: "#fff", borderBottom: "1px solid #e2e4ea", fontSize: 14, fontWeight: 700 }}>
          <AuthLogo size={18} /> Authenticator
        </div>
        <div style={{ padding: "12px 12px 0", display: "grid", gap: 10 }}>
          <div style={{ padding: "10px 12px 10px", borderRadius: 12, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", textAlign: "center" }}>
              <Part k="prompt" style={{ padding: "2px 4px" }}>
                <b style={{ display: "block", fontSize: 16 }}>Approve sign-in?</b>
              </Part>
              <span style={{ display: "block", marginTop: 4, fontSize: 12.5, fontWeight: 600 }}>Northfield Supplies</span>
              <span style={{ display: "block", fontSize: 11.5, color: W.muted }}>
                <span style={NB}>you@</span>
                <wbr />
                <span style={NB}>northfieldsupplies.example</span>
              </span>
              <Part k="where" style={{ marginTop: 10, padding: "0 4px 2px" }}>
                <span style={{ display: "grid", gap: 2, paddingTop: 8, borderTop: "1px solid #e8eaef", fontSize: 11.5, color: W.body, textAlign: "left" }}>
                  <span>App: Microsoft 365</span>
                  <span>Location: {where}</span>
                  <span>Time: 15:02 today</span>
                </span>
              </Part>
            </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function PhoneAnswers({ typed }: { typed?: string }) {
  return (
    <>
      <Part k="numbox" style={{ padding: "4px 6px" }}>
        <div style={{ display: "grid", gap: 4, justifyItems: "center", fontSize: 11.5, color: W.body }}>
          Enter the number shown to sign in.
          <span style={{ width: 80, minHeight: 34, border: "1px solid #c8ccd6", borderRadius: 6, background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, letterSpacing: "0.1em", color: typed ? W.ink : W.faint }}>{typed ?? "  "}</span>
        </div>
      </Part>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginTop: 12 }}>
        <Part k="deny" style={{ padding: 3 }}>
          <span style={{ display: "flex", minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, border: "1px solid #c8ccd6", background: "#fff", fontSize: 12, fontWeight: 600 }}>No, it&apos;s not me</span>
        </Part>
        <Part k="yes" badge="right" style={{ padding: 3 }}>
          <span style={{ display: "flex", minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, background: "#2357c6", color: "#fff", fontSize: 12, fontWeight: 600 }}>Yes</span>
        </Part>
      </div>
    </>
  );
}

const box: CSSProperties = { padding: "16px 18px", borderRadius: 6, background: W.page, boxShadow: W.float, display: "grid", gap: 10, fontSize: 13.5 };
const field: CSSProperties = { display: "block", padding: "7px 0", borderBottom: "1.5px solid #8a8886", fontSize: 14 };

/* `started`: you pressed Sign in yourself (the screen shows a number).
 * Without it, the request arrives while you're just reading email. */
export function SignInFigure({ focus, title, what, note, started = true }: FigProps<SignInPart> & { started?: boolean }) {
  if (!started) {
    return (
      <FigureFrame info={infoOf(UNEXPECTED_PARTS, what as Partial<Record<keyof typeof UNEXPECTED_PARTS, string>>)} focus={focus as (keyof typeof UNEXPECTED_PARTS)[]} title={title ?? "A request you didn't start"} note={note} minWidth={330}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 44px", alignItems: "flex-start", padding: "0 34px 0 40px" }}>
          <Part k="screen" style={{ flex: "1 1 280px", minWidth: 0 }}>
            <AppWindow app="Outlook" colour={W.outlook} title="Inbox">
              <div style={{ padding: "12px 14px", display: "grid", gap: 8, fontSize: 13 }}>
                {["Daniel Okafor · Quick chat at 15:05?", "IT Helpdesk · Your two-step sign-in is set up", "Facilities Team · Fire drill on Thursday"].map((m) => (
                  <span key={m} style={{ padding: "8px 10px", borderBottom: `1px solid ${W.edge}` }}>
                    {m}
                  </span>
                ))}
                <span style={{ color: W.muted, padding: "18px 10px 6px", textAlign: "center" }}>No sign-in, and no number, anywhere on your screen.</span>
              </div>
            </AppWindow>
          </Part>
          <PhoneFace where="Amsterdam, Netherlands">
            <PhoneAnswers />
          </PhoneFace>
        </div>
      </FigureFrame>
    );
  }
  return (
    <FigureFrame info={infoOf(SIGNIN_PARTS, what as Partial<Record<keyof typeof SIGNIN_PARTS, string>>)} focus={focus as (keyof typeof SIGNIN_PARTS)[]} title={title ?? "Two-step sign-in: your screen, then your phone"} note={note} minWidth={330}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 44px", alignItems: "flex-start", padding: "0 34px 0 40px" }}>
        <div style={{ flex: "1 1 280px", minWidth: 0, display: "grid", gap: 16 }}>
          <div style={box}>
            <b style={{ fontSize: 16 }}>Sign in</b>
            <Part k="account">
              <span style={field}>you@northfieldsupplies.example</span>
            </Part>
            <Part k="password">
              <span style={{ ...field, letterSpacing: "0.2em" }}>••••••••••••••••••</span>
            </Part>
            <Part k="signin" style={{ justifySelf: "end" }}>
              <span style={{ display: "inline-flex", minHeight: 32, alignItems: "center", padding: "0 22px", background: "#0067b8", color: "#fff", fontSize: 13.5 }}>Sign in</span>
            </Part>
          </div>
          <div style={box}>
            <b style={{ fontSize: 16 }}>Approve sign-in request</b>
            <span style={{ lineHeight: 1.5, color: W.body }}>Open your Authenticator app, and enter the number shown to sign in.</span>
            <Part k="screennum" style={{ justifySelf: "center" }}>
              <span style={{ display: "block", fontSize: 40, fontWeight: 600, padding: "0 10px" }}>42</span>
            </Part>
          </div>
        </div>
        <PhoneFace where="Leicester, United Kingdom">
          <PhoneAnswers typed="42" />
        </PhoneFace>
      </div>
    </FigureFrame>
  );
}

/* ── 5. changing your password ───────────────────────────────────────── */

export type PasswordPart = "current" | "newpw" | "strength" | "confirm" | "rules" | "save";

export const PASSWORD_PARTS: Record<PasswordPart, PartInfo> = {
  current: { n: 1, name: "Current password", what: "The one you use now, to prove it's you changing it." },
  newpw: { n: 2, name: "New password", what: "Three random words joined together: long, and easy for you to remember." },
  strength: { n: 3, name: "Strength", what: "How hard it would be to guess. Length matters most." },
  confirm: { n: 4, name: "Type it again", what: "The same again, so a typing slip doesn't lock you out." },
  rules: { n: 5, name: "The rules", what: "Your company's rules: how long, and never one you use anywhere else." },
  save: { n: 6, name: "Save", what: "Changes it everywhere you sign in for work: Outlook, Teams, the lot." },
};

export function PasswordFigure({ focus, title = "Changing your password", what, note }: FigProps<PasswordPart>) {
  const label = { fontSize: 12.5, color: W.muted, marginBottom: 2 } as const;
  const input = { display: "block", padding: "8px 10px", border: `1px solid ${W.edge}`, borderRadius: 4, fontSize: 14.5, background: W.page } as const;
  return (
    <FigureFrame info={infoOf(PASSWORD_PARTS, what)} focus={focus} title={title} note={note}>
      <AppWindow app="Account" colour="#2357c6" title="Change password">
        <div style={{ padding: "18px 26px 22px 54px", display: "grid", gap: 18, maxWidth: 520 }}>
          <Part k="current" style={{ padding: "6px 10px", margin: "0 -10px" }}>
            <div style={label}>Current password</div>
            <span style={{ ...input, letterSpacing: "0.2em" }}>••••••••••••</span>
          </Part>
          <Part k="newpw" style={{ padding: "6px 10px", margin: "0 -10px" }}>
            <div style={label}>New password</div>
            <span style={input}>CopperKettleHarbour</span>
          </Part>
          <Part k="strength" style={{ padding: "6px 10px", margin: "0 -10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ flex: 1, display: "flex", gap: 4 }}>
                {[0, 1, 2, 3].map((i) => (
                  <i key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < 4 ? "#107c10" : W.sunk }} />
                ))}
              </span>
              <b style={{ fontSize: 13.5, color: "#107c10" }}>Strong</b>
            </div>
          </Part>
          <Part k="confirm" style={{ padding: "6px 10px", margin: "0 -10px" }}>
            <div style={label}>Type the new password again</div>
            <span style={input}>CopperKettleHarbour</span>
          </Part>
          <Part k="rules" style={{ padding: "6px 10px", margin: "0 -10px" }}>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: W.body }}>At least 12 characters. Don&apos;t use your name, the company&apos;s name, or a password you use anywhere else.</div>
          </Part>
          <Part k="save" style={{ justifySelf: "start", padding: 4, margin: "0 -4px" }}>
            <FakeButton primary colour="#2357c6">
              Save
            </FakeButton>
          </Part>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── 6. the To line: Outlook's suggestions, and its warning ──────────── */

export type ToLinePart = "typed" | "first" | "second" | "external" | "address" | "mailtip" | "chip" | "attach" | "send";

export const TOLINE_PARTS: Record<ToLinePart, PartInfo> = {
  typed: { n: 1, name: "What you typed", what: "Just \"Emma\". Outlook starts suggesting people straight away." },
  first: { n: 2, name: "The first suggestion", what: "The person you heard from most recently goes first, and Enter picks it. Here, that's the wrong Emma." },
  external: { n: 3, name: "External", what: "Outlook's mark for someone outside the company." },
  second: { n: 4, name: "The one you meant", what: "Emma Clarke, HR Advisor. Second in the list today." },
  address: { n: 5, name: "The address", what: "Read it, always. @northfieldsupplies.example is us. Anything else is outside the company." },
  mailtip: { n: 7, name: "The yellow warning", what: "Once she's on the email, Outlook warns you she's outside your organisation. Stop and look." },
  chip: { n: 8, name: "Who it's going to", what: "The name you picked, in yellow because she's outside. Not the one Daniel meant." },
  attach: { n: 9, name: "What's going", what: "Everyone's overtime pay: personal data. It must only go to HR." },
  send: { n: 6, name: "Send", what: "Last chance. Read the To line once more before you press it." },
};

export function ToLineFigure({ focus, title = "Who is it really going to?", what, note }: FigProps<ToLinePart>) {
  const row = (name: string, address: string, detail: string, outside: boolean, k: "first" | "second", on: boolean) => (
    <Part k={k} holds={k === "first" ? ["external"] : ["address"]}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: 4, background: on ? W.select : "transparent" }}>
        <span aria-hidden style={{ width: 30, height: 30, borderRadius: 15, background: outside ? "#8a6d1f" : W.outlook, color: "#fff", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>EC</span>
        <span style={{ minWidth: 0, lineHeight: 1.35 }}>
          <span style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
            <b style={{ fontSize: 14, fontWeight: 600 }}>{name}</b>
            {outside && (
              <Part k="external" block={false} badge="right" style={{ padding: "2px 3px", marginLeft: 6 }}>
                <span style={EXTERNAL}>External</span>
              </Part>
            )}
          </span>
          {k === "second" && !(focus?.includes("second") && !focus.includes("address")) ? (
            <Part k="address" block={false} badge="right" style={{ padding: "2px 6px", margin: "2px -6px 6px" }}>
              <span style={{ fontSize: 12.5, color: W.body, whiteSpace: "nowrap" }}>{address}</span>
            </Part>
          ) : (
            <span style={{ display: "block", fontSize: 12.5, color: W.body, whiteSpace: "nowrap" }}>{address}</span>
          )}
          <span style={{ display: "block", fontSize: 12, color: W.muted }}>{detail}</span>
        </span>
      </div>
    </Part>
  );
  const fieldRow = { display: "flex", alignItems: "center", gap: 10, minHeight: 38, padding: "4px 12px", borderBottom: `1px solid ${W.edge}`, fontSize: 14 } as const;
  const lab = { width: 54, color: W.muted, flexShrink: 0 } as const;
  const head = (t: string) => <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9db9ec" }}>{t}</p>;
  return (
    <FigureFrame info={infoOf(TOLINE_PARTS, what)} focus={focus} title={title} note={note} minWidth={600}>
      <div style={{ display: "grid", gap: 26, padding: "0 40px" }}>
        <div>
          {head("As you type")}
          <AppWindow app="Outlook" colour={W.outlook} title="Forward">
            <div style={fieldRow}>
              <span style={lab}>To</span>
              <Part k="typed" block={false} badge="right" style={{ padding: "2px 8px", margin: "0 -8px" }}>
                <span style={{ fontSize: 15 }}>Emma|</span>
              </Part>
            </div>
            <div style={{ margin: "0 12px 12px 76px", padding: "6px 8px 10px", border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: "0 8px 20px -10px rgba(0,0,0,0.3)", display: "grid", gap: 20, maxWidth: 400 }}>
              <span style={{ padding: "2px 10px 0", fontSize: 11.5, color: W.muted }}>Suggested contacts</span>
              {row(EMMA_CLARKSON.name, EMMA_CLARKSON.address, "Bright Cafe (a customer)", true, "first", true)}
              {row("Emma Clarke", "emma.clarke@northfieldsupplies.example", "HR Advisor, Northfield Supplies", false, "second", false)}
            </div>
          </AppWindow>
        </div>
        <div>
          {head("After pressing Enter")}
          <AppWindow app="Outlook" colour={W.outlook} title="Forward">
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: `1px solid ${W.edge}` }}>
              <Part k="send" block={false} badge="right" style={{ padding: 3 }}>
                <FakeButton primary>➤ Send</FakeButton>
              </Part>
            </div>
            <Part k="mailtip" style={{ borderRadius: 0 }}>
              <div style={{ padding: "7px 12px", background: "#fff4ce", borderBottom: "1px solid #f2d27a", fontSize: 13, lineHeight: 1.45, color: "#3b2e00" }}>
                ⓘ Emma Clarkson is outside your organisation.
                <span style={{ display: "block", color: "#6b4f00" }}>{EMMA_CLARKSON.address}</span>
              </div>
            </Part>
            <div style={{ ...fieldRow, paddingTop: 10, paddingBottom: 8 }}>
              <span style={lab}>To</span>
              <Part k="chip" block={false} badge="right" style={{ padding: "3px 4px" }}>
                <span style={{ padding: "2px 10px", borderRadius: 12, background: "#fff4ce", border: "1px solid #f2d27a", fontSize: 13.5 }}>Emma Clarkson</span>
              </Part>
            </div>
            <div style={{ ...fieldRow, opacity: focus?.length ? 0.32 : 1 }}>
              <span style={lab}>Subject</span>
              FW: November&apos;s overtime sheet
            </div>
            <div style={{ padding: "8px 12px 12px" }}>
              <Part k="attach" block={false} badge="right" style={{ padding: 3 }}>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "4px 10px", border: `1px solid ${W.edge}`, borderRadius: 5, fontSize: 13 }}>📎 2026-11 Overtime November.xlsx</span>
              </Part>
            </div>
          </AppWindow>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 7. customer details: what counts as personal ────────────────────── */

export type CustomerPart = "file" | "business" | "person" | "phone" | "email" | "address" | "card";

export const CUSTOMER_PARTS: Record<CustomerPart, PartInfo> = {
  file: { n: 1, name: "Where it lives", what: "On the team site, open only to the people who need it. Not in your Downloads, not on a USB stick." },
  business: { n: 2, name: "The business", what: "A shop's name on its own isn't personal. It's on the sign above the door." },
  person: { n: 3, name: "A person's name", what: "Personal data: it tells you who someone is." },
  phone: { n: 4, name: "Phone number", what: "Personal, especially a mobile. With a name, it reaches one person." },
  email: { n: 5, name: "Email address", what: "Personal when it's someone's own, like jo.marsh@..." },
  address: { n: 6, name: "Home address", what: "Personal: where someone lives." },
  card: { n: 7, name: "Card digits", what: "Even the last four of a card number. Keep it out of emails and chats." },
};

const PEOPLE_ROWS = [
  ["Bright Cafe", "Jo Marsh", "07700 900 318", "jo.marsh@brightcafe.example", "4 Clarendon Rd, LE2 3AF", "..4417"],
  ["Kent Bakery", "Imran Ahmed", "0116 496 0738", "imran.ahmed@kentbakery.example", "18 Mill Hill, LE3 8GQ", "..2290"],
  ["Oak Street Deli", "Rosa Bianchi", "07700 900 527", "rosa@oakstreetdeli.example", "12 Elm Close, LE5 2PB", "..6631"],
];

export function CustomerDataFigure({ focus, title = "A customer list, and what in it is personal", what, note }: FigProps<CustomerPart>) {
  const cols: { k: Exclude<CustomerPart, "file">; head: string; w: number }[] = [
    { k: "business", head: "Customer", w: 92 },
    { k: "person", head: "Contact", w: 92 },
    { k: "phone", head: "Phone", w: 104 },
    { k: "email", head: "Email", w: 230 },
    { k: "address", head: "Home address", w: 150 },
    { k: "card", head: "Card", w: 60 },
  ];
  return (
    <FigureFrame info={infoOf(CUSTOMER_PARTS, what)} focus={focus} title={title} note={note} minWidth={778}>
      <div style={{ padding: "0 2px" }}>
        <div style={{ background: W.page, borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, overflow: "visible" }}>
          <Part k="file" style={{ borderRadius: "8px 8px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "0 12px", background: W.excel, color: "#fff", fontSize: 13.5, borderRadius: "8px 8px 0 0" }}>
              <b>Excel</b>
              <span style={{ opacity: 0.92 }}>Customer contacts.xlsx · Operations Team &gt; Documents &gt; Customers</span>
            </div>
          </Part>
          <div style={{ display: "flex", padding: "40px 8px 14px 8px", gap: 6 }}>
            {cols.map((c) => (
              <Part key={c.k} k={c.k} badge="top" style={{ width: c.w, flexShrink: 0, borderRadius: 3, padding: 3, boxSizing: "border-box" }}>
                <div style={{ fontSize: 12.5 }}>
                  <div style={{ padding: "6px 8px", background: "#f3f9f5", borderBottom: `2px solid ${W.excel}`, fontWeight: 700, whiteSpace: "nowrap" }}>{c.head}</div>
                  {PEOPLE_ROWS.map((r) => (
                    <div key={r[0]} style={{ padding: "6px 8px", borderBottom: `1px solid ${W.edge}`, whiteSpace: "nowrap" }}>
                      {r[cols.indexOf(c)]}
                    </div>
                  ))}
                </div>
              </Part>
            ))}
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 8. the lock screen ──────────────────────────────────────────────── */

export type LockPart = "keys" | "startlock" | "screen" | "time" | "signin";

export const LOCK_PARTS: Record<LockPart, PartInfo> = {
  keys: { n: 1, name: "Windows key + L", what: "Hold the Windows key (the four squares) and tap L. The fastest way: do it as you stand up." },
  startlock: { n: 2, name: "Or Start > You > Lock", what: "The same with the mouse: Start, click your name, then Lock." },
  screen: { n: 3, name: "The lock screen", what: "Your work is still open behind it, but nobody can see it or touch it." },
  time: { n: 4, name: "Time and date", what: "All anyone passing can see." },
  signin: { n: 5, name: "Sign back in", what: "Click or press a key, then your PIN or password. Everything is just as you left it." },
};

function Keycap({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: wide ? 64 : 50, height: 50, padding: "0 10px", borderRadius: 8, background: "linear-gradient(180deg, #ffffff, #e9eaee)", border: "1px solid #c8cbd2", boxShadow: "0 3px 0 #b8bcc6", fontSize: 18, fontWeight: 700, color: W.ink }}>
      {children}
    </span>
  );
}

export function LockScreenFigure({ focus, title = "Locking your screen", what, note }: FigProps<LockPart>) {
  return (
    <FigureFrame info={infoOf(LOCK_PARTS, what)} focus={focus} title={title} note={note}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 44px", alignItems: "flex-start", padding: "0 38px" }}>
        <div style={{ width: 230, maxWidth: "100%", flexShrink: 0, display: "grid", gap: 30 }}>
          <Part k="keys" style={{ justifySelf: "start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px" }}>
              <Keycap wide>
                <WinLogo size={20} />
              </Keycap>
              <b style={{ fontSize: 20, color: "#cfe0ff" }}>+</b>
              <Keycap>L</Keycap>
            </div>
          </Part>
          <Part k="startlock">
            <div style={{ padding: "8px", borderRadius: 8, background: "#f3f3f3", boxShadow: W.float, fontSize: 13.5, color: W.ink }}>
              <div style={{ padding: "4px 8px 6px", fontSize: 12, color: W.muted }}>you@northfieldsupplies.example</div>
              <div style={{ padding: "6px 8px", color: W.faint }}>Change account settings</div>
              <div style={{ padding: "6px 8px", borderRadius: 4, background: W.select, fontWeight: 600 }}>Lock</div>
              <div style={{ padding: "6px 8px", color: W.faint }}>Sign out</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, padding: "6px 8px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <span aria-hidden style={{ width: 22, height: 22, borderRadius: 11, background: "#8a4fd8", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>Y</span>
                You
              </div>
            </div>
          </Part>
        </div>
        <Part k="screen" holds={["time", "signin"]} badge="right" style={{ flex: "1 1 200px", minWidth: 0 }}>
          <div style={{ position: "relative", height: 270, borderRadius: 8, overflow: "hidden", background: "radial-gradient(120% 90% at 70% 10%, #6f8fc9 0%, #2d4e8c 45%, #13254a 100%)", color: "#fff", border: "6px solid #1b1b1f", boxShadow: W.float }}>
            <LockArt />
            <div style={{ position: "absolute", left: 0, right: 0, top: 34, display: "grid", justifyItems: "center" }}>
              <Part k="time" badge="right">
                <div style={{ textAlign: "center", padding: "0 8px" }}>
                  <div style={{ fontSize: 54, fontWeight: 600, lineHeight: 1 }}>15:04</div>
                  <div style={{ marginTop: 6, fontSize: 15 }}>Wednesday 11 November</div>
                </div>
              </Part>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, display: "grid", justifyItems: "center" }}>
              <Part k="signin" badge="right">
                <span style={{ display: "block", padding: "2px 8px", fontSize: 12.5, opacity: 0.92 }}>Click, or press any key, to sign in</span>
              </Part>
            </div>
          </div>
        </Part>
      </div>
    </FigureFrame>
  );
}
