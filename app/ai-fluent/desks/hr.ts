import type { AttachedDocument, DataPack, TrackBlock } from "@/app/ai-cleared/engine/types";
import { SHARED_PROVE } from "./general";

/* The HR and people desk for AI Fluent, modules 4 to 9: a small firm's
 * people team in a month with a new starter, a flexible-working request,
 * a probation review and the quarterly absence figures. Modules 1 to 3
 * run on the General desk. Every name and number is invented. */

export const HR_PACK: DataPack = {
  facts:
    "People matters this month: new starter Maya Lindqvist (office coordinator, salary £31,000, starts the 20th); a flexible-working request from Omar Haddad in the support team to work four days; a probation review for Chloe Barratt in sales at three months, with two missed targets; an occupational health referral for Tom Ashworth after six weeks' absence; the people partner Nadia Keane; the firm's payroll provider PayStream (contact ref PS-20488).",
  entities: [
    { pattern: "maya\\s+lindqvist|lindqvist|\\bmaya\\b", cls: "C", label: "a new starter", placeholder: "[new starter]" },
    { pattern: "£?\\s?31,?000(\\.00)?", flags: "g", cls: "R", label: "a salary", placeholder: "" },
    { pattern: "omar\\s+haddad|haddad|\\bomar\\b", cls: "R", label: "an employee", placeholder: "[employee]" },
    { pattern: "chloe\\s+barratt|barratt|\\bchloe\\b", cls: "R", label: "an employee", placeholder: "[employee]" },
    { pattern: "tom\\s+ashworth|ashworth", cls: "R", label: "an employee", placeholder: "[employee]" },
    { pattern: "occupational\\s+health|\\bOH\\b", flags: "gi", cls: "R", label: "a health referral", placeholder: "[a referral]" },
    { pattern: "nadia\\s+keane|keane", cls: "C", label: "a colleague", placeholder: "[colleague]" },
    { pattern: "paystream", flags: "gi", cls: "C", label: "payroll provider", placeholder: "[payroll provider]" },
    { pattern: "PS-?20488", flags: "gi", cls: "I", label: "a provider reference", placeholder: "[reference]" },
  ],
  restrictedFallback: "Leave the names, the salary and anything about health out; add them yourself afterwards.",
};

export const PROBATION_FILE: AttachedDocument = {
  title: "Probation review, C. Barratt, three months",
  kind: "Word document, 5 sections",
  sections: [
    { heading: "Role and period", paragraphs: [{ text: "Sales executive, started on the 3rd three months ago. Six-month probation with a review at three months. Line manager: Priya Nair." }] },
    { heading: "Targets", paragraphs: [{ text: "Monthly target of eight qualified meetings. Month one: five. Month two: nine. Month three: six. Two of three months missed. Pipeline value created £142,000 against a target of £120,000, so the value target is met while the activity target is not." }] },
    { heading: "Manager's notes", paragraphs: [{ text: "Strong on the phone with larger prospects; slow to log activity in the CRM, which may understate the meeting count. Two meetings in month three were logged a week late. Training on the CRM was delayed until week six because the trainer was off." }] },
    { heading: "Employee's comments", paragraphs: [{ text: "Chloe says the meeting target was explained in week six, after the CRM training, and that she has been prioritising larger accounts. She asks for the activity target to be reviewed against pipeline value." }] },
    { heading: "Options", paragraphs: [{ text: "Confirm in role; extend probation by three months with a written plan; or end employment. The manager recommends extending with a plan: eight logged meetings a month, logged within two days, reviewed monthly. HR has not yet recommended." }] },
  ],
};

