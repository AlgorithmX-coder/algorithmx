"use client";

import type { ReactNode } from "react";
import { W } from "../../tokens";
import { AppWindow, FakeButton, FigureFrame, Part, type PartInfo } from "./parts";

/* Email, drawn the way Outlook shows it, with every part numbered: an
 * email you have received, one you are writing, the inbox around them,
 * and who gets what when you press Reply, Reply all or Forward. */

/* ── an email you have received ─────────────────────────────────────── */

export type ReadPart = "from" | "to" | "cc" | "subject" | "sent" | "attachment" | "greeting" | "message" | "signoff" | "signature";

export const READ_PARTS: Record<ReadPart, PartInfo> = {
  subject: { n: 1, name: "Subject", what: "What the email is about, in a few words. It's the first thing you see in your inbox, before you open anything." },
  from: { n: 2, name: "From", what: "Who sent it: their name, and their email address in the brackets." },
  to: { n: 3, name: "To", what: "Who it's for. If your name is here, you're expected to do something or reply." },
  cc: { n: 4, name: "Cc", what: "People copied in to keep them informed. They usually don't need to act." },
  sent: { n: 5, name: "Date and time", what: 'When it was sent. Words like "tomorrow" count from here, not from when you read it.' },
  attachment: { n: 6, name: "Attachment", what: "A file sent with the email. Click it to open it. The paperclip in the inbox tells you there's one." },
  greeting: { n: 7, name: "Greeting", what: 'How it starts, on its own line: "Hi" and your name.' },
  message: { n: 8, name: "The message", what: "What's happened and what they need. A good one puts the ask, and the deadline, in the first lines." },
  signoff: { n: 9, name: "Sign-off", what: 'How it ends: "Thanks," or "Kind regards," and their first name.' },
  signature: { n: 10, name: "Signature", what: "Their full name, job title, company and phone number, added at the bottom of every email they send." },
};

export interface ReadExample {
  from: [string, string];
  to: string;
  cc?: string;
  subject: string;
  sent: string;
  attachment?: string;
  greeting: string;
  message: string[];
  signoff: string;
  signature: string[];
}

export const SARAH_EMAIL: ReadExample = {
  from: ["Sarah Patel", "sarah.patel@northfieldsupplies.example"],
  to: "You",
  cc: "Daniel Okafor",
  subject: "Pallet count for aisle C",
  sent: "Monday 10 November, 10:12",
  attachment: "Stock count aisle C.pdf",
  greeting: "Hi,",
  message: ["Could you recount the pallets in aisle C and update the stock sheet by 2pm tomorrow?", "The numbers on the sheet don't match what's on the floor. Last week's count is attached."],
  signoff: "Thanks,\nSarah",
  signature: ["Sarah Patel", "Warehouse Supervisor | Northfield Supplies", "01632 960 412"],
};

const row = { display: "flex", gap: 10, alignItems: "baseline", fontSize: 14.5, lineHeight: 1.5 } as const;
const label = { width: 44, flexShrink: 0, color: W.muted, whiteSpace: "nowrap" } as const;

/* `bare` draws the email with no numbers or key: for a practice task,
 * where the learner reads it for real. */
