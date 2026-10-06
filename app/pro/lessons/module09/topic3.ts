import type { TopicManifest } from "../../learn/types";
import { XssSafetyLab } from "../../learn/conceptLabs";

/* Module 9 - Topic 3: cross-site scripting (XSS). Case: the "Samy"
 * worm, 2005 (a self-propagating XSS worm on MySpace that added over a
 * million "friends" in under 24 hours, forcing the site offline).
 * Public record: the 2005 Samy worm and its author's later account. */
const topic3: TopicManifest = {
  id: "m9t3",
  weekLabel: "Module 9",
  act: "Act 2 - How attacks happen",
  title: "Cross-site scripting (XSS)",
  role: "XSS is one of the most common web vulnerabilities, and it attacks the users of a site, not just the server. Understanding it, and the simple principle that defeats it, is essential for anyone defending or testing web applications.",
  minutes: 16,
  promise: "Learn how an attacker runs their code in other people's browsers, then see the worm that added a million friends overnight.",
  brief: "In this lesson, we'll look at cross-site scripting, or XSS: a flaw where a website shows user-supplied content as if it were code, so an attacker's script runs in other visitors' browsers. We'll see how it works, why it is dangerous (it attacks the users), and the simple principle that defeats it. Then we'll meet Samy, the friendly XSS worm that spread across MySpace so fast it took the site down.",

  learn: [
    {
      heading: "When a page runs the attacker's code",
      body: [
        "Cross-site scripting happens when a website takes content from one user and shows it to others without treating it purely as text. If an attacker can get a site to include their script in a page, that script runs in the browser of everyone who views it, as if the site itself had written it. The flaw is the same 'never trust user input' failure from topic 1, but aimed at the page instead of the database.",
        "What makes XSS distinctive is who it targets: the other users of the site, not the server. A script running in a victim's browser can steal their session cookie (so the attacker becomes them, recall Module 2), capture what they type, redirect them, or act on their behalf. The trusted site becomes the delivery mechanism for an attack on its own visitors.",
      ],
      examples: [
        "An attacker posts a comment containing a script; it runs for everyone who reads it.",
        "The script can steal session cookies, so the attacker takes over accounts.",
        "It attacks the site's users, using the site's own trust against them.",
      ],
      analogy: {
        plain: "It is like slipping a forged notice into a trusted noticeboard: because everyone trusts the board, they follow the instruction, which was never really from the board at all.",
        realTerm: "cross-site scripting",
      },
    },
    {
      heading: "Why it is so dangerous: it rides on trust",
      body: [
        "XSS is dangerous precisely because it abuses trust. Visitors trust the website, so their browsers run whatever that site serves, including, if the site is vulnerable, the attacker's smuggled-in script. The victim did nothing wrong; they simply visited a page on a site they trusted. This makes XSS a powerful tool for account takeover and for spreading further.",
        "And it can spread. If a vulnerable site lets a user's content (carrying a script) be seen by others, and that script can post more such content, it becomes self-propagating, a worm, exactly what happened on MySpace. The combination of running in trusted browsers and potentially spreading on its own is what makes XSS one of the web's most serious and persistent problems.",
      ],
      examples: [
        "The victim just visits a trusted page; their browser runs the hidden script.",
        "It is ideal for stealing sessions and taking over accounts at scale.",
        "If the script can post more infected content, it spreads like a worm.",
      ],
    },
    {
      heading: "The fix: treat user content as data, not code",
      body: [
        "The defence mirrors the SQL-injection fix, same principle, different place. The rule is to treat all user content as data to display, never as code to run. In practice this means escaping (encoding) user content on output, so that any tags or scripts in it are shown harmlessly as text rather than executed. A script a user typed then simply appears as the literal characters, doing nothing.",
        "Modern web frameworks escape output by default, which is why using them properly prevents most XSS. The mindset to carry away is the recurring one: user content is data, never instructions. Combined with other measures (like content-security policies), output encoding makes XSS avoidable. As ever, the flaw is a failure to respect untrusted input, and the fix is to handle it correctly on the way out.",
      ],
      examples: [
        "Escape output: a typed script is shown as text, not run.",
        "Modern frameworks auto-escape, preventing most XSS when used properly.",
        "The mindset: user content is data to display, never code to execute.",
      ],
      analogy: {
        plain: "A good quoting system shows someone's words in quotation marks as what they said, it never acts on them as a command. Escaping does that for web content.",
        realTerm: "output encoding",
      },
    },
  ],

  glossary: [
    { term: "cross-site scripting (XSS)", definition: "A flaw where a website shows user-supplied content as code, so an attacker's script runs in other visitors' browsers." },
    { term: "output encoding (escaping)", definition: "Converting user content so any tags or scripts are shown as harmless text rather than executed: the core XSS fix." },
    { term: "session hijacking (via XSS)", definition: "Using an XSS script to steal a victim's session cookie and take over their logged-in account." },
    { term: "content security policy (CSP)", definition: "A browser mechanism that restricts what scripts a page may run, a useful extra defence-in-depth layer against XSS." },
  ],

  seeHeading: "The worm that added a million friends overnight",

  cases: [
    {
      org: "Samy worm (MySpace)",
      year: "2005",
      headline: "A self-propagating XSS worm spread across a million profiles in under a day",
      whatHappened: "In 2005, a young man named Samy Kamkar found an XSS flaw on MySpace, then the world's biggest social network. He crafted a script that, when someone viewed his profile, would add him as a 'friend' and copy itself onto the viewer's own profile, so anyone who then viewed them was infected too. It spread exponentially: in under 24 hours, over a million profiles were affected, and MySpace had to be taken offline to stop it. The payload was relatively harmless (it mostly added friends and the phrase 'Samy is my hero'), but it was a dramatic proof of how far an XSS worm could spread.",
      theMissedMeasure: "Proper output encoding and input handling, so that user profile content could never carry executable script. MySpace's filtering was insufficient, and Samy found a way to smuggle a script through it. Treating profile content strictly as data, not code, would have prevented it.",
      theCost: "A major site forced offline, over a million affected profiles, and a landmark demonstration (with real legal consequences for its author) of the self-propagating power of cross-site scripting, still taught as the definitive XSS-worm example.",
      control: "secure-configuration",
      impact: ["over 1 million profiles infected in under 24 hours", "a self-propagating XSS worm", "forced MySpace offline to stop it"],
      source: "Public record; the 2005 Samy worm and its author's later published account.",
      brandColor: "#034ea2",
      news: { headline: "How the Samy worm infected a million MySpace profiles in a day", outlet: "Security reporting (2005 onwards)", date: "2005" },
    },
  ],

  lab: {
    title: "Safe, or vulnerable to XSS?",
    intro: "Nothing to install and nothing leaves this page. For each practice, decide: vulnerable to cross-site scripting, or handled safely?",
    prompts: [
      "The flaw: showing user content as code. The fix: escape it so it is shown as text.",
      "'Users won't type anything weird' is never a control.",
      "Treating user content as data, not instructions, is the whole idea.",
    ],
    component: XssSafetyLab,
  },

  check: {
    explain: {
      prompt: "Explain how XSS works, why it is so dangerous, and the principle that defeats it, using the Samy worm to illustrate.",
      modelAnswer: "XSS works when a website shows user-supplied content as if it were code, so an attacker's script runs in the browsers of other visitors, as though the site itself wrote it. It is the 'never trust user input' failure aimed at the page rather than the database. It is dangerous because it rides on trust and targets the users: a victim simply visits a trusted page, and the hidden script can steal their session cookie, capture input, or act as them. The Samy worm shows its most dramatic form: a script on a MySpace profile that copied itself onto anyone who viewed it, spreading to over a million profiles in under a day and forcing the site offline. The principle that defeats it is to treat all user content as data to display, never as code to run, achieved by escaping (encoding) user content on output so any script is shown as harmless text. Modern frameworks do this by default, which is why using them properly prevents most XSS.",
    },
    quiz: [
      {
        q: "What does cross-site scripting (XSS) do?",
        options: [
          "Crashes the database",
          "Gets a website to run the attacker's script in other visitors' browsers",
          "Floods a server with traffic",
          "Steals the physical server",
        ],
        answer: 1,
        why: "XSS smuggles the attacker's code into a page so it runs in victims' browsers, attacking the site's users.",
      },
      {
        q: "Why is XSS especially dangerous?",
        options: [
          "It only affects the attacker",
          "It rides on the users' trust in the site and can steal sessions, take over accounts, and even spread like a worm",
          "It is harmless by design",
          "It only works on old browsers",
        ],
        answer: 1,
        why: "Victims trust the site, so their browsers run the smuggled script, enabling account takeover and, as with Samy, self-propagation.",
      },
      {
        q: "What principle defeats XSS?",
        options: [
          "Hoping users behave",
          "Treat user content as data to display, never as code to run, by escaping output",
          "Making the page load faster",
          "Hiding the comment box",
        ],
        answer: 1,
        why: "Escaping output shows any script as harmless text. Modern frameworks do this by default; the mindset is 'content is data, not instructions'.",
      },
    ],
  },

  wrap: {
    headline: "You now understand the web's attack on its own users, and the simple principle that stops it.",
    takeaways: [
      "XSS gets a site to run the attacker's script in other visitors' browsers, attacking the users, not the server.",
      "It rides on trust, can steal sessions and take over accounts, and can even self-propagate like the Samy worm.",
      "The fix mirrors SQL injection's: treat user content as data, escape it on output, never run it as code.",
    ],
    project: {
      name: "Two flaws, one principle",
      blurb: "Write a couple of lines connecting SQL injection and XSS: both are failures to respect untrusted input, and both are fixed by keeping user content as data rather than letting it become a command (SQL) or code (a script). Seeing the shared principle behind different flaws is exactly the deeper understanding that marks out a strong candidate.",
    },
    ethicsNote: "Studying XSS is to recognise and prevent it. Injecting scripts into any site you do not own or have permission to test is an attack and an offence (Module 5). Practise only on deliberately vulnerable training apps or systems you are authorised to test.",
  },
};

export default topic3;
