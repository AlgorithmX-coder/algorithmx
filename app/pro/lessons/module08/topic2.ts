import type { TopicManifest } from "../../learn/types";
import { RansomwareResponseLab } from "../../learn/conceptLabs";

/* Module 8 - Topic 2: ransomware, how it holds you hostage. Case:
 * WannaCry, May 2017 (a wormable ransomware that exploited an unpatched
 * Windows flaw, EternalBlue, to spread globally and hit the NHS hard).
 * Public record: NHS/NAO reports and 2017 reporting. */
const topic2: TopicManifest = {
  id: "m8t2",
  weekLabel: "Module 8",
  act: "Act 2 - How attacks happen",
  title: "Ransomware: held hostage",
  role: "Ransomware is the threat that keeps executives awake, and responding to it, or better, being ready for it, is core security work. Understanding how it holds you hostage, and why backups beat ransoms, is knowledge every organisation needs and too few have.",
  minutes: 18,
  promise: "Understand exactly how ransomware takes you hostage, then see the outbreak that forced hospitals to turn patients away.",
  brief: "In this lesson, we'll look at ransomware: how it works, why it is so effective, and how to respond without making things worse. We'll see that the real defence is not a magic tool but boring, tested backups and fast patching. Then we'll study WannaCry, the 2017 outbreak that spread across the world in hours and hit the NHS so hard that operations were cancelled and patients diverted.",

  learn: [
    {
      heading: "How ransomware takes you hostage",
      body: [
        "Ransomware's mechanism is brutally simple. Once it runs on a system, it encrypts your files, scrambling them with a key only the attacker holds, and then demands payment, usually in cryptocurrency, in exchange for that key. Your data is still there, but it is unreadable, and without the key you cannot get it back. Modern ransomware often spreads across the whole network first, encrypting as much as it can reach before revealing itself.",
        "Many groups now add a second threat: before encrypting, they steal a copy of your data and threaten to publish it unless you pay. This 'double extortion' means that even an organisation with perfect backups still faces the leak of its sensitive information. The pressure is deliberate and total: your operations stop, and your secrets are held over you.",
      ],
      examples: [
        "Files are encrypted with a key only the attacker holds: present, but unreadable.",
        "It often spreads and encrypts across the whole network before surfacing.",
        "Double extortion: pay, or we also leak the data we stole.",
      ],
      analogy: {
        plain: "Imagine a burglar who does not steal your documents but puts them all in an unbreakable safe and keeps the only key, then, for good measure, photocopies the sensitive ones to threaten you with.",
        realTerm: "ransomware / double extortion",
      },
    },
    {
      heading: "Why paying is the wrong first instinct",
      body: [
        "The instinct under pressure is to pay and make it stop. But paying is fraught: there is no guarantee the attacker hands over a working key, you are funding and encouraging crime, you may be breaking sanctions rules depending on who the group is, and you are marking yourself as a payer who may be hit again. Authorities broadly advise against paying, and recovery is far better built in advance.",
        "The real answer to ransomware is preparation, not payment. Good, tested, offline backups mean you can restore your data without the attacker's key. Fast patching closes the holes ransomware spreads through. Segmentation limits how far it can reach. These unglamorous measures are what turn a catastrophe into a bad but survivable day, which is exactly why they are emphasised so heavily.",
      ],
      examples: [
        "Paying may buy nothing: no guarantee of a working key, and it funds more crime.",
        "Offline, tested backups let you restore without ever needing the attacker's key.",
        "Patching and segmentation limit how far ransomware can spread in the first place.",
      ],
    },
    {
      heading: "Worms plus ransomware: the perfect storm",
      body: [
        "The most devastating ransomware combines encryption with self-spread. If ransomware can worm, exploiting an unpatched flaw to leap from machine to machine on its own, then one infection becomes an organisation-wide, or even worldwide, outbreak in hours. There is no time for humans to react before everything is encrypted.",
        "This is why the patch race (the subject of Module 11) is a matter of hours, not weeks, for serious flaws. A fix released by the vendor is useless until it is applied, and the gap is precisely the window a wormable ransomware needs. The WannaCry case you are about to see is the definitive, tragic illustration: a fix existed, the worm spread through those who had not applied it, and hospitals paid the price.",
      ],
      examples: [
        "Wormable ransomware spreads itself, encrypting everything before anyone can react.",
        "A vendor's patch is worthless until it is actually applied.",
        "The gap between 'fix available' and 'fix applied' is the worm's opportunity.",
      ],
      analogy: {
        plain: "A fire that spreads on its own, room to room, gives you no time to grab the extinguisher. Wormable ransomware is that fire; patching is sealing the doors before it starts.",
        realTerm: "wormable ransomware",
      },
    },
  ],

  glossary: [
    { term: "ransomware", definition: "Malware that encrypts your files (and sometimes steals them) and demands payment for the decryption key." },
    { term: "double extortion", definition: "Ransomware tactics that both encrypt data and threaten to publish a stolen copy unless the ransom is paid." },
    { term: "offline backup", definition: "A backup kept disconnected from the network (or otherwise immutable) so ransomware cannot reach and encrypt it." },
    { term: "EternalBlue", definition: "The name of the Windows networking vulnerability WannaCry exploited to spread; a patch existed before the outbreak." },
  ],

  seeHeading: "The day ransomware hit the hospitals",

  cases: [
    {
      org: "WannaCry (NHS)",
      year: "2017",
      headline: "A wormable ransomware spread worldwide in hours and forced hospitals to turn patients away",
      whatHappened: "In May 2017, the WannaCry ransomware swept across the globe in a matter of hours. It was wormable: it spread automatically by exploiting a known Windows networking vulnerability (EternalBlue) for which a patch had already been released. Organisations that had not applied the patch were hit en masse. In the UK, the NHS was severely affected, appointments and operations were cancelled, and some emergency patients had to be diverted, as computers across hospitals were locked.",
      theMissedMeasure: "Patching. A fix for the exploited flaw existed before the outbreak; systems that had applied it were protected. The disaster was not an unknown, unstoppable attack but a known, patchable flaw left open, combined with old, unsupported systems that could not easily be updated.",
      theCost: "Massive global disruption across many organisations, and in the NHS, thousands of cancelled appointments and operations and diverted emergency care, a stark example of a cyber-attack causing real-world, human harm, all spreading through unpatched machines.",
      control: "patching",
      impact: ["spread worldwide in hours via a known, patchable flaw", "NHS operations and appointments cancelled, patients diverted", "systems that had patched were protected"],
      source: "Public record; NHS and National Audit Office reports and 2017 reporting.",
      brandColor: "#d32f2f",
      news: { headline: "WannaCry ransomware attack: what happened to the NHS", outlet: "BBC News", date: "May 2017" },
    },
  ],

  lab: {
    title: "Respond to the ransomware",
    intro: "Nothing to install and nothing leaves this page. Your files have just been encrypted. Make the calm, correct moves to contain and recover.",
    prompts: [
      "Contain the spread first; do not reflexively pay.",
      "Protect and verify the backups, attackers target them too.",
      "Escalate and report: serious ransomware is not handled quietly alone.",
    ],
    component: RansomwareResponseLab,
  },

  check: {
    explain: {
      prompt: "WannaCry caused worldwide damage, yet a patch for the flaw it used already existed. Explain how ransomware holds a victim hostage, and why WannaCry shows that patching and backups, not paying, are the real defence.",
      modelAnswer: "Ransomware takes you hostage by encrypting your files with a key only the attacker holds, then demanding payment; often it spreads across the whole network first, and may also steal data to threaten a leak (double extortion). WannaCry shows the real defence because it was wormable: it spread automatically through a known Windows flaw for which a patch already existed, so organisations that had patched were protected, and those that had not were hit en masse. Paying would not have addressed the cause; patching closed the hole, and tested offline backups would let a victim restore without ever needing the attacker's key. The disaster was a known, patchable flaw left open, which is exactly why preparation beats payment.",
    },
    quiz: [
      {
        q: "How does ransomware hold a victim hostage?",
        options: [
          "By permanently deleting the victim's files unless the demanded ransom is paid",
          "By locking the victim out after quietly changing the account login password",
          "By encrypting the victim's files with a key only the attacker holds, then demanding payment",
          "By flooding the victim's network with junk traffic until it is paid to stop",
          "By slowly corrupting the files at random so that nobody can trust the data",
        ],
        answer: 2,
        reasons: [
          "Ransomware does not usually delete your files; it leaves them in place but scrambled, still there yet unreadable without the key.",
          "Changing a login password can lock you out, but that is not how ransomware works. It encrypts the files themselves, not just the account.",
          "Right. The data remains but is unreadable without the attacker's key. Many groups also steal a copy to threaten a leak, which is double extortion.",
          "Flooding a network with junk traffic is a denial-of-service attack. Ransomware encrypts your files rather than drowning your connection.",
          "Random corruption describes a destructive wiper. Ransomware encrypts cleanly so it can promise, truthfully or not, to restore the files for payment.",
        ],
      },
      {
        q: "Why is paying the ransom a poor first response?",
        options: [
          "It is reliably the fastest and cheapest way to get all of the data straight back",
          "It is always illegal in every country and will guarantee the victim is prosecuted later",
          "Paying immediately reinfects every other machine that is still connected on the network",
          "No guarantee of a working key, it funds crime, and it marks you as a payer worth hitting again",
          "It permanently deletes the stolen copy of the data that the attackers took earlier",
        ],
        answer: 3,
        reasons: [
          "Paying is neither fast nor reliable: the attacker may hand over a broken key, or nothing at all. Tested backups restore far more dependably.",
          "Paying is not automatically illegal everywhere, though it can breach sanctions depending on the group. The stronger point is that it funds crime and may buy nothing.",
          "Paying does not reinfect your machines. The real problems are that it funds crime, may not work, and marks you as a soft target.",
          "Right. Paying is fraught and uncertain, while tested offline backups, fast patching and segmentation are what actually make ransomware survivable.",
          "Paying gives you no control over the stolen copy; attackers often keep it and leak it anyway. That is the whole point of double extortion.",
        ],
      },
      {
        q: "What made WannaCry so devastating, and yet so preventable?",
        options: [
          "It was wormable through a known flaw that already had a patch, so patched systems stayed safe",
          "It used an unknown zero-day flaw for which no patch could possibly have existed yet",
          "It spread only through phishing emails that unsuspecting staff opened by hand",
          "It could be stopped only by paying the ransom that the attackers were demanding",
          "It encrypted files so strongly that even fully patched, updated systems were still hit",
        ],
        answer: 0,
        reasons: [
          "Right. A fix existed before the outbreak, so systems that had patched were protected while the worm tore through those that had not. That is why the patch race matters.",
          "WannaCry did not use an unknown zero-day. The flaw was already known and a patch had been released, which is exactly why it was preventable.",
          "WannaCry did not need anyone to click. It wormed automatically through a network flaw, which is what let it spread worldwide in hours.",
          "Paying did not reliably recover files, and it was never the way to stop WannaCry. Patching closed the hole; backups restore the data.",
          "Patched systems were in fact safe. The strength of the encryption was not the point; the open, unpatched flaw was.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You now understand ransomware's grip, and why boring backups and fast patching beat paying every time.",
    takeaways: [
      "Ransomware encrypts your data for a ransom, often spreading network-wide first and stealing data to threaten a leak.",
      "Paying is uncertain and harmful; tested offline backups, patching and segmentation are the real defence.",
      "Wormable ransomware like WannaCry spreads through unpatched flaws in hours, so the patch race is measured in hours, not weeks.",
    ],
    project: {
      name: "Plan your recovery",
      blurb: "For your own important data (or an organisation you know), write a two-line recovery plan: where are the backups, are they offline or otherwise out of an attacker's reach, and when were they last tested by actually restoring something? If you cannot answer confidently, you have just found your most important task. That is exactly the question ransomware asks of everyone.",
    },
    ethicsNote: "Ransomware is studied here to defend against and recover from it. Deploying ransomware, or any extortion malware, is among the most serious cybercrimes there is; this knowledge is purely for defence.",
  },
};

export default topic2;
