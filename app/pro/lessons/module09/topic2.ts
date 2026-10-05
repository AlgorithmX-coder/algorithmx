import type { TopicManifest } from "../../learn/types";
import SqlInjectionLab from "../../learn/SqlInjectionLab";

/* Module 9 - Topic 2: SQL injection, with the real in-browser SQLite
 * lab (reused from the original "Week 8" build). Case: TalkTalk 2015
 * (the ICO issued a record GBP 400,000 penalty after attackers used SQL
 * injection against a legacy page to reach ~157,000 customers' data).
 * Public record: ICO enforcement notice, 2016. */
const topic2: TopicManifest = {
  id: "m9t2",
  weekLabel: "Module 9",
  act: "Act 2 - How attacks happen",
  title: "SQL injection: empty a database",
  role: "SQL injection is one of the oldest and most damaging web attacks, and understanding it is core to both defending web apps and testing them. You will perform a real injection yourself, in a safe sandbox, then see the one-line fix, exactly the hands-on understanding employers value.",
  minutes: 22,
  promise: "Run a real SQL injection in your browser, watch a whole customer table leak, then see the one-line fix, and the record fine that one unfixed line caused.",
  brief: "In this lesson, you will do the hands-on heart of web security. We'll see how gluing user input into a database question lets an attacker rewrite that question, then you will perform a real SQL injection against a genuine in-browser database (nothing leaves this page), watch a whole customer table spill out, and apply the fix that defeats it. Then we'll see the TalkTalk breach, where exactly this flaw, left unfixed, led to a record penalty.",

  learn: [
    {
      heading: "When your input becomes part of the question",
      body: [
        "Recall from the last topic that a website asks its database questions in a language called SQL. A login builds a question like: 'is there a user whose name is X and whose password is Y?'. The danger is in how the website builds that sentence. If it simply glues your typed-in text straight into the question, then what you type can change the question itself, not just answer it.",
        "This is SQL injection: sending input crafted so that it breaks out of being data and becomes part of the command. An attacker types not a username, but a fragment of SQL, and if the site glues it in blindly, the database obeys. The classic result is a login that lets anyone in, or a query that dumps the entire table of customers.",
      ],
      examples: [
        "Intended: 'is there a user named [your input] with password [your input]?'.",
        "Injected: input that adds 'or 1=1', making the condition always true.",
        "The database cannot tell your malicious SQL from the developer's: it just runs it.",
      ],
      analogy: {
        plain: "Imagine dictating a letter where the typist writes down everything you say, including 'and ignore the previous instruction'. If they cannot tell dictation from content, you control the letter.",
        realTerm: "SQL injection",
      },
    },
    {
      heading: "The fix: keep data and commands apart",
      body: [
        "The fix is beautifully clean, and you will apply it yourself in the lab. Instead of gluing user input into the SQL sentence, the application uses a parameterised query: it writes the command with clearly-marked placeholders, and hands the user's input to the database separately, as data. The database then knows that the input is only ever a value to compare, never part of the command, so no amount of crafted SQL in it can change the question.",
        "This single technique, separating data from the command, defeats SQL injection comprehensively. It is not a filter that attackers might sneak past; it structurally removes the possibility. That is why 'use parameterised queries, never glue input into the command' is the definitive answer, and why a breach caused by this flaw is so frustrating: the fix was known, simple, and standard.",
      ],
      examples: [
        "Parameterised: the command has placeholders; input is passed separately as data.",
        "The database treats the input as a value only, never as part of the command.",
        "It is structural, not a filter: there is no crafted input that gets through.",
      ],
    },
    {
      heading: "Now do it yourself",
      body: [
        "You are about to perform a real SQL injection against a genuine database running entirely in your browser. Nothing you do leaves this page, and nothing is at risk, it is a safe, sandboxed re-creation of a vulnerable login. You will type an injection, watch the whole customer table leak out, and then switch the code to a parameterised query and see the very same injection denied.",
        "This is the 'find the decision point' method in action: recreate the real conditions, make the flaw happen with your own hands, then see exactly what fixes it. Doing it, rather than just reading about it, is what makes the understanding stick, and it is precisely the kind of hands-on competence that gets beginners noticed. Take your time in the lab; the quiz and the case will make much more sense afterwards.",
      ],
      examples: [
        "You will inject a real query and watch a customer table spill out.",
        "Then you will apply the parameterised fix and watch the same attack fail.",
        "It is a safe sandbox: nothing leaves your browser.",
      ],
      analogy: {
        plain: "A driving simulator lets you feel a skid, and practise the recovery, with zero real danger. This lab does the same for a real attack and its fix.",
        realTerm: "sandboxed lab",
      },
    },
  ],

  glossary: [
    { term: "SQL", definition: "The language a website uses to ask its database questions, like 'find the user with this name and password'." },
    { term: "SQL injection", definition: "Sending input crafted so it breaks out of being data and becomes part of the database command, letting an attacker rewrite the query." },
    { term: "parameterised query", definition: "A query written with placeholders, where user input is passed to the database separately as data, structurally preventing injection." },
    { term: "input validation", definition: "Checking that input is of the expected form; useful defence-in-depth, but parameterised queries are the definitive fix for injection." },
  ],

  seeHeading: "The one unfixed line that cost a record fine",

  cases: [
    {
      org: "TalkTalk",
      year: "2015",
      headline: "A SQL injection against a legacy page led to a record ICO penalty",
      whatHappened: "In 2015, attackers used SQL injection against a legacy TalkTalk webpage to reach a database containing the personal data of around 157,000 customers, including some bank details. The flaw was exactly the kind you will exploit in the lab: user input reaching the database in a way that let the query be rewritten. The UK regulator, the ICO, found that the vulnerability was well-known and the fix long-established, and issued what was then a record monetary penalty of 400,000 pounds.",
      theMissedMeasure: "Parameterised queries (and keeping legacy pages patched and maintained). The ICO's point was pointed: this was a known flaw with a standard, long-available fix, left in place on an old, neglected page. Basic, well-understood web-security practice would have prevented it.",
      theCost: "The personal data of around 157,000 customers exposed, a then-record 400,000 pound ICO fine, significant remediation costs and lasting reputational harm, all from one unfixed instance of the oldest trick in the web-attack book.",
      control: "secure-configuration",
      impact: ["~157,000 customers' data reached via SQL injection", "a legacy, unmaintained page carried the flaw", "a then-record GBP 400,000 ICO penalty"],
      source: "Public record; ICO enforcement notice, 2016.",
      brandColor: "#7b2d8e",
      news: { headline: "TalkTalk fined £400,000 for theft of customer details", outlet: "ICO / BBC News", date: "October 2016" },
    },
  ],

  lab: {
    title: "Perform a real SQL injection",
    intro: "This is a genuine database running in your browser. Nothing leaves this page. Inject the login, watch the table leak, then apply the fix and watch the attack fail.",
    prompts: [
      "Try the injection in the login to break out of the intended query.",
      "Watch the whole customer table spill out: that is the flaw.",
      "Switch to the parameterised version and run the same injection: it is denied.",
    ],
    component: SqlInjectionLab,
  },

  check: {
    explain: {
      prompt: "Having done the lab, explain in your own words how SQL injection works and why parameterised queries defeat it completely, and why the TalkTalk fine was considered so avoidable.",
      modelAnswer: "SQL injection works because the website builds its database question as a sentence and glues the user's input straight into it. If I type a fragment of SQL instead of a normal value, and the site glues it in blindly, my input stops being mere data and becomes part of the command, so I can rewrite the query, for example making a login condition always true, or dumping a whole table. Parameterised queries defeat it completely because they keep data and command apart: the query is written with placeholders and the input is passed to the database separately, as a value only, so no crafted SQL in the input can ever change the command. It is structural, not a filter to sneak past. The TalkTalk fine was so avoidable because this was a well-known flaw with a standard, long-established fix, left in place on a neglected legacy page; basic, routine web-security practice would have prevented a breach of around 157,000 customers' data.",
    },
    quiz: [
      {
        q: "Why does SQL injection work?",
        options: [
          "The database is too slow",
          "The website glues user input straight into the SQL command, so crafted input can change the command itself",
          "The attacker guesses the password",
          "The server runs out of memory",
        ],
        answer: 1,
        why: "When input becomes part of the command rather than just data, the attacker can rewrite the query the database runs.",
      },
      {
        q: "What is the definitive fix for SQL injection?",
        options: [
          "Banning certain words from inputs",
          "Parameterised queries: keep the command and the user's data strictly separate",
          "Hiding the login page",
          "Making passwords longer",
        ],
        answer: 1,
        why: "Parameterised queries structurally prevent input from becoming part of the command. It is not a filter to bypass; it removes the possibility.",
      },
      {
        q: "Why did the ICO treat the TalkTalk breach as especially avoidable?",
        options: [
          "The attackers were a nation-state",
          "It was a well-known flaw with a standard, long-available fix, left on a neglected legacy page",
          "No data was actually exposed",
          "SQL injection had never been seen before",
        ],
        answer: 1,
        why: "The flaw and its fix were old and standard. Leaving it unfixed on an old page was a failure of basic, routine web security.",
      },
    ],
  },

  wrap: {
    headline: "You performed a real attack and its fix, the hands-on heart of web security that employers look for.",
    takeaways: [
      "SQL injection works when user input is glued into a database command, letting the attacker rewrite the query.",
      "Parameterised queries defeat it completely by keeping data and command strictly apart, a structural fix, not a filter.",
      "The TalkTalk fine shows the cost of leaving this known, easily-fixed flaw on a neglected page.",
    ],
    project: {
      name: "Explain it to a non-techie",
      blurb: "Write a short, plain-English explanation of SQL injection and its fix, as if for a friend with no technical background, using an analogy of your own. Being able to explain a real attack and its fix simply is exactly what you will do in interviews, and it proves you truly understand it. Add it to your portfolio.",
    },
    ethicsNote: "You attacked a sandboxed database that runs only in your browser, which is entirely lawful. Performing SQL injection against any real site you do not own or have written permission to test is a serious Computer Misuse Act offence (Module 5). Practise only in labs like this, or on systems you are authorised to test.",
  },
};

export default topic2;
