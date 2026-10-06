import type { TopicManifest } from "../../learn/types";
import { WifiHabitLab } from "../../learn/conceptLabs";

/* Module 10 - Topic 2: Wi-Fi attacks (evil twin and rogue access
 * points). Case: the 2024 Australian "evil twin" airport/flight case,
 * in which a man was charged after allegedly setting up fake Wi-Fi
 * networks at airports and on flights to harvest credentials. Public
 * record: Australian Federal Police statements and 2024 reporting. */
const topic2: TopicManifest = {
  id: "m10t2",
  weekLabel: "Module 10",
  act: "Act 2 - How attacks happen",
  title: "Wi-Fi attacks: the evil twin",
  role: "Public Wi-Fi is everywhere, and so are attacks on it. Understanding how a fake network impersonates a real one, and the simple habits that defeat it, is practical knowledge you will use personally and advise others on constantly.",
  minutes: 15,
  promise: "Learn how a fake hotspot impersonates a real one, then see a traveller charged for running them in airports and on planes.",
  brief: "In this lesson, we'll look at attacks on Wi-Fi itself. The star of the show is the 'evil twin': a fake access point an attacker sets up to look exactly like a legitimate network, so you connect to it instead. Once you do, they are perfectly placed to intercept your traffic. We'll learn the simple habits that defeat it, and then see a real case of evil-twin networks run where travellers least expect them.",

  learn: [
    {
      heading: "The evil twin: a fake network wearing a real name",
      body: [
        "A Wi-Fi network is identified mostly by its name, and anyone can name a network anything they like. An evil twin exploits this: the attacker sets up their own access point using the same (or a very similar) name as a legitimate one, 'Airport_Free_WiFi', 'CoffeeShop Guest', so your device, or you, cannot easily tell it apart from the real thing. Connect to it, and all your traffic now flows through the attacker's equipment.",
        "A related trick is the rogue access point: an unauthorised access point plugged into a network (sometimes by a careless insider) that becomes a backdoor. Both share the same core idea: get you, or your traffic, onto a network the attacker controls. From that position they can attempt the eavesdropping and man-in-the-middle attacks from the last topic.",
      ],
      examples: [
        "Evil twin: a fake hotspot named exactly like the real café or airport Wi-Fi.",
        "Rogue access point: an unauthorised AP that opens a backdoor into a network.",
        "Either way, your traffic ends up flowing through the attacker's equipment.",
      ],
      analogy: {
        plain: "A fake taxi with the right colour and a convincing sign. You get in expecting a normal ride, but the driver decides where you really go, and what they do on the way.",
        realTerm: "evil twin",
      },
    },
    {
      heading: "Why it works, and what it cannot beat",
      body: [
        "The evil twin works on trust and convenience: we connect to Wi-Fi by its familiar name, often automatically, without verifying it is genuine. The attacker simply supplies a convincing name and waits. It is low-effort and effective precisely because people do not expect the network itself to be the trap.",
        "But here is the reassuring part, straight from the last topic: even if your traffic flows through an attacker's network, strong encryption still protects its contents. HTTPS and a trustworthy VPN mean the evil twin sees only scrambled data. So the evil twin's real prize is anything you do unencrypted, or any moment it can trick you past a certificate warning. Encryption plus a healthy suspicion of warnings is what blunts it.",
      ],
      examples: [
        "It works because we trust Wi-Fi names and connect without checking.",
        "Encryption still protects content even on a hostile network: the twin sees gibberish.",
        "Its prize is unencrypted traffic, or users who click past security warnings.",
      ],
    },
    {
      heading: "Simple habits that defeat it",
      body: [
        "The defences here are refreshingly practical. Verify the exact network name with staff before joining public Wi-Fi, since a lookalike is the whole trick. Turn off auto-connect so your device does not silently join a familiar-looking trap. Use a VPN on any network you do not control, so your traffic is encrypted regardless. Avoid sensitive actions, like banking, on unknown open Wi-Fi, or do them over mobile data instead. And never click past a certificate warning to 'make a site work'.",
        "None of this requires expertise, which is the point: evil twins prey on convenience, so a few deliberate habits remove most of the risk. This is also exactly the kind of clear, practical guidance a security professional gives to ordinary users, and being able to explain the why, not just the rule, is what makes the advice stick.",
      ],
      examples: [
        "Verify the real network name; turn off auto-connect on untrusted networks.",
        "Use a VPN on networks you do not control; prefer mobile data for sensitive tasks.",
        "Never click past a certificate warning to force a site to load.",
      ],
      analogy: {
        plain: "You check it is a real licensed taxi before getting in, and you do not hand over your wallet en route. Small, deliberate checks defeat the convincing fake.",
        realTerm: "safe Wi-Fi habits",
      },
    },
  ],

  glossary: [
    { term: "evil twin", definition: "A fake Wi-Fi access point set up to impersonate a legitimate network by using the same or a similar name, so victims connect to it." },
    { term: "rogue access point", definition: "An unauthorised access point added to a network, which can act as a backdoor for an attacker." },
    { term: "auto-connect", definition: "A device setting that automatically joins known or open networks, which an evil twin can abuse by reusing a familiar name." },
    { term: "SSID", definition: "The name of a Wi-Fi network, which anyone can set to anything, making names alone an unreliable sign of trust." },
  ],

  seeHeading: "When the fake Wi-Fi was in the airport",

  cases: [
    {
      org: "Airport / in-flight evil twin",
      year: "2024",
      headline: "A traveller was charged over fake Wi-Fi networks run at airports and on planes",
      whatHappened: "In 2024, Australian authorities charged a man after allegedly setting up 'evil twin' Wi-Fi networks at airports and on domestic flights. The fake networks reportedly presented convincing names and, when travellers connected, prompted them to enter email or social-media credentials, which were then harvested. It is a textbook evil-twin attack carried out in exactly the places people most expect to find, and casually trust, free public Wi-Fi.",
      theMissedMeasure: "For travellers, the defences are the practical habits in this topic: verifying networks, not entering credentials into a page a Wi-Fi network pushes at you, using a VPN, and preferring mobile data for anything sensitive. The attack relied entirely on people trusting a convincing network name and a plausible login prompt.",
      theCost: "A real criminal case built on harvested credentials from unsuspecting travellers, and a vivid public reminder that the network you connect to can itself be the attacker, especially in busy, trusting environments like airports.",
      control: "access-control",
      impact: ["fake Wi-Fi run at airports and on flights", "convincing names plus fake login prompts harvested credentials", "a real 2024 criminal case"],
      source: "Public record; Australian Federal Police statements and 2024 reporting.",
      brandColor: "#0077c8",
      news: { headline: "Man charged over fake free Wi-Fi networks at Australian airports", outlet: "Mainstream reporting (2024)", date: "2024" },
    },
  ],

  lab: {
    title: "Safe or risky Wi-Fi?",
    intro: "Nothing to install and nothing leaves this page. For each Wi-Fi habit, decide: safe, or risky?",
    prompts: [
      "Remember the evil twin: a convincing name proves nothing.",
      "Verify networks, turn off auto-connect, use a VPN, prefer mobile data for sensitive tasks.",
      "These are exactly the habits you would teach an ordinary user.",
    ],
    component: WifiHabitLab,
  },

  check: {
    explain: {
      prompt: "Explain how an evil-twin attack works, why encryption still helps even once you have connected to one, and two simple habits that defeat it.",
      modelAnswer: "An evil twin is a fake access point the attacker names identically (or similarly) to a legitimate network, so you connect to it instead of the real one; your traffic then flows through the attacker's equipment, ready for eavesdropping or man-in-the-middle attacks. It works because we trust Wi-Fi names and often auto-connect without checking. Encryption still helps because even on a hostile network, HTTPS and a trustworthy VPN keep your traffic's contents scrambled, so the twin sees only gibberish; its real prize is unencrypted traffic or users tricked past a certificate warning. Two simple defeating habits: verify the exact network name with staff before joining, and use a VPN (or mobile data) on any network you do not control, so your traffic stays encrypted regardless of whose network it is.",
    },
    quiz: [
      {
        q: "What is an 'evil twin' in Wi-Fi security?",
        options: [
          "A duplicate password",
          "A fake access point impersonating a legitimate network by using the same or a similar name",
          "A second router for backup",
          "A type of malware",
        ],
        answer: 1,
        why: "Anyone can name a network anything, so an attacker names theirs like the real one to lure you onto a network they control.",
      },
      {
        q: "Once you have connected to an evil twin, what still protects your data?",
        options: [
          "Nothing can help",
          "Strong encryption (HTTPS, a trustworthy VPN) keeps your traffic's contents unreadable to the attacker",
          "Only antivirus",
          "Turning the screen brightness down",
        ],
        answer: 1,
        why: "Encryption protects content even on a hostile network. The twin's prize is whatever is unencrypted, or users who click past warnings.",
      },
      {
        q: "Which is a genuinely safe public-Wi-Fi habit?",
        options: [
          "Auto-connecting to any familiar-looking open network",
          "Verifying the exact network name and using a VPN (or mobile data) for sensitive tasks",
          "Trusting any network named 'Free WiFi'",
          "Doing banking on unknown open Wi-Fi to save mobile data",
        ],
        answer: 1,
        why: "Verifying the real name defeats lookalikes, and a VPN encrypts your traffic regardless of whose network it is.",
      },
    ],
  },

  wrap: {
    headline: "You can now spot and defeat the evil twin, and give ordinary users clear, practical Wi-Fi advice.",
    takeaways: [
      "An evil twin is a fake access point wearing a real network's name; a rogue access point is an unauthorised backdoor AP.",
      "Encryption still protects content even on a hostile network, so the twin's real prize is unencrypted traffic.",
      "Practical habits defeat it: verify the name, disable auto-connect, use a VPN, prefer mobile data for sensitive tasks.",
    ],
    project: {
      name: "Harden your Wi-Fi habits",
      blurb: "On your phone and laptop, find the setting that auto-connects to networks and decide whether to turn it off for open networks. Decide your rule for sensitive tasks on public Wi-Fi (VPN, or mobile data only). Write your two-line 'public Wi-Fi rule'. You now have advice you could confidently give anyone.",
    },
    ethicsNote: "Setting up a fake access point to intercept others' traffic or harvest credentials is a serious crime, as the case shows. Evil twins are studied here purely to recognise and defend against them.",
  },
};

export default topic2;
