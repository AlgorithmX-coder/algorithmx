import type { ModuleManifest, Situation, TrackBlock } from "../engine/types";

/* Module 3 · Your firm's approved tools. The Learn screens read the firm
 * profile at render time (approved, ask first, not allowed, who to ask).
 * The practise is ten situations, each a simulator window plus one line,
 * three buttons. Situations marked `toolStatus` resolve their answer from
 * the firm's lists, so the same manifest gives every firm its own answers.
 * Prove uses situations whose answer does not depend on the firm. */

const SHARED: Situation[] = [
  {
    text: "A colleague sends you a link to a Gemini chat they started on their own Google account and asks you to carry on the thread with the client's figures.",
    sim: { tool: "gemini", tier: "consumer-free" },
    toolStatus: { tool: "gemini", tier: "consumer-free" },
    why: "A personal Gemini account is a consumer tool.",
    whyBy: {
      fine: "Your firm has approved personal Gemini, so the account is fine. The client's figures still need the paste test before they go in.",
      ask: "Your firm has not approved personal Gemini. Ask first, and do not put the client's figures in a personal account while you wait.",
      no: "Your firm does not allow personal Gemini. The thread stops here, and the figures go nowhere near it.",
    },
  },
  {
    text: "You are drafting a reply in {{firm.approved}}, signed in with your work account, using the invoice number and the amount.",
    sim: { tool: "copilot", tier: "enterprise" },
    answer: "fine",
    why: "The approved tool on a work account is where INTERNAL data is allowed. This is exactly what it is for.",
  },
  {
    text: "The client invites you into their ChatGPT Business workspace so you can work on the document together.",
    sim: { tool: "chatgpt", tier: "enterprise" },
    answer: "ask",
    why: "It is their contract, not yours. Their admin can see everything you type, and your firm has no agreement with that workspace. Ask before you accept.",
  },
  {
    text: "You have ChatGPT on your phone, on your own account. You take a photo of a printed contract and ask it to summarise.",
    sim: { tool: "chatgpt", tier: "consumer-free" },
    toolStatus: { tool: "chatgpt", tier: "consumer-free" },
    why: "A personal account on a personal phone is a consumer tool, and a contract is CONFIDENTIAL at least.",
    whyBy: {
      fine: "Your firm has approved personal ChatGPT, but a photographed contract is CONFIDENTIAL. The tool is fine; the paste test says no.",
      ask: "Personal ChatGPT is not on your firm's approved list, and a photographed contract is CONFIDENTIAL. Ask first, and do not upload it while you wait.",
      no: "Personal ChatGPT is not allowed at your firm, and a photographed contract is CONFIDENTIAL anyway. Not here.",
    },
  },
  {
    text: "A browser extension offers to “summarise this page” while you are reading a client's file in your case system.",
    sim: { tool: "chatgpt", tier: "consumer-free" },
    answer: "no",
    why: "An extension that reads the page reads the whole page, client file included, and sends it to a service nobody at the firm has vetted. Not here.",
  },
  {
    text: "Your manager asks you to try Claude Team for a week to see if it is better for drafting, using the firm's workspace.",
    sim: { tool: "claude", tier: "enterprise" },
    toolStatus: { tool: "claude", tier: "enterprise" },
    why: "A workspace tier under a firm contract.",
    whyBy: {
      fine: "Claude Team is on your firm's approved list. Use it on the firm's workspace, and apply the paste test as you would in any tool.",
      ask: "Claude Team is on your firm's ask-first list. Your manager's request is the ask; get it confirmed by {{firm.contact}} before client data goes in.",
      no: "Claude Team is not allowed at your firm. Even a manager's request does not change the list; the request goes to {{firm.contact}}.",
    },
  },
  {
    text: "You are on the train on your personal laptop. You sign into {{firm.approved}} with your work account to finish a draft.",
    sim: { tool: "copilot", tier: "enterprise" },
    answer: "fine",
    why: "The account is the firm's, so the contract and the tenant apply. The device is a separate question for your IT policy, but the tool is fine.",
  },
  {
    text: "A supplier's sales rep offers you access to their own AI tool to “speed things up” and asks you to paste your requirements.",
    sim: { tool: "gemini", tier: "enterprise" },
    answer: "ask",
    why: "A supplier's tool is a supplier's data. Your requirements may be INTERNAL or CONFIDENTIAL. Ask first, every time.",
  },
  {
    text: "You forward a work email to your personal Gmail so you can ask Gemini about it at home.",
    sim: { tool: "gemini", tier: "consumer-free" },
    answer: "no",
    why: "Two problems in one move: work data on a personal account, and a copy of a work email outside the firm. Not here, whatever the tool.",
  },
  {
    text: "You use {{firm.approved}} to draft a message, but you add the client's home address so the letter is complete.",
    sim: { tool: "copilot", tier: "enterprise" },
    answer: "ask",
    why: "The tool is fine; the address is CONFIDENTIAL. Leave a placeholder and add the address yourself afterwards. When you are not sure, ask.",
  },
];

const FINANCE: Situation[] = [
  ...SHARED.slice(0, 9),
  {
    text: "You use {{firm.approved}} to draft a supplier chaser and add the firm's bank details so the letter is complete.",
    sim: { tool: "copilot", tier: "enterprise" },
    answer: "no",
    why: "The tool is fine; bank details are RESTRICTED and never enter a prompt, even the approved one. Say the details are on the invoice.",
  },
];

