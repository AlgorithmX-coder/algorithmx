import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 19 - Resilience: backups & continuity. Surviving the bad day
 * (Security+ Domains 3/4; ISC2 CC D2): continuity and disaster recovery,
 * ransomware-proof backups (3-2-1), RTO/RPO, redundancy and failover,
 * and testing recovery. Every case is sourced public record. */
const module19: WeekManifest = {
  id: "module-19",
  weekLabel: "Module 19",
  act: "Act 4 - Get hired",
  title: "Resilience: backups & continuity",
  intro: "Resilience is the ability to survive and recover from the bad day, whether a cyber attack or a fire. Across five short topics you will learn business continuity and disaster recovery, how to make backups that survive ransomware (the 3-2-1 rule), the RTO and RPO targets that size recovery, redundancy and failover, and why an untested recovery plan fails. Each idea is taught through a real case.",
  role: "This is the resilience side of Security+ and ISC2 CC: the practical, high-value skills of surviving and recovering from disruptions, which turn a potential catastrophe into a bad week.",
  outcomes: [
    "Distinguish business continuity (keep running) from disaster recovery (restore systems)",
    "Build backups that survive ransomware: 3-2-1 plus an offline/immutable copy",
    "Size recovery with RTO (how fast) and RPO (how much data loss)",
    "Spot single points of failure and design redundancy and failover",
    "Test recovery so it is a proven guarantee, not a hopeful guess",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module19;