export function EmailFigure({ email = SARAH_EMAIL, focus, title = "An email you've received", note, bare }: { email?: ReadExample; focus?: ReadPart[]; title?: string; note?: string; bare?: boolean }) {
  const parts = (bare ? {} : { ...READ_PARTS }) as Record<ReadPart, PartInfo>;
  if (!email.cc) delete (parts as Partial<Record<ReadPart, PartInfo>>).cc;
  if (!email.attachment) delete (parts as Partial<Record<ReadPart, PartInfo>>).attachment;
  return (
    <FigureFrame info={parts} focus={focus} title={title} note={note}>
      <AppWindow
        app="Outlook"
        colour={W.outlook}
        title="Inbox"
        toolbar={
          <>
            <FakeButton>↩ Reply</FakeButton>
            <FakeButton>↩↩ Reply all</FakeButton>
            <FakeButton>↪ Forward</FakeButton>
          </>
        }
      >
        <div style={{ padding: "18px 26px 22px 52px", display: "grid", gap: 10 }}>
          <Part k="subject">
            <div style={{ fontSize: 20, fontWeight: 600 }}>{email.subject}</div>
          </Part>
          <div style={{ display: "grid", gap: 8, paddingTop: 4 }}>
            <Part k="from">
              <div style={row}>
                <span style={label}>From</span>
                <span>
                  <b>{email.from[0]}</b> <span style={{ color: W.muted }}>&lt;{email.from[1]}&gt;</span>
                </span>
              </div>
            </Part>
            <Part k="to">
              <div style={row}>
                <span style={label}>To</span>
                <span>{email.to}</span>
              </div>
            </Part>
            {email.cc && (
              <Part k="cc">
                <div style={row}>
                  <span style={label}>Cc</span>
                  <span>{email.cc}</span>
                </div>
              </Part>
            )}
            <Part k="sent">
              <div style={row}>
                <span style={label}>Sent</span>
                <span>{email.sent}</span>
              </div>
            </Part>
          </div>
          {email.attachment && (
            <Part k="attachment" style={{ justifySelf: "start" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", border: `1px solid ${W.edge}`, borderRadius: 6, fontSize: 14 }}>
                <span style={{ width: 14, height: 18, background: "#c4314b", borderRadius: 2, display: "inline-block" }} />
                {email.attachment}
              </span>
            </Part>
          )}
          <div style={{ borderTop: `1px solid ${W.edge}`, margin: "4px 0" }} />
          <Part k="greeting" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div style={{ fontSize: 15.5 }}>{email.greeting}</div>
          </Part>
          <Part k="message">
            <div style={{ display: "grid", gap: 8, fontSize: 15.5, lineHeight: 1.55 }}>
              {email.message.map((m) => (
                <p key={m} style={{ margin: 0 }}>
                  {m}
                </p>
              ))}
            </div>
          </Part>
          <Part k="signoff" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div style={{ fontSize: 15.5, whiteSpace: "pre-wrap" }}>{email.signoff}</div>
          </Part>
          <Part k="signature" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div style={{ fontSize: 13.5, lineHeight: 1.5, color: W.body, borderTop: `1px solid ${W.edge}`, paddingTop: 8 }}>
              <b style={{ color: W.ink }}>{email.signature[0]}</b>
              {email.signature.slice(1).map((s) => (
                <div key={s}>{s}</div>
              ))}
            </div>
          </Part>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── an email you are writing ───────────────────────────────────────── */

export type WritePart = "send" | "to" | "cc" | "bcc" | "subject" | "attach" | "greeting" | "message" | "signoff" | "signature";

export const WRITE_PARTS: Record<WritePart, PartInfo> = {
  send: { n: 1, name: "Send", what: "Sends it. Read it back first: once it's gone, you can't take it back." },
  to: { n: 2, name: "To", what: "The people who must act on it. Start typing a name and Outlook suggests the address." },
  cc: { n: 3, name: "Cc", what: "People who need to know, but don't need to act." },
  bcc: { n: 4, name: "Bcc", what: "Hidden copies: they get it, but nobody sees their address. For big lists of outside people." },
  subject: { n: 5, name: "Subject", what: "What it's about, in about 3 to 8 words. Put in the number people will look up, like an order number." },
  attach: { n: 6, name: "Attach file or Insert link", what: "Adds a file. Colleagues get a link to the one real file; people outside the company get the file attached." },
  greeting: { n: 7, name: "Greeting", what: '"Hi" and their name, then a comma, on its own line. "Dear" for a first, formal email.' },
  message: { n: 8, name: "The message", what: "What you need and by when, in the first lines. Then any detail, kept short." },
  signoff: { n: 9, name: "Sign-off", what: '"Thanks," or "Kind regards," and your first name on the next line.' },
  signature: { n: 10, name: "Signature", what: "Your name, job title, company and phone. Set it up once and Outlook adds it every time." },
};

export interface WriteExample {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  attachment?: string;
  greeting: string;
  message: string[];
  signoff: string;
  signature: string[];
}

export const DELIVERY_REPLY: WriteExample = {
  to: "Sarah Patel",
  cc: "Daniel Okafor",
  subject: "Order 4417: two pallets arriving Wednesday",
  attachment: "DN-77812.pdf",
  greeting: "Hi Sarah,",
  message: ["Harlow Packaging will deliver the two missing pallets from order 4417 on Wednesday 11 November, before 10am.", "I've attached their delivery note, which shows the 10 we received."],
  signoff: "Kind regards,\nJordan",
  signature: ["Jordan Miles", "Office Administrator | Northfield Supplies", "01632 960 431"],
};

const field = { display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "4px 10px", borderBottom: `1px solid ${W.edge}`, fontSize: 14.5 } as const;

/* Every part is always drawn (an empty Cc or Bcc says "nobody"), so a part
 * keeps the same number on every card of a lesson. `hide` only leaves out
 * the attached file under the subject. */
export function ComposeFigure({ email = DELIVERY_REPLY, focus, title = "An email you're writing", note, hide = [] }: { email?: WriteExample; focus?: WritePart[]; title?: string; note?: string; hide?: WritePart[] }) {
  const parts = WRITE_PARTS;
  const noChip = hide.includes("attach");
  return (
    <FigureFrame info={parts} focus={focus} title={title} note={note} minWidth={560}>
      <AppWindow app="Outlook" colour={W.outlook} title="New message">
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px 10px 52px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <Part k="send" block={false}>
            <FakeButton primary>➤ Send</FakeButton>
          </Part>
          <Part k="attach" block={false} badge="right">
            <span style={{ display: "inline-flex", gap: 6 }}>
              <FakeButton>📎 Attach file</FakeButton>
              <FakeButton>🔗 Insert link</FakeButton>
            </span>
          </Part>
        </div>
        <div style={{ padding: "6px 20px 0 52px" }}>
          <Part k="to">
            <div style={field}>
              <span style={label}>To</span>
              <span style={{ padding: "2px 10px", borderRadius: 12, background: W.select }}>{email.to}</span>
            </div>
          </Part>
          <Part k="cc">
            <div style={field}>
              <span style={label}>Cc</span>
              {email.cc ? <span style={{ padding: "2px 10px", borderRadius: 12, background: W.select }}>{email.cc}</span> : <span style={{ color: W.faint }}>(nobody)</span>}
            </div>
          </Part>
          <Part k="bcc">
            <div style={field}>
              <span style={label}>Bcc</span>
              {email.bcc ? <span style={{ padding: "2px 10px", borderRadius: 12, background: W.select }}>{email.bcc}</span> : <span style={{ color: W.faint }}>(nobody)</span>}
            </div>
          </Part>
          <Part k="subject">
            <div style={field}>
              <span style={label}>Subject</span>
              <b style={{ fontWeight: 600 }}>{email.subject}</b>
            </div>
          </Part>
          {email.attachment && !noChip && (
            <div style={{ padding: "8px 10px", borderBottom: `1px solid ${W.edge}`, fontSize: 13.5 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", border: `1px solid ${W.edge}`, borderRadius: 5 }}>📎 {email.attachment}</span>
            </div>
          )}
        </div>
        <div style={{ padding: "16px 26px 22px 62px", display: "grid", gap: 10, fontSize: 15.5, lineHeight: 1.55 }}>
          <Part k="greeting" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div>{email.greeting}</div>
          </Part>
          <Part k="message">
            <div style={{ display: "grid", gap: 8 }}>
              {email.message.map((m) => (
                <p key={m} style={{ margin: 0 }}>
                  {m}
                </p>
              ))}
            </div>
          </Part>
          <Part k="signoff" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div style={{ whiteSpace: "pre-wrap" }}>{email.signoff}</div>
          </Part>
          {
            <Part k="signature" style={{ justifySelf: "start", paddingRight: 8 }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: W.body, borderTop: `1px solid ${W.edge}`, paddingTop: 8 }}>
                <b style={{ color: W.ink }}>{email.signature[0]}</b>
                {email.signature.slice(1).map((s) => (
                  <div key={s}>{s}</div>
                ))}
              </div>
            </Part>
          }
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── the inbox around them ──────────────────────────────────────────── */

export type InboxPart = "folders" | "inbox" | "list" | "unread" | "flag" | "clip" | "search" | "moveto" | "flagbtn" | "report" | "reading";

export const INBOX_PARTS: Record<InboxPart, PartInfo> = {
  folders: { n: 1, name: "Folders", what: "Where emails are kept once they're dealt with: one folder per kind of email, like Deliveries or Invoices." },
  inbox: { n: 2, name: "Inbox and its count", what: "New emails arrive here. The number is how many you haven't opened yet." },
  list: { n: 3, name: "The message list", what: "One line per email: who sent it, the subject, the first words, and when." },
  unread: { n: 4, name: "Unread", what: "Bold, with a blue bar: you haven't opened it yet." },
  flag: { n: 5, name: "Flag", what: "A red flag marks an email you still need to act on. It's your to-do list." },
  clip: { n: 6, name: "Paperclip", what: "This email has an attachment." },
  search: { n: 7, name: "Search", what: "Type a name, a word or an order number to find any email, in every folder at once." },
  moveto: { n: 8, name: "Move to", what: "Files the open email into one of your folders." },
  flagbtn: { n: 9, name: "Flag button", what: "Puts a flag on the open email, or takes it off once it's done." },
  report: { n: 10, name: "Report", what: "For an email that looks like a scam. It goes to Junk, and IT can warn everyone else." },
  reading: { n: 11, name: "Reading pane", what: "The email you clicked on, open in full." },
};

const MAILS: { who: string; subject: string; first: string; time: string; unread?: boolean; flag?: boolean; clip?: boolean }[] = [
  { who: "Sarah Patel", subject: "Pallet count for aisle C", first: "Could you recount the pallets in aisle C…", time: "10:12", unread: true, flag: true, clip: true },
  { who: "HR Team", subject: "Your rota for next week", first: "Your shifts for 16 to 22 November…", time: "09:40", unread: true },
  { who: "Priya Shah", subject: "Invoice HP-2291", first: "Can you check this against the PO…", time: "Mon", clip: true },
  { who: "Daniel Okafor", subject: "Welcome to Northfield!", first: "A quick tip for your first week…", time: "Mon" },
];

export function InboxFigure({ focus, title = "Your inbox", note }: { focus?: InboxPart[]; title?: string; note?: string }) {
  return (
    <FigureFrame info={INBOX_PARTS} focus={focus} title={title} note={note} minWidth={720}>
      <AppWindow
        app="Outlook"
        colour={W.outlook}
        toolbar={
          <>
            <FakeButton primary>✉ New mail</FakeButton>
            <Part k="moveto" block={false} badge="top">
              <FakeButton>📁 Move to ▾</FakeButton>
            </Part>
            <Part k="flagbtn" block={false} badge="top">
              <FakeButton>
                <span style={{ color: "#c4314b" }}>⚑</span> Flag
              </FakeButton>
            </Part>
            <Part k="report" block={false} badge="top">
              <FakeButton>⚠ Report</FakeButton>
            </Part>
            <span style={{ marginLeft: "auto" }}>
              <Part k="search" block={false} badge="left">
                <span style={{ display: "inline-flex", alignItems: "center", width: 170, minHeight: 32, padding: "0 10px", border: `1px solid ${W.edge}`, borderRadius: 5, background: W.page, color: W.faint, fontSize: 13.5 }}>⌕ Search</span>
              </Part>
            </span>
          </>
        }
      >
        <div style={{ display: "flex", minHeight: 280 }}>
          <div style={{ width: 168, flexShrink: 0, padding: "12px 8px 12px 44px", background: W.chrome, borderRight: `1px solid ${W.edge}`, fontSize: 14 }}>
            <Part k="inbox">
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", borderRadius: 5, background: W.select, fontWeight: 600 }}>
                Inbox <b style={{ color: W.outlook }}>2</b>
              </div>
            </Part>
            <Part k="folders" style={{ marginTop: 8 }}>
              <div style={{ display: "grid", gap: 2, paddingLeft: 12 }}>
                {["Deliveries", "Invoices", "HR"].map((f) => (
                  <span key={f} style={{ padding: "5px 8px" }}>
                    {f}
                  </span>
                ))}
              </div>
            </Part>
            <div style={{ padding: "6px 8px", marginTop: 6 }}>Sent items</div>
          </div>
          <div style={{ width: 320, flexShrink: 0, borderRight: `1px solid ${W.edge}` }}>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-end", height: 34, padding: "0 14px 0 44px", borderBottom: `1px solid ${W.edge}`, fontSize: 13.5 }}>
              <b style={{ paddingBottom: 6, borderBottom: `2px solid ${W.outlook}` }}>Focused</b>
              <span style={{ paddingBottom: 8, color: W.muted }}>Other</span>
            </div>
            <Part k="list" badge="top" style={{ borderRadius: 0 }} holds={["unread", "flag", "clip"]}>
              <div>
                {MAILS.map((m, i) => {
                  const line = (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: m.unread ? 700 : 400 }}>
                        <span>{m.who}</span>
                        <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontWeight: 400, color: W.muted, fontSize: 12.5 }}>
                          {m.flag && (
                            <Part k="flag" block={false} badge="left">
                              <b style={{ color: "#c4314b" }}>⚑</b>
                            </Part>
                          )}
                          {m.time}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, fontSize: 13, color: m.unread ? W.outlook : W.body, fontWeight: m.unread ? 600 : 400 }}>
                        {m.subject}
                        {m.clip && i === 2 ? (
                          <Part k="clip" block={false} badge="right">
                            <span>📎</span>
                          </Part>
                        ) : (
                          m.clip && <span>📎</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, color: W.muted }}>{m.first}</div>
                    </>
                  );
                  return (
                    <div key={m.subject} style={{ position: "relative", padding: "8px 12px 8px 44px", borderBottom: `1px solid ${W.edge}`, background: i === 0 ? W.select : W.page }}>
                      {m.unread && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: W.outlook }} />}
                      {i === 1 ? (
                        <Part k="unread" badge="left">
                          {line}
                        </Part>
                      ) : (
                        line
                      )}
                    </div>
                  );
                })}
              </div>
            </Part>
          </div>
          <div style={{ flex: 1, padding: "52px 22px 14px 22px" }}>
            <Part k="reading" badge="top">
              <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Pallet count for aisle C</div>
                <div style={{ color: W.muted, marginTop: 4 }}>Sarah Patel · Today 10:12</div>
                <p style={{ margin: "10px 0 0" }}>Hi,</p>
                <p style={{ margin: "6px 0 0" }}>Could you recount the pallets in aisle C and update the stock sheet by 2pm tomorrow?</p>
              </div>
            </Part>
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── who gets it: Reply, Reply all, Forward ─────────────────────────── */

export type ReplyPart = "original" | "reply" | "replyall" | "forward";

export const REPLY_PARTS: Record<ReplyPart, PartInfo> = {
  original: { n: 1, name: "The email you got", what: "From Imran at Kent Bakery, to you, with four of his staff on Cc." },
  reply: { n: 2, name: "Reply", what: "Goes back to Imran only. The four on Cc don't see your answer." },
  replyall: { n: 3, name: "Reply all", what: "Goes to Imran and everyone who was on To and Cc: all five of them." },
  forward: { n: 4, name: "Forward", what: "Sends the whole email on to someone new, who you type in, like Sarah. Imran doesn't see it." },
};

function Person({ name, on }: { name: string; on: boolean }) {
  return <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 13, background: on ? "#dff6dd" : W.sunk, color: on ? "#0e700e" : W.faint, textDecoration: on ? "none" : "line-through" }}>{name}</span>;
}

