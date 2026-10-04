import { practisesOf, type AttachedDocument, type DataPack, type Practise, type ProveItem, type TrackBlock } from "@/app/ai-cleared/engine/types";

/* The General desk for AI Fluent: a small firm's office week. Every
 * learner whose desk has no practice of its own for a module practises
 * here, and so does the General desk itself. Modules 1 to 3 run here for
 * every desk except Finance. Every name, firm and number is invented. */

export const GENERAL_PACK: DataPack = {
  facts:
    "Office week at the firm: supplier Ashgrove Print (contact Jon Reilly, j.reilly@ashgroveprint.example, 07700 900114) quote Q-2291 for 5,000 brochures at £3,420; a venue hire for the client day at Thornfield Hall, £2,150, deposit paid; new starter Maya Lindqvist joins on the 20th, salary £31,000; client Oakshott Partners (contact Ruth Abara) awaiting a proposal; the office manager Sam Kerrigan; the firm's bank details sort code 30-99-71 account 55012386.",
  entities: [
    { pattern: "ashgrove(\\s+print)?", cls: "C", label: "supplier name", placeholder: "[supplier]" },
    { pattern: "jon\\s+reilly|reilly", cls: "C", label: "supplier contact", placeholder: "[contact]" },
    { pattern: "j\\.reilly@ashgroveprint\\.example", cls: "C", label: "supplier email", placeholder: "[contact email]" },
    { pattern: "07700\\s?900\\s?114", cls: "C", label: "supplier phone", placeholder: "[contact phone]" },
    { pattern: "thornfield(\\s+hall)?", cls: "C", label: "venue", placeholder: "[venue]" },
    { pattern: "maya\\s+lindqvist|lindqvist|\\bmaya\\b", cls: "C", label: "a new starter", placeholder: "[new starter]" },
    { pattern: "£?\\s?31,?000(\\.00)?", flags: "g", cls: "R", label: "a salary", placeholder: "" },
    { pattern: "oakshott(\\s+partners)?", cls: "C", label: "client name", placeholder: "[client]" },
    { pattern: "ruth\\s+abara|abara", cls: "C", label: "client contact", placeholder: "[contact]" },
    { pattern: "30-99-71|55012386", flags: "g", cls: "R", label: "bank details", placeholder: "" },
    { pattern: "sam\\s+kerrigan|kerrigan", cls: "C", label: "a colleague", placeholder: "[colleague]" },
    { pattern: "Q[-\\s]?2291", flags: "gi", cls: "I", label: "quote reference", placeholder: "[quote]" },
  ],
  restrictedFallback: "Leave the salary and the bank details out; add them yourself afterwards.",
};

export const WEEK_INBOX: AttachedDocument = {
  title: "This week's inbox",
  kind: "Six emails",
  emails: [
    { from: "Jon Reilly, Ashgrove Print", subject: "Quote Q-2291, brochures", time: "09:40", preview: "Quote attached for 5,000 A5 brochures, £3,420 plus VAT, ten working days from artwork…" },
    { from: "Thornfield Hall", subject: "Client day: final numbers by Friday", time: "Mon", preview: "Please confirm final attendee numbers and dietary needs by Friday so catering can…" },
    { from: "HR", subject: "Maya's first day, the 20th", time: "Mon", preview: "Laptop, pass and desk to be ready; please confirm who is buddying her…" },
    { from: "Ruth Abara, Oakshott Partners", subject: "Proposal timing", time: "Fri", preview: "Is the proposal still on track for the end of the month? Our board meets on the 3rd…" },
    { from: "Facilities", subject: "Meeting room 2 projector", time: "Thu", preview: "The projector is away for repair until the 18th; room 1 is available…" },
    { from: "Sam Kerrigan", subject: "Stationery order", time: "Wed", preview: "Order going in Friday, add anything you need to the shared list…" },
  ],
  sections: [
    { heading: "Subject: Quote Q-2291, brochures", paragraphs: [{ text: "Hello, quote attached for 5,000 A5 brochures, four-colour both sides, 170gsm silk: £3,420 plus VAT, ten working days from approved artwork. A 10% discount applies if you confirm by the 15th. We would need the artwork as print-ready PDF. Best, Jon Reilly, Ashgrove Print." }] },
    { heading: "Subject: Client day: final numbers by Friday", paragraphs: [{ text: "Please confirm final attendee numbers and any dietary requirements by Friday so catering can be booked. The deposit of £2,150 is received; the balance is due seven days before the event." }] },
    { heading: "Subject: Proposal timing", paragraphs: [{ text: "Is the proposal still on track for the end of the month? Our board meets on the 3rd and I would like to table it. Ruth." }] },
  ],
};

