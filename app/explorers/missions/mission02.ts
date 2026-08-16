/**
 * Mission 02 — "Bait & Switch" (Block 1: Signals, CONFIDENTIAL).
 * Actor: SIREN. Gold-standard pass (base = Mission 01): child-first wording,
 * SORT debuts in cycle 1, voiced + hinted predictions, slowed WREN voice.
 *
 * Teaching register (ages 10-13): the fishing metaphor carries the mission.
 * The prize is the bait, the funnel is the line, the form is the net, and
 * YOU are the catch. Plain words over clever ones.
 */

import Mission02Incident from "../incidents/Mission02Incident";
import type { MissionManifest } from "../engine/types";

export const mission02: MissionManifest = {
  id: "explorers-m02",
  caseNumber: "CASE 002",
  title: "Bait & Switch",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "SIREN",
    mo: "Gives to get. Gifts, flattery, and 'you're the special one,' then the ask.",
    portrait: "/explorers/actors/siren.png",
  },

  hook: "Half your school just got told they were 'specially chosen.' Same message, every single one of them. Let's spoil the surprise.",
  scene: "/explorers/scenes/m02-cold-open.jpg",

  transmission: {
    headline: "BAIT IN THE WATER",
    lines: [
      "Agent, half the school is buzzing. Five hundred free skins, today only, and every kid swears THEY got picked.",
      "Here's the thing. Nobody gives away five hundred of anything for free. Somebody is collecting something.",
      "Let's find out what 'free' is really charging, and catch the person behind it.",
    ],
  },

  briefing: {
    summary:
      "It's one prize, popping up in three places at once, wrapped like it's just for you, with a clock ticking on it. That's not luck, and it's not a gift. Somebody built it to collect.",
    objectives: [
      "Work out what 'free' is really charging",
      "Prove the messages all come from one scammer",
      "Find the form and shut it down",
    ],
    wrenLine: "One rule today, Agent. If you can't spot the trap, you're the one caught in it. Ready?",
  },

  cycles: [
    /* ---------------------------------------- cycle 1: the bait (SORT) */
    {
      id: "bait",
      title: "Read the bait",
      concept: "Free is a price",
      promise: "You'll learn why 'free' online usually isn't.",
      instruction: "Sort each message: is it a hook, or just normal?",
      intel: {
        beats: [
          "Picture a fishing hook. That juicy worm is totally free, if you're the fish.",
          "The fisher isn't being kind. The worm is just there to catch you.",
          "SIREN's prizes work the exact same way. The prize is the worm.",
          "One question breaks the spell. What does she get back?",
        ],
        beatAudio: [
          "/audio/wren/m02-c1-b1.mp3",
          "/audio/wren/m02-c1-b2.mp3",
          "/audio/wren/m02-c1-b3.mp3",
          "/audio/wren/m02-c1-b4.mp3",
        ],
        prediction: {
          question: "Why would a stranger give 500 skins away for nothing?",
          options: [
            "Some people are just generous",
            "They get back something worth more than the prize",
            "Game companies make them do it",
          ],
          answer: 1,
          right: "Exactly. What you type in, your password, is worth way more to them than a few skins.",
          wrong: "Kind people are real, but they don't need your password. Ask what comes BACK to the person giving it away.",
          hint: "Nobody runs a shop that only gives things away. So what are they quietly collecting?",
        },
        predictionAudio: {
          question: "/audio/wren/m02-c1-q.mp3",
          right: "/audio/wren/m02-c1-qr.mp3",
          wrong: "/audio/wren/m02-c1-qw.mp3",
        },
      },
      fieldwork: {
        verb: "SORT",
        payload: {
          intro: "Messages flying around your school. Sort each one.",
          buckets: [
            { id: "hook", label: "That's a hook", hint: "bait or pressure" },
            { id: "fine", label: "Just normal", hint: "nothing to claim" },
          ],
          items: [
            {
              id: "s1",
              label: "“Today only! First 500 claim the drop.”",
              bucket: "hook",
              why: "A real event doesn't vanish by tonight. That clock is only there to make you rush.",
            },
            {
              id: "s2",
              label: "“No catch, no cost, pinky promise!”",
              bucket: "hook",
              why: "Nobody who isn't fishing needs to swear there's no catch. The louder the promise, the bigger the hook.",
            },
            {
              id: "s3",
              label: "“Claim here: skinstorm-event.net”",
              bucket: "hook",
              why: "That's not the game's real website. A stranger built it to collect whatever you type in.",
            },
            {
              id: "s4",
              label: "“You were specially chosen for this 💖”",
              bucket: "hook",
              why: "Everyone in your school got the exact same message. Feeling chosen is the bait.",
            },
            {
              id: "s5",
              label: "“Reminder: coding club is on Thursday.”",
              bucket: "fine",
              why: "Just a normal school message. Nothing to claim, nothing to sell.",
            },
            {
              id: "s6",
              label: "“gg, that last match was so close lol”",
              bucket: "fine",
              why: "Just a friend chatting. No prize, no link, no pressure.",
            },
          ],
          doneLine: "Four hooks, pulled out of the noise. That's SIREN's whole trick, laid out flat.",
        },
      },
      playAudio: "/audio/wren/m02-c1-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c1q1",
            question: "A stream chat says: “FIRST 100 CLICKS GET A GIFT CARD!” What's the bait's real job?",
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

    /* ---------------------------------------- cycle 2: the trail (TRACE) */
    {
      id: "trail",
      title: "Follow the trail",
      concept: "One campaign, many costumes",
      promise: "You'll learn to prove two messages come from one scammer.",
      instruction: "Pin the 4 matching clues, then put the trail in order.",
      intel: {
        beats: [
          "The chat post, the DM, the website. They're not three different things.",
          "It's one scammer, SIREN, wearing three different costumes.",
          "Scammers get lazy and reuse tiny details. Those are like fingerprints.",
          "Match the fingerprints, and every costume falls off at once.",
        ],
        beatAudio: [
          "/audio/wren/m02-c2-b1.mp3",
          "/audio/wren/m02-c2-b2.mp3",
          "/audio/wren/m02-c2-b3.mp3",
          "/audio/wren/m02-c2-b4.mp3",
        ],
        prediction: {
          question: "The same prize shows up in the group chat, a DM, and a website. What's the smartest guess?",
          options: [
            "It's popular, so it's probably real",
            "One scammer wearing three costumes",
            "Three different scammers had the same idea",
          ],
          answer: 1,
          right: "Exactly. Real news spreads in a messy, random way. A scam shows up everywhere at once, all polished and identical.",
          wrong: "Showing up everywhere at once, word for word, is what a scam campaign does. Real news is messier than that.",
          hint: "Look at the web address in each one. Do they all point to the same odd place?",
        },
        predictionAudio: {
          question: "/audio/wren/m02-c2-q.mp3",
          right: "/audio/wren/m02-c2-qr.mp3",
          wrong: "/audio/wren/m02-c2-qw.mp3",
        },
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Evidence board: pin every piece that belongs to the SKINSTORM scam",
          fingerprintHint: "same web address, same prize name, same countdown",
          cards: [
            {
              id: "t1",
              surface: "SCHOOL CHAT",
              from: "unknown number",
              text: "SKINSTORM 500 free skins event, today only: skinstorm-event.net",
              inCampaign: true,
              clue: "the web address and the clock",
              order: 1,
            },
            {
              id: "t2",
              surface: "DM",
              from: "@skins_mod_amy",
              text: "hiii! out of EVERYONE, you made the SKINSTORM winner list 💖 claim in 2 hrs → skinstorm-event.net/claim",
              inCampaign: true,
              clue: "same web address, same prize, new costume",
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
              text: "CLAIM FORM: username, password, phone number. 'So we can deliver your skins!'",
              inCampaign: true,
              clue: "the net itself, where every trail ends",
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
              clue: "the clock again, squeezing harder as the net fills",
              order: 4,
            },
          ],
          stage2Prompt: "Now line it up the way SIREN runs it: put the trail in order",
          doneLine: "Bait, then a costume change, then the net, then the squeeze. You just drew SIREN's whole assembly line.",
        },
      },
      playAudio: "/audio/wren/m02-c2-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c2q1",
            question: "Which detail PROVES two messages come from the same scammer?",
            options: [
              "They both sound friendly",
              "They both point at the same weird web address",
              "They arrived on the same day",
            ],
            answer: 1,
          },
          {
            id: "c2q2",
            question: "Why does the DM come AFTER the big chat post?",
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

    /* ---------------------------------------- cycle 3: the net (DECIDE) */
    {
      id: "net",
      title: "Study the net",
      concept: "The form is the whole point",
      promise: "You'll learn which form boxes are never okay to fill in.",
      instruction: "Your friend Leo is on the form right now. Pick your best move.",
      intel: {
        beats: [
          "The post, the DM, the countdown. They all had ONE job: get you to the claim form.",
          "The form IS the scam. Everything else was just decoration.",
          "Read a form like a price tag. Every box is asking you to pay with something.",
          "And no prize on earth is worth paying for with your password.",
        ],
        beatAudio: [
          "/audio/wren/m02-c3-b1.mp3",
          "/audio/wren/m02-c3-b2.mp3",
          "/audio/wren/m02-c3-b3.mp3",
          "/audio/wren/m02-c3-b4.mp3",
        ],
        prediction: {
          question: "The form asks for your password 'to deliver the skins.' What's it really for?",
          options: [
            "Skins get delivered through your login",
            "The password is the real prize, for THEM not you",
            "It's just checking your age",
          ],
          answer: 1,
          right: "That's the catch, caught. The whole thing was built to grab that one box.",
          wrong: "No real prize needs your password. The game already knows you when YOU log in. That password box was the entire point.",
          hint: "Which box would let a stranger log in AS you? That's the one they actually want.",
        },
        predictionAudio: {
          question: "/audio/wren/m02-c3-q.mp3",
          right: "/audio/wren/m02-c3-qr.mp3",
          wrong: "/audio/wren/m02-c3-qw.mp3",
        },
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Field decision: Leo is on the claim page RIGHT NOW",
          situation:
            "Your friend Leo has the SKINSTORM form open. He's typed his username, and he's about to type his password. He says: “It's only skins, what's the worst that happens?”",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "half",
              label: "Tell him to fill it in, but use a fake password",
              outcome:
                "Closer, but he still hands over his username and phone number, and he stays on their list for the next trick. That's still getting caught.",
            },
            {
              id: "worst",
              label: "Answer his question: show him what the worst really is",
              correct: true,
              outcome:
                "Good call. Walk him through it: they could log in AS him, spend any money on his account, message all his friends the same trick, and lock him out. Once Leo can see the real price, he closes the tab himself.",
            },
            {
              id: "grab",
              label: "Grab the phone and close the tab for him",
              outcome:
                "Tab's closed, but Leo didn't learn anything, so the next giveaway catches him when you're not around. Help him see it, don't just grab the phone.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m02-c3-play.mp3",
      checkpoint: {
        questions: [
          {
            id: "c3q1",
            question: "Which form box should end the conversation instantly, every single time?",
            options: ["Your username", "Your favourite skin", "Your password"],
            answer: 2,
          },
          {
            id: "c3q2",
            question: "You typed your username and phone number before closing the form. Best next move?",
            options: [
              "Nothing, you closed it in time",
              "Tell an adult, and expect scam texts. Ignore them when they come",
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
    phaseNames: ["Find the hub: where every trail ends", "Cut it: one move shuts the factory", "Warn everyone: the right way"],
    component: Mission02Incident,
  },

  debrief: {
    report: [
      "You took the giveaway apart: the bait post, the costume-change DM, the harvest form, and the ticking clock.",
      "The trail proved it. Three places, one scammer, and every 'winner' got the exact same words.",
      "You shut the factory at its hub, and the warning you sent had no link and nothing to be ashamed of.",
    ],
    realWorldMove:
      "This week: when a giveaway finds YOU, don't tap it. Go and find it yourself. Open the real game or brand's app and look for the event there. If it's not on their own page, it was never real. And remember, no prize ever costs a password. You weren't the chosen one. Everybody got the same message.",
    wrenLine: "Free bait costs the most. Clean sweep. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m02-transmission.mp3",
    briefing: "/audio/wren/m02-briefing.mp3",
    debrief: "/audio/wren/m02-debrief.mp3",
  },

  dossier: {
    mo: "Gives to get. Prizes, flattery, and a ticking clock, and every mark is told they're 'the special one.' Bait first, ask later. Builds factories, not one-off tricks.",
    defeatedBy: "Anyone who remembers they're one of a thousand 'chosen ones,' asks what the free thing really costs, and checks the official page instead of the link that came to them.",
  },
};
