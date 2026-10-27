import type { TopicManifest } from "../../learn/types";
import { PhishResponseLab } from "../../learn/conceptLabs";

/* Module 7 - Topic 5: spot, report, and run a phishing test. Case:
 * Snapchat, 2016 (an employee was deceived by a CEO-impersonation email
 * into sending payroll / W-2 data on current and former staff; a classic
 * "a reporting-and-verification culture would have caught it" story).
 * Public record: Snapchat's own 2016 apology/blog and reporting. */
const topic5: TopicManifest = {
  id: "m7t5",
  weekLabel: "Module 7",
  act: "Act 2 - How attacks happen",
  title: "Spot, report, and test",
  role: "Individual vigilance matters, but a reporting culture and authorised testing are what protect an organisation at scale. Understanding how a security team turns 'spot it' into 'report it, warn everyone, and improve' is how you think like a defender, not just a careful user.",
  minutes: 17,
  promise: "Turn spotting a phish into protecting everyone, then see what one unreported deception cost a company's whole workforce.",
  brief: "In this lesson, we'll move from the individual to the organisation. Spotting a phishing email is good; reporting it so the whole organisation is protected is far better. We'll learn why a safe, easy reporting culture is the real defence, and how organisations use authorised phishing simulations, carefully and ethically, to build resilience. Then we'll see the Snapchat case, where a single deceived employee exposed the entire workforce's sensitive data.",

  learn: [
    {
      heading: "Reporting beats catching",
      body: [
        "It feels like the goal is to never be fooled, but that is not realistic, and it is not the real goal. The goal is that when an attack arrives, or even succeeds, the organisation finds out fast and acts. One person spotting and reporting a phish lets the security team warn everyone else, block the sender, and hunt for who else received it. A click that is reported immediately can be contained in minutes; a click hidden out of embarrassment can become a disaster.",
        "This is why a blame-free, easy reporting culture is worth more than any amount of individual cleverness. The best organisations make reporting a one-click action, thank people for reporting (even false alarms), and never punish an honest mistake. 'See something, say something' only works if saying something is safe and simple.",
      ],
      examples: [
        "A reported phish lets the team protect everyone who received it, not just the reporter.",
        "A reported click is a contained incident; a hidden one is a growing breach.",
        "Thanking people for reporting, even false alarms, keeps the reports coming.",
      ],
      analogy: {
        plain: "A fire is survivable if someone raises the alarm the moment they smell smoke. A fire hidden out of fear of looking foolish is the one that burns the building down.",
        realTerm: "a reporting culture",
      },
    },
    {
      heading: "What to do with a suspicious message",
      body: [
        "The response to a suspicious message is a simple, repeatable drill. Do not click links or open attachments. Do not reply, replying only talks to the attacker. If the message makes a request, verify it through a separate, trusted channel (a known phone number, speaking to the person directly), never through the message itself. And then report it, using your organisation's reporting button or security contact.",
        "Notice that verification and reporting are the two active steps, and both protect more than just you. Verifying stops you acting on a fake; reporting protects everyone else. For anything involving money, access or sensitive data, these steps are non-negotiable regardless of how genuine the request looks, because, as the whole module has shown, looking genuine is exactly what a good attack does.",
      ],
      examples: [
        "Do not click, do not open, do not reply.",
        "Verify any request through a trusted, independent channel.",
        "Report it through the official route so the team can protect everyone.",
      ],
    },
    {
      heading: "Authorised phishing tests, done ethically",
      body: [
        "Organisations also go on the front foot with authorised phishing simulations: the security team, with proper sign-off, sends harmless mock phishing emails to its own staff to measure how many click and to give immediate, supportive training to those who do. Used well, this builds real resilience and a healthy reporting reflex. It is a legitimate, common part of a security programme, and it connects straight back to the authorisation and scope lessons of Module 5: it is only acceptable because it is sanctioned, internal, and consented to at an organisational level.",
        "But it must be done kindly, or it backfires. Simulations that humiliate or punish people destroy the very reporting culture they are meant to build, making staff hide real incidents. The goal is learning and resilience, never a 'gotcha'. A good programme teaches, reassures, and celebrates reporting, so the lesson people take away is 'it is safe to report', not 'I will be punished for a mistake'.",
      ],
      examples: [
        "Authorised simulations measure click rates and deliver gentle, immediate training.",
        "They are lawful because they are internal, sanctioned and organisationally consented, the Module 5 principle.",
        "Done cruelly, they destroy reporting culture; done kindly, they build it.",
      ],
      analogy: {
        plain: "A fire drill is useful because it is planned, announced in principle, and aimed at learning, not at catching people out. A phishing test should feel the same: practice, not a trap.",
        realTerm: "authorised phishing simulation",
      },
    },
  ],

  glossary: [
    { term: "reporting culture", definition: "An organisational environment where reporting suspicious activity or mistakes is easy, safe and encouraged, never punished." },
    { term: "phishing simulation", definition: "An authorised, internal exercise where a security team sends harmless mock phishing to staff to measure and improve resilience." },
    { term: "out-of-band verification", definition: "Confirming a request through a separate, trusted channel the attacker does not control, such as a known phone number." },
    { term: "containment", definition: "Acting quickly to limit the damage of an incident, far easier when it is reported early rather than hidden." },
  ],

  seeHeading: "When one deception exposed a whole workforce",

  cases: [
    {
      org: "Snapchat",
      year: "2016",
      headline: "A single impersonation email exposed the payroll data of current and former staff",
      whatHappened: "In early 2016, a Snapchat employee received an email that appeared to come from the chief executive, requesting payroll information. Believing it genuine, the employee sent sensitive data, including details on a number of current and former employees. It was a classic business-email-compromise / phishing attack: no systems were breached, a person was simply deceived by an authoritative-looking request. Snapchat disclosed the incident and apologised to those affected.",
      theMissedMeasure: "Verification and a strong reporting-and-checking culture. An unusual request for a whole workforce's sensitive data should have triggered an out-of-band check with the supposed sender before anything was sent. A culture where verifying such a request is the default, and where staff feel safe pausing even on a 'CEO' email, would have caught it.",
      theCost: "The exposure of sensitive personal and payroll data for current and former employees, the harm and anxiety that causes individuals, and reputational damage, all from one deceptive email that a verification habit would have stopped.",
      control: "access-control",
      impact: ["payroll data of current and former staff exposed", "a deceived employee, not a technical breach", "verification and reporting culture would have caught it"],
      source: "Public record; Snapchat's own 2016 statement and contemporaneous reporting.",
      brandColor: "#fffc00",
      news: { headline: "Snapchat employee data leaked after phishing scam", outlet: "Mainstream reporting (2016)", date: "2016" },
    },
  ],

  lab: {
    title: "Handle the suspicious email",
    intro: "Nothing to install and nothing leaves this page. A suspicious email arrives at work. Make the calm, process-following choices that protect you and everyone else.",
    prompts: [
      "Do not click, do not reply: pause first.",
      "Verify any request through a separate trusted channel.",
      "Report it, so the whole organisation is protected, not just you.",
    ],
    component: PhishResponseLab,
  },

  check: {
    explain: {
      prompt: "A Snapchat employee sent payroll data because a 'CEO' email asked for it. Explain how a reporting-and-verification culture would have changed the outcome, and why reporting matters even when you successfully spot a phish.",
      modelAnswer: "A verification culture would have made it normal, and safe, for the employee to pause on an unusual request for a whole workforce's sensitive data and confirm it out-of-band with the real CEO through a trusted channel before sending anything. That single check would have exposed the impersonation and stopped the leak. Reporting matters even when you spot a phish because spotting it protects only you; reporting it lets the security team warn everyone who received it, block the sender, and investigate. One person's report turns an individual near-miss into protection for the whole organisation, which is why a blame-free, easy reporting culture is the real defence.",
    },
    quiz: [
      {
        q: "Why is reporting a phishing email more valuable than just spotting and deleting it?",
        options: [
          "Deleting it quietly protects you just as well as reporting it does",
          "Reporting it recovers any money or data that has already been lost",
          "Deleting it without reporting is what actually lets the attack spread",
          "Reporting it guarantees the attacker will be identified and prosecuted",
          "Reporting lets the team warn everyone, block the sender and investigate, protecting the whole organisation",
        ],
        answer: 4,
        reasons: [
          "Deleting it protects only you. Everyone else who received the same message is still exposed until the team is told.",
          "Reporting is valuable, but it does not reverse a loss that has already happened. Its power is protecting everyone else from the same attack.",
          "Deleting it does not spread the attack; it just leaves others unwarned. The harm is the missed chance to protect them, not active spreading.",
          "Reporting helps the defence, but it cannot guarantee anyone is caught or prosecuted. Its real value is protecting the rest of the organisation.",
          "Right. Spotting protects you; reporting protects everyone. The team can warn others, block the sender and investigate only if the incident is reported.",
        ],
      },
      {
        q: "What makes a reporting culture effective?",
        options: [
          "Making reporting easy and safe, thanking people even for false alarms, and never punishing honest mistakes",
          "Publishing the names of the staff who fall for the phishing tests",
          "Keeping every reported incident strictly confidential within the team",
          "Requiring staff to prove a message is malicious before they report it",
          "Rewarding only those staff who have never raised a single false alarm",
        ],
        answer: 0,
        reasons: [
          "Right. Blame drives mistakes underground, but easy, safe and appreciated reporting keeps the reports flowing, so incidents are caught early.",
          "Naming and shaming people who fall for tests is the fastest way to make everyone hide their mistakes rather than report them.",
          "Some confidentiality is fine, but secrecy is not what makes reporting work. What matters is that reporting is easy, safe and welcomed.",
          "If people must prove an email is malicious first, most will not bother, and real attacks go unreported. Reporting should be low-effort and no-risk.",
          "Punishing false alarms teaches people to stay silent when unsure, and it is the near-misses you most want them to report.",
        ],
      },
      {
        q: "An authorised phishing simulation is acceptable because it is:",
        options: [
          "A surprise test that is designed to catch out the careless staff",
          "An external test quietly run without the company's own knowledge",
          "A mock phishing email that is sent out to the company's customers",
          "Internal, sanctioned and consented, and run kindly to build resilience, not to humiliate",
          "A real phishing campaign simply redirected at the company's own staff",
        ],
        answer: 3,
        reasons: [
          "A 'gotcha' designed to catch people out destroys the reporting culture it should build. A good simulation is practice, not a trap.",
          "A test run without the company's knowledge is not authorised, so it fails the very principle that makes a simulation lawful and ethical.",
          "Sending mock phishing to customers is neither internal nor consented by them, so it is not a legitimate internal simulation.",
          "Right. It is lawful and ethical only because it is internal, sanctioned and consented (the Module 5 principle), and it works only when run supportively, as practice.",
          "A real phishing campaign is a genuine attack, not a controlled, harmless exercise. A simulation must use safe, mock messages with sign-off.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You finished Module 7: you can spot social engineering, respond calmly, and help protect a whole organisation.",
    takeaways: [
      "Reporting beats catching: a reported phish or click protects everyone and can be contained fast.",
      "The drill is simple: do not click or reply, verify requests out-of-band, and report through the official channel.",
      "Authorised, kindly-run phishing simulations build resilience, legitimate only because they are internal, sanctioned and consented.",
    ],
    project: {
      name: "Finish your Phishing Field Guide",
      blurb: "Pull together everything from this module into a one-page Phishing Field Guide: the family of phishing types, the psychological levers, your email-inspection checklist, and the report-and-verify drill. This is your second portfolio piece, a genuinely useful reference you (and colleagues) could actually follow, and proof you can turn knowledge into practical guidance.",
    },
    ethicsNote: "Running a phishing test is only ever acceptable with proper authorisation, internally, and done kindly, exactly the authorisation-and-scope principle from Module 5. Never send phishing, 'as a joke' or otherwise, to anyone without sanctioned, organisational consent.",
  },
};

export default topic5;
