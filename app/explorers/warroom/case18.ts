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
  accent: "#FF8A3D",
  theme: { backdrop: "crossroads", matrix: ["#FF8A3D", "#FFB988", "#D6601F"], accentHi: "#FFB988" },
  open: [
    "This is a sensitive one today, Agent, so I want you sharp. You've learned real skills in this programme, and skills are power. Power can protect people, or it can hurt them. The difference is a choice you make.",
    "Out there, some people go looking for talented kids, and try to pull that power the wrong way. They call themselves a recruiter or a team, and they call it an offer. It's a con, and it uses the very influence levers you already know.",
    "You'll learn seven skills for doing this right, spotting a bad offer, and getting out safely, then face a boss and a test. And here's a promise up front. Whenever an offer feels off, the answer is always to tell a trusted adult.",
  ],
  openVoice: ["/audio/wren/m18w-open-1.mp3", "/audio/wren/m18w-open-2.mp3", "/audio/wren/m18w-open-3.mp3"],

  skills: [
    /* 1 · dual-use: consent + intent */
    {
      n: 1,
      title: "Same skill, two paths",
      goal: "A skill can protect or harm. Permission and intent decide which.",
      journalNote: "The same key can open your own front door or someone else's. The key doesn't decide right or wrong, permission does. Identical skill, totally different act depending on who said yes. Before using a skill, ask: do I actually have permission here?",
      board: "THE FORK",
      learn: [
        { t: "wren", text: "Start with the big idea, which is dual-use. The same skill can do good or harm. Knowing how a lock works helps a locksmith help people, and helps a burglar break in. It's not the skill that's good or bad. It's what you do with it. Two things decide which path you're on. The first is permission. Do you have the owner's okay? The second is intent. Are you trying to help, or to take? Keep those two straight, and you'll almost always know the right move.", voice: "/audio/wren/m18w-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "What decides whether using a security skill is okay?",
          options: [
            { label: "Permission from the owner and an intent to help", outcome: "good", then: [{ t: "wren", text: "Exactly. With the owner's permission and the goal of helping, testing a system is a real job people get paid for. Without permission, the same actions are just breaking in. It comes down to consent and intent, every time.", voice: "/audio/wren/m18w-s1-ok.mp3" }] },
            { label: "How clever or hard the trick is", outcome: "bad", then: [{ t: "wren", text: "Cleverness doesn't make it right. A brilliant break-in is still a break-in. What matters is permission and intent. Try again.", voice: "/audio/wren/m18w-s1-bad.mp3" }] },
            { label: "Whether you get caught", outcome: "bad", then: [{ t: "wren", text: "Not getting caught doesn't make something okay. It just means you weren't caught. Judge it by permission and intent. Try again.", voice: "/audio/wren/m18w-s1-bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the TWO things that make using a security skill okay:",
          need: 2,
          cards: [
            { label: "You have the owner's permission", good: true, sub: "" },
            { label: "You're trying to help, not take", good: true, sub: "" },
            { label: "The trick was really clever", good: false, sub: "cleverness isn't consent" },
            { label: "Nobody will ever find out", good: false, sub: "secrecy isn't a green light" },
          ],
          ok: "Right. Permission and a helping intent are what make it okay. Being clever or secret has nothing to do with it.",
          okVoice: "/audio/wren/m18w-s1-q2ok.mp3",
        },
        {
          t: "connect",
          prompt: "Link each action to why it lands on the right or wrong side:",
          left: [
            { id: "hired", label: "Testing a site you were hired to check" },
            { id: "sneak", label: "Breaking into an account that isn't yours" },
            { id: "help", label: "Fixing a friend's phone at their request" },
          ],
          right: [
            { id: "perm", label: "Right side: you have permission" },
            { id: "none", label: "Wrong side: no permission at all" },
            { id: "asked", label: "Right side: they asked you to help" },
          ],
          pairs: [["hired", "perm"], ["sneak", "none"], ["help", "asked"]],
          ok: "Exactly. With permission and a helping goal, it's a job. Without them, the same actions are just breaking in.",
          okVoice: "/audio/wren/m18w-s1-q3ok.mp3",
        },
      ],
    },

    /* 2 · white/grey/black hat (CONNECT scenario -> hat) */
    {
      n: 2,
      title: "White, grey, black",
      goal: "Testing with permission is a job. Without it, it's a crime.",
      journalNote: "Testing a lock with the owner's permission is a locksmith; testing the same lock without asking is a burglar practising: same actions, opposite crimes. Permission is the only line between a job and a crime. Always get explicit permission before testing anything, even out of curiosity.",
      board: "THE HATS",
      learn: [
        { t: "wren", text: "People in security talk about hats. A white hat tests systems with permission and reports what they find. That's a real, respected job. A black hat breaks in without permission to steal or damage, and that's a crime. And grey hat is the risky middle. Grey hats poke at systems uninvited, even if they mean no harm, which is still against the rules and can get them in serious trouble. Aim to be a white hat, always. Let's sort a few.", voice: "/audio/wren/m18w-s2-learn.mp3" },
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
          ok: "That's the map. Permission and intent to help is white hat, and that's a real career. No permission and intent to harm is black hat, and that's a crime. And poking around out of curiosity, without permission, is grey hat. It's still off-limits, and still risky. When in doubt, get permission or don't touch it.",
          okVoice: "/audio/wren/m18w-s2-ok.mp3",
          bad: "Not quite. The test is permission and intent. Hired and helping is white. No permission and intent to harm is black. Uninvited curiosity is grey. Try again.",
          badVoice: "/audio/wren/m18w-s2-bad.mp3",
        },
        {
          t: "choose",
          prompt: "Which hat should you always aim to be?",
          options: [
            { label: "White hat: test only with permission, report what you find", outcome: "good", then: [{ t: "wren", text: "Exactly. White hat is the real, respected job. Permission comes first, and you help by reporting flaws. That's the path to aim for.", voice: "/audio/wren/m18w-s2-q2ok.mp3" }] },
            { label: "Grey hat: poke around uninvited if you mean no harm", outcome: "bad", then: [{ t: "wren", text: "Grey hat is still against the rules, even with good intentions, and it can land you in serious trouble. Aim for white hat. Try again.", voice: "/audio/wren/m18w-s2-q2bad.mp3" }] },
            { label: "Black hat: break in and take what you want", outcome: "bad", then: [{ t: "wren", text: "That's a crime, plain and simple. The path to aim for is white hat, which means permission and helping. Try again.", voice: "/audio/wren/m18w-s2-q2bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the TWO things that make someone a white hat:",
          need: 2,
          cards: [
            { label: "They test only with permission", good: true, sub: "" },
            { label: "They report the flaws so they get fixed", good: true, sub: "" },
            { label: "They break in when nobody's looking", good: false, sub: "that's a black hat" },
            { label: "They poke at sites uninvited for fun", good: false, sub: "that's a grey hat" },
          ],
          ok: "Right. Get permission first, then report what you find. That's the white hat, and it's a real career.",
          okVoice: "/audio/wren/m18w-s2-q3ok.mp3",
        },
      ],
    },

    /* 3 · responsible disclosure */
    {
      n: 3,
      title: "Found a flaw? Report it",
      goal: "If you spot a weakness, tell the owner. Don't use it, don't post it.",
      journalNote: "Finding a crack in a wall and fixing it quietly for the owner is helpful; finding it and bragging online is handing burglars a map. Tell the owner, never use it, never post it. If you ever spot a real flaw, report it privately and stop there.",
      board: "RESPONSIBLE DISCLOSURE",
      learn: [
        { t: "wren", text: "Here's what a real good guy does. Say you accidentally notice a weakness, like a login that lets you see other people's info, or a door left unlocked online. The right move is responsible disclosure. Quietly tell the owner or a trusted adult so they can fix it. Don't use it, don't brag about it, and don't post it publicly where crooks can grab it. Reporting a flaw makes you the hero. Exploiting it makes you the villain. It's the same discovery, with the opposite choice.", voice: "/audio/wren/m18w-s3-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You stumble on a bug that lets you see other students' private grades. What's the right move?",
          options: [
            { label: "Quietly report it to a teacher, and don't look further", outcome: "good", then: [{ t: "wren", text: "That's exactly right, and it's genuinely admirable. You tell someone who can fix it, you don't snoop, and you don't share it around. That's responsible disclosure, the mark of a real white hat.", voice: "/audio/wren/m18w-s3-ok.mp3" }] },
            { label: "Look at everyone's grades, it's just sitting there", outcome: "bad", then: [{ t: "wren", text: "A door being open doesn't make walking through it okay. Looking at private data without permission is the wrong side of the line. Report it instead. Try again.", voice: "/audio/wren/m18w-s3-bad.mp3" }] },
            { label: "Post it online so everyone knows", outcome: "bad", then: [{ t: "wren", text: "Posting it publicly hands the flaw to every crook before it's fixed, and hurts the very people whose data is exposed. Report it privately. Try again.", voice: "/audio/wren/m18w-s3-bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the THREE things responsible disclosure means:",
          need: 3,
          cards: [
            { label: "Tell the owner or a trusted adult privately", good: true, sub: "" },
            { label: "Don't use the flaw yourself", good: true, sub: "" },
            { label: "Don't post it publicly", good: true, sub: "" },
            { label: "Brag about it to your friends", good: false, sub: "that spreads it" },
            { label: "Quietly help yourself to the data", good: false, sub: "that's the wrong side" },
          ],
          ok: "That's it. Report it privately, don't use it, and don't post it. It's the same discovery, and the hero's choice.",
          okVoice: "/audio/wren/m18w-s3-q2ok.mp3",
        },
        {
          t: "connect",
          prompt: "Link each choice to what it does:",
          left: [
            { id: "report", label: "Privately report the flaw" },
            { id: "post", label: "Post the flaw online for all to see" },
            { id: "use", label: "Quietly use the flaw yourself" },
          ],
          right: [
            { id: "fix", label: "Gets it fixed, protects people" },
            { id: "crooks", label: "Hands it to crooks before it's fixed" },
            { id: "villain", label: "Makes you the villain" },
          ],
          pairs: [["report", "fix"], ["post", "crooks"], ["use", "villain"]],
          ok: "See the fork? Reporting protects people. Using or posting it hurts them. Report it every time.",
          okVoice: "/audio/wren/m18w-s3-q3ok.mp3",
        },
      ],
    },

    /* 4 · the recruiter's levers (CONNECT line -> lever, ties to M06) */
    {
      n: 4,
      title: "The recruiter's levers",
      goal: "A bad recruiter pulls the same influence levers you already know.",
      journalNote: "A bad recruiter's message is a magic trick stacking misdirections (flattery, free money, secrecy) all at once so you don't notice any one of them. Naming each lever as it lands breaks the spell. Read a suspicious message slowly and name each lever out loud.",
      board: "THE PITCH",
      learn: [
        { t: "wren", text: "Now for the con. A bad recruiter is someone trying to pull your skills the wrong way, and they don't ask you to come and do crime. They flatter you, they promise easy money, and they call it just a test. They swear you to secrecy, and they whisper that it's us versus them, and that the rules are for suckers. Do you recognise those? They're the exact influence levers you learned earlier, dressed up as an offer. When you feel a lever being pulled, that is the warning. Let's connect the pitch to the lever.", voice: "/audio/wren/m18w-s4-learn.mp3" },
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
          ok: "Do you see it clearly now? Flattery, easy money and secrecy are influence levers, the same ones you learned to spot in a scam. A real opportunity doesn't need to butter you up or swear you to silence. When you feel a lever, slow down and tell someone.",
          okVoice: "/audio/wren/m18w-s4-ok.mp3",
          bad: "Not quite. Flattery hooks your ego. Easy money is the reward lever. And asking you to tell no one is the secrecy lever that isolates you. Match them up. Try again.",
          badVoice: "/audio/wren/m18w-s4-bad.mp3",
        },
        {
          t: "choose",
          prompt: "An 'offer' is flattering you and swearing you to secrecy. What does that tell you?",
          options: [
            { label: "Levers are being pulled, so slow down and tell someone", outcome: "good", then: [{ t: "wren", text: "Exactly. Feeling a lever pulled is the warning. A real opportunity doesn't need to butter you up or swear you to silence.", voice: "/audio/wren/m18w-s4-q2ok.mp3" }] },
            { label: "It must be a genuine, special opportunity", outcome: "bad", then: [{ t: "wren", text: "Flattery and secrecy are influence levers, not proof it's real. When you feel them, slow down and tell someone. Try again.", voice: "/audio/wren/m18w-s4-q2bad.mp3" }] },
            { label: "You should keep it secret like they asked", outcome: "bad", then: [{ t: "wren", text: "Secrecy is the lever doing its job, cutting you off from help. The move is to tell a trusted adult. Try again.", voice: "/audio/wren/m18w-s4-q2bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the THREE influence levers a bad recruiter pulls:",
          need: 3,
          cards: [
            { label: "Flattery, making you feel special", good: true, sub: "" },
            { label: "Easy money, dangling a reward", good: true, sub: "" },
            { label: "Secrecy, 'tell no one'", good: true, sub: "" },
            { label: "Telling you to check with a parent", good: false, sub: "that's an honest sign" },
            { label: "Explaining exactly who they are", good: false, sub: "that's an honest sign" },
          ],
          ok: "That's the pitch laid bare. Flattery, easy money and secrecy are the same levers as any scam, dressed up as an offer.",
          okVoice: "/audio/wren/m18w-s4-q3ok.mp3",
        },
      ],
    },

    /* 5 · red flags of a bad offer (PIN) */
    {
      n: 5,
      title: "Red flags of a bad offer",
      goal: "Secrecy, pressure, and money for access are the tell-tale signs.",
      journalNote: "Secrecy, pressure, and money for access are like three alarms going off together. Any one alone might be nothing, but all three at once means get out. They're the tell-tale pattern of a trap. If an offer asks you to keep it quiet AND decide fast, that's your answer.",
      board: "RED FLAGS",
      learn: [
        { t: "wren", text: "So how do you spot a bad offer fast? Look for these red flags. It's secret, and you're told to tell no one. It's urgent, and you have to decide right now. It pays you for access, or for doing something against the rules. And it needs you to break a rule, or hide it from a trusted adult. A real, honest opportunity is the opposite. It's fine in daylight, an adult can know about it, and it never asks you to harm anyone. Let's pin the warning signs.", voice: "/audio/wren/m18w-s5-learn.mp3" },
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
          ok: "That's the alarm set. If you see secrecy, pressure, or payment for access or rule-breaking, any one of those means you walk away and tell someone. The two you left are actually the signs of an honest offer. It survives daylight and welcomes an adult.",
          okVoice: "/audio/wren/m18w-s5-ok.mp3",
          bad: "Careful, two of those are good signs. An honest offer is happy for an adult to know, and tells you exactly who they are. Pin only the warning signs, which are secrecy, pressure, and paying for access.",
          badVoice: "/audio/wren/m18w-s5-bad.mp3",
        },
        {
          t: "choose",
          prompt: "Which message is the RED FLAG, not an honest offer?",
          options: [
            { label: "\"Keep this secret and decide right now\"", outcome: "good", then: [{ t: "wren", text: "Right, that's the red flag. Secrecy plus pressure is the tell. An honest offer is happy to wait and happy for an adult to know.", voice: "/audio/wren/m18w-s5-q2ok.mp3" }] },
            { label: "\"Feel free to ask a parent before you decide\"", outcome: "bad", then: [{ t: "wren", text: "That's actually a good sign, because an honest offer welcomes a trusted adult. Look for the one pushing secrecy and speed. Try again.", voice: "/audio/wren/m18w-s5-q2bad.mp3" }] },
            { label: "\"Here's exactly who we are and what it's for\"", outcome: "bad", then: [{ t: "wren", text: "That's an honest sign, not a red flag. The warning is the message demanding secrecy and a snap decision. Try again.", voice: "/audio/wren/m18w-s5-q2bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each red flag to why it's a warning:",
          left: [
            { id: "secret", label: "\"Tell no adults\"" },
            { id: "now", label: "\"Decide right now\"" },
            { id: "pay", label: "\"We'll pay you for access\"" },
          ],
          right: [
            { id: "iso", label: "Secrecy, to keep you from help" },
            { id: "rush", label: "Pressure, so you can't think it over" },
            { id: "rule", label: "Paying you to break a rule" },
          ],
          pairs: [["secret", "iso"], ["now", "rush"], ["pay", "rule"]],
          ok: "That's the alarm. If there's secrecy, pressure, or money for access, any one of them means you walk away and tell someone.",
          okVoice: "/audio/wren/m18w-s5-q3ok.mp3",
        },
      ],
    },

    /* 6 · know the recruiter's play (breadcrumb 5) */
    {
      n: 6,
      title: "Know the recruiter's play",
      goal: "Spot talent, flatter, small ask, bigger ask, trapped. Stop at the small ask.",
      journalNote: "A recruiter's plan is a staircase with one trick step (spot talent, flatter, ask small, ask bigger, you're trapped), and the whole plan only works if you take that first small step. Refuse the small ask and the staircase goes nowhere. Stop at the very first small, rule-breaking ask, every time.",
      board: "THREAT MODEL",
      learn: [
        { t: "wren", text: "Let's see the recruiter's play. It has five moves, and it's a slow one, which is why it's dangerous. First, they spot talent, and find a skilled kid. Second, they flatter you, and make you feel special and understood. Third comes the small ask, something tiny and almost harmless. Fourth comes the bigger ask. Now that you've done one, why not more? Fifth, you're trapped. They tell you that you already helped, so you can't back out now. Here's your power. It all collapses if you refuse the small ask and tell a trusted adult. There's no such thing as too late to stop. Refuse early, and there's nothing to trap you with.", voice: "/audio/wren/m18w-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A 'recruiter' has flattered you and now asks for one tiny favour that breaks a small rule. What stops the whole play?",
          options: [
            { label: "Refuse the small ask and tell a trusted adult", outcome: "good", then: [{ t: "wren", text: "That's the move, and it works every time. The small ask is the hook for the big one. Say no to the first step and tell someone, and the trap has nothing to grip. You're never in too deep to stop.", voice: "/audio/wren/m18w-s6-ok.mp3" }] },
            { label: "Do the tiny favour, it's basically nothing", outcome: "bad", then: [{ t: "wren", text: "The tiny favour is the whole point. It's the first link they use to pull you towards bigger ones. Refuse it and tell an adult. Try again.", voice: "/audio/wren/m18w-s6-bad.mp3" }] },
            { label: "Keep it secret and handle it alone", outcome: "bad", then: [{ t: "wren", text: "Secrecy is exactly the trap. The one thing that breaks their play is bringing a trusted adult in. Try again.", voice: "/audio/wren/m18w-s6-bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each move of the recruiter's play to what it means:",
          left: [
            { id: "flatter", label: "Flatter" },
            { id: "small", label: "The small ask" },
            { id: "trap", label: "Trapped" },
          ],
          right: [
            { id: "special", label: "Make you feel special" },
            { id: "tiny", label: "A tiny, almost harmless favour" },
            { id: "cant", label: "\"You can't back out now\"" },
          ],
          pairs: [["flatter", "special"], ["small", "tiny"], ["trap", "cant"]],
          ok: "That's the slow play. It only works if you take the small ask, so that's exactly where you refuse.",
          okVoice: "/audio/wren/m18w-s6-q2ok.mp3",
        },
        {
          t: "pin",
          prompt: "Pin the TWO things that break the recruiter's whole play:",
          need: 2,
          cards: [
            { label: "Refuse the small ask", good: true, sub: "" },
            { label: "Tell a trusted adult", good: true, sub: "" },
            { label: "Do the tiny favour just once", good: false, sub: "that's the hook" },
            { label: "Handle it alone and secretly", good: false, sub: "that's the trap" },
          ],
          ok: "Right. Refuse the first step and tell someone, and the trap has nothing to grip. You're never in too deep to stop.",
          okVoice: "/audio/wren/m18w-s6-q3ok.mp3",
        },
      ],
    },

    /* 7 · your line & your exit (PIN) */
    {
      n: 7,
      title: "Your line, your exit",
      goal: "You decide who you are. A real chance survives daylight. Always have an exit.",
      journalNote: "Deciding your line in advance is like agreeing a safe word before a scary movie. You set the rule BEFORE you're under pressure, so panic can't talk you out of it. A real chance always survives daylight and a second look. Decide your no-harm, no-secrets line today, before anyone ever tests it.",
      board: "ACTION PLAN",
      learn: [
        { t: "wren", text: "This is the last skill, and it's the most important in the whole programme. You decide who you are. Your skills are real, and the good path is wide open. Ethical hacking is a genuine, respected, well-paid job. So set your line now, before anyone tests it. Tell yourself this. I don't harm people, I don't do it in secret, and I don't work without permission. And always keep your exit. Whenever an offer feels off, you stop, you say no, and you tell a trusted adult. There's no shame, and it's never too late. That exit is always open.", voice: "/audio/wren/m18w-s7-learn.mp3" },
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
          ok: "That's your line, and it'll keep you safe and on the right side for the rest of your life. It's permission, no harm, no secrets, and an exit that's always open. You're not just skilled now, Agent. You're trustworthy. That's rarer and worth more.",
          okVoice: "/audio/wren/m18w-s7-ok.mp3",
          bad: "Careful, two of those are lies a recruiter tells. The truth is, you can always back out, and cleverness never puts you above the rules. Pin only the true parts of holding your line.",
          badVoice: "/audio/wren/m18w-s7-bad.mp3",
        },
        {
          t: "choose",
          prompt: "An offer suddenly feels off. What's your exit, every time?",
          options: [
            { label: "Stop, say no, and tell a trusted adult", outcome: "good", then: [{ t: "wren", text: "That's the exit, and it's always open. There's no shame, and it's never too late. Stop, say no, and bring in a trusted adult.", voice: "/audio/wren/m18w-s7-q2ok.mp3" }] },
            { label: "Push on because you already started", outcome: "bad", then: [{ t: "wren", text: "You can always back out, and that's the whole point of an exit. Stop and tell an adult. Try again.", voice: "/audio/wren/m18w-s7-q2bad.mp3" }] },
            { label: "Keep it to yourself to stay safe", outcome: "bad", then: [{ t: "wren", text: "Secrecy keeps you alone with them, and that's not safe. Telling a trusted adult is the exit. Try again.", voice: "/audio/wren/m18w-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each part of your line to the recruiter lie it beats:",
          left: [
            { id: "perm", label: "I only act with permission" },
            { id: "open", label: "I don't do it in secret" },
            { id: "exit", label: "If it feels off, I stop and tell an adult" },
          ],
          right: [
            { id: "rules", label: "\"The rules are for suckers\"" },
            { id: "us", label: "\"Keep it between us\"" },
            { id: "late", label: "\"You can't back out now\"" },
          ],
          pairs: [["perm", "rules"], ["open", "us"], ["exit", "late"]],
          ok: "That's your line beating their lies. You chose permission over rule-breaking, daylight over secrecy, and an exit that's always open.",
          okVoice: "/audio/wren/m18w-s7-q3ok.mp3",
        },
      ],
    },
  ],

  boss: {
    board: "THE OFFER · COORD",
    intro: "This is it, Agent, and it's personal. A slick fake recruiter has been watching your work, and now they're in your messages with an offer. It's going to sound flattering and easy. Read the levers, spot the red flags, and find your exit. You'll get no hints from me. Remember your line.",
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
            t: "flip",
            prompt: "Decide, then flip the card to see what THE_ARCHITECT does next.",
            you: {
              kind: "choice",
              label: "THE_ARCHITECT's secrecy trap",
              prompt: "What's your exit?",
              options: [
                { label: "Stop, keep the messages, and tell a trusted adult", outcome: "good" },
                { label: "Keep it secret so you don't get in trouble", outcome: "bad" },
                { label: "Delete everything and hope it goes away", outcome: "bad" },
              ],
            },
            them: {
              label: "THE_ARCHITECT's thread",
              whenGood: "CHAT GONE QUIET · reported, adult informed, trail preserved · THE_ARCHITECT blocked",
              whenBad: "THE_ARCHITECT: 'Perfect. Now for the real job…' · the trap closes",
            },
          },
        ],
      },
    ],
    win: "That's the strongest thing you've done in this whole programme, Agent. A recruiter pulled every lever, from flattery to easy money to secrecy, and pushed the classic small-ask trap. And you named every lever, refused the first step, and walked straight out the exit to a trusted adult. Your skills are real, and now everyone can see you can be trusted with them. That's what makes a true white hat. And there's one more thing. The way that offer was run, with the levers and the patience, matches a hand we've been tracking. That hand belongs to COORD. Keep that in mind.",
    winVoice: "/audio/wren/m18w-boss-win.mp3",
  },

  test: {
    intro: "There's one last thing before I sign this off, and that's the test. The scenarios are all fresh, there are no hints, and you'll need a clear pass. Put everything you know about doing this right and getting out safely to work. Ready?",
    introVoice: "/audio/wren/m18w-test-intro.mp3",
    passVoice: "/audio/wren/m18w-test-pass.mp3",
    failVoice: "/audio/wren/m18w-test-fail.mp3",
    pass: 11,
    questions: [
      { scenario: "The same security skill can help or harm.", ask: "What decides which?", options: [{ label: "Permission from the owner and an intent to help", correct: true }, { label: "How clever and how hard the trick itself is" }, { label: "Whether anyone finds out and reports you for it" }], why: { ask: "Why does that matter even when the technique used is identical either way?", options: [{ label: "Because the same act is a job with permission, and a crime without it", correct: true }, { label: "Because harmless tricks never need permission, and this one is harmless" }, { label: "Because it only counts as wrong if you're caught, and you might not be" }] } },
      { scenario: "A friend dares you to guess your way into his sister's account, just for a laugh.", ask: "Is doing it okay?", options: [{ label: "Yes, if you're skilled enough to manage it" }, { label: "Yes, as long as you don't change anything" }, { label: "No, his sister never gave you permission", correct: true }] },
      { scenario: "Someone is hired to test a company's site and reports the bugs.", ask: "Which hat is that?", options: [{ label: "White hat, permission and helping", correct: true }, { label: "Black hat, out to harm and steal data" }, { label: "Grey hat, curious and testing for fun" }], why: { ask: "What's the one thing that actually makes this white hat, not the skill itself?", options: [{ label: "They had permission to test it", correct: true }, { label: "They found a real, serious bug" }, { label: "They were paid well for doing it" }] } },
      { scenario: "You test the wifi security of a cafe you're sitting in, without asking the owner, just to see if you can.", ask: "Which hat are you wearing?", options: [{ label: "White hat, since nothing was actually broken" }, { label: "Grey hat, no permission, still not allowed", correct: true }, { label: "No hat at all, since a cafe is a public place" }], why: { ask: "Testing without permission is still against the rules even if nothing broke. Why?", options: [{ label: "Because permission, not the outcome, makes it allowed", correct: true }, { label: "Because wifi networks, unlike websites, can never be tested" }, { label: "Because you might, by accident, have broken something" }] } },
      { scenario: "You accidentally find a bug exposing others' private data.", ask: "What's the right move?", options: [{ label: "Quietly tell a trusted adult, never use it", correct: true }, { label: "Quietly look through everyone else's private data" }, { label: "Post it online, so everyone is warned about it" }] },
      { scenario: "You notice the school library site lets you change other students' book loans.", ask: "What does responsible disclosure mean here?", options: [{ label: "Change a few loans to prove the bug is real" }, { label: "Post the trick online, so it gets fixed fast" }, { label: "Tell a librarian privately, change nothing", correct: true }] },
      { scenario: "A stranger online says, \"You're way too talented for that little programme, come join my real crew.\"", ask: "Which lever is that?", options: [{ label: "Flattery, hooking your ego", correct: true }, { label: "Pressure, rushing you" }, { label: "A compliment, nothing more to it" }] },
      { scenario: "The same stranger adds, \"Don't mention this to your parents, they wouldn't understand.\"", ask: "What is that line doing?", options: [{ label: "Privacy, respecting your space" }, { label: "Secrecy, cutting you off from help", correct: true }, { label: "Kindness, sparing your parents the worry" }], why: { ask: "Why is being told to keep a secret from the people who'd help you one of the biggest warning signs?", options: [{ label: "Because it cuts you off from the adults who'd stop it", correct: true }, { label: "Because every secret you ever keep is automatically bad" }, { label: "Because parents always say no to anything new online" }] } },
      { scenario: "An offer says 'easy money, tell no one, decide now'.", ask: "What are those?", options: [{ label: "Red flags, the signs of a bad offer", correct: true }, { label: "Good signs, a genuinely great chance" }, { label: "Safe signs, proof it's all above board" }], why: { ask: "Why do these three red flags matter more together than any single one on its own?", options: [{ label: "Because together they rush you before you can think it over", correct: true }, { label: "Because having three reasons always beats having just one" }, { label: "Because any single one of them alone is completely harmless" }] } },
      { scenario: "Two offers arrive. One says \"ask a parent first, here's exactly who we are.\" The other says \"decide within the hour, and keep it quiet.\"", ask: "Which one is the honest offer?", options: [{ label: "The second, it's fast and real chances never wait" }, { label: "The first, it welcomes an adult and says who they are", correct: true }, { label: "Neither one, since no offer can ever truly be trusted" }] },
      { scenario: "A recruiter asks for one tiny rule-breaking favour first.", ask: "What stops the whole play?", options: [{ label: "Refuse the small ask and tell a trusted adult", correct: true }, { label: "Do the favour, it's tiny and basically nothing" }, { label: "Keep it secret and sort it out on your own" }] },
      { scenario: "A recruiter says, \"You already did one small favour, so now you can't stop.\"", ask: "Is that true?", options: [{ label: "Yes, you started it and now there's no way back" }, { label: "Yes, but only once they've paid you for the favour" }, { label: "No, you can always stop and tell a trusted adult", correct: true }] },
      { scenario: "An offer feels off and you're not sure what to do.", ask: "What's always your exit?", options: [{ label: "Stop, don't act, and tell a trusted adult", correct: true }, { label: "Push on, you've started and it's too late" }, { label: "Stay quiet, and keep yourself out of trouble" }] },
      { scenario: "Before anyone ever makes you an offer, you decide your line in advance.", ask: "What three parts should that line have?", options: [{ label: "Be clever, be fast, and never let them catch you" }, { label: "No harm, no secrets, and only with permission", correct: true }, { label: "Be helpful, be loyal, and keep their secrets" }] },
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
