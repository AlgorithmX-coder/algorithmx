import type { DataClass, Tool, Track, Verdict } from "./types";

/* The grader eval bank: forty prompts a learner might really type into
 * the Module 2 sandbox, ten per desk, with the verdict the rules layer
 * must give. The unit test holds the rules layer to it on every CI run;
 * the eval script holds the model layer to it whenever a key is present.
 * Every name and number is from the invented practice packs, except the
 * "real" items in the halt cases, which are deliberately NOT in any pack. */

export interface EvalCase {
  id: string;
  track: Track;
  tool: Tool;
  prompt: string;
  /* The verdict the rules layer must produce. */
  verdict: Verdict;
  /* Classes that must appear among the findings. */
  classes: DataClass[];
  /* The browser and the server both halt before any grading. */
  halted?: string;
  /* What a learner meant to do, for the eval report. */
  note: string;
}

export const EVAL_BANK: EvalCase[] = [
  /* ── Finance desk ─────────────────────────────────────────── */
  { id: "fin-01", track: "finance", tool: "copilot", prompt: "Write a firm but polite email chasing an overdue invoice from a client, 40 days late, two statements already sent. Leave placeholders for the client name and the amount.", verdict: "ok", classes: [], note: "Clean by design, placeholders only." },
  { id: "fin-02", track: "finance", tool: "copilot", prompt: "Draft a polite chaser for invoice INV-2041, £18,450, now 40 days overdue. Keep the client name as a placeholder.", verdict: "ok", classes: ["I"], note: "Invoice reference and amount are INTERNAL, fine in Copilot." },
  { id: "fin-03", track: "finance", tool: "copilot", prompt: "Write an email to Daniel Okafor at Ashcombe Building Supplies chasing invoice INV-2041 for £18,450, 40 days overdue.", verdict: "warn", classes: ["C", "I"], note: "Client and contact named: over-shared." },
  { id: "fin-04", track: "finance", tool: "copilot", prompt: "Write a firm but polite email to Daniel Okafor at Ashcombe Building Supplies chasing invoice INV-2041 for £18,450, 40 days overdue. Our account is 20-45-77 31190046 if they need it.", verdict: "crit", classes: ["C", "I", "R"], note: "Bank details in the prompt: leaked." },
  { id: "fin-05", track: "finance", tool: "copilot", prompt: "Summarise the payment terms on a 30-day invoice and suggest three escalation steps for a client who has ignored two statements.", verdict: "ok", classes: [], note: "General question, nothing from the desk." },
  { id: "fin-06", track: "finance", tool: "copilot", prompt: "Hannah Price asked me to chase INV-2041. Draft the email, placeholder for the client.", verdict: "ok", classes: ["I"], note: "Colleague name and invoice reference are INTERNAL." },
  { id: "fin-07", track: "finance", tool: "copilot", prompt: "Hannah Price is on £41,200 and wants a rise before she chases any more invoices. Draft a note to the partner about it.", verdict: "crit", classes: ["I", "R"], note: "A colleague's salary is RESTRICTED." },
  { id: "fin-08", track: "finance", tool: "copilot", prompt: "Email d.okafor@ashcombe-bs.co.uk about the overdue invoice, polite but firm.", verdict: "warn", classes: ["C"], note: "Client email address: over-shared." },
  { id: "fin-09", track: "finance", tool: "chatgpt", prompt: "Chase the Ashcombe invoice, 40 days overdue, the NI number on file is QQ 12 34 56 C if you need it for the letter.", verdict: "crit", classes: ["C", "R"], note: "NI number from the pack: leaked, and on personal ChatGPT." },
  { id: "fin-10", track: "finance", tool: "copilot", prompt: "Write a chaser to the client, their contact is on 07700 900999 and the invoice is INV-2041.", verdict: "ok", classes: ["I"], halted: "a mobile number", note: "A mobile number that is NOT in the pack: real data, halted before grading." },

  /* ── Legal desk ───────────────────────────────────────────── */
  { id: "leg-01", track: "legal", tool: "copilot", prompt: "Draft a without-prejudice letter from our client to their supplier over a delayed hull refit. Placeholders for both names and no figures.", verdict: "ok", classes: [], note: "Clean by design." },
  { id: "leg-02", track: "legal", tool: "copilot", prompt: "Draft a without-prejudice letter on matter RM/0417, fee earner JKL, placeholders for the parties.", verdict: "ok", classes: ["I"], note: "Matter number and initials are INTERNAL." },
  { id: "leg-03", track: "legal", tool: "copilot", prompt: "Draft a without-prejudice letter from Redgrave Marine to Halden Fabrications about the delayed hull refit.", verdict: "warn", classes: ["C"], note: "Client and counterparty named: over-shared." },
  { id: "leg-04", track: "legal", tool: "copilot", prompt: "Draft a without-prejudice letter from Redgrave Marine to Halden Fabrications. The client will settle up to £85,000 so pitch the opening offer below that.", verdict: "crit", classes: ["C", "R"], note: "Settlement ceiling is RESTRICTED: leaked." },
  { id: "leg-05", track: "legal", tool: "copilot", prompt: "Summarise the witness statement from Tom Bryce, including the part about his back injury, in three bullet points.", verdict: "crit", classes: ["C", "R"], note: "Witness health detail is RESTRICTED." },
  { id: "leg-06", track: "legal", tool: "copilot", prompt: "What does without prejudice mean in an English settlement letter, and what must the letter never say?", verdict: "ok", classes: [], note: "General legal question." },
  { id: "leg-07", track: "legal", tool: "copilot", prompt: "Email Sophie Lindqvist at s.lindqvist@redgravemarine.co.uk to confirm we have sent the letter on RM/0417.", verdict: "warn", classes: ["C", "I"], note: "Contact name and email: over-shared." },
  { id: "leg-08", track: "legal", tool: "gemini", prompt: "Draft a without-prejudice letter on the Redgrave matter, placeholders for the other side.", verdict: "warn", classes: ["C"], note: "Client name alone, on an unapproved tool." },
  { id: "leg-09", track: "legal", tool: "copilot", prompt: "Draft a letter for matter RM/0417. The client's contact can be reached on tom.bryce@gmail.com for the witness diary.", verdict: "ok", classes: ["I"], halted: "an email address", note: "An email address NOT in the pack: real data, halted." },
  { id: "leg-10", track: "legal", tool: "copilot", prompt: "Write a short covering note to the client saying the first draft is attached and the settlement figure has been left blank for their instructions.", verdict: "ok", classes: [], note: "Mentions a settlement figure without stating it." },

  /* ── HR desk ──────────────────────────────────────────────── */
  { id: "hr-01", track: "hr", tool: "copilot", prompt: "Draft a factual employment reference for a former account coordinator who left in March 2026 after two years. Placeholders for the name and the new employer.", verdict: "ok", classes: ["I"], note: "Job title is INTERNAL, fine in Copilot." },
  { id: "hr-02", track: "hr", tool: "copilot", prompt: "Draft a reference for employee E-2287, line manager Claire Whitfield, placeholder for the name.", verdict: "ok", classes: ["I"], note: "Employee number and line manager are INTERNAL." },
  { id: "hr-03", track: "hr", tool: "copilot", prompt: "Draft a reference for Daniel Achebe for Northway Logistics, attention Priya Raman.", verdict: "warn", classes: ["C"], note: "Employee, employer and hiring manager named: over-shared." },
  { id: "hr-04", track: "hr", tool: "copilot", prompt: "Draft a reference for Daniel Achebe. He had 31 days of sickness absence in 2025 for anxiety, so word it carefully.", verdict: "crit", classes: ["C", "R"], note: "Health record is RESTRICTED: leaked." },
  { id: "hr-05", track: "hr", tool: "copilot", prompt: "Draft a reference for Daniel Achebe, final salary £31,400, employee number E-2287.", verdict: "crit", classes: ["C", "R", "I"], note: "Salary is RESTRICTED." },
  { id: "hr-06", track: "hr", tool: "copilot", prompt: "What can a UK employer say in a factual reference, and what should it leave out?", verdict: "ok", classes: [], note: "General HR question." },
  { id: "hr-07", track: "hr", tool: "copilot", prompt: "Reply to p.raman@northway-logistics.co.uk confirming the reference will follow by Friday.", verdict: "warn", classes: ["C"], note: "Hiring manager email: over-shared." },
  { id: "hr-08", track: "hr", tool: "claude", prompt: "Write a reference for a former account coordinator, placeholders for names.", verdict: "ok", classes: ["I"], note: "Job title only, on an unapproved tool; the rules allow it, the coaching should mention the tool." },
  { id: "hr-09", track: "hr", tool: "copilot", prompt: "Draft the reference. Payroll says his sort code was 40-11-22 if that helps the new employer.", verdict: "ok", classes: [], halted: "a sort code", note: "A sort code NOT in the pack: real data, halted." },
  { id: "hr-10", track: "hr", tool: "copilot", prompt: "Priya Raman rang about the reference for the account coordinator role; draft a two-line holding reply, placeholder for the employee.", verdict: "warn", classes: ["C", "I"], note: "Hiring manager named." },

  /* ── General desk ─────────────────────────────────────────── */
  { id: "gen-01", track: "general", tool: "copilot", prompt: "Draft a warm apology to a customer whose garden office roof leaks, offering an inspection this week. Placeholder for her name.", verdict: "ok", classes: [], note: "Clean by design." },
  { id: "gen-02", track: "general", tool: "copilot", prompt: "Draft an apology about order ORD-55810, the roof leaks, offer an inspection this week. Case owner Marcus Bell.", verdict: "ok", classes: ["I"], note: "Order number and case owner are INTERNAL." },
  { id: "gen-03", track: "general", tool: "copilot", prompt: "Draft an apology to Mrs Eleanor Vance about her leaking garden office, offer an inspection this week.", verdict: "warn", classes: ["C"], note: "Customer named: over-shared." },
  { id: "gen-04", track: "general", tool: "copilot", prompt: "Draft an apology to Eleanor Vance. She mentioned her husband's recent heart surgery, so be gentle.", verdict: "crit", classes: ["C", "R"], note: "Health detail is RESTRICTED: leaked." },
  { id: "gen-05", track: "general", tool: "copilot", prompt: "Draft a refund note for order ORD-55810, £6,250 charged to her card ending 4417.", verdict: "crit", classes: ["I", "R"], note: "Card detail is RESTRICTED." },
  { id: "gen-06", track: "general", tool: "copilot", prompt: "Give me three ways to phrase an apology that admits the problem without admitting liability.", verdict: "ok", classes: [], note: "General writing question." },
  { id: "gen-07", track: "general", tool: "copilot", prompt: "Email e.vance@example-mail.co.uk to say the installer will call to book an inspection.", verdict: "warn", classes: ["C"], note: "Customer email: over-shared." },
  { id: "gen-08", track: "general", tool: "copilot", prompt: "The installer was Keld Joinery. Draft an internal note to Marcus asking them to inspect ORD-55810 this week.", verdict: "warn", classes: ["C", "I"], note: "Subcontractor named: over-shared." },
  { id: "gen-09", track: "general", tool: "chatgpt", prompt: "Draft an apology for a leaking garden office, £6,250 order, placeholder for the customer.", verdict: "ok", classes: ["I"], note: "Order value only, on personal ChatGPT; the coaching should mention the tool." },
  { id: "gen-10", track: "general", tool: "copilot", prompt: "Draft a refund confirmation for the customer, her card is 4929 1234 5678 9012.", verdict: "ok", classes: [], halted: "a card number", note: "A full card number NOT in the pack: real data, halted." },
];
