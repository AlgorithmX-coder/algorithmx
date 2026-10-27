import type { TopicManifest } from "../../learn/types";
import { HomeLabLab } from "../../learn/conceptLabs";

/* Module 21 - Topic 4: your home lab and staying current. Practical,
 * lawful guidance on continuing to learn and practise safely (own
 * isolated labs, deliberately-vulnerable training apps), and keeping up
 * with a fast-moving field. Reinforces the Module 5 authorisation line. */
const topic4: TopicManifest = {
  id: "m21t4",
  weekLabel: "Module 21",
  act: "Act 4 - Get hired",
  title: "Your home lab & staying current",
  role: "Cyber security never stops moving, so the ability to keep learning and practising, safely and lawfully, is itself a core professional skill. A home lab and good habits for staying current keep you sharp, hireable, and growing throughout your career.",
  minutes: 14,
  promise: "Learn how to keep building your skills safely and lawfully after the course, and how to stay current in a fast-moving field.",
  brief: "In this lesson, we'll set you up to keep growing. We'll cover the home lab, your own safe, isolated environment for practising attacks and defences lawfully, and the deliberately-vulnerable training apps built for exactly this. And we'll cover staying current: the habits that keep you up to date in a field that changes constantly. Both reinforce the golden rule: practise only where you are authorised.",

  learn: [
    {
      heading: "A home lab: practise safely and lawfully",
      body: [
        "The best way to keep building practical skills is a home lab: your own isolated environment, typically virtual machines on your own computer, where you can practise attacks and defences safely and, crucially, lawfully. Because it is yours and isolated, you can experiment freely, break things, try techniques, analyse malware carefully, without risking real systems, real data, or the law. A home lab is where theory becomes hands-on skill.",
        "Alongside your own lab, there are deliberately-vulnerable training applications and practice ranges built specifically for safe, lawful learning, environments designed to be attacked so you can practise on them without harming anyone. These, plus your own isolated VMs, are the lawful playgrounds where you develop real skill. They are how professionals and learners alike keep their hands sharp, entirely within the authorisation line from Module 5.",
      ],
      examples: [
        "A home lab: your own isolated VMs, where you can experiment freely and lawfully.",
        "Deliberately-vulnerable training apps and ranges, built to be practised on safely.",
        "These are the lawful playgrounds where theory becomes real skill.",
      ],
      analogy: {
        plain: "A practice range or a rehearsal studio lets you train hard with zero risk to the real world. Your home lab is that range for security skills.",
        realTerm: "home lab",
      },
    },
    {
      heading: "The golden rule still applies, always",
      body: [
        "This is the moment to reinforce, one final time, the authorisation line from Module 5, because the temptation to 'try it on something real' is strongest when you are keen and skilled. You practise only on systems you own or are explicitly authorised to test. Never point your new skills at a real website, network or system you do not own or have written permission for, no matter how curious you are or how 'harmless' it seems. Unauthorised testing is a criminal offence, and good intentions are no defence (recall Daniel Cuthbert).",
        "This is not a limitation on your growth; it is what makes your growth legitimate and your career possible. Everything you need to practise, your own labs, vulnerable training apps, authorised engagements, is available lawfully. A professional's skill is matched by their discipline about where they use it. Carrying this rule with you, permanently and without exception, is part of what separates a security professional from a criminal, and it is non-negotiable.",
      ],
      examples: [
        "Practise only on systems you own or are explicitly authorised to test.",
        "Never target a real system you do not own, however curious or 'harmless' it seems.",
        "Everything you need is available lawfully: own labs, training apps, authorised engagements.",
      ],
    },
    {
      heading: "Staying current in a fast-moving field",
      body: [
        "Cyber security changes constantly, new threats, new techniques, new tools, so staying current is a permanent part of the job, not a one-off. The good news is that the habits are simple and often free: follow reputable security news and vendor and national advisories (like the NCSC), engage with communities where practitioners share knowledge, keep practising in your lab, and keep learning, through reading, courses, and hands-on experimentation. Continuous, curious learning is the field's natural rhythm.",
        "This matters for your career in two ways. Practically, you need to keep up to stay effective and hireable. But it is also genuinely enjoyable for the curious, which is a good sign this field suits you: if you find yourself wanting to understand the latest breach or try a new technique in your lab, you are already doing what good security people do. Make continuous learning a sustainable habit, not a sprint, and it will carry you through a long, evolving career. That habit, as much as any single skill, is what you take from this course.",
      ],
      examples: [
        "Follow reputable news and advisories (NCSC), engage with communities, keep practising.",
        "Continuous, curious learning is the field's natural rhythm, and often free.",
        "Make it a sustainable habit, not a sprint; it carries a whole career.",
      ],
      analogy: {
        plain: "Like a doctor keeping up with new medicine, a security professional keeps learning for life. The field moves, and staying current is simply part of the craft.",
        realTerm: "staying current",
      },
    },
  ],

  glossary: [
    { term: "home lab", definition: "Your own isolated environment (typically virtual machines) for practising attacks and defences safely and lawfully." },
    { term: "vulnerable training app", definition: "An application deliberately built to be insecure, so learners can practise attacking and defending it lawfully." },
    { term: "the authorisation line", definition: "The Module 5 rule: only test systems you own or are explicitly authorised to test; unauthorised testing is a crime." },
    { term: "staying current", definition: "The ongoing habit of keeping up with new threats, techniques and tools, a permanent part of a security career." },
  ],

  seeHeading: "How professionals keep growing, lawfully",

  cases: [
    {
      org: "Home labs & continuous learning",
      year: "current",
      headline: "Lawful practice environments and continuous learning keep professionals sharp",
      whatHappened: "A consistent feature of successful security careers is continuous, lawful skill-building: practising in home labs (own isolated virtual machines) and on deliberately-vulnerable training applications and ranges built for safe practice, and staying current through reputable news, advisories (such as the NCSC's), communities and ongoing learning. These lawful playgrounds let practitioners develop and maintain real skill without risking real systems or breaking the law, and the habit of continuous learning keeps them effective in a field that never stops changing. The professionals who thrive are those who keep practising and learning, always within the authorisation line, never testing systems they do not own or have permission for.",
      theMissedMeasure: "Lawful, continuous practice and learning: home labs, vulnerable training apps, and staying current, all within the authorisation line from Module 5. This is how skill is built and maintained safely, and the discipline that keeps a career legitimate.",
      theCost: "Here the value is sustainable growth: lawful practice environments and continuous-learning habits keep a professional sharp and hireable for a whole career, while the discipline of only testing authorised systems keeps that career legitimate.",
      control: "access-control",
      impact: ["home labs and vulnerable apps enable safe, lawful practice", "staying current keeps you effective in a fast-moving field", "always within the authorisation line (Module 5)"],
      source: "Public record; established practice for lawful skill-building in security.",
      brandColor: "#0a7d4b",
      news: { headline: "Home labs and continuous learning: how security pros stay sharp, lawfully", outlet: "Established practice (current)", date: "current" },
    },
  ],

  lab: {
    title: "Good practice, or risky?",
    intro: "Nothing to install and nothing leaves this page. For each way of building skills, decide: good practice, or risky/unlawful?",
    prompts: [
      "Own isolated labs, vulnerable training apps, following advisories, communities: good.",
      "Testing real systems you do not own, or running malware on your real machine: risky/unlawful.",
      "The golden rule: practise only where you are authorised.",
    ],
    component: HomeLabLab,
  },

  check: {
    explain: {
      prompt: "Explain how to keep building skills safely and lawfully after the course, why the authorisation line still applies, and what staying current involves.",
      modelAnswer: "To keep building skills safely and lawfully after the course, use a home lab, your own isolated environment, typically virtual machines on your own computer, where you can practise attacks and defences freely without risking real systems, data or the law, and use deliberately-vulnerable training applications and practice ranges built specifically for safe, lawful learning; these are the lawful playgrounds where theory becomes real skill. The authorisation line from Module 5 still applies, always and without exception: you practise only on systems you own or are explicitly authorised to test, and never point your new skills at a real website, network or system you do not own or have written permission for, however curious you are or 'harmless' it seems, because unauthorised testing is a criminal offence and good intentions are no defence (recall Daniel Cuthbert); this is not a limitation on growth but what makes growth legitimate and a career possible, since everything you need to practise is available lawfully. Staying current involves simple, often-free habits, because the field changes constantly: following reputable security news and advisories (like the NCSC's), engaging with communities where practitioners share knowledge, keeping practising in your lab, and continuing to learn through reading, courses and hands-on experimentation; continuous, curious learning is the field's natural rhythm, and making it a sustainable habit rather than a sprint is what carries a professional through a long, evolving career.",
    },
    quiz: [
      {
        q: "Where can you safely and lawfully practise attack and defence skills?",
        options: [
          "On any public website, as long as you cause no actual damage.",
          "On your employer's live production systems, since you already work there.",
          "On any system at all, provided you report the flaws afterwards.",
          "In your own isolated home lab and on deliberately-vulnerable training apps.",
          "On a friend's computer or network, as long as they do not mind.",
        ],
        answer: 3,
        reasons: [
          "Causing no damage is not a defence. Testing a website you do not own is unauthorised access and a criminal offence regardless.",
          "Working somewhere does not authorise you to test its live systems. That needs explicit, written permission, not just your job.",
          "Reporting flaws afterwards does not make the testing lawful. Unauthorised access is already an offence the moment you start.",
          "Right. Your own isolated lab and purpose-built vulnerable apps are the lawful playgrounds; testing systems you do not own is a crime.",
          "A casual 'do not mind' is not real authorisation, and it is easy to damage more than intended. You need explicit permission.",
        ],
      },
      {
        q: "Does the authorisation line relax once you are skilled?",
        options: [
          "Yes: experienced experts are trusted to test systems without asking permission first.",
          "No: you only test systems you own or are explicitly authorised to, however skilled.",
          "Yes, as long as you intend only to help and report what you find.",
          "Yes, once you hold a recognised penetration-testing certification that proves competence.",
          "Only for systems that are publicly reachable and have no login screen.",
        ],
        answer: 1,
        reasons: [
          "Skill grants no exemption. However expert you are, testing a system without authorisation is still a criminal offence.",
          "Right. Unauthorised testing is always a crime and good intentions are no defence; the rule is permanent and non-negotiable.",
          "Good intentions are no defence in law. Recall Daniel Cuthbert: meaning to help does not make unauthorised testing lawful.",
          "A certificate proves competence, not permission. You still need the owner's explicit authorisation before testing anything.",
          "Being publicly reachable is not an invitation. A public system is still owned by someone, and testing it without permission is an offence.",
        ],
      },
      {
        q: "What does staying current involve?",
        options: [
          "Learning the whole field thoroughly once, then relying on it for your career.",
          "Waiting for your employer to book you on a training course every few years.",
          "Reading up on new threats only once they have directly affected you.",
          "Memorising every new tool and acronym the moment it is released.",
          "Following reputable news and advisories, joining communities, and practising and learning continuously.",
        ],
        answer: 4,
        reasons: [
          "The field changes constantly, so a one-off effort goes stale fast. Staying current is ongoing, not something you finish once.",
          "Keeping current is your own habit, not something to wait for. Relying only on occasional employer courses leaves you behind.",
          "Waiting until a threat hits you is too late. Following news and advisories is how you learn about threats before they reach you.",
          "You cannot, and need not, memorise everything. Staying current is steady, curious learning, not frantically cramming every new release.",
          "Right. The field changes constantly, so continuous, curious learning, through news, advisories, communities and practice, is a permanent and often enjoyable part of the job.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You now know how to keep growing, safely, lawfully, and for the long term, which is a core professional skill in itself.",
    takeaways: [
      "Build skills in your own isolated home lab and on deliberately-vulnerable training apps, lawful playgrounds.",
      "The authorisation line is permanent: only ever test systems you own or are explicitly authorised to test.",
      "Stay current through news, advisories, communities and continuous practice; make it a sustainable, lifelong habit.",
    ],
    project: {
      name: "Plan your continued learning",
      blurb: "Set up (or plan) a simple home lab and pick one trustworthy news source or community to follow regularly. Write a two-line plan for how you will keep practising and learning after this course. Making continuous, lawful learning a habit is what keeps you sharp and hireable for a whole career.",
    },
    ethicsNote: "This topic is the authorisation line made into a lifelong habit: practise only where you are authorised, forever. It is the discipline that keeps your growing skill lawful and your career legitimate (Module 5).",
  },
};

export default topic4;
