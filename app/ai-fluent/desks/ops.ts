import type { AttachedDocument, DataPack, TrackBlock } from "@/app/ai-cleared/engine/types";
import { SHARED_PROVE } from "./general";

/* The Operations and admin desk for AI Fluent, modules 4 to 9: a small
 * firm's operations team with an office move, a supplier dispute, a
 * delivery log and the weekly ops meeting. Modules 1 to 3 run on the
 * General desk. Every name, firm and number is invented. */

export const OPS_PACK: DataPack = {
  facts:
    "Operations this month: the office move to 22 Granary Square on the 28th (removals firm Lomax Removals, contact Pete Lomax, 07700 900231, quote £4,800); a dispute with cleaning contractor BrightSpace over missed visits, invoice BS-1177 for £1,260; the delivery log for the Oakshott client day; a fire risk assessment due by the 15th; the operations manager Tom Ashworth; the alarm code for the new office 4471.",
  entities: [
    { pattern: "22\\s+granary\\s+square|granary\\s+square", flags: "gi", cls: "C", label: "the new office address", placeholder: "[new address]" },
    { pattern: "lomax(\\s+removals)?|pete\\s+lomax", flags: "gi", cls: "C", label: "removals firm", placeholder: "[removals firm]" },
    { pattern: "07700\\s?900\\s?231", cls: "C", label: "a contact phone", placeholder: "[contact phone]" },
    { pattern: "brightspace", flags: "gi", cls: "C", label: "a contractor", placeholder: "[contractor]" },
    { pattern: "BS-?1177", flags: "gi", cls: "I", label: "an invoice reference", placeholder: "[invoice]" },
    { pattern: "oakshott(\\s+partners)?", cls: "C", label: "client name", placeholder: "[client]" },
    { pattern: "tom\\s+ashworth|ashworth", cls: "C", label: "a colleague", placeholder: "[colleague]" },
    { pattern: "alarm\\s+code|\\b4471\\b", flags: "gi", cls: "R", label: "an alarm code", placeholder: "" },
  ],
  restrictedFallback: "Leave the alarm code and the contact numbers out; add them yourself afterwards.",
};

export const MOVE_PLAN: AttachedDocument = {
  title: "Office move plan, 22 Granary Square",
  kind: "Word document, 6 sections",
  sections: [
    { heading: "Dates", paragraphs: [{ text: "Keys to the new office on the 21st. Fit-out complete by the 25th. Move on Saturday the 28th. First working day in the new office Monday the 30th. Old lease ends on the 31st; the old office must be cleared and cleaned by then." }] },
    { heading: "Removals", paragraphs: [{ text: "Lomax Removals quoted £4,800 for the move, including crates delivered on the 24th and collected on the 2nd. The quote assumes 36 desks and the server rack; the rack must be moved by the IT contractor separately, which Lomax have confirmed in writing. Deposit of £1,200 paid; balance on the day." }] },
    { heading: "IT and phones", paragraphs: [{ text: "Internet line at the new office goes live on the 23rd, confirmed by the provider. The phone system moves on the 28th with the rack. Wi-Fi to be tested on the 26th. Staff laptops travel with staff, not in crates." }] },
    { heading: "Fit-out", paragraphs: [{ text: "Desks and chairs delivered on the 22nd. Meeting room glazing on the 24th. Signage not yet ordered. The kitchen is complete. Accessible toilet handrail on order, due the 27th." }] },
    { heading: "Risks", paragraphs: [{ text: "If the internet line slips past the 26th, the first working day moves to the 1st. If the handrail misses the 27th, the accessible toilet is not usable on day one. Signage lead time is ten days, so it must be ordered by the 18th. The fire risk assessment for the new office is due by the 15th and is not yet booked." }] },
    { heading: "Owners", paragraphs: [{ text: "Move overall: Tom Ashworth. IT: Dev Patel. Fit-out and signage: Sam Kerrigan. Fire risk assessment: Tom. Old office clearance: Sam." }] },
  ],
};

