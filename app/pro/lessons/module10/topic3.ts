import type { TopicManifest } from "../../learn/types";
import { SpoofTypeLab } from "../../learn/conceptLabs";

/* Module 10 - Topic 3: spoofing and impersonation. Case: the "iSpoof"
 * takedown, November 2022 (an international operation led by UK's Met
 * Police and Europol dismantled a caller-ID-spoofing-as-a-service site
 * used in large-scale phone fraud against many thousands of victims).
 * Public record: Metropolitan Police and Europol announcements. */
const topic3: TopicManifest = {
  id: "m10t3",
  weekLabel: "Module 10",
  act: "Act 2 - How attacks happen",
  title: "Spoofing and impersonation",
  role: "So much of attack relies on faking an identity, of a device, a phone number, an email, a website. Recognising that the 'from' you see is often unverified is a defensive instinct that protects against a huge range of attacks at once.",
  minutes: 16,
  promise: "Learn how attackers fake identities across the network and phone, then see the spoofing service that fuelled fraud against thousands.",
  brief: "In this lesson, we'll look at spoofing: faking an identity to impersonate something or someone trusted. It happens at every level, from faking addresses on a local network, to faking phone numbers and email senders, to faking website names. The common thread is a deep lesson: the identity you are shown is often not verified. Then we'll see the takedown of a service that sold caller-ID spoofing to fraudsters at industrial scale.",

  learn: [
    {
      heading: "Spoofing: faking a trusted identity",
      body: [
        "Spoofing means pretending to be a trusted source by faking an identifier. It comes in many flavours at different layers. On a local network, ARP spoofing fakes device addresses to reroute traffic through the attacker (a way to set up the man-in-the-middle from topic 1). Across the internet, IP spoofing fakes the source address of traffic. On the phone, caller-ID spoofing fakes the number you see. In email, sender spoofing fakes the 'from'. And DNS spoofing, from Module 2, fakes the answer that turns a name into an address.",
        "They differ in the details, but they share one idea: an identifier you instinctively trust, a number, a name, an address, can be forged. The defensive mindset that follows is powerful: treat displayed identities as claims, not proof, especially for anything important.",
      ],
      examples: [
        "ARP spoofing: fake local addresses to reroute traffic (sets up a MITM).",
        "Caller-ID / SMS sender spoofing: fake the number or sender name you see.",
        "Email and DNS spoofing: fake the sender, or the name-to-address answer.",
      ],
      analogy: {
        plain: "A forged return address on an envelope, or a fake name badge. The label looks official, but nothing behind it was actually verified.",
        realTerm: "spoofing",
      },
    },
    {
      heading: "Why 'it came from a trusted source' is not proof",
      body: [
        "The deep lesson of spoofing is that many of the systems we rely on were built for a more trusting era and do not, by default, strongly verify identity. A phone network will happily display whatever number the caller claims; basic email does not guarantee the sender. So 'the caller ID showed my bank' or 'the email was from my boss' is, on its own, not proof of anything, which is exactly what fraudsters exploit.",
        "This connects straight back to the social-engineering module: spoofing supplies the convincing identity, and persuasion does the rest. A spoofed bank number plus an urgent 'fraud alert' is far more effective than either alone. The defence is the same recurring principle, verify through an independent, trusted channel, because that bypasses the forged identifier entirely.",
      ],
      examples: [
        "A displayed phone number or email sender is a claim, not verified proof.",
        "Spoofing + social engineering is far stronger than either alone.",
        "Verifying out-of-band defeats it, because you bypass the forged identifier.",
      ],
    },
    {
      heading: "Technical defences, where they exist",
      body: [
        "Beyond personal vigilance, there are technical measures that make spoofing harder, and knowing they exist is part of an analyst's toolkit. Email has authentication standards (with names like SPF, DKIM and DMARC) that let a domain assert which servers may send on its behalf, so receivers can detect forged senders. Networks can defend against ARP spoofing with monitoring and switch-level protections. Phone networks are slowly adopting measures to flag spoofed calls.",
        "You do not need the details yet, just the shape: spoofing is a known problem with partial technical answers, layered on top of the human defence of verifying anything important. The iSpoof case ahead shows both the scale of the threat and that law enforcement and the industry do fight back, sometimes dramatically.",
      ],
      examples: [
        "Email: SPF, DKIM and DMARC help receivers detect forged senders.",
        "Networks: monitoring and switch protections reduce ARP spoofing.",
        "Phone networks are adopting measures to flag spoofed calls.",
      ],
      analogy: {
        plain: "Tamper-evident seals and verified ID checks are society's answer to forgery. Spoofing has its equivalents, imperfect, improving, and best paired with your own verification.",
        realTerm: "email/network authentication",
      },
    },
  ],

  glossary: [
    { term: "spoofing", definition: "Faking an identifier, a number, name, or address, to impersonate a trusted source." },
    { term: "ARP spoofing", definition: "Faking device addresses on a local network to reroute traffic through the attacker, enabling a man-in-the-middle." },
    { term: "caller-ID spoofing", definition: "Faking the phone number a call appears to come from, widely used in phone fraud." },
    { term: "SPF / DKIM / DMARC", definition: "Email authentication standards that let a domain assert which servers may send for it, helping receivers detect forged senders." },
  ],

  seeHeading: "When spoofing was sold as a service",

  cases: [
    {
      org: "iSpoof takedown",
      year: "2022",
      headline: "An international operation dismantled a site that sold caller-ID spoofing to fraudsters",
      whatHappened: "In November 2022, an international law-enforcement operation led by London's Metropolitan Police, with Europol and others, took down 'iSpoof', a service that sold caller-ID spoofing to criminals. For a fee, fraudsters could make calls that displayed the real phone numbers of banks and other trusted organisations, then use social engineering to trick victims into handing over codes, passwords or money. The service was used to make a vast number of calls to victims across many countries, enabling large-scale fraud.",
      theMissedMeasure: "Caller ID is not verified by default, which is precisely what iSpoof monetised. The defences are out-of-band verification (never trust a number on the screen for anything important; call the organisation back on a known number) and the slow rollout of technical measures to flag spoofed calls.",
      theCost: "Enormous: the service was linked to fraud against tens of thousands of victims and very large financial losses before the takedown, a striking demonstration that spoofing, combined with social engineering, is an industrial-scale threat, and that it can be fought.",
      control: "access-control",
      impact: ["sold caller-ID spoofing of banks and trusted bodies", "linked to fraud against tens of thousands of victims", "dismantled by a 2022 international operation"],
      source: "Public record; Metropolitan Police and Europol announcements (November 2022).",
      brandColor: "#1d3f91",
      news: { headline: "iSpoof: huge fraud website that let criminals pose as banks taken down", outlet: "BBC News", date: "November 2022" },
    },
  ],

  lab: {
    title: "What is being faked?",
    intro: "Nothing to install and nothing leaves this page. Tap each spoofing example, then tap what identity is being faked.",
    prompts: [
      "Local network (ARP), phone number (caller ID), email sender, or website name (DNS)?",
      "Ask: which trusted identifier has been forged here?",
      "Naming the spoof precisely points you to the right defence.",
    ],
    component: SpoofTypeLab,
  },

  check: {
    explain: {
      prompt: "The iSpoof service let fraudsters display real banks' phone numbers on victims' phones. Explain the deeper lesson about spoofing this reveals, and why out-of-band verification defeats it.",
      modelAnswer: "The deeper lesson is that many systems we trust do not strongly verify identity by default: the phone network will display whatever number a caller claims, so caller ID is a claim, not proof. iSpoof monetised exactly this, selling the ability to fake trusted numbers, which fraudsters combined with social engineering (an urgent 'fraud alert') to trick victims. Out-of-band verification defeats it because it bypasses the forged identifier entirely: instead of trusting the number on the screen, you independently contact the organisation on a known, trusted number. The spoofed caller ID becomes irrelevant, because you are no longer relying on it to decide who you are talking to.",
    },
    quiz: [
      {
        q: "What is the common idea behind all forms of spoofing?",
        options: [
          "Encrypting data",
          "Faking a trusted identifier (a number, name or address) to impersonate a trusted source",
          "Flooding a network with traffic",
          "Stealing physical devices",
        ],
        answer: 1,
        why: "Whether it is a phone number, email sender, or network address, spoofing forges an identifier you instinctively trust.",
      },
      {
        q: "Why is 'the caller ID showed my bank's number' not proof the call is genuine?",
        options: [
          "Caller ID is always accurate",
          "Caller ID is not strongly verified and can be spoofed, as services like iSpoof sold",
          "Banks never call customers",
          "It is proof; always trust it",
        ],
        answer: 1,
        why: "Displayed numbers are claims the network relays, not verified facts, which is exactly what spoofing services exploit.",
      },
      {
        q: "What reliably defeats a spoofed identity on anything important?",
        options: [
          "Trusting it because it looks official",
          "Verifying out-of-band: independently contacting the organisation through a known, trusted channel",
          "Replying to the spoofed message",
          "Acting faster before it expires",
        ],
        answer: 1,
        why: "Out-of-band verification bypasses the forged identifier entirely, so whatever was spoofed no longer matters.",
      },
    ],
  },

  wrap: {
    headline: "You now treat displayed identities as claims, not proof, a defensive instinct that protects against many attacks at once.",
    takeaways: [
      "Spoofing fakes a trusted identifier at any layer: local network (ARP), IP, phone (caller ID), email sender, or DNS.",
      "Many systems do not verify identity by default, so 'it came from a trusted source' is not proof.",
      "Out-of-band verification defeats spoofing by bypassing the forged identifier; technical standards (SPF/DKIM/DMARC) help too.",
    ],
    project: {
      name: "Adopt the verify-back rule",
      blurb: "Set yourself one firm rule: for any call, text or email asking you to act on money, codes or access, you verify by independently contacting the organisation on a number or channel you already trust, never the one provided. Write it down. This single habit neutralises caller-ID, sender and most impersonation spoofing in your own life.",
    },
    ethicsNote: "Spoofing identities to deceive people is fraud and, for network spoofing, a Computer Misuse Act offence. These techniques are studied only to recognise and defend against them.",
  },
};

export default topic3;
