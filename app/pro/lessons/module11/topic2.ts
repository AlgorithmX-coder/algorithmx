import type { TopicManifest } from "../../learn/types";
import { PatchRaceLab } from "../../learn/conceptLabs";

/* Module 11 - Topic 2: the patch race. Case: the March 2021 Microsoft
 * Exchange Server mass-exploitation (ProxyLogon), where patches were
 * released but tens of thousands of internet-facing servers were
 * compromised as attackers raced to exploit the unpatched. Public
 * record: Microsoft advisories, CISA directives and 2021 reporting. */
const topic2: TopicManifest = {
  id: "m11t2",
  weekLabel: "Module 11",
  act: "Act 2 - How attacks happen",
  title: "The patch race",
  role: "The window between a fix being released and you applying it is one of the most dangerous moments in security, and winning that race, patching fast, especially on exposed systems, prevents an astonishing share of real breaches. It is unglamorous, and it is vital.",
  minutes: 17,
  promise: "Understand why an unpatched flaw is an open door, then see tens of thousands of servers fall in the days after a fix was released.",
  brief: "In this lesson, we'll look at the patch race: the sprint between a vulnerability becoming public (often with a patch) and attackers exploiting everyone who has not yet applied it. We'll see why 'a patch exists' does not mean 'you are safe', and why exposed systems must be patched fast. Then we'll study the 2021 Microsoft Exchange mass-exploitation, where the gap between fix-released and fix-applied cost tens of thousands of organisations.",

  learn: [
    {
      heading: "A patch released is a starting gun, for both sides",
      body: [
        "It feels like a vulnerability is 'handled' once the vendor releases a patch. In reality, the patch is a starting gun. The flaw is now public, so attackers learn about it too, and they race to exploit every system that has not yet applied the fix. The defender's job is to win that race: apply the patch before an attacker reaches you.",
        "This reframes patching from a chore into a time-critical defence. For a serious, exposed flaw, the race can be measured in hours or days, not weeks. Every unpatched system in that window is an open door that attackers now know exactly how to walk through, because the disclosure often tells them how.",
      ],
      examples: [
        "The patch going public also tells attackers the flaw exists and how it works.",
        "Attackers scan the internet for systems that have not yet applied it.",
        "For a critical, exposed flaw, the race is hours to days, not weeks.",
      ],
      analogy: {
        plain: "A recall notice says 'this lock is faulty, here is the fix'. Honest owners rush to fix theirs, but thieves have just been handed a list of which locks to try first.",
        realTerm: "the patch race",
      },
    },
    {
      heading: "Exposed first: internet-facing systems can't wait",
      body: [
        "Not all unpatched systems are equally urgent, and the biggest factor is exposure. An internet-facing system, one attackers can reach directly, is in immediate danger the moment a flaw in it is public, because the whole world can try the exploit. An internal system behind other defences has a little more breathing room, though it is not safe to ignore.",
        "So the patch race is run in priority order: exposed, critical systems first. This is also why mass-exploitation events hit internet-facing software like email servers and web applications so hard, they are reachable by everyone, so a single public flaw becomes a worldwide free-for-all within days. Knowing your internet-facing attack surface, and patching it fastest, is the practical heart of winning the race.",
      ],
      examples: [
        "Internet-facing systems are reachable by everyone, so they are patched first.",
        "Internal systems have a little more time, but are not safe to ignore.",
        "Mass-exploitation events cluster on exposed software like email and web servers.",
      ],
    },
    {
      heading: "When you cannot patch instantly",
      body: [
        "Sometimes you cannot apply a patch the instant it drops: it needs testing so it does not break something, or a system cannot be taken down immediately. This does not mean doing nothing. The professional response is to reduce exposure in the meantime: restrict who can reach the system, apply any vendor-provided workaround or mitigation, and add extra monitoring, so the risk is lowered while you prepare to patch properly.",
        "This is the mature version of the patch race: move fast, but with judgement. Reckless patching can cause outages; reckless delay invites breaches. The balance is to treat critical, exposed, exploited flaws as the emergencies they are, mitigate immediately where you cannot patch instantly, and have a process so this is routine rather than panic. The Exchange case ahead shows the cost of losing this race at scale.",
      ],
      examples: [
        "Can't patch instantly: restrict access, apply a workaround, add monitoring now.",
        "Reckless patching breaks things; reckless delay invites breaches. Balance both.",
        "A real process makes the race routine instead of a panic each time.",
      ],
      analogy: {
        plain: "If you cannot install the new lock this second, you still bolt the door and watch the street. You reduce the risk now, then fit the proper fix as soon as you safely can.",
        realTerm: "interim mitigation",
      },
    },
  ],

  glossary: [
    { term: "patch", definition: "An update from a vendor that fixes a vulnerability (among other things); it only protects you once applied." },
    { term: "patch race", definition: "The time-critical sprint between a vulnerability (and often its patch) becoming public and attackers exploiting the unpatched." },
    { term: "mass exploitation", definition: "A surge of attacks against everyone running a newly public, exposed flaw, common for internet-facing software." },
    { term: "mitigation / workaround", definition: "An interim measure that reduces a flaw's risk (e.g. restricting access) when you cannot apply the full patch immediately." },
  ],

  seeHeading: "When thousands of servers fell after the fix came out",

  cases: [
    {
      org: "Microsoft Exchange (ProxyLogon)",
      year: "2021",
      headline: "Patches were released, and tens of thousands of unpatched servers were compromised anyway",
      whatHappened: "In March 2021, Microsoft released emergency patches for serious vulnerabilities in Exchange Server (collectively called ProxyLogon). Because Exchange servers are typically internet-facing and the flaws allowed deep compromise, attackers raced to exploit every server that had not yet patched, and the scale was enormous: tens of thousands of organisations worldwide were compromised in the days and weeks around the disclosure. The patch existed; the victims were those who did not apply it fast enough, often because they did not know how exposed they were or lacked a rapid patching process.",
      theMissedMeasure: "Speed and awareness. The fix was available; winning the race required knowing you ran an internet-facing Exchange server and patching (or mitigating) it immediately. Authorities issued urgent directives precisely because the exposed, exploited nature of the flaw made every unpatched hour dangerous.",
      theCost: "Tens of thousands of compromised organisations, from small businesses to large institutions, many needing extensive incident response, a stark, large-scale demonstration that 'a patch exists' means nothing until it is applied, fast, on exposed systems.",
      control: "patching",
      impact: ["patches released, yet tens of thousands of servers compromised", "internet-facing Exchange made the race brutally fast", "emergency government directives to patch immediately"],
      source: "Public record; Microsoft advisories, CISA emergency directives, and 2021 reporting.",
      brandColor: "#0078d4",
      news: { headline: "Microsoft Exchange hack: tens of thousands of servers compromised", outlet: "Mainstream and security reporting (2021)", date: "March 2021" },
    },
  ],

  lab: {
    title: "Run the patch race",
    intro: "Nothing to install and nothing leaves this page. A critical, actively-exploited flaw just got a patch, and you run the affected software. Make the fast, sound calls.",
    prompts: [
      "Find your exposure first, especially internet-facing systems.",
      "If you cannot patch instantly, reduce exposure now (access limits, workarounds, monitoring).",
      "Turn the scramble into a process so next time is routine, not panic.",
    ],
    component: PatchRaceLab,
  },

  check: {
    explain: {
      prompt: "In 2021, Microsoft released patches for Exchange, yet tens of thousands of servers were still compromised. Explain why 'a patch exists' did not make organisations safe, and what winning the patch race actually requires.",
      modelAnswer: "A released patch is a starting gun, not a finish line: making the flaw public also tells attackers it exists and how it works, so they race to exploit every system that has not yet applied the fix. Exchange servers are typically internet-facing, so the whole world could reach them, making the race brutally fast; the victims were simply those who did not patch in time, often because they did not realise how exposed they were or had no rapid process. Winning the race requires knowing your exposure (especially internet-facing systems), patching critical exposed flaws immediately, applying interim mitigations when you cannot patch instantly, and having a routine process so this is default behaviour rather than panic. 'A patch exists' protects no one until it is applied, fast, where it is most exposed.",
    },
    quiz: [
      {
        q: "Why is a released patch described as a 'starting gun'?",
        options: [
          "It means the danger is over",
          "Making the flaw public also informs attackers, who race to exploit everyone who has not yet patched",
          "It starts a countdown to the next version",
          "Patches are released at the start of the day",
        ],
        answer: 1,
        why: "Disclosure cuts both ways: defenders must apply the fix before attackers, who now know the flaw exists, reach them.",
      },
      {
        q: "Which systems must be patched most urgently, and why?",
        options: [
          "Isolated test machines, because they are easy",
          "Internet-facing systems, because the whole world can reach and attack them immediately",
          "It does not matter which order",
          "Only systems with no important data",
        ],
        answer: 1,
        why: "Exposure drives urgency. Internet-facing systems are reachable by everyone, so a public flaw in them is an immediate, worldwide risk.",
      },
      {
        q: "If you cannot apply a critical patch instantly, the right move is to:",
        options: [
          "Do nothing until you can patch",
          "Reduce exposure now, restrict access, apply a workaround, add monitoring, then patch as soon as you safely can",
          "Take the entire business offline indefinitely",
          "Disable all future updates",
        ],
        answer: 1,
        why: "You lower the risk immediately with interim mitigations, then patch properly. Doing nothing leaves the door open in the most dangerous window.",
      },
    ],
  },

  wrap: {
    headline: "You now understand the patch race, and that winning it, fast, on exposed systems, prevents a huge share of breaches.",
    takeaways: [
      "A released patch is a starting gun: attackers race to exploit everyone who has not yet applied it.",
      "Exposure sets urgency, internet-facing systems are patched first, which is why mass-exploitation hits exposed software hardest.",
      "When you cannot patch instantly, reduce exposure with mitigations, and build a process so the race is routine, not panic.",
    ],
    project: {
      name: "Rate your patch speed",
      blurb: "For your own devices or an organisation you know, ask: how quickly do critical updates actually get applied, and is anything internet-facing? Automatic updates for consumer devices are a great, easy win. Write down one way to patch faster or reduce exposure. Speed and exposure are exactly what the patch race is won on.",
    },
    ethicsNote: "Patching is pure defence. Exploiting an unpatched system you do not own, even one obviously vulnerable, is a serious offence; the race is about defending your own, or authorised, systems.",
  },
};

export default topic2;
