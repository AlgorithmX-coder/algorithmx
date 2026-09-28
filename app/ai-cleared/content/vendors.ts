import type { SimTier } from "../sims/types";
import type { Tool } from "../engine/types";

/* The vendor matrix: what each tool does with what you type, per tier,
 * each fact carrying the date it was last checked against the vendor's own
 * page. This file is the "revised as fast as the tools change" promise made
 * concrete: the quarterly review edits it, the course shows the date, and
 * nothing about a vendor is written anywhere else.
 *
 * Wording rule: state what the vendor's page says, in plain words, with no
 * numbers we did not see on that page. Where a fact is unconfirmed, say so
 * on screen rather than guess. All entries below were checked against the
 * vendor pages on 2026-09-28. */

export interface VendorFact {
  tool: Tool;
  tier: SimTier;
  /* How the tier is named in the product. */
  label: string;
  /* The on-screen tell that identifies the tier. */
  tell: string;
  /* Are prompts used to train the vendor's models by default, and can you turn it off. */
  trains: string;
  /* What "delete" does and how long chats are kept. */
  retention: string;
  /* Whether a workplace admin can see prompts or usage. */
  adminSees: string;
  /* Whether people at the vendor can read conversations. */
  humanReview: string;
  /* The page a member of staff can check themselves. */
  terms: { title: string; url: string; find: string };
  verifiedOn: string;
}

const CHECKED = "2026-09-28";