export const WEEK_PLAN: AttachedDocument = {
  title: "Office week plan",
  kind: "Word document, 5 sections",
  sections: [
    { heading: "Client day, the 24th", paragraphs: [{ text: "Thornfield Hall is booked, deposit paid, balance due on the 17th. Forty-two attendees confirmed so far against a room limit of sixty. Catering needs final numbers by Friday. The brochure for the day depends on the Ashgrove quote being approved by the 15th to keep the 10% discount and the ten-day turnaround." }] },
    { heading: "New starter, the 20th", paragraphs: [{ text: "Maya Lindqvist joins as office coordinator. Laptop ordered, pass requested, desk by the window allocated. A buddy has not been named. Her first week plan is drafted but not shared." }] },
    { heading: "Oakshott proposal", paragraphs: [{ text: "Due end of month; Ruth Abara has asked for it before her board on the 3rd. The pricing section is waiting on a decision from the partners about whether to include the training day as standard." }] },
    { heading: "Facilities", paragraphs: [{ text: "Meeting room 2 projector away for repair until the 18th; room 1 covers until then. Stationery order goes in Friday. The fire drill is the 22nd." }] },
    { heading: "Risks", paragraphs: [{ text: "If the brochure artwork slips past the 15th, the discount is lost and the brochures may miss the client day. If no buddy is named, Maya's first week is unplanned. The proposal cannot be finished until the partners decide on pricing." }] },
  ],
};

export const SUPPLIER_QUOTE_TABLE: AttachedDocument = {
  title: "Quotes for the client day",
  kind: "Spreadsheet, 4 rows",
  table: {
    columns: ["Item", "Supplier", "Quoted", "Deadline", "Status"],
    rows: [
      ["Brochures, 5,000", "Ashgrove Print", "£3,420", "15th for 10% off", "Awaiting artwork"],
      ["Venue, Thornfield Hall", "Thornfield Hall", "£2,150", "Balance by 17th", "Deposit paid"],
      ["Catering, 60 covers", "Thornfield Hall", "£1,980", "Numbers by Friday", "Numbers not sent"],
      ["Name badges", "Ashgrove Print", "£140", "15th", "Approved"],
      ["Total", "", "£7,690", "", ""],
    ],
  },
  sections: [
    { heading: "Rows", paragraphs: [
      { text: "Brochures, 5,000 · Ashgrove Print · £3,420 · 15th for 10% off · awaiting artwork." },
      { text: "Venue, Thornfield Hall · £2,150 · balance by the 17th · deposit paid." },
      { text: "Catering, 60 covers · Thornfield Hall · £1,980 · numbers by Friday · numbers not sent." },
      { text: "Name badges · Ashgrove Print · £140 · 15th · approved." },
    ] },
    { heading: "Notes", paragraphs: [{ text: "Total quoted £7,690. The brochure discount would save £342 if confirmed by the 15th. Catering is quoted for 60 covers; 42 are confirmed." }] },
  ],
};

export const TEAM_MEETING: AttachedDocument = {
  title: "Monday team meeting",
  kind: "Meeting recap, Monday, 20 minutes",
  transcript: [
    { who: "Sam Kerrigan", line: "Client day first. Forty-two confirmed, catering wants final numbers Friday. I will send fifty as the working number unless anyone objects." },
    { who: "Priya Nair", line: "Fine. The brochure: Jon at Ashgrove needs the artwork by the 15th for the discount. Who owns the artwork?" },
    { who: "Tom Ashworth", line: "Me. Draft by Wednesday, final Thursday. If it slips we lose £342 and possibly the date." },
    { who: "Sam Kerrigan", line: "Maya starts the 20th. Laptop and pass are sorted. We still need a buddy. Priya, could you?" },
    { who: "Priya Nair", line: "Yes. I will share her first-week plan by Friday." },
    { who: "Tom Ashworth", line: "Oakshott: Ruth wants the proposal before her board on the 3rd. The partners decide on the training-day pricing on Thursday; the proposal goes the day after." },
    { who: "Sam Kerrigan", line: "Actions then: me, catering numbers Friday; Tom, artwork to Ashgrove by Thursday; Priya, buddy and first-week plan by Friday; proposal to Ruth on the 20th after the partners' decision. Projector is back on the 18th, use room 1 until then." },
  ],
  sections: [
    { heading: "Recap", paragraphs: [{ text: "Client day numbers to catering Friday; brochure artwork to the printer by Thursday to keep the discount; a buddy named for the new starter with a first-week plan by Friday; the client proposal goes on the 20th after the partners decide on pricing; room 1 covers until the projector returns." }] },
  ],
};

