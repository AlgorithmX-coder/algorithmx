import type { Track } from "./types";

/* The reply the simulator shows when there is no model: no key, a refusal,
 * an outage, or the offline preview. Written per module and track because
 * it must fit the task. Client-safe: it is a template, nothing more. */
export function scriptedReply(module: number, track: Track, prompt: string): string {
  const p = prompt.toLowerCase();
  if (module === 2) {
    const name = /okafor/.test(p) ? "Daniel" : "[contact name]";
    const ref = /inv[-\s]?2041/.test(p) ? "INV-2041" : "[invoice reference]";
    const amt = /18,?450/.test(p) ? "£18,450.00" : "[amount]";
    const bank = /20-45-77|31190046/.test(p) ? "Our bank details are sort code 20-45-77, account 31190046." : "Payment details are on the original invoice.";
    return `Subject: Overdue invoice ${ref}\n\nDear ${name},\n\nI hope you are well. I am writing about invoice ${ref} for ${amt}, which was due 30 days from issue and is now 40 days overdue. We have not yet received payment or heard of any query on it.\n\nCould you let me know when we can expect settlement, or tell me if anything is holding it up? ${bank}\n\nThank you for your prompt attention.\n\nKind regards,\n[Your name]`;
  }
  void track;
  return "Here is a draft based on your request. Let me know if you would like it shorter, firmer or more formal.";
}
