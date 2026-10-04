import type { AttachedDocument, DataPack, TrackBlock } from "@/app/ai-cleared/engine/types";
import { SHARED_PROVE } from "./general";

/* The Sales and marketing desk for AI Fluent, modules 4 to 9: a small
 * firm's sales team in the last month of the quarter, with a proposal,
 * a pipeline sheet, a pricing query and the weekly pipeline call.
 * Modules 1 to 3 run on the General desk. Every name and number is
 * invented. */

export const SALES_PACK: DataPack = {
  facts:
    "Pipeline this quarter: Oakshott Partners (contact Ruth Abara, r.abara@oakshott.example) proposal for a managed service at £84,000 a year, decision at their board on the 3rd; Halden Group (contact Marcus Bell) renewal at £46,000 with a 12% discount requested; Corvid Media new logo at £28,000, verbal yes; Thornfield Hall event sponsorship; the sales lead Priya Nair; the CRM is HubSpot; the quarter target £210,000 closed.",
  entities: [
    { pattern: "oakshott(\\s+partners)?", cls: "C", label: "client name", placeholder: "[client]" },
    { pattern: "ruth\\s+abara|abara", cls: "C", label: "client contact", placeholder: "[contact]" },
    { pattern: "r\\.abara@oakshott\\.example", cls: "C", label: "contact email", placeholder: "[contact email]" },
    { pattern: "halden(\\s+group)?", cls: "C", label: "client name", placeholder: "[client]" },
    { pattern: "marcus\\s+bell|\\bbell\\b", cls: "C", label: "client contact", placeholder: "[contact]" },
    { pattern: "corvid(\\s+media)?", cls: "C", label: "prospect name", placeholder: "[prospect]" },
    { pattern: "£?\\s?84,?000(\\.00)?", flags: "g", cls: "C", label: "a proposal price", placeholder: "[price]" },
    { pattern: "12\\s?%\\s+discount", flags: "gi", cls: "C", label: "a discount under negotiation", placeholder: "[discount]" },
    { pattern: "priya\\s+nair|nair", cls: "C", label: "a colleague", placeholder: "[colleague]" },
  ],
  restrictedFallback: "Leave the client names and the prices out; add them yourself afterwards.",
};

export const PROPOSAL_DRAFT: AttachedDocument = {
  title: "Oakshott proposal, draft 3",
  kind: "Word document, 6 sections",
  sections: [
    { heading: "What Oakshott asked for", paragraphs: [{ text: "A managed service covering their two offices, with a named account manager, monthly reporting and a quarterly review. Ruth Abara wants it tabled at her board on the 3rd. She asked for a single annual price and a clear statement of what is not included." }] },
    { heading: "Scope", paragraphs: [{ text: "Service desk 8am to 6pm weekdays, on-site visits monthly to each office, monthly report, quarterly review meeting. Out of scope: hardware purchase, projects over three days, out-of-hours cover. Out-of-hours cover can be added at £6,000 a year." }] },
    { heading: "Price", paragraphs: [{ text: "£84,000 a year, invoiced quarterly in advance, fixed for two years. The training day is included as standard; the partners decided this on Thursday. The price includes a 5% discount for a two-year term, which should be stated." }] },
    { heading: "Team", paragraphs: [{ text: "Account manager Priya Nair. Service desk lead to be named. Two engineers allocated." }] },
    { heading: "Open items", paragraphs: [{ text: "The service desk lead is not yet named. The case study section references a client who has not approved use of their name. The payment terms say thirty days in one place and quarterly in advance in another." }] },
    { heading: "Timeline", paragraphs: [{ text: "Final draft to Ruth on the 20th. Her board meets on the 3rd. Start date if approved: the 1st of the following month." }] },
  ],
};