export function ReplyFigure({ focus, title = "Who gets your answer", note }: { focus?: ReplyPart[]; title?: string; note?: string }) {
  const kent = ["Imran", "Lucy", "Tom", "Aisha", "Ben"];
  const card = (k: ReplyPart, button: ReactNode, gets: string[], extra?: string) => (
    <Part k={k} badge="top">
      <div style={{ padding: "12px 14px", border: `1px solid ${W.edge}`, borderRadius: 8, background: W.page, display: "grid", gap: 8 }}>
        <span>{button}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {kent.map((p) => (
            <Person key={p} name={p} on={gets.includes(p)} />
          ))}
          {extra && <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 13, background: "#dff6dd", color: "#0e700e" }}>+ {extra}</span>}
        </div>
      </div>
    </Part>
  );
  return (
    <FigureFrame info={REPLY_PARTS} focus={focus} title={title} note={note} minWidth={560}>
      <div style={{ display: "grid", gap: 34, paddingTop: 6 }}>
        <Part k="original" badge="top">
          <div style={{ padding: "12px 14px", border: `1px solid ${W.edge}`, borderRadius: 8, background: W.page, fontSize: 14, lineHeight: 1.6 }}>
            <b>Late delivery on Friday</b>
            <div>
              <span style={{ color: W.muted }}>From</span> Imran Ahmed (Kent Bakery)
            </div>
            <div>
              <span style={{ color: W.muted }}>To</span> You
            </div>
            <div>
              <span style={{ color: W.muted }}>Cc</span> Lucy, Tom, Aisha, Ben (Kent Bakery)
            </div>
          </div>
        </Part>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {card("reply", <FakeButton>↩ Reply</FakeButton>, ["Imran"])}
          {card("replyall", <FakeButton>↩↩ Reply all</FakeButton>, kent)}
          {card("forward", <FakeButton>↪ Forward</FakeButton>, [], "Sarah")}
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── a file name, and what its ending means ─────────────────────────── */

export type FilePart = "name" | "type" | "trick";

export const FILE_PARTS: Record<FilePart, PartInfo> = {
  name: { n: 1, name: "The name", what: "What the file is about. Anyone can type anything here." },
  type: { n: 2, name: "The ending", what: "After the last dot: what kind of file it really is. .pdf is a document, .xlsx a spreadsheet, .docx a Word file." },
  trick: { n: 3, name: "A trick ending", what: "A scam hides the real ending at the end: this is a program (.exe), dressed up to look like a PDF. Never open it." },
};

export function FileNameFigure({ focus, title = "Reading an attachment's name", note }: { focus?: FilePart[]; title?: string; note?: string }) {
  const chip = (text: ReactNode) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 0, padding: "8px 14px", border: `1px solid ${W.edge}`, borderRadius: 6, background: W.page, fontSize: 17, fontFamily: "Consolas, ui-monospace, monospace" }}>{text}</span>
  );
  return (
    <FigureFrame info={FILE_PARTS} focus={focus} title={title} note={note}>
      <div style={{ display: "grid", gap: 40, padding: "26px 0 4px 10px" }}>
        <div>
          {chip(
            <>
              <Part k="name" block={false} badge="top">
                <span>Invoice HP-2291</span>
              </Part>
              <Part k="type" block={false} badge="top">
                <span>.pdf</span>
              </Part>
            </>,
          )}
          <span style={{ marginLeft: 12, fontSize: 14, color: "#0e700e" }}>a document: fine to open from a supplier you know</span>
        </div>
        <div>
          {chip(
            <>
              <span>invoice.pdf</span>
              <Part k="trick" block={false} badge="top">
                <span style={{ color: "#c4314b", fontWeight: 700 }}>.exe</span>
              </Part>
            </>,
          )}
          <span style={{ marginLeft: 12, fontSize: 14, color: "#c4314b" }}>a program pretending to be a PDF: report it</span>
        </div>
      </div>
    </FigureFrame>
  );
}
