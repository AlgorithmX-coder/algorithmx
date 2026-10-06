import type { TopicManifest } from "../../learn/types";
import { CvLinkedInLab } from "../../learn/conceptLabs";

/* Module 21 - Topic 2: CV and LinkedIn for cyber. Practical, honest
 * guidance on presenting yourself to get noticed: tailored, specific,
 * portfolio-linked, honest. No invented statistics. */
const topic2: TopicManifest = {
  id: "m21t2",
  weekLabel: "Module 21",
  act: "Act 4 - Get hired",
  title: "CV & LinkedIn for cyber",
  role: "Your CV and professional profile are how you get noticed and shortlisted. Knowing how to present your skills, background and portfolio clearly and honestly, tailored to each role, is a practical skill that directly affects whether you get interviews.",
  minutes: 14,
  promise: "Learn how to present yourself to get noticed, specific, tailored, portfolio-linked and honest, so your applications actually land interviews.",
  brief: "In this lesson, we'll make your CV and LinkedIn work for you. These are how employers first judge you, so getting them right directly affects whether you get interviews. We'll see the principles that help, being specific, tailoring to each role, linking to your portfolio, reframing your background, and clarity, and the pitfalls that hurt, vagueness, generic applications, and dishonesty.",

  learn: [
    {
      heading: "Be specific, and link to your proof",
      body: [
        "The biggest difference between a CV that gets noticed and one that is ignored is specificity. Vague claims ('skilled in cyber security', 'passionate about technology') are forgettable; specific, concrete statements stand out ('performed a security audit identifying and fixing X; built a phishing-awareness guide; reconstructed an incident timeline from evidence'). Describe real things you did and can show. And link to your portfolio, let the reader see the actual work, which is far more persuasive than any adjective.",
        "This connects directly to the last topic: your portfolio is your proof, and your CV and profile are how you point to it. A CV that says specifically what you did, and links to where it can be seen, turns your application from a list of claims into a demonstrable case. For a beginner, this specificity-plus-proof is exactly how you compensate for a lack of professional experience.",
      ],
      examples: [
        "Vague: 'skilled in cyber security.' Specific: 'performed an audit that found and fixed X.'",
        "Describe real things you did and can show, not adjectives.",
        "Link to your portfolio: let the reader see the actual work.",
      ],
      analogy: {
        plain: "'I'm a great cook' means little; 'here is a three-course meal I made, with photos' is convincing. Specifics and proof beat claims.",
        realTerm: "specificity and proof",
      },
    },
    {
      heading: "Tailor to the role, and reframe your background",
      body: [
        "A generic CV sent to every job rarely works; a tailored one, matching each role's actual requirements, gets noticed. Read the job advert, identify what it asks for, and make sure your CV clearly shows how you meet it, using the same language where honest. This takes more effort per application, but a few well-targeted applications beat a hundred generic ones. Employers can tell instantly whether you have engaged with their specific role.",
        "This is also where you reframe your background as an asset (Module 20). Do not bury or apologise for a non-technical past, present its transferable strengths explicitly: 'years in customer service: calm under pressure, clear communication with non-technical people, directly relevant to a SOC/GRC role'. Connect your genuine strengths to what the role needs. A tailored CV that reframes your background as an edge, and links to a portfolio, is a strong application from a capable beginner.",
      ],
      examples: [
        "Tailor each CV to the role's actual requirements; mirror its language honestly.",
        "A few well-targeted applications beat a hundred generic ones.",
        "Reframe your background: connect transferable strengths to the role's needs.",
      ],
    },
    {
      heading: "Clarity, professionalism, and honesty",
      body: [
        "Three final principles. Clarity: a clear, well-structured, error-free CV signals professionalism and attention to detail (qualities the job itself needs); typos and chaos signal the opposite, and in a competitive field, small things tip decisions. A tidy LinkedIn profile that reflects your skills, portfolio and genuine interest extends this. Presentation is not vanity; it is part of the message.",
        "And above all, honesty. Never claim certifications, skills or experience you do not have. Dishonesty is easily caught, in interviews, in skills tests, in reference checks, and it costs you the job and your reputation, besides being unethical. The good news is you do not need to inflate anything: you have genuine understanding, real portfolio pieces, and transferable strengths. Present those clearly, specifically and honestly, and you have a strong, credible application, which is exactly what gets a capable beginner shortlisted.",
      ],
      examples: [
        "Clarity and no errors signal professionalism; small things tip competitive decisions.",
        "A tidy LinkedIn reflecting your skills and portfolio extends your CV.",
        "Never inflate: dishonesty is caught and costly; your genuine work is enough.",
      ],
      analogy: {
        plain: "A clear, honest, well-presented application is like a firm handshake and a straight answer: it builds trust. Bluster and errors erode it before you even meet.",
        realTerm: "clarity and honesty",
      },
    },
  ],

  glossary: [
    { term: "tailoring", definition: "Adapting your CV and application to each role's specific requirements, rather than sending a generic one everywhere." },
    { term: "specificity", definition: "Describing concrete things you actually did (and can show), rather than vague claims and buzzwords." },
    { term: "professional profile", definition: "Your public professional presence (e.g. LinkedIn) reflecting your skills, portfolio and genuine interest." },
    { term: "integrity in applications", definition: "Representing your skills, certifications and experience honestly; inflation is easily caught and costly." },
  ],

  seeHeading: "What gets a beginner noticed",

  cases: [
    {
      org: "CVs & profiles that get noticed",
      year: "current",
      headline: "Specific, tailored, portfolio-linked and honest applications stand out; vague generic ones do not",
      whatHappened: "In cyber hiring, as in hiring generally, the applications that get beginners noticed are specific (describing concrete work, not vague claims), tailored to each role's actual requirements, linked to a portfolio that proves ability, and honest, while vague, generic, buzzword-filled or inflated applications are ignored or, worse, exposed. Reframing a non-technical background as an asset, and presenting everything clearly and professionally, further sets a candidate apart. Because so many applications are generic and claim-based, a specific, tailored, proof-backed, honest one stands out sharply.",
      theMissedMeasure: "Presenting yourself specifically, tailored, with portfolio proof and honesty. These are entirely within a beginner's control and compensate for a lack of professional experience, turning a CV from a list of claims into a demonstrable, credible case.",
      theCost: "Here the value is getting noticed: the effort of a specific, tailored, honest, portfolio-linked application is what earns interviews, while generic claim-based ones waste the candidate's time.",
      control: "access-control",
      impact: ["specific, tailored, portfolio-linked, honest applications stand out", "generic and inflated ones are ignored or exposed", "all within a beginner's control"],
      source: "Public record; hiring norms around effective applications (current).",
      brandColor: "#0a66c2",
      news: { headline: "How to make your cyber CV and LinkedIn actually get noticed", outlet: "Hiring norms (current)", date: "current" },
    },
  ],

  lab: {
    title: "Helps or hurts your application?",
    intro: "Nothing to install and nothing leaves this page. For each, decide: does it help your application, or hurt it?",
    prompts: [
      "Specific, tailored, portfolio-linked, clear and honest: helps.",
      "Vague buzzwords, generic applications, and dishonesty: hurts.",
      "Present your genuine work and strengths clearly, that is enough.",
    ],
    component: CvLinkedInLab,
  },

  check: {
    explain: {
      prompt: "Explain how to make a cyber CV and profile stand out as a beginner, covering specificity, tailoring, reframing your background, and honesty.",
      modelAnswer: "To make a cyber CV and profile stand out as a beginner: be specific, replacing vague claims like 'skilled in cyber security' with concrete statements of real things you did and can show ('performed an audit that found and fixed X; built a phishing guide; reconstructed an incident timeline'), and link to your portfolio so the reader sees the actual work, which compensates for a lack of professional experience by turning claims into a demonstrable case. Tailor each application to the role's actual requirements, reading the advert, identifying what it asks for, and showing clearly how you meet it in the same honest language, because a few well-targeted applications beat a hundred generic ones and employers can tell instantly whether you engaged with their specific role. Reframe your background as an asset rather than burying or apologising for it: connect transferable strengths explicitly to the role's needs, for example 'years in customer service: calm under pressure and clear communication with non-technical people, directly relevant to a SOC/GRC role'. And present everything with clarity and honesty: a clear, error-free, well-structured CV and a tidy profile signal the professionalism the job needs, while you must never claim certifications, skills or experience you do not have, because dishonesty is easily caught in interviews, skills tests and references and costs you the job, and you do not need to inflate anything, your genuine understanding, real portfolio pieces and transferable strengths, presented specifically and honestly, are a strong, credible application.",
    },
    quiz: [
      {
        q: "What most makes a CV stand out?",
        options: [
          "Vague, impressive-sounding buzzwords",
          "Specificity (concrete work you can show) and linking to your portfolio",
          "Being as long as possible",
          "Claiming skills you lack",
        ],
        answer: 1,
        why: "Specific, proof-backed statements turn claims into a demonstrable case, exactly what a beginner needs.",
      },
      {
        q: "Why tailor each application?",
        options: [
          "It wastes time with no benefit",
          "A tailored CV matching the role's requirements gets noticed; a few targeted applications beat many generic ones",
          "Because generic CVs always work",
          "To hide your lack of skills",
        ],
        answer: 1,
        why: "Employers can tell whether you engaged with their specific role. Targeted beats generic, every time.",
      },
      {
        q: "What is the rule on honesty in applications?",
        options: [
          "Inflate your skills to compete",
          "Never claim certifications, skills or experience you do not have; dishonesty is caught and costly, and unnecessary",
          "Honesty does not matter",
          "Claim years of experience you lack",
        ],
        answer: 1,
        why: "Your genuine work and strengths are enough. Dishonesty is easily exposed in interviews, tests and references, and unethical.",
      },
    ],
  },

  wrap: {
    headline: "You can now present yourself to get noticed: specific, tailored, portfolio-linked, clear and honest.",
    takeaways: [
      "Be specific and link to your portfolio: concrete, shown work beats vague claims.",
      "Tailor each application to the role, and reframe your background's strengths to its needs.",
      "Clarity and honesty matter: present your genuine work professionally, never inflate.",
    ],
    project: {
      name: "Draft your CV summary",
      blurb: "Write the top section of your cyber CV: a few specific lines on what you can do and have built (linking to your portfolio), with your strongest transferable strengths connected to a target role. Then set up or tidy a LinkedIn profile to match. A specific, honest, portfolio-linked summary is what earns a beginner interviews.",
    },
    ethicsNote: "Represent yourself honestly and specifically. Inflating skills or experience is unethical and easily caught; your genuine work and strengths are a strong case on their own.",
  },
};

export default topic2;
