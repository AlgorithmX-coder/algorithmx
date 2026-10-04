import type { AttachedDocument, DataPack, TrackBlock } from "@/app/ai-cleared/engine/types";
import { SHARED_PROVE } from "./general";

/* The Legal and compliance desk for AI Fluent, modules 4 to 9: a small
 * firm's in-house legal and compliance function. Modules 1 to 3 run on
 * the General desk. Every name, firm, clause and number is invented. */

export const LEGAL_PACK: DataPack = {
  facts:
    "Matters this month: the Brantwood Logistics services agreement (their counsel Fiona Okafor, f.okafor@brantwood.example) renewing on the 30th with a liability cap under negotiation; a subject access request from a former employee, Daniel Pryce, received on the 2nd, due on the 1st of next month; the data processing agreement with cloud supplier Nimbus Hosting; a contractor, Leo Marchetti, whose NDA is unsigned; the firm's registered office at 14 Castle Wharf; the compliance lead Amara Osei; the firm's ICO registration ZA-7731902.",
  entities: [
    { pattern: "brantwood(\\s+logistics)?", cls: "C", label: "client name", placeholder: "[client]" },
    { pattern: "fiona\\s+okafor|okafor", cls: "C", label: "opposing counsel", placeholder: "[their counsel]" },
    { pattern: "f\\.okafor@brantwood\\.example", cls: "C", label: "counsel email", placeholder: "[contact email]" },
    { pattern: "daniel\\s+pryce|pryce", cls: "R", label: "a data subject", placeholder: "[the requester]" },
    { pattern: "nimbus(\\s+hosting)?", cls: "C", label: "supplier name", placeholder: "[supplier]" },
    { pattern: "leo\\s+marchetti|marchetti", cls: "C", label: "a contractor", placeholder: "[contractor]" },
    { pattern: "14\\s+castle\\s+wharf", cls: "C", label: "registered office", placeholder: "[address]" },
    { pattern: "amara\\s+osei|osei", cls: "C", label: "a colleague", placeholder: "[colleague]" },
    { pattern: "ZA-?7731902", flags: "gi", cls: "R", label: "a registration number", placeholder: "" },
  ],
  restrictedFallback: "Leave the requester's name and the registration number out; add them yourself afterwards.",
};

export const SERVICES_AGREEMENT: AttachedDocument = {
  title: "Brantwood services agreement, renewal draft",
  kind: "Word document, 6 clauses marked up",
  sections: [
    { heading: "Clause 3, Term", paragraphs: [{ text: "The agreement renews on the 30th for a further twelve months unless either party gives sixty days' notice. Brantwood has asked for a break clause at six months; the firm's position is twelve months with no break." }] },
    { heading: "Clause 9, Fees", paragraphs: [{ text: "Fees rise by 4% on renewal. Brantwood has accepted the rise. Invoices are payable within thirty days; late payment attracts interest at 4% above base." }] },
    { heading: "Clause 12, Liability", paragraphs: [{ text: "The firm's liability is capped at the fees paid in the preceding twelve months. Brantwood has asked for a cap of twice annual fees. The firm's insurer has confirmed cover to £2,000,000, which exceeds twice annual fees of £1,640,000. The cap is the only open point that blocks signature." }] },
    { heading: "Clause 15, Data", paragraphs: [{ text: "Each party is a controller of its own data. The data processing schedule was updated in March and is agreed." }] },
    { heading: "Clause 18, Termination", paragraphs: [{ text: "Either party may terminate on material breach unremedied within thirty days. Brantwood has asked for a right to terminate on a change of control of the firm; the firm has not yet responded." }] },
    { heading: "Open points", paragraphs: [{ text: "Break clause (clause 3): not agreed. Liability cap (clause 12): not agreed, insurer cover confirmed. Change of control (clause 18): no response sent. Everything else is agreed. Fiona Okafor has asked for the firm's position on all three by the 20th." }] },
  ],
};

