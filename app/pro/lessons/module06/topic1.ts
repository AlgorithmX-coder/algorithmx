import type { TopicManifest } from "../../learn/types";
import { ActorMotiveLab } from "../../learn/conceptLabs";

/* Module 6 - Topic 1: threat actors and their motives. Case: DarkSide /
 * Colonial Pipeline, May 2021 (a financially motivated criminal
 * ransomware group shut a major US fuel pipeline; the group publicly
 * framed itself as apolitical and money-driven). Public record: 2021
 * reporting, DarkSide's own statements, and the US DoJ ransom recovery. */
const topic1: TopicManifest = {
  id: "m6t1",
  weekLabel: "Module 6",
  act: "Act 2 - How attacks happen",
  title: "Who the attackers are, and why",
  role: "You cannot defend well against an enemy you picture wrongly. Knowing the real types of attacker, and what each one wants, is how an analyst judges which threats actually apply to their organisation, and it is where Security+ Domain 2 begins.",
  minutes: 16,
  promise: "Meet the real kinds of attacker and what drives them, then see the criminal group that froze a nation's fuel supply for money.",
  brief: "In this lesson, we'll replace the hoodie-in-a-basement cartoon with the real cast of attackers: organised crime, nation-states, hacktivists and insiders, and what each one actually wants. Understanding motive is practical: it tells you who is likely to come for a given organisation, and how. Then we'll look at the group behind the Colonial Pipeline shutdown, and what their own words revealed about why they did it.",

  learn: [
    {
      heading: "Four kinds of attacker, four different motives",
      body: [
        "Attackers are not one undifferentiated blob of 'hackers'. They fall into recognisable groups, and the group determines the goal. Organised crime wants money, and runs attacks like a business. Nation-states want strategic advantage: espionage, disruption, or a capability held in reserve. Hacktivists want to send a message about a cause. And insiders, trusted people already inside, misuse the access they were given.",
        "This matters because the attacker you are likely to face shapes how you defend. A small shop worries most about opportunistic crime and phishing. A defence contractor also worries about patient, well-funded nation-state espionage. Naming the likely attacker is the first step in sizing up your real risk.",
      ],
      examples: [
        "Organised crime: ransomware gangs, card-theft crews, fraud operations. Motive: profit.",
        "Nation-state: intelligence agencies and their contractors. Motive: espionage, disruption, advantage.",
        "Hacktivist: ideologically driven groups. Motive: a political or social message.",
        "Insider: a current or former employee or contractor. Motive: money, grievance, or ideology.",
      ],
      analogy: {
        plain: "Think of who might target a shop: shoplifters after goods (crime), a rival doing corporate espionage (nation-state equivalent), protesters picketing the window (hacktivists), and a dishonest employee at the till (insider). Same shop, four very different threats.",
        realTerm: "threat actors",
      },
    },
    {
      heading: "Capability runs from opportunist to relentless",
      body: [
        "Alongside motive, attackers differ hugely in skill and resources. At one end are opportunists running automated tools against anyone with an open door: low skill, enormous scale. At the other are 'advanced persistent threats', typically nation-state teams with time, money and patience to pursue one target for months, quietly.",
        "Most organisations are hit by the opportunistic end, which is exactly why the basics, patching, strong passwords, MFA, stop so much. But knowing the advanced end exists keeps you honest: some targets really do face attackers who will not give up after the easy doors are locked, and defence has to be layered accordingly.",
      ],
      examples: [
        "Opportunist: mass-scans the internet, exploits whatever is unpatched. Huge volume, little finesse.",
        "Advanced persistent threat (APT): one target, many months, stealthy, well-resourced.",
        "The same control (say, MFA) stops the opportunist cold and still slows the APT down.",
      ],
    },
    {
      heading: "Motive predicts behaviour",
      body: [
        "Once you know what an attacker wants, you can often predict how they will behave, and that guides your defence and your response. A profit-driven criminal wants the fastest route to payment, so they favour ransomware and fraud and move loudly and quickly. A spy wants to stay hidden and keep stealing, so they move slowly and quietly and avoid anything that would reveal them.",
        "So when you investigate, the behaviour hints at the motive, and the motive hints at what to protect. Noisy mass-encryption screams organised crime after a ransom. A faint, patient trickle of data leaving over months suggests espionage. Reading those signals is a core analyst skill, and the rest of this module builds the map that makes it possible.",
      ],
      examples: [
        "Loud and fast, demanding payment: almost certainly profit-driven crime.",
        "Quiet and patient, stealing data over months: likely espionage.",
        "Public defacement or a leak tied to a cause: hacktivism making its point.",
      ],
      analogy: {
        plain: "A burglar who grabs what they can and runs behaves nothing like a spy who copies your keys and keeps visiting unnoticed. The goal shapes the method, so the method reveals the goal.",
        realTerm: "motive and behaviour",
      },
    },
  ],

  glossary: [
    { term: "threat actor", definition: "Any individual or group that carries out, or intends to carry out, malicious activity: the attacker behind an incident." },
    { term: "nation-state actor", definition: "An attacker working for or on behalf of a government, typically well-resourced, patient and focused on strategic goals." },
    { term: "hacktivist", definition: "An attacker motivated by a political or social cause rather than money, often seeking publicity through defacement or leaks." },
    { term: "insider threat", definition: "A current or former employee, contractor or partner who misuses legitimate access to cause harm." },
    { term: "advanced persistent threat (APT)", definition: "A skilled, well-resourced attacker (often nation-state) that pursues a specific target stealthily over a long period." },
  ],

  seeHeading: "When crime-for-profit froze a fuel pipeline",

  cases: [
    {
      org: "DarkSide / Colonial Pipeline",
      year: "2021",
      headline: "A criminal ransomware group shut a major fuel pipeline, and said it was only about money",
      whatHappened: "In May 2021, the ransomware group DarkSide compromised Colonial Pipeline, which carries a large share of the US East Coast's fuel. Colonial shut the pipeline down to contain the attack, triggering fuel shortages and panic buying across several states. DarkSide operated as a criminal business, even running a ransomware-as-a-service model for affiliates. As the fallout grew, the group publicly claimed it was apolitical and only wanted money, not disruption, a telling glimpse of a purely profit-driven motive.",
      theMissedMeasure: "Investigations pointed to a compromised account without multi-factor authentication as a route in. Strong access control, MFA on remote access in particular, is repeatedly the measure that would have raised the bar against this kind of opportunistic, profit-driven intrusion.",
      theCost: "Days of pipeline shutdown, regional fuel shortages, and a multi-million-dollar ransom paid, a large part of which US authorities later recovered. A vivid demonstration that profit-motivated crime can cause national-scale disruption.",
      control: "access-control",
      impact: ["a major US fuel pipeline shut for days", "regional fuel shortages and panic buying", "multi-million-dollar ransom paid, partly recovered by the DoJ"],
      source: "Public record; 2021 reporting, DarkSide's own statements, and the US Department of Justice ransom-recovery announcement.",
      brandColor: "#c0392b",
      news: { headline: "Colonial Pipeline: US recovers millions in cryptocurrency paid to ransomware hackers", outlet: "BBC News", date: "June 2021" },
    },
  ],

  lab: {
    title: "Match the attacker to the motive",
    intro: "Nothing to install and nothing leaves this page. Read each behaviour and match it to the kind of threat actor behind it.",
    prompts: [
      "Ask: what does this attacker actually want?",
      "Money points to crime; strategic advantage to a nation-state; a message to a hacktivist; misused trust to an insider.",
      "This is the first judgement an analyst makes about any incident.",
    ],
    component: ActorMotiveLab,
  },

  check: {
    explain: {
      prompt: "DarkSide shut down a fuel pipeline but insisted it was 'only about money'. Using the idea of threat actors and motives, explain what kind of attacker they were and why that claim is actually consistent with the damage they caused.",
      modelAnswer: "DarkSide were organised crime: a profit-driven ransomware business, even renting their tools to affiliates. Their claim to be apolitical fits that motive, they wanted a ransom, not disruption for its own sake. But profit-driven crime can still cause huge collateral damage, because the fastest route to payment, encrypting critical systems, forced Colonial to shut the pipeline to contain it. So the motive was money, and the national-scale fuel shortage was a side effect of how a criminal group pursues money: loudly, quickly, and by holding essential systems hostage.",
    },
    quiz: [
      {
        q: "A patient, well-resourced attacker quietly steals research from a defence firm over many months. This is most likely which kind of attacker?",
        options: [
          "A hacktivist group making a political point",
          "An insider misusing their own trusted access",
          "A nation-state actor running patient espionage",
          "An opportunist exploiting whatever is left open",
          "An organised crime gang chasing a fast ransom",
        ],
        answer: 2,
        reasons: [
          "A hacktivist wants publicity for a cause, so they act loudly and visibly. Quiet theft over many months is the opposite of making a point.",
          "An insider already has access and would not need months of stealthy outside effort. The description fits a well-resourced external team.",
          "Right. Patience, deep resources, stealth and a strategic target like defence research are the signature of nation-state espionage, an advanced persistent threat.",
          "An opportunist grabs whatever is easy and moves on. They do not patiently pursue one specific, well-defended target for months.",
          "Profit-driven crime wants the fastest route to payment and tends to move loudly. Slow, silent theft of research points to espionage, not a ransom.",
        ],
      },
      {
        q: "Why does knowing an attacker's motive help a defender?",
        options: [
          "It reveals the exact tools and malware the attacker will use",
          "It names the specific individual sitting behind the keyboard",
          "It removes any need for technical security controls elsewhere",
          "It tells you the exact day and hour an attack will land",
          "Motive predicts behaviour, guiding what to protect and how to respond",
        ],
        answer: 4,
        reasons: [
          "Motive hints at method, but not the precise tools. Two profit-driven gangs can use very different malware, so this claims more than motive can give.",
          "Motive rarely reveals a named person. Pinning an attack on an individual is slow, difficult work, and defence does not depend on it.",
          "Motive helps you prioritise, but it never replaces technical controls. You still need patching, MFA and the rest whatever the attacker wants.",
          "Motive cannot predict timing. It tells you how an attacker is likely to behave, not the calendar date they will strike.",
          "Right. Motive shapes method: profit-driven crime moves loud and fast for payment, espionage moves quiet and slow. Reading the behaviour helps you protect the right things and respond correctly.",
        ],
      },
      {
        q: "Most organisations are hit mainly by which kind of attacker?",
        options: [
          "Opportunists exploiting unpatched systems and weak passwords at scale",
          "Nation-state teams spending rare zero-day exploits on them",
          "Skilled insiders deliberately stealing data from the inside",
          "Targeted hacktivist campaigns aimed squarely at their brand",
          "Highly tailored spear-phishing crafted for each named employee",
        ],
        answer: 0,
        reasons: [
          "Right. The opportunistic end, automated attacks against whatever is left open, is the everyday reality. That is exactly why the basics stop so much.",
          "Nation-state teams and their scarce zero-days are real, but they are saved for high-value targets. Most organisations never face one.",
          "Insider theft happens and can be serious, but it is far rarer than the constant background of automated external attacks.",
          "Hacktivist campaigns target organisations tied to a cause or a brand. They are not what hits the typical organisation day to day.",
          "Tailored spear-phishing is used in targeted attacks, but the common reality is high-volume, untargeted scanning for easy weaknesses.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You can now picture the real cast of attackers, and read what each one is likely after.",
    takeaways: [
      "Attackers fall into groups by motive: organised crime (money), nation-states (advantage), hacktivists (a message), insiders (misused trust).",
      "They range from high-volume opportunists to patient, well-resourced advanced persistent threats.",
      "Motive predicts behaviour, so the way an attack unfolds hints at who is behind it and what to protect.",
    ],
    project: {
      name: "Name your likely attackers",
      blurb: "For an organisation you know (your workplace, a club, a shop), write down the two or three types of attacker most likely to target it and why. A corner shop and a hospital face very different threats. This 'who would come for us, and why?' question is the start of real risk thinking, and it is exactly what a threat assessment does.",
    },
    ethicsNote: "Understanding attackers is defensive knowledge. Nothing in this act authorises you to act like one: every technique ahead is studied to recognise and stop it, strictly within the law and scope you set in Module 5.",
  },
};

export default topic1;
