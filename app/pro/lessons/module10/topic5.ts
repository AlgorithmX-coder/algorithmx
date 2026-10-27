import type { TopicManifest } from "../../learn/types";
import { LateralMovementLab } from "../../learn/conceptLabs";

/* Module 10 - Topic 5: moving sideways (lateral movement) and how
 * segmentation stops it. Case: Equifax, 2017 (attackers exploited an
 * unpatched Apache Struts flaw, then moved laterally through poorly
 * segmented systems and used found credentials to reach many databases,
 * exposing ~147M people). Public record: US House Oversight Committee
 * report and 2017-2019 reporting. */
const topic5: TopicManifest = {
  id: "m10t5",
  weekLabel: "Module 10",
  act: "Act 2 - How attacks happen",
  title: "Moving sideways, and stopping it",
  role: "Attackers rarely land where the treasure is; they land somewhere small and move toward it. Lateral movement, and the segmentation and least privilege that stop it, is the difference between a contained incident and a catastrophic breach, which is why it is core defensive design.",
  minutes: 17,
  promise: "See how one small foothold becomes a whole-network breach, then study the breach where moving sideways exposed 147 million people.",
  brief: "In this lesson, we'll close Act 2's network attacks with the move that turns a minor intrusion into a disaster: lateral movement. Attackers land on some ordinary machine and then move sideways toward the valuable systems. We'll see why a 'flat' network is a gift to them, and how segmentation, least privilege and monitoring contain the damage. Then we'll study Equifax, where exactly this sideways movement exposed the data of nearly half the US population.",

  learn: [
    {
      heading: "Attackers land small and move toward the prize",
      body: [
        "An attacker rarely gets their first foothold on the exact system holding the valuable data. They land somewhere reachable, an ordinary laptop, a web server, a forgotten machine, and then move sideways, from system to system, hunting for the credentials, access and data they actually want. This is lateral movement, and it is where a huge amount of real breach damage happens.",
        "Understanding this reframes defence. The perimeter, keeping attackers out, matters, but it will sometimes fail. What often decides whether a failure becomes a catastrophe is what happens next: how far can that first foothold reach? An attacker contained to one unimportant machine is a minor incident; one who can roam freely to the crown jewels is a disaster.",
      ],
      examples: [
        "The first foothold is usually not the target, just a way in.",
        "The attacker then moves sideways, hunting credentials and access.",
        "The damage depends on how far that foothold can reach.",
      ],
      analogy: {
        plain: "A burglar who gets into the garage is a small problem if the internal doors are locked, and a disaster if the garage opens straight onto every room in the house.",
        realTerm: "lateral movement",
      },
    },
    {
      heading: "Why flat networks are a gift to attackers",
      visual: { id: "network-spread", mode: "lateral" },
      body: [
        "A 'flat' network is one where, once you are inside, everything can reach everything else. It is convenient to run, which is exactly why it is common, and it is catastrophic under attack: a single foothold anywhere gives the attacker a clear path to everywhere. Many of the worst breaches in history, including ones you have already seen, spread so far precisely because the internal network was flat.",
        "The answer is segmentation: dividing the network into zones with controlled boundaries, so that a foothold in one zone cannot freely reach another. Combined with least privilege (accounts can only touch the few things they genuinely need), segmentation means a compromised machine or account is worth far less, because it simply cannot get to much. This is defence in depth from Module 1, applied inside the walls.",
      ],
      examples: [
        "Flat network: one foothold reaches everything, a disaster waiting to happen.",
        "Segmentation: zones with controlled boundaries contain a foothold.",
        "Least privilege: a compromised account can only reach a little, so it is worth little.",
      ],
    },
    {
      heading: "Assume breach, and watch the inside",
      body: [
        "The modern defensive mindset is 'assume breach': plan not only to keep attackers out, but for the day one gets in anyway. That means watching for movement inside the network, not just at the perimeter. Unusual internal activity, an account suddenly reaching systems it never touches, logins at odd hours, connections between machines that never talk, is often the clearest sign of an attacker moving sideways, and catching it early stops a foothold before it reaches the goal.",
        "So the complete answer to lateral movement is layered: segmentation and least privilege to limit how far a foothold can reach, and monitoring to detect movement that does happen. The Equifax breach you are about to see is the cautionary tale: a foothold from one unpatched system, poor internal segmentation, found credentials, and the result was one of the largest exposures of personal data in history.",
      ],
      examples: [
        "Assume breach: plan for an attacker getting in, not just for keeping them out.",
        "Watch internal activity: unusual lateral movement is a key early warning.",
        "Layer it: limit reach (segmentation, least privilege) and detect movement (monitoring).",
      ],
      analogy: {
        plain: "A good building has locked internal doors (segmentation), keys that open only the rooms you need (least privilege), and cameras in the corridors (monitoring), not just a strong front door.",
        realTerm: "assume breach / defence in depth",
      },
    },
  ],

  glossary: [
    { term: "lateral movement", definition: "An attacker moving from their first foothold to other, more valuable systems inside the same network." },
    { term: "flat network", definition: "A network where everything can reach everything once inside; convenient to run, but catastrophic under attack." },
    { term: "segmentation", definition: "Dividing a network into zones with controlled boundaries, so a foothold in one zone cannot freely reach another." },
    { term: "assume breach", definition: "A mindset that plans for an attacker getting in, emphasising limiting reach and detecting internal movement, not just the perimeter." },
  ],

  seeHeading: "When moving sideways exposed 147 million people",

  cases: [
    {
      org: "Equifax",
      year: "2017",
      headline: "An unpatched flaw and poor internal segmentation exposed nearly half of America",
      whatHappened: "In 2017, attackers breached the credit agency Equifax by exploiting a known, unpatched vulnerability in a web application (Apache Struts). From that initial foothold, they were able to move laterally through poorly segmented internal systems and, using credentials they found along the way, reach numerous databases. Over several weeks they extracted the sensitive personal data, including names, dates of birth and social-security numbers, of around 147 million people, one of the largest breaches of personal data ever.",
      theMissedMeasure: "Several compounding failures: the initial flaw was known and patchable but left unpatched; internal segmentation was poor, so a single foothold could reach far too much; and credentials were accessible to the attacker as they moved. Patching, segmentation, least privilege and better monitoring each could have limited the damage.",
      theCost: "The exposure of deeply sensitive personal data for around 147 million people, enormous financial settlements and penalties, and lasting reputational damage, a textbook demonstration of how an unpatched entry point plus unrestricted lateral movement turns a breach into a catastrophe.",
      control: "patching",
      impact: ["~147 million people's sensitive data exposed", "entry via a known, unpatched flaw", "poor segmentation let the foothold reach many databases"],
      source: "Public record; the US House Oversight Committee report and 2017-2019 reporting.",
      brandColor: "#981e32",
      news: { headline: "Equifax breach: how an unpatched flaw exposed 147 million people", outlet: "Mainstream and security reporting (2017-2019)", date: "2017" },
    },
  ],

  lab: {
    title: "Contain the foothold",
    intro: "Nothing to install and nothing leaves this page. An attacker has compromised one ordinary laptop. Make the choices that limit how far they can reach.",
    prompts: [
      "Assume breach: the goal is to limit the blast radius, not just the perimeter.",
      "Segmentation and least privilege shrink how far a foothold can go.",
      "Monitoring internal activity is how you catch sideways movement early.",
    ],
    component: LateralMovementLab,
  },

  check: {
    explain: {
      prompt: "Equifax was breached through one unpatched web application, yet the attackers reached the data of 147 million people. Explain the role of lateral movement, and how segmentation and 'assume breach' would have limited the damage.",
      modelAnswer: "The attackers' initial foothold was a single unpatched web application, not the valuable databases themselves. From there they moved laterally, from system to system, using credentials they found, because the internal network was poorly segmented and let a foothold reach far too much. That sideways movement is what turned one entry point into access to numerous databases and 147 million records. Segmentation would have divided the network into zones with controlled boundaries, so the initial foothold could not freely reach the sensitive data; least privilege would have meant the credentials they found could touch very little. An 'assume breach' mindset would have added monitoring of internal activity to catch the lateral movement early. Together, limiting reach and detecting movement, they would have contained the incident instead of allowing a catastrophe. (Patching the known flaw would also have stopped it ever starting.)",
    },
    quiz: [
      {
        q: "What is lateral movement?",
        options: [
          "An attacker moving from a first foothold toward more valuable systems inside",
          "An attacker escalating to full administrator rights on one machine",
          "Spreading malware outward to external partner organisations",
          "Copying stolen data out of the network back to the attacker",
          "Breaking through the perimeter firewall from the outside",
        ],
        answer: 0,
        reasons: [
          "Right. Attackers rarely land on the target; they land somewhere reachable and move sideways toward the credentials, access and data they want.",
          "That is privilege escalation, gaining more power on one machine. Lateral movement is about reaching other machines, not climbing on one.",
          "Spreading to outside organisations is a different problem. Lateral movement happens inside the one network the attacker has entered.",
          "Copying data out is exfiltration, the final step. Lateral movement is the sideways journey that gets the attacker to that data first.",
          "Breaking in is initial access, how the foothold is won. Lateral movement is what happens afterwards, moving on from that first foothold.",
        ],
      },
      {
        q: "Why is a 'flat' network so dangerous?",
        options: [
          "It exposes every internal machine directly to the public internet",
          "Once inside, an attacker can reach everything, so one foothold opens the lot",
          "It forces all of the traffic through one slow central chokepoint",
          "It stops administrators from ever applying their security patches",
          "It encrypts internal traffic so that defenders cannot inspect it",
        ],
        answer: 1,
        reasons: [
          "A flat network is about internal reach, not internet exposure. The danger is inside: once in, the attacker can go anywhere.",
          "Right. A flat network gives a foothold free rein, so one entry point becomes a path to everything. Segmentation divides it into zones to contain the damage.",
          "A flat network is not a chokepoint; it is the opposite, open internal reach. Slowness is not the issue, unrestricted movement is.",
          "Flatness has nothing to do with patching. The problem is that any foothold can reach any system once inside.",
          "A flat network does not imply encrypted internal traffic. Its danger is free internal movement, not hidden traffic.",
        ],
      },
      {
        q: "What does an 'assume breach' mindset add to perimeter defence?",
        options: [
          "Building one single, much thicker and stronger perimeter wall",
          "Assuming that attackers will simply never get past the firewall",
          "Encrypting all of the data so a breach reveals nothing at all",
          "Planning for an attacker getting in: limiting reach and watching internal movement",
          "Moving every system into the cloud to avoid being targeted",
        ],
        answer: 3,
        reasons: [
          "A thicker wall is still just the perimeter. Assume-breach is about what happens after the wall is breached, not about making it taller.",
          "That is the mindset assume-breach rejects. It expects the perimeter to fail sometimes and prepares for exactly that.",
          "Encryption helps protect data, but it is not what assume-breach adds. The idea is to limit reach and watch for movement inside.",
          "Right. Perimeters sometimes fail, so assume-breach limits the blast radius with segmentation and least privilege and detects lateral movement early.",
          "Moving to the cloud does not remove the threat; attackers still win footholds there. Assume-breach is about containing and spotting them wherever you run.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You finished Act 2's attacks: you understand how a small foothold becomes a catastrophe, and how to contain it.",
    takeaways: [
      "Attackers land small and move laterally toward the valuable systems; the damage depends on how far a foothold can reach.",
      "Flat networks let a foothold reach everything; segmentation and least privilege contain it.",
      "'Assume breach' adds internal monitoring to catch lateral movement early, turning a potential disaster into a contained incident.",
    ],
    project: {
      name: "Picture the blast radius",
      blurb: "For a network you know (home or work), ask: if one device were compromised, what else could it reach? Could the attacker get from a laptop to the important data in one hop, or many? Sketch it. Thinking in 'blast radius' is exactly how defenders decide where segmentation and least privilege matter most.",
    },
    ethicsNote: "Moving through a network you are not authorised to test, even from a legitimate foothold, is unauthorised access under the Computer Misuse Act (Module 5). Lateral movement is studied here to contain and detect it, defensively.",
  },
};

export default topic5;
