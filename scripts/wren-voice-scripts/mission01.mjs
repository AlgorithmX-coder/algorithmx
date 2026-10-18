/**
 * WREN's spoken scripts for Mission 01 ("Phishing"), separate from the
 * on-screen bubble text in app/explorers/missions/mission01.ts.
 *
 * WHY A SEPARATE FILE: the on-screen `text` fields in mission01.ts are
 * already the correct spoken WORDS (confirmed by a full punctuation audit,
 * 2026-10-18 — only 1 issue found across all 20 cases, and it wasn't here).
 * What was missing is DELIVERY: every clip was generated flat, with no
 * emotional shape (owner: "she sounds far too monotone"). Bracketed tags
 * like [warm]/[serious] are ElevenLabs v3 delivery directions — they must
 * NEVER be copied into mission01.ts's displayed text, or a kid would see
 * the literal word "[warm]" in the chat bubble. This file is the one place
 * the tagged version lives, so a re-record never has to be re-invented from
 * scratch (the same problem the ATLAS block-intros had before 2026-10-18).
 *
 * Keys are the exact /audio/wren/... paths used in mission01.ts. Values are
 * the EXACT SAME words as the matching `text`/`ok`/`practiceIntro`/etc.
 * field, with tags added and nothing else changed - content, facts and
 * safeguarding language are untouched.
 */
