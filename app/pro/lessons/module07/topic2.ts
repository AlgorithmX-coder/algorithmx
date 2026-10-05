import type { TopicManifest } from "../../learn/types";
import { PhishFamilyLab } from "../../learn/conceptLabs";

/* Module 7 - Topic 2: the phishing family (spear, whaling, vishing,
 * smishing, BEC). Case: Evaldas Rimasauskas, who defrauded Google and
 * Facebook of around 100M USD via fake invoices impersonating a real
 * hardware supplier (business email compromise); he pleaded guilty in
 * 2019. Public record: US DoJ statements and 2017-2019 reporting. */
const topic2: TopicManifest = {
  id: "m7t2",
  weekLabel: "Module 7",
  act: "Act 2 - How attacks happen",
  title: "The phishing family",
  role: "Phishing is not one thing, and naming the variant precisely matters: it tells colleagues what happened and what to watch for. Business email compromise in particular is, by reported losses, one of the most damaging categories of cybercrime there is.",
  minutes: 16,
  promise: "Learn the whole phishing family across email, voice and text, then see two tech giants pay out around 100 million dollars to fake invoices.",
  brief: "In this lesson, we'll map the phishing family: ordinary mass phishing, targeted spear phishing, whaling and business email compromise aimed at those who control money, and the voice and text versions, vishing and smishing. Knowing the names lets you describe an attack precisely. Then we'll see how one man used nothing more than convincing fake invoices to take around 100 million dollars from Google and Facebook.",

  learn: [
    {
      heading: "From the mass net to the targeted spear",
      body: [
        "Phishing is any attempt to trick someone into revealing information or taking an action by pretending to be trustworthy. At the broad end is mass phishing: generic messages blasted to millions, hoping a few bite. It is low-effort and easy to spot, but at that scale even a tiny success rate pays.",
        "Sharpen the aim and you get spear phishing: a message tailored to a specific person using research, as you saw with reconnaissance in Module 6. A spear-phishing email that names your real manager and a genuine project is far more convincing than 'Dear Customer'. The trade-off is effort for effectiveness: fewer targets, much higher success.",
      ],
      examples: [
        "Mass phishing: 'Your parcel is held, click here', sent to millions.",
        "Spear phishing: an email to one named person referencing their real work.",
        "The difference is research: spear phishing is mass phishing plus homework.",
      ],
      analogy: {
        plain: "Mass phishing is a net dragged through the sea; spear phishing is a single, aimed spear. One relies on volume, the other on precision.",
        realTerm: "mass vs spear phishing",
      },
    },
    {
      heading: "Whaling and business email compromise: going for the money",
      body: [
        "Aim higher still and you reach whaling: phishing that targets, or impersonates, senior and high-value people, executives, finance staff, anyone who can move money or authorise things. Closely related is business email compromise (BEC): attacks that impersonate a trusted party, a boss, a supplier, a lawyer, to trick an organisation into making a payment or sharing sensitive data.",
        "BEC is quiet, often carries no malware at all, and is devastatingly effective, which is why its reported losses rival or exceed flashier attacks like ransomware. There is no virus to detect; there is just a convincing email and a plausible request. The defence is almost entirely about process and verification, not technology, which the case ahead makes painfully clear.",
      ],
      examples: [
        "Whaling: a lure crafted for, or posing as, a CEO or CFO.",
        "BEC: a fake 'supplier' sends a real-looking invoice with new bank details.",
        "Often no malware at all, just a believable message and a costly instruction.",
      ],
    },
    {
      heading: "Beyond email: vishing and smishing",
      body: [
        "Phishing is not confined to email. Vishing is phishing by voice call: a fake bank 'fraud team', a bogus IT helpdesk, a recorded warning that your account is suspended, all using a live or automated voice to pressure you. Smishing is phishing by text message, and the fake 'missed delivery' or 'unpaid toll' text is now one of the most common scams anyone encounters.",
        "The channel changes but the trick is the same: impersonate someone trusted, apply pressure, and get you to act. Recognising that a phone call or a text can be a phishing attack, just like an email, is half the defence, because people often let their guard down on channels they do not associate with scams.",
      ],
      examples: [
        "Vishing: 'This is your bank's fraud team, please confirm the code we just sent.'",
        "Smishing: 'Your parcel could not be delivered, pay the fee here.'",
        "Same playbook, different channel, often lower guard.",
      ],
      analogy: {
        plain: "A con artist does not only write letters; they also phone and knock on the door. Phishing is the same con, delivered by whichever channel you least expect.",
        realTerm: "vishing and smishing",
      },
    },
  ],

  glossary: [
    { term: "phishing", definition: "Tricking someone into revealing information or taking an action by impersonating a trusted party." },
    { term: "whaling", definition: "Phishing aimed at, or impersonating, senior or high-value individuals such as executives and finance staff." },
    { term: "business email compromise (BEC)", definition: "Impersonating a trusted party (boss, supplier, lawyer) to trick an organisation into a payment or data transfer, often with no malware at all." },
    { term: "vishing", definition: "Voice phishing: a phishing attack carried out by phone call, live or automated." },
    { term: "smishing", definition: "SMS phishing: a phishing attack delivered by text message, such as fake delivery or payment alerts." },
  ],

  seeHeading: "When fake invoices cost two giants 100 million dollars",

  cases: [
    {
      org: "Google & Facebook (BEC)",
      year: "2017",
      headline: "One man took around 100 million dollars with nothing but convincing fake invoices",
      whatHappened: "Between roughly 2013 and 2015, Evaldas Rimasauskas ran a business email compromise scheme against Google and Facebook. He impersonated a real hardware supplier the companies actually used, setting up a lookalike company and sending convincing, official-looking invoices with his own bank details. Believing them genuine, staff paid. Over time the scheme netted around 100 million dollars. There was no malware and no technical break-in, just impersonation and plausible paperwork aimed at the people who processed payments.",
      theMissedMeasure: "Verification of payment changes. Because BEC carries no virus to catch, the defence is process: independently confirming new or changed bank details through a trusted channel before paying, and treating payment instructions with built-in suspicion. Both companies later recovered much of the money, but the gap was procedural, not technical.",
      theCost: "Around 100 million dollars fraudulently paid by two of the most sophisticated technology companies in the world, a stark proof that business email compromise beats technology by targeting process and people. Rimasauskas pleaded guilty in 2019.",
      control: "access-control",
      impact: ["~100 million USD taken from Google and Facebook", "no malware: just impersonation and fake invoices", "defeated by verifying payment changes out-of-band"],
      source: "Public record; US Department of Justice statements and 2017-2019 reporting.",
      brandColor: "#4285f4",
      news: { headline: "Lithuanian man pleads guilty to scamming Google and Facebook out of $100m", outlet: "The Guardian", date: "2019" },
    },
  ],

  lab: {
    title: "Name the phishing variant",
    intro: "Nothing to install and nothing leaves this page. Tap each example, then tap which kind of phishing it is.",
    prompts: [
      "Ask: who is targeted, and through which channel?",
      "Money and senior figures point to whaling or business email compromise.",
      "A call is vishing; a text is smishing. Precise names help you report precisely.",
    ],
    component: PhishFamilyLab,
  },

  check: {
    explain: {
      prompt: "Google and Facebook lost around 100 million dollars to fake invoices with no malware involved. Explain what kind of attack this was, and why its defence is about process rather than technology.",
      modelAnswer: "This was business email compromise, a form of whaling: the attacker impersonated a real supplier and sent convincing fake invoices with his own bank details to the staff who process payments. There was no virus to detect, just plausible paperwork and impersonation, which is exactly what makes BEC so dangerous and so hard for technology to catch. The defence is therefore procedural: independently verifying new or changed payment details through a trusted channel before paying, and treating any payment instruction, however official it looks, with built-in suspicion. The gap that cost two tech giants 100 million dollars was a missing verification step, not a missing piece of software.",
    },
    quiz: [
      {
        q: "What distinguishes spear phishing from mass phishing?",
        options: [
          "Spear phishing is sent to more people",
          "Spear phishing is tailored to a specific person using research, trading volume for much higher success",
          "Spear phishing always uses the phone",
          "There is no difference",
        ],
        answer: 1,
        why: "Spear phishing is mass phishing plus homework: fewer targets, far more convincing because it is personalised.",
      },
      {
        q: "Why is business email compromise (BEC) so hard to stop with technology alone?",
        options: [
          "It uses an undetectable virus",
          "It often carries no malware at all: it is a convincing message and a plausible request, so the defence is verification and process",
          "It only targets small companies",
          "It is actually easy to stop with antivirus",
        ],
        answer: 1,
        why: "With no malware to detect, there is nothing for a scanner to catch. BEC is beaten by verifying payment changes out-of-band and building suspicion into the process.",
      },
      {
        q: "A recorded phone call saying your account is suspended, urging you to press 1, is an example of:",
        options: ["Smishing", "Vishing", "Whaling", "Mass email phishing"],
        answer: 1,
        why: "Phishing by voice call, live or automated, is vishing. The channel is the phone; the levers are still fear and urgency.",
      },
    ],
  },

  wrap: {
    headline: "You can now name every member of the phishing family, which is the first step to spotting and reporting each one.",
    takeaways: [
      "Phishing ranges from generic mass emails to tailored spear phishing built on research.",
      "Whaling and business email compromise target money and senior figures, often with no malware, and cause enormous losses.",
      "Vishing (voice) and smishing (text) carry the same con onto channels where people drop their guard.",
    ],
    project: {
      name: "Collect the family",
      blurb: "Over a week, note the phishing attempts you actually receive, by email, text or call, and label each one: mass, spear, smishing, vishing, or a BEC-style request. You will be surprised how many you get, and labelling them trains your eye. This is the start of the Phishing Field Guide you will complete at the end of this module.",
    },
    ethicsNote: "Learning the phishing family is for recognising and reporting it. Sending phishing of any kind to real people without explicit authorisation is fraud and a serious offence; the only lawful exception is a sanctioned test, covered in topic 5.",
  },
};

export default topic2;
