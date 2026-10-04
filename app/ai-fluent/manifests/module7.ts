import type { ModuleManifest } from "@/app/ai-cleared/engine/types";
import { FINANCE_PACK } from "../desks/finance";
import { GENERAL_BLOCKS } from "../desks/general";
import { LEGAL_BLOCKS } from "../desks/legal";
import { HR_BLOCKS } from "../desks/hr";
import { SALES_BLOCKS } from "../desks/sales";
import { SUPPORT_BLOCKS } from "../desks/support";
import { OPS_BLOCKS } from "../desks/ops";
import { IT_BLOCKS } from "../desks/it";
import { LEADERSHIP_BLOCKS } from "../desks/leadership";

/* AI Fluent, Module 7 · Research. Finding out with sources on: asking
 * for sources, checking them, the difference between a citation and a
 * claim. Two practices: a research question with web mode on, then mark
 * the source that does not exist. */
const SOURCES = [
  { label: "Late Payment of Commercial Debts (Interest) Act 1998, legislation.gov.uk", real: true, note: "The Act is on legislation.gov.uk and is the statutory basis for interest on late commercial payments." },
  { label: "GOV.UK, \"Late commercial payments: charging interest and debt recovery\"", real: true, note: "A real GOV.UK guidance page; it sets out the statutory rate and the fixed recovery sums." },
  { label: "Bank of England, Bank Rate, bankofengland.co.uk", real: true, note: "The Bank publishes Bank Rate; statutory interest is calculated from it." },
  { label: "Federation of Small Businesses, \"Late Payment Interest Calculator Handbook 2026\", page 14", real: false, note: "There is no such handbook. The publisher is real, the year is current, the page number is specific, and the document does not exist. That is how invented sources look." },
];

