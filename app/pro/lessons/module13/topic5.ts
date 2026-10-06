import type { TopicManifest } from "../../learn/types";
import { TriageLab } from "../../learn/conceptLabs";

/* Module 13 - Topic 5: a day in the life, and what good triage looks
 * like. Case: honeypot / exposure research consistently showing that
 * systems put on the internet are probed and attacked within minutes,
 * illustrating the constant pressure a SOC works under. Public record:
 * widely-published honeypot and internet-scanning research. */
const topic5: TopicManifest = {
  id: "m13t5",
  weekLabel: "Module 13",
  act: "Act 3 - Defence for real",
  title: "A day in the life & good triage",
  role: "This topic makes the SOC real: what an analyst's day actually looks like, and what separates good triage from bad. It is the clearest picture yet of the job you are working toward, and the craft at its heart.",
  minutes: 16,
  promise: "See what a SOC analyst's day really involves, and what good triage looks like, then see how fast the internet attacks anything you expose.",
  brief: "In this lesson, we'll bring the module to life. We'll walk through what a SOC analyst actually does day to day, and focus on the core craft: good triage. Good triage is calm, evidence-led, knows when to escalate, and is well documented. Then we'll see research showing just how relentless the pressure is, systems exposed to the internet are attacked within minutes, which is why there is always something to watch.",

  learn: [
    {
      heading: "What the day actually looks like",
      body: [
        "A SOC analyst's day is not constant drama; it is a steady rhythm of watching and judging. Alerts arrive through the SIEM and EDR. For each, you triage: gather context, decide whether it is a real concern or a false alarm, handle the routine ones, and escalate the ones that matter. Between alerts, you might review the previous shift's handover, help tune noisy rules, document your work, and keep learning. It is focused, methodical work, with occasional bursts of genuine urgency.",
        "This realistic picture matters because it sets expectations. The job is not mostly 'stopping hackers in dramatic real time'; it is mostly careful, consistent triage and good judgement, punctuated by the real incidents that make all the watching worthwhile. Knowing this helps you decide if the role suits you, and it is exactly the day you are being prepared for.",
      ],
      examples: [
        "Alerts arrive; you triage each: gather context, judge, handle or escalate.",
        "Between alerts: handovers, tuning noisy rules, documentation, learning.",
        "Mostly methodical judgement, with bursts of real urgency.",
      ],
      analogy: {
        plain: "Like an air-traffic controller: long stretches of careful, routine monitoring and clear communication, with the skill proven in the moments that suddenly matter.",
        realTerm: "a SOC shift",
      },
    },
    {
      heading: "What good triage looks like",
      body: [
        "Triage is the craft at the heart of the job, and good triage has a recognisable shape. It is calm: an alert is a question, not an emergency, so you gather context before judging. It is evidence-led: you decide based on what you can actually see and confirm, not on guesses or panic. It knows when to escalate: neither sitting on something serious nor raising every trivial thing. And it is documented: clear, factual notes so others can pick up instantly and so the work is defensible later.",
        "Bad triage is the opposite: panicking at noise, dismissing real signals, escalating everything (or nothing), and leaving no record. The difference between a good and a bad analyst is rarely exotic knowledge; it is this disciplined, calm, evidence-led, well-documented handling of the stream of alerts. It is a craft you build with practice, and it is precisely what you have been practising in this course's decision labs.",
      ],
      examples: [
        "Calm: gather context first, an alert is a question, not an emergency.",
        "Evidence-led: judge on what you can confirm, not guesses or panic.",
        "Knows when to escalate; documents clearly so others can act and review.",
      ],
    },
    {
      heading: "Why there is always something to watch",
      body: [
        "It can be hard to believe how relentless the pressure is until you see the numbers. Research consistently shows that any system exposed to the internet is probed and attacked within minutes of appearing, by automated scanners constantly sweeping the whole internet for anything vulnerable. There is no quiet internet; there is a permanent background storm of opportunistic attack probing everything, everywhere, all the time.",
        "This is why continuous monitoring exists and why a SOC analyst always has something to watch. It also reinforces the whole course's message: because attacks are constant and largely automated, the basics (hardening, patching, MFA) and good monitoring are not optional niceties, they are what stand between an organisation and a storm that never stops. The research you are about to see makes the relentlessness vivid, and the analyst's watchful role essential.",
      ],
      examples: [
        "Internet-exposed systems are probed and attacked within minutes.",
        "Automated scanners sweep the whole internet constantly for anything weak.",
        "There is no quiet internet, which is why monitoring never stops.",
      ],
      analogy: {
        plain: "Leaving a light on in a window at night draws insects within moments. Exposing anything to the internet draws automated probes just as fast, and just as endlessly.",
        realTerm: "constant automated attack",
      },
    },
  ],

  glossary: [
    { term: "triage", definition: "The core SOC craft: gathering context on each alert, judging whether it is real, handling or escalating it, and documenting it." },
    { term: "handover", definition: "Passing the state of ongoing work and incidents between shifts so monitoring is continuous and nothing is dropped." },
    { term: "honeypot", definition: "A deliberately exposed, monitored system used to observe attacks; research with them shows how fast the internet is probed." },
    { term: "evidence-led", definition: "Making triage decisions based on what can actually be seen and confirmed, rather than guesses or panic." },
  ],

  seeHeading: "How fast the internet attacks you",

  cases: [
    {
      org: "Honeypot / exposure research",
      year: "ongoing",
      headline: "Systems exposed to the internet are probed and attacked within minutes",
      whatHappened: "Across many studies and experiments, security researchers deploy honeypots, deliberately exposed, closely-monitored systems, and internet-wide scans to measure how quickly exposed systems are attacked. The consistent, striking finding is that it happens within minutes: automated scanners constantly sweep the entire internet, and anything newly exposed and vulnerable is probed almost immediately, with real attack attempts following fast. There is no grace period and no obscurity; exposure draws automated attack at once.",
      theMissedMeasure: "This research is not a single breach but a constant reality that justifies the whole defensive apparatus: hardening to reduce exposure, patching to close flaws before the storm finds them, and continuous monitoring (the SOC) because something is always probing. It is why 'nobody would bother attacking us' is a dangerous myth.",
      theCost: "The 'cost' is the relentless background pressure every internet-connected organisation lives under, which is precisely why continuous monitoring and good triage matter, and why there is always something for a SOC analyst to watch.",
      control: "firewalls",
      impact: ["exposed systems are probed within minutes", "automated scanners sweep the whole internet constantly", "no grace period: exposure draws attack at once"],
      source: "Public record; widely-published honeypot and internet-scanning research.",
      brandColor: "#0a7d4b",
      news: { headline: "Honeypot research: internet-exposed systems are attacked within minutes", outlet: "Security research (ongoing)", date: "ongoing" },
    },
  ],

  lab: {
    title: "Triage the alert",
    intro: "Nothing to install and nothing leaves this page. You are a Tier 1 analyst; an alert has fired. Make the calm, evidence-led, well-judged calls.",
    prompts: [
      "Gather context before judging, an alert is a question, not a verdict.",
      "Escalate a genuine concern through the proper path; do not ignore or panic.",
      "Document clearly, so others can act and the work is defensible.",
    ],
    component: TriageLab,
  },

  check: {
    explain: {
      prompt: "Describe what good triage looks like, and explain why research showing systems are attacked within minutes of exposure makes continuous monitoring and the SOC analyst's role so essential.",
      modelAnswer: "Good triage is calm: an alert is a question, not an emergency, so you gather context before judging. It is evidence-led: you decide on what you can actually see and confirm, not guesses or panic. It knows when to escalate: neither sitting on something serious nor raising every trivial thing, moving genuine concerns promptly through the proper path. And it is documented: clear, factual notes so others can pick up instantly and the work is defensible later. Bad triage panics at noise, dismisses real signals, escalates everything or nothing, and leaves no record. Research showing that internet-exposed systems are probed and attacked within minutes makes continuous monitoring essential because there is no quiet internet: automated scanners constantly sweep everything, so anything exposed draws attack at once, with no grace period or obscurity. That relentless background storm is why a SOC always has something to watch, why the basics (hardening, patching, MFA) are not optional, and why the analyst's calm, evidence-led, well-documented triage, done continuously, is what stands between an organisation and an attack pressure that never stops.",
    },
    quiz: [
      {
        q: "What best describes good triage?",
        options: [
          "Reacting fast and dramatically to everything",
          "Calm, evidence-led judgement that knows when to escalate and is clearly documented",
          "Ignoring alerts to avoid overreacting",
          "Guessing quickly to clear the queue",
        ],
        answer: 1,
        why: "An alert is a question; you gather context, judge on evidence, escalate appropriately, and document, the craft at the heart of the job.",
      },
      {
        q: "What does a realistic SOC analyst's day mostly involve?",
        options: [
          "Constant dramatic real-time battles",
          "Steady, methodical triage and judgement, with occasional bursts of genuine urgency",
          "Writing new software all day",
          "Nothing; it is automated",
        ],
        answer: 1,
        why: "The job is mostly careful, consistent triage, punctuated by the real incidents that make the watching worthwhile.",
      },
      {
        q: "Why does research on internet exposure justify continuous monitoring?",
        options: [
          "Because attacks are rare and slow",
          "Because exposed systems are attacked within minutes by constant automated scanning, there is no quiet internet",
          "Because only big companies are targeted",
          "Because monitoring is legally required to look busy",
        ],
        answer: 1,
        why: "The permanent background storm of automated probing means something is always attacking, so monitoring, and the SOC, never stop.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 13: you can picture the SOC job clearly, and you know the craft of good triage at its heart.",
    takeaways: [
      "A SOC day is steady, methodical triage and judgement, with bursts of real urgency, not constant drama.",
      "Good triage is calm, evidence-led, knows when to escalate, and is well documented; bad triage is the opposite.",
      "The internet attacks anything exposed within minutes, so monitoring never stops and the basics are never optional.",
    ],
    project: {
      name: "Write your triage principles",
      blurb: "Write your own four-point definition of good triage (calm, evidence-led, escalate well, document), in your own words, with a line on why each matters. This is a genuine reflection of the core SOC craft, and articulating it clearly is exactly what an interviewer wants to hear from a would-be analyst.",
    },
    ethicsNote: "A SOC analyst works within their organisation's systems and authority, handling data and alerts lawfully and with care for privacy. The next module takes you deeper into the analyst's central skill: reading logs and using the SIEM, hands-on.",
  },
};

export default topic5;
