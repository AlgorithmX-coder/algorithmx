import type { TopicManifest } from "../../learn/types";
import { VulnReportLab } from "../../learn/conceptLabs";

/* Module 11 - Topic 3: reading a vulnerability report. Case:
 * "PrintNightmare" (2021), a Windows Print Spooler vulnerability whose
 * disclosure was genuinely confusing (overlapping CVEs, uncertainty
 * over which flaw was patched), illustrating why reading advisories
 * carefully matters. Public record: Microsoft advisories, CISA notes
 * and 2021 reporting. */
const topic3: TopicManifest = {
  id: "m11t3",
  weekLabel: "Module 11",
  act: "Act 2 - How attacks happen",
  title: "Reading a vulnerability report",
  role: "Advisories are dense and sometimes confusing, and an analyst who can read one accurately, which flaw, does it apply to us, how urgent, what to do, turns a wall of text into a clear decision. It is a daily skill that prevents both panic and complacency.",
  minutes: 16,
  promise: "Learn to read a vulnerability advisory for what actually matters, then see the confusing disclosure that caught defenders off guard.",
  brief: "In this lesson, we'll learn to read a vulnerability report. A good advisory answers four questions: which flaw is this and does it affect me, how severe is it, how urgent (is it being exploited?), and what should I do? We'll learn to extract each quickly. Then we'll look at PrintNightmare, a case where the disclosure itself was so confusing that even experienced defenders struggled to tell exactly what they were dealing with.",

  learn: [
    {
      heading: "Four questions every advisory should answer",
      body: [
        "A vulnerability advisory can look like an intimidating wall of technical detail, but you are really hunting for the answers to four questions. Which flaw is this, and does it affect systems I actually run (the CVE and the affected products and versions)? How severe is it (the CVSS score)? How urgent is it, in particular, is it being exploited in the wild, or is exploit code public? And what do I do, the patch to apply, or a workaround if I cannot patch yet?",
        "Training yourself to find those four answers fast turns any advisory into a decision. You do not need to understand every technical nuance of the flaw; you need to know whether it is yours, how bad, how pressing, and what action it calls for. That is reading for decision, not reading for completeness.",
      ],
      examples: [
        "Which / applies to me: the CVE, and the affected products and versions.",
        "How severe: the CVSS score and band.",
        "How urgent: is it exploited in the wild, or is exploit code public?",
        "What to do: the patch version, or the interim workaround.",
      ],
      analogy: {
        plain: "Reading a medicine's leaflet, you look for the bits that matter to you: is this my condition, how serious, how urgent, what is the dose, not every line of pharmacology.",
        realTerm: "reading for decision",
      },
    },
    {
      heading: "Severity is not the same as urgency",
      body: [
        "A subtle but vital point: the CVSS severity score is not the whole urgency story. A flaw with a slightly lower score that is being actively exploited in the wild can be far more pressing than a higher-scored one that nobody is using yet. Real-world exploitation, and public exploit code, are powerful urgency signals that sit alongside the raw severity.",
        "This is why good advisories, and good analysts, flag exploitation status prominently. 'Critical, and being actively exploited' is a drop-everything situation; 'critical, no known exploitation' is urgent but allows a little more order to your response. Reading for urgency, not just severity, is what separates a calm, correct response from both needless panic and dangerous complacency.",
      ],
      examples: [
        "A lower-scored flaw being exploited now can outrank a higher-scored one that is not.",
        "'Actively exploited' and 'public exploit code' are strong urgency signals.",
        "Weigh severity and exploitation together to judge true urgency.",
      ],
    },
    {
      heading: "When the report itself is unclear",
      body: [
        "Advisories are usually clear, but not always. Sometimes a disclosure is rushed, or several overlapping vulnerabilities get tangled, or it is genuinely uncertain whether a given patch fully fixes the problem. In those moments, careful reading matters most: you check exactly which CVE is which, exactly what a patch covers, and you treat ambiguity as a reason for caution, applying mitigations and watching closely until things are clear.",
        "This is a real part of the job, not a rare edge case. The professional response to a confusing advisory is not to freeze or to guess, but to read precisely, confirm from authoritative sources (the vendor, national agencies like the NCSC or CISA), and err on the side of reducing exposure while uncertainty remains. The PrintNightmare case ahead is the textbook example of a disclosure that demanded exactly this careful reading.",
      ],
      examples: [
        "Overlapping CVEs: check precisely which flaw and which patch you mean.",
        "Uncertain fix: treat ambiguity as a reason to mitigate and monitor, not relax.",
        "Confirm from authoritative sources (vendor, NCSC/CISA) rather than guessing.",
      ],
      analogy: {
        plain: "If two safety notices seem to contradict each other, you do not pick one at random, you read both carefully, check with the manufacturer, and stay cautious until it is clear.",
        realTerm: "reading under ambiguity",
      },
    },
  ],

  glossary: [
    { term: "advisory", definition: "A published notice about a vulnerability, giving its identifier, severity, affected products, and recommended action." },
    { term: "affected versions", definition: "The specific software versions a vulnerability applies to, used to decide whether your systems are exposed." },
    { term: "exploited in the wild", definition: "Confirmation that attackers are actively using a flaw in real attacks, a strong urgency signal beyond the severity score." },
    { term: "proof-of-concept (PoC)", definition: "Published code demonstrating a flaw can be exploited; its existence usually means real attacks will follow quickly." },
  ],

  seeHeading: "When the advisory itself caused confusion",

  cases: [
    {
      org: "PrintNightmare",
      year: "2021",
      headline: "A confusing disclosure left defenders unsure exactly what they were facing",
      whatHappened: "In mid-2021, a serious vulnerability in the Windows Print Spooler service, nicknamed PrintNightmare, became public in a genuinely messy way. There was confusion over whether it was the same as, or different from, a separately patched flaw; proof-of-concept exploit code appeared publicly; and for a period it was unclear exactly which issue had been fixed and which remained open. Defenders had to read Microsoft's and others' advisories very carefully, apply interim mitigations (such as disabling or restricting the Print Spooler where appropriate), and watch closely while the picture clarified.",
      theMissedMeasure: "Here the lesson is the skill itself: careful reading and cautious action under ambiguity. Those who read precisely, tracked which CVE was which, applied mitigations, and followed authoritative updates, weathered it far better than those who assumed a single patch had resolved everything.",
      theCost: "Real risk and real effort across countless organisations, and a widely-cited lesson in how a confusing disclosure must be met with precise reading and conservative, well-monitored interim action, not assumptions.",
      control: "patching",
      impact: ["overlapping flaws and a messy disclosure caused real confusion", "public exploit code raised the stakes fast", "careful reading and interim mitigations were what worked"],
      source: "Public record; Microsoft advisories, CISA guidance and 2021 reporting.",
      brandColor: "#5a3e8e",
      news: { headline: "PrintNightmare: the confusing Windows flaw defenders scrambled to understand", outlet: "Security reporting (2021)", date: "2021" },
    },
  ],

  lab: {
    title: "Read the advisory",
    intro: "Nothing to install and nothing leaves this page. Tap each element of a vulnerability advisory, then tap what it tells you.",
    prompts: [
      "Four questions: which flaw / does it apply to me, how severe, how urgent, what to do.",
      "Watch for urgency signals: 'exploited in the wild' and 'public exploit code' matter a lot.",
      "Reading for decision, not completeness, is the skill.",
    ],
    component: VulnReportLab,
  },

  check: {
    explain: {
      prompt: "Explain the four questions you read a vulnerability advisory to answer, why severity and urgency are not the same, and what the PrintNightmare case teaches about confusing disclosures.",
      modelAnswer: "You read an advisory to answer four questions: which flaw is this and does it affect systems I run (CVE and affected versions); how severe is it (CVSS); how urgent is it, especially whether it is being exploited in the wild or has public exploit code; and what do I do (the patch or an interim workaround). Severity and urgency differ because a slightly lower-scored flaw being actively exploited can be far more pressing than a higher-scored one nobody is using yet, so exploitation status sits alongside the score when judging urgency. PrintNightmare teaches that advisories are sometimes genuinely confusing, overlapping CVEs, uncertainty over what a patch fixes, and the professional response is to read precisely, confirm from authoritative sources like the vendor and national agencies, treat ambiguity as a reason to apply mitigations and monitor closely, and never to assume a single patch resolved everything.",
    },
    quiz: [
      {
        q: "Which of these is NOT one of the four questions to read an advisory for?",
        options: [
          "Which flaw is it, and does it affect systems I run?",
          "How severe, and how urgent (exploited?) is it?",
          "What do I do (patch or workaround)?",
          "Who discovered it and where do they live?",
        ],
        answer: 3,
        why: "The discoverer's identity is irrelevant to your decision. You read for: which/applies-to-me, severity, urgency, and action.",
      },
      {
        q: "Why can a lower-CVSS flaw sometimes be more urgent than a higher-scored one?",
        options: [
          "CVSS is meaningless",
          "Because active exploitation in the wild (or public exploit code) is a powerful urgency signal beyond the raw severity",
          "Lower scores are always worse",
          "It cannot; the score decides everything",
        ],
        answer: 1,
        why: "Severity is the flaw's badness in principle; urgency also weighs whether attackers are actually using it right now.",
      },
      {
        q: "The PrintNightmare case shows that when an advisory is confusing, you should:",
        options: [
          "Pick an interpretation at random and move on",
          "Read precisely, confirm from authoritative sources, apply mitigations, and monitor until it is clear",
          "Assume a single patch fixed everything",
          "Ignore it until it is clarified",
        ],
        answer: 1,
        why: "Ambiguity is a reason for careful reading and conservative, well-monitored interim action, not for guessing or complacency.",
      },
    ],
  },

  wrap: {
    headline: "You can now turn a dense advisory into a clear decision, and handle the confusing ones with care.",
    takeaways: [
      "Read an advisory for four things: which flaw / applies to me, severity (CVSS), urgency (exploited?), and action (patch/workaround).",
      "Severity is not urgency: active exploitation or public exploit code can make a lower-scored flaw more pressing.",
      "When a disclosure is confusing, read precisely, confirm from authoritative sources, and mitigate-and-monitor under ambiguity.",
    ],
    project: {
      name: "Decode a real advisory",
      blurb: "Find a recent vulnerability advisory (from a vendor, or a national agency like the NCSC or CISA) and extract the four answers: which flaw and affected versions, severity, exploitation status, and recommended action. Write them as four short lines. Turning a wall of text into four decisions is exactly the skill this topic builds, and it feeds your vulnerability-assessment project.",
    },
    ethicsNote: "Reading advisories is core defensive work. Use what you learn to protect and patch your own, or authorised, systems, never to target others. Prefer authoritative sources (vendors, NCSC, CISA) over unverified claims.",
  },
};

export default topic3;
