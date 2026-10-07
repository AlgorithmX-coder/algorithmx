import type { TopicManifest } from "../../learn/types";
import { LeastPrivilegeLab } from "../../learn/conceptLabs";

/* Module 12 - Topic 3: least privilege in practice. Case: Uber, 2022
 * (an attacker who gained a foothold found broad, standing access and
 * hard-coded admin credentials, letting them reach many internal
 * systems). Public record: Uber's own statements and 2022 reporting. */
const topic3: TopicManifest = {
  id: "m12t3",
  weekLabel: "Module 12",
  act: "Act 3 - Defence for real",
  title: "Least privilege in practice",
  role: "Least privilege, giving every account only the access it genuinely needs, is one of the highest-impact controls there is, because it decides how much damage any single compromise can do. Applying it well is a defining skill of a mature security programme.",
  minutes: 16,
  promise: "Learn why limiting access is the control that caps every breach, then see what happens when a foothold finds the keys to everything.",
  brief: "In this lesson, we'll make least privilege real. You met it as a principle in Module 10; here we see it in practice: how to apply it, why it is so powerful (it limits the blast radius of any compromise), and the common ways organisations get it wrong. Then we'll see the Uber 2022 breach, where an attacker who got a foothold found broad access and hard-coded credentials that opened up much of the company.",

  learn: [
    {
      heading: "Only what you need, nothing more",
      body: [
        "Least privilege is simple to state: every user, account and system should have only the access it genuinely needs to do its job, and no more. A payroll clerk does not need access to source code; a web server does not need the keys to the entire cloud account. When access is kept minimal, the damage any single compromise can do is minimal too.",
        "This is the control that caps the blast radius, which is why it matters so much after a breach. As you saw with lateral movement, an attacker's first foothold is rarely the prize; what decides the outcome is how far that foothold can reach. Least privilege is precisely what makes a stolen account or compromised machine worth very little, because it simply cannot get to much.",
      ],
      examples: [
        "A payroll clerk should not have developer access; a web server should not hold the master cloud keys.",
        "Minimal access means a compromise can do minimal damage.",
        "It directly caps the blast radius of any breach.",
      ],
      analogy: {
        plain: "A hotel cleaner's key opens the rooms they clean, not the safe, the office and every other room. If it is lost, the damage is contained.",
        realTerm: "least privilege",
      },
    },
    {
      heading: "How it goes wrong: access creep and standing privilege",
      visual: { id: "network-spread", mode: "lateral" },
      body: [
        "In practice, least privilege erodes over time, and knowing how is half the battle. Access creep: people accumulate permissions as they change roles, but old access is rarely removed, so long-serving staff end up able to reach far more than they need. Over-provisioning: it is easier to grant broad access than to work out the minimum, so admins hand out more 'to be safe'. Standing privilege: powerful access left permanently available, even when only needed occasionally.",
        "Each of these is a gift to an attacker. A compromised long-serving account with accumulated access, or a found admin credential with standing privilege, turns a small foothold into a large breach. The defences are active, not passive: grant minimally, review access regularly, remove what is no longer needed, and prefer just-in-time access (granted only when needed) over standing privilege.",
      ],
      examples: [
        "Access creep: permissions pile up across role changes and are never removed.",
        "Over-provisioning: broad access granted 'to be safe' instead of the minimum.",
        "Standing privilege: powerful access left permanently on, ready to be abused.",
      ],
    },
    {
      heading: "Separate, protect, and review privileged access",
      body: [
        "Privileged (admin) access deserves special care, because it is the most valuable to an attacker. Good practice separates it from everyday use: administrators use a normal account for daily work and a separate, well-protected admin account only when needed, so a compromise of their routine activity does not hand over the keys. Privileged accounts get the strongest protection, MFA especially, and their use is logged and monitored.",
        "Crucially, credentials for powerful access must never be left lying around, hard-coded in code, saved in a shared document, reused across systems. A found or leaked admin credential can undo all your other controls at once. The Uber case you are about to see is a vivid example of exactly this: a foothold that found broad access and embedded credentials, turning a single compromise into a company-wide problem.",
      ],
      examples: [
        "Separate admin accounts from everyday accounts; protect admin with MFA.",
        "Never hard-code or share powerful credentials; a leaked one undoes everything.",
        "Log and monitor privileged access; prefer just-in-time over standing admin rights.",
      ],
      analogy: {
        plain: "You do not carry the master key to the whole building in your everyday pocket, or tape it under a desk. You keep it locked away and sign it out only when needed.",
        realTerm: "privileged access management",
      },
    },
  ],

  glossary: [
    { term: "least privilege", definition: "Giving every user, account and system only the access it genuinely needs, and no more." },
    { term: "access creep", definition: "The gradual accumulation of permissions as people change roles, without old access being removed." },
    { term: "standing privilege", definition: "Powerful access left permanently available even when only needed occasionally; a prime target for attackers." },
    { term: "just-in-time access", definition: "Granting elevated access only when needed and for a limited time, instead of leaving it standing." },
  ],

  seeHeading: "When a foothold found the keys to everything",

  cases: [
    {
      org: "Uber",
      year: "2022",
      headline: "An attacker who got in found broad access and embedded credentials opening much of the company",
      whatHappened: "In 2022, an attacker gained an initial foothold at Uber (reportedly after wearing down an employee with repeated multi-factor prompts, a social-engineering technique). What turned that foothold into a serious internal breach was what they found once inside: broad access and, reportedly, hard-coded administrative credentials in an internal location, which let them reach a range of important internal systems. The initial access was concerning; the extent of what it unlocked was the deeper failure.",
      theMissedMeasure: "Least privilege and protected credentials. Had the foothold's access been tightly limited, and had powerful admin credentials not been left embedded and reachable, the same initial compromise would have been far more contained. It is a textbook illustration of why limiting blast radius matters as much as keeping attackers out.",
      theCost: "A high-profile internal breach at a major company, significant incident response and reputational impact, and a widely-studied lesson that an attacker's reach once inside, governed by least privilege and credential hygiene, often determines how bad a breach becomes.",
      control: "access-control",
      impact: ["a foothold reached broad internal systems", "hard-coded admin credentials reportedly found inside", "blast radius, not just entry, determined the damage"],
      source: "Public record; Uber's own statements and 2022 reporting.",
      brandColor: "#000000",
      news: { headline: "Uber breach: how a foothold reached across internal systems", outlet: "Mainstream and security reporting (2022)", date: "2022" },
    },
  ],

  lab: {
    title: "Least privilege, or not?",
    intro: "Nothing to install and nothing leaves this page. For each practice, decide: does it follow least privilege, or violate it?",
    prompts: [
      "The rule: only the access genuinely needed, nothing more.",
      "Blanket admin, shared powerful logins and leftover access all violate it.",
      "Regular review and separate admin accounts uphold it.",
    ],
    component: LeastPrivilegeLab,
  },

  check: {
    explain: {
      prompt: "In the Uber 2022 breach, the initial foothold mattered less than what it could reach. Explain least privilege, how it caps the blast radius, and two common ways it erodes in practice.",
      modelAnswer: "Least privilege means every user, account and system has only the access it genuinely needs, and no more. It caps the blast radius because an attacker's first foothold is rarely the prize; what decides the outcome is how far that foothold can reach, and minimal access makes a stolen account or compromised machine worth very little. In the Uber breach, the foothold became serious precisely because it found broad access and reportedly hard-coded admin credentials, so it could reach much of the company; tight least privilege and protected credentials would have contained it. Two common ways least privilege erodes: access creep, where people accumulate permissions across role changes that are never removed, so long-serving accounts can reach far more than they need; and standing privilege (and over-provisioning), where powerful access is left permanently available, or granted broadly 'to be safe', rather than minimised and granted just-in-time. The defences are active: grant minimally, review regularly, separate and protect admin access, and never leave powerful credentials lying around.",
    },
    quiz: [
      {
        q: "What does least privilege most directly limit?",
        options: [
          "How fast systems run",
          "The blast radius: how much damage any single compromise can do",
          "The number of employees",
          "The cost of software",
        ],
        answer: 1,
        why: "By keeping each account's access minimal, a stolen account or compromised machine can reach very little.",
      },
      {
        q: "What is 'access creep'?",
        options: [
          "Slowly logging in",
          "People accumulating permissions over role changes without old access being removed",
          "A type of malware",
          "Access that is too restrictive",
        ],
        answer: 1,
        why: "Old access is rarely removed, so long-serving accounts end up able to reach far more than they need: a gift to an attacker.",
      },
      {
        q: "A key lesson of the Uber 2022 breach is that:",
        options: [
          "Keeping attackers out is the only thing that matters",
          "Limiting what a foothold can reach (least privilege, protected credentials) often decides how bad a breach becomes",
          "Hard-coded credentials are fine if hidden well",
          "MFA is useless",
        ],
        answer: 1,
        why: "The foothold became serious because of broad access and embedded credentials. Blast radius matters as much as entry.",
      },
    ],
  },

  wrap: {
    headline: "You can now apply the control that caps every breach: least privilege, in practice.",
    takeaways: [
      "Least privilege gives each account only what it needs, directly capping the blast radius of any compromise.",
      "It erodes through access creep, over-provisioning and standing privilege; defend with minimal grants and regular review.",
      "Protect and separate privileged access; never leave powerful credentials hard-coded, shared or reused.",
    ],
    project: {
      name: "Audit your own access",
      blurb: "List the accounts and access you personally hold (apps, systems, admin rights). Flag anything you no longer need, or powerful access you keep standing when it could be occasional. Removing even one is least privilege in action, and noticing access creep in your own life makes you spot it everywhere.",
    },
    ethicsNote: "Applying least privilege is defensive. Studying how footholds escalate is to contain them, never to perform them on systems outside your authorised scope (Module 5).",
  },
};

export default topic3;
