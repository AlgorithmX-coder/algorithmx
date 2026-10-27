import type { TopicManifest } from "../../learn/types";
import { ContainEradicateLab } from "../../learn/conceptLabs";

/* Module 16 - Topic 2: containment vs eradication. Case: Colonial
 * Pipeline, 2021, seen from the containment-decision angle (the company
 * shut the pipeline down to contain the attack, a drastic but
 * defensible containment choice). Public record: 2021 reporting. */
const topic2: TopicManifest = {
  id: "m16t2",
  weekLabel: "Module 16",
  act: "Act 3 - Defence for real",
  title: "Containment vs eradication",
  role: "Two of the hardest, most consequential decisions in a response are how to contain an incident fast, and how to eradicate the threat fully. Understanding the difference, and the trade-offs, is central to responding well under pressure.",
  minutes: 15,
  promise: "Learn the crucial difference between stopping the bleeding and curing the wound, then see a company shut down a national pipeline to contain an attack.",
  brief: "In this lesson, we'll distinguish two stages people often confuse: containment (limiting the damage and stopping the spread, fast) and eradication (fully removing the threat and its root cause, thoroughly). We'll see why you usually contain first and eradicate after, and the hard trade-offs involved. Then we'll see Colonial Pipeline's dramatic containment decision: shutting down a major fuel pipeline to stop an attack spreading.",

  learn: [
    {
      heading: "Stop the bleeding, then cure the wound",
      body: [
        "Containment and eradication are different jobs with different goals. Containment is about limiting the damage right now and stopping the spread: isolating an infected machine, blocking the attacker's control channel, disabling a compromised account. It is fast and often temporary, buying time and preventing things getting worse. Eradication comes after: fully removing the threat, the malware, every foothold, and the root cause that let it in, so it cannot simply return.",
        "The medical analogy is exact: containment is stopping the bleeding (urgent, stabilising); eradication is curing the underlying wound (thorough, lasting). You almost always contain first, because stopping the damage spreading is the immediate priority, and eradicate second, once the situation is stable and you understand it. Confusing the two, or skipping straight to 'clean up' without containing, lets the incident keep spreading while you work.",
      ],
      examples: [
        "Containment: isolate the machine, block the attacker's channel, disable the account (fast).",
        "Eradication: remove all malware and footholds, and fix the root cause (thorough).",
        "Contain first (stop the spread), eradicate after (once stable and understood).",
      ],
      analogy: {
        plain: "A paramedic stops the bleeding at the scene (containment); the surgeon later repairs the wound properly (eradication). Different urgency, different depth, both needed.",
        realTerm: "containment vs eradication",
      },
    },
    {
      heading: "Containment is full of hard trade-offs",
      body: [
        "Containment decisions are rarely easy, because the fastest way to stop an attack can also hurt the business. Disconnecting systems stops the spread but may halt operations; shutting something down contains the threat but costs money and disruption. The responder must weigh the harm of the attack spreading against the harm of the containment action itself, often with incomplete information and under intense time pressure.",
        "There is also a subtle trap: containment should not destroy the evidence you will need to understand and eradicate the threat (and possibly for legal action, the next topic). Pulling the plug can wipe volatile evidence; acting too hastily can tip off an attacker or lose the trail. Good containment is fast but considered: stop the spread, but preserve what you need. These are exactly the judgement calls the Colonial Pipeline case involved.",
      ],
      examples: [
        "The fastest containment (disconnect, shut down) can also halt the business.",
        "Weigh the harm of spread against the harm of the containment action.",
        "Contain without needlessly destroying evidence you will need.",
      ],
    },
    {
      heading: "Eradication must be thorough, or the attacker returns",
      body: [
        "Eradication's challenge is thoroughness. Attackers often leave multiple footholds, backdoors, extra accounts, persistence mechanisms, precisely so that removing the obvious malware does not remove their access. Incomplete eradication is a classic, costly mistake: the organisation declares victory, reconnects, and the attacker, still present through a missed backdoor, simply resumes. You must remove everything and fix the root cause that let them in.",
        "This is why eradication depends on properly understanding the incident first (how far did it spread? what did the attacker touch and leave?), which is why rushing hurts. It is also why recovery (the next stage) should only reconnect systems once you are confident the threat is truly gone. Thorough eradication, informed by a real investigation, is what turns 'we cleaned it up' into 'they are actually out', and stops the same incident happening again next week.",
      ],
      examples: [
        "Attackers leave multiple footholds so removing the obvious malware is not enough.",
        "Incomplete eradication: declare victory, reconnect, and the attacker resumes.",
        "Remove everything and fix the root cause, informed by a real investigation.",
      ],
      analogy: {
        plain: "Pulling out the visible weed but leaving the roots means it grows straight back. Eradication means getting the whole root, or you are back where you started.",
        realTerm: "thorough eradication",
      },
    },
  ],

  glossary: [
    { term: "containment", definition: "Limiting the damage and stopping the spread of an incident quickly, often temporarily, to buy time and prevent things getting worse." },
    { term: "eradication", definition: "Fully removing the threat, every foothold, and the root cause, so it cannot return; done thoroughly after containment." },
    { term: "volatile evidence", definition: "Evidence that is lost when a system is powered off or changed (like the contents of memory); containment must avoid needlessly destroying it." },
    { term: "persistence (attacker)", definition: "Mechanisms an attacker leaves to keep access; incomplete eradication that misses them lets the attacker resume." },
  ],

  seeHeading: "When containment meant shutting down a pipeline",

  cases: [
    {
      org: "Colonial Pipeline (containment)",
      year: "2021",
      headline: "A company shut down a major fuel pipeline to contain a ransomware attack",
      whatHappened: "In the 2021 Colonial Pipeline ransomware attack (which you met in Module 6), one of the most consequential decisions was a containment choice: faced with ransomware in its systems, Colonial shut down the pipeline itself to contain the attack and prevent it spreading to the operational systems that run the fuel distribution. This drastic containment action stopped the attack's potential spread, but it also halted a major fuel supply, triggering shortages, a textbook example of the hard trade-off between the harm of the attack and the harm of the containment.",
      theMissedMeasure: "The prevention gaps (access control, MFA) were covered earlier. This topic's lesson is the containment decision itself: shutting down was a defensible choice to contain the threat, and it illustrates vividly that containment is often a painful trade-off weighed under pressure, where stopping the spread can itself cause major disruption.",
      theCost: "Days of pipeline shutdown and regional fuel shortages, caused in part by the containment decision, which nonetheless prevented a potentially worse spread. A defining illustration of how consequential, and difficult, containment choices can be.",
      control: "access-control",
      impact: ["pipeline shut down to contain the attack", "stopped potential spread but halted fuel supply", "a textbook hard containment trade-off"],
      source: "Public record; 2021 reporting.",
      brandColor: "#c0392b",
      news: { headline: "Colonial Pipeline shut down to contain ransomware attack", outlet: "Mainstream reporting (2021)", date: "May 2021" },
    },
  ],

  lab: {
    title: "Containment or eradication?",
    intro: "Nothing to install and nothing leaves this page. For each action, decide: is it containment (limit damage now), or eradication (remove the threat fully)?",
    prompts: [
      "Containment is fast and limits the spread; eradication is thorough and removes the threat.",
      "Isolating, blocking, disabling: containment. Removing malware, rebuilding clean, closing the flaw: eradication.",
      "You contain first, then eradicate.",
    ],
    component: ContainEradicateLab,
  },

  check: {
    explain: {
      prompt: "Explain the difference between containment and eradication, why you usually contain first, and the hard trade-off the Colonial Pipeline containment decision illustrates.",
      modelAnswer: "Containment is limiting the damage and stopping the spread right now, isolating an infected machine, blocking the attacker's control channel, disabling a compromised account, fast and often temporary, to buy time and prevent things getting worse. Eradication comes after: fully removing the threat, every foothold, and the root cause that let it in, done thoroughly so it cannot return. You usually contain first because stopping the damage spreading is the immediate priority, then eradicate once the situation is stable and understood; skipping straight to clean-up lets the incident keep spreading while you work, and incomplete eradication that misses a backdoor lets the attacker simply resume. The Colonial Pipeline decision illustrates the hard trade-off in containment: faced with ransomware, the company shut down the pipeline itself to contain the attack and stop it spreading to operational systems, which prevented a potentially worse spread but also halted a major fuel supply and caused regional shortages. It shows that the fastest containment can itself cause serious harm, so responders must weigh the damage of the attack spreading against the damage of the containment action, often under intense pressure with incomplete information.",
    },
    quiz: [
      {
        q: "What is the difference between containment and eradication?",
        options: [
          "Containment removes the threat and root cause fully; eradication merely slows the spread",
          "Eradication stops the spread quickly; containment fixes the root cause much later on",
          "Containment limits damage and stops the spread now; eradication fully removes the threat and root cause after",
          "Containment restores systems from clean backup; eradication just watches for any new attacks",
          "Containment and eradication are two names for the very same clean-up step",
        ],
        answer: 2,
        reasons: [
          "This reverses the two. Containment limits the damage now; it is eradication that removes the threat and its root cause fully.",
          "The roles are swapped. Containment is the fast step that stops the spread; eradication is the thorough step that fixes the root cause.",
          "Right. Stop the bleeding first with fast containment, then cure the wound with thorough eradication. You contain first, eradicate after.",
          "Restoring from backup is recovery, not containment, and eradication is active removal, not passive monitoring. Both halves are wrong.",
          "They are distinct stages with different goals: containment is fast and limits spread, eradication is thorough and removes the threat.",
        ],
      },
      {
        q: "Why must eradication be thorough?",
        options: [
          "Because getting systems reconnected quickly always matters more than fully removing the threat",
          "Because containment will already have wiped out every last trace of the attacker",
          "Because the fastest clean-up you can manage is reliably the most complete one too",
          "Because attackers leave several footholds, so clearing the obvious malware leaves a backdoor to resume through",
          "Because a thorough job mainly makes the incident report look more professional afterwards",
        ],
        answer: 3,
        reasons: [
          "Speed can matter, but reconnecting before the threat is fully gone is exactly the mistake that lets an attacker walk straight back in.",
          "Containment limits the spread; it does not remove the attacker. Footholds left behind survive containment and must still be eradicated.",
          "Rushing usually misses things. The fastest clean-up is often the least complete, which is how backdoors get left in place.",
          "Right. Incomplete eradication is a classic mistake: declare victory, reconnect, and the still-present attacker resumes. Remove everything and fix the root cause.",
          "A professional report is nice, but that is not why. Thoroughness is about actually removing the attacker so they cannot return.",
        ],
      },
      {
        q: "The Colonial Pipeline shutdown illustrates that containment:",
        options: [
          "Can nearly always be carried out without affecting business operations at all",
          "Should be delayed until the threat has been fully understood by the team",
          "Is only ever a matter of isolating one single infected laptop somewhere",
          "Works best when you simply pull the plug on absolutely everything at once",
          "Often involves a hard trade-off, where the fastest way to stop the spread does harm",
        ],
        answer: 4,
        reasons: [
          "If only. The pipeline shutdown stopped the spread but also halted a major fuel supply, which is anything but free of business impact.",
          "Waiting to act can let the attack spread further. The usual rule is to contain fast, then take time to understand and eradicate.",
          "Isolating one machine is one form of containment, but containment can also mean shutting a whole pipeline down, as this case shows.",
          "Pulling everything offline at once can needlessly destroy evidence and halt the business. Good containment is fast but considered, not blunt.",
          "Right. Shutting the pipeline contained the threat but halted fuel supply: a painful trade-off weighed under pressure, exactly what containment decisions involve.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You can now distinguish the two hardest response decisions: contain fast, then eradicate thoroughly.",
    takeaways: [
      "Containment limits damage and stops the spread now; eradication removes the threat and root cause thoroughly after.",
      "Containment is full of hard trade-offs (the fast fix can hurt the business) and must not needlessly destroy evidence.",
      "Eradication must be thorough, informed by investigation, or a missed foothold lets the attacker return.",
    ],
    project: {
      name: "Plan your first moves",
      blurb: "For a scenario like 'a work laptop is infected with ransomware', write your containment actions (what you would do in the first minutes to limit damage) separately from your eradication actions (how you would fully remove the threat afterwards). Separating the two, and sequencing them, is exactly the clear thinking a responder needs under pressure.",
    },
    ethicsNote: "Containment and eradication are performed on your own organisation's systems under proper authority, balancing harm and preserving evidence. This is the constructive work of limiting an incident, within the Module 5 principles.",
  },
};

export default topic2;
