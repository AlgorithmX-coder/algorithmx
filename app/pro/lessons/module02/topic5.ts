import type { TopicManifest } from "../../learn/types";
import { AttackStageLab } from "../../learn/conceptLabs";

/* Module 2 - Topic 5: where each attack fits into the flow. The
 * synthesis lesson: it maps the module's four pieces (journey, lookup,
 * web conversation, ports) onto the three stages any network attack
 * targets. Case: a BGP route hijack of a crypto service's traffic,
 * 2018, as the clean "attack the journey itself" story. Public record:
 * the 2018 Amazon Route 53 / MyEtherWallet BGP incident reporting. */
const topic5: TopicManifest = {
  id: "m2t5",
  weekLabel: "Module 2",
  act: "Act 1 - Foundations you can touch",
  title: "Where each attack fits into the flow",
  role: "This is the mental map a working analyst carries: given any alert, where on the flow is this happening, the lookup, the journey, or the destination? It tells you instantly what kind of attack you are looking at and where to go next.",
  minutes: 15,
  promise: "Pull the whole module together into one map, then see attackers hijack the journey itself to steal real money.",
  brief: "In this lesson, we'll tie the module together. You now know the journey of a packet, how names resolve, how web conversations work, and how ports expose services. Here you'll see that every network attack targets one of three stages, the lookup, the journey, or the destination, and you'll see a striking real example where attackers seized the journey itself and rerouted a crypto service's traffic to steal from its users.",

  learn: [
    {
      heading: "Three stages, every attack lands on one",
      body: [
        "Everything in this module reduces to a simple map with three stages. First the lookup: turning a name into an address (DNS). Then the journey: the packets travelling hop by hop across networks (routing). Finally the destination: the server itself, listening behind its ports. Every network attack you will ever meet targets one of these three.",
        "This is not a trivia scheme; it is a diagnostic tool. When an alert fires, asking 'which stage?' routes your whole investigation. A DNS anomaly is a lookup problem. Traffic taking a bizarre path is a journey problem. A server buckling or spilling data is a destination problem. Name the stage and you have already narrowed the field.",
      ],
      examples: [
        "Lookup: cache poisoning, typosquatting, a malware heartbeat resolving a strange name.",
        "Journey: route hijacks, evil-twin Wi-Fi, man-in-the-middle interception.",
        "Destination: DDoS floods, SQL injection, brute-forcing an exposed port.",
      ],
      analogy: {
        plain: "Posting a parcel. Someone can fake the address you look up, hijack the van on the road, or attack the depot at the far end. Three stages, three very different crimes.",
        realTerm: "the lookup / journey / destination model",
      },
    },
    {
      heading: "Attacking the lookup and the destination",
      body: [
        "The lookup is attractive because it happens before anything visible: corrupt the name-to-address step and every later step faithfully carries the victim to the wrong place, with the right name still showing. Typosquatting, poisoned caches and malicious resolvers all live here.",
        "The destination is the server itself, reached through its open ports. Here attackers flood it until real users cannot get through (a DDoS), or they speak its protocol in hostile ways, like the crafted database query you will run yourself in Module 9. Defending the destination is patching, hardening, closing ports, and filtering floods.",
      ],
      examples: [
        "Lookup attack: a poisoned resolver sends a bank's customers to a flawless fake.",
        "Destination attack: a DDoS drowns a shop's checkout during a sale.",
        "Destination attack: a crafted login makes a server's database dump its tables.",
      ],
    },
    {
      heading: "Attacking the journey itself",
      body: [
        "The journey is the subtlest target. Remember from topic 1 that networks announce to each other which addresses they can deliver to, and largely trust those announcements. An attacker who makes a false announcement can pull other people's traffic through their own network, a route hijack, and then read or redirect it.",
        "This sounds abstract until you see it steal money. In 2018, attackers used exactly this technique to reroute the traffic of a cryptocurrency service and feed its users a fake site, draining real funds. It is the purest 'attack the journey' story there is, and it is why the slow move towards signing and verifying routes matters so much.",
      ],
      examples: [
        "A false route announcement quietly pulls a target's traffic through attacker-controlled networks.",
        "Once on the path, the attacker can eavesdrop, or serve a convincing fake of the real destination.",
        "Encryption (HTTPS) helps here: even on a hijacked path, a valid certificate is hard to fake, so browsers can warn the user.",
      ],
      analogy: {
        plain: "Putting up fake motorway signs that divert every car for one town through your own private road, where you can search them or send them to a copycat high street.",
        realTerm: "BGP route hijack",
      },
    },
  ],

  glossary: [
    { term: "route hijack", definition: "Making a false network-route announcement so other networks send a target's traffic through the attacker's systems." },
    { term: "man-in-the-middle", definition: "An attacker positioned on the path between two parties, able to read or alter what passes while both think they talk directly." },
    { term: "DDoS", definition: "Distributed denial of service: overwhelming a destination with traffic from many sources so legitimate users cannot get through." },
    { term: "typosquatting", definition: "Registering look-alike or misspelled names so a small typo delivers victims to an attacker's copy of a real site." },
  ],

  seeHeading: "When attackers hijacked the journey to steal real money",

  cases: [
    {
      org: "BGP hijack (crypto service)",
      year: "2018",
      headline: "Attackers rerouted a service's traffic mid-journey and drained users' funds",
      whatHappened: "In April 2018, attackers abused the internet's trust-based routing to make a false announcement for address ranges tied to a widely used DNS service. For a couple of hours, traffic meant for a cryptocurrency wallet site was pulled through networks the attackers influenced and served a fraudulent copy of the site. Users who proceeded, clicking past a certificate warning, had cryptocurrency stolen directly from their accounts.",
      theMissedMeasure: "The internet's routing still largely trusts announcements by default, and this one was not verified. Route-origin validation (signing and checking who may announce which addresses) is the defence the industry is slowly deploying. The browser's certificate warning was also the users' last line, and some clicked past it.",
      theCost: "Roughly two hours of hijacked traffic translated into real, irreversible cryptocurrency theft, and a vivid demonstration that the journey itself is attackable, not just the endpoints.",
      control: "secure-configuration",
      impact: ["~2 hours of traffic rerouted via a BGP hijack", "users served a convincing fake of the real site", "the HTTPS certificate warning was the final safeguard, and not everyone heeded it"],
      source: "Public record; April 2018 reporting on the Amazon Route 53 / MyEtherWallet BGP hijack.",
      brandColor: "#3c3c4d",
      news: { headline: "Hackers hijacked DNS traffic to steal cryptocurrency, researchers say", outlet: "Industry reporting", date: "April 2018" },
    },
  ],

  lab: {
    title: "Place the attack on the flow",
    intro: "Nothing to install and nothing leaves this page. For each real attack, decide which stage of the flow it targets.",
    prompts: [
      "Three stages: the lookup, the journey, the destination.",
      "This is the exact first question an analyst asks of any network alert.",
      "Get them placed and you have a map you will reuse through the rest of the course.",
    ],
    component: AttackStageLab,
  },

  check: {
    explain: {
      prompt: "Describe the three stages any network attack can target, and give one real example of each. Then say why this map is useful to an analyst on the job.",
      modelAnswer: "The three stages are the lookup (turning a name into an address, via DNS), the journey (the packets travelling hop by hop, via routing), and the destination (the server behind its ports). A lookup attack is cache poisoning sending a bank's users to a fake. A journey attack is a BGP route hijack pulling traffic through attacker networks, as in the 2018 crypto theft. A destination attack is a DDoS flooding a site offline. The map is useful because when an alert fires, naming the stage instantly narrows what kind of attack it is and where to investigate next.",
    },
    quiz: [
      {
        q: "A cache-poisoning attack belongs to which stage of the flow?",
        options: ["The lookup", "The journey", "The destination", "The handshake", "The reassembly"],
        answer: 0,
        reasons: [
          "Right. Cache poisoning corrupts the name-to-address step (DNS), so it is a lookup attack. Everything after it faithfully carries the victim to the wrong place.",
          "The journey is the packets travelling hop by hop. Poisoning happens earlier, when the name is turned into an address.",
          "The destination is the server itself. Cache poisoning never touches the server; it corrupts the lookup that comes before it.",
          "The handshake is how an encrypted connection starts, not one of the three attack stages in this map.",
          "Reassembly is the far end rebuilding the packets. It is not where cache poisoning strikes; that is the lookup.",
        ],
      },
      {
        q: "In the 2018 crypto hijack, what did the attackers actually seize?",
        options: [
          "The victims' passwords, harvested through a convincing phishing email",
          "The journey: a false route announcement pulled traffic through their network",
          "The destination: they broke straight into the wallet site's own database",
          "The victims' devices, through malware hidden inside the fake site",
          "The lookup: they poisoned a resolver's cache with a false answer",
        ],
        answer: 1,
        reasons: [
          "No phishing email was involved. The attack happened on the network's routes, before any email, by diverting traffic itself.",
          "Right. They abused the internet's trust-based routing to reroute traffic mid-journey, then served a fake site. It is the clearest attack-the-journey example there is.",
          "The wallet site's own server and database were not broken into. The attack seized the route to it, not the server itself.",
          "No malware reached the victims' devices. They were simply steered to a convincing fake by the hijacked route.",
          "Tempting, but this was a route hijack on the journey, not a poisoned cache. The traffic was pulled off course, not misdirected at the lookup.",
        ],
      },
      {
        q: "Why is 'which stage of the flow?' a useful first question for an analyst?",
        options: [
          "Because it tells you how long the attack has already been running",
          "Because naming the stage narrows the kind of attack and where to look",
          "Because it reveals the exact tool or software the attacker used",
          "Because it tells you precisely who the attacker is and where",
          "Because it proves whether the attack succeeded or was blocked in time",
        ],
        answer: 1,
        reasons: [
          "The stage does not reveal timing. It tells you what kind of attack you are facing, not how long it has run.",
          "Right. The stage is a fast diagnostic: lookup, journey or destination each point to a different class of attack and a different place to look next.",
          "The stage narrows the class of attack, not the precise tool. You would identify the exact tool later in the investigation.",
          "Naming the stage does not name the attacker. Attribution is a separate, much harder question than classification.",
          "The stage does not tell you whether the attack worked. It points you to where and what to investigate first.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You finished Module 2: you can picture the whole flow of the internet, and place any attack on it.",
    takeaways: [
      "Every network attack targets one of three stages: the lookup (DNS), the journey (routing), or the destination (the server and its ports).",
      "The lookup and journey are attractive because they happen invisibly, before the victim sees anything wrong.",
      "'Which stage?' is a working analyst's fast first question, and it is the map the rest of this course builds on.",
    ],
    project: {
      name: "Map a breach you have heard of",
      blurb: "Pick any breach or outage you know, from this module or the news, and write one line placing it on the flow: lookup, journey, or destination, and why. Add it to the notes you have been keeping with your traceroute and DNS screenshots. You now have the beginnings of a security notebook, and the habit of thinking in stages.",
    },
    ethicsNote: "Everything in this module is a tool used by both sides. Using any of it against systems you do not own or have permission to test is unlawful under the Computer Misuse Act 1990, which Module 5 covers in full, before you touch the hands-on attack labs in Act 2.",
  },
};

export default topic5;
