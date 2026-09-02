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
        {
          t: "choose",
          prompt: "The campaign is a chain of five links. To stop the whole thing, how many links do you need to break?",
          options: [
            { label: "Just one, break any single link and the chain fails", outcome: "good", then: [{ t: "wren", text: "Exactly. A chain only works if every link holds. Break recon, or the lure, or access, and the whole campaign collapses. You never have to be perfect at all five.", voice: "/audio/wren/m19w-s1-q2ok.mp3" }] },
            { label: "All five, or the attack keeps going", outcome: "bad", then: [{ t: "wren", text: "Good news, you don't need all five. One broken link stops the chain. Try again.", voice: "/audio/wren/m19w-s1-q2bad.mp3" }] },
            { label: "None, once a campaign starts it can't be stopped", outcome: "bad", then: [{ t: "wren", text: "It can. Break a single stage and the rest can't follow. Try again.", voice: "/audio/wren/m19w-s1-q2bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the THREE that are real links in an attack chain:",
          need: 3,
          cards: [
            { label: "Recon, researching the target", good: true, sub: "" },
            { label: "Access, the actual break-in", good: true, sub: "" },
            { label: "Spread, using you to reach others", good: true, sub: "" },
            { label: "Warranty, they refund your money", good: false, sub: "not a stage" },
            { label: "Applause, they cheer you on", good: false, sub: "not a stage" },
          ],
          ok: "Right. Recon, access and spread are all real links in the chain. Break any one and the campaign stalls.",
          okVoice: "/audio/wren/m19w-s1-q3ok.mp3",
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
        {
          t: "connect",
          prompt: "Link each public detail to what recon learns from it:",
          left: [
            { id: "school", label: "Your school and timetable, posted publicly" },
            { id: "routine", label: "Photos tagged at football every Saturday" },
            { id: "friends", label: "Your friends list is public" },
          ],
          right: [
            { id: "place", label: "Where to find you in person" },
            { id: "when", label: "When you're there, your routine" },
            { id: "who", label: "Who to impersonate to fool you" },
          ],
          pairs: [["school", "place"], ["routine", "when"], ["friends", "who"]],
          ok: "See how ordinary posts become a research file? Each public crumb tells them where you are, when, and who to pretend to be. Less public means weaker recon.",
          okVoice: "/audio/wren/m19w-s2-q2ok.mp3",
        },
        {
          t: "pin",
          prompt: "Pin the TWO habits that give recon LESS to find:",
          need: 2,
          cards: [
            { label: "Set your profile to friends-only", good: true, sub: "" },
            { label: "Keep your school and routine off public posts", good: true, sub: "" },
            { label: "Post your daily schedule for everyone", good: false, sub: "feeds recon" },
            { label: "Make your friends list fully public", good: false, sub: "hands them who to fake" },
          ],
          ok: "Right. A friends-only profile and a quiet routine leave recon with almost nothing to work with.",
          okVoice: "/audio/wren/m19w-s2-q3ok.mp3",
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
        {
          t: "choose",
          prompt: "A message shouts 'ACT NOW or your account is deleted in 10 minutes!' What's the biggest tell it's a lure?",
          options: [
            { label: "The rushed urgency, pushing you to act without thinking", outcome: "good", then: [{ t: "wren", text: "Exactly. Every lure wears a different mask, but they share one goal: make you act fast, before you can think. Slow down and the trick falls apart.", voice: "/audio/wren/m19w-s3-q2ok.mp3" }] },
            { label: "It used your name, so it must be genuine", outcome: "bad", then: [{ t: "wren", text: "A name is easy to find in recon. The real tell is the panic and pressure. Try again.", voice: "/audio/wren/m19w-s3-q2bad.mp3" }] },
            { label: "It arrived first thing in the morning", outcome: "bad", then: [{ t: "wren", text: "The time of day means nothing. The manufactured urgency is the giveaway. Try again.", voice: "/audio/wren/m19w-s3-q2bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the THREE that are common faces of a lure:",
          need: 3,
          cards: [
            { label: "An urgent 'your account is locked' link", good: true, sub: "" },
            { label: "A too-good-to-be-true free prize", good: true, sub: "" },
            { label: "A voice note faked to sound like a friend", good: true, sub: "" },
            { label: "A calm message with no rush and nothing to click", good: false, sub: "not a lure" },
            { label: "A friend saying hello to you in person", good: false, sub: "not a lure" },
          ],
          ok: "Right. Fake urgency, a fake prize, and a faked voice are all lures in disguise. Name the trick and you stay calm.",
          okVoice: "/audio/wren/m19w-s3-q3ok.mp3",
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
        {
          t: "connect",
          prompt: "Link each defence to what it does at the access stage:",
          left: [
            { id: "unique", label: "A different password for every site" },
            { id: "twofa", label: "A second-factor code on your phone" },
            { id: "manager", label: "A password manager" },
          ],
          right: [
            { id: "contain", label: "One leak can't open your other doors" },
            { id: "block", label: "Blocks the login even with the password" },
            { id: "easy", label: "Makes strong, unique passwords easy to keep" },
          ],
          pairs: [["unique", "contain"], ["twofa", "block"], ["manager", "easy"]],
          ok: "That's the access door slammed. Unique passwords contain a leak, two-factor blocks a stolen login, and a manager makes it all painless.",
          okVoice: "/audio/wren/m19w-s4-q2ok.mp3",
        },
        {
          t: "pin",
          prompt: "Pin the TWO habits that slam the access door shut:",
          need: 2,
          cards: [
            { label: "A different password for every account", good: true, sub: "" },
            { label: "Two-factor on your important accounts", good: true, sub: "" },
            { label: "One easy password reused everywhere", good: false, sub: "one leak opens all" },
            { label: "Sharing your password with online friends", good: false, sub: "hands them the key" },
          ],
          ok: "Right. Unique passwords and two-factor are the two habits that stop the break-in cold.",
          okVoice: "/audio/wren/m19w-s4-q3ok.mp3",
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
        {
          t: "connect",
          prompt: "Link each warning sign to the stage it reveals:",
          left: [
            { id: "msgs", label: "Messages you didn't send going to your friends" },
            { id: "money", label: "Money gone that you didn't spend" },
            { id: "login", label: "A login from a country you've never visited" },
          ],
          right: [
            { id: "spread", label: "Spread, your account hitting others" },
            { id: "harvest", label: "Harvest, they took what they came for" },
            { id: "access", label: "Access, someone else got in" },
          ],
          pairs: [["msgs", "spread"], ["money", "harvest"], ["login", "access"]],
          ok: "That's reading the attack live. Odd messages mean spread, missing money means harvest, and a strange login means access. Spot them fast and you cut the damage.",
          okVoice: "/audio/wren/m19w-s5-q2ok.mp3",
        },
        {
          t: "pin",
          prompt: "Pin the THREE signs that harvest or spread may be happening:",
          need: 3,
          cards: [
            { label: "Friends getting links you never sent", good: true, sub: "" },
            { label: "Strange logins on your account", good: true, sub: "" },
            { label: "Purchases you didn't make", good: true, sub: "" },
            { label: "A normal login from your own phone", good: false, sub: "that's just you" },
            { label: "A friend liking your post", good: false, sub: "totally normal" },
          ],
          ok: "Right. Messages you didn't send, strange logins, and purchases you didn't make are all alarms. Catch them early and the mess stays small.",
          okVoice: "/audio/wren/m19w-s5-q3ok.mp3",
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
        {
          t: "choose",
          prompt: "Why stack several layers instead of trusting one great defence?",
          options: [
            { label: "Because you'll slip one day, and another layer catches you", outcome: "good", then: [{ t: "wren", text: "Exactly. Nobody is perfect forever. Layers mean the day you misjudge one thing, the next defence is still standing between you and disaster.", voice: "/audio/wren/m19w-s6-q2ok.mp3" }] },
            { label: "Because one strong wall never fails", outcome: "bad", then: [{ t: "wren", text: "Any single wall can fail. That's the whole reason for layers. Try again.", voice: "/audio/wren/m19w-s6-q2bad.mp3" }] },
            { label: "Because having more passwords is the real goal", outcome: "bad", then: [{ t: "wren", text: "The goal isn't more passwords, it's independent layers that catch different failures. Try again.", voice: "/audio/wren/m19w-s6-q2bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each layer to the failure it catches:",
          left: [
            { id: "twofa", label: "Two-factor" },
            { id: "unique", label: "Unique passwords" },
            { id: "backup", label: "Backups" },
          ],
          right: [
            { id: "stolen", label: "Catches a stolen password" },
            { id: "leak", label: "Keeps one leak from opening everything" },
            { id: "lost", label: "Saves you if data is lost or locked up" },
          ],
          pairs: [["twofa", "stolen"], ["unique", "leak"], ["backup", "lost"]],
          ok: "That's defence in depth. Each layer catches a different failure, so no single slip can take you down.",
          okVoice: "/audio/wren/m19w-s6-q3ok.mp3",
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
        {
          t: "choose",
          prompt: "You realise your account is hacked. What's the very first move?",
          options: [
            { label: "Contain it: log out everywhere and disconnect", outcome: "good", then: [{ t: "wren", text: "Exactly. Contain first, stop the bleeding, then tell an adult and recover. Calm and in order beats panic every time.", voice: "/audio/wren/m19w-s7-q2ok.mp3" }] },
            { label: "Say nothing and hope it quietly passes", outcome: "bad", then: [{ t: "wren", text: "Silence lets it spread and means no help. Contain it, then tell a trusted adult. Try again.", voice: "/audio/wren/m19w-s7-q2bad.mp3" }] },
            { label: "Panic and try ten things all at once", outcome: "bad", then: [{ t: "wren", text: "Panic causes mistakes. Take it in order: contain first. Try again.", voice: "/audio/wren/m19w-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each command step to what it does:",
          left: [
            { id: "contain", label: "Contain" },
            { id: "tell", label: "Tell a trusted adult" },
            { id: "recover", label: "Recover" },
          ],
          right: [
            { id: "stop", label: "Stops the bleeding right now" },
            { id: "help", label: "So you never handle it alone" },
            { id: "fix", label: "Change passwords, restore from backup" },
          ],
          pairs: [["contain", "stop"], ["tell", "help"], ["recover", "fix"]],
          ok: "That's incident command. Contain to stop it, tell an adult so you're not alone, then recover, calm and in order.",
          okVoice: "/audio/wren/m19w-s7-q3ok.mp3",
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