export const CLEANING_THREAD: AttachedDocument = {
  title: "BrightSpace invoice BS-1177, missed visits",
  kind: "Email thread, 4 messages",
  emails: [
    { from: "BrightSpace Accounts", subject: "Invoice BS-1177 overdue", time: "Mon", preview: "Invoice BS-1177 for £1,260 is now 14 days overdue. Please arrange payment or contact us…" },
    { from: "Tom Ashworth", subject: "RE: Invoice BS-1177 overdue", time: "Mon", preview: "We are holding this invoice. The sign-in log shows four of the twelve scheduled visits in the month were missed…" },
    { from: "BrightSpace Accounts", subject: "RE: Invoice BS-1177 overdue", time: "Tue", preview: "Our operative reports attending all twelve. We can offer a goodwill credit of £105 for one visit…" },
    { from: "Tom Ashworth", subject: "RE: Invoice BS-1177 overdue", time: "Wed", preview: "Attaching the sign-in log and the door access report for the four dates. Each visit is £105 so we propose…" },
  ],
  sections: [
    { heading: "Subject: Invoice BS-1177 overdue (BrightSpace)", paragraphs: [{ text: "Invoice BS-1177 for £1,260 is now 14 days overdue. Please arrange payment or contact us to discuss." }] },
    { heading: "Subject: RE (Tom Ashworth)", paragraphs: [{ text: "We are holding this invoice. The building sign-in log shows four of the twelve scheduled visits in the month were missed: the 3rd, the 10th, the 17th and the 24th, all Thursdays. We will pay for the eight visits that took place." }] },
    { heading: "Subject: RE (BrightSpace)", paragraphs: [{ text: "Our operative reports attending all twelve visits. As a gesture we can offer a goodwill credit of £105 for one visit. The balance of £1,155 remains due." }] },
    { heading: "Subject: RE (Tom Ashworth)", paragraphs: [{ text: "Attaching the sign-in log and the door access report for the four dates; neither shows any entry. Each visit is £105, so we propose a credit of £420 and payment of £840 within seven days of a revised invoice. We would like to keep the contract if the Thursday visits are reinstated." }] },
  ],
};

export const DELIVERY_LOG: AttachedDocument = {
  title: "Client day deliveries",
  kind: "Spreadsheet, 7 rows",
  table: {
    columns: ["Item", "Supplier", "Due", "Arrived", "Qty ordered", "Qty received", "Status"],
    rows: [
      ["Brochures", "Ashgrove Print", "22nd", "22nd", "5,000", "5,000", "Complete"],
      ["Name badges", "Ashgrove Print", "22nd", "22nd", "60", "60", "Complete"],
      ["Banner stands", "Ashgrove Print", "22nd", "23rd", "3", "2", "Short"],
      ["Catering", "Thornfield Hall", "24th", "24th", "60 covers", "60 covers", "Complete"],
      ["AV hire", "Stagecraft Hire", "23rd", "23rd", "1 kit", "1 kit", "Complete"],
      ["Chairs, extra", "Thornfield Hall", "23rd", "Not arrived", "20", "0", "Outstanding"],
      ["Gift bags", "Penrose Office Supplies", "21st", "21st", "60", "58", "Short"],
    ],
  },
  sections: [
    { heading: "Rows", paragraphs: [
      { text: "Brochures · Ashgrove Print · due 22nd · arrived 22nd · 5,000 of 5,000 · complete." },
      { text: "Name badges · Ashgrove Print · 22nd · 22nd · 60 of 60 · complete." },
      { text: "Banner stands · Ashgrove Print · due 22nd · arrived 23rd · 2 of 3 · short." },
      { text: "Catering · Thornfield Hall · 24th · 24th · 60 covers · complete." },
      { text: "AV hire · Stagecraft Hire · 23rd · 23rd · 1 kit · complete." },
      { text: "Chairs, extra · Thornfield Hall · due 23rd · not arrived · 0 of 20 · outstanding." },
      { text: "Gift bags · Penrose Office Supplies · 21st · 21st · 58 of 60 · short." },
    ] },
    { heading: "Notes", paragraphs: [{ text: "Seven lines. Four complete, two short, one outstanding. One delivery arrived a day late. The event is on the 24th." }] },
  ],
};

