import type { TrackBlock } from "../engine/types";

/* Module 2 desks for the Legal, HR and General tracks. Same Learn screens,
 * same builder shape, a different desk. Every name, firm and number is
 * invented. The Finance desk lives in module2.ts because it is the one
 * the demo was built on. */

export const LEGAL_TRACK: TrackBlock = {
  dataPack: {
    facts:
      "Client Redgrave Marine Ltd, contact Sophie Lindqvist (s.lindqvist@redgravemarine.co.uk, 07700 900456); matter RM/0417, a dispute with their supplier Halden Fabrications over a delayed hull refit; the client's stated settlement ceiling £85,000; a witness, Tom Bryce, whose statement mentions his back injury; fee earner initials JKL.",
    entities: [
      { pattern: "redgrave(\\s+marine(\\s+ltd)?)?", cls: "C", label: "client name", placeholder: "[client]" },
      { pattern: "sophie\\s+lindqvist|lindqvist|\\bsophie\\b", cls: "C", label: "client contact", placeholder: "[contact name]" },
      { pattern: "s\\.lindqvist@redgravemarine\\.co\\.uk", cls: "C", label: "client email", placeholder: "[contact email]" },
      { pattern: "07700\\s?900\\s?456", cls: "C", label: "client phone", placeholder: "[contact phone]" },
      { pattern: "halden(\\s+fabrications)?", cls: "C", label: "counterparty", placeholder: "[the other side]" },
      { pattern: "£?\\s?85,?000(\\.00)?", flags: "g", cls: "R", label: "settlement ceiling", placeholder: "" },
      { pattern: "back\\s+injury|his\\s+injury", cls: "R", label: "witness health detail", placeholder: "" },
      { pattern: "tom\\s+bryce|bryce", cls: "C", label: "witness name", placeholder: "[witness]" },
      { pattern: "RM[/\\s-]?0417", cls: "I", label: "matter number", placeholder: "[matter number]" },
      { pattern: "\\bJKL\\b", flags: "g", cls: "I", label: "fee earner initials", placeholder: "[fee earner]" },
    ],
    restrictedFallback: "Leave the settlement figure and any medical detail out; add them yourself afterwards.",
  },
  practise: {
    kind: "sandbox",
    task: "A partner has just said: “Get me a first draft of a without-prejudice letter to the other side on the Redgrave matter, today.” You are going to ask {{tool}} to draft it.",
    deskIntro: "Here is what is on your desk. Tick every item you would normally put in the prompt. Be honest, there is no wrong answer yet.",
    desk: [
      {
        title: "Matter file",
        cls: "C",
        rows: [
          { key: "Client", value: "Redgrave Marine Ltd", cls: "C" },
          { key: "Contact", value: "Sophie Lindqvist · s.lindqvist@redgravemarine.co.uk", cls: "C" },
          { key: "Matter", value: "RM/0417 · fee earner JKL", cls: "I" },
          { key: "Other side", value: "Halden Fabrications · delayed hull refit", cls: "C" },
          { key: "Ceiling", value: "Client will settle up to £85,000", cls: "R" },
        ],
      },
      {
        title: "Witness statement",
        cls: "R",
        rows: [
          { key: "Witness", value: "Tom Bryce · site foreman", cls: "C" },
          { key: "Health", value: "Statement refers to his back injury", cls: "R" },
        ],
      },
    ],
    builder: [
      {
        key: "A",
        question: "Who are the parties?",
        choices: [
          { label: "Redgrave Marine and Halden Fabrications", value: "from Redgrave Marine to Halden Fabrications", cls: "C", note: "two named clients and counterparties" },
          { label: "A client and a supplier, placeholders for the names", value: "from our client (a marine company) to their supplier (leave placeholders for both names)", cls: "clear", note: "no one is identified" },
        ],
      },
      {
        key: "B",
        question: "What is the dispute?",
        choices: [
          { label: "A delayed hull refit", value: "about a delayed refit contract", cls: "clear", note: "a type of dispute, not a fact about a person" },
          { label: "Matter RM/0417", value: "on matter RM/0417", cls: "I", note: "allowed in {{tool}}" },
        ],
      },
      {
        key: "C",
        question: "What do you want it to propose?",
        choices: [
          { label: "Settlement up to £85,000", value: "proposing settlement up to £85,000", cls: "R", note: "the client's ceiling never enters a prompt" },
          { label: "A settlement figure, placeholder for the sum", value: "proposing a settlement (leave a placeholder for the sum)", cls: "clear", note: "the safe habit" },
        ],
      },
      {
        key: "D",
        question: "Mention the witness?",
        choices: [
          { label: "Tom Bryce's statement and his back injury", value: "Mention that our witness Tom Bryce has a back injury from the delay.", cls: "R", note: "health detail is RESTRICTED" },
          { label: "A witness statement supports our position", value: "Say a witness statement supports our position.", cls: "clear", note: "nothing to protect" },
        ],
      },
    ],
    assemble: "Draft a without-prejudice letter {A} {B}, {C}. {D}",
    freeWrite: {
      heading: "Now say it in your own words",
      lead: "Same task, no menu. Write the prompt as you would on a normal Tuesday. The grader will check it the same way. Skip if you would rather move on.",
      placeholder: "Draft a without-prejudice letter…",
    },
  },
  prove: [
    { kind: "classify", stem: "The court's published cause list for Thursday.", options: ["P", "I", "C", "R"], answer: "P", why: "It is published by the court." },
    { kind: "classify", stem: "Matter RM/0417 is running over budget by 12 hours.", options: ["P", "I", "C", "R"], answer: "I", why: "A matter number and a firm figure. Fine in {{firm.approved}}, not in a personal tool." },
    { kind: "classify", stem: "Redgrave will settle up to £85,000 but do not want Halden to know.", options: ["P", "I", "C", "R"], answer: "R", why: "A settlement ceiling is the client's most sensitive fact in the matter. Never in a prompt." },
    { kind: "classify", stem: "Sophie at Redgrave is unhappy with how slowly the matter is moving.", options: ["P", "I", "C", "R"], answer: "C", why: "A named client contact and a relationship risk. Placeholder before any tool." },
    { kind: "classify", stem: "Draft a without-prejudice letter for a delayed-works dispute, placeholders for the parties and the sum.", options: ["P", "I", "C", "R"], answer: "P", why: "No data in it at all. That is the goal." },
  ],
};

