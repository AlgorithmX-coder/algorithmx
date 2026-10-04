import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { AGED_DEBTORS, FINANCE_PACK } from "../desks/finance";

/* AI Fluent, Module 6 · Analyse. Tables and numbers with Copilot in
 * Excel: asking for the comparison you want rather than "analyse this",
 * and spotting when the tool guessed. Two practices: spot the planted
 * figure in a reply about the sheet, then ask the question that would
 * have caught it. */
export const FLUENT_MODULE_6: ModuleManifest = {
  n: 6,
  slug: "analyse",
  title: "Analyse",
  minutes: 22,
  course: "ai-fluent",
  promise: "Ask the right question of a table, and catch the figure the tool guessed.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 6 of 9 · about 22 minutes",
      heading: "\"Analyse this\" is not a question.",
      lead: "Given a table and no question, the tool describes the table. Given a question, it answers it, and sometimes it answers with a figure that is not in the table. This module is the workflow for numbers: ask for the comparison you actually want, ask for the workings, and check the one figure that matters before it goes anywhere.",
      note: "The practice runs inside Excel, with the aged debtors sheet open and Copilot in the pane.",
      cta: "Show me the difference",
    },
    {
      kind: "beforeAfter",
      eyebrow: "Learn · a description, an answer",
      heading: "Same sheet. One prompt describes it; the other answers a question.",
      sim: { tool: "copilot", tier: "enterprise" },
      before: {
        prompt: "Analyse this sheet",
        reply: "This sheet lists four clients with outstanding balances. The amounts range from £3,120 to £42,300, with days overdue from 12 to 92. Two accounts are over 60 days. One is marked as disputed and one has a payment plan. The total outstanding is £82,870. The contacts column lists a named person for each client.",
        note: "True, and you knew all of it from looking at the sheet. No question was asked, so nothing was answered.",
      },
      after: {
        prompt: "Which single client, if they paid in full this week, would bring the over-60-day total below £30,000? Show the arithmetic from the Amount and Days columns, and say if any row's status means it should be excluded.",
        reply: "**Over 60 days now**: Brightwater £42,300 (61 days) + Oakhurst £27,600 (92 days) = £69,900.\n\n- If Brightwater paid in full: £69,900 − £42,300 = **£27,600**, below £30,000.\n- If Oakhurst paid in full: £69,900 − £27,600 = £42,300, still above.\n\n**Answer**: Brightwater.\n\n**Exclusion**: Oakhurst is on an agreed payment plan (two instalments received), so its 92 days overstates the risk; you may want to report it separately rather than in the over-60 total.",
        note: "A question, the workings shown from named columns, and a caveat you can check. That is what asking for the comparison gets you.",
      },
      revealLabel: "Show the question",
      cta: "Four habits with numbers",
    },
    {
      kind: "cards",
      eyebrow: "Learn · four habits",
      heading: "Four habits that keep numbers honest. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Question first", tag: "Habit 1", tint: "I", body: "Decide what you want to know before you type.", detail: "\"Which client…\", \"How much would…\", \"What changed between…\". A question has an answer; \"analyse\" has a description." },
        { title: "Ask for the workings", tag: "Habit 2", tint: "I", body: "\"Show the arithmetic from the named columns.\"", detail: "Workings make a wrong figure visible. A bare answer can be wrong and look fine." },
        { title: "Ask what it assumed", tag: "Habit 3", tint: "C", body: "\"What did you treat as missing, excluded or rounded?\"", detail: "The tool makes quiet choices: a blank cell as zero, a disputed row as collectable. Asking surfaces them." },
        { title: "Spot the guess", tag: "Habit 4", tint: "R", body: "Any figure not in the sheet is a guess until checked.", detail: "The tool will sometimes state something plausible that the sheet does not say. The next practice has one. Find it." },
      ],
      note: "Next: a reply about the sheet with one planted guess. Then you ask the question that would have caught it.",
    },
  ],
  tracks: {
    finance: {
      dataPack: FINANCE_PACK,
      practise: {
        kind: "spot",
        task: "Read Copilot's reply about the debtors sheet. One sentence states something the sheet does not say. Tap it.",
        prompt: "Summarise what this sheet says about the over-60-day accounts",
        sentences: [
          "Total outstanding is £82,870 across four clients.",
          "Two clients are over 60 days: Brightwater Logistics at 61 days and Oakhurst Fabrics at 92 days, £69,900 between them.",
          "Oakhurst Fabrics has paid nothing against its payment plan since it was agreed in August.",
          "Cotton & Mather's £9,850 is disputed over a short delivery and should be held out of the collectable total.",
          "Halcyon Dental Group's £3,120 is within terms.",
        ],
        errorIndex: 2,
        why: "The sheet says two instalments have been received against Oakhurst's plan. The tool stated the opposite, confidently, in the middle of four true sentences. That is what a guess looks like: plausible, specific, and not in the source.",
        material: AGED_DEBTORS,
      },
      practises: [
        {
          kind: "spot",
          task: "Read Copilot's reply about the debtors sheet. One sentence states something the sheet does not say. Tap it.",
          prompt: "Summarise what this sheet says about the over-60-day accounts",
          sentences: [
            "Total outstanding is £82,870 across four clients.",
            "Two clients are over 60 days: Brightwater Logistics at 61 days and Oakhurst Fabrics at 92 days, £69,900 between them.",
            "Oakhurst Fabrics has paid nothing against its payment plan since it was agreed in August.",
            "Cotton & Mather's £9,850 is disputed over a short delivery and should be held out of the collectable total.",
            "Halcyon Dental Group's £3,120 is within terms.",
          ],
          errorIndex: 2,
          why: "The sheet says two instalments have been received against Oakhurst's plan. The tool stated the opposite, confidently, in the middle of four true sentences. That is what a guess looks like: plausible, specific, and not in the source.",
          material: AGED_DEBTORS,
        },
        {
          kind: "loop",
          task: "Now ask the sheet the question that would have caught that guess, inside Excel.",
          brief: "You want to know, from the sheet alone, what Oakhurst's plan status is and how much of the over-60 total it accounts for. Ask for the figures and the workings from named columns, and ask Copilot to say if anything it states is not in the sheet.",
          material: AGED_DEBTORS,
          office: "excel",
          followUp: false,
          turns: [
            { instruction: "One send: a question with a definite answer, the workings from named columns, and an instruction to mark anything not in the sheet.", rubric: { requires: ["task", "format", "constraints", "material"], goal: "A figure for Oakhurst's share of the over-60 total, worked from the Amount and Status columns, with any statement not in the sheet marked." }, placeholder: "From the Amount and Status columns, how much of the over-60 total is Oakhurst, and what does the sheet say about its plan? Show the arithmetic and mark anything…" },
          ],
          playbook: { workflow: "Analyse", whenToUse: "Any question of a table: ask the question, name the columns, ask for the workings, and ask it to mark anything not in the sheet.", check: "Check the one figure that matters against the cells it came from, and look for any statement the sheet does not make." },
        },
      ],
      prove: [
        { kind: "choose", stem: "You paste a table and type \"analyse this\". What do you get?", options: ["The answer you needed.", "A description of the table.", "An error."], answer: 1, why: "No question, no answer. Decide what you want to know first." },
        { kind: "choose", stem: "Why ask for the workings from named columns?", options: ["It makes the reply longer.", "A wrong figure becomes visible; a bare answer can be wrong and look fine.", "The tool cannot calculate without them."], answer: 1, why: "Workings are how you check. Named columns tie each figure to a cell." },
        { kind: "choose", stem: "A reply says a client \"has paid nothing against its plan\". The sheet's status column says two instalments were received. What is this?", options: ["A rounding difference.", "A guess: a plausible statement the source does not make.", "A formatting issue."], answer: 1, why: "Plausible, specific, wrong. Every figure or claim not in the sheet is a guess until checked." },
        { kind: "choose", stem: "What does \"ask what it assumed\" catch?", options: ["Spelling mistakes.", "Quiet choices like a blank cell treated as zero or a disputed row counted as collectable.", "Slow replies."], answer: 1, why: "The tool makes choices it does not announce. Asking surfaces them." },
        { kind: "choose", stem: "Before a figure from Copilot goes into the board pack, what is the minimum check?", options: ["Ask Copilot if it is sure.", "Trace that one figure back to the cells it came from.", "Round it."], answer: 1, why: "One figure, one trace, two minutes. Asking the tool to confirm itself is not a check." },
      ],
    },
  },
};
