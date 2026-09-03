/**
 * Mission 01 — "Phishing" (Block 1: Signals, CONFIDENTIAL).
 * Actor: PHANTOM HOOK.
 *
 * DEPTH PASS (owner: "too easy, feels like a recap"): SEVEN skills, each
 * LEARN -> PRACTICE, then ONE must-pass blind TEST. Hands-on practice each:
 *   1 pressure  (ARTIFACT teach + INSPECT)   — the feelings a scammer fakes
 *   2 address   (beats + SORT)               — take a web address apart
 *   3 sender    (beats + UNMASK)             — the name lies, the address doesn't
 *   4 QR codes  (beats + UNMASK/scan)        — a code is just a hidden link
 *   5 downloads (beats + SORT)               — 'free' hacks/generators are traps
 *   6 the play  (beats + PROFILE)            — the three-part anatomy + go direct
 *   7 recovery  (beats + BUILD)              — the rescue plan if you get caught
 * Lessons teach the REASONING; the practices and the blind final test are
 * think-for-yourself on fresh material, never "what did WREN say".
 * This is the template the other 19 copy.
 */

import Mission01Incident from "../incidents/Mission01Incident";
import type { MissionManifest } from "../engine/types";

export const mission01: MissionManifest = {
  id: "explorers-m01",
  caseNumber: "CASE 001",
  title: "Phishing",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "PHANTOM HOOK",
    mo: "Fake 'urgent' messages that copy apps you trust.",
    portrait: "/explorers/actors/phantom-hook.png",
  },

  hook: "A fake email nearly tricked Maya out of her game account. Let's find out how it works, and catch the one who sent it.",
  scene: "/explorers/scenes/m01-cold-open.jpg",

  transmission: {
    headline: "SIGNAL DETECTED",
    lines: [
      "Maya just got a message. It says her game account will be deleted in 24 hours.",
      "It's got a scary countdown and big shouty capital letters.",
      "She almost tapped it. Most people would, and that's exactly what the hacker wants.",
      "But it's a fake. And the hacker who sent it made some mistakes. Let's go find them.",
    ],
  },

  briefing: {
    summary:
      "It's one fake email. Its whole job is to scare you into typing your password fast. Learn how it's built, and you'll spot every one like it.",
    objectives: [
      "Spot the tricks that rush you",
      "Check links, senders, QR codes and downloads",
      "Beat the pattern, and bounce back if you slip",
    ],
    wrenLine: "Seven skills, then a test to close the case. This test makes you THINK, it won't just ask what I said. So learn it properly. Ready?",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: spot the pressure */
    {
      id: "lure",
      title: "Spot the pressure",
      concept: "Scammers fake a strong feeling to rush you past thinking",
      checkpoint: {
        questions: [
          { id: "m01-c1-chk1", question: "A message says 'Your account will be DELETED in 1 hour unless you act NOW!'. What trick is it using?", options: ["Fake urgency to rush you past thinking", "A friendly hello", "A helpful reminder"], answer: 0, ok: "Exactly. That scary countdown is there to panic you into acting before you think. Real companies never rush you like that.", okVoice: "/audio/wren/m01-c1-chk1-ok.mp3" },
          { id: "m01-c1-chk2", question: "A message gives you a sudden jolt of fear or excitement. What's the smart first move?", options: ["Do what it says right away", "Stop and slow down before doing anything", "Forward it to all your friends"], answer: 1, ok: "That's it. The feeling is the trap. Slowing down is how you beat it every single time.", okVoice: "/audio/wren/m01-c1-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn the feelings a scammer fakes, and how to catch it.",
      instruction: "Read this NEW message. Select every part that's trying to pressure you, then submit.",
      intel: {
        beats: [
          "A scammer can't reach through the screen and make you do anything. So they do the next best thing. They make you FEEL something strong, fast.",
          "There are three feelings they fake again and again. Fear: your account's in danger. Greed: you've won something. And rush: act NOW, or lose it.",
          "Here's the tell most people miss. A real message gives you time. A scam slams a clock on you, so you move before your brain catches up.",
          "So no real company will ever say your account gets deleted in an hour. That countdown isn't a warning. It's the bait.",
          "Which means the feeling itself is your clue. The moment a message makes you panic or rush, that's the signal to STOP, not to tap.",
        ],
        beatAudio: [
          "/audio/wren/m01-c1-b1.mp3",
          "/audio/wren/m01-c1-b2.mp3",
          "/audio/wren/m01-c1-b3.mp3",
          "/audio/wren/m01-c1-b4.mp3",
          "/audio/wren/m01-c1-b5.mp3",
        ],
        // Delivery: teach ON the real message (not chat bubbles). The child taps
        // the parts that pressure them and uncovers the feeling each one fakes.
        artifact: {
          intro: "This is the message that nearly caught Maya. Let me show you the three tricks hiding in it. Tap each highlighted part and I'll explain exactly how it works on you.",
          introAudio: "/audio/wren/m01-c1-art-intro.mp3",
          device: { app: "MAIL", owner: "MAYA'S PHONE" },
          segments: [
            { id: "from", text: "From: GameHub Support" },
            { id: "hi", text: "Hi player," },
            { id: "prob", text: "We've spotted a problem with your account." },
            { id: "s-threat", text: "Your account will be permanently DELETED", hotspotId: "threat" },
            { id: "s-clock", text: "unless you act within the next 24 hours.", hotspotId: "clock" },
            { id: "s-now", text: "Verify your password NOW to save it.", hotspotId: "now" },
            { id: "sig", text: "The GameHub Team" },
          ],
          hotspots: [
            {
              id: "threat",
              label: "The threat",
              reveal: "This one fakes FEAR. It puts something you care about, your account, in danger, so you feel scared. And scared people act fast, without stopping to think.",
              audio: "/audio/wren/m01-c1-art-threat.mp3",
            },
            {
              id: "clock",
              label: "The countdown",
              reveal: "This one fakes RUSH. A real company would give you time. This clock is made up, it's only here to hurry you along before your brain catches up.",
              audio: "/audio/wren/m01-c1-art-clock.mp3",
            },
            {
              id: "now",
              label: "The push",
              reveal: "See the word NOW? Every line is shoving you to act this second. That jolt of panic you feel reading it? THAT feeling is your signal, to stop, not to tap.",
              audio: "/audio/wren/m01-c1-art-now.mp3",
            },
          ],
          doneLine: "That's the whole pressure play. Fear, then a fake clock, then a push to act now. Some scams fake good news instead, like winning a prize. But underneath, it's the same trick. A strong feeling, to rush you past thinking.",
          doneAudio: "/audio/wren/m01-c1-art-done.mp3",
        },
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          // PRACTICE on a NEW message (a prize scam), so they APPLY "spot the
          // pressure" rather than re-recognise the one they were taught on.
          // Select the 3 pressure lines; the 4 safe lines are decoys.
          // Harder than the taught example: FOUR pressure lines hidden among five
          // official-looking decoys (automated notice, reference number, unsubscribe
          // footer). Miss one tell OR tap a safe line and the submit fails, so it's
          // a real discrimination call, not "tap the shouty ones".
          intro: "A brand-new message just landed on Sam's phone. Find EVERY part that's trying to pressure him. Some safe-looking lines are there to throw you.",
          device: { app: "TEXTS", owner: "SAM'S PHONE" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "+44 7700 900418 (unknown)" } },
          ],
          body: [
            [{ id: "greet", text: "Hi there!" }],
            [{ id: "auto", text: "This is an automated message from our rewards system." }],
            [{ id: "win", text: "You've been specially chosen to WIN a £100 voucher!", tellId: "greed" }],
            [{ id: "rush", text: "Claim it in the next 15 minutes, before it's gone.", tellId: "rush" }],
            [{ id: "ref", text: "Your reference number is 4471-B." }],
            [{ id: "loss", text: "Miss the deadline and your prize is GONE for good.", tellId: "loss" }],
            [{ id: "fomo", text: "Everyone else has already claimed theirs, don't be left out.", tellId: "fomo" }],
            [{ id: "unsub", text: "Reply STOP to unsubscribe." }],
            [{ id: "sig", text: "The Prizes Team" }],
          ],
          tells: [
            {
              id: "greed",
              label: "Fake good news",
              why: "That's GREED, being told you've won gets you excited so you act without checking.",
            },
            {
              id: "rush",
              label: "The countdown",
              why: "That's RUSH, a made-up 15-minute clock to hurry you before you think.",
            },
            {
              id: "loss",
              label: "The threat",
              why: "That's FEAR, threatening to snatch the prize away so you panic and act now.",
            },
            {
              id: "fomo",
              label: "Fear of missing out",
              why: "Everyone's-doing-it pressure, scaring you that you'll be the one who loses out.",
            },
          ],
          doneLine: "Spot on. Four pressure tricks in one message: greed, a countdown, a threat, and fear of missing out. The automated notice, the reference number and the unsubscribe line are just normal message bits, there to fool you.",
          doneAudio: "/audio/wren/m01-c1-review.mp3",
        },
      },
      playAudio: "/audio/wren/m01-c1-play.mp3",
    },

    /* -------------------------------------- cycle 2: take apart the address */
    {
      id: "address",
      title: "Take apart the address",
      concept: "The real owner is the last two chunks before the first slash",
      checkpoint: {
        questions: [
          { id: "m01-c2-chk1", question: "Read the link. Who really owns it?", evidence: "login.gamehub-rewards.co/verify", options: ["gamehub-rewards.co", "login.gamehub", "gamehub.com"], answer: 0, ok: "Right. The owner is the last two chunks before the first slash: gamehub-rewards.co. That is not the real GameHub.", okVoice: "/audio/wren/m01-c2-chk1-ok.mp3" },
          { id: "m01-c2-chk2", question: "Is this the real paypal.com?", evidence: "secure.paypal.com.account-fix.net/login", options: ["Yes, it says paypal.com", "No, the owner is account-fix.net", "Yes, it says secure"], answer: 1, ok: "Nice. The paypal.com bit is just decoration. The owner is account-fix.net, the last two chunks before the slash. Fake.", okVoice: "/audio/wren/m01-c2-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to find who a link REALLY goes to, even the sneaky ones.",
      instruction: "Sort each address: really the brand, or a disguise?",
      intel: {
        beats: [
          "Every web address has one part that can't lie: the real name. Everything else is decoration the scammer gets to choose.",
          "To find the real name, do two things. Find the first single slash. Then read the two chunks right before it.",
          "So in account.gamehub.com/login, the two chunks before the slash are gamehub.com. That's the real owner. “account” is just a room inside their house.",
          "Now the trick that fools grown-ups. Look at gamehub.com.rewards-login.net. It SAYS gamehub.com, but the last two chunks are rewards-login.net. The real name is glued on the front to trick you.",
          "So never read left to right and relax the moment you see a name you know. Find the slash, take the last two chunks. That's who you're really talking to.",
        ],
        beatAudio: [
          "/audio/wren/m01-c2-b1.mp3",
          "/audio/wren/m01-c2-b2.mp3",
          "/audio/wren/m01-c2-b3.mp3",
          "/audio/wren/m01-c2-b4.mp3",
          "/audio/wren/m01-c2-b5.mp3",
        ],
      },
      fieldwork: {
        verb: "SORT",
        payload: {
          // PRACTICE the address rule on SIX fresh addresses (brand never seen in
          // the lesson). The child must apply "last two chunks before the first
          // slash" to each one to place it, not recognise a taught example.
          intro: "A whole batch of addresses, every one claiming to be PixelPlay. Sort each one: really PixelPlay, or a disguise wearing the name? Some are sneaky. Use the rule.",
          buckets: [
            { id: "real", label: "REALLY PIXELPLAY", hint: "ends in pixelplay.com" },
            { id: "fake", label: "A DISGUISE", hint: "a stranger's site" },
          ],
          items: [
            { id: "a1", label: "account.pixelplay.com", bucket: "real", why: "The last two chunks before any slash are pixelplay.com. That's the real owner. 'account' is just a room inside it." },
            { id: "a2", label: "pixelplay.com/redeem", bucket: "real", why: "Find the first slash, read the two chunks before it: pixelplay.com. Real owner. '/redeem' is only a page inside." },
            { id: "a3", label: "help.pixelplay.com", bucket: "real", why: "Last two chunks: pixelplay.com. 'help' is just a room inside the real site." },
            { id: "a4", label: "eu.login.pixelplay.com", bucket: "real", why: "However many rooms in front, the last two chunks are still pixelplay.com. Real owner." },
            { id: "a5", label: "pixelplay.com.free-coins.net", bucket: "fake", why: "Read the LAST two chunks: free-coins.net. 'pixelplay.com' is glued on the front to fool you." },
            { id: "a6", label: "login.pixelplay.rewards.io", bucket: "fake", why: "The last two chunks are rewards.io, a stranger. 'pixelplay' is just decoration in the middle." },
            { id: "a7", label: "pixelplay-support.net", bucket: "fake", why: "The owner is pixelplay-support.net, a name a stranger made up. The real one is simply pixelplay.com." },
            { id: "a8", label: "secure-login.net/pixelplay.com", bucket: "fake", why: "Before the first slash it's secure-login.net, a stranger. 'pixelplay.com' is only in the path AFTER the slash." },
            { id: "a9", label: "get.pixelplay.deals.com", bucket: "fake", why: "The last two chunks are deals.com, a stranger. 'pixelplay' is just a room in the middle, not the owner." },
          ],
          doneLine: "That's the rule in action. Ignore the front, ignore anything after the slash, find the first slash and read the two chunks before it. No glued-on name can fool you now.",
        },
      },
      playAudio: "/audio/wren/m01-c2-play.mp3",
    },

    /* -------------------------------------------- cycle 3: check the sender */
    {
      id: "sender",
      title: "Check the sender",
      concept: "The friendly name is a costume; the real address tells the truth",
      checkpoint: {
        questions: [
          { id: "m01-c3-chk1", question: "An email's name says 'Apple Support' but the address is help@apple-account.ru. Who really sent it?", options: ["Apple, the name says so", "Not Apple, look at the real address", "You cannot tell"], answer: 1, ok: "Exactly. The display name is a costume. The real address, apple-account.ru, gives it away.", okVoice: "/audio/wren/m01-c3-chk1-ok.mp3" },
          { id: "m01-c3-chk2", question: "Where do you look to know who REALLY sent a message?", options: ["The actual email address, not the display name", "The friendly name at the top", "The nice logo"], answer: 0, ok: "That's the rule. Names and logos are easy to fake. The real address tells the truth.", okVoice: "/audio/wren/m01-c3-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to see past the name and read who REALLY sent it.",
      instruction: "Unmask each sender, then call real or fake.",
      intel: {
        beats: [
          "Every message shows a name at the top, like GameHub Support. But that name is just a label. The sender can type whatever they want there.",
          "The truth is hiding one tap away. Behind the name sits the real email address, and that part is far harder to fake.",
          "So you read that address exactly like a link. Find the real owner, the last two chunks. If it isn't the brand, then the friendly name was a lie.",
          "Never trust the name on its own. Peel it back, read the real address, and only then decide.",
        ],
        beatAudio: [
          "/audio/wren/m01-c-sender-b1.mp3",
          "/audio/wren/m01-c-sender-b2.mp3",
          "/audio/wren/m01-c-sender-b3.mp3",
          "/audio/wren/m01-c-sender-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "UNMASK",
        payload: {
          intro: "A pile of messages, all signed GameHub. Tap each one to reveal the real address, then call it. Some hide the fake well.",
          brand: "GameHub",
          items: [
            { id: "s1", displayName: "GameHub Support", address: "support@gamehub.com", real: true, why: "The real owner is gamehub.com. The name and the address match. Genuine." },
            { id: "s2", displayName: "GameHub Security", address: "alert@gamehub.com.account-check.net", real: false, why: "The real owner is account-check.net, a stranger. 'gamehub.com' is glued on the front to fool you." },
            { id: "s3", displayName: "GameHub Rewards", address: "prizes@gamehub-rewards.net", real: false, why: "gamehub-rewards.net is a made-up name a stranger owns. The real GameHub is simply gamehub.com." },
            { id: "s4", displayName: "GameHub Team", address: "noreply@mail.gamehub.com", real: true, why: "The last two chunks are gamehub.com. 'mail' is just a room inside the real site." },
            { id: "s5", displayName: "GameHub Accounts", address: "help@accounts.gamehub.com", real: true, why: "The last two chunks are gamehub.com. 'accounts' is just another room inside the real site." },
            { id: "s6", displayName: "GameHub Care", address: "care@gamehub.support-team.com", real: false, why: "The real owner is support-team.com, a stranger. 'gamehub' is just a room in the middle, not the owner." },
          ],
          doneLine: "Let's check those back. The real ones all ended in gamehub.com, so the name and the address matched. The fakes hid a stranger's address behind the GameHub name. Names lie, but addresses don't, so always read the address, not the name.",
          doneAudio: "/audio/wren/m01-c-sender-review.mp3",
        },
      },
      playAudio: "/audio/wren/m01-c-sender-play.mp3",
    },

    /* ------------------------------------------------ cycle 4: scan with care */
    {
      id: "qrcode",
      title: "Scan with care",
      concept: "A QR code is just a hidden link, so check where it really goes before you scan",
      checkpoint: {
        questions: [
          { id: "m01-c4-chk1", question: "A poster says 'Scan for a free 50 pound gift card!'. What is a QR code really?", options: ["A hidden link your eyes cannot read", "A safe official stamp", "Just a fun picture"], answer: 0, ok: "Right. A QR code is a link in disguise. You cannot see where it goes until you check, so treat a surprise one like any strange link.", okVoice: "/audio/wren/m01-c4-chk1-ok.mp3" },
          { id: "m01-c4-chk2", question: "Your phone shows a QR code leads to 'free-robux-now.xyz'. What do you do?", options: ["Open it, free stuff", "Scan it again to be sure", "Do not open it, it is a trap"], answer: 2, ok: "Good call. A random 'free robux' link is bait. Reading where it goes before you tap just saved you.", okVoice: "/audio/wren/m01-c4-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to see where a QR code REALLY takes you, before it opens.",
      instruction: "Scan each code, read the address, then call it.",
      intel: {
        beats: [
          "Here's a sneaky one. A QR code is just a link in disguise, a little pattern of squares your camera turns into a web address.",
          "Scammers love them, because you can't SEE where a code goes just by looking. They stick fake ones on posters, car parks, even inside emails.",
          "But your phone has your back. When you scan a code, it shows you the address FIRST, before it opens anything. That little preview is the whole game.",
          "So read that address just like any link. Find the real owner, the last two chunks. A stranger? Don't open it. Same rule, brand-new trick.",
        ],
        beatAudio: [
          "/audio/wren/m01-c-qr-b1.mp3",
          "/audio/wren/m01-c-qr-b2.mp3",
          "/audio/wren/m01-c-qr-b3.mp3",
          "/audio/wren/m01-c-qr-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "UNMASK",
        payload: {
          intro: "Some QR codes have turned up, each claiming to be PayZone, the parking app. Scan each one to reveal where it really goes, then call it.",
          brand: "PayZone",
          sourceLabel: "QR CODE",
          revealText: "▸ TAP TO SCAN THE CODE",
          items: [
            { id: "q1", displayName: "Car park payment", address: "pay.payzone.com", real: true, why: "The last two chunks are payzone.com, the real parking app. Safe to scan." },
            { id: "q2", displayName: "Unpaid fine, pay now", address: "payzone.com.quick-pay.net", real: false, why: "Read the LAST two chunks: quick-pay.net, a stranger. 'payzone.com' is glued on the front." },
            { id: "q3", displayName: "Top up your balance", address: "app.payzone.com", real: true, why: "Last two chunks: payzone.com. 'app' is just a room inside the real site." },
            { id: "q4", displayName: "Free parking offer", address: "payzone-refund.net", real: false, why: "The owner is payzone-refund.net, a name a stranger made up. The real one is simply payzone.com." },
            { id: "q5", displayName: "Scan to renew", address: "renew.payzone.billing.io", real: false, why: "The last two chunks are billing.io, a stranger. 'payzone' is just decoration in the middle." },
          ],
          doneLine: "Nicely done. A QR code can't hide from the rule. Scan it, read the address it shows you, take the last two chunks. If it's a stranger, don't open it.",
          doneAudio: "/audio/wren/m01-c-qr-review.mp3",
        },
      },
      playAudio: "/audio/wren/m01-c-qr-play.mp3",
    },

    /* ------------------------------------------- cycle 5: don't download the trap */
    {
      id: "download",
      title: "Don't download the trap",
      concept: "Free hacks and generators are traps; real apps come only from the official store or site",
      checkpoint: {
        questions: [
          { id: "m01-c5-chk1", question: "A site offers a 'free game hack that gives unlimited coins'. What is it most likely?", options: ["A trap that installs something harmful", "A helpful free tool", "An official update"], answer: 0, ok: "Exactly. Free hacks and coin generators are classic bait for malware. Nothing good comes from them.", okVoice: "/audio/wren/m01-c5-chk1-ok.mp3" },
          { id: "m01-c5-chk2", question: "Where should you get your apps and games from?", options: ["Any link a stranger sends", "The official app store or the real website", "A random 'free download' site"], answer: 1, ok: "That's the safe path. Official store or the real site, never a random download link.", okVoice: "/audio/wren/m01-c5-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn why 'free' downloads are bait, and where safe ones really come from.",
      instruction: "Sort each download: safe to get, or a trap?",
      intel: {
        beats: [
          "Ever seen a free Robux generator, or a game hack that promises unlimited coins? Here's the truth. Those don't exist.",
          "That download isn't free coins. It's a virus, or a trick to steal your login. The 'free prize' is just the bait, again.",
          "Real games and apps come from one place: the official app store, or the company's own website. Never a random 'free' link.",
          "So before you download anything, ask one question. Is this the official place? If it's a stranger's free file, close it. It's a trap.",
        ],
        beatAudio: [
          "/audio/wren/m01-c-dl-b1.mp3",
          "/audio/wren/m01-c-dl-b2.mp3",
          "/audio/wren/m01-c-dl-b3.mp3",
          "/audio/wren/m01-c-dl-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "SORT",
        payload: {
          intro: "A pile of downloads just showed up. Sort each one: safe to get, or a trap? Remember where real apps come from.",
          buckets: [
            { id: "safe", label: "SAFE TO GET", hint: "official store or site" },
            { id: "trap", label: "A TRAP", hint: "a stranger's 'free' file" },
          ],
          items: [
            { id: "d1", label: "Fortnite from the App Store", bucket: "safe", why: "The official app store, exactly where real games come from. Safe." },
            { id: "d2", label: "free-robux-generator.exe (from a pop-up)", bucket: "trap", why: "Free Robux generators don't exist. That file is a virus, not a prize." },
            { id: "d3", label: "Minecraft from minecraft.net", bucket: "safe", why: "The company's own real website. Safe." },
            { id: "d4", label: "unlimited-coins-hack.exe", bucket: "trap", why: "A 'hack' that gives free coins is bait. It's malware, not magic." },
            { id: "d5", label: "A worksheet your teacher emailed you", bucket: "safe", why: "A file you were expecting, from someone you know. Fine to open." },
            { id: "d6", label: "gta5-free-full-game.zip (from a forum)", bucket: "trap", why: "A pricey game, 'free' from a stranger's forum? That's a trap every time." },
          ],
          doneLine: "That's the rule. Real apps come from the official store or the real site. A stranger's 'free' hack, generator or full game is always the bait, so close it.",
        },
      },
      playAudio: "/audio/wren/m01-c-dl-play.mp3",
    },

    /* ---------------------------------------- cycle 6: know the play */
    {
      id: "actor",
      title: "Know the play",
      concept: "Every phishing scam is built from the same three parts",
      checkpoint: {
        questions: [
          { id: "m01-c6-chk1", question: "Every phishing scam is built from the same parts. Which is one of them?", options: ["A strong feeling that rushes you", "A handwritten letter", "A visit from your teacher"], answer: 0, ok: "Yes. Whatever the story, there is always a feeling pushing you to act fast. Spot that and you spot the scam.", okVoice: "/audio/wren/m01-c6-chk1-ok.mp3" },
          { id: "m01-c6-chk2", question: "Why is knowing the phishing recipe so useful?", options: ["It only works on old scams", "You can spot a brand-new scam you've never seen", "You can write your own scams"], answer: 1, ok: "Exactly. The disguise changes, the recipe does not. Know the parts and no new costume fools you.", okVoice: "/audio/wren/m01-c6-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn the pattern behind every disguise, and the one move that beats it.",
      instruction: "Tap the 3 tricks that are really his.",
      intel: {
        beats: [
          "Here's the secret that makes you unbeatable. Every phishing scam, whatever it's dressed as, is built from the same three parts.",
          "One: a feeling, to rush you. Two: a trusted name, faked. Three: a link that lies about where it goes.",
          "You don't need all three to be sure. Spot two of them in a message, and you're almost certainly looking at a scam. Game, bank, or school, it doesn't matter.",
          "And here's the move that beats every single one of them. Never act from the message itself. Go to the real app or website yourself, and check there.",
          "That one habit, go direct and never tap the message, defeats every disguise he will ever wear.",
        ],
        beatAudio: [
          "/audio/wren/m01-c3-b1.mp3",
          "/audio/wren/m01-c3-b2.mp3",
          "/audio/wren/m01-c3-b3.mp3",
          "/audio/wren/m01-c3-b4.mp3",
          "/audio/wren/m01-c3-b5.mp3",
        ],
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Now build his file. Tap the 3 tricks that are really his.",
          evidence: [
            "Made up a 24-hour countdown to rush Maya",
            "Sent it from gamehub-rewards-center.com, pretending to be GameHub",
            "The button said GameHub, but the link went to support-verify.net",
          ],
          behaviors: [
            { id: "deadline", label: "Makes up a countdown to rush you", matches: true },
            { id: "costume", label: "Uses a trusted name over a stranger's address", matches: true },
            { id: "mislink", label: "Sends links that lie about where they go", matches: true },
            { id: "logo", label: "Copies a company's exact logo and colours", matches: false },
            { id: "spell", label: "Misspells words to slip past spam filters", matches: false },
            { id: "guess", label: "Tries to guess your password over and over", matches: false },
            { id: "voice", label: "Fakes a friend's voice on a phone call", matches: false },
            { id: "meet", label: "Asks to meet you in person", matches: false },
          ],
          picks: 3,
          doneLine: "That's his pattern, straight from the evidence: the countdown, the faked name, the lying link. Copying a logo or misspelling words are real scammer tricks too, but they're not what THIS file shows. Next time, he'll just wear a different disguise.",
        },
      },
      playAudio: "/audio/wren/m01-c3-play.mp3",
    },

    /* ------------------------------------------- cycle 7: if you get caught */
    {
      id: "recover",
      title: "If you get caught",
      concept: "If you slip and click or type your password, fast action keeps you safe",
      checkpoint: {
        questions: [
          { id: "m01-c7-chk1", question: "You typed your password into a fake site by mistake. What's the FIRST thing to do?", options: ["Change that password right away", "Say nothing and hope", "Turn off your phone"], answer: 0, ok: "Right. Change the password fast, so the stolen one stops working. Speed is everything here.", okVoice: "/audio/wren/m01-c7-chk1-ok.mp3" },
          { id: "m01-c7-chk2", question: "After a slip like that, who should you tell?", options: ["Nobody, keep it secret", "A trusted adult, so they can help", "Only the scammer"], answer: 1, ok: "That's it. A trusted adult helps you lock things down and report it. You never have to handle it alone.", okVoice: "/audio/wren/m01-c7-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn the exact rescue steps if a scam ever catches you.",
      instruction: "Build the rescue plan: pick the right move for each step.",
      intel: {
        beats: [
          "Even careful people get caught sometimes. If you ever tap a scam link or type your password into a fake page, don't panic. What you do NEXT matters most.",
          "First, change your password on the REAL site, straight away. That locks the scammer out before they can use what they took.",
          "Then make it even safer. Turn on two-step verification, so a password on its own isn't enough to get in.",
          "And you're never on your own. Tell a trusted adult, and report the scam so it gets taken down. That protects you, and everyone after you.",
        ],
        beatAudio: [
          "/audio/wren/m01-c-recover-b1.mp3",
          "/audio/wren/m01-c-recover-b2.mp3",
          "/audio/wren/m01-c-recover-b3.mp3",
          "/audio/wren/m01-c-recover-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Someone just typed their password into a fake GameHub page. Build the rescue plan.",
          target: "The rescue plan",
          slots: [
            {
              id: "first",
              label: "The very first move",
              options: [
                { id: "pw", label: "Change your password on the real site now", good: true, why: "Yes. That locks the scammer out before they can use what they stole." },
                { id: "check", label: "Log back in to double-check nothing changed", good: false, why: "Not first, and never on the fake page. Change the password first, THEN check on the real site." },
                { id: "off", label: "Turn your device off and wait a while", good: false, why: "That changes nothing. The stolen password still works. Change it first." },
              ],
            },
            {
              id: "lock",
              label: "Lock it down harder",
              options: [
                { id: "2fa", label: "Turn on two-step verification", good: true, why: "Now a password alone can't get in. A strong second lock." },
                { id: "easy", label: "Pick a new password that's easy to remember", good: false, why: "A weak new password isn't a stronger lock. Add two-step so a password alone can't get in." },
                { id: "clear", label: "Just clear your browser history", good: false, why: "That hides nothing from the scammer. Add a real second lock instead." },
              ],
            },
            {
              id: "accounts",
              label: "Your other accounts",
              options: [
                { id: "reuse", label: "Change it anywhere you used the same password", good: true, why: "If you reused that password, the scammer can try it everywhere. Change it on all of them." },
                { id: "leave", label: "Leave your other accounts, they're fine", good: false, why: "They're not. A reused password means one leak can open them all." },
                { id: "clone", label: "Give every account the same new password", good: false, why: "One leak would unlock them all again. Each account needs its own password." },
              ],
            },
            {
              id: "tell",
              label: "Get help",
              options: [
                { id: "adult", label: "Tell a trusted adult", good: true, why: "Always. They can help you check everything is safe." },
                { id: "solo", label: "Sort it out yourself so no one worries", good: false, why: "Keeping it secret helps the scammer. A trusted adult helps you." },
                { id: "post", label: "Post what happened on social media", good: false, why: "That doesn't protect your account, and it's not the same as telling someone you trust." },
              ],
            },
            {
              id: "report",
              label: "Protect other people",
              options: [
                { id: "report", label: "Report the scam message", good: true, why: "Reporting gets it taken down, so it can't catch the next person." },
                { id: "forward", label: "Forward it round to warn your friends", good: false, why: "That just spreads the live bait. Warn people in words, but report the message itself." },
                { id: "block", label: "Block the sender and move on", good: false, why: "Blocking protects only you. Reporting gets it taken down for everyone." },
              ],
            },
          ],
          testLine: "PLAN HOLDS: account secured.",
          doneLine: "Change it, lock it, protect your other accounts, tell someone, report it. That's the full rescue plan.",
        },
      },
      playAudio: "/audio/wren/m01-c-recover-play.mp3",
    },
  ],

  incident: {
    title: "The Second Wave",
    phases: 3,
    phaseNames: ["Sort the flood", "Cut the hooks", "Send the report"],
    component: Mission01Incident,
  },

  catchThem: {
    intro:
      "Okay Agent, this is the real test. Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned and work out an answer you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. Take your time.",
    pass: 15,
    voice: {
      intro: "/audio/wren/m01-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // Think-for-yourself, ten questions covering ALL FIVE skills (two each,
    // interleaved). Fresh brands/scenarios that never appear in the lessons or
    // practice, with twists that punish surface-reading (a scary message that's
    // actually safe, a real link that looks messy, a friendly sender name over a
    // stranger's address). Every question is 100% answerable from the LEARN
    // material. Options shuffle at render, so the answer is never a fixed slot.
    // skill: 0 pressure · 1 address · 2 sender · 3 the play · 4 recovery.
    scenarios: [
      {
        id: "ct1",
        skill: 0,
        prompt: "Four messages land at once. Which one is NOT trying to pressure you?",
        options: [
          "“Reminder: your library book is due back next Tuesday.”",
          "“URGENT: your account closes in 1 hour unless you act!”",
          "“You've WON a new phone! Claim in the next 5 minutes!”",
          "“Final warning: verify your details NOW or lose access.”",
        ],
        answer: 0,
      },
      {
        id: "ct2",
        skill: 1,
        prompt: "Where does this link REALLY go? Look carefully, the brand name is in there somewhere.",
        evidence: "secure-verify.net/streamnow.com/login",
        options: [
          "secure-verify.net, a stranger",
          "The real StreamNow at streamnow.com",
          "StreamNow's own genuine login page",
          "A login page hosted at login.com",
        ],
        answer: 0,
      },
      {
        id: "ct3",
        skill: 2,
        prompt: "An email's sender name says “Netflix Help”. You tap to reveal the real address behind it. Real or fake?",
        evidence: "help@netflix.account-verify.com",
        options: [
          "Fake, the real owner is a stranger",
          "Real, the name Netflix is right there",
          "Real, it was sent from Netflix Help",
          "There's no way to tell from the address",
        ],
        answer: 0,
      },
      {
        id: "ct4",
        skill: 5,
        prompt: "An email is a flawless copy of QuickPay: perfect logo, zero spelling mistakes, and it even arrives the day your bill is due. It rushes you to tap a link that goes to quickpay-support.net. Scam or safe?",
        options: [
          "Scam, the rush and fake link give it away",
          "Safe, the logo and spelling are flawless",
          "Safe, it came on exactly the right day",
          "Can't tell without phoning QuickPay first",
        ],
        answer: 0,
      },
      {
        id: "ct5",
        skill: 6,
        prompt: "You just typed your password into a fake game site. What's the FIRST thing to do?",
        options: [
          "Change your password on the real site",
          "Turn the computer off and hope it's fine",
          "Wait and see if anything bad happens",
          "Make a whole new account instead",
        ],
        answer: 0,
      },
      {
        id: "ct6",
        skill: 0,
        prompt: "A message says: “You're today's lucky winner, but only for the next 10 minutes, grab it before someone else does!” There's no scary threat at all. Is it using pressure?",
        options: [
          "Yes, the rush and excitement are pressure",
          "No, good news like this is always safe",
          "No, there's nothing bad being threatened here at all",
          "Only if it also contains a link to tap",
        ],
        answer: 0,
      },
      {
        id: "ct7",
        skill: 1,
        prompt: "This link looks long and messy. Using the rule, is it really PlayVault?",
        evidence: "account.security.login.playvault.com/reset",
        options: [
          "Yes, it ends in playvault.com before the slash",
          "No, it has far too many words to be real",
          "No, the word 'security' at the front is a red flag",
          "You can't tell with this many parts",
        ],
        answer: 0,
      },
      {
        id: "ct8",
        skill: 2,
        prompt: "A message's sender name is “Your School”. Should the name on its own tell you it's safe?",
        options: [
          "No, check the address behind the name",
          "Yes, that name proves it's your school",
          "Yes, a school's name can't be copied",
          "Only if there are no spelling mistakes",
        ],
        answer: 0,
      },
      {
        id: "ct9",
        skill: 5,
        prompt: "Your best friend messages you an amazing free-game link. It really is your friend's account. Is it safe to log in through their link?",
        options: [
          "No, their account could be hacked",
          "Yes, it's your best friend after all",
          "Yes, friends would never send a scam",
          "Only if the link looks normal to you",
        ],
        answer: 0,
      },
      {
        id: "ct10",
        skill: 6,
        prompt: "You've changed your password after a scam caught you. What else keeps your account safe?",
        options: [
          "Turn on two-step and tell a trusted adult",
          "Keep the whole thing secret so nobody worries",
          "Put your old password back for now",
          "Tap the scam link again just to check",
        ],
        answer: 0,
      },
      {
        id: "ct11",
        skill: 0,
        prompt: "“Act now or your photos are deleted forever!” Which trick is this?",
        options: [
          "Fear, it threatens what you care about",
          "Greed, it's offering you a nice prize",
          "Nothing, deletion warnings are always fine",
          "It's just a normal, helpful reminder",
        ],
        answer: 0,
      },
      {
        id: "ct12",
        skill: 1,
        prompt: "Where does this link REALLY go? The brand name is in there to fool you.",
        evidence: "account-help.com/paypal.com/login",
        options: [
          "account-help.com, a stranger",
          "paypal.com, the real PayPal",
          "PayPal's own account help page",
          "A site called login.com",
        ],
        answer: 0,
      },
      {
        id: "ct13",
        skill: 2,
        prompt: "An email's sender name is “Apple”. You reveal the address behind it. Real or fake?",
        evidence: "no-reply@apple.security-alerts.com",
        options: [
          "Fake, a stranger owns the real address",
          "Real, the word Apple is right there in it",
          "Real, it's an official security alert",
          "There's no way to know from the address",
        ],
        answer: 0,
      },
      {
        id: "ct14",
        skill: 5,
        prompt: "A message has a faked sender name AND rushes you, but you can't check its link. How many scam parts is that, and what do you do?",
        options: [
          "Two already, don't tap, go direct",
          "Zero, wait until you see the link",
          "One, so it's probably safe enough",
          "Three, every message has all three",
        ],
        answer: 0,
      },
      {
        id: "ct15",
        skill: 6,
        prompt: "You used the same password on three sites, and one just got phished. What must you do?",
        options: [
          "Change it on all three sites",
          "Only change the one that got phished",
          "Change nothing, a single leak is fine",
          "Delete all three of the accounts to be safe",
        ],
        answer: 0,
      },
      {
        id: "ctQR1",
        skill: 3,
        prompt: "A poster's QR code says “Scan for free cinema tickets!” You scan it and it previews the address below. Safe or a trap?",
        evidence: "freetickets.scan-win.net",
        options: [
          "A trap, a stranger owns that address",
          "Safe, it's offering you free tickets",
          "Safe, the code was on a real poster",
          "You can never tell from a QR code",
        ],
        answer: 0,
      },
      {
        id: "ctQR2",
        skill: 3,
        prompt: "You scan a QR code and it previews this address before opening. Should you go ahead?",
        evidence: "shop.pixelplay.com",
        options: [
          "Yes, it ends in pixelplay.com",
          "No, QR codes are always scams",
          "No, it has extra words in front",
          "Only if there's no countdown too",
        ],
        answer: 0,
      },
      {
        id: "ctDL1",
        skill: 4,
        prompt: "A YouTuber links a “free V-Bucks generator.exe” in the description. What is it?",
        options: [
          "A trap, those generators are fake",
          "Real, YouTubers only share safe files",
          "Real, because it ends in dot exe",
          "Safe if you virus-scan it first",
        ],
        answer: 0,
      },
      {
        id: "ctDL2",
        skill: 4,
        prompt: "Where's the ONLY safe place to get a brand-new game?",
        options: [
          "The official store or real site",
          "Any link a friend sends you",
          "A forum that offers it for free",
          "Wherever it downloads the fastest",
        ],
        answer: 0,
      },
    ],
  },

  debrief: {
    report: [
      "You took the fake email apart: the feeling it faked, the sneaky sender, and the link that lied.",
      "You made the right call: open the real app, report it, and don't tap any links.",
      "The second wave is sorted. Phantom Hook's plan is stopped and on the record.",
    ],
    realWorldMove:
      "This week: if a message tries to rush you, don't tap its links. Open the real app yourself and check there. Still feels wrong? Tell an adult you trust, and report it.",
    wrenLine: "You didn't just remember it, you worked it out. That's the real thing, Agent.",
  },

  voice: {
    transmission: "/audio/wren/m01-transmission.mp3",
    briefing: "/audio/wren/m01-briefing.mp3",
    debrief: "/audio/wren/m01-debrief.mp3",
  },

  dossier: {
    mo: "Sends fake 'urgent' messages that copy apps you trust. Wants you to tap before you think.",
    defeatedBy: "Anyone who slows down, checks the real address, and opens the official app instead.",
    breadcrumb:
      "ROUTING NOTE: this scam was passed through something tagged ZERO. First time we've seen that name. Filed as clue ①.",
  },
};