export const HR_TRACK: TrackBlock = {
  dataPack: {
    facts:
      "Former employee Daniel Achebe, left 14 Mar 2026 after two years as an account coordinator, reference requested by Northway Logistics (hiring manager Priya Raman, p.raman@northway-logistics.co.uk, 07700 900789); his file notes 31 days of sickness absence in 2025 for anxiety; final salary £31,400; employee number E-2287; line manager Claire Whitfield.",
    entities: [
      { pattern: "daniel\\s+achebe|achebe|\\bdaniel\\b", cls: "C", label: "former employee", placeholder: "[the employee]" },
      { pattern: "northway(\\s+logistics)?", cls: "C", label: "requesting employer", placeholder: "[new employer]" },
      { pattern: "priya\\s+raman|raman|\\bpriya\\b", cls: "C", label: "hiring manager", placeholder: "[hiring manager]" },
      { pattern: "p\\.raman@northway-logistics\\.co\\.uk", cls: "C", label: "hiring manager email", placeholder: "[their email]" },
      { pattern: "07700\\s?900\\s?789", cls: "C", label: "hiring manager phone", placeholder: "[their phone]" },
      { pattern: "31\\s+days(\\s+of)?(\\s+sickness)?(\\s+absence)?|sickness\\s+absence|anxiety", cls: "R", label: "health record", placeholder: "" },
      { pattern: "£?\\s?31,?400(\\.00)?", flags: "g", cls: "R", label: "salary", placeholder: "" },
      { pattern: "E[-\\s]?2287", cls: "I", label: "employee number", placeholder: "[employee number]" },
      { pattern: "claire\\s+whitfield|whitfield", cls: "I", label: "line manager", placeholder: "[line manager]" },
      { pattern: "account\\s+coordinator", flags: "gi", cls: "I", label: "job title", placeholder: "[job title]" },
    ],
    restrictedFallback: "Leave out anything about health or pay; a factual reference does not need either.",
  },
  practise: {
    kind: "sandbox",
    task: "A hiring manager at another company has emailed asking for a reference for a former colleague. Your manager says: “Factual reference, polite, today please.” You are going to ask {{tool}} to draft it.",
    deskIntro: "Here is what is on your desk. Tick every item you would normally put in the prompt. Be honest, there is no wrong answer yet.",
    desk: [
      {
        title: "Reference request",
        cls: "C",
        rows: [
          { key: "From", value: "Priya Raman · Northway Logistics · p.raman@northway-logistics.co.uk", cls: "C" },
          { key: "About", value: "Daniel Achebe · account coordinator · left 14 Mar 2026", cls: "C" },
          { key: "Employee no.", value: "E-2287 · line manager Claire Whitfield", cls: "I" },
        ],
      },
      {
        title: "Personnel file",
        cls: "R",
        rows: [
          { key: "Absence", value: "31 days sickness absence in 2025 (anxiety)", cls: "R" },
          { key: "Final salary", value: "£31,400", cls: "R" },
        ],
      },
    ],
    builder: [
      {
        key: "A",
        question: "Who is the reference for?",
        choices: [
          { label: "Daniel Achebe, for Priya Raman at Northway Logistics", value: "for Daniel Achebe, to Priya Raman at Northway Logistics", cls: "C", note: "a named person and a named employer" },
          { label: "A former employee, placeholders for the names", value: "for a former employee (leave placeholders for their name and the new employer)", cls: "clear", note: "no one is identified" },
        ],
      },
      {
        key: "B",
        question: "What role and dates?",
        choices: [
          { label: "Account coordinator, two years to March 2026", value: "who was an account coordinator with us for two years until March 2026", cls: "I", note: "role and dates, allowed in {{tool}}" },
          { label: "Placeholders for the role and dates", value: "(leave placeholders for the role and dates)", cls: "clear", note: "nothing to protect" },
        ],
      },
      {
        key: "C",
        question: "Mention attendance?",
        choices: [
          { label: "Note the 31 days of sickness absence for anxiety", value: "Mention the 31 days of sickness absence for anxiety.", cls: "R", note: "health data never enters a prompt" },
          { label: "Keep it factual: role, dates, that they left on good terms", value: "Keep it factual: role, dates, and that they left on good terms.", cls: "clear", note: "the safe habit" },
        ],
      },
      {
        key: "D",
        question: "Include pay?",
        choices: [
          { label: "Confirm the final salary of £31,400", value: "Confirm their final salary was £31,400.", cls: "R", note: "pay is RESTRICTED" },
          { label: "Say pay is not something we confirm in references", value: "Say we do not confirm pay in references.", cls: "clear", note: "nothing to protect" },
        ],
      },
    ],
    assemble: "Draft a short factual reference {A} {B}. {C} {D}",
    freeWrite: {
      heading: "Now say it in your own words",
      lead: "Same task, no menu. Write the prompt as you would on a normal Tuesday. The grader will check it the same way. Skip if you would rather move on.",
      placeholder: "Draft a factual reference…",
    },
  },
  prove: [
    { kind: "classify", stem: "Our published family-leave policy.", options: ["P", "I", "C", "R"], answer: "P", why: "It is in the handbook every candidate receives." },
    { kind: "classify", stem: "We have 14 open vacancies this quarter.", options: ["P", "I", "C", "R"], answer: "I", why: "A firm figure with no person in it." },
    { kind: "classify", stem: "Daniel had 31 days off sick for anxiety last year.", options: ["P", "I", "C", "R"], answer: "R", why: "Health data is special category under UK GDPR. Never in a prompt." },
    { kind: "classify", stem: "Priya at Northway is chasing the reference and sounds annoyed.", options: ["P", "I", "C", "R"], answer: "C", why: "A named contact at a named company and a relationship risk." },
    { kind: "classify", stem: "Draft a neutral factual reference, placeholders for the name, role and dates.", options: ["P", "I", "C", "R"], answer: "P", why: "No data in it at all." },
  ],
};

