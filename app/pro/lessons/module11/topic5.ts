import type { TopicManifest } from "../../learn/types";
import { EndOfLifeLab } from "../../learn/conceptLabs";

/* Module 11 - Topic 5: end-of-life software and the human problem.
 * Case: BlueKeep (CVE-2019-0708), a wormable Windows RDP flaw so severe
 * that Microsoft took the rare step of issuing patches even for out-of-
 * support systems (like Windows XP) in 2019. Public record: Microsoft
 * advisories, NCSC/NSA warnings, and 2019 reporting. */
const topic5: TopicManifest = {
  id: "m11t5",
  weekLabel: "Module 11",
  act: "Act 2 - How attacks happen",
  title: "End-of-life, and the human problem",
  role: "The hardest security problems are rarely purely technical. End-of-life software, systems that can no longer be patched, is a perfect example: the fix is 'known', but cost, compatibility and inertia make it hard. Understanding this human and organisational reality is what separates realistic defenders from naive ones.",
  minutes: 16,
  promise: "Understand why unsupported software is a permanent open door, and why fixing it is so hard, then see a flaw so dangerous that even retired systems got an emergency patch.",
  brief: "In this lesson, we'll close Act 2 with a problem that is as much human as technical: end-of-life software. When a product stops being supported, it stops getting security patches, so any new flaw in it is never fixed, a door that can never be closed. We'll see why organisations end up stuck on such systems, and what to do about it. Then we'll study BlueKeep, a flaw so dangerous that its maker patched even long-retired systems.",

  learn: [
    {
      heading: "End-of-life means the patches stop forever",
      body: [
        "Every piece of software eventually reaches end-of-life: the point where its maker stops supporting it, including stopping security patches. From that moment, any new vulnerability discovered in it will never be fixed. The patch race you learned about does not even start, because there is no patch coming, ever. An exposed end-of-life system is therefore a permanent open door.",
        "This is a different and more serious situation than a system that is merely behind on patches. A patchable system can be brought up to date; an end-of-life one cannot. As attackers keep finding new flaws, an unsupported system only gets more dangerous over time, accumulating unfixable weaknesses. Knowing which of your systems are approaching or past end-of-life is essential, and often uncomfortable, knowledge.",
      ],
      examples: [
        "End-of-life: the maker stops all support, including security patches.",
        "New flaws in it are never fixed, the patch race never even begins.",
        "It gets more dangerous over time as unfixable weaknesses accumulate.",
      ],
      analogy: {
        plain: "It is a car the manufacturer no longer makes any safety parts for. However carefully you drive, a newly discovered fault can never be properly repaired, and the risk only grows.",
        realTerm: "end-of-life (EOL) software",
      },
    },
    {
      heading: "Why organisations get stuck",
      body: [
        "If end-of-life software is so dangerous, why does so much of it linger? Because the reasons are rarely about ignorance, they are about cost, compatibility and risk of change. Upgrading can be expensive and disruptive. Critical business software, or specialist equipment, may only run on the old system and have no supported replacement. In some industries, machines like medical devices or industrial controllers run embedded software that is hard or risky to update. And there is plain inertia: 'it still works, why touch it?'.",
        "Understanding these pressures is what makes a defender realistic and effective. Simply declaring 'just upgrade everything' ignores the genuine constraints organisations face and gets ignored in turn. The valuable professional is the one who grasps the real-world difficulty and finds a workable path: planning migrations early, budgeting for them, and protecting the legacy systems that genuinely cannot move yet.",
      ],
      examples: [
        "Cost and disruption: upgrades are expensive and risky to the business.",
        "Compatibility: critical software or equipment may only run on the old system.",
        "Embedded and specialist systems (medical, industrial) are hard to update.",
        "Inertia: 'it still works' is a powerful, dangerous comfort.",
      ],
    },
    {
      heading: "What to actually do about it",
      body: [
        "The real answer has two parts. First and best: plan ahead. Know your software's end-of-life dates, keep an inventory of what is ageing out, and budget and schedule migrations before support ends, so you are never caught running something unsupported and exposed. Getting ahead of the deadline is the only clean solution.",
        "Second, for the genuinely stuck systems that truly cannot be replaced yet: contain them. Isolate the legacy system with tight segmentation so a flaw in it cannot be reached from the internet or spread across the network, restrict who and what can talk to it, and monitor it closely. You are buying time and limiting blast radius, not pretending the problem is solved. The BlueKeep case shows both the danger of exposed end-of-life systems and the extraordinary lengths a vendor went to when one such flaw was severe enough.",
      ],
      examples: [
        "Best: inventory end-of-life dates and migrate before support ends.",
        "If truly stuck: isolate, segment, restrict access, and monitor closely.",
        "Containment buys time and limits blast radius; it does not 'solve' it.",
      ],
      analogy: {
        plain: "If you must keep using an unrepairable old machine a while longer, you fence it off, limit who uses it, and watch it carefully, while you arrange its replacement. You do not just leave it running in the open.",
        realTerm: "isolate and plan migration",
      },
    },
  ],

  glossary: [
    { term: "end-of-life (EOL)", definition: "The point at which software stops being supported, including security patches, so new flaws in it are never fixed." },
    { term: "legacy system", definition: "An old system still in use, often because critical software or equipment depends on it, that may be hard or risky to replace." },
    { term: "embedded software", definition: "Software built into devices like medical, industrial or network equipment, often hard to update and long-lived." },
    { term: "migration", definition: "Moving from an old or end-of-life system to a supported replacement; the clean, if costly, solution to EOL risk." },
  ],

  seeHeading: "The flaw that got even retired systems a patch",

  cases: [
    {
      org: "BlueKeep (Windows RDP)",
      year: "2019",
      headline: "A flaw so dangerous that Microsoft patched even long-unsupported systems",
      whatHappened: "In 2019, a critical vulnerability nicknamed BlueKeep (CVE-2019-0708) was found in the Remote Desktop service of older Windows versions. It was wormable, meaning it could spread automatically between vulnerable machines, raising fears of a WannaCry-scale outbreak. Crucially, it affected systems already past end-of-life, such as Windows XP. Microsoft took the rare and striking step of releasing patches even for those unsupported systems, and security agencies urged everyone, especially organisations running old Windows, to patch immediately. The feared mass-worm outbreak was largely averted, in good part because of the urgent, widespread patching.",
      theMissedMeasure: "The deeper issue was all the end-of-life Windows still in use, exactly the systems that normally get no patches. BlueKeep was a reminder to find and address unsupported systems, by migrating, isolating, or at minimum applying the exceptional patch, before a wormable flaw turns them into an outbreak.",
      theCost: "A major global scramble and real risk of a WannaCry-scale event, averted largely by the unusual emergency patching and urgent warnings, a vivid illustration of both the danger of lingering end-of-life systems and the extraordinary measures their existence can force.",
      control: "patching",
      impact: ["wormable flaw affecting end-of-life Windows (incl. XP)", "Microsoft issued rare patches for unsupported systems", "a feared WannaCry-scale outbreak was largely averted"],
      source: "Public record; Microsoft advisories, NCSC/NSA warnings, and 2019 reporting.",
      brandColor: "#2d7d9a",
      news: { headline: "BlueKeep: Microsoft issues rare patch for old Windows over wormable flaw", outlet: "Mainstream and security reporting (2019)", date: "2019" },
    },
  ],

  lab: {
    title: "Sound or risky with legacy?",
    intro: "Nothing to install and nothing leaves this page. For each way of handling end-of-life software, decide: a sound approach, or a risky one?",
    prompts: [
      "The clean answer is to migrate before support ends.",
      "If genuinely stuck, contain: isolate, segment, restrict, and monitor.",
      "'It still works' and 'exposed to the internet' are the danger signs.",
    ],
    component: EndOfLifeLab,
  },

  check: {
    explain: {
      prompt: "BlueKeep affected end-of-life Windows, yet Microsoft patched even those unsupported systems. Explain why end-of-life software is so dangerous, why organisations get stuck on it, and what a realistic defender does about it.",
      modelAnswer: "End-of-life software is dangerous because its maker has stopped all support, including security patches, so any new flaw in it is never fixed, the patch race never even starts, and an exposed unsupported system is a permanent open door that only gets worse as new flaws accumulate. Organisations get stuck on it not usually through ignorance but because of real pressures: cost and disruption of upgrading, critical software or specialist equipment that only runs on the old system, hard-to-update embedded devices, and plain inertia. A realistic defender does not just say 'upgrade everything'; they plan ahead by inventorying end-of-life dates and migrating before support ends, and for systems that genuinely cannot move yet, they contain them, isolating and segmenting so a flaw cannot be reached or spread, restricting access, and monitoring closely. BlueKeep shows both the danger of lingering unsupported systems and the extraordinary step, patching retired systems, their existence can force.",
    },
    quiz: [
      {
        q: "Why is end-of-life software especially dangerous?",
        options: [
          "It runs more slowly and uses far more power than modern software does",
          "It is guaranteed to be infected with malware the moment it goes unsupported",
          "It is no longer able to run any modern applications at all",
          "It costs more to license than a fully supported, current version would",
          "It no longer gets security patches, so new flaws are never fixed: a permanent open door",
        ],
        answer: 4,
        reasons: [
          "Speed and power use are not the security problem. The danger is that no patches come, not that it runs slowly.",
          "End-of-life does not mean already infected. The risk is that future flaws can never be fixed, leaving it open to attack over time.",
          "It may still run plenty of applications. The danger is the missing security patches, not what software it can or cannot launch.",
          "Licensing cost is not the security issue, and unsupported software is often cheaper, not dearer. The danger is that new flaws go unpatched forever.",
          "Right. Unlike a system merely behind on updates, an end-of-life one cannot be patched at all, so new flaws are never fixed and it becomes a permanent, worsening open door.",
        ],
      },
      {
        q: "Why do organisations often get stuck running end-of-life software?",
        options: [
          "Because upgrading to supported software would always make them less secure",
          "Because older software is simply more reliable and safer than new software",
          "Real pressures: cost, software or equipment tied to it, embedded devices, and inertia",
          "Because end-of-life software costs far more to license than current versions",
          "Because regulators require certain industries to keep the original software",
        ],
        answer: 2,
        reasons: [
          "Upgrading to supported software generally makes you more secure, not less. Fear of change is a pressure, but not because upgrades reduce security.",
          "Older software is not safer; it accumulates unfixable flaws. The reasons organisations stay are practical constraints, not genuine security gains.",
          "Right. The reasons are usually practical, not ignorance: the cost and disruption of upgrading, critical software or equipment that only runs on the old system, hard-to-update embedded devices, and plain inertia. That is why realistic defenders find workable paths rather than just saying 'upgrade'.",
          "Unsupported software is usually cheaper to license, not dearer. The cost of the upgrade itself is a factor, but not the licence of the old version.",
          "Regulation rarely forces old software on anyone; more often it pushes the other way. The real reasons are cost, compatibility and inertia.",
        ],
      },
      {
        q: "For a legacy system that genuinely cannot be replaced yet, the right approach is to:",
        options: [
          "Install extra antivirus on it and otherwise carry on using it as normal",
          "Connect it straight to the internet so it can fetch any updates itself",
          "Rely on staff being careful and sensible whenever they use the system",
          "Contain it: isolate and segment it, restrict access, and monitor it closely",
          "Leave it exactly as it is, since no new flaw is certain to appear",
        ],
        answer: 3,
        reasons: [
          "Extra antivirus does not close an unpatchable flaw, and carrying on as normal leaves it exposed. You need to contain it, not just add a tool.",
          "An end-of-life system gets no updates to fetch, and exposing it to the internet is the worst thing you can do. Containment means the opposite: cut off that reach.",
          "Careful staff cannot stop a remote flaw being exploited. Relying on people is not a control for an unpatchable system; containment is.",
          "Right. Containment limits the blast radius and buys time: isolate and segment the system so a flaw cannot be reached or spread, restrict access, and monitor it closely while you plan migration. It does not solve the problem, but it is far safer than leaving it exposed.",
          "Hoping no new flaw appears is exactly the gamble end-of-life systems lose. New flaws keep being found, and this one can never be patched.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You finished Module 8 through 11, and all of Act 2: you understand how attacks happen, and the realities of defending against them.",
    takeaways: [
      "End-of-life software gets no more patches, so new flaws are never fixed, a permanent, worsening open door.",
      "Organisations get stuck on it for real reasons (cost, compatibility, embedded systems, inertia), not just negligence.",
      "The answer is to plan migrations before support ends, and to isolate, restrict and monitor the systems that genuinely cannot move yet.",
    ],
    project: {
      name: "Write your vulnerability-assessment note",
      blurb: "Pull this module together into a short vulnerability-assessment note for a system or small environment you know: list its key software, note anything near or past end-of-life, give your fix-first priorities with reasons, and name one legacy risk and how you would contain it. This is your Act 2 portfolio piece, a realistic, defensible snapshot of risk and action, exactly what the job produces.",
    },
    ethicsNote: "Assessing and remediating vulnerabilities, including end-of-life risk, is defensive work on your own or authorised systems. Finishing Act 2, remember that every attack technique you have learned was studied to recognise, prevent and defend, always within the authorisation line set in Module 5. Act 3 turns to defending for real.",
  },
};

export default topic5;
