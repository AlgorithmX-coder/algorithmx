import type { TopicManifest } from "../../learn/types";
import { RiskLab } from "../../learn/conceptLabs";

/* Module 1 - Topic 2: threat vs vulnerability vs risk. Case: Equifax
 * 2017 (a known, unpatched Apache Struts vulnerability plus attackers
 * equalled ~147M records; the textbook risk-realised story). Public
 * record: US Congressional and regulator findings, 2017-2019. */
const topic2: TopicManifest = {
  id: "m1t2",
  weekLabel: "Module 1",
  act: "Act 1 - Foundations you can touch",
  title: "Threat, vulnerability, and risk",
  role: "As a cyber security analyst, this is how you decide what to fix first. You can't remove every threat or patch every weakness, so you manage risk, and 'risk' is the word the business actually listens to.",
  minutes: 18,
  promise: "Pin down three words people mix up, then see the breach one unpatched weakness caused.",
  brief: "In this lesson, we'll pin down three words people mix up all the time: threat, vulnerability and risk. Once you can tell them apart, you'll see the breach that happened when one known, unpatched weakness met a motivated attacker, and exposed 147 million people.",

  learn: [
    {
      heading: "Three words people mix up, and why it matters",
      body: [
        "People throw around 'threat', 'vulnerability' and 'risk' as if they mean the same thing. In security they are three different things, and keeping them straight is how you decide what to actually do.",
        "A threat is who or what could cause harm: a ransomware gang, a careless employee, a flood. A vulnerability is the weakness they could use: an unpatched server, a reused password, an unlocked door. A risk is the two meeting, weighed by how likely it is and how bad it would be.",
      ],
      examples: [
        "Threat: a criminal group that encrypts company files for ransom.",
        "Vulnerability: a server missing a security update for a known flaw.",
        "Risk: the chance that group finds and exploits that server, and what it would cost.",
      ],
      analogy: {
        plain: "A burglar in your area is a threat. A window you left unlocked is a vulnerability. The risk is the realistic chance the burglar tries that window, and how much you would lose if they did.",
        realTerm: "threat, vulnerability, risk",
      },
    },
    {
      heading: "Risk is the part the business actually cares about",
      body: [
        "You can never remove every threat (you cannot stop criminals existing) and you will never fix every vulnerability (there are always more). So security is really about managing risk: spending your limited time and money where the likelihood and the impact are highest.",
        "This is why 'risk' is the word executives understand. A security professional who can say 'this unpatched system is our biggest risk because it is internet-facing and holds customer data' will be heard. One who just lists vulnerabilities will not.",
      ],
      examples: [
        "A tiny flaw on an isolated test machine is a low risk, even if it is a real vulnerability.",
        "A medium flaw on the internet-facing server holding customer data is a high risk.",
        "Same type of weakness, very different risk, because likelihood and impact differ.",
      ],
    },
    {
      heading: "Four honest things you can do with a risk",
      body: [
        "Once you have named a risk, there are only four things you can do with it, and every framework you will meet uses these. You can reduce it (patch the server, add MFA). You can transfer it (buy cyber insurance). You can avoid it (stop doing the risky thing entirely). Or you can accept it (decide it is small enough to live with, on purpose and in writing).",
        "The mistake is doing the fifth thing: ignoring it. Accepting a risk knowingly is a legitimate business decision. Not knowing the risk exists is how companies end up in the headlines.",
      ],
      examples: [
        "Reduce: apply the patch, or put a firewall in front of the weak system.",
        "Transfer: take out insurance so someone else covers part of the loss.",
        "Accept: sign off that a low risk is not worth fixing right now.",
      ],
      analogy: {
        plain: "It is like a leaky roof. Fix it (reduce), insure the house (transfer), stop using that room (avoid), or decide the drip is harmless for now (accept). Just do not pretend you never saw it.",
        realTerm: "risk treatment",
      },
    },
  ],

  glossary: [
    { term: "threat", definition: "Who or what could cause harm: an attacker, an insider, or even a natural event like a flood." },
    { term: "vulnerability", definition: "A weakness that a threat could exploit, such as an unpatched system, a weak password, or a misconfiguration." },
    { term: "risk", definition: "The chance that a threat exploits a vulnerability, weighed by how likely it is and how much damage it would cause." },
    { term: "risk treatment", definition: "What you decide to do about a risk: reduce it, transfer it (e.g. insurance), avoid it, or knowingly accept it." },
  ],

  seeHeading: "When a known weakness met a real attacker",

  cases: [
    {
      org: "Equifax",
      year: "2017",
      headline: "One unpatched weakness, 147 million people exposed",
      whatHappened: "Equifax, a credit-reporting company holding deeply sensitive data on hundreds of millions of people, was breached in 2017. The way in was a vulnerability in a piece of web software (Apache Struts) that already had a fix available. The fix was not applied in time. Attackers (the threat) found the unpatched system (the vulnerability), and the risk became reality: they roamed for weeks and took the records of around 147 million people.",
      theMissedMeasure: "A known, published vulnerability was left unpatched on an internet-facing system holding highly sensitive data, and the internal alerting that might have caught the intrusion was not working properly.",
      theCost: "Personal and financial data on roughly 147 million people. Settlements and penalties ran to hundreds of millions of dollars, and it became the standard example of a preventable, patch-and-it-would-not-have-happened breach.",
      control: "patching",
      source: "Public record; US Congressional report and regulator settlements, 2017-2019.",
      brandColor: "#822433",
      news: { headline: "Equifax data breach: What you need to know", outlet: "BBC News", date: "September 2017", url: "https://www.bbc.co.uk/news/technology-41192163" },
    },
  ],

  lab: {
    title: "Threat, vulnerability, or risk?",
    intro: "Read each statement and label it. This is the exact distinction certificate exams test, and the one a business will pay you to make.",
    prompts: [
      "For each line, choose Threat, Vulnerability, or Risk.",
      "Every answer comes with a short why.",
      "Watch how 'risk' always combines a threat, a weakness, and an impact.",
    ],
    component: RiskLab,
  },

  check: {
    explain: {
      prompt: "In your own words, use the Equifax breach to explain the difference between a threat, a vulnerability, and a risk. Write a sentence or two, then reveal a model answer.",
      modelAnswer: "The threat was the attackers who wanted the data. The vulnerability was the unpatched Apache Struts flaw on an internet-facing system, a known weakness with a fix already available. The risk was the realistic chance those attackers would find and exploit that weakness against highly sensitive data, and the huge impact if they did. The risk was high precisely because a serious threat met an easy, exposed vulnerability guarding valuable data. Applying the patch would have reduced that risk to almost nothing.",
    },
    quiz: [
      {
        q: "'An unpatched server with a known security flaw.' This is a:",
        options: ["Threat", "Vulnerability", "Risk", "Control"],
        answer: 1,
        why: "It is a weakness an attacker could exploit, which is the definition of a vulnerability. The attacker themselves would be the threat.",
      },
      {
        q: "Why do businesses talk in terms of 'risk' rather than listing vulnerabilities?",
        options: [
          "Risk sounds more impressive",
          "Because risk weighs likelihood and impact, so it shows what to fix first",
          "Because vulnerabilities do not matter",
          "Because risk is easier to ignore",
        ],
        answer: 1,
        why: "You cannot fix everything, so you prioritise by risk: how likely, and how bad. That is what turns a list of weaknesses into a plan.",
      },
      {
        q: "Which of these is NOT one of the four ways to treat a risk?",
        options: ["Reduce it", "Transfer it", "Ignore it", "Accept it"],
        answer: 2,
        why: "The four legitimate options are reduce, transfer, avoid, or accept. Ignoring a risk you do not know about is exactly how breaches like Equifax happen.",
      },
    ],
  },

  wrap: {
    headline: "You can now tell a threat, a weakness, and a risk apart, the way the job requires.",
    takeaways: [
      "Threat = who could harm you; vulnerability = the weakness; risk = the two meeting, weighed by likelihood and impact.",
      "You manage risk, because you can never remove every threat or fix every weakness.",
      "Every risk gets reduced, transferred, avoided, or knowingly accepted. Never silently ignored.",
    ],
    project: {
      name: "Name one real risk",
      blurb: "Pick something in your own life: an online account, a home router, an old laptop. Write it as a risk in one line: the threat, the weakness, and what you would lose. Then say which of the four treatments you will use. That single sentence is how professional risk registers begin.",
    },
    ethicsNote: "Finding weaknesses is only lawful on systems you own or are authorised to test. The Computer Misuse Act 1990 makes unauthorised access a criminal offence, covered fully in Module 5.",
  },
};

export default topic2;