export const PRICING_THREAD: AttachedDocument = {
  title: "Halden renewal, discount request",
  kind: "Email thread, 4 messages",
  emails: [
    { from: "Marcus Bell, Halden Group", subject: "Renewal pricing", time: "Mon", preview: "We have had a competing quote at 12% below your renewal price. We would like to stay but need you to match…" },
    { from: "Priya Nair", subject: "RE: Renewal pricing", time: "Mon", preview: "Thanks Marcus, understood. Let me take this to the partners and come back by Wednesday…" },
    { from: "Rowan Fletcher (partner)", subject: "FW: Renewal pricing", time: "Tue", preview: "We can go to 6% for a two-year term, or 8% if they move to quarterly in advance. Not 12%…" },
    { from: "Marcus Bell, Halden Group", subject: "RE: Renewal pricing", time: "Wed", preview: "Any news? Our finance director wants this settled before the 30th…" },
  ],
  sections: [
    { heading: "Subject: Renewal pricing (Marcus Bell)", paragraphs: [{ text: "We have had a competing quote at 12% below your renewal price of £46,000. We would like to stay with you but our finance director needs us to match or get close. Can you help? Marcus." }] },
    { heading: "Subject: RE (Priya Nair)", paragraphs: [{ text: "Thanks Marcus, understood. Let me take this to the partners and come back to you by Wednesday." }] },
    { heading: "Subject: FW (Rowan Fletcher, partner)", paragraphs: [{ text: "Priya, we can go to 6% for a two-year term, or 8% if they also move to quarterly in advance. Not 12%, and nothing on a one-year term. Do not mention the competing quote in writing." }] },
    { heading: "Subject: RE (Marcus Bell)", paragraphs: [{ text: "Any news? Our finance director wants this settled before the 30th." }] },
  ],
};

export const PIPELINE_SHEET: AttachedDocument = {
  title: "Pipeline, this quarter",
  kind: "Spreadsheet, 7 rows",
  table: {
    columns: ["Account", "Stage", "Value", "Probability", "Weighted", "Close date"],
    rows: [
      ["Oakshott Partners", "Proposal", "£84,000", "60%", "£50,400", "3rd next month"],
      ["Halden Group", "Renewal", "£46,000", "80%", "£36,800", "30th"],
      ["Corvid Media", "Verbal", "£28,000", "90%", "£25,200", "25th"],
      ["Penrose Office Supplies", "Discovery", "£15,000", "20%", "£3,000", "Next quarter"],
      ["Brantwood Logistics", "Closed won", "£52,000", "100%", "£52,000", "12th"],
      ["Ashgrove Print", "Closed lost", "£9,000", "0%", "£0", "8th"],
      ["Total", "", "£234,000", "", "£167,400", ""],
    ],
  },
  sections: [
    { heading: "Rows", paragraphs: [
      { text: "Oakshott Partners · proposal · £84,000 · 60% · weighted £50,400 · closes the 3rd next month." },
      { text: "Halden Group · renewal · £46,000 · 80% · £36,800 · the 30th." },
      { text: "Corvid Media · verbal · £28,000 · 90% · £25,200 · the 25th." },
      { text: "Penrose Office Supplies · discovery · £15,000 · 20% · £3,000 · next quarter." },
      { text: "Brantwood Logistics · closed won · £52,000 · 100% · £52,000 · the 12th." },
      { text: "Ashgrove Print · closed lost · £9,000 · 0% · £0 · the 8th." },
    ] },
    { heading: "Notes", paragraphs: [{ text: "Quarter target £210,000 closed. Closed won so far £52,000. Weighted pipeline £167,400 including closed. Oakshott closes after quarter end." }] },
  ],
};