export const OPS_MEETING: AttachedDocument = {
  title: "Weekly ops meeting",
  kind: "Meeting recap, Monday, 25 minutes",
  transcript: [
    { who: "Tom Ashworth", line: "The move. Keys on the 21st, Lomax on the 28th. The internet line is confirmed for the 23rd. Signage has not been ordered and the lead time is ten days, so it has to go today or tomorrow." },
    { who: "Sam Kerrigan", line: "I will order it today. The handrail is due the 27th; I have asked for a tracking reference. Desks are on the 22nd." },
    { who: "Tom Ashworth", line: "Fire risk assessment: I have booked the assessor for the 14th, so we are inside the deadline. Dev, Wi-Fi test on the 26th?" },
    { who: "Dev Patel", line: "Yes, the 26th. The rack moves on the 28th with the IT contractor, not Lomax. Phones go with the rack." },
    { who: "Tom Ashworth", line: "BrightSpace. I have proposed a £420 credit and £840 on a revised invoice. If they refuse by Friday we pay the £840 anyway and give notice. Nobody pays the £1,260." },
    { who: "Sam Kerrigan", line: "The client day: two banner stands of three arrived, the third is promised for Wednesday. The twenty extra chairs are still outstanding; Thornfield say Thursday morning, the day of." },
    { who: "Tom Ashworth", line: "Actions: Sam, signage ordered today, handrail tracking, chairs chased with a fallback of hiring twenty elsewhere by Wednesday; Dev, Wi-Fi test the 26th; me, BrightSpace decision Friday and the assessor on the 14th." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "Signage ordered today for the ten-day lead time. Fire risk assessor booked for the 14th. Wi-Fi test on the 26th; rack and phones move on the 28th with the IT contractor. BrightSpace: £420 credit proposed, £840 paid either way, notice if they refuse by Friday. Client day: third banner stand due Wednesday; twenty chairs outstanding with a hire fallback decided by Wednesday." }] },
  ],
};

