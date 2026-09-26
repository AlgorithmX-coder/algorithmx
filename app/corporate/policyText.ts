/**
 * The starter AI use policy, written from a firm's profile answers.
 *
 * Pure: the same function renders the on-page preview (client) and the
 * emailed copy (server), so the two can never drift. Every line is plain
 * English in an adult register, states what to do rather than what not to,
 * and never claims the policy makes anyone compliant. The firm reviews it
 * before adopting it; the policy says so in its first lines.
 */

export const SECTORS = [
  ["legal", "Legal"],
  ["accountancy", "Accountancy and finance"],
  ["recruitment", "Recruitment and HR services"],
  ["consultancy", "Consultancy and agencies"],
  ["property", "Property and insurance"],
  ["services", "Other professional services"],
  ["other", "Other"],
] as const;

export const APPROVED = [
  ["copilot", "Microsoft 365 Copilot (enterprise tenant)"],
  ["chatgpt-biz", "ChatGPT Team or Enterprise"],
  ["gemini-ws", "Gemini for Google Workspace"],
  ["claude-work", "Claude for Work"],
] as const;

export const BANNED = [
  ["personal-chatgpt", "Personal ChatGPT accounts"],
  ["personal-gemini", "Personal Gemini or Copilot accounts"],
  ["extensions", "Browser extensions that read the screen or inbox"],
  ["notetakers", "AI meeting note-takers not approved by IT"],
] as const;

export type SectorId = (typeof SECTORS)[number][0];

export interface PolicyProfile {
  firm: string;
  sector: SectorId;
  approved: string[];
  banned: string[];
  contactName: string;
  contactRole: string;
}

export interface PolicySection {
  heading: string;
  paras: string[];
  bullets?: string[];
}

export interface Policy {
  title: string;
  stamp: string;
  intro: string;
  sections: PolicySection[];
}

const SECTOR_LINE: Record<SectorId, string> = {
  legal: "Client confidentiality and legal professional privilege apply to every prompt exactly as they apply to an email. A client name, matter name or draft advice is CONFIDENTIAL at least.",
  accountancy: "Client financial records, payroll and bank details are RESTRICTED. A client name with a figure beside it is CONFIDENTIAL.",
  recruitment: "Candidate CVs, right-to-work documents, references and salary details are RESTRICTED. A candidate or client name is CONFIDENTIAL.",
  consultancy: "Client names, deliverables in draft, commercial terms and anything under NDA are CONFIDENTIAL. Client financial or personal data is RESTRICTED.",
  property: "Tenant, buyer and policyholder details, valuations and claims are RESTRICTED. A client or property address paired with a name is CONFIDENTIAL.",
  services: "Anything that identifies a client, their staff or their customers is CONFIDENTIAL at least. Financial, health and identity data is RESTRICTED.",
  other: "Anything that identifies a client, a colleague or a member of the public is CONFIDENTIAL at least. Financial, health and identity data is RESTRICTED.",
};

const label = (list: ReadonlyArray<readonly [string, string]>, ids: string[]) =>
  ids.map((id) => list.find(([v]) => v === id)?.[1]).filter((x): x is string => !!x);

