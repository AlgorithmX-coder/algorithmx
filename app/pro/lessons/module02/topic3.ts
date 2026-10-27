import type { TopicManifest } from "../../learn/types";
import { HttpsExposureLab } from "../../learn/conceptLabs";

/* Module 2 - Topic 3: HTTP, HTTPS and the request lifecycle. Case: the
 * UK ICO's enforcement against unencrypted login pages, framed through
 * the wider industry shift to HTTPS-by-default (Let's Encrypt, 2016, and
 * browsers marking plain HTTP "Not secure", 2018). Public record:
 * published ICO guidance and the documented HTTPS-everywhere rollout. */
const topic3: TopicManifest = {
  id: "m2t3",
  weekLabel: "Module 2",
  act: "Act 1 - Foundations you can touch",
  title: "HTTP, HTTPS and the padlock",
  role: "Web traffic is most of what a security team watches, and 'is this encrypted, and what does that actually protect?' is a question you will answer for colleagues constantly. Analysts who know the request lifecycle read proxy logs and alerts far faster.",
  minutes: 16,
  promise: "Understand what the padlock really protects, and what it does not, then see why the whole web switched it on.",
  brief: "In this lesson, we'll look inside what actually happens when a page loads: your browser asks, the server answers, and a cookie keeps you logged in between requests. Then we'll see why doing all that in the open is unsafe, and how the industry moved to encrypt the entire web by default, so that today a plain unencrypted login is something a browser actively warns you about.",

  learn: [
    {
      heading: "The conversation: request, response, and status codes",
      body: [
        "Once your browser has an address, it speaks HTTP: a simple, structured conversation. The browser sends a request ('GET /news') and the server sends back a response: a status code saying how it went, plus the page itself. Every image, script and style on a page is its own request and response.",
        "The status codes are worth knowing because you will see them in logs forever: 200 means success, 301 means the page moved, 403 means you are not allowed, 404 means it does not exist, and the 500s mean the server itself broke.",
      ],
      examples: [
        "Loading one news homepage can fire off dozens of requests: the page, images, scripts, fonts.",
        "A burst of 403s and 404s in a log can be an attacker probing for admin pages that are not linked anywhere.",
        "A sudden wall of 500s usually means the application is failing, sometimes under attack.",
      ],
      analogy: {
        plain: "Ordering at a counter. You ask for something specific; the reply is either here you go (200), we moved, try next door (301), staff only (403), never heard of it (404), or the kitchen is on fire (500).",
        realTerm: "HTTP status codes",
      },
    },
    {
      heading: "Cookies: how a site remembers it is you",
      body: [
        "HTTP has no memory: each request arrives fresh, with no idea who sent it. So after you log in, the site gives your browser a session cookie, a long random token, and your browser includes it on every later request. That token is what says 'this is the same person who logged in a moment ago'.",
        "That makes the cookie as good as your password for the rest of the session. If it travels unencrypted, anyone who can see the network traffic can copy it and present it as their own, and the site will treat them as you, without ever needing your password. This is precisely why cookies must only ever cross an encrypted connection.",
      ],
      examples: [
        "Log in once and you stay logged in as you browse: that is the session cookie doing its job on every request.",
        "Log out, and the site throws the token away so it can no longer be used.",
        "A stolen valid cookie skips the login entirely, which is why protecting it matters as much as protecting the password.",
      ],
      analogy: {
        plain: "A wristband at a festival. You show ID once at the gate and get a band; after that the band alone gets you in. Anyone who copies your band walks in as you, no ID required.",
        realTerm: "session cookie",
      },
    },
    {
      heading: "HTTPS: what the padlock protects, and what it does not",
      visual: { id: "packet-path", mode: "eavesdrop" },
      body: [
        "HTTPS is HTTP wrapped in encryption (TLS). It does two things: it scrambles the conversation so anyone on the path sees only unreadable bytes, and it checks you are really talking to the genuine server, using a certificate the server must present. The padlock in the address bar means both are in place for this connection.",
        "But be precise about what it covers. HTTPS protects the content and integrity of the conversation between you and that server. It does not hide which server you are talking to, it does not vouch that the site is run by honest people, and it does nothing once the data arrives, a phishing site can show a perfectly valid padlock. The padlock means 'private and genuine connection', not 'trustworthy website'.",
      ],
      examples: [
        "On HTTPS, a snooper on the Wi-Fi sees that you are talking to a bank, but not your username, password or balance.",
        "A scam site can get a free certificate and show a padlock too: encryption is not endorsement.",
        "The deeper detail of certificates, TLS and how trust is proven is Module 4, cryptography without the maths.",
      ],
      analogy: {
        plain: "A sealed, tamper-proof envelope delivered to an address you have confirmed is real. Nobody can read or alter the letter in transit, but the seal says nothing about whether the person at that address is honest.",
        realTerm: "HTTPS / TLS",
      },
    },
  ],

  glossary: [
    { term: "HTTP", definition: "The request-and-response language browsers and servers use to exchange web pages. On its own it is unencrypted." },
    { term: "HTTPS", definition: "HTTP carried inside an encrypted TLS connection, so the conversation is private and the server's identity is checked." },
    { term: "status code", definition: "The short number a server returns with every response: 200 success, 301 moved, 403 forbidden, 404 not found, 500s server error." },
    { term: "session cookie", definition: "A random token a site gives your browser after login, sent on every later request to prove you are still the same logged-in user." },
    { term: "TLS", definition: "Transport Layer Security: the encryption that turns HTTP into HTTPS. Covered in depth in Module 4." },
  ],

  seeHeading: "Why the whole web switched the padlock on",

  cases: [
    {
      org: "The web (HTTPS-everywhere)",
      year: "2016",
      headline: "The industry moved to encrypt the entire web, and made plain HTTP a warning",
      whatHappened: "For years most sites served ordinary pages, and often login pages, over plain HTTP. On shared networks like café or airport Wi-Fi, anyone running a simple capture tool could read usernames, page contents and, worst of all, copy session cookies and take over logged-in accounts without ever seeing a password. From 2016 the industry moved decisively: Let's Encrypt made certificates free and automatic, and from 2018 major browsers began labelling any plain HTTP page 'Not secure'. Encryption went from a bank-only luxury to the baseline for everything.",
      theMissedMeasure: "Encryption in transit. Sending logins and session cookies in the clear meant the network itself, and everyone on it, could read and reuse them. HTTPS closes that whole class of eavesdropping and session theft.",
      theCost: "Countless accounts were trivially hijackable on open networks throughout the plain-HTTP era, and the clean-up was an industry-wide migration that took years. Today an unencrypted login is rare enough that the browser flags it for you.",
      control: "secure-configuration",
      impact: ["free, automatic certificates from 2016 (Let's Encrypt)", "browsers mark plain HTTP 'Not secure' from 2018", "session-cookie theft on open Wi-Fi became the headline risk HTTPS removed"],
      source: "Public record; the documented Let's Encrypt launch (2016) and browser 'Not secure' rollout (2018).",
      brandColor: "#2db94d",
      news: { headline: "Google to warn users about unencrypted websites", outlet: "BBC News", date: "2018" },
    },
  ],

  lab: {
    title: "What can the stranger on the Wi-Fi see?",
    intro: "Nothing to install and nothing leaves this page. You are on open café Wi-Fi; sort what a snooper can and cannot read.",
    prompts: [
      "Three buckets: readable on plain HTTP, hidden by HTTPS, or visible even with HTTPS.",
      "The 'visible even with HTTPS' bucket is the one most people get wrong.",
      "Read every explanation: being precise about what encryption covers is the actual skill here.",
    ],
    component: HttpsExposureLab,
  },

  check: {
    explain: {
      prompt: "A colleague says 'the site has a padlock, so it is safe to enter my details.' In your own words, say what the padlock really guarantees and what it does not.",
      modelAnswer: "The padlock means the connection is private and genuine: the conversation with that server is encrypted so nobody on the network can read or alter it, and the server proved its identity with a certificate. It does not mean the site is run by honest people. A scam or phishing site can show a valid padlock too, because encryption protects the channel, not the intentions behind it. So the padlock answers 'is this connection private?', never 'should I trust this business?'.",
    },
    quiz: [
      {
        q: "In a server log you see a run of 404 responses for pages like /admin and /backup that are not linked anywhere. What is the likely story?",
        options: [
          "The server itself is failing and erroring on those particular requests",
          "Someone is probing for hidden admin pages that do not exist",
          "Ordinary visitors keep mistyping the web address in their browser",
          "A search engine is busy crawling and indexing the whole site",
          "The pages were deleted recently and visitors still hold old links",
        ],
        answer: 1,
        reasons: [
          "A failing server returns 500-range errors, not 404s. A 404 means the page was not found, not that the server broke.",
          "Right. 404 means not found. A burst aimed at guessable admin paths that are not linked anywhere is classic reconnaissance: an attacker fishing for a forgotten door.",
          "A few typos happen, but a deliberate run of guesses at admin and backup paths is not ordinary mistyping.",
          "A search engine follows real links on the site. It does not guess at hidden admin pages that were never published.",
          "Old links would point to pages that once existed, not to guessable admin paths that were never linked in the first place.",
        ],
      },
      {
        q: "Why does a stolen session cookie let an attacker in without your password?",
        options: [
          "The cookie holds your actual password written out in plain text",
          "The cookie is the token proving you are the already-logged-in user",
          "The cookie stores the answers to your account security questions",
          "The cookie lets the attacker reset your password by email",
          "The cookie contains your username, which the site trusts on its own",
        ],
        answer: 1,
        reasons: [
          "A session cookie is a random token, not your password. It carries no copy of your password at all.",
          "Right. After login the cookie stands in for you on every request, so whoever holds a valid one is treated as you. That is why it must only ever travel encrypted.",
          "The cookie holds no security-question answers. It is just a random token that marks an active session.",
          "The cookie does not trigger a password reset. It simply lets the holder act as the already-logged-in user.",
          "A username alone proves nothing, and sites do not trust it by itself. The cookie is a secret random token, not just a name.",
        ],
      },
      {
        q: "A phishing site shows a padlock in the address bar. What does that tell you?",
        options: [
          "It is definitely safe, since the padlock proves the site is trustworthy",
          "Only that the connection is encrypted and the server matched a certificate",
          "The browser has confirmed this site is completely free of malware",
          "The site is genuinely run by the real, legitimate company it names",
          "An authority has vetted and approved the people behind the site",
        ],
        answer: 1,
        reasons: [
          "The padlock is not a safety verdict. A scam site can show one too, because it protects the connection, not the site's honesty.",
          "Right. HTTPS secures the channel, not the intentions. Scam sites get certificates too, so the padlock means a private and genuine connection, never a trustworthy business.",
          "The padlock says nothing about malware. The browser has not scanned the site's content, only secured the link to it.",
          "A valid certificate proves you reached the server for that name, not that honest or legitimate people run it.",
          "No one vets the people behind a site to issue a basic certificate. Free, automatic certificates need no such approval.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You can now read a web conversation, and say exactly what the padlock does and does not protect.",
    takeaways: [
      "HTTP is a request-and-response exchange; status codes (200/301/403/404/500) tell you, and the logs, how each one went.",
      "A session cookie stands in for your password after login, so it must only ever travel encrypted.",
      "HTTPS makes the connection private and proves the server's identity. It does not make the website itself trustworthy.",
    ],
    project: {
      name: "Read your own browser's padlock",
      blurb: "On any HTTPS site, click the padlock and open the certificate details. Note who issued it and when it expires. Then open your browser's developer tools (F12), load a page with the Network tab open, and watch the requests and their status codes appear. Screenshot one. You are seeing the exact data a web-security analyst reads all day.",
    },
    ethicsNote: "Inspecting connections to sites you are visiting is fine. Capturing other people's traffic on a shared network is interception, and in the UK a criminal offence. Module 5 covers consent and scope in full.",
  },
};

export default topic3;
