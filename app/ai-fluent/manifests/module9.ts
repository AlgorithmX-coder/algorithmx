import type { ModuleManifest, ProveItem } from "@/app/ai-cleared/engine/types";
import { AGED_DEBTORS, FINANCE_PACK } from "../desks/finance";
import { GENERAL_BLOCKS } from "../desks/general";
import { LEGAL_BLOCKS } from "../desks/legal";
import { HR_BLOCKS } from "../desks/hr";
import { SALES_BLOCKS } from "../desks/sales";
import { SUPPORT_BLOCKS } from "../desks/support";
import { OPS_BLOCKS } from "../desks/ops";
import { IT_BLOCKS } from "../desks/it";
import { LEADERSHIP_BLOCKS } from "../desks/leadership";

/* AI Fluent, Module 9 · Your real task. The capstone: one complete piece
 * of work from brief to verified output on the learner's own desk, the
 * playbook entry, then the final assessment drawn from the whole course.
 * Finance: the messy aged-debtors export into a one-page board note with
 * three actions, verified against the numbers. */

/* The shared final bank, tagged by the module each item comes from. */
const FINAL_BANK: ProveItem[] = [
  { kind: "choose", from: 1, stem: "The first reply from the tool is flat and generic. What does the fluent person do?", options: ["Conclude the tool is weak and write it themselves.", "Say what was missing, in the same chat, and read the second reply against the brief.", "Paste the same prompt into a different tool."], answer: 1, why: "The loop: say, look, fix the prompt, check. The second reply is where the work gets done." },
    { kind: "choose", from: 1, stem: "Which move does \"check\" refer to?", options: ["Asking the tool whether it is confident.", "Verifying the output against the source before anyone else sees it.", "Reading the output twice."], answer: 1, why: "A check is against the source. The tool's confidence is not evidence." },
  { kind: "choose", from: 2, stem: "Which single element most changes a reply?", options: ["A reader with a decision to make.", "A request to be concise.", "A polite opening."], answer: 0, why: "A reader with a decision shapes content, tone and length at once." },
  { kind: "choose", from: 2, stem: "A prompt asks for a summary, a reply to the client and a list of invoices. What happens?", options: ["Three good outputs.", "Three half-done outputs; ask for one thing, then the next.", "The tool refuses."], answer: 1, why: "One thing at a time. A second request waits for the next turn." },
  { kind: "choose", from: 3, stem: "Which reply does not move the work on?", options: ["Too long; under 150 words.", "Please summarise the report for the board.", "Just the two decisions."], answer: 1, why: "Restating the task is a repeat. The grader marks it as one." },
  { kind: "choose", from: 4, stem: "What is the first question to ask of a summary?", options: ["Is it correct?", "What did you leave out?", "Can it be shorter?"], answer: 1, why: "The tool does not volunteer what it cut. Asking lists it." },
  { kind: "choose", from: 5, stem: "The best way to get your firm's voice in a draft is to", options: ["ask for a professional tone.", "paste one email you wrote and say \"in this voice\".", "ask it to avoid clichés."], answer: 1, why: "One real example beats any description." },
  { kind: "choose", from: 6, stem: "A figure in the tool's analysis is not in the sheet. It is", options: ["a rounding difference.", "a guess until checked.", "probably from another sheet."], answer: 1, why: "Plausible, specific, and not in the source: a guess." },
  { kind: "choose", from: 7, stem: "How many sources do you open, as a habit?", options: ["All of them.", "Two, the ones carrying the figures.", "None; the tool checked."], answer: 1, why: "Two, always. If one does not exist, nothing in the reply is safe." },
  { kind: "choose", from: 7, stem: "The most specific-looking source in a list is", options: ["the most reliable.", "no more reliable than the others; specificity is not evidence.", "always real."], answer: 1, why: "Invented sources are specific. Open it." },
  { kind: "choose", from: 8, stem: "A template should always contain", options: ["a greeting.", "the check, written into the prompt.", "the tool's name."], answer: 1, why: "A template with the check inside is a workflow; without it, unchecked output faster." },
  { kind: "choose", from: 8, stem: "What should never become an unattended template?", options: ["The Monday recap.", "Anything that goes to a client or a regulator unread.", "A supplier chaser."], answer: 1, why: "A template without the two-minute check is a liability with your name on it." },
  { kind: "choose", from: 9, stem: "The capstone output looks finished. What happens before it goes to the board?", options: ["Send it.", "Trace every figure and name to the export, then ask the tool to mark anything not in it.", "Ask a colleague to glance at it."], answer: 1, why: "Brief in, verified output out. The verification is the work." },
];

