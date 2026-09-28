import type { ModuleManifest } from "../engine/types";

/* Module 1 · What happens to what you type. About the tools, not the firm,
 * so there is one General track and no data pack. The vendor facts on the
 * terms screen come from content/vendors.ts at render time, each with the
 * date it was checked. */
export const MODULE_1: ModuleManifest = {
  n: 1,
  slug: "what-you-type",
  title: "What happens to what you type",
  minutes: 18,
  promise: "Know, from the window in front of you, whether what you type stays inside the firm.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 1 of 5 · about 18 minutes",
      heading: "Same question, four different answers. The window tells you which.",
      lead: "Every AI assistant looks like a chat box. Underneath, what happens to your words depends on the account you are signed into. By the end of this module you will read that from the screen in a second, and you will know what a tool's own terms say about your inputs.",
      note: "No firm data in this module. It is about the tools.",
      cta: "Start",
    },
    {
      kind: "cards",
      eyebrow: "Learn · the four tiers",
      heading: "Four kinds of account. Tap each to see what it does with your inputs.",
      lead: "The name on the door changes everything: who can read what you typed, whether it teaches the next model, and whether your firm can see it.",
      reveal: true,
      cards: [
        { title: "Consumer, free", tag: "Tier 1", tint: "R", body: "A personal account that costs nothing.", detail: "You are the product. Most free tiers may use your conversations to improve their models unless you switch that off in settings, keep chats for a stated period even after you delete them, and let staff at the vendor review conversations. Your firm has no contract, no visibility and no control." },
        { title: "Consumer, paid", tag: "Tier 2", tint: "C", body: "The same personal account with a subscription.", detail: "Paying changes the model and the limits, not the ownership. Your data terms are usually the same as the free tier, with the same opt-out you have to find yourself. Still a personal account, still nothing your firm can see or govern." },
        { title: "Enterprise or business", tag: "Tier 3", tint: "I", body: "A work account under a contract your firm signed.", detail: "The vendor commits not to train on your inputs, keeps data inside a tenant your admin controls, and can show usage in audit logs. This is the tier where INTERNAL data is allowed, because the firm has a contract that says where it goes." },
        { title: "Self-hosted", tag: "Tier 4", tint: "P", body: "A model your firm runs on its own servers.", detail: "Nothing leaves the building. Rare outside large firms, and even then a policy still governs what you paste, because other staff can read the logs." },
      ],
      note: "The habit: before you type, find the account label. It is always somewhere on the screen.",
    },
    {
      kind: "toggles",
      eyebrow: "Learn · the three switches",
      heading: "Three settings change where your words go. Flip each one.",
      lead: "These exist on most consumer tools. Knowing they exist is half the lesson; knowing which way each one starts is the other half.",
      toggles: [
        { label: "Improve the model for everyone", off: "Off: your conversations are not used to train future models. You usually have to find this switch yourself; on many consumer accounts it starts on.", on: "On: what you type may be used to train the next version of the model. Anything a client told you is now part of a training set you cannot recall." },
        { label: "Temporary chat", off: "Off: the conversation is saved to your history and kept under the vendor's normal retention.", on: "On: the chat does not appear in history and is kept only for a short safety period. Useful, but it is not a licence to paste RESTRICTED data. It is still leaving the building." },
        { label: "Signed in with your work account", off: "Off: a personal account. Whatever the tool's terms say for consumers applies, and your firm cannot see or govern it.", on: "On: your firm's contract applies, the data stays in the firm's tenant, and your admin can see usage. This is the switch that matters most." },
      ],
      note: "None of these three replaces the paste test. They change the blast radius, not the rule.",
    },
    {
      kind: "timeline",
      eyebrow: "Learn · what delete means",
      heading: "“Delete chat” is not deletion.",
      lead: "Here is what most people think happens, and what the vendors' own pages say happens.",
      before: { label: "What you think", steps: ["You paste a client's email.", "You get your answer.", "You delete the chat.", "It is gone."] },
      after: { label: "What actually happens", steps: ["You paste a client's email.", "It is stored in your history and, on a consumer account with training on, may be queued to improve the model.", "You delete the chat. It disappears from your history.", "The vendor keeps a copy for the period its policy states, for safety and abuse monitoring, before permanent deletion.", "Anything already used for training is not un-learned."] },
      revealLabel: "Show what actually happens",
      note: "So the only reliable control is what you paste in the first place. That is Module 2.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · the five-minute check",
      heading: "Where each tool says what it does with your data",
      lead: "You do not have to take our word for it. Each card shows the page and the sentence to look for, with the date we last checked.",
      source: "vendors.terms",
      columns: 2,
      note: "The facts in this course are reviewed every quarter and within weeks of a major change. The date on each card is when it was last checked.",
    },
  ],
  tracks: {
    general: {
      practise: {
        kind: "sort",
        task: "Six windows, one at a time. Say which tier each one is from what is on the screen.",
        bins: [
          { id: "consumer-free", label: "Consumer, free", desc: "A personal account, no subscription." },
          { id: "consumer-paid", label: "Consumer, paid", desc: "A personal account with a subscription." },
          { id: "enterprise", label: "Enterprise", desc: "A work account under the firm's contract." },
        ],
        items: [
          { sim: { tool: "chatgpt", tier: "consumer-free" }, tell: "The badge at the bottom of the rail says Personal · Free. No firm name anywhere on the screen." },
          { sim: { tool: "copilot", tier: "enterprise" }, tell: "The rail shows the firm's name with “work account”, and the top bar says Work. That is the firm's tenant." },
          { sim: { tool: "gemini", tier: "consumer-paid" }, tell: "An Advanced pill next to the name, but no Workspace domain in the rail. Paid, still personal." },
          { sim: { tool: "claude", tier: "enterprise" }, tell: "The account line at the bottom of the rail shows the firm's name and Team. That is a workspace the firm pays for." },
          { sim: { tool: "chatgpt", tier: "enterprise" }, tell: "The badge names the firm and says Business workspace (OpenAI now calls the old Team tier Business). Same chat box as the free one; different contract." },
          { sim: { tool: "claude", tier: "consumer-free" }, tell: "Free plan in the account line, no firm name. Whatever you type here is under consumer terms." },
        ],
      },
      prove: [
        { kind: "choose", stem: "Which tier is this window?", sim: { tool: "gemini", tier: "enterprise" }, options: ["Consumer, free", "Consumer, paid", "Enterprise"], answer: 2, why: "The Workspace domain in the rail is the tell. The firm's Google Workspace contract covers it." },
        { kind: "choose", stem: "Which tier is this window?", sim: { tool: "copilot", tier: "consumer-free" }, options: ["Consumer, free", "Consumer, paid", "Enterprise"], answer: 0, why: "Personal account, free, in the rail, and no firm name. Copilot on a personal Microsoft account is a consumer tool, whatever the logo." },
        { kind: "choose", stem: "You switch on Temporary chat in a free consumer account and paste a client's complaint. Which is true?", options: ["It is now safe, because nothing is saved.", "It is still leaving the building and still under consumer terms; you have only shortened how long the vendor keeps it.", "Temporary chat makes it an enterprise account."], answer: 1, why: "Temporary chat changes retention, not ownership. The paste test still applies." },
        { kind: "choose", stem: "A colleague says they deleted the chat, so the client data is gone. Which is true?", options: ["Correct, deletion is immediate and complete.", "The chat is gone from their history, but the vendor keeps a copy for the period its policy states, and anything already used for training stays learned.", "Deletion only works on paid accounts."], answer: 1, why: "Delete removes it from your view. The vendor's own pages describe a retention period after that." },
        { kind: "choose", stem: "Which tier is the one where INTERNAL data is allowed, and why?", options: ["Consumer, paid, because you are paying for privacy.", "Enterprise, because the firm has a contract that says the data is not used for training and stays in the firm's tenant.", "Any tier, as long as training is switched off."], answer: 1, why: "It is the contract and the tenant, not the price, that make INTERNAL data safe to use." },
      ],
    },
  },
};
