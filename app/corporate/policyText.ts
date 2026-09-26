/**
 * The starter AI use policy, written from a firm's profile answers.
 *
 * Pure: the same functions render the on-page preview (client), the PDF
 * print window (client) and the emailed copy (server), so none of them can
 * drift. Every line is plain English in an adult register, says what to do
 * rather than what not to, and never claims the policy makes anyone
 * compliant. The firm reviews and signs it; the adoption block at the end
 * is where that happens.
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
  /** Lines with a blank to fill in by hand: the adoption block. */
  blanks?: string[];
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

/* What the approved tools are for, in this sector. Four each, all of them
   things a person can start doing tomorrow with nothing sensitive in the
   prompt. */
const SECTOR_USES: Record<SectorId, string[]> = {
  legal: [
    "First drafts of routine letters and emails, with client details left as placeholders",
    "Summaries of documents the firm is permitted to put into the approved tool",
    "A plain-English explanation of a clause or a concept, to check your own understanding",
    "Proofreading your own writing for tone, clarity and length",
  ],
  accountancy: [
    "First drafts of client letters and payment reminders, with figures and names as placeholders",
    "An explanation of a standard, a rule or a formula, so you can check your own working",
    "Turning your own notes into a tidy summary for a colleague",
    "Drafting spreadsheet formulas and checks, tested on dummy data first",
  ],
  recruitment: [
    "First drafts of job adverts and outreach, with no candidate details in the prompt",
    "Turning a role brief into a set of interview questions",
    "Summarising your own notes from a call",
    "Proofreading your own writing for tone and clarity",
  ],
  consultancy: [
    "Structuring a document or a deck before you write it",
    "First drafts of proposals from a brief, with client figures as placeholders",
    "Summarising public research and reports, with the sources checked",
    "Rewriting your own work for a different audience",
  ],
  property: [
    "First drafts of routine correspondence, with names and addresses as placeholders",
    "An explanation of a regulation or a process, so you can check your own understanding",
    "Turning your own notes into a clear summary",
    "Proofreading listings and letters for clarity",
  ],
  services: [
    "First drafts of routine correspondence, with details left as placeholders",
    "Summaries of documents the firm is permitted to put into the approved tool",
    "An explanation of a concept or a process, to check your own understanding",
    "Proofreading your own writing for tone, clarity and length",
  ],
  other: [
    "First drafts of routine correspondence, with details left as placeholders",
    "Summaries of documents the firm is permitted to put into the approved tool",
    "An explanation of a concept or a process, to check your own understanding",
    "Proofreading your own writing for tone, clarity and length",
  ],
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
    intro: `Written from ${named ? firm + "'s" : "your"} profile answers. It is a starting point: review it with whoever owns your policies, adjust the tool lists as they change, and sign the adoption block at the end when it is yours.`,
    sections: [
      {
        heading: "1. Why this policy exists",
        paras: [
          `AI tools save time and are already part of how ${firm} works. They also keep what they are told. This policy sets out which tools staff may use, what may go into them, what they are good for, and what to do when something goes wrong, so that the time saved never costs a client, a colleague or the firm.`,
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
        heading: "6. What AI is good for here",
        paras: [`Used within the rules above, the approved tools are encouraged for work like this:`],
        bullets: SECTOR_USES[p.sector],
      },
      {
        heading: "7. Work that always gets a second pair of eyes",
        paras: [`AI may help draft these. A person checks them before they leave the firm, every time.`],
        bullets: [
          "Anything that goes to a client or a member of the public",
          "Advice, figures, valuations or deadlines",
          "Anything about a named person's employment, health, pay or conduct",
          "Anything that will be relied on in a contract, a filing or a court",
        ],
      },
      {
        heading: "8. Before every send: the paste test",
        paras: [`Three questions, three seconds.`],
        bullets: [
          "Would I email this to a stranger? If not, it is at least CONFIDENTIAL.",
          "Does it name a person or a client? Take the name out and most of the risk goes with it.",
          "Could someone rebuild the original from it? Several INTERNAL facts can add up to one CONFIDENTIAL one.",
        ],
      },
      {
        heading: "9. Checking what comes out",
        paras: [
          `AI output is a draft. Check facts, figures and citations before they go anywhere, and read every document before you send it. Treat instructions that appear inside a document, email or web page the tool has read as suspect, and ask ${contact} if something looks planted.`,
        ],
      },
      {
        heading: "10. If something goes wrong",
        paras: [
          `If you realise you have put CONFIDENTIAL or RESTRICTED information into a tool, or into the wrong tool, tell ${contact} the same day. Say what went in, which tool, and when. Reporting promptly is what protects the firm and the person concerned, and it is never held against you.`,
        ],
      },
      {
        heading: "11. Training and records",
        paras: [
          `Everyone completes the firm's AI safety training before using an approved tool for work, and again each year or when the approved list changes. ${Firm} keeps a register of who has completed training and when.`,
        ],
      },
      {
        heading: "12. Adoption and review",
        paras: [
          `${contact} owns this policy. It is reviewed every twelve months, and sooner when a tool is added or removed. Questions about it go to the same person.`,
        ],
        blanks: ["Approved by", "Role", "Date adopted", "Next review"],
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
    if (s.blanks) {
      for (const b of s.blanks) out.push(`${b}: ______________________________`);
      out.push("");
    }
  }
  return out.join("\n").trim() + "\n";
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

/**
 * A complete, self-contained HTML document of the policy: the print window
 * uses it for the PDF, the email uses it as the body. Inline styles only,
 * so it renders the same in a browser print dialog and a mail client.
 */
export function policyToHtml(pol: Policy, opts: { footer?: string } = {}): string {
  const body = pol.sections
    .map(
      (s) =>
        `<h2 style="margin:24px 0 8px;font-size:15px;font-weight:600;color:#14161d;page-break-after:avoid;">${esc(s.heading)}</h2>` +
        s.paras.map((p) => `<p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#1f2733;">${esc(p)}</p>`).join("") +
        (s.bullets ? `<ul style="margin:0 0 10px;padding-left:20px;font-size:14px;line-height:1.6;color:#1f2733;">${s.bullets.map((x) => `<li style="margin-bottom:4px;">${esc(x)}</li>`).join("")}</ul>` : "") +
        (s.blanks
          ? `<table cellpadding="0" cellspacing="0" style="margin:14px 0 0;width:100%;font-size:14px;line-height:1.6;color:#1f2733;page-break-inside:avoid;">${s.blanks
              .map((b) => `<tr><td style="padding:10px 12px 4px 0;white-space:nowrap;width:1%;">${esc(b)}</td><td style="padding:10px 0 4px;border-bottom:1px solid #9aa3ad;"></td></tr>`)
              .join("")}</table>`
          : ""),
    )
    .join("");
  const footer = opts.footer
    ? `<p style="margin:28px 0 0;padding-top:16px;border-top:1px solid rgba(20,22,29,0.14);font-size:12px;line-height:1.6;color:#5d6472;">${esc(opts.footer)}</p>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(pol.title)}</title><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#14161d;">
  <div style="max-width:680px;margin:0 auto;padding:32px 28px 40px;">
    <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#0a7085;font-weight:800;margin-bottom:10px;">${esc(pol.stamp)}</div>
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;">${esc(pol.title)}</h1>
    <p style="margin:0 0 6px;font-size:13.5px;line-height:1.6;color:#5d6472;">${esc(pol.intro)}</p>
    ${body}
    ${footer}
  </div>
</body></html>`;
}
