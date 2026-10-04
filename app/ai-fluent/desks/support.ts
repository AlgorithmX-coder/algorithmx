import type { AttachedDocument, DataPack, TrackBlock } from "@/app/ai-cleared/engine/types";
import { SHARED_PROVE } from "./general";

/* The Customer support desk for AI Fluent, modules 4 to 9: a small
 * firm's support team with an escalated complaint, a ticket export, a
 * refund query and the weekly queue review. Modules 1 to 3 run on the
 * General desk. Every name, firm and number is invented. */

export const SUPPORT_PACK: DataPack = {
  facts:
    "Support this week: an escalated complaint from Corvid Media (contact Elena Voss, e.voss@corvidmedia.example, ticket T-30914) about a four-day outage; a refund request from a customer, Greg Tanaka, for £340; the escalation queue owned by Omar Haddad; a known fault in the invoicing export, reference INC-2210, fixed in Tuesday's release; the support lead Sam Kerrigan; the firm's service level: first response within four working hours, resolution target two working days.",
  entities: [
    { pattern: "corvid(\\s+media)?", cls: "C", label: "customer name", placeholder: "[customer]" },
    { pattern: "elena\\s+voss|\\bvoss\\b", cls: "C", label: "customer contact", placeholder: "[contact]" },
    { pattern: "e\\.voss@corvidmedia\\.example", cls: "C", label: "contact email", placeholder: "[contact email]" },
    { pattern: "T-?30914", flags: "gi", cls: "I", label: "a ticket reference", placeholder: "[ticket]" },
    { pattern: "greg\\s+tanaka|tanaka", cls: "R", label: "a customer", placeholder: "[customer]" },
    { pattern: "£?\\s?340(\\.00)?", flags: "g", cls: "C", label: "a refund amount", placeholder: "[amount]" },
    { pattern: "omar\\s+haddad|haddad", cls: "C", label: "a colleague", placeholder: "[colleague]" },
    { pattern: "INC-?2210", flags: "gi", cls: "I", label: "an incident reference", placeholder: "[incident]" },
    { pattern: "sam\\s+kerrigan|kerrigan", cls: "C", label: "a colleague", placeholder: "[colleague]" },
  ],
  restrictedFallback: "Leave the customer names out; add them yourself afterwards.",
};

export const COMPLAINT_FILE: AttachedDocument = {
  title: "Escalated complaint, T-30914",
  kind: "Word document, ticket history, 5 sections",
  sections: [
    { heading: "Summary", paragraphs: [{ text: "Corvid Media reported on Monday the 9th that their invoicing export produced blank files. The fault was INC-2210, known since the 5th and fixed in the release on Tuesday the 17th. Corvid were without the export for four working days before a workaround was given and eight working days before the fix. They are asking for a service credit and a written explanation." }] },
    { heading: "Timeline", paragraphs: [{ text: "9th, 10:12: ticket raised. 9th, 15:40: first response, within the four-hour target. 10th: linked to INC-2210; customer told a fix was in progress, no date given. 13th: workaround (manual export) sent after the customer chased twice. 17th: fix released. 18th: customer confirmed working; complaint escalated to the support lead." }] },
    { heading: "What went wrong", paragraphs: [{ text: "The workaround existed on the 10th and was not sent until the 13th. The customer was not told the expected fix date. Two chasers went unanswered for a day each. The first response and the final fix were inside targets; the gap in between was not managed." }] },
    { heading: "Customer's ask", paragraphs: [{ text: "A service credit for the period without the export, a written explanation, and a named contact for future incidents. Elena Voss has said the relationship is at risk." }] },
    { heading: "Options", paragraphs: [{ text: "Service credit of one month's fee, £2,300, is within the support lead's authority; anything more needs a partner. A named contact can be offered now. The written explanation should state the dates, what went wrong, and what changes: workarounds sent on the day they exist, and an expected fix date on every linked ticket." }] },
  ],
};

