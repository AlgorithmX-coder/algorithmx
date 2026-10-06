import type { TopicManifest } from "../../learn/types";
import { LegalLineLab } from "../../learn/conceptLabs";

/* Module 5 - Topic 1: the Computer Misuse Act 1990. Case: Daniel
 * Cuthbert, 2005 (a security consultant who entered a directory-
 * traversal test into a tsunami-appeal donation site he suspected was
 * fake, triggered an IDS, and was convicted under section 1 for
 * unauthorised access despite benign intent). Public record: the 2005
 * Horseferry Road conviction and extensive contemporaneous coverage. */
const topic1: TopicManifest = {
  id: "m5t1",
  weekLabel: "Module 5",
  act: "Act 1 - Foundations you can touch",
  title: "The Computer Misuse Act 1990",
  role: "Everything you do in this field is governed by this law. Knowing exactly where the line sits is not optional for a professional: it is the difference between a career and a criminal record, and employers will expect you to know it cold.",
  minutes: 18,
  promise: "Learn the one UK law that defines the line, then see a skilled consultant land on the wrong side of it by accident.",
  brief: "In this lesson, we'll learn the Computer Misuse Act 1990, the UK law that decides what is lawful and what is a crime in everything you are about to do. The rule is simpler than people expect, and it turns on one word: authorisation. Then we'll look at the Daniel Cuthbert case, where a genuinely well-meaning security professional was convicted anyway, because intent is not the test.",

  learn: [
    {
      heading: "One word decides it: authorisation",
      body: [
        "The Computer Misuse Act 1990 is the backbone of UK cyber law, and its core idea is refreshingly simple. It is an offence to access a computer, or to try to, when you are not authorised to do so. Not 'when you cause damage', not 'when you mean harm'. The question the law asks first is always: did you have permission?",
        "This is why your own systems are your playground and other people's are off-limits without a clear yes. Skill is irrelevant. Curiosity is irrelevant. Even trying to help can be irrelevant. If you were not authorised, the access itself is the offence.",
      ],
      examples: [
        "Cracking passwords on your own test account: lawful, it is your system.",
        "Trying one guessed password on someone else's account: an offence, even if it fails.",
        "Being brilliant at it changes nothing. The law cares about permission, not talent.",
      ],
      analogy: {
        plain: "It is trespass, not burglary. You do not have to steal anything, or even break a lock. Walking into a house you were not invited into is already the wrong, however gently you do it.",
        realTerm: "unauthorised access",
      },
    },
    {
      heading: "The offences, from a peek to real damage",
      body: [
        "The Act builds up in seriousness. Section 1 is unauthorised access to computer material, the basic offence of getting in, or trying to, without permission. Section 2 is that same access with intent to commit a further crime, like fraud. Section 3 covers unauthorised acts that impair a computer, which is where denial-of-service attacks and malware land, and a later addition, section 3ZA, covers unauthorised acts causing serious damage.",
        "There is also section 3A, which makes it an offence to make, supply or obtain tools knowing they are for committing these crimes. This is the part that makes people nervous about security tools, so hold onto the distinction: owning and using tools to test your own systems, or systems you are authorised to test, is fine. It is the criminal purpose that the law targets.",
      ],
      examples: [
        "Section 1: logging into an account you have no right to, even just to look.",
        "Section 3: flooding a server offline, or planting malware that impairs it.",
        "Section 3A: the intent behind a tool matters, not the tool itself. A port scanner is lawful; using it to case a victim is not.",
      ],
    },
    {
      heading: "Intent to help is not a defence",
      body: [
        "Here is the part that catches good people out. The Act does not have a general 'but I was trying to help' or 'I was just curious' exemption. If you access a system you are not authorised to touch, the fact that you meant well, or even found a real and serious flaw, does not undo the offence.",
        "This is exactly why the whole profession runs on explicit authorisation and agreed scope, which the rest of this module covers. You never rely on your good intentions to keep you lawful. You rely on written permission. The case you are about to see is the one every UK security professional is taught, precisely because the person meant no harm at all.",
      ],
      examples: [
        "Finding a genuine vulnerability does not retroactively authorise the access that found it.",
        "'I was testing whether it was a scam site' did not save Daniel Cuthbert.",
        "The safe path is always: get permission first, in writing, or stay on systems you own.",
      ],
      analogy: {
        plain: "Checking whether your neighbour's door is unlocked, to warn them it is insecure, still means you tried their door uninvited. The warning does not erase the trying.",
        realTerm: "no 'good intent' defence",
      },
    },
  ],

  glossary: [
    { term: "Computer Misuse Act 1990", definition: "The main UK law on computer crime. Its core offence is accessing, or attempting to access, a computer without authorisation." },
    { term: "unauthorised access", definition: "Getting into, or trying to get into, a computer or account you do not have permission to use. The section 1 offence, regardless of harm or intent." },
    { term: "section 3", definition: "The Computer Misuse Act offence covering unauthorised acts that impair a computer, such as denial-of-service attacks and malware." },
    { term: "section 3A", definition: "Makes it an offence to make, supply or obtain tools intending them for computer-misuse crimes. Targets criminal purpose, not the tools themselves." },
  ],

  seeHeading: "When good intentions met the letter of the law",

  cases: [
    {
      org: "R v Daniel Cuthbert",
      year: "2005",
      headline: "A security consultant was convicted for one line typed into a donation site",
      whatHappened: "After the 2004 Boxing Day tsunami, Daniel Cuthbert, an experienced security consultant, donated to an online disaster-relief appeal. When the site gave him no confirmation and behaved oddly, he suspected it might be a phishing scam harvesting card details. To check, he typed a simple directory-traversal test (the '../../../' pattern) into the address bar. The site was genuine; his probe tripped its intrusion-detection system; he was traced and arrested.",
      theMissedMeasure: "There was no authorised way for him to test his suspicion, and he did not have permission to probe the site. Under the Computer Misuse Act, that unauthorised attempt was the offence, whatever his reason. The lawful routes, contacting the charity, reporting his concern, simply testing on nothing but his own machine, were all still open to him.",
      theCost: "He was convicted under section 1 in October 2005 and fined, and the conviction affected a skilled professional's standing. Two decades on it is still the teaching case for 'intent does not authorise access'.",
      control: "access-control",
      impact: ["convicted under section 1 of the Computer Misuse Act", "one directory-traversal probe was enough", "benign intent was no defence"],
      source: "Public record; the 2005 Horseferry Road Magistrates' Court conviction and contemporaneous reporting.",
      brandColor: "#8b6dff",
      news: { headline: "Tsunami hacker was convicted after charity site probe", outlet: "The Register / BBC (2005 coverage)", date: "October 2005" },
    },
  ],

  lab: {
    title: "Where is the line?",
    intro: "Nothing to install and nothing leaves this page. For each action, decide: lawful, or a Computer Misuse Act offence? Assume no permission unless stated.",
    prompts: [
      "The test is authorisation, not skill and not good intentions.",
      "'On my own systems' is almost always the lawful side.",
      "Read every explanation: the edge cases are the whole point.",
    ],
    component: LegalLineLab,
  },

  check: {
    explain: {
      prompt: "Daniel Cuthbert found a real reason to be suspicious and meant no harm, yet he was still convicted. In your own words, explain why, and what the lawful alternatives were.",
      modelAnswer: "The Computer Misuse Act turns on authorisation, not intent or outcome. Cuthbert probed a site he had no permission to test, so the attempt itself was unauthorised access under section 1, and his good motive, checking for a scam, was not a defence. The lawful alternatives were all available: he could have reported his suspicion to the charity or the authorities, or simply not probed a system he did not own. The lasting lesson is that you never rely on meaning well to stay lawful; you rely on explicit permission or you stay on your own systems.",
    },
    quiz: [
      {
        q: "What is the core question the Computer Misuse Act asks first?",
        options: [
          "Did you cause any damage?",
          "Were you authorised to access the system?",
          "Did you intend to help or to harm?",
          "Were you skilled enough to get in?",
        ],
        answer: 1,
        why: "The basic section 1 offence is unauthorised access, or the attempt. Damage and intent can raise the seriousness, but permission is the first and central test.",
      },
      {
        q: "You find a genuine, serious flaw by poking at a stranger's website without permission. Where do you stand legally in the UK?",
        options: [
          "You are fine, because the flaw was real and you were helping",
          "You have likely committed an offence; finding a real flaw does not authorise the access that found it",
          "It depends only on whether you downloaded anything",
          "It is lawful as long as you report it afterwards",
        ],
        answer: 1,
        why: "There is no 'but I found something real' exemption. The unauthorised access is the offence, which is why professionals get permission and scope in writing first.",
      },
      {
        q: "A friend gives you their password 'in case you ever need it'. Months later you log in without asking. Lawful?",
        options: [
          "Yes, you knew the password",
          "No; knowing a password is not the same as being authorised to use the account right then",
          "Yes, as long as you do not change anything",
          "Only if you tell them afterwards",
        ],
        answer: 1,
        why: "Authorisation is about permission for that access, not possession of the password. Using the account uninvited is still unauthorised access.",
      },
    ],
  },

  wrap: {
    headline: "You now know the line the whole profession lives on: authorisation, in writing, every time.",
    takeaways: [
      "The Computer Misuse Act 1990 makes unauthorised access, or the attempt, an offence, regardless of harm or good intent.",
      "The offences escalate: access (s1), access to commit further crime (s2), impairing a computer like DoS or malware (s3), and tool-supply with criminal intent (s3A).",
      "Meaning well or finding a real flaw is not a defence. You stay lawful through permission and scope, or by staying on systems you own.",
    ],
    project: {
      name: "Write your one-line rule",
      blurb: "In your security notebook, write the single sentence you will never break: for example, 'I only test systems I own or have explicit written permission to test, within the agreed scope and time.' It sounds obvious now. Written down, it is the thing you reread before you ever touch a live system in Act 2.",
    },
    ethicsNote: "This is the ethics note made into a whole lesson. From here on, every hands-on attack technique in the course is taught strictly for systems you own or are authorised to test. The next topics turn that principle into the practical rules of consent, scope and disclosure.",
  },
};

export default topic1;
