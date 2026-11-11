"use client";

import { ComposeFigure } from "../learn/figures/email";
import { FILLED_WHAT, FormFigure, OAK_LETTER, ReviewFigure, SavePdfFigure, SpellingFigure, TemplateFigure, WordFigure } from "../learn/figures/word";
import type { LabProps, ModuleManifest } from "../learn/types";
import { WordLab } from "../learn/wordLab";
import { FOOTER, HEADER, letterheadDoc } from "../office/jobs/letterhead";
import { samePath, type OfficeFile, type WordBlock, type WordDoc } from "../office/types";
import { docText, emptyRequired, fieldValue, issues, para, placeholdersIn, sameDay } from "../office/word";

/* Module 8: Documents (criteria WD-1 to WD-6). Headings, bullets and
 * tables; starting from a template; the spelling check and tracked
 * changes; saving as a PDF; and filling in a form. Every practice runs in
 * the office's own Word (WordLab), and three office jobs follow on the
 * module page: a letter on the letterhead, a holiday form, and a review of
 * the goods-in procedure.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. */

const file = (id: string, path: string[], name: string, doc: WordDoc, kind: OfficeFile["kind"] = "docx", by = "You"): OfficeFile => ({ id, path, name, kind, modified: "Today 08:40", by, doc, seeded: true });
const folder = (path: string[], name: string): OfficeFile => ({ id: `lab-dir-${[...path, name].join("/")}`, path, name, kind: "folder", modified: "02/11/2026", by: "Emma Clarke", seeded: true });
const text = (d: WordDoc | null) => (d ? docText(d) : "");
const block = (d: WordDoc | null, has: string) => d?.blocks.find((b) => b.text.toLowerCase().includes(has.toLowerCase()));
const ORDERS = ["Operations Team", "Documents", "Orders", "2026"];
const COMPLETED = ["HR", "Forms", "Completed"];
const SIGNATURE = ["Jordan Miles", "Office Administrator | Northfield Supplies", "01632 960 431"];

/* ---------- Lesson 1: headings, bullets and tables ---------- */

