import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 9 - Web attacks & the OWASP Top 10. The largest attack surface
 * most organisations have (Security+ Domains 2-3; OWASP Top 10; CyBOK
 * Web), with a real in-browser SQL-injection lab at its heart. Taught
 * defensively; every case is sourced public record. */
const module09: WeekManifest = {
  id: "module-09",
  weekLabel: "Module 9",
  act: "Act 2 - How attacks happen",
  title: "Web attacks & the OWASP Top 10",
  intro: "The web is the largest attack surface most organisations have, and this module is its tour, with a real attack you perform yourself. Across five short topics you will learn how websites talk to databases, run a genuine SQL injection in your browser and apply its fix, understand cross-site scripting and broken access control, and finish with the OWASP Top 10, the industry's shared map of web risks. Each idea is taught to defend, through real cases.",
  role: "This is Security+ web content and the OWASP Top 10, the shared standard for web security. Defending and testing web applications is core to both blue-team and penetration-testing careers, and the hands-on SQL-injection lab is exactly the kind of competence employers value.",
  outcomes: [
    "Explain how a web app and its database work, and the rule: never trust user input",
    "Perform a real SQL injection in a safe sandbox, and apply the parameterised-query fix",
    "Understand cross-site scripting and the output-encoding principle that defeats it",
    "Recognise broken access control (OWASP's #1 risk) and why it must be enforced server-side",
    "Navigate the OWASP Top 10 with a handful of recurring fix mindsets",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module09;