export const FLEXIBLE_THREAD: AttachedDocument = {
  title: "Flexible working request, O. Haddad",
  kind: "Email thread, 4 messages",
  emails: [
    { from: "Omar Haddad", subject: "Flexible working request", time: "1st", preview: "I would like to request a change to four days a week, Monday to Thursday, from next month, for caring reasons…" },
    { from: "Nadia Keane", subject: "RE: Flexible working request", time: "2nd", preview: "Thank you, received on the 1st. We will meet to discuss it and respond within two months…" },
    { from: "Sam Kerrigan", subject: "RE: Flexible working request", time: "6th", preview: "Support cover on Fridays is the issue: Omar handles the escalation queue and there is no second person trained…" },
    { from: "Omar Haddad", subject: "RE: Flexible working request", time: "8th", preview: "I could train Lena on the escalation queue over the next three weeks if that helps…" },
  ],
  sections: [
    { heading: "Subject: Flexible working request", paragraphs: [{ text: "I would like to request a change to four days a week, Monday to Thursday, from the 1st of next month, for caring reasons. I am happy for my pay to be adjusted. Omar." }] },
    { heading: "Subject: RE (Nadia Keane)", paragraphs: [{ text: "Thank you, received on the 1st. We will meet to discuss it in the next two weeks and give you a decision within two months of the request, as required. In the meantime could your manager set out any impact on the team." }] },
    { heading: "Subject: RE (Sam Kerrigan, manager)", paragraphs: [{ text: "Support cover on Fridays is the issue. Omar handles the escalation queue and there is no second person trained on it. Friday is our second-busiest day. I am not against it if cover can be arranged." }] },
    { heading: "Subject: RE (Omar Haddad)", paragraphs: [{ text: "I could train Lena on the escalation queue over the next three weeks if that helps, and take any Friday escalations by phone for the first month." }] },
  ],
};

export const ABSENCE_TABLE: AttachedDocument = {
  title: "Absence by team, last quarter",
  kind: "Spreadsheet, 5 rows",
  table: {
    columns: ["Team", "Headcount", "Days lost", "Episodes", "Long-term", "Days per head"],
    rows: [
      ["Support", "9", "41", "17", "0", "4.6"],
      ["Sales", "7", "12", "8", "0", "1.7"],
      ["Operations", "11", "63", "9", "1", "5.7"],
      ["Finance", "4", "6", "4", "0", "1.5"],
      ["Office", "5", "9", "6", "0", "1.8"],
      ["Total", "36", "131", "44", "1", "3.6"],
    ],
  },
  sections: [
    { heading: "Rows", paragraphs: [
      { text: "Support · 9 people · 41 days lost · 17 episodes · no long-term · 4.6 days per head." },
      { text: "Sales · 7 · 12 days · 8 episodes · 1.7 days per head." },
      { text: "Operations · 11 · 63 days · 9 episodes · one long-term absence · 5.7 days per head." },
      { text: "Finance · 4 · 6 days · 4 episodes · 1.5 days per head." },
      { text: "Office · 5 · 9 days · 6 episodes · 1.8 days per head." },
    ] },
    { heading: "Notes", paragraphs: [{ text: "Total 131 days lost across 36 people, 3.6 days per head. Operations includes one long-term absence of 30 days; without it Operations is 33 days, 3.0 per head. Support has the most episodes relative to headcount." }] },
  ],
};

export const PEOPLE_MEETING: AttachedDocument = {
  title: "People team weekly",
  kind: "Meeting recap, Monday, 20 minutes",
  transcript: [
    { who: "Nadia Keane", line: "Maya starts on the 20th. Contract signed, laptop ordered, Priya is buddying. Induction is booked for the morning of the 20th; I will run it." },
    { who: "Ben Okoro", line: "Omar's flexible working: Sam is not against it if Friday cover is sorted. Omar offered to train Lena over three weeks. I think we approve with a three-month trial." },
    { who: "Nadia Keane", line: "Agreed, three-month trial starting the 1st, decision letter by Friday. Ben, you draft it." },
    { who: "Ben Okoro", line: "Yes, Friday. Chloe's probation: Priya recommends extending three months with a plan. I agree. Meeting with Chloe on Thursday to go through the plan." },
    { who: "Nadia Keane", line: "Make sure the plan says logged within two days, and that the pipeline value is recognised in writing. Tom's occupational health referral: the report is due on the 16th. Nothing to action until then; keep it to the three of us." },
    { who: "Ben Okoro", line: "And the absence figures go to the leadership meeting on the 15th. Operations looks high but it is one long-term case." },
    { who: "Nadia Keane", line: "Actions: Ben, Omar's decision letter by Friday and Chloe's probation meeting Thursday; me, Maya's induction on the 20th and the absence note for the 15th with the long-term case shown separately." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "New starter induction on the 20th, run by Nadia. Flexible working approved on a three-month trial from the 1st, letter by Friday from Ben. Probation extended three months with a written plan; meeting Thursday. Occupational health report due on the 16th, no action until then. Absence note for the leadership meeting on the 15th with the long-term case shown separately." }] },
  ],
};

