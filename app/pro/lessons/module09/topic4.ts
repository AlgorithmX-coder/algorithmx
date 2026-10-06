import type { TopicManifest } from "../../learn/types";
import { AccessControlLab } from "../../learn/conceptLabs";

/* Module 9 - Topic 4: broken access control. Case: First American
 * Financial, 2019 (an IDOR-style flaw let anyone view ~885 million
 * sensitive documents by simply changing a number in the URL, with no
 * authentication). Public record: 2019 reporting and subsequent
 * regulatory action. */
const topic4: TopicManifest = {
  id: "m9t4",
  weekLabel: "Module 9",
  act: "Act 2 - How attacks happen",
  title: "Broken access control",
  role: "Broken access control is, by OWASP's ranking, the number-one web risk. It is also one of the easiest to understand and to test for: are people prevented from reaching things they should not? Spotting it is a high-value skill for defenders and testers alike.",
  minutes: 16,
  promise: "Learn why 'can they reach what they shouldn't?' is the top web risk, then see 885 million documents exposed by changing one number in a URL.",
  brief: "In this lesson, we'll look at broken access control, the single most common serious web flaw. It is simply the failure to stop people reaching things they are not allowed to. We'll see its classic forms, like being able to view someone else's data by changing a number in the URL, and why access control must live on the server. Then we'll see a staggering case: hundreds of millions of sensitive documents reachable by anyone who could count.",

  learn: [
    {
      heading: "The top web risk is also the simplest to grasp",
      body: [
        "Access control is about who is allowed to do or see what. Broken access control is the failure to enforce those rules, so a user can reach data or actions that should be off-limits to them. OWASP, the web-security community, ranks it as the number-one risk, not because it is clever, but because it is so common and so damaging.",
        "The classic example is painfully simple: you view your own invoice at a web address ending in order=123, and discover that changing it to order=124 shows you someone else's invoice. The application checked that you were logged in, but never checked that this particular record was yours. That gap, authenticated but not authorised for this item, is broken access control, often called an insecure direct object reference, or IDOR.",
      ],
      examples: [
        "Changing order=123 to order=124 and seeing a stranger's order: broken access control (IDOR).",
        "Logged in, but never checked you are allowed this specific record.",
        "It is OWASP's #1 risk because it is so common and so damaging.",
      ],
      analogy: {
        plain: "A hotel that checks you have a room key at the lift, but whose keys open every door. You are a guest (authenticated), but you can enter any room (not properly authorised).",
        realTerm: "broken access control / IDOR",
      },
    },
    {
      heading: "Access control must live on the server",
      body: [
        "A crucial, recurring mistake is enforcing access only in the browser, the front end, where the user can bypass it. Hiding an 'admin' button does not stop someone typing the admin page's address directly. Relying on a hidden field that says role=user does nothing, because the user can change it to role=admin. Anything decided in the browser can be altered by the user.",
        "So the rule is absolute: access control must be enforced on the server, on every request. The server must check, for each action, not only who you are but whether you are allowed to do this specific thing to this specific item. The safest foundation is default-deny: nothing is allowed unless explicitly permitted, combined with least privilege, so each role can reach only what it genuinely needs.",
      ],
      examples: [
        "Hiding a button is not access control: the page still works if reached directly.",
        "Never trust client-side values (like a role field) for permissions.",
        "Enforce on the server, every request; default-deny; least privilege.",
      ],
    },
    {
      heading: "Why it is so often missed, and so easy to test",
      body: [
        "Broken access control is common because it is invisible in normal use: the application works perfectly for honest users who only access their own data. The flaw only appears when someone deliberately tries to reach what is not theirs, by editing a URL, replaying a request, or guessing an address. Developers focused on making features work for legitimate users easily forget to test the malicious path.",
        "This also makes it one of the most testable flaws, which is why it is such a practical skill. A tester (authorised, of course) simply asks: can I, as one user, reach another user's data or an admin function? Can I change an identifier and get something that is not mine? Thinking adversarially about access, 'what shouldn't I be able to reach, and can I?', is exactly the mindset this flaw rewards, and the case ahead shows the catastrophe when no one asks.",
      ],
      examples: [
        "It works fine for honest users, so it hides until someone probes maliciously.",
        "Easy to test (authorised): can one user reach another's data or admin functions?",
        "The mindset: 'what shouldn't I reach, and can I?'.",
      ],
      analogy: {
        plain: "A door that is never tested from the wrong side looks fine, until someone walks up and finds it was never actually locked.",
        realTerm: "testing access control",
      },
    },
  ],

  glossary: [
    { term: "access control", definition: "The rules and enforcement of who is allowed to do or see what in an application." },
    { term: "broken access control", definition: "The failure to stop users reaching data or actions they are not allowed: OWASP's number-one web risk." },
    { term: "IDOR", definition: "Insecure direct object reference: reaching someone else's data by changing an identifier (like a number in the URL)." },
    { term: "default-deny", definition: "A design where nothing is permitted unless explicitly allowed; the safe foundation for access control." },
  ],

  seeHeading: "When 885 million documents were a number away",

  cases: [
    {
      org: "First American Financial",
      year: "2019",
      headline: "Hundreds of millions of sensitive documents were viewable by changing a number in the URL",
      whatHappened: "In 2019, it emerged that First American Financial, a large US real-estate title-insurance company, had a web flaw that exposed an enormous archive of documents, reportedly around 885 million, many containing highly sensitive personal and financial information. The flaw was textbook broken access control: documents were reachable by a web address containing a sequential number, and simply changing that number let anyone view a different document, with no authentication or ownership check at all. Anyone who found one valid link could walk through the entire archive by counting.",
      theMissedMeasure: "Server-side access control on every document request: checking that the requester was authenticated and authorised to view that specific document. Instead, the identifier in the URL was trusted entirely, the classic IDOR mistake, so there was effectively no access control at all.",
      theCost: "The potential exposure of around 885 million sensitive documents, one of the largest such exposures ever, along with regulatory action and reputational damage, all from the absence of a basic ownership check that every request should have made.",
      control: "access-control",
      impact: ["~885 million documents reachable by changing a URL number", "no authentication or ownership check (IDOR)", "among the largest exposures of its kind"],
      source: "Public record; 2019 reporting and subsequent regulatory action.",
      brandColor: "#003da5",
      news: { headline: "First American exposed 885 million records through a website flaw", outlet: "Mainstream and security reporting (2019)", date: "2019" },
    },
  ],

  lab: {
    title: "Proper, or broken?",
    intro: "Nothing to install and nothing leaves this page. For each design, decide: proper access control, or broken?",
    prompts: [
      "The test: is access checked on the server, for every request, for this specific item?",
      "Hiding buttons and trusting client-side values are not access control.",
      "Default-deny and least privilege are the sound foundations.",
    ],
    component: AccessControlLab,
  },

  check: {
    explain: {
      prompt: "First American exposed around 885 million documents through a flaw where changing a number in the URL showed a different document. Explain what broken access control is, why it must be enforced on the server, and why this flaw was so easy to exploit.",
      modelAnswer: "Broken access control is the failure to stop users reaching data or actions they are not allowed to, OWASP's number-one web risk. First American's flaw was the classic form, an insecure direct object reference: documents were reachable by a URL containing a sequential number, and the application never checked that the requester was authorised to view that specific document, so simply changing the number showed someone else's. It must be enforced on the server because anything decided in the browser can be bypassed, hiding a button or trusting a client-side value does nothing, so the server must check, on every request, both who you are and whether you may access this exact item, ideally default-deny. It was so easy to exploit because there was effectively no check at all: anyone who found one valid link could walk the entire archive just by counting, no skill or authentication required.",
    },
    quiz: [
      {
        q: "What is broken access control?",
        options: [
          "A slow login page",
          "The failure to stop users reaching data or actions they are not allowed to",
          "A type of encryption",
          "A flooding attack",
        ],
        answer: 1,
        why: "It is simply failing to enforce who-can-do-what, and it is OWASP's most common serious web risk.",
      },
      {
        q: "Why must access control be enforced on the server?",
        options: [
          "Servers are faster",
          "Anything decided in the browser can be bypassed by the user; only the server can truly enforce permissions",
          "Browsers cannot show buttons",
          "It does not need to be; the browser is enough",
        ],
        answer: 1,
        why: "Hiding UI or trusting client-side values fails because users can edit them. The server must check every request.",
      },
      {
        q: "The First American flaw (changing a URL number to see others' documents) is an example of:",
        options: [
          "SQL injection",
          "An insecure direct object reference (IDOR), a form of broken access control",
          "A denial-of-service attack",
          "Cross-site scripting",
        ],
        answer: 1,
        why: "Reaching someone else's data by changing an identifier, with no ownership check, is the textbook IDOR / broken-access-control flaw.",
      },
    ],
  },

  wrap: {
    headline: "You now understand the web's number-one risk, and the adversarial mindset that catches it.",
    takeaways: [
      "Broken access control is failing to stop users reaching what they should not: OWASP's #1 web risk.",
      "It must be enforced on the server, on every request, for the specific item, default-deny and least privilege.",
      "It hides in normal use and is caught by asking adversarially: 'what shouldn't I reach, and can I?'.",
    ],
    project: {
      name: "Think like an access tester",
      blurb: "For a web app you use (and only reasoning, not actually attacking it), list two or three things you should NOT be able to reach: another user's data, an admin page, a record that is not yours. For each, note how the app ought to prevent it (a server-side ownership check). This adversarial 'what shouldn't I reach?' habit is exactly what finds broken access control.",
    },
    ethicsNote: "Reasoning about access control is fine; actually trying to reach other users' data or admin functions on a site you do not own or have permission to test is unauthorised access, a serious offence (Module 5). Test only where you are authorised, such as deliberately vulnerable training apps.",
  },
};

export default topic4;