export const OPS_BLOCKS: Record<number, TrackBlock> = {
  4: {
    dataPack: OPS_PACK,
    practise: {
      kind: "loop",
      task: "Summarise the move plan for the managing partner, inside Word, then find out what the summary left out.",
      brief: "The managing partner has five minutes. They need the dates that matter, what is at risk, and who owns each risk. Nothing about the fit-out detail. The plan is open in Word; Copilot has it.",
      material: MOVE_PLAN,
      office: "word",
      followUp: true,
      turns: [
        { instruction: "Send 1: ask for the summary. Reader, length, shape, what to flag, what to leave out, from the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary for the managing partner: key dates, the risks with owners, under a stated length, no fit-out detail." }, placeholder: "For the managing partner, under … words, lead with the dates and the risks, each with an owner…" },
        { instruction: "Send 2: ask what it left out, and whether any date in the summary is not in the plan.", placeholder: "What did you leave out? Which dates are not stated in the plan?" },
      ],
      playbook: { workflow: "Summarise", whenToUse: "A project plan a decision-maker needs in minutes: dates, risks, owners; drop the detail.", check: "Ask what was left out, and check every date against the plan." },
    },
    prove: SHARED_PROVE[4],
  },
  5: {
    dataPack: OPS_PACK,
    practise: {
      kind: "loop",
      task: "Draft the reply to BrightSpace inside Outlook, then fix its tone in one turn.",
      brief: "You have sent the evidence. You want to restate the proposal once, £420 credit and £840 within seven days of a revised invoice, say the Thursday visits must be reinstated to keep the contract, and set Friday as the date for their answer. Firm, not hostile. Reply as Tom.",
      material: CLEANING_THREAD,
      office: "outlook",
      followUp: true,
      turns: [
        { instruction: "Send 1: brief Copilot. From whom and to whom, the one thing the reply must achieve, the tone, the length, anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A firm, short reply that restates the £420 credit and £840 proposal, requires the visits reinstated, sets Friday, and does not threaten or apologise." }, placeholder: "Reply as Tom to BrightSpace accounts… the one thing it must do is get an answer by Friday on the proposal… do not threaten…" },
        { instruction: "Send 2: fix the tone or the length in one line.", placeholder: "Firmer, and cut the paragraph restating the evidence…" },
      ],
      playbook: { workflow: "Draft", whenToUse: "Any reply with one job: from whom and to whom, the one thing, the voice, the length, what not to do.", check: "Read it as the supplier would; check every figure and date against the thread." },
    },
    prove: SHARED_PROVE[5],
  },
  6: {
    dataPack: OPS_PACK,
    practises: [
      {
        kind: "spot",
        task: "Read Copilot's reply about the delivery log. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what this log says about the client day deliveries",
        sentences: [
          "Seven deliveries are logged for the event on the 24th: four complete, two short and one outstanding.",
          "The banner stands arrived a day late and one of three is missing.",
          "The gift bags arrived on time but two short of the sixty ordered.",
          "The twenty extra chairs have not arrived and are due to be delivered on the morning of the event.",
          "Brochures, badges, catering and AV hire are all complete.",
        ],
        errorIndex: 3,
        why: "The log says the chairs have not arrived and nothing else. The morning-of promise came from a phone call recorded in the meeting, not from the sheet. The tool supplied a reassurance the source does not contain.",
        material: DELIVERY_LOG,
      },
      {
        kind: "loop",
        task: "Now ask the log the question that would have caught that guess, inside Excel.",
        brief: "Tom wants to know, from the sheet alone, which lines are not complete and the total shortfall in quantity by supplier. Ask for the figures and the workings from named columns, and ask Copilot to mark anything not in the sheet.",
        material: DELIVERY_LOG,
        office: "excel",
        followUp: false,
        turns: [
          { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "Lines not complete by the Status column, and the shortfall from Qty ordered minus Qty received grouped by Supplier, with the arithmetic shown." }, placeholder: "From the Status, Qty ordered, Qty received and Supplier columns, which lines are not complete and what is the shortfall by supplier? Show the arithmetic and mark anything…" },
        ],
        playbook: { workflow: "Analyse", whenToUse: "Any question of a log: ask the question, name the columns, ask for the workings, ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from." },
      },
    ],
    prove: SHARED_PROVE[6],
  },
  7: {
    dataPack: OPS_PACK,
    practises: [
      {
        kind: "loop",
        task: "Research a question for the managing partner with web mode on, then get the sources.",
        brief: "The managing partner wants to know what a UK employer must do about fire safety when moving into a new office, as a short checklist. Do not name the address or the firm in the prompt.",
        followUp: true,
        webMode: true,
        turns: [
          { instruction: "Send 1: the question, for the managing partner, with the constraints: UK only, current guidance, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "A short checklist of fire safety duties for an employer moving into new premises in the UK, with sources and dates." }, placeholder: "For the managing partner: what must a UK employer do about fire safety when moving into a new office… current guidance, cite sources with dates…" },
          { instruction: "Send 2: ask for the sources as a numbered list with publisher, title and date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
        ],
        playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: reader, constraints, UK only and current, sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
      },
      {
        kind: "sources",
        task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
        prompt: "List the sources for that answer with publisher, title and date.",
        reply: "Here are the sources:\n\n1. Regulatory Reform (Fire Safety) Order 2005, legislation.gov.uk\n2. GOV.UK, Fire safety in the workplace\n3. Health and Safety Executive, Workplace Relocation Safety Standard 2025, section 5\n4. GOV.UK, Fire safety risk assessment: offices and shops\n\nI am confident in all four.",
        sources: [
          { label: "Regulatory Reform (Fire Safety) Order 2005, legislation.gov.uk", real: true, note: "The Fire Safety Order is the law for non-domestic premises in England and Wales." },
          { label: "GOV.UK, Fire safety in the workplace", real: true, note: "GOV.UK has a guidance page by this name." },
          { label: "Health and Safety Executive, Workplace Relocation Safety Standard 2025, section 5", real: false, note: "There is no such standard. The publisher is real, the year is recent, the section is specific, and it does not exist." },
          { label: "GOV.UK, Fire safety risk assessment: offices and shops", real: true, note: "A published guide to fire risk assessment for offices and shops." },
        ],
      },
    ],
    prove: SHARED_PROVE[7],
  },
  8: {
    dataPack: OPS_PACK,
    practises: [
      {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "The managing partner missed the ops meeting and wants a recap: what was decided, then the actions with an owner and a date each. Run the same template twice, the second time for a colleague who needs only their own actions, in a fresh chat each time.",
        material: OPS_MEETING,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for the managing partner. Reader, shape (decisions, then actions with owner and date), length, what to flag, and the check written into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap: decisions as bullets, actions with owner and date, under a stated length, anything at risk flagged, every owner and date from the transcript." }, placeholder: "Recap the ops meeting for the managing partner, who missed it: three bullets on what was decided, then actions with owner and date, under … words, flag anything at risk. Check: …" },
          { instruction: "Send 2: the same template, filled in for Sam, who was there and needs only their own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Sam's actions, with dates." }, placeholder: "Recap the ops meeting for Sam, who was there and needs only their own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      {
        kind: "spot",
        task: "Here is the recap a colleague's template produced. One action has a detail the transcript does not support. Tap it.",
        prompt: "Recap the ops meeting for the managing partner: decisions, then actions with owner and date, under 100 words.",
        sentences: [
          "Decided: BrightSpace are paid £840 whichever way they answer; notice is given if they refuse the credit by Friday.",
          "Decided: the rack and phones move on the 28th with the IT contractor, not the removals firm.",
          "Action: Sam orders the signage today and gets a tracking reference for the handrail.",
          "Action: Sam chases the chairs, with a fallback of hiring twenty elsewhere decided by Wednesday.",
          "Action: Tom has booked the fire risk assessor for the 16th, inside the deadline.",
        ],
        errorIndex: 4,
        why: "The assessor is booked for the 14th; the deadline is the 15th. The recap's date is after the deadline and still says \"inside\". A wrong date and a false reassurance in one sentence; trace every date to the transcript.",
        material: OPS_MEETING,
      },
    ],
    prove: SHARED_PROVE[8],
  },
  9: {
    dataPack: OPS_PACK,
    practises: [
      {
        kind: "loop",
        task: "Turn the move plan into the one-page briefing that goes to all staff, inside Word, in three turns.",
        brief: "Every member of staff needs one page: what happens when, what they must do, what they must not do, and who to ask. Plain, friendly, no alarm code, no supplier names or prices. The plan is open in Word; Copilot has it. Three turns: ask, fix, finish. Then check it.",
        material: MOVE_PLAN,
        office: "word",
        followUp: true,
        turns: [
          { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the plan.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "A one-page staff briefing: dates, what staff do and do not do, who to ask, no code or supplier detail, from the plan." }, placeholder: "For all staff: one page with the dates, what each person must do (laptops travel with you, crates by the 24th), what not to do, and who to ask, under … words, no supplier names or prices, from the plan…" },
          { instruction: "Turn 2: look at it as a new starter would. Say what was wrong or narrow it.", placeholder: "Too much about IT; the crate dates must be exact; add who to ask on the day…" },
          { instruction: "Turn 3: ask it to check every date against the plan and mark anything it stated that the plan does not.", placeholder: "Check every date in the briefing against the plan and mark anything not stated in it…" },
        ],
        playbook: { workflow: "Your real task", whenToUse: "A staff briefing from a project plan: reader, shape, length, what to leave out, from the plan; then fix, then check.", check: "Every date traced to the plan; nothing restricted on the page; the tool asked to mark anything the plan does not say." },
      },
      {
        kind: "spot",
        task: "Here is a staff briefing a colleague's prompt produced from the same plan. One date is wrong. Tap the sentence.",
        prompt: "One page for all staff: the dates, what to do, what not to do, who to ask, under 150 words, from the plan.",
        sentences: [
          "We move on Saturday the 28th and work from the new office from Monday the 30th.",
          "Crates arrive on the 24th; pack your desk by Friday the 27th and label every crate with your name and team.",
          "Take your laptop with you; laptops do not go in crates.",
          "The old office must be cleared by the 31st, so nothing is left behind after the move.",
          "Crates are collected on the 5th, so unpack by then; ask Tom about the move and Sam about desks and signage.",
        ],
        errorIndex: 4,
        why: "The plan says crates are collected on the 2nd, not the 5th. Staff would plan to unpack over three extra days that do not exist, and the removals firm would arrive to find full crates. Trace every date in a briefing to the plan.",
        material: MOVE_PLAN,
      },
    ],
    prove: [
      ...SHARED_PROVE[9],
      { kind: "choose", stem: "The briefing helpfully includes the new office's alarm code. What happens?", options: ["Leave it; staff need it.", "Take it out: the brief said no alarm code, and a code is given in person, not on a page sent to everyone.", "Put it in a footnote."], answer: 1, why: "A constraint in the brief and a restricted item in the firm's data rules. The check catches it before it leaves." },
    ],
  },
};
