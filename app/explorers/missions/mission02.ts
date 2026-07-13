/**
 * Mission 02 — "Too Good To Be True" (Block 1: Signals, CONFIDENTIAL).
 * Actor: SIREN ①. TRACE debuts. Map slot: curriculum-map-v1 §M02.
 *
 * Teaching register (ages 10–13): the fishing metaphor carries the whole
 * mission — the prize is the bait, the funnel is the line, the form is
 * the net, and YOU are the catch. Mechanism over slogan: Heroes taught
 * "free currency is a scam"; this teaches how the funnel is built and
 * therefore where to cut it.
 */

import Mission02Incident from "../incidents/Mission02Incident";
import type { MissionManifest } from "../engine/types";

export const mission02: MissionManifest = {
  id: "explorers-m02",
  caseNumber: "CASE 002",
  title: "Too Good To Be True",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "SIREN",
    mo: "Gives to get. Bait first, ask later.",
    portrait: "/explorers/actors/siren.png",
  },

  transmission: {
    headline: "BAIT IN THE WATER",
    lines: [
      "Operative. Half the school is talking about a giveaway — five hundred free skins, today only. The links are everywhere: group chats, stream chats, DMs.",
      "Nobody gives away five hundred of anything. Find out what it costs.",
    ],
  },

  briefing: {
    summary:
      "A prize that finds YOU, in three different places at once, with a clock on it. That's not luck — that's equipment. Someone built this.",
    objectives: [
      "Work out what 'free' is really charging",
      "Follow the trail and prove it's one operation",
      "Find the net and shut the factory down",
    ],
    wrenLine: "Rule of the water, Operative: if you can't spot the catch, you're the catch.",
  },

  cycles: [
    /* ---------------------------------------- cycle 1: the bait */
    {
      id: "bait",
      title: "Read the bait",
      concept: "Free is a price",
      intel: {
        beats: [
          "Think about fishing. The worm is free — to the fish. The fisher isn't being generous; the worm is equipment. It costs less than the fish is worth.",
          "Online prizes work the same way. A stranger 'giving away' skins is fishing. The prize is the worm. The question that breaks the spell is: what do THEY get back?",
        ],
        prediction: {
          question: "Why would a stranger give 500 skins away for nothing?",
          options: [
            "Some people are just generous",
            "They get back something worth more than the prize",
            "Game companies make them do it",
          ],
          answer: 1,
          right: "That's the whole trick. Your password, your account, your phone number — worth more than skins that were never real anyway.",
          wrong: "Kind strangers exist — but they don't need your password. Ask what comes BACK to the giver.",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Evidence 01 — the giveaway post · tap anything that smells like bait",
          device: { app: "CLASS GROUP CHAT", owner: "CAPTURED POST" },
          header: [
            { label: "WHERE:", seg: { id: "where", text: "School group chat · posted by a number nobody knows" } },
            {
              label: "POST:",
              seg: { id: "title", text: "SKINSTORM 500 — FREE SKINS EVENT (TODAY ONLY!)", tellId: "clock" },
            },
          ],
          body: [
            [
              { id: "b1", text: "EVERYONE WINS — first 500 claims get the drop. " },
              { id: "b2", text: "No catch, no cost, 100% real.", tellId: "nocatch" },
            ],
            [
              {
                id: "link",
                text: "[ CLAIM YOURS → skinstorm-event.net/claim ]",
                tellId: "domain",
                mono: true,
              },
            ],
            [{ id: "b3", text: "Winners posted tonight. Good luck!" }],
          ],
          tells: [
            {
              id: "clock",
              label: "The clock",
              why: "“Today only” is the hurry lever — the same pressure PHANTOM HOOK used, wearing a party hat. Real events don't evaporate.",
            },
            {
              id: "nocatch",
              label: "The 'no catch' promise",
              why: "Nobody who ISN'T fishing needs to say 'no catch.' The louder the promise, the bigger the hook.",
            },
            {
              id: "domain",
              label: "The claim link",
              why: "skinstorm-event.net isn't the game's site. Real drops live on the game's own domain — this is a stranger's net.",
            },
          ],
          doneLine: "Three hooks in one post. Somebody's fishing your school.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A stream chat says: “FIRST 100 CLICKS GET A GIFT CARD!” What is the bait's real job?",
            options: [
              "To be generous to fast people",
              "To make you click before you think",
              "To reward loyal viewers",
            ],
            answer: 1,
          },
          {
            id: "c1q2",
            question: "“Everyone who SHARES this wins double!” Why does the scammer want you to share it?",
            options: [
              "So the prize pool gets bigger",
              "Sharing turns YOU into bait for your friends",
              "It's how they count the winners",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ---------------------------------------- cycle 2: the trail */
    {
      id: "trail",
      title: "Follow the trail",
      concept: "One campaign, many costumes",
      intel: {
        beats: [
          "Here's what most people never see: the chat post, the DM, and the website aren't three different things. They're one machine, photographed from three angles.",
          "Analysts prove it with fingerprints — the details a scammer forgets to change: the same weird domain, the same prize name, the same clock. Match the fingerprints and the costumes stop working.",
        ],
        prediction: {
          question: "The same prize turns up in the group chat, a DM, and a website. What's the smartest read?",
          options: [
            "It's popular, so it's probably real",
            "One operation wearing three costumes",
            "Three different scammers had the same idea",
          ],
          answer: 1,
          right: "Exactly. Showing up everywhere at once isn't popularity — it's a campaign. Real things get shared messily; campaigns arrive everywhere, polished, at the same time.",
          wrong: "Being everywhere at once is what CAMPAIGNS do. Real news spreads messily. This arrived everywhere, polished, simultaneously.",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Evidence board — pin every piece that belongs to the SKINSTORM operation",
          fingerprintHint: "same domain, same prize name, same countdown",
          cards: [
            {
              id: "t1",
              surface: "SCHOOL CHAT",
              from: "unknown number",
              text: "SKINSTORM 500 free skins event, today only — skinstorm-event.net",
              inCampaign: true,
              clue: "the domain + the clock",
              order: 1,
            },
            {
              id: "t2",
              surface: "DM",
              from: "@skins_mod_amy",
              text: "hey! you're on the SKINSTORM winner list, claim in 2 hrs → skinstorm-event.net/claim",
              inCampaign: true,
              clue: "same domain, same prize, new costume",
              order: 2,
            },
            {
              id: "d1",
              surface: "SCHOOL CHAT",
              from: "Mr. Ortega",
              text: "Reminder: coding club moved to Thursday this week.",
              inCampaign: false,
            },
            {
              id: "t3",
              surface: "WEB",
              from: "skinstorm-event.net",
              text: "CLAIM FORM — username, password, phone number. 'So we can deliver your skins!'",
              inCampaign: true,
              clue: "the net itself — where every trail ends",
              order: 3,
            },
            {
              id: "d2",
              surface: "DM",
              from: "your friend Leo",
              text: "did you finish the science thing lol",
              inCampaign: false,
            },
            {
              id: "t4",
              surface: "GROUP TEXT",
              from: "unknown number",
              text: "last hours for SKINSTORM!! almost 500 claimed, don't miss out",
              inCampaign: true,
              clue: "the clock again — squeeze harder as the net fills",
              order: 4,
            },
          ],
          stage2Prompt: "Now run it like SIREN does — put the trail in firing order",
          doneLine: "Bait → costume change → the net → the squeeze. You just drew SIREN's assembly line.",
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Which detail PROVES two messages belong to the same operation?",
            options: [
              "They both sound friendly",
              "They both point at the same weird domain",
              "They arrived on the same day",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "Why does the DM come AFTER the chat post in the funnel?",
            options: [
              "DMs are slower to send",
              "The post throws the net wide; the DM reels in whoever looked",
              "Scammers prefer texting at night",
            ],
            answer: 1,
          },
        ],
      },
    },

    /* ---------------------------------------- cycle 3: the net */
    {
      id: "net",
      title: "Study the net",
      concept: "The form is the whole point",
      intel: {
        beats: [
          "Everything so far — the post, the DM, the countdown — existed to get you to one place: the claim form. The form IS the scam. Everything else is decoration.",
          "Read a form like a price tag. Every box is something you pay. Username: who you are. Phone: how to reach you forever. Password: the keys to the whole account. No prize on earth costs your password — because accounts are worth more than prizes.",
        ],
        prediction: {
          question: "The form says it needs your password 'to deliver the skins.' What's it really for?",
          options: [
            "Skins get delivered through your login",
            "The password IS the prize — theirs, not yours",
            "It's to verify your age",
          ],
          answer: 1,
          right: "That's the catch, caught. The whole factory was built to collect that one box.",
          wrong: "No real delivery needs your password — the game already knows who you are when YOU log in. The password box is the entire point of the operation.",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Field decision — Leo is on the claim page RIGHT NOW",
          situation:
            "Your friend Leo has the SKINSTORM form open. He's typed his username and he's about to type his password. He says: “It's only skins, what's the worst that happens?”",
          prompt: "YOUR CALL, OPERATIVE:",
          options: [
            {
              id: "half",
              label: "Tell him to fill it in but use a fake password",
              outcome:
                "Closer — but he's still handing over his username and phone, and he's still on their winner list for the NEXT trick. Half-caught is still caught.",
            },
            {
              id: "worst",
              label: "Answer his question: walk him through what the worst actually is",
              correct: true,
              outcome:
                "That's the analyst move. The worst is: they log in AS him, spend his saved money, message all his friends as bait, and lock him out. Once he can see the price tag, he closes the tab himself. Skills beat warnings.",
            },
            {
              id: "grab",
              label: "Grab the phone and close the tab for him",
              outcome:
                "Tab's closed — but Leo learned nothing, and the next giveaway catches him when you're not there. Protect the person, not just the moment.",
            },
          ],
        },
      },
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Which form box should END the conversation instantly, every time?",
            options: ["Your username", "Your favorite skin", "Your password"],
            answer: 2,
          },
          {
            id: "c3q2",
            question: "You typed your username and phone number before closing the form. Best next move?",
            options: [
              "Nothing — you closed it in time",
              "Tell an adult, and expect scam texts — ignore them when they come",
              "Delete the game to be safe",
            ],
            answer: 1,
          },
        ],
      },
    },
  ],

  incident: {
    title: "The Prize Factory",
    phases: 3,
    component: Mission02Incident,
  },

  debrief: {
    report: [
      "One giveaway, dissected: bait post, costume-change DM, harvest form, countdown squeeze.",
      "The trail proved it: three surfaces, one operation — fingerprints don't lie.",
      "Factory shut at the hub, and the warning that went out had no link and no shame in it.",
    ],
    realWorldMove:
      "This week: when any giveaway finds you, don't touch it — go find IT. Open the game or brand's official site or app yourself and look for the event there. If it's not on their page, it was never real. And no prize, ever, costs a password.",
    wrenLine: "Free bait costs the most. Clean sweep — sign out.",
  },

  voice: {
    transmission: "/audio/wren/m02-transmission.mp3",
    briefing: "/audio/wren/m02-briefing.mp3",
    debrief: "/audio/wren/m02-debrief.mp3",
  },

  dossier: {
    mo: "Gives to get. Prizes, flattery, and a ticking clock — bait first, ask later. Builds factories, not one-off tricks.",
    defeatedBy: "Anyone who asks what the free thing costs — and checks the official page instead of the link that came to them.",
  },
};