export const SAR_THREAD: AttachedDocument = {
  title: "Subject access request, D. Pryce",
  kind: "Email thread, 4 messages",
  emails: [
    { from: "Daniel Pryce", subject: "Subject access request", time: "2nd", preview: "I am writing to request a copy of all personal data you hold about me, including emails that mention me…" },
    { from: "Amara Osei", subject: "RE: Subject access request", time: "3rd", preview: "Acknowledged. We will respond within one calendar month. Could you confirm your previous employee number…" },
    { from: "Daniel Pryce", subject: "RE: Subject access request", time: "5th", preview: "Employee number 4471. I would also like the notes from my exit interview and any references given…" },
    { from: "HR", subject: "FW: Pryce SAR, what we hold", time: "9th", preview: "Personnel file, 38 pages; 212 emails mentioning him across four mailboxes; exit interview notes; one reference given to…" },
  ],
  sections: [
    { heading: "Subject: Subject access request", paragraphs: [{ text: "I am writing to request a copy of all personal data you hold about me, including emails that mention me, under my right of access. I left the firm in January. Daniel Pryce." }] },
    { heading: "Subject: RE: Subject access request (Amara Osei)", paragraphs: [{ text: "Acknowledged on the 3rd. We will respond within one calendar month of the 2nd, so by the 1st of next month. Could you confirm your previous employee number so we can locate your records." }] },
    { heading: "Subject: RE: Subject access request (Daniel Pryce)", paragraphs: [{ text: "Employee number 4471. I would also like the notes from my exit interview and any references given on my behalf since I left." }] },
    { heading: "Subject: FW: Pryce SAR, what we hold (HR)", paragraphs: [{ text: "Personnel file, 38 pages. 212 emails mentioning him across four mailboxes, of which an unknown number also contain other people's personal data. Exit interview notes, two pages, written by his line manager. One reference given on the 14th of February to a recruitment agency. Some emails are legally privileged advice about his grievance." }] },
  ],
};

export const CONTRACT_REGISTER: AttachedDocument = {
  title: "Contract register, renewals this quarter",
  kind: "Spreadsheet, 6 rows",
  table: {
    columns: ["Counterparty", "Type", "Annual value", "Renews", "Notice", "Status"],
    rows: [
      ["Brantwood Logistics", "Services", "£820,000", "30th this month", "60 days", "Three points open"],
      ["Nimbus Hosting", "DPA and hosting", "£46,000", "12th next month", "30 days", "DPA review due"],
      ["Castle Wharf Estates", "Lease", "£92,000", "Next quarter", "6 months", "Agreed"],
      ["Halden Recruitment", "Terms of business", "£31,000", "Rolling", "None", "Signed"],
      ["Leo Marchetti", "Contractor, NDA", "£18,000", "Rolling", "7 days", "NDA unsigned"],
      ["Orrell Insurance", "PI cover", "£24,500", "1st next month", "N/A", "Renewal quote received"],
    ],
  },
  sections: [
    { heading: "Rows", paragraphs: [
      { text: "Brantwood Logistics · services · £820,000 a year · renews the 30th this month · 60 days' notice · three points open." },
      { text: "Nimbus Hosting · DPA and hosting · £46,000 · renews the 12th next month · 30 days' notice · DPA review due." },
      { text: "Castle Wharf Estates · lease · £92,000 · next quarter · six months' notice · agreed." },
      { text: "Halden Recruitment · terms of business · £31,000 · rolling · no notice period · signed." },
      { text: "Leo Marchetti · contractor NDA · £18,000 · rolling · seven days' notice · NDA unsigned." },
      { text: "Orrell Insurance · PI cover · £24,500 · 1st next month · renewal quote received." },
    ] },
    { heading: "Notes", paragraphs: [{ text: "Total annual value on the register £1,031,500. Two items are unresolved with a deadline inside thirty days: Brantwood and the Nimbus DPA review. The contractor NDA has been unsigned for six weeks." }] },
  ],
};

