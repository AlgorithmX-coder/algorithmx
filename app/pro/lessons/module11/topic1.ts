import type { TopicManifest } from "../../learn/types";
import { VulnTermLab } from "../../learn/conceptLabs";

/* Module 11 - Topic 1: what a vulnerability really is (CVE and CVSS).
 * Case: Heartbleed (CVE-2014-0160), a 2014 flaw in the widely used
 * OpenSSL library that let attackers read chunks of server memory,
 * potentially including keys and passwords. Public record: the 2014
 * Heartbleed disclosure and reporting. */
const topic1: TopicManifest = {
  id: "m11t1",
  weekLabel: "Module 11",
  act: "Act 2 - How attacks happen",
  title: "What a vulnerability really is",
  role: "Vulnerability management is a huge part of real security work, and it starts with precise language. Knowing exactly what a vulnerability, an exploit, a CVE and a CVSS score each mean lets you talk about risk the way the whole industry does.",
  minutes: 16,
  promise: "Pin down what a vulnerability actually is and how the world names and scores them, then meet the bug that could bleed secrets from half the internet's servers.",
  brief: "In this lesson, we'll get precise about vulnerabilities. We'll separate the weakness (the vulnerability) from the thing that abuses it (the exploit), and learn the two systems the whole world uses to name flaws (CVE) and score their severity (CVSS). Then we'll study Heartbleed, a single flaw in a tiny piece of software that quietly underpinned a huge share of the internet's security.",

  learn: [
    {
      heading: "Vulnerability vs exploit: the flaw and the key",
      body: [
        "A vulnerability is a weakness, a flaw in software or a system that could be abused to do something it should not. It exists whether or not anyone has noticed it or built a way to use it. An exploit is the thing that actually takes advantage of a vulnerability: the specific code or technique that turns the weakness into a real attack.",
        "The distinction matters for how you reason about risk. A vulnerability with no known exploit is a weakness waiting to happen; once an exploit exists, especially a public one, the danger becomes immediate. And a special, feared case is the zero-day: a vulnerability that attackers know and are using before the vendor has a fix, so defenders are caught with zero days to prepare.",
      ],
      examples: [
        "Vulnerability: an unlocked window (the weakness).",
        "Exploit: the burglar's method for climbing through it (using the weakness).",
        "Zero-day: a weakness attackers use before any fix exists, so you have zero days' warning.",
      ],
      analogy: {
        plain: "A vulnerability is a flaw in a lock's design; an exploit is the specially-cut key that opens it. The flaw is a worry; the key makes it an emergency.",
        realTerm: "vulnerability vs exploit",
      },
    },
    {
      heading: "CVE: giving every flaw a name",
      body: [
        "With countless vulnerabilities discovered every year, the world needs a way to refer to the exact same one without confusion. That is the CVE system: Common Vulnerabilities and Exposures. Each significant publicly known flaw gets a unique identifier, like CVE-2014-0160, so that a vendor's advisory, a news article, a security tool and an analyst are all unambiguously talking about the same thing.",
        "This shared naming is quietly essential. When you can say 'are we affected by CVE-2014-0160?', everyone knows precisely which flaw you mean, can look it up, and can check whether their systems are vulnerable. CVE is the industry's common reference, and you will see these identifiers constantly in advisories, tools and reports.",
      ],
      examples: [
        "CVE-2014-0160 is Heartbleed; the identifier is unambiguous worldwide.",
        "Advisories, scanners and news all reference the same CVE, so nothing is lost in translation.",
        "'Are we exposed to CVE-XXXX-YYYY?' is a precise, answerable question.",
      ],
    },
    {
      heading: "CVSS: scoring how bad it is",
      body: [
        "Knowing a flaw exists is not enough; you need a sense of how serious it is, so you can decide what to do first. That is what CVSS provides: the Common Vulnerability Scoring System gives each vulnerability a severity score from 0 to 10, with bands like low, medium, high and critical. A 9.8 'critical' demands urgent attention; a 3.1 'low' can usually wait.",
        "CVSS is invaluable but not the whole story, a nuance you will build on in this module. The base score measures severity in principle, but real priority also depends on whether the flaw is actually being exploited and how exposed your affected systems are. For now, hold CVSS as your first, standardised read on 'how bad', and remember that severity and priority are related but not identical.",
      ],
      examples: [
        "CVSS 9.8 'critical': drop what you are doing and assess it.",
        "CVSS 3.1 'low': real, but usually not urgent.",
        "Severity (CVSS) is the first read; real priority also weighs exploitation and exposure.",
      ],
      analogy: {
        plain: "CVSS is like a hazard rating on a warning label: it tells you how dangerous something is in principle. How urgently you act also depends on whether it is right in front of you.",
        realTerm: "CVSS severity score",
      },
    },
  ],

  glossary: [
    { term: "vulnerability", definition: "A weakness in software or a system that could be abused; it exists whether or not anyone has built a way to use it." },
    { term: "exploit", definition: "The specific code or technique that actually takes advantage of a vulnerability, turning the weakness into a real attack." },
    { term: "zero-day", definition: "A vulnerability attackers know and use before the vendor has released a fix, leaving defenders zero days to prepare." },
    { term: "CVE", definition: "Common Vulnerabilities and Exposures: a unique public identifier for a specific known flaw, like CVE-2014-0160." },
    { term: "CVSS", definition: "Common Vulnerability Scoring System: a 0-10 severity score (low to critical) for a vulnerability." },
  ],

  seeHeading: "The flaw that could bleed a server's secrets",

  cases: [
    {
      org: "Heartbleed (OpenSSL)",
      year: "2014",
      headline: "One bug in a tiny, ubiquitous library exposed the secrets of a huge share of the internet",
      whatHappened: "Heartbleed (CVE-2014-0160), disclosed in 2014, was a flaw in OpenSSL, a small, free software library used by an enormous number of web servers to provide encryption. The bug let an attacker trick a vulnerable server into returning chunks of its own memory, which could contain anything recently handled, including usernames, passwords, and even the server's secret encryption keys. It left no trace, and it affected a very large portion of the secure internet at once, all through one coding mistake in a widely trusted component.",
      theMissedMeasure: "Heartbleed could not be 'prevented' by users, it was a flaw in trusted software, which is exactly the point: the response was rapid patching everywhere, plus replacing potentially exposed keys and passwords. It showed how a single vulnerability in a shared component becomes everyone's problem, and why fast, coordinated patching is the defence.",
      theCost: "A frantic global scramble to patch servers and rotate keys and credentials, and deep unease about how much of the internet's security rested on one small, under-resourced library. A landmark demonstration of systemic vulnerability.",
      control: "patching",
      impact: ["a flaw in OpenSSL, used by a huge share of web servers", "could leak passwords and secret keys from server memory", "triggered a global patch-and-rotate scramble"],
      source: "Public record; the 2014 Heartbleed (CVE-2014-0160) disclosure and reporting.",
      brandColor: "#bb0000",
      news: { headline: "Heartbleed bug: what you need to know about the OpenSSL flaw", outlet: "BBC News", date: "April 2014" },
    },
  ],

  lab: {
    title: "Match the vocabulary",
    intro: "Nothing to install and nothing leaves this page. Tap each description, then tap the vulnerability-management term it defines.",
    prompts: [
      "Vulnerability (the weakness), exploit (the thing that uses it), CVE (the name), CVSS (the score).",
      "Remember: the weakness exists even before an exploit is built.",
      "This precise vocabulary is how the whole industry talks about risk.",
    ],
    component: VulnTermLab,
  },

  check: {
    explain: {
      prompt: "Using Heartbleed, explain the difference between a vulnerability and an exploit, and what the CVE and CVSS systems each add.",
      modelAnswer: "The vulnerability was Heartbleed itself, the flaw in OpenSSL that let a server be tricked into returning chunks of its own memory. An exploit is the specific technique that actually abuses that flaw to pull out passwords or keys; the weakness was dangerous precisely because it was easy to exploit. The CVE system gave it a unique public identifier, CVE-2014-0160, so advisories, tools, news and analysts could all refer unambiguously to the same flaw and ask 'are we affected?'. CVSS would give it a severity score on the 0-10 scale, a standardised first read on how bad it is. Together, CVE names the flaw and CVSS rates it, so the whole industry can coordinate a response, which for Heartbleed meant patching everywhere and rotating potentially exposed keys and passwords.",
    },
    quiz: [
      {
        q: "What is the difference between a vulnerability and an exploit?",
        options: [
          "They are the same thing",
          "A vulnerability is the weakness; an exploit is the code or technique that actually takes advantage of it",
          "An exploit is a weakness; a vulnerability is the attack",
          "A vulnerability only exists after an attack",
        ],
        answer: 1,
        why: "The flaw (vulnerability) exists on its own; the exploit is what turns it into a real attack. A public exploit makes a flaw urgent.",
      },
      {
        q: "What does a CVE identifier like CVE-2014-0160 provide?",
        options: [
          "A severity score from 0 to 10",
          "A unique public name for a specific known flaw, so everyone refers to the same thing",
          "A patch for the flaw",
          "The attacker's identity",
        ],
        answer: 1,
        why: "CVE is the naming system. CVSS is the separate scoring system; the two work together.",
      },
      {
        q: "A 'zero-day' vulnerability is dangerous because:",
        options: [
          "It scores zero on CVSS",
          "Attackers know and use it before the vendor has a fix, so defenders have zero days to prepare",
          "It only lasts one day",
          "It cannot actually be exploited",
        ],
        answer: 1,
        why: "No patch exists yet, so defenders are caught out. It is the feared case where the exploit precedes the fix.",
      },
    ],
  },

  wrap: {
    headline: "You now speak the language of vulnerabilities, and understand how one flaw in shared software becomes everyone's problem.",
    takeaways: [
      "A vulnerability is the weakness; an exploit is what abuses it; a zero-day is a flaw used before any fix exists.",
      "CVE gives each known flaw a unique public name, so the whole industry refers to the same thing.",
      "CVSS scores severity 0-10, a standardised first read, though real priority also weighs exploitation and exposure.",
    ],
    project: {
      name: "Look up a real CVE",
      blurb: "Search for a CVE you have heard of (try CVE-2014-0160 for Heartbleed, or a recent one in the news). Note its CVSS score, the affected software, and whether a patch exists. Getting comfortable reading a CVE entry is a genuinely useful, everyday analyst skill, and it is the start of this module's vulnerability-assessment project.",
    },
    ethicsNote: "Researching vulnerabilities and reading CVEs is normal defensive work. Writing or using exploits against systems you are not authorised to test is a Computer Misuse Act offence (Module 5); this knowledge is for defending and patching.",
  },
};

export default topic1;