export const FLUENT_MODULE_7: ModuleManifest = {
  n: 7,
  slug: "research",
  title: "Research",
  minutes: 20,
  course: "ai-fluent",
  promise: "Find something out with the tool, get its sources, and know which of them are real.",
  passMark: 4,
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 7 of 9 · about 20 minutes",
      heading: "A citation is a claim until you open it.",
      lead: "With web mode on, the tool can find out things you do not know and tell you where it found them. It can also give you a source that reads perfectly and does not exist. This module is research as a habit: ask with the reader and the constraints, ask for the sources, open two, and treat the rest as claims.",
      cta: "Show me a reply with sources",
    },
    {
      kind: "sources",
      eyebrow: "Learn · four sources, one invented",
      heading: "Tap each source to check it.",
      lead: "A finance question with web mode on. The reply cites four sources. Check all four.",
      sim: { tool: "copilot", tier: "enterprise" },
      prompt: "What interest can a UK business charge on a late commercial payment, and is there a fixed recovery fee? Cite your sources.",
      reply: "Under the Late Payment of Commercial Debts (Interest) Act 1998, a business can charge statutory interest of 8% plus the Bank of England base rate on late commercial payments [1][3]. GOV.UK guidance also sets out fixed sums that can be claimed for recovery costs, depending on the size of the debt [2]. A practitioner's handbook gives worked examples of the calculation [4].\n\nSources:\n1. Late Payment of Commercial Debts (Interest) Act 1998, legislation.gov.uk\n2. GOV.UK, Late commercial payments: charging interest and debt recovery\n3. Bank of England, Bank Rate\n4. Federation of Small Businesses, Late Payment Interest Calculator Handbook 2026, page 14",
      sources: SOURCES,
      note: "Three real, one invented, and the invented one is the most specific. Specificity is not evidence.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · four habits",
      heading: "Four habits for research with a tool. Tap each.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Citation versus claim", tag: "Habit 1", tint: "I", body: "A source you have not opened is a claim the tool made.", detail: "The sentence \"according to GOV.UK\" is only as good as the page behind it. Until you open it, treat it as the tool's word." },
        { title: "Ask for sources", tag: "Habit 2", tint: "I", body: "\"List your sources with the publisher and the date.\"", detail: "Asking changes the reply: the tool is more careful when it knows it must show where each claim came from." },
        { title: "Open two", tag: "Habit 3", tint: "C", body: "Pick the two that carry the figures and open them.", detail: "Not all four, every time; two, always. If both hold, the reply is probably sound. If one does not exist, nothing in the reply is safe." },
        { title: "The date", tag: "Habit 4", tint: "R", body: "Rates, thresholds and rules change. Ask when the source was last updated.", detail: "A correct answer from 2023 can be a wrong answer today. The date is part of the citation." },
      ],
      note: "Next: your own research question with web mode on, then the sources check.",
    },
  ],
  tracks: {
    general: GENERAL_BLOCKS[7],
    legal: LEGAL_BLOCKS[7],
    hr: HR_BLOCKS[7],
    sales: SALES_BLOCKS[7],
    support: SUPPORT_BLOCKS[7],
    ops: OPS_BLOCKS[7],
    it: IT_BLOCKS[7],
    leadership: LEADERSHIP_BLOCKS[7],
    finance: {
      dataPack: FINANCE_PACK,
      practises: [
        {
          kind: "loop",
          task: "Research a question for the finance director with web mode on, then get the sources.",
          brief: "Helen wants to know what the firm could charge in statutory interest and recovery costs on a late commercial payment if it came to that, UK rules only, as a short note she can forward to the firm's solicitor. Do not name any client in the prompt; the figures are what matter.",
          followUp: true,
          webMode: true,
          turns: [
            { instruction: "Send 1: the question, for the finance director, with the constraints that matter: UK only, current rules, cite sources, say when each was last updated.", rubric: { requires: ["task", "reader", "constraints"], goal: "A short note on statutory interest and recovery sums for a late commercial payment in the UK, with sources and their dates." }, placeholder: "For the finance director: what interest and recovery costs can a UK business claim on a late commercial payment… UK only, current rules, cite sources with dates…" },
            { instruction: "Send 2: ask for the sources as a numbered list with the publisher, the page title and the date, and ask it to mark any it is not certain exists.", placeholder: "List your sources with publisher, title and date, and mark any you are not certain exist…" },
          ],
          playbook: { workflow: "Research", whenToUse: "A question you cannot answer from your own files: ask with the reader and the constraints, UK only and current, and demand sources with dates.", check: "Open two of the sources. If one does not exist, trust nothing in the reply." },
        },
        {
          kind: "sources",
          task: "Here is the sources list a colleague got for the same question. One of the four does not exist. Mark it.",
          prompt: "List the sources for that answer with publisher, title and date.",
          reply: "Here are the sources:\n\n1. Late Payment of Commercial Debts (Interest) Act 1998, legislation.gov.uk\n2. GOV.UK, Late commercial payments: charging interest and debt recovery\n3. Bank of England, Bank Rate, bankofengland.co.uk\n4. Federation of Small Businesses, Late Payment Interest Calculator Handbook 2026, page 14\n\nI am confident in all four.",
          sources: SOURCES,
        },
      ],
      prove: [
        { kind: "choose", stem: "The reply cites \"GOV.UK guidance\" for a figure. What is that citation until you open the page?", options: ["Proof.", "A claim the tool made.", "A link."], answer: 1, why: "A source you have not opened is the tool's word. Opening it is what turns a claim into evidence." },
        { kind: "choose", stem: "Which source is most likely to be invented?", options: ["A government page with a plain title.", "A named handbook with a year and a page number.", "An Act of Parliament."], answer: 1, why: "Invented sources are specific: a publisher, a year, a page. Specificity is not evidence." },
        { kind: "choose", stem: "How many sources should you open, as a habit?", options: ["All of them, every time.", "Two, always: the ones carrying the figures.", "None; the tool checked them."], answer: 1, why: "Two is the habit that holds. If one of the two does not exist, nothing in the reply is safe." },
        { kind: "choose", stem: "Why ask when a source was last updated?", options: ["To cite it properly.", "Because rates and rules change; a correct answer from 2023 can be wrong today.", "Because older pages load slowly."], answer: 1, why: "The date is part of the citation. Research is only as current as its sources." },
        { kind: "choose", stem: "What does asking for sources change about the reply itself?", options: ["Nothing.", "The tool is more careful when it must show where each claim came from.", "It makes the reply shorter."], answer: 1, why: "Asking for sources is not only for checking. It changes how the tool answers." },
      ],
    },
  },
};
