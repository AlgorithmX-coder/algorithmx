import { readCapstoneResult, type CapstoneResult } from "../../final/result";
import { AGENCY, storedAgency } from "../agency";
import { ALL_STARTING_LINES, CV_TEMPLATE, CV_TEMPLATE_PATH, agencyLines, cvFileName, cvName, cvStartingLines, cvTemplateDoc, homeAddress, isCopied, isSkillLine, pagesOf, section, skillLines, type ProofLine } from "../cv";
import { PEOPLE, inbound, officeFolders } from "../northfield";
import { pathText, samePath, type Check, type Job, type OfficeFile, type OfficeState, type WordDoc } from "../types";
import { docText, isFakeHeading, issues, para, placeholdersIn } from "../word";

/* E13.1 Turn your week into a CV (criteria WD-1, WD-4).
 *
 * Jo at Pennyford Recruitment, the agency the learner has signed up with,
 * wants a one-page CV as a PDF, named with their name. Daniel has jotted
 * down what the learner did at Northfield this week, in a note in their
 * OneDrive: one line for every office job they have actually finished in
 * the course (cv.ts, JOB_LINES), plus their agency test results once they
 * have passed them. The learner starts from Word's CV template, puts three
 * of those lines on it in their own words, keeps it to one page with real
 * headings, saves it as "[Your name] CV.pdf" in their own OneDrive, and
 * sends it to Jo attached.
 *
 * The lines are read when the job is first opened (or started again), from
 * this browser's progress, so they are always things the learner has done.
 * The course's final task can add its scorecard here too: see cv.ts,
 * cvStartingLines(done, extra). */

const DOCS = ["OneDrive", "Documents"] as const;
const JO = { name: AGENCY.consultant.name, address: AGENCY.consultant.address };
const NOTES_ID = "seed-cv-notes";

/* Daniel's note: what the learner did this week, one line each. */
export function notesDoc(lines: readonly ProofLine[], general: boolean): WordDoc {
  return {
    blocks: [
      para("My week at Northfield", "title"),
      para(
        general
          ? "You haven't finished an office job in the course yet, so these are general lines. Only use one if you can really do it. Finish a few jobs and these notes fill with what you actually did."
          : "Things you did this week, from what I saw. Pick three for your CV and put them in your own words.",
      ),
      ...(general ? [] : [para("Daniel")]),
      para("What you did", "h1"),
      ...lines.map((l) => para(l.line, "bullet")),
    ],
  };
}

/* The lessons and jobs finished in this browser: learn/progress's list,
 * read straight from storage, because a job is also loaded by the server
 * page (for its title) and must not pull in the progress hooks. */
