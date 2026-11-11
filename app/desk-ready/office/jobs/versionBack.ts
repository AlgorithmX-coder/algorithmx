import { officeFolders, PEOPLE, SIGNATURE, YOU } from "../northfield";
import { pathText, samePath, type Check, type Job, type OfficeFile, type OfficeState } from "../types";
import { para } from "../word";
import { sameGrid, STOCK, STOCK_NAME, stockFirst, stockNeighbours, stockRight, stockSavedOver, stockWrong } from "./stockSheet";

/* E9.3 Get yesterday's version back (criteria SP-1, SP-7). Sarah messages
 * on Teams: she saved last month's numbers over the stock sheet this
 * morning. Its version history has last night's count (09/11/2026 17:42,
 * right) under this morning's save (10/11/2026 08:31, wrong), and an older
 * one from 2 November. Done means the 17:42 version is restored, and the
 * learner's own working notes, which they left on the team site, are moved
 * to their OneDrive's Drafts folder, where personal drafts belong. */

const DRAFTS = ["OneDrive", "Documents", "Drafts"] as const;
const NOTES = "seed-notes";

function seed(): OfficeState {
  const files: OfficeFile[] = [...officeFolders(), stockSavedOver(), ...stockNeighbours()];
  files.push({ id: "seed-dir-drafts", path: ["OneDrive", "Documents"], name: "Drafts", kind: "folder", modified: "02/11/2026", by: "You", seeded: true });
  files.push({ id: "seed-draft-cv", path: [...DRAFTS], name: "2026-11-06 Training ideas.docx", kind: "docx", modified: "06/11/2026", by: "You", seeded: true, editable: true, doc: { blocks: [para("Training ideas", "title"), para("Ask Daniel about the forklift course."), para("Excel: learn filters properly.")] } });
  files.push({
    id: NOTES,
    path: [...STOCK],
    name: "2026-11-09 My stock count notes.docx",
    kind: "docx",
    modified: "09/11/2026 17:30",
    by: "You",
    seeded: true,
    editable: true,
    doc: {
      blocks: [
        para("My stock count notes", "title"),
        para("Rough notes for me, while I learn how the count works."),
        para("Bay C: count boxes by the layer, 20 to a layer.", "bullet"),
        para("Ask Sarah why bread flour is under its reorder level.", "bullet"),
        para("Hand soap: 9 left, check with Oakfield on Thursday.", "bullet"),
      ],
    },
  });
  return {
    version: 0,
    files,
    emails: [
      {
        id: "mail-daniel-notes",
        folder: "inbox",
        from: PEOPLE.daniel,
        to: [YOU],
        cc: [],
        subject: "Your notes on the team site",
        time: "08:40",
        unread: true,
        body: `Hi,\n\nNo harm done, but your stock count notes from yesterday are sitting in the Stock folder on the Operations Team site, where the whole team sees them. Anything that's just for you shouldn't be on the team site. Can you move them?\n\nThanks,\nDaniel\n\n${SIGNATURE.daniel}`,
        attachments: [],
        links: [],
      },
    ],
    teamsNote: {
      with: PEOPLE.sarah,
      messages: [
        { id: "msg-1", from: PEOPLE.sarah, text: "Help! I saved over the stock sheet with last month's numbers.", time: "08:51" },
        { id: "msg-2", from: PEOPLE.sarah, text: "It's Stock November, in Operations Team > Documents > Stock. Last night's count was right when I went home. Can you get it back? I'm on the warehouse floor till 10.", time: "08:52" },
      ],
    },
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

function check(s: OfficeState): Check[] {
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const stock = s.files.find((f) => f.id === "seed-stock");
  const binned = (id: string) => (s.recycle ?? []).some((r) => r.file.id === id || r.inside.some((f) => f.id === id));

  /* The stock sheet */
  const restored = !!stock && sameGrid(stock.sheet, stockRight());
  add(
    { id: "restored", code: "SP-7", group: "The stock sheet", label: "Last night's version (09/11/2026 17:42) is the current one again" },
    restored,
    !stock
      ? binned("seed-stock")
        ? "The stock sheet is in the Recycle bin. Restore it from there first, then open its Version history."
        : "The stock sheet is missing. Start the job again."
      : sameGrid(stock.sheet, stockWrong())
        ? "It still has last month's numbers (counted 30/10/2026). Select Stock November.xlsx in File Explorer, press Version history, and Restore the version from 09/11/2026 17:42."
        : sameGrid(stock.sheet, stockFirst())
          ? "You restored the version from 02/11/2026, the start of the month. Sarah needs last night's: open Version history again and Restore the one from 09/11/2026 17:42."
          : "The sheet has numbers that match none of its versions, so it was changed by hand. Open Version history and Restore the version from 09/11/2026 17:42.",
  );
  const copies = s.files.filter((f) => f.id !== "seed-stock" && f.kind === "xlsx" && !f.seeded);
  add(
    { id: "kept", code: "SP-3", group: "The stock sheet", label: `It's still ${STOCK_NAME}, in Stock, and there's only one` },
    !!stock && samePath(stock.path, STOCK) && stock.name === STOCK_NAME && copies.length === 0,
    !stock
      ? "Restore the stock sheet first."
      : !samePath(stock.path, STOCK) || stock.name !== STOCK_NAME
        ? `The team looks for ${STOCK_NAME} in ${pathText(STOCK)}. Put it back with that name: Move to, or Rename.`
        : `There's a second copy: ${pathText(copies[0]?.path ?? [])} > ${copies[0]?.name}. Restoring a version puts it right in the one file, so delete the copy.`,
  );

  /* Your notes */
  const notes = s.files.find((f) => f.id === NOTES);
  const inOneDrive = !!notes && notes.path[0] === "OneDrive";
  const inDrafts = !!notes && notes.path[0] === "OneDrive" && notes.path[notes.path.length - 1] === "Drafts";
  add(
    { id: "notes", code: "SP-1", group: "Your notes", label: "Your stock count notes are in your OneDrive, in Drafts" },
    inDrafts,
    !notes
      ? binned(NOTES)
        ? "You deleted your notes, but they're yours to keep, just not on the team site. Open the Recycle bin, Restore them, then move them to OneDrive > Documents > Drafts."
        : "Your notes are gone. Start the job again."
      : inOneDrive
        ? `They're in your OneDrive, in ${pathText(notes.path)}. Your own drafts go in Documents > Drafts, with the others.`
        : `They're still in ${pathText(notes.path)}, on a team site. Notes just for you go in your OneDrive: select them, press Move to, and pick OneDrive > Documents > Drafts.`,
  );
  const mineOnSite = s.files.filter((f) => f.path[0] !== "OneDrive" && f.by === "You" && f.kind !== "folder" && f.id !== "seed-stock");
  add(
    { id: "site", code: "SP-1", group: "Your notes", label: "Nothing personal is left on the team site" },
    mineOnSite.length === 0,
    `"${mineOnSite[0]?.name}" is in ${pathText(mineOnSite[0]?.path ?? [])}. If it's just for you, move it to your OneDrive.`,
  );

  /* Telling Sarah */
  const replied = !!s.teamsNote?.messages.some((m) => m.from.address === YOU.address) || s.emails.some((e) => e.folder === "sent" && e.to.some((p) => p.address === PEOPLE.sarah.address));
  add({ id: "told", code: "OL-5", group: "Telling Sarah", label: "You told Sarah it's back" }, replied, "Close the loop: reply to Sarah in the Teams chat, in one line, like \"Done, last night's version is back.\"");
  return out;
}

export const versionBack: Job = {
  id: "m9j3",
  slug: "yesterdays-version",
  moduleId: "m9",
  moduleLabel: "Module 9: Files and sharing",
  title: "Get yesterday's version back",
  summary: "Sarah saved last month's numbers over the stock sheet. Bring back last night's version, and move your own notes off the team site.",
  clock: "08:53",
  deadline: "Tuesday 10 November",
  doneLine: "The stock sheet has last night's count again, and your notes are where only you see them.",
  brief: "Sarah has messaged you on Teams, and there's an email from Daniel. Read both and put things right. When you think it's done, press Check my work.",
  apps: ["teamsChat"],
  start: "teamsChat",
  hints: [
    "Read Sarah's Teams message, then Daniel's email in Outlook.",
    "In File Explorer, go to Operations Team > Documents > Stock and select Stock November.xlsx.",
    "Press Version history. Open each version to look at it: which one was saved last night, 09/11/2026 at 17:42?",
    "Press Restore beside that one. It becomes the current version, and nothing is lost.",
    "Your notes are in the same Stock folder. Select them, press Move to, and pick OneDrive > Documents > Drafts.",
    "Back in Teams, tell Sarah in one line that it's done.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["notes", "site"] },
    { label: "Name it so anyone can find it", checks: ["kept"] },
    { label: "One version, in one place", checks: ["kept"] },
    { label: "Close the loop", checks: ["told"] },
    { label: "Check your own work", checks: ["restored"] },
  ],
};
