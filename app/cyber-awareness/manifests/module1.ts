import type { ModuleManifest, TrackBlock } from "@/app/ai-cleared/engine/types";
import { everyDesk } from "./everyDesk";

/* Cyber Awareness, Module 1 · The Human Firewall. Most attacks on a firm
 * start with a person, not broken technology. Learn: two real, reported
 * cases (Marks & Spencer 2025, Arup 2024), what attackers want from you,
 * the five pressure buttons, the one habit, and no-blame reporting.
 * Practise: spot the moments in a working morning where someone was
 * working on you, and name the button. Prove: five "what do you do next?"
 * scenarios. Same for every desk.
 *
 * Every fact about a real case is taken from the published reports linked
 * on its card, checked on 9 November 2026, and phrased as reported. The
 * morning and the scenarios are invented. */

const SOURCES = {
  survey: { label: "Cyber Security Breaches Survey 2025, GOV.UK, 10 April 2025", href: "https://www.gov.uk/government/statistics/cyber-security-breaches-survey-2025/cyber-security-breaches-survey-2025" },
  msChair: { label: "Infosecurity Magazine, 9 July 2025: the M&S chairman's evidence to MPs", href: "https://www.infosecurity-magazine.com/news/ms-chairman-declines-ransom-payment/" },
  msCost: { label: "Bloomberg, via the Irish Examiner, 8 July 2025", href: "https://www.irishexaminer.com/business/companies/arid-41665775.html" },
  msHelpDesk: { label: "LBC, 6 May 2025: help desk workers tricked into resetting passwords", href: "https://www.lbc.co.uk/article/co-op-marks-spencer-cyberattackers-tricked-it-workers-5Hjd6LG_2/" },
  ncsc: { label: "NCSC, 4 May 2025: incidents impacting retailers", href: "https://www.ncsc.gov.uk/blog-post/incidents-impacting-retailers" },
  arupFortune: { label: "Fortune, 17 May 2024", href: "https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo/" },
  arupCfoDive: { label: "CFO Dive, 17 May 2024", href: "https://www.cfodive.com/news/deepfake-scam-engineering-firm-arup-25-million-fraud-hong-kong-cfo/716501/" },
};

