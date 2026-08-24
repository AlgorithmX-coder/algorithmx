/**
 * Mission 02 — "Too Good To Be True" (Block 1: Signals, CONFIDENTIAL).
 * Actor: SIREN ① (the giveaway funnel). Built to the LOCKED case framework
 * (see docs/explorers/case-framework-locked.md) — Case 001 is the reference.
 *
 * SEVEN skills, each LEARN -> PRACTICE, then ONE blind must-pass TEST. The
 * fishing metaphor carries it: the prize is the bait, the funnel is the line,
 * the form is the net, YOU are the catch.
 *   1 too good     (beats + INSPECT)  — the gut-check that pops most scams
 *   2 free's price  (beats + SORT)     — 'free' always charges something
 *   3 fake giveaway (beats + UNMASK)   — the "winner" account is a look-alike
 *   4 the funnel    (beats + TRACE)    — one scam, many costumes, one line
 *   5 fake proof    (beats + INSPECT)  — fake reviews, winners, countdowns
 *   6 SIREN's play  (beats + PROFILE)  — offer + funnel + the switch
 *   7 reeled in     (beats + BUILD)    — the rescue plan if you paid/shared
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
      "Learn the gut-check that pops a scam on sight",
      "Work out what 'free' is really charging, and follow the funnel",
      "Know SIREN's play, and bounce back if you're reeled in",
    ],
    wrenLine: "Seven skills, then a test to close the case. One rule today, Agent. If you can't spot the trap, you're the one caught in it. Ready?",
  },

  cycles: [
    /* ------------------------------------------- cycle 1: too good to be true */
    {
      id: "toogood",
      title: "Too good to be true",
      concept: "If an offer sounds impossible, it is; the bigger the promise, the bigger the trap",
      promise: "You'll learn the one gut-check that pops most scams on sight.",
      instruction: "Tap every claim that's too good to be true.",
      intel: {
        beats: [
          "Here's the oldest trick there is. An offer so good you can't say no. A free phone. Ninety percent off. Five hundred free skins, just for you.",
          "But stop and think. Would a real shop give away five hundred of anything? Would a stranger hand you a phone for nothing? Of course not.",
          "Real deals are small, and a bit boring. A little off here, a freebie there. Scams promise the world, because the prize was never real. It's the bait.",
          "So when an offer feels TOO good, that isn't luck. That's the alarm going off. The bigger the promise, the bigger the trap hiding behind it.",
        ],
        beatAudio: [
          "/audio/wren/m02-c1-b1.mp3",
          "/audio/wren/m02-c1-b2.mp3",
          "/audio/wren/m02-c1-b3.mp3",
          "/audio/wren/m02-c1-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "A pop-up ad just jumped onto the screen. Tap every claim that's too good to be true. Some lines are just normal ad bits.",
          device: { app: "POP-UP AD", owner: "A RANDOM SITE" },
          header: [
            { label: "AD:", seg: { id: "brand", text: "GameHub Mega Bonanza" } },
          ],
          body: [
            [{ id: "won", text: "You've WON a brand-new PlayStation 5!", tellId: "prize" }],
            [{ id: "trusted", text: "Trusted by gamers everywhere." }],
            [{ id: "scale", text: "The first 50,000 visitors ALL win a prize!", tellId: "scale" }],
            [{ id: "pick", text: "You were specially chosen today!", tellId: "chosen" }],
            [{ id: "deals", text: "See our other deals lower down the page." }],
            [{ id: "postage", text: "Just pay £1.99 postage to claim yours.", tellId: "fee" }],
            [{ id: "sig", text: "The GameHub Promotions Team" }],
          ],
          tells: [
            { id: "prize", label: "The impossible prize", why: "A free console for a random visitor? Nobody gives away something that pricey for nothing." },
            { id: "scale", label: "The impossible scale", why: "Fifty thousand winners isn't a giveaway, it's a net. It's just wide enough to catch everyone." },
            { id: "chosen", label: "'Specially chosen'", why: "You never entered anything. Every visitor sees the exact same 'chosen' line. Flattery is the bait." },
            { id: "fee", label: "Pay to claim", why: "A real prize never asks you to pay first. That little fee is the whole point of the trick." },
          ],
          doneLine: "Nailed it. A free console, fifty thousand winners, 'specially chosen', and a fee to claim. Each one is impossible on its own. Stacked together, it's pure bait.",
          doneAudio: "/audio/wren/m02-c1-review.mp3",
        },
      },
      playAudio: "/audio/wren/m02-c1-play.mp3",
    },

    /* ---------------------------------------------- cycle 2: 'free' has a price */
    {
      id: "freeprice",
      title: "'Free' has a price",
      concept: "Nothing online is really free; work out what the 'free' offer actually takes from you",
      promise: "You'll learn to read what 'free' is really charging.",
      instruction: "Sort each offer: genuinely free, or is there a catch?",
      intel: {
        beats: [
          "When something's free, ask one question. If I'm not paying with money, then what AM I paying with?",
          "Sometimes it's your data. A 'free' quiz that wants your email, your birthday, your friend list. You are the thing being sold.",
          "Sometimes it's a trap door. A 'free trial' that quietly charges you next month, or a 'free' game that begs for real cash to play.",
          "Free is almost never really free. Peel it back, find the real price, and then decide if it's worth paying.",
        ],
        beatAudio: [
          "/audio/wren/m02-c2-b1.mp3",
          "/audio/wren/m02-c2-b2.mp3",
          "/audio/wren/m02-c2-b3.mp3",
          "/audio/wren/m02-c2-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "SORT",
        payload: {
          intro: "A batch of 'free' offers. Sort each one: genuinely free, or is there a catch? Ask what it really takes from you.",
          buckets: [
            { id: "free", label: "GENUINELY FREE", hint: "no cost, no data grab" },
            { id: "catch", label: "THERE'S A CATCH", hint: "money or data later" },
          ],
          items: [
            { id: "f1", label: "A free maths game your school gave you", bucket: "free", why: "A real free tool, from a place you trust, asking for nothing back. Genuinely free." },
            { id: "f2", label: "Free ringtones, £4.99 a week after 3 days", bucket: "catch", why: "A 'free trial' that quietly bills you every week. That's the real price, hidden in the small print." },
            { id: "f3", label: "A free demo: play level 1, buy to go on", bucket: "free", why: "An honest free demo. It's clear about what's free and what costs. Fine." },
            { id: "f4", label: "A free quiz that wants your email and friend list", bucket: "catch", why: "You pay with your data. Your details get sold on. You ARE what's being sold." },
            { id: "f5", label: "A free £100 gift card, 'just finish 20 offers'", bucket: "catch", why: "Free that makes you jump through hoops and hand over info is never free. The card never arrives." },
            { id: "f6", label: "A free library eBook from your library app", bucket: "free", why: "A real service you're already part of. Nothing hidden, nothing to pay. Genuinely free." },
          ],
          doneLine: "That's the rule. If it's not costing money, it's costing your data, or setting a trap for later. Always ask what 'free' is really charging.",
        },
      },
      playAudio: "/audio/wren/m02-c2-play.mp3",
    },

    /* --------------------------------------------- cycle 3: the fake giveaway */
    {
      id: "giveaway",
      title: "The fake giveaway",
      concept: "Fake giveaways impersonate a real brand or star; the account behind the name gives it away",
      promise: "You'll learn to unmask the account behind a 'you won!' message.",
      instruction: "Unmask each account, then call real or fake.",
      intel: {
        beats: [
          "Ever seen it? A star or a big brand, running a giveaway, and somehow YOU won. Reply to claim.",
          "But look past the name. The name on the profile is easy to copy. The account behind it tells the truth.",
          "A real brand posts a giveaway on its own real, verified page, for everyone. A fake one hides in a look-alike account that messaged only you.",
          "So peel back the name and read the actual account. A brand-new page with a twisted handle? That's not the star. That's SIREN.",
        ],
        beatAudio: [
          "/audio/wren/m02-c3-b1.mp3",
          "/audio/wren/m02-c3-b2.mp3",
          "/audio/wren/m02-c3-b3.mp3",
          "/audio/wren/m02-c3-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "UNMASK",
        payload: {
          intro: "Some 'you won!' messages, all claiming to be GameHub. Tap each to reveal the real account behind it, then call it.",
          brand: "GameHub",
          sourceLabel: "PROFILE NAME",
          revealText: "▸ TAP TO REVEAL THE REAL ACCOUNT",
          items: [
            { id: "g1", displayName: "GameHub", address: "@GameHub · verified, 4.2M followers", real: true, why: "The real, verified account, followed by millions. A genuine post, not a private message just to you." },
            { id: "g2", displayName: "GameHub", address: "@GameHub_Giveaway_Official_2024", real: false, why: "A twisted, bolted-on handle. Real brands don't need '_giveaway_official_2024'. A look-alike." },
            { id: "g3", displayName: "GameHub Support", address: "@GameHub · verified", real: true, why: "The same real verified account, just its support name. Genuine." },
            { id: "g4", displayName: "GameHub Prizes", address: "@GameHubPr1zes · made yesterday, 6 followers", real: false, why: "Brand-new, almost no followers, and a '1' hiding as an 'i'. That's SIREN in a costume." },
            { id: "g5", displayName: "GameHub Rewards", address: "@Game.Hub.Rewards · not verified", real: false, why: "Extra dots, no verified tick. Any stranger can make an account with that name." },
          ],
          doneLine: "That's how you catch it. The name is a costume anyone can wear. The account underneath, verified or brand-new, followers or none, tells you who's really talking.",
          doneAudio: "/audio/wren/m02-c3-review.mp3",
        },
      },
      playAudio: "/audio/wren/m02-c3-play.mp3",
    },

    /* --------------------------------------------- cycle 4: follow the funnel */
    {
      id: "funnel",
      title: "Follow the funnel",
      concept: "One scam wears many costumes across platforms; reused details are its fingerprints",
      promise: "You'll learn to prove three messages come from one scammer, and see the line they reel you down.",
      instruction: "Pin every clue that belongs to SIREN's scam, then put the trail in order.",
      intel: {
        beats: [
          "The chat post, the DM, the website. They're not three different things.",
          "It's one scammer, SIREN, wearing three different costumes.",
          "Scammers get lazy and reuse tiny details. The same web address, the same prize, the same clock. Those are like fingerprints.",
          "Match the fingerprints, and every costume falls off at once. Then you see the whole line: bait, hook, net, haul.",
        ],
        beatAudio: [
          "/audio/wren/m02-c4-b1.mp3",
          "/audio/wren/m02-c4-b2.mp3",
          "/audio/wren/m02-c4-b3.mp3",
          "/audio/wren/m02-c4-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "TRACE",
        payload: {
          intro: "Evidence board: pin every piece that belongs to the SKINSTORM scam.",
          fingerprintHint: "same web address, same prize name, same countdown",
          cards: [
            { id: "t1", surface: "SCHOOL CHAT", from: "unknown number", text: "SKINSTORM 500 free skins event, today only: skinstorm-event.net", inCampaign: true, clue: "the web address and the clock", order: 1 },
            { id: "t2", surface: "DM", from: "@skins_mod_amy", text: "hiii! out of EVERYONE, you made the SKINSTORM winner list 💖 claim in 2 hrs → skinstorm-event.net/claim", inCampaign: true, clue: "same web address, same prize, new costume", order: 2 },
            { id: "d1", surface: "SCHOOL CHAT", from: "Mr. Ortega", text: "Reminder: coding club moved to Thursday this week.", inCampaign: false },
            { id: "t3", surface: "WEB", from: "skinstorm-event.net", text: "CLAIM FORM: username, password, phone number. 'So we can deliver your skins!'", inCampaign: true, clue: "the net itself, where every trail ends", order: 3 },
            { id: "d2", surface: "DM", from: "your friend Leo", text: "did you finish the science thing lol", inCampaign: false },
            { id: "t4", surface: "GROUP TEXT", from: "unknown number", text: "last hours for SKINSTORM!! almost 500 claimed, don't miss out", inCampaign: true, clue: "the clock again, squeezing harder as the net fills", order: 4 },
          ],
          stage2Prompt: "Now line it up the way SIREN runs it: put the trail in order.",
          doneLine: "Bait, then a costume change, then the net, then the squeeze. You just drew SIREN's whole assembly line.",
        },
      },
      playAudio: "/audio/wren/m02-c4-play.mp3",
    },

    /* --------------------------------------------- cycle 5: spot the fake proof */
    {
      id: "fakeproof",
      title: "Spot the fake proof",
      concept: "Scam pages fake trust and rush: made-up reviews, fake winners, and countdowns that reset",
      promise: "You'll learn to see through the fake proof that makes a scam look real.",
      instruction: "Tap every part of the page that's faking proof or rushing you.",
      intel: {
        beats: [
          "A scam page has a problem. It's new, and nobody trusts it. So it fakes the trust it hasn't earned.",
          "Rows of five-star reviews, all posted the same day, all saying the same thing. Photos of 'winners' who don't exist.",
          "And a clock. Only three minutes left! Only two in stock! Refresh the page, and the clock is full again. It was never real.",
          "Real trust is slow and messy. Fake proof is loud, shiny, and always in a hurry. Spot it, and the whole page falls apart.",
        ],
        beatAudio: [
          "/audio/wren/m02-c5-b1.mp3",
          "/audio/wren/m02-c5-b2.mp3",
          "/audio/wren/m02-c5-b3.mp3",
          "/audio/wren/m02-c5-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "Here's SIREN's 'shop' page. Tap every part that's faking proof or rushing you. Some parts are just a normal page.",
          device: { app: "WEB", owner: "skinstorm-event.net" },
          header: [
            { label: "PAGE:", seg: { id: "title", text: "SKINSTORM — Official Skins Drop" } },
          ],
          body: [
            [{ id: "timer", text: "⏳ Offer ends in 02:59 (resets when you refresh)", tellId: "timer" }],
            [{ id: "about", text: "About: we love games and giveaways!" }],
            [{ id: "reviews", text: "★★★★★ '10/10 got my skins instantly!' — 400 reviews, all posted today", tellId: "reviews" }],
            [{ id: "stock", text: "Only 2 spots left! 998 people already claimed!", tellId: "stock" }],
            [{ id: "winners", text: "Recent winners: Jake_92, xX_Skins_Xx, User4471 (no real profiles)", tellId: "winners" }],
            [{ id: "contact", text: "Contact: help@skinstorm-event.net" }],
          ],
          tells: [
            { id: "timer", label: "The fake countdown", why: "A clock that refills when you refresh was never real. It's only there to rush you." },
            { id: "reviews", label: "The fake reviews", why: "Four hundred identical five-star reviews, all posted today, are made up. Real reviews trickle in slowly." },
            { id: "stock", label: "Fake scarcity", why: "'Only 2 left, 998 claimed' is invented pressure, designed to make you panic and rush." },
            { id: "winners", label: "The fake winners", why: "Random usernames with no real profiles. Nobody actually won. They never do." },
          ],
          doneLine: "Every bit of 'proof' on that page was faked: the clock, the reviews, the scarcity, the winners. Strip the fake trust away and there's nothing real underneath.",
          doneAudio: "/audio/wren/m02-c5-review.mp3",
        },
      },
      playAudio: "/audio/wren/m02-c5-play.mp3",
    },

    /* --------------------------------------------- cycle 6: know SIREN's play */
    {
      id: "play",
      title: "Know SIREN's play",
      concept: "Every SIREN scam is an irresistible offer, a funnel, and a switch",
      promise: "You'll learn the pattern behind every giveaway scam, and the move that beats it.",
      instruction: "Tap the 3 moves that are really hers.",
      intel: {
        beats: [
          "Here's SIREN's whole game, in three moves. First, an offer you can't resist. A prize, a freebie, a 'you're the special one'.",
          "Second, a funnel. She reels you from a post, to a DM, to a page, one small step at a time, so you never stop to think.",
          "Third, the switch. At the end, the 'free' prize wants your password, your money, or your data. You give, and you get nothing back.",
          "And the move that beats all of it? Never chase the offer that finds YOU. Go to the real brand's own page and look. If it's not there, it was never real.",
        ],
        beatAudio: [
          "/audio/wren/m02-c6-b1.mp3",
          "/audio/wren/m02-c6-b2.mp3",
          "/audio/wren/m02-c6-b3.mp3",
          "/audio/wren/m02-c6-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Now build her file. Tap the 3 moves that are really SIREN's.",
          evidence: [
            "Promised 500 free skins to 'specially chosen' kids",
            "Reeled them from a chat post, to a DM, to a claim page",
            "The 'free' page asked for a password 'to deliver the skins'",
          ],
          behaviors: [
            { id: "offer", label: "Dangles an offer too good to refuse", matches: true },
            { id: "funnel", label: "Funnels you across posts, DMs and pages", matches: true },
            { id: "switch", label: "Switches the 'prize' for your password or cash", matches: true },
            { id: "guess", label: "Cracks passwords by guessing them over and over", matches: false },
            { id: "virus", label: "Sneaks a virus onto your device", matches: false },
            { id: "spy", label: "Watches your screen through your camera", matches: false },
          ],
          picks: 3,
          doneLine: "That's her pattern: the offer, the funnel, the switch. Next time she'll dangle a different prize, but the three moves never change.",
        },
      },
      playAudio: "/audio/wren/m02-c6-play.mp3",
    },

    /* --------------------------------------------- cycle 7: if you got reeled in */
    {
      id: "reeledin",
      title: "If you got reeled in",
      concept: "If you paid or gave info to a giveaway scam, fast action limits the damage",
      promise: "You'll learn the exact steps if a 'free' prize ever catches you.",
      instruction: "Build the rescue plan: pick the right move for each step.",
      intel: {
        beats: [
          "So it happened. You typed your password, or paid the 'postage', or handed over your details. Don't panic, and don't feel silly. It's built to catch people.",
          "First, if you gave a password, change it on the real site right away, before the scammer can use it.",
          "If you paid or gave card details, tell a trusted adult now so they can call the bank and stop it.",
          "Then report the scam so it's taken down, and warn your friends in plain words, so they don't get reeled in next.",
        ],
        beatAudio: [
          "/audio/wren/m02-c7-b1.mp3",
          "/audio/wren/m02-c7-b2.mp3",
          "/audio/wren/m02-c7-b3.mp3",
          "/audio/wren/m02-c7-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Leo paid the 'postage' and typed his password into the SKINSTORM page. Build his rescue plan.",
          target: "Leo's rescue plan",
          slots: [
            {
              id: "pw",
              label: "The password he typed in",
              options: [
                { id: "change", label: "Change it on the real site right away", good: true, why: "Yes. That locks the scammer out before they can log in as him." },
                { id: "wait", label: "Wait and see if anything happens", good: false, why: "Waiting gives the scammer time to use it. Change it now." },
                { id: "same", label: "Set the same password back again", good: false, why: "They may already know it. He needs a brand-new one." },
              ],
            },
            {
              id: "money",
              label: "The money he paid",
              options: [
                { id: "adult", label: "Tell a trusted adult to call the bank", good: true, why: "A grown-up can get the bank to stop or reverse it, and watch for more charges." },
                { id: "pay", label: "Pay again to 'unlock' the prize", good: false, why: "There is no prize. Paying more just feeds the scam. Stop paying." },
                { id: "ignore", label: "Ignore it, it was only small", good: false, why: "Small now, but they have his card. An adult and the bank need to know." },
              ],
            },
            {
              id: "stop",
              label: "The scam itself",
              options: [
                { id: "report", label: "Report the giveaway so it's taken down", good: true, why: "Reporting gets it removed, so it can't reel in the next person." },
                { id: "click", label: "Go back and finish claiming the prize", good: false, why: "There's no prize to claim. Going back just hands over more. Report it instead." },
                { id: "delete", label: "Delete it quietly and tell nobody", good: false, why: "Deleting only hides it. Reporting actually shuts it down." },
              ],
            },
            {
              id: "friends",
              label: "His friends",
              options: [
                { id: "warn", label: "Warn them in plain words, no link", good: true, why: "A clear heads-up protects them, without forwarding the live trap." },
                { id: "forward", label: "Forward them the giveaway to warn them", good: false, why: "That just spreads the bait. Warn them in your own words instead." },
                { id: "quiet", label: "Say nothing, it's embarrassing", good: false, why: "It's not his fault, and silence lets his friends get caught too. Speak up." },
              ],
            },
          ],
          testLine: "PLAN HOLDS: account and card secured.",
          doneLine: "Change the password, get an adult onto the bank, report the scam, warn your friends. That's the rescue plan. Getting caught isn't the end, it's a story that helps the next person.",
        },
      },
      playAudio: "/audio/wren/m02-c7-play.mp3",
    },
  ],

  incident: {
    title: "The Prize Factory",
    phases: 3,
    phaseNames: ["Sort the flood", "Cut the funnel", "Warn everyone"],
    component: Mission02Incident,
  },

  catchThem: {
    intro:
      "Okay Agent, this is the real test. Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned and work out an answer you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. Take your time.",
    pass: 15,
    voice: {
      intro: "/audio/wren/m02-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // 19 fresh, think-for-yourself questions across the 7 skills. Options shuffle
    // at render; lengths balanced so the correct one is never the giveaway-longest.
    // skill: 0 too-good · 1 free's-price · 2 giveaway · 3 funnel · 4 fake-proof
    //        5 SIREN's-play · 6 reeled-in.
    scenarios: [
      { id: "cq1", skill: 0, prompt: "An ad says “Spin the wheel, everyone's a winner, brand-new phones!” What's the tell?", options: ["Everyone can't really win a phone", "It's at a funfair, so it's harmless", "It says brand-new, so it's honest", "A phone is a fairly boring prize"], answer: 0 },
      { id: "cq2", skill: 1, prompt: "A “free” app wants your email, birthday and contacts before you can use it. What are you really paying with?", options: ["Your data, which they sell on", "Nothing at all, it's really free", "A tiny bit of your phone's battery", "Only a little bit of your time"], answer: 0 },
      { id: "cq3", skill: 2, prompt: "A DM says you won a Nintendo giveaway. It's from “Nintendo_Prizes_Official_2024”. Real or fake?", options: ["Fake, the handle is a look-alike", "Real, it clearly says Nintendo", "Real, 'official' is in the handle", "You can't tell from an account"], answer: 0 },
      { id: "cq4", skill: 3, prompt: "The same prize and web link show up in a post, a DM and a text, word for word. What does that prove?", options: ["One scam wearing three costumes", "It must be real if it's everywhere", "Three scammers, one shared idea", "Nothing, popular things spread"], answer: 0 },
      { id: "cq5", skill: 4, prompt: "A shop page shows a countdown that fills back up every time you refresh the page. What is it?", options: ["Fake urgency, made to rush you", "A normal shop's countdown timer", "Proof the deal is really popular", "A harmless glitch you can ignore"], answer: 0 },
      { id: "cq6", skill: 5, prompt: "Post → DM → look-alike page → 'enter your password'. What just happened, in SIREN's words?", options: ["An offer, a funnel, a switch", "Just bad luck, three times over", "A normal sign-up process for you", "A game being unusually generous"], answer: 0 },
      { id: "cq7", skill: 6, prompt: "You typed your password into a fake giveaway page. What's the FIRST thing to do?", options: ["Change it on the real site now", "Wait to see if anything happens", "Make a whole new account instead", "Turn the computer off for now"], answer: 0 },
      { id: "cq8", skill: 0, prompt: "Which of these is a NORMAL offer, not a too-good-to-be-true trap?", options: ["“10% off your next order over £20”", "“FREE iPhone for the first 100,000!”", "“You won a car you never entered!”", "“95% off everything, today only!”"], answer: 0 },
      { id: "cq9", skill: 1, prompt: "A “free trial” asks for your card “just to verify, you won't be charged”. What's likely going on?", options: ["It'll bill you when the trial ends", "Cards prove your age these days", "It's checking you're a real person", "It's completely safe and free"], answer: 0 },
      { id: "cq10", skill: 2, prompt: "How does a REAL brand usually run a giveaway?", options: ["On its real verified page", "In a private DM, just for you", "Through a brand-new side account", "By asking for a small entry fee"], answer: 0 },
      { id: "cq11", skill: 3, prompt: "Why does the DM (“you're a winner!”) come AFTER the big public post?", options: ["The post baits, the DM reels in", "DMs simply take longer to send", "Scammers prefer to text at night", "The post is counting the real winners"], answer: 0 },
      { id: "cq12", skill: 4, prompt: "A page brags “400 five-star reviews, all posted today”. Why is that a red flag?", options: ["Real reviews trickle in slowly", "Five stars is simply too many stars", "Reviews belong on a different page", "Four hundred is not nearly enough"], answer: 0 },
      { id: "cq13", skill: 5, prompt: "A giveaway you never entered finds YOU. What's the one move that beats it?", options: ["Check the brand's own real page", "Reply and ask if it's genuine", "Tap it, but type a fake password", "Share it to see if friends got it"], answer: 0 },
      { id: "cq14", skill: 6, prompt: "You paid a “£2 postage fee” to a scam, then it asks for £5 more to “release the prize”. What now?", options: ["Stop paying, tell an adult", "Pay the £5 to finally unlock it", "Pay it once more, and then stop", "Wait for the prize to turn up"], answer: 0 },
      { id: "cq15", skill: 0, prompt: "What makes “too good to be true” such a reliable alarm?", options: ["Real deals are small; scams aren't", "Good online things never happen", "Anything with big numbers is a lie", "Free things are always viruses"], answer: 0 },
      { id: "cq16", skill: 2, prompt: "Two accounts both say “GameHub”. One is @GameHub verified with millions of followers, the other @GameHub.Prizes made yesterday. Which is real?", options: ["The verified one with millions", "The newer one, it's the prizes account", "Both, they're the same brand really", "Neither, all giveaways are fake"], answer: 0 },
      { id: "cq17", skill: 4, prompt: "Which is the SAFEST sign a shop is real?", options: ["A long history and real reviews", "A big flashy countdown timer", "A banner shouting '100% legit'", "Lots of prizes on the front page"], answer: 0 },
      { id: "cq18", skill: 6, prompt: "A friend is embarrassed they fell for a giveaway and got their password stolen. Best thing to tell them?", options: ["Not your fault, let's fix it", "You really should have known better", "Just delete all of your accounts", "Don't tell anyone what happened"], answer: 0 },
      { id: "cq19", skill: 1, prompt: "When is something online actually, genuinely free?", options: ["When it wants nothing back", "Whenever it says the word FREE", "When only the shipping is charged", "When you win it in a giveaway"], answer: 0 },
    ],
  },

  debrief: {
    report: [
      "You took the giveaway apart: the impossible prize, the 'free' that charges, the look-alike account, and the funnel that reeled kids down it.",
      "You saw through the fake proof, named SIREN's three moves, and knew exactly how to bounce back if a prize ever catches you.",
      "You shut the factory at its hub, and the warning you sent had no link and nothing to be ashamed of.",
    ],
    realWorldMove:
      "This week: when a giveaway finds YOU, don't chase it. Go and find it yourself. Open the real brand's own app and look for the event there. If it's not on their own page, it was never real. And remember, no prize ever costs a password. You weren't the chosen one. Everybody got the same message.",
    wrenLine: "Free bait costs the most. Clean sweep. Sign out.",
  },

  voice: {
    transmission: "/audio/wren/m02-transmission.mp3",
    briefing: "/audio/wren/m02-briefing.mp3",
    debrief: "/audio/wren/m02-debrief.mp3",
  },

  dossier: {
    mo: "Gives to get. Prizes, flattery, and a ticking clock, and every mark is told they're 'the special one.' Bait first, ask later. Builds funnels, not one-off tricks.",
    defeatedBy: "Anyone who remembers they're one of a thousand 'chosen ones,' asks what the free thing really costs, and checks the official page instead of the link that came to them.",
  },
};
