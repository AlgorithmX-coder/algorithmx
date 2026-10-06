import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 16 - Incident response & digital forensics. What to do when it
 * goes wrong (Security+ Domain 4; NIST 800-61; CyBOK Forensics): the IR
 * lifecycle, containment vs eradication, evidence handling, building a
 * timeline, and tabletops and the incident report. The close of Act 3.
 * Every case is sourced public record. */
const module16: WeekManifest = {
  id: "module-16",
  weekLabel: "Module 16",
  act: "Act 3 - Defence for real",
  title: "Incident response & forensics",
  intro: "When prevention and detection have done their part, response is what limits the damage and gets you back on your feet. Across five short topics you will learn the incident-response lifecycle, the crucial difference between containment and eradication, how to handle evidence and keep a chain of custody, how to reconstruct an attack into a timeline, and how to rehearse and learn through tabletops and the incident report. Each idea is taught through a real case.",
  role: "This is Security+ Domain 4 and the NIST incident-response and forensics bodies of knowledge: the response skills that determine whether an incident is a catastrophe or a bad week, and a staple of defensive roles.",
  outcomes: [
    "Walk the incident-response lifecycle, and know why preparation comes first",
    "Distinguish containment (stop the spread) from eradication (remove the threat), and the trade-offs",
    "Handle digital evidence soundly and maintain a chain of custody",
    "Reconstruct an attack into a clear, evidence-based timeline",
    "Rehearse incidents with tabletops, and write a clear, blameless incident report",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module16;