const BLOCK: TrackBlock = {
  practise: {
    kind: "moments",
    task: "A normal Tuesday morning at {{firm.name}}. Three times, someone is working on you. Flag those three moments and name the pressure button each one presses.",
    scene: "Read it the way you would live it, top to bottom. Flag anything that feels like pressure; an ordinary moment flagged costs nothing.",
    levers: [
      { id: "urgency", label: "Urgency", desc: "A deadline that leaves no time to check." },
      { id: "authority", label: "Authority", desc: "Rank borrowed to switch off doubt: the boss, IT, the bank." },
      { id: "fear", label: "Fear", desc: "A threat of trouble that makes you act to make it go away." },
      { id: "helpfulness", label: "Helpfulness", desc: "Your wish to help someone who seems stuck." },
      { id: "curiosity", label: "Curiosity", desc: "Something tempting to open or look at." },
    ],
    moments: [
      {
        time: "08:52",
        where: "Email",
        from: "Facilities",
        text: "The second-floor lift is out of service until Thursday. Please use the stairs or the lift by reception.",
        why: "A routine notice. It asks nothing of you: no link, no login, no payment.",
      },
      {
        time: "09:05",
        where: "Email",
        from: "Microsoft 365 Security <alerts@m365-account-review.com>",
        text: "Unusual sign-in detected on your account. Confirm your identity within 30 minutes or your mailbox will be suspended. [Confirm now]",
        levers: ["fear", "urgency"],
        why: "Fear (your mailbox will be suspended) and urgency (30 minutes), from an address that is not Microsoft's. The habit: do not click. If you are worried, sign in the way you always do, or ask IT.",
      },
      {
        time: "09:20",
        where: "Teams",
        from: "Dan Okafor, Sales",
        text: "Morning! Still OK to swap our Thursday 2pm slots? No worries if not.",
        why: "A colleague you know, in his usual tone, asking for nothing that matters to an attacker. No pressure, no deadline.",
      },
      {
        time: "09:48",
        where: "Phone call",
        from: "Jamie, says he is from the IT service desk",
        text: "\"Hi, it's Jamie on the service desk. We're moving your mailbox this morning and I need to stop it locking you out. I've just sent a code to your phone; can you read it back to me? Ten seconds.\"",
        levers: ["authority", "urgency"],
        why: "Authority: he says he is IT, so doing what he asks feels safe. That code is the key to your account, and no real IT team ever needs it from you. The habit: say you will call back, hang up, and ring the service desk on the number you already have.",
      },
      {
        time: "10:15",
        where: "Reception",
        from: "A courier with a large box",
        text: "He says the box has to go straight up to the server room, his hands are full, and could you just tap him through the security door?",
        levers: ["helpfulness"],
        why: "Helpfulness: his hands are full and you want to help. Holding a secure door for someone nobody has checked walks them past every lock the firm paid for. The habit: ask him to sign in at reception, and let the person expecting the box come and collect it.",
      },
      {
        time: "10:40",
        where: "Email",
        from: "Office manager",
        text: "Reminder: team lunch is Friday at 12:30 in meeting room 2. Reply if you have any dietary needs.",
        why: "Ordinary office news from a known sender. Replying with your dietary needs gives nobody a way in.",
      },
      {
        time: "11:05",
        where: "Teams",
        from: "Your manager",
        text: "Moved our one-to-one to 3pm, same room.",
        why: "A short, normal message that asks you to do nothing except turn up.",
      },
    ],
  },
  prove: [
    {
      kind: "choose",
      stem: "An email in your managing partner's name: \"In meetings all day. Please buy six £100 gift cards for a client thank-you today and send me the codes. Keep this between us.\" What do you do next?",
      options: [
        "Buy them, as the request clearly comes from the managing partner.",
        "Check with the partner by phone or in person, on a number you know.",
        "Reply to the same email and ask the partner to confirm it is genuine.",
      ],
      answer: 1,
      why: "Authority, urgency and secrecy together. Replying to the email asks the attacker, who will happily say yes. Check through a channel you already trust: their known number, their assistant, or in person. Nobody is in trouble for checking.",
    },
    {
      kind: "choose",
      stem: "A caller says he is from your bank's fraud team. He knows your name and the last four digits of your card, and says a payment goes out in minutes unless you read him the code he has just sent. What do you do next?",
      options: [
        "Read him the code, since he already knows your card details.",
        "Ask him a security question that only the real bank could answer.",
        "Hang up, then ring the number on the back of your card yourself.",
      ],
      answer: 2,
      why: "Fear and urgency. Knowing your details proves nothing; they are easy to buy. A bank never needs that code from you. Questions on the same call keep you on his channel, so hang up and call a number you already trust.",
    },
    {
      kind: "choose",
      stem: "You clicked a parcel delivery link and typed your work password into the page before you noticed the web address was wrong. What do you do next?",
      options: [
        "Tell {{firm.contact}} now: what you clicked, and what you typed.",
        "Change your password quietly and keep an eye on your inbox.",
        "Delete the email so nobody else in the team can be caught by it.",
      ],
      answer: 0,
      why: "Say so fast. A new password helps but is not enough: the attacker may already be in, and only the people who can see the logs can check. Deleting the email throws away what helps protect everyone else. Nobody is blamed for reporting.",
    },
    {
      kind: "choose",
      stem: "A Teams message from a colleague's account: \"Quick one, can you open this and enable editing? Revised fee schedule, client call in 5.\" It does not sound like her. What do you do next?",
      options: [
        "Open the file but leave editing off, which keeps the risk low.",
        "Call her or walk over and ask her before you open anything.",
        "Ask her in the same Teams chat whether the message is really hers.",
      ],
      answer: 1,
      why: "Urgency, from an account you trust. Accounts get taken over, so the same chat may be answered by the attacker. Check another way: a call or a walk over. Opening the file at all is the risk; the file is the attack.",
    },
    {
      kind: "choose",
      stem: "Someone in a hi-vis jacket at the office door says he is here to test the fire alarms, his contact is off sick, and could you let him in so he is not late for his next job? What do you do next?",
      options: [
        "Let him in, as fire safety matters and he is clearly a contractor.",
        "Let him in, but stay with him while he tests the alarms on your floor.",
        "Ask him to wait at reception while you check the visit with facilities.",
      ],
      answer: 2,
      why: "Helpfulness and authority: the jacket does the talking. A real contractor expects to be checked and will wait. Escorting him still lets someone nobody has checked into the building. Check with whoever books visits, through a channel you already have.",
    },
  ],
};

