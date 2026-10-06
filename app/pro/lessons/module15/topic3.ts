import type { TopicManifest } from "../../learn/types";
import { ThreatIntelLab } from "../../learn/conceptLabs";

/* Module 15 - Topic 3: threat intelligence, knowing the adversary.
 * Case: Mandiant's 2013 "APT1" report, a landmark public threat-
 * intelligence report that detailed a prolific state-linked espionage
 * group's operations and methods. Public record: the 2013 Mandiant APT1
 * report and reporting. */
const topic3: TopicManifest = {
  id: "m15t3",
  weekLabel: "Module 15",
  act: "Act 3 - Defence for real",
  title: "Threat intelligence",
  role: "Threat intelligence is understanding your adversary, who might attack you, how they operate, and what to watch for, so defence is informed rather than blind. It is a growing specialism and a mindset that makes every other defensive activity sharper.",
  minutes: 15,
  promise: "Learn what turns raw data into useful intelligence, then see the landmark report that named and exposed a prolific espionage group.",
  brief: "In this lesson, we'll look at threat intelligence: the discipline of understanding adversaries so you can defend against them specifically. We'll see what separates genuinely useful intelligence (relevant, actionable, timely) from noise, and the levels it comes in. Then we'll study a landmark report that moved threat intelligence into the open, detailing a prolific espionage group's operations in a way that reshaped how defenders understand adversaries.",

  learn: [
    {
      heading: "From data to intelligence",
      body: [
        "There is a vital difference between data and intelligence. Raw data, a log entry, an IOC, a headline, is just a fact. Intelligence is data that has been analysed and given context so it can inform a decision. 'Attacks are increasing' is data (and not very useful); 'a group that targets your exact industry is actively using this technique right now' is intelligence you can act on.",
        "Good threat intelligence has three qualities: it is relevant (it applies to you, your industry, your systems), actionable (it tells you something you can actually do), and timely (it arrives while you can still act on it). Intelligence that is generic, or too late, or that you cannot act on, is just noise dressed up. The analyst's skill is distinguishing the genuinely useful from the merely interesting.",
      ],
      examples: [
        "Data: 'cyber attacks are rising.' Intelligence: 'this group targets your sector with this technique now.'",
        "Useful intelligence is relevant, actionable and timely.",
        "Generic, too-late or un-actionable 'intel' is just noise.",
      ],
      analogy: {
        plain: "A weather fact ('it rains sometimes') is useless; a forecast ('heavy rain here this afternoon, take an umbrella') is intelligence you act on. Context and relevance make the difference.",
        realTerm: "threat intelligence",
      },
    },
    {
      heading: "Knowing the adversary makes defence specific",
      body: [
        "The purpose of threat intelligence is to make defence informed rather than generic. If you know which kinds of adversary are likely to target you (Module 6), how they typically operate, and what they are doing right now, you can prepare specifically: watch for their known techniques, block their known infrastructure, and prioritise the defences that matter against them. Blind defence treats all threats equally; intelligence-led defence focuses effort where it counts.",
        "This connects everything in Act 3. Threat intelligence tells you what to harden against, what detections to build, and what to be ready to respond to. It turns the abstract 'defend against attackers' into the concrete 'defend against these attackers, who do these things'. That specificity is enormously more effective than spreading limited resources evenly against every imaginable threat.",
      ],
      examples: [
        "Know who is likely to target you, how they operate, and what they are doing now.",
        "Prepare specifically: watch their techniques, block their infrastructure, prioritise.",
        "Intelligence-led defence focuses effort; blind defence spreads it thin.",
      ],
    },
    {
      heading: "Levels of intelligence, and bringing it into the open",
      body: [
        "Threat intelligence comes at different levels. Tactical intelligence is the immediate, technical detail (IOCs, specific techniques) a SOC uses day to day. Operational intelligence is about specific campaigns and how adversaries are behaving. Strategic intelligence is the big picture that informs leadership decisions. A beginner mostly consumes tactical intelligence, but understanding the levels shows how the discipline fits together.",
        "For a long time, deep adversary intelligence was kept private, within governments and security firms. A turning point came when detailed intelligence about a specific, prolific adversary was published openly, naming the group, detailing its methods, and giving defenders everywhere the knowledge to recognise and resist it. The case you are about to see is that landmark, which helped move serious threat intelligence into the shared, public domain that benefits the whole community.",
      ],
      examples: [
        "Tactical (IOCs, techniques for the SOC), operational (campaigns), strategic (big picture for leaders).",
        "Beginners mostly consume tactical intelligence day to day.",
        "Publishing deep adversary intelligence openly benefits the whole community.",
      ],
      analogy: {
        plain: "Tactical intel is today's specific threats; strategic intel is the long-term forecast that shapes big decisions. Publishing a detailed 'dossier' on a known offender helps everyone recognise them.",
        realTerm: "levels of threat intelligence",
      },
    },
  ],

  glossary: [
    { term: "threat intelligence", definition: "Analysed, contextualised information about adversaries that informs defensive decisions, relevant, actionable and timely." },
    { term: "data vs intelligence", definition: "Data is raw fact; intelligence is data analysed and given context so it can drive a decision." },
    { term: "tactical / operational / strategic intel", definition: "Levels of threat intelligence: immediate technical detail (tactical), campaign behaviour (operational), and big-picture guidance for leaders (strategic)." },
    { term: "adversary profile", definition: "A detailed understanding of a specific threat group: who they are, their motives, and how they operate (their TTPs)." },
  ],

  seeHeading: "The report that named an adversary in the open",

  cases: [
    {
      org: "Mandiant 'APT1' report",
      year: "2013",
      headline: "A landmark public report detailed a prolific espionage group's operations",
      whatHappened: "In 2013, the security firm Mandiant published a detailed public report on a prolific cyber-espionage group it called 'APT1', which it linked to state-sponsored activity. The report described, in unprecedented public detail, how the group operated: its targets, its methods and techniques, and the indicators of its activity. Publishing this kind of deep adversary intelligence openly was a landmark moment: it gave defenders everywhere the knowledge to recognise and defend against a specific, serious adversary, and it helped move threat intelligence from the shadows into the shared public domain.",
      theMissedMeasure: "The report is itself the constructive measure: it demonstrated the power of detailed, shared threat intelligence. By making an adversary's methods public, it turned private knowledge into collective defence, exactly the 'know your adversary, and share it' principle this module teaches.",
      theCost: "Here the value is empowerment: defenders worldwide gained a detailed understanding of a real, active adversary, and the model of publishing deep threat intelligence openly has since become a cornerstone of collective defence.",
      control: "secure-configuration",
      impact: ["landmark public report on a prolific espionage group", "detailed its targets, methods and indicators", "helped bring serious threat intelligence into the open"],
      source: "Public record; the 2013 Mandiant APT1 report and reporting.",
      brandColor: "#e01e5a",
      news: { headline: "Mandiant's APT1 report: naming a state-linked espionage group in public", outlet: "Mainstream and security reporting (2013)", date: "2013" },
    },
  ],

  lab: {
    title: "Useful intelligence, or noise?",
    intro: "Nothing to install and nothing leaves this page. For each piece, decide: genuinely useful threat intelligence, or not useful on its own?",
    prompts: [
      "Useful intelligence is relevant, actionable and timely.",
      "Generic headlines, vague warnings and unsourced rumours are noise.",
      "Specific, credible, actionable information is the real thing.",
    ],
    component: ThreatIntelLab,
  },

  check: {
    explain: {
      prompt: "Explain the difference between data and intelligence, what makes threat intelligence useful, and why the Mandiant APT1 report was a landmark.",
      modelAnswer: "Data is raw fact, a log entry, an IOC, a headline, while intelligence is data that has been analysed and given context so it can inform a decision: 'attacks are increasing' is data, but 'a group targeting your exact industry is using this technique right now' is intelligence you can act on. Useful threat intelligence has three qualities: it is relevant (it applies to you, your industry, your systems), actionable (it tells you something you can actually do), and timely (it arrives while you can still act). The purpose is to make defence informed rather than generic: knowing who is likely to target you, how they operate, and what they are doing now lets you prepare specifically, watching their techniques, blocking their infrastructure, and prioritising the right defences, which is far more effective than spreading limited resources evenly against every imaginable threat. The Mandiant APT1 report was a landmark because it published deep intelligence on a specific, prolific adversary openly, detailing its targets, methods and indicators, turning private knowledge into collective defence and helping move serious threat intelligence into the shared public domain that benefits the whole community.",
    },
    quiz: [
      {
        q: "What is the difference between data and intelligence?",
        options: [
          "There is none",
          "Data is raw fact; intelligence is data analysed and given context so it can drive a decision",
          "Intelligence is always secret",
          "Data is more useful than intelligence",
        ],
        answer: 1,
        why: "Context and analysis turn a fact into something you can act on. 'Attacks are rising' is data; a specific, relevant, timely warning is intelligence.",
      },
      {
        q: "What makes threat intelligence genuinely useful?",
        options: [
          "It is long and technical",
          "It is relevant, actionable and timely",
          "It comes from a famous company",
          "It is kept secret",
        ],
        answer: 1,
        why: "Relevant (applies to you), actionable (you can do something), and timely (while you can still act) are the three qualities. Otherwise it is noise.",
      },
      {
        q: "Why was the Mandiant APT1 report a landmark?",
        options: [
          "It was the first antivirus",
          "It published deep intelligence on a specific adversary openly, turning private knowledge into collective defence",
          "It was a type of malware",
          "It proved threat intelligence is useless",
        ],
        answer: 1,
        why: "Detailing a real adversary's methods in public helped defenders everywhere and moved serious threat intelligence into the shared domain.",
      },
    ],
  },

  wrap: {
    headline: "You now understand threat intelligence: knowing your adversary so defence is specific, not blind.",
    takeaways: [
      "Intelligence is data analysed and given context; useful intel is relevant, actionable and timely.",
      "Knowing the adversary makes defence specific, prioritising effort where it actually counts.",
      "Sharing deep adversary intelligence openly (as the APT1 report did) powers collective defence.",
    ],
    project: {
      name: "Judge the intel",
      blurb: "Collect three security 'warnings' you encounter (news, advisories, vendor blogs) and rate each on relevance, actionability and timeliness. Deciding what is genuinely useful intelligence versus noise is exactly the judgement a threat-intelligence analyst makes, and it sharpens how you consume security information.",
    },
    ethicsNote: "Threat intelligence is gathered and used to defend. Consume and share it responsibly, and use it to protect your own or authorised systems, within the authorisation principles from Module 5.",
  },
};

export default topic3;
