/**
 * WREN's spoken scripts for Mission 02 ("Too Good To Be True"). See
 * mission01.mjs for why this is a separate file from the on-screen text.
 *
 * NOT included here: catchThem.voice.pass/fail point at the SHARED
 * /audio/wren/m01-catch-pass.mp3 and m01-catch-fail.mp3, reused by missions
 * 01-05. catchThem.intro follows Mission 1's approved test intro (own
 * recording, m02-catch-intro.mp3).
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress.
 */
export const mission02VoiceScripts = {
  "/audio/wren/m02-transmission.mp3":
    "[excited] Agent, half the school is buzzing. Five hundred free skins are up for grabs today only, and every kid swears they got picked. Here's the thing. Nobody gives away five hundred of anything for free, so somebody is collecting something. Let's find out what free is really charging, and catch the person behind it.",

  "/audio/wren/m02-briefing.mp3":
    "[warm] You'll learn seven skills, then take a test to close the case. There's one rule today, Agent. If you can't spot the trap, you're the one caught in it. Ready?",

  // cycle 1 — too good
  "/audio/wren/m02-c1-b1.mp3":
    "[warm] Here's the oldest trick there is. It's an offer so good you can't say no, like a free phone, ninety percent off, or five hundred free skins just for you.",
  "/audio/wren/m02-c1-b2.mp3":
    "[warm] But stop and think. Would a real shop give away five hundred of anything? Would a stranger hand you a phone for nothing? Of course not.",
  "/audio/wren/m02-c1-b3.mp3":
    "[warm] Real deals are small, and a bit boring, like a little off here or a freebie there. Scams promise the world, because the prize was never real. It's the bait.",
  "/audio/wren/m02-c1-b4.mp3":
    "[warm] So when an offer feels too good, that isn't luck. That's the alarm going off. The bigger the promise, the bigger the trap hiding behind it.",
  "/audio/wren/m02-c1-chk1-ok.mp3":
    "[warm] Right. Nobody hands a laptop to every visitor for nothing. The bigger the free promise, the bigger the trap behind it.",
  "/audio/wren/m02-c1-chk2-ok.mp3":
    "[warm] That's the one. Small, boring deals are usually real. A stranger giving away a phone was never real. It's the bait.",
  "/audio/wren/m02-c1-practice.mp3":
    "[warm] Now let's put it to work, Agent. A pop-up ad is about to land on the next screen, a brand-new one you haven't seen. Tap every claim on it that's too good to be true, then submit. Spot them all, and this skill is yours.",
  "/audio/wren/m02-c1-play.mp3":
    "[warm] A pop-up ad just jumped onto the screen. Tap every claim that's too good to be true. Some lines are just normal parts of an ad.",
  "/audio/wren/m02-c1-review.mp3":
    "[warm] Nailed it. The tricks were a free console, fifty thousand winners, being specially chosen, and a fee to claim. Each one is a red flag on its own. Stacked together, it's pure bait.",

  // cycle 2 — free's price
  "/audio/wren/m02-c2-b1.mp3":
    "[warm] When something's free, ask one question. If I'm not paying with money, then what am I paying with?",
  "/audio/wren/m02-c2-b2.mp3":
    "[warm] Sometimes it's your data, like a free quiz that wants your email, your birthday, and your friend list. You are the thing being sold.",
  "/audio/wren/m02-c2-b3.mp3":
    "[warm] Sometimes it's a trap door. A free trial can quietly charge you next month, or a free game can beg for real cash to play.",
  "/audio/wren/m02-c2-b4.mp3":
    "[warm] Free is almost never really free. Peel it back, find the real price, and then decide if it's worth paying.",
  "/audio/wren/m02-c2-chk1-ok.mp3":
    "[warm] Exactly. When the app is free, you are the thing being sold. Your data is the price.",
  "/audio/wren/m02-c2-chk2-ok.mp3":
    "[warm] Good thinking. A free trial that needs your card is built to bill you the moment the free part runs out.",
  "/audio/wren/m02-c2-practice.mp3":
    "[warm] Now let's put it to work, Agent. On the next screen, your friend Mia is about to grab a free offer of her own. Read what's really going on, then make the call.",
  "/audio/wren/m02-c2-play.mp3":
    "[warm] Here's a field decision. Your friend Mia is about to grab a free offer.",

  // cycle 3 — the fake giveaway
  "/audio/wren/m02-c3-b1.mp3":
    "[warm] Have you ever seen a giveaway like this? A star or a big brand is running one, and somehow you won. All you have to do is reply to claim it.",
  "/audio/wren/m02-c3-b2.mp3":
    "[warm] But look past the name. The name on the profile is easy to copy. The account behind it tells the truth.",
  "/audio/wren/m02-c3-b3.mp3":
    "[warm] A real brand posts a giveaway on its own real, verified page, for everyone. A fake one hides in a look-alike account that messaged only you.",
  "/audio/wren/m02-c3-b4.mp3":
    "[warm] So peel back the name and read the actual account. Is it a brand-new page with a twisted handle? That's not the star. That's SIREN.",
  "/audio/wren/m02-c3-chk1-ok.mp3":
    "[warm] Nailed it. A real brand doesn't need extra words like winners and official tacked onto its name, and it isn't three days old with eleven followers. That's a costume.",
  "/audio/wren/m02-c3-chk2-ok.mp3":
    "[warm] That's it. A real giveaway is public, on the brand's own verified page. A secret one, just for you, is the tell.",
  "/audio/wren/m02-c3-practice.mp3":
    "[warm] Now let's put it to work, Agent. A fresh batch of messages is waiting, all saying you've won, and every one claims to be GameHub. Tap each one to reveal the real account behind the name, then call it real or fake.",
  "/audio/wren/m02-c3-play.mp3":
    "[warm] Here are some messages saying you've won, and every one claims to be GameHub. Tap each one to reveal the real account behind it, then call it real or fake.",
  "/audio/wren/m02-c3-review.mp3":
    "[warm] That's how you catch it. The name is a costume anyone can wear. The account underneath, verified or brand-new, followers or none, tells you who's really talking.",

  // cycle 4 — follow the funnel
  "/audio/wren/m02-c4-b1.mp3":
    "[warm] The chat post, the DM, and the website aren't three different things.",
  "/audio/wren/m02-c4-b2.mp3":
    "[warm] It's one scammer, SIREN, wearing three different costumes.",
  "/audio/wren/m02-c4-b3.mp3":
    "[warm] Scammers get lazy and reuse tiny details, like the same web address, the same prize, or the same clock. Those are like fingerprints.",
  "/audio/wren/m02-c4-b4.mp3":
    "[warm] Match the fingerprints, and every costume falls off at once. Then you see the whole line, from bait, to hook, to net, to haul.",
  "/audio/wren/m02-c4-chk1-ok.mp3":
    "[warm] Right. Scammers reuse the same link and prize because they're lazy. Those repeats are fingerprints from one scam.",
  "/audio/wren/m02-c4-chk2-ok.mp3":
    "[warm] Exactly. Match the fingerprints, like the shared link or prize, and both costumes fall off at once.",
  "/audio/wren/m02-c4-practice.mp3":
    "[warm] Now let's put it to work, Agent. A fresh evidence board is up, for a brand-new scam called SKINSTORM. Pin every piece that belongs to it, then line the trail up the way SIREN runs it.",
  "/audio/wren/m02-c4-play.mp3":
    "[warm] Here's the evidence board. Pin every piece that belongs to the SKINSTORM scam.",

  // cycle 5 — guard the form
  "/audio/wren/m02-c5-b1.mp3":
    "[warm] Every funnel SIREN builds ends in the same place, which is a form. It asks you to fill it in to claim your prize. That form isn't the last little step. It's the whole point.",
  "/audio/wren/m02-c5-b2.mp3":
    "[warm] So read a claim form like a price tag. Every box is asking you to pay with something. The prize is the bait. Your details are what he's really shopping for.",
  "/audio/wren/m02-c5-b3.mp3":
    "[warm] Some boxes are cheap, like your first name or your favourite colour. They're a bit annoying to give, but harmless on their own.",
  "/audio/wren/m02-c5-b4.mp3":
    "[warm] But some are worth real money to him. Your password is the key to your whole account. Your card number is money. Your home address tells a stranger where you sleep. Those aren't just boxes. They're the catch. Black them out. If a prize can't live without them, it was never a prize.",
  "/audio/wren/m02-c5-chk1-ok.mp3":
    "[warm] Yes. A name or a colour is harmless. Your password is the key to your whole account, and no prize ever needs it.",
  "/audio/wren/m02-c5-chk2-ok.mp3":
    "[warm] Spot on. A skin lands in your game, not your letterbox. Asking for your address is SIREN shopping for your data.",
  "/audio/wren/m02-c5-practice.mp3":
    "[warm] Now let's put it to work, Agent. Up next is SIREN's own form for claiming your prize. Black out every box you should never hand over, and leave the harmless ones alone.",
  "/audio/wren/m02-c5-play.mp3":
    "[warm] This is SIREN's form for claiming your prize. Black out every box you should never hand over for a prize, and leave the harmless ones alone.",
  "/audio/wren/m02-c5-review.mp3":
    "[warm] That's the net, disarmed. A name and a favourite colour are harmless. But a password, a card number, or a home address? No prize is worth those. When a form asks for the expensive boxes, the form was the trick.",

  // cycle 6 — know SIREN's play
  "/audio/wren/m02-c6-b1.mp3":
    "[warm] Here's SIREN's whole game, in three moves. First comes an offer you can't resist, like a prize, a freebie, or being told you're the special one.",
  "/audio/wren/m02-c6-b2.mp3":
    "[warm] Second comes a funnel. He reels you from a post, to a DM, to a page, one small step at a time, so you never stop to think.",
  "/audio/wren/m02-c6-b3.mp3":
    "[warm] Third comes the switch. At the end, the free prize wants your password, your money, or your data. You give, and you get nothing back.",
  "/audio/wren/m02-c6-b4.mp3":
    "[warm] And what's the move that beats all of it? Never chase the offer that finds you. Go to the real brand's own page and look. If it's not there, it was never real.",
  "/audio/wren/m02-c6-chk1-ok.mp3":
    "[warm] Those are exactly his three moves. The offer pulls you in, the funnel walks you along, and the switch swaps your prize for your password.",
  "/audio/wren/m02-c6-chk2-ok.mp3":
    "[warm] That's the move. Never chase the offer that finds you. Go to the real page yourself. If it's not there, it was never real.",
  "/audio/wren/m02-c6-practice.mp3":
    "[warm] Now let's put it to work, Agent. Time to build his file properly. From the evidence on the next screen, tap the three moves that are really SIREN's, no more, no less.",
  "/audio/wren/m02-c6-play.mp3":
    "[warm] Now build his file. Tap the three moves that are really SIREN's.",

  // cycle 7 — if you got reeled in
  "/audio/wren/m02-c7-b1.mp3":
    "[warm] So it happened. You typed your password, paid the postage, or handed over your details. Don't panic, and don't feel silly, because it's built to catch people.",
  "/audio/wren/m02-c7-b2.mp3":
    "[warm] First, if you gave a password, change it on the real site right away, before the scammer can use it.",
  "/audio/wren/m02-c7-b3.mp3":
    "[warm] If you paid or gave card details, tell a trusted adult now so they can call the bank and stop it.",
  "/audio/wren/m02-c7-b4.mp3":
    "[warm] Then report the scam so it's taken down, and warn your friends in plain words, so they don't get reeled in next.",
  "/audio/wren/m02-c7-chk1-ok.mp3":
    "[warm] Right call. There is no prize, so every extra payment is just more money lost. Stop, and get an adult onto the bank fast.",
  "/audio/wren/m02-c7-chk2-ok.mp3":
    "[warm] Perfect. Warning people in words protects them. Forwarding the link would just spread the live bait.",
  "/audio/wren/m02-c7-practice.mp3":
    "[warm] Now let's put it to work, Agent. Leo just got caught by SKINSTORM. He paid the postage and typed in his password. Build his rescue plan, one right move at a time.",
  "/audio/wren/m02-c7-play.mp3":
    "[warm] Okay, so Leo's made the mistake. He paid the postage and typed his password into the SKINSTORM page. Now what happens? Remember the four steps you just learned, and pick the right move for each one.",

  // the test
  "/audio/wren/m02-catch-intro.mp3":
    "[warm] Okay, Agent, this is the real test. There are nineteen questions, and none of them just ask you to repeat what I said. Every single one makes you think. Use what you've learned to work out answers you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right, and you close the case. If you get fewer than fifteen, you'll play the whole case again. So take your time, and good luck.",

  // debrief
  "/audio/wren/m02-debrief.mp3":
    "[proud] Free bait costs the most, and you saw through every bit of it. That's a clean sweep, Agent.",

  // boss: WREN reads each phase's instruction (the villain's taunts stay text)
  "/audio/wren/m02-boss-p1.mp3":
    "[determined] Phase one, the factory floor. Three funnels are running, and every funnel drains somewhere. Follow the arrows, and tap the collection point.",
  "/audio/wren/m02-boss-p2.mp3":
    "[determined] Phase two, cut the hub. One move shuts the whole factory. Make your call, then submit.",
  "/audio/wren/m02-boss-p3.mp3":
    "[determined] Phase three, warn everyone. Some kids already typed things. Pick the message that actually helps, then submit.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
export const mission02Say = {
  SKINSTORM: "Skin Storm",
};