export const HR_BLOCKS: Record<number, TrackBlock> = {
  4: {
    dataPack: HR_PACK,
    practise: {
      kind: "loop",
      task: "Summarise the probation file for the people partner, inside Word, then find out what the summary left out.",
      brief: "Nadia has five minutes before she meets the line manager. She needs the targets as numbers, the employee's side, the manager's recommendation and nothing about the background. The file is open in Word; Copilot has it.",
      material: PROBATION_FILE,
      office: "word",
      followUp: true,
      turns: [
        { instruction: "Send 1: ask for the summary. Reader, length, shape, what to flag, what to leave out, from the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary for the people partner: the figures, the employee's comments, the recommendation, under a stated length, no background." }, placeholder: "For the people partner, under … words, lead with the figures and the employee's side…" },
        { instruction: "Send 2: ask what it left out, and whether anything in the summary is a judgement rather than something the file states.", placeholder: "What did you leave out? Which sentences are your judgement rather than what the file says?" },
      ],
      playbook: { workflow: "Summarise", whenToUse: "A case file a decision-maker needs in minutes: the figures, both sides, the recommendation; facts kept separate from judgement.", check: "Ask what was left out, and check every figure against the file." },
    },
    prove: SHARED_PROVE[4],
  },
  5: {
    dataPack: HR_PACK,
    practise: {
      kind: "loop",
      task: "Draft the reply to Omar inside Outlook, then fix its tone in one turn.",
      brief: "Omar has offered to train a colleague on the escalation queue. You want to thank him, say a meeting is booked for Thursday, confirm the decision will come within the two months, and promise nothing about the outcome. Reply as the people team.",
      material: FLEXIBLE_THREAD,
      office: "outlook",
      followUp: true,
      turns: [
        { instruction: "Send 1: brief Copilot. From whom and to whom, the one thing the reply must achieve, the tone, the length, anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A reply that thanks him, confirms Thursday's meeting and the two-month deadline, and commits to no outcome." }, placeholder: "Reply as the people team to Omar… the one thing it must do is… do not say whether it will be approved…" },
        { instruction: "Send 2: fix the tone or the length in one line.", placeholder: "Warmer, and cut the paragraph about policy…" },
      ],
      playbook: { workflow: "Draft", whenToUse: "Any reply with one job: from whom and to whom, the one thing, the voice, the length, what not to promise.", check: "Read it as the recipient would; check every date against the thread." },
    },
    prove: SHARED_PROVE[5],
  },
  6: {
    dataPack: HR_PACK,
    practises: [
      {
        kind: "spot",
        task: "Read Copilot's reply about the absence figures. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what this sheet says about absence last quarter",
        sentences: [
          "131 days were lost across 36 people last quarter, 3.6 days per head.",
          "Operations has the highest days per head at 5.7, driven by one long-term absence of 30 days.",
          "Support has the most episodes relative to its headcount, 17 across nine people.",
          "Sales absence is low and has fallen since the previous quarter.",
          "Finance and the office team are both under two days per head.",
        ],
        errorIndex: 3,
        why: "The sheet has one quarter. Nothing in it says what Sales was before. The tool supplied a trend the sheet cannot support, between four true sentences.",
        material: ABSENCE_TABLE,
      },
      {
        kind: "loop",
        task: "Now ask the sheet the question that would have caught that guess, inside Excel.",
        brief: "Leadership want to know, from the sheet alone, which team has the highest short-term absence per head once the long-term case is set aside, and how many days that is. Ask for the figures and the workings from named columns, and ask Copilot to mark anything not in the sheet.",
        material: ABSENCE_TABLE,
        office: "excel",
        followUp: false,
        turns: [
          { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "Short-term days per head by team, from the Days lost, Long-term and Headcount columns, with the arithmetic shown." }, placeholder: "From the Days lost, Long-term and Headcount columns, which team has the highest short-term absence per head and what is it? Show the arithmetic and mark anything…" },
        ],
        playbook: { workflow: "Analyse", whenToUse: "Any question of a table: ask the question, name the columns, ask for the workings, ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from." },
      },
    ],
    prove: SHARED_PROVE[6],
  },
  7: {
    dataPack: HR_PACK,
    practises: [
      {
        kind: "loop",
        task: "Research a question for the people partner with web mode on, then get the sources.",
        brief: "Nadia wants to know how long a UK employer has to decide a flexible working request and what the grounds for refusing one are, as a short list. Do not name the employee or the firm in the prompt.",
        followUp: true,
        webMode: true,
        turns: [
          { instruction: "Send 1: the question, for the people partner, with the constraints: UK only, current guidance, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "The decision period and the grounds for refusal under current UK flexible working rules, with sources and dates." }, placeholder: "For the people partner: how long does a UK employer have to decide a flexible working request and on what grounds may it refuse… current guidance, cite sources with dates…" },
          { instruction: "Send 2: ask for the sources as a numbered list with publisher, title and date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
        ],
        playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: reader, constraints, UK only and current, sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
      },
      {
        kind: "sources",
        task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
        prompt: "List the sources for that answer with publisher, title and date.",
        reply: "Here are the sources:\n\n1. GOV.UK, Flexible working\n2. Acas, Code of Practice on requests for flexible working\n3. Employment Rights Act 1996, Part 8A, legislation.gov.uk\n4. CIPD, Flexible Working Decisions Handbook 2025, chapter 3\n\nI am confident in all four.",
        sources: [
          { label: "GOV.UK, Flexible working", real: true, note: "GOV.UK has a guidance page on flexible working." },
          { label: "Acas, Code of Practice on requests for flexible working", real: true, note: "Acas publishes the statutory Code of Practice." },
          { label: "Employment Rights Act 1996, Part 8A, legislation.gov.uk", real: true, note: "Part 8A is the statutory right to request flexible working." },
          { label: "CIPD, Flexible Working Decisions Handbook 2025, chapter 3", real: false, note: "There is no such handbook. The publisher is real, the year is recent, the chapter is specific, and it does not exist." },
        ],
      },
    ],
    prove: SHARED_PROVE[7],
  },
  8: {
    dataPack: HR_PACK,
    practises: [
      {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "The managing partner missed the people team weekly and wants a recap: what was decided, then the actions with an owner and a date each. The occupational health item stays out of anything that leaves the team. Run the same template twice, the second time for a colleague who needs only their own actions, in a fresh chat each time.",
        material: PEOPLE_MEETING,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for the managing partner. Reader, shape (decisions, then actions with owner and date), length, what to flag, what to leave out, and the check written into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap: decisions as bullets, actions with owner and date, under a stated length, the health referral left out, every owner and date from the transcript." }, placeholder: "Recap the people team weekly for the managing partner, who missed it: three bullets on what was decided, then actions with owner and date, under … words, leave out the health referral. Check: …" },
          { instruction: "Send 2: the same template, filled in for Ben, who was there and needs only his own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Ben's actions, with dates." }, placeholder: "Recap the people team weekly for Ben, who was there and needs only his own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check and what to leave out into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      {
        kind: "spot",
        task: "Here is the recap a colleague's template produced. One action has a detail the transcript does not support. Tap it.",
        prompt: "Recap the people team weekly for the managing partner: decisions, then actions with owner and date, under 100 words.",
        sentences: [
          "Decided: the flexible working request is approved on a three-month trial from the 1st.",
          "Decided: probation is extended by three months with a written plan that recognises pipeline value.",
          "Action: Ben sends the flexible working decision letter by Friday.",
          "Action: Ben meets the employee on Thursday to go through the probation plan.",
          "Action: Nadia runs the new starter's induction on the 20th and sends the absence note for the 15th with Operations marked as a concern.",
        ],
        errorIndex: 4,
        why: "The transcript says the long-term case is shown separately, precisely so Operations is not read as a concern. The recap reversed the point of the action. One phrase, and a team is flagged to leadership for a single long-term absence.",
        material: PEOPLE_MEETING,
      },
    ],
    prove: SHARED_PROVE[8],
  },
  9: {
    dataPack: HR_PACK,
    practises: [
      {
        kind: "loop",
        task: "Turn the probation file into a one-page recommendation for the managing partner, inside Word, in three turns.",
        brief: "The managing partner signs off probation decisions. They want one page: the facts as numbers, the employee's side, the recommendation, and the plan with measures and dates. Fair, plain, nothing about health or anyone else. The file is open in Word; Copilot has it. Three turns: ask, fix, finish. Then check it.",
        material: PROBATION_FILE,
        office: "word",
        followUp: true,
        turns: [
          { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the file.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "A one-page recommendation: figures, the employee's side, the recommendation, the plan with measures and dates, from the file." }, placeholder: "For the managing partner: one page with the targets as numbers, the employee's comments, the recommendation and a plan with measures and dates, under … words, from the file…" },
          { instruction: "Turn 2: look at it as the managing partner would. Say what was wrong or narrow it.", placeholder: "The plan needs the two-day logging rule; the pipeline value must be stated; shorter…" },
          { instruction: "Turn 3: ask it to check every figure and date against the file and mark anything it stated that the file does not.", placeholder: "Check every figure and date in the note against the file and mark anything not stated in it…" },
        ],
        playbook: { workflow: "Your real task", whenToUse: "A probation or case recommendation: reader, shape, length, what to flag and leave out, from the file; then fix, then check.", check: "Every figure and date traced to the file; the tool asked to mark anything the file does not say; nothing about health or third parties." },
      },
      {
        kind: "spot",
        task: "Here is a recommendation a colleague's prompt produced from the same file. One figure is wrong. Tap the sentence.",
        prompt: "One page for the managing partner: the targets as numbers, the employee's side, the recommendation and a plan, under 150 words, from the file.",
        sentences: [
          "Targets: eight qualified meetings a month; five, nine and six were achieved, so two of three months were missed.",
          "Pipeline value created was £142,000 against a target of £120,000, so the value target was met.",
          "The employee notes the meeting target was explained in week six, after CRM training that was itself delayed.",
          "Recommendation: extend probation by three months with a written plan.",
          "Plan: eight logged meetings a month, logged within five days, reviewed monthly.",
        ],
        errorIndex: 4,
        why: "The file says logged within two days, not five. The plan's one measurable rule is loosened by a single digit, and the employee could meet the wrong rule and still fail the right one. Trace every number in a plan to the file.",
        material: PROBATION_FILE,
      },
    ],
    prove: [
      ...SHARED_PROVE[9],
      { kind: "choose", stem: "The recommendation mentions a colleague's absence as context. What happens?", options: ["Leave it; it is relevant.", "Take it out: it is another person's data and the brief said nothing about anyone else.", "Anonymise it."], answer: 1, why: "A people document carries only the data of the person it is about. The brief's \"nothing about anyone else\" is a constraint, and the check enforces it." },
    ],
  },
};