export const REFUND_THREAD: AttachedDocument = {
  title: "Refund request, G. Tanaka",
  kind: "Email thread, 4 messages",
  emails: [
    { from: "Greg Tanaka", subject: "Refund for the training day", time: "Mon", preview: "I booked the training day for the 14th and could not attend due to a family emergency. I would like a refund of £340…" },
    { from: "Support", subject: "RE: Refund for the training day", time: "Mon", preview: "Sorry to hear that. Our terms allow a transfer to a later date; refunds are at the firm's discretion within 14 days of…" },
    { from: "Greg Tanaka", subject: "RE: Refund for the training day", time: "Tue", preview: "I understand, but I do not know when I could attend. A credit note would be acceptable if a refund is not…" },
    { from: "Sam Kerrigan", subject: "FW: Refund, decision", time: "Wed", preview: "Offer a full credit note valid twelve months, or a transfer to any date. No cash refund; booked 20 days ago…" },
  ],
  sections: [
    { heading: "Subject: Refund for the training day (Greg Tanaka)", paragraphs: [{ text: "I booked the training day for the 14th and could not attend due to a family emergency. I would like a refund of £340. Greg." }] },
    { heading: "Subject: RE (Support)", paragraphs: [{ text: "Sorry to hear that. Our terms allow a transfer to a later date at no cost; refunds are at the firm's discretion within 14 days of booking. Your booking was made 20 days before the date. Let me check what we can do." }] },
    { heading: "Subject: RE (Greg Tanaka)", paragraphs: [{ text: "I understand, but I do not know when I could attend. A credit note would be acceptable if a refund is not possible." }] },
    { heading: "Subject: FW: Refund, decision (Sam Kerrigan)", paragraphs: [{ text: "Offer a full credit note valid twelve months, or a free transfer to any date. No cash refund; the booking was 20 days before and outside the 14-day window. Be kind about it; he has been reasonable." }] },
  ],
};

export const TICKET_EXPORT: AttachedDocument = {
  title: "Tickets closed last week",
  kind: "Spreadsheet, 8 rows",
  table: {
    columns: ["Ticket", "Customer", "Category", "First response", "Resolved in", "Within SLA"],
    rows: [
      ["T-30914", "Corvid Media", "Fault", "3h 28m", "8 days", "No"],
      ["T-30921", "Halden Group", "How-to", "0h 45m", "1 day", "Yes"],
      ["T-30925", "Oakshott Partners", "Access", "5h 10m", "1 day", "No"],
      ["T-30930", "Penrose Office Supplies", "Fault", "2h 05m", "3 days", "No"],
      ["T-30933", "Brantwood Logistics", "Billing", "1h 15m", "1 day", "Yes"],
      ["T-30938", "Corvid Media", "How-to", "0h 30m", "0 days", "Yes"],
      ["T-30941", "Halden Group", "Fault", "3h 50m", "2 days", "Yes"],
      ["T-30944", "Thornfield Hall", "Billing", "6h 20m", "2 days", "No"],
    ],
  },
  sections: [
    { heading: "Rows", paragraphs: [
      { text: "T-30914 · Corvid Media · fault · first response 3h 28m · resolved in 8 days · outside SLA." },
      { text: "T-30921 · Halden Group · how-to · 0h 45m · 1 day · within." },
      { text: "T-30925 · Oakshott Partners · access · 5h 10m · 1 day · outside (first response)." },
      { text: "T-30930 · Penrose Office Supplies · fault · 2h 05m · 3 days · outside." },
      { text: "T-30933 · Brantwood Logistics · billing · 1h 15m · 1 day · within." },
      { text: "T-30938 · Corvid Media · how-to · 0h 30m · same day · within." },
      { text: "T-30941 · Halden Group · fault · 3h 50m · 2 days · within." },
      { text: "T-30944 · Thornfield Hall · billing · 6h 20m · 2 days · outside (first response)." },
    ] },
    { heading: "Notes", paragraphs: [{ text: "Eight tickets closed. Four within SLA, four outside. Two breaches were first response over four hours; two were resolution over two days. SLA: first response four working hours, resolution two working days." }] },
  ],
};