export const VENDORS: VendorFact[] = [
  /* ---- ChatGPT (OpenAI) ---- */
  {
    tool: "chatgpt",
    tier: "consumer-free",
    label: "ChatGPT Free (also Go, Plus and Pro)",
    tell: "Personal, with Free, Plus or Pro after it, at the bottom of the rail. No firm name anywhere.",
    trains: "Yes, by default. OpenAI's page says content from its services for individuals may be used to train its models. Switch it off under Settings, Data controls, “Improve the model for everyone”, or use the Privacy Portal. Giving a thumbs up or down can send that whole conversation for training even if you opted out.",
    retention: "Saved chats stay until you delete them. A deleted chat is scheduled for permanent deletion within 30 days unless it was already de-identified or must be kept for security or legal reasons. A Temporary chat is not saved to history, is not used to improve models, and may be kept for up to 30 days for safety.",
    adminSees: "Nobody at your firm. It is your account.",
    humanReview: "Not stated on the consumer pages we checked; the policy allows retention for fraud, abuse and safety reasons.",
    terms: { title: "Data controls in ChatGPT (OpenAI Help)", url: "https://help.openai.com/en/articles/7730893", find: "Improve the model for everyone" },
    verifiedOn: CHECKED,
  },
  {
    tool: "chatgpt",
    tier: "consumer-paid",
    label: "ChatGPT Plus and Pro",
    tell: "Personal, with Plus or Pro, at the bottom of the rail. Paying changes the model, not the account.",
    trains: "Same as Free. OpenAI groups Free, Go, Plus and Pro together as services for individuals, with the same default and the same opt-out.",
    retention: "Same as Free.",
    adminSees: "Nobody at your firm. It is your account.",
    humanReview: "Same as Free.",
    terms: { title: "How your data is used to improve model performance (OpenAI Help)", url: "https://help.openai.com/en/articles/5722486", find: "services for individuals" },
    verifiedOn: CHECKED,
  },
  {
    tool: "chatgpt",
    tier: "enterprise",
    label: "ChatGPT Business and Enterprise",
    tell: "The firm's name and Business or Enterprise workspace at the bottom of the rail. OpenAI now calls the old Team tier Business.",
    trains: "No. OpenAI's page says business data is not used to train its models by default; only explicit opt-in feedback is.",
    retention: "Workspace admins control how long data is kept. Deleted or unsaved conversations are removed from OpenAI's systems within 30 days unless the law requires longer.",
    adminSees: "Yes. Business workspace admins can view, access, export and delete members' conversations. Enterprise admins get an audit log of conversations through the Compliance API.",
    humanReview: "Limited to authorised staff and bound contractors for engineering support, abuse investigation and legal compliance.",
    terms: { title: "Enterprise privacy at OpenAI", url: "https://openai.com/enterprise-privacy/", find: "we do not use your business data for training our models" },
    verifiedOn: CHECKED,
  },

  /* ---- Gemini (Google) ---- */
  {
    tool: "gemini",
    tier: "consumer-free",
    label: "Gemini app, personal Google account",
    tell: "Gemini with nothing after it, and no Workspace domain in the rail.",
    trains: "Yes, by default, while the Keep Activity setting is on: Google says it uses your activity to provide, develop and improve its services, including training its generative AI models. Turn it off in Activity; future chats are then not used for training unless you send feedback.",
    retention: "Activity is auto-deleted after 18 months by default; you can choose 3 or 36 months or no auto-delete. With Keep Activity off, chats are still kept for 72 hours. Chats picked for human review are kept separately for up to 3 years and are not removed when you delete your activity.",
    adminSees: "Nobody at your firm. It is your account.",
    humanReview: "Yes. A subset of chats is reviewed by human reviewers, including Google's service providers, disconnected from your account. Google's own page says not to enter confidential information you would not want a reviewer to see.",
    terms: { title: "Gemini Apps Privacy Hub (Google Support)", url: "https://support.google.com/gemini/answer/13594961", find: "reviewed by human reviewers" },
    verifiedOn: CHECKED,
  },
  {
    tool: "gemini",
    tier: "consumer-paid",
    label: "Google AI Pro and Ultra",
    tell: "A plan pill next to the name, but still no Workspace domain in the rail.",
    trains: "The same consumer Privacy Hub applies; no vendor page we checked gives a paid personal plan different data handling. Treat it as the free tier.",
    retention: "Same as the free Gemini app.",
    adminSees: "Nobody at your firm. It is your account.",
    humanReview: "Same as the free Gemini app.",
    terms: { title: "Gemini Apps Privacy Hub (Google Support)", url: "https://support.google.com/gemini/answer/13594961", find: "Gemini Apps Activity" },
    verifiedOn: CHECKED,
  },
  {
    tool: "gemini",
    tier: "enterprise",
    label: "Gemini in Google Workspace (work account)",
    tell: "Workspace and the firm's domain at the bottom of the rail.",
    trains: "No. Google's Workspace page says your content is not human reviewed or used to train generative AI models outside your domain without permission. Prompts are customer data under the Workspace data processing terms.",
    retention: "Admins choose whether conversation history is kept and for how long (3, 18 or 36 months, or none). With history off, chats are kept for up to 72 hours. Vault holds and retention rules override those settings.",
    adminSees: "Yes. Admins get Gemini usage reports and audit log events, and Vault can retain, search and export Gemini app conversations including prompts and responses.",
    humanReview: "No. Google's FAQ says submissions are never reviewed by humans and are not used to train models.",
    terms: { title: "Generative AI in Google Workspace Privacy Hub", url: "https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub", find: "not human reviewed or otherwise used for Generative AI model training" },
    verifiedOn: CHECKED,
  },

  /* ---- Claude (Anthropic) ---- */
  {
    tool: "claude",
    tier: "consumer-free",
    label: "Claude Free",
    tell: "Free plan in the account line, no firm name.",
    trains: "Only if you allow it. Since the 2025 terms change, Free, Pro and Max chats are used to improve models when the “Help improve our AI models” setting under Settings, Privacy is on, and always if a conversation is flagged for safety review. Incognito chats are not used even when the setting is on.",
    retention: "If you allow training, chats are kept in de-identified form for up to 5 years. A deleted chat leaves your history at once and Anthropic's storage within 30 days, and is not used for future training. Conversations flagged for a policy breach can be kept for up to 2 years.",
    adminSees: "Nobody at your firm. It is your account.",
    humanReview: "Limited to a small number of staff involved in model training, with data de-linked from your account; flagged conversations may be used for safety work.",
    terms: { title: "Is my data used for model training? (Claude Privacy Center)", url: "https://privacy.claude.com/en/articles/10023580", find: "Help improve our AI models" },
    verifiedOn: CHECKED,
  },
  {
    tool: "claude",
    tier: "consumer-paid",
    label: "Claude Pro and Max",
    tell: "Pro plan in the account line, no firm name.",
    trains: "Same as Free: your choice under Settings, Privacy, plus safety-flagged conversations.",
    retention: "Same as Free.",
    adminSees: "Nobody at your firm. It is your account.",
    humanReview: "Same as Free.",
    terms: { title: "How long do you store my data? (Claude Privacy Center)", url: "https://privacy.claude.com/en/articles/10023548", find: "up to 5 years" },
    verifiedOn: CHECKED,
  },
  {
    tool: "claude",
    tier: "enterprise",
    label: "Claude Team and Enterprise",
    tell: "The firm's name and Team or Enterprise in the account line.",
    trains: "No. Anthropic's page says chats and coding sessions on work plans are not used to train its models unless the organisation joins its development partner programme or gives explicit feedback.",
    retention: "Team: kept to run the product; a deleted chat leaves Anthropic's storage within 30 days. Enterprise: kept indefinitely by default unless an owner sets a retention period, minimum 30 days.",
    adminSees: "Partly on Team: the primary owner can request a data export that may contain conversations. On Enterprise: audit logs (without chat content) and, if the primary owner enables it, a Compliance API that includes chat data.",
    humanReview: "Only for conversations flagged for a policy breach.",
    terms: { title: "Who owns and manages the data of my team? (Claude Privacy Center)", url: "https://privacy.claude.com/en/articles/9265372", find: "will not use your chats or coding sessions to train our models" },
    verifiedOn: CHECKED,
  },

  /* ---- Copilot (Microsoft) ---- */
  {
    tool: "copilot",
    tier: "consumer-free",
    label: "Copilot on a personal Microsoft account",
    tell: "Personal account in the rail, no firm name, and the top bar says Chat rather than Work.",
    trains: "Two Microsoft pages are live. The privacy FAQ for the older app says Microsoft uses Copilot conversations for AI training unless you opt out under Privacy, “Training on conversation activity”. The newer app's page says prompts, responses and file contents are not used to train foundation models. Which applies depends on the app version, so assume the older answer until you have checked.",
    retention: "Conversation history is kept for 18 months by default. You can delete chats in the app or all activity from the Microsoft privacy dashboard; how long deletion takes to complete is not stated on the pages we checked.",
    adminSees: "Nobody at your firm. It is your account.",
    humanReview: "The older app's FAQ says some conversations are subject to automated and human review and that an opt-out of human review is not available.",
    terms: { title: "Privacy FAQ for Microsoft Copilot (Microsoft Support)", url: "https://support.microsoft.com/en-us/microsoft-copilot/privacy-faq-for-microsoft-copilot", find: "Training on conversation activity" },
    verifiedOn: CHECKED,
  },
  {
    tool: "copilot",
    tier: "consumer-paid",
    label: "Copilot Pro and Copilot in Microsoft 365 for home",
    tell: "Copilot Pro on a personal account in the rail; no firm name.",
    trains: "Inside the Microsoft 365 apps for home, Microsoft says prompts, responses and file contents are not used to train foundation models. Chat in the Copilot app follows the same pages as the free personal account.",
    retention: "Not stated separately on the home-apps page; the Copilot app history is kept as for the free account.",
    adminSees: "Nobody at your firm. It is your account.",
    humanReview: "Not stated on the home-apps page.",
    terms: { title: "Copilot in Microsoft 365 apps for home: your data and privacy", url: "https://support.microsoft.com/en-us/privacy/copilot-in-microsoft-365-apps-for-home-your-data-and-privacy", find: "aren't used to train foundation models" },
    verifiedOn: CHECKED,
  },
  {
    tool: "copilot",
    tier: "enterprise",
    label: "Microsoft 365 Copilot and Copilot Chat on a work account",
    tell: "The firm's name with “work account” in the rail, and Work in the top bar.",
    trains: "No. Microsoft's page says prompts, responses and data accessed through Microsoft Graph are not used to train its foundation models, and the data is covered by the firm's Microsoft agreement with Microsoft as processor.",
    retention: "Prompts and responses are stored in a hidden folder in your mailbox and kept for as long as your firm's retention policy says. Deleting your Copilot activity history removes it from view; compliance copies follow the firm's holds and retention rules.",
    adminSees: "Yes. Microsoft's own staff-facing page says your prompts and responses are logged and your IT admin can use Microsoft's search and audit tools to view them.",
    humanReview: "No. Microsoft says its Copilot services have opted out of the abuse monitoring that includes human review.",
    terms: { title: "Data protection when using Microsoft Copilot Chat for work or school", url: "https://support.microsoft.com/en-us/privacy/data-protection-when-using-microsoft-365-copilot-chat-for-work-or-school", find: "aren't used to train foundation LLMs" },
    verifiedOn: CHECKED,
  },
];

export function vendorFact(tool: Tool, tier: SimTier): VendorFact | undefined {
  return VENDORS.find((v) => v.tool === tool && v.tier === tier);
}

export const VENDOR_TERMS_INTRO = "Every tool publishes what it does with your inputs. Here is where each one says it, and the sentence to look for. The date is when we last checked.";
