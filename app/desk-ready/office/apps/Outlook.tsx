"use client";

import { useState, type ReactNode } from "react";
import { W } from "../../tokens";
import { CONTACTS, YOU } from "../northfield";
import { PlacePicker } from "../places";
import { newId, type Action } from "../store";
import type { Attachment, Email, EmailLink, OfficeFile, OfficeState, Path, Person } from "../types";
import { AppButton, Dialog, FileGlyph, TitleBar } from "../ui";
import { InviteCard } from "./Calendar";

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
            <Compose draft={draft} setDraft={setDraft} onSend={() => send()} onDiscard={() => setDraft(null)} onLink={() => setPicker("link")} onAttach={() => setPicker("attach")} />
          ) : open ? (
            <Reading
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
function Reading({ email, invite, onAttachment, onLink, onFakeLink }: { email: Email; invite?: ReactNode; onAttachment: (a: Attachment) => void; onLink: (l: EmailLink) => void; onFakeLink: () => void }) {
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
        <span style={{ fontSize: 14.5, lineHeight: 1.45 }}>
          <b style={{ fontWeight: 600, fontSize: 15.5 }}>{email.from.name}</b> <span style={{ color: W.muted }}>&lt;{email.from.address}&gt;</span>
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
        <p style={{ margin: "16px 0 0" }}>
          <button type="button" onClick={onFakeLink} title={email.fakeLink.url} style={{ minHeight: 44, padding: "8px 18px", border: "none", borderRadius: 4, background: "#ffc83d", color: "#1b1b1b", fontFamily: W.font, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>
            {email.fakeLink.text}
          </button>
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
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSend: () => void;
  onDiscard: () => void;
  onLink: () => void;
  onAttach: () => void;
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
      <People label="To" people={draft.to} onChange={(to) => setDraft({ ...draft, to })} />
      <People label="Cc" people={draft.cc} onChange={(cc) => setDraft({ ...draft, cc })} />
      <People label="Bcc" people={draft.bcc} onChange={(bcc) => setDraft({ ...draft, bcc })} />
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
 * as you type their name, as Outlook does. */
function People({ label, people, onChange }: { label: string; people: Person[]; onChange: (p: Person[]) => void }) {
  const [text, setText] = useState("");
  const q = text.trim().toLowerCase();
  const matches = q ? CONTACTS.filter((p) => !people.some((x) => x.address === p.address) && (p.name.toLowerCase().includes(q) || p.address.includes(q))) : [];
  const add = (p: Person) => {
    onChange([...people, p]);
    setText("");
  };
  return (
    <div style={{ ...field, position: "relative", flexWrap: "wrap" }}>
      <span style={fieldLabel}>{label}</span>
      {people.map((p) => (
        <span key={p.address} title={p.address} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 4px 2px 10px", borderRadius: 14, background: W.select, fontSize: 14.5 }}>
          {p.name}
          <button type="button" aria-label={`Remove ${p.name}`} onClick={() => onChange(people.filter((x) => x.address !== p.address))} style={xBtn}>
            ✕
          </button>
        </span>
      ))}
      <input
        aria-label={label}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) {
            e.preventDefault();
            add(matches[0]);
          } else if (e.key === "Backspace" && !text && people.length) onChange(people.slice(0, -1));
        }}
        placeholder={people.length ? "" : "Type a name"}
        style={{ ...fieldInput, minWidth: 140 }}
      />
      {matches.length > 0 && (
        <div role="listbox" style={{ position: "absolute", left: 84, top: "100%", zIndex: 10, width: 320, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: W.float, padding: 4 }}>
          {matches.map((p) => (
            <button key={p.address} type="button" role="option" aria-selected={false} className="of-row" onClick={() => add(p)} style={{ width: "100%", minHeight: 44, textAlign: "left", padding: "6px 10px", border: "none", background: "transparent", borderRadius: 4, fontFamily: W.font }}>
              <b style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{p.name}</b>
              <span style={{ fontSize: 13, color: W.muted }}>{p.address}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