export const COMPLIANCE_STANDUP: AttachedDocument = {
  title: "Compliance stand-up",
  kind: "Meeting recap, Tuesday, 15 minutes",
  transcript: [
    { who: "Amara Osei", line: "Brantwood first. Fiona wants our position on the break clause, the cap and change of control by the 20th. The insurer confirmed two million of cover, so the cap at twice fees is fine." },
    { who: "Rowan Fletcher", line: "Agreed on the cap. I would hold on the break clause: twelve months, no break. Change of control, we can accept with a sixty-day cure." },
    { who: "Amara Osei", line: "Then I send Fiona all three positions by Thursday. Rowan, can you draft the change-of-control wording by Wednesday?" },
    { who: "Rowan Fletcher", line: "Yes, Wednesday." },
    { who: "Amara Osei", line: "The Pryce SAR. Two hundred and twelve emails to review for third-party data and privilege. Deadline is the 1st. I need the review done by the 24th to leave a week for redaction." },
    { who: "Jess Mulholland", line: "I can do the review. I will flag anything privileged for you rather than decide myself." },
    { who: "Amara Osei", line: "Good. And the Marchetti NDA: Jess, chase it today, signed by Friday or his access is paused. Nimbus DPA review I will take, by the 28th." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "Brantwood: accept the cap at twice fees, hold on the break clause, accept change of control with a sixty-day cure; Rowan drafts the wording by Wednesday and Amara sends all three positions by Thursday. Pryce SAR: Jess reviews the 212 emails by the 24th and flags privilege for Amara. Marchetti NDA chased today, signed by Friday. Nimbus DPA review by Amara by the 28th." }] },
  ],
};