export const mission01VoiceScripts = {
  "/audio/wren/m01-transmission.mp3":
    "[serious] Maya just got a message. It says her game account will be deleted in 24 hours. It's got a scary countdown and big shouty capital letters. [concerned] She almost tapped it. Most people would, and that's exactly what the hacker wants. [determined] But it's a fake. And the hacker who sent it made some mistakes. [excited] Let's go find them.",

  "/audio/wren/m01-briefing.mp3":
    "[warm] Seven skills, then a test to close the case. [serious] This test makes you THINK, it won't just ask what I said. So learn it properly. [excited] Ready?",

  // cycle 1 — lure
  "/audio/wren/m01-c1-b1.mp3":
    "[curious] A scammer can't reach through the screen and make you do anything. So they do the next best thing. They make you FEEL something strong, fast.",
  "/audio/wren/m01-c1-b2.mp3":
    "[serious] There are three feelings they fake again and again. Fear, your account's in danger. Greed, you've won something. And rush, act NOW, or lose it.",
  "/audio/wren/m01-c1-b3.mp3":
    "[serious] Here's the tell most people miss. A real message gives you time. A scam slams a clock on you, so you move before your brain catches up.",
  "/audio/wren/m01-c1-b4.mp3":
    "[determined] So no real company will ever say your account gets deleted in an hour. That countdown isn't a warning. It's the bait.",
  "/audio/wren/m01-c1-b5.mp3":
    "[encouraging] Which means the feeling itself is your clue. The moment a message makes you panic or rush, that's the signal to STOP, not to tap.",
  "/audio/wren/m01-c1-chk1-ok.mp3":
    "[proud] Exactly. That scary countdown is there to panic you into acting before you think. Real companies never rush you like that.",
  "/audio/wren/m01-c1-chk2-ok.mp3":
    "[proud] That's it. The feeling is the trap. Slowing down is how you beat it every single time.",
  "/audio/wren/m01-c1-practice.mp3":
    "[excited] Now let's put it to work, Agent. On the next screen I'll show you a NEW message you haven't seen. [encouraging] Your job, tap every part that's trying to pressure you, then hit submit. Find them all, and this skill is yours.",
  "/audio/wren/m01-c1-art-intro.mp3":
    "[warm] This is the message that nearly caught Maya. [curious] Let me show you the three tricks hiding in it. Tap each highlighted part, and I'll explain exactly how it works on you.",
  "/audio/wren/m01-c1-art-threat.mp3":
    "[serious] This one fakes FEAR. It puts something you care about, your account, in danger, so you feel scared. And scared people act fast, without stopping to think.",
  "/audio/wren/m01-c1-art-clock.mp3":
    "[serious] This one fakes RUSH. A real company would give you time. This clock is made up, it's only here to hurry you along before your brain catches up.",
  "/audio/wren/m01-c1-art-now.mp3":
    "[serious] See the word NOW? Every line is shoving you to act this second. [determined] That jolt of panic you feel reading it? THAT feeling is your signal, to stop, not to tap.",
  "/audio/wren/m01-c1-art-done.mp3":
    "[warm] That's the whole pressure play. Fear, then a fake clock, then a push to act now. Some scams fake good news instead, like winning a prize. [encouraging] But underneath, it's the same trick, a strong feeling, to rush you past thinking.",
  "/audio/wren/m01-c1-review.mp3":
    "[proud] Spot on. Four pressure tricks in one message, greed, a countdown, a threat, and fear of missing out. [warm] The automated notice, the reference number and the unsubscribe line are just normal message bits, there to fool you.",
  "/audio/wren/m01-c1-play.mp3":
    "[curious] A brand-new message just landed on Sam's phone. [determined] Find EVERY part that's trying to pressure him. Some safe-looking lines are there to throw you.",

  // cycle 2 — address
  "/audio/wren/m01-c2-b1.mp3":
    "[curious] Every web address has one part that can't lie, the real name. Everything else is decoration the scammer gets to choose.",
  "/audio/wren/m01-c2-b2.mp3":
    "[warm] To find the real name, do two things. Find the first single slash. Then read the two chunks right before it.",
  "/audio/wren/m01-c2-b3.mp3":
    "[encouraging] So in account.gamehub.com/login, the two chunks before the slash are gamehub.com. That's the real owner. “account” is just a room inside their house.",
  "/audio/wren/m01-c2-b4.mp3":
    "[warm] Now the trick that fools grown-ups. Look at gamehub.com.rewards-login.net. It SAYS gamehub.com, but the last two chunks are rewards-login.net. The real name is glued on the front to trick you.",
  "/audio/wren/m01-c2-b5.mp3":
    "[determined] So never read left to right and relax the moment you see a name you know. Find the slash, take the last two chunks. That's who you're really talking to.",
  "/audio/wren/m01-c2-chk1-ok.mp3":
    "[proud] Right. The owner is the last two chunks before the slash, gamehub-rewards.co. That is not the real GameHub.",
  "/audio/wren/m01-c2-chk2-ok.mp3":
    "[proud] Nice. The paypal.com bit is just decoration. The owner is account-fix.net, the last two chunks before the slash. Fake.",
  "/audio/wren/m01-c2-play.mp3":
    "[curious] A whole batch of addresses, every one claiming to be PixelPlay. [determined] Sort each one, really PixelPlay, or a disguise wearing the name? Some are sneaky. Use the rule.",

  // cycle 3 — sender
  "/audio/wren/m01-c-sender-b1.mp3":
    "[curious] Every message shows a name at the top, like GameHub Support. But that name is just a label. The sender can type whatever they want there.",
  "/audio/wren/m01-c-sender-b2.mp3":
    "[warm] The truth is hiding one tap away. Behind the name sits the real email address, and that part is far harder to fake.",
  "/audio/wren/m01-c-sender-b3.mp3":
    "[encouraging] So you read that address exactly like a link. Find the real owner, the last two chunks. If it isn't the brand, then the friendly name was a lie.",
  "/audio/wren/m01-c-sender-b4.mp3":
    "[determined] Never trust the name on its own. Peel it back, read the real address, and only then decide.",
  "/audio/wren/m01-c3-chk1-ok.mp3":
    "[proud] Exactly. The display name is a costume. The real address, apple-account.ru, gives it away.",
  "/audio/wren/m01-c3-chk2-ok.mp3":
    "[proud] That's the rule. Names and logos are easy to fake. The real address tells the truth.",
  "/audio/wren/m01-c-sender-play.mp3":
    "[curious] A pile of messages, all signed GameHub. [determined] Tap each one to reveal the real address, then call it. Some hide the fake well.",
  "/audio/wren/m01-c-sender-review.mp3":
    "[warm] Let's check those back. The real ones all ended in gamehub.com, so the name and the address matched. [serious] The fakes hid a stranger's address behind the GameHub name. [encouraging] Names lie, but addresses don't, so always read the address, not the name.",

  // cycle 4 — qrcode
  "/audio/wren/m01-c-qr-b1.mp3":
    "[curious] Here's a sneaky one. A QR code is just a link in disguise, a little pattern of squares your camera turns into a web address.",
  "/audio/wren/m01-c-qr-b2.mp3":
    "[serious] Scammers love them, because you can't SEE where a code goes just by looking. They stick fake ones on posters, car parks, even inside emails.",
  "/audio/wren/m01-c-qr-b3.mp3":
    "[encouraging] But your phone has your back. When you scan a code, it shows you the address FIRST, before it opens anything. That little preview is the whole game.",
  "/audio/wren/m01-c-qr-b4.mp3":
    "[determined] So read that address just like any link. Find the real owner, the last two chunks. A stranger? Don't open it. Same rule, brand-new trick.",
  "/audio/wren/m01-c4-chk1-ok.mp3":
    "[proud] Right. A QR code is a link in disguise. You cannot see where it goes until you check, so treat a surprise one like any strange link.",
  "/audio/wren/m01-c4-chk2-ok.mp3":
    "[proud] Good call. A random 'free robux' link is bait. Reading where it goes before you tap just saved you.",
  "/audio/wren/m01-c-qr-play.mp3":
    "[curious] Some QR codes have turned up, each claiming to be PayZone, the parking app. [determined] Scan each one to reveal where it really goes, then call it.",
  "/audio/wren/m01-c-qr-review.mp3":
    "[proud] Nicely done. A QR code can't hide from the rule. Scan it, read the address it shows you, take the last two chunks. If it's a stranger, don't open it.",

  // cycle 5 — download
  "/audio/wren/m01-c-dl-b1.mp3":
    "[curious] Ever seen a free Robux generator, or a game hack that promises unlimited coins? Here's the truth. Those don't exist.",
  "/audio/wren/m01-c-dl-b2.mp3":
    "[serious] That download isn't free coins. It's a virus, or a trick to steal your login. The 'free prize' is just the bait, again.",
  "/audio/wren/m01-c-dl-b3.mp3":
    "[warm] Real games and apps come from one place, the official app store, or the company's own website. Never a random 'free' link.",
  "/audio/wren/m01-c-dl-b4.mp3":
    "[determined] So before you download anything, ask one question. Is this the official place? If it's a stranger's free file, close it. It's a trap.",
  "/audio/wren/m01-c5-chk1-ok.mp3":
    "[proud] Exactly. Free hacks and coin generators are classic bait for malware. Nothing good comes from them.",
  "/audio/wren/m01-c5-chk2-ok.mp3":
    "[proud] That's the safe path. Official store or the real site, never a random download link.",
  "/audio/wren/m01-c-dl-play.mp3":
    "[curious] A pile of downloads just showed up. [determined] Sort each one, safe to get, or a trap? Remember where real apps come from.",

  // cycle 6 — actor (the play)
  "/audio/wren/m01-c3-b1.mp3":
    "[excited] Here's the secret that makes you unbeatable. Every phishing scam, whatever it's dressed as, is built from the same three parts.",
  "/audio/wren/m01-c3-b2.mp3":
    "[warm] One, a feeling, to rush you. Two, a trusted name, faked. Three, a link that lies about where it goes.",
  "/audio/wren/m01-c3-b3.mp3":
    "[encouraging] You don't need all three to be sure. Spot two of them in a message, and you're almost certainly looking at a scam. Game, bank, or school, it doesn't matter.",
  "/audio/wren/m01-c3-b4.mp3":
    "[determined] And here's the move that beats every single one of them. Never act from the message itself. Go to the real app or website yourself, and check there.",
  "/audio/wren/m01-c3-b5.mp3":
    "[proud] That one habit, go direct and never tap the message, defeats every disguise he will ever wear.",
  "/audio/wren/m01-c6-chk1-ok.mp3":
    "[proud] Yes. Whatever the story, there is always a feeling pushing you to act fast. Spot that and you spot the scam.",
  "/audio/wren/m01-c6-chk2-ok.mp3":
    "[proud] Exactly. The disguise changes, the recipe does not. Know the parts and no new costume fools you.",
  "/audio/wren/m01-c3-play.mp3":
    "[determined] Now build his file. Tap the 3 tricks that are really his.",

  // cycle 7 — recover
  "/audio/wren/m01-c-recover-b1.mp3":
    "[warm] Even careful people get caught sometimes. If you ever tap a scam link or type your password into a fake page, don't panic. [encouraging] What you do NEXT matters most.",
  "/audio/wren/m01-c-recover-b2.mp3":
    "[determined] First, change your password on the REAL site, straight away. That locks the scammer out before they can use what they took.",
  "/audio/wren/m01-c-recover-b3.mp3":
    "[warm] Then make it even safer. Turn on two-step verification, so a password on its own isn't enough to get in.",
  "/audio/wren/m01-c-recover-b4.mp3":
    "[encouraging] And you're never on your own. Tell a trusted adult, and report the scam so it gets taken down. That protects you, and everyone after you.",
  "/audio/wren/m01-c7-chk1-ok.mp3":
    "[proud] Right. Change the password fast, so the stolen one stops working. Speed is everything here.",
  "/audio/wren/m01-c7-chk2-ok.mp3":
    "[proud] That's it. A trusted adult helps you lock things down and report it. You never have to handle it alone.",
  "/audio/wren/m01-c-recover-play.mp3":
    "[serious] Someone just typed their password into a fake GameHub page. [determined] Build the rescue plan.",

  // the test
  "/audio/wren/m01-catch-intro.mp3":
    "[warm] Okay Agent, this is the real test. [serious] Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned, and work out an answer you've never seen before. [determined] I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. [encouraging] Take your time.",
  "/audio/wren/m01-catch-pass.mp3":
    "[excited] That's a pass, Agent! [proud] You earned this one yourself. Case closed.",
  "/audio/wren/m01-catch-fail.mp3":
    "[warm] Not this time. [encouraging] Run the case again, and it'll stick. No shortcuts, that's how you really learn it.",

  // debrief
  "/audio/wren/m01-debrief.mp3":
    "[proud] You didn't just remember it, you worked it out. [warm] That's the real thing, Agent.",
};
