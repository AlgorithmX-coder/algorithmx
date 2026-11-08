/**
 * WREN's spoken scripts for Mission 01 ("Phishing"), separate from the
 * on-screen bubble text in app/explorers/missions/mission01.ts.
 *
 * WHY A SEPARATE FILE: bracketed tags like [warm] are ElevenLabs v3 delivery
 * directions. They must NEVER be copied into mission01.ts's displayed text,
 * or a kid would see the literal word "[warm]" in the chat bubble. This file
 * is the one place the tagged version lives, so a re-record never has to be
 * re-invented from scratch.
 *
 * Keys are the exact /audio/wren/... paths used in mission01.ts. Values are
 * the SAME words as the matching on-screen text, checked by
 * scripts/check-wren-screen-sync.mjs.
 *
 * Re-scripted 2026-11-07 to the WREN script standard
 * (scripts/lint-wren-voice-scripts.mjs): one tag per line by role, complete
 * sentences, no quote marks, no capitals for stress. Owner: "full complete
 * sentences... all the punctuation's in the right places".
 */
export const mission01VoiceScripts = {
  "/audio/wren/m01-transmission.mp3":
    "[serious] Maya just got a message. It says her game account will be deleted in 24 hours. It's got a scary countdown and big shouty capital letters. She almost tapped it. Most people would, and that's exactly what the hacker wants. But it's a fake. And the hacker who sent it made some mistakes. Let's go find them.",

  "/audio/wren/m01-briefing.mp3":
    "[warm] You'll learn seven skills, then take a test to close the case. The test makes you think, and it won't just ask you to repeat what I said. So learn each skill properly. Ready?",

  // cycle 1 — lure
  "/audio/wren/m01-c1-b1.mp3":
    "[warm] A scammer can't reach through the screen and make you do anything. So they do the next best thing. They make you feel something strong, and they make you feel it fast.",
  "/audio/wren/m01-c1-b2.mp3":
    "[warm] There are three feelings they fake again and again. The first is fear, like being told your account's in danger. The second is greed, like being told you've won something. The third is rush, like being told to act now or lose it.",
  "/audio/wren/m01-c1-b3.mp3":
    "[warm] Here's the tell most people miss. A real message gives you time. A scam slams a clock on you, so you move before your brain catches up.",
  "/audio/wren/m01-c1-b4.mp3":
    "[warm] So no real company will ever say your account gets deleted in an hour. That countdown isn't a warning. It's the bait.",
  "/audio/wren/m01-c1-b5.mp3":
    "[warm] That means the feeling itself is your clue. The moment a message makes you panic or rush, that's your signal to stop, not to tap.",
  "/audio/wren/m01-c1-chk1-ok.mp3":
    "[warm] Exactly. That scary countdown is there to panic you into acting before you think. Real companies never rush you like that.",
  "/audio/wren/m01-c1-chk2-ok.mp3":
    "[warm] That's it. The feeling is the trap. Slowing down is how you beat it every single time.",
  "/audio/wren/m01-c1-practice.mp3":
    "[warm] Now let's put it to work, Agent. On the next screen, I'll show you a new message you haven't seen before. Your job is to tap every part that's trying to pressure you, then hit submit. Find them all, and this skill is yours.",
  "/audio/wren/m01-address-practice.mp3":
    "[warm] Now let's put it to work, Agent. A whole batch of addresses is coming up next, and every one claims to be PixelPlay. Sort each one. Is it really PixelPlay, or a disguise wearing the name? Use the rule, and the sneaky ones won't fool you.",
  "/audio/wren/m01-sender-practice.mp3":
    "[warm] Now let's put it to work, Agent. A pile of messages is up next, and every one is signed GameHub. Tap each sender to reveal the real address hiding behind the name, then call it real or fake. Some of them hide it well.",
  "/audio/wren/m01-qrcode-practice.mp3":
    "[warm] Now let's put it to work, Agent. Some QR codes just turned up, and each one claims to be PayZone, the parking app. Scan each code to reveal where it really goes, then call it real or fake.",
  "/audio/wren/m01-download-practice.mp3":
    "[warm] Now let's put it to work, Agent. A pile of downloads just showed up on the next screen. Sort each one. Is it safe to get, or is it a trap? Remember where real apps actually come from.",
  "/audio/wren/m01-actor-practice.mp3":
    "[warm] Now let's put it to work, Agent. It's time to build his file. From the evidence on the next screen, tap the three tricks that are really his, no more and no less.",
  "/audio/wren/m01-recover-practice.mp3":
    "[warm] Now let's put it to work, Agent. Someone just typed their password into a fake GameHub page. Build the rescue plan with me, and pick the right move for each step.",
  "/audio/wren/m01-c1-art-intro.mp3":
    "[warm] This is the message that nearly caught Maya. Let me show you the three tricks hiding in it. Tap each highlighted part, and I'll explain exactly how it works on you.",
  "/audio/wren/m01-c1-art-threat.mp3":
    "[warm] This one fakes fear. It puts something you care about, your account, in danger, so you feel scared. And scared people act fast, without stopping to think.",
  "/audio/wren/m01-c1-art-clock.mp3":
    "[warm] This one fakes rush. A real company would give you time. This clock is made up. It's only here to hurry you along before your brain catches up.",
  "/audio/wren/m01-c1-art-now.mp3":
    "[warm] See the word now? Every line is shoving you to act this second. Do you feel that jolt of panic when you read it? That feeling is your signal to stop, not to tap.",
  "/audio/wren/m01-c1-art-done.mp3":
    "[warm] That's the whole pressure play. First comes fear, then a fake clock, then a push to act now. Some scams fake good news instead, like winning a prize. But underneath, it's the same trick. A strong feeling rushes you past thinking.",
  "/audio/wren/m01-c1-review.mp3":
    "[warm] Spot on. There were four pressure tricks in that message: greed, a countdown, a threat, and fear of missing out. The automated notice, the reference number and the unsubscribe line are just normal parts of a message. They're only there to fool you.",
  "/audio/wren/m01-c1-play.mp3":
    "[warm] A brand-new message just landed on Sam's phone. Find every part that's trying to pressure him. Some safe-looking lines are only there to throw you off.",

  // cycle 2 — address
  "/audio/wren/m01-c2-b1.mp3":
    "[warm] Every web address has one part that can't lie, and that's the real name. Everything else is decoration that the scammer gets to choose.",
  "/audio/wren/m01-c2-b2.mp3":
    "[warm] To find the real name, do two things. Find the first single slash. Then read the two chunks right before it.",
  "/audio/wren/m01-c2-b3.mp3":
    "[warm] So in account.gamehub.com/login, the two chunks before the slash are gamehub.com. That's the real owner. The word account is just a room inside their house.",
  "/audio/wren/m01-c2-b4.mp3":
    "[warm] Now for the trick that fools grown-ups. Look at gamehub.com.rewards-login.net. It says gamehub.com, but the last two chunks are rewards-login.net. The real name is glued on the front to trick you.",
  "/audio/wren/m01-c2-b5.mp3":
    "[warm] So never read from left to right and relax the moment you see a name you know. Find the slash, and take the two chunks right before it. That's who you're really talking to.",
  "/audio/wren/m01-c2-chk1-ok.mp3":
    "[warm] Right. The owner is the last two chunks before the first slash, and that's gamehub-rewards.co. That is not the real GameHub.",
  "/audio/wren/m01-c2-chk2-ok.mp3":
    "[warm] Nice. The paypal.com bit is just decoration. The owner is account-fix.net, the last two chunks before the slash. So it's a fake.",
  "/audio/wren/m01-c2-play.mp3":
    "[warm] Here's a whole batch of addresses, and every one claims to be PixelPlay. Sort each one. Is it really PixelPlay, or a disguise wearing the name? Some are sneaky, so use the rule.",

  // cycle 3 — sender
  "/audio/wren/m01-c-sender-b1.mp3":
    "[warm] Every message shows a name at the top, like GameHub Support. But that name is just a label. The sender can type whatever they want there.",
  "/audio/wren/m01-c-sender-b2.mp3":
    "[warm] The truth is hiding one tap away. Behind the name sits the real email address, and that part is far harder to fake.",
  "/audio/wren/m01-c-sender-b3.mp3":
    "[warm] So you read that address exactly like a link. Find the real owner, which is the last two chunks. If it isn't the brand, then the friendly name was a lie.",
  "/audio/wren/m01-c-sender-b4.mp3":
    "[warm] Never trust the name on its own. Peel it back, read the real address, and only then decide.",
  "/audio/wren/m01-c3-chk1-ok.mp3":
    "[warm] Exactly. The display name is a costume. The real address, apple-account.ru, gives it away.",
  "/audio/wren/m01-c3-chk2-ok.mp3":
    "[warm] That's the rule. Names and logos are easy to fake. The real address tells the truth.",
  "/audio/wren/m01-c-sender-play.mp3":
    "[warm] Here's a pile of messages, all signed GameHub. Tap each one to reveal the real address, then call it real or fake. Some of them hide the fake well.",
  "/audio/wren/m01-c-sender-review.mp3":
    "[warm] Let's look back at those. The real ones all ended in gamehub.com, so the name and the address matched. The fakes hid a stranger's address behind the GameHub name. Names lie, but addresses don't, so always read the address, not the name.",

  // cycle 4 — qrcode
  "/audio/wren/m01-c-qr-b1.mp3":
    "[warm] Here's a sneaky one. A QR code is just a link in disguise. It's a little pattern of squares that your camera turns into a web address.",
  "/audio/wren/m01-c-qr-b2.mp3":
    "[warm] Scammers love them, because you can't see where a code goes just by looking. They stick fake ones on posters, in car parks, and even inside emails.",
  "/audio/wren/m01-c-qr-b3.mp3":
    "[warm] But your phone has your back. When you scan a code, it shows you the address first, before it opens anything. That little preview is the whole game.",
  "/audio/wren/m01-c-qr-b4.mp3":
    "[warm] So read that address just like any link. Find the real owner, which is the last two chunks. If it's a stranger, don't open it. It's the same rule for a brand-new trick.",
  "/audio/wren/m01-c4-chk1-ok.mp3":
    "[warm] Right. A QR code is a link in disguise. You cannot see where it goes until you check, so treat a surprise one like any strange link.",
  "/audio/wren/m01-c4-chk2-ok.mp3":
    "[warm] Good call. A random free Robux link is bait. Reading where it goes before you tap just saved you.",
  "/audio/wren/m01-c-qr-play.mp3":
    "[warm] Some QR codes have turned up, and each one claims to be PayZone, the parking app. Scan each one to reveal where it really goes, then call it real or fake.",
  "/audio/wren/m01-c-qr-review.mp3":
    "[warm] Nicely done. A QR code can't hide from the rule. Scan it, read the address it shows you, and take the last two chunks. If it's a stranger, don't open it.",

  // cycle 5 — download
  "/audio/wren/m01-c-dl-b1.mp3":
    "[warm] Have you ever seen a free Robux generator, or a game hack that promises unlimited coins? Here's the truth. Those don't exist.",
  "/audio/wren/m01-c-dl-b2.mp3":
    "[warm] That download isn't free coins. It's a virus, or a trick to steal your login. The free prize is just the bait, again.",
  "/audio/wren/m01-c-dl-b3.mp3":
    "[warm] Real games and apps come from the official app store, or from the company's own website. They never come from a random free link.",
  "/audio/wren/m01-c-dl-b4.mp3":
    "[warm] So before you download anything, ask one question. Is this the official place? If it's a stranger's free file, close it. It's a trap.",
  "/audio/wren/m01-c5-chk1-ok.mp3":
    "[warm] Exactly. Free hacks and coin generators are classic bait for malware. Nothing good comes from them.",
  "/audio/wren/m01-c5-chk2-ok.mp3":
    "[warm] That's the safe path. Use the official store or the real site, never a random download link.",
  "/audio/wren/m01-c-dl-play.mp3":
    "[warm] A pile of downloads just showed up. Sort each one. Is it safe to get, or is it a trap? Remember where real apps come from.",

  // cycle 6 — actor (the play)
  "/audio/wren/m01-c3-b1.mp3":
    "[warm] Here's the secret that makes you unbeatable. Every phishing scam, whatever it's dressed as, is built from the same three parts.",
  "/audio/wren/m01-c3-b2.mp3":
    "[warm] The first is a feeling that rushes you. The second is a trusted name that's been faked. The third is a link that lies about where it goes.",
  "/audio/wren/m01-c3-b3.mp3":
    "[warm] You don't need all three to be sure. Spot two of them in a message, and you're almost certainly looking at a scam. It doesn't matter if it's a game, a bank, or a school.",
  "/audio/wren/m01-c3-b4.mp3":
    "[warm] And here's the move that beats every single one of them. Never act from the message itself. Go to the real app or website yourself, and check there.",
  "/audio/wren/m01-c3-b5.mp3":
    "[warm] Go direct, and never tap the message. That one habit defeats every disguise he will ever wear.",
  "/audio/wren/m01-c6-chk1-ok.mp3":
    "[warm] Yes. Whatever the story, there is always a feeling pushing you to act fast. Spot that and you spot the scam.",
  "/audio/wren/m01-c6-chk2-ok.mp3":
    "[warm] Exactly. The disguise changes, but the recipe does not. Know the parts, and no new costume will fool you.",
  "/audio/wren/m01-c3-play.mp3":
    "[warm] Now build his file. Tap the three tricks that are really his.",

  // cycle 7 — recover
  "/audio/wren/m01-c-recover-b1.mp3":
    "[warm] Even careful people get caught sometimes. If you ever tap a scam link or type your password into a fake page, don't panic. What you do next matters most.",
  "/audio/wren/m01-c-recover-b2.mp3":
    "[warm] First, change your password on the real site, straight away. That locks the scammer out before they can use what they took.",
  "/audio/wren/m01-c-recover-b3.mp3":
    "[warm] Then make it even safer. Turn on two-step verification, so a password on its own isn't enough to get in.",
  "/audio/wren/m01-c-recover-b4.mp3":
    "[warm] And you're never on your own. Tell a trusted adult, and report the scam so it gets taken down. That protects you, and everyone after you.",
  "/audio/wren/m01-c7-chk1-ok.mp3":
    "[warm] Right. Change the password fast, so the stolen one stops working. Speed is everything here.",
  "/audio/wren/m01-c7-chk2-ok.mp3":
    "[warm] That's it. A trusted adult helps you lock things down and report it. You never have to handle it alone.",
  "/audio/wren/m01-c-recover-play.mp3":
    "[warm] Someone just typed their password into a fake GameHub page. Build the rescue plan.",

  // the test
  "/audio/wren/m01-catch-intro.mp3":
    "[warm] Okay, Agent, this is the real test. There are nineteen questions, and none of them just ask you to repeat what I said. Every single one makes you think. Use what you've learned to work out answers you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right, and you close the case. If you get fewer than fifteen, you'll play the whole case again. So take your time, and good luck.",
  // shared by Missions 1-5; spoken only (the result screen shows the score)
  "/audio/wren/m01-catch-pass.mp3":
    "[proud] That's a pass, Agent! You earned this one yourself, and the case is closed.",
  "/audio/wren/m01-catch-fail.mp3":
    "[warm] Not this time, Agent. Run the case again, and it'll stick. There are no shortcuts, and that's how you really learn it.",

  // debrief
  "/audio/wren/m01-debrief.mp3":
    "[proud] You didn't just remember it. You worked it out, and that's the real thing, Agent.",

  // boss: WREN reads each phase's instruction (the villain's taunts stay text)
  "/audio/wren/m01-boss-p1.mp3":
    "[determined] Phase one, triage. A wave just hit the class group. Call every one, then submit.",
  "/audio/wren/m01-boss-p2.mp3":
    "[determined] Phase two, cut the hook. The group is still getting hit. Make your call, then submit.",
  "/audio/wren/m01-boss-p3.mp3":
    "[determined] Phase three, file it. Your report takes the campaign off the board.",
};