export const FLUENT_MODULE_9: ModuleManifest = {
  n: 9,
  slug: "your-real-task",
  title: "Your real task",
  minutes: 22,
  course: "ai-fluent",
  promise: "One complete piece of work on your own desk, from brief to verified output, with the prompt saved to your playbook.",
  passMark: 8,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 9 of 9 · about 22 minutes",
      heading: "Brief in, verified output out.",
      lead: "Everything so far was a move. This is the whole loop on a real piece of your job, in the tool where it happens: say what you want with every element that matters, look, fix the prompt twice, then check the output against the source. The prompt you end with goes to your playbook, and the final assessment draws from all nine modules.",
      note: "Finance desk: the messy aged-debtors export into a one-page board note with three actions, verified against the numbers.",
      cta: "Open the brief",
    },
  ],
  tracks: {
    general: GENERAL_BLOCKS[9],
    legal: LEGAL_BLOCKS[9],
    hr: HR_BLOCKS[9],
    sales: SALES_BLOCKS[9],
    support: SUPPORT_BLOCKS[9],
    ops: OPS_BLOCKS[9],
    it: IT_BLOCKS[9],
    leadership: LEADERSHIP_BLOCKS[9],
    finance: {
      dataPack: FINANCE_PACK,
      practises: [
        {
          kind: "loop",
          task: "Turn the aged-debtors export into a one-page board note with three actions, inside Excel, in three turns.",
          brief: "The board meets Thursday. They want one page: the position in a paragraph, what changed since last month, and three actions with an owner each. Plain English; they are not all finance people. The export is open in Excel; Copilot has it. Three turns: ask, fix, finish. Then check it.",
          material: AGED_DEBTORS,
          office: "excel",
          followUp: true,
          turns: [
            { instruction: "Turn 1: the full ask. Who it is for, the shape, the length, what to flag and leave out, from the sheet.", rubric: { requires: ["reader", "task", "format", "length", "constraints", "material"], goal: "A one-page board note: position, change since last month, three actions with owners, plain English, from the export." }, placeholder: "For the board, who are not all finance people: one page with the position in a paragraph, what changed, and three actions with an owner each, under … words, from the sheet…" },
            { instruction: "Turn 2: look at it as a board member. Say what was wrong or narrow it.", placeholder: "The actions need owners; cut the invoice numbers; shorter…" },
            { instruction: "Turn 3: ask it to check every figure and name against the sheet and mark anything it stated that the sheet does not.", placeholder: "Check every figure and name in the note against the sheet and mark anything not stated in it…" },
          ],
          playbook: { workflow: "Your real task", whenToUse: "The board page, every month: reader, shape, length, what to flag, from the export; then fix, then check.", check: "Every figure and name traced to the sheet; the tool asked to mark anything the sheet does not say; the three actions each have an owner the sheet or the stand-up supports." },
        },
        {
          kind: "spot",
          task: "Here is a board note a colleague's prompt produced from the same export. One figure is wrong. Tap the sentence.",
          prompt: "One page for the board: the position, what changed, three actions with owners, under 150 words, from the sheet.",
          sentences: [
            "Position: £82,870 is outstanding across four clients; £69,900 of it is over 60 days and sits with two of them.",
            "What changed: one client has gone quiet after two statements, and one balance is now disputed pending a delivery note.",
            "Action one: a director-level call to the unresponsive client this week, owner the finance director.",
            "Action two: hold the disputed £9,850 out of the collectable total until operations produce the delivery note, owner operations.",
            "Action three: the payment plan on the oldest balance, £27,600 at 61 days, continues; two instalments received, owner credit control.",
          ],
          errorIndex: 4,
          why: "The plan balance is 92 days in the sheet, not 61; 61 belongs to the unresponsive client. Two figures from adjacent rows swapped. Only a trace back to the Days column catches it.",
          material: AGED_DEBTORS,
        },
      ],
      prove: [
        { kind: "choose", stem: "The board note's three actions have no owners. What is the fluent move?", options: ["Add owners by hand.", "Reply: each action needs an owner from the sheet or the stand-up.", "Remove the actions."], answer: 1, why: "Fix the prompt. One line, and the tool adds what it can support from the material." },
        { kind: "choose", stem: "Why does the capstone run inside Excel?", options: ["Excel is required for board notes.", "The export is the source, it is open, and Copilot drafts from it without anything being copied anywhere.", "Chat tools cannot read tables."], answer: 1, why: "Where the work happens, with the material in front of the tool." },
        { kind: "choose", stem: "What goes into the playbook at the end?", options: ["The board note.", "The prompt that produced it, with when to use it and the check that goes with it.", "The export."], answer: 1, why: "The playbook keeps prompts, not outputs. The output changes every month; the prompt is the asset." },
        { kind: "choose", stem: "A note says the plan balance is 61 days overdue; the sheet says 92. How is it found?", options: ["By reading the note carefully.", "By tracing the figure to the Days column.", "By asking the tool if it is sure."], answer: 1, why: "A swapped figure from an adjacent row reads fine. Only a trace to the cell finds it." },
      ],
    },
  },
  final: { draw: 10, fromTrack: 2, bank: FINAL_BANK },
};
