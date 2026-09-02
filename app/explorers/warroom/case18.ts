/**
 * Block 4 · Case 018 "The Recruiter" — COORD (veiled) — for THE WAR ROOM runtime.
 *
 * Block 4 = THE LONG GAME. Case 18 = ethics + the recruitment con. Dual-use (the
 * same skill can protect or harm; consent + intent decide), white/grey/black hat,
 * responsible disclosure, the recruiter's manipulation levers (ties to M06), the
 * red flags of a bad "offer", and always: your line + your exit to a trusted
 * adult. Handled abstractly and scam-framed per safeguarding policy. Breadcrumb
 * (5): the recruiter is COORD-linked. Boss "The Offer". Curriculum row M18.
 */

import type { WarCase } from "./case16";

export const case18War: WarCase = {
  id: "explorers-m18",
  caseNumber: "CASE 018",
  title: "The Recruiter",
  actor: "COORD (veiled)",
  accent: "#B98BFF",
  open: [
    "Sensitive one today, Agent, so I want you sharp. You've learned real skills in this programme, and skills are power. Power can protect people, or it can hurt them. The difference is a choice you make.",
    "Out there, some people go looking for talented kids and try to pull that power the wrong way. They call it a recruiter, an offer, a team. It's a con, and it uses the very influence levers you already know.",
    "Seven skills on doing this right, spotting a bad offer, and getting out safely, then a boss and a test. And a promise up front: whenever an offer feels off, the answer is always to tell a trusted adult.",
  ],
  openVoice: ["/audio/wren/m18w-open-1.mp3", "/audio/wren/m18w-open-2.mp3", "/audio/wren/m18w-open-3.mp3"],

  skills: [
    /* 1 · dual-use: consent + intent */
    {
      n: 1,
      title: "Same skill, two paths",
      goal: "A skill can protect or harm. Permission and intent decide which.",
      board: "THE FORK",
      learn: [
        { t: "wren", text: "Start with the big idea, dual-use. The same skill can do good or harm. Knowing how a lock works helps a locksmith help people, and helps a burglar break in. It's not the skill that's good or bad, it's what you do with it. Two things decide which path you're on: permission, do you have the owner's okay, and intent, are you trying to help or to take. Keep those two straight and you'll almost always know the right move.", voice: "/audio/wren/m18w-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "What decides whether using a security skill is okay?",
          options: [
            { label: "Permission from the owner and an intent to help", outcome: "good", then: [{ t: "wren", text: "Exactly. With the owner's permission and the goal of helping, testing a system is a real job people get paid for. Without permission, the same actions are just breaking in. Consent and intent, every time.", voice: "/audio/wren/m18w-s1-ok.mp3" }] },
            { label: "How clever or hard the trick is", outcome: "bad", then: [{ t: "wren", text: "Cleverness doesn't make it right. A brilliant break-in is still a break-in. What matters is permission and intent. Try again.", voice: "/audio/wren/m18w-s1-bad.mp3" }] },
            { label: "Whether you get caught", outcome: "bad", then: [{ t: "wren", text: "Not getting caught doesn't make something okay, it just means you weren't caught. Judge it by permission and intent. Try again.", voice: "/audio/wren/m18w-s1-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 2 · white/grey/black hat (CONNECT scenario -> hat) */
    {
      n: 2,
      title: "White, grey, black",
      goal: "Testing with permission is a job. Without it, it's a crime.",
      board: "THE HATS",
      learn: [
        { t: "wren", text: "People in security talk about hats. A white hat tests systems with permission and reports what they find, that's a real, respected job. A black hat breaks in without permission to steal or damage, that's a crime. And grey hat is the risky middle, poking at systems uninvited even if they mean no harm, which is still against the rules and can get them in serious trouble. Aim to be a white hat, always. Let's sort a few.", voice: "/audio/wren/m18w-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "connect",
          prompt: "Link each person to the hat they're wearing:",
          left: [
            { id: "hired", label: "Hired to test a company's site, reports the bugs" },
            { id: "steal", label: "Breaks into accounts to steal and sell data" },
            { id: "poke", label: "Pokes at a random site uninvited, 'just curious'" },
          ],
          right: [
            { id: "white", label: "White hat, permission and helping" },
            { id: "black", label: "Black hat, no permission, out to harm" },
            { id: "grey", label: "Grey hat, no permission, still against the rules" },
          ],
          pairs: [["hired", "white"], ["steal", "black"], ["poke", "grey"]],
          ok: "That's the map. Permission and intent to help is white hat, a real career. No permission to harm is black hat, a crime. And 'just curious' without permission is grey hat, still off-limits, still risky. When in doubt, get permission or don't touch it.",
          okVoice: "/audio/wren/m18w-s2-ok.mp3",
          bad: "Not quite. The test is permission and intent: hired and helping is white; no permission to harm is black; uninvited 'curiosity' is grey. Try again.",
          badVoice: "/audio/wren/m18w-s2-bad.mp3",
        },
      ],
    },

    /* 3 · responsible disclosure */
    {
      n: 3,
      title: "Found a flaw? Report it",
      goal: "If you spot a weakness, tell the owner. Don't use it, don't post it.",
      board: "RESPONSIBLE DISCLOSURE",
      learn: [
        { t: "wren", text: "Here's what a real good guy does. Say you accidentally notice a weakness, a login that lets you see other people's info, a door left unlocked online. The right move is responsible disclosure: quietly tell the owner or a trusted adult so they can fix it, and don't use it, don't brag about it, don't post it publicly where crooks can grab it. Reporting a flaw makes you the hero. Exploiting it makes you the villain. Same discovery, opposite choice.", voice: "/audio/wren/m18w-s3-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You stumble on a bug that lets you see other students' private grades. What's the right move?",
          options: [
            { label: "Quietly report it to a teacher, and don't look further", outcome: "good", then: [{ t: "wren", text: "That's exactly right, and it's genuinely admirable. You tell someone who can fix it, you don't snoop, you don't share it around. That's responsible disclosure, the mark of a real white hat.", voice: "/audio/wren/m18w-s3-ok.mp3" }] },
            { label: "Look at everyone's grades, it's just sitting there", outcome: "bad", then: [{ t: "wren", text: "A door being open doesn't make walking through it okay. Looking at private data without permission is the wrong side of the line. Report it instead. Try again.", voice: "/audio/wren/m18w-s3-bad.mp3" }] },
            { label: "Post it online so everyone knows", outcome: "bad", then: [{ t: "wren", text: "Posting it publicly hands the flaw to every crook before it's fixed, and hurts the very people whose data is exposed. Report it privately. Try again.", voice: "/audio/wren/m18w-s3-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 4 · the recruiter's levers (CONNECT line -> lever, ties to M06) */
    {
      n: 4,
      title: "The recruiter's levers",
      goal: "A bad recruiter pulls the same influence levers you already know.",
      board: "THE PITCH",
      learn: [
        { t: "wren", text: "Now the con. A bad recruiter, someone trying to pull your skills the wrong way, doesn't say 'come do crime'. They flatter you, they promise easy money, they call it 'just a test', they swear you to secrecy, and they whisper 'us versus them, the rules are for suckers'. Recognise those? They're the exact influence levers you learned earlier, dressed up as an offer. When you feel a lever being pulled, that IS the warning. Let's connect the pitch to the lever.", voice: "/audio/wren/m18w-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "connect",
          prompt: "Link each recruiter line to the lever it's pulling:",
          left: [
            { id: "flat", label: "\"You're clearly the most talented one here.\"" },
            { id: "money", label: "\"Easy money, one quick job, no risk.\"" },
            { id: "secret", label: "\"Don't tell anyone, this is just between us.\"" },
          ],
          right: [
            { id: "ego", label: "Flattery, hooking your ego" },
            { id: "greed", label: "Reward, dangling easy money" },
            { id: "iso", label: "Secrecy, cutting you off from help" },
          ],
          pairs: [["flat", "ego"], ["money", "greed"], ["secret", "iso"]],
          ok: "See it clearly now? Flattery, easy money, secrecy, they're influence levers, the same ones you learned to spot in a scam. A real opportunity doesn't need to butter you up or swear you to silence. When you feel a lever, slow down and tell someone.",
          okVoice: "/audio/wren/m18w-s4-ok.mp3",
          bad: "Not quite. Flattery hooks your ego; 'easy money' is the reward lever; 'tell no one' is the secrecy lever that isolates you. Match them up. Try again.",
          badVoice: "/audio/wren/m18w-s4-bad.mp3",
        },
      ],
    },

    /* 5 · red flags of a bad offer (PIN) */
    {
      n: 5,
      title: "Red flags of a bad offer",
      goal: "Secrecy, pressure, and money for access are the tell-tale signs.",
      board: "RED FLAGS",
      learn: [
        { t: "wren", text: "So how do you spot a bad offer fast? Look for these red flags. It's secret, tell no one. It's urgent, decide right now. It pays you for access or for doing something against the rules. And it needs you to break a rule or hide it from a trusted adult. A real, honest opportunity is the opposite: it's fine in daylight, an adult can know about it, and it never asks you to harm anyone. Let's pin the warning signs.", voice: "/audio/wren/m18w-s5-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE red flags of a bad 'offer':",
          need: 3,
          cards: [
            { label: "\"Keep it secret, tell no adults\"", good: true, sub: "" },
            { label: "\"Decide now, this won't last\"", good: true, sub: "" },
            { label: "\"We'll pay you to get us access\"", good: true, sub: "" },
            { label: "\"You can ask a parent or teacher first\"", good: false, sub: "that's a GOOD sign" },
            { label: "\"Here's exactly who we are and what it's for\"", good: false, sub: "that's a GOOD sign" },
          ],
          ok: "That's the alarm set. Secrecy, pressure, and paying for access or rule-breaking, any one of those means walk away and tell someone. The two you left are actually the signs of an honest offer: it survives daylight and welcomes an adult.",
          okVoice: "/audio/wren/m18w-s5-ok.mp3",
          bad: "Careful, two of those are GOOD signs, an honest offer is happy for an adult to know and tells you exactly who they are. Pin only the warning signs: secrecy, pressure, paying for access.",
          badVoice: "/audio/wren/m18w-s5-bad.mp3",
        },
      ],
    },

    /* 6 · know the recruiter's play (breadcrumb 5) */
    {
      n: 6,
      title: "Know the recruiter's play",
      goal: "Spot talent, flatter, small ask, bigger ask, trapped. Stop at the small ask.",
      board: "THREAT MODEL",
      learn: [
        { t: "wren", text: "See the recruiter's play, five moves, and it's a slow one, that's why it's dangerous. First, spot talent, they find a skilled kid. Second, flatter, make you feel special and understood. Third, the small ask, something tiny and almost harmless. Fourth, the bigger ask, now you've done one, why not more. Fifth, trapped, 'you already helped, you can't back out now'. Here's your power: it all collapses if you refuse the small ask and tell a trusted adult. There's no such thing as too late to stop. Refuse early, and there's nothing to trap you with.", voice: "/audio/wren/m18w-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A 'recruiter' has flattered you and now asks for one tiny favour that breaks a small rule. What stops the whole play?",
          options: [
            { label: "Refuse the small ask and tell a trusted adult", outcome: "good", then: [{ t: "wren", text: "That's the move, and it works every time. The small ask is the hook for the big one. Say no to the first step and tell someone, and the trap has nothing to grip. You're never in too deep to stop.", voice: "/audio/wren/m18w-s6-ok.mp3" }] },
            { label: "Do the tiny favour, it's basically nothing", outcome: "bad", then: [{ t: "wren", text: "The tiny favour is the whole point, it's the first link they use to pull you to bigger ones. Refuse it and tell an adult. Try again.", voice: "/audio/wren/m18w-s6-bad.mp3" }] },
            { label: "Keep it secret and handle it alone", outcome: "bad", then: [{ t: "wren", text: "Secrecy is exactly the trap. The one thing that breaks their play is bringing a trusted adult in. Try again.", voice: "/audio/wren/m18w-s6-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 7 · your line & your exit (PIN) */
    {
      n: 7,
      title: "Your line, your exit",
      goal: "You decide who you are. A real chance survives daylight. Always have an exit.",
      board: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill, and it's the most important in the whole programme. You decide who you are. Your skills are real, and the good path is wide open, ethical hacking is a genuine, respected, well-paid job. So set your line now, before anyone tests it: I don't harm people, I don't do it in secret, and I don't work without permission. And always keep your exit: whenever an offer feels off, you stop, you say no, and you tell a trusted adult. No shame, no 'too late'. That exit is always open.", voice: "/audio/wren/m18w-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE parts of holding your line:",
          need: 3,
          cards: [
            { label: "I don't do it in secret from trusted adults", good: true, sub: "" },
            { label: "I only act with permission, never to harm", good: true, sub: "" },
            { label: "If it feels off, I stop and tell an adult", good: true, sub: "" },
            { label: "Once I've started, I can't back out", good: false, sub: "you always can" },
            { label: "Being clever means the rules don't apply", good: false, sub: "they always do" },
          ],
          ok: "That's your line, and it'll keep you safe and on the right side for the rest of your life. Permission, no harm, no secrets, and an exit that's always open. You're not just skilled now, Agent. You're trustworthy. That's rarer and worth more.",
          okVoice: "/audio/wren/m18w-s7-ok.mp3",
          bad: "Careful, two of those are the LIES a recruiter tells, you can always back out, and cleverness never puts you above the rules. Pin only the true parts of holding your line.",
          badVoice: "/audio/wren/m18w-s7-bad.mp3",
        },
      ],
    },
  ],

  boss: {
    board: "THE OFFER · COORD",
    intro: "This is it, Agent, and it's personal. A slick 'recruiter' has been watching your work and slides into your messages with an offer. It's going to sound flattering and easy. Read the levers, spot the red flags, and find your exit. No hints from me. Remember your line.",
    introVoice: "/audio/wren/m18w-boss-intro.mp3",
    phases: [
      {
        name: "The pitch",
        steps: [
          { t: "note", text: "DM FROM 'THE_ARCHITECT': 'Honestly, you're the most talented one in that little programme. I run a real crew. Easy money, one quick job. Keep it between us, yeah?'" },
          {
            t: "connect",
            prompt: "Before you reply, read the levers. Link each line to what it's pulling:",
            left: [
              { id: "tal", label: "\"Most talented one in that programme\"" },
              { id: "cash", label: "\"Easy money, one quick job\"" },
              { id: "us", label: "\"Keep it between us\"" },
            ],
            right: [
              { id: "ego", label: "Flattery, hooking your ego" },
              { id: "greed", label: "Reward, dangling easy money" },
              { id: "iso", label: "Secrecy, cutting you off from help" },
            ],
            pairs: [["tal", "ego"], ["cash", "greed"], ["us", "iso"]],
          },
          { t: "note", text: "READ: three levers in one message. This is a recruitment pitch, not an opportunity." },
        ],
      },
      {
        name: "The ask escalates",
        steps: [
          { t: "note", text: "THE_ARCHITECT: 'Tiny favour first. Just get me the login for your school portal. Nothing happens to you, promise.'" },
          {
            t: "choose",
            prompt: "There it is, the small ask that breaks a rule. What do you do?",
            options: [
              { label: "Refuse it, and don't do any 'tiny favour' that breaks a rule", outcome: "good" },
              { label: "Hand over the login, it's just one small thing", outcome: "bad", then: [{ t: "note", text: "THE_ARCHITECT: 'Perfect. Now for the real job…' The trap closes." }] },
              { label: "Negotiate a higher price", outcome: "bad", then: [{ t: "note", text: "You're now discussing terms of a crime. Wrong path." }] },
            ],
          },
        ],
      },
      {
        name: "The exit",
        steps: [
          { t: "note", text: "THE_ARCHITECT: 'Don't tell anyone about this chat or you'll be in trouble too.'" },
          {
            t: "choose",
            prompt: "The recruiter tries to trap you with secrecy and fear. What's your exit?",
            options: [
              { label: "Stop, keep the messages, and tell a trusted adult", outcome: "good" },
              { label: "Keep it secret so you don't get in trouble", outcome: "bad", then: [{ t: "note", text: "Secrecy is the trap itself, it keeps you alone with them" }] },
              { label: "Delete everything and hope it goes away", outcome: "bad", then: [{ t: "note", text: "Deleting the evidence helps them, not you. Tell an adult." }] },
            ],
          },
          { t: "note", text: "EXIT TAKEN · chat reported · adult informed · trail preserved · you're safe and clear" },
        ],
      },
    ],
    win: "That's the strongest thing you've done in this whole programme, Agent. A recruiter pulled every lever, flattery, easy money, secrecy, and pushed the classic small-ask trap. And you named every lever, refused the first step, and walked straight out the exit to a trusted adult. Your skills are real, and now everyone can see you can be trusted with them. That's what makes a true white hat. And one more thing: the way that offer was run, the levers, the patience, it matches a hand we've been tracking. COORD. Keep that in mind.",
    winVoice: "/audio/wren/m18w-boss-win.mp3",
  },

  test: {
    intro: "Last thing before I sign this off, the test. Six fresh ones, no hints, and you need five right. Everything about doing this right and getting out safely, put it to work. Ready?",
    introVoice: "/audio/wren/m18w-test-intro.mp3",
    passVoice: "/audio/wren/m18w-test-pass.mp3",
    failVoice: "/audio/wren/m18w-test-fail.mp3",
    pass: 5,
    questions: [
      { scenario: "The same security skill can help or harm.", ask: "What decides which?", options: [{ label: "Permission from the owner and intent to help", correct: true }, { label: "How clever the trick is" }, { label: "Whether you get caught" }] },
      { scenario: "Someone is hired to test a company's site and reports the bugs.", ask: "Which hat is that?", options: [{ label: "White hat, permission and helping", correct: true }, { label: "Black hat" }, { label: "Grey hat" }] },
      { scenario: "You accidentally find a bug exposing others' private data.", ask: "What's the right move?", options: [{ label: "Quietly report it to a trusted adult, don't use it", correct: true }, { label: "Look through everyone's data" }, { label: "Post the bug publicly" }] },
      { scenario: "An offer says 'easy money, tell no one, decide now'.", ask: "What are those?", options: [{ label: "Red flags: reward, secrecy, and pressure", correct: true }, { label: "Signs of a great opportunity" }, { label: "Proof it's safe" }] },
      { scenario: "A recruiter asks for one tiny rule-breaking favour first.", ask: "What stops the whole play?", options: [{ label: "Refuse the small ask and tell a trusted adult", correct: true }, { label: "Do it, it's basically nothing" }, { label: "Keep it secret and handle it alone" }] },
      { scenario: "An offer feels off and you're not sure what to do.", ask: "What's always your exit?", options: [{ label: "Stop, don't act, and tell a trusted adult", correct: true }, { label: "It's too late to back out" }, { label: "Keep it secret to be safe" }] },
    ],
  },

  debrief: {
    title: "The offer, refused.",
    lines: [
      "Seven skills, a real recruitment pitch, and a test, and you walked out clean and trusted.",
      "You learned that skills are dual-use, that the good path is a real career, and that a bad offer runs on the same levers as any scam.",
      "You named the flattery, the easy money and the secrecy, refused the small ask, and took the exit to a trusted adult, every time.",
    ],
    move:
      "This week, decide your line out loud with someone you trust: no harm, no secrets, only with permission. And agree who your trusted adult is, so that if any offer ever feels off, you already know exactly who to tell.",
  },
};
