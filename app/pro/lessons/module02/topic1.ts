import type { TopicManifest } from "../../learn/types";
import { JourneyOrderLab } from "../../learn/conceptLabs";

/* Module 2 - Topic 1: what a network is; the journey of a message.
 * Case: Meta, October 2021 (a faulty configuration change withdrew the
 * BGP routes to Facebook's own infrastructure; Facebook, Instagram and
 * WhatsApp vanished for about six hours). Public record: Meta's own
 * engineering post-mortem and October 2021 reporting. */
const topic1: TopicManifest = {
  id: "m2t1",
  weekLabel: "Module 2",
  act: "Act 1 - Foundations you can touch",
  title: "The journey of a message",
  role: "As a cyber security analyst you will read network logs every day. They only make sense once you can picture the journey each packet makes, because every attack you will ever investigate happens somewhere along it.",
  minutes: 16,
  promise: "See the trip every message makes, then watch the day Facebook deleted its own directions.",
  brief: "In this lesson, we'll follow one message on its real journey: chopped into packets, passed from router to router, reassembled at the far end. No jargon, just the actual trip. Then you'll see what happened in October 2021 when Facebook accidentally withdrew its own directions from the internet's shared map, and three billion people's apps went dark at once.",

  learn: [
    {
      heading: "A network is just machines passing parcels",
      body: [
        "Strip away the mystery and a network is simple: computers connected together, passing data to each other on your behalf. Your phone talks to your router, your router talks to your internet provider, and your provider talks to the rest of the world.",
        "The data itself travels as packets. Your message, photo or video call is chopped into thousands of small pieces, and each piece carries two things: a chunk of the data, and the address it is trying to reach. The far end collects the pieces and reassembles them.",
      ],
      examples: [
        "A one-line email might travel as a single packet; a photo becomes hundreds.",
        "Packets from the same message can take different routes and arrive out of order; the receiver puts them back together.",
        "If one packet is lost on the way, just that piece is re-sent, not the whole message.",
      ],
      analogy: {
        plain: "It is a postal system. You cannot post a wardrobe, so you ship it as many labelled boxes, possibly in separate vans, and the person at the other end rebuilds it from the labels.",
        realTerm: "packets",
      },
    },
    {
      heading: "Routers, and the hop-by-hop journey",
      visual: { id: "packet-path", mode: "journey" },
      body: [
        "No single cable runs from your phone to a website in another country. Instead, the internet is tens of thousands of networks joined together, and routers are the machines standing at every junction. Each router reads a packet's destination address and makes one decision: which neighbour to hand it to next. Repeat that twenty-odd times and your packet crosses the world.",
        "How does every router know a way to everywhere? The big networks constantly announce to each other which addresses they can deliver to, building a shared, living map of routes. It is one of the most trusting systems ever built: networks largely believe what their neighbours announce. When an announcement is wrong, whether by accident or by attack, traffic follows the wrong map.",
      ],
      examples: [
        "From a UK sofa to a US website is typically 10 to 20 router hops, each one a separate hand-off.",
        "If a cable is cut, routers learn new routes and traffic flows around the damage. The map heals itself.",
        "In 2008, one country's attempt to block YouTube locally announced a wrong route that leaked worldwide, and YouTube vanished for much of the planet for two hours.",
      ],
      analogy: {
        plain: "Satnavs that constantly share traffic reports with each other. Every driver gets a good route from shared knowledge, but a false report sends everyone down the same dead end.",
        realTerm: "routing (BGP)",
      },
    },
    {
      heading: "Why defenders care about the journey",
      body: [
        "Everything in security happens somewhere on this trip. An attacker can sit on the path and read what passes (which is why encryption exists), flood a destination with junk packets (a denial-of-service attack), or tamper with the shared route map itself so traffic flows through machines they control.",
        "It also means availability depends on the plumbing, not just the servers. A company's systems can be perfectly healthy and still unreachable, because the directions to them are wrong. That is not a hypothetical: it is exactly what took Facebook offline, as you are about to see.",
      ],
      examples: [
        "An analyst tracing a slow exfiltration needs to know what path the data left by.",
        "A DDoS is just the journey weaponised: millions of sources all sending packets to one destination.",
        "When a service is down, the first professional question is: is the server broken, or the route to it?",
      ],
    },
  ],

  glossary: [
    { term: "packet", definition: "A small piece of a larger message, carrying a chunk of data plus the address it is travelling to." },
    { term: "router", definition: "A machine at a network junction that reads each packet's destination and passes it one hop closer." },
    { term: "ISP", definition: "Internet service provider: the company that connects your home or office network to the rest of the internet." },
    { term: "BGP", definition: "Border Gateway Protocol: how big networks announce to each other which addresses they can deliver to, building the internet's shared route map." },
  ],

  seeHeading: "The day Facebook deleted its own directions",

  cases: [
    {
      org: "Meta (Facebook)",
      year: "2021",
      headline: "A routing mistake took Facebook, Instagram and WhatsApp offline for six hours",
      whatHappened: "On 4 October 2021, a faulty configuration change on Facebook's backbone effectively withdrew the routes that told the rest of the internet how to reach Facebook's infrastructure. Within minutes, Facebook, Instagram, WhatsApp and Messenger were unreachable worldwide. The servers were fine; the internet simply no longer had directions to them. The outage even hit Facebook's own internal tools, reportedly slowing engineers' physical access to the facilities they needed to fix it.",
      theMissedMeasure: "A change this powerful went through without a safety net that could catch it or roll it back quickly. Resilient operations assume any change can be wrong, and keep an independent way back in when the main path dies.",
      theCost: "Around six hours of global downtime across apps used by billions, lost business for the small firms that trade on them, and a share price drop the same day. All from configuration, not a single attacker.",
      control: "secure-configuration",
      impact: ["~6 hours offline worldwide", "Facebook, Instagram, WhatsApp and Messenger all down together", "no attacker involved: one faulty configuration change"],
      source: "Public record; Meta's engineering post-mortem (5 October 2021) and contemporaneous reporting.",
      brandColor: "#0866ff",
      news: { headline: "Facebook, WhatsApp and Instagram back online after outage", outlet: "BBC News", date: "October 2021" },
    },
  ],

  lab: {
    title: "Order the journey",
    intro: "Nothing to install and nothing leaves this page. Put the five stages of a message's real journey in order.",
    prompts: [
      "Start from the moment you tap send.",
      "Think parcel depot: pieces, labels, hand-offs, reassembly.",
      "When you check, read each note. The notes are the actual mechanics.",
    ],
    component: JourneyOrderLab,
  },

  check: {
    explain: {
      prompt: "A friend says 'Facebook was down, they must have been hacked.' Using what you now know about routes, explain in a sentence or two what actually happened in October 2021.",
      modelAnswer: "Nobody broke in. Facebook's own configuration change withdrew the routes that tell the rest of the internet how to reach its network, so every router in the world lost its directions to Facebook. The servers stayed healthy but unreachable, like a shop that is open while every signpost to it has been taken down. It is a reminder that availability depends on the journey to a system, not just the system itself.",
    },
    quiz: [
      {
        q: "Your message is sent across the internet as:",
        options: [
          "One unbroken stream, like water through a single pipe",
          "Many addressed packets that may travel different routes and are reassembled at the far end",
          "A copy placed on every computer on the internet",
          "A direct cable connection reserved just for you",
        ],
        answer: 1,
        why: "Data travels as packets: each piece is addressed, routed hop by hop, and the destination reassembles them. There is no single reserved pipe.",
      },
      {
        q: "What does a router actually do with a packet?",
        options: [
          "Reads its destination address and passes it to the best next neighbour",
          "Opens it and checks the message is polite",
          "Stores it permanently in case it is needed again",
          "Translates it into English",
        ],
        answer: 0,
        why: "A router makes one decision per packet: which neighbour gets it next. Billions of those small decisions per second are what the internet is.",
      },
      {
        q: "During the October 2021 outage, Facebook's servers were mostly healthy. So why could nobody reach them?",
        options: [
          "Every server had been encrypted by ransomware",
          "The routes telling the internet how to reach Facebook's network had been withdrawn",
          "Too many users tried to log in at once",
          "The domain name had expired",
        ],
        answer: 1,
        why: "The faulty change removed Facebook's routes from the internet's shared map. Healthy servers with no directions to them are, in practice, offline.",
      },
    ],
  },

  wrap: {
    headline: "You can now picture the trip every packet makes, which is where all network security thinking starts.",
    takeaways: [
      "Data travels as addressed packets, handed router to router until they are reassembled at the destination.",
      "Routes between networks are announced and trusted, so a wrong announcement, accidental or malicious, redirects real traffic.",
      "Availability depends on the journey as much as the server: a system with no route to it is down, however healthy it is.",
    ],
    project: {
      name: "Trace one real journey",
      blurb: "On your own machine, open a terminal and run 'tracert bbc.co.uk' (Windows) or 'traceroute bbc.co.uk' (Mac/Linux). Count the hops and notice the first one: your own router. Screenshot it and keep it, this is the first artefact in your evidence habit, and you will read paths like this professionally in the SIEM module.",
    },
    ethicsNote: "Tracing routes to public websites is normal and lawful. Probing networks you do not own in any deeper way is not; the Computer Misuse Act 1990 is covered properly in Module 5.",
  },
};

export default topic1;
