import type { AttachedDocument, DataPack, TrackBlock } from "@/app/ai-cleared/engine/types";
import { SHARED_PROVE } from "./general";

/* The Leadership desk for AI Fluent, modules 4 to 9: a small firm's
 * partners in the month of the quarterly review, with a board pack, an
 * investor thread, the management accounts and the partners' meeting.
 * Modules 1 to 3 run on the General desk. Every name and number is
 * invented. */

export const LEADERSHIP_PACK: DataPack = {
  facts:
    "The partners this quarter: a board pack for the quarterly review on the 15th; a term sheet from investor Halcyon Growth (contact Isla Brennan, i.brennan@halcyongrowth.example) for £750,000 at a £6,000,000 valuation; the management accounts showing revenue £1,420,000 for the quarter and cash of £312,000; an office move; a planned redundancy consultation in the print division affecting four roles; the managing partner Rowan Fletcher; the firm's accountants Whitlock & Co.",
  entities: [
    { pattern: "halcyon(\\s+growth)?", cls: "C", label: "an investor", placeholder: "[investor]" },
    { pattern: "isla\\s+brennan|brennan", cls: "C", label: "investor contact", placeholder: "[contact]" },
    { pattern: "i\\.brennan@halcyongrowth\\.example", cls: "C", label: "contact email", placeholder: "[contact email]" },
    { pattern: "£?\\s?750,?000|£?\\s?6,?000,?000|£6m|£750k", flags: "gi", cls: "C", label: "a term sheet figure", placeholder: "[figure]" },
    { pattern: "redundanc(y|ies)|consultation", flags: "gi", cls: "R", label: "a people matter not yet announced", placeholder: "[a confidential matter]" },
    { pattern: "print\\s+division", flags: "gi", cls: "R", label: "a team under consultation", placeholder: "[a team]" },
    { pattern: "rowan\\s+fletcher|fletcher", cls: "C", label: "a colleague", placeholder: "[colleague]" },
    { pattern: "whitlock(\\s*&\\s*co)?", flags: "gi", cls: "C", label: "the firm's accountants", placeholder: "[accountants]" },
  ],
  restrictedFallback: "Leave the investor's terms and anything about the consultation out; add them yourself afterwards.",
};

export const BOARD_PACK: AttachedDocument = {
  title: "Quarterly board pack, draft",
  kind: "Word document, 7 sections",
  sections: [
    { heading: "Headlines", paragraphs: [{ text: "Revenue £1,420,000 for the quarter, 6% up on last year's quarter and 2% below budget. Cash £312,000, down from £390,000, after the office move deposit and two late client payments totalling £118,000 since received. Headcount 36. Two decisions for the board: the investor term sheet and the print division." }] },
    { heading: "Sales", paragraphs: [{ text: "Closed £126,000 against a quarter target of £210,000; the largest deal, £84,000, lands next quarter. Pipeline for next quarter £234,000. Two renewals held at or near price. One small loss." }] },
    { heading: "Operations", paragraphs: [{ text: "Office move on the 28th, on budget at £4,800 removals plus £22,000 fit-out. A twelve-day fault in the invoicing export cost one service credit of £2,300 and a written apology; three process changes are in place." }] },
    { heading: "People", paragraphs: [{ text: "One new starter on the 20th. Absence 3.6 days per head for the quarter, in line with the prior year once one long-term case is excluded. The print division has lost two of its three largest customers; a consultation on four roles is proposed to begin on the 1st if the board agrees. Nothing has been communicated to the team." }] },
    { heading: "Investment", paragraphs: [{ text: "Halcyon Growth have offered £750,000 for 12.5% at a £6,000,000 post-money valuation, with a board seat and a veto on hires above £80,000. Whitlock & Co advise the valuation is fair; the veto is unusual for the stake. The partners' options: accept, negotiate the veto out, or decline and fund the move from cash." }] },
    { heading: "Risks", paragraphs: [{ text: "Cash falls to £190,000 after the move balance and the consultation costs if both proceed, before the late payments. If the largest sales deal slips a second time, next quarter misses too. The print division's remaining large customer renews in November." }] },
    { heading: "Decisions sought", paragraphs: [{ text: "One: the term sheet, accept, negotiate or decline, by the 22nd when the offer lapses. Two: whether to begin the consultation on the 1st." }] },
  ],
};

