import type { TopicManifest } from "../../learn/types";
import AuditChecklistLab from "../../learn/AuditChecklistLab";

/* Week 1 - Topic 5: pull it together into a real personal security audit,
 * and look ahead to passwordless (passkeys). Case: Google 2017 (real
 * public record: after requiring physical security keys for staff, Google
 * reported zero confirmed account takeovers by phishing). */
const topic5: TopicManifest = {
  id: "w1t5",
  weekLabel: "Week 1",
  act: "Act 1 - Foundations you can touch",
  title: "Lock down your own accounts",
  role: "Turning knowledge into a finished, documented audit is exactly the deliverable employers want to see, and it is the first piece of your portfolio.",
  minutes: 18,
  promise: "Turn everything from this week into a real, finished audit of your own accounts, and see where the whole industry is heading next: passwords that cannot be phished.",

  learn: [
    {
      heading: "Put it all together: your audit plan",
      body: [
        "You now have every piece. This topic is where you finish the job on your own accounts. The plan is short and specific: know where you have already been breached, give every important account a long unique password, turn on strong MFA, and make sure you cannot lock yourself out.",
        "Do it in order of what matters most. Your email comes first, because whoever controls your email can reset the password on almost everything else. Then banking, then your main logins.",
      ],
      examples: [
        "Start by checking a breach-notification service to see where your details have already leaked.",
        "Fix email first: unique password, strong MFA, recovery set up. It is the master key to your other accounts.",
        "Then work down your list: banking, shopping, social, work.",
      ],
    },
    {
      heading: "Passkeys: the passwordless future",
      body: [
        "The whole industry is moving beyond passwords. A passkey replaces the password with a secret that lives on your device and never leaves it. You sign in with your fingerprint, face or device PIN, and there is no password to reuse, leak, or type into a fake site.",
        "That last part is the big win: because the passkey only works with the genuine site, it cannot be handed to a phishing page. Passkeys are being rolled out across major services now, and they combine the two things you have learned to value: unique per site, and phishing-resistant.",
      ],
      examples: [
        "There is no shared password to steal in a breach, because the secret never leaves your device.",
        "A phishing site cannot use your passkey, because it only responds to the real site.",
        "You approve a sign-in with your fingerprint or face, so there is nothing to remember or type.",
      ],
      analogy: {
        plain: "A password is a secret you both share, so it can be copied. A passkey is more like a wax seal only your own ring can make: the site can recognise it, but nobody can forge it or trick you into pressing it onto a fake letter.",
        realTerm: "passkeys (FIDO2)",
      },
    },
    {
      heading: "The mindset: assume breach, shrink the blast radius",
      body: [
        "You cannot stop every website you use from being breached one day. The professional mindset is not to pretend otherwise, but to make sure that when one does fall, the damage stops there.",
        "Unique passwords mean a leak of one site unlocks only that site. MFA means a stolen password is not enough. Passkeys remove the shared secret entirely. Each of these shrinks the blast radius, so one bad day for a website is not a bad day for your whole life.",
      ],
      examples: [
        "Unique-per-site: one breach cannot cascade into your other accounts.",
        "MFA: even a correct stolen password is stopped at the door.",
        "Recovery set up: strong security never locks you out of your own account.",
      ],
    },
  ],

  glossary: [
    { term: "passkey", definition: "A passwordless login that keeps a secret on your device and signs in with your fingerprint, face or PIN. Nothing is typed, shared, or reusable." },
    { term: "FIDO2", definition: "The open standard behind passkeys and hardware security keys, designed so your sign-in proof only works with the genuine site." },
    { term: "phishing-resistant", definition: "A login method that will not give its proof to a fake look-alike site, so it defeats phishing outright. Passkeys and hardware keys are phishing-resistant." },
    { term: "blast radius", definition: "How far the damage spreads when something is breached. Unique passwords, MFA and passkeys all shrink it, so one leak cannot cascade." },
    { term: "MFA", definition: "Multi-factor authentication: a second, different kind of proof at login, so a stolen password alone is not enough." },
  ],

  seeHeading: "What 'get it right' looks like",

  cases: [
    {
      org: "Google",
      year: "2017",
      headline: "Physical keys took employee phishing to zero",
      whatHappened: "Rather than a breach, this is what strong authentication done right looks like. Google required its tens of thousands of employees to use physical security keys as their second factor instead of codes or passwords alone. Afterwards, Google reported that it had not had a single confirmed account takeover by phishing among its staff.",
      theMissedMeasure: "Nothing was missed here; this is the positive case. The key was choosing phishing-resistant MFA (hardware keys) over weaker methods.",
      theCost: "The cost was avoided. It is the clearest real-world evidence that phishing-resistant factors (the same technology behind passkeys) simply shut down the most common attack.",
      control: "access-control",
      source: "Public record; Google's 2018 statements on staff security-key rollout.",
      brandColor: "#4285f4",
      news: { headline: "Google: Security Keys Neutralized Employee Phishing", outlet: "Krebs on Security", date: "July 2018", url: "https://krebsonsecurity.com/2018/07/google-security-keys-neutralized-employee-phishing/" },
    },
  ],

  lab: {
    title: "Your Personal Security Audit",
    intro: "This is the real thing: a checklist of actions on your own accounts. Tick each as you do it. It saves as you go, so you can come back and finish.",
    prompts: [
      "Work top to bottom. Each item has a short why, and a link where it helps.",
      "Do email first, then banking, then the rest of your five key accounts.",
      "You do not have to finish it all right now, but start, and tick what you complete.",
    ],
    component: AuditChecklistLab,
  },

  check: {
    explain: {
      prompt: "Explain, in your own words, why a passkey cannot be phished the way a password can. Write a sentence or two, then reveal a model answer.",
      modelAnswer: "A password is a shared secret: you type it in, so a convincing fake site can simply capture what you type and reuse it on the real site. A passkey keeps its secret on your device and only ever responds to the genuine site it was set up with, so a look-alike phishing page gets nothing it can use. There is no shared password to steal in a breach and nothing to hand over to a fake site, which is why passkeys and hardware keys defeat phishing where passwords cannot.",
    },
    quiz: [
      {
        q: "Which account should you secure first, and why?",
        options: [
          "Social media, because it is public",
          "Email, because it can reset the passwords on everything else",
          "A shopping site, because it has your card",
          "It does not matter which order",
        ],
        answer: 1,
        why: "Email is the master key: control it and you can reset almost every other account. Secure it first with a unique password and strong MFA.",
      },
      {
        q: "What is the main advantage of a passkey over a password?",
        options: [
          "It is shorter to type",
          "There is no shared secret to steal, and it cannot be given to a fake site",
          "It never expires",
          "It works without any device",
        ],
        answer: 1,
        why: "A passkey keeps its secret on your device and only works with the real site, so there is nothing to leak in a breach and nothing to phish.",
      },
      {
        q: "What does 'shrinking the blast radius' mean in practice?",
        options: [
          "Using antivirus software",
          "Making sure one breached site cannot unlock your other accounts",
          "Deleting old accounts",
          "Turning off your computer at night",
        ],
        answer: 1,
        why: "Unique passwords, MFA and passkeys all ensure that when one site is breached, the damage stops there instead of cascading across your accounts.",
      },
    ],
  },

  wrap: {
    headline: "You finished the week, and you have a real, documented audit to show for it.",
    takeaways: [
      "A finished audit: breach-checked, unique passwords, strong MFA, recovery set up.",
      "Passkeys are the phishing-resistant, passwordless direction the whole industry is taking.",
      "The professional mindset is assume-breach: make sure one leak can never cascade.",
    ],
    project: {
      name: "Personal Security Audit (your first portfolio piece)",
      blurb: "Write up your before-and-after: what you found (reused passwords, no MFA, old breaches) and what you changed (a password manager, unique passwords, MFA on your key accounts). Keep it. It is the first evidence in your portfolio that you can assess and improve real security, exactly what employers want to see.",
    },
    ethicsNote: "This audit is on your own accounts only. The same techniques used against systems you do not own or are not authorised to test are offences under the Computer Misuse Act 1990. That line holds for everything you learn in this course.",
  },
};

export default topic5;
