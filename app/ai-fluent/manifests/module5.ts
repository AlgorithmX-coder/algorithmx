import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { FINANCE_PACK, SUPPLIER_QUERY } from "../desks/finance";

/* AI Fluent, Module 5 · Draft. Drafting from a brief in the firm's
 * voice: letters, emails, first versions. The practice runs in Copilot
 * inside Outlook on a supplier's chaser; the learner drafts the reply
 * from the brief, then fixes the tone. */
export const FLUENT_MODULE_5: ModuleManifest = {
  n: 5,
  slug: "draft",
  title: "Draft",
  minutes: 20,
  course: "ai-fluent",
  promise: "Get a first draft that sounds like your firm and says the one thing it has to say, then fix it in one turn.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 5 of 9 · about 20 minutes",
      heading: "A draft is only as good as its brief.",
      lead: "The tool writes a competent email about anything in three seconds. Whether it is the email you would have sent depends on what you told it: who it is from, who it is to, the one thing it must do, and how your firm sounds. This module is drafting from a brief, inside Outlook, where the thread already is.",
      cta: "Show me two drafts",
    },
    {
      kind: "beforeAfter",
      eyebrow: "Learn · a bare brief, a full brief",
      heading: "Same supplier email. Two briefs.",
      lead: "A supplier is chasing payment for chairs that were never delivered. On the left, a bare instruction. On the right, the brief a fluent person gives.",
      sim: { tool: "copilot", tier: "enterprise" },
      before: {
        prompt: "Reply to this email",
        reply: "Dear Marion,\n\nThank you for your email regarding PO-8897. We apologise for the delay in payment and appreciate your patience. We are currently reviewing the invoice and will arrange payment as soon as possible. Please let us know if you require any further information.\n\nKind regards",
        note: "An apology for a delay that is not our fault, a promise to pay for chairs we do not have, and the one fact that matters is missing.",
      },
      after: {
        prompt: "Reply as our accounts team to Marion at Penrose. Friendly and firm, under 100 words. The chairs on PO-8897 were never delivered: the carrier returned them to Penrose's depot on the 9th after two failed attempts at the wrong unit number. We want the chairs, not a refund. Ask for a redelivery date and say payment follows delivery. Do not apologise.",
        reply: "Subject: Re: PO-8897, chairs\n\nHello Marion,\n\nThanks for the statement. PO-8897 is unpaid because the chairs have not arrived: your carrier's tracking shows the consignment returned to your depot on the 9th after two attempts at the wrong unit number. We would still like the chairs. Could you confirm a redelivery date to the correct unit? Payment will follow delivery as usual.\n\nBest wishes,\nAccounts",
        note: "From whom, to whom, the one thing, the tone, the length, and what not to do. Six elements, a draft you could send.",
      },
      revealLabel: "Show the full brief",
      cta: "What a brief carries",
    },
    {
      kind: "cards",
      eyebrow: "Learn · the brief",
      heading: "Four things a drafting brief carries. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "From whom, to whom", tag: "Role and reader", tint: "I", body: "The accounts team, to a supplier's credit controller.", detail: "Who is speaking sets the stance; who is listening sets the register. A reply to a supplier is not a reply to a client." },
        { title: "The one thing", tag: "Task", tint: "I", body: "What this email must achieve.", detail: "Every email has one job: get a redelivery date, confirm a figure, decline politely. Name it and the draft is built around it rather than around pleasantries." },
        { title: "The voice", tag: "Constraint", tint: "C", body: "How your firm sounds.", detail: "\"Friendly and firm.\" \"Plain English, no apologies.\" Better still, paste one email you sent last month and say \"in this voice\". One example beats three adjectives." },
        { title: "What not to do", tag: "Constraint", tint: "R", body: "Do not apologise. Do not offer a refund. Do not mention the plan.", detail: "The tool is eager to please and will apologise for things that are not your fault. A \"do not\" removes the reflex." },
      ],
      note: "Inside Outlook, Copilot already has the thread. In a chat tool, paste it or attach it.",
    },
    {
      kind: "toggles",
      eyebrow: "Learn · three switches",
      heading: "Flip each one and read what it changes in the draft.",
      toggles: [
        { label: "Give it the thread", off: "Off: the draft answers an email the tool has not read. It guesses the facts, and guesses politely.", on: "On: inside Outlook the thread is in front of Copilot. The draft replies to what Marion actually wrote and quotes the right PO number." },
        { label: "Give it the voice", off: "Off: the draft sounds like every other AI email: \"I hope this finds you well\", \"please do not hesitate\".", on: "On: \"friendly and firm, plain English\" or an example of your own gets a draft that sounds like your firm." },
        { label: "Say what not to do", off: "Off: the tool apologises for a late payment that is not late, and offers a refund nobody asked for.", on: "On: \"do not apologise, do not offer a refund\" and the draft holds its line." },
      ],
      note: "Next: the practice. Draft the reply from the brief, inside Outlook, then fix the tone in one turn.",
    },
  ],
  tracks: {
    finance: {
      dataPack: FINANCE_PACK,
      practise: {
        kind: "loop",
        task: "Draft the reply to the supplier's chaser inside Outlook, then fix its tone in one turn.",
        brief: "Penrose are chasing £1,540 for chairs that were never delivered; the carrier returned them to Penrose's depot after two attempts at the wrong unit. The firm wants the chairs, not a refund, and wants to keep the account in good standing. Reply as the accounts team.",
        material: SUPPLIER_QUERY,
        office: "outlook",
        followUp: true,
        turns: [
          { instruction: "Send 1: brief Copilot. Who it is from and to, the one thing the reply must achieve, the tone, the length, and anything it must not do.", rubric: { requires: ["role", "reader", "task", "constraints", "length"], goal: "A reply that states the chairs were returned undelivered, asks for a redelivery date, says payment follows delivery, keeps the relationship, and does not apologise." }, placeholder: "Reply as our accounts team to Marion… the one thing it must do is…" },
          { instruction: "Send 2: fix the tone or the length in one line. Warmer, firmer, shorter, or take out a sentence that should not be there.", placeholder: "Firmer on the delivery point, and cut the last sentence…" },
        ],
        playbook: { workflow: "Draft", whenToUse: "Any reply with one job: say who it is from and to, the one thing it must achieve, the voice, the length, and what not to do.", check: "Read it as the recipient would; check every fact against the thread; make sure the one thing is in the first two lines." },
      },
      prove: [
        { kind: "choose", stem: "The draft apologises for a late payment that is not late. What was missing from the brief?", options: ["The reader.", "What not to do.", "The length."], answer: 1, why: "The tool apologises by reflex. \"Do not apologise\" removes it." },
        { kind: "choose", stem: "What is the best way to get a draft in your firm's voice?", options: ["Ask for a professional tone.", "Paste one email you sent and say \"in this voice\".", "Ask it to avoid clichés."], answer: 1, why: "One real example beats any description. The tool matches what it can see." },
        { kind: "choose", stem: "Which is the \"one thing\" in the Penrose reply?", options: ["To thank them for the statement.", "To get a redelivery date and tie payment to delivery.", "To explain the carrier's mistake."], answer: 1, why: "Every email has one job. The draft is built around it; the rest is context." },
        { kind: "choose", stem: "The first draft is right but too soft. What do you do?", options: ["Rewrite it by hand.", "Reply: firmer on the delivery point, and shorter.", "Start again with a new brief."], answer: 1, why: "Module 3 again: fix the prompt. One line changes the tone and keeps everything else." },
        { kind: "choose", stem: "Why draft inside Outlook rather than a chat window?", options: ["Outlook writes better emails.", "The thread is already in front of Copilot, so the draft answers what was actually written and nothing is pasted anywhere.", "Chat windows cannot write emails."], answer: 1, why: "Where the work happens. The thread is the material, and it is already there." },
      ],
    },
  },
};
