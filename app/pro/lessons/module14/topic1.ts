import type { TopicManifest } from "../../learn/types";
import { LogSourceLab } from "../../learn/conceptLabs";

/* Module 14 - Topic 1: logs as evidence. Case: the real attack traffic
 * captured by honeypots (the Mirai/Cowrie-style data used in this
 * module's SIEM lab) as the raw evidence of what actually hits an
 * exposed system. Public record: published honeypot/Mirai research and
 * the Dyn incident report. */
const topic1: TopicManifest = {
  id: "m14t1",
  weekLabel: "Module 14",
  act: "Act 3 - Defence for real",
  title: "Logs as evidence",
  role: "Logs are the raw evidence of everything that happens on a system, and reading them is the single most practised skill of a SOC analyst. Understanding what logs are, what they record, and why they matter is the foundation of every investigation.",
  minutes: 15,
  promise: "Learn what logs really are and why they are the evidence every investigation rests on, then meet the real attack traffic you are about to investigate.",
  brief: "In this lesson, we'll look at logs: the records systems keep of what happens on them, and the raw evidence every investigation depends on. We'll see what different logs record, why 'you cannot investigate what was never logged' is a hard truth, and how to know which log to look in. Then we'll meet the real captured attack traffic you will investigate hands-on in the next topic, using a SIEM, just like an analyst.",

  learn: [
    {
      heading: "Logs: the footprints of everything",
      body: [
        "A log is simply a record a system keeps of things that happen: a login, a file opened, a connection made, a request served. Every meaningful action leaves a log entry, a footprint, and together these footprints are the evidence of what occurred. When you investigate anything, a breach, an error, suspicious activity, you are reading logs to reconstruct what happened. They are the raw material of all detection and investigation.",
        "This is why logging matters so much, and why hardening (Module 12) includes turning logging on. A hard truth follows: you cannot investigate what was never logged. If an action left no record, you have no evidence of it, which is exactly why attackers sometimes try to delete or disable logs. Good logging, kept safely, is what makes an organisation able to see and reconstruct what happened. No logs, no investigation.",
      ],
      examples: [
        "Every meaningful action, a login, a connection, a request, leaves a log entry.",
        "Investigating anything means reading logs to reconstruct what happened.",
        "You cannot investigate what was never logged: logging is a prerequisite.",
      ],
      analogy: {
        plain: "Logs are the CCTV footage and entry records of a building. If an incident happens, you review them to see what occurred. No footage, no way to know.",
        realTerm: "logs",
      },
    },
    {
      heading: "Different logs record different things",
      body: [
        "A key practical skill is knowing which log to look in, because different systems keep different logs. Authentication logs record who logged in, when, and whether it succeeded, the first place to look for account attacks. Web server logs record every request and its result (the status codes from Module 2). Firewall logs record which connections were allowed or blocked. DNS logs record which names were looked up (great for catching malware phoning home). Each answers different questions.",
        "An effective investigator reaches for the right log for the question at hand: 'who tried to log in?' goes to the auth log; 'what did they request?' to the web log; 'what did the infected machine contact?' to DNS and firewall logs. Knowing the map of what each log holds turns a vague 'check the logs' into targeted, efficient investigation. You do not memorise every format; you learn which log answers which question.",
      ],
      examples: [
        "Auth logs: logins. Web logs: requests. Firewall logs: connections. DNS logs: lookups.",
        "Reach for the right log for the question: 'who logged in?' → auth log.",
        "Knowing which log holds what turns 'check the logs' into targeted investigation.",
      ],
    },
    {
      heading: "What real attack evidence looks like",
      body: [
        "To make this real, this module uses genuine captured attack traffic, the kind a honeypot (a deliberately-exposed, monitored system) records when the internet attacks it, which, as you saw in Module 13, happens within minutes. This data is the raw evidence of real automated attacks: login attempts with common default credentials, probes, and the signatures of well-known threats like the Mirai botnet. It is exactly the sort of evidence a SOC analyst sifts through.",
        "In the next topic you will investigate this real capture yourself, in a SIEM, searching and filtering it the way an analyst does. For now, the point is that behind every investigation is this kind of concrete evidence: logs recording what actually happened, waiting to be read. Learning to read them, to turn raw footprints into understanding, is the core hands-on skill of the SOC, and it is what the rest of this module builds.",
      ],
      examples: [
        "Honeypots capture real attack traffic: default-credential logins, probes, malware signatures.",
        "This is exactly the kind of evidence a SOC analyst sifts through.",
        "Reading logs, turning footprints into understanding, is the core hands-on SOC skill.",
      ],
      analogy: {
        plain: "A honeypot is a camera left running on a bait house: it captures exactly how burglars case and try the doors, giving you real footage to study safely.",
        realTerm: "honeypot evidence",
      },
    },
  ],

  glossary: [
    { term: "log", definition: "A record a system keeps of events that happen on it (logins, connections, requests): the raw evidence for investigation." },
    { term: "log source", definition: "A particular kind of log (authentication, web, firewall, DNS), each recording different activity and answering different questions." },
    { term: "honeypot", definition: "A deliberately-exposed, monitored system used to capture real attack traffic safely, for study and research." },
    { term: "log retention", definition: "Keeping logs long enough (and safely enough) to investigate incidents; you cannot investigate what was never logged or was deleted." },
  ],

  seeHeading: "The real attacks you'll investigate",

  cases: [
    {
      org: "Honeypot attack capture (Mirai-era)",
      year: "2016 onwards",
      headline: "Real captured attack traffic shows exactly what hits an exposed system",
      whatHappened: "Honeypots, deliberately-exposed, closely-monitored systems, capture the real, relentless attack traffic the internet throws at anything it can reach. The captures used in this module reflect the kind of activity seen in the Mirai era and since: automated login attempts using lists of common default credentials, probes for exposed services, and the recognisable signatures of well-known threats like the Mirai botnet (which, by exploiting default passwords on devices, powered the 2016 attack that disrupted major sites via the DNS provider Dyn). This captured traffic is the raw evidence, the logs, that an analyst investigates to understand what is happening.",
      theMissedMeasure: "For the attacked devices, the missed measure was basic (changing default passwords, Module 12). For this module, the value is the evidence itself: real logs of real attacks, which you will investigate hands-on, and which show why good logging is the foundation of detection.",
      theCost: "The Mirai-era attacks caused major disruption, but here the captured traffic is a learning asset: concrete evidence of real attacks that lets you practise the core SOC skill of reading logs, safely and realistically.",
      control: "access-control",
      impact: ["honeypots capture real, constant attack traffic", "default-credential logins, probes, Mirai-style signatures", "the raw log evidence an analyst investigates"],
      source: "Public record; published honeypot/Mirai research and the Dyn incident report (2016).",
      brandColor: "#0a7d4b",
      news: { headline: "What real honeypot captures reveal about internet attacks", outlet: "Honeypot/Mirai research (2016 onwards)", date: "2016 onwards" },
    },
  ],

  lab: {
    title: "Which log answers it?",
    intro: "Nothing to install and nothing leaves this page. Tap each question, then tap the log that would answer it.",
    prompts: [
      "Auth log (logins), web log (requests), firewall log (connections), DNS log (lookups).",
      "Reach for the right log for the question at hand.",
      "This map is what turns 'check the logs' into targeted investigation.",
    ],
    component: LogSourceLab,
  },

  check: {
    explain: {
      prompt: "Explain what logs are and why they are the foundation of investigation, why 'you cannot investigate what was never logged', and how knowing different log sources helps.",
      modelAnswer: "Logs are the records a system keeps of things that happen on it, a login, a file opened, a connection made, a request served, so every meaningful action leaves a log entry, a footprint, and together these are the evidence of what occurred; investigating anything means reading logs to reconstruct what happened, which makes them the raw material of all detection and investigation. 'You cannot investigate what was never logged' is a hard truth because if an action left no record, you have no evidence of it, which is exactly why hardening includes turning logging on, why logs must be kept safely, and why attackers sometimes try to delete or disable them: no logs, no investigation. Knowing different log sources helps because different systems keep different logs that answer different questions, authentication logs record who logged in and whether it succeeded (the first place to look for account attacks), web server logs record requests and their results, firewall logs record allowed and blocked connections, and DNS logs record name lookups (great for catching malware phoning home), so an effective investigator reaches for the right log for the question at hand, turning a vague 'check the logs' into targeted, efficient investigation.",
    },
    quiz: [
      {
        q: "Why are logs described as the foundation of investigation?",
        options: [
          "They make systems faster",
          "They are the recorded evidence of what happened, which you read to reconstruct events",
          "They replace the need for any security",
          "They are only for billing",
        ],
        answer: 1,
        why: "Every action leaves a log footprint; investigating means reading those footprints to understand what occurred.",
      },
      {
        q: "What does 'you cannot investigate what was never logged' mean?",
        options: [
          "Logs are optional",
          "If an action left no record, you have no evidence of it, so logging is a prerequisite for investigation",
          "Investigations never need logs",
          "Attackers always leave logs",
        ],
        answer: 1,
        why: "No record means no evidence, which is why logging must be on and kept safely, and why attackers try to delete logs.",
      },
      {
        q: "Where would you look to answer 'who tried to log in, and did it succeed?'",
        options: [
          "The DNS log",
          "The authentication (login) log",
          "The web server log",
          "The marketing report",
        ],
        answer: 1,
        why: "Authentication logs record sign-in attempts and their success, the first place to look for account attacks.",
      },
    ],
  },

  wrap: {
    headline: "You now understand logs as the evidence every investigation rests on, and know which log answers which question.",
    takeaways: [
      "Logs record what happens on a system; they are the raw evidence of every investigation.",
      "You cannot investigate what was never logged, so logging must be on and kept safely.",
      "Different logs (auth, web, firewall, DNS) answer different questions; reach for the right one.",
    ],
    project: {
      name: "Find a log on your own machine",
      blurb: "On your own computer, find a log you can view (your browser's history, or your operating system's event/console log). Notice what it records about your own activity. Seeing that your own actions leave a trail makes the idea of logs-as-evidence concrete, and it is the first step to reading them like an analyst.",
    },
    ethicsNote: "Logs often contain personal data, so they are handled lawfully and with care for privacy, and only within your own organisation's authority. You investigate your own or authorised systems' logs, within the Module 5 principles.",
  },
};

export default topic1;
