import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 17 - Governance, risk & compliance (GRC). The huge hiring lane
 * beginners miss (Security+ Domain 5; ISO 27001; NIST CSF): risk
 * management, the frameworks, policies and controls, third-party risk,
 * and audits. The start of Act 4, the career on-ramp. Every case is
 * sourced public record. */
const module17: WeekManifest = {
  id: "module-17",
  weekLabel: "Module 17",
  act: "Act 4 - Get hired",
  title: "Governance, risk & compliance",
  intro: "Act 4 is about getting hired, and it opens with the huge career lane most beginners miss: governance, risk and compliance, often more open to non-technical backgrounds. Across five short topics you will learn what risk management really is, the key frameworks (ISO 27001, NIST CSF, Cyber Essentials), policies, standards and controls, third-party and supply-chain risk, and audits and evidence. Each idea is taught through a real case.",
  role: "This is Security+ Domain 5 and the GRC world (ISO 27001, NIST CSF). GRC roles are plentiful, well-paid, and often the most accessible entry point for career-changers, because they value communication, organisation and business sense.",
  outcomes: [
    "Explain GRC and risk management, and why this lane suits non-technical backgrounds",
    "Tell apart the key frameworks (ISO 27001, NIST CSF, Cyber Essentials) and where law fits",
    "Distinguish policies, standards, procedures and controls, and spot 'policy on paper'",
    "Manage third-party and supply-chain risk with diligence, contracts and least privilege",
    "Understand audits and evidence, and write a small-business risk assessment",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module17;