export const AWARENESS_MODULE_1: ModuleManifest = {
  n: 1,
  slug: "the-human-firewall",
  title: "The Human Firewall",
  minutes: 15,
  course: "cyber-awareness",
  promise: "Spot the moment someone is working on you, and know the one habit that beats it every time.",
  passMark: 4,
  shuffleOptions: true,
  dock: [
    { label: "The one habit", lines: ["Pause. Then check through a channel you already trust.", "Saying no, or \"I will call you back\", is always allowed."] },
    { label: "The five pressure buttons", lines: ["Urgency · Authority · Fear · Helpfulness · Curiosity"] },
    { label: "Clicked something?", lines: ["Tell {{firm.contact}} straight away: what you clicked, and what you typed. Fast and honest beats perfect. Nobody is blamed for reporting."] },
  ],
  learn: [
    {
      kind: "intro",
      eyebrow: "Module 1 of 8 · about 15 minutes",
      heading: "Most attacks are let in, not broken in.",
      lead: "Most cyber attacks on firms do not start with clever code. They start with a person: an email that looks right, a call that sounds right, a message that feels urgent. The technology holds; someone is talked past it. Attacks change every week, but they all need that moment. This module is about spotting it, and the one habit that beats it.",
      note: "Every case in this module is real and was reported in the press. The sources are linked, so you can read them yourself.",
      cta: "Show me the cases",
    },
    {
      kind: "cards",
      eyebrow: "Learn · people are the way in",
      heading: "Three reports. Tap each one.",
      lead: "A UK survey, then two large firms where, as reported, a person was the way in.",
      reveal: true,
      columns: 1,
      cards: [
        {
          title: "UK businesses, 2025",
          tag: "GOV.UK",
          tint: "I",
          body: "Phishing is the most common way in.",
          detail: "In the UK government's Cyber Security Breaches Survey 2025, 43% of businesses reported a breach or attack in the past year. Of those, 85% had been hit by phishing: a message built to get a person to click, sign in or pay. It was the most common type of attack in the survey.",
          sources: [SOURCES.survey],
        },
        {
          title: "Marks & Spencer, 2025",
          tag: "Retail · UK",
          tint: "crit",
          body: "Someone pretending to be staff, a help desk that believed them, then ransomware.",
          detail: "Attackers got into M&S's systems on 17 April 2025. Its chairman told MPs the way in was \"sophisticated impersonation\" involving a third party, and it was reported that IT help desk staff had been tricked into resetting passwords. A ransomware attack followed, which the DragonForce gang claimed. M&S estimated a £300m hit to operating profit. The NCSC's advice to firms afterwards: check how your help desk confirms who is calling before it resets a password.",
          sources: [SOURCES.msChair, SOURCES.msCost, SOURCES.msHelpDesk, SOURCES.ncsc],
        },
        {
          title: "Arup, 2024",
          tag: "Engineering",
          tint: "crit",
          body: "A video call where the chief financial officer, and everyone else on it, was reportedly a deepfake.",
          detail: "A member of staff in Arup's Hong Kong office got a message said to be from the firm's chief financial officer, about a confidential transaction. A video call followed with the \"CFO\" and other colleagues, reported to be AI-generated fakes. The employee made 15 transfers, about US$25m (HK$200m), and found out only after checking with the UK head office. Arup confirmed that fake voices and images were used.",
          sources: [SOURCES.arupFortune, SOURCES.arupCfoDive],
        },
      ],
      note: "The pattern in all three: a person, under pressure, asked to do one ordinary thing. Reset a password. Make a payment. Click a link.",
    },
    {
      kind: "cards",
      eyebrow: "Learn · what attackers want from you",
      heading: "You have four things they want. Tap each.",
      lead: "Almost every attack on a member of staff is after one of these.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Your login", tag: "Most common", tint: "R", body: "A sign-in page that looks like Microsoft 365, or a \"service desk\" call asking for a code.", detail: "With your password and the code from your phone, they are you: your email, your files, your Teams. Then they use your account to fool the next person, because a message from you is trusted." },
        { title: "A payment", tag: "Fastest win", tint: "R", body: "New bank details on an invoice. Pay this supplier today. Buy gift cards for a director.", detail: "Money is the quickest return. The request often comes from a real colleague's or supplier's account that has been taken over, so the address looks right. Module 6 goes deeper." },
        { title: "Data", tag: "Sold or ransomed", tint: "C", body: "A client list, a payroll export, a copy of someone's passport.", detail: "Data can be sold, used to fool your clients, or held to ransom. A request for \"just the list\" from someone you cannot check is a request for data." },
        { title: "A way in for someone else", tag: "You are the door", tint: "C", body: "Reset this password. Plug this in. Let me through the side door.", detail: "Often you are not the target, you are the door. At M&S, it was reported that a help desk resetting passwords was part of the way in. One small favour can open the whole firm." },
      ],
    },
    {
      kind: "cards",
      eyebrow: "Learn · the pressure buttons",
      heading: "Five buttons. Every scam presses at least one. Tap each.",
      lead: "Pressure is the tell. A real request rarely needs you to skip the check; a scam always does.",
      reveal: true,
      columns: 2,
      cards: [
        { title: "Urgency", tint: "warn", body: "\"I need this in the next ten minutes.\"", detail: "A deadline stops you checking. A real deadline survives a two-minute call back; a scam does not." },
        { title: "Authority", tint: "warn", body: "\"This is the finance director. Just get it done.\"", detail: "People do not question the boss, the bank, HMRC or IT. Attackers borrow that rank because it switches off doubt." },
        { title: "Fear", tint: "warn", body: "\"Your account will be locked. You will be held responsible.\"", detail: "Fear of trouble makes people act to make it go away. A threat is a reason to slow down, not speed up." },
        { title: "Helpfulness", tint: "warn", body: "\"I'm locked out and my client is waiting. Could you just...\"", detail: "Most people like to help, and help desks exist to help. Attackers play the stranded colleague because kindness opens doors." },
        { title: "Curiosity", tint: "warn", body: "\"Salary review 2026: see where you sit.\"", detail: "A tempting file, a parcel you did not order, a photo of you. Curiosity gets the click before thinking does." },
      ],
      note: "Most attacks press more than one. The Arup call leaned hardest on authority: who questions the chief financial officer on a video call?",
    },
    {
      kind: "timeline",
      eyebrow: "Learn · the one habit",
      heading: "Pause. Then check through a channel you already trust.",
      lead: "One habit beats every button, whatever the attack looks like this week.",
      before: {
        label: "Under pressure",
        steps: [
          "A caller says he is from the bank and your account is at risk.",
          "You do what he asks while he is still on the line.",
          "You read out the code, click the link or make the payment.",
          "You find out later it was never the bank.",
        ],
      },
      after: {
        label: "The habit",
        steps: [
          "Pause. Notice the button being pressed: urgency, authority, fear, helpfulness or curiosity.",
          "Leave the channel the request came in on. Hang up, do not reply, do not click.",
          "Check through a channel you already trust: the number on the intranet, the person's desk, a new message you start yourself.",
          "A real request survives the check. A fake one disappears.",
        ],
      },
      revealLabel: "Show the habit",
      note: "Saying no, or \"I will call you back\", is always allowed. Nobody at {{firm.name}} is in trouble for checking, even when the request turns out to be real.",
    },
    {
      kind: "contact",
      eyebrow: "Learn · if it already happened",
      heading: "Clicked something? Say so fast. Nobody is blamed.",
      lead: "Everyone gets caught eventually, security people included. What turns a click into a disaster is silence: the hours between the mistake and someone who can fix it finding out. At {{firm.name}}, tell {{firm.contact}} straight away.",
      script: [
        "\"I think I clicked something I should not have, at about ten past nine.\"",
        "\"It was an email from ..., asking me to ...\"",
        "\"I typed in my password\", or \"I did not type anything\".",
        "Then do what they say. Do not try to tidy it up yourself.",
      ],
      note: "Module 8 covers reporting in full. For now: fast and honest beats perfect.",
    },
  ],
  tracks: everyDesk(BLOCK),
};
