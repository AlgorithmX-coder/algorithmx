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
          "Once it is released, the patch instantly protects every affected system",
          "It signals that the vendor is about to stop supporting the old version",
          "Making the flaw public also tells attackers, who race to hit everyone unpatched",
          "It gives defenders a long, relaxed window in which to update calmly",
          "It means the most dangerous part of the incident is now safely over",
        ],
        answer: 2,
        reasons: [
          "A patch protects nothing until it is applied. Releasing it does not reach out and fix your systems for you.",
          "End of support is a separate event. A patch is a fix for a specific flaw, not a signal the product is retiring.",
          "Right. Disclosure cuts both ways: it hands attackers the knowledge too, and they race to exploit every system that has not yet applied the fix, so you must win that race.",
          "It is the opposite of relaxed. For a serious, exposed flaw the race can be hours or days, because attackers now know exactly what to try.",
          "The danger often spikes after release, not before. Attackers pile onto the newly public flaw, so the riskiest window is just beginning.",
        ],
      },
      {
        q: "Which systems must be patched most urgently, and why?",
        options: [
          "Internet-facing systems, because the whole world can reach and attack them at once",
          "The oldest machines, because they tend to break down and fail most often",
          "Isolated internal systems, because they are the ones holding valuable data",
          "Whichever systems happen to be the easiest and quickest to take offline",
          "The newest systems, because fresh software always has the most flaws in it",
        ],
        answer: 0,
        reasons: [
          "Right. Exposure drives urgency. An internet-facing system is reachable by everyone, so a public flaw in it is an immediate, worldwide risk and must be patched first.",
          "Reliability is not the same as attack risk. An old machine that cannot be reached from outside is less pressing than an exposed one, however it behaves.",
          "Isolated systems sit behind other defences, so they usually have a little more time. Exposure, not the data alone, sets the urgency here.",
          "Ease of taking a system offline is a convenience, not a risk measure. You patch by exposure and severity, not by what is simplest to reboot.",
          "Age does not decide urgency; exposure does. A brand-new internal system is less pressing than anything the whole internet can reach.",
        ],
      },
      {
        q: "If you cannot apply a critical patch instantly, the right move is to:",
        options: [
          "Wait quietly for the next scheduled maintenance window to apply the patch",
          "Apply the untested patch immediately to every single system you run",
          "Turn the affected software off permanently and never bring it back",
          "Reduce exposure now with access limits, a workaround and monitoring, then patch soon",
          "Assume the flaw is low risk until you see proof it is being exploited",
        ],
        answer: 3,
        reasons: [
          "Waiting for the routine window leaves the door open through the most dangerous period. A critical, exposed flaw cannot wait for the calendar.",
          "Patching blindly everywhere can cause outages of its own. The flaw needs testing where you can, with interim protection meanwhile, not a reckless rollout.",
          "Switching it off forever is rarely realistic if the business depends on it. You reduce risk and patch properly, not abandon the system.",
          "Right. You lower the risk immediately with interim mitigations, restricting access, applying a workaround and adding monitoring, then patch properly as soon as you safely can. Doing nothing is the real mistake.",
          "Waiting for proof of exploitation is exactly how organisations get caught out. A critical, exposed flaw is dangerous before anyone confirms it is being used.",
        ],
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
