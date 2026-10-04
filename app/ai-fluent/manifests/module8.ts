import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { FINANCE_PACK, MONTH_END_STANDUP } from "../desks/finance";

/* AI Fluent, Module 8 · Verify and automate. The two-minute check before
 * anything leaves, and where a repeatable prompt becomes a template.
 * Two practices in Copilot inside Teams: a reusable recap prompt run
 * twice, then verify the second output against the transcript. */
export const FLUENT_MODULE_8: ModuleManifest = {
  n: 8,
  slug: "verify-and-automate",
  title: "Verify and automate",
  minutes: 20,
  course: "ai-fluent",
  promise: "Make the two-minute check a reflex, and turn the prompt you use every week into a template with slots.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 8 of 9 · about 20 minutes",
      heading: "Two minutes, every time, before it leaves.",
      lead: "Everything in this course ends the same way: the output is checked against the source before anyone else sees it. This module makes that a two-minute routine, then shows where a prompt you run every week should become a template, and where it should not.",
      note: "The practice runs inside Teams, on a meeting recap.",
      cta: "Show me the two minutes",
    },
    {
      kind: "timeline",
      eyebrow: "Learn · the two-minute check",
      heading: "What checking looks like when it takes two minutes.",
      lead: "Not re-reading everything. Four fixed moves, in order.",
      before: { label: "What people think checking is", steps: ["Read the whole output again.", "Feel reasonably confident.", "Send it."] },
      after: { label: "The two-minute check", steps: ["Names and figures: every one traced to the source. A name the source does not contain is a guess.", "Dates and owners: every action has a who and a when that the source supports.", "The one thing: does the output do the job the brief set? Read the first two lines as the reader.", "Ask the tool: \"Mark anything above that is not stated in the source.\" Then read what it marks."] },
      revealLabel: "Show the four moves",
      note: "Two minutes is the budget. If it takes longer, the output was too long for its purpose.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · what to automate",
      heading: "What becomes a template, and what never should. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Repeatable", tag: "Template", tint: "I", body: "The same task every week with different inputs.", detail: "The Monday recap, the month-end summary, the supplier chaser. Write the prompt once with slots, [meeting], [reader], [date], and fill the slots." },
        { title: "Low stakes if wrong", tag: "Template", tint: "I", body: "A draft someone reads before it goes anywhere.", detail: "A template produces a first version. If a wrong first version costs a correction, automate it. If it costs a client, do not." },
        { title: "Checkable", tag: "Template", tint: "C", body: "The output can be checked against a source in two minutes.", detail: "A recap against a transcript, a summary against a document. If there is no source to check against, there is no way to know it is wrong." },
        { title: "Never", tag: "Not a template", tint: "R", body: "Anything that goes to a client or a regulator unread.", detail: "A template plus a two-minute check is a workflow. A template without the check is a liability with your name on it. Agents and scheduled prompts are this with the human taken out: Cleared's Module 5 is why your firm decides where they run." },
      ],
      note: "Next: write the recap prompt once with slots, run it twice, then check the second run against the transcript.",
    },
    {
      kind: "compare",
      eyebrow: "Learn · a one-off prompt, a template",
      heading: "The same prompt, written to be reused.",
      lead: "On the left, the prompt as it was typed on Monday. On the right, the same prompt with slots, saved to the playbook.",
      before: { label: "Typed on Monday", parts: [{ text: "Recap the month-end stand-up for Helen, who missed it: three bullets on what was decided, then actions with owner and date, under 100 words, flag anything blocked." }] },
      after: { label: "Saved as a template", parts: [{ text: "Recap the " }, { text: "[meeting]", mark: "placeholder" }, { text: " for " }, { text: "[reader, who missed it]", mark: "placeholder" }, { text: ": three bullets on what was decided, then actions as a list with owner and date, under " }, { text: "[length]", mark: "placeholder" }, { text: " words, flag anything blocked. Check: every owner and date is in the transcript." }], note: "Three slots and the check written into the prompt. Next Monday it takes ten seconds and the check is already in it." },
      revealLabel: "Show the template",
      cta: "Run it twice",
    },
  ],
  tracks: {
    finance: {
      dataPack: FINANCE_PACK,
      practise: {
        kind: "loop",
        task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
        brief: "Helen missed the stand-up and wants a recap: what was decided, then the actions with an owner and a date each. You will run the same template twice, the second time for a different reader, in a fresh chat each time.",
        material: MONTH_END_STANDUP,
        office: "teams",
        followUp: false,
        turns: [
          { instruction: "Send 1: the template, filled in for Helen. Name the reader, the shape (decisions, then actions with owner and date), the length, what to flag, and write the check into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap for the finance director: decisions as bullets, actions with owner and date, under a stated length, anything blocked flagged, every owner and date from the transcript." }, placeholder: "Recap the month-end stand-up for Helen, who missed it: three bullets on what was decided, then actions with owner and date, under … words, flag anything blocked. Check: …" },
          { instruction: "Send 2: the same template, filled in for Dev, who was there and only needs his own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Dev's actions, with dates, under a stated length." }, placeholder: "Recap the month-end stand-up for Dev, who was there and needs only his own actions…" },
        ],
        playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
      },
      practises: [
        {
          kind: "loop",
          task: "Write the recap prompt once with slots, run it twice inside Teams, then check the second run against the transcript.",
          brief: "Helen missed the stand-up and wants a recap: what was decided, then the actions with an owner and a date each. You will run the same template twice, the second time for a different reader, in a fresh chat each time.",
          material: MONTH_END_STANDUP,
          office: "teams",
          followUp: false,
          turns: [
            { instruction: "Send 1: the template, filled in for Helen. Name the reader, the shape (decisions, then actions with owner and date), the length, what to flag, and write the check into the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "A recap for the finance director: decisions as bullets, actions with owner and date, under a stated length, anything blocked flagged, every owner and date from the transcript." }, placeholder: "Recap the month-end stand-up for Helen, who missed it: three bullets on what was decided, then actions with owner and date, under … words, flag anything blocked. Check: …" },
            { instruction: "Send 2: the same template, filled in for Dev, who was there and only needs his own actions. Change the slots, not the prompt.", rubric: { requires: ["reader", "format", "length", "constraints", "material"], goal: "The same shape for a different reader: only Dev's actions, with dates, under a stated length." }, placeholder: "Recap the month-end stand-up for Dev, who was there and needs only his own actions…" },
          ],
          playbook: { workflow: "Automate", whenToUse: "A task you do every week with different inputs: write it once with slots for the meeting, the reader and the length, and write the check into the prompt.", check: "Every owner and date traced to the transcript; ask the tool to mark anything not stated in the source." },
        },
        {
          kind: "spot",
          task: "Here is the recap a colleague's template produced. Check it against the transcript: one action has a detail the transcript does not support. Tap it.",
          prompt: "Recap the month-end stand-up for Helen: decisions, then actions with owner and date, under 100 words.",
          sentences: [
            "Decided: the largest overdue account escalates to a director-level call this week if no contact is found by Thursday.",
            "Decided: the disputed balance stays out of the board total until the delivery note is found.",
            "Action: Sam chases a new accounts contact at the unresponsive client.",
            "Action: Dev goes through the Friday run sheets and finds the delivery note by Friday.",
            "Action: Helen drafts the board page.",
          ],
          errorIndex: 3,
          why: "The transcript has Dev finding the delivery note by Wednesday, not Friday. A date two days out is exactly the kind of error that survives a read-through and fails a two-minute check: trace every date to the source.",
          material: MONTH_END_STANDUP,
        },
      ],
      prove: [
        { kind: "choose", stem: "What are the four moves of the two-minute check?", options: ["Read it twice, spell-check, send, file.", "Names and figures to the source; dates and owners supported; the one thing done; ask the tool to mark what is not in the source.", "Ask the tool if it is sure, then send."], answer: 1, why: "Four fixed moves, in order, against the source. Not a re-read and a feeling." },
        { kind: "choose", stem: "Which task should become a template?", options: ["A letter to a regulator that goes out unread.", "The Monday meeting recap that a colleague reads before it is shared.", "A one-off apology to a client."], answer: 1, why: "Repeatable, low stakes if wrong, checkable against a transcript. All three tests pass." },
        { kind: "choose", stem: "What belongs in a template besides the slots?", options: ["A greeting.", "The check, written into the prompt.", "The date it was written."], answer: 1, why: "A template with the check inside it is a workflow. Without it, it is a way to produce unchecked output faster." },
        { kind: "choose", stem: "A recap says an action is due Friday; the transcript says Wednesday. How was it caught?", options: ["By re-reading the recap.", "By tracing every date in the output to the transcript.", "It would not be caught; the tool is usually right."], answer: 1, why: "A plausible wrong date survives a read-through. Tracing to the source is the only check that finds it." },
        { kind: "choose", stem: "Where does a scheduled prompt or an agent that runs without a person sit?", options: ["Anywhere; they are just templates.", "Only where the firm has decided it can run, because the two-minute check is gone.", "Nowhere; they are banned."], answer: 1, why: "An agent is a template with the human taken out. The firm decides where that is acceptable; Cleared's Module 5 is that decision." },
      ],
    },
  },
};
