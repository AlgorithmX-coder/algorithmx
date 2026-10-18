/**
 * WREN's spoken scripts for Mission 02 ("Too Good To Be True"). See
 * mission01.mjs for why this is a separate file from the on-screen text.
 *
 * NOT included here (already covered): catchThem.voice.pass/fail point at
 * the SHARED /audio/wren/m01-catch-pass.mp3 and m01-catch-fail.mp3, already
 * regenerated with emotion as part of Mission 1 and reused verbatim by
 * missions 02-05. catchThem.intro's TEXT is also identical to Mission 1's,
 * so it reuses the same tagging (own recording though, m02-catch-intro.mp3,
 * since it's not literally the same audio file as m01's).
 */
export const mission02VoiceScripts = {
  "/audio/wren/m02-transmission.mp3":
    "[excited] Agent, half the school is buzzing. Five hundred free skins, today only, and every kid swears THEY got picked. [curious] Here's the thing. Nobody gives away five hundred of anything for free. Somebody is collecting something. [determined] Let's find out what 'free' is really charging, and catch the person behind it.",

  "/audio/wren/m02-briefing.mp3":
    "[warm] Seven skills, then a test to close the case. [serious] One rule today, Agent. If you can't spot the trap, you're the one caught in it. [excited] Ready?",

  // cycle 1 — too good
  "/audio/wren/m02-c1-b1.mp3":
    "[curious] Here's the oldest trick there is. An offer so good you can't say no. A free phone. Ninety percent off. Five hundred free skins, just for you.",
  "/audio/wren/m02-c1-b2.mp3":
    "[serious] But stop and think. Would a real shop give away five hundred of anything? Would a stranger hand you a phone for nothing? Of course not.",
  "/audio/wren/m02-c1-b3.mp3":
    "[warm] Real deals are small, and a bit boring. A little off here, a freebie there. Scams promise the world, because the prize was never real. It's the bait.",
  "/audio/wren/m02-c1-b4.mp3":
    "[determined] So when an offer feels TOO good, that isn't luck. That's the alarm going off. The bigger the promise, the bigger the trap hiding behind it.",
  "/audio/wren/m02-c1-chk1-ok.mp3":
    "[proud] Right. Nobody hands a laptop to every visitor for nothing. The bigger the free promise, the bigger the trap behind it.",
  "/audio/wren/m02-c1-chk2-ok.mp3":
    "[proud] That's the one. Small, boring deals are usually real. A stranger giving away a phone was never real, it's the bait.",
  "/audio/wren/m02-c1-practice.mp3":
    "[excited] Now let's put it to work, Agent. A pop-up ad is about to land on the next screen, a brand-new one you haven't seen. [encouraging] Tap every claim on it that's too good to be true, then submit. Spot them all, and this skill is yours.",
  "/audio/wren/m02-c1-play.mp3":
    "[curious] A pop-up ad just jumped onto the screen. [determined] Tap every claim that's too good to be true. Some lines are just normal ad bits.",
  "/audio/wren/m02-c1-review.mp3":
    "[proud] Nailed it. A free console, fifty thousand winners, 'specially chosen', and a fee to claim. Each one is impossible on its own. Stacked together, it's pure bait.",

  // cycle 2 — free's price
  "/audio/wren/m02-c2-b1.mp3":
    "[curious] When something's free, ask one question. If I'm not paying with money, then what AM I paying with?",
  "/audio/wren/m02-c2-b2.mp3":
    "[serious] Sometimes it's your data. A 'free' quiz that wants your email, your birthday, your friend list. You are the thing being sold.",
  "/audio/wren/m02-c2-b3.mp3":
    "[serious] Sometimes it's a trap door. A 'free trial' that quietly charges you next month, or a 'free' game that begs for real cash to play.",
  "/audio/wren/m02-c2-b4.mp3":
    "[determined] Free is almost never really free. Peel it back, find the real price, and then decide if it's worth paying.",
  "/audio/wren/m02-c2-chk1-ok.mp3":
    "[proud] Exactly. When the app is free, you are the thing being sold. Your data is the price.",
  "/audio/wren/m02-c2-chk2-ok.mp3":
    "[proud] Good thinking. A free trial that needs your card is built to bill you the moment the free part runs out.",
  "/audio/wren/m02-c2-practice.mp3":
    "[excited] Now let's put it to work, Agent. On the next screen your friend Mia's about to grab a 'free' offer of her own. [encouraging] Read what's really going on, then make the call.",
  "/audio/wren/m02-c2-play.mp3":
    "[curious] Field decision. Your friend Mia is about to grab a 'free' offer.",

  // cycle 3 — the fake giveaway
  "/audio/wren/m02-c3-b1.mp3":
    "[curious] Ever seen it? A star or a big brand, running a giveaway, and somehow YOU won. Reply to claim.",
  "/audio/wren/m02-c3-b2.mp3":
    "[warm] But look past the name. The name on the profile is easy to copy. The account behind it tells the truth.",
  "/audio/wren/m02-c3-b3.mp3":
    "[encouraging] A real brand posts a giveaway on its own real, verified page, for everyone. A fake one hides in a look-alike account that messaged only you.",
  "/audio/wren/m02-c3-b4.mp3":
    "[determined] So peel back the name and read the actual account. A brand-new page with a twisted handle? That's not the star. That's SIREN.",
  "/audio/wren/m02-c3-chk1-ok.mp3":
    "[proud] Nailed it. A real brand doesn't need '_winners_official' bolted on, and it isn't three days old with 11 followers. That's a costume.",
  "/audio/wren/m02-c3-chk2-ok.mp3":
    "[proud] That's it. A real giveaway is public, on the brand's own verified page. A secret one, just for you, is the tell.",
  "/audio/wren/m02-c3-practice.mp3":
    "[excited] Now let's put it to work, Agent. A fresh batch of 'you won!' messages is waiting, all claiming to be GameHub. [encouraging] Tap each one to reveal the real account behind the name, then call it real or fake.",
  "/audio/wren/m02-c3-play.mp3":
    "[curious] Some 'you won!' messages, all claiming to be GameHub. [determined] Tap each to reveal the real account behind it, then call it.",
  "/audio/wren/m02-c3-review.mp3":
    "[warm] That's how you catch it. The name is a costume anyone can wear. [encouraging] The account underneath, verified or brand-new, followers or none, tells you who's really talking.",

  // cycle 4 — follow the funnel
  "/audio/wren/m02-c4-b1.mp3":
    "[curious] The chat post, the DM, the website. They're not three different things.",
  "/audio/wren/m02-c4-b2.mp3":
    "[serious] It's one scammer, SIREN, wearing three different costumes.",
  "/audio/wren/m02-c4-b3.mp3":
    "[warm] Scammers get lazy and reuse tiny details. The same web address, the same prize, the same clock. Those are like fingerprints.",
  "/audio/wren/m02-c4-b4.mp3":
    "[determined] Match the fingerprints, and every costume falls off at once. Then you see the whole line, bait, hook, net, haul.",
  "/audio/wren/m02-c4-chk1-ok.mp3":
    "[proud] Right. Scammers reuse the same link and prize because they're lazy. Those repeats are fingerprints from one scam.",
  "/audio/wren/m02-c4-chk2-ok.mp3":
    "[proud] Exactly. Match the fingerprints, the shared link or prize, and both costumes fall off at once.",
  "/audio/wren/m02-c4-practice.mp3":
    "[excited] Now let's put it to work, Agent. A fresh evidence board is up, a brand-new scam called SKINSTORM. [determined] Pin every piece that belongs to it, then line the trail up the way SIREN runs it.",
  "/audio/wren/m02-c4-play.mp3":
    "[curious] Evidence board. Pin every piece that belongs to the SKINSTORM scam.",

  // cycle 5 — guard the form
  "/audio/wren/m02-c5-b1.mp3":
    "[curious] Every funnel SIREN builds ends in the same place. A form. 'Just fill this in to claim your prize!' That form isn't the last little step. It's the whole point.",
  "/audio/wren/m02-c5-b2.mp3":
    "[encouraging] So read a claim form backwards, like a price tag. Every box is asking you to PAY with something. The prize is the bait. Your details are what she's really shopping for.",
  "/audio/wren/m02-c5-b3.mp3":
    "[warm] Some boxes are cheap. Your first name, your favourite colour. A bit annoying to give, but harmless on their own.",
  "/audio/wren/m02-c5-b4.mp3":
    "[serious] But some are worth real money to her. Your password is the key to your whole account. Your card number IS money. Your home address tells a stranger where you sleep. [determined] Those aren't 'boxes'. They're the catch. Black them out, and if a 'prize' can't live without them, it was never a prize.",
  "/audio/wren/m02-c5-chk1-ok.mp3":
    "[proud] Yes. A name or a colour is harmless. Your password is the key to your whole account, and no prize ever needs it.",
  "/audio/wren/m02-c5-chk2-ok.mp3":
    "[proud] Spot on. A skin lands in your game, not your letterbox. Asking for your address is SIREN shopping for your data.",
  "/audio/wren/m02-c5-practice.mp3":
    "[excited] Now let's put it to work, Agent. SIREN's own 'claim your prize' form is up next. [determined] Black out every box you should never hand over, and leave the harmless ones alone.",
  "/audio/wren/m02-c5-play.mp3":
    "[serious] SIREN's 'claim your prize' form. Black out every box you should NEVER hand over for a prize. Leave the harmless ones.",
  "/audio/wren/m02-c5-review.mp3":
    "[proud] That's the net, disarmed. A name and a favourite colour are harmless. [serious] But a password, a card number, a home address? No prize is worth those. [determined] When a form asks for the expensive boxes, the form WAS the trick.",

  // cycle 6 — know SIREN's play
  "/audio/wren/m02-c6-b1.mp3":
    "[excited] Here's SIREN's whole game, in three moves. First, an offer you can't resist. A prize, a freebie, a 'you're the special one'.",
  "/audio/wren/m02-c6-b2.mp3":
    "[warm] Second, a funnel. She reels you from a post, to a DM, to a page, one small step at a time, so you never stop to think.",
  "/audio/wren/m02-c6-b3.mp3":
    "[serious] Third, the switch. At the end, the 'free' prize wants your password, your money, or your data. You give, and you get nothing back.",
  "/audio/wren/m02-c6-b4.mp3":
    "[determined] And the move that beats all of it? Never chase the offer that finds YOU. Go to the real brand's own page and look. If it's not there, it was never real.",
  "/audio/wren/m02-c6-chk1-ok.mp3":
    "[proud] Exactly her three moves. The offer pulls you in, the funnel walks you along, and the switch swaps your prize for your password.",
  "/audio/wren/m02-c6-chk2-ok.mp3":
    "[proud] That's the move. Never chase the offer that finds you. Go to the real page yourself. If it's not there, it was never real.",
  "/audio/wren/m02-c6-practice.mp3":
    "[excited] Now let's put it to work, Agent. Time to build her file properly. From the evidence on the next screen, tap the three moves that are really SIREN's, no more, no less.",
  "/audio/wren/m02-c6-play.mp3":
    "[determined] Now build her file. Tap the 3 moves that are really SIREN's.",

  // cycle 7 — if you got reeled in
  "/audio/wren/m02-c7-b1.mp3":
    "[warm] So it happened. You typed your password, or paid the 'postage', or handed over your details. Don't panic, and don't feel silly. It's built to catch people.",
  "/audio/wren/m02-c7-b2.mp3":
    "[determined] First, if you gave a password, change it on the real site right away, before the scammer can use it.",
  "/audio/wren/m02-c7-b3.mp3":
    "[serious] If you paid or gave card details, tell a trusted adult now so they can call the bank and stop it.",
  "/audio/wren/m02-c7-b4.mp3":
    "[encouraging] Then report the scam so it's taken down, and warn your friends in plain words, so they don't get reeled in next.",
  "/audio/wren/m02-c7-chk1-ok.mp3":
    "[proud] Right call. There is no prize, so every extra payment is just more lost. Stop, and get an adult onto the bank fast.",
  "/audio/wren/m02-c7-chk2-ok.mp3":
    "[proud] Perfect. Warning people in words protects them. Forwarding the link would just spread the live bait.",
  "/audio/wren/m02-c7-practice.mp3":
    "[warm] Now let's put it to work, Agent. Leo just got caught by SKINSTORM, paid the postage and typed in his password. [determined] Build his rescue plan, one right move at a time.",
  "/audio/wren/m02-c7-play.mp3":
    "[serious] Leo paid the 'postage' and typed his password into the SKINSTORM page. [determined] Build his rescue plan.",

  // the test
  "/audio/wren/m02-catch-intro.mp3":
    "[warm] Okay Agent, this is the real test. [serious] Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned, and work out an answer you've never seen before. [determined] I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. [encouraging] Take your time.",

  // debrief
  "/audio/wren/m02-debrief.mp3":
    "[proud] Free bait costs the most. [determined] Clean sweep. [warm] Sign out.",
};
