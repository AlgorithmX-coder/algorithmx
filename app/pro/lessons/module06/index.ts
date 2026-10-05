import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 6 - Who the attackers are & how they operate. The opening of
 * Act 2 (Security+ Domain 2; MITRE ATT&CK): the real cast of attackers,
 * the cybercrime economy, the attack lifecycle, reconnaissance, and how
 * defenders use the same map. Taught entirely defensively, through real
 * sourced cases. */
const module06: WeekManifest = {
  id: "module-06",
  weekLabel: "Module 6",
  act: "Act 2 - How attacks happen",
  title: "Who the attackers are & how they operate",
  intro: "Act 2 begins by meeting the enemy, so you can defend against the real thing instead of a cartoon. Across five short topics you will learn the true cast of attackers and their motives, how the cybercrime economy actually runs, the lifecycle every intrusion follows, how attackers research a target, and how defenders turn that same map against them. Each idea is taught through a real case, and strictly for defence.",
  role: "This is the heart of Security+ Domain 2, the largest exam domain and the foundation of security operations. Everything in the rest of Act 2 builds on the attacker's map you learn here.",
  outcomes: [
    "Name the main types of threat actor and read what each one is likely after",
    "Explain why cybercrime is a professional industry, and why that makes the basics work",
    "Walk any intrusion through the kill-chain stages and find where to break it",
    "Describe how attackers research a target with OSINT, and how to shrink that exposure",
    "Use the attacker's own map, defensively, to place detections and defences",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module06;
