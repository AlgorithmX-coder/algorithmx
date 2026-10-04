import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { FINANCE_PACK, SUPPLIER_STATEMENT } from "../desks/finance";
import { GENERAL_BLOCKS } from "../desks/general";

/* AI Fluent, Module 2 · Say what you want. The eight elements of a prompt
 * and what each one changes. The practice rewrites one desk task three
 * times, adding elements each time, in a fresh chat each send so the
 * difference is the prompt alone. */
export const FLUENT_MODULE_2: ModuleManifest = {
  n: 2,
  slug: "say-what-you-want",
  title: "Say what you want",
  minutes: 22,
  course: "ai-fluent",
  promise: "Write a prompt that carries the reader, the format, the length and the constraints, so the first reply is close.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 2 of 9 · about 22 minutes",
      heading: "The tool fills every gap with an average.",
      lead: "Leave out the reader and it writes for nobody. Leave out the length and it writes a page. Leave out the format and it picks one. This module names the eight things a prompt can carry, shows what each one changes, and has you build a prompt up element by element on your own desk.",
      cta: "Show me the eight",
    },
    {
      kind: "cards",
      eyebrow: "Learn · the eight elements",
      heading: "Eight things a prompt can say. Tap each one.",
      lead: "You will rarely need all eight. You will always need more than one.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Role", tag: "1", tint: "I", body: "Who the tool is writing as.", detail: "\"You are writing as the firm's credit controller.\" The role sets vocabulary and stance. Without it the tool writes as a helpful generalist." },
        { title: "Reader", tag: "2", tint: "I", body: "Who the output is for, and what they will do with it.", detail: "\"For the finance director, who has to decide what to escalate.\" The single most powerful element. A reader with a decision to make shapes everything else." },
        { title: "Task", tag: "3", tint: "I", body: "One verb, one object.", detail: "Summarise this. Draft that. Compare these two. A task with two verbs gets a muddle; ask for one thing, then the next." },
        { title: "Format", tag: "4", tint: "I", body: "The shape the reader will use.", detail: "A table, three bullets, an email with a subject line, a memo with headings. Name it and the tool stops guessing." },
        { title: "Length", tag: "5", tint: "C", body: "A number.", detail: "\"Under 120 words.\" \"Five bullets.\" \"One page.\" Length is the element people leave out most and regret most." },
        { title: "Constraints", tag: "6", tint: "C", body: "Tone, what to include, what to leave out.", detail: "Plain English. No jargon. Flag anything disputed. British spelling. Do not mention the plan. Each one removes a wrong reply." },
        { title: "Material", tag: "7", tint: "C", body: "Point the tool at what it needs.", detail: "\"From the attached statement.\" \"Using the three rows below.\" If the material is not in front of it, the tool invents something plausible. That is Module 7." },
        { title: "One thing at a time", tag: "8", tint: "R", body: "One request per prompt.", detail: "\"Summarise this and then also draft an email and list the invoices\" gets three half-done things. Ask, look, then ask the next." },
      ],
      note: "The grader in this course scores exactly these eight. Each practice tells you which ones it is looking for.",
    },
    {
      kind: "beforeAfter",
      eyebrow: "Learn · adding a format",
      heading: "Add one element and watch the reply change shape.",
      lead: "Same supplier statement. The second prompt adds a format and a reader. Nothing else.",
      sim: { tool: "copilot", tier: "enterprise" },
      before: {
        prompt: "What does this supplier statement say?",
        reply: "This supplier statement from Penrose Office Supplies shows a balance brought forward of £2,140, five invoices this month totalling £3,865, payments received of £2,140, and a balance carried forward of £3,865. The items include stationery, printer consumables, chairs, more stationery and a franking credit. Terms are thirty days with a two percent early settlement discount within ten days.",
        note: "Accurate, and it is just the statement read back to you. You still have to do the work.",
      },
      after: {
        prompt: "For the finance director, who will decide whether to pay early for the discount: a list of each item and its amount, then one line on what the 2% early settlement would save and by when it must be paid.",
        reply: "**Items on the statement**\n\n- PO-8891 stationery: £412\n- PO-8894 printer consumables: £1,208\n- PO-8897 chairs: £1,540\n- PO-8902 stationery: £385\n- PO-8905 franking credit: £320\n\n**Early settlement**: paying the £3,865 within ten days of invoice saves £77.30. The ten-day window on this month's invoices closes on the 10th.",
        note: "A reader with a decision, a format and one extra ask. The reply is something the finance director can act on in ten seconds.",
      },
      revealLabel: "Show it with a reader and a format",
      cta: "And constraints?",
    },
    {
      kind: "beforeAfter",
      eyebrow: "Learn · adding constraints",
      heading: "Constraints remove the wrong replies before they arrive.",
      lead: "Same prompt as before, with a length, a tone and one thing to flag.",
      sim: { tool: "copilot", tier: "enterprise" },
      before: {
        prompt: "Draft a note to the supplier about this statement.",
        reply: "Dear Penrose Office Supplies,\n\nThank you for sending through your statement for September. We have reviewed the items listed and note the balance carried forward of £3,865. We appreciate your continued service and will arrange payment in accordance with our usual terms. Please do not hesitate to contact us if you have any questions.\n\nKind regards",
        note: "Polite, generic, and it does not say the one thing that matters: the chairs have not arrived.",
      },
      after: {
        prompt: "Draft a short email to the supplier, under 80 words, plain and friendly, acknowledging the September statement and saying we will pay everything except PO-8897 for the chairs, which have not been delivered yet, and asking for a delivery date.",
        reply: "Subject: September statement, PO-8897\n\nHello,\n\nThanks for the September statement. We will pay the four stationery and consumables items this week. We are holding PO-8897 (chairs, £1,540) until the delivery arrives; could you let us know the expected date?\n\nBest wishes,\nAccounts",
        note: "Under 80 words, friendly, and it says the one thing. Every constraint you give is a wrong reply you will not get.",
      },
      revealLabel: "Show it with constraints",
      cta: "Try the switches",
    },
    {
      kind: "toggles",
      eyebrow: "Learn · three switches",
      heading: "Flip each one and read what it changes.",
      lead: "The three elements people skip most, and what skipping each one costs.",
      toggles: [
        { label: "Name the reader", off: "Off: the tool writes for a general reader. Everything is explained, nothing is decided, and the finance director reads three paragraphs to find the one line she needed.", on: "On: the tool writes for her. Jargon she knows stays in, background she knows goes out, and the decision she has to make is the first line." },
        { label: "State the length", off: "Off: the tool decides. For a summary that is usually a page; for an email, four paragraphs. You cut it by hand, which is the work you were trying to avoid.", on: "On: the tool fits the space you have. \"Under 100 words\" produces 90, and the editing is gone." },
        { label: "Give an example", off: "Off: the tool guesses your house style. Its guess is a sensible average of everyone's house style, which is nobody's.", on: "On: paste one paragraph you wrote last month and say \"in this voice\". The reply matches it. One example beats three adjectives." },
      ],
      note: "Next: the practice. Three sends, each adding elements to the one before, in a fresh chat each time.",
    },
  ],
  tracks: {
    general: GENERAL_BLOCKS[2],
    finance: {
      dataPack: FINANCE_PACK,
      practise: {
        kind: "loop",
        task: "Rewrite one prompt three times, adding elements each time, and watch the reply close in on what you need.",
        brief: "The finance director wants to know whether to take the supplier's early settlement discount this month, and whether anything on the statement should be held back. Each send starts a fresh chat, so the reply reflects your prompt alone.",
        material: SUPPLIER_STATEMENT,
        followUp: false,
        turns: [
          { instruction: "Send 1: the task and the reader only. Say what you want done and who it is for.", rubric: { requires: ["task", "reader"], goal: "A reply aimed at the finance director's decision on the early settlement discount." }, placeholder: "Who is it for, and what do you want done…" },
          { instruction: "Send 2: the same ask, now with a format and a length. Write the whole prompt again; this is a fresh chat.", rubric: { requires: ["task", "reader", "format", "length"], goal: "The same decision, in a shape and a size the finance director can use." }, placeholder: "Add the format and the length…" },
          { instruction: "Send 3: the same ask, now with constraints and the material named. Tell it what to flag and what to leave out, and point it at the statement.", rubric: { requires: ["task", "reader", "format", "length", "constraints", "material"], goal: "A complete prompt: the decision, the shape, the size, what to flag, from the statement." }, placeholder: "Add what to flag, what to leave out, and name the statement…" },
        ],
      },
      prove: [
        { kind: "choose", stem: "A reply is accurate but three paragraphs long and the finance director wanted one line. Which element was missing?", options: ["Role", "Length", "Material"], answer: 1, why: "Length is the element people skip most. A number in the prompt would have produced one line." },
        { kind: "choose", stem: "\"Summarise this statement and then draft a reply to the supplier and list what we owe.\" What is wrong with this prompt?", options: ["Nothing; it is efficient.", "Three asks in one prompt; each gets half done. Ask for one, then the next.", "It should name the tool."], answer: 1, why: "One thing at a time. The tool does three tasks badly where it would do one well." },
        { kind: "choose", stem: "Which of these is the strongest single element to add to a weak prompt?", options: ["A role, so the tool sounds professional.", "A reader with a decision to make.", "A request to be concise."], answer: 1, why: "A reader with a decision shapes the content, the tone and the length at once. The other two shape only the surface." },
        { kind: "choose", stem: "You want a reply in your firm's house style. What works best?", options: ["Say \"use our house style\".", "Paste one paragraph you wrote and say \"in this voice\".", "Ask it to be formal and professional."], answer: 1, why: "The tool has never seen your house style. One real example beats any number of adjectives." },
        { kind: "choose", stem: "Why does the practice start a fresh chat for each send?", options: ["Because the tool forgets after one reply.", "So the reply reflects your prompt alone, with nothing carried from the send before.", "Because a long chat costs more."], answer: 1, why: "In Module 3 the conversation is kept on purpose. Here the point is to see what each element changes by itself." },
      ],
    },
  },
};
