import type { TopicManifest } from "../../learn/types";
import { DnsScenarioLab } from "../../learn/conceptLabs";

/* Module 2 - Topic 2: IP and DNS, how you reach a website. Case: the
 * Mirai botnet's DDoS on Dyn, October 2016 (knocking out the DNS
 * provider made Twitter, Netflix, Reddit and more unreachable across
 * the US and Europe). Public record: Dyn's own analysis and October
 * 2016 reporting; later US DoJ prosecutions of Mirai's authors. */
const topic2: TopicManifest = {
  id: "m2t2",
  weekLabel: "Module 2",
  act: "Act 1 - Foundations you can touch",
  title: "IP and DNS: how you reach a website",
  role: "DNS queries are some of the most valuable evidence an analyst has: nearly everything a machine talks to, it first looks up. Defenders read DNS logs to spot malware calling home, and attackers abuse DNS to misdirect victims. You need this layer cold.",
  minutes: 17,
  promise: "Learn how a name becomes an address, then see the day the internet's address book was knocked offline.",
  brief: "In this lesson, we'll answer a deceptively simple question: when you type a website's name, how does your device know where to go? The answer is DNS, the internet's address book. You'll play the lookup out step by step, and then see what happened in October 2016 when an army of hacked cameras attacked the address book itself, and half the web's biggest sites vanished with it.",

  learn: [
    {
      heading: "Addresses are numbers; names are for humans",
      body: [
        "Every device on the internet is reached by its IP address, a number like 151.101.0.81. Routers only understand these numbers. But nobody wants to remember numbers, so we use names like bbc.co.uk, and something has to translate name to number every single time.",
        "That something is DNS, the Domain Name System. It is a global, distributed directory: you give it a name, it gives you back the IP address to send your packets to. Almost every action online begins with a DNS lookup, which is exactly why both defenders and attackers care about it so much.",
      ],
      examples: [
        "You type a shop's name; DNS answers with its address; only then can your browser connect.",
        "Apps do it too: your phone's apps quietly perform DNS lookups constantly.",
        "Change what DNS answers, and you change where people end up, without touching their devices at all.",
      ],
      analogy: {
        plain: "Saving contacts in your phone. You tap a name, the phone dials the number behind it. You never memorise the number, and if someone secretly edited the contact, you would ring a stranger while the screen still showed your friend's name.",
        realTerm: "DNS resolution",
      },
    },
    {
      heading: "The lookup chain: cache, resolver, root, and down",
      body: [
        "The lookup is a short chain of questions. First your device checks its cache: did I resolve this name recently? If not, it asks its resolver, usually run by your internet provider or a public service. If the resolver does not know either, it works down the hierarchy: the root servers point it to the registry for the ending (.com, .io, .co.uk), and that registry points it to the name servers for the specific site, which give the final answer.",
        "Answers are cached at every step, with an expiry time. That caching is why the web feels instant, and it is also why a poisoned answer is so nasty: one bad entry in a busy resolver's cache can misdirect everyone who asks it until the entry expires.",
      ],
      examples: [
        "First visit to a site: full chain, perhaps 50 milliseconds. Second visit: answered from cache in under one.",
        "The root and registry servers do not know the final address; they know who to ask next. It is a chain of referrals.",
        "Public resolvers like 1.1.1.1 and 8.8.8.8 answer a huge share of the world's lookups.",
      ],
    },
    {
      heading: "Why DNS is a target, and what that means for you",
      body: [
        "DNS concentrates enormous trust in a few places. Attack a resolver's cache and you silently redirect its users to servers you control, with the real name still in their address bar. Knock a big DNS provider offline and every site that relies on it becomes unreachable, even though those sites are perfectly healthy. The names simply stop resolving.",
        "For a working analyst, DNS cuts both ways. It is an attack surface to defend, and it is evidence: malware on a quiet laptop still has to look up the address of its control server, and that lookup lands in a log. Some of the best early-warning detections in a SOC are just unusual DNS queries.",
      ],
      examples: [
        "A bank's customers type the right name, get a poisoned answer, and hand their logins to a perfect fake.",
        "A single DNS provider outage in 2016 took household-name sites with it for hours.",
        "An analyst spots a machine looking up a random-looking name every 60 seconds: a classic malware heartbeat.",
      ],
      analogy: {
        plain: "A city's only phone book. Sneak one wrong entry in and everyone who looks it up rings the con artist. Burn the book and nobody can ring anyone, even though every phone in the city still works.",
        realTerm: "DNS attacks (poisoning, DDoS)",
      },
    },
  ],

  glossary: [
    { term: "IP address", definition: "The numeric address that identifies a device on a network, like 151.101.0.81. Routers deliver packets by these numbers." },
    { term: "DNS", definition: "The Domain Name System: the global directory that translates human-friendly names into IP addresses." },
    { term: "resolver", definition: "The DNS server your device asks, which chases the full answer down the hierarchy on your behalf and caches the results." },
    { term: "cache poisoning", definition: "Tricking a resolver into storing a false answer, so everyone who asks it is sent to the attacker's address." },
    { term: "botnet", definition: "A crowd of hacked devices under one attacker's remote control, often used to flood targets with traffic." },
  ],

  seeHeading: "The day the address book went down",

  cases: [
    {
      org: "Dyn",
      year: "2016",
      headline: "Hacked cameras attacked a DNS provider, and took Twitter, Netflix and Reddit with it",
      whatHappened: "On 21 October 2016, the Mirai botnet, hundreds of thousands of hacked 'smart' devices such as cameras and video recorders, flooded Dyn, a major DNS provider, with junk traffic. Dyn answered lookups for a long list of famous services, so as its systems drowned, Twitter, Netflix, Reddit, Spotify and many others became unreachable across the US and Europe for much of the day. None of those sites was attacked directly; the address book they depended on was.",
      theMissedMeasure: "The weapon was built from devices whose owners never changed the factory password: Mirai logged in with a short list of default credentials. And many of the affected companies had no second DNS provider, so one supplier's bad day became theirs.",
      theCost: "Hours of outage across some of the web's biggest brands, delivered by compromised household gadgets. Mirai's three authors later pleaded guilty in the US.",
      control: "access-control",
      impact: ["major sites unreachable across the US and Europe for hours", "a botnet of ~100,000+ hacked home devices", "the sites themselves were never touched, only their DNS"],
      source: "Public record; Dyn's incident analysis (October 2016) and US Department of Justice statements on the Mirai authors (2017).",
      brandColor: "#f68b1f",
      news: { headline: "DDoS attack that disrupted internet was largest of its kind in history, experts say", outlet: "The Guardian", date: "October 2016" },
    },
  ],

  lab: {
    title: "Play the lookup",
    intro: "Nothing to install and nothing leaves this page. Walk one lookup through the real chain of questions.",
    prompts: [
      "You will play the browser, then the resolver, then the browser again.",
      "There is a best answer at each step; the reasoning after each choice is the actual lesson.",
      "By the end you should be able to say the chain from memory: cache, resolver, root, registry, the site's own name server.",
    ],
    component: DnsScenarioLab,
  },

  check: {
    explain: {
      prompt: "Twitter's own servers were healthy on 21 October 2016, yet millions could not reach it. In your own words, explain why, and why attacking DNS is such good value for an attacker.",
      modelAnswer: "Reaching a site needs its name translated to an IP address first, and Dyn was the service doing that translation for Twitter and many others. The Mirai botnet flooded Dyn until lookups failed, so browsers never learned Twitter's address. Healthy servers that nobody can look up are effectively offline. DNS is good value for attackers because it concentrates trust: one provider, or one poisoned cache, stands in front of thousands of sites and millions of users at once.",
    },
    quiz: [
      {
        q: "What does DNS actually do?",
        options: [
          "Encrypts your traffic so strangers cannot read it",
          "Translates human-friendly names into the IP addresses routers deliver to",
          "Stores every website's pages so they load faster",
          "Blocks dangerous websites automatically",
        ],
        answer: 1,
        why: "DNS is the directory: name in, address out. Encryption is HTTPS's job, and it comes next in this module.",
      },
      {
        q: "A resolver has been tricked into caching a false answer for a bank's name. What happens?",
        options: [
          "Nothing, browsers notice false answers automatically",
          "Only the attacker's own lookups are affected",
          "Everyone using that resolver is sent to the attacker's address while the entry lasts, with the real name in their address bar",
          "The bank's website goes offline",
        ],
        answer: 2,
        why: "Caching spreads the lie: every user of that resolver gets the poisoned answer until it expires, and nothing looks wrong on their screen. That is cache poisoning.",
      },
      {
        q: "In the 2016 attack, how did Mirai build its weapon?",
        options: [
          "By logging into smart devices that still had factory default passwords",
          "By exploiting a flaw in Twitter's code",
          "By bribing employees at Dyn",
          "By hacking the root DNS servers",
        ],
        answer: 0,
        why: "Mirai scanned the internet for cameras and recorders still accepting default credentials, a pure access-control failure, and conscripted them by the hundred thousand.",
      },
    ],
  },

  wrap: {
    headline: "You now know how a name becomes an address, and why that one step carries so much of the internet's trust.",
    takeaways: [
      "Routers deliver by IP address; DNS translates every name to a number first, so nearly everything online starts with a lookup.",
      "The lookup is a cached chain: device, resolver, root, registry, the site's own name server. Caching makes it fast, and makes poisoned answers spread.",
      "DNS concentrates trust, so attackers poison it to redirect people and flood it to take whole swathes of the web down at once.",
    ],
    project: {
      name: "Look one name up yourself",
      blurb: "In a terminal, run 'nslookup bbc.co.uk' and look at the answer: the resolver that replied, and the IP addresses returned. Then run it for your own most-used site. Keep both screenshots with your traceroute from the last topic; you are building the habit of collecting evidence.",
    },
    ethicsNote: "Looking up public names is what DNS is for. Deliberately feeding false answers to anyone else's lookups is an attack, and in the UK a Computer Misuse Act offence. Module 5 covers exactly where the line sits.",
  },
};

export default topic2;