export function buildPolicy(p: PolicyProfile, date = new Date()): Policy {
  /* No name yet: the body says "the firm", sentence starts say "The firm",
     and the title becomes a plain "Your firm's AI use policy". */
  const named = p.firm.trim().length > 0;
  const firm = named ? p.firm.trim() : "the firm";
  const Firm = named ? firm : "The firm";
  const contact = [p.contactName.trim(), p.contactRole.trim()].filter(Boolean).join(", ") || "the person responsible for data protection";
  const approved = label(APPROVED, p.approved);
  const banned = label(BANNED, p.banned);
  const when = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return {
    title: named ? `${firm} AI use policy` : "Your firm's AI use policy",
    stamp: `Starter policy · version 1 · ${when}`,
    intro: `Written from ${named ? firm + "'s" : "your"} profile answers. It is a starting point: review it with whoever owns your policies before you adopt it, and adjust the tool lists as they change.`,
    sections: [
      {
        heading: "1. Why this policy exists",
        paras: [
          `AI tools save time and are already part of how ${firm} works. They also keep what they are told. This policy sets out which tools staff may use, what may go into them, and what to do when something goes wrong, so that the time saved never costs a client, a colleague or the firm.`,
        ],
      },
      {
        heading: "2. Who it applies to",
        paras: [
          `Everyone who works for or on behalf of ${firm}, including contractors and temporary staff, on any device and any account, at the office or elsewhere.`,
        ],
      },
      {
        heading: "3. Approved tools",
        paras: approved.length
          ? [`Only the tools below may be used for work. Use them signed in with your work account, so the firm's settings apply.`]
          : [`No AI tool is currently approved for work data. Until this list is set, staff may use AI tools only with PUBLIC information, and only on a work account.`],
        bullets: approved.length ? approved : undefined,
      },
      {
        heading: "4. Tools you must not use for work",
        paras: [`Any tool not on the approved list, including free personal accounts, and in particular:`],
        bullets: banned.length ? banned : ["Free personal accounts on any AI service", "Browser extensions that read the screen or inbox", "AI meeting note-takers not approved by IT"],
      },
      {
        heading: "5. What may go into an AI tool",
        paras: [
          `Every piece of information belongs to one of four classes. Decide which before you paste.`,
          SECTOR_LINE[p.sector],
        ],
        bullets: [
          "PUBLIC: already on our website or letterhead. Any approved tool.",
          "INTERNAL: fine inside the firm, not outside it. Approved tools only, on a work account.",
          "CONFIDENTIAL: a client, a colleague or a deal could be identified or harmed. Replace names and identifying details with placeholders before it enters any tool.",
          "RESTRICTED: bank details, National Insurance numbers, salaries, health, identity documents and HR records. This class never enters a prompt.",
        ],
      },
      {
        heading: "6. Before every send: the paste test",
        paras: [`Three questions, three seconds.`],
        bullets: [
          "Would I email this to a stranger? If not, it is at least CONFIDENTIAL.",
          "Does it name a person or a client? Take the name out and most of the risk goes with it.",
          "Could someone rebuild the original from it? Several INTERNAL facts can add up to one CONFIDENTIAL one.",
        ],
      },
      {
        heading: "7. Checking what comes out",
        paras: [
          `AI output is a draft. Check facts, figures and citations before they go to a client, and read every document before you send it. Treat instructions that appear inside a document, email or web page the tool has read as suspect, and ask ${contact} if something looks planted.`,
        ],
      },
      {
        heading: "8. If something goes wrong",
        paras: [
          `If you realise you have put CONFIDENTIAL or RESTRICTED information into a tool, or into the wrong tool, tell ${contact} the same day. Say what went in, which tool, and when. Reporting promptly is what protects the firm and the person concerned, and it is never held against you.`,
        ],
      },
      {
        heading: "9. Training and records",
        paras: [
          `Everyone completes the firm's AI safety training before using an approved tool for work, and again each year or when the approved list changes. ${Firm} keeps a register of who has completed training and when.`,
        ],
      },
      {
        heading: "10. Review",
        paras: [
          `${contact} owns this policy. It is reviewed every twelve months, and sooner when a tool is added or removed. Questions about it go to the same person.`,
        ],
      },
    ],
  };
}

/** Plain text, for the clipboard and the email's text part. */
export function policyToText(pol: Policy): string {
  const out: string[] = [pol.title.toUpperCase(), pol.stamp, "", pol.intro, ""];
  for (const s of pol.sections) {
    out.push(s.heading, "");
    for (const p of s.paras) out.push(p, "");
    if (s.bullets) {
      for (const b of s.bullets) out.push(`  - ${b}`);
      out.push("");
    }
  }
  return out.join("\n").trim() + "\n";
}
