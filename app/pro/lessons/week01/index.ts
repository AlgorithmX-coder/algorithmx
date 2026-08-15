import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Week 1 - Passwords & account security. Five topics, each a full
 * Learn -> See -> Try -> Check lesson, building one real portfolio piece
 * (the Personal Security Audit) across the week. */
const week01: WeekManifest = {
  id: "week-01",
  weekLabel: "Module 3",
  act: "Act 1 - Foundations you can touch",
  title: "Passwords & account security",
  intro: "The lock everyone picks first. Over five hands-on topics you will learn how passwords are really stored, how they get cracked, how to build ones worth trusting, why a second factor changes everything, and how to lock down your own accounts, finishing with a real security audit you can put in your portfolio.",
  role: "Every cyber role reasons about credentials daily, and account takeover is behind a huge share of real breaches. This is the foundation the rest of the course builds on.",
  outcomes: [
    "Explain how good sites store passwords, and how attackers crack the bad ones",
    "Build long, unique passwords and manage them with a password manager",
    "Turn on strong MFA and know why SMS is the weakest kind",
    "Produce a finished Personal Security Audit of your own accounts",
  ],
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default week01;
