import type { TopicManifest } from "../../learn/types";
import { CorrelateLab } from "../../learn/conceptLabs";

/* Module 14 - Topic 4: correlating events into a story. Case: the
 * general, decisive practice of correlation in investigations, where
 * connecting separate log entries across sources reveals an attack that
 * no single log showed. Public record: established SOC/SIEM practice. */
const topic4: TopicManifest = {
  id: "m14t4",
  weekLabel: "Module 14",
  act: "Act 3 - Defence for real",
  title: "Correlating into a story",
  role: "A single log entry rarely tells you much; the picture emerges when you connect entries across different logs into a sequence. Correlation, turning scattered events into a clear attack story, is where log analysis becomes real understanding.",
  minutes: 15,
  promise: "Learn to connect scattered log entries across different sources into one clear attack story, where investigation becomes understanding.",
  brief: "In this lesson, we'll learn correlation: connecting separate log entries, often from different logs, into a single coherent story. One entry alone is just a fact; linked by time and logic to others, they reveal what actually happened. We'll see how correlation exposes an attack that no single log showed on its own, and how it is the step that turns searching into understanding, and raw logs into the timeline you can act on.",

  learn: [
    {
      heading: "One entry is a fact; the story is in the connections",
      body: [
        "A single log entry on its own rarely means much. A failed login, a connection, a command, each is just an isolated fact, and in a busy system, perfectly ordinary ones happen constantly. The meaning emerges when you connect entries: a port scan, then failed logins from the same address, then a success, then unusual commands, then data leaving. Suddenly a list of unremarkable facts becomes an unmistakable attack. That connecting is correlation.",
        "This is why correlation is the heart of real investigation. You are not just finding individual events; you are linking them, usually by shared attributes like a time sequence, a common IP address, or the same account, into a story. The SIEM helps by letting you pivot and filter, but the reasoning, seeing that these separate entries are one connected event, is the analyst's core craft, and it is exactly what the last topics have been building toward.",
      ],
      examples: [
        "A failed login alone is ordinary; a scan, then failures, then a success, then data leaving is an attack.",
        "Correlation links entries by time, shared IP, or the same account.",
        "The reasoning, seeing separate entries as one event, is the analyst's core craft.",
      ],
      analogy: {
        plain: "One footprint tells you little; a trail of them, connected, shows exactly where the intruder went. Correlation is following the trail, not staring at one print.",
        realTerm: "correlation",
      },
    },
    {
      heading: "The whole emerges across different logs",
      body: [
        "The most powerful correlation often spans different logs, which is exactly why a SIEM gathers them all in one place. The firewall log shows a scan; the authentication log shows the failed and then successful logins; the system log shows what the account then did; the DNS and firewall logs show it contacting an external server. No single one of these tells the whole story, but connected across sources, they reveal the complete attack, from reconnaissance to data leaving.",
        "This is the real value of aggregation (Module 13): with all the logs searchable together, you can follow an attacker across the different footprints they leave in different systems. An attack that would be invisible, or merely puzzling, in any one log becomes clear when you correlate across them. Learning to think across log sources, 'the firewall shows this, so what does the auth log show at the same moment?', is what turns scattered evidence into a complete picture.",
      ],
      examples: [
        "Firewall (scan) + auth (login attempts, success) + system (actions) + DNS (contact out).",
        "No single log tells the whole story; correlated across sources, they reveal the full attack.",
        "Aggregation lets you follow the attacker across different systems' footprints.",
      ],
    },
    {
      heading: "Correlation builds the timeline",
      visual: { id: "timeline-builder" },
      body: [
        "When you correlate events into a story, what you are really producing is a timeline, the chronological reconstruction of the attack you met in Module 16, built here from the logs. Each correlated event becomes a step: when the attacker arrived, what they tried, when they got in, what they did, when it was detected. The timeline is the output of good correlation, and it is what lets you understand the scope, eradicate the threat, and write the finding.",
        "So the module comes together: logs are the evidence, searching finds the relevant entries, and correlation connects them into the timeline, the story of what happened. This is real understanding, not just a pile of hits. In the lab you glimpsed this; now you can see the full method. The final step, which the next topic covers, is to write that understanding up clearly, turning your correlated timeline into a finding others can act on.",
      ],
      examples: [
        "Correlated events form a timeline: arrival, attempts, entry, actions, detection.",
        "The timeline lets you understand scope, eradicate the threat, and write the finding.",
        "Logs (evidence) → search (find) → correlation (connect) → timeline (understanding).",
      ],
      analogy: {
        plain: "Correlation assembles scattered clues into the sequence of a crime, which is exactly the timeline a detective presents: this, then this, then this. The story, in order.",
        realTerm: "building the timeline",
      },
    },
  ],

  glossary: [
    { term: "correlation", definition: "Connecting separate log entries, often across different logs, into a single coherent story by shared time, address or account." },
    { term: "pivot", definition: "Following a shared attribute (an IP, a user) from one log entry to related entries, to build the connected picture." },
    { term: "timeline", definition: "The chronological reconstruction of an attack (Module 16), built here by correlating log events into a sequence." },
    { term: "cross-source analysis", definition: "Connecting entries across different log sources (firewall, auth, system, DNS) to reveal an attack no single log shows." },
  ],

  seeHeading: "The attack no single log showed",

  cases: [
    {
      org: "Correlation in investigation",
      year: "current",
      headline: "Connecting entries across logs reveals attacks that no single log shows",
      whatHappened: "A defining reality of real investigations is that attacks are rarely visible in any single log; they emerge only when an analyst correlates entries across different sources. A scan in the firewall log, failed-then-successful logins in the authentication log, unusual actions in the system log, and a connection to an unknown external server in the DNS and firewall logs are each unremarkable alone, but connected by a shared address, account and time sequence, they reveal a complete attack from reconnaissance to data leaving. This is exactly why SIEMs aggregate logs together, and why correlation, turning scattered entries into a timeline, is considered the heart of investigation.",
      theMissedMeasure: "The capability to correlate across sources (good logging in one searchable place, and the analyst skill to connect it). Without correlation, the evidence of an attack sits scattered and invisible across separate logs; with it, the full story becomes clear.",
      theCost: "Here the value is understanding: correlation is what turns a pile of individually-innocent log entries into a clear, actionable attack story, enabling proper response, and it is the skill that distinguishes a real investigator.",
      control: "secure-configuration",
      impact: ["attacks are rarely visible in any single log", "correlation across sources reveals the full story", "the output is a timeline you can act on"],
      source: "Public record; established SOC/SIEM investigation practice.",
      brandColor: "#5b8def",
      news: { headline: "Why correlation across logs is the heart of investigation", outlet: "SOC/SIEM practice (current)", date: "current" },
    },
  ],

  lab: {
    title: "Correlate the story",
    intro: "Nothing to install and nothing leaves this page. From these log events across different logs, put the attack in the order it happened.",
    prompts: [
      "Each entry is from a different log; connect them by the shared address, account and time.",
      "Look for the lifecycle: scan, login attempts, success, action, contact out.",
      "The result is a timeline: the attack's story, in order.",
    ],
    component: CorrelateLab,
  },

  check: {
    explain: {
      prompt: "Explain why a single log entry rarely means much, how correlation across different logs reveals an attack, and how correlation produces a timeline.",
      modelAnswer: "A single log entry rarely means much because each one, a failed login, a connection, a command, is just an isolated fact, and in a busy system perfectly ordinary ones happen constantly, so meaning emerges only when you connect entries. Correlation across different logs reveals an attack because the most powerful picture often spans sources that a SIEM gathers together: the firewall log shows a scan, the authentication log shows failed then successful logins, the system log shows what the account then did, and the DNS and firewall logs show it contacting an external server, none of which tells the whole story alone, but connected by a shared address, account and time sequence, they reveal the complete attack from reconnaissance to data leaving, an attack that would be invisible or merely puzzling in any one log. Correlation produces a timeline because when you connect events into a story you are really building the chronological reconstruction of the attack (Module 16) from the logs: each correlated event becomes a step, when the attacker arrived, what they tried, when they got in, what they did, when it was detected, and that timeline is the output of good correlation, letting you understand the scope, eradicate the threat and write the finding. So the module comes together: logs are the evidence, searching finds the relevant entries, and correlation connects them into the timeline, which is real understanding, not just a pile of hits.",
    },
    quiz: [
      {
        q: "Why does a single log entry rarely tell you much?",
        options: [
          "Logs are always wrong",
          "Each entry is an isolated fact; meaning emerges when you connect entries into a story",
          "Single entries are secret",
          "One entry tells you everything",
        ],
        answer: 1,
        why: "Ordinary facts happen constantly; the attack appears only when you correlate related entries.",
      },
      {
        q: "Why is correlation across different logs so powerful?",
        options: [
          "It is not; use one log only",
          "No single log shows the whole attack, but connected across sources (firewall, auth, system, DNS) the full story appears",
          "Different logs never relate",
          "It deletes irrelevant logs",
        ],
        answer: 1,
        why: "An attacker leaves footprints in different systems; correlating across them (why SIEMs aggregate) reveals the complete picture.",
      },
      {
        q: "What does correlation ultimately produce?",
        options: [
          "A random list of logs",
          "A timeline: the attack reconstructed in order, which you can act on",
          "Just more alerts",
          "Nothing useful",
        ],
        answer: 1,
        why: "Correlated events form the timeline (Module 16), the understanding that enables scoping, eradication and the finding.",
      },
    ],
  },

  wrap: {
    headline: "You can now connect scattered log entries into a clear attack story, where investigation becomes understanding.",
    takeaways: [
      "A single log entry is just a fact; the attack appears when you correlate entries into a story.",
      "The whole picture often spans different logs, which is why a SIEM aggregates them to connect across sources.",
      "Correlation produces a timeline, the chronological story you can act on, the output of real investigation.",
    ],
    project: {
      name: "Correlate a mini-attack",
      blurb: "Write five short log entries (across different logs, firewall, auth, system, DNS) that together tell one attack story, then order them into the timeline. Practising correlation, connecting scattered entries into a sequence, is the skill that turns log searching into genuine understanding.",
    },
    ethicsNote: "Correlation and investigation are performed on your own organisation's logs, lawfully and with care for personal data. It is purposeful, authorised analysis within the Module 5 principles.",
  },
};

export default topic4;
