import type { TopicManifest } from "../../learn/types";
import { OsintLab } from "../../learn/conceptLabs";

/* Module 6 - Topic 4: reconnaissance and OSINT. Case: the 2011 RSA
 * SecurID breach, which began with research-driven spear phishing (a
 * small number of employees received a tailored "2011 Recruitment Plan"
 * email carrying a malicious attachment). Public record: RSA's own 2011
 * incident blog posts and contemporaneous analysis. */
const topic4: TopicManifest = {
  id: "m6t4",
  weekLabel: "Module 6",
  act: "Act 2 - How attacks happen",
  title: "Reconnaissance and OSINT",
  role: "Almost every targeted attack begins with research. Knowing how much an attacker can learn about an organisation, legally and for free, is what lets a defender shrink that exposure, and it is a core skill in both offensive and defensive teams.",
  minutes: 16,
  promise: "See how attackers research a target before touching it, then watch careful homework turn into one of the decade's biggest breaches.",
  brief: "In this lesson, we'll look at reconnaissance: the quiet first stage where attackers gather information before they strike. A surprising amount is available legally and freely, called open-source intelligence, or OSINT, from staff profiles to exposed systems to leaked passwords. Then we'll see the RSA breach, where attackers used careful research to craft an email convincing enough to crack open a major security company.",

  learn: [
    {
      heading: "Attackers do their homework first",
      body: [
        "Targeted attacks rarely start with an attack. They start with research. Before sending a single email, an attacker learns who works at the organisation, what their roles are, what technology it uses, and where its systems are exposed. The more they know, the more convincing and precise everything that follows becomes.",
        "This stage is quiet and often completely legal, which is what makes it so effective. The attacker is not breaking in yet; they are reading what is already public. By the time they act, they can impersonate the right person, reference real projects, and aim at exactly the right target.",
      ],
      examples: [
        "Who to target: names, roles and reporting lines from professional network sites.",
        "What to exploit: the software and services a company exposes to the internet.",
        "What to try: email addresses and passwords exposed in past breaches.",
      ],
      analogy: {
        plain: "A con artist studies their mark before approaching: where they work, who they trust, what they care about. The approach only works because of the homework done beforehand.",
        realTerm: "reconnaissance",
      },
    },
    {
      heading: "OSINT: how much is free and legal to find",
      body: [
        "Open-source intelligence is information gathered from publicly available sources: social media, company websites, professional networks, public records, search engines that index internet-connected devices, and databases of past breaches. None of it requires breaking in. All of it helps an attacker build a detailed picture.",
        "The defensive lesson is direct and empowering: if you can see what is exposed, you can reduce it. Organisations shrink their attack surface by limiting what staff reveal publicly, removing unnecessary exposed systems, cleaning up old accounts, and watching for their own data in breach dumps. You cannot hide everything, but you can make the attacker's homework much harder.",
      ],
      examples: [
        "Public staff profiles become a ready-made org chart for targeting.",
        "Internet-wide scanning services reveal which systems a company exposes.",
        "Breach-lookup tools show which company emails have leaked credentials to try.",
      ],
    },
    {
      heading: "From research to a convincing lure",
      body: [
        "Reconnaissance feeds directly into the next stage: a tailored approach. Generic spam is easy to ignore, but an email that names your real manager, references a genuine project, and arrives when you expect it is far harder to resist. This is the difference between mass phishing and spear phishing, and the difference is made entirely by research.",
        "This is why recon is not just an attacker's tool but a defender's priority. The best defence against a research-driven attack starts before the attack: by controlling what can be discovered, and by training people to be wary even of messages that seem to know a lot about them. The RSA breach you are about to see is the classic example of research turned into a single, devastatingly well-aimed email.",
      ],
      examples: [
        "Mass phishing: a generic message to thousands, easy to spot.",
        "Spear phishing: a tailored message to one person, built from research.",
        "The tailoring, the realism, comes entirely from reconnaissance.",
      ],
      analogy: {
        plain: "A letter addressed 'Dear Customer' goes in the bin. A letter that names your account manager and last order gets opened. Recon is what turns the first into the second.",
        realTerm: "spear phishing",
      },
    },
  ],

  glossary: [
    { term: "reconnaissance", definition: "The first stage of an attack: gathering information about a target before acting, to make later stages precise and convincing." },
    { term: "OSINT", definition: "Open-source intelligence: information gathered from publicly available sources, requiring no break-in." },
    { term: "attack surface", definition: "Everything an attacker could discover and target: exposed systems, services, accounts and public information. Smaller is safer." },
    { term: "spear phishing", definition: "A phishing attack tailored to a specific person using research, far more convincing than generic mass phishing." },
  ],

  seeHeading: "When homework cracked a security company",

  cases: [
    {
      org: "RSA (SecurID)",
      year: "2011",
      headline: "A researched, tailored email breached one of the world's best-known security firms",
      whatHappened: "In 2011, attackers targeted RSA, the company behind the widely used SecurID authentication tokens. The intrusion began not with a technical break-in but with reconnaissance and a tailored email: a small number of employees received a message with a subject line referencing a '2011 Recruitment Plan' and a booby-trapped attachment. It only took one person opening it to give the attackers a foothold, from which they moved deeper and ultimately stole data related to the SecurID system, with knock-on risk to RSA's many customers.",
      theMissedMeasure: "The human-facing lure succeeded because it was plausible and targeted. Defences here are layered: reducing what makes such emails convincing (controlling exposed information), training people to treat even relevant-looking attachments with caution, and technical controls to blunt a single click, all topics in Module 7 and beyond.",
      theCost: "A breach of a flagship security product, forcing RSA to warn and support customers and, in some reports, replace tokens, an enormous cost and reputational blow, all set in motion by research and one opened attachment.",
      control: "access-control",
      impact: ["began with reconnaissance and a tailored email", "one opened attachment gave the foothold", "a security company's flagship product was compromised"],
      source: "Public record; RSA's own 2011 incident disclosures and contemporaneous analysis.",
      brandColor: "#ee3124",
      news: { headline: "RSA explains how attackers breached its systems", outlet: "Security reporting (2011)", date: "2011" },
    },
  ],

  lab: {
    title: "Free to find, or needs a break-in?",
    intro: "Nothing to install and nothing leaves this page. For each piece of information, decide: could an attacker find it freely (OSINT), or would they need an actual compromise?",
    prompts: [
      "Ask: is this already public, or is it behind a lock?",
      "Be surprised by how much is in the 'free to find' pile.",
      "Everything in that pile is something a defender can try to reduce.",
    ],
    component: OsintLab,
  },

  check: {
    explain: {
      prompt: "The RSA breach began with reconnaissance and a tailored email, not a technical break-in. Explain the role OSINT plays in an attack like this, and one thing a defender can do about it.",
      modelAnswer: "Reconnaissance, much of it open-source intelligence, lets attackers learn who works somewhere, their roles, and what would seem plausible to them. That research is what turns a generic, ignorable email into a tailored spear-phishing lure convincing enough that one RSA employee opened a booby-trapped attachment, giving the attackers their foothold. A defender's response starts before the attack: shrink what can be discovered (limit exposed staff information and unnecessary systems), and train people to be wary even of messages that seem to know a lot about them, because that very relevance is often the product of recon.",
    },
    quiz: [
      {
        q: "What is OSINT?",
        options: [
          "Intelligence gathered by secretly intercepting a target's communications",
          "Information obtained by actively breaking into the target's systems",
          "Information that comes only from an insider willing to leak it",
          "Open-source intelligence: information gathered from public sources, no break-in needed",
          "Intelligence bought from a commercial data broker under contract",
        ],
        answer: 3,
        reasons: [
          "Secretly intercepting communications is a different discipline and often illegal. OSINT uses only what is already public, with no interception.",
          "Breaking in is exactly what OSINT is not. The whole point is that this research uses public sources and needs no compromise.",
          "An insider leak is a private source. OSINT is drawn from openly available information that anyone could look up.",
          "Right. OSINT is the legal, public-source research that attackers and defenders both use: profiles, exposed systems, breach data and more.",
          "Paying a broker is not what defines OSINT. The 'open source' part means publicly available information, whether or not money changes hands.",
        ],
      },
      {
        q: "Why is a spear-phishing email so much more dangerous than generic spam?",
        options: [
          "It is sent to far more people at once than ordinary spam",
          "It is tailored using research, so it convinces its specific target",
          "It always carries a previously unknown zero-day exploit inside",
          "It is built to slip past every email filter automatically",
          "It is sent from an address the target has emailed before",
        ],
        answer: 1,
        reasons: [
          "Spear phishing goes to fewer people, not more. Its power is precision, one well-researched target, rather than sheer volume.",
          "Right. The tailoring comes from reconnaissance: a message that names real people and projects is far harder to dismiss than 'Dear Customer'.",
          "A spear-phishing email does not need a zero-day. Its danger is persuasion built from research, not any particular technical exploit.",
          "No email reliably beats every filter. What makes it dangerous is how convincing it is to the person, not filter evasion.",
          "Attackers can spoof a familiar address, but that is not what defines spear phishing. The real danger is the researched, tailored content.",
        ],
      },
      {
        q: "A defender who wants to reduce the risk of research-driven attacks should first do what?",
        options: [
          "Block all inbound email from any sender outside the company",
          "Publish more company information to appear open and trustworthy",
          "Shrink the attack surface: limit exposed information and unused systems",
          "Install up-to-date antivirus on every single employee device",
          "Require a longer, more complex password from every member of staff",
        ],
        answer: 2,
        reasons: [
          "Blocking all outside email would stop the organisation working. The aim is to reduce what attackers can discover, not to cut off the world.",
          "Publishing more does the opposite of what you want. It feeds reconnaissance, handing attackers more material for a convincing lure.",
          "Right. You cannot hide everything, but shrinking what is discoverable makes the attacker's homework harder and their lures less convincing.",
          "Antivirus helps against malware, but it does nothing about what is publicly discoverable. Recon happens before any file reaches a device.",
          "Stronger passwords matter, but they do not reduce what recon can find. Research-driven attacks target discoverable information first.",
        ],
      },
    ],
  },

  wrap: {
    headline: "You now understand the quiet first stage of an attack, and that it is where defence can start.",
    takeaways: [
      "Targeted attacks begin with reconnaissance: quiet, often legal research about the target.",
      "OSINT, from public profiles to exposed systems to breach data, hands attackers a detailed picture for free.",
      "Research turns generic phishing into convincing spear phishing, so shrinking what is discoverable is a real defence.",
    ],
    project: {
      name: "Audit your own footprint",
      blurb: "Search for yourself the way an attacker would: your name, your email in a breach-lookup service, what you have posted publicly. Note what someone could learn and use. Then pick one thing to reduce or lock down. Seeing your own exposure is the quickest way to understand reconnaissance, and to respect it.",
    },
    ethicsNote: "Researching yourself or your own organisation is fine. Gathering intelligence to target others, or using it to attack, crosses the Module 5 authorisation line. OSINT is studied here to defend against it.",
  },
};

export default topic4;
