import type { TopicManifest } from "../../learn/types";
import { DetectionTypeLab } from "../../learn/conceptLabs";

/* Module 15 - Topic 1: signatures vs behaviour. Case: the industry-wide
 * shift to "living-off-the-land" and fileless attacks that use
 * legitimate tools and leave no malware file to match, defeating pure
 * signature detection. Public record: widely-documented threat-report
 * findings on fileless / LOLBin techniques. */
const topic1: TopicManifest = {
  id: "m15t1",
  weekLabel: "Module 15",
  act: "Act 3 - Defence for real",
  title: "Signatures vs behaviour",
  role: "Detection is the heart of a SOC, and it comes in two complementary styles: matching known-bad signatures, and spotting suspicious behaviour. Understanding the strengths and blind spots of each is what lets an analyst know what their tools will, and will not, catch.",
  minutes: 15,
  promise: "Learn the two ways to detect an attack and why you need both, then see why attackers now bring no malware file to match.",
  brief: "In this lesson, we'll learn the two broad styles of detection. Signature-based detection matches known-bad things, a malware fingerprint, a bad address, and is precise but blind to anything new. Behaviour-based detection watches for suspicious actions whatever the specific file, and catches novel threats. We'll see why modern defence needs both, and then see how attackers increasingly use legitimate tools to leave no signature to match at all.",

  learn: [
    {
      heading: "Signatures: matching the known-bad",
      body: [
        "Signature-based detection works by matching against a list of known-bad things: the fingerprint (hash) of a specific malware file, a known malicious address, a recognisable pattern of a known attack. If something matches, it is flagged or blocked. This is how traditional antivirus and many blocklists work, and it is precise and fast: a match is a confident hit.",
        "Its strength is also its limit. Signatures only catch what is already known. A brand-new malware variant, with a fingerprint no one has seen, sails straight past a purely signature-based defence. Attackers exploit this constantly by tweaking their malware just enough to change its signature. Signatures are necessary and useful, but they are always one step behind the newest threats.",
      ],
      examples: [
        "Match a known malware hash, a bad IP, a recognised attack pattern.",
        "Precise and fast: a match is a confident hit.",
        "Blind to anything new: a tweaked variant has a new, unknown signature.",
      ],
      analogy: {
        plain: "A 'wanted' poster catches known criminals by their photo, but is useless against a first-time offender whose face is not on file.",
        realTerm: "signature-based detection",
      },
    },
    {
      heading: "Behaviour: spotting suspicious actions",
      body: [
        "Behaviour-based detection takes a different approach: instead of asking 'is this a known-bad thing?', it asks 'is this suspicious behaviour?'. A process suddenly encrypting thousands of files looks like ransomware whatever its name; an account logging in at 3am and reaching systems it never touches looks like a takeover regardless of how the attacker got in. Behaviour detection watches what things do, not just what they are.",
        "Its great strength is catching novel threats: behaviours are much harder to disguise than file fingerprints, so a brand-new variant still gives itself away by acting maliciously (the Module 8 insight). The trade-off is that behaviour is less clear-cut, legitimate activity can sometimes look suspicious, so behaviour detection needs more tuning to avoid false alarms. But it is what catches the attacks signatures miss.",
      ],
      examples: [
        "Flag mass file encryption, odd-hours access, unusual connections, whatever the file.",
        "Catches novel threats: behaviour is hard to disguise, unlike a fingerprint.",
        "Less clear-cut, so it needs tuning to avoid false alarms.",
      ],
    },
    {
      heading: "Why you need both, and why behaviour matters more and more",
      body: [
        "The two styles are complementary, not rivals. Signatures catch the vast volume of known threats cheaply and precisely; behaviour catches the novel and the disguised. A good defence uses both: signatures to filter the known-bad efficiently, and behaviour to catch what slips past. Relying on signatures alone leaves you blind to anything new; relying on behaviour alone drowns you in work. Together, they cover each other's gaps.",
        "Behaviour is becoming more important because attackers increasingly bring no malware file to match at all. 'Living-off-the-land' attacks use the legitimate tools already on a system (built-in administration utilities, scripting) to do their work, so there is no malicious file with a signature, only suspicious behaviour. The case you are about to see is this shift: when the attack uses trusted tools, only watching behaviour can catch it.",
      ],
      examples: [
        "Signatures for the known-bad (cheap, precise); behaviour for the novel and disguised.",
        "Signatures alone: blind to new. Behaviour alone: overwhelming. Together: coverage.",
        "Fileless attacks use legitimate tools, so only behaviour can catch them.",
      ],
      analogy: {
        plain: "Door locks (signatures) stop known methods of entry; alert neighbours noticing odd behaviour (behaviour detection) catch the burglar who found a new way in. You want both.",
        realTerm: "defence in depth for detection",
      },
    },
  ],

  glossary: [
    { term: "signature-based detection", definition: "Detecting threats by matching known-bad indicators (a malware hash, a bad address): precise, but blind to anything new." },
    { term: "behaviour-based detection", definition: "Detecting threats by spotting suspicious actions whatever the specific file, which catches novel and disguised attacks." },
    { term: "living-off-the-land", definition: "Attacks that use the legitimate tools already on a system, leaving no malicious file to match, so only behaviour detection catches them." },
    { term: "false positive", definition: "A benign activity flagged as malicious; behaviour detection produces more of these, which is why tuning matters." },
  ],

  seeHeading: "When the attack brings no file to match",

  cases: [
    {
      org: "Living-off-the-land attacks",
      year: "ongoing",
      headline: "Attackers increasingly use legitimate tools, leaving no signature to detect",
      whatHappened: "Across the industry, threat reports consistently document a major shift: attackers increasingly avoid dropping recognisable malware files and instead 'live off the land', using the legitimate administration tools and scripting already present on systems to carry out their attacks. Because there is no malicious file, there is no signature to match, so traditional signature-based detection is effectively blind to them. These fileless techniques have become a dominant feature of sophisticated intrusions precisely because they evade the detection most organisations historically relied on.",
      theMissedMeasure: "Behaviour-based detection. When an attack uses trusted tools and leaves no file to fingerprint, the only way to catch it is to notice the suspicious behaviour, legitimate tools being used in abnormal ways. It is the clearest argument for why modern defence cannot rely on signatures alone.",
      theCost: "The 'cost' is a persistent blind spot for signature-only defences, which is exactly why behaviour-based detection (and EDR) has become essential. The trend has reshaped detection toward watching behaviour, not just matching known-bad files.",
      control: "malware-protection",
      impact: ["attackers use legitimate on-system tools (no malware file)", "no signature to match, so signature detection is blind", "only behaviour-based detection catches them"],
      source: "Public record; widely-documented threat-report findings on fileless / living-off-the-land techniques.",
      brandColor: "#5b8def",
      news: { headline: "The rise of fileless, living-off-the-land attacks", outlet: "Industry threat reporting (ongoing)", date: "ongoing" },
    },
  ],

  lab: {
    title: "Signature or behaviour?",
    intro: "Nothing to install and nothing leaves this page. For each detection, decide: is it signature-based (matching known-bad), or behaviour-based (spotting suspicious actions)?",
    prompts: [
      "Signatures match known-bad fingerprints, addresses and patterns.",
      "Behaviour watches what something does, catching the novel and disguised.",
      "Remember: a strong defence needs both.",
    ],
    component: DetectionTypeLab,
  },

  check: {
    explain: {
      prompt: "Explain the difference between signature-based and behaviour-based detection, their strengths and blind spots, and why living-off-the-land attacks make behaviour detection essential.",
      modelAnswer: "Signature-based detection matches known-bad things, a malware hash, a bad address, a recognised pattern, so it is precise and fast but blind to anything new: a brand-new or slightly-tweaked variant has an unknown fingerprint and sails past. Behaviour-based detection instead watches what something does, flagging suspicious actions like mass file encryption or odd-hours access whatever the specific file, so it catches novel and disguised threats, at the cost of being less clear-cut and needing tuning to avoid false alarms. The two are complementary: signatures filter the huge volume of known-bad cheaply and precisely, while behaviour catches what slips past, so a good defence uses both. Living-off-the-land attacks make behaviour detection essential because attackers increasingly use the legitimate tools already on a system rather than dropping malware, so there is no malicious file and no signature to match at all; the only way to catch them is to notice the suspicious behaviour of trusted tools being used abnormally. That shift is exactly why modern defence cannot rely on signatures alone.",
    },
    quiz: [
      {
        q: "What is the key limitation of signature-based detection?",
        options: [
          "It is too slow",
          "It only catches known threats; anything new or tweaked has an unknown signature and slips past",
          "It cannot run on computers",
          "It produces too many false alarms",
        ],
        answer: 1,
        why: "Signatures match the known-bad, so novel or modified threats evade them. That is why behaviour detection is needed too.",
      },
      {
        q: "What is the main strength of behaviour-based detection?",
        options: [
          "It never produces false alarms",
          "It catches novel and disguised threats by watching what they do, which is hard to fake",
          "It is always cheaper",
          "It needs no tuning",
        ],
        answer: 1,
        why: "Behaviour is hard to disguise, so a brand-new variant still gives itself away by acting maliciously.",
      },
      {
        q: "Why do living-off-the-land attacks defeat signature detection?",
        options: [
          "They are too large to scan",
          "They use legitimate tools already on the system, so there is no malicious file to match a signature",
          "They encrypt the signatures",
          "They only attack at night",
        ],
        answer: 1,
        why: "No malware file means no fingerprint to match, so only behaviour detection, noticing trusted tools used abnormally, can catch them.",
      },
    ],
  },

  wrap: {
    headline: "You now understand the two styles of detection, their blind spots, and why modern defence needs behaviour, not just signatures.",
    takeaways: [
      "Signature detection matches known-bad: precise but blind to anything new.",
      "Behaviour detection spots suspicious actions: catches novel and disguised threats, but needs tuning.",
      "You need both, and behaviour matters more as attackers go fileless, living off the land.",
    ],
    project: {
      name: "Classify your defences",
      blurb: "List the security tools you know of (antivirus, blocklists, EDR behaviour alerts) and label each as mostly signature-based, mostly behaviour-based, or both. Noticing where your defences rely only on signatures, and might be blind to the new, is exactly the gap-spotting a detection analyst does.",
    },
    ethicsNote: "Detection is defensive work on your own organisation's systems. Studying how attacks evade detection is to improve defences, within the authorisation principles from Module 5.",
  },
};

export default topic1;
