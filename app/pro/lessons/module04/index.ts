import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 4 - Cryptography without the maths. Why the padlock means
 * something (Security+ 1.4; CyBOK Cryptography), taught in plain terms
 * with a real in-browser encryption lab. Upgrades the former single-
 * lesson preview (week02) to a full five-topic module. Every case is
 * sourced public record. */
const module04: WeekManifest = {
  id: "module-04",
  weekLabel: "Module 4",
  act: "Act 1 - Foundations you can touch",
  title: "Cryptography without the maths",
  intro: "Cryptography underpins almost all of modern security, and this module explains it in plain terms, no maths required. Across five short topics you will learn why we encrypt (and what encryption is not), symmetric versus asymmetric keys, hashing versus encryption, how HTTPS and certificates really work (encrypting a real message yourself), and digital signatures and PKI. Each idea is taught through a real case.",
  role: "This is Security+ 1.4 and the CyBOK cryptography foundations: the concepts behind the padlock, HTTPS, password storage and software trust, explained so a beginner truly understands them.",
  outcomes: [
    "Explain what encryption protects, and what it does not",
    "Tell symmetric from asymmetric encryption, and how HTTPS uses both",
    "Tell hashing from encryption, and know which to use (and why passwords are hashed)",
    "Understand HTTPS, TLS and certificates, and feel encryption work hands-on",
    "Explain digital signatures and PKI: proving who sent something, and that it is unchanged",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module04;
