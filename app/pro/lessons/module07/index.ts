import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 7 - Social engineering & phishing. The human side of attacks
 * (Security+ Domain 2; CyBOK Human Factors), taught entirely to
 * recognise, resist and report, never to craft. Every lab is a
 * recognition or decision exercise; every case is sourced public
 * record. */
const module07: WeekManifest = {
  id: "module-07",
  weekLabel: "Module 7",
  act: "Act 2 - How attacks happen",
  title: "Social engineering & phishing",
  intro: "The most common way into any organisation is not a flaw in the technology, it is a person. Across five short topics you will learn why humans are the target, the whole phishing family across email, voice and text, the psychology that makes it work, a concrete checklist for inspecting a suspicious message, and how to respond and report so a whole organisation is protected. Everything here is taught to spot, resist and report, never to attack.",
  role: "This is Security+ Domain 2 and the human-factors heart of real-world security. The skills here, spotting a phish, responding calmly, building a reporting culture, prevent incidents every single day.",
  outcomes: [
    "Explain why people are the most attacked layer, and treat that with respect, not blame",
    "Name every member of the phishing family: spear, whaling and BEC, vishing, smishing",
    "Recognise the psychological levers a con pulls, and feel them being pulled",
    "Inspect a suspicious email with a concrete checklist of real tells",
    "Respond to and report phishing so the whole organisation is protected",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module07;
