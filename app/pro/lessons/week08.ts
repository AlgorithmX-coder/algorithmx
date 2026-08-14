import type { LessonManifest } from "../learn/types";
import SqlInjectionLab from "../learn/SqlInjectionLab";

/* Week 8 - Web attacks and the OWASP Top 10. The "find the decision
 * point" method in full: recreate the real conditions (a vulnerable
 * login over a real in-browser SQL database), let the learner hunt and
 * exploit the flaw, then reveal what the company actually did.
 *
 * Case source-checked: TalkTalk 2015. The ICO issued a record £400,000
 * monetary penalty (Oct 2016) after attackers used SQL injection against
 * a legacy webpage to reach a database of 156,959 customers, including
 * some bank details. Public record: ICO enforcement notice, 2016. */
const week08: LessonManifest = {
  id: "week-08",
  weekLabel: "Week 8",
  act: "Act 2 - How attacks happen",
  title: "Web attacks: the one line that emptied a database",
  role: "Understanding web attacks is core to both defending web apps (blue team) and testing them (pen testing). The OWASP Top 10 is the industry's shared list of what to look for.",
  minutes: 40,
  promise: "Learn how websites talk to databases, then perform a real SQL injection yourself, watch a whole customer table leak, and see the one-line fix.",

  learn: [
    {
      heading: "Every login and search is a question the website asks a database",
      body: [
        "When you log in, the website takes your username and password and builds a question for its database, in a language called SQL. Something like: 'is there a customer whose username is sarah.k and whose password is Summer2015?' If the database says yes, you are in.",
        "The danger is in how the website builds that question. If it glues your typed-in text straight into the sentence, then what you type can change the question itself.",
      ],
      examples: [
        "Searching a shop for 'phone' asks the database: 'show me every product whose name contains phone'.",
        "Logging in asks: 'is there an account with this username and this password?'",
        "Your bank statement page asks: 'show me the transactions for this account number', with the number coming from you.",
      ],
      analogy: {
        plain: "It is like a form that says 'I would like to withdraw ___ from account ___', and you are allowed to write anything in the blanks. If nobody checks, you can write 'everything' and 'every account'.",
        realTerm: "SQL injection",
      },
    },
    {
      heading: "The trick: close the sentence, then add 'or something always true'",
      body: [
        "The website's question is: username = 'what you typed' AND password = 'what you typed'. Normally both have to match. But watch what happens if, in the password box, you type: ' OR '1'='1",
        "That closes the password text early with a quote, then adds OR '1'='1'. And 1 always equals 1. So the question becomes 'match this exact account, OR anything where 1 equals 1', which is every account. The login lets you in, and a search can dump the whole table. You will do exactly this in a moment, for real.",
      ],
      examples: [
        "In a login box, it turns 'is the password X?' into 'is the password X, OR is 1 equal to 1?', and 1 is always 1.",
        "In a shop search, the same trick can turn 'show phones' into 'show every customer record'.",
        "Attackers often add -- (a comment) to chop off the rest of the query so it does not error.",
      ],
    },
    {
      heading: "The fix is one idea: keep the user's input as data, never as code",
      body: [
        "The flaw exists only because the website treats what you typed as part of its SQL sentence. The fix, called a parameterised query (or prepared statement), sends the query and your input to the database separately. The database is told 'here is the question, and here, separately, is the data to slot in'.",
        "Now ' OR '1'='1 is just a (wrong) password. It can never become part of the question. This single change defeats the entire attack, and you will see it defeat your own injection at the end.",
      ],
      examples: [
        "Think of it as a form with labelled boxes: your text can only go in the boxes, never rewrite the form.",
        "With the fix, the database is told 'the password is exactly these characters', symbols and all, so ' OR '1'='1 is just a wrong password.",
        "Every mainstream programming language has this built in; the flaw is almost always old code that never used it.",
      ],
    },
  ],

  glossary: [
    { term: "SQL", definition: "The language websites use to ask their database questions, such as 'find this user' or 'list these orders'." },
    { term: "SQL injection", definition: "An attack that types database commands into an ordinary input box, so the attacker's text changes the website's question to the database." },
    { term: "parameterised query", definition: "A safe way to build a database question that keeps the user's input as data only, so it can never become part of the command. Also called a prepared statement." },
    { term: "database", definition: "The organised store where a website keeps its data, such as user accounts, passwords and orders." },
    { term: "OWASP Top 10", definition: "A widely used industry list of the ten most important web application security risks to check for. Injection has been on it for over twenty years." },
  ],

  seeHeading: "What this did to a real company",

  cases: [
    {
      org: "TalkTalk",
      year: "2015",
      headline: "One SQL injection, 156,959 customers, a record fine",
      whatHappened: "Attackers, later found to be teenagers, ran a SQL injection against old, forgotten TalkTalk webpages, the exact attack you are about to perform. The pages had been inherited from an acquisition and never secured. Through them, the attackers reached a database of 156,959 customers, and for over 15,000 of those, bank account numbers and sort codes.",
      theMissedMeasure: "User input was built straight into SQL queries (no parameterised queries), on public pages nobody was maintaining. The database also held data that was not encrypted.",
      theCost: "The ICO issued a then-record £400,000 fine for failing to take basic steps. TalkTalk reported around £77M in costs and lost over 100,000 customers, and the CEO faced the press and Parliament. All from an attack a first-week student can now run in a browser.",
      control: "secure-configuration",
      source: "ICO monetary penalty notice, October 2016; UK parliamentary and press coverage, 2015-2016.",
      brandColor: "#ec008c",
      news: { headline: "TalkTalk fined £400,000 for theft of customer details", outlet: "BBC News", date: "October 2016", url: "https://www.bbc.co.uk/news/business-37565367" },
    },
  ],

  lab: {
    title: "Break into the portal, then fix it",
    intro: "This is a real SQL database running inside your browser tab. The injection really executes. Nothing leaves the page, and you cannot break anything outside this box.",
    prompts: [
      "First, log in as a real customer: username sarah.k, password Summer2015.",
      "Now attack it: put anything in username, and in the password box type   ' OR '1'='1   then sign in. (Or use the helper button.)",
      "Read the query panel to see why it worked. Then switch the portal to 'the fix' and run the exact same injection. Watch it fail.",
    ],
    component: SqlInjectionLab,
  },

  check: {
    explain: {
      prompt: "In your own words, why does typing ' OR '1'='1 into a password box let an attacker in, and why does a parameterised query stop it? Write a couple of sentences, then reveal a model answer.",
      modelAnswer: "The vulnerable site glues your input into its SQL sentence, so ' OR '1'='1 closes the password text and adds a condition that is always true, making the query match every row. A parameterised query sends the SQL and your input to the database separately, so your input is only ever treated as data (a wrong password), never as part of the query. Same input, but now it cannot change the question, so the attack fails.",
    },
    quiz: [
      {
        q: "Why did the injection work on the vulnerable portal?",
        options: [
          "The password was too short",
          "The site built its SQL query by gluing your raw input into it",
          "The database was offline",
          "The attacker guessed the real password",
        ],
        answer: 1,
        why: "The site concatenated your input straight into the SQL. That let your typing change the query itself, which is the whole of SQL injection.",
      },
      {
        q: "What single change defeats SQL injection?",
        options: [
          "A longer admin password",
          "Hiding the login page",
          "Parameterised queries, keeping input as data not code",
          "Blocking the attacker's IP",
        ],
        answer: 2,
        why: "Parameterised queries (prepared statements) send the query and the input separately, so input can never become part of the SQL. It is the fix TalkTalk's pages were missing.",
      },
      {
        q: "Where does SQL injection sit on the OWASP Top 10?",
        options: [
          "It is not on the list",
          "Injection is one of the top categories (A03)",
          "Only for banks",
          "It was removed years ago",
        ],
        answer: 1,
        why: "Injection, including SQL injection, has been on the OWASP Top 10 for over 20 years and is category A03 in the 2021 list. It is one of the most important web risks to know.",
      },
    ],
  },

  wrap: {
    headline: "You performed a real SQL injection, and you know the one line that stops it.",
    takeaways: [
      "Websites turn your input into database questions. If they glue it in raw, you can change the question.",
      "' OR '1'='1 is the classic: close the string, add an always-true condition, match every row.",
      "Parameterised queries fix it by keeping input as data, never as code. This is OWASP A03: Injection.",
    ],
    project: {
      name: "Write your first vulnerability note",
      blurb: "Real security work is as much about writing up a flaw as finding it. Write a short note, in the shape of a real bug report: what the vulnerability is (SQL injection in the login), how you proved it (the exact input you used), what it exposed (the customer table), and the fix (parameterised queries). Keep it. In Week 10 you will do this properly for a full breach; this is the first rep, and the format employers expect.",
    },
    ethicsNote: "You just did this in a sandbox that lives entirely in your own browser. Running the same injection against a website you do not own is a criminal offence in the UK under the Computer Misuse Act 1990, exactly what the TalkTalk attackers were prosecuted for. The only places to practise on real targets are deliberately vulnerable training apps and published bug bounty programmes, within their rules.",
  },
};

export default week08;
