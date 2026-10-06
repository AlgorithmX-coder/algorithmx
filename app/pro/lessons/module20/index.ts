import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 20 - The roles & the certification roadmap. The honest career
 * map: the real entry roles, what each does day to day, the sensible
 * cert path, the honest market, and turning a non-technical background
 * into an asset. Hype-free and realistic, per the course's claims
 * policy (aligned to objectives; no guarantees). */
const module20: WeekManifest = {
  id: "module-20",
  weekLabel: "Module 20",
  act: "Act 4 - Get hired",
  title: "The roles & the cert roadmap",
  intro: "This module is the honest career map. Across five short topics you will learn the realistic entry roles (SOC, GRC, IT security, and why pen testing comes later), what each job actually does day to day, a sensible certification roadmap, the honest state of the job market beyond the hype, and how to turn a non-technical background into an asset. Grounded in realism, not marketing.",
  role: "This is the career on-ramp: knowing which roles are realistic, what certs to pursue in what order, the honest market, and how your background helps. It turns everything you have learned into a plan for getting hired.",
  outcomes: [
    "Identify the realistic entry roles, and why pen testing is usually a later destination",
    "Picture what each role actually does day to day, and judge which suits you",
    "Follow a sensible certification roadmap (foundation, Security+, then specialise)",
    "Understand the honest job market, beyond hype and gloom, and what actually helps",
    "Reframe a non-technical background as the asset it often is",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module20;