const LEGAL: Situation[] = [
  ...SHARED.slice(0, 9),
  {
    text: "Counsel asks you to summarise a bundle for a hearing. You upload the whole bundle to {{firm.approved}} on your work account.",
    sim: { tool: "copilot", tier: "enterprise" },
    answer: "ask",
    why: "Approved tool, but a bundle is privileged and CONFIDENTIAL end to end. Check the firm's rule on privileged material with {{firm.contact}} before it goes in, and redact where you can.",
  },
];

const HR: Situation[] = [
  ...SHARED.slice(0, 9),
  {
    text: "You paste a grievance letter into {{firm.approved}} on your work account and ask for a neutral summary.",
    sim: { tool: "copilot", tier: "enterprise" },
    answer: "no",
    why: "Approved tool, but a grievance is an HR record: RESTRICTED. It never enters a prompt. Describe the situation without the person and the detail, or do not use the tool.",
  },
];

function block(situations: Situation[]): TrackBlock {
  return {
    practise: {
      kind: "situations",
      task: "Ten situations, one at a time. Three answers: Fine, Ask first, Not here. Your firm's own list decides.",
      situations,
    },
    prove: [
      { kind: "choose", stem: "A client asks you to use their AI workspace for a shared document. What is the rule?", options: ["Fine, it is their data.", "Ask first, because their admin can see what you type and your firm has no agreement with that workspace.", "Not here under any circumstances."], answer: 1, why: "Their contract, their visibility. Ask before you accept." },
      { kind: "choose", stem: "You forward a work email to a personal account to ask an AI about it at home. What is the rule?", options: ["Fine, it is your email.", "Ask first.", "Not here: work data has left the firm and landed on a personal account."], answer: 2, why: "Two failures in one: the copy and the account." },
      { kind: "choose", stem: "A browser extension offers to summarise the page while you read a client file. What is the rule?", options: ["Fine, it only reads the visible text.", "Ask first.", "Not here: it reads the whole page and sends it to an unvetted service."], answer: 2, why: "Extensions read everything on the page, including the client file." },
      { kind: "choose", stem: "You are signed into the firm's approved tool with your work account and use an invoice number in a draft. What is the rule?", options: ["Fine: INTERNAL data is allowed in the approved tool.", "Ask first.", "Not here."], answer: 0, why: "This is what the approved tool is for. The contract and the tenant make INTERNAL data safe here." },
      { kind: "choose", stem: "You are not sure whether a tool is on the approved list. What do you do?", options: ["Use it, and stop if someone objects.", "Ask {{firm.contact}} first, and keep client data out of it while you wait.", "Use a personal account so the firm is not involved."], answer: 1, why: "Unknown means ask. Client data waits." },
    ],
  };
}

export const MODULE_3: ModuleManifest = {
  n: 3,
  slug: "approved-tools",
  title: "Your firm's approved tools",
  minutes: 16,
  promise: "Know {{firm.name}}'s own list, and what to do when a situation is not on it.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 3 of 5 · about 16 minutes",
      heading: "The rules differ by tool. Here are {{firm.name}}'s.",
      lead: "Module 1 showed you how the tiers differ. This module is your firm's own answer: which tools are approved, which need a word first, and which are not allowed. Then ten situations from a normal week, each with a window in front of you.",
      cta: "Start",
    },
    {
      kind: "cards",
      eyebrow: "Learn · your firm's list",
      heading: "Approved, ask first, not allowed",
      lead: "This is {{firm.name}}'s own list. If something you use is missing, that is a question for {{firm.contact}}, not a green light.",
      source: "firm.rules",
    },
    {
      kind: "cards",
      eyebrow: "Learn · two mistakes that look harmless",
      heading: "The account and the device are different questions",
      lead: "Tap each to see why.",
      reveal: true,
      cards: [
        { title: "A personal account on a work device", tint: "C", body: "You open your own ChatGPT on the office laptop because it is quicker.", detail: "The device is the firm's, but the account is yours, so the consumer terms apply and the firm cannot see or govern what goes in. The laptop does not make it a work tool. The account does." },
        { title: "Work data on a personal account", tint: "R", body: "You email yourself a file to work on it at home with your own AI.", detail: "The moment the file leaves the firm's systems it is a copy nobody controls. Even if you never paste it, the email itself is the incident." },
      ],
    },
    {
      kind: "cards",
      eyebrow: "Learn · when it is not your tool",
      heading: "The client's workspace, the supplier's tool",
      lead: "Tap each to see the rule.",
      reveal: true,
      cards: [
        { title: "A client invites you into their workspace", tint: "I", body: "Their ChatGPT Business workspace, their Copilot, their Gemini.", detail: "Their admin can see every word you type, and your firm has no contract with that workspace. Sometimes it is fine and the engagement letter covers it. You do not decide that; you ask." },
        { title: "A supplier offers you their AI tool", tint: "C", body: "“Paste your requirements and we will do the rest.”", detail: "Your requirements may be INTERNAL or CONFIDENTIAL, and their tool is their data. Ask first, and expect the answer to be a placeholder version, not the real thing." },
      ],
    },
    {
      kind: "contact",
      eyebrow: "Learn · who to ask",
      heading: "When in doubt, this is who you ask, and what you say",
      lead: "Asking is never the wrong answer. It takes a minute, and it is the thing the register records in your favour.",
      script: ["What I want to do, in one line.", "Which tool and which account.", "What kind of data is involved, using the four classes.", "Whether the client or a supplier is involved."],
      note: "You will see this contact again in Module 5, for the day something has already gone in.",
    },
  ],
  tracks: {
    finance: block(FINANCE),
    legal: block(LEGAL),
    hr: block(HR),
    general: block(SHARED),
  },
};
