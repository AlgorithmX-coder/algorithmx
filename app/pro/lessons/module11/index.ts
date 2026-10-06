import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 11 - Vulnerabilities & patching. The flaws attacks exploit and
 * the discipline of fixing them (Security+ Domains 2 and 4; OWASP A06;
 * Cyber Essentials Update Management). The close of Act 2: taught
 * defensively; every lab is recognition or decision; every case is
 * sourced public record. */
const module11: WeekManifest = {
  id: "module-11",
  weekLabel: "Module 11",
  act: "Act 2 - How attacks happen",
  title: "Vulnerabilities & patching",
  intro: "Act 2 closes with the flaws attacks exploit, and the unglamorous discipline that defeats most of them. Across five short topics you will learn what a vulnerability really is and how the world names and scores them, why the patch race is so dangerous, how to read a vulnerability advisory, how to prioritise what to fix first, and how to handle end-of-life software, a problem that is as much human as technical. Each idea is taught to defend, through real cases.",
  role: "This is Security+ Domains 2 and 4, OWASP's vulnerable-components risk, and Cyber Essentials' update-management control. Vulnerability management is a huge part of real security work, and winning the patch race prevents an astonishing share of breaches.",
  outcomes: [
    "Use the vocabulary precisely: vulnerability, exploit, zero-day, CVE, CVSS",
    "Explain the patch race, and why exposed systems must be patched fast",
    "Read a vulnerability advisory for which flaw, how severe, how urgent, and what to do",
    "Prioritise what to fix first by blending severity, exposure and real-world exploitation",
    "Handle end-of-life software realistically: migrate ahead, or isolate and monitor",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module11;