export const INVESTOR_THREAD: AttachedDocument = {
  title: "Halcyon Growth term sheet",
  kind: "Email thread, 4 messages",
  emails: [
    { from: "Isla Brennan, Halcyon Growth", subject: "Term sheet attached", time: "1st", preview: "Please find attached our term sheet: £750,000 for 12.5%, a board seat, and the hiring veto we discussed…" },
    { from: "Rowan Fletcher", subject: "RE: Term sheet attached", time: "2nd", preview: "Thank you Isla. We will take it to the board on the 15th. One early question on the hiring veto…" },
    { from: "Isla Brennan, Halcyon Growth", subject: "RE: Term sheet attached", time: "4th", preview: "The veto is standard for us at this stage. We could raise the threshold to £100,000. The offer is open until the 22nd…" },
    { from: "Whitlock & Co", subject: "Term sheet, our view", time: "8th", preview: "Valuation is fair for the sector. The veto at any threshold is unusual for a 12.5% stake; we would push for an information right instead…" },
  ],
  sections: [
    { heading: "Subject: Term sheet attached (Isla Brennan)", paragraphs: [{ text: "Please find attached our term sheet: £750,000 for 12.5% at £6,000,000 post-money, a board seat, and the hiring veto we discussed for roles above £80,000. We are excited about this. Isla." }] },
    { heading: "Subject: RE (Rowan Fletcher)", paragraphs: [{ text: "Thank you Isla. We will take it to the board on the 15th. One early question on the hiring veto: it would catch most senior hires, which is where our growth comes from. Is there flexibility?" }] },
    { heading: "Subject: RE (Isla Brennan)", paragraphs: [{ text: "The veto is standard for us at this stage. We could raise the threshold to £100,000. The offer is open until the 22nd; after that we would need to re-paper." }] },
    { heading: "Subject: Term sheet, our view (Whitlock & Co)", paragraphs: [{ text: "Valuation is fair for the sector. The veto at any threshold is unusual for a 12.5% stake; we would push for an information right and consultation on senior hires instead of a veto. The board seat is reasonable. Do not negotiate on valuation; negotiate on control." }] },
  ],
};

export const MANAGEMENT_ACCOUNTS: AttachedDocument = {
  title: "Management accounts, quarter summary",
  kind: "Spreadsheet, 8 rows",
  table: {
    columns: ["Line", "This quarter", "Budget", "Variance", "Last year", "Note"],
    rows: [
      ["Revenue", "£1,420,000", "£1,450,000", "-£30,000", "£1,340,000", "Largest deal slipped"],
      ["Cost of delivery", "£812,000", "£830,000", "£18,000", "£770,000", ""],
      ["Gross profit", "£608,000", "£620,000", "-£12,000", "£570,000", ""],
      ["Overheads", "£496,000", "£480,000", "-£16,000", "£455,000", "Move costs £26,800"],
      ["Operating profit", "£112,000", "£140,000", "-£28,000", "£115,000", ""],
      ["Cash at quarter end", "£312,000", "£360,000", "-£48,000", "£290,000", "Late receipts £118,000"],
      ["Debtors over 60 days", "£69,900", "£40,000", "-£29,900", "£52,000", ""],
      ["Headcount", "36", "37", "-1", "33", ""],
    ],
  },
  sections: [
    { heading: "Rows", paragraphs: [
      { text: "Revenue · £1,420,000 · budget £1,450,000 · variance -£30,000 · last year £1,340,000 · largest deal slipped." },
      { text: "Cost of delivery · £812,000 · budget £830,000 · +£18,000 · last year £770,000." },
      { text: "Gross profit · £608,000 · budget £620,000 · -£12,000 · last year £570,000." },
      { text: "Overheads · £496,000 · budget £480,000 · -£16,000 · last year £455,000 · includes move costs £26,800." },
      { text: "Operating profit · £112,000 · budget £140,000 · -£28,000 · last year £115,000." },
      { text: "Cash at quarter end · £312,000 · budget £360,000 · -£48,000 · last year £290,000 · late receipts £118,000 since received." },
      { text: "Debtors over 60 days · £69,900 · budget £40,000 · -£29,900 · last year £52,000." },
      { text: "Headcount · 36 · budget 37 · last year 33." },
    ] },
    { heading: "Notes", paragraphs: [{ text: "Operating margin 7.9% against a budget of 9.7% and 8.6% last year. Without the move costs, overheads would be £469,200 and operating profit £138,800." }] },
  ],
};

