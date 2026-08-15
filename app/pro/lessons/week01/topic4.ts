import type { TopicManifest } from "../../learn/types";
import MfaLab from "../../learn/MfaLab";

/* Week 1 - Topic 4: multi-factor authentication, why it beats a stolen
 * password, and why not all MFA is equal. Case: Reddit 2018 (real public
 * record: employee accounts compromised despite SMS-based 2FA, which
 * attackers intercepted; Reddit moved to token-based 2FA afterwards). */
const topic4: TopicManifest = {
  id: "w1t4",
  weekLabel: "Module 3",
  act: "Act 1 - Foundations you can touch",
  title: "The second lock: multi-factor authentication",
  role: "MFA is the single control that stops the most account takeovers, and knowing the difference between weak and strong MFA is exactly the advice a security professional is paid to give.",
  minutes: 20,
  promise: "See why a second factor stops an attacker who already has your password, then meet a real breach that shows why the type of MFA you choose matters.",

  learn: [
    {
      heading: "Something you know, something you have, something you are",
      body: [
        "A password is one factor: something you know. Multi-factor authentication adds a second, different kind of proof, so getting in needs two things, not one. The classic categories are something you know (a password), something you have (your phone or a security key), and something you are (a fingerprint or face).",
        "The power is in combining categories. A stolen password is still just something you know. Without also having your phone or your fingerprint, it is not enough to get in.",
      ],
      examples: [
        "A code from an app on your phone is 'something you have'.",
        "A fingerprint or face scan is 'something you are'.",
        "Two passwords would not be MFA, because they are both 'something you know'; the second factor has to be a different kind of proof.",
      ],
      analogy: {
        plain: "A password is the key to your front door. MFA is a second lock that only opens with something physically on you, so a copied key alone still leaves the attacker stuck on the doorstep.",
        realTerm: "multi-factor authentication (MFA)",
      },
    },
    {
      heading: "Why MFA beats a stolen password",
      body: [
        "Most account takeovers start with a password the attacker already has, from a breach, a reused login, or a phishing page. MFA breaks that chain. Even with the correct password, the login also demands the second factor, which the attacker does not have.",
        "That is why turning on MFA is the highest-value five minutes you can spend on your security. It directly defeats the most common attack: logging in with someone else's leaked password. You will prove it in the lab in a moment.",
      ],
      examples: [
        "Dropbox in the last topic fell to a reused password; a second factor would have stopped the login dead.",
        "Even if your password is phished, the attacker still cannot pass the code that lands on your phone.",
        "This is why banks, email providers and workplaces increasingly require it, not just offer it.",
      ],
    },
    {
      heading: "Not all MFA is equal",
      body: [
        "A second factor by text message (SMS) is far better than nothing, but it is the weakest kind. Attackers can trick a phone company into moving your number to their SIM (a SIM swap), or intercept the message, and then the code comes to them.",
        "Stronger options are a code from an authenticator app on your device, and stronger still a physical security key or a passkey, which are built to resist phishing entirely. If a site offers app-based or key-based MFA, prefer it over SMS.",
      ],
      examples: [
        "SMS codes can be stolen by a SIM swap, where the attacker takes over your phone number.",
        "An authenticator app generates the code on your device, so there is no text message to intercept.",
        "A hardware security key or passkey will not hand its proof to a fake look-alike site, which is why it beats phishing.",
      ],
      analogy: {
        plain: "SMS is a spare key left under the doormat: usually fine, but a determined thief knows where to look. An app or a hardware key is a lock only your own hand can open.",
        realTerm: "phishing-resistant MFA",
      },
    },
  ],

  glossary: [
    { term: "MFA", definition: "Multi-factor authentication: logging in needs two different kinds of proof, so a stolen password alone is not enough." },
    { term: "2FA", definition: "Two-factor authentication, the most common form of MFA: your password plus one second factor, such as a code or a key." },
    { term: "authenticator app", definition: "An app on your device that generates a rotating 6-digit code as your second factor, with no text message that could be intercepted." },
    { term: "SIM swap", definition: "An attack where someone tricks a phone company into moving your number to their SIM, so your SMS codes arrive on the attacker's phone." },
    { term: "phishing-resistant", definition: "MFA (like a hardware key or passkey) that will not hand its proof to a fake look-alike site, so it defeats phishing outright." },
    { term: "hardware key", definition: "A small physical device you tap or plug in to prove it is really you. One of the strongest second factors available." },
  ],

  seeHeading: "When the type of MFA decided the outcome",

  cases: [
    {
      org: "Reddit",
      year: "2018",
      headline: "They had 2FA, and attackers got in anyway",
      whatHappened: "Attackers compromised several Reddit employee accounts and reached some internal systems and an old user-data backup. Reddit's staff were using two-factor authentication, but it was the SMS kind, and the attackers were able to intercept the text-message codes. Reddit said the takeaway was clear and moved staff to token-based two-factor authentication that cannot be intercepted the same way.",
      theMissedMeasure: "The second factor was SMS, the interceptable kind. App or hardware-key MFA would have resisted the attack.",
      theCost: "Exposure of some internal data and an old 2007 backup of user information. A widely-cited lesson that MFA is essential, and that SMS is the weakest form of it.",
      control: "access-control",
      source: "Public breach record; Reddit's own 2018 disclosure and follow-up.",
      brandColor: "#ff4500",
      news: { headline: "Reddit warns users of data breach", outlet: "BBC News", date: "August 2018", url: "https://www.bbc.co.uk/news/technology-45041699" },
    },
  ],

  lab: {
    title: "Be the attacker: try MFA on and off",
    intro: "You have Sarah's stolen (correct) password. Try to log into her account, first with her second factor off, then on. Watch the outcome flip.",
    prompts: [
      "With MFA OFF, click 'Try to log in as Sarah'. You get straight in: the password was the only lock.",
      "Switch MFA ON and try again. The password is still correct, but now a code goes to Sarah's phone, not yours.",
      "Try to guess the code. See why a stolen password alone is useless once a second factor is on.",
    ],
    component: MfaLab,
  },

  check: {
    explain: {
      prompt: "A friend says: 'MFA is annoying, and anyway I have a strong password, so I don't need it.' Using what you just did, explain why MFA matters even with a strong password. Write a sentence or two, then reveal a model answer.",
      modelAnswer: "A strong password only helps until it leaks, and passwords leak all the time through breaches, reuse and phishing, none of which your password's strength can prevent. MFA defends the case a password cannot: when the attacker already has the correct password, the login still demands a second factor they do not have, so they are stopped at the door. It is the single highest-value control against the most common attack, account takeover with a stolen password, and app or key-based MFA is stronger than SMS.",
    },
    quiz: [
      {
        q: "What makes something a genuine second factor?",
        options: [
          "A longer password",
          "A second password",
          "A different kind of proof, like something you have or are",
          "Answering a security question",
        ],
        answer: 2,
        why: "MFA combines categories: something you know, have, or are. Two things you know (two passwords) is not MFA; the second factor must be a different kind of proof.",
      },
      {
        q: "Why does MFA stop most account takeovers?",
        options: [
          "It makes your password longer",
          "It blocks the attacker who has your password but not your second factor",
          "It hides your username",
          "It encrypts your hard drive",
        ],
        answer: 1,
        why: "Most takeovers use a password the attacker already has. MFA demands a second factor they do not have, breaking that chain even when the password is correct.",
      },
      {
        q: "Why is SMS the weakest form of MFA?",
        options: [
          "Texts cost money",
          "The code can be intercepted or stolen via a SIM swap",
          "It only works on old phones",
          "It uses too much data",
        ],
        answer: 1,
        why: "SMS codes can be intercepted, or redirected by tricking the phone company into a SIM swap. App-based and hardware-key MFA remove that weakness, which is exactly the lesson from Reddit.",
      },
    ],
  },

  wrap: {
    headline: "You know why a second factor is the highest-value lock on your accounts, and which kind to choose.",
    takeaways: [
      "MFA combines different kinds of proof, so a stolen password alone is not enough.",
      "It directly defeats the most common attack: logging in with a leaked password.",
      "Prefer app-based or hardware-key MFA over SMS, which can be intercepted.",
    ],
    project: {
      name: "Audit step: turn on MFA everywhere it counts",
      blurb: "Turn on MFA for your five key accounts, starting with email. Choose an authenticator app over SMS where you can, and note which accounts still only offer SMS so you know their weak spot.",
    },
    ethicsNote: "The login simulation here is a harmless sandbox. Attempting to bypass MFA on accounts you do not own is a criminal offence under the Computer Misuse Act 1990.",
  },
};

export default topic4;