export const GENERAL_TRACK: TrackBlock = {
  dataPack: {
    facts:
      "Customer Mrs Eleanor Vance (e.vance@example-mail.co.uk, 07700 900321), order ORD-55810 for a garden office delivered 3 Sep 2026, complaint that the roof leaks; she mentions her husband's recent heart surgery as the reason it matters; her card ending 4417 was charged £6,250; the installer was our subcontractor Keld Joinery; the case owner is Marcus Bell.",
    entities: [
      { pattern: "eleanor\\s+vance|mrs\\s+vance|\\bvance\\b|\\beleanor\\b", cls: "C", label: "customer name", placeholder: "[customer]" },
      { pattern: "e\\.vance@example-mail\\.co\\.uk", cls: "C", label: "customer email", placeholder: "[customer email]" },
      { pattern: "07700\\s?900\\s?321", cls: "C", label: "customer phone", placeholder: "[customer phone]" },
      { pattern: "heart\\s+surgery|her\\s+husband'?s?\\s+surgery", cls: "R", label: "health detail", placeholder: "" },
      { pattern: "card\\s+ending\\s+4417|ending\\s+4417|\\b4417\\b", cls: "R", label: "card detail", placeholder: "" },
      { pattern: "£?\\s?6,?250(\\.00)?", flags: "g", cls: "I", label: "order value", placeholder: "[amount]" },
      { pattern: "ORD[-\\s]?55810", cls: "I", label: "order number", placeholder: "[order number]" },
      { pattern: "keld(\\s+joinery)?", cls: "C", label: "subcontractor", placeholder: "[the installer]" },
      { pattern: "marcus\\s+bell|\\bmarcus\\b", cls: "I", label: "case owner", placeholder: "[case owner]" },
    ],
    restrictedFallback: "Leave the card and any health detail out entirely.",
  },
  practise: {
    kind: "sandbox",
    task: "A customer has complained that a garden office you sold her leaks. Your manager says: “Apologise, offer an inspection this week, keep it warm, today please.” You are going to ask {{tool}} to draft the reply.",
    deskIntro: "Here is what is on your desk. Tick every item you would normally put in the prompt. Be honest, there is no wrong answer yet.",
    desk: [
      {
        title: "Complaint email",
        cls: "C",
        rows: [
          { key: "From", value: "Mrs Eleanor Vance · e.vance@example-mail.co.uk · 07700 900321", cls: "C" },
          { key: "Order", value: "ORD-55810 · garden office · delivered 3 Sep 2026 · £6,250", cls: "I" },
          { key: "Issue", value: "Roof leaks; she mentions her husband's recent heart surgery", cls: "R" },
          { key: "Installer", value: "Keld Joinery (subcontractor) · case owner Marcus Bell", cls: "C" },
        ],
      },
      {
        title: "Payment record",
        cls: "R",
        rows: [
          { key: "Card", value: "Ending 4417 · charged £6,250", cls: "R" },
        ],
      },
    ],
    builder: [
      {
        key: "A",
        question: "Who is the reply to?",
        choices: [
          { label: "Mrs Eleanor Vance", value: "to Mrs Eleanor Vance", cls: "C", note: "a named customer" },
          { label: "A customer, placeholder for the name", value: "to a customer (leave a placeholder for the name)", cls: "clear", note: "no one is identified" },
        ],
      },
      {
        key: "B",
        question: "What is it about?",
        choices: [
          { label: "Order ORD-55810, a leaking garden office", value: "about order ORD-55810, a garden office with a leaking roof", cls: "I", note: "an order number, allowed in {{tool}}" },
          { label: "A leaking garden office, placeholder for the order", value: "about a garden office with a leaking roof (leave a placeholder for the order number)", cls: "clear", note: "nothing to protect" },
        ],
      },
      {
        key: "C",
        question: "Acknowledge why it matters to her?",
        choices: [
          { label: "Mention her husband's heart surgery", value: "Acknowledge that her husband has just had heart surgery.", cls: "R", note: "health detail is RESTRICTED" },
          { label: "Acknowledge it is urgent for her family", value: "Acknowledge that this is urgent for her family.", cls: "clear", note: "the safe habit" },
        ],
      },
      {
        key: "D",
        question: "Mention the payment?",
        choices: [
          { label: "Confirm the £6,250 charged to the card ending 4417", value: "Confirm we charged £6,250 to her card ending 4417.", cls: "R", note: "card details never enter a prompt" },
          { label: "Say we will discuss any refund once inspected", value: "Say we will discuss any refund once the office has been inspected.", cls: "clear", note: "nothing to protect" },
        ],
      },
    ],
    assemble: "Write a warm, apologetic reply {A} {B}, offering an inspection this week. {C} {D}",
    freeWrite: {
      heading: "Now say it in your own words",
      lead: "Same task, no menu. Write the prompt as you would on a normal Tuesday. The grader will check it the same way. Skip if you would rather move on.",
      placeholder: "Write a warm reply to a customer…",
    },
  },
  prove: [
    { kind: "classify", stem: "Our garden offices come with a ten-year roof guarantee.", options: ["P", "I", "C", "R"], answer: "P", why: "It is on the website and in every brochure." },
    { kind: "classify", stem: "We had 9 roof complaints this quarter across all installers.", options: ["P", "I", "C", "R"], answer: "I", why: "A firm figure with no customer in it." },
    { kind: "classify", stem: "Mrs Vance says her husband has just had heart surgery.", options: ["P", "I", "C", "R"], answer: "R", why: "Health data about an identifiable person. Never in a prompt." },
    { kind: "classify", stem: "Keld Joinery have had three complaints and we may drop them.", options: ["P", "I", "C", "R"], answer: "C", why: "A named supplier and a commercial decision." },
    { kind: "classify", stem: "Draft an apology for a leaking roof offering an inspection, placeholders for the name and order.", options: ["P", "I", "C", "R"], answer: "P", why: "No data in it at all." },
  ],
};
