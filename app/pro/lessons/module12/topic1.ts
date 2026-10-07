import type { TopicManifest } from "../../learn/types";
import { CyberEssentialsLab } from "../../learn/conceptLabs";

/* Module 12 - Topic 1: the Cyber Essentials five controls. Case: the UK
 * Cyber Essentials scheme (NCSC-backed), whose five basic controls are
 * credited with stopping the large majority of common internet attacks.
 * Public record: the NCSC / Cyber Essentials scheme. */
const topic1: TopicManifest = {
  id: "m12t1",
  weekLabel: "Module 12",
  act: "Act 3 - Defence for real",
  title: "The Cyber Essentials five controls",
  role: "Act 3 turns to defending for real, and it starts with the basics that stop most attacks. The Cyber Essentials five controls are the UK's practical baseline, referenced in contracts and standards, and knowing them cold is foundational for any defensive role.",
  minutes: 15,
  promise: "Learn the five basic controls that block the majority of common attacks, and why the unglamorous basics are the best investment in security there is.",
  brief: "In this lesson, we'll start Act 3 with the foundation of real-world defence: the Cyber Essentials five controls. This UK scheme distils security into five practical areas that, done well, stop the large majority of common internet attacks. We'll learn each one and, crucially, why getting the basics right beats chasing advanced threats, because attackers overwhelmingly exploit the basics being wrong.",

  learn: [
    {
      heading: "Five controls that stop most attacks",
      visual: { id: "defence-layers" },
      body: [
        "The UK's Cyber Essentials scheme boils security down to five practical controls: firewalls (control the traffic in and out), secure configuration (remove defaults and unnecessary features), access control (give people only the access they need), security update management (patch promptly), and malware protection (defend against malicious software). These are not advanced, and that is the point.",
        "The striking claim behind the scheme, borne out by real-world data, is that getting these five basics right blocks the large majority of common internet attacks. Most attacks are opportunistic (recall Module 6's cybercrime economy), exploiting the basics being wrong: an unpatched system, a default password, an over-privileged account. Fix the basics, and you are no longer the easy target.",
      ],
      examples: [
        "Firewalls, secure configuration, access control, update management, malware protection.",
        "None are advanced, which is exactly why they are achievable for everyone.",
        "Done well, they stop the large majority of common internet attacks.",
      ],
      analogy: {
        plain: "Locking your doors and windows, not leaving a key under the mat, and keeping the locks in good repair prevents most burglaries. The basics are basic because they work.",
        realTerm: "Cyber Essentials",
      },
    },
    {
      heading: "Why the basics beat chasing advanced threats",
      body: [
        "It is tempting to focus on sophisticated attackers and exotic threats, but that is usually the wrong priority. The vast majority of real incidents come from the basics being wrong, not from genius nation-state exploits. An organisation that patches promptly, uses MFA, removes defaults and limits privilege has already defeated most of what will actually come at it.",
        "This is genuinely good news, and it shapes how a smart defender spends limited time and money. You get far more risk reduction from doing the five basics thoroughly than from an expensive tool bolted onto weak foundations. 'Are the basics actually in place, everywhere?' is a more valuable question than 'what is the latest threat?', and it is the question Act 3 keeps returning to.",
      ],
      examples: [
        "Most incidents exploit basics being wrong, not exotic zero-days.",
        "Thorough basics beat an expensive tool on weak foundations.",
        "Ask 'are the basics in place everywhere?' before chasing the latest threat.",
      ],
    },
    {
      heading: "A baseline you can be measured against",
      body: [
        "Cyber Essentials is also a certification: organisations can be assessed against the five controls and certified, which matters commercially. Many contracts, especially UK government ones, require it, so the scheme has real teeth beyond good advice. For you, it means these five controls are not just theory, they are a concrete, recognised standard you will be expected to understand and help implement.",
        "There is also Cyber Essentials Plus, which adds hands-on technical verification rather than self-assessment. The detail matters less right now than the shape: a clear, practical baseline that an organisation can demonstrably meet. Throughout Act 3, as you learn hardening, detection and response, keep these five controls as the foundation everything else is built upon.",
      ],
      examples: [
        "It is a certification, often required in contracts (notably UK government).",
        "Cyber Essentials Plus adds hands-on technical verification.",
        "It gives a concrete, recognised baseline, not just advice.",
      ],
      analogy: {
        plain: "Like a food-hygiene rating, it turns 'we take safety seriously' into a verified standard others can trust and require.",
        realTerm: "Cyber Essentials certification",
      },
    },
  ],

  glossary: [
    { term: "Cyber Essentials", definition: "A UK scheme defining five basic security controls that, done well, block the majority of common internet attacks." },
    { term: "the five controls", definition: "Firewalls, secure configuration, access control, security update management, and malware protection." },
    { term: "secure configuration", definition: "Setting systems up safely: removing default passwords, disabling unnecessary features, shrinking the attack surface." },
    { term: "Cyber Essentials Plus", definition: "The enhanced tier adding hands-on technical verification rather than relying on self-assessment." },
  ],

  seeHeading: "The baseline that blocks most attacks",

  cases: [
    {
      org: "Cyber Essentials (NCSC)",
      year: "2014",
      headline: "A deliberately basic scheme that stops the majority of common attacks",
      whatHappened: "The UK's Cyber Essentials scheme, backed by the National Cyber Security Centre, was created to give organisations a clear, achievable security baseline. Its premise is that most cyber-attacks are not sophisticated: they are opportunistic, exploiting basic weaknesses like unpatched software, default passwords, and excessive access. By defining five straightforward controls and certifying organisations against them, the scheme targets exactly those common weaknesses, and it is widely credited with preventing the large majority of the everyday attacks organisations face.",
      theMissedMeasure: "The scheme IS the measure: it packages the basics that so many breaches (across this whole course) came down to. Nearly every case you have studied, from reused passwords to unpatched flaws to over-broad access, maps onto one of the five controls being absent.",
      theCost: "Here the value is prevention: organisations that properly implement the five controls remove themselves from the easy-target pool that opportunistic attackers rely on, at modest cost. It is a model of security done proportionately.",
      control: "secure-configuration",
      impact: ["five basic controls, backed by the NCSC", "targets the common weaknesses most attacks exploit", "often required in UK contracts; a recognised baseline"],
      source: "Public record; the NCSC / Cyber Essentials scheme.",
      brandColor: "#0b0c0c",
      news: { headline: "Cyber Essentials: the basic controls that stop most attacks", outlet: "NCSC / UK government", date: "2014 onwards" },
    },
  ],

  lab: {
    title: "Sort the five controls",
    intro: "Nothing to install and nothing leaves this page. Tap each measure, then tap which of the Cyber Essentials controls it belongs to.",
    prompts: [
      "Firewalls, secure configuration, access control, update management (and malware protection).",
      "Ask what each measure is really doing: blocking traffic, removing defaults, limiting access, or patching?",
      "These five are the foundation the rest of Act 3 builds on.",
    ],
    component: CyberEssentialsLab,
  },

  check: {
    explain: {
      prompt: "Why does the Cyber Essentials scheme focus on five basic controls rather than advanced defences, and how does this connect to the breaches you have studied in this course?",
      modelAnswer: "Cyber Essentials focuses on five basic controls, firewalls, secure configuration, access control, update management and malware protection, because the large majority of real attacks are opportunistic and exploit the basics being wrong, not sophisticated zero-days. Getting the basics right thoroughly removes you from the easy-target pool that most attackers rely on, giving far more risk reduction than an expensive tool on weak foundations. This connects directly to nearly every breach in the course: reused passwords and weak authentication (access control), unpatched flaws like WannaCry and Equifax (update management), default or exposed configurations like Exactis (secure configuration), and malware delivered through basic gaps (malware protection). Each was, at heart, a failure of one of the five basics, which is exactly why a deliberately basic, verifiable baseline is such a powerful and proportionate defence.",
    },
    quiz: [
      {
        q: "What is the premise behind Cyber Essentials' focus on five basic controls?",
        options: [
          "Advanced attacks are the main threat to everyone",
          "Most attacks are opportunistic and exploit basic weaknesses, so getting the basics right stops the majority",
          "Basics do not really matter",
          "Only large companies need security",
        ],
        answer: 1,
        why: "The scheme targets the common weaknesses most attacks exploit, which is why the basics, done well, block the large majority.",
      },
      {
        q: "Which of these is one of the Cyber Essentials five controls?",
        options: [
          "A nice office layout",
          "Security update management (patching promptly)",
          "A large marketing budget",
          "Fast internet",
        ],
        answer: 1,
        why: "The five are firewalls, secure configuration, access control, update management, and malware protection.",
      },
      {
        q: "Why do the basics give more risk reduction than an expensive tool?",
        options: [
          "Expensive tools never work",
          "Because most real incidents exploit the basics being wrong; a tool on weak foundations leaves those gaps open",
          "The basics are more expensive",
          "They do not; always buy the tool first",
        ],
        answer: 1,
        why: "Thorough basics defeat most of what actually comes at you. A tool bolted onto weak foundations leaves the common gaps attackers use.",
      },
    ],
  },

  wrap: {
    headline: "You now have the foundation of real-world defence: the five basic controls that stop most attacks.",
    takeaways: [
      "Cyber Essentials' five controls, firewalls, secure configuration, access control, update management, malware protection, block most common attacks.",
      "The basics beat chasing advanced threats, because most incidents exploit the basics being wrong.",
      "It is a recognised, certifiable baseline, often required in contracts, not just good advice.",
    ],
    project: {
      name: "Score yourself on five",
      blurb: "For a device or small environment you know, rate yourself honestly on each of the five controls: red, amber or green. The red and amber items are your highest-value fixes. This simple self-assessment is exactly how an organisation starts its Cyber Essentials journey, and it feeds the hardening checklist you build later in this module.",
    },
    ethicsNote: "Hardening your own, or authorised, systems is pure defence. Assess only systems you are responsible for or permitted to assess (Module 5). Act 3 is about building strong defences, the constructive heart of the field.",
  },
};

export default topic1;
