import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { AGED_DEBTORS, FINANCE_PACK } from "../desks/finance";

/* AI Fluent, Module 1 · The loop. Why the first answer is never the
 * answer, and the four moves: say, look, fix, check. The practice takes
 * a weak prompt from the learner's desk and improves it twice, with the
 * grader scoring each move. Finance desk first; the other desks follow
 * in the content phase and fall back to this one until then. */
export const FLUENT_MODULE_1: ModuleManifest = {
  n: 1,
  slug: "the-loop",
  title: "The loop",
  minutes: 18,
  course: "ai-fluent",
  promise: "Run the loop on a real piece of your job: say what you want, look, fix the prompt, check.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 1 of 9 · about 18 minutes",
      heading: "The first answer is never the answer.",
      lead: "Most people ask an AI tool once, read what comes back, and either paste it or give up. The people who get real work out of these tools do something different, and it takes about a minute longer. This module shows you the difference and has you do it on your own desk.",
      note: "You hold an AI Cleared certificate, so the safety habits are assumed here. The leak rules still run under every send.",
      cta: "Show me the difference",
    },
    {
      kind: "beforeAfter",
      eyebrow: "Learn · the same task, twice",
      heading: "Same document, same tool, two prompts.",
      lead: "On the left, the prompt most people type. On the right, the prompt someone fluent types. Read the two replies.",
      sim: { tool: "copilot", tier: "enterprise" },
      before: {
        prompt: "Summarise the aged debtors report",
        reply: "Here is a summary of the aged debtors report.\n\nThe report lists four clients with outstanding balances totalling £82,870. Some balances are older than others. One balance is disputed and one is on a payment plan. Two statements have been sent to one client. Overall there are several items that may need attention.",
        note: "True, and useless. It restates the document. Nobody could act on it, because the prompt did not say who it was for or what they needed to do.",
      },
      after: {
        prompt: "You are writing for the finance director, who has to tell the board on Thursday what to decide about debtors. From the attached export, give me a one-paragraph position, then the two items that need a decision, as two bullets with the amount and the days overdue. Under 120 words, plain English, no jargon.",
        reply: "**Position**: £82,870 outstanding across four clients; £69,900 of it is over 60 days and sits with two clients, one on an agreed plan and one unresponsive.\n\n- **Brightwater Logistics, £42,300, 61 days**: two statements ignored and their accounts contact has changed. Decide whether to escalate to a formal notice or a director-level call.\n- **Cotton & Mather, £9,850, 34 days**: disputed on delivery. Decide whether to hold the balance out of the total until operations produce the delivery note.\n\nOakhurst's £27,600 is on plan and Halcyon's £3,120 is within terms.",
        note: "Same tool, same document. The second prompt named the reader, the decision, the format and the length, and pointed the tool at the material. That is the whole course in one screen.",
      },
      revealLabel: "Show the fluent prompt",
      cta: "How did they get there?",
    },
    {
      kind: "timeline",
      eyebrow: "Learn · two ways to work",
      heading: "Ask once and paste, or run the loop.",
      lead: "Here is what most people do, and what the person on the right did.",
      before: { label: "Ask once and paste", steps: ["Type the task in a few words.", "Read the reply.", "Paste it into the document, or decide the tool is useless.", "Fix the text by hand for twenty minutes."] },
      after: { label: "The loop", steps: ["Say what you want: who it is for, what they will do with it, the format, the length.", "Look at what came back against that.", "Fix the prompt, not the output: tell the tool what was wrong or what to add.", "Check the output against the source before anyone else sees it."] },
      revealLabel: "Show the loop",
      note: "The loop is four moves. Every module in this course is one or more of them, on a real piece of your job.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · the four moves",
      heading: "Say, look, fix, check. Tap each one.",
      lead: "You will run all four in the practice that follows, on your own desk.",
      reveal: true,
      cards: [
        { title: "Say what you want", tag: "Move 1", tint: "I", body: "Who it is for, what they will do with it, what shape it takes, how long it is.", detail: "The tool cannot guess a reader or a purpose. Every element you leave out, it fills with an average. An average summary is what the left-hand prompt got." },
        { title: "Look", tag: "Move 2", tint: "I", body: "Read the reply against what you asked for, not against nothing.", detail: "Looking means holding the reply up to the reader and the purpose you named. Is this what the finance director could take into the room? If not, what is missing?" },
        { title: "Fix the prompt, not the output", tag: "Move 3", tint: "C", body: "Tell the tool what was wrong. Do not start editing the text by hand.", detail: "Editing by hand throws away the tool. Saying \"too long, and I need the amounts\" gets a better version in ten seconds and teaches you what the tool needed. Module 3 is entirely this move." },
        { title: "Check", tag: "Move 4", tint: "R", body: "Verify the output against the source before anyone else sees it.", detail: "The tool can be confidently wrong. Two minutes checking the figures and the names against the export is the difference between a good habit and a bad day. Module 8 makes this a reflex." },
      ],
      note: "Next: the practice. You start with the weak prompt and improve it twice.",
    },
  ],
  tracks: {
    finance: {
      dataPack: FINANCE_PACK,
      practise: {
        kind: "loop",
        task: "Turn a weak prompt into a fluent one, in three sends, on the month-end aged debtors export.",
        brief: "Your finance director, Helen, needs one page on debtors for Thursday's board: the position, what changed, and the two decisions she is asking for. Plain English; the board are not all finance people.",
        material: AGED_DEBTORS,
        starter: "Summarise the aged debtors report",
        followUp: true,
        turns: [
          { instruction: "Send the prompt as it stands, the one most people type, and read what comes back.", rubric: { requires: ["task"], goal: "Any summary of the export." } },
          { instruction: "Now tell {{tool}} who this is for and what they need to decide, and fix the format. Do not start again from scratch: reply to what it gave you.", rubric: { requires: ["task", "reader", "format"], goal: "A summary the finance director could take to the board, in a shape she can use." }, placeholder: "Tell it what was wrong and who it is for…" },
          { instruction: "One more pass: set the length, and say what it must flag. Then read the result against the brief.", rubric: { requires: ["task", "reader", "format", "length", "constraints"], goal: "One page: the position, what changed, the two decisions, under a stated length, plain English." }, placeholder: "Set the length and what to flag…" },
        ],
      },
      prove: [
        { kind: "choose", stem: "A colleague says the AI tool is useless because its summary just restated the report. What most likely happened?", options: ["The tool is not good at summaries.", "The prompt did not say who the summary was for or what they needed to do with it.", "The document was too long."], answer: 1, why: "A prompt with no reader and no purpose gets an average summary. The tool filled the gaps with an average." },
        { kind: "choose", stem: "The reply is too long and misses the amounts. What is the fluent move?", options: ["Edit the text by hand until it is right.", "Tell the tool: too long, and I need the amounts on each item.", "Start a new chat and type the task again."], answer: 1, why: "Fix the prompt, not the output. Saying what was wrong gets a better version in seconds and keeps the conversation." },
        { kind: "choose", stem: "Which of these is the \"say what you want\" move?", options: ["Reading the reply carefully.", "Naming the reader, the purpose, the format and the length before you send.", "Checking the figures against the source."], answer: 1, why: "Move 1 is everything you tell the tool before it starts. The other two are moves 2 and 4." },
        { kind: "choose", stem: "The tool produced a crisp one-page note with three figures in it. What happens before it goes to the board?", options: ["Nothing; it read the export, so the figures are right.", "Check the three figures and the client names against the export.", "Ask the tool if it is sure."], answer: 1, why: "Check is move 4. The tool can be confidently wrong, and asking it to confirm is not a check." },
        { kind: "choose", stem: "Why does the loop take about a minute longer than asking once?", options: ["Because you type more words in the first prompt and read the reply against them.", "Because the tool is slower with longer prompts.", "Because you have to start a new chat for each version."], answer: 0, why: "The minute goes on saying what you want and looking properly. It saves the twenty minutes of hand-editing." },
      ],
    },
  },
};