export const PARTNERS_MEETING: AttachedDocument = {
  title: "Partners' meeting",
  kind: "Meeting recap, Monday, 40 minutes",
  transcript: [
    { who: "Rowan Fletcher", line: "The term sheet. Whitlock say the valuation is fair and the veto is the problem. I propose we go back with an information right and consultation on hires above £100,000, no veto, and keep the board seat. If they refuse, we decline and fund the move from cash." },
    { who: "Amara Osei", line: "Agreed. Cash is tight if both the move and the consultation go ahead, but the late receipts are in now, so £430,000 not £312,000. I would rather decline than give a veto." },
    { who: "Priya Nair", line: "Agreed. On the print division: we have lost two of three large customers and the third renews in November. I think the consultation starts on the 1st. We tell the team on the 30th, in person, before anything is written." },
    { who: "Rowan Fletcher", line: "Agreed, and nothing about it in any document that leaves this room until the 30th. Amara, the consultation paperwork with the employment solicitor by the 25th. Priya, the sales forecast for the board with the £84,000 deal shown next quarter, not this." },
    { who: "Amara Osei", line: "Yes, the 25th. And the board pack: the cash line should show the receipts, with a note." },
    { who: "Rowan Fletcher", line: "I will reply to Isla by Wednesday with the counter. Board pack final by Friday. Actions: me, counter to Halcyon Wednesday, pack final Friday; Amara, consultation paperwork the 25th, cash note in the pack; Priya, sales forecast by Thursday, team announcement with me on the 30th." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "Term sheet: counter with an information right and consultation on hires above £100,000 in place of the veto, board seat kept; decline if refused. Consultation begins on the 1st; the team is told in person on the 30th; nothing in writing before then. Cash line in the pack updated for the late receipts. Counter to the investor by Wednesday; pack final Friday; consultation paperwork by the 25th; sales forecast by Thursday." }] },
  ],
};