function finished(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem("desk:done") ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/* The course's final task as proof: a passed Monday morning offers one
 * honest line, how many of its ten jobs were done and when. A morning that
 * didn't pass offers nothing. */
export function morningLines(r: CapstoneResult | null): ProofLine[] {
  if (!r?.passed) return [];
  const when = new Date(r.finishedOn);
  const month = Number.isNaN(when.getTime()) ? "" : ` (${when.toLocaleDateString("en-GB", { month: "long", year: "numeric" })})`;
  return [{ from: "Monday morning at the desk", line: `Completed a timed office assessment: ${r.score} of ${r.outOf} tasks, from invoices to a phishing email, in a four-hour simulated office morning${month}` }];
}

/* The lines the job offers, from this browser's progress. */
export function offeredLines(): { lines: ProofLine[]; general: boolean } {
  return cvStartingLines(finished(), [...agencyLines(storedAgency()), ...morningLines(readCapstoneResult())]);
}

const JO_BODY = `Hi,

Thanks for coming in to register with us yesterday. Before I can put you forward for office jobs, I need your CV.

Please:
- keep it to one page
- put your week at Northfield Supplies on it, with three office skills in your own words (employers spot copied lines straight away)
- send it to me as a PDF, named with your name, like Jordan Miles CV.pdf

Word has a CV template you can start from. Please don't put your home address on it: your town is enough.

Kind regards,
Jo Marsh
Recruitment Consultant | ${AGENCY.name}
${AGENCY.phone}`;

const DANIEL_BODY = `Hi,

As promised, I've jotted down what you did this week. It's in your OneDrive, in Documents: "My week at Northfield". Use it for your CV, but in your own words.

I'm happy to be your reference.

Daniel`;

export function seed(offer = offeredLines()): OfficeState {
  const files: OfficeFile[] = officeFolders();
  files.push({ id: "seed-dir-cot", path: [...DOCS], name: "Custom Office Templates", kind: "folder", modified: "02/11/2026", by: "You", seeded: true });
  files.push({ id: "seed-cv-template", path: [...CV_TEMPLATE_PATH], name: CV_TEMPLATE, kind: "dotx", modified: "02/11/2026", by: "You", doc: cvTemplateDoc(), seeded: true });
  files.push({ id: NOTES_ID, path: [...DOCS], name: "My week at Northfield.docx", kind: "docx", modified: "Today 08:48", by: "Daniel Okafor", doc: notesDoc(offer.lines, offer.general), seeded: true });
  return {
    version: 0,
    files,
    emails: [
      inbound({ id: "mail-jo-cv", from: JO, subject: "Your CV, please", time: "09:05", body: JO_BODY }),
      inbound({ id: "mail-daniel-notes", from: PEOPLE.daniel, subject: "Notes for your CV", time: "08:50", body: DANIEL_BODY }),
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const isCv = (f: OfficeFile) => f.kind === "pdf" && !!f.doc && !f.seeded && (f.doc.template === CV_TEMPLATE || section(f.doc, /skill/i).length > 0 || /\bskills\b/i.test(docText(f.doc)));
const squash = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

/* Every line the learner was offered: the course's, plus whatever is in
 * their own notes (their agency results, the final task's lines). */
function offeredIn(s: OfficeState): string[] {
  const notes = s.files.find((f) => f.id === NOTES_ID)?.doc;
  return [...ALL_STARTING_LINES, ...(notes ? notes.blocks.filter((b) => b.style === "bullet").map((b) => b.text) : [])];
}

function check(s: OfficeState): Check[] {
  const pdfs = s.files.filter(isCv);
  const named = (f: OfficeFile) => !!f.doc && squash(f.name) === squash(cvFileName(f.doc));
  const pdf = pdfs.find((f) => samePath(f.path, DOCS) && named(f)) ?? pdfs.find(named) ?? pdfs.find((f) => samePath(f.path, DOCS)) ?? pdfs[pdfs.length - 1];
  const doc = pdf?.doc;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const noPdf = "There's no PDF of your CV yet. Write it in Word, then File > Export > Create PDF (or File > Save As, and pick PDF).";

  /* The CV */
  add({ id: "template", code: "WD-2", group: "Your CV", label: "Started from the CV template" }, doc?.template === CV_TEMPLATE, !pdf ? noPdf : "Start from the CV template: in Word's start screen, click CV under New (it lives in OneDrive > Documents > Custom Office Templates). Then copy your words across.");
  const left = doc ? placeholdersIn(doc) : [];
  add(
    { id: "placeholders", code: "WD-2", group: "Your CV", label: "Every [placeholder] is filled in" },
    !!doc && left.length === 0,
    !pdf ? noPdf : `${left.slice(0, 3).map((p) => `"${p}"`).join(", ")} ${left.length === 1 ? "is" : "are"} still on it. Click each one in Word and type over it, or delete a line you don't need. Then make the PDF again.`,
  );
  const fake = doc?.blocks.find(isFakeHeading);
  const realHeadings = doc ? doc.blocks.filter((b) => (b.style === "h1" || b.style === "h2") && b.text.trim()).length : 0;
  add(
    { id: "headings", code: "WD-1", group: "Your CV", label: "Section headings use Heading styles, not bold Normal text" },
    !!doc && !fake && realHeadings >= 3,
    !pdf ? noPdf : fake ? `"${fake.text.trim().slice(0, 40)}" is Normal text made bold or bigger. Click in it and pick Heading 1 from Styles, so it's a real heading.` : "Keep Profile, Skills, Experience and Education as Heading 1, as the template has them.",
  );
  const skills = doc ? skillLines(doc).filter(isSkillLine) : [];
  const bullets = doc ? doc.blocks.filter((b) => b.style === "bullet" && skills.includes(b.text.trim())).length : 0;
  add(
    { id: "skills", code: "WD-1", group: "Your CV", label: "Three office skills, as bullet points, under Skills" },
    skills.length >= 3 && bullets >= 3,
    !pdf ? noPdf : skills.length < 3 ? `There ${skills.length === 1 ? "is" : "are"} ${skills.length || "no"} skill line${skills.length === 1 ? "" : "s"} of four words or more under Skills. Put three there, one per bullet.` : "Make each skill a bullet: click in the line and press Bullets on the Home tab.",
  );
  const offered = offeredIn(s);
  const copied = skills.filter((l) => isCopied(l, offered));
  const repeated = new Set(skills.map(squash)).size < skills.length;
  add(
    { id: "own", code: "WD-2", group: "Your CV", label: "The skill lines are in your own words" },
    skills.length >= 3 && copied.length === 0 && !repeated,
    !pdf ? noPdf : copied.length ? `"${copied[0]}" is word for word as it was offered. Make it yours: say it the way you would in an interview, or add what it was for.` : repeated ? "Two of your skill lines say the same thing. Give each one a different skill." : "Put three skills under Skills first, in your own words.",
  );
  const pages = doc ? pagesOf(doc) : 0;
  add({ id: "page", code: "WD-1", group: "Your CV", label: "It fits on one page" }, !!doc && pages === 1, !pdf ? noPdf : `It runs to ${pages} pages. Cut it to one: keep each line short, and drop the oldest or least useful lines. A recruiter reads one page.`);
  const mistakes = doc ? issues(doc, { all: true }) : [];
  add(
    { id: "spelling", code: "WD-3", group: "Your CV", label: "No spelling or grammar mistakes" },
    !!doc && mistakes.length === 0,
    !pdf ? noPdf : `"${mistakes[0]?.word.trim()}" is ${mistakes[0]?.kind === "spelling" ? "spelled wrong" : "a grammar slip"}. Run Review > Spelling & Grammar in Word, then make the PDF again. A slip on a CV can cost you the interview.`,
  );
  const address = doc ? homeAddress(doc) : null;
  add({ id: "private", code: "WD-2", group: "Your CV", label: "Just your town: no home address" }, !!doc && !address, !pdf ? noPdf : `"${address}" looks like a home address. Take it off: your town is enough. A CV gets passed around, and nobody needs to know where you live until you're offered the job.`);

  /* Saving it */
  const want = doc ? cvFileName(doc) : "Your Name CV.pdf";
  add({ id: "pdf", code: "WD-4", group: "Saving it", label: "Saved as a PDF" }, !!pdf, noPdf);
  add(
    { id: "name", code: "WD-4", group: "Saving it", label: doc && cvName(doc) && !/\[/.test(cvName(doc)) ? `Named "${want}"` : "Named with your name, then CV" },
    !!pdf && named(pdf),
    !pdf ? noPdf : `It's called "${pdf.name}". Name it with the name at the top of your CV, then CV: "${want}". A recruiter has a hundred files called CV.pdf.`,
  );
  add({ id: "place", code: "SP-1", group: "Saving it", label: "Kept in your own OneDrive, in Documents" }, !!pdf && samePath(pdf.path, DOCS), pdf ? `It's in ${pathText(pdf.path)}. A CV is yours, not the team's: keep it in OneDrive > Documents. In File Explorer, select it and use Move to.` : noPdf);
  const strays = pdfs.filter((f) => f !== pdf);
  add({ id: "one", code: "SP-3", group: "Saving it", label: "One PDF of your CV, in one place" }, !!pdf && strays.length === 0, !pdf ? noPdf : `There's another PDF of it: ${strays[0] ? `${pathText(strays[0].path)} > ${strays[0].name}` : ""}. Delete the old one, so you never send the wrong version.`);

  /* Sending it */
  const toJo = s.emails.filter((e) => e.folder === "sent" && [...e.to, ...e.cc].some((p) => p.address === JO.address));
  const mail = toJo.find((e) => e.attachments.some((a) => /\.pdf$/i.test(a.name))) ?? toJo[toJo.length - 1];
  const att = mail?.attachments.find((a) => /\.pdf$/i.test(a.name) && a.doc);
  const same = !!att?.doc && !!doc && docText(att.doc) === docText(doc);
  add(
    { id: "sent", code: "OL-6", group: "Sending it", label: "Sent to Jo with the PDF attached" },
    !!att && same,
    !mail
      ? "Reply to Jo's email, attach the PDF (Attach file, then OneDrive > Documents) and send it."
      : !att
        ? mail.attachments.some((a) => /\.docx$/i.test(a.name))
          ? "You attached the Word file. Attach the PDF: it looks the same on any computer, and nobody can change it by mistake."
          : "There's no PDF attached. Use Attach file and pick your CV in OneDrive > Documents."
        : "The PDF you sent isn't the one saved in OneDrive > Documents. Send Jo the final one.",
  );
  return out;
}

export const cvWeek: Job = {
  id: "m13j1",
  slug: "cv-from-your-week",
  moduleId: "m13",
  moduleLabel: "Module 13: Show what you can do",
  title: "Turn your week into a CV",
  summary: "Jo at the agency needs your CV. Put your week at Northfield on one page, in your own words, and send it as a PDF named with your name.",
  clock: "09:10",
  deadline: "Friday 13 November",
  doneLine: "Jo has a one-page CV with your name on it, in your words, ready to send to employers.",
  brief: "Jo at Pennyford Recruitment needs your CV. Read her email and Daniel's, then make it in Word. A CV is yours, so keep it in your own OneDrive > Documents, never on a team site. For the phone number, a made-up one like 07700 900461 is fine here. When you think it's done, press Check my work.",
  apps: ["word"],
  hide: ["excel"],
  hints: [
    "Read Jo's email, then Daniel's. Open his note: File Explorer > OneDrive > Documents > My week at Northfield.",
    "Open Word and click CV under New. It opens as a new document.",
    "Click each [placeholder] and type over it. Your name at the top; then Leicester, a made-up phone number like 07700 900461 and an email.",
    "Under Skills, write three lines from Daniel's note in your own words. Under Experience, put Office Administrator (placement), Northfield Supplies, November 2026.",
    "Check the status bar says Page 1 of 1, then Review > Spelling & Grammar.",
    "File > Export > Create PDF. Save it in OneDrive > Documents, named your name then CV, like Jordan Miles CV.",
    "In Outlook, reply to Jo, Attach file, pick the PDF and send it.",
  ],
  seed: () => seed(),
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["place"] },
    { label: "Name it so anyone can find it", checks: ["name"] },
    { label: "One version, in one place", checks: ["one"] },
    { label: "Close the loop", checks: ["sent"] },
    { label: "Check your own work", checks: ["placeholders", "page", "spelling"] },
  ],
};

