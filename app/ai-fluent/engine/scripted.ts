import { detectElements } from "./rubric";

/* The reply a Fluent simulator shows when there is no model: the offline
 * preview, a refusal, an outage. It reads the prompt for the elements the
 * course teaches and answers in kind, so the loop is visible even
 * without a model: a bare prompt gets a flat reply, a shaped one gets a
 * shaped reply. Client-safe. */
export function fluentScriptedReply(prompt: string, turn: number, material?: string): string {
  const e = detectElements(prompt);
  const shaped = [e.reader, e.format, e.length, e.constraints].filter(Boolean).length;
  const topic = material ? "the document you attached" : "your request";
  if (shaped === 0) {
    return `Here is a summary of ${topic}.\n\nThe material covers several items with dates, amounts and statuses. Some items are current and some are older. There are a few points that may need attention, and overall the position is broadly as expected. Let me know if you would like more detail on any part.`;
  }
  if (shaped <= 2) {
    return `Here is a version aimed at the reader you named.\n\n- The overall position, in one line.\n- The two items that stand out, with their amounts.\n- One thing that needs a decision.\n\nTell me the length or the format you want and I will tighten it.`;
  }
  return `**Position**: broadly on track; two items need a decision this week.\n\n1. The largest overdue item is now beyond the normal terms and needs a call, not another letter.\n2. One balance is disputed and should be held back from the total until it is resolved.\n3. Everything else is within terms.\n\n**Decision needed**: whether to escalate item 1 to a formal notice.${turn > 1 ? "\n\nThis version keeps the length you set and flags what you asked me to flag." : ""}`;
}