export const PIPELINE_CALL: AttachedDocument = {
  title: "Weekly pipeline call",
  kind: "Meeting recap, Monday, 25 minutes",
  transcript: [
    { who: "Priya Nair", line: "Three weeks to quarter end, £52,000 closed against £210,000. Corvid is a verbal yes at £28,000; contract going out today, I want it signed by the 25th." },
    { who: "Dev Patel", line: "Halden want 12% off. Rowan says 6% on two years or 8% with quarterly in advance. I will put the 8% option to Marcus today and aim to sign by the 30th." },
    { who: "Priya Nair", line: "Good. Do not put the competing quote in writing. Oakshott: final draft to Ruth on the 20th. The service desk lead still is not named; Rowan decides Wednesday. The case study needs the client's approval or it comes out." },
    { who: "Dev Patel", line: "I will ask Brantwood today if we can name them. If not by Friday, I will cut the section." },
    { who: "Priya Nair", line: "Even if Halden and Corvid both sign we are at £126,000, so we miss the quarter. Oakshott lands next quarter. I will tell Rowan this week rather than at the review." },
    { who: "Dev Patel", line: "Penrose discovery call is Thursday; small, but it is next quarter's." },
    { who: "Priya Nair", line: "Actions: Dev, Halden 8% option today and Brantwood case study approval by Friday; me, Corvid contract today, Oakshott draft on the 20th, and the quarter forecast to Rowan by Wednesday." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "Corvid contract out today, signed by the 25th. Halden offered 8% with quarterly in advance, to sign by the 30th; competing quote not to be mentioned in writing. Oakshott draft to the client on the 20th; service desk lead decided Wednesday; case study needs approval by Friday or it is cut. The quarter will be missed even if both sign; forecast to the partner by Wednesday." }] },
  ],
};

