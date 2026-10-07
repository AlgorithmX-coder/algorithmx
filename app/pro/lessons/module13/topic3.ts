import type { TopicManifest } from "../../learn/types";
import { EventIncidentLab } from "../../learn/conceptLabs";

/* Module 13 - Topic 3: alerts, events and incidents. Case: Garmin,
 * July 2020 (a ransomware attack, reportedly WastedLocker, took down
 * many Garmin services for days, a clear "event escalated to a major
 * incident" example). Public record: Garmin statements and 2020
 * reporting. */
const topic3: TopicManifest = {
  id: "m13t3",
  weekLabel: "Module 13",
  act: "Act 3 - Defence for real",
  title: "Alerts, events & incidents",
  role: "Analysts live in a world of three words that sound similar but mean very different things: events, alerts, and incidents. Using them precisely, and knowing when something crosses from one to the next, is the everyday language and judgement of the job.",
  minutes: 15,
  promise: "Learn to tell routine events from alerts from real incidents, then see a ransomware incident take a household name offline for days.",
  brief: "In this lesson, we'll pin down three words analysts use constantly: an event (routine logged activity), an alert (something a rule flagged as worth a look), and an incident (confirmed malicious or harmful activity). Getting these distinctions right is how you avoid both panic and complacency, and how you communicate clearly. Then we'll see the Garmin outage, a ransomware incident that took services down for days.",

  learn: [
    {
      heading: "Events: the routine hum of activity",
      visual: { id: "alert-funnel" },
      body: [
        "Systems generate an enormous stream of events: records of things happening. A user logs in, a file is saved, a backup completes, a connection is made. The vast majority are completely routine and expected, the normal hum of a working organisation, logged so there is a record, but requiring no action. Events are the raw material of monitoring: there are millions of them, and almost all are benign.",
        "Understanding that most activity is routine is important, because it sets the scale of the problem. An analyst is not reacting to every event, that would be impossible and pointless. Events are collected and recorded (often in a SIEM, the next topic), so that the few that matter can be found among the many that do not. The skill is separating signal from this vast, mostly-innocent noise.",
      ],
      examples: [
        "A successful login in work hours, a completed backup, a normal connection.",
        "Millions of events; almost all routine and benign.",
        "Events are recorded so the few that matter can be found later.",
      ],
      analogy: {
        plain: "Every car passing a motorway camera is an event. Almost all are ordinary journeys; the footage exists so the rare one that matters can be found.",
        realTerm: "event",
      },
    },
    {
      heading: "Alerts: something worth a look",
      body: [
        "An alert is raised when something in the stream of events matches a rule that says 'this is worth a human look'. Five hundred failed logins against one account in a minute; antivirus flagging a suspicious file; a connection to a known-bad address. An alert is not a confirmed problem, it is a question: a flag that this activity is unusual or risky enough to deserve attention. Triage is deciding, for each alert, whether it is a real concern or a false alarm.",
        "The quality of alerts matters enormously. Too many, especially false positives, and analysts drown in noise and miss the real ones (alert fatigue, as in Target). Too few or too narrow, and real attacks slip by unflagged. Tuning alerts so the genuine signals stand out is a whole skill (the detection module), but for now, hold the key idea: an alert is a prompt to investigate, not a verdict.",
      ],
      examples: [
        "A rule fires: many failed logins, a flagged file, a bad-address connection.",
        "An alert is a question (worth a look), not a confirmed problem.",
        "Too many false alerts cause fatigue; too few let attacks slip by.",
      ],
    },
    {
      heading: "Incidents: confirmed harm, respond now",
      body: [
        "An incident is confirmed malicious or harmful activity, something that has actually breached security and needs a response. An alert becomes an incident when investigation confirms it is real: the suspicious login was an account takeover; the flagged file was live malware spreading; ransomware has encrypted systems. Declaring an incident changes everything, it triggers the incident-response process (Module 16), escalation, and often legal and communication obligations.",
        "The progression, event to alert to incident, is the daily rhythm of a SOC, and precise language keeps everyone aligned. Calling a routine event an 'incident' causes needless panic; calling a real incident 'just an alert' causes dangerous delay. The Garmin case you are about to see is unmistakably an incident: a ransomware attack that took a major company's services offline for days, the kind of confirmed, high-impact harm the whole SOC process exists to catch early and respond to.",
      ],
      examples: [
        "An alert becomes an incident when investigation confirms real harm.",
        "Declaring an incident triggers response, escalation, and obligations.",
        "Precise words prevent both needless panic and dangerous delay.",
      ],
      analogy: {
        plain: "An alarm sounding is an alert (go and check); confirming there really is a fire is the incident (evacuate and call the brigade). Different words, very different actions.",
        realTerm: "incident",
      },
    },
  ],

  glossary: [
    { term: "event", definition: "A record of something happening on a system; routine logged activity, almost always benign." },
    { term: "alert", definition: "Something flagged by a rule as worth a human look; a question to triage, not a confirmed problem." },
    { term: "incident", definition: "Confirmed malicious or harmful activity that has breached security and needs a response." },
    { term: "triage", definition: "Deciding, for each alert, whether it is a real concern or a false alarm, and what to do next." },
  ],

  seeHeading: "When an incident took a household name offline",

  cases: [
    {
      org: "Garmin",
      year: "2020",
      headline: "A ransomware incident took a major company's services offline for days",
      whatHappened: "In July 2020, Garmin, the well-known navigation and fitness-technology company, suffered a ransomware attack (widely reported as WastedLocker) that encrypted systems and took many of its services offline, affecting customers around the world for several days. This was unmistakably an incident, not a routine event or an unconfirmed alert, but confirmed, active, high-impact harm, requiring a full response and recovery effort. It is a clear, relatable example of what an incident actually looks like.",
      theMissedMeasure: "Earlier detection and response (and resilience, covered in Module 19) could have reduced the impact. For this topic, the value is as a clear example of an incident: confirmed, harmful, and demanding the response process, in contrast to the routine events and unconfirmed alerts that make up most of an analyst's day.",
      theCost: "Days of widespread service disruption for a global company and its customers, significant recovery effort, and a reminder of the real-world impact an incident, once confirmed, can have, which is exactly why the whole SOC process aims to catch such things as early as possible.",
      control: "malware-protection",
      impact: ["ransomware took many Garmin services offline for days", "a clear example of a confirmed, high-impact incident", "global customer disruption"],
      source: "Public record; Garmin statements and 2020 reporting.",
      brandColor: "#007cc3",
      news: { headline: "Garmin services knocked offline by ransomware attack", outlet: "BBC News", date: "July 2020" },
    },
  ],

  lab: {
    title: "Event, alert, or incident?",
    intro: "Nothing to install and nothing leaves this page. Sort each one: a routine event, an alert worth a look, or a confirmed incident?",
    prompts: [
      "Event: routine, expected, no action. Alert: a rule flagged it, go look. Incident: confirmed harm.",
      "The same situation can escalate from event to alert to incident.",
      "Precise words keep everyone aligned and prevent panic or delay.",
    ],
    component: EventIncidentLab,
  },

  check: {
    explain: {
      prompt: "Explain the difference between an event, an alert and an incident, why using these words precisely matters, and where the Garmin outage sits.",
      modelAnswer: "An event is a record of something happening, routine logged activity like a normal login or a completed backup, of which there are millions and almost all are benign. An alert is raised when something matches a rule saying it is worth a human look, like a burst of failed logins or a flagged file; it is a question to triage, not a confirmed problem. An incident is confirmed malicious or harmful activity that has breached security and needs a response; an alert becomes an incident when investigation confirms it is real. Using these words precisely matters because calling a routine event an 'incident' causes needless panic, while calling a real incident 'just an alert' causes dangerous delay; precise language keeps the whole team aligned, and declaring an incident triggers the response process, escalation and obligations. The Garmin outage sits firmly as an incident: a ransomware attack that encrypted systems and took services offline for days is confirmed, active, high-impact harm, exactly the kind of thing the SOC process exists to catch early and respond to.",
    },
    quiz: [
      {
        q: "What is an 'alert', precisely?",
        options: [
          "A confirmed breach",
          "Something a rule flagged as worth a human look: a question to triage, not a confirmed problem",
          "A routine login",
          "A type of malware",
        ],
        answer: 1,
        why: "An alert prompts investigation. It becomes an incident only once confirmed as real harm.",
      },
      {
        q: "When does an alert become an incident?",
        options: [
          "After 24 hours automatically",
          "When investigation confirms it is real, malicious or harmful activity that has breached security",
          "Never; they are the same",
          "When a manager says so for no reason",
        ],
        answer: 1,
        why: "Confirmation of real harm is the line. Declaring an incident triggers the response process and obligations.",
      },
      {
        q: "The Garmin 2020 ransomware outage is an example of:",
        options: [
          "A routine event",
          "A confirmed incident: active, harmful, needing a full response",
          "An unconfirmed alert",
          "A false positive",
        ],
        answer: 1,
        why: "Encrypted systems and days of downtime are confirmed, high-impact harm, unmistakably an incident.",
      },
    ],
  },

  wrap: {
    headline: "You now speak the SOC's core language precisely: events, alerts, and incidents, and know when each becomes the next.",
    takeaways: [
      "Events are routine logged activity (mostly benign); alerts are rule-flagged and worth a look; incidents are confirmed harm.",
      "An alert is a question to triage, not a verdict; an incident triggers the full response process.",
      "Precise language prevents both needless panic and dangerous delay, and keeps the team aligned.",
    ],
    project: {
      name: "Classify a day",
      blurb: "Write three short scenarios of your own, one that is clearly an event, one an alert, and one an incident, with a line on why each is what it is, and what you would do. Being able to classify confidently, and act proportionately, is the everyday judgement of a SOC analyst.",
    },
    ethicsNote: "Triaging and responding to events, alerts and incidents is done within your organisation's systems and authority. It is defensive work, conducted lawfully and within the authorisation principles from Module 5.",
  },
};

export default topic3;
