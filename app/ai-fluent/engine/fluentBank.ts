import type { Tool } from "@/app/ai-cleared/engine/types";
import type { FluentVerdict } from "./grading";

/* The Fluent grader eval bank: forty practice submissions through Module
 * 1's loop on the Finance desk, with the verdict the rubric must give.
 * Ten fluent, ten nearly, ten not yet, ten that the leak layer must stop
 * before any rubric score. The rubric per send: send 1 requires task;
 * send 2 task, reader, format; send 3 task, reader, format, length,
 * constraints. Every name and number is from the invented Finance pack,
 * except the "real" items in the halt cases, which are deliberately NOT
 * in the pack. */

export interface FluentCase {
  id: string;
  tool: Tool;
  /* The learner's sends so far; the last is graded against its send's rubric. */
  turns: string[];
  /* The verdict the rubric must produce, or how the leak layer must stop it. */
  verdict: FluentVerdict | "leak" | "halt";
  note: string;
}

const T1 = "Summarise the aged debtors report";
const T2 = "That restates the export. This is for the finance director, who needs to tell the board what to decide. Give me a short position paragraph and then the items needing a decision as bullets.";

export const FLUENT_BANK: FluentCase[] = [
  /* ── Fluent ─────────────────────────────────────────────── */
  { id: "flu-01", tool: "copilot", turns: [T1], verdict: "fluent", note: "Send 1 needs only a task; the weak prompt has one." },
  { id: "flu-02", tool: "copilot", turns: ["Give me a summary of the attached debtors export."], verdict: "fluent", note: "Send 1, a task with the material named." },
  { id: "flu-03", tool: "copilot", turns: [T1, T2], verdict: "fluent", note: "Send 2 adds the reader and the format and moves on." },
  { id: "flu-04", tool: "copilot", turns: [T1, "Too generic. It is for the board, who are not finance people: a one-paragraph position then two bullets, one per client that needs a decision, with the amount and days overdue."], verdict: "fluent", note: "Send 2 with reader, format and a specific ask." },
  { id: "flu-05", tool: "copilot", turns: [T1, T2, "Keep it under 120 words, plain English, and flag the disputed balance and the one on a payment plan separately."], verdict: "fluent", note: "Send 3 adds length and constraints." },
  { id: "flu-06", tool: "copilot", turns: [T1, T2, "Good. Now under 100 words for the board, one paragraph and two bullets, no jargon, and say explicitly which two decisions you are asking them to make."], verdict: "fluent", note: "Send 3, all five elements, moved." },
  { id: "flu-07", tool: "chatgpt", turns: ["You are writing for a finance director. From the export below, summarise the debtors position for the board in one paragraph."], verdict: "fluent", note: "Send 1 on ChatGPT with the material pasted." },
  { id: "flu-08", tool: "copilot", turns: [T1, "Shorter, for the finance director, as a two-column table: client, amount, days overdue, what she should decide."], verdict: "fluent", note: "Send 2: reader and a table format." },
  { id: "flu-09", tool: "copilot", turns: [T1, T2, "Cut it to 90 words. British spelling, no bullet longer than one line, and mark the disputed item with the word disputed."], verdict: "fluent", note: "Send 3 with a word limit and three constraints." },
  { id: "flu-10", tool: "gemini", turns: ["Summarise the debtors export I pasted for my finance director, as three bullets she can read before the board meeting."], verdict: "fluent", note: "Send 1 that already carries reader and format." },

  /* ── Nearly ─────────────────────────────────────────────── */
  { id: "nea-01", tool: "copilot", turns: [T1, "Make it shorter and clearer, as bullets."], verdict: "nearly", note: "Send 2 with format but no reader: one element missing." },
  { id: "nea-02", tool: "copilot", turns: [T1, "This is for the finance director. Make it more useful for her."], verdict: "nearly", note: "Send 2 with a reader but no format." },
  { id: "nea-03", tool: "copilot", turns: [T1, T2, "Under 120 words."], verdict: "nearly", note: "Send 3 sets the length but gives no constraints: one element missing." },
  { id: "nea-04", tool: "copilot", turns: [T1, T2, "Keep the reader and the bullets as they are; just flag the disputed one."], verdict: "nearly", note: "Send 3 with constraints but no length." },
  { id: "nea-05", tool: "copilot", turns: [T1, "Please summarise the aged debtors report for me."], verdict: "nearly", note: "Send 2 repeats send 1: the turn did not move." },
  { id: "nea-06", tool: "copilot", turns: [T1, T2, "Now also draft an email to Brightwater's new accounts contact about their balance, and summarise the Cotton & Mather dispute, under 120 words each."], verdict: "leak", note: "Send 3 names two clients: the leak layer stops it before scope is scored." },
  { id: "nea-07", tool: "copilot", turns: [T1, "For the board: a position paragraph, then the items that need deciding as bullets, then also list every invoice number."], verdict: "nearly", note: "Send 2 with reader and format but two asks in one." },
  { id: "nea-08", tool: "claude", turns: ["Write a summary for the finance director."], verdict: "fluent", note: "Send 1: task present; nothing else is required yet." },
  { id: "nea-09", tool: "copilot", turns: [T1, T2, "Under 120 words, and for the board, as one paragraph and two bullets."], verdict: "nearly", note: "Send 3 with length, reader and format but no constraints." },
  { id: "nea-10", tool: "copilot", turns: [T1, "Can you do this as a table for the finance director? Columns: client, amount, days, decision."], verdict: "fluent", note: "A question that still carries reader and format." },

  /* ── Not yet ────────────────────────────────────────────── */
  { id: "not-01", tool: "copilot", turns: [T1, "No, try again."], verdict: "notyet", note: "Send 2 with nothing added: reader and format both missing." },
  { id: "not-02", tool: "copilot", turns: [T1, "Summarise the aged debtors report"], verdict: "notyet", note: "Send 2 identical to send 1: repeated, and two elements missing." },
  { id: "not-03", tool: "copilot", turns: [T1, T2, "Thanks, that is fine."], verdict: "notyet", note: "Send 3 with nothing: four elements missing." },
  { id: "not-04", tool: "copilot", turns: [T1, "Make it better."], verdict: "notyet", note: "Vague send 2." },
  { id: "not-05", tool: "copilot", turns: [T1, "What is the weather like in Leeds today?"], verdict: "notyet", note: "Send 2 wanders to another task." },
  { id: "not-06", tool: "copilot", turns: [T1, T2, "Longer please, with everything in the export included."], verdict: "notyet", note: "Send 3 gives a direction but no length, no reader, no format, no constraints." },
  { id: "not-07", tool: "copilot", turns: [T1, "Who is the finance director?"], verdict: "notyet", note: "A question, not a move." },
  { id: "not-08", tool: "copilot", turns: [T1, T2, "Summarise the aged debtors report"], verdict: "notyet", note: "Send 3 repeats send 1 and drops every element." },
  { id: "not-09", tool: "chatgpt", turns: ["hi"], verdict: "notyet", note: "No task at all." },
  { id: "not-10", tool: "copilot", turns: [T1, "ok now do it properly"], verdict: "notyet", note: "Send 2 with no reader, no format." },

  /* ── The leak layer stops these before any rubric score ───── */
  { id: "lek-01", tool: "chatgpt", turns: ["Summarise the debtors position: Brightwater Logistics owes £42,300 and has gone quiet."], verdict: "leak", note: "A client named on ChatGPT." },
  { id: "lek-02", tool: "copilot", turns: [T1, "For the board: a position and two bullets. Mention that Nadia Ferreira has not replied."], verdict: "leak", note: "A client contact named." },
  { id: "lek-03", tool: "copilot", turns: ["Write a chaser referencing our bank details 40-12-88 71203344."], verdict: "leak", note: "Bank details in the prompt: RESTRICTED." },
  { id: "lek-04", tool: "copilot", turns: [T1, "Add a line that Sam Whitlow, on £38,500, will chase it."], verdict: "leak", note: "A salary in the prompt." },
  { id: "lek-05", tool: "gemini", turns: ["Summarise Cotton & Mather's dispute for the finance director in three bullets."], verdict: "leak", note: "A client named on Gemini." },
  { id: "lek-06", tool: "copilot", turns: ["Summarise the export; the Halcyon Dental contact is Priya Menon."], verdict: "leak", note: "Client and contact named." },
  { id: "lek-07", tool: "copilot", turns: ["Draft a note to Oakhurst Fabrics about their payment plan."], verdict: "leak", note: "A client named." },
  { id: "lek-08", tool: "copilot", turns: ["Summarise the debtors export and email it to n.ferreira@brightwater-logistics.example."], verdict: "leak", note: "A client email address." },
  { id: "lek-09", tool: "copilot", turns: ["Summarise the export. Our sort code is 12-34-56 and account 98765432 for the footer."], verdict: "halt", note: "Bank details that are NOT in the pack: real data, halted before anything." },
  { id: "lek-10", tool: "copilot", turns: ["Summarise the export for Jane whose NI number is AB123456C."], verdict: "halt", note: "A National Insurance number not in the pack: halted." },
];
