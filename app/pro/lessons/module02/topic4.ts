import type { TopicManifest } from "../../learn/types";
import { PortMatchLab } from "../../learn/conceptLabs";

/* Module 2 - Topic 4: ports and protocols in plain English. Case: the
 * long-running epidemic of Remote Desktop (RDP, port 3389) left exposed
 * to the internet as a ransomware entry point. Public record: repeated
 * NCSC/FBI advisories and widely reported ransomware intrusion data
 * naming exposed RDP as a leading initial-access vector. */
const topic4: TopicManifest = {
  id: "m2t4",
  weekLabel: "Module 2",
  act: "Act 1 - Foundations you can touch",
  title: "Ports and protocols in plain English",
  role: "When you read a firewall rule, a scan result, or an alert, it is written in ports and protocols. An analyst who sees '3389 open to the internet' and feels their stomach drop is an analyst doing the job.",
  minutes: 15,
  promise: "Learn the numbered doors every service listens behind, then see the one open door that lets ransomware in again and again.",
  brief: "In this lesson, we'll make sense of ports and protocols, the numbered doors and the languages spoken behind them. You'll learn the handful that come up constantly, and then see why one of them, Remote Desktop on port 3389, left open to the internet, has been a favourite front door for ransomware gangs for years.",

  learn: [
    {
      heading: "One address, many doors",
      body: [
        "A single server has one IP address but runs many services at once: a website, email, maybe remote administration. Ports are how one machine keeps them apart. Think of the IP address as the building and the port number as a specific numbered door into it. A service 'listens' on its door, waiting for connections.",
        "Most services use well-known port numbers by convention, so software knows where to knock. Web traffic goes to 443, email between servers to 25, and so on. Learn the common dozen and a surprising amount of network security reading becomes legible.",
      ],
      examples: [
        "Browsers automatically knock on port 443 for HTTPS, so you never type it.",
        "A mail server listens on 25 for other mail servers to connect.",
        "A machine can have thousands of possible ports; only the ones with a service behind them are 'open'.",
      ],
      analogy: {
        plain: "A big office building with one street address. The post room is door 25, reception is door 443. You reach the right team by going to the right numbered door, not just the building.",
        realTerm: "ports",
      },
    },
    {
      heading: "Protocols: the language behind each door",
      body: [
        "A protocol is the agreed language two machines speak once connected: the exact format of requests and replies. HTTP is the language of the web, SMTP the language of email, SSH the language of secure remote command lines. Behind each well-known port sits its expected protocol.",
        "Some protocols are encrypted and some are not, and that difference matters enormously. HTTPS, SSH and their kin protect what they carry; older plain protocols send everything, passwords included, in the clear. Part of hardening a system is replacing the plain doors with encrypted ones, and closing any door with no business being open.",
      ],
      examples: [
        "SSH (port 22) gives an encrypted remote command line; its ancient plain-text ancestor Telnet (port 23) should be extinct.",
        "HTTPS (443) is encrypted; plain HTTP (80) is not, which is why the last topic mattered.",
        "A service speaking the wrong protocol for its port is itself a red flag an analyst would notice.",
      ],
      analogy: {
        plain: "Each door has a language you must speak to be let through. Some doors have a soundproof booth (encrypted); at others, everyone in the corridor hears every word (plain text).",
        realTerm: "protocols",
      },
    },
    {
      heading: "Open doors are attack surface",
      visual: { id: "ports-doors" },
      body: [
        "Every port open to the internet is a door an attacker can walk up to and try. The first thing attackers do to a target is scan it: knock on every door and note which ones answer and what is behind them. So a core defensive habit is simple: expose as few doors as possible, and make sure each open one is patched, encrypted, and genuinely needed.",
        "The classic failure is a powerful door left open by accident. Remote Desktop, port 3389, is the standout: it is meant for administrators inside a network, but when it is exposed straight to the internet it becomes a login box the whole world can attack. As you are about to see, that single misconfiguration has fuelled years of ransomware.",
      ],
      examples: [
        "Attackers run internet-wide scans continuously; a newly exposed port is often probed within minutes.",
        "Search engines for exposed devices (like Shodan) index open ports, so finding victims takes no skill.",
        "'Reduce your attack surface' mostly means: close the doors you are not using.",
      ],
      analogy: {
        plain: "Every unlocked door is one a burglar can try. Thieves walk down the street rattling handles; the house with the side door propped open is the one they enter.",
        realTerm: "attack surface",
      },
    },
  ],

  glossary: [
    { term: "port", definition: "A numbered channel on a machine that lets one IP address run many services at once; each service listens on its own port." },
    { term: "protocol", definition: "The agreed language two machines speak once connected, defining the exact format of their requests and replies." },
    { term: "port scan", definition: "Knocking on a range of ports to see which are open and what service answers; usually an attacker's first move against a target." },
    { term: "attack surface", definition: "The total set of doors an attacker could try: every exposed port, service and entry point. Smaller is safer." },
    { term: "RDP", definition: "Remote Desktop Protocol (port 3389): Windows remote control, notoriously dangerous when exposed directly to the internet." },
  ],

  seeHeading: "The open door ransomware keeps walking through",

  cases: [
    {
      org: "Exposed RDP",
      year: "2019-2023",
      headline: "One port left open to the internet became ransomware's favourite front door",
      whatHappened: "Remote Desktop (RDP, port 3389) lets an administrator control a Windows machine remotely. Exposed directly to the internet, it becomes a login box anyone can attack. For years, ransomware crews have found exposed RDP by mass-scanning, guessed or bought weak credentials, logged straight in, and then spread across the network. Security agencies issued repeated warnings, and incident reports consistently ranked exposed RDP among the top ways ransomware first gets in.",
      theMissedMeasure: "A powerful remote-admin door was open to the whole internet, often with a weak password and no second factor. RDP belongs behind a VPN or access gateway, never exposed directly, and never without MFA.",
      theCost: "Countless ransomware incidents across hospitals, schools, councils and businesses began with nothing more sophisticated than an exposed RDP port and a guessed password.",
      control: "firewalls",
      impact: ["repeatedly ranked a top ransomware entry point", "found by trivial internet-wide scanning", "the fix is usually free: close the port, or put it behind a VPN"],
      source: "Public record; repeated NCSC and FBI/CISA advisories and widely reported ransomware intrusion data, 2019-2023.",
      brandColor: "#5b8def",
      news: { headline: "Exposed Remote Desktop services remain a leading ransomware entry point", outlet: "Security reporting (industry)", date: "2019-2023" },
    },
  ],

  lab: {
    title: "Match the door to its job",
    intro: "Nothing to install and nothing leaves this page. Pair each well-known port with the service behind it.",
    prompts: [
      "Tap a port, then tap the job it does.",
      "These exact pairings appear on Security+ and in real interviews.",
      "Notice which doors are encrypted and which are not: that distinction matters.",
    ],
    component: PortMatchLab,
  },

  check: {
    explain: {
      prompt: "An analyst scans a company server and finds port 3389 open to the internet. In your own words, explain why they would raise the alarm straight away.",
      modelAnswer: "Port 3389 is Remote Desktop, a full remote-control door into the machine, meant for administrators inside the network. Exposed to the internet it is a login box the entire world can attack, and attackers find such doors automatically by mass-scanning. With a weak password and no second factor, a crew can log straight in and spread, which is exactly how a great deal of ransomware starts. The fix is usually cheap: close the port, or put it behind a VPN with MFA. It is a textbook reduce-your-attack-surface problem.",
    },
    quiz: [
      {
        q: "What is a port, in plain terms?",
        options: [
          "The physical socket a cable plugs into",
          "A numbered channel that lets one machine run many services and keep them apart",
          "Another word for an IP address",
          "The password for a service",
        ],
        answer: 1,
        why: "One IP address, many services; the port number is the specific door each service listens behind.",
      },
      {
        q: "Why is an exposed port described as 'attack surface'?",
        options: [
          "It makes the server run slower",
          "It is a door an attacker can reach and try, so fewer open doors means less to attack",
          "Ports are always dangerous and should all be closed",
          "It uses up the machine's memory",
        ],
        answer: 1,
        why: "Each internet-facing port is something an attacker can probe. Reducing attack surface means closing the doors you do not need.",
      },
      {
        q: "What is the safe way to run Remote Desktop (3389)?",
        options: [
          "Expose it to the internet but use a long password",
          "Put it behind a VPN or access gateway, with MFA, never directly on the internet",
          "Leave it open; attackers cannot find it unless you tell them",
          "Rename the port to hide it",
        ],
        answer: 1,
        why: "RDP is for trusted internal admins. It belongs behind a VPN with a second factor. Exposing it directly, however long the password, invites the mass-scanners straight in.",
      },
    ],
  },

  wrap: {
    headline: "You can now read the doors and languages a network runs on, and spot the dangerous ones.",
    takeaways: [
      "One IP address runs many services; ports are the numbered doors that keep them apart, and protocols are the languages behind them.",
      "Some protocols are encrypted (HTTPS, SSH) and some are not; part of hardening is choosing the encrypted door and closing unused ones.",
      "Every internet-facing port is attack surface. Exposed Remote Desktop (3389) is the classic, costly open door.",
    ],
    project: {
      name: "List your own open doors",
      blurb: "Think about a device you own that is on the internet, such as a home router, and look up (from the manufacturer's own pages) which of its remote-management features are on. The goal is simply to notice: which doors are open, and does anything need them? Write a two-line note. That instinct, asking 'what is exposed, and why?', is the whole habit.",
    },
    ethicsNote: "Scanning your own devices is fine. Port-scanning machines you do not own or have written permission to test can itself be an offence under the Computer Misuse Act 1990. Module 5 makes the boundary clear.",
  },
};

export default topic4;
