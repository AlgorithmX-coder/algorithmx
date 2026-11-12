"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { W } from "../../tokens";
import { CONTACTS, YOU } from "../northfield";
import { PlacePicker } from "../places";
import { newId, type Action } from "../store";
import type { Attachment, Email, EmailLink, OfficeFile, OfficeState, Path, Person } from "../types";
import { AppButton, Dialog, FileGlyph, TitleBar } from "../ui";
import { InviteCard } from "./Calendar";
/* ── Module 11: Staying safe at work ── */
import { deliverReplies, detailOf, isInternal, PHONE_OF } from "../safety";
import type { Contact } from "../types";
/* ── end Module 11 ── */

/* Outlook, for the office jobs: Inbox, the job's own folders, Sent items
 * and Junk email; a reading pane; Move to, Flag, Report (phishing) and
 * Search; and a compose pane for Reply, Reply all, Forward and New mail,
 * with Cc, Bcc, Insert link (a link to a file on OneDrive or SharePoint)
 * and Attach (a copy). Sent mail lands in Sent items, where the job's
 * checks read it. Nothing leaves the page. A link in a scam email is
 * recorded when clicked, and shows what it would have done. */

interface Draft {
  to: Person[];
  cc: Person[];
  bcc: Person[];
  subject: string;
  body: string;
  links: EmailLink[];
  attachments: Attachment[];
  inReplyTo?: string;
  quoted?: Email;
}

const EMPTY: Draft = { to: [], cc: [], bcc: [], subject: "", body: "", links: [], attachments: [] };

