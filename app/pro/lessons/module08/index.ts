import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 8 - Malware: how it really works. The threat everyone fears,
 * explained to prevent, detect and recover (Security+ Domain 2; Cyber
 * Essentials Malware Protection; CyBOK Malware). Taught defensively;
 * every lab is recognition or decision; every case is sourced public
 * record. */
const module08: WeekManifest = {
  id: "module-08",
  weekLabel: "Module 8",
  act: "Act 2 - How attacks happen",
  title: "Malware: how it really works",
  intro: "Malware is the word everyone fears and few understand. Across five short topics you will untangle the malware family tree, see exactly how ransomware holds you hostage, learn the handful of ways infection really happens, understand what malware does once inside, and see how professionals study it safely, and turn that study into protection. Each idea is taught to prevent, detect and recover, through real cases.",
  role: "This is Security+ Domain 2, Cyber Essentials' malware-protection control, and the CyBOK malware body of knowledge. It turns a vague fear into a concrete, defensible checklist.",
  outcomes: [
    "Name the malware family and read how each type spreads and what it wants",
    "Explain how ransomware takes you hostage, and why backups and patching beat paying",
    "Close the finite list of ways malware actually gets in",
    "Read what malware is for from how it behaves, and judge severity",
    "Describe how malware is studied safely, and how that study protects everyone",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module08;