export const SALES_BLOCKS: Record<number, TrackBlock> = {
  4: {
    dataPack: SALES_PACK,
    practise: {
      kind: "loop",
      task: "Summarise the proposal draft for the partner, inside Word, then find out what the summary left out.",
      brief: "Rowan has five minutes before he signs the proposal off. He needs the price and what it includes, the open items, and nothing about the team. The draft is open in Word; Copilot has it.",
      material: PROPOSAL_DRAFT,
      office: "word",
      followUp: true,
      turns: [
        { instruction: "Send 1: ask for the summary. Reader, length, shape, what to flag, what to leave out, from the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary for the partner: price and scope, the open items flagged, under a stated length, nothing on the team." }, placeholder: "For the partner, under … words, lead with the price and the open items…" },
        { instruction: "Send 2: ask what it left out, and whether any figure or date in the summary is not in the document.", placeholder: "What did you leave out? Which figures or dates are not stated in the document?" },
      ],
      playbook: { workflow: "Summarise", whenToUse: "A proposal a decision-maker needs in minutes: price, scope, open items; drop the rest.", check: "Ask what was left out, and check every figure and date against the document." },
    },
    prove: SHARED_PROVE[4],
  },
  5: {
    dataPack: SALES_PACK,
    practise: {
      kind: "loop",
      task: "Draft the reply to Marcus inside Outlook, then fix its tone in one turn.",
      brief: "The partner has approved 6% on a two-year term or 8% with quarterly in advance, and nothing on one year. You want to offer both options, keep the relationship warm, and say nothing about the competing quote. Reply as Priya.",
      material: PRICING_THREAD,
      office: "outlook",
      followUp: true,
      turns: [
        { instruction: "Send 1: brief Copilot. From whom and to whom, the one thing the reply must achieve, the tone, the length, anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A reply that offers the two approved options, warm and brief, with no mention of the competing quote or of 12%." }, placeholder: "Reply as Priya to Marcus… the one thing it must do is offer the two options… do not mention…" },
        { instruction: "Send 2: fix the tone or the length in one line.", placeholder: "Less salesy, and put the options as two bullets…" },
      ],
      playbook: { workflow: "Draft", whenToUse: "Any reply with one job: from whom and to whom, the one thing, the voice, the length, what not to mention.", check: "Read it as the recipient would; check every figure against the thread and the partner's limits." },
    },
    prove: SHARED_PROVE[5],
  },
  6: {
    dataPack: SALES_PACK,
    practises: [
      {
        kind: "spot",
        task: "Read Copilot's reply about the pipeline sheet. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what this sheet says about the quarter",
        sentences: [
          "The quarter target is £210,000 closed and £52,000 has closed so far.",
          "Weighted pipeline is £167,400 including the closed deal.",
          "Oakshott is the largest opportunity at £84,000 but closes after quarter end.",
          "If Halden and Corvid both close, the quarter will reach £126,000 and the target will be met.",
          "One deal, Ashgrove Print, was lost on the 8th.",
        ],
        errorIndex: 3,
        why: "£52,000 plus £46,000 plus £28,000 is £126,000, which is short of £210,000. The arithmetic is right and the conclusion is wrong. The tool stated what the reader hoped between four true sentences.",
        material: PIPELINE_SHEET,
      },
      {
        kind: "loop",
        task: "Now ask the sheet the question that would have caught that guess, inside Excel.",
        brief: "The partner wants to know, from the sheet alone, the most the quarter can close if every deal with a close date inside the quarter signs, and the gap to target. Ask for the figures and the workings from named columns, and ask Copilot to mark anything not in the sheet.",
        material: PIPELINE_SHEET,
        office: "excel",
        followUp: false,
        turns: [
          { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "The best case for the quarter from the Value and Close date columns, and the gap to £210,000, with the arithmetic shown." }, placeholder: "From the Value and Close date columns, what is the most that can close this quarter and what is the gap to target? Show the arithmetic and mark anything…" },
        ],
        playbook: { workflow: "Analyse", whenToUse: "Any question of a pipeline: ask the question, name the columns, ask for the workings, ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from." },
      },
    ],
    prove: SHARED_PROVE[6],
  },
  7: {
    dataPack: SALES_PACK,
    practises: [
      {
        kind: "loop",
        task: "Research a question for the partner with web mode on, then get the sources.",
        brief: "Rowan wants to know what the rules are on sending marketing emails to business contacts in the UK, as a short checklist for the team. Do not name any client or the firm in the prompt.",
        followUp: true,
        webMode: true,
        turns: [
          { instruction: "Send 1: the question, for the partner, with the constraints: UK only, current guidance, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "A short checklist on the UK rules for business-to-business marketing email, with sources and dates." }, placeholder: "For the partner: what are the UK rules on sending marketing emails to business contacts… current guidance, cite sources with dates…" },
          { instruction: "Send 2: ask for the sources as a numbered list with publisher, title and date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
        ],
        playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: reader, constraints, UK only and current, sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
      },
      {
        kind: "sources",
        task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
        prompt: "List the sources for that answer with publisher, title and date.",
        reply: "Here are the sources:\n\n1. ICO, Direct marketing guidance, ico.org.uk\n2. Privacy and Electronic Communications Regulations 2003, legislation.gov.uk\n3. Data and Marketing Association, B2B Email Compliance Standard 2025, section 2.1\n4. ICO, Guide to PECR\n\nI am confident in all four.",
        sources: [
          { label: "ICO, Direct marketing guidance, ico.org.uk", real: true, note: "The ICO publishes direct marketing guidance." },
          { label: "Privacy and Electronic Communications Regulations 2003, legislation.gov.uk", real: true, note: "PECR is on legislation.gov.uk." },
          { label: "Data and Marketing Association, B2B Email Compliance Standard 2025, section 2.1", real: false, note: "There is no such standard. The publisher is real, the year is recent, the section is specific, and it does not exist." },
          { label: "ICO, Guide to PECR", real: true, note: "The ICO's guide to PECR is a real page." },
        ],
      },
    ],
    prove: SHARED_PROVE[7],
  },
  8: {
    dataPack: SALES_PACK,
    practises: [
      {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "The partner missed the pipeline call and wants a recap: what was decided, then the actions with an owner and a date each. Run the same template twice, the second time for a colleague who needs only their own actions, in a fresh chat each time.",
        material: PIPELINE_CALL,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for the partner. Reader, shape (decisions, then actions with owner and date), length, what to flag, and the check written into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap: decisions as bullets, actions with owner and date, under a stated length, the quarter shortfall flagged, every owner and date from the transcript." }, placeholder: "Recap the pipeline call for the partner, who missed it: three bullets on what was decided, then actions with owner and date, under … words, flag the forecast. Check: …" },
          { instruction: "Send 2: the same template, filled in for Dev, who was there and needs only his own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Dev's actions, with dates." }, placeholder: "Recap the pipeline call for Dev, who was there and needs only his own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      {
        kind: "spot",
        task: "Here is the recap a colleague's template produced. One action has a detail the transcript does not support. Tap it.",
        prompt: "Recap the pipeline call for the partner: decisions, then actions with owner and date, under 100 words.",
        sentences: [
          "Decided: Halden is offered 8% with quarterly in advance; the competing quote is not mentioned in writing.",
          "Decided: the quarter will be missed even if Halden and Corvid sign; the partner is told this week.",
          "Action: Priya sends the Corvid contract today, for signature by the 25th.",
          "Action: Dev gets Brantwood's approval for the case study by Friday, or offers them 6% to secure it.",
          "Action: Priya sends the Oakshott draft on the 20th and the quarter forecast to the partner by Wednesday.",
        ],
        errorIndex: 3,
        why: "Nobody offered Brantwood anything. The 6% belongs to Halden's options. The tool joined two true facts into one false action, and it reads as plausible because both halves are in the transcript.",
        material: PIPELINE_CALL,
      },
    ],
    prove: SHARED_PROVE[8],
  },
  9: {
    dataPack: SALES_PACK,
    practises: [
      {
        kind: "loop",
        task: "Turn the proposal draft into the one-page summary that goes to the client's board, inside Word, in three turns.",
        brief: "Ruth will table one page at her board on the 3rd. She wants: what they get, what they do not, the price and term with the discount stated, and the start date. Plain English for a board, nothing internal, nothing from the open items that is unresolved. The draft is open in Word; Copilot has it. Three turns: ask, fix, finish. Then check it.",
        material: PROPOSAL_DRAFT,
        office: "word",
        followUp: true,
        turns: [
          { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the draft.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "A one-page board summary: scope in and out, price and term with the discount, start date, nothing internal or unresolved, from the draft." }, placeholder: "For the client's board: one page with what is included, what is not, the price and term with the discount stated, and the start date, under … words, nothing internal, from the draft…" },
          { instruction: "Turn 2: look at it as a board member would. Say what was wrong or narrow it.", placeholder: "Cut the team section; the discount must be stated; the payment terms conflict, use quarterly in advance…" },
          { instruction: "Turn 3: ask it to check every figure and date against the draft and mark anything it stated that the draft does not.", placeholder: "Check every figure and date in the page against the draft and mark anything not stated in it…" },
        ],
        playbook: { workflow: "Your real task", whenToUse: "A client-facing page from an internal draft: reader, shape, length, what to leave out, from the draft; then fix, then check.", check: "Every figure and date traced to the draft; nothing internal or unresolved on the page; the tool asked to mark anything the draft does not say." },
      },
      {
        kind: "spot",
        task: "Here is a board page a colleague's prompt produced from the same draft. One figure is wrong. Tap the sentence.",
        prompt: "One page for the client's board: what is included, what is not, the price and term with the discount, the start date, under 150 words, from the draft.",
        sentences: [
          "Included: a service desk from 8am to 6pm on weekdays, monthly on-site visits to each office, a monthly report and a quarterly review, with a named account manager.",
          "Not included: hardware purchase, projects over three days, and out-of-hours cover, which can be added for £6,000 a year.",
          "Price: £84,000 a year, invoiced quarterly in advance, fixed for two years, including a 5% two-year discount.",
          "The training day is included as standard.",
          "Start date if approved: the 1st of the month following the board, with a three-year term available on request.",
        ],
        errorIndex: 4,
        why: "The draft fixes the price for two years and says nothing about three. The tool offered a term the firm has not priced, to a board, in writing. Only a trace to the Price and Timeline sections catches it.",
        material: PROPOSAL_DRAFT,
      },
    ],
    prove: [
      ...SHARED_PROVE[9],
      { kind: "choose", stem: "The board page mentions the case study whose client has not approved their name. What happens?", options: ["Leave it; it is persuasive.", "Take it out: the draft lists it as unresolved and the brief said nothing unresolved goes on the page.", "Anonymise the client."], answer: 1, why: "The brief's constraint decides it. The draft's own open items list is the source for what is unresolved." },
    ],
  },
};
