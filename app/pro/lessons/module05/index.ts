import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 5 - Law, ethics & your first audit. The rules you never cross,
 * and the completion of portfolio piece #1 (Security+ Domain 5; CyBOK
 * Law). This module is the legal and ethical bedrock the whole course
 * stands on: it is deliberately the last of Act 1, immediately before
 * the hands-on attack techniques of Act 2 begin. Every case is sourced
 * public record. */
const module05: WeekManifest = {
  id: "module-05",
  weekLabel: "Module 5",
  act: "Act 1 - Foundations you can touch",
  title: "Law, ethics & your first audit",
  intro: "The rules that turn these skills into a profession instead of a crime, and the finish of your first portfolio piece. Across five short topics you will learn the Computer Misuse Act, UK data protection law, how authorised testing and scope work, how to disclose a flaw responsibly, and you will complete and write up your Personal Security Audit. Each idea is taught through a real case.",
  role: "This is Security+ Domain 5 and the legal and ethical foundation of the whole field. It is the last module of Act 1 on purpose: everything hands-on in Act 2 and beyond depends on the authorisation line you draw here.",
  outcomes: [
    "State what the Computer Misuse Act 1990 makes an offence, and why intent is not the test",
    "Explain UK GDPR in plain terms, and connect your security work to the legal duty it meets",
    "Define authorisation and scope, and run an engagement without crossing either",
    "Disclose a flaw you find responsibly, in the right order, through the right channels",
    "Complete and write up your Personal Security Audit as portfolio piece #1",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module05;
