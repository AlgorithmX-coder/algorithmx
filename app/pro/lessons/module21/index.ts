import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 21 - The job machinery + capstone. The final module: turning
 * everything into a job. Your portfolio, CV and LinkedIn, interview
 * prep, your home lab and staying current, and the capstone, one
 * investigation written up two ways. The end of the course. */
const module21: WeekManifest = {
  id: "module-21",
  weekLabel: "Module 21",
  act: "Act 4 - Get hired",
  title: "The job machinery + capstone",
  intro: "The final module turns everything into a job. Across five short topics you will assemble your portfolio (the pieces you built throughout the course), learn to present yourself on a CV and LinkedIn, prepare for cyber interviews, set up a home lab and habits for staying current, and complete your capstone, one full investigation written up two ways. This is the end of your journey from zero to job-ready.",
  role: "This is the culmination of the career on-ramp: the practical machinery of getting hired, and the capstone that proves you can both do security work and communicate it. It turns your new knowledge and portfolio into a job-ready case.",
  outcomes: [
    "Assemble and present the portfolio you built throughout the course",
    "Write a specific, tailored, portfolio-linked and honest CV and profile",
    "Handle cyber interviews: show how you think, be honest, and demonstrate your work",
    "Keep building skills safely and lawfully, and stay current in a fast-moving field",
    "Complete the capstone: one investigation written for both technical and executive audiences",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module21;