/* The prove items modules 4 to 9 share across desks: they are about the
 * habit, not the desk. Each desk's module 9 adds its own on top. */
const SHARED_PROVE: Record<number, ProveItem[]> = {
  4: [
    { kind: "choose", stem: "The summary is accurate but the one unresolved item is in the last paragraph. What was missing from the prompt?", options: ["A role.", "What to flag.", "The material."], answer: 1, why: "Name what must surface and it surfaces." },
    { kind: "choose", stem: "What is the most useful first question to ask once a summary arrives?", options: ["Is this correct?", "What did you leave out?", "Can you make it longer?"], answer: 1, why: "The tool does not volunteer what it cut. Asking lists it." },
    { kind: "choose", stem: "A summary says a plan is \"going well\". The document lists two completed steps. What is the issue?", options: ["Nothing.", "\"Going well\" is the tool's judgement; the document states facts. Keep them separate.", "The summary should quote verbatim."], answer: 1, why: "Ask the tool to separate what the document says from what it concluded." },
    { kind: "choose", stem: "Your reader has five minutes. Which prompt serves them?", options: ["Summarise this document.", "Summarise this in full detail.", "Lead with the decisions, under 100 words, flag anything unresolved, skip the background."], answer: 2, why: "Reader, length, flag, leave out: four things, one prompt." },
    { kind: "choose", stem: "Why summarise inside the app the document is in, when you can?", options: ["It has a better model.", "The document is already in front of the tool; nothing is pasted anywhere.", "Chat windows cannot summarise."], answer: 1, why: "Where the work happens, with the material in front of the tool." },
  ],
  5: [
    { kind: "choose", stem: "The draft apologises for something that is not your fault. What was missing from the brief?", options: ["The reader.", "What not to do.", "The length."], answer: 1, why: "The tool apologises by reflex. \"Do not apologise\" removes it." },
    { kind: "choose", stem: "The best way to get a draft in your firm's voice is to", options: ["ask for a professional tone.", "paste one email you sent and say \"in this voice\".", "ask it to avoid clichés."], answer: 1, why: "One real example beats any description." },
    { kind: "choose", stem: "What is \"the one thing\" in a drafting brief?", options: ["The greeting.", "The single job the email must do.", "The sign-off."], answer: 1, why: "Every email has one job. The draft is built around it." },
    { kind: "choose", stem: "The first draft is right but too soft. What do you do?", options: ["Rewrite it by hand.", "Reply: firmer, and shorter.", "Start again."], answer: 1, why: "Fix the prompt. One line changes the tone and keeps the rest." },
    { kind: "choose", stem: "Why draft inside the mail app rather than a chat window?", options: ["It writes better emails.", "The thread is already in front of the tool; the draft answers what was written.", "Chat windows cannot write emails."], answer: 1, why: "Where the work happens. The thread is the material." },
  ],
  6: [
    { kind: "choose", stem: "You paste a table and type \"analyse this\". What do you get?", options: ["The answer you needed.", "A description of the table.", "An error."], answer: 1, why: "No question, no answer." },
    { kind: "choose", stem: "Why ask for the workings from named columns?", options: ["It makes the reply longer.", "A wrong figure becomes visible.", "The tool cannot calculate otherwise."], answer: 1, why: "Workings are how you check." },
    { kind: "choose", stem: "A reply states something the sheet does not say. It is", options: ["a rounding difference.", "a guess until checked.", "a formatting issue."], answer: 1, why: "Plausible, specific, not in the source." },
    { kind: "choose", stem: "What does \"ask what it assumed\" catch?", options: ["Spelling.", "Quiet choices like a blank cell treated as zero.", "Slow replies."], answer: 1, why: "The tool makes choices it does not announce." },
    { kind: "choose", stem: "Before a figure goes anywhere, the minimum check is", options: ["ask the tool if it is sure.", "trace that one figure to the cells it came from.", "round it."], answer: 1, why: "One figure, one trace, two minutes." },
  ],
  7: [
    { kind: "choose", stem: "A citation you have not opened is", options: ["proof.", "a claim the tool made.", "a link."], answer: 1, why: "Opening it turns a claim into evidence." },
    { kind: "choose", stem: "Which source is most likely invented?", options: ["A government page with a plain title.", "A named handbook with a year and a page number.", "An Act of Parliament."], answer: 1, why: "Invented sources are specific. Specificity is not evidence." },
    { kind: "choose", stem: "How many sources do you open, as a habit?", options: ["All.", "Two, the ones carrying the figures.", "None."], answer: 1, why: "Two, always." },
    { kind: "choose", stem: "Why ask when a source was last updated?", options: ["To cite it properly.", "Because rules change; a correct answer from 2023 can be wrong today.", "Older pages load slowly."], answer: 1, why: "The date is part of the citation." },
    { kind: "choose", stem: "Asking for sources changes the reply because", options: ["it does not.", "the tool is more careful when it must show where each claim came from.", "it makes the reply shorter."], answer: 1, why: "It changes how the tool answers, not only how you check." },
  ],
  8: [
    { kind: "choose", stem: "The two-minute check is", options: ["read it twice, send.", "names and figures to the source; dates and owners supported; the one thing done; ask the tool to mark what is not in the source.", "ask the tool if it is sure."], answer: 1, why: "Four fixed moves against the source." },
    { kind: "choose", stem: "Which task should become a template?", options: ["A letter to a regulator that goes out unread.", "The weekly recap a colleague reads before it is shared.", "A one-off apology."], answer: 1, why: "Repeatable, low stakes, checkable." },
    { kind: "choose", stem: "A template should contain, besides the slots,", options: ["a greeting.", "the check, written into the prompt.", "the date."], answer: 1, why: "A template with the check inside is a workflow." },
    { kind: "choose", stem: "A recap says Friday; the transcript says Wednesday. How was it caught?", options: ["Re-reading.", "Tracing every date to the transcript.", "It would not be."], answer: 1, why: "A plausible wrong date survives a read-through." },
    { kind: "choose", stem: "An agent that runs without a person sits", options: ["anywhere.", "only where the firm has decided it can, because the check is gone.", "nowhere."], answer: 1, why: "The firm decides; Cleared's Module 5 is that decision." },
  ],
  9: [
    { kind: "choose", stem: "The output's actions have no owners. The fluent move is", options: ["add them by hand.", "reply: each action needs an owner the material supports.", "remove the actions."], answer: 1, why: "Fix the prompt; the tool adds what the material supports." },
    { kind: "choose", stem: "What goes into the playbook at the end?", options: ["The output.", "The prompt, with when to use it and the check.", "The material."], answer: 1, why: "The playbook keeps prompts, not outputs." },
    { kind: "choose", stem: "A figure in the output does not match the source. How is it found?", options: ["Careful reading.", "Tracing the figure to the source.", "Asking the tool."], answer: 1, why: "A swapped figure reads fine. Only a trace finds it." },
    { kind: "choose", stem: "Why run the capstone in the app the material is in?", options: ["It is required.", "The material is open and the tool drafts from it without copying anything anywhere.", "Chat tools cannot read it."], answer: 1, why: "Where the work happens." },
  ],
};

