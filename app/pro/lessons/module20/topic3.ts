import type { TopicManifest } from "../../learn/types";
import { CertRoadmapLab } from "../../learn/conceptLabs";

/* Module 20 - Topic 3: the certification roadmap. Honest, hype-free
 * guidance: a foundational cert, then CompTIA Security+ as the key UK
 * entry standard, then specialise; advanced certs come later and are
 * often employer-funded. Claims policy: "aligned to objectives", never
 * "certification included"; no guarantees. */
const topic3: TopicManifest = {
  id: "m20t3",
  weekLabel: "Module 20",
  act: "Act 4 - Get hired",
  title: "The certification roadmap",
  role: "Certifications matter in cyber hiring, but in a specific order and with realistic expectations. Knowing the sensible roadmap, and that certs help rather than guarantee, lets you invest your time and money wisely instead of chasing prestige names too soon.",
  minutes: 15,
  promise: "Get a sensible, honest certification roadmap, so you invest in the right certs in the right order, and avoid the expensive mistakes.",
  brief: "In this lesson, we'll map a sensible certification path. Certs help in cyber hiring, but order and expectations matter. We'll see the typical progression, a foundational cert, then CompTIA Security+ as the key entry standard, then a specialism, with advanced certs coming later, and the honest truth that certifications help you but do not, alone, guarantee a job. This course is aligned to these objectives, not a certification itself.",

  learn: [
    {
      heading: "A sensible order: foundation, then Security+, then specialise",
      body: [
        "Certifications have a sensible progression for a beginner, and following it saves time and money. Start with a foundational entry certification (such as ISC2's Certified in Cybersecurity) to establish the basics and show commitment. Then aim for CompTIA Security+, which is widely recognised as the baseline entry certification in the UK and is the one most often asked for in junior roles. With that base, you specialise toward your chosen direction (a blue-team, cloud, or GRC-oriented cert, depending on your path). Advanced, prestige certifications come later, often once you have experience, and are frequently employer-funded.",
        "The order matters because building the base before chasing prestige names is both cheaper and more effective. A beginner who spends heavily on an advanced, expensive certification they are not ready for, before the widely-asked-for Security+, has usually mis-invested. Foundation, then the recognised entry standard, then specialise, then advanced, is the path that matches how hiring actually works.",
      ],
      examples: [
        "Foundation (e.g. ISC2 CC), then CompTIA Security+ (the key UK entry standard).",
        "Then specialise toward your path (blue team, cloud, GRC).",
        "Advanced/prestige certs come later, often employer-funded.",
      ],
      analogy: {
        plain: "You get a driving licence before an advanced-driving qualification. Doing it in order is cheaper, sensible, and matches what employers expect.",
        realTerm: "cert progression",
      },
    },
    {
      heading: "Certs help, but do not guarantee",
      body: [
        "An honest, important truth: certifications help you get hired, but they do not, by themselves, guarantee a job. They demonstrate knowledge and commitment, and many job ads ask for specific ones (especially Security+), so they open doors. But employers increasingly skills-test, so what you can actually do, shown through a portfolio and real understanding, matters as much as the letters after your name. A certification plus demonstrable skill is far stronger than a certification alone.",
        "This matters because the training industry sometimes oversells certifications as a golden ticket. They are not. Treat certs as one valuable part of your case, alongside your portfolio, your understanding, and your persistence, rather than the whole case. Investing sensibly (the right certs, in order) and pairing them with demonstrable ability is the realistic, effective strategy, and it protects you from spending a fortune chasing certs in the false belief that they alone will land the job.",
      ],
      examples: [
        "Certs demonstrate knowledge and commitment, and open doors (many ads require them).",
        "But employers skills-test: demonstrable ability matters as much as the letters.",
        "Cert plus portfolio and real skill beats a cert alone.",
      ],
    },
    {
      heading: "Aligned to objectives, honestly",
      body: [
        "A word on this course and certifications, honestly. This course is aligned to the objectives of recognised certifications, especially CompTIA Security+: the topics you have learned map closely onto what Security+ and similar certs cover, so this course is excellent preparation and gives you the understanding those certs test. But the course is not itself a certification, and completing it does not award you one. Earning a certification means studying for and passing that certification's own exam.",
        "This honesty matters, because the field is full of overblown claims, and you deserve to know exactly what you have and what you still need. What this course gives you is genuine understanding and a portfolio, which are the hard part and the foundation. Certifications are a defined next step you now understand how to approach sensibly. Combine the understanding you have built with the right certifications, in order, and you have a strong, honest case for getting hired.",
      ],
      examples: [
        "This course is aligned to cert objectives (especially Security+): excellent preparation.",
        "It is not itself a certification; earning one means passing that cert's own exam.",
        "Understanding + portfolio (the hard part) plus the right certs is a strong case.",
      ],
      analogy: {
        plain: "A good revision course prepares you thoroughly for an exam, but you still sit the exam to get the qualification. This course is that thorough preparation.",
        realTerm: "aligned, not included",
      },
    },
  ],

  glossary: [
    { term: "CompTIA Security+", definition: "A widely-recognised baseline entry certification, often the one asked for in junior UK cyber roles." },
    { term: "foundational cert", definition: "A beginner-friendly first certification (such as ISC2's Certified in Cybersecurity) to establish the basics." },
    { term: "specialist cert", definition: "A certification aligned to a chosen path (blue team, cloud, GRC), taken after the entry-level base." },
    { term: "aligned to objectives", definition: "Covering the knowledge a certification tests, as good preparation, without being the certification itself." },
  ],

  seeHeading: "A sensible, honest cert path",

  cases: [
    {
      org: "The certification roadmap",
      year: "current",
      headline: "A sensible order, foundation then Security+ then specialise, beats chasing prestige names",
      whatHappened: "In cyber hiring, certifications follow a sensible progression, and beginners who respect it fare better. A foundational cert establishes the basics; CompTIA Security+ is the widely-recognised entry standard most often asked for in junior roles; then a specialist cert aligned to a chosen path; with advanced, prestige certifications coming later and often employer-funded. The common, costly mistake is chasing an expensive advanced certification too soon, before the widely-asked-for Security+, or believing certifications alone guarantee a job, when employers increasingly skills-test and value demonstrable ability (a portfolio) alongside the letters.",
      theMissedMeasure: "Investing in certifications sensibly, the right ones in the right order, and pairing them with demonstrable skill, rather than over-spending on prestige certs too early or treating certs as a golden ticket. This is honest, effective career strategy.",
      theCost: "The cost of ignoring the roadmap is wasted money and effort on certs taken out of order or oversold as guarantees; following it, and pairing certs with a portfolio, is the realistic path to getting hired.",
      control: "access-control",
      impact: ["order: foundation, Security+, specialise, then advanced", "certs help but do not guarantee; employers skills-test", "pair certs with demonstrable skill (a portfolio)"],
      source: "Public record; cyber certification and hiring norms (current).",
      brandColor: "#e2231a",
      news: { headline: "The sensible cyber certification roadmap for beginners", outlet: "Certification and hiring norms (current)", date: "current" },
    },
  ],

  lab: {
    title: "Order the cert path",
    intro: "Nothing to install and nothing leaves this page. Put these certifications in a sensible order, from foundational first to specialised/advanced later.",
    prompts: [
      "Foundation first, then Security+ (the key entry standard), then specialise, then advanced.",
      "Build the base before chasing prestige names.",
      "Advanced certs are often employer-funded and come with experience.",
    ],
    component: CertRoadmapLab,
  },

  check: {
    explain: {
      prompt: "Describe the sensible certification roadmap for a beginner, explain why certs help but do not guarantee a job, and clarify what 'aligned to objectives' means for this course.",
      modelAnswer: "The sensible certification roadmap for a beginner is: start with a foundational entry cert (such as ISC2's Certified in Cybersecurity) to establish the basics and show commitment; then aim for CompTIA Security+, the widely-recognised baseline entry certification most often asked for in junior UK roles; then specialise with a cert aligned to your chosen path (blue team, cloud, GRC); with advanced, prestige certs coming later, often once you have experience and frequently employer-funded. The order matters because building the base before chasing prestige names is cheaper and matches how hiring works; spending heavily on an advanced cert before the widely-asked-for Security+ is usually a mis-investment. Certs help but do not guarantee a job because, while they demonstrate knowledge and commitment and many ads require specific ones (opening doors), employers increasingly skills-test, so demonstrable ability shown through a portfolio and real understanding matters as much as the letters; a cert plus demonstrable skill is far stronger than a cert alone, and treating certs as a golden ticket is a mistake. 'Aligned to objectives' means this course covers the knowledge that recognised certifications, especially Security+, test, so it is excellent preparation and gives you the understanding those certs assess, but it is not itself a certification: earning one means studying for and passing that certification's own exam. The course gives you genuine understanding and a portfolio, the hard part, and the certifications are a defined, sensible next step.",
    },
    quiz: [
      {
        q: "What is a sensible certification order for a beginner?",
        options: [
          "An advanced specialist cert first, then Security+, then a foundational entry cert",
          "A specialism first, taken before any general entry-level certification at all",
          "Whichever single certification your very first employer happens to pay for",
          "A foundational cert, then CompTIA Security+, then a specialism, with advanced certs later",
          "The most expensive prestige cert first, because it impresses employers the most",
        ],
        answer: 3,
        reasons: [
          "This is upside down. You build the base first; an advanced specialist cert before the widely-asked-for Security+ is usually a mis-investment.",
          "Specialising before you have the general base skips the step employers expect. The foundation and Security+ come before a specialism.",
          "Letting your employer's budget pick for you is not a plan, and most beginners need the base before any employer will fund anything.",
          "Right. Build the base before chasing prestige names: a foundational cert, then the recognised entry standard (Security+), then specialise, with advanced certs later.",
          "Buying the most expensive cert first is the classic costly mistake. It usually comes too soon, before the base that junior roles actually ask for.",
        ],
      },
      {
        q: "Do certifications guarantee a job?",
        options: [
          "Yes; holding CompTIA Security+ on its own guarantees you a junior role",
          "No; employers now ignore certifications entirely and look only at experience",
          "No; they help and open doors, but employers skills-test, so ability matters as much",
          "Only if you hold several advanced certifications all at the same time",
          "Yes, as long as you pass the exam with a high enough score",
        ],
        answer: 2,
        reasons: [
          "A single cert never guarantees a role. Security+ helps and opens doors, but employers also skills-test what you can actually do.",
          "Too far the other way. Certifications are not ignored; many ads ask for them. They just are not enough on their own.",
          "Right. A cert plus a portfolio and real skill is far stronger than a cert alone. Certifications are one valuable part of your case, not a golden ticket.",
          "Stacking advanced certs does not guarantee anything either, and taking them too early is a common, costly mistake for a beginner.",
          "A high exam score still only proves knowledge. Employers want evidence you can apply it, which is why demonstrable ability matters too.",
        ],
      },
      {
        q: "What does 'this course is aligned to certification objectives' mean?",
        options: [
          "That it covers the knowledge certs like Security+ test, but is not itself a cert",
          "That finishing the course automatically awards you the CompTIA Security+ certificate",
          "That the course lets you skip the Security+ exam yet still count as certified",
          "That completing the course counts as official exam credit towards a certification",
          "That the course was written and officially endorsed by CompTIA themselves",
        ],
        answer: 0,
        reasons: [
          "Right. Aligned means the course covers what certs like Security+ test, so it is excellent preparation and real understanding, but earning a cert still means passing that cert's own exam.",
          "No cert is awarded just for finishing. You still study for and sit the certification's own exam to earn it.",
          "There is no skipping the exam. Aligned means good preparation for it, not a way around sitting it.",
          "Course completion is not exam credit. It prepares you for the exam, but the certification body still requires you to pass their test.",
          "Aligned to objectives does not mean vendor-endorsed. It simply means the content maps onto what the certification covers.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You now have a sensible, honest certification roadmap, and realistic expectations of what certs do.",
    takeaways: [
      "Follow the order: a foundational cert, then CompTIA Security+ (the key entry standard), then specialise, then advanced.",
      "Certs help and open doors but do not guarantee a job; pair them with demonstrable skill (a portfolio).",
      "This course is aligned to cert objectives (especially Security+): strong preparation, but earning a cert means passing its exam.",
    ],
    project: {
      name: "Plan your certs",
      blurb: "Write your own cert plan: which foundational cert (if any), when you would aim for Security+, and one specialism to target afterwards, roughly what each costs and involves. Having a realistic, ordered plan, paired with your portfolio, turns 'I should get certified' into a concrete, affordable path.",
    },
    ethicsNote: "Be honest about what you hold: claim certifications only once earned, and describe your skills accurately. The field values integrity, and overstating qualifications is both unethical and easily caught.",
  },
};

export default topic3;
