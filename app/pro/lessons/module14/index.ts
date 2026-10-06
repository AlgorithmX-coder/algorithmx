import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 14 - Logs & the SIEM. The analyst's central hands-on skill
 * (Security+ Domain 4; CyBOK SOIM), with a real in-browser SIEM
 * investigation of genuine honeypot data. Upgrades the former single-
 * lesson preview (week13) to a full five-topic module. Every case is
 * sourced public record. */
const module14: WeekManifest = {
  id: "module-14",
  weekLabel: "Module 14",
  act: "Act 3 - Defence for real",
  title: "Logs & the SIEM",
  intro: "Reading logs is the single most practised skill of a SOC analyst, and this module is hands-on. Across five short topics you will learn what logs are and why they are evidence, investigate a real honeypot capture in a SIEM yourself, search millions of logs at scale, correlate scattered entries into an attack story, and write up a clear finding. Each idea is taught through real captured attacks.",
  role: "This is Security+ Domain 4 and the CyBOK security-operations knowledge: the core, demonstrable SOC skill of turning raw logs into understanding, with a real in-browser SIEM investigation at its heart.",
  outcomes: [
    "Understand logs as evidence, and know which log answers which question",
    "Investigate a real honeypot capture in a SIEM, the core SOC skill",
    "Search millions of logs at scale by filtering, not scrolling",
    "Correlate scattered entries across logs into a clear attack timeline",
    "Write up a clear, evidence-led, actionable finding (the triage report)",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module14;
