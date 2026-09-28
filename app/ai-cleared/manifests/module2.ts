import type { ModuleManifest } from "../engine/types";

/* Module 2 · The paste test. Rebuilt from the approved demo in the engine's
 * manifest shape. The Learn screens are shared; the Finance track supplies
 * the desk (the Ashcombe invoice and the Hannah Price payroll line), the
 * task, the builder and the prove bank. Every name, number and firm in
 * here is invented. */
export const MODULE_2: ModuleManifest = {
  n: 2,
  slug: "paste-test",
  title: "The paste test",
  minutes: 22,
  promise: "Paste into {{tool}} without ever giving away a client, a colleague or a bank detail.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 2 of 5 · about 20 minutes",
      heading: "One habit. Twenty minutes. Then you are cleared for this module.",
      lead: "By the end you will be able to paste into {{tool}} without ever giving away a client, a colleague or a bank detail. You will build a real prompt, step by step, and a grader will check it before the AI sees it.",
      note: "Nothing you will see is real data. The clients, invoices and people in this module are invented for practice.",
      cta: "Start",
    },
    {
      kind: "tiles",
      eyebrow: "Learn · the four data classes, two at a time",
      heading: "The two classes you can use in {{tool}}",
      tiles: [
        { cls: "P", title: "Already on the website or the letterhead.", body: "Our address, our payment terms, the partners' names. Paste into any tool." },
        { cls: "I", title: "Fine inside the firm, not outside it.", body: "An invoice number, a quarter total, a colleague's name. Allowed in {{firm.approved}}. Never in a personal ChatGPT." },
      ],
      check: {
        question: "Quick check. Which class is this?",
        snippet: "Our standard payment terms are 30 days from the invoice date.",
        options: ["P", "I"],
        answer: "P",
        why: "It is printed on every invoice and on the website.",
      },
    },
    {
      kind: "tiles",
      eyebrow: "Learn · the four data classes, two at a time",
      heading: "The two classes that never go in as they are",
      tiles: [
        { cls: "C", title: "A client could be identified or a deal could be harmed.", body: "Client names, their contacts, disputes, draft advice. Swap for a placeholder before it enters any tool, {{tool}} included." },
        { cls: "R", title: "Regulated, or dangerous in the wrong hands.", body: "Bank details, National Insurance numbers, salaries, health and HR records. This class never enters a prompt. Not once." },
      ],
      check: {
        question: "Quick check. Which class is this?",
        snippet: "Ashcombe are disputing the invoice and may move to a competitor.",
        options: ["I", "C", "R"],
        answer: "C",
        why: "A named client, a dispute and a commercial risk. Redact before any tool.",
      },
    },
    {
      kind: "reveal",
      eyebrow: "Learn · the paste test",
      heading: "Three questions, three seconds, before every send",
      lead: "You will not look up a class every time. Ask these instead.",
      items: [
        { title: "Would I email this to a stranger?", body: "If not, it is at least CONFIDENTIAL. The tool is a stranger with a very good memory." },
        { title: "Does it name a person or a client?", body: "The name is the hook every other fact hangs on. Take it out and most of the risk goes with it." },
        { title: "Could someone rebuild the original from it?", body: "Invoice number plus amount plus date is the invoice. Three INTERNAL facts can add up to one CONFIDENTIAL one." },
      ],
    },
    {
      kind: "compare",
      eyebrow: "Learn · the fix",
      heading: "You do not stop. You swap the facts for placeholders, then send.",
      lead: "The assistant does not need the client's name to write a good letter to them. Describe the situation, leave gaps for the facts, and fill the gaps yourself afterwards.",
      before: {
        label: "The reflex",
        parts: [
          { text: "Write a firm but polite email to " },
          { text: "Daniel Okafor", mark: "redact" },
          { text: " at " },
          { text: "Ashcombe Building Supplies", mark: "redact" },
          { text: " chasing invoice INV-2041 for £18,450, 40 days overdue. Our account is " },
          { text: "20-45-77 31190046", mark: "redact" },
          { text: " if they need it." },
        ],
      },
      after: {
        label: "The same request, cleared",
        parts: [
          { text: "Write a firm but polite email to " },
          { text: "a supplier contact", mark: "placeholder" },
          { text: " chasing invoice INV-2041 for £18,450, 40 days overdue. Leave a placeholder for " },
          { text: "[contact name]", mark: "placeholder" },
          { text: ". " },
          { text: "Say payment details are on the original invoice.", mark: "placeholder" },
        ],
        note: "Same quality of email. The invoice number and amount stayed in, because INTERNAL is allowed in {{tool}}. The client, their contact and our bank details did not.",
      },
      revealLabel: "Show the cleared version",
      cta: "Continue to Practise",
    },
  ],
  tracks: {
    finance: {
      dataPack: {
        facts:
          "Client Ashcombe Building Supplies Ltd; their contact Daniel Okafor (d.okafor@ashcombe-bs.co.uk, 07700 900123); invoice INV-2041 for £18,450.00 issued 17 Jul 2026 on 30-day terms, now 40 days overdue with two statements sent; the firm's own bank details sort code 20-45-77 account 31190046; colleague Hannah Price, credit controller, NI number QQ 12 34 56 C, salary £41,200.",
        entities: [
          { pattern: "ashcombe(\\s+building(\\s+supplies)?(\\s+ltd)?)?", cls: "C", label: "client name", placeholder: "[client]" },
          { pattern: "daniel\\s+okafor|okafor|\\bdaniel\\b", cls: "C", label: "client contact", placeholder: "[contact name]" },
          { pattern: "d\\.okafor@ashcombe-bs\\.co\\.uk", cls: "C", label: "client email", placeholder: "[contact email]" },
          { pattern: "07700\\s?900\\s?123", cls: "C", label: "client phone", placeholder: "[contact phone]" },
          { pattern: "(sort\\s*code\\s*)?20-45-77(\\s*[·,]?\\s*(account\\s*)?31190046)?|31190046", cls: "R", label: "bank details", placeholder: "" },
          { pattern: "QQ\\s?12\\s?34\\s?56\\s?C", cls: "R", label: "NI number", placeholder: "" },
          { pattern: "£?\\s?41,?200(\\.00)?", flags: "g", cls: "R", label: "salary", placeholder: "" },
          { pattern: "hannah(\\s+price)?", cls: "I", label: "colleague name", placeholder: "[colleague]" },
          { pattern: "INV[-\\s]?2041", cls: "I", label: "invoice reference", placeholder: "[invoice reference]" },
          { pattern: "£\\s?18,?450(\\.00)?|\\b18,?450\\b", flags: "g", cls: "I", label: "invoice amount", placeholder: "[amount]" },
        ],
        restrictedFallback: "Say payment details are on the original invoice.",
      },
      practise: {
        kind: "sandbox",
        task: "A partner has just said: “Chase Ashcombe for that overdue invoice, polite but firm, today please.” You are going to ask {{tool}} to draft it.",
        deskIntro: "Here is what is on your desk. Tick every item you would normally put in the prompt. Be honest, there is no wrong answer yet.",
        desk: [
          {
            title: "Sales invoice",
            cls: "C",
            rows: [
              { key: "Client", value: "Ashcombe Building Supplies Ltd", cls: "C" },
              { key: "Contact", value: "Daniel Okafor · d.okafor@ashcombe-bs.co.uk", cls: "C" },
              { key: "Invoice", value: "INV-2041 · issued 17 Jul 2026 · terms 30 days", cls: "I" },
              { key: "Amount", value: "£18,450.00", cls: "I" },
              { key: "Status", value: "40 days overdue · two statements sent", cls: "I" },
              { key: "Our bank", value: "Sort code 20-45-77 · Account 31190046", cls: "R" },
            ],
          },
          {
            title: "Payroll extract",
            cls: "R",
            rows: [
              { key: "Employee", value: "Hannah Price · credit controller", cls: "I" },
              { key: "NI number", value: "QQ 12 34 56 C", cls: "R" },
              { key: "Salary", value: "£41,200", cls: "R" },
            ],
          },
        ],
        builder: [
          {
            key: "A",
            question: "Who is the email to?",
            choices: [
              { label: "Daniel Okafor at Ashcombe Building Supplies", value: "Daniel Okafor at Ashcombe Building Supplies", cls: "C", note: "a client and their contact" },
              { label: "A supplier contact, placeholder for the name", value: "a supplier contact (leave a placeholder for the name)", cls: "clear", note: "no one is identified" },
            ],
          },
          {
            key: "B",
            question: "Which invoice?",
            choices: [
              { label: "Invoice INV-2041", value: "invoice INV-2041", cls: "I", note: "allowed in {{tool}}" },
              { label: "An invoice, placeholder for the reference", value: "an invoice (leave a placeholder for the reference)", cls: "clear", note: "nothing to protect" },
            ],
          },
          {
            key: "C",
            question: "How much?",
            choices: [
              { label: "For £18,450", value: "for £18,450", cls: "I", note: "allowed in {{tool}}" },
              { label: "Placeholder for the amount", value: "(leave a placeholder for the amount)", cls: "clear", note: "nothing to protect" },
            ],
          },
          {
            key: "D",
            question: "Payment details?",
            choices: [
              { label: "Include our sort code and account number", value: "Include our bank details: sort code 20-45-77, account 31190046.", cls: "R", note: "never in a prompt" },
              { label: "Say they are on the original invoice", value: "Say payment details are on the original invoice.", cls: "clear", note: "the safe habit" },
            ],
          },
        ],
        assemble: "Write a polite but firm email to {A} chasing {B} {C}, 40 days overdue. {D}",
        freeWrite: {
          heading: "Now say it in your own words",
          lead: "Same task, no menu. Write the prompt as you would on a normal Tuesday. The grader will check it the same way. Skip if you would rather move on.",
          placeholder: "Write a polite but firm email to…",
        },
      },
      prove: [
        { kind: "classify", stem: "Our office is at 14 Bread Street, London EC4.", options: ["P", "I", "C", "R"], answer: "P", why: "It is on the website and the letterhead." },
        { kind: "classify", stem: "Q3 aged debtors total £212k across 31 accounts.", options: ["P", "I", "C", "R"], answer: "I", why: "A firm total with no client in it. Fine in {{firm.approved}}, not in a personal tool." },
        { kind: "classify", stem: "Ashcombe are disputing INV-2041 and have hinted they may move to a competitor.", options: ["P", "I", "C", "R"], answer: "C", why: "A named client, a dispute and a commercial risk. Redact before any tool." },
        { kind: "classify", stem: "Hannah's NI number is QQ 12 34 56 C, can you check the format?", options: ["P", "I", "C", "R"], answer: "R", why: "A National Insurance number never enters a prompt, even to check a format." },
        { kind: "classify", stem: "Draft a chaser for a supplier that is 40 days overdue, placeholders for name and amount.", options: ["P", "I", "C", "R"], answer: "P", why: "There is no data in it at all. That is the goal." },
      ],
    },
  },
};
