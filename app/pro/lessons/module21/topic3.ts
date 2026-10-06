import type { TopicManifest } from "../../learn/types";
import { InterviewLab } from "../../learn/conceptLabs";

/* Module 21 - Topic 3: interview prep. Honest, practical guidance: cyber
 * interviews test how you think (scenarios), reward honesty about gaps,
 * and let you show your portfolio. No invented statistics. */
const topic3: TopicManifest = {
  id: "m21t3",
  weekLabel: "Module 21",
  act: "Act 4 - Get hired",
  title: "Interview prep",
  role: "Interviews are where a capable beginner can really shine, because cyber interviews often test how you think, not just what you have memorised. Knowing how to handle scenario questions, gaps in your knowledge, and showing your work turns the interview from an ordeal into an opportunity.",
  minutes: 15,
  promise: "Learn how cyber interviews really work, and how to shine in them by showing how you think, being honest, and pointing to your work.",
  brief: "In this lesson, we'll prepare you for cyber interviews. The key insight is that they often test how you think, through scenario questions, more than what you have memorised, which is great news for a thoughtful beginner. We'll see how to handle scenario questions (show your reasoning), gaps in your knowledge (be honest, show your method), and how to use your portfolio to prove ability.",

  learn: [
    {
      heading: "Scenario questions test how you think",
      body: [
        "A great deal of cyber interviewing is scenario-based: 'an alert shows X, what do you do?', 'how would you investigate Y?', 'how would you secure Z?'. The crucial insight is that these test how you think, your reasoning process, more than whether you know one 'right' answer. Interviewers want to see a calm, structured approach: gathering context, weighing evidence, deciding, escalating, exactly the triage and reasoning this course has drilled.",
        "This is wonderful news for a thoughtful beginner, because you can prepare for it not by memorising facts but by practising reasoning. When you get a scenario question, think aloud: walk through your approach step by step, showing how you would gather information, what you would consider, and how you would decide. A clear thought process, even without a perfect answer, impresses far more than a memorised one-liner. Demonstrating how you think is the whole point.",
      ],
      examples: [
        "'An alert shows X, what do you do?' tests your reasoning, not one memorised answer.",
        "Think aloud: gather context, weigh evidence, decide, escalate (your triage training).",
        "A clear thought process beats a memorised one-liner.",
      ],
      analogy: {
        plain: "A good driving examiner watches how you handle situations, your awareness and decisions, not whether you recite the manual. Scenario questions watch how you handle security situations.",
        realTerm: "scenario questions",
      },
    },
    {
      heading: "Honesty about gaps is a strength",
      body: [
        "Nobody knows everything in security, and interviewers know it, so they are not expecting omniscience. When you are asked something you genuinely do not know, the best response is honesty plus method: 'I'm not sure about that specific thing, but here is how I would find out, I'd check the vendor advisory, look at the logs, and test it in a lab.' This shows two things interviewers love: integrity, and the ability to learn and problem-solve, which matter more than any single fact.",
        "The opposite, bluffing, is a serious mistake. Interviewers can usually spot it instantly, and it destroys trust far more than admitting a gap ever would. In a field built on integrity and careful reasoning, honesty about what you do not know, paired with a clear method for finding out, is genuinely impressive. Treat every gap as a chance to show how you learn, not a failure to hide. This confident honesty is exactly the professional maturity employers want.",
      ],
      examples: [
        "Don't know something? Be honest, then show your method for finding out.",
        "This shows integrity and problem-solving, worth more than any single fact.",
        "Bluffing is spotted instantly and destroys trust; honesty about gaps is a strength.",
      ],
    },
    {
      heading: "Show your work, and let it speak",
      body: [
        "Your portfolio is a powerful interview tool, so use it. When discussing your experience or answering 'why should we hire you?', point to real pieces you built: 'I performed a security audit and here is what I found and fixed', 'I reconstructed an incident timeline from evidence'. Discussing genuine work you understand is far more convincing than generic claims, and it lets you demonstrate real ability rather than just asserting it. Be ready to talk through your pieces, what you did, why, and what you learned.",
        "Combine the three and you have a strong interview approach for a beginner: show how you think on scenarios, be honestly impressive about gaps, and prove ability through your portfolio. Prepare by practising reasoning aloud, reviewing your own portfolio pieces so you can discuss them fluently, and researching the role and organisation. You are not trying to seem like a seasoned expert; you are showing you are a capable, honest, thoughtful person who can clearly do the job and keep learning, which is exactly who gets hired.",
      ],
      examples: [
        "Point to real portfolio pieces: 'I did this audit; here is what I found'.",
        "Be ready to discuss what you did, why, and what you learned.",
        "Show how you think + honest about gaps + prove ability with your portfolio.",
      ],
      analogy: {
        plain: "In a job interview for a craftsperson, you bring examples of your work and talk through how you made them. Your portfolio is your examples; discuss them with pride and honesty.",
        realTerm: "showing your work",
      },
    },
  ],

  glossary: [
    { term: "scenario question", definition: "An interview question posing a situation ('an alert shows X, what do you do?') to test your reasoning process, not a single memorised answer." },
    { term: "thinking aloud", definition: "Walking through your reasoning step by step so the interviewer sees how you approach a problem, impressive even without a perfect answer." },
    { term: "honest about gaps", definition: "Admitting what you do not know and explaining how you would find out, showing integrity and problem-solving." },
    { term: "showing your work", definition: "Using your portfolio to demonstrate ability in an interview, discussing real pieces you built and understand." },
  ],

  seeHeading: "How to shine as a thoughtful beginner",

  cases: [
    {
      org: "Cyber interviews",
      year: "current",
      headline: "Interviews test how you think, reward honesty, and let you show your work",
      whatHappened: "Cyber security interviews frequently rely on scenario questions that test a candidate's reasoning and approach rather than only memorised facts, which means a thoughtful beginner who can think aloud through a problem, gathering context, weighing evidence, deciding, can shine. Interviewers also value honesty about gaps (admitting what you do not know and explaining how you would find out) far above bluffing, which is easily spotted, and they are receptive to candidates who demonstrate real ability by discussing portfolio pieces they built. The candidates who do well are not those who have memorised the most, but those who reason clearly, are honest, and can show genuine work.",
      theMissedMeasure: "Preparing to show how you think, being honest about gaps, and using your portfolio. These play directly to a capable beginner's strengths and are entirely preparable, turning the interview from an ordeal into an opportunity to shine.",
      theCost: "Here the value is opportunity: understanding that interviews reward clear reasoning, honesty and demonstrable work lets a beginner prepare effectively and perform well, rather than freezing or bluffing under pressure.",
      control: "access-control",
      impact: ["scenario questions test reasoning, not just memory", "honesty about gaps beats bluffing", "portfolio pieces prove ability in the room"],
      source: "Public record; cyber interview norms (current).",
      brandColor: "#5b8def",
      news: { headline: "How to shine in a cyber security interview as a beginner", outlet: "Interview norms (current)", date: "current" },
    },
  ],

  lab: {
    title: "Handle the interview",
    intro: "Nothing to install and nothing leaves this page. You are in a cyber interview. Make the honest, structured choices that show how you think.",
    prompts: [
      "On scenarios, walk through your reasoning step by step.",
      "On gaps, be honest and show your method for finding out, never bluff.",
      "Point to your portfolio: real work proves ability.",
    ],
    component: InterviewLab,
  },

  check: {
    explain: {
      prompt: "Explain how cyber interviews often work, and how a beginner should handle scenario questions, gaps in their knowledge, and demonstrating ability.",
      modelAnswer: "Cyber interviews are frequently scenario-based ('an alert shows X, what do you do?', 'how would you secure Y?'), and the crucial insight is that these test how you think, your reasoning process, more than whether you know one 'right' answer, which is great news for a thoughtful beginner. On scenario questions, you should think aloud: walk through your approach step by step, gathering context, weighing evidence, deciding and escalating, exactly the triage reasoning the course drilled, because a clear thought process impresses far more than a memorised one-liner, even without a perfect answer. On gaps in your knowledge, the best response is honesty plus method: admit you are not sure about the specific thing but explain how you would find out ('I'd check the vendor advisory, look at the logs, test it in a lab'), which shows integrity and problem-solving, both worth more than any single fact, whereas bluffing is easily spotted and destroys trust. To demonstrate ability, use your portfolio: point to real pieces you built ('I performed this audit and here is what I found and fixed'), be ready to discuss what you did, why, and what you learned, because discussing genuine work you understand proves ability rather than just asserting it. Combining these, showing how you think, being honestly impressive about gaps, and proving ability through your portfolio, is a strong interview approach for a beginner, showing you are capable, honest and thoughtful, exactly who gets hired.",
    },
    quiz: [
      {
        q: "What do scenario interview questions mainly test?",
        options: [
          "How much you have memorised",
          "How you think: your reasoning and approach to a situation",
          "How fast you can type",
          "Your favourite tools",
        ],
        answer: 1,
        why: "They test your reasoning process, so thinking aloud through your approach is what impresses, great news for a thoughtful beginner.",
      },
      {
        q: "How should you handle a question you genuinely cannot answer?",
        options: [
          "Bluff convincingly",
          "Be honest that you are not sure, and explain how you would find out",
          "Refuse to answer",
          "Claim you know it anyway",
        ],
        answer: 1,
        why: "Honesty plus a method shows integrity and problem-solving. Bluffing is spotted instantly and destroys trust.",
      },
      {
        q: "How do you best demonstrate ability in an interview?",
        options: [
          "Insist you are passionate",
          "Point to real portfolio pieces and discuss what you did, why, and what you learned",
          "List every tool you have heard of",
          "Claim experience you lack",
        ],
        answer: 1,
        why: "Discussing genuine work you understand proves ability far better than claims. Your portfolio is your evidence in the room.",
      },
    ],
  },

  wrap: {
    headline: "You can now approach interviews with confidence: show how you think, be honest, and let your work speak.",
    takeaways: [
      "Cyber interviews often test how you think (scenarios), which a thoughtful beginner can prepare for by reasoning aloud.",
      "Honesty about gaps, with a method for finding out, is a strength; bluffing is spotted and destroys trust.",
      "Use your portfolio to demonstrate ability: discuss real work you built, why, and what you learned.",
    ],
    project: {
      name: "Rehearse a scenario",
      blurb: "Take a scenario question ('an alert shows failed logins then a success from an odd location, what do you do?') and write, or say aloud, your step-by-step reasoning. Then pick one portfolio piece and practise explaining it in two minutes. Rehearsing reasoning and your work is exactly how you prepare to shine in interviews.",
    },
    ethicsNote: "Interview honestly: show real reasoning, admit genuine gaps, and discuss only work you actually did. Integrity in interviews reflects the integrity the whole profession runs on (Module 5).",
  },
};

export default topic3;