export const QUEUE_REVIEW: AttachedDocument = {
  title: "Weekly queue review",
  kind: "Meeting recap, Friday, 20 minutes",
  transcript: [
    { who: "Sam Kerrigan", line: "Eight closed, four outside SLA. Two were slow first responses on Thursday afternoon when Omar was on the escalation and nobody was covering the queue." },
    { who: "Omar Haddad", line: "Agreed. Lena starts training on the escalation queue Monday, three weeks. Until then, Thursday afternoons need a second person on first response." },
    { who: "Sam Kerrigan", line: "Jess, can you cover Thursday afternoons for three weeks? Then Corvid. I am offering one month's credit, £2,300, a named contact, which is Omar, and a written explanation. Omar, draft the explanation by Tuesday; I will send it." },
    { who: "Jess Mulholland", line: "Yes to Thursdays. And the two resolution breaches were both INC-2210; that is fixed now, so they should not repeat." },
    { who: "Sam Kerrigan", line: "Good. New rule from Monday: any ticket linked to an incident gets the expected fix date written on it the same day, and a workaround goes out the day it exists. Omar, add it to the handbook by Wednesday." },
    { who: "Omar Haddad", line: "Will do. The Tanaka refund went out as a credit note; he accepted." },
    { who: "Sam Kerrigan", line: "Actions: Jess, Thursday afternoon cover for three weeks from Monday; Omar, Corvid explanation by Tuesday and the handbook rule by Wednesday; me, the credit and the named contact to Corvid on Monday." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "Four SLA breaches: two slow first responses from uncovered Thursday afternoons, two resolutions on the incident now fixed. Jess covers Thursday afternoons for three weeks. Corvid get one month's credit, a named contact and a written explanation drafted by Omar by Tuesday. New rule: expected fix date on every incident-linked ticket the same day, workarounds sent the day they exist; in the handbook by Wednesday." }] },
  ],
};

