import type { TopicManifest } from "../../learn/types";
import { BackgroundAssetLab } from "../../learn/conceptLabs";

/* Module 20 - Topic 5: turning a non-technical background into an asset.
 * Honest, encouraging framing: a large share of cyber professionals came
 * from other fields, and skills like communication, attention to detail
 * and business understanding are genuinely transferable and valued. No
 * invented statistics; qualitative truth only. */
const topic5: TopicManifest = {
  id: "m20t5",
  weekLabel: "Module 20",
  act: "Act 4 - Get hired",
  title: "Your background as an asset",
  role: "Many people entering cyber worry their non-technical background is a handicap. The opposite is often true: the field actively needs the transferable strengths other careers build. Reframing your background as an asset is both accurate and a genuine advantage in applications and interviews.",
  minutes: 14,
  promise: "See why your non-technical background is often an asset in cyber, not a handicap, and how to turn it into a hiring advantage.",
  brief: "In this lesson, we'll close the roles module with an encouraging, honest truth: a non-technical background is frequently an asset in cyber security, not a barrier. Many professionals came from entirely different fields, and skills like communication, attention to detail, business understanding and staying calm under pressure are genuinely needed and valued. We'll see how to recognise and present your transferable strengths as exactly what the field wants.",

  learn: [
    {
      heading: "Many people come to cyber from elsewhere",
      body: [
        "A widely-observed reality, and a reassuring one, is that a large share of cyber security professionals did not start in technology at all. They came from teaching, healthcare, the military, finance, law, customer service, project management, all sorts of backgrounds, and moved into cyber later. The idea that you must have been a computer prodigy from childhood is simply false. The field is full of career-changers, and it is better for the diversity of perspective they bring.",
        "This matters because it directly refutes the most common fear of adult beginners: 'I'm too late, my background is wrong'. Not only is a career change into cyber common and achievable, but your prior experience is not wasted, it is often exactly what makes you valuable. The question is not whether a non-technical background can work in cyber (it clearly can and does), but how to recognise and present the strengths it gave you.",
      ],
      examples: [
        "Many professionals came from teaching, healthcare, finance, law, service, the military.",
        "You need not have been a childhood prodigy; career-changers are everywhere.",
        "The field is better for the diverse perspectives career-changers bring.",
      ],
      analogy: {
        plain: "Great detectives come from many walks of life; what matters is the mind they bring to the work, not that they were born detectives. Cyber is the same.",
        realTerm: "career-changers in cyber",
      },
    },
    {
      heading: "The strengths the field actually needs",
      body: [
        "Cyber security needs far more than technical skill, and the gaps are often in exactly the areas other careers build. Clear communication, explaining risk to non-technical people, is one of the most valued and scarce skills (and central to GRC). Attention to detail and methodical, careful work are essential to triage, audit and investigation. Understanding how a business actually works is invaluable for risk and GRC. Staying calm under pressure, built in many frontline careers, is exactly what incident response needs. Organising people and tasks transfers straight to GRC and continuity work.",
        "These are not consolation prizes; they are genuinely sought-after strengths that many purely-technical people lack. A team of brilliant technologists who cannot communicate, or do not understand the business, is a weak team. Your non-technical background may have given you precisely the strengths that complete a team, which is why the field actively values career-changers who bring them, especially when paired with the solid technical foundation this course has given you.",
      ],
      examples: [
        "Communication (explaining risk), attention to detail, business understanding.",
        "Calm under pressure (frontline careers), organising people and tasks.",
        "These are sought-after strengths many purely-technical people lack.",
      ],
    },
    {
      heading: "Present your background as the asset it is",
      body: [
        "The practical skill is to recognise and present your transferable strengths deliberately. Do not hide or apologise for your background, frame it as an asset. 'My years in customer service mean I stay calm under pressure and communicate clearly with non-technical people' is a compelling thing for a SOC or GRC employer to hear. Identify the genuine strengths your background gave you, connect each explicitly to what a cyber role needs, and say so, in your CV, your applications, and your interviews.",
        "Combined with the solid foundation and portfolio this course has built, this reframing is powerful. You are not a blank beginner; you are someone with real, transferable strengths plus new cyber understanding, a genuinely strong combination. The most successful career-changers are those who stop seeing their background as a gap to overcome and start presenting it as part of what makes them valuable. That confident, honest framing is exactly how you turn 'someone like me' into 'exactly the person we need'.",
      ],
      examples: [
        "Do not apologise for your background; frame it as an asset.",
        "Connect each transferable strength explicitly to what a cyber role needs.",
        "Foundation + portfolio + transferable strengths is a genuinely strong combination.",
      ],
      analogy: {
        plain: "A chef retraining as a food-safety inspector does not hide their kitchen years, they are the whole point. Your background is your edge; present it as such.",
        realTerm: "reframing your background",
      },
    },
  ],

  glossary: [
    { term: "transferable skills", definition: "Strengths built in one field (communication, attention to detail, business sense, calm under pressure) that apply directly in another, like cyber." },
    { term: "career-changer", definition: "Someone entering cyber from a different field; common, achievable, and valued for the perspective and transferable strengths they bring." },
    { term: "reframing", definition: "Presenting your background as an asset by connecting its genuine strengths to what a cyber role needs, rather than apologising for it." },
    { term: "soft skills", definition: "Communication, teamwork and judgement skills that are genuinely scarce and sought-after in cyber, not 'lesser' than technical ones." },
  ],

  seeHeading: "Why the field wants what you bring",

  cases: [
    {
      org: "Career-changers in cyber",
      year: "current",
      headline: "A large share of professionals came from other fields, and their transferable strengths are valued",
      whatHappened: "A consistent, encouraging reality in cyber security is that a large proportion of professionals entered from entirely non-technical backgrounds, teaching, healthcare, the military, finance, service roles and more, and that their transferable strengths (clear communication, attention to detail, business understanding, calm under pressure, organisation) are genuinely needed and valued, often filling gaps that purely-technical teams have. The common fear that a non-technical background is a handicap is contradicted by how many successful professionals prove the opposite: a background is an asset when its strengths are recognised and presented as exactly what a cyber role needs.",
      theMissedMeasure: "Recognising and presenting transferable strengths as assets. Career-changers who frame their background as an edge, connecting its genuine strengths to what cyber roles need, and pair it with a solid foundation and portfolio, are compelling candidates, especially for communication-heavy roles like GRC and the SOC.",
      theCost: "Here the value is confidence and strategy: understanding that a non-technical background is an asset lets career-changers present themselves powerfully, rather than apologetically, turning 'someone like me' into 'exactly the person we need'.",
      control: "access-control",
      impact: ["many professionals came from non-technical fields", "transferable strengths fill gaps technical teams have", "present your background as an asset, not a handicap"],
      source: "Public record; consistent observations that cyber draws heavily on career-changers.",
      brandColor: "#27ae60",
      news: { headline: "Why a non-technical background can be your edge in cyber security", outlet: "Industry observations (current)", date: "current" },
    },
  ],

  lab: {
    title: "Asset, or not relevant?",
    intro: "Nothing to install and nothing leaves this page. For each, decide: a genuinely transferable strength for cyber, or not really relevant?",
    prompts: [
      "Communication, attention to detail, business understanding, calm under pressure, organisation: all assets.",
      "Most genuine professional strengths transfer; connect each to what a cyber role needs.",
      "Your background is your edge, present it as such.",
    ],
    component: BackgroundAssetLab,
  },

  check: {
    explain: {
      prompt: "Explain why a non-technical background is often an asset in cyber security, which strengths transfer, and how to present your background to an employer.",
      modelAnswer: "A non-technical background is often an asset in cyber security because a large share of professionals came from entirely different fields, teaching, healthcare, the military, finance, law, service, so the idea that you must have been a childhood computer prodigy is false, and the field is better for the diverse perspectives career-changers bring. More than that, cyber needs far more than technical skill, and the gaps are often in exactly the areas other careers build: clear communication (explaining risk to non-technical people, central to GRC) is one of the most valued and scarce skills; attention to detail and methodical work are essential to triage, audit and investigation; understanding how a business actually works is invaluable for risk and GRC; staying calm under pressure, built in many frontline careers, is what incident response needs; and organising people and tasks transfers straight to GRC and continuity work. These are genuinely sought-after strengths many purely-technical people lack, so your background may have given you precisely the strengths that complete a team. The way to present it is deliberately and confidently: do not hide or apologise for your background but frame it as an asset, identifying the genuine strengths it gave you, connecting each explicitly to what a cyber role needs, and saying so in your CV, applications and interviews, for example 'my years in customer service mean I stay calm under pressure and communicate clearly with non-technical people'. Combined with the solid foundation and portfolio this course built, that reframing turns 'someone like me' into 'exactly the person we need'.",
    },
    quiz: [
      {
        q: "Why is a non-technical background often an asset in cyber?",
        options: [
          "It is always a handicap",
          "Many professionals come from other fields, and transferable strengths (communication, detail, business sense) are genuinely valued",
          "Because cyber needs no technical skill",
          "It is irrelevant either way",
        ],
        answer: 1,
        why: "The field needs more than technical skill, and often lacks exactly the strengths other careers build. Your background can complete a team.",
      },
      {
        q: "Which is a genuinely transferable strength for cyber?",
        options: [
          "Your favourite colour",
          "Clear communication, explaining things to non-technical people",
          "Nothing from other fields transfers",
          "Only coding experience counts",
        ],
        answer: 1,
        why: "Communication is one of the most valued and scarce skills in cyber, especially in GRC and when explaining risk.",
      },
      {
        q: "How should you present your non-technical background to an employer?",
        options: [
          "Hide it and apologise for it",
          "Frame it as an asset, connecting its genuine strengths explicitly to what the cyber role needs",
          "Never mention it",
          "Pretend you have always been technical",
        ],
        answer: 1,
        why: "Confident, honest reframing, your strengths tied to the role's needs, turns 'someone like me' into 'exactly who we need'.",
      },
    ],
  },

  wrap: {
    headline: "You finished Module 20: you know the realistic roles, the cert path, the honest market, and that your background is an asset.",
    takeaways: [
      "Many cyber professionals came from non-technical fields; a career change in is common and achievable.",
      "Transferable strengths, communication, detail, business sense, calm under pressure, are genuinely needed and valued.",
      "Present your background as an asset: connect its strengths to what the role needs, paired with your foundation and portfolio.",
    ],
    project: {
      name: "Write your edge",
      blurb: "List three genuine strengths from your background (work or life) and, for each, write one sentence connecting it to a cyber role's needs. This becomes material for your CV and interviews. Learning to present your background as an edge, not a gap, is one of the most powerful things a career-changer can do.",
    },
    ethicsNote: "Present your background and skills honestly and confidently, never overstating. Your genuine transferable strengths are an asset; integrity in how you represent them is part of the professionalism the field expects. Next, Module 21 pulls everything into the job machinery and your capstone.",
  },
};

export default topic5;
