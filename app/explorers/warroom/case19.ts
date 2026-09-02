/**
 * Block 4 · Case 019 "Static Rising" — the whole field — for THE WAR ROOM runtime.
 *
 * Block 4 = THE LONG GAME. Case 19 = synthesis: attacks aren't one trick, they're
 * a CAMPAIGN of stages (recon -> lure -> access -> harvest -> spread). You learn
 * to read the chain, break it at any link, stack defence in depth (no single point
 * of failure), and run incident command when something gets through. Signature
 * mechanic: CONNECT (alert -> stage, weakness -> defence layer) + PIN. Boss "All
 * Frequencies": you're incident commander on a coordinated multi-stage attack.
 * PHANTOM HOOK leads point to one coordinating hand. Curriculum row M19.
 */

import type { WarCase } from "./case16";

export const case19War: WarCase = {
  id: "explorers-m19",
  caseNumber: "CASE 019",
  title: "Static Rising",
  actor: "ALL FREQUENCIES",
  accent: "#B98BFF",
  open: [
    "This is a big one, Agent. Until now you've faced one attacker at a time. Real trouble doesn't work like that. A serious attack is a campaign, a chain of stages, run patiently, often by a whole crew.",
    "The board's lighting up on every frequency at once: research, bait, break-in, theft, spread. Your job today is to see the whole chain, not one alert, and learn where to cut it.",
    "Seven skills to read a campaign, stack your defences in layers, and take command when something slips through, then a boss and a test. Let's put the whole programme together.",
  ],
  openVoice: ["/audio/wren/m19w-open-1.mp3", "/audio/wren/m19w-open-2.mp3", "/audio/wren/m19w-open-3.mp3"],

  skills: [
    /* 1 · a campaign is a chain (CONNECT stages in order) */
    {
      n: 1,
      title: "An attack is a chain",
      goal: "Serious attacks run in stages. See the chain and you can break it.",
      board: "THE KILL CHAIN",
      learn: [
        { t: "wren", text: "First, the big shift. A real attack isn't one trick, it's a chain of stages, each one setting up the next. Roughly: recon, they research the target. Lure, they bait you in. Access, they get in. Harvest, they take what they came for. Spread, they use you to reach others. Here's the gift in that: a chain has links, and you only have to break ONE. Stop any single stage and the whole campaign fails. Let's put the stages in order.", voice: "/audio/wren/m19w-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "connect",
          prompt: "Link each stage to what happens in it:",
          left: [
            { id: "recon", label: "Recon" },
            { id: "lure", label: "Lure" },
            { id: "harvest", label: "Harvest" },
          ],
          right: [
            { id: "research", label: "They research you and your habits" },
            { id: "bait", label: "They send the bait to get you to act" },
            { id: "take", label: "They take the data or money they came for" },
          ],
          pairs: [["recon", "research"], ["lure", "bait"], ["harvest", "take"]],
          ok: "That's the chain: recon, lure, access, harvest, spread. Each link depends on the one before it. And that's your advantage, you don't have to be perfect at every stage, you just have to break one link to stop the whole thing.",
          okVoice: "/audio/wren/m19w-s1-ok.mp3",
          bad: "Not quite. Recon is the research, the lure is the bait that gets you to act, and the harvest is when they take what they came for. Match them up. Try again.",
          badVoice: "/audio/wren/m19w-s1-bad.mp3",
        },
      ],
    },

    /* 2 · recon */
    {
      n: 2,
      title: "Stage one: recon",
      goal: "They research you first. A small footprint gives them less to use.",
      board: "STAGE · RECON",
      learn: [
        { t: "wren", text: "Stage one, recon. Before a good attacker sends a single message, they study you, your posts, your school, your friends, your routine, all those data crumbs from earlier cases. Why? So the bait can be personal and believable. 'Hi from your football coach about Saturday' works far better than 'Dear user'. Your defence at this stage is the smaller footprint you already learned: less public data means weaker, more generic bait. Recon is where you starve them first.", voice: "/audio/wren/m19w-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Attackers do recon before striking. How do you weaken their recon?",
          options: [
            { label: "Keep a small public footprint, less data to research", outcome: "good", then: [{ t: "wren", text: "Exactly, and it ties the whole programme together. The less you leave public, the more generic and easy-to-spot their bait has to be. A locked-down footprint makes stage one fail before it starts.", voice: "/audio/wren/m19w-s2-ok.mp3" }] },
            { label: "Post more so they get confused by all of it", outcome: "bad", then: [{ t: "wren", text: "More data doesn't confuse them, it feeds them. It makes the bait more personal and convincing. Shrink the footprint instead. Try again.", voice: "/audio/wren/m19w-s2-bad.mp3" }] },
            { label: "Nothing, recon can't be stopped", outcome: "bad", then: [{ t: "wren", text: "You can absolutely weaken it, by giving them less to find. A small footprint is a real defence. Try again.", voice: "/audio/wren/m19w-s2-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 3 · lure (CONNECT lure -> actor) */
    {
      n: 3,
      title: "Stage two: the lure",
      goal: "The bait wears many faces. Recognise the trick behind each one.",
      board: "STAGE · LURE",
      learn: [
        { t: "wren", text: "Stage two, the lure, the bait that gets you to click, tell, or install. You've met all its faces already. An urgent 'your account is locked' link, that's phishing. A too-good free prize, that's a scam hook. A cloned voice or fake video, that's synthetic media. A flattering offer, that's recruitment. Different masks, same goal: get you to act fast without thinking. Naming the trick behind the bait is how you stay calm. Let's match a few lures to the play behind them.", voice: "/audio/wren/m19w-s3-learn.mp3" },
      ],
      practice: [
        {
          t: "connect",
          prompt: "Link each lure to the play behind it:",
          left: [
            { id: "lock", label: "\"Your account is locked, click to fix\"" },
            { id: "voice", label: "A voice note that sounds just like your friend" },
            { id: "prize", label: "\"You won! Just pay a small fee to claim\"" },
          ],
          right: [
            { id: "phish", label: "Phishing, fake urgency to grab a login" },
            { id: "synth", label: "Synthetic media, a faked voice" },
            { id: "scam", label: "Advance-fee scam, pay-to-win-nothing" },
          ],
          pairs: [["lock", "phish"], ["voice", "synth"], ["prize", "scam"]],
          ok: "Nicely read. Fake urgency is phishing; a too-perfect voice is synthetic media; 'pay a fee to claim your prize' is the oldest scam there is. The lure changes clothes, but you know every one of them by name now.",
          okVoice: "/audio/wren/m19w-s3-ok.mp3",
          bad: "Not quite. A fake-urgent login link is phishing; a suspiciously perfect voice is synthetic media; 'pay to claim your prize' is an advance-fee scam. Match them up. Try again.",
          badVoice: "/audio/wren/m19w-s3-bad.mp3",
        },
      ],
    },

    /* 4 · access */
    {
      n: 4,
      title: "Stage three: access",
      goal: "The break-in. Strong, unique logins and a second factor slam this door.",
      board: "STAGE · ACCESS",
      learn: [
        { t: "wren", text: "Stage three, access, the actual break-in. If the lure works and you hand over a password or run their file, they're in. This is exactly why the basics matter so much: a strong, unique password means one stolen login doesn't open your other doors, and a second factor, that code on your phone, stops them even if they have your password. Access is the stage where your everyday habits do the heavy lifting. Boring defences, huge payoff.", voice: "/audio/wren/m19w-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "An attacker has phished one of your passwords. What stops them getting in?",
          options: [
            { label: "A second factor, plus that password being unique to one site", outcome: "good", then: [{ t: "wren", text: "Exactly. Two-factor blocks them even with the password, and because you never reuse it, that one leak can't open your other accounts. The access stage dies on your boring, brilliant basics.", voice: "/audio/wren/m19w-s4-ok.mp3" }] },
            { label: "Nothing, one password lost means everything lost", outcome: "bad", then: [{ t: "wren", text: "Not if you use unique passwords and two-factor. Then one leak stays small and the login still fails. Try again.", voice: "/audio/wren/m19w-s4-bad.mp3" }] },
            { label: "Reusing that password everywhere for convenience", outcome: "bad", then: [{ t: "wren", text: "That's the opposite of a defence, one leak would then open everything. Unique passwords and two-factor are the fix. Try again.", voice: "/audio/wren/m19w-s4-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 5 · harvest & spread */
    {
      n: 5,
      title: "Stage four: harvest & spread",
      goal: "They steal, then pivot to your contacts. Spotting it fast limits the damage.",
      board: "STAGE · HARVEST",
      learn: [
        { t: "wren", text: "Stage four and five, harvest and spread. Once in, they grab what they want, data, money, files, then they pivot: they use your account to hit your friends, because a message from you is trusted. This is why noticing fast matters so much. Strange logins, messages you didn't send, money you didn't spend, those are harvest-and-spread in progress. Catching it early is the difference between a small mess and a disaster that rolls through everyone you know.", voice: "/audio/wren/m19w-s5-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Friends say they got weird links 'from you' that you never sent. What's happening, and what matters most?",
          options: [
            { label: "Spread stage, act fast to contain it before it reaches more people", outcome: "good", then: [{ t: "wren", text: "Right. Your account is being used to spread the attack, and speed is everything now. The faster you notice and act, the fewer of your friends get pulled in. Early spotting shrinks the damage.", voice: "/audio/wren/m19w-s5-ok.mp3" }] },
            { label: "Ignore it, it's their problem now", outcome: "bad", then: [{ t: "wren", text: "It's very much your problem, your account is the source, and every minute it spreads further. Act fast to contain it. Try again.", voice: "/audio/wren/m19w-s5-bad.mp3" }] },
            { label: "Wait a few days to see if it stops", outcome: "bad", then: [{ t: "wren", text: "Waiting is exactly what lets it roll through your contacts. The spread stage rewards speed, move now. Try again.", voice: "/audio/wren/m19w-s5-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 6 · defence in depth (PIN the layers) */
    {
      n: 6,
      title: "Defence in depth",
      goal: "Stack layers so no single mistake is fatal. No one point of failure.",
      board: "THE LAYERS",
      learn: [
        { t: "wren", text: "Here's the master idea, defence in depth. You will never be perfect, you'll misjudge a message one day, everyone does. So the goal isn't a single perfect wall, it's LAYERS, so that when one fails, another catches you. Skepticism catches most lures. Unique passwords limit a leak. Two-factor blocks a stolen password. Updates close known holes. Backups mean even a disaster isn't the end. No single point of failure, that's how pros stay safe. Let's pin the layers.", voice: "/audio/wren/m19w-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE that add real defensive LAYERS:",
          need: 3,
          cards: [
            { label: "Turn on two-factor on important accounts", good: true, sub: "" },
            { label: "Keep devices and apps updated", good: true, sub: "" },
            { label: "Back up what you can't lose", good: true, sub: "" },
            { label: "Rely on one perfect password for everything", good: false, sub: "single point of failure" },
            { label: "Assume you'll never be fooled", good: false, sub: "everyone slips once" },
          ],
          ok: "That's depth. Two-factor, updates, and backups each catch a different failure, so no single slip is fatal. The two you left are the trap: one master password and 'I'll never be fooled' are single points of failure. Layers beat walls.",
          okVoice: "/audio/wren/m19w-s6-ok.mp3",
          bad: "Careful, two of those are single points of failure, one password for everything, and assuming you'll never slip. Pin the moves that add independent layers: two-factor, updates, backups.",
          badVoice: "/audio/wren/m19w-s6-bad.mp3",
        },
      ],
    },

    /* 7 · incident command (PIN) */
    {
      n: 7,
      title: "Take command",
      goal: "When something gets through: contain, tell an adult, recover, report. In order.",
      board: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill, and it's about the moment it goes wrong, because sometimes it will. Don't panic, take command. There's an order that works: contain first, disconnect, log out everywhere, stop the bleeding. Tell a trusted adult straight away, you don't handle a real incident alone. Recover, change passwords from a clean device, restore from backup. And report it, to the platform, and to a grown-up who can escalate. Calm, in order, not alone. That's incident command, and it turns a disaster into a bad afternoon.", voice: "/audio/wren/m19w-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE first moves of taking command when you're hacked:",
          need: 3,
          cards: [
            { label: "Contain it, log out everywhere, disconnect", good: true, sub: "" },
            { label: "Tell a trusted adult right away", good: true, sub: "" },
            { label: "Change passwords from a clean device", good: true, sub: "" },
            { label: "Keep it secret so nobody knows", good: false, sub: "you need help" },
            { label: "Panic and do everything at once", good: false, sub: "calm and in order" },
          ],
          ok: "That's command. Contain, tell an adult, recover, calm and in order, not alone and not in secret. The two you left are what makes incidents worse: hiding it, and panicking. You just turned a nightmare into a checklist.",
          okVoice: "/audio/wren/m19w-s7-ok.mp3",
          bad: "Careful, two of those make it worse, keeping it secret means no help, and panicking means mistakes. Pin the calm, in-order moves: contain, tell an adult, recover.",
          badVoice: "/audio/wren/m19w-s7-bad.mp3",
        },
      ],
    },
  ],

  boss: {
    board: "ALL FREQUENCIES · COORDINATED",
    intro: "This is the big one, Agent. Every frequency is lighting up at once, a coordinated campaign hitting you and your friends across all five stages. You're not just a target now, you're incident commander. Read each alert for its stage, apply the right layer, and command the response. No hints from me. Stay calm. Break the chain.",
    introVoice: "/audio/wren/m19w-boss-intro.mp3",
    phases: [
      {
        name: "Name the stage",
        steps: [
          { t: "note", text: "INCOMING · three alerts at once, all part of one campaign" },
          {
            t: "connect",
            prompt: "Triage. Link each alert to the campaign stage it belongs to:",
            left: [
              { id: "dig", label: "A stranger has been liking and screenshotting your old posts" },
              { id: "dm", label: "An urgent DM: 'verify your account or lose it, click here'" },
              { id: "send", label: "Friends got scam links 'from your account'" },
            ],
            right: [
              { id: "recon", label: "Recon, researching you" },
              { id: "lure", label: "Lure, the bait to get you to act" },
              { id: "spread", label: "Spread, using you to hit others" },
            ],
            pairs: [["dig", "recon"], ["dm", "lure"], ["send", "spread"]],
          },
          { t: "note", text: "TRIAGE DONE · recon, lure, and spread all active. One coordinated hand." },
        ],
      },
      {
        name: "Apply the layers",
        steps: [
          {
            t: "connect",
            prompt: "Now defend. Link each threat to the layer that stops it:",
            left: [
              { id: "recon", label: "They're researching your public data" },
              { id: "phish", label: "The phishing link wants your password" },
              { id: "steal", label: "One password may already be leaked" },
            ],
            right: [
              { id: "foot", label: "Shrink your public footprint" },
              { id: "skept", label: "Don't click, verify through the real app" },
              { id: "twofa", label: "Two-factor blocks a stolen password" },
            ],
            pairs: [["recon", "foot"], ["phish", "skept"], ["steal", "twofa"]],
          },
          { t: "note", text: "LAYERS UP · footprint shrunk · link refused · two-factor holding. The chain is breaking." },
        ],
      },
      {
        name: "Command the response",
        steps: [
          { t: "note", text: "One account did get compromised and is spreading. You're in command." },
          {
            t: "choose",
            prompt: "What's the right FIRST move as incident commander?",
            options: [
              { label: "Contain it, tell a trusted adult, then recover, calm and in order", outcome: "good" },
              { label: "Try to fix everything yourself in secret", outcome: "bad", then: [{ t: "note", text: "Alone and hidden, the spread keeps rolling. Wrong call." }] },
              { label: "Panic and change nothing", outcome: "bad", then: [{ t: "note", text: "Frozen, the campaign runs its course. Take command instead." }] },
            ],
          },
          { t: "note", text: "CONTAINED · adult informed · passwords rotated · report filed · campaign stopped" },
        ],
      },
    ],
    win: "Outstanding command, Agent. A coordinated campaign came at you on every frequency at once, recon, lure, access, harvest, spread, and you didn't flinch. You named each stage, stacked your layers, broke the chain, and when one link got through, you took command, calmly, in order, and not alone. That's the whole programme working as one. One last thing: the timing, the patience, the way all five frequencies moved together, that's not five separate crooks. That's one hand conducting them. We've seen its fingerprint before. COORD. Case twenty, we find out who.",
    winVoice: "/audio/wren/m19w-boss-win.mp3",
  },

  test: {
    intro: "Last thing before I sign this off, the test. Six fresh ones, no hints, and you need five right. The whole campaign, start to finish, put it to work. Ready?",
    introVoice: "/audio/wren/m19w-test-intro.mp3",
    passVoice: "/audio/wren/m19w-test-pass.mp3",
    failVoice: "/audio/wren/m19w-test-fail.mp3",
    pass: 5,
    questions: [
      { scenario: "A serious attack runs recon, lure, access, harvest, spread.", ask: "What's your big advantage?", options: [{ label: "You only need to break one link to stop it", correct: true }, { label: "You must be perfect at every stage" }, { label: "Nothing can be done" }] },
      { scenario: "Attackers research a target before striking.", ask: "How do you weaken their recon?", options: [{ label: "Keep a small public footprint", correct: true }, { label: "Post much more to confuse them" }, { label: "Recon can't be weakened" }] },
      { scenario: "A phishing link has stolen one of your passwords.", ask: "What still stops the break-in?", options: [{ label: "Two-factor, plus that password being unique", correct: true }, { label: "Reusing it everywhere" }, { label: "Nothing, it's over" }] },
      { scenario: "Friends get scam links 'from you' that you never sent.", ask: "What matters most?", options: [{ label: "Act fast to contain the spread", correct: true }, { label: "Ignore it, not your problem" }, { label: "Wait a few days" }] },
      { scenario: "You want no single mistake to be fatal.", ask: "What is defence in depth?", options: [{ label: "Stacking layers so one failure is caught by another", correct: true }, { label: "One perfect password for everything" }, { label: "Assuming you'll never be fooled" }] },
      { scenario: "An account gets hacked and is spreading to others.", ask: "What's the right first response?", options: [{ label: "Contain, tell a trusted adult, recover, in order", correct: true }, { label: "Fix it alone in secret" }, { label: "Panic and change nothing" }] },
    ],
  },

  debrief: {
    title: "The whole chain, broken.",
    lines: [
      "Seven skills, a coordinated campaign, and a test, and you commanded the whole thing without panic.",
      "You learned that attacks are chains you can break at any link, that defences work in layers, and that when it goes wrong you take command, calm and not alone.",
      "You read every stage, from recon to spread, stacked your layers, and turned a five-frequency assault into a checklist.",
    ],
    move:
      "This week, add one real layer: turn on two-factor for your most important account, or make a backup of something you'd hate to lose. And agree your incident plan with a trusted adult, so if it ever goes wrong, you already know the first three moves.",
  },
};
