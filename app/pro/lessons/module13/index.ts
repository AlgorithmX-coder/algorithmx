import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 13 - The SOC & the analyst's day. The most common first job in
 * cyber security, seen from the inside (Security+ Domain 4; NICE Cyber
 * Defense Analyst). What a SOC is, how it is structured, the language of
 * events/alerts/incidents, the core tools, and the craft of good triage.
 * Every case is sourced public record. */
const module13: WeekManifest = {
  id: "module-13",
  weekLabel: "Module 13",
  act: "Act 3 - Defence for real",
  title: "The SOC & the analyst's day",
  intro: "This module is about the most common first job in cyber security, seen from the inside. Across five short topics you will learn what a Security Operations Centre is and why visibility matters, how a SOC is structured and where you would start, the precise language of events, alerts and incidents, the core tools (SIEM and EDR), and the craft of good triage, the day you are working toward. Each idea is taught through a real case.",
  role: "This is the heart of the career on-ramp: the SOC analyst role, the realistic first job, and the skills and structure around it. Understanding it is essential for the job hunt in Act 4.",
  outcomes: [
    "Explain what a SOC is and why visibility and low dwell time matter so much",
    "Describe a SOC's tiers, roles and escalation path, and where you would start",
    "Distinguish events, alerts and incidents, and act proportionately",
    "Say what a SIEM and EDR each do, and how they complement each other",
    "Recognise and practise good triage: calm, evidence-led, well-escalated, documented",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module13;
