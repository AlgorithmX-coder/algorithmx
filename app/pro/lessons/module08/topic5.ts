import type { TopicManifest } from "../../learn/types";
import { MalwareHandlingLab } from "../../learn/conceptLabs";

/* Module 8 - Topic 5: a safe look at real malware behaviour. Case: the
 * No More Ransom initiative (Europol, Dutch police and security firms,
 * launched 2016), where safe analysis of ransomware yields free
 * decryptor tools that have helped many victims recover without paying.
 * Public record: the No More Ransom project and Europol announcements. */
const topic5: TopicManifest = {
  id: "m8t5",
  weekLabel: "Module 8",
  act: "Act 2 - How attacks happen",
  title: "A safe look at malware",
  role: "Malware is studied by professionals every day, but only ever safely, in isolation. Knowing how analysts observe malware behaviour without becoming victims, and how that work turns into protection for everyone, completes the picture and models the careful, constructive mindset of the field.",
  minutes: 15,
  promise: "See how professionals study malware without getting infected, then how that careful work gives victims their files back for free.",
  brief: "In this lesson, we'll close the module by looking at how malware is studied safely. Analysts never casually run suspicious files; they use isolated sandboxes and disciplined handling to watch behaviour without risk. And that careful analysis is deeply constructive: it produces the detections that protect everyone, and sometimes free tools that let ransomware victims recover without paying. We'll see that constructive side through the No More Ransom project.",

  learn: [
    {
      heading: "Never run it casually: isolation is everything",
      body: [
        "The first rule of looking at malware is the one amateurs break: never run a suspicious file on a real, connected machine. Professionals examine malware in isolation, in a sandbox or a disposable virtual machine cut off from real systems and data, and reset to clean after each test. That way they can watch exactly what the malware tries to do, what it changes, what it contacts, without it being able to spread or cause harm.",
        "There are also safe checks that do not involve running anything at all. Submitting a file's fingerprint (a hash) to a reputation service tells you whether it is already known to be malicious, with zero risk. The discipline here is simple and non-negotiable: observe safely, in isolation, or do not observe at all.",
      ],
      examples: [
        "Run suspicious files only in an isolated sandbox or disposable VM, never on a real machine.",
        "Reset the environment to clean between tests so nothing lingers.",
        "Check a file's hash against a reputation service to learn about it without running it.",
      ],
      analogy: {
        plain: "Scientists study dangerous pathogens behind sealed glass in a containment lab, never on the open bench. Malware analysis uses exactly the same principle: observe the danger, safely contained.",
        realTerm: "sandboxing",
      },
    },
    {
      heading: "Analysis becomes protection for everyone",
      body: [
        "Safe analysis is not just caution, it is how defence is built. When an analyst watches a malware sample's behaviour in a sandbox, they learn its telltale signs: the files it drops, the servers it contacts, the changes it makes. Those indicators become detections, shared through the threat-intelligence channels you met in Module 6, so that security tools everywhere can recognise and block the same threat.",
        "This is the constructive loop at the heart of the field: one analyst's careful, contained study of a threat becomes protection for countless people who will never see the malware themselves. The same work also powers behaviour-based defences, teaching tools what malicious behaviour looks like. Studying malware, done safely, is one of the most directly protective jobs in security.",
      ],
      examples: [
        "Observed behaviour becomes shareable indicators others can detect and block.",
        "One analyst's contained study protects many who never encounter the malware.",
        "The same work trains behaviour-based detection to spot new variants.",
      ],
    },
    {
      heading: "Turning malware against itself: free recovery",
      body: [
        "Sometimes safe analysis yields something wonderful: a way to undo the damage. By studying how a ransomware family encrypts files, researchers can occasionally find a flaw in its method, or recover keys, that lets them build a free decryption tool. Victims can then get their files back without paying a penny to the criminals, which both helps the victim and starves the crime of its reward.",
        "This is the most hopeful note in a hard subject. The careful, contained, patient work of analysts does not just help us block malware, it can directly reverse harm and undercut the business model of extortion. The No More Ransom project you are about to see is the shining example: a collaboration that turns malware analysis into free help for ransomware victims around the world.",
      ],
      examples: [
        "Studying a ransomware's encryption can reveal a flaw that enables free decryption.",
        "A free decryptor lets victims recover without funding the criminals.",
        "Undermining the payoff is itself a powerful, lasting defence.",
      ],
      analogy: {
        plain: "Studying a lock-maker's flawed design can yield a master key that frees everyone they trapped, and makes their locks worthless. Malware analysis sometimes does exactly that.",
        realTerm: "decryptor tools",
      },
    },
  ],

  glossary: [
    { term: "sandbox", definition: "An isolated, disposable environment where a suspicious file can be run and observed safely, with no access to real systems or data." },
    { term: "hash (file fingerprint)", definition: "A short unique value computed from a file; submitting it to a reputation service checks whether the file is known-malicious without running it." },
    { term: "indicator of compromise (IOC)", definition: "A telltale sign of malware (a file, address or behaviour), derived from analysis and shared so others can detect the same threat." },
    { term: "decryptor", definition: "A free tool, built from careful analysis of a ransomware family, that lets victims recover encrypted files without paying." },
  ],

  seeHeading: "When studying malware gives victims their files back",

  cases: [
    {
      org: "No More Ransom",
      year: "2016",
      headline: "A global collaboration turns malware analysis into free recovery for ransomware victims",
      whatHappened: "No More Ransom, launched in 2016 by European law enforcement (including Europol and Dutch police) together with security companies, is a public project that collects free ransomware decryption tools in one place. These tools come from exactly the safe, careful analysis this topic describes: researchers study how particular ransomware families encrypt data, find weaknesses or recover keys, and build decryptors. Victims can identify their ransomware and, where a tool exists, recover their files without paying the criminals.",
      theMissedMeasure: "The project is itself a defensive measure, the constructive flip side of malware analysis. It shows that the right response to ransomware is preparation and recovery (and checking for a free decryptor) rather than paying, and that careful analysis directly undercuts the crime.",
      theCost: "No More Ransom is credited with helping large numbers of victims recover their data for free, denying criminals ransom payments and demonstrating that safe, collaborative analysis of malware is a powerful force for good.",
      control: "malware-protection",
      impact: ["free ransomware decryptors from safe analysis", "helps victims recover without paying", "a law-enforcement and industry collaboration since 2016"],
      source: "Public record; the No More Ransom project and Europol announcements.",
      brandColor: "#27ae60",
      news: { headline: "No More Ransom: the project helping ransomware victims recover for free", outlet: "Europol / mainstream reporting", date: "2016 onwards" },
    },
  ],

  lab: {
    title: "Safe, or dangerous?",
    intro: "Nothing to install and nothing leaves this page. For each way of handling a suspicious file, decide: a safe professional practice, or a dangerous one?",
    prompts: [
      "Isolation and reputation checks are safe; running unknown code on real machines is not.",
      "Ask: could this action infect a real system, or spread the threat?",
      "This discipline is how professionals study malware without becoming the next victim.",
    ],
    component: MalwareHandlingLab,
  },

  check: {
    explain: {
      prompt: "Explain how professionals study malware safely, and how the No More Ransom project shows that careful malware analysis is a constructive, protective act rather than a risky one.",
      modelAnswer: "Professionals never run suspicious files on real, connected machines. They use isolation: a sandbox or disposable virtual machine cut off from real systems and data, reset to clean between tests, so they can watch exactly what the malware does without it spreading or causing harm. Safe checks like submitting a file's hash to a reputation service add information with zero risk. No More Ransom shows the constructive payoff: by safely analysing how ransomware families encrypt data, researchers build free decryptor tools that let victims recover their files without paying the criminals. So careful, contained analysis is not reckless, it is one of the most protective jobs in security, turning study of a threat into detections for everyone and, sometimes, free recovery that undercuts the crime itself.",
    },
    quiz: [
      {
        q: "What is the first rule of examining suspicious malware?",
        options: [
          "Run it on your work laptop to see what it does",
          "Never run it on a real, connected machine: use an isolated sandbox or disposable VM",
          "Email it to colleagues first",
          "Plug it into every machine to test them",
        ],
        answer: 1,
        why: "Isolation is everything. Analysts observe malware in a contained, disposable environment so it cannot spread or harm real systems.",
      },
      {
        q: "How does safely analysing malware protect people who never encounter it?",
        options: [
          "It does not help anyone else",
          "Observed behaviour becomes shareable indicators and detections, so tools everywhere can block the same threat",
          "It makes the malware stronger",
          "Only by deleting the analyst's own copy",
        ],
        answer: 1,
        why: "Analysis produces the detections shared through threat intelligence, so one contained study protects many who never see the malware.",
      },
      {
        q: "What does the No More Ransom project demonstrate?",
        options: [
          "That paying the ransom is the best option",
          "That safe analysis of ransomware can produce free decryptors, letting victims recover without paying and undercutting the crime",
          "That ransomware cannot be studied",
          "That only governments can fight malware",
        ],
        answer: 1,
        why: "Careful analysis of how ransomware encrypts can yield free recovery tools, the constructive flip side of malware study, helping victims and starving the crime.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 8: you understand malware end to end, and the careful, constructive way professionals study it.",
    takeaways: [
      "Malware is examined only in isolation, in a sandbox or disposable VM, never casually on a real machine.",
      "Safe analysis produces the detections that protect everyone, through shared indicators and behaviour-based defence.",
      "That same careful work can yield free decryptors, as No More Ransom shows, reversing harm and undercutting extortion.",
    ],
    project: {
      name: "Know where to turn",
      blurb: "Look up the No More Ransom project and note what it offers, and make a mental (or written) note that 'check for a free decryptor' is a real step in any ransomware response. Knowing the constructive resources exist, before you ever need them, is part of being a prepared defender.",
    },
    ethicsNote: "Malware analysis is lawful and valuable only when done safely and on samples handled with authorisation, in isolation. Never run, spread or share live malware outside a contained, sanctioned setting. This is the careful, constructive spirit the whole field depends on.",
  },
};

export default topic5;
