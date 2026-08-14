import type { LessonManifest } from "../learn/types";
import SiemLab from "../learn/SiemLab";

/* Week 13 - Logs and the SIEM. The highest-risk lab in the course: it is
 * where the "real infrastructure" promise is tested. The design answer is
 * two tracks - a zero-setup in-browser SIEM triage of a real honeypot
 * capture (everyone finishes this), then a scaffolded real-VPS honeypot
 * as the portfolio extension. This lesson prototypes the first track.
 *
 * The case is the ongoing reality of the internet background radiation:
 * every exposed device is brute-forced within minutes. Sourced from the
 * public record of the Mirai botnet (2016 Dyn/Krebs DDoS) and how it
 * still spreads. */
const week13: LessonManifest = {
  id: "week-13",
  weekLabel: "Week 13",
  act: "Act 3 - Defence for real",
  title: "Logs and the SIEM: reading what the attackers left behind",
  role: "This is the core SOC analyst skill. Reading logs to find the attack is what a Tier 1 analyst does all day.",
  minutes: 40,
  promise: "See what really hits an exposed server, then investigate a real honeypot capture in a SIEM, the way an analyst does, with nothing to install.",

  learn: [
    {
      heading: "Every log is a footprint. A SIEM is how you read millions of them",
      body: [
        "Everything a computer does leaves a log: who connected, who tried to log in, what command they ran. One server makes thousands of log lines an hour. A busy company makes billions a day. No human can read that.",
        "A SIEM (Security Information and Event Management) is the tool that collects all those logs in one place and lets you search them fast. Learning to defend is, more than anything, learning to ask a pile of logs the right question.",
      ],
      examples: [
        "One login attempt is one log line; a busy company can produce billions of them a day.",
        "A SIEM lets you type 'show every failed login from this address between 2am and 3am' and get the answer in seconds.",
        "The same tool spots patterns a human would miss, like the same password tried against 500 accounts in a minute.",
      ],
      analogy: {
        plain: "A SIEM is like CCTV for your whole network, with a search box. You do not watch every camera; you type 'show me everyone who tried the back door at 2am' and it pulls the clips.",
        realTerm: "SIEM (Splunk, Microsoft Sentinel, Elastic)",
      },
    },
    {
      heading: "The internet is not quiet. Everything gets attacked, constantly",
      body: [
        "A honeypot is a decoy computer you put on the internet on purpose, to watch who attacks it and how. The moment it goes online, it is found. Automated bots scan the entire internet and try to break into anything that answers.",
        "You are about to read a real two-minute slice from an SSH honeypot. Bots try to log in with lists of factory-default passwords. Most fail. But you only have to leave one device on a default password, and the bot is in.",
      ],
      examples: [
        "A brand-new server with no website on it still gets thousands of break-in attempts within minutes of going online.",
        "The bots try factory defaults like root/root and admin/admin, over and over, from hundreds of addresses at once.",
        "This constant background noise is why the skill is spotting the one success in a sea of failures.",
      ],
    },
    {
      heading: "What the attackers are really doing",
      body: [
        "In your capture, one login succeeds with root / xc3511, a real CCTV camera's default password and the first entry on the Mirai botnet's built-in list. The instant it is in, it runs '/bin/busybox MIRAI' to check it landed on a device it can infect, then downloads and runs a script that recruits the machine into the botnet.",
        "This is the botnet that knocked half the US internet offline in 2016 by turning hundreds of thousands of cameras and routers into a weapon. It still spreads exactly this way, right now, against every unprotected device. Your job as an analyst is to see it in the logs and act before the script runs.",
      ],
      examples: [
        "The check '/bin/busybox MIRAI' is the bot asking 'is this a device I can actually infect?'",
        "The wget line downloads the bot's code, runs it, then deletes the file to hide the evidence.",
        "Once infected, your device quietly joins attacks on other targets, and you would never notice.",
      ],
    },
  ],

  glossary: [
    { term: "SIEM", definition: "Security Information and Event Management: a tool that collects logs from everywhere and lets you search them fast to spot attacks." },
    { term: "honeypot", definition: "A decoy computer put on the internet on purpose to watch who attacks it and how, without risking anything real." },
    { term: "log", definition: "A record a computer writes of something that happened, such as a login attempt, a connection, or a command that was run." },
    { term: "brute force", definition: "Trying many passwords or codes in a row, very fast, until one works." },
    { term: "botnet", definition: "A network of hijacked devices an attacker controls remotely, often used together to launch large attacks." },
    { term: "Mirai", definition: "A famous botnet that spreads by trying factory-default passwords on internet-connected devices like cameras and routers." },
  ],

  seeHeading: "The same attack, at full scale",

  cases: [
    {
      org: "Mirai botnet / Dyn",
      year: "2016",
      headline: "Default passwords on cameras took down Twitter, Netflix and Reddit",
      whatHappened: "Mirai spread by doing exactly what you will see in the honeypot: scan the internet, try a short list of factory-default passwords, and infect any device that accepts one. It built an army of hundreds of thousands of hijacked cameras and routers, then in October 2016 pointed them all at Dyn, a company that runs core internet DNS, knocking out Twitter, Netflix, Reddit, GitHub and more across the US.",
      theMissedMeasure: "The devices shipped with well-known default passwords that owners never changed, and were exposed directly to the internet with no firewall in front of them.",
      theCost: "One of the largest DDoS attacks in history at the time. The Mirai source code was then published, and its descendants still run the same playbook against every exposed device today, which is why your honeypot fills up within minutes.",
      control: "access-control",
      source: "Public record; US-CERT/CISA advisories on Mirai; Krebs on Security 2016; Dyn incident report.",
      brandColor: "#f26b21",
      news: { headline: "DDoS attack that disrupted internet was largest of its kind in history", outlet: "The Guardian", date: "October 2016", url: "https://www.theguardian.com/technology/2016/oct/26/ddos-attack-dyn-mirai-botnet" },
    },
  ],

  lab: {
    title: "Triage a real honeypot capture",
    intro: "This is a real honeypot capture, and you are reading it in a SIEM inside your own browser. Nothing is installed and nothing is sent anywhere.",
    prompts: [
      "Use the search box to filter the log. Try searching 'SUCCEEDED', then 'wget'.",
      "Use the FAIL and SUCCESS chips to separate the noise from the one that matters.",
      "Answer the six investigation questions by reading the log, the way a SOC analyst answers a ticket.",
    ],
    component: SiemLab,
  },

  check: {
    explain: {
      prompt: "A colleague glances at the honeypot and says 'it's fine, almost every login failed'. Using what you just found, why is that the wrong conclusion? Write a sentence or two, then reveal a model answer.",
      modelAnswer: "Almost every login failing is normal background noise, but you only need one success, and there was one: root / xc3511 from 45.155.205.88. The moment it got in, it ran the Mirai check and downloaded a dropper. In a real SOC that single SUCCESS line, not the hundreds of failures, is the alert you escalate: the device is compromised and needs isolating and rebuilding before it joins the botnet.",
    },
    quiz: [
      {
        q: "What is the main job of a SIEM?",
        options: [
          "To block all attacks automatically",
          "To collect logs from everywhere and let you search them fast",
          "To replace the need for analysts",
          "To encrypt a company's files",
        ],
        answer: 1,
        why: "A SIEM centralises logs and makes them searchable. It surfaces things for a human analyst to investigate; it does not decide for you, which is exactly why the analyst skill matters.",
      },
      {
        q: "In the capture, which single line was the one that actually mattered?",
        options: [
          "The hundreds of failed logins",
          "The new SSH connections",
          "The one SUCCESS, followed by the Mirai commands",
          "The session closing",
        ],
        answer: 2,
        why: "Failures are noise. The SUCCESS line and the commands that followed it are the real incident. Separating signal from noise is the core of triage.",
      },
      {
        q: "What would have stopped this attack getting in?",
        options: [
          "A stronger, non-default password (and not exposing the device directly)",
          "A faster internet connection",
          "Deleting the log files",
          "Nothing, it was unavoidable",
        ],
        answer: 0,
        why: "Mirai only works because devices keep factory-default passwords. Changing the password and putting a firewall in front of the device beats the entire attack. That is Cyber Essentials: User Access Control plus Firewalls.",
      },
    ],
  },

  wrap: {
    headline: "You just ran a real SIEM investigation, the core skill of the SOC job.",
    takeaways: [
      "Defending is mostly asking a pile of logs the right question. A SIEM is how you ask it at scale.",
      "The internet attacks everything, constantly. The skill is spotting the one success in a sea of failures.",
      "You just did real SOC triage on real attacker data, with nothing installed.",
    ],
    project: {
      name: "Run your own honeypot (the real thing)",
      blurb: "You have now done the analyst half in the browser. The portfolio half is doing it for real: for a few pounds a month you will stand up your own honeypot on a cheap cloud server and watch your own attackers arrive, then feed those logs into a real SIEM (Wazuh, Elastic or Splunk) and write up what you find. We walk you through every command step by step, with checkpoints, and it is completely legal: it is your own server, and you cannot break anything that matters. This capture-and-analysis becomes a real portfolio piece employers respect.",
    },
    ethicsNote: "A honeypot only ever watches attackers who come to your own server. You never attack back and you never touch a system you do not own. In the UK the Computer Misuse Act 1990 makes unauthorised access a criminal offence, and that line holds even when someone is attacking you.",
  },
};

export default week13;