export const GENERAL_BLOCKS: Record<number, TrackBlock> = {
  1: {
    dataPack: GENERAL_PACK,
    practise: {
      kind: "loop",
      task: "Turn a weak prompt into a fluent one, in three sends, on this week's office plan.",
      brief: "Your manager wants a short update on the client day: where it stands, what is at risk, and what they need to decide. Plain English, they are busy.",
      material: WEEK_PLAN,
      starter: "Summarise the week plan",
      followUp: true,
      turns: [
        { instruction: "Send the prompt as it stands, the one most people type, and read what comes back.", rubric: { requires: ["task"], goal: "Any summary of the plan." } },
        { instruction: "Now tell {{tool}} who this is for and what they need to decide, and fix the format. Reply to what it gave you.", rubric: { requires: ["task", "reader", "format"], goal: "An update the manager could act on, in a shape they can use." }, placeholder: "Tell it what was wrong and who it is for…" },
        { instruction: "One more pass: set the length, and say what it must flag. Then read the result against the brief.", rubric: { requires: ["task", "reader", "format", "length", "constraints"], goal: "Where the client day stands, what is at risk, the decision needed, under a stated length." }, placeholder: "Set the length and what to flag…" },
      ],
    },
    prove: [
      { kind: "choose", stem: "A colleague says the AI tool is useless because its summary just restated the plan. What most likely happened?", options: ["The tool is bad at summaries.", "The prompt did not say who the summary was for or what they needed to do with it.", "The document was too long."], answer: 1, why: "No reader, no purpose: the tool fills the gaps with an average." },
      { kind: "choose", stem: "The reply is too long and misses the dates. What is the fluent move?", options: ["Edit it by hand.", "Tell the tool: too long, and I need the dates on each item.", "Start a new chat."], answer: 1, why: "Fix the prompt, not the output." },
      { kind: "choose", stem: "Which of these is the \"say what you want\" move?", options: ["Reading the reply carefully.", "Naming the reader, the purpose, the format and the length before you send.", "Checking the dates against the plan."], answer: 1, why: "Move 1 is everything you tell the tool before it starts." },
      { kind: "choose", stem: "The tool produced a crisp update with three dates in it. What happens before it goes to your manager?", options: ["Nothing; it read the plan.", "Check the three dates against the plan.", "Ask the tool if it is sure."], answer: 1, why: "Check is move 4. Asking the tool to confirm is not a check." },
      { kind: "choose", stem: "Why does the loop take about a minute longer than asking once?", options: ["You type more in the first prompt and read the reply against it.", "The tool is slower with longer prompts.", "You start a new chat for each version."], answer: 0, why: "The minute saves the twenty minutes of hand-editing." },
    ],
  },
  2: {
    dataPack: GENERAL_PACK,
    practise: {
      kind: "loop",
      task: "Rewrite one prompt three times, adding elements each time, and watch the reply close in on what you need.",
      brief: "Your manager wants to know whether to approve the brochure quote before the 15th to keep the discount, and whether anything about it needs checking first. Each send starts a fresh chat.",
      material: WEEK_INBOX,
      followUp: false,
      turns: [
        { instruction: "Send 1: the task and the reader only.", rubric: { requires: ["task", "reader"], goal: "A reply aimed at the manager's decision on the quote." }, placeholder: "Who is it for, and what do you want done…" },
        { instruction: "Send 2: the same ask, now with a format and a length. Write the whole prompt again.", rubric: { requires: ["task", "reader", "format", "length"], goal: "The same decision in a shape and a size the manager can use." }, placeholder: "Add the format and the length…" },
        { instruction: "Send 3: the same ask, with constraints and the material named.", rubric: { requires: ["task", "reader", "format", "length", "constraints", "material"], goal: "A complete prompt: the decision, the shape, the size, what to flag, from the email." }, placeholder: "Add what to flag, what to leave out, and name the email…" },
      ],
    },
    prove: [
      { kind: "choose", stem: "A reply is accurate but three paragraphs long and your manager wanted one line. Which element was missing?", options: ["Role", "Length", "Material"], answer: 1, why: "A number in the prompt would have produced one line." },
      { kind: "choose", stem: "\"Summarise this quote and then draft a reply and list what else we need.\" What is wrong?", options: ["Nothing.", "Three asks in one prompt; each gets half done.", "It should name the tool."], answer: 1, why: "One thing at a time." },
      { kind: "choose", stem: "The strongest single element to add to a weak prompt is", options: ["a role.", "a reader with a decision to make.", "a request to be concise."], answer: 1, why: "A reader with a decision shapes content, tone and length." },
      { kind: "choose", stem: "To get a reply in your firm's house style,", options: ["say \"use our house style\".", "paste one paragraph you wrote and say \"in this voice\".", "ask it to be formal."], answer: 1, why: "One real example beats adjectives." },
      { kind: "choose", stem: "Why does this practice start a fresh chat for each send?", options: ["The tool forgets anyway.", "So the reply reflects your prompt alone.", "A long chat costs more."], answer: 1, why: "The point is to see what each element changes by itself." },
    ],
  },
  3: {
    dataPack: GENERAL_PACK,
    practise: {
      kind: "loop",
      task: "Get the client-day update right in three turns, by replying to the reply.",
      brief: "Your manager needs a short update: where the client day stands, what is at risk, what they need to decide. Ask once with the reader and the format, then fix whatever comes back, twice. The conversation is kept.",
      material: WEEK_PLAN,
      followUp: true,
      turns: [
        { instruction: "Turn 1: ask for the update, naming the reader and the format.", rubric: { requires: ["task", "reader", "format"], goal: "A first draft of the update." }, placeholder: "Ask for the update, for your manager, in a shape they can use…" },
        { instruction: "Turn 2: say what was wrong, or narrow it. Do not restate the task.", placeholder: "Too long? Missing the dates? Say so…" },
        { instruction: "Turn 3: one more move. Narrow, ask for options, or ask it to check its dates against the plan.", placeholder: "Narrow, ask for options, or ask it to check itself…" },
      ],
    },
    prove: [
      { kind: "choose", stem: "The reply is right but twice too long. The fluent move is", options: ["delete half by hand.", "reply: too long, under 100 words, keep the risks.", "start a new chat."], answer: 1, why: "Say what was wrong; the tool keeps the rest." },
      { kind: "choose", stem: "Which reply does NOT move the work on?", options: ["Just the risks.", "Give me three versions of the opening.", "Please summarise the week plan for my manager."], answer: 2, why: "That restates the task: a repeat." },
      { kind: "choose", stem: "You know the opening is wrong but cannot say why. Best move?", options: ["Ask for three versions and pick one.", "Ask it to be more professional.", "Rewrite the line."], answer: 0, why: "Choosing is faster than describing." },
      { kind: "choose", stem: "Why keep the conversation rather than start a new chat each time?", options: ["Cost.", "The tool keeps what it already understood; you change only what you name.", "It refuses new chats."], answer: 1, why: "A kept conversation is why iterating is cheap." },
      { kind: "choose", stem: "The third reply looks finished. The last move before it goes out is", options: ["send it.", "ask the tool to check every date against the plan and report any mismatch.", "ask the tool if it is happy."], answer: 1, why: "Ask it to check itself, against the source." },
    ],
  },
  4: {
    dataPack: GENERAL_PACK,
    practise: {
      kind: "loop",
      task: "Summarise the office week plan for your manager, inside Word, then find out what the summary left out.",
      brief: "Your manager has five minutes. They need what is at risk, the decisions, and nothing about facilities. The plan is open in Word; Copilot has it.",
      material: WEEK_PLAN,
      office: "word",
      followUp: true,
      turns: [
        { instruction: "Send 1: ask for the summary. Reader, length, shape, what to flag, what to leave out, from the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary the manager can act on: risks and decisions first, under a stated length, no facilities." }, placeholder: "For my manager, under … words, lead with …" },
        { instruction: "Send 2: ask what it left out, and whether any date in the summary is not in the document.", placeholder: "What did you leave out? Which dates are not stated in the document?" },
      ],
      playbook: { workflow: "Summarise", whenToUse: "A long document a busy reader needs in minutes: lead with the risks and decisions, flag what is unresolved, drop the routine.", check: "Ask what was left out, and check every date against the source." },
    },
    prove: SHARED_PROVE[4],
  },
  5: {
    dataPack: GENERAL_PACK,
    practise: {
      kind: "loop",
      task: "Draft the reply to the printer's quote inside Outlook, then fix its tone in one turn.",
      brief: "Ashgrove Print have quoted £3,420 for the brochures with 10% off if confirmed by the 15th. You want to confirm the order, hold the artwork until Thursday, and ask whether the discount still applies if the artwork arrives on the 15th itself. Reply as the office team.",
      material: WEEK_INBOX,
      office: "outlook",
      followUp: true,
      turns: [
        { instruction: "Send 1: brief Copilot. From whom and to whom, the one thing the reply must achieve, the tone, the length, anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A reply that confirms the order, says artwork comes Thursday, asks whether the 15th still earns the discount, and commits to nothing else." }, placeholder: "Reply as the office team to Jon… the one thing it must do is…" },
        { instruction: "Send 2: fix the tone or the length in one line.", placeholder: "Warmer, and cut the second paragraph…" },
      ],
      playbook: { workflow: "Draft", whenToUse: "Any reply with one job: from whom and to whom, the one thing, the voice, the length, what not to do.", check: "Read it as the recipient would; check every date and figure against the thread." },
    },
    prove: SHARED_PROVE[5],
  },
  6: {
    dataPack: GENERAL_PACK,
    practises: [
      {
        kind: "spot",
        task: "Read Copilot's reply about the client-day quotes. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what this sheet says about the client day costs",
        sentences: [
          "Total quoted for the client day is £7,690 across four items.",
          "The brochures are the largest item at £3,420, with 10% off if confirmed by the 15th.",
          "Catering is quoted for 60 covers and the final numbers have already been sent.",
          "The venue deposit is paid and the balance is due by the 17th.",
          "The name badges are approved.",
        ],
        errorIndex: 2,
        why: "The sheet says catering numbers have not been sent. The tool stated the opposite between four true sentences; that is what a guess looks like.",
        material: SUPPLIER_QUOTE_TABLE,
      },
      {
        kind: "loop",
        task: "Now ask the sheet the question that would have caught that guess, inside Excel.",
        brief: "You want to know, from the sheet alone, what is still outstanding on the client day and what it would cost if the brochure discount is lost. Ask for the figures and the workings from named columns, and ask Copilot to mark anything not in the sheet.",
        material: SUPPLIER_QUOTE_TABLE,
        office: "excel",
        followUp: false,
        turns: [
          { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "Which items are still outstanding by the Status column, and the cost of losing the brochure discount, worked from the Quoted column." }, placeholder: "From the Status and Quoted columns, which items are outstanding and what does losing the brochure discount cost? Show the arithmetic and mark anything…" },
        ],
        playbook: { workflow: "Analyse", whenToUse: "Any question of a table: ask the question, name the columns, ask for the workings, ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from." },
      },
    ],
    prove: SHARED_PROVE[6],
  },
  7: {
    dataPack: GENERAL_PACK,
    practises: [
      {
        kind: "loop",
        task: "Research a question for your manager with web mode on, then get the sources.",
        brief: "Your manager wants to know what the firm must do about dietary and accessibility needs when it hosts a client day at a hired venue in the UK, as a short checklist. Do not name the venue or any client in the prompt.",
        followUp: true,
        webMode: true,
        turns: [
          { instruction: "Send 1: the question, for your manager, with the constraints: UK only, current guidance, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "A short checklist on dietary and accessibility obligations for a hosted event in the UK, with sources and dates." }, placeholder: "For my manager: what must a firm do about dietary and accessibility needs at a hosted client event in the UK… current guidance, cite sources with dates…" },
          { instruction: "Send 2: ask for the sources as a numbered list with publisher, title and date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
        ],
        playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: reader, constraints, UK only and current, sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
      },
      {
        kind: "sources",
        task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
        prompt: "List the sources for that answer with publisher, title and date.",
        reply: "Here are the sources:\n\n1. Equality Act 2010, legislation.gov.uk\n2. Food Standards Agency, Allergen guidance for food businesses, food.gov.uk\n3. GOV.UK, Reasonable adjustments for disabled people\n4. Institute of Hospitality, Client Event Compliance Manual 2026, section 4.2\n\nI am confident in all four.",
        sources: [
          { label: "Equality Act 2010, legislation.gov.uk", real: true, note: "The Act is on legislation.gov.uk; it is the basis for reasonable adjustments." },
          { label: "Food Standards Agency, Allergen guidance for food businesses, food.gov.uk", real: true, note: "The FSA publishes allergen guidance for food businesses." },
          { label: "GOV.UK, Reasonable adjustments for disabled people", real: true, note: "A GOV.UK guidance page on reasonable adjustments." },
          { label: "Institute of Hospitality, Client Event Compliance Manual 2026, section 4.2", real: false, note: "There is no such manual. The publisher is real, the year is current, the section number is specific, and it does not exist." },
        ],
      },
    ],
    prove: SHARED_PROVE[7],
  },
  8: {
    dataPack: GENERAL_PACK,
    practises: [
      {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "Your manager missed the Monday meeting and wants a recap: what was decided, then the actions with an owner and a date each. Run the same template twice, the second time for a colleague who needs only their own actions, in a fresh chat each time.",
        material: TEAM_MEETING,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for your manager. Reader, shape (decisions, then actions with owner and date), length, what to flag, and the check written into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap: decisions as bullets, actions with owner and date, under a stated length, anything blocked flagged, every owner and date from the transcript." }, placeholder: "Recap the Monday meeting for my manager, who missed it: three bullets on what was decided, then actions with owner and date, under … words, flag anything blocked. Check: …" },
          { instruction: "Send 2: the same template, filled in for Priya, who was there and needs only her own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Priya's actions, with dates." }, placeholder: "Recap the Monday meeting for Priya, who was there and needs only her own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      {
        kind: "spot",
        task: "Here is the recap a colleague's template produced. One action has a detail the transcript does not support. Tap it.",
        prompt: "Recap the Monday meeting for my manager: decisions, then actions with owner and date, under 100 words.",
        sentences: [
          "Decided: fifty is the working number for catering unless anyone objects.",
          "Decided: the proposal goes to the client the day after the partners decide on pricing.",
          "Action: Sam sends final catering numbers on Friday.",
          "Action: Tom sends the brochure artwork to the printer by Friday.",
          "Action: Priya buddies the new starter and shares her first-week plan by Friday.",
        ],
        errorIndex: 3,
        why: "The transcript has Tom's artwork due Thursday, not Friday, and the discount depends on it. A date one day out survives a read-through and fails a two-minute check.",
        material: TEAM_MEETING,
      },
    ],
    prove: SHARED_PROVE[8],
  },
  9: {
    dataPack: GENERAL_PACK,
    practises: [
      {
        kind: "loop",
        task: "Clear the inbox: three drafted replies, a one-line summary of the quote, and the follow-ups scheduled, inside Outlook, in three turns.",
        brief: "Six emails are waiting. Your manager wants, by lunchtime: short replies drafted to the printer, the venue and the client; a one-line summary of the brochure quote; and a list of follow-ups with dates. Three turns: ask, fix, finish. Then check it.",
        material: WEEK_INBOX,
        office: "outlook",
        followUp: true,
        turns: [
          { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the inbox.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "Three short drafted replies, a one-line quote summary and a dated follow-up list, from the emails." }, placeholder: "For my manager: draft short replies to the printer, the venue and the client, one line on the quote, and a dated follow-up list, under … words, from these emails…" },
          { instruction: "Turn 2: look at it as your manager would. Say what was wrong or narrow it.", placeholder: "The replies are too long; the client reply needs the date; cut the stationery one…" },
          { instruction: "Turn 3: ask it to check every date and figure against the emails and mark anything it stated that the emails do not.", placeholder: "Check every date and figure against the emails and mark anything not stated in them…" },
        ],
        playbook: { workflow: "Your real task", whenToUse: "Clearing an inbox: reader, the three outputs, length, what to flag, from the emails; then fix, then check.", check: "Every date and figure traced to the email it came from; the tool asked to mark anything the emails do not say." },
      },
      {
        kind: "spot",
        task: "Here is the follow-up list a colleague's prompt produced from the same inbox. One date is wrong. Tap the sentence.",
        prompt: "From these emails, list the follow-ups with dates, under 80 words.",
        sentences: [
          "Confirm attendee numbers and dietary needs to the venue by Friday.",
          "Approve the brochure quote by the 15th to keep the 10% discount.",
          "Confirm who is buddying the new starter before the 20th.",
          "Send the client proposal before their board meets on the 13th.",
          "Add anything needed to the stationery list before Friday's order.",
        ],
        errorIndex: 3,
        why: "The client's board meets on the 3rd, not the 13th. One digit, a plausible date, and a proposal that would arrive ten days late. Trace every date to the email.",
        material: WEEK_INBOX,
      },
    ],
    prove: SHARED_PROVE[9],
  },
};

/* Modules 4 to 9 on every desk share these prove items; a desk's own
 * block can extend them. */
export { SHARED_PROVE };

export function generalPractise(n: number): Practise {
  return practisesOf(GENERAL_BLOCKS[n])[0];
}
