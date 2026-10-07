import type { TopicManifest } from "../../learn/types";
import { TuningLab } from "../../learn/conceptLabs";

/* Module 15 - Topic 5: cutting through the noise (tuning). Case: the
 * widely-documented "alert fatigue" problem, where SOCs receive far more
 * alerts than they can handle and a large share go uninvestigated, so
 * real threats are missed amid false positives. Public record:
 * repeated industry surveys on alert volume and fatigue. */
const topic5: TopicManifest = {
  id: "m15t5",
  weekLabel: "Module 15",
  act: "Act 3 - Defence for real",
  title: "Cutting through the noise",
  role: "Detection is only useful if the real alerts can be seen and trusted. Tuning, reducing false positives so genuine threats stand out, is as important as detection itself, and it is a skill that separates an effective SOC from an overwhelmed one.",
  minutes: 15,
  promise: "Learn why too many alerts is as dangerous as too few, and how tuning restores the signal, then see the alert-fatigue problem that lets real threats slip by.",
  brief: "In this lesson, we'll close the detection module with a counter-intuitive truth: more alerts is not more security. A flood of false positives causes alert fatigue, and real threats get missed amid the noise (the Target lesson, revisited). We'll learn tuning: the disciplined reduction of noise so genuine signals stand out and can be trusted. Then we'll see the well-documented alert-fatigue problem that affects SOCs everywhere.",

  learn: [
    {
      heading: "More alerts is not more security",
      body: [
        "It is tempting to think that the more alerts a SOC generates, the more secure it is. The opposite is often true. When detection rules are too broad, they fire constantly on harmless, expected activity, producing a flood of false positives. Analysts cannot investigate everything, so they start to ignore or rush past alerts, and the one real threat buried in the noise gets missed. A noisy SOC can be less effective than a quieter, well-tuned one.",
        "This is alert fatigue, and it is one of the biggest practical problems in real security operations. You saw its consequence in the Target breach: alerts fired, but amid the noise they were not acted on. The goal of detection is not maximum alerts; it is trusted, actionable alerts, a signal analysts can believe and act on, not a flood they learn to ignore.",
      ],
      examples: [
        "Too-broad rules fire constantly on harmless activity: a flood of false positives.",
        "Analysts can't investigate everything, so they start ignoring alerts, and miss the real one.",
        "A noisy SOC can be less effective than a quieter, well-tuned one (the Target lesson).",
      ],
      analogy: {
        plain: "A car alarm that goes off at every passing lorry gets ignored, so no one reacts when it is a real break-in. Too many false alarms destroy the value of the alarm.",
        realTerm: "alert fatigue",
      },
    },
    {
      heading: "Tuning: reducing noise so signal stands out",
      visual: { id: "alert-funnel" },
      body: [
        "Tuning is the disciplined work of reducing false positives so that real alerts stand out and can be trusted. It means examining detection rules and refining them: a rule that fires hundreds of times a day, almost always on benign activity, is tuned so it only fires on the genuinely suspicious cases. The aim is not to delete detections (that would make you blind) but to sharpen them, improving the signal-to-noise ratio.",
        "Tuning is evidence-based. You judge each rule by its track record: is it catching real threats, or almost always a false positive? You keep and sharpen what catches real things, and reduce what reliably wastes time, without going blind. And because environments change, tuning is ongoing, not a one-off. It is unglamorous, continuous work, and it is precisely what keeps a detection programme effective rather than drowning.",
      ],
      examples: [
        "Refine a noisy rule so it fires only on genuinely suspicious cases.",
        "Keep and sharpen what catches real threats; reduce what reliably wastes time.",
        "It is ongoing, because environments and threats change.",
      ],
    },
    {
      heading: "The goal: a trusted, actionable signal",
      body: [
        "The real aim of all this is a stream of alerts that analysts can trust and act on. An alert that is almost always real gets investigated promptly and taken seriously; an alert that is almost always false gets ignored, however important the one real instance. Signal-to-noise is therefore not a technical nicety, it directly determines whether real threats are caught, because a missed alert (lost in noise) has the same consequence as no alert at all.",
        "This reframes detection as a balance, not a maximisation. Too few or too narrow detections, and real attacks slip by unflagged; too many false positives, and they are missed in the flood. The skilled analyst and the mature SOC aim for the right alerts, the genuine signals, clearly visible and trusted, not the most alerts. Getting this balance right is what turns all the detection capability in this module into actual defence.",
      ],
      examples: [
        "A trusted alert gets acted on; an untrusted one gets ignored, even when real.",
        "Signal-to-noise directly determines whether real threats are caught.",
        "Aim for the right alerts, not the most: detection is a balance, not a maximisation.",
      ],
      analogy: {
        plain: "A good smoke detector is tuned to ignore steam from the shower but catch real smoke. Too sensitive and you disable it; too dull and it misses the fire. The right sensitivity is everything.",
        realTerm: "signal-to-noise",
      },
    },
  ],

  glossary: [
    { term: "false positive", definition: "A benign activity wrongly flagged as malicious; too many cause alert fatigue and hide real threats." },
    { term: "alert fatigue", definition: "When a flood of (often false) alerts dulls attention, so analysts miss the real ones, a major real-world SOC problem." },
    { term: "tuning", definition: "Refining detection rules to reduce false positives so genuine alerts stand out and can be trusted, without going blind." },
    { term: "signal-to-noise", definition: "The ratio of genuine, actionable alerts to false ones; improving it is the goal of tuning and determines whether threats are caught." },
  ],

  seeHeading: "When the noise hides the real threat",

  cases: [
    {
      org: "Alert fatigue (industry-wide)",
      year: "ongoing",
      headline: "SOCs receive far more alerts than they can handle, so real threats slip by",
      whatHappened: "Repeated industry surveys and incident analyses document a persistent, serious problem: Security Operations Centres receive far more alerts than analysts can possibly investigate, and a large share go uninvestigated. Overwhelmed by false positives, teams suffer alert fatigue, and genuine threats are missed in the noise, exactly what happened in the Target breach, where real alerts fired but were lost amid the volume. It is consistently cited as one of the biggest practical obstacles to effective detection.",
      theMissedMeasure: "Tuning and good signal-to-noise. The answer is not more alerts or more analysts alone, but reducing false positives so the real alerts stand out and can be trusted and acted on. It is why tuning is considered as important as detection itself.",
      theCost: "The ongoing cost is missed real threats, dwell time extended, breaches that could have been caught, because the signal was buried. It is a powerful, industry-wide argument that detection without tuning is detection wasted.",
      control: "secure-configuration",
      impact: ["SOCs get far more alerts than they can investigate", "false positives cause fatigue; real threats are missed", "tuning for signal-to-noise is the answer"],
      source: "Public record; repeated industry surveys on alert volume and alert fatigue.",
      brandColor: "#e67e22",
      news: { headline: "Alert fatigue: why SOCs miss real threats in a flood of alerts", outlet: "Industry surveys and reporting (ongoing)", date: "ongoing" },
    },
  ],

  lab: {
    title: "Tune the detection",
    intro: "Nothing to install and nothing leaves this page. Your SOC is drowning in alerts. Make the tuning decisions that cut noise without going blind.",
    prompts: [
      "A rule that is almost always wrong trains analysts to ignore it: tune it.",
      "Keep and sharpen what catches real threats; reduce what reliably wastes time.",
      "The goal is signal, not silence, and not a flood: the right alerts, trusted and acted on.",
    ],
    component: TuningLab,
  },

  check: {
    explain: {
      prompt: "Explain why 'more alerts is not more security', what tuning is, and why signal-to-noise determines whether real threats are actually caught.",
      modelAnswer: "More alerts is not more security because when detection rules are too broad, they fire constantly on harmless, expected activity, producing a flood of false positives. Analysts cannot investigate everything, so they start to ignore or rush past alerts, and the one real threat buried in the noise gets missed, which is alert fatigue, and exactly what happened in the Target breach where alerts fired but were lost in the volume. Tuning is the disciplined, evidence-based work of refining detection rules to reduce false positives so genuine alerts stand out and can be trusted: you judge each rule by its track record, keeping and sharpening what catches real threats and reducing what reliably wastes time, without deleting detections and going blind, and because environments change, it is ongoing. Signal-to-noise determines whether real threats are caught because an alert that is almost always real gets investigated and taken seriously, while one that is almost always false gets ignored even when it matters, and a missed alert lost in noise has the same consequence as no alert at all. So detection is a balance, not a maximisation: the aim is the right alerts, the genuine signals clearly visible and trusted, which is what turns detection capability into actual defence.",
    },
    quiz: [
      {
        q: "Why is 'more alerts' not the same as 'more security'?",
        options: [
          "It is the same thing",
          "A flood of false positives causes alert fatigue, so real threats get missed in the noise",
          "Alerts are always accurate",
          "Because alerts slow down computers",
        ],
        answer: 1,
        why: "Too many false alarms train analysts to ignore alerts, so the real one is missed, exactly the Target lesson.",
      },
      {
        q: "What is tuning?",
        options: [
          "Deleting all detection rules for quiet",
          "Refining rules to reduce false positives so real alerts stand out and can be trusted, without going blind",
          "Generating as many alerts as possible",
          "Turning off monitoring at night",
        ],
        answer: 1,
        why: "Tuning sharpens detections to improve signal-to-noise, keeping what catches real threats and reducing what wastes time.",
      },
      {
        q: "Why does signal-to-noise determine whether threats are caught?",
        options: [
          "It does not matter",
          "A trusted alert gets acted on; one lost in noise is ignored, and a missed alert has the same consequence as no alert",
          "Because noisy SOCs are always best",
          "Because signal-to-noise is only about speed",
        ],
        answer: 1,
        why: "Analysts act on alerts they can trust. If real alerts are buried in false ones, they are effectively absent.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 15: you can detect threats, and, just as important, cut the noise so the real ones are seen.",
    takeaways: [
      "More alerts is not more security: false positives cause fatigue and hide real threats.",
      "Tuning reduces noise so genuine alerts stand out and can be trusted, without going blind, and it is ongoing.",
      "Detection is a balance: aim for the right, trusted, actionable alerts, not the most.",
    ],
    project: {
      name: "Design a tuning principle",
      blurb: "Write, in your own words, how you would decide whether to keep, tune, or retire a detection rule, judging by whether it catches real threats or mostly fires falsely. Articulating this balance shows you understand that detection is about trusted signal, not volume, which is exactly the maturity a detection role looks for.",
    },
    ethicsNote: "Tuning and detection are defensive operations on your own organisation's systems. This is constructive work to make real threats visible, conducted within the authorisation principles from Module 5. Next, Module 16 turns to responding when a real incident is confirmed.",
  },
};

export default topic5;
