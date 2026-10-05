import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 12 - Hardening & secure configuration. The start of Act 3,
 * "defending for real" (Security+ Domain 4; Cyber Essentials all five).
 * The practical basics that stop most attacks, built into a real
 * hardening checklist. Every case is sourced public record. */
const module12: WeekManifest = {
  id: "module-12",
  weekLabel: "Module 12",
  act: "Act 3 - Defence for real",
  title: "Hardening & secure configuration",
  intro: "Act 3 turns to defending for real, starting with the basics that stop most attacks. Across five short topics you will learn the Cyber Essentials five controls, how to build a secure baseline and shrink the attack surface, least privilege in practice, patch management as an operational process, and how to produce a real hardening checklist. Each idea is taught through a real case, and it is all constructive, defensive work.",
  role: "This is Security+ Domain 4 and the whole of Cyber Essentials. Hardening is the practical, high-value work that removes you from the easy-target pool most attacks rely on.",
  outcomes: [
    "Name and apply the Cyber Essentials five controls that block most common attacks",
    "Build a secure baseline and systematically reduce the attack surface",
    "Apply least privilege in practice, and spot how it erodes",
    "Run patch and update management as a reliable process, including risky management tooling",
    "Produce a real, reusable hardening checklist from a trusted baseline",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module12;
