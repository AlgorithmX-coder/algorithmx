import type { TopicManifest } from "../../learn/types";
import { AttackSurfaceLab } from "../../learn/conceptLabs";

/* Module 12 - Topic 2: secure baselines and removing attack surface.
 * Case: Capital One, 2019 (a misconfigured web application firewall was
 * abused via SSRF to reach cloud storage, exposing ~100M+ applicants'
 * data). Public record: US DoJ statements and 2019 reporting. */
const topic2: TopicManifest = {
  id: "m12t2",
  weekLabel: "Module 12",
  act: "Act 3 - Defence for real",
  title: "Secure baselines & attack surface",
  role: "Hardening is the practical skill of making systems boringly safe by default: removing defaults, disabling what is not needed, and shrinking what is exposed. Misconfiguration is a leading cause of breaches, so getting baselines right is core defensive work.",
  minutes: 16,
  promise: "Learn to build a secure baseline and shrink the attack surface, then see a single misconfiguration expose 100 million people.",
  brief: "In this lesson, we'll learn hardening in practice: establishing a secure baseline (a known-good, safe configuration) and systematically removing attack surface, every unnecessary feature, port, account and exposure. Misconfiguration is one of the biggest causes of breaches, and it is also one of the most preventable. Then we'll see the Capital One breach, where one misconfiguration opened the door to over 100 million records.",

  learn: [
    {
      heading: "A secure baseline: safe by default",
      body: [
        "Systems rarely arrive secure out of the box; they arrive convenient. They come with default passwords, extra features enabled, and settings chosen for ease rather than safety. A secure baseline is a defined, known-good configuration that makes a system safe by default: defaults removed, unnecessary features off, security settings on. Instead of hardening each machine from scratch, you build systems to a baseline.",
        "This matters because consistency is a defence in itself. If every system is built to the same hardened baseline, you have far fewer surprises, fewer forgotten defaults, fewer odd one-off configurations that become the weak link. Standards like the CIS Benchmarks (which you will meet in this module) provide ready-made secure baselines for common systems, so you do not have to invent them.",
      ],
      examples: [
        "Systems ship convenient, not secure: defaults on, extras enabled.",
        "A baseline is a defined safe configuration applied consistently.",
        "Consistency removes the odd one-off that becomes the weak link.",
      ],
      analogy: {
        plain: "A safety checklist every new vehicle must pass before leaving the depot, rather than each driver adjusting their own. Consistent and safe beats ad-hoc.",
        realTerm: "secure baseline",
      },
    },
    {
      heading: "Attack surface: less is safer",
      visual: { id: "ports-doors" },
      body: [
        "Every feature, service, port, account and exposed system is a potential way in, the attack surface you met in Module 6. Hardening is largely the disciplined removal of attack surface: uninstall software you do not use, disable features you do not need, close ports nothing requires, remove old accounts, and never expose anything to the internet that does not have to be.",
        "The principle is simple and powerful: the less there is, the less there is to attack. A minimal, purpose-built system is far easier to secure than a sprawling one with everything switched on 'just in case'. This is why 'reduce your attack surface' is one of the most repeated pieces of defensive advice, and why hardening, though unglamorous, is so effective.",
      ],
      examples: [
        "Every enabled feature, open port and spare account is a potential door.",
        "Remove what you do not use; expose only what must be exposed.",
        "Less to attack means less to defend: minimal is safer.",
      ],
    },
    {
      heading: "Misconfiguration: the self-inflicted breach",
      body: [
        "Misconfiguration, a security setting left wrong, is among the most common and most preventable causes of breaches. It is not a flaw in the software; it is the software set up unsafely: an exposed database (Exactis), an over-permissive cloud storage bucket, a firewall rule that is too broad. These are self-inflicted, which is frustrating but also empowering, because they are entirely within your control to prevent.",
        "This is exactly why secure baselines and attack-surface reduction matter so much: they systematically prevent misconfiguration. Rather than hoping each setting is right, you build to a known-good standard and review against it. The Capital One case you are about to see is a sobering example: not an unstoppable attack, but a single misconfiguration that a careful baseline review could have caught.",
      ],
      examples: [
        "Misconfiguration is the software set up unsafely, not a software flaw.",
        "Exposed databases, over-permissive storage, too-broad firewall rules.",
        "Baselines and reviews systematically prevent it; it is within your control.",
      ],
      analogy: {
        plain: "A strong safe is useless if you leave the door ajar. Misconfiguration is leaving the door ajar, and a checklist is what makes you check it is shut.",
        realTerm: "misconfiguration",
      },
    },
  ],

  glossary: [
    { term: "secure baseline", definition: "A defined, known-good configuration that makes a system safe by default, applied consistently across systems." },
    { term: "attack surface", definition: "Everything an attacker could target: features, services, ports, accounts and exposures. Hardening reduces it." },
    { term: "misconfiguration", definition: "A security setting left wrong, such as an exposed database or over-permissive access: a leading, preventable cause of breaches." },
    { term: "hardening", definition: "The practice of making a system safer by removing defaults, disabling unneeded features, and shrinking the attack surface." },
  ],

  seeHeading: "When one misconfiguration exposed 100 million people",

  cases: [
    {
      org: "Capital One",
      year: "2019",
      headline: "A misconfigured defence let an attacker reach over 100 million records",
      whatHappened: "In 2019, an attacker exploited a misconfigured web application firewall at Capital One to perform a server-side request forgery, tricking the system into fetching credentials that then allowed access to cloud storage holding customer data. The result was the exposure of the personal data of over 100 million credit-card applicants. The root cause was not an unknown, unstoppable exploit but a misconfiguration, a defence set up in a way that could be abused, combined with access that was broader than it needed to be.",
      theMissedMeasure: "A correct, reviewed configuration of the firewall, and tighter access to the cloud storage (least privilege, the next topic). A secure baseline and regular configuration review, exactly the hardening discipline this topic teaches, target precisely this class of self-inflicted exposure.",
      theCost: "Over 100 million applicants' personal data exposed, major regulatory penalties and remediation costs, and a landmark reminder that in modern (often cloud) environments, misconfiguration is one of the biggest risks there is.",
      control: "secure-configuration",
      impact: ["100M+ records exposed via a misconfigured firewall (SSRF)", "over-broad access compounded the misconfiguration", "a self-inflicted, preventable exposure"],
      source: "Public record; US Department of Justice statements and 2019 reporting.",
      brandColor: "#004977",
      news: { headline: "Capital One data breach: misconfiguration exposed 100 million people", outlet: "Mainstream and security reporting (2019)", date: "2019" },
    },
  ],

  lab: {
    title: "Reduce or increase the attack surface?",
    intro: "Nothing to install and nothing leaves this page. For each choice, decide: does it reduce the attack surface, or increase it?",
    prompts: [
      "The principle: the less there is, the less there is to attack.",
      "Removing unused software, closing ports, deleting old accounts all reduce it.",
      "Leaving defaults on and exposing systems 'for convenience' increase it.",
    ],
    component: AttackSurfaceLab,
  },

  check: {
    explain: {
      prompt: "Capital One was breached through a misconfiguration, not an unknown exploit. Explain what a secure baseline and attack-surface reduction are, and how they target exactly this kind of self-inflicted breach.",
      modelAnswer: "A secure baseline is a defined, known-good configuration that makes a system safe by default, defaults removed, unneeded features off, security settings on, applied consistently so there are no odd one-off configurations to become the weak link. Attack-surface reduction is the disciplined removal of everything that does not need to be there: unused software, open ports, spare accounts, and any unnecessary exposure, because the less there is, the less there is to attack. Both directly target misconfiguration, which is the software set up unsafely rather than a software flaw, and one of the most common and preventable causes of breaches. Capital One's breach was exactly this: a misconfigured firewall that could be abused, plus access broader than it needed to be. A secure baseline and regular configuration review would have aimed straight at that self-inflicted gap, and tighter access would have limited what the misconfiguration could reach.",
    },
    quiz: [
      {
        q: "What is a secure baseline?",
        options: [
          "The minimum internet speed a system needs",
          "A defined, known-good configuration that makes a system safe by default, applied consistently",
          "The cheapest possible setup",
          "A list of passwords",
        ],
        answer: 1,
        why: "Building systems to a consistent, hardened baseline removes forgotten defaults and odd one-off configurations.",
      },
      {
        q: "Why does reducing attack surface improve security?",
        options: [
          "It makes systems look nicer",
          "The less there is (features, ports, accounts, exposure), the less there is for an attacker to target",
          "It speeds up the internet",
          "It does not; more features are safer",
        ],
        answer: 1,
        why: "Every unnecessary component is a potential door. A minimal, purpose-built system is far easier to secure.",
      },
      {
        q: "The Capital One breach is a classic example of:",
        options: [
          "An unstoppable nation-state zero-day",
          "Misconfiguration, a preventable, self-inflicted exposure that a secure baseline and review would target",
          "A denial-of-service attack",
          "Physical theft of servers",
        ],
        answer: 1,
        why: "A misconfigured firewall plus over-broad access exposed 100M+ records. Misconfiguration is one of the biggest, most preventable risks.",
      },
    ],
  },

  wrap: {
    headline: "You can now harden a system by building to a secure baseline and ruthlessly shrinking its attack surface.",
    takeaways: [
      "A secure baseline makes systems safe by default and consistent, removing forgotten defaults and odd configurations.",
      "Reducing attack surface, removing unused features, ports, accounts and exposure, means less to attack and defend.",
      "Misconfiguration is a leading, preventable cause of breaches; baselines and reviews target it directly.",
    ],
    project: {
      name: "Trim one system",
      blurb: "Pick a device you control and find one thing to remove or disable: an app you never use, a feature you do not need, an old account. Note what you removed and why it shrinks the attack surface. Hardening is a habit of subtraction, and practising it on your own kit makes the principle concrete.",
    },
    ethicsNote: "Hardening and reviewing configuration applies to your own or authorised systems. Probing another organisation's configuration for misconfigurations without permission is unauthorised (Module 5). This is defensive discipline.",
  },
};

export default topic2;
