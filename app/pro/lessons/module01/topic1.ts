import type { TopicManifest } from "../../learn/types";
import { CiaLab } from "../../learn/conceptLabs";

/* Module 1 - Topic 1: the CIA triad. The idea every certificate opens
 * with. Case: Colonial Pipeline 2021 (ransomware shut the largest US
 * fuel pipeline for days), a clean availability failure. Public record. */
const topic1: TopicManifest = {
  id: "m1t1",
  weekLabel: "Module 1",
  act: "Act 1 - Foundations you can touch",
  title: "The CIA triad: what security is protecting",
  role: "As a cyber security analyst, you'll describe every incident you ever touch in these three terms: was something exposed, changed, or made unavailable? It's the shared language the whole industry speaks, which is why we start right here.",
  minutes: 18,
  promise: "The three-word idea at the heart of all cyber security, and a real attack that took one of the three away.",
  brief: "In this lesson, we'll meet the three-word idea at the heart of every cyber security certificate: confidentiality, integrity and availability. You'll see exactly what each one means, then watch a real attack take one of them away and stop fuel flowing to a third of a country.",

  learn: [
    {
      heading: "All of security protects just three things",
      body: [
        "Cyber security can look like a thousand unrelated tools and terms. Underneath, almost every one of them is protecting one of three things, known together as the CIA triad. It has nothing to do with the spy agency: it stands for confidentiality, integrity, and availability.",
        "Confidentiality is keeping secrets secret. Integrity is keeping data correct and untampered. Availability is keeping things working and reachable when you need them. Every attack breaks at least one of the three, and every defence protects at least one.",
      ],
      examples: [
        "A leaked password list breaks confidentiality: secrets were seen by the wrong people.",
        "A changed bank balance breaks integrity: the data is no longer trustworthy.",
        "A website knocked offline breaks availability: it is there, but you cannot use it.",
      ],
      analogy: {
        plain: "Think of a pharmacy. Confidentiality is that only staff see your prescription. Integrity is that the dose on the label is exactly what the doctor wrote. Availability is that the shop is open when you need your medicine.",
        realTerm: "the CIA triad",
      },
    },
    {
      heading: "The three pillars, one at a time",
      visual: { id: "cia-breaker" },
      body: [
        "Confidentiality is about who is allowed to see. Passwords, encryption, and access controls all exist to keep data in the right hands. When you hear 'data breach', that is usually a confidentiality failure.",
        "Integrity is about whether you can trust the data is correct and unchanged. Was this record altered? Is this the real software update, or a tampered one? Availability is about access when it matters: if ransomware locks every file, the data still exists, but its availability is gone, and that can be just as damaging as it being stolen.",
      ],
      examples: [
        "Confidentiality tools: passwords, MFA, encryption, access controls.",
        "Integrity tools: checksums, digital signatures, change logs.",
        "Availability tools: backups, redundancy, protection against denial-of-service.",
      ],
    },
    {
      heading: "You cannot max all three, so security is trade-offs",
      body: [
        "The three pillars pull against each other, which is why security is a series of judgement calls rather than one perfect setting. Lock a system down for maximum confidentiality and you can make it so hard to use that availability suffers. Make everything instantly available to everyone and confidentiality is gone.",
        "A good security professional does not chase perfect security. They ask what matters most for this system and this business, and balance the three deliberately. That judgement, not any single tool, is the actual skill.",
      ],
      examples: [
        "A bank leans hard on integrity and confidentiality, and accepts extra login friction.",
        "An emergency service leans on availability: the system must work even under attack.",
        "A public news site leans on availability and integrity; its articles are not secret.",
      ],
    },
  ],

  glossary: [
    { term: "CIA triad", definition: "The three goals at the heart of security: confidentiality, integrity, and availability. Nearly every control protects at least one." },
    { term: "confidentiality", definition: "Keeping data secret, so only authorised people can see it. Breaking it is a 'data breach'." },
    { term: "integrity", definition: "Keeping data correct and untampered, so you can trust it has not been secretly changed." },
    { term: "availability", definition: "Keeping systems and data working and reachable when they are needed. Ransomware and denial-of-service attack this." },
  ],

  seeHeading: "When an attack took away availability",

  cases: [
    {
      org: "Colonial Pipeline",
      year: "2021",
      headline: "Ransomware shut the biggest US fuel pipeline for days",
      whatHappened: "In May 2021, a ransomware group got into Colonial Pipeline, the largest fuel pipeline in the United States. The attackers did not need to poison the fuel or steal secret formulas. They simply locked up systems, and the company shut the pipeline down as a precaution. The data and the pipeline still physically existed, but they were not usable, and that was enough.",
      theMissedMeasure: "Initial access was traced to a single exposed account with no multi-factor authentication, and the business had limited ability to keep operating once systems were locked (an availability and access-control gap).",
      theCost: "Nearly half the fuel supply to the US East Coast was disrupted for days, causing panic-buying and shortages. The company paid a multi-million-dollar ransom (some was later recovered). It became the clearest modern example that an availability attack can be a national event.",
      control: "access-control",
      impact: ["$4.4M ransom paid", "~45% of US East Coast fuel supply disrupted", "days of shortages and panic-buying"],
      source: "Public record; US government statements and company disclosures, 2021.",
      brandColor: "#d1462a",
      news: { headline: "Colonial Pipeline: US recovers millions in cryptocurrency paid to ransomware hackers", outlet: "BBC News", date: "June 2021", url: "https://www.bbc.co.uk/news/business-57394730" },
    },
  ],

  lab: {
    title: "Sort the incidents by pillar",
    intro: "Read each real kind of incident and decide which part of the CIA triad it breaks. Getting fluent at this is the first analyst skill.",
    prompts: [
      "For each line, pick Confidentiality, Integrity, or Availability.",
      "You get an explanation on every answer, right or wrong.",
      "Notice that some attacks could touch more than one; pick the main one it breaks.",
    ],
    component: CiaLab,
  },

  check: {
    explain: {
      prompt: "A friend says: 'Security is just about stopping hackers stealing data.' Using the CIA triad, explain what that view misses. Write a sentence or two, then reveal a model answer.",
      modelAnswer: "Stealing data is only one of the three things security protects: it is a confidentiality failure. But an attacker who never steals a single file can still do enormous damage by breaking integrity (secretly changing data so you cannot trust it) or availability (locking or knocking systems offline so you cannot use them). Colonial Pipeline was not about stolen fuel; it was ransomware taking availability away, and that alone caused national shortages. Good security balances all three, not just secrecy.",
    },
    quiz: [
      {
        q: "What do the three letters of the CIA triad stand for?",
        options: [
          "Confidentiality, Identity, Authorisation",
          "Confidentiality, Integrity, Availability",
          "Control, Integrity, Authentication",
          "Compliance, Investigation, Assurance",
          "Confidentiality, Isolation, Availability",
        ],
        answer: 1,
        reasons: [
          "Identity and authorisation are real security ideas, but they are not the triad. The middle letter is Integrity, and there is no pillar for authorisation here.",
          "The three pillars: secrets stay secret, data stays correct and trustworthy, and systems stay reachable. Nearly every control protects at least one of them.",
          "Only Integrity belongs on this list. The C is Confidentiality, not control, and the A is Availability, not authentication.",
          "All three are swapped out. These are governance and audit words; the triad is confidentiality, integrity and availability.",
          "Close, but the middle pillar is Integrity, not isolation. Isolation is a technique you might use; integrity is the goal of keeping data correct.",
        ],
      },
      {
        q: "Ransomware locks a hospital's files but never copies or alters them. Which pillar does that mainly break?",
        options: [
          "Confidentiality: the attacker has read private records",
          "Integrity: the records have been secretly changed",
          "Availability: staff cannot reach the records they need",
          "Authentication: the attacker bypassed the login screen",
          "Non-repudiation: no one can prove who ran the attack",
        ],
        answer: 2,
        reasons: [
          "The question says the files were never copied, so nothing was read or stolen. There is no confidentiality breach here.",
          "Locking a file does not change what is inside it. Integrity is about data being secretly altered, which has not happened.",
          "Right. The data is not stolen or changed, it is just locked away from the staff who need it. Unreachable-when-needed is an availability failure, and in a hospital it can cost lives.",
          "Ransomware may have used a stolen login to get in, but the harm described, files locked, is about availability, not the login itself.",
          "Non-repudiation is about proving who did an action. It is not the pillar that locked files break.",
        ],
      },
      {
        q: "Why is security described as a set of trade-offs?",
        options: [
          "Because strong security tools cost more than most firms can afford",
          "Because the three pillars pull against each other, so you balance them",
          "Because no defence can stop every attacker, so some risk always remains",
          "Because availability almost always matters more than the other pillars",
          "Because people will ignore any control that makes their work harder",
        ],
        answer: 1,
        reasons: [
          "Cost is a real constraint, but it is not what trade-off means here. The trade-off is between the pillars, not the budget.",
          "Right. Maximising one pillar usually costs another: lock a system down hard and it becomes unusable. The skill is deciding what each system needs most and balancing on purpose.",
          "True, but that is residual risk, not the CIA trade-off. You still balance the pillars even against a single attacker.",
          "No pillar is always on top. A bank may put confidentiality first, a hospital availability. The point is that it changes per system.",
          "Usability friction is one example of a trade-off, but the core idea is the three pillars competing, not user behaviour on its own.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You have the three-word idea the whole field is built on.",
    takeaways: [
      "Almost every control protects confidentiality, integrity, or availability.",
      "Attacks that never steal data can still break integrity or availability, and hurt just as much.",
      "Security is balancing the three for each system, not chasing a perfect setting.",
    ],
    project: {
      name: "Spot the pillar in the news",
      blurb: "For the rest of this module, whenever you see a cyber story in the news, name which pillar it broke: was data exposed (confidentiality), changed (integrity), or made unusable (availability)? It is a habit that makes every later topic click into place.",
    },
    ethicsNote: "Everything in this course is for defending systems you own or are authorised to test. In the UK, accessing systems without permission is an offence under the Computer Misuse Act 1990, which we cover properly in Module 5.",
  },
};

export default topic1;
