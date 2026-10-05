import type { TopicManifest } from "../../learn/types";
import { PersuasionLab } from "../../learn/conceptLabs";

/* Module 7 - Topic 3: the psychology (authority, urgency, fear, trust).
 * Case: the 2019 AI-voice CEO-fraud incident, in which criminals used a
 * synthesised voice impersonating a parent-company chief executive to
 * persuade a UK energy firm's managing director to wire ~220,000 EUR.
 * Public record: 2019 Wall Street Journal reporting and insurer Euler
 * Hermes' account. */
const topic3: TopicManifest = {
  id: "m7t3",
  weekLabel: "Module 7",
  act: "Act 2 - How attacks happen",
  title: "The psychology of the con",
  role: "Social engineering is applied psychology. Knowing the specific emotional levers attackers pull, and feeling them being pulled in the moment, is what lets a person stop and check instead of reacting. This self-awareness is a defence no firewall provides.",
  minutes: 16,
  promise: "Learn the handful of psychological levers every con uses, then hear how a faked voice and a note of urgency moved a fortune.",
  brief: "In this lesson, we'll look under the hood of social engineering at the psychology that makes it work. Attackers rely on a small set of reliable levers, authority, urgency, fear, and trust, to make you act before you think. We'll learn to name each one, and then see a striking modern case where criminals combined authority and urgency, aided by an AI-faked voice, to talk a company into wiring away a large sum.",

  learn: [
    {
      heading: "Acting before thinking: the attacker's goal",
      body: [
        "Every social-engineering attack has the same underlying aim: to get you to act before you think. Our careful, sceptical reasoning is slow; our emotional, instinctive reactions are fast. Attackers engineer situations that trigger the fast response and suppress the slow one, so you comply before your judgement catches up.",
        "This is why naming the levers matters so much. You will not always spot a clever fake, but you can learn to notice the feeling an attack creates, a sudden jolt of pressure, fear or deference, and treat that feeling itself as the warning sign. The emotion is the tell.",
      ],
      examples: [
        "The attack wants speed: 'now', 'immediately', 'before it's too late'.",
        "It suppresses checking: 'don't tell anyone', 'no time to confirm'.",
        "The defence is to notice the pressure and deliberately slow down.",
      ],
      analogy: {
        plain: "A pushy salesperson rushes you to sign 'before the offer ends' precisely so you cannot think it over. The rush is the trick, not a kindness.",
        realTerm: "acting before thinking",
      },
    },
    {
      heading: "The four reliable levers",
      body: [
        "A handful of levers come up again and again. Authority: we tend to comply with people who seem powerful or official, so attackers pose as bosses, police, or IT. Urgency and scarcity: a ticking clock or a limited chance stops us pausing. Fear: a threat, of loss, trouble, or punishment, pushes us to obey to make the bad feeling stop. And liking and trust: we cooperate more with people who seem friendly, familiar, or on our side.",
        "Real attacks usually combine several. 'This is the CEO (authority), I need this done in the next hour (urgency), or we'll lose the deal (fear)' pulls three levers at once. Learning to pick them apart, to say 'this message is leaning on authority and urgency', breaks their grip, because naming a manipulation is the first step to resisting it.",
      ],
      examples: [
        "Authority: 'I'm from the IT department and I need your password to fix this.'",
        "Urgency / scarcity: 'Act in the next 30 minutes or the account is closed.'",
        "Fear: 'There's been fraud on your account and the police are involved.'",
        "Liking / trust: 'Hey, it's me from accounts, can you do me a quick favour?'",
      ],
    },
    {
      heading: "Technology makes the levers stronger",
      body: [
        "The levers are ancient, but technology is sharpening them. Attackers can spoof a caller ID so a call appears to come from your bank, copy a company's exact branding, and now even synthesise a familiar voice or face. These tools do not invent new psychology; they make the old levers more convincing by removing the little inconsistencies that used to give a con away.",
        "The defensive response does not change, and that is reassuring: because the levers are the same, so is the counter. Notice the pressure, refuse to be rushed, and verify through a trusted, independent channel before acting, especially for anything involving money, access or secrets. The case ahead shows exactly why verification, not detection, is the durable defence: the fake was good enough to fool the ear.",
      ],
      examples: [
        "Spoofed caller ID makes a scam call look like it is from your bank.",
        "A copied voice or face removes the 'that doesn't sound like them' instinct.",
        "The counter is unchanged: slow down and verify out-of-band.",
      ],
      analogy: {
        plain: "A better forgery of a signature does not change the rule: for anything important, you still verify through a channel the forger does not control.",
        realTerm: "verification over detection",
      },
    },
  ],

  glossary: [
    { term: "authority (as a lever)", definition: "The tendency to comply with people who seem powerful or official, exploited by impersonating bosses, police or IT." },
    { term: "urgency / scarcity", definition: "Manufacturing time pressure or a limited chance so the target acts without pausing to check." },
    { term: "out-of-band verification", definition: "Confirming a request through a separate, trusted channel the attacker does not control, such as a known phone number." },
    { term: "caller ID spoofing", definition: "Faking the number a call appears to come from, so a scam call looks like it is from a trusted source." },
  ],

  seeHeading: "When a faked voice moved a fortune",

  cases: [
    {
      org: "UK energy firm (AI-voice CEO fraud)",
      year: "2019",
      headline: "Criminals used a synthesised voice to impersonate a boss and authorise a large transfer",
      whatHappened: "In 2019, criminals reportedly used AI-based voice-synthesis software to impersonate the chief executive of a parent company. They called the managing director of a UK energy subsidiary, who believed he recognised his boss's voice, accent and manner, and urgently instructed him to wire around 220,000 euros to a supplier. Under the authority of the 'CEO' and the pressure of urgency, the transfer was made. The voice was fake; the money was real.",
      theMissedMeasure: "Out-of-band verification. The request should have been independently confirmed through a known, trusted channel before any transfer, regardless of how familiar the voice sounded. The attack succeeded precisely by making detection, trusting the ear, feel sufficient, when only verification would have caught it.",
      theCost: "Around 220,000 euros transferred to the criminals on the strength of a convincing voice and an urgent instruction, an early, vivid warning that technology is making the classic authority-and-urgency con harder to detect, and verification more essential than ever.",
      control: "access-control",
      impact: ["~220,000 EUR wired on a faked CEO's voice", "authority + urgency were the levers", "a landmark early AI-voice fraud case"],
      source: "Public record; 2019 Wall Street Journal reporting and insurer Euler Hermes' account.",
      brandColor: "#f1c40f",
      news: { headline: "Fraudsters used AI to mimic CEO's voice in unusual cybercrime case", outlet: "The Wall Street Journal", date: "2019" },
    },
  ],

  lab: {
    title: "Name the lever",
    intro: "Nothing to install and nothing leaves this page. For each line from a scam message, identify the main psychological lever it is pulling.",
    prompts: [
      "Authority, urgency and scarcity, fear, or liking and trust?",
      "Many real messages pull more than one; pick the strongest.",
      "Learning to name the lever is how you catch yourself in the moment.",
    ],
    component: PersuasionLab,
  },

  check: {
    explain: {
      prompt: "In the 2019 case, a managing director wired around 220,000 euros because he recognised his 'CEO's' voice. Name the psychological levers at work, and explain why verification, not a better ear, is the real defence.",
      modelAnswer: "The levers were authority (the instruction appeared to come from the CEO) and urgency (an immediate transfer was demanded), the classic combination that makes people act before thinking. The voice was AI-synthesised, convincing enough that the managing director trusted his ear, which is exactly why detection failed: the fake removed the usual 'that doesn't sound right' instinct. The durable defence is verification, not detection: independently confirming the request through a known, trusted channel before moving any money. Because technology keeps making fakes more convincing, you cannot rely on spotting them; you rely on verifying through a channel the attacker does not control.",
    },
    quiz: [
      {
        q: "What is the underlying goal of almost every social-engineering attack?",
        options: [
          "To be technically impressive",
          "To make you act before you think, by triggering a fast emotional response",
          "To make you laugh",
          "To test your typing speed",
        ],
        answer: 1,
        why: "Attacks engineer pressure so your fast, instinctive reaction fires before your slow, sceptical judgement can catch up.",
      },
      {
        q: "'This is the director, I need this payment in the next hour or we lose the contract.' Which levers are being pulled?",
        options: [
          "Only liking",
          "Authority, urgency, and fear together",
          "None; this is a normal request",
          "Only scarcity",
        ],
        answer: 1,
        why: "It impersonates power (authority), imposes a deadline (urgency), and threatens a loss (fear): three levers at once, a classic combination.",
      },
      {
        q: "As fakes (voices, caller IDs, branding) get more convincing, the durable defence is:",
        options: [
          "Getting better at spotting fakes",
          "Verifying important requests out-of-band, through a trusted channel the attacker does not control",
          "Trusting anything that looks official",
          "Acting faster to beat the deadline",
        ],
        answer: 1,
        why: "Detection fails against good fakes. Verification through an independent, trusted channel works regardless of how convincing the fake is.",
      },
    ],
  },

  wrap: {
    headline: "You can now name the levers a con pulls, and feel them being pulled, which is a defence no technology provides.",
    takeaways: [
      "Social engineering works by making you act before you think; the emotional pressure is itself the warning sign.",
      "The reliable levers are authority, urgency and scarcity, fear, and liking and trust, usually combined.",
      "Technology makes the levers more convincing, so the durable defence is verification out-of-band, not trying to detect the fake.",
    ],
    project: {
      name: "Catch the lever on yourself",
      blurb: "Next time any message, at work or at home, makes you feel a jolt of pressure to act now, pause and name the lever: is it authority, urgency, fear, or trust? Write down one real example you encounter. Training yourself to notice the feeling, and name it, is the single most practical defence against social engineering.",
    },
    ethicsNote: "Understanding persuasion is to resist being manipulated and to protect others. Using these levers to deceive people for gain is fraud; this knowledge is for defence, within the authorisation line set in Module 5.",
  },
};

export default topic3;