export const LEADERSHIP_BLOCKS: Record<number, TrackBlock> = {
  4: {
    dataPack: LEADERSHIP_PACK,
    practise: {
      kind: "loop",
      task: "Summarise the board pack for a non-executive director, inside Word, then find out what the summary left out.",
      brief: "The new non-executive has five minutes before the board call and has not seen the business before. She needs the two decisions, the numbers that bear on each, and the risks. Nothing on operations. The pack is open in Word; Copilot has it.",
      material: BOARD_PACK,
      office: "word",
      followUp: true,
      turns: [
        { instruction: "Send 1: ask for the summary. Reader, length, shape, what to flag, what to leave out, from the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary for a new non-executive: the two decisions first, the figures that bear on each, the risks, under a stated length, nothing on operations." }, placeholder: "For a new non-executive director, under … words, lead with the two decisions and the numbers behind each…" },
        { instruction: "Send 2: ask what it left out, and whether any figure in the summary is not in the pack.", placeholder: "What did you leave out? Which figures are not stated in the pack?" },
      ],
      playbook: { workflow: "Summarise", whenToUse: "A board pack a director needs in minutes: the decisions, the numbers behind each, the risks; drop the operational detail.", check: "Ask what was left out, and check every figure against the pack." },
    },
    prove: SHARED_PROVE[4],
  },
  5: {
    dataPack: LEADERSHIP_PACK,
    practise: {
      kind: "loop",
      task: "Draft the counter to the investor inside Outlook, then fix its tone in one turn.",
      brief: "The partners' counter: keep the valuation and the board seat, replace the veto with an information right and consultation on hires above £100,000. You want to say so warmly and plainly, give no reasons beyond the one sentence about where growth comes from, and not mention the accountants or the option of declining. Reply as Rowan.",
      material: INVESTOR_THREAD,
      office: "outlook",
      followUp: true,
      turns: [
        { instruction: "Send 1: brief Copilot. From whom and to whom, the one thing the reply must achieve, the tone, the length, anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A warm, short counter that accepts valuation and board seat, proposes the information right and consultation in place of the veto, and mentions neither the accountants nor declining." }, placeholder: "Reply as Rowan to Isla… the one thing it must do is replace the veto with… do not mention our advisers or that we might decline…" },
        { instruction: "Send 2: fix the tone or the length in one line.", placeholder: "Warmer opening, and cut the paragraph about the board…" },
      ],
      playbook: { workflow: "Draft", whenToUse: "Any reply with one job: from whom and to whom, the one thing, the voice, the length, what not to reveal.", check: "Read it as the investor would; check every figure and term against the thread and the partners' decision." },
    },
    prove: SHARED_PROVE[5],
  },
  6: {
    dataPack: LEADERSHIP_PACK,
    practises: [
      {
        kind: "spot",
        task: "Read Copilot's reply about the management accounts. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what these accounts say about the quarter",
        sentences: [
          "Revenue of £1,420,000 was £30,000 below budget and 6% up on last year, because the largest deal slipped.",
          "Operating profit of £112,000 was £28,000 below budget, with overheads £16,000 over, including £26,800 of move costs.",
          "Cash at quarter end was £312,000, £48,000 below budget, before £118,000 of late receipts since received.",
          "Debtors over 60 days are £69,900 against a budget of £40,000.",
          "The operating margin of 7.9% is the lowest the firm has recorded in three years.",
        ],
        errorIndex: 4,
        why: "The sheet has this quarter, budget and last year. Three years are not in it. The margin is right; the comparison is invented. A true figure attached to a claim the source cannot support.",
        material: MANAGEMENT_ACCOUNTS,
      },
      {
        kind: "loop",
        task: "Now ask the accounts the question that would have caught that guess, inside Excel.",
        brief: "The partners want to know, from the sheet alone, what operating profit and margin would have been without the move costs, and what cash is once the late receipts are added. Ask for the figures and the workings from named columns, and ask Copilot to mark anything not in the sheet.",
        material: MANAGEMENT_ACCOUNTS,
        office: "excel",
        followUp: false,
        turns: [
          { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "Operating profit and margin excluding the move costs, and cash including the late receipts, from the This quarter column and the Note column, with the arithmetic shown." }, placeholder: "From the This quarter and Note columns, what are operating profit and margin without the move costs, and cash with the late receipts added? Show the arithmetic and mark anything…" },
        ],
        playbook: { workflow: "Analyse", whenToUse: "Any question of the accounts: ask the question, name the columns, ask for the workings, ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from." },
      },
    ],
    prove: SHARED_PROVE[6],
  },
  7: {
    dataPack: LEADERSHIP_PACK,
    practises: [
      {
        kind: "loop",
        task: "Research a question for the partners with web mode on, then get the sources.",
        brief: "The partners want to know what a UK employer must do before making fewer than twenty roles redundant, as a short checklist with timings. Do not name the firm, the division or any person in the prompt.",
        followUp: true,
        webMode: true,
        turns: [
          { instruction: "Send 1: the question, for the partners, with the constraints: UK only, current guidance, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "A short checklist of an employer's duties for a small redundancy exercise in the UK, with timings, sources and dates." }, placeholder: "For the partners: what must a UK employer do before making fewer than twenty roles redundant, with timings… current guidance, cite sources with dates…" },
          { instruction: "Send 2: ask for the sources as a numbered list with publisher, title and date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
        ],
        playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: reader, constraints, UK only and current, sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
      },
      {
        kind: "sources",
        task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
        prompt: "List the sources for that answer with publisher, title and date.",
        reply: "Here are the sources:\n\n1. GOV.UK, Making staff redundant\n2. Acas, Managing staff redundancies\n3. Employment Rights Act 1996, legislation.gov.uk\n4. Institute of Directors, Small Redundancy Consultation Protocol 2025, step 4\n\nI am confident in all four.",
        sources: [
          { label: "GOV.UK, Making staff redundant", real: true, note: "GOV.UK has an employer guide by this name." },
          { label: "Acas, Managing staff redundancies", real: true, note: "Acas publishes redundancy guidance for employers." },
          { label: "Employment Rights Act 1996, legislation.gov.uk", real: true, note: "The Act is on legislation.gov.uk; Part 11 covers redundancy." },
          { label: "Institute of Directors, Small Redundancy Consultation Protocol 2025, step 4", real: false, note: "There is no such protocol. The publisher is real, the year is recent, the step is specific, and it does not exist." },
        ],
      },
    ],
    prove: SHARED_PROVE[7],
  },
  8: {
    dataPack: LEADERSHIP_PACK,
    practises: [
      {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "A partner who was abroad missed the partners' meeting and wants a recap: what was decided, then the actions with an owner and a date each. The consultation stays out of anything written until the 30th. Run the same template twice, the second time for a colleague who needs only their own actions, in a fresh chat each time.",
        material: PARTNERS_MEETING,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for the absent partner. Reader, shape (decisions, then actions with owner and date), length, what to flag, what to leave out, and the check written into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap: decisions as bullets, actions with owner and date, under a stated length, the consultation left out, every owner and date from the transcript." }, placeholder: "Recap the partners' meeting for a partner who missed it: three bullets on what was decided, then actions with owner and date, under … words, leave out the people matter. Check: …" },
          { instruction: "Send 2: the same template, filled in for Priya, who was there and needs only her own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Priya's actions, with dates." }, placeholder: "Recap the partners' meeting for Priya, who was there and needs only her own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check and what to leave out into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      {
        kind: "spot",
        task: "Here is the recap a colleague's template produced. One action has a detail the transcript does not support. Tap it.",
        prompt: "Recap the partners' meeting for a partner who missed it: decisions, then actions with owner and date, under 100 words.",
        sentences: [
          "Decided: counter the term sheet with an information right and consultation on hires above £100,000 in place of the veto; keep the valuation and the board seat.",
          "Decided: if the investor refuses, decline and fund the move from cash, which stands at £430,000 with the late receipts in.",
          "Action: Rowan sends the counter to the investor by Wednesday and finalises the board pack by Friday.",
          "Action: Amara updates the cash line in the pack and sends the counter to the investor's lawyers by the 25th.",
          "Action: Priya sends the sales forecast by Thursday with the £84,000 deal shown next quarter.",
        ],
        errorIndex: 3,
        why: "Amara's 25th deadline is the consultation paperwork with the employment solicitor, which the recap was told to leave out. The tool kept the date and the owner and invented a different task to fill the gap. A constraint honoured by relabelling is a false recap.",
        material: PARTNERS_MEETING,
      },
    ],
    prove: SHARED_PROVE[8],
  },
  9: {
    dataPack: LEADERSHIP_PACK,
    practises: [
      {
        kind: "loop",
        task: "Turn the draft board pack into the one-page cover note for the board, inside Word, in three turns.",
        brief: "The board gets one page on top of the pack: the two decisions with the partners' recommendation on each, the three numbers that matter with the late receipts reflected, and the one risk the board should hold. Plain English, nothing on operations, and the people matter described only as \"a proposed consultation\" with no team or numbers. The pack is open in Word; Copilot has it. Three turns: ask, fix, finish. Then check it.",
        material: BOARD_PACK,
        office: "word",
        followUp: true,
        turns: [
          { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the pack.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "A one-page cover note: two decisions with recommendations, three figures with receipts reflected, one risk, plain English, nothing operational, the consultation unnamed, from the pack." }, placeholder: "For the board: one page with the two decisions and our recommendation on each, the three numbers that matter with the late receipts reflected, and the one risk to hold, under … words, nothing on operations, the people matter only as a proposed consultation, from the pack…" },
          { instruction: "Turn 2: look at it as a board member would. Say what was wrong or narrow it.", placeholder: "The recommendations must be explicit; the cash figure needs the receipts; cut the sales detail…" },
          { instruction: "Turn 3: ask it to check every figure and date against the pack and mark anything it stated that the pack does not.", placeholder: "Check every figure and date in the note against the pack and mark anything not stated in it…" },
        ],
        playbook: { workflow: "Your real task", whenToUse: "A board cover note from a pack: reader, shape, length, what to leave out, from the pack; then fix, then check.", check: "Every figure and date traced to the pack; nothing restricted named; the tool asked to mark anything the pack does not say." },
      },
      {
        kind: "spot",
        task: "Here is a cover note a colleague's prompt produced from the same pack. One figure is wrong. Tap the sentence.",
        prompt: "One page for the board: the two decisions with recommendations, the three numbers that matter, the one risk, under 150 words, from the pack.",
        sentences: [
          "Decision one: the Halcyon term sheet, £750,000 for 12.5% at £6,000,000 post-money; we recommend countering on the hiring veto and accepting otherwise, before the offer lapses on the 22nd.",
          "Decision two: whether a proposed consultation begins on the 1st; we recommend it does.",
          "The numbers: revenue £1,420,000, 2% below budget and 6% up on last year; operating profit £112,000; cash £312,000 at quarter end, £430,000 with late receipts since received.",
          "The risk to hold: if the largest sales deal, £84,000, slips a second time, next quarter misses as well.",
          "Cash falls to £150,000 after the move balance and the consultation costs if both proceed, before the late payments.",
        ],
        errorIndex: 4,
        why: "The pack says £190,000, not £150,000. A board would read a £40,000 worse cash position than the one the partners actually face, on the page that frames both decisions. Trace every figure to the pack.",
        material: BOARD_PACK,
      },
    ],
    prove: [
      ...SHARED_PROVE[9],
      { kind: "choose", stem: "The cover note names the print division and the four roles. What happens?", options: ["Leave it; the board needs the detail.", "Take it out: the brief said \"a proposed consultation\" only, and the partners decided nothing is written before the team is told.", "Put it in an appendix."], answer: 1, why: "The brief's constraint and the partners' decision both say out. The detail is in the pack for the meeting; the cover note is the page most likely to be forwarded." },
    ],
  },
};
