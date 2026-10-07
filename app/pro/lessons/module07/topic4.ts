import type { TopicManifest } from "../../learn/types";
import { SpotPhishLab } from "../../learn/conceptLabs";

/* Module 7 - Topic 4: reading a suspicious email (headers, links,
 * sender). Case: FACC, 2016 (the Austrian aerospace-parts maker lost
 * ~42M EUR to a CEO-impersonation / BEC email instructing a transfer;
 * the CEO and CFO lost their jobs). Public record: FACC's own
 * disclosures and 2016 reporting. */
const topic4: TopicManifest = {
  id: "m7t4",
  weekLabel: "Module 7",
  act: "Act 2 - How attacks happen",
  title: "Reading a suspicious email",
  role: "Spotting a phishing email is a concrete, checkable skill, not a vague instinct. An analyst who can calmly inspect a sender, a link and a request, and explain the tells to a colleague, prevents incidents daily. It is one of the most immediately useful skills in this whole course.",
  minutes: 17,
  promise: "Learn the checklist for inspecting a suspicious message, then see a single fake email cost an aerospace firm 42 million euros and two careers.",
  brief: "In this lesson, we'll turn 'spotting a phish' from a gut feeling into a checklist. We'll learn what to actually look at: the real sender address behind the friendly name, where links truly lead, the tell-tale lookalike domains, and the requests that should always raise suspicion. Then we'll see the FACC case, where a convincing impersonation email led to a 42 million euro loss and cost the top executives their jobs.",

  learn: [
    {
      heading: "Look past the friendly name to the real address",
      visual: { id: "phishing-redflags" },
      body: [
        "The single most useful habit is to check who an email is really from. Email shows a 'display name', the friendly label like 'IT Helpdesk' or your CEO's name, but that is just a label anyone can set. Underneath is the actual address, and that is what matters. A message whose display name says your bank but whose real address is a random mailbox is an instant red flag.",
        "Closely related are lookalike domains: addresses crafted to resemble a real one, swapping or adding a character, like 'rnicrosoft.com' (r-n instead of m) or 'company-support.com' instead of the genuine domain. Attackers rely on you skim-reading. The defence is to read the real address slowly, character by character, especially the part after the @.",
      ],
      examples: [
        "Display name 'Payroll', real address a random free mailbox: red flag.",
        "'rnicrosoft.com' reads as 'microsoft' at a glance but is not.",
        "'yourbank-security.com' is not the same as your bank's real domain.",
      ],
      analogy: {
        plain: "The display name is the name written on an envelope; the real address is the postmark. A forger can write any name they like on the front.",
        realTerm: "display name vs real address",
      },
    },
    {
      heading: "Check where links really go, before you click",
      body: [
        "Link text can say anything; where the link actually leads is what counts. On a computer, hovering over a link (without clicking) shows the true destination, usually at the bottom of the window. If the visible text says your bank but the real destination is an unrelated or lookalike domain, that is a classic phishing tell. On a phone, press and hold to preview the link rather than tapping it.",
        "Treat attachments with the same caution. An unexpected attachment, especially one that urges you to 'enable content' or 'enable macros', is a well-worn malware-delivery trick. The safe default with any surprising link or attachment is: do not click, do not open, verify first. The few seconds this costs are nothing against the damage a single bad click can do.",
      ],
      examples: [
        "Hover (desktop) or long-press (mobile) to see a link's true destination before clicking.",
        "Link text 'View invoice' pointing to a random domain: do not click.",
        "An unexpected attachment asking you to enable macros: a known malware trick.",
      ],
    },
    {
      heading: "Suspect the request, not just the sender",
      body: [
        "Even a message that passes the sender and link checks can be an attack, so the final and most important check is the request itself. Be suspicious of anything that asks you to move money, change payment details, share credentials or sensitive data, or act urgently and outside the normal process, no matter how legitimate the sender appears. These requests are the point of the attack.",
        "This is where technical checks meet the psychology from the last topic. A message that is pressuring you to skip the usual checks is waving a red flag by its very nature. The golden rule for any high-stakes request, a payment, a password, access, is to verify it through a separate trusted channel before acting. The FACC case is a devastating lesson in what happens when that verification step is missing.",
      ],
      examples: [
        "Any request to change bank or payment details: verify independently before acting.",
        "'Keep this confidential, don't check with anyone': a reason to check, not to comply.",
        "High-stakes request + pressure to skip process = verify out-of-band, every time.",
      ],
      analogy: {
        plain: "Even a letter that looks genuine gets a phone call back to the sender if it asks you to send money somewhere new. The stakes, not the appearance, decide whether you verify.",
        realTerm: "verify high-stakes requests",
      },
    },
  ],

  glossary: [
    { term: "display name", definition: "The friendly label shown for an email sender, which anyone can set to anything: never proof of who really sent it." },
    { term: "lookalike domain", definition: "An address crafted to resemble a legitimate one by swapping or adding characters, relying on skim-reading to fool the eye." },
    { term: "email header", definition: "The technical routing and sender information behind a message, which can reveal the true origin an analyst learns to read." },
    { term: "hover-to-preview", definition: "Hovering over a link (or long-pressing on mobile) to reveal its true destination before clicking." },
  ],

  seeHeading: "When one fake email cost 42 million euros",

  cases: [
    {
      org: "FACC",
      year: "2016",
      headline: "A single impersonation email cost an aerospace firm 42 million euros and its top executives",
      whatHappened: "In 2016, FACC, an Austrian maker of aerospace components, fell victim to a business email compromise. Staff received what appeared to be a legitimate instruction, impersonating the chief executive, to transfer funds for an 'acquisition' project. Believing it genuine, they wired around 42 million euros to the attackers' accounts. The attack used no malware; it relied entirely on a convincing impersonation and a plausible, authoritative request that bypassed normal verification.",
      theMissedMeasure: "Verification of an unusual, high-value payment instruction through a trusted, independent channel. The request should never have been actioned on the strength of an email alone, however authentic it looked. The failure was procedural: no step forced an out-of-band check on a large, out-of-pattern transfer.",
      theCost: "Around 42 million euros lost, only part of it ever recovered, and, unusually, the company dismissed both its chief executive and chief financial officer in the aftermath, a stark illustration that falling for phishing has consequences all the way to the top.",
      control: "access-control",
      impact: ["~42 million EUR wired on a fake CEO instruction", "no malware: pure impersonation and authority", "the CEO and CFO lost their jobs over it"],
      source: "Public record; FACC's own disclosures and 2016 reporting.",
      brandColor: "#005aa0",
      news: { headline: "Aerospace firm FACC fires CEO after €42m cyber-fraud", outlet: "Mainstream and security reporting (2016)", date: "2016" },
    },
  ],

  lab: {
    title: "Spot the tells",
    intro: "Nothing to install and nothing leaves this page. For each feature of an email, decide: is it a genuine warning sign, or not by itself a red flag?",
    prompts: [
      "Focus on the real tells: sender mismatch, link destination, lookalike domains, risky requests.",
      "Beware the false comfort: logos, correct names and polish prove nothing.",
      "This checklist is one of the most useful skills in the whole course.",
    ],
    component: SpotPhishLab,
  },

  check: {
    explain: {
      prompt: "FACC lost 42 million euros to a convincing email with no malware. Walk through the checks that should have caught it, and name the single step that would have stopped the payment.",
      modelAnswer: "The checks are: look past the display name to the real sender address and watch for lookalike domains; check where any links truly lead before clicking; and, most importantly, suspect the request itself, especially anything moving money or acting urgently outside normal process. Here the attack carried no malware, so detection was never going to catch it; the request was the attack. The single step that would have stopped the payment is out-of-band verification: independently confirming an unusual, high-value transfer instruction through a known, trusted channel before acting, rather than trusting the email alone. That missing procedural check is what cost 42 million euros and two careers.",
    },
    quiz: [
      {
        q: "What is the most reliable thing to check about an email's sender?",
        options: [
          "That the display name looks right",
          "The actual email address behind the display name, read carefully for lookalike tricks",
          "Whether it has a company logo",
          "That it is addressed to you by name",
        ],
        answer: 1,
        why: "Display names, logos and your correct name are all trivial to fake. The real address, read character by character, is the dependable check.",
      },
      {
        q: "Before clicking a link in an email, you should:",
        options: [
          "Click it quickly to see where it goes",
          "Hover (desktop) or long-press (mobile) to preview the true destination first",
          "Trust it if the link text mentions a known company",
          "Forward it to a colleague to click",
        ],
        answer: 1,
        why: "Link text can say anything; previewing the real destination reveals mismatches and lookalike domains before any harm is done.",
      },
      {
        q: "The FACC case shows that the most important check for a high-value request is:",
        options: [
          "Whether the email looks professional",
          "Verifying it out-of-band through a trusted channel before acting, regardless of how genuine it appears",
          "How quickly you respond",
          "Whether antivirus flagged it",
        ],
        answer: 1,
        why: "With no malware to catch, only verification stops BEC. An unusual, high-value instruction must be confirmed independently before any money moves.",
      },
    ],
  },

  wrap: {
    headline: "You now have a concrete checklist for inspecting any suspicious message, one of the most useful skills in the course.",
    takeaways: [
      "Check the real sender address, not the display name, and watch for lookalike domains read character by character.",
      "Preview where links actually lead before clicking, and treat unexpected attachments, especially 'enable macros' prompts, with suspicion.",
      "Most important of all, suspect the request: verify anything high-stakes or urgent out-of-band before acting.",
    ],
    project: {
      name: "Inspect a real one",
      blurb: "Next time a suspicious email arrives, run the checklist before deleting or reporting it: real sender address, link destinations (by hovering, not clicking), lookalike domain, and the nature of the request. Write down which tells you found. Doing this on real messages is how the checklist becomes instinct, and it feeds directly into your Phishing Field Guide.",
    },
    ethicsNote: "Inspecting messages sent to you is entirely proper. Do not click links or open attachments to 'investigate' beyond safe previewing, and never test these techniques by sending phishing to others without authorisation.",
  },
};

export default topic4;