export const SUPPORT_BLOCKS: Record<number, TrackBlock> = {
  4: {
    dataPack: SUPPORT_PACK,
    practise: {
      kind: "loop",
      task: "Summarise the escalated complaint for the support lead, inside Word, then find out what the summary left out.",
      brief: "Sam has five minutes before calling the customer. She needs what went wrong in the firm's handling, what the customer is asking for, and what she can offer within her authority. Nothing about the fault itself. The ticket history is open in Word; Copilot has it.",
      material: COMPLAINT_FILE,
      office: "word",
      followUp: true,
      turns: [
        { instruction: "Send 1: ask for the summary. Reader, length, shape, what to flag, what to leave out, from the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary for the support lead: the handling failures, the customer's ask, what is within authority, under a stated length, nothing on the technical fault." }, placeholder: "For the support lead, under … words, lead with what went wrong in our handling and what the customer wants…" },
        { instruction: "Send 2: ask what it left out, and whether any date in the summary is not in the timeline.", placeholder: "What did you leave out? Which dates are not stated in the timeline?" },
      ],
      playbook: { workflow: "Summarise", whenToUse: "A ticket history a lead needs in minutes before a call: what went wrong, what they want, what can be offered; drop the technical detail.", check: "Ask what was left out, and check every date against the timeline." },
    },
    prove: SHARED_PROVE[4],
  },
  5: {
    dataPack: SUPPORT_PACK,
    practise: {
      kind: "loop",
      task: "Draft the reply to Greg inside Outlook, then fix its tone in one turn.",
      brief: "The support lead has decided: a full credit note valid twelve months, or a free transfer to any date, no cash refund. You want to say so kindly, give both options plainly, and not apologise for the terms or argue about the emergency. Reply as the support team.",
      material: REFUND_THREAD,
      office: "outlook",
      followUp: true,
      turns: [
        { instruction: "Send 1: brief Copilot. From whom and to whom, the one thing the reply must achieve, the tone, the length, anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A kind, short reply that offers the credit note or the transfer, says no cash refund without arguing, and asks which he prefers." }, placeholder: "Reply as the support team to Greg… the one thing it must do is give him the two options… do not apologise for the terms…" },
        { instruction: "Send 2: fix the tone or the length in one line.", placeholder: "Warmer, and lose the sentence about policy…" },
      ],
      playbook: { workflow: "Draft", whenToUse: "Any reply with one job: from whom and to whom, the one thing, the voice, the length, what not to do.", check: "Read it as the customer would; check every figure and date against the thread." },
    },
    prove: SHARED_PROVE[5],
  },
  6: {
    dataPack: SUPPORT_PACK,
    practises: [
      {
        kind: "spot",
        task: "Read Copilot's reply about last week's tickets. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what this export says about last week",
        sentences: [
          "Eight tickets were closed; four were within SLA and four outside.",
          "Two breaches were first responses over four hours, on the Oakshott and Thornfield tickets.",
          "Two breaches were resolutions over two days, on the Corvid and Penrose faults.",
          "Corvid Media raised two tickets, one of which took eight days to resolve.",
          "The breaches were caused by staff shortages on Thursday afternoon.",
        ],
        errorIndex: 4,
        why: "The sheet has no column for cause. The Thursday-afternoon explanation came from the meeting, not from the export, and the tool cannot have known it from the sheet. Plausible, specific, not in the source.",
        material: TICKET_EXPORT,
      },
      {
        kind: "loop",
        task: "Now ask the export the question that would have caught that guess, inside Excel.",
        brief: "Sam wants to know, from the sheet alone, which breaches were first-response and which were resolution, and the average first response across all eight. Ask for the figures and the workings from named columns, and ask Copilot to mark anything not in the sheet.",
        material: TICKET_EXPORT,
        office: "excel",
        followUp: false,
        turns: [
          { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "Breaches split by the First response and Resolved in columns against the SLA, and the mean first response, with the arithmetic shown." }, placeholder: "From the First response and Resolved in columns, which tickets breached which target, and what is the average first response? Show the arithmetic and mark anything…" },
        ],
        playbook: { workflow: "Analyse", whenToUse: "Any question of a ticket export: ask the question, name the columns, ask for the workings, ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from." },
      },
    ],
    prove: SHARED_PROVE[6],
  },
  7: {
    dataPack: SUPPORT_PACK,
    practises: [
      {
        kind: "loop",
        task: "Research a question for the support lead with web mode on, then get the sources.",
        brief: "Sam wants to know what a UK consumer is entitled to when a paid service is not provided as agreed, as a short list the team can use. Do not name any customer or the firm in the prompt.",
        followUp: true,
        webMode: true,
        turns: [
          { instruction: "Send 1: the question, for the support lead, with the constraints: UK only, current guidance, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "A short list of consumer rights when a paid service is not provided as agreed in the UK, with sources and dates." }, placeholder: "For the support lead: what is a UK consumer entitled to when a paid service is not provided as agreed… current guidance, cite sources with dates…" },
          { instruction: "Send 2: ask for the sources as a numbered list with publisher, title and date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
        ],
        playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: reader, constraints, UK only and current, sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
      },
      {
        kind: "sources",
        task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
        prompt: "List the sources for that answer with publisher, title and date.",
        reply: "Here are the sources:\n\n1. Consumer Rights Act 2015, legislation.gov.uk\n2. Citizens Advice, If a service is not provided as agreed\n3. Competition and Markets Authority, Unfair contract terms guidance\n4. Trading Standards Institute, Service Complaints Resolution Code 2025, part B\n\nI am confident in all four.",
        sources: [
          { label: "Consumer Rights Act 2015, legislation.gov.uk", real: true, note: "The Act is on legislation.gov.uk; Part 1 Chapter 4 covers services." },
          { label: "Citizens Advice, If a service is not provided as agreed", real: true, note: "Citizens Advice publishes consumer guidance on services." },
          { label: "Competition and Markets Authority, Unfair contract terms guidance", real: true, note: "The CMA publishes unfair contract terms guidance." },
          { label: "Trading Standards Institute, Service Complaints Resolution Code 2025, part B", real: false, note: "There is no such code. The publisher sounds real, the year is recent, the part is specific, and it does not exist." },
        ],
      },
    ],
    prove: SHARED_PROVE[7],
  },
  8: {
    dataPack: SUPPORT_PACK,
    practises: [
      {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "The managing partner missed the queue review and wants a recap: what was decided, then the actions with an owner and a date each. Run the same template twice, the second time for a colleague who needs only their own actions, in a fresh chat each time.",
        material: QUEUE_REVIEW,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for the managing partner. Reader, shape (decisions, then actions with owner and date), length, what to flag, and the check written into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap: decisions as bullets, actions with owner and date, under a stated length, the new rule flagged, every owner and date from the transcript." }, placeholder: "Recap the queue review for the managing partner, who missed it: three bullets on what was decided, then actions with owner and date, under … words, flag the new rule. Check: …" },
          { instruction: "Send 2: the same template, filled in for Jess, who was there and needs only her own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Jess's actions, with dates." }, placeholder: "Recap the queue review for Jess, who was there and needs only her own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      {
        kind: "spot",
        task: "Here is the recap a colleague's template produced. One action has a detail the transcript does not support. Tap it.",
        prompt: "Recap the queue review for the managing partner: decisions, then actions with owner and date, under 100 words.",
        sentences: [
          "Decided: Corvid Media receive one month's credit of £2,300, a named contact and a written explanation.",
          "Decided: from Monday, incident-linked tickets carry an expected fix date the same day and workarounds go out the day they exist.",
          "Action: Jess covers Thursday afternoon first response for three weeks from Monday.",
          "Action: Omar drafts the Corvid explanation by Tuesday and adds the new rule to the handbook by Wednesday.",
          "Action: Sam sends the credit and the named contact to Corvid on Monday and offers a second month if they push back.",
        ],
        errorIndex: 4,
        why: "Nobody offered a second month, and the file says anything above one month needs a partner. The tool added a concession the transcript does not contain, on the one item where authority matters.",
        material: QUEUE_REVIEW,
      },
    ],
    prove: SHARED_PROVE[8],
  },
  9: {
    dataPack: SUPPORT_PACK,
    practises: [
      {
        kind: "loop",
        task: "Turn the ticket history into the written explanation that goes to the customer, inside Word, in three turns.",
        brief: "Elena Voss asked for a written explanation. The support lead wants one page she can send: what happened with dates, what the firm got wrong, what the firm is doing about it, and what Corvid are offered. Honest, plain, no excuses, nothing about internal staffing. The ticket history is open in Word; Copilot has it. Three turns: ask, fix, finish. Then check it.",
        material: COMPLAINT_FILE,
        office: "word",
        followUp: true,
        turns: [
          { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the ticket history.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "A one-page explanation to the customer: dated timeline, what went wrong, what changes, what is offered, plain and honest, nothing internal, from the history." }, placeholder: "For the customer contact: one page with what happened and when, what we got wrong, what changes, and what we are offering, under … words, no excuses, nothing about staffing, from the ticket history…" },
          { instruction: "Turn 2: look at it as the customer would. Say what was wrong or narrow it.", placeholder: "Too defensive; the dates must be exact; cut the paragraph about the release process…" },
          { instruction: "Turn 3: ask it to check every date and figure against the ticket history and mark anything it stated that the history does not.", placeholder: "Check every date and figure in the letter against the ticket history and mark anything not stated in it…" },
        ],
        playbook: { workflow: "Your real task", whenToUse: "A written explanation to a customer: reader, shape, length, what to leave out, from the ticket history; then fix, then check.", check: "Every date and figure traced to the timeline; the offer matches what was authorised; the tool asked to mark anything the history does not say." },
      },
      {
        kind: "spot",
        task: "Here is an explanation a colleague's prompt produced from the same history. One date is wrong. Tap the sentence.",
        prompt: "One page for the customer: what happened and when, what we got wrong, what changes, what we are offering, under 150 words, from the ticket history.",
        sentences: [
          "You reported the blank export on the 9th and we responded the same afternoon, linking it the next day to a fault we already knew about.",
          "We should have sent you the manual export workaround on the 10th, when it existed; we did not send it until the 15th, and two of your chasers went unanswered for a day each.",
          "We also did not tell you when the fix was expected. The fix was released on the 17th and you confirmed it working on the 18th.",
          "From now on, every ticket linked to a known fault carries an expected fix date, and workarounds are sent the day they exist.",
          "We are crediting one month's fee, £2,300, and Omar Haddad is your named contact for any future incident.",
        ],
        errorIndex: 1,
        why: "The workaround went on the 13th, not the 15th. The letter admits a longer failure than the one that happened, in writing, to a customer considering leaving. A wrong date in a letter of apology cuts both ways; trace every date to the timeline.",
        material: COMPLAINT_FILE,
      },
    ],
    prove: [
      ...SHARED_PROVE[9],
      { kind: "choose", stem: "The explanation mentions that the queue was uncovered on Thursday afternoons. What happens?", options: ["Leave it; it is honest.", "Take it out: the brief said nothing about internal staffing, and the customer did not ask why.", "Soften it."], answer: 1, why: "Honest about what happened to the customer, silent about internal arrangements. The brief's constraint decides, and the check enforces it." },
    ],
  },
};