export default function Outlook({
  state,
  dispatch,
  onAttachment,
  onLink,
}: {
  state: OfficeState;
  dispatch: (a: Action) => void;
  onAttachment: (a: Attachment) => void;
  onLink: (l: EmailLink) => void;
}) {
  const [folder, setFolder] = useState("inbox");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [picker, setPicker] = useState<"link" | "attach" | null>(null);
  const [noSubject, setNoSubject] = useState(false);
  const [query, setQuery] = useState("");
  const [moveMenu, setMoveMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [clickedScam, setClickedScam] = useState<Email | null>(null);
  const [statusUrl, setStatusUrl] = useState<string | null>(null); // Module 11

  const q = query.trim().toLowerCase();
  const hit = (e: Email) => !q || [e.subject, e.body, e.from.name, ...e.to.map((p) => p.name)].some((t) => t.toLowerCase().includes(q));
  /* Search looks in every folder, as Outlook's does. The inbox is seeded
   * newest first; sent mail is added as it goes, so it is turned round. */
  const inFolder = state.emails.filter((e) => (q ? true : e.folder === folder) && hit(e));
  const mails = folder === "sent" && !q ? inFolder.slice().reverse() : inFolder;
  const folders = ["inbox", ...(state.mailFolders ?? []), "sent", ...(state.emails.some((e) => e.folder === "junk") ? ["junk"] : [])];
  const unreadIn = (f: string) => state.emails.filter((e) => e.folder === f && e.unread).length;
  const open = state.emails.find((e) => e.id === openId) ?? null;
  const canFile = !!open && open.folder !== "sent";
  /* Module 11: everyone the To box knows, and who wrote to you most recently */
  const book = addressBook(state);
  const recent = [...new Set(state.emails.filter((e) => e.folder !== "sent").map((e) => e.from.address))];

  const read = (e: Email) => {
    setOpenId(e.id);
    setDraft(null);
    if (e.unread) dispatch({ type: "read", id: e.id });
  };

  const start = (kind: "reply" | "all" | "forward" | "new") => {
    if (kind === "new" || !open) return setDraft({ ...EMPTY });
    const re = open.subject.replace(/^(re|fw|fwd):\s*/i, "");
    if (kind === "forward") return setDraft({ ...EMPTY, subject: `FW: ${re}`, attachments: open.attachments, inReplyTo: open.id, quoted: open });
    const others = [...open.to, ...open.cc].filter((p) => p.address !== YOU.address);
    setDraft({ ...EMPTY, to: [open.from], cc: kind === "all" ? others : [], subject: `Re: ${re}`, inReplyTo: open.id, quoted: open });
  };

  const send = (force = false) => {
    if (!draft || draft.to.length === 0) return;
    if (!draft.subject.trim() && !force) return setNoSubject(true);
    const email: Email = {
      id: newId("mail"),
      folder: "sent",
      from: YOU,
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject.trim(),
      body: draft.body,
      time: "Just now",
      attachments: draft.attachments,
      links: draft.links,
      inReplyTo: draft.inReplyTo,
    };
    dispatch({ type: "send", email });
    if (state.replies?.length) dispatch({ type: "update", fn: (s) => deliverReplies(s, email) }); // Module 11
    setDraft(null);
    setNoSubject(false);
    setFolder("sent");
    setOpenId(email.id);
  };

  const addFile = (f: OfficeFile) => {
    if (!draft) return;
    if (picker === "link") setDraft({ ...draft, links: [...draft.links, { name: f.name, path: f.path, fileName: f.name }] });
    else setDraft({ ...draft, attachments: [...draft.attachments, { name: f.name, sheet: f.sheet, tabs: f.tabs, paper: f.paper, doc: f.doc }] });
    setPicker(null);
  };

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <TitleBar colour={W.outlook} app="Outlook" name="you@northfieldsupplies.example" />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "8px 10px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
        <AppButton primary onClick={() => start("new")}>
          ✉ New mail
        </AppButton>
        <AppButton onClick={() => start("reply")} disabled={!open}>
          ↩ Reply
        </AppButton>
        <AppButton onClick={() => start("all")} disabled={!open}>
          ↩↩ Reply all
        </AppButton>
        <AppButton onClick={() => start("forward")} disabled={!open}>
          ↪ Forward
        </AppButton>
        <span style={{ width: 1, alignSelf: "stretch", background: W.edge }} />
        <span style={{ position: "relative" }}>
          <AppButton onClick={() => setMoveMenu((m) => !m)} disabled={!canFile}>
            📁 Move to ▾
          </AppButton>
          {moveMenu && open && (
            <span role="menu" style={{ position: "absolute", top: "100%", left: 0, zIndex: 20, marginTop: 4, width: 200, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float, padding: 4, display: "block" }}>
              {["inbox", ...(state.mailFolders ?? [])]
                .filter((f) => f !== open.folder)
                .map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="menuitem"
                    className="of-row"
                    onClick={() => {
                      dispatch({ type: "moveMail", id: open.id, folder: f });
                      setMoveMenu(false);
                      setOpenId(null);
                    }}
                    style={{ width: "100%", minHeight: 40, textAlign: "left", padding: "6px 12px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 15, borderRadius: 4 }}
                  >
                    {folderLabel(f)}
                  </button>
                ))}
            </span>
          )}
        </span>
        <AppButton onClick={() => open && dispatch({ type: "flag", id: open.id })} disabled={!canFile}>
          <span style={{ color: "#c4314b" }}>⚑</span> {open?.flagged ? "Unflag" : "Flag"}
        </AppButton>
        <AppButton onClick={() => setReporting(true)} disabled={!canFile || open?.folder === "junk"}>
          ⚠ Report
        </AppButton>
        <input
          aria-label="Search mail"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenId(null);
          }}
          placeholder="Search"
          style={{ marginLeft: "auto", width: 190, minHeight: 40, padding: "0 12px", border: `1px solid ${W.edge}`, borderRadius: 6, fontFamily: W.font, fontSize: 15, color: W.ink, background: W.page }}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* folders */}
        <nav aria-label="Mail folders" style={{ width: 160, flexShrink: 0, padding: "10px 8px", borderRight: `1px solid ${W.edge}`, background: W.chrome, overflowY: "auto" }}>
          {folders.map((id) => {
            const n = unreadIn(id);
            const top = id === "inbox" || id === "sent" || id === "junk";
            return (
              <button
                key={id}
                type="button"
                className={folder === id && !q ? "of-row on" : "of-row"}
                onClick={() => {
                  setFolder(id);
                  setQuery("");
                  setOpenId(null);
                  setDraft(null);
                }}
                style={{ width: "100%", minHeight: 40, display: "flex", justifyContent: "space-between", alignItems: "center", padding: `6px 12px 6px ${top ? 12 : 26}px`, border: "none", borderRadius: 6, background: folder === id && !q ? W.select : "transparent", fontFamily: W.font, fontSize: 15, fontWeight: folder === id ? 600 : 400, color: W.ink }}
              >
                {folderLabel(id)}
                {n > 0 && <b style={{ color: W.outlook }}>{n}</b>}
              </button>
            );
          })}
        </nav>

        {/* message list */}
        <div role="list" aria-label={q ? "Search results" : folderLabel(folder)} style={{ width: 290, flexShrink: 0, borderRight: `1px solid ${W.edge}`, overflowY: "auto" }}>
          {q && <p style={{ margin: 0, padding: "8px 14px", fontSize: 13, color: W.muted, borderBottom: `1px solid ${W.edge}` }}>Results in all folders for &ldquo;{query.trim()}&rdquo;</p>}
          {mails.length === 0 && <p style={{ margin: 0, padding: 18, fontSize: 15, color: W.muted }}>{q ? "Nothing matches." : folder === "sent" ? "Nothing sent yet." : folder === "inbox" ? "Your inbox is empty. Nice work." : "Nothing in this folder yet."}</p>}
          {mails.map((e) => (
            <button
              key={e.id}
              type="button"
              role="listitem"
              className={openId === e.id ? "of-row on" : "of-row"}
              onClick={() => read(e)}
              style={{ position: "relative", width: "100%", display: "block", textAlign: "left", padding: "10px 14px 10px 16px", border: "none", borderBottom: `1px solid ${W.edge}`, background: openId === e.id ? W.select : "transparent", fontFamily: W.font, color: W.ink }}
            >
              {e.unread && <span aria-label="Unread" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: W.outlook }} />}
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 15, fontWeight: e.unread ? 700 : 400 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{folder === "sent" ? `To: ${e.to.map((p) => p.name).join(", ")}` : e.from.name}</span>
                <span style={{ fontSize: 13, color: W.muted, fontWeight: 400, flexShrink: 0 }}>
                  {e.flagged && (
                    <b aria-label="Flagged" style={{ color: "#c4314b", marginRight: 6 }}>
                      ⚑
                    </b>
                  )}
                  {e.time}
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontSize: 14, color: e.unread ? W.outlook : W.body, fontWeight: e.unread ? 600 : 400 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject || "(no subject)"}</span>
                {e.attachments.length > 0 && <span aria-label="Has attachments">📎</span>}
              </span>
              <span style={{ display: "block", marginTop: 2, fontSize: 13, color: W.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.body.split("\n").find((l) => l.trim()) ?? ""}</span>
            </button>
          ))}
        </div>

        {/* reading or writing */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          {draft ? (
            <Compose draft={draft} setDraft={setDraft} onSend={() => send()} onDiscard={() => setDraft(null)} onLink={() => setPicker("link")} onAttach={() => setPicker("attach")} book={book} recent={recent} />
          ) : open ? (
            <Reading
              key={open.id}
              book={book}
              onUrl={setStatusUrl}
              email={open}
              invite={<InviteCard state={state} dispatch={dispatch} emailId={open.id} />}
              onAttachment={onAttachment}
              onLink={onLink}
              onFakeLink={() => {
                dispatch({ type: "clickLink", id: open.id });
                setClickedScam(open);
              }}
            />
          ) : (
            <p style={{ margin: 0, padding: 28, fontSize: 16, color: W.muted }}>Select an email to read it.</p>
          )}
        </div>
      </div>

      {/* Module 11: where a link really goes, in the bottom corner, as a browser shows it */}
      {statusUrl && open?.fakeLink && (
        <div aria-hidden style={{ position: "absolute", left: 0, bottom: 0, zIndex: 16, maxWidth: "70%", padding: "3px 10px", background: W.chrome, border: `1px solid ${W.edge}`, borderLeft: "none", borderBottom: "none", borderTopRightRadius: 4, fontSize: 12.5, color: W.body, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {statusUrl}
        </div>
      )}
      {picker && (
        <PlacePicker
          state={state}
          mode={{ kind: "file", title: picker === "link" ? "Insert a link to a file" : "Attach a copy of a file", action: picker === "link" ? "Insert link" : "Attach", at: ["OneDrive", "Documents"] as Path }}
          onCancel={() => setPicker(null)}
          onFile={addFile}
        />
      )}
      {reporting && open && (
        <Dialog title="Report phishing" onClose={() => setReporting(false)} width={500}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
            Report &ldquo;{open.subject}&rdquo; from {open.from.address} as phishing? It goes to Junk email and IT are told, so they can warn everyone else.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <AppButton onClick={() => setReporting(false)}>Cancel</AppButton>
            <AppButton
              primary
              colour="#c4314b"
              onClick={() => {
                dispatch({ type: "report", id: open.id });
                setReporting(false);
                setOpenId(null);
              }}
            >
              Report
            </AppButton>
          </div>
        </Dialog>
      )}
      {clickedScam && (
        <Dialog title="That link was a trap" onClose={() => setClickedScam(null)} width={560}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>
            It opened <b>{clickedScam.fakeLink?.url}</b>, a fake page made to look like a sign-in page. If you had typed your password there, the scammer would have it.
          </p>
          <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.55 }}>
            At work, tell IT straight away and change your password. Here, close this, then use <b>Report</b> on the email instead of opening its links.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <AppButton primary onClick={() => setClickedScam(null)}>
              I understand
            </AppButton>
          </div>
        </Dialog>
      )}
      {noSubject && (
        <Dialog title="No subject" onClose={() => setNoSubject(false)} width={460}>
          <p style={{ margin: 0, fontSize: 16 }}>This email has no subject. Send it anyway?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <AppButton onClick={() => setNoSubject(false)}>Don&apos;t send</AppButton>
            <AppButton primary onClick={() => send(true)}>
              Send anyway
            </AppButton>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function folderLabel(f: string) {
  return f === "inbox" ? "Inbox" : f === "sent" ? "Sent items" : f === "junk" ? "Junk email" : f;
}

/* `invite`: a meeting invite's answer buttons, drawn above the message
 * when the email carries one (Module 3, ./Calendar). */
function Reading({ email, invite, onAttachment, onLink, onFakeLink, book = [], onUrl }: { email: Email; invite?: ReactNode; onAttachment: (a: Attachment) => void; onLink: (l: EmailLink) => void; onFakeLink: () => void; book?: Contact[]; onUrl?: (url: string | null) => void }) {
  /* Module 11: the sender's contact card, and the link's real address on hover */
  const [card, setCard] = useState(false);
  const [hover, setHoverOnly] = useState(false);
  const url = email.fakeLink ? (email.fakeLink.url.startsWith("http") ? email.fakeLink.url : `https://${email.fakeLink.url}`) : "";
  const setHover = (on: boolean) => {
    setHoverOnly(on);
    onUrl?.(on ? url : null);
  };
  useEffect(() => () => onUrl?.(null), [onUrl]);
  const outside = !isInternal(email.from.address) && !email.from.address.startsWith("you@");
  return (
    <article style={{ padding: "18px 22px 28px" }}>
      {email.reported && <p style={{ margin: "0 0 14px", padding: "10px 12px", borderRadius: 6, background: "#fde7e9", fontSize: 14.5 }}>You reported this email as phishing. IT have been told.</p>}
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.3 }}>{email.subject || "(no subject)"}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <span aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: email.from.address.startsWith("you@") ? "#8a4fd8" : "#c2410c", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {email.from.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </span>
        <span onMouseLeave={() => setCard(false)} style={{ position: "relative", fontSize: 14.5, lineHeight: 1.45 }}>
          <button
            type="button"
            className="ol-name"
            aria-expanded={card}
            aria-label={`${email.from.name}: show their contact card`}
            onClick={() => setCard((c) => !c)}
            onMouseEnter={() => setCard(true)}
            style={{ padding: 0, border: "none", background: "none", fontFamily: W.font, fontWeight: 600, fontSize: 15.5, color: W.ink, cursor: "pointer" }}
          >
            {email.from.name}
          </button>{" "}
          <span style={{ color: W.muted }}>&lt;{email.from.address}&gt;</span>
          {outside && <ExternalTag />}
          {card && <ContactCard person={email.from} known={book.some((p) => p.address === email.from.address)} onClose={() => setCard(false)} />}
          <br />
          <span style={{ color: W.muted }}>
            To: {email.to.map((p) => p.name).join(", ")}
            {email.cc.length > 0 && ` · Cc: ${email.cc.map((p) => p.name).join(", ")}`} · {email.time}
          </span>
        </span>
      </div>
      {(email.attachments.length > 0 || email.links.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {email.attachments.map((a, i) => (
            <button key={`a${i}`} type="button" onClick={() => onAttachment(a)} className="of-btn" title="Open" style={chip}>
              <FileGlyph kind={a.name.endsWith(".pdf") ? "pdf" : a.name.endsWith(".docx") ? "docx" : /\.jpe?g$/i.test(a.name) ? "jpg" : "xlsx"} />
              {a.name}
            </button>
          ))}
          {email.links.map((l, i) => (
            <button key={`l${i}`} type="button" onClick={() => onLink(l)} className="of-btn" title={l.path.join(" > ")} style={{ ...chip, color: W.outlook }}>
              🔗 {l.fileName}
            </button>
          ))}
        </div>
      )}
      {invite}
      <div style={{ marginTop: 18, whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.6 }}>{email.body}</div>
      {email.fakeLink && (
        <p style={{ position: "relative", margin: "16px 0 0", paddingBottom: 66 }}>
          <button
            type="button"
            onClick={() => {
              setHover(false);
              onFakeLink();
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            aria-describedby={hover ? `url-${email.id}` : undefined}
            style={{ minHeight: 44, padding: "8px 18px", border: "none", borderRadius: 4, background: "#ffc83d", color: "#1b1b1b", fontFamily: W.font, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}
          >
            {email.fakeLink.text}
          </button>
          {/* Outlook's tooltip: where the link really goes */}
          {hover && (
            <span id={`url-${email.id}`} role="tooltip" style={{ position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 15, maxWidth: 440, padding: "8px 10px", borderRadius: 4, background: W.page, border: `1px solid ${W.edge}`, boxShadow: W.float, fontSize: 13.5, lineHeight: 1.45, color: W.ink, overflowWrap: "anywhere" }}>
              {url}
              <span style={{ display: "block", color: W.muted }}>Click or tap to follow link.</span>
            </span>
          )}
        </p>
      )}
    </article>
  );
}

const chip = { display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40, padding: "6px 12px", borderRadius: 6, border: `1px solid ${W.edge}`, background: W.page, fontFamily: W.font, fontSize: 14.5, cursor: "pointer", color: W.ink } as const;

function Compose({
  draft,
  setDraft,
  onSend,
  onDiscard,
  onLink,
  onAttach,
  book,
  recent,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSend: () => void;
  onDiscard: () => void;
  onLink: () => void;
  onAttach: () => void;
  book?: Contact[];
  recent?: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${W.edge}` }}>
        <AppButton primary onClick={onSend} disabled={draft.to.length === 0}>
          ➤ Send
        </AppButton>
        <AppButton onClick={onLink}>🔗 Insert link</AppButton>
        <AppButton onClick={onAttach}>📎 Attach file</AppButton>
        <AppButton onClick={onDiscard} style={{ marginLeft: "auto" }}>
          Discard
        </AppButton>
      </div>
      <MailTip people={[...draft.to, ...draft.cc, ...draft.bcc]} />
      <People label="To" people={draft.to} onChange={(to) => setDraft({ ...draft, to })} book={book} recent={recent} />
      <People label="Cc" people={draft.cc} onChange={(cc) => setDraft({ ...draft, cc })} book={book} recent={recent} />
      <People label="Bcc" people={draft.bcc} onChange={(bcc) => setDraft({ ...draft, bcc })} book={book} recent={recent} />
      <label style={field}>
        <span style={fieldLabel}>Subject</span>
        <input aria-label="Subject" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} style={fieldInput} />
      </label>
      {(draft.links.length > 0 || draft.attachments.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 14px", borderBottom: `1px solid ${W.edge}` }}>
          {draft.links.map((l, i) => (
            <span key={`l${i}`} style={{ ...chip, color: W.outlook, cursor: "default" }}>
              🔗 {l.fileName}
              <button type="button" aria-label={`Remove link to ${l.fileName}`} onClick={() => setDraft({ ...draft, links: draft.links.filter((_, j) => j !== i) })} style={xBtn}>
                ✕
              </button>
            </span>
          ))}
          {draft.attachments.map((a, i) => (
            <span key={`a${i}`} style={{ ...chip, cursor: "default" }}>
              📎 {a.name}
              <button type="button" aria-label={`Remove ${a.name}`} onClick={() => setDraft({ ...draft, attachments: draft.attachments.filter((_, j) => j !== i) })} style={xBtn}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <textarea
        aria-label="Email message"
        value={draft.body}
        onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        placeholder="Write your email here"
        style={{ flex: 1, minHeight: 200, border: "none", outline: "none", resize: "vertical", padding: "14px 16px", fontFamily: W.font, fontSize: 16, lineHeight: 1.6, color: W.ink, background: W.page }}
      />
      {draft.quoted && (
        <div style={{ margin: "0 16px 16px", padding: "12px 14px", borderLeft: `3px solid ${W.edge}`, color: W.muted, fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
          <b>From:</b> {draft.quoted.from.name} · {draft.quoted.time}
          <br />
          <b>Subject:</b> {draft.quoted.subject}
          <br />
          <br />
          {draft.quoted.body}
        </div>
      )}
    </div>
  );
}

const field = { display: "flex", alignItems: "center", gap: 10, minHeight: 48, padding: "4px 14px", borderBottom: `1px solid ${W.edge}` } as const;
const fieldLabel = { width: 60, flexShrink: 0, fontSize: 15, color: W.muted } as const;
const fieldInput = { flex: 1, minWidth: 0, minHeight: 38, border: "none", outline: "none", fontFamily: W.font, fontSize: 16, color: W.ink, background: "transparent" } as const;
const xBtn = { width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: W.muted, fontSize: 13 } as const;

/* The To and Cc boxes: people as chips, and a box that suggests contacts
 * as you type their name, as Outlook does. Module 11: the people you have
 * heard from most recently come first (so Enter picks them), each with
 * their address and a line saying who they are, and anyone outside the
 * company is marked. Arrow keys move through the suggestions. */
export function People({ label, people, onChange, book = CONTACTS, recent = [] }: { label: string; people: Person[]; onChange: (p: Person[]) => void; book?: Contact[]; recent?: string[] }) {
  const [text, setText] = useState("");
  const [at, setAt] = useState(0);
  const listId = useId();
  const q = text.trim().toLowerCase();
  const rank = (p: Person) => {
    const i = recent.indexOf(p.address);
    return i < 0 ? recent.length : i;
  };
  const matches = q
    ? book
        .filter((p) => !people.some((x) => x.address === p.address) && (p.name.toLowerCase().includes(q) || p.address.includes(q)))
        .sort((a, b) => rank(a) - rank(b))
    : [];
  const active = Math.min(at, Math.max(0, matches.length - 1));
  const add = (p: Person) => {
    onChange([...people, { name: p.name, address: p.address }]);
    setText("");
    setAt(0);
  };
  return (
    <div style={{ ...field, position: "relative", flexWrap: "wrap" }}>
      <span style={fieldLabel}>{label}</span>
      {people.map((p) => (
        <span key={p.address} title={p.address} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 4px 2px 10px", borderRadius: 14, background: isInternal(p.address) ? W.select : "#fff4ce", border: isInternal(p.address) ? "1px solid transparent" : "1px solid #f2d27a", fontSize: 14.5 }}>
          {p.name}
          <button type="button" aria-label={`Remove ${p.name}`} onClick={() => onChange(people.filter((x) => x.address !== p.address))} style={xBtn}>
            ✕
          </button>
        </span>
      ))}
      <input
        aria-label={label}
        role="combobox"
        aria-expanded={matches.length > 0}
        aria-autocomplete="list"
        aria-controls={listId}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setAt(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[active]) {
            e.preventDefault();
            add(matches[active]);
          } else if (e.key === "ArrowDown" && matches.length) {
            e.preventDefault();
            setAt((active + 1) % matches.length);
          } else if (e.key === "ArrowUp" && matches.length) {
            e.preventDefault();
            setAt((active - 1 + matches.length) % matches.length);
          } else if (e.key === "Escape") setText("");
          else if (e.key === "Backspace" && !text && people.length) onChange(people.slice(0, -1));
        }}
        placeholder={people.length ? "" : "Type a name"}
        style={{ ...fieldInput, minWidth: 140 }}
      />
      {matches.length > 0 && (
        <div id={listId} role="listbox" aria-label="Suggested contacts" style={{ position: "absolute", left: 84, top: "100%", zIndex: 10, width: 380, maxWidth: "calc(100% - 96px)", background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float, padding: 4 }}>
          <p style={{ margin: 0, padding: "4px 10px 6px", fontSize: 12, color: W.muted }}>Suggested contacts</p>
          {matches.map((p, i) => {
            const detail = detailOf(p);
            const outside = !isInternal(p.address);
            return (
              <button
                key={p.address}
                type="button"
                role="option"
                aria-selected={i === active}
                className="of-row"
                onMouseEnter={() => setAt(i)}
                onClick={() => add(p)}
                style={{ width: "100%", minHeight: 52, display: "flex", gap: 10, alignItems: "center", textAlign: "left", padding: "6px 10px", border: "none", background: i === active ? W.select : "transparent", borderRadius: 4, fontFamily: W.font, color: W.ink }}
              >
                <Initials name={p.name} outside={outside} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <b style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</b>
                    {outside && <ExternalTag />}
                  </span>
                  <span style={{ display: "block", fontSize: 13, color: W.body, overflowWrap: "anywhere" }}>{p.address}</span>
                  {detail && <span style={{ display: "block", fontSize: 12.5, color: W.muted }}>{detail}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Module 11: Staying safe at work ────────────────────────────────── */

/* The company's people, plus anyone the job adds (a customer who emailed). */
export function addressBook(s: OfficeState): Contact[] {
  const extra = (s.contacts ?? []).filter((c) => !CONTACTS.some((p) => p.address === c.address));
  return [...CONTACTS, ...extra];
}

function Initials({ name, outside, size = 32 }: { name: string; outside?: boolean; size?: number }) {
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: outside ? "#8a6d1f" : W.outlook, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700 }}>
      {name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}

/* Outlook's mark on a person from outside the company. */
export function ExternalTag() {
  return <span style={{ display: "inline-block", marginLeft: 6, padding: "0 6px", borderRadius: 3, background: "#fff4ce", border: "1px solid #f2d27a", color: "#6b4f00", fontSize: 11.5, fontWeight: 600, lineHeight: "18px", verticalAlign: "1px" }}>External</span>;
}

/* The yellow bar above To: who on this email is outside the company. */
export function MailTip({ people }: { people: Person[] }) {
  const outside = people.filter((p) => !isInternal(p.address));
  if (!outside.length) return null;
  const names = outside.map((p) => p.name);
  const who = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return (
    <div role="status" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 14px", background: "#fff4ce", borderBottom: "1px solid #f2d27a", fontSize: 14, lineHeight: 1.45, color: "#3b2e00" }}>
      <span aria-hidden style={{ flexShrink: 0, fontWeight: 700 }}>ⓘ</span>
      <span>
        {who} {outside.length === 1 ? "is" : "are"} outside your organisation.
        <span style={{ display: "block", color: "#6b4f00", overflowWrap: "anywhere" }}>{outside.map((p) => p.address).join(", ")}</span>
      </span>
    </div>
  );
}

/* The card Outlook shows when you point at or click a sender's name: who
 * they really are, by address. */
function ContactCard({ person, known, onClose }: { person: Person; known: boolean; onClose: () => void }) {
  const outside = !isInternal(person.address);
  const [user, domain] = person.address.split("@");
  const detail = detailOf(person);
  const phone = PHONE_OF[person.address];
  return (
    <span role="dialog" aria-label={`Contact card: ${person.name}`} onMouseLeave={onClose} style={{ position: "absolute", left: 0, top: "100%", zIndex: 18, marginTop: 4, width: 330, display: "block", padding: "14px 14px 12px", background: W.page, border: `1px solid ${W.edge}`, borderRadius: 8, boxShadow: W.float, fontSize: 14, lineHeight: 1.45, color: W.ink }}>
      <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Initials name={person.name} outside={outside} size={44} />
        <span style={{ minWidth: 0 }}>
          <b style={{ display: "block", fontSize: 16, fontWeight: 600 }}>{person.name}</b>
          <span style={{ color: W.muted, fontSize: 13 }}>{known ? (detail ?? "In your contacts") : "Not in your contacts"}</span>
        </span>
        <button type="button" aria-label="Close the contact card" onClick={onClose} style={{ ...xBtn, marginLeft: "auto", alignSelf: "flex-start" }}>
          ✕
        </button>
      </span>
      <span style={{ display: "block", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${W.edge}` }}>
        <span style={{ display: "block", fontSize: 12, color: W.muted }}>Email</span>
        <span style={{ overflowWrap: "anywhere" }}>
          {user}@<b style={{ fontWeight: 700 }}>{domain}</b>
        </span>
        {phone && (
          <>
            <span style={{ display: "block", marginTop: 8, fontSize: 12, color: W.muted }}>Work phone</span>
            <span>{phone}</span>
          </>
        )}
        {outside && (
          <span style={{ display: "block", marginTop: 10, padding: "6px 8px", borderRadius: 4, background: "#fff4ce", color: "#3b2e00", fontSize: 13 }}>
            Outside your organisation.{known ? "" : " You haven't had an email from this address before."}
          </span>
        )}
      </span>
    </span>
  );
}
/* ── end Module 11 ── */