export const LEGAL_BLOCKS: Record<number, TrackBlock> = {
  4: {
    dataPack: LEGAL_PACK,
    practise: {
      kind: "loop",
      task: "Summarise the Brantwood renewal draft for the managing partner, inside Word, then find out what the summary left out.",
      brief: "The managing partner has five minutes before a call with Brantwood. They need the open points, what each would cost the firm, and nothing about the clauses already agreed. The draft is open in Word; Copilot has it.",
      material: SERVICES_AGREEMENT,
      office: "word",
      followUp: true,
      turns: [
        { instruction: "Send 1: ask for the summary. Reader, length, shape, what to flag, what to leave out, from the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary for the managing partner: the three open points first, what each would cost, under a stated length, nothing on agreed clauses." }, placeholder: "For the managing partner, under … words, lead with the open points…" },
        { instruction: "Send 2: ask what it left out, and whether anything in the summary is stated as agreed that the document marks as open.", placeholder: "What did you leave out? Is anything stated as agreed that the document marks open?" },
      ],
      playbook: { workflow: "Summarise", whenToUse: "A marked-up agreement a decision-maker needs in minutes: lead with the open points and what each costs, drop what is agreed.", check: "Ask what was left out, and check every open point against the document." },
    },
    prove: SHARED_PROVE[4],
  },
  5: {
    dataPack: LEGAL_PACK,
    practise: {
      kind: "loop",
      task: "Draft the reply to the requester inside Outlook, then fix its tone in one turn.",
      brief: "Daniel Pryce has confirmed his employee number and widened his request to exit interview notes and references. You want to confirm the one-month deadline, say that some material may be withheld where it contains other people's data or legal advice, and ask nothing further of him. Reply as the compliance team.",
      material: SAR_THREAD,
      office: "outlook",
      followUp: true,
      turns: [
        { instruction: "Send 1: brief Copilot. From whom and to whom, the one thing the reply must achieve, the tone, the length, anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A reply that confirms the deadline, explains that some material may be withheld for third-party data or privilege, and promises nothing about what will be disclosed." }, placeholder: "Reply as the compliance team to the requester… the one thing it must do is…" },
        { instruction: "Send 2: fix the tone or the length in one line.", placeholder: "Plainer, no legal terms, and shorter…" },
      ],
      playbook: { workflow: "Draft", whenToUse: "Any reply with one job: from whom and to whom, the one thing, the voice, the length, what not to promise.", check: "Read it as the recipient would; check every date against the thread." },
    },
    prove: SHARED_PROVE[5],
  },
  6: {
    dataPack: LEGAL_PACK,
    practises: [
      {
        kind: "spot",
        task: "Read Copilot's reply about the contract register. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what this register says about renewals this quarter",
        sentences: [
          "Six contracts are on the register with a total annual value of £1,031,500.",
          "Brantwood is the largest at £820,000 and renews on the 30th with three points open.",
          "The Nimbus data processing agreement review is due before it renews on the 12th next month.",
          "The contractor NDA has been signed and the lease is agreed.",
          "The insurance renewal quote has been received.",
        ],
        errorIndex: 3,
        why: "The register says the NDA is unsigned. The tool stated the opposite between four true sentences, and the lease being agreed is true, which makes the sentence read as safe. That is what a guess looks like.",
        material: CONTRACT_REGISTER,
      },
      {
        kind: "loop",
        task: "Now ask the register the question that would have caught that guess, inside Excel.",
        brief: "You want to know, from the register alone, which contracts are unresolved with a deadline inside thirty days, and the annual value at risk if Brantwood is not signed. Ask for the figures and the workings from named columns, and ask Copilot to mark anything not in the sheet.",
        material: CONTRACT_REGISTER,
        office: "excel",
        followUp: false,
        turns: [
          { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "Which rows are unresolved by the Status column with a Renews date inside thirty days, and the value at risk from the Annual value column." }, placeholder: "From the Status and Renews columns, which contracts are unresolved inside thirty days, and what annual value is at risk? Show the arithmetic and mark anything…" },
        ],
        playbook: { workflow: "Analyse", whenToUse: "Any question of a register: ask the question, name the columns, ask for the workings, ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from." },
      },
    ],
    prove: SHARED_PROVE[6],
  },
  7: {
    dataPack: LEGAL_PACK,
    practises: [
      {
        kind: "loop",
        task: "Research a question for the managing partner with web mode on, then get the sources.",
        brief: "The managing partner wants to know what a UK employer may withhold when answering a subject access request, as a short list. Do not name the requester or the firm in the prompt.",
        followUp: true,
        webMode: true,
        turns: [
          { instruction: "Send 1: the question, for the managing partner, with the constraints: UK only, current guidance, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "A short list of what may be withheld from a subject access response in the UK, with sources and dates." }, placeholder: "For the managing partner: what may a UK employer withhold when responding to a subject access request… current guidance, cite sources with dates…" },
          { instruction: "Send 2: ask for the sources as a numbered list with publisher, title and date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
        ],
        playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: reader, constraints, UK only and current, sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
      },
      {
        kind: "sources",
        task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
        prompt: "List the sources for that answer with publisher, title and date.",
        reply: "Here are the sources:\n\n1. ICO, Right of access guidance, ico.org.uk\n2. Data Protection Act 2018, Schedule 2, legislation.gov.uk\n3. Law Society, Subject Access Requests in Employment: Practice Note 2025, paragraph 7.3\n4. UK GDPR, Article 15, legislation.gov.uk\n\nI am confident in all four.",
        sources: [
          { label: "ICO, Right of access guidance, ico.org.uk", real: true, note: "The ICO publishes detailed right of access guidance." },
          { label: "Data Protection Act 2018, Schedule 2, legislation.gov.uk", real: true, note: "Schedule 2 contains the exemptions, including legal professional privilege." },
          { label: "Law Society, Subject Access Requests in Employment: Practice Note 2025, paragraph 7.3", real: false, note: "There is no such practice note. The publisher is real, the year is recent, the paragraph is specific, and it does not exist." },
          { label: "UK GDPR, Article 15, legislation.gov.uk", real: true, note: "Article 15 is the right of access." },
        ],
      },
    ],
    prove: SHARED_PROVE[7],
  },
  8: {
    dataPack: LEGAL_PACK,
    practises: [
      {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "The managing partner missed the compliance stand-up and wants a recap: what was decided, then the actions with an owner and a date each. Run the same template twice, the second time for a colleague who needs only their own actions, in a fresh chat each time.",
        material: COMPLIANCE_STANDUP,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for the managing partner. Reader, shape (decisions, then actions with owner and date), length, what to flag, and the check written into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap: decisions as bullets, actions with owner and date, under a stated length, anything blocked flagged, every owner and date from the transcript." }, placeholder: "Recap the compliance stand-up for the managing partner, who missed it: three bullets on what was decided, then actions with owner and date, under … words, flag anything blocked. Check: …" },
          { instruction: "Send 2: the same template, filled in for Jess, who was there and needs only her own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Jess's actions, with dates." }, placeholder: "Recap the compliance stand-up for Jess, who was there and needs only her own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      {
        kind: "spot",
        task: "Here is the recap a colleague's template produced. One action has a detail the transcript does not support. Tap it.",
        prompt: "Recap the compliance stand-up for the managing partner: decisions, then actions with owner and date, under 100 words.",
        sentences: [
          "Decided: accept the Brantwood liability cap at twice annual fees; the insurer has confirmed cover.",
          "Decided: hold at twelve months with no break clause; accept change of control with a sixty-day cure.",
          "Action: Rowan drafts the change-of-control wording by Wednesday; Amara sends all three positions by Thursday.",
          "Action: Jess reviews the 212 emails for the subject access request and decides what is privileged, by the 24th.",
          "Action: Jess chases the contractor NDA today, signed by Friday; Amara reviews the Nimbus DPA by the 28th.",
        ],
        errorIndex: 3,
        why: "Jess said she would flag privilege for Amara rather than decide it herself. The recap gives her a decision the transcript reserves for the compliance lead. A changed owner survives a read-through and fails a two-minute check.",
        material: COMPLIANCE_STANDUP,
      },
    ],
    prove: SHARED_PROVE[8],
  },
  9: {
    dataPack: LEGAL_PACK,
    practises: [
      {
        kind: "loop",
        task: "Turn the marked-up agreement into a one-page position note for the managing partner, inside Word, in three turns.",
        brief: "Fiona Okafor wants the firm's position on three open points by the 20th. The managing partner wants one page: each open point, the firm's position, the risk if conceded, and a recommendation with the clause number. Plain English. The draft is open in Word; Copilot has it. Three turns: ask, fix, finish. Then check it.",
        material: SERVICES_AGREEMENT,
        office: "word",
        followUp: true,
        turns: [
          { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the document.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "A one-page position note: the three open points, position, risk and recommendation with clause numbers, plain English, from the draft." }, placeholder: "For the managing partner: one page with each open point, our position, the risk if conceded and a recommendation with the clause number, under … words, from the draft…" },
          { instruction: "Turn 2: look at it as the managing partner would. Say what was wrong or narrow it.", placeholder: "The recommendations need clause numbers; cut the agreed clauses; shorter…" },
          { instruction: "Turn 3: ask it to check every clause number and figure against the document and mark anything it stated that the document does not.", placeholder: "Check every clause number and figure in the note against the document and mark anything not stated in it…" },
        ],
        playbook: { workflow: "Your real task", whenToUse: "A position note on a marked-up agreement: reader, shape, length, what to flag, from the draft; then fix, then check.", check: "Every clause number and figure traced to the document; the tool asked to mark anything the document does not say." },
      },
      {
        kind: "spot",
        task: "Here is a position note a colleague's prompt produced from the same draft. One figure is wrong. Tap the sentence.",
        prompt: "One page for the managing partner: each open point, our position, the risk, a recommendation with the clause number, under 150 words, from the draft.",
        sentences: [
          "Clause 3, break clause: Brantwood wants six months; recommend holding at twelve months with no break, since the 4% fee rise is already accepted.",
          "Clause 12, liability cap: Brantwood wants twice annual fees; the insurer confirms cover to £2,000,000, so recommend accepting.",
          "Twice annual fees would be £1,840,000, inside the insured limit.",
          "Clause 18, change of control: no response sent; recommend accepting with a sixty-day cure period.",
          "All three positions are due to their counsel by the 20th.",
        ],
        errorIndex: 2,
        why: "The document puts twice annual fees at £1,640,000, not £1,840,000. One digit, still inside the insured limit, so the recommendation reads as safe. Only a trace to clause 12 catches it.",
        material: SERVICES_AGREEMENT,
      },
    ],
    prove: [
      ...SHARED_PROVE[9],
      { kind: "choose", stem: "The note recommends accepting the liability cap. Before it goes to the managing partner, what is traced?", options: ["The clause number.", "The cap figure and the insured limit, to clause 12.", "The date."], answer: 1, why: "The recommendation rests on two figures. Both are in the document; both are traced." },
    ],
  },
};
