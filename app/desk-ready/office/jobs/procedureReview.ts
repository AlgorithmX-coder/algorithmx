import { officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { pathText, type Check, type Job, type OfficeFile, type OfficeState, type WordBlock, type WordDoc } from "../types";
import { committed, docText } from "../word";
import { withLetterhead } from "./letterhead";

/* E8.3 Review the delivery procedure (criteria WD-6). Sarah has updated
 * the goods-in procedure with Track Changes on and asks the learner to
 * accept the changes that are right and reject the one she got wrong.
 * There are four: a new step (check the delivery note against the
 * purchase order), a deleted step (faxing), a change to when shortages go
 * to Accounts (the same day), and one mistake: "count every pallet" made
 * "count every second pallet", which would let shortages through. The
 * mistake is rejected, with a comment saying why, and the file saved where
 * it is, so the team keeps one copy. */

const DELIVERIES = ["Operations Team", "Documents", "Deliveries"] as const;
const FILE = "Goods-in procedure.docx";
const SARAH = "Sarah Patel";

const b = (id: string, style: WordBlock["style"], text: string, extra: Partial<WordBlock> = {}): WordBlock => ({ id, style, text, ...extra });

export function procedureDoc(): WordDoc {
  return {
    tracking: true,
    blocks: [
      b("gp-title", "title", "Goods-in procedure"),
      b("gp-meta", "normal", "Operations Team. Owner: Sarah Patel. Reviewed November 2026."),
      b("gp-h1", "h1", "When a delivery arrives"),
      b("gp-driver", "number", "Check the driver has a delivery note for Northfield Supplies."),
      b("gp-po", "number", "Check the delivery note number matches our purchase order.", { base: "", revBy: SARAH, revPara: "ins" }),
      b("gp-pallet", "number", "Count every second pallet against the delivery note.", { base: "Count every pallet against the delivery note.", revBy: SARAH }),
      b("gp-short", "number", "Write anything short or damaged on the delivery note, and sign it."),
      b("gp-fax", "number", "", { base: "Fax a copy of the delivery note to the office.", revBy: SARAH, revPara: "del" }),
      b("gp-h2", "h1", "After the delivery"),
      b("gp-report", "number", "Add the delivery to the morning delivery report in Excel."),
      b("gp-tell", "number", "Tell Accounts about any shortage on the same day, so they don't pay for what didn't come.", { base: "Tell Accounts about any shortage within 5 days, so they don't pay for what didn't come.", revBy: SARAH }),
      b("gp-ask", "normal", "Not sure? Ask Sarah Patel on 01632 960 412."),
    ],
    comments: [{ id: "gp-c1", blockId: "gp-po", by: SARAH, time: "Yesterday 16:05", text: "Daniel asked for this after last month's mix-up with Kent Flour Mills." }],
  };
}

/* Every paragraph as it should read once the review is done right. */
const RIGHT: Record<string, string | null> = {
  "gp-title": "Goods-in procedure",
  "gp-meta": "Operations Team. Owner: Sarah Patel. Reviewed November 2026.",
  "gp-h1": "When a delivery arrives",
  "gp-driver": "Check the driver has a delivery note for Northfield Supplies.",
  "gp-po": "Check the delivery note number matches our purchase order.",
  "gp-pallet": "Count every pallet against the delivery note.",
  "gp-short": "Write anything short or damaged on the delivery note, and sign it.",
  "gp-fax": null,
  "gp-h2": "After the delivery",
  "gp-report": "Add the delivery to the morning delivery report in Excel.",
  "gp-tell": "Tell Accounts about any shortage on the same day, so they don't pay for what didn't come.",
  "gp-ask": "Not sure? Ask Sarah Patel on 01632 960 412.",
};
const CHANGED = ["gp-po", "gp-pallet", "gp-fax", "gp-tell"];

function seed(): OfficeState {
  const files: OfficeFile[] = withLetterhead(officeFolders());
  files.push({ id: "seed-procedure", path: [...DELIVERIES], name: FILE, kind: "docx", modified: "Yesterday 16:12", by: SARAH, doc: procedureDoc(), seeded: true });
  files.push({ id: "seed-dn-template", path: [...DELIVERIES], name: "Delivery report template.xltx", kind: "xltx", modified: "14/01/2026", by: SARAH, sheet: [["Date", "Delivery note", "Supplier", "Item", "Expected", "Received", "Short by", "Checked by"]], seeded: true });
  return {
    version: 0,
    files,
    emails: [
      {
        id: "mail-sarah-procedure",
        folder: "inbox",
        from: PEOPLE.sarah,
        to: [{ name: "You", address: "you@northfieldsupplies.example" }],
        cc: [],
        subject: "Goods-in procedure: can you review it?",
        time: "10:05",
        unread: true,
        body: `Hi,\n\nI've updated the goods-in procedure with track changes on. Can you accept the bits that are right, and reject the one I got wrong?\n\nThe link's below. It's the copy everyone uses, so please save your changes in it.\n\nThanks!\nSarah\n\n${SIGNATURE.sarah}`,
        attachments: [],
        links: [{ name: FILE, path: [...DELIVERIES], fileName: FILE }],
      },
      {
        id: "mail-facilities-drill",
        folder: "inbox",
        from: PEOPLE.facilities,
        to: [{ name: "You", address: "you@northfieldsupplies.example" }],
        cc: [],
        subject: "Fire drill on Thursday at 11:00",
        time: "Mon 15:30",
        body: "Hello all,\n\nThe alarm will sound for about two minutes on Thursday at 11:00. Please leave by the nearest exit and meet in the car park.\n\nFacilities Team",
        attachments: [],
        links: [],
      },
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

function check(s: OfficeState): Check[] {
  const file = s.files.find((f) => f.id === "seed-procedure");
  const doc = file?.doc;
  const fresh = JSON.stringify(procedureDoc());
  const saved = !!doc && JSON.stringify(doc) !== fresh;
  const copies = s.files.filter((f) => f.id !== "seed-procedure" && f.kind === "docx" && !!f.doc && /goods-in procedure/i.test(docText(f.doc)));
  const block = (id: string) => doc?.blocks.find((x) => x.id === id);
  const open = (x?: WordBlock) => !!x && x.base !== undefined && x.revBy === SARAH;
  const pre = saved ? "" : "Your changes aren't saved in Sarah's file yet: press Save in Word. ";
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  /* Sarah's changes */
  const po = block("gp-po");
  add(
    { id: "po", code: "WD-6", group: "Sarah's changes", label: "Her new step, checking the purchase order, is accepted" },
    saved && !!po && !open(po) && /purchase order/i.test(committed(po)),
    open(po) || !saved ? `${pre}Sarah's new step 2 is still waiting. Click it and press Accept: checking the PO number is right.` : "You rejected Sarah's new step about the purchase order, but it was right. Start the job again, or type it back in as step 2.",
  );
  const fax = block("gp-fax");
  add(
    { id: "fax", code: "WD-6", group: "Sarah's changes", label: "Her deletion of the fax step is accepted" },
    saved && !fax,
    open(fax) || !saved ? `${pre}Sarah crossed out the fax step, and that's still waiting. Click it and press Accept: nobody faxes any more.` : "You kept the fax step. Sarah was right to take it out. Start the job again, or delete it.",
  );
  const tell = block("gp-tell");
  add(
    { id: "sameday", code: "WD-6", group: "Sarah's changes", label: "Shortages go to Accounts the same day: accepted" },
    saved && !!tell && !open(tell) && /same day/i.test(committed(tell)),
    open(tell) || !saved ? `${pre}The change to "on the same day" is still waiting. Click it and press Accept: telling Accounts sooner stops them paying for missing stock.` : 'You rejected "on the same day", but it was right. Start the job again, or change "within 5 days" to "on the same day".',
  );
  const pallet = block("gp-pallet");
  const palletText = pallet ? norm(committed(pallet)) : "";
  add(
    { id: "pallet", code: "WD-6", group: "Sarah's changes", label: '"Count every second pallet" is rejected: every pallet is counted' },
    saved && !!pallet && !open(pallet) && palletText === RIGHT["gp-pallet"],
    open(pallet) || !saved ? `${pre}"second" is still waiting. Click it and press Reject: counting every second pallet would miss a short delivery.` : `Step 3 now reads "${palletText.replace(/\.$/, "")}". Counting every second pallet would let shortages through. Use Undo (Ctrl+Z) until the change is back, or start the job again, then Reject it.`,
  );
  const why = (doc?.comments ?? []).find((c) => c.by === "You" && c.text.split(/\s+/).filter(Boolean).length >= 3 && (c.blockId === "gp-pallet" || /pallet|second|every|count/i.test(c.text)));
  const anyMine = (doc?.comments ?? []).some((c) => c.by === "You");
  add(
    { id: "why", code: "WD-6", group: "Sarah's changes", label: "A comment on the pallet step says why you rejected it" },
    saved && !!why,
    !saved && anyMine ? pre : anyMine ? "Your comment isn't on the pallet step, or doesn't say why. Click in step 3, press New Comment, and say why in a sentence." : `${pre}Click in step 3, press New Comment on the Review tab, and say why you rejected it, like "We must count every pallet, or we'll miss a short delivery."`,
  );
  /* anything else changed must show as a change, for Sarah to see */
  const quiet = (doc?.blocks ?? []).filter((x) => {
    if (CHANGED.includes(x.id)) return false;
    if (x.id in RIGHT) return norm(committed(x)) !== RIGHT[x.id];
    return !!x.text.trim() && !(x.revBy === "You" && x.base !== undefined);
  });
  const missing = Object.keys(RIGHT).filter((id) => !CHANGED.includes(id) && !doc?.blocks.some((x) => x.id === id));
  add(
    { id: "tracked", code: "WD-6", group: "Sarah's changes", label: "Anything else you changed shows as a tracked change" },
    saved && quiet.length === 0 && missing.length === 0,
    !saved ? pre : `"${norm(quiet[0]?.text ?? RIGHT[missing[0]] ?? "").slice(0, 60)}" was changed with Track Changes off, so Sarah can't see it. Undo it, or turn Track Changes on (Review tab) and make the change again.`,
  );

  /* Saving it */
  add(
    { id: "saved", code: "SP-3", group: "Saving it", label: `Saved in Sarah's file, ${pathText(DELIVERIES)} > ${FILE}, with no copies` },
    saved && copies.length === 0,
    !saved ? "Your changes aren't in Sarah's file yet. In Word, press Save (the disk at the top left), so everyone's copy has them." : copies[0] ? `There's a copy at ${pathText(copies[0].path)} > ${copies[0].name}. The team works on the one in Deliveries: delete the copy.` : undefined,
  );
  const told = s.emails.some((e) => e.folder === "sent" && [...e.to, ...e.cc].some((p) => p.address === PEOPLE.sarah.address));
  add({ id: "loop", code: "OL-5", group: "Saving it", label: "Sarah knows it's done" }, told, "Close the loop: reply to Sarah in one line, saying it's done and which change you rejected.");
  return out;
}

export const procedureReview: Job = {
  id: "m8j3",
  slug: "review-the-procedure",
  moduleId: "m8",
  moduleLabel: "Module 8: Documents",
  title: "Review the delivery procedure",
  summary: "Sarah has changed the goods-in procedure with Track Changes on. Accept what's right, reject what's wrong, and say why.",
  clock: "10:20",
  deadline: "Wednesday 11 November",
  doneLine: "The procedure is right, Sarah knows why you changed what you did, and there's still only one copy.",
  brief: "There's an email from Sarah. Read it and do what she asks, the way she asks. When you think it's done, press Check my work.",
  apps: ["word"],
  hints: [
    "Open Sarah's email and click the link to the procedure. It opens in Word.",
    "Go to the Review tab. Press Next to go to each of Sarah's changes in turn.",
    "Ask of each one: is this right for the warehouse? Accept it if it is, Reject it if it isn't.",
    "Click in the step you rejected, press New Comment, and say why in a sentence.",
    "Press Save, then reply to Sarah to say it's done.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["saved"] },
    { label: "Name it so anyone can find it", checks: ["saved"] },
    { label: "One version, in one place", checks: ["saved"] },
    { label: "Close the loop", checks: ["loop"] },
    { label: "Check your own work", checks: ["why", "tracked"] },
  ],
};
