import type { WeekManifest } from "../../learn/types";
import topic1 from "./topic1";
import topic2 from "./topic2";
import topic3 from "./topic3";
import topic4 from "./topic4";
import topic5 from "./topic5";

/* Module 1 - What security actually means. The concept foundation every
 * certificate opens with (Security+ Domain 1; ISC² CC Domain 1), taught
 * through five real breaches and hands-on classification labs. */
const module01: WeekManifest = {
  id: "module-01",
  weekLabel: "Module 1",
  act: "Act 1 - Foundations you can touch",
  title: "What security actually means",
  intro: "Before any tools, the ideas the whole field is built on, the same ones every certificate opens with. Across five short topics you will learn what security protects, how to weigh a risk, the kinds of defence, how to limit damage when something gets in, and how to think like both an attacker and a defender. Each idea is taught through a real breach you will recognise.",
  role: "This is Security+ Domain 1 and the ISC² CC principles: the shared language of the whole industry. Everything in the later modules stands on it.",
  outcomes: [
    "Use the CIA triad to describe what any attack broke",
    "Tell a threat, a vulnerability, and a risk apart, and name the four ways to treat a risk",
    "Classify any defence as preventive, detective, or corrective",
    "Explain defence in depth and least privilege, and why flat networks fail",
    "Switch between the attacker's and the defender's mindset on demand",
  ],
  briefing: {
    introAudio: "/pro/briefings/m01-intro.mp3",
    introBlurb: "A one-minute briefing from your instructor: what this module covers, and why it is the foundation everything else is built on.",
    outroAudio: "/pro/briefings/m01-outro.mp3",
    outroBlurb: "A short recap of what you can now do, and the one idea to carry forward.",
  },
  topics: [topic1, topic2, topic3, topic4, topic5],
};

export default module01;
