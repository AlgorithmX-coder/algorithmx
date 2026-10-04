import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { FINANCE_PACK, MONTH_END_COMMENTARY } from "../desks/finance";

/* AI Fluent, Module 4 · Summarise. The first workflow: summaries that
 * keep the decision and drop the noise. The practice runs in Copilot
 * inside Word on a six-section month-end commentary; the learner asks for
 * a summary for a named reader, then asks what it left out. The best
 * prompt goes to the playbook. */
export const FLUENT_MODULE_4: ModuleManifest = {
  n: 4,
  slug: "summarise",
  title: "Summarise",
  minutes: 20,
  course: "ai-fluent",
  promise: "Turn a long document into the one page a named reader needs, and know what the summary left out.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 4 of 9 · about 20 minutes",
      heading: "A summary is a decision about what to leave out.",
      lead: "The tool can shorten anything. Whether the short version is any use depends on one thing: did you tell it who is reading and what they will do next. This module is the first of the five workflows, and the one you will use most: summarise, for a reader, at a length, flagging what matters.",
      note: "The practice runs inside Word, where the document already is. Copilot sits in a pane on the right.",
      cta: "Show me two summaries",
    },
    {
      kind: "beforeAfter",
      eyebrow: "Learn · a summary for nobody, a summary for someone",
      heading: "Same six-section commentary. Two prompts.",
      lead: "On the left, what \"summarise this\" gets you. On the right, a summary for the finance director with a decision to make.",
      sim: { tool: "copilot", tier: "enterprise" },
      before: {
        prompt: "Summarise this document",
        reply: "This month-end commentary on debtors reports total outstanding of £82,870 across four clients, down from £91,400. It covers each client in turn: Brightwater Logistics has two unpaid invoices and an unresponsive contact; Cotton & Mather dispute a delivery; Halcyon Dental is within terms; Oakhurst Fabrics is on a payment plan that is performing. It closes with process notes on statement timing, ledger contact fields and leave cover.",
        note: "Everything is in it, in the order it was written, at equal weight. The finance director still has to find the two decisions herself.",
      },
      after: {
        prompt: "Summarise this for the finance director, who has five minutes before the board and needs to know what to decide. Lead with the decisions, under 100 words, then one line each on the two clients that are fine. Flag anything disputed or unresponsive.",
        reply: "**Two decisions**\n\n1. Brightwater (£42,300, 61 days, unresponsive): approve a director-level call this week and a formal notice if it is not returned within seven days.\n2. Oakhurst (£27,600, plan performing): decide whether to accept a discounted December lump sum to close the plan early.\n\n**Flag**: Cotton & Mather's £9,850 is disputed pending a delivery note; hold it out of the collectable total.\n\nHalcyon is within terms. Overall debt is down £8,530 on last month.",
        note: "Decisions first, a flag, the rest in one line each, under 100 words. Nothing was added; the prompt decided what to leave out.",
      },
      revealLabel: "Show the summary for someone",
      cta: "What a good summary needs",
    },
    {
      kind: "cards",
      eyebrow: "Learn · four things to say",
      heading: "Four things every summary prompt should carry. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Who reads it", tag: "Reader", tint: "I", body: "And what they will do next.", detail: "A board member deciding, a colleague catching up, a client being reassured. Each wants a different summary of the same document." },
        { title: "How long", tag: "Length", tint: "I", body: "A number of words, bullets or lines.", detail: "Summaries drift to a page. \"Under 100 words\" is the single most useful constraint in this module." },
        { title: "What to flag", tag: "Constraint", tint: "C", body: "Disputes, deadlines, risks, anything unresolved.", detail: "A summary that buries the disputed balance in paragraph three has failed. Name what must surface and it will." },
        { title: "What to leave out", tag: "Constraint", tint: "C", body: "Process notes, history, anything the reader already knows.", detail: "Saying what to drop is as powerful as saying what to keep. \"No process notes\" removes a paragraph nobody at board level needs." },
      ],
      note: "Material is the fifth: inside Word the document is already in front of Copilot; in a chat tool you attach or paste it.",
    },
    {
      kind: "reveal",
      eyebrow: "Learn · after the summary arrives",
      heading: "Three questions to ask of any summary before you trust it.",
      lead: "The tool does not know what it left out until you ask.",
      items: [
        { title: "What did you leave out?", body: "Ask it directly. The reply lists what was cut, and you decide whether any of it should go back. This one question catches most summary mistakes." },
        { title: "Which figures are from the document?", body: "A summary can introduce a number by rounding or adding. Ask it to mark any figure not stated verbatim in the source." },
        { title: "Is anything here a judgement rather than a fact?", body: "\"Performing well\" and \"no concerns\" are the tool's opinions unless the document says them. Ask it to separate the two." },
      ],
      more: "Show question {n}",
    },
  ],
  tracks: {
    finance: {
      dataPack: FINANCE_PACK,
      practise: {
        kind: "loop",
        task: "Summarise the month-end commentary for the finance director, inside Word, then find out what the summary left out.",
        brief: "Helen has five minutes before the board. She needs the decisions, a flag on anything unresolved, and nothing about process. The commentary is open in Word; Copilot has it.",
        material: MONTH_END_COMMENTARY,
        office: "word",
        followUp: true,
        turns: [
          { instruction: "Send 1: ask for the summary. Name the reader, the length, the shape, what to flag and what to leave out, and point Copilot at the document.", rubric: { requires: ["reader", "length", "format", "constraints", "material"], goal: "A summary the finance director can take into the board: decisions first, the disputed balance flagged, under a stated length, no process notes." }, placeholder: "For the finance director, under … words, lead with …" },
          { instruction: "Send 2: ask what it left out, and whether any figure in the summary is not in the document.", placeholder: "What did you leave out? Which figures are not stated in the document?" },
        ],
        playbook: { workflow: "Summarise", whenToUse: "A long document a senior reader needs in minutes: lead with the decisions, flag what is unresolved, drop process.", check: "Ask what was left out, and check every figure in the summary against the source." },
      },
      prove: [
        { kind: "choose", stem: "The summary is accurate but the disputed balance is in the last paragraph. What was missing from the prompt?", options: ["A role.", "What to flag.", "The material."], answer: 1, why: "Name what must surface and it surfaces. A flag instruction puts the disputed item first." },
        { kind: "choose", stem: "What is the most useful first question to ask once a summary arrives?", options: ["Is this correct?", "What did you leave out?", "Can you make it longer?"], answer: 1, why: "The tool does not volunteer what it cut. Asking lists it, and you decide what goes back." },
        { kind: "choose", stem: "A summary says \"the plan is performing well\". The document says two instalments have been received on time. What is the issue?", options: ["Nothing; that is the same thing.", "\"Performing well\" is the tool's judgement; the document states a fact. Keep facts and judgements separate.", "The summary should quote the document verbatim."], answer: 1, why: "Ask the tool to separate what the document says from what it concluded. The board should get the fact." },
        { kind: "choose", stem: "The finance director has five minutes. Which prompt serves her?", options: ["Summarise this document.", "Summarise this in detail so nothing is missed.", "Lead with the two decisions, under 100 words, flag anything unresolved, skip the process notes."], answer: 2, why: "Reader, length, flag, leave out. Four things, one prompt, a usable page." },
        { kind: "choose", stem: "Why run this practice inside Word rather than a chat window?", options: ["Because Word has a better model.", "Because the document is already open and Copilot reads it from there; no pasting, nothing leaves the file.", "Because chat windows cannot summarise."], answer: 1, why: "Where the work happens is where the summary should happen. The material is in front of the tool without being copied anywhere." },
      ],
    },
  },
};
