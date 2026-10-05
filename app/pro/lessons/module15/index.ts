import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 15 - Detection & threat intelligence. How defenders spot
 * attacks and know their adversary (Security+ Domain 4; MITRE ATT&CK):
 * signatures vs behaviour, IOCs, threat intelligence, ATT&CK mapping,
 * and tuning out the noise. Every case is sourced public record. */
const module15: WeekManifest = {
  id: "module-15",
  weekLabel: "Module 15",
  act: "Act 3 - Defence for real",
  title: "Detection & threat intelligence",
  intro: "Detection is the heart of a SOC, and this module is how it is done well. Across five short topics you will learn the two styles of detection (signatures and behaviour), indicators of compromise and how sharing them protects everyone, threat intelligence and knowing your adversary, mapping attacks to MITRE ATT&CK, and tuning out the noise so real alerts are seen. Each idea is taught through a real case.",
  role: "This is Security+ Domain 4 and MITRE ATT&CK: the detection and threat-intelligence skills at the core of a SOC analyst's value, and a growing specialism.",
  outcomes: [
    "Use both signature and behaviour detection, and know the blind spots of each",
    "Recognise and share indicators of compromise, and know their limits",
    "Tell useful threat intelligence from noise, and use it to defend specifically",
    "Map attacker activity to MITRE ATT&CK, and find your detection blind spots",
    "Tune detections to cut noise so real, trusted alerts stand out",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module15;
