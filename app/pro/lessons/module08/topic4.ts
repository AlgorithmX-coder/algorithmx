import type { TopicManifest } from "../../learn/types";
import { PayloadLab } from "../../learn/conceptLabs";

/* Module 8 - Topic 4: what malware does once it is inside. Case: the
 * Zeus banking trojan (a long-running credential-stealing malware and
 * botnet that drained large sums from online bank accounts; linked
 * prosecutions followed). Public record: FBI/DoJ statements and
 * security-industry analysis. */
const topic4: TopicManifest = {
  id: "m8t4",
  weekLabel: "Module 8",
  act: "Act 2 - How attacks happen",
  title: "What malware does inside",
  role: "Understanding an attacker's goals, what malware actually does once it has a foothold, lets an analyst read behaviour and judge severity. 'There's malware on this machine' means little; 'this is a credential-stealer phoning out' means everything.",
  minutes: 16,
  promise: "Learn what malware actually does once it is in, then meet the trojan that quietly drained bank accounts around the world.",
  brief: "In this lesson, we'll look at the payload: what malware actually does once it has got in. The goals are few and recognisable, steal, extort, control, spy, destroy, and reading them from behaviour is how analysts judge how serious an infection is. Then we'll study Zeus, a banking trojan that specialised in one quiet, lucrative job: stealing the credentials that let criminals empty bank accounts.",

  learn: [
    {
      heading: "The payload: the attacker's real goal",
      body: [
        "Getting in is only the means; the payload is the end. Once malware has a foothold, it does the job it was sent to do, and those jobs fall into a few recognisable categories. It might steal (harvest passwords, data, or money), extort (encrypt for ransom), take control (open a backdoor, or enlist the machine into a botnet), spy (quietly watch and record), or destroy (wipe or sabotage systems).",
        "Reading the payload from behaviour is a core analyst skill. A machine suddenly encrypting files screams ransomware; one quietly sending data to an unknown server at 3am suggests theft or espionage; one taking commands from outside is under remote control. The behaviour reveals the goal, and the goal sets how urgently and in what way you respond.",
      ],
      examples: [
        "Steal: keylogging, grabbing passwords, exfiltrating files or draining accounts.",
        "Control: a backdoor for remote access, or conscription into a botnet.",
        "Destroy: a wiper that sabotages systems with no ransom, pure disruption.",
      ],
      analogy: {
        plain: "A burglar inside your house might be after cash, might be planting a listening device, might be there to trash the place. What they do inside, not how they got in, tells you what you are really dealing with.",
        realTerm: "payload",
      },
    },
    {
      heading: "Persistence and stealth: staying and hiding",
      body: [
        "Most malware wants to stay, and to stay unseen. Persistence means setting up a way to survive reboots and keep running, so the attacker does not lose their foothold. Stealth means avoiding detection: hiding processes, disguising network traffic, even disabling security tools. Rootkits are the extreme of this, burrowing deep to become very hard to find or remove.",
        "This matters for defence because it reframes the goal. You are not just trying to block malware at the door; you are trying to detect it if it gets in and limit how long it can operate unnoticed. The time between infection and detection, often called dwell time, is where the real damage is done. Shrinking it, through monitoring and good detection, is as important as prevention.",
      ],
      examples: [
        "Persistence: surviving reboots so the foothold is not lost.",
        "Stealth: hiding processes, disguising traffic, disabling defences.",
        "Dwell time: the longer malware operates unnoticed, the worse the damage.",
      ],
    },
    {
      heading: "Reading behaviour, not just names",
      body: [
        "A crucial professional shift is to focus on what malware does, its behaviour, rather than only what it is called. Attackers constantly tweak their malware to dodge signature-based detection (which looks for known specific files), so a brand-new variant may slip past a scanner. But its behaviour, encrypting files, phoning an unknown server, harvesting passwords, is much harder to disguise.",
        "This is why modern defence increasingly watches behaviour: unusual processes, suspicious network connections, mass file changes. It is also why the payload categories you just learned are so useful, they are a vocabulary for behaviour that holds even when the specific malware is unknown. The Zeus case shows a payload with one clear, quiet behaviour, stealing the keys to bank accounts, which is exactly what made it so profitable for so long.",
      ],
      examples: [
        "Signature detection catches known files; new variants can slip past it.",
        "Behaviour is harder to disguise: encrypting, phoning home, harvesting passwords.",
        "Watching behaviour catches threats even when the specific malware is unknown.",
      ],
      analogy: {
        plain: "A disguise can change a thief's face, but not what they do: picking locks, pocketing jewellery. Watching behaviour catches the thief the new disguise would fool a photo-matcher into missing.",
        realTerm: "behaviour-based detection",
      },
    },
  ],

  glossary: [
    { term: "payload", definition: "What malware actually does once it has a foothold: its real goal, such as stealing, extorting, controlling, spying or destroying." },
    { term: "persistence", definition: "Techniques malware uses to survive reboots and keep running, so the attacker does not lose their foothold." },
    { term: "dwell time", definition: "How long malware (or an attacker) operates undetected inside a system; the longer it is, the greater the damage." },
    { term: "command and control (C2)", definition: "The channel a compromised machine uses to receive instructions and send out stolen data." },
  ],

  seeHeading: "The quiet trojan that drained bank accounts",

  cases: [
    {
      org: "Zeus banking trojan",
      year: "2007-2014",
      headline: "A stealthy credential-stealer quietly emptied bank accounts around the world",
      whatHappened: "Zeus (and its many variants) was a banking trojan with one specialised, quiet payload: stealing the credentials people use for online banking, typically by logging keystrokes and capturing login details, then sending them to the criminals. With those credentials, attackers drained accounts. Zeus infected huge numbers of machines, formed botnets, and operated for years. It favoured stealth and persistence over noise, the better to keep stealing, and caused very large financial losses before coordinated law-enforcement and industry action disrupted it.",
      theMissedMeasure: "Zeus thrived on stolen credentials, which is why defences like multi-factor authentication (so a stolen password alone is not enough), behaviour-based detection (to catch the quiet data theft), and keeping systems clean and patched all blunt this kind of payload. Its stealth also underlines the value of shrinking dwell time through monitoring.",
      theCost: "Hundreds of millions of dollars in losses are attributed to Zeus and its descendants over its lifetime, a demonstration that a quiet, well-targeted payload, stealing the right credentials, can be as devastating as any noisy attack.",
      control: "access-control",
      impact: ["specialised in stealing online-banking credentials", "stealthy and persistent, to keep stealing for years", "very large financial losses before it was disrupted"],
      source: "Public record; FBI/DoJ statements and security-industry analysis.",
      brandColor: "#34495e",
      news: { headline: "Zeus: the banking trojan behind huge online-banking fraud", outlet: "Security reporting (2010s)", date: "2007-2014" },
    },
  ],

  lab: {
    title: "Read the goal",
    intro: "Nothing to install and nothing leaves this page. Sort each malware behaviour by the attacker's goal behind it.",
    prompts: [
      "Ask: is this about stealing, extorting, controlling, or destroying?",
      "The behaviour reveals the goal, and the goal sets your response.",
      "This is exactly how an analyst judges how serious an infection is.",
    ],
    component: PayloadLab,
  },

  check: {
    explain: {
      prompt: "Zeus was stealthy and quiet, not noisy like ransomware, yet it caused enormous losses. Explain what its payload was, why reading behaviour matters more than the malware's name, and one defence that blunts this kind of threat.",
      modelAnswer: "Zeus's payload was theft, specifically stealing online-banking credentials by logging keystrokes and capturing logins, then sending them out so criminals could drain accounts. It favoured stealth and persistence precisely so it could keep stealing for as long as possible, which made its long dwell time the source of its huge losses. Reading behaviour matters more than the name because attackers constantly tweak malware to dodge signature detection, but the behaviour, quietly harvesting passwords and phoning home, is far harder to disguise, so watching for it catches even unknown variants. A strong defence is multi-factor authentication, which means a stolen password alone is not enough to get into an account, blunting the value of exactly what Zeus steals; behaviour-based monitoring to shrink dwell time helps too.",
    },
    quiz: [
      {
        q: "What does 'payload' mean in the context of malware?",
        options: [
          "How the malware got in",
          "What the malware actually does once it has a foothold: its real goal",
          "The size of the malware file",
          "The company that made the antivirus",
        ],
        answer: 1,
        why: "The payload is the end, not the means: stealing, extorting, controlling, spying or destroying. The behaviour reveals it.",
      },
      {
        q: "Why do defenders increasingly watch behaviour rather than only known signatures?",
        options: [
          "Signatures are illegal",
          "Attackers tweak malware to dodge signature detection, but behaviour (encrypting, phoning home, stealing passwords) is much harder to disguise",
          "Behaviour is easier to fake than files",
          "Signatures catch everything already",
        ],
        answer: 1,
        why: "A new variant can slip past a file-matching scanner, but its malicious behaviour still stands out, so watching behaviour catches unknown threats.",
      },
      {
        q: "Zeus shows that a quiet, stealthy payload can be devastating because:",
        options: [
          "It is louder than ransomware",
          "Long dwell time lets it keep stealing (here, banking credentials) unnoticed, causing huge cumulative losses",
          "Quiet malware is always harmless",
          "It destroys systems immediately",
        ],
        answer: 1,
        why: "Stealth and persistence maximise dwell time, and the longer a stealer operates unseen, the more it takes. Shrinking dwell time is key.",
      },
    ],
  },

  wrap: {
    headline: "You can now read what malware is for, from how it behaves, which is how analysts judge severity.",
    takeaways: [
      "The payload is the goal: steal, extort, control, spy, or destroy, and the behaviour reveals which.",
      "Malware seeks persistence (to stay) and stealth (to hide); long dwell time is where the damage is done.",
      "Watch behaviour, not just names: it catches new variants and gives a vocabulary that holds even for unknown malware.",
    ],
    project: {
      name: "From behaviour to goal",
      blurb: "Write down three malware behaviours (for example 'encrypts files and shows a note', 'sends data to an unknown server nightly', 'disables the antivirus and opens a remote connection') and, for each, name the likely goal and how urgently you would respond. Practising the behaviour-to-goal read is the core of triage, which you will do for real in the SIEM module.",
    },
    ethicsNote: "Understanding malware payloads is to detect and stop them. Writing or deploying anything with these behaviours against systems you are not authorised to test is a serious crime; this knowledge is strictly defensive.",
  },
};

export default topic4;
