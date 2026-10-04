import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { AGED_DEBTORS, FINANCE_PACK } from "../desks/finance";
import { GENERAL_BLOCKS } from "../desks/general";

/* AI Fluent, Module 3 · Fix the prompt, not the output. Iterating: telling
 * the tool what was wrong, asking for options, narrowing, asking it to
 * check itself. The practice is a three-turn conversation scored on
 * whether each turn moved the work forward. */
export const FLUENT_MODULE_3: ModuleManifest = {
  n: 3,
  slug: "fix-the-prompt",
  title: "Fix the prompt, not the output",
  minutes: 20,
  course: "ai-fluent",
  promise: "When the reply is wrong, tell the tool what was wrong and get a better one in ten seconds, instead of editing by hand for twenty minutes.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 3 of 9 · about 20 minutes",
      heading: "The second reply is where the work gets done.",
      lead: "Nobody writes a perfect prompt first time, and nobody needs to. The people who get real work out of these tools reply to the reply: too long, wrong reader, missing the amounts, try it as a table. Each turn takes ten seconds and the tool keeps everything it already understood. This module is that move.",
      cta: "Show me the two ways",
    },
    {
      kind: "compare",
      eyebrow: "Learn · two ways to handle a wrong reply",
      heading: "Edit the output by hand, or fix the prompt.",
      lead: "The reply to \"draft the board page on debtors\" came back at 400 words with no amounts. Here is what most people do, and what the fluent person does.",
      before: { label: "Edit by hand", parts: [{ text: "Copy the 400 words into Word. Delete two paragraphs. Hunt for the amounts in the export and type them in. Rewrite the opening. Twenty minutes, and the next time you need the same page you start from nothing." }] },
      after: { label: "Fix the prompt", parts: [{ text: "Reply in the same chat: " }, { text: "\"Too long and no amounts. Under 150 words, and put the amount and the days overdue on each item. Keep the position paragraph.\"", mark: "placeholder" }, { text: " Ten seconds. The tool keeps the reader, the structure and everything it read; it changes only what you named." }], note: "The tool is a colleague who drafted something. You would not silently rewrite a colleague's draft; you would say what was wrong." },
      revealLabel: "Show the fluent way",
      cta: "The four moves",
    },
    {
      kind: "cards",
      eyebrow: "Learn · four ways to iterate",
      heading: "Four replies that always move the work on. Tap each.",
      lead: "Every one of these is a sentence. None of them restates the task.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Say what was wrong", tag: "Move", tint: "I", body: "\"Too long.\" \"Wrong reader.\" \"You missed the disputed item.\"", detail: "The most common and the most useful. Name the fault, not the whole task. The tool fixes that and keeps the rest." },
        { title: "Ask for options", tag: "Move", tint: "I", body: "\"Give me three versions of the opening line.\"", detail: "When you know something is off but not what, ask for three and pick. Choosing is faster than describing." },
        { title: "Narrow", tag: "Move", tint: "C", body: "\"Just the two items that need a decision, nothing else.\"", detail: "Replies drift wide. Narrowing pulls the tool back to the one thing the reader needs. Often the whole fix." },
        { title: "Ask it to check itself", tag: "Move", tint: "R", body: "\"Check every figure against the export and tell me any that do not match.\"", detail: "The tool is good at checking its own work when asked and poor at doing it unasked. This is the bridge to Module 8." },
      ],
      note: "What does not move the work on: pasting the original prompt again, or saying \"try again\" with nothing added. The grader calls that a repeat.",
    },
    {
      kind: "timeline",
      eyebrow: "Learn · a conversation that converges",
      heading: "Three turns, and the page is done.",
      lead: "Here is the whole exchange for the board page, turn by turn.",
      before: { label: "What people fear", steps: ["Ask for the page.", "Get something wrong.", "Argue with it for ten turns.", "Give up and write it yourself."] },
      after: { label: "What actually happens", steps: ["Ask for the page, with the reader and the format.", "Too long and no amounts: say so. Second reply has both.", "Narrow: just the two decisions, and flag the disputed one. Third reply is the page.", "Ask it to check its figures against the export. One correction. Done, in under three minutes."] },
      revealLabel: "Show the real exchange",
      note: "Each turn adds one thing. That is why it converges.",
    },
  ],
  tracks: {
    general: GENERAL_BLOCKS[3],
    finance: {
      dataPack: FINANCE_PACK,
      practise: {
        kind: "loop",
        task: "Get the board page on debtors right in three turns, by replying to the reply.",
        brief: "The finance director needs one page for Thursday: the position, what changed, the two decisions. Ask for it once with the reader and the format, then fix whatever comes back, twice. The conversation is kept: do not start again.",
        material: AGED_DEBTORS,
        followUp: true,
        turns: [
          { instruction: "Turn 1: ask for the page, naming the reader and the format. Then read what comes back against the brief.", rubric: { requires: ["task", "reader", "format"], goal: "A first draft of the board page." }, placeholder: "Ask for the page, for the finance director, in a shape she can use…" },
          { instruction: "Turn 2: say what was wrong, or narrow it. Do not restate the task.", placeholder: "Too long? Missing the amounts? Wrong emphasis? Say so…" },
          { instruction: "Turn 3: one more move. Narrow again, ask for options, or ask it to check its figures against the export.", placeholder: "Narrow, ask for options, or ask it to check itself…" },
        ],
      },
      prove: [
        { kind: "choose", stem: "The reply is right in substance but twice too long. What is the fluent move?", options: ["Delete half of it by hand.", "Reply: too long, under 150 words, keep the two decisions.", "Start a new chat with a better prompt."], answer: 1, why: "Say what was wrong. The tool keeps everything else and fixes the length in ten seconds." },
        { kind: "choose", stem: "Which of these replies does NOT move the work on?", options: ["Just the two items that need a decision.", "Give me three versions of the opening.", "Please summarise the aged debtors report for the board."], answer: 2, why: "That restates the task. The grader marks it as a repeat, because nothing new was said." },
        { kind: "choose", stem: "You know the opening line is wrong but cannot say why. Best move?", options: ["Ask for three versions and pick one.", "Ask it to be more professional.", "Rewrite the line yourself."], answer: 0, why: "Choosing is faster than describing. Options are for exactly this moment." },
        { kind: "choose", stem: "Why keep the conversation rather than start a new chat each time?", options: ["Because a new chat costs more.", "Because the tool keeps the reader, the structure and what it read; you only change what you name.", "Because the tool refuses new chats on the same topic."], answer: 1, why: "A kept conversation is why iterating is cheap. Everything already understood stays understood." },
        { kind: "choose", stem: "The third reply looks finished. What is the last move before it goes to the board?", options: ["Send it.", "Ask the tool to check every figure against the export and report any that do not match.", "Ask the tool if it is happy with it."], answer: 1, why: "Ask it to check itself, against the source. The tool is good at this when asked, and asking \"are you sure\" is not a check." },
      ],
    },
  },
};
