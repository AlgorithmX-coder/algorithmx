import type { TopicManifest } from "../../learn/types";
import { PortfolioLab } from "../../learn/conceptLabs";

/* Module 21 - Topic 1: your portfolio. The portfolio is the real
 * product of the course: a set of demonstrable artefacts (audit,
 * phishing guide, breach write-up, IR timeline, script) that prove
 * ability, because employers skills-test. No invented statistics. */
const topic1: TopicManifest = {
  id: "m21t1",
  weekLabel: "Module 21",
  act: "Act 4 - Get hired",
  title: "Your portfolio",
  role: "A portfolio of real work is the single most powerful thing a beginner can have, because employers skills-test and want proof of ability, not just claims. The good news: you have been building one throughout this course.",
  minutes: 15,
  promise: "Pull together the portfolio you have been building all along, the thing that proves you can do the job, not just talk about it.",
  brief: "The final module is about turning everything into a job. In this lesson, we focus on the portfolio: a set of real, demonstrable artefacts that prove your ability. Because employers increasingly skills-test, a portfolio sets a beginner apart far more than claims or even certifications alone. The best news is that you have been building one throughout this course, and now we pull it together.",

  learn: [
    {
      heading: "Why a portfolio beats claims",
      body: [
        "Employers do not want to hear that you are passionate and a fast learner, everyone says that. They want evidence you can actually do the work, which is why skills-testing has become so common in hiring. A portfolio, a set of real artefacts you have produced, is exactly that evidence. It turns 'I understand security' into 'here is security work I have done', which is enormously more convincing.",
        "This is especially powerful for a beginner without professional experience. A portfolio is how you demonstrate ability before anyone will give you a job, breaking the 'need experience to get experience' trap. A capable beginner with a strong portfolio can out-compete someone with a longer CV but nothing to show. Proof of what you can do is the great equaliser, and it is squarely within your control.",
      ],
      examples: [
        "Employers skills-test: they want proof of ability, not claims.",
        "A portfolio turns 'I understand security' into 'here is work I have done'.",
        "It breaks the experience trap: demonstrate ability before anyone hires you.",
      ],
      analogy: {
        plain: "An artist does not just say they can paint; they show a portfolio of paintings. Yours shows security work, and it speaks far louder than any claim.",
        realTerm: "a portfolio",
      },
    },
    {
      heading: "You already built one",
      body: [
        "Here is the genuinely good news: you have been building a portfolio throughout this course, by design. Each act produced real, demonstrable pieces. Your Personal Security Audit (Module 5): a real assessment of your own security with findings and actions. Your Phishing Field Guide (Module 7): a practical reference you created. Your vulnerability-assessment note (Module 11), hardening checklist (Module 12), incident report (Module 16), and small-business risk assessment (Module 17): each a concrete artefact. And your scripting work from the Code Lab: a small working script with a README.",
        "These are not toy exercises; they are exactly the kinds of deliverables real roles produce, which is why they make such credible portfolio pieces. Collected together, they demonstrate a genuine range: assessment, communication, hardening, investigation, risk, and a little automation. You did not just learn about security; you produced a body of real work, and that body of work is your case for getting hired.",
      ],
      examples: [
        "Personal Security Audit (M5), Phishing Field Guide (M7), vuln-assessment note (M11).",
        "Hardening checklist (M12), incident report (M16), risk assessment (M17), a script (Code Lab).",
        "These mirror real role deliverables, which is what makes them credible.",
      ],
    },
    {
      heading: "Make it presentable and shareable",
      body: [
        "The final step is to make your portfolio presentable and easy to share. Collect your pieces in one place, a simple document or folder, or better, somewhere shareable like a personal site or a public code repository (a great home for your script and write-ups). Tidy each piece so it reads clearly to a stranger: a short intro to what it is and why, then the work itself. Clarity and presentation matter, because a brilliant piece that is messy or hard to find helps no one.",
        "Aim for quality over quantity: a handful of clear, genuine pieces is far more compelling than a pile of half-finished ones. And keep it honest, present real work you actually did and understand, because you may be asked to discuss it. A tidy, shareable, honest portfolio of real artefacts is the single most valuable thing you take from this course into the job hunt, and polishing it now is time exceptionally well spent.",
      ],
      examples: [
        "Collect pieces in one shareable place (a site, a public repo, a tidy document).",
        "Make each read clearly to a stranger; presentation matters.",
        "Quality over quantity, and honest: you may be asked to discuss each piece.",
      ],
      analogy: {
        plain: "A good portfolio is like a well-kept shop window: a few quality items, clearly displayed, that make people want to come in. Not a cluttered storeroom.",
        realTerm: "presenting your portfolio",
      },
    },
  ],

  glossary: [
    { term: "portfolio", definition: "A collection of real, demonstrable artefacts that prove your ability, the most powerful asset a beginner can have, because employers skills-test." },
    { term: "artefact", definition: "A concrete piece of work (an audit, a write-up, a script, a checklist) that demonstrates applied skill." },
    { term: "the experience trap", definition: "Needing experience to get a job but a job to get experience; a portfolio breaks it by demonstrating ability directly." },
    { term: "public repository", definition: "A shareable online home (like a code repo) for your scripts and write-ups, making your portfolio easy to show employers." },
  ],

  seeHeading: "Why proof of work wins",

  cases: [
    {
      org: "Portfolios in cyber hiring",
      year: "current",
      headline: "Because employers skills-test, demonstrable work sets a beginner apart",
      whatHappened: "A consistent reality in cyber hiring is that employers increasingly skills-test candidates, wanting proof of what they can actually do rather than relying on claims or certifications alone. This makes a portfolio, a collection of real artefacts like security audits, breach write-ups, incident timelines, risk assessments and working scripts, one of the most powerful things a beginner can have: it demonstrates ability directly, breaks the 'need experience to get experience' trap, and lets a capable beginner out-compete candidates with longer CVs but nothing to show. Those who present a tidy, genuine portfolio of real work stand out precisely because so few beginners do.",
      theMissedMeasure: "Building and presenting a portfolio of demonstrable work. In a skills-testing market, proof of ability is the great equaliser, and the pieces this course produced (audit, phishing guide, vuln note, hardening checklist, incident report, risk assessment, script) are exactly that proof.",
      theCost: "Here the value is advantage: a strong portfolio lets a beginner demonstrate ability before anyone hires them, turning the hardest part of getting a first job, proving you can do it, into a solved problem.",
      control: "access-control",
      impact: ["employers skills-test: proof of ability wins", "a portfolio breaks the experience trap", "the course's artefacts are real, credible portfolio pieces"],
      source: "Public record; cyber hiring norms around skills-testing (current).",
      brandColor: "#27ae60",
      news: { headline: "Why a portfolio of real work is a beginner's biggest advantage", outlet: "Cyber hiring norms (current)", date: "current" },
    },
  ],

  lab: {
    title: "Strong portfolio piece, or weak?",
    intro: "Nothing to install and nothing leaves this page. For each, decide: a strong portfolio piece, or weak?",
    prompts: [
      "Strong: real, demonstrable work (audit, breach write-up, IR timeline, a script).",
      "Weak: claims, buzzwords, and lists of terms with nothing to show.",
      "You have been building the strong kind throughout this course.",
    ],
    component: PortfolioLab,
  },

  check: {
    explain: {
      prompt: "Explain why a portfolio beats claims for a beginner, what pieces you have already built in this course, and how to make a portfolio presentable.",
      modelAnswer: "A portfolio beats claims for a beginner because employers increasingly skills-test and want evidence you can actually do the work, not assurances that you are passionate and a fast learner, which everyone says; a portfolio of real artefacts turns 'I understand security' into 'here is security work I have done', which is far more convincing, and it breaks the 'need experience to get experience' trap by demonstrating ability before anyone hires you, so a capable beginner with a strong portfolio can out-compete someone with a longer CV but nothing to show. I have already built a portfolio throughout this course by design: a Personal Security Audit (Module 5), a Phishing Field Guide (Module 7), a vulnerability-assessment note (Module 11), a hardening checklist (Module 12), an incident report (Module 16), a small-business risk assessment (Module 17), and a working script with a README from the Code Lab, each a concrete artefact that mirrors real role deliverables. To make a portfolio presentable, I collect the pieces in one shareable place (a tidy document, a personal site, or a public code repository), tidy each so it reads clearly to a stranger with a short intro then the work, and aim for quality over quantity with a handful of clear, genuine pieces, keeping it honest because I may be asked to discuss each one.",
    },
    quiz: [
      {
        q: "Why is a portfolio so powerful for a beginner?",
        options: [
          "It replaces the need for any skill",
          "Employers skills-test, so demonstrable work proves ability and breaks the 'experience trap'",
          "It is only for artists",
          "Claims are more convincing than work",
        ],
        answer: 1,
        why: "Proof of what you can do lets a beginner demonstrate ability before anyone hires them, out-competing longer CVs with nothing to show.",
      },
      {
        q: "Which is a genuine portfolio piece you built in this course?",
        options: [
          "A statement that you are passionate",
          "A Personal Security Audit, or an incident report, with real findings",
          "A list of cyber words",
          "Nothing; the course had no deliverables",
        ],
        answer: 1,
        why: "The course produced real artefacts (audit, phishing guide, vuln note, hardening checklist, incident report, risk assessment, script), exactly the credible pieces.",
      },
      {
        q: "How should you present your portfolio?",
        options: [
          "A cluttered pile of half-finished work",
          "A handful of clear, genuine pieces, tidied and shareable, honest enough to discuss",
          "Hidden so no one can see it",
          "Padded with work you did not do",
        ],
        answer: 1,
        why: "Quality over quantity, clearly presented and shareable, and honest, because you may be asked to discuss each piece.",
      },
    ],
  },

  wrap: {
    headline: "You now have the beginner's greatest asset, a portfolio of real work, and you built it throughout this course.",
    takeaways: [
      "Employers skills-test, so a portfolio of demonstrable work beats claims and breaks the experience trap.",
      "You already built real pieces: audit, phishing guide, vuln note, hardening checklist, incident report, risk assessment, a script.",
      "Make it presentable: a few clear, genuine, shareable pieces, honest enough to discuss.",
    ],
    project: {
      name: "Assemble your portfolio",
      blurb: "Gather the pieces you built across the course into one tidy, shareable place (a document, a personal page, or a public repo). Give each a one-line intro. Polish the two or three strongest. This assembled portfolio is the single most valuable thing you take from the course into the job hunt, finish it.",
    },
    ethicsNote: "Present only real work you actually did and understand; you may be asked to discuss it. Honesty in your portfolio is both ethical and practical, the field values integrity and easily spots inflated claims.",
  },
};

export default topic1;
