import type { TopicManifest } from "../../learn/types";
import { SecToolLab } from "../../learn/conceptLabs";

/* Module 13 - Topic 4: the tools at a glance (SIEM and EDR). Case:
 * FireEye's 2020 discovery of its own breach (SolarWinds campaign) via
 * its security tooling spotting an anomaly, seen here from the "what
 * the tools do" angle. Public record: FireEye/Mandiant disclosures and
 * December 2020 reporting. */
const topic4: TopicManifest = {
  id: "m13t4",
  weekLabel: "Module 13",
  act: "Act 3 - Defence for real",
  title: "The tools: SIEM & EDR",
  role: "Analysts work with a handful of core tools every day, above all the SIEM (the central log console) and EDR (endpoint detection). Knowing what each does, and does not, is day-one SOC knowledge and a staple of interviews.",
  minutes: 15,
  promise: "Get a clear picture of the two tools analysts live in, then see security tooling catch one of the biggest breaches ever by noticing one anomaly.",
  brief: "In this lesson, we'll demystify the core SOC tools. The SIEM collects logs from across the organisation and lets analysts search and correlate them at scale, it is the central console. EDR watches individual computers for malicious behaviour and can respond on them. We'll see what each is for, and how they complement each other. Then we'll see how security tooling noticing a single anomaly uncovered the vast SolarWinds campaign.",

  learn: [
    {
      heading: "The SIEM: the analyst's central console",
      body: [
        "A SIEM, Security Information and Event Management, is the tool that collects logs and events from across the whole organisation, servers, devices, applications, network gear, into one place, and lets analysts search them at scale and correlate them into alerts. You met a small SIEM in action in the SIEM module; here, place it in context: it is the central console where a SOC analyst spends much of their day, searching millions of log lines to investigate what happened.",
        "The SIEM's superpowers are aggregation and correlation. Aggregation means all the logs are in one searchable place, instead of scattered across hundreds of systems. Correlation means it can connect related events, failed logins here, then a success there, then data leaving, into a single meaningful alert that tells a story. This is what turns a flood of raw events into something an analyst can actually investigate.",
      ],
      examples: [
        "A SIEM gathers logs from everywhere into one searchable place.",
        "It correlates related events into meaningful alerts that tell a story.",
        "It is the central console where analysts investigate (you used one already).",
      ],
      analogy: {
        plain: "A SIEM is the security control room with every camera feed on one wall, searchable, and smart enough to flag when several feeds together show something suspicious.",
        realTerm: "SIEM",
      },
    },
    {
      heading: "EDR: eyes and hands on the endpoint",
      body: [
        "EDR, Endpoint Detection and Response, focuses on individual computers (endpoints): laptops, servers, workstations. It watches what is happening on each device, the processes running, files changing, connections made, looking for malicious behaviour, and crucially it can respond on the device itself, for example isolating an infected laptop from the network with a click. It is both a detector and a responder, right where the action often is.",
        "EDR matters because much modern attack activity happens on endpoints, and because behaviour-based detection (Module 8) works best with a close view of what a device is actually doing. Where the SIEM gives the broad, organisation-wide picture, EDR gives the deep, close-up view of each machine, and the ability to act on it fast. Together they are complementary: breadth and depth.",
      ],
      examples: [
        "EDR watches each device's processes, files and connections for bad behaviour.",
        "It can respond on the device, e.g. isolating an infected laptop instantly.",
        "SIEM gives breadth (whole org); EDR gives depth (each machine).",
      ],
    },
    {
      heading: "Tools surface the signal; humans make the call",
      body: [
        "A vital perspective: tools do not replace analysts, they empower them. A SIEM and EDR surface the signals, the correlated alerts, the suspicious behaviours, but it still takes a human to investigate, judge, and decide. The best tools in the world still need someone to act on what they reveal (the Target lesson). Conversely, a skilled analyst with good tools can catch things that would otherwise be invisible.",
        "This is genuinely encouraging for a beginner: you do not need to be a tool-building expert to be valuable; you need to understand what the tools show you and make good judgements about it. The case ahead is a striking example of this partnership: security tooling flagged a single anomaly (a device enrolling in a way that looked slightly off), and skilled humans, following that thread, uncovered one of the largest espionage campaigns ever. Tool plus analyst, together.",
      ],
      examples: [
        "Tools surface signals; humans investigate, judge and decide.",
        "You do not need to build tools, you need to understand and act on them.",
        "Tool plus skilled analyst catches what neither could alone.",
      ],
      analogy: {
        plain: "A metal detector finds the signal, but a person still has to dig, examine, and decide what they have found. The tool and the human each do their part.",
        realTerm: "tools empower analysts",
      },
    },
  ],

  glossary: [
    { term: "SIEM", definition: "Security Information and Event Management: a tool that aggregates logs from across an organisation and lets analysts search and correlate them at scale." },
    { term: "correlation", definition: "Connecting related events into a single meaningful alert that tells a story, a core SIEM capability." },
    { term: "EDR", definition: "Endpoint Detection and Response: watches individual computers for malicious behaviour and can respond on them (e.g. isolate a device)." },
    { term: "endpoint", definition: "An individual computing device, laptop, server or workstation, where much attack activity happens and EDR focuses." },
  ],

  seeHeading: "When tooling caught a giant breach from one anomaly",

  cases: [
    {
      org: "FireEye / SolarWinds (the tooling view)",
      year: "2020",
      headline: "Security tooling noticing a single anomaly uncovered a vast espionage campaign",
      whatHappened: "In December 2020, the security firm FireEye discovered it had been breached (part of the SolarWinds campaign you met in Module 6). A key thread was that its security tooling flagged an anomaly, reportedly a device being enrolled for access in a way that looked slightly unusual, which skilled analysts investigated rather than dismissed. Following that thread led to uncovering a highly sophisticated, nation-state supply-chain campaign affecting many organisations. It is a vivid example of tools surfacing a small signal and humans turning it into a major discovery.",
      theMissedMeasure: "Here the measure worked: detection tooling surfaced an anomaly, and the human process investigated rather than ignored it (the opposite of Target). It shows the SIEM/EDR-plus-analyst partnership at its best: tools catch the faint signal, skilled people pull the thread.",
      theCost: "The campaign itself was severe, but the constructive lesson is powerful: good tooling plus attentive analysts can detect even a highly sophisticated adversary from a single small anomaly, which is exactly why understanding and acting on your tools matters so much.",
      control: "secure-configuration",
      impact: ["tooling flagged a small anomaly (unusual device enrolment)", "analysts investigated rather than dismissed it", "the thread uncovered a vast espionage campaign"],
      source: "Public record; FireEye/Mandiant disclosures and December 2020 reporting.",
      brandColor: "#e01e5a",
      news: { headline: "How a single anomaly led FireEye to uncover the SolarWinds campaign", outlet: "Mainstream and security reporting (2020)", date: "December 2020" },
    },
  ],

  lab: {
    title: "Match the tool",
    intro: "Nothing to install and nothing leaves this page. Tap each description, then tap the tool it describes.",
    prompts: [
      "SIEM: aggregates and correlates logs from everywhere (breadth, the central console).",
      "EDR: watches and responds on individual devices (depth).",
      "Firewall: filters traffic at the boundary (prevention, not detection).",
    ],
    component: SecToolLab,
  },

  check: {
    explain: {
      prompt: "Explain what a SIEM and EDR each do and how they complement each other, and why the FireEye discovery shows that tools and analysts work best together.",
      modelAnswer: "A SIEM (Security Information and Event Management) aggregates logs and events from across the whole organisation into one searchable place and correlates related events into meaningful alerts that tell a story; it is the central console where an analyst investigates, searching millions of log lines, giving breadth, the organisation-wide picture. EDR (Endpoint Detection and Response) focuses on individual computers, watching each device's processes, files and connections for malicious behaviour and able to respond on the device itself (for example isolating an infected laptop); it gives depth, the close-up view of each machine. They complement each other as breadth plus depth. The FireEye discovery shows tools and analysts work best together because security tooling surfaced a single small anomaly, an unusual device enrolment, but it took skilled humans investigating that thread, rather than dismissing it, to uncover a vast espionage campaign. Tools surface the signal; humans investigate, judge and act. Neither alone would have caught it, which is also why you do not need to build tools to be valuable, you need to understand what they show and make good judgements about it.",
    },
    quiz: [
      {
        q: "What does a SIEM primarily do?",
        options: [
          "Watches a single laptop",
          "Aggregates logs from across the organisation and correlates them into alerts, the central console",
          "Blocks network traffic at the boundary",
          "Encrypts files",
        ],
        answer: 1,
        why: "The SIEM's superpowers are aggregation (all logs searchable in one place) and correlation (connecting related events into a story).",
      },
      {
        q: "What distinguishes EDR from a SIEM?",
        options: [
          "Nothing; they are identical",
          "EDR watches and can respond on individual devices (depth); the SIEM gives the broad, org-wide picture (breadth)",
          "EDR only filters traffic",
          "EDR is a type of firewall",
        ],
        answer: 1,
        why: "EDR gives the close-up view and response on each endpoint; the SIEM gives breadth across everything. They are complementary.",
      },
      {
        q: "What does the FireEye discovery illustrate about tools and analysts?",
        options: [
          "Tools make analysts unnecessary",
          "Tools surface the signal, but skilled humans investigating and acting on it are what catch even sophisticated attacks",
          "Analysts should ignore tool alerts",
          "Only tools matter, never people",
        ],
        answer: 1,
        why: "Tooling flagged a small anomaly; humans pulled the thread to uncover a huge campaign. Tool plus attentive analyst, together.",
      },
    ],
  },

  wrap: {
    headline: "You now know the two tools analysts live in, and that they empower, not replace, human judgement.",
    takeaways: [
      "A SIEM aggregates and correlates logs org-wide; it is the central console analysts investigate in (breadth).",
      "EDR watches and responds on individual endpoints (depth); together with the SIEM, breadth plus depth.",
      "Tools surface the signal; humans investigate and act, you add value by understanding and judging, not by building tools.",
    ],
    project: {
      name: "Tool for the job",
      blurb: "Write three short incidents and, for each, note which tool would most help (SIEM to search org-wide logs, EDR to inspect and isolate a device, firewall to block traffic). Matching tool to task is exactly the practical fluency a SOC interview probes, and it clarifies what each tool is really for.",
    },
    ethicsNote: "SOC tools are used on your own organisation's systems, under proper authority and with respect for privacy. Understanding them is defensive, operational knowledge within the authorisation principles from Module 5.",
  },
};

export default topic4;
