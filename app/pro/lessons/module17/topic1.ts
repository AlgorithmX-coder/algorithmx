import type { TopicManifest } from "../../learn/types";
import { RiskTreatmentLab } from "../../learn/conceptLabs";

/* Module 17 - Topic 1: what risk management actually is. Case: the Uber
 * 2016 breach cover-up (Uber concealed a breach and paid the attackers;
 * its then-security chief was later convicted over the handling), a
 * landmark governance / accountability case. Public record: US DoJ and
 * 2017-2022 reporting. */
const topic1: TopicManifest = {
  id: "m17t1",
  weekLabel: "Module 17",
  act: "Act 4 - Get hired",
  title: "What risk management really is",
  role: "Governance, risk and compliance (GRC) is a huge hiring lane most beginners never consider, and it is often more accessible to career-changers than purely technical roles. At its heart is risk management: the business discipline of deciding what to protect and how much to spend doing it.",
  minutes: 16,
  promise: "Discover the big cyber career path beginners miss, and what risk management really is, then see the cover-up that ended an executive's career.",
  brief: "Act 4 is about getting hired, and it opens with a path many beginners overlook: governance, risk and compliance. In this lesson, we'll see what GRC is, why it is a major and accessible career lane, and its core, risk management: treating cyber risk as business risk, to be identified, weighed and deliberately managed. Then we'll see the Uber 2016 cover-up, a stark lesson in governance, accountability and what happens when risk is mishandled at the top.",

  learn: [
    {
      heading: "GRC: the career lane beginners miss",
      body: [
        "Most newcomers picture cyber security as hands-on technical work, hacking, defending, analysing. But a huge part of the industry is governance, risk and compliance: making sure an organisation manages its cyber risk sensibly, follows the rules, and can prove it. GRC roles are plentiful, well-paid, and, crucially, often more open to people from non-technical backgrounds, because they draw on skills like communication, organisation, analysis and understanding a business.",
        "This matters for you directly. If your background is in administration, project management, law, finance, or really any field that involves process and people, GRC may be a more natural entry point than a deeply technical role, and your 'non-technical' experience becomes an asset, not a handicap. GRC is one of the clearest answers to 'how does someone like me get into cyber?', which is exactly why Act 4 starts here.",
      ],
      examples: [
        "GRC = managing cyber risk, following the rules, and proving it.",
        "Roles are plentiful and often open to non-technical backgrounds.",
        "Communication, organisation and business sense are the core skills.",
      ],
      analogy: {
        plain: "Not everyone in a hospital is a surgeon. Many essential roles, planning, safety, compliance, coordination, keep it running well, and GRC is that side of cyber security.",
        realTerm: "governance, risk & compliance (GRC)",
      },
    },
    {
      heading: "Risk management: cyber risk is business risk",
      visual: { id: "risk-equation" },
      body: [
        "At the heart of GRC is risk management, which you first met in Module 1: identifying risks, weighing them by likelihood and impact, and deciding what to do, reduce, transfer, avoid, or knowingly accept. GRC applies this as a business discipline: cyber risk is treated as one of the risks an organisation manages, alongside financial, legal and operational risk, and discussed in the language leaders understand.",
        "This business framing is the key insight. Security is not about eliminating all risk (impossible) or saying 'no' to everything; it is about helping the organisation take the right risks knowingly and protect what matters most, proportionately. A good risk professional translates technical threats into business terms ('this could cost us this much, this likely') so leaders can make informed decisions. That translation skill is enormously valuable and very hireable.",
      ],
      examples: [
        "Identify risks, weigh likelihood and impact, decide: reduce, transfer, avoid, accept.",
        "Cyber risk sits alongside financial, legal and operational risk.",
        "Translate technical threats into business terms so leaders can decide.",
      ],
    },
    {
      heading: "Governance: someone must own the risk",
      body: [
        "Governance is about who is responsible and how decisions get made. Cyber risk must be owned, ultimately at the top of an organisation, with clear accountability for decisions about it. Good governance means risks are visible to leaders, decisions (including to accept a risk) are made deliberately and documented, and someone is answerable. Poor governance means risk drifts, nobody owns it, and bad decisions are made, or hidden.",
        "This is not abstract. How an organisation's leadership handles cyber risk, especially when something goes wrong, has real consequences, legal, financial and personal. The Uber case you are about to see is a sobering example: not a technical failure, but a governance and accountability failure, mishandling a breach in a way that led to an executive's criminal conviction. It shows that risk governance is a serious, consequential responsibility, and why organisations need people who understand it.",
      ],
      examples: [
        "Cyber risk must be owned, with clear accountability at the top.",
        "Good governance: risks visible, decisions deliberate and documented, someone answerable.",
        "How leaders handle risk, especially when it goes wrong, has real consequences.",
      ],
      analogy: {
        plain: "A ship needs a captain who is accountable for the safety decisions. Governance is making sure someone is clearly responsible, and answerable, for how risk is handled.",
        realTerm: "governance",
      },
    },
  ],

  glossary: [
    { term: "GRC", definition: "Governance, risk and compliance: managing cyber risk sensibly, following the rules, and being able to prove it; a major career lane." },
    { term: "risk management", definition: "Identifying risks, weighing likelihood and impact, and deciding to reduce, transfer, avoid or knowingly accept them." },
    { term: "governance", definition: "Who is responsible for risk and how decisions are made; good governance means clear ownership, deliberate decisions, and accountability." },
    { term: "risk appetite", definition: "How much risk an organisation is willing to accept in pursuit of its goals; GRC helps keep decisions within it." },
  ],

  seeHeading: "When mishandling a breach ended a career",

  cases: [
    {
      org: "Uber (2016 breach cover-up)",
      year: "2016",
      headline: "A concealed breach became a landmark governance and accountability case",
      whatHappened: "In 2016, Uber suffered a data breach exposing data on millions of users and drivers. Rather than disclose it as required, the company concealed it and paid the attackers to stay quiet, handling the payment in a way designed to disguise it. When this came to light, the consequences were severe: regulatory penalties, reputational damage, and, notably, the company's then-security chief was later criminally convicted in the US over the handling of the breach. It was not fundamentally a technical failure but a governance and accountability one: how leadership chose to handle the risk and its obligations.",
      theMissedMeasure: "Sound governance and compliance: disclosing the breach as legally required, handling it transparently, and making accountable decisions, rather than concealment. It shows that risk is not just a technical matter; how it is governed and whether obligations are met has legal and personal consequences at the top.",
      theCost: "Regulatory penalties, serious reputational harm, and a criminal conviction for an executive over the handling, a defining demonstration that cyber risk governance is a consequential responsibility, and that mishandling it, especially by concealment, can end careers and worse.",
      control: "access-control",
      impact: ["a breach concealed and attackers paid off", "an executive later criminally convicted over the handling", "a governance and accountability failure, not just a technical one"],
      source: "Public record; US Department of Justice and 2017-2022 reporting.",
      brandColor: "#000000",
      news: { headline: "Former Uber security chief convicted over 2016 breach cover-up", outlet: "Mainstream reporting (2022)", date: "2016 / 2022" },
    },
  ],

  lab: {
    title: "Treat the risk",
    intro: "Nothing to install and nothing leaves this page. For each decision, tap it, then tap which risk treatment it is (reduce, transfer, avoid, accept).",
    prompts: [
      "The four treatments from Module 1: reduce, transfer, avoid, accept.",
      "This is the everyday language of risk management and GRC.",
      "Each is a legitimate choice, as long as it is made knowingly.",
    ],
    component: RiskTreatmentLab,
  },

  check: {
    explain: {
      prompt: "Explain what GRC is and why it is an accessible career lane, what risk management really involves, and what the Uber 2016 cover-up shows about governance.",
      modelAnswer: "GRC, governance, risk and compliance, is the part of cyber security focused on managing an organisation's cyber risk sensibly, following the rules, and being able to prove it. It is an accessible career lane because its roles are plentiful and draw heavily on communication, organisation, analysis and business understanding, so they are often more open to people from non-technical backgrounds, whose prior experience becomes an asset. Risk management, its core, means treating cyber risk as business risk: identifying risks, weighing them by likelihood and impact, and deciding to reduce, transfer, avoid or knowingly accept them, and translating technical threats into business terms so leaders can make informed decisions, not eliminating all risk but taking the right risks knowingly and protecting what matters most, proportionately. The Uber 2016 cover-up shows that governance, who owns cyber risk and how decisions are made, is a serious, consequential responsibility: Uber concealed a breach and paid off attackers rather than disclosing it as required, and the mishandling led to regulatory penalties and the criminal conviction of its then-security chief. It was a governance and accountability failure, not a technical one, demonstrating that how leadership handles risk and meets its obligations has real legal and personal consequences.",
    },
    quiz: [
      {
        q: "Why is GRC often an accessible entry lane for career-changers?",
        options: [
          "Because its roles need no real grasp of the business they are there to protect",
          "Because the work is now mostly automated, so there is little left for people to do",
          "Because it sits apart from real security, so it needs no security knowledge at all",
          "Because its roles draw on communication, organisation and business sense, so a non-technical background is an asset",
          "Because it demands no analysis, writing or organising, only a basic awareness of security",
        ],
        answer: 3,
        reasons: [
          "Not quite. GRC absolutely needs you to understand the business you protect; that business sense is part of what makes the lane valuable.",
          "GRC uses tools, but it is people-driven work: judgement, writing and conversations with the business. It is far from mostly automated.",
          "GRC is part of security, not apart from it. It is open to career-changers, but you still build real security understanding as you go.",
          "Right. GRC values process, people and business sense, so experience from other fields transfers well and often becomes a genuine asset.",
          "The opposite is true: GRC leans heavily on analysis, writing and organisation. Those very skills are what make a career-changer well suited to it.",
        ],
      },
      {
        q: "What is the core of risk management?",
        options: [
          "Treating cyber risk as business risk: weighing likelihood and impact, then deciding to reduce, transfer, avoid or accept it",
          "Buying enough security tools and layers to remove every possible threat the organisation faces",
          "Transferring every risk to an insurer so that the business itself carries none of it",
          "Ranking threats purely by how technically advanced and sophisticated each individual attack is",
          "Saying no to any activity that carries the slightest cyber risk to the organisation",
        ],
        answer: 0,
        reasons: [
          "Right. Risk management means taking the right risks knowingly and protecting what matters proportionately, weighing likelihood and impact to choose a treatment.",
          "No tool budget removes every threat; perfect security is impossible. Risk management is about weighing and treating risk, not eliminating it.",
          "Transfer, such as insurance, is one treatment, but only one. Risk management chooses between reduce, transfer, avoid and accept, not transfer for everything.",
          "Technical sophistication is only part of the picture. Risk management weighs likelihood and business impact, not just how clever an attack is.",
          "That is avoidance applied to everything, which would halt the business. Risk management helps you take the right risks knowingly, not refuse them all.",
        ],
      },
      {
        q: "What does the Uber 2016 cover-up primarily illustrate?",
        options: [
          "That attackers will always get past even the strongest technical defences in the end",
          "That paying attackers off quietly is an effective way to keep a data breach secret",
          "That the main risk in any breach is simply the cost of fixing the technical flaw",
          "That a breach is fundamentally a technical failure, to be solved by the security team alone",
          "That governance and accountability, how leaders handle risk and obligations, carry serious legal and personal consequences",
        ],
        answer: 4,
        reasons: [
          "Uber's downfall was not the attack itself but how leadership handled it. The lesson is about governance, not the strength of technical defences.",
          "The opposite: the concealment and pay-off are exactly what led to penalties and a conviction. Covering up the breach made things far worse.",
          "The lasting cost here was not the technical fix. It was the legal and personal fallout from concealing the breach and mishandling the obligations.",
          "Uber's was a governance and accountability failure, not a technical one. Handling a breach is a leadership responsibility, not just the security team's.",
          "Right. Concealing the breach led to regulatory penalties and an executive's criminal conviction. How risk is governed matters enormously, right to the top.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You now know the career lane many beginners miss, GRC, and its core discipline of managing risk as a business.",
    takeaways: [
      "GRC is a major, accessible career lane where non-technical backgrounds are an asset.",
      "Risk management treats cyber risk as business risk: weigh it, and reduce, transfer, avoid or accept it knowingly.",
      "Governance means clear ownership and accountability; mishandling it (Uber 2016) has real legal and personal consequences.",
    ],
    project: {
      name: "Reframe a risk for a leader",
      blurb: "Take a technical risk you understand (say, an unpatched internet-facing server) and write one or two sentences explaining it to a business leader: what could happen, how likely, what it could cost, and your recommended treatment. This translation, technical risk into business language, is the core GRC skill and highly hireable.",
    },
    ethicsNote: "GRC is about managing risk honestly and meeting legal obligations, exactly the opposite of the Uber cover-up. It is conducted with integrity and within the law, including disclosure duties (Module 5).",
  },
};

export default topic1;
