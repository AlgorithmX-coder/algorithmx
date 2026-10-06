import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 10 - Networks & Wi-Fi under attack. The attacks on the journey
 * you learned in Module 2 (Security+ Domains 2-3; ISC2 CC Domain 4):
 * eavesdropping and MITM, evil-twin Wi-Fi, spoofing, denial of service,
 * and lateral movement. Taught defensively; every lab is recognition or
 * decision; every case is sourced public record. */
const module10: WeekManifest = {
  id: "module-10",
  weekLabel: "Module 10",
  act: "Act 2 - How attacks happen",
  title: "Networks & Wi-Fi under attack",
  intro: "Now the journey from Module 2 comes under attack. Across five short topics you will learn how attackers eavesdrop and insert themselves as a middleman, how fake 'evil twin' Wi-Fi lures you in, how spoofing fakes trusted identities, how denial-of-service floods take services offline, and how attackers move sideways once inside, and how segmentation stops them. Each idea is taught to recognise and defend, through real cases.",
  role: "This is the network-attack heart of Security+ Domains 2 and 3. It turns the plumbing you learned in Module 2 into a map of threats and, more importantly, the defences that counter each one.",
  outcomes: [
    "Explain eavesdropping and man-in-the-middle, and how encryption (and its trust) defends them",
    "Spot and defeat evil-twin Wi-Fi with simple, practical habits",
    "Recognise spoofing at every layer, and treat displayed identities as claims, not proof",
    "Understand denial-of-service attacks and the availability-specific defences that counter them",
    "See how lateral movement turns a foothold into a breach, and how segmentation contains it",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module10;