function LayoutLab(p: LabProps) {
  const report: WordDoc = {
    blocks: [
      para("Deliveries this week", "normal", { bold: true, size: 16 }),
      para("A short report for Daniel, from the goods-in desk."),
      para("What came in"),
      para("Harlow Packaging: 12 pallets of wrap"),
      para("Kent Flour Mills: 40 sacks of flour"),
      para("Brightwater Cups: 30 cases of cups"),
      para("What went wrong"),
      para("Harlow were 2 pallets short. Sarah has told Accounts."),
      para(""),
    ],
  };
  return (
    <WordLab
      {...p}
      tasks={[
        {
          scenario:
            "This report is all plain text, and its title is just Normal text made bold and bigger. Click in each line, then use Styles and the Paragraph buttons on the Home tab:\n\n1. Make \"Deliveries this week\" the Title.\n2. Make \"What came in\" and \"What went wrong\" Heading 1.\n3. Make the three supplier lines bullets.\n4. Click in the empty line at the end. On the Insert tab, press Table and pick 3 columns and 2 rows. Type Supplier, Ordered and Delivered in its top row (Tab moves to the next box).",
          files: [file("lab-report", ["OneDrive", "Documents"], "Deliveries this week.docx", report)],
          open: "lab-report",
          rules: [
            { label: "\"Deliveries this week\" is the Title, not bold and bigger Normal text", test: (d) => { const b = block(d, "Deliveries this week"); return !!b && b.style === "title" && !b.bold && !b.size; }, hint: "Click in the top line, then click Title in the Styles box. Picking a style clears the bold and the size." },
            { label: "\"What came in\" and \"What went wrong\" are Heading 1", test: (d) => block(d, "What came in")?.style === "h1" && block(d, "What went wrong")?.style === "h1", hint: "Click in each one, then click Heading 1 in Styles." },
            { label: "The three supplier lines are bullets", test: (d) => ["Harlow Packaging: 12", "Kent Flour Mills", "Brightwater Cups"].every((s) => block(d, s)?.style === "bullet"), hint: "Click in each supplier line and press Bullets in the Paragraph group. Or press it on the first, then Enter carries it on." },
            { label: "A table with Supplier, Ordered and Delivered across the top", test: (d) => !!d?.blocks.some((b) => b.table && b.table[0].length >= 3 && /supplier/i.test(b.table[0][0]) && /ordered/i.test(b.table[0][1]) && /delivered/i.test(b.table[0][2])), hint: "Insert > Table, 3 columns by 2 rows. Click in the top-left box, type Supplier, press Tab, type Ordered, Tab, Delivered." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 2: using a template ---------- */

function TemplateLab(p: LabProps) {
  return (
    <WordLab
      {...p}
      tasks={[
        {
          scenario:
            "Daniel asks: \"Can you write to Kent Bakery on letterhead to confirm their last delivery before Christmas is Tuesday 22 December? Our reference is NS/4410.\"\n\nThe contact is Mr Imran Ahmed, Kent Bakery, 9 Mill Road, Leicester LE2 7QT. Today is 11 November 2026. In Word, open the Letterhead template, then click each placeholder and type over it.",
          files: [file("lab-letterhead", ["HR", "Templates"], "Letterhead.dotx", letterheadDoc(), "dotx", "Emma Clarke")],
          rules: [
            { label: "Started from the Letterhead template", test: (d) => d?.template === "Letterhead.dotx", hint: "On Word's start screen, click Letterhead under New. It opens as a new document with the letterhead at the top." },
            { label: "Today's date, 11 November 2026, and the reference NS/4410", test: (d) => /\b11(th)? November 2026\b|\b11\/11\/2026\b/i.test(text(d)) && /NS\/4410/i.test(text(d)), hint: "Click [Date] and type 11 November 2026. Click [Reference] and type NS/4410." },
            { label: "To Mr Imran Ahmed, Kent Bakery, 9 Mill Road, Leicester LE2 7QT", test: (d) => /Imran Ahmed/i.test(text(d)) && /Kent Bakery/i.test(text(d)) && /9 Mill Road/i.test(text(d)) && /LE2 7QT/i.test(text(d)), hint: "Type over the four address placeholders, one line each." },
            { label: "It says their last delivery is Tuesday 22 December", test: (d) => /22(nd)? December/i.test(text(d)), hint: "Click [Write your letter here.] and say it in one or two sentences." },
            { label: "No [placeholders] left anywhere", test: (d) => !!d && placeholdersIn(d).length === 0, hint: "Read down the page for anything grey in square brackets, including [Name] after Dear and [Your name] at the bottom." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 3: spelling checks and tracked changes ---------- */

const NOTICE: WordDoc = {
  blocks: [
    para("Fire drill on Thursday", "title"),
    para("The alarm will sound on Thursday at 11:00. Please leave by the nearest exit and meet in the car park."),
    para("If you recieve a phone call during the drill, let it go to voicemail. Remeber to sign out at reception as you leave."),
    para("The drill takes about 15 minutes. There is a extra fire marshal on the first floor this time."),
    para("Questions? Ask Sarah Patal in the warehouse."),
  ],
};

const by = "Daniel Okafor";
const CHECKLIST: WordDoc = {
  tracking: true,
  blocks: [
    { id: "cu-title", style: "title", text: "Closing up the warehouse" },
    { id: "cu-lights", style: "number", text: "Switch off the lights in the loading bay." },
    { id: "cu-charger", style: "number", text: "Turn off the forklift charger.", base: "", revBy: by, revPara: "ins" },
    { id: "cu-gate", style: "number", text: "Lock the front gate at 08:00.", base: "Lock the front gate at 18:00.", revBy: by },
    { id: "cu-keys", style: "number", text: "", base: "Leave the keys under the mat.", revBy: by, revPara: "del" },
    { id: "cu-alarm", style: "normal", text: "Last one out sets the alarm." },
  ],
};
const pending = (b?: WordBlock) => !!b && b.base !== undefined && b.revBy === by;

function CheckLab(p: LabProps) {
  return (
    <WordLab
      {...p}
      tasks={[
        {
          scenario:
            "Facilities wrote this notice for the staff board and asked you to check it. On the Review tab, press Spelling & Grammar and put right what it finds.\n\nThen read it back yourself: the person to ask is Sarah Patel, the Warehouse Supervisor.",
          files: [file("lab-notice", ["OneDrive", "Documents"], "Fire drill notice.docx", NOTICE)],
          open: "lab-notice",
          rules: [
            { label: "No spelling or grammar mistakes left", test: (d) => !!d && issues(d, { all: true }).length === 0, hint: "Review > Spelling & Grammar. Pick the right suggestion and press Change for each one. Ignore is only for words that are really right." },
            { label: "Sarah's surname is spelled Patel", test: (d) => /Sarah Patel/.test(text(d)) && !/Patal/i.test(text(d)), hint: "The spelling check can't know names. Click after the a in Patal, fix it to Patel." },
          ],
        },
        {
          scenario:
            "Daniel updated the closing-up checklist with Track Changes on. One of his changes is a slip: the warehouse opens at 08:00 and closes at 18:00.\n\nOn the Review tab, press Next to go to each change. Accept the right ones, Reject the slip, then click in that line, press New Comment and say why.",
          files: [file("lab-checklist", ["Operations Team", "Documents"], "Closing up.docx", CHECKLIST, "docx", by)],
          open: "lab-checklist",
          rules: [
            { label: "The new forklift charger step is accepted", test: (d) => { const b = d?.blocks.find((x) => x.id === "cu-charger"); return !!b && !pending(b); }, hint: "Go to the underlined step 2 and press Accept: switching off the charger is right." },
            { label: "The keys step is gone (its deletion accepted)", test: (d) => !!d && !d.blocks.some((x) => x.id === "cu-keys"), hint: "Go to the crossed-out step and press Accept: keys under the mat is a risk." },
            { label: "The gate time change is rejected: it still says 18:00", test: (d) => { const b = d?.blocks.find((x) => x.id === "cu-gate"); return !!b && !pending(b) && /18:00/.test(b.text); }, hint: "Go to 08:00 and press Reject. The gate is locked when the warehouse closes, at 18:00." },
            { label: "A comment says why you rejected it", test: (d) => !!d?.comments?.some((c) => c.by === "You" && c.text.split(/\s+/).length >= 3), hint: "Click in the gate step, press New Comment, and write a sentence, like \"We close at 18:00, so the gate locks then.\" Then press Post." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: saving as a PDF ---------- */

function kentLetter(): WordDoc {
  return {
    header: HEADER,
    footer: FOOTER,
    template: "Letterhead.dotx",
    blocks: [
      para("11 November 2026"),
      para("Our reference: NS/4410"),
      para(""),
      para("Mr Imran Ahmed"),
      para("Kent Bakery"),
      para("9 Mill Road"),
      para("Leicester LE2 7QT"),
      para(""),
      para("Dear Mr Ahmed,"),
      para("Christmas deliveries", "h2"),
      para("Thank you for your order. Your last delivery before Christmas will be on Tuesday 22 December, before 10am. Deliveries start again on Monday 4 January."),
      para(""),
      para("Yours sincerely,"),
      para(""),
      para(""),
      para("Jordan Miles"),
      para("Office Administrator"),
    ],
  };
}

function PdfLab(p: LabProps) {
  const isMine = (f: OfficeFile) => f.kind === "pdf" && !f.seeded && /Kent Bakery/i.test(f.doc ? docText(f.doc) : "");
  return (
    <WordLab
      {...p}
      tasks={[
        {
          scenario:
            "The letter to Kent Bakery is finished. Make a PDF of it in Operations Team > Documents > Orders > 2026, named the house way for today, 11 November 2026: the date, then Letter to Kent Bakery.\n\nUse File > Export > Create PDF, or File > Save As and pick PDF.",
          files: [
            file("lab-kent", ["OneDrive", "Documents"], "Letter to Kent Bakery.docx", kentLetter()),
            file("lab-bright", ORDERS, "2026-10-28 Letter to Bright Cafe.pdf", { ...kentLetter(), blocks: [para("28 October 2026"), para("Bright Cafe")] }, "pdf", "Daniel Okafor"),
          ],
          open: "lab-kent",
          rules: [
            { label: "There's a PDF of the letter", test: (_, s) => s.files.some(isMine), hint: "File > Export > Create PDF. Or File > Save As, and pick PDF (*.pdf) in Save as type." },
            { label: "It's in Operations Team > Documents > Orders > 2026", test: (_, s) => s.files.some((f) => isMine(f) && samePath(f.path, ORDERS)), hint: "In the Save box, click Operations Team, then double-click Documents, Orders and 2026." },
            { label: "It's named 2026-11-11 Letter to Kent Bakery.pdf", test: (_, s) => s.files.some((f) => isMine(f) && f.name === "2026-11-11 Letter to Kent Bakery.pdf"), hint: "Year, month, day, then what it is: 2026-11-11 Letter to Kent Bakery. Word adds .pdf for you." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 5: filling in and uploading a form ---------- */

const f = (key: string, label: string, kind: NonNullable<WordBlock["field"]>["kind"], required = true, options?: string[]): WordBlock => ({ id: `cd-${key}`, style: "normal", text: "", field: { key, label, kind, required, options } });
const CHANGE_FORM: WordDoc = {
  header: HEADER,
  footer: FOOTER,
  blocks: [
    para("Change of details", "title"),
    para("Tell HR when your address or phone number changes. Fill in every box marked with a star (*)."),
    f("name", "Your name", "text"),
    f("team", "Team", "choice", true, ["Office", "Warehouse", "Accounts", "HR"]),
    f("address", "New address", "text"),
    f("postcode", "Postcode", "text"),
    f("from", "Moving date", "date"),
    f("phone", "New phone number", "text", false),
    f("confirm", "These details are correct", "check"),
  ],
};

function FormLab(p: LabProps) {
  const mine = (s: { files: OfficeFile[] }) => s.files.filter((x) => x.kind === "docx" && !x.seeded && x.doc?.blocks.some((b) => b.field?.key === "address"));
  return (
    <WordLab
      {...p}
      tasks={[
        {
          scenario:
            "You've moved house, to 27 Bramble Way, Leicester LE3 9PN, on Monday 30 November 2026. Your team is Office. Today is 12 November 2026.\n\nFill in every starred box on HR's change of details form. Then File > Save As: put it in HR > Forms > Completed, named the date, Change of details, then your name, like 2026-11-12 Change of details Jordan Miles.",
          files: [folder(["HR", "Forms"], "Blank"), folder(["HR", "Forms"], "Completed"), file("lab-change", ["HR", "Forms", "Blank"], "Change of details.dotx", CHANGE_FORM, "dotx", "Emma Clarke")],
          open: "lab-change",
          rules: [
            { label: "Every starred box is filled in", test: (d) => !!d && emptyRequired(d).length === 0, hint: "Look for grey \"Click or tap here\" boxes beside a star, and the tick box at the end." },
            { label: "Address 27 Bramble Way, postcode LE3 9PN", test: (d) => !!d && /27 Bramble Way/i.test(fieldValue(d, "address")) && fieldValue(d, "postcode").replace(/\s/g, "").toUpperCase() === "LE39PN", hint: "Put the street in New address and LE3 9PN in Postcode." },
            { label: "Moving date: 30 November 2026", test: (d) => !!d && sameDay(fieldValue(d, "from"), 30, 11, 2026), hint: "Type 30/11/2026, or click the ▼ and pick the 30th of November." },
            { label: "Saved in HR > Forms > Completed", test: (_, s) => mine(s).some((x) => samePath(x.path, COMPLETED)), hint: "File > Save As. Click HR, then double-click Forms, then Completed." },
            { label: "Named the date, Change of details, then your name", test: (_, s) => mine(s).some((x) => samePath(x.path, COMPLETED) && x.doc && fieldValue(x.doc, "name").length > 1 && x.name.toLowerCase() === `2026-11-12 change of details ${fieldValue(x.doc, "name")}.docx`.toLowerCase()), hint: "Use the name you typed on the form: 2026-11-12 Change of details Jordan Miles, with your own name." },
          ],
        },
      ]}
    />
  );
}

const m8: ModuleManifest = {
  id: "m8",
  number: 8,
  title: "Documents",
  intro: "Word is where letters, reports and forms are made. In five short lessons you'll give a document real headings, start a letter from the company template, check it, save it as a PDF, and fill in a form. Then you'll do it all for real in the pretend office.",
  outcomes: [
    "Give a document real headings, a list and a table",
    "Start a letter from the company template and fill in every gap",
    "Check spelling and grammar, and deal with someone's tracked changes",
    "Save a PDF in the right place, named the house way",
    "Fill in a form and put it where HR will find it",
  ],
  topics: [
    {
      id: "m8t1",
      title: "Headings, bullets and tables",
      minutes: 9,
      brief: "Word is where letters, reports and forms are made. In this lesson you'll see the whole Word window, then give a short report proper headings, a list and a table, so it reads at a glance.",
      learn: [
        {
          heading: "Here is a whole Word document",
          body: [
            "This is Word, with a short report in it. The numbers on the picture match the list underneath it.",
            "Across the top: the file's name (1), the ribbon's tabs (2), and the buttons on the Home tab (3 to 5). Then the page, with a title, headings, a list and a table (6 to 10). At the bottom: the page and word count (11) and the zoom (12).",
          ],
          figure: <WordFigure />,
        },
        {
          heading: "Styles give a line its job",
          body: [
            "The Styles box (5) holds ready-made looks, each with a job. Title (6) names the whole document. Heading 1 (7) starts a section. Heading 2 (8) starts a part inside one.",
            "To use one, click anywhere in the line, then click the style. The whole line changes.",
          ],
          figure: <WordFigure focus={["styles", "title", "heading", "heading2"]} title="Styles, and the lines that use them" />,
          tip: "Normal is the style for ordinary sentences. Most of any document is Normal.",
        },
        {
          heading: "Never fake a heading with bold",
          body: [
            "It's tempting to make a heading by pressing Bold and picking a bigger size (3). It looks right, but to Word it's just an ordinary line (7).",
            "A real heading keeps every heading the same, lets a reader jump between sections, and lets someone using a screen reader find their way. Click in the line and pick Heading 1 instead.",
          ],
          figure: <WordFigure fake focus={["font", "heading"]} title="A fake heading" rename={{ heading: "A fake heading" }} what={{ font: "Bold is on and the size is 16: that's how this fake heading was made.", heading: "It looks like a heading, but it's Normal text. Word, and anyone using a screen reader, sees an ordinary line." }} />,
          bad: [{ text: "Normal text, Bold, size 16", note: "Looks like a heading. Isn't one." }],
          good: [{ text: "Click in the line, then Heading 1", note: "A real heading, matching every other." }],
        },
        {
          heading: "Lists: bullets and numbers",
          body: [
            "Three or more short points read better as a list (9). Click in a line and press Bullets (4). Press Enter at the end of a bullet and the next line gets one too.",
            "Use Numbering when the order matters, like the steps of a procedure. Press Enter on an empty bullet to end the list.",
          ],
          figure: <WordFigure focus={["paragraph", "bullets"]} title="Bullets" />,
        },
        {
          heading: "A simple table",
          body: [
            "A table (10) lines up facts in rows and columns: a supplier, what was ordered, what came.",
            "On the Insert tab (2), press Table and pick the size from the grid. Type in a box, and press Tab to move to the next one. Tab in the very last box adds a new row.",
          ],
          figure: <WordFigure focus={["tabs", "table"]} title="A table" what={{ tabs: "The Insert tab holds Table: move over its grid to pick the number of columns and rows, then click." }} />,
          tip: "Put headings in the top row, like Supplier and Ordered, so every column says what it holds.",
        },
        {
          heading: "The bottom of the window",
          body: ["The status bar shows which page you're on and how many words there are (11).", "Zoom (12) makes the page look bigger or smaller on your screen only. Nothing in the document changes."],
          figure: <WordFigure focus={["status", "zoom"]} title="The status bar" />,
        },
      ],
      tryIt: { title: "Lay out a report", intro: "This report is all plain text. Give it a title, headings, a list and a table.", Lab: LayoutLab },
      check: [
        {
          q: "You want a section heading. What do you do?",
          options: ["Click in the line and pick Heading 1", "Make the line bold and size 16", "Type the line in capital letters"],
          answer: 0,
          reasons: ["The Heading style makes it a real heading, matching every other.", "That only looks like a heading. Word sees ordinary text.", "Capitals are harder to read, and still not a heading."],
        },
        {
          q: "When do you use Numbering instead of Bullets?",
          options: ["When the order of the points matters", "When the list has more than five points", "When the list sits inside a table"],
          answer: 0,
          reasons: ["Steps that must be done in order get numbers.", "A long list can still be bullets. It's about order, not length.", "Tables and lists are separate things."],
        },
        {
          q: "You press Tab in the last box of a table. What happens?",
          options: ["A new row is added", "The page moves down", "The table is deleted"],
          answer: 0,
          reasons: ["Tab in the last box adds a row, ready to type in.", "Tab moves between boxes, not pages.", "Nothing is deleted. Tab only moves or adds."],
        },
      ],
      takeaways: ["Headings come from Styles, never from Bold.", "Short points read best as a list.", "Facts that line up go in a table, with headings in its top row."],
    },
    {
      id: "m8t2",
      title: "Using a template",
      minutes: 8,
      brief: "Offices write the same kinds of letter again and again, so they keep a template. In this lesson you'll start a letter from the company letterhead and fill in every gap.",
      learn: [
        {
          heading: "Here is a whole letter template",
          body: [
            "This is Northfield's letterhead template, open in Word. Everything that stays the same is already there: the logo and address (2), the layout, the sign-off (9).",
            "Everything that changes is a grey placeholder in square brackets, like [Date] (3). Your job is to replace every one.",
          ],
          figure: <TemplateFigure />,
        },
        {
          heading: "Opening a template makes a new copy",
          body: [
            "Templates end in .dotx, and live where everyone can find them. Northfield's letterhead is in HR > Templates > Letterhead.dotx.",
            "Double-click it and Word opens a new document called Document1 (1), with the letterhead (2) in place. The template never changes, so it's ready for the next letter.",
          ],
          figure: <TemplateFigure focus={["newdoc", "letterhead"]} title="A new document from the template" />,
          tip: "Never type a new letter over an old one. Start from the template every time, so nothing from the last letter sneaks in.",
        },
        {
          heading: "Click a placeholder, then type",
          body: [
            "Click a placeholder once and all of it is selected, brackets too. Start typing and your words replace it.",
            "Write the date in full, like 10 November 2026 (3), and the reference you were given (4). Copy the name and address (5) from their email or the order, one line each.",
          ],
          figure: <TemplateFigure focus={["date", "reference", "recipient"]} title="The date, the reference, who it's to" values={{ date: OAK_LETTER.date, reference: OAK_LETTER.reference, r1: OAK_LETTER.r1, r2: OAK_LETTER.r2 }} what={{ date: "Today's date, written in full, typed over [Date].", recipient: "Half done: two lines typed in, two placeholders still to go." }} />,
        },
        {
          heading: "The greeting and the subject",
          body: [
            "Greet them by name: \"Dear Ms Fenwick,\" (6). If you don't know their name, \"Dear Sir or Madam,\".",
            "The subject line (7) is already set in the Heading 2 style. Type over it and it stays a real heading.",
          ],
          figure: <TemplateFigure focus={["greeting", "subject"]} title="The greeting and the subject" values={{ ...OAK_LETTER, body: "[Write your letter here.]", you: "[Your name]" }} what={{ greeting: FILLED_WHAT.greeting, subject: FILLED_WHAT.subject }} />,
          good: [{ text: "Dear Ms Fenwick,", note: "Her name, as she signs it." }, { text: "Refund for order 4405", note: "Says what it's about, with the number she'll look up." }],
        },
        {
          heading: "Your letter, and the sign-off",
          body: [
            "The letter itself (8): what happened, what you're doing about it, and by when. Short and plain.",
            "\"Dear\" and a name goes with \"Yours sincerely,\" (9). Type your own name over [Your name].",
          ],
          figure: <TemplateFigure focus={["body", "signoff"]} title="The letter and the sign-off" values={OAK_LETTER} what={{ body: FILLED_WHAT.body, signoff: FILLED_WHAT.signoff }} />,
        },
        {
          heading: "Check that none are left",
          body: ["Before you save it, read down the page for anything grey or in square brackets. A letter that goes out saying [Date] looks careless.", "Here, every placeholder has been replaced, and the letterhead is just as it was."],
          figure: <TemplateFigure title="Every placeholder replaced" values={OAK_LETTER} what={FILLED_WHAT} />,
          tip: "Read it from the top, line by line. A missed placeholder is the most common slip with templates.",
        },
      ],
      tryIt: { title: "Fill in the letterhead", intro: "Kent Bakery want their Christmas delivery date in writing. Start from the letterhead and fill in every placeholder.", Lab: TemplateLab },
      check: [
        {
          q: "Where do you start a letter on the company letterhead?",
          options: ["From the template in HR > Templates", "From last week's letter, typed over", "From a blank page, adding the logo"],
          answer: 0,
          reasons: ["The template has the letterhead and layout, with nothing left from another letter.", "Old names, dates and amounts can sneak through. Start from the template.", "The template already has the logo, in the right place."],
        },
        {
          q: "You click [Date] once. What happens?",
          options: ["All of it is selected, ready to type over", "A calendar opens for you to pick from", "The brackets go and the word stays"],
          answer: 0,
          reasons: ["Type and your words replace the whole placeholder.", "That's a form's date box. A placeholder is just text to replace.", "The whole placeholder goes when you type, word and brackets."],
        },
        {
          q: "What does opening a template do to the template?",
          options: ["Nothing: you get a new copy to fill in", "It opens it for your changes to save into", "It locks it so nobody else can use it"],
          answer: 0,
          reasons: ["You get Document1. The template stays ready for next time.", "Your changes go into the new copy, never the template.", "Anyone can still open it. Each person gets their own copy."],
        },
      ],
      takeaways: ["Start from the template, never from an old letter.", "Click a placeholder once, then type.", "Read it down for anything grey or in brackets before it goes."],
    },
    {
      id: "m8t3",
      title: "Spelling checks and tracked changes",
      minutes: 10,
      brief: "Before a document goes anywhere, it gets checked: by you, with Word's help, or by a colleague, with Track Changes. In this lesson you'll do both.",
      learn: [
        {
          heading: "Here is a document being checked",
          body: [
            "This is a procedure, with the Review tab (1) open. Word has marked a spelling mistake (6) and a grammar slip (7).",
            "Sarah has edited it with Track Changes on (3): words she added (8), words she took out (9), a bar beside each changed line (10), and a comment (11). The next cards take each in turn.",
          ],
          figure: <ReviewFigure />,
        },
        {
          heading: "Red for spelling, blue for grammar",
          body: ["A red wavy line (6) means Word doesn't know the word. A blue double line (7) means the grammar looks wrong.", "Right-click a marked word to see what Word suggests. Or check the whole document at once, as the next card shows."],
          figure: <ReviewFigure focus={["red", "blue"]} title="Spelling and grammar marks" />,
        },
        {
          heading: "Check the whole document",
          body: [
            "Review > Spelling & Grammar opens this pane. It shows one mistake at a time: what kind it is (1), the sentence it's in (2), and what Word suggests (3).",
            "Click the right suggestion and press Change (4). Press Ignore (5) only for a word that's really right, like a product code. When none are left (6), it's done.",
          ],
          figure: <SpellingFigure />,
        },
        {
          heading: "It can't check names",
          body: [
            "Word knows words, not people. Fenwik (7) has no red line, but her name is Fenwick. A spelling check won't catch a wrong name, number or date.",
            "So read it back. Check every name, number and date against where you got it: their email, the order, the delivery note.",
          ],
          figure: <SpellingFigure focus={["name"]} title="What a spelling check misses" />,
          tip: "Read it aloud, slowly. Your ear catches what your eye skips.",
        },
        {
          heading: "Track Changes: edits everyone can see",
          body: [
            "With Track Changes on (3), edits show up: added words are underlined (8) and removed words crossed through (9), in the colour of the person who made them. A bar (10) marks each changed line.",
            "Teams use it so the person who owns a document can see exactly what changed, and decide.",
          ],
          figure: <ReviewFigure focus={["track", "ins", "del", "bar"]} title="Tracked changes" />,
        },
        {
          heading: "Accept, reject, and say why",
          body: [
            "Press Next to go to each change. Accept (4) keeps it; Reject undoes it. Word moves on to the next one by itself.",
            "If you reject a change, say why. Click in the line, press New Comment (5) and type a sentence. It shows in the margin (11) with your name.",
          ],
          figure: <ReviewFigure focus={["accept", "comment", "balloon"]} title="Dealing with the changes" />,
          good: [{ text: "\"We must count every pallet, or we'll miss a short delivery.\"", note: "Says what's wrong, and why." }],
          bad: [{ text: "\"Wrong.\"", note: "Sarah can't tell what you mean." }],
        },
      ],
      tryIt: { title: "Check two documents", intro: "First, put a notice right with the spelling check and your own eyes. Then deal with Daniel's tracked changes.", Lab: CheckLab },
      check: [
        {
          q: "The spelling check finds nothing. Is the letter ready to send?",
          options: ["Not yet: read the names, numbers and dates", "Yes: Word has checked every word in it", "Yes: there are no red or blue lines left"],
          answer: 0,
          reasons: ["The check can't know a name or a wrong number. Read those back.", "Word checks spelling, not whether a name or amount is right.", "No lines means no spelling slips Word knows of, not that it's right."],
        },
        {
          q: "When should you press Ignore?",
          options: ["When the word is really right, like a code", "When there are too many mistakes to fix", "When you aren't sure how to spell it"],
          answer: 0,
          reasons: ["A product code or a place name can be right and still marked.", "Every one needs fixing. Ignore leaves the mistake in.", "If you aren't sure, pick a suggestion or look it up."],
        },
        {
          q: "You reject a colleague's change. What else do you do?",
          options: ["Add a comment saying why", "Turn Track Changes off", "Email them a copy of it"],
          answer: 0,
          reasons: ["A comment tells them why, right beside the line.", "They need to see your edits. Leave it on.", "They can see it in the shared file. No copies."],
        },
      ],
      takeaways: ["Red wavy is spelling, blue double is grammar.", "A spelling check doesn't know names: read them back.", "Reject with a reason, in a comment."],
    },
    {
      id: "m8t4",
      title: "Saving as a PDF",
      minutes: 8,
      brief: "A PDF is a document frozen just as you made it: it looks the same on any computer and can't be changed by mistake. In this lesson you'll make one, name it properly, and send it the right way.",
      learn: [
        {
          heading: "Here is the Save as PDF box",
          body: [
            "This box makes a PDF of the document open in Word. Pick a place (1 and 2), look at what's there already (3), name it (4), and make sure Save as type says PDF (5).",
            "Get to it with File > Export > Create PDF, or File > Save As and pick PDF in Save as type. Both open this box.",
          ],
          figure: <SavePdfFigure />,
        },
        {
          heading: "Why a PDF?",
          body: [
            "A Word document (.docx) can be changed by whoever opens it, and can look different on another computer. A PDF (.pdf) looks exactly as you made it, letterhead and all, on any computer or phone.",
            "So letters, quotes and anything sent outside the company go as a PDF (5). Work in progress stays a Word document.",
          ],
          figure: <SavePdfFigure focus={["type"]} title="Save as type" />,
          good: [{ text: ".pdf: a letter to a customer", note: "Looks the same everywhere, and can't be changed by mistake." }],
          bad: [{ text: ".docx: a letter to a customer", note: "They could change it, and it may not look right on their computer." }],
        },
        {
          heading: "Put it where the brief says",
          body: ["Daniel asked for Orders > 2026, so that's where it goes (2): click the site in Places (1), then double-click down through the folders.", "Look at what's already there (3). The other letters show you how they're named."],
          figure: <SavePdfFigure focus={["places", "path", "files"]} title="Choosing the folder" />,
        },
        {
          heading: "Name it by the house rule",
          body: ["The house rule is the date, year first, then a short description (4): 2026-11-10 Letter to Oak Street Deli.", "Year first means files sort into date order by themselves. No \"final\", no \"v2\", no initials. Word adds .pdf."],
          figure: <SavePdfFigure focus={["name"]} title="The file name" />,
          good: [{ text: "2026-11-10 Letter to Oak Street Deli.pdf" }],
          bad: [{ text: "letter FINAL v2.pdf", note: "Which letter? When? Is there a v3?" }, { text: "Document1.pdf", note: "Nobody will ever find it." }],
        },
        {
          heading: "Open it before it goes",
          body: ["Leave Open file after publishing ticked (6). Press Save (7) and the PDF opens. Read it through once more: this is exactly what they'll see.", "Your Word document stays as it was, so you can still change it and make the PDF again."],
          figure: <SavePdfFigure focus={["open", "save"]} title="Save, then look" />,
        },
        {
          heading: "Attach it for someone outside",
          body: [
            "Rita works at Oak Street Deli, outside Northfield. She can't open our SharePoint, so a link is no use to her. Use Attach file (6) and pick the PDF.",
            "Say in the email that it's attached, and copy in Daniel (3) so he knows it's gone. A colleague would get a link instead, to the one file on SharePoint.",
          ],
          figure: (
            <ComposeFigure
              focus={["attach", "cc"]}
              title="Sending it to a customer"
              email={{ to: "Rita Fenwick", cc: "Daniel Okafor", subject: "Refund for order 4405", attachment: "2026-11-10 Letter to Oak Street Deli.pdf", greeting: "Dear Ms Fenwick,", message: ["Please find attached our letter about order 4405.", "I'm sorry again for the trouble."], signoff: "Kind regards,\nJordan", signature: SIGNATURE }}
            />
          ),
        },
      ],
      tryIt: { title: "Make a PDF", intro: "The letter to Kent Bakery is finished. Save it as a PDF, in the right place, named the house way.", Lab: PdfLab },
      check: [
        {
          q: "How should a letter to a customer go?",
          options: ["As a PDF, attached to an email", "As the Word file, attached", "As a link to it on SharePoint"],
          answer: 0,
          reasons: ["They can open it on anything, and it can't be changed by mistake.", "They could change it, and it may look wrong on their computer.", "They're outside the company, so a SharePoint link won't open for them."],
        },
        {
          q: "Which name follows the house rule?",
          options: ["2026-11-11 Letter to Kent Bakery.pdf", "Letter to Kent Bakery FINAL 11-11.pdf", "Kent Bakery letter 11 November v2.pdf"],
          answer: 0,
          reasons: ["Year, month, day, then what it is. It sorts by date and anyone can find it.", "No \"final\", and the date goes first, year first.", "No \"v2\", and the date goes first, written 2026-11-11."],
        },
        {
          q: "Why open the PDF before you send it?",
          options: ["To check it's exactly what they'll see", "Because it isn't saved until it's opened", "To turn it back into a Word document"],
          answer: 0,
          reasons: ["What's in the PDF is what they get. One last read catches slips.", "It's saved the moment you press Save.", "The Word document is still there. The PDF stays a PDF."],
        },
      ],
      takeaways: ["Letters and anything sent outside go as a PDF.", "Date first: 2026-11-11 Letter to Kent Bakery.pdf.", "Open it and read it before you send it."],
    },
    {
      id: "m8t5",
      title: "Filling in and uploading a form",
      minutes: 8,
      brief: "Holidays, expenses, new starters: offices run on forms. In this lesson you'll fill in a Word form, check every box is done, and put it where HR will find it.",
      learn: [
        {
          heading: "Here is a whole form, filled in",
          body: [
            "This is Northfield's holiday form, filled in. The questions are on the left; the answers go in the boxes on the right. Some are typed (3), some picked from a list (4), a date (5) or a tick (6).",
            "The blank form is a template in HR > Forms > Blank. Open it and you get your own copy to fill in.",
          ],
          figure: <FormFigure />,
        },
        {
          heading: "Starred boxes must be filled",
          body: ["A star (2) means you must answer it. A box still showing grey \"Click or tap here\" (7) is empty.", "Boxes without a star can stay empty. Starred ones can't: HR will send the form back."],
          figure: <FormFigure focus={["star", "empty"]} title="Required and empty" />,
        },
        {
          heading: "Typing in a box",
          body: ["Click the grey words in a box (3) and type. They go as soon as you start.", "Press Tab to jump to the next box, or click it."],
          figure: <FormFigure focus={["text"]} title="A text box" />,
        },
        {
          heading: "Lists, dates and ticks",
          body: [
            "A drop-down list (4): click the ▼ and pick an answer. A date (5): type it, like 21/12/2026, or click the ▼ for a calendar. A tick box (6): click it to tick it.",
            "Lists stop typos, like a manager's name spelled three different ways.",
          ],
          figure: <FormFigure focus={["choice", "date", "check"]} title="Lists, dates and ticks" />,
        },
        {
          heading: "Uploading it to the right folder",
          body: [
            "Uploading a form means putting your copy where the people who need it will look. For Northfield's HR forms, that's HR > Forms > Completed: File > Save As, click HR, then Forms, then Completed.",
            "Name it like the forms already there: the date, Holiday request, your name (8). The HR site only lets you save in Completed, so the blank form stays blank.",
          ],
          figure: <FormFigure focus={["file"]} title="Its file name" />,
          tip: "Forms on websites work the same way: a Choose file or Upload button opens a box like Save As. Pick your saved file, check its name, then press Submit.",
        },
      ],
      tryIt: { title: "Fill in a form", intro: "You've moved house. Fill in HR's change of details form and put it in Forms > Completed.", Lab: FormLab },
      check: [
        {
          q: "A box still says \"Click or tap here to enter text.\" What does that mean?",
          options: ["It's empty: nothing is typed in it", "HR have filled it in already", "It's a heading, not a box"],
          answer: 0,
          reasons: ["The grey words go as soon as you type.", "Grey words are what every empty box shows.", "It's a box to type in. Headings don't change."],
        },
        {
          q: "What does a star beside a question mean?",
          options: ["You must answer it", "It's the most important one", "HR will answer it for you"],
          answer: 0,
          reasons: ["Starred boxes are required. The form isn't done without them.", "It means required, not most important.", "HR fill in their own part. Starred boxes are yours."],
        },
        {
          q: "Where does a finished Northfield HR form go?",
          options: ["HR > Forms > Completed", "HR > Forms > Blank, over the blank", "OneDrive > Documents, your own folder"],
          answer: 0,
          reasons: ["That's where HR look, and the only HR folder you can save in.", "The blank must stay blank for the next person, and HR won't look there.", "Nobody in HR can see your OneDrive."],
        },
      ],
      takeaways: ["Every starred box, every time.", "Use the list and the calendar: fewer typos.", "Save it where HR looks, named the house way."],
    },
  ],
};

export default m8;
