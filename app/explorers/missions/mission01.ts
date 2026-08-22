/**
 * Mission 01 — "Phishing" (Block 1: Signals, CONFIDENTIAL).
 * Actor: PHANTOM HOOK.
 *
 * DEPTH PASS (owner: "too easy, feels like a recap"): FIVE skills, each
 * LEARN -> PRACTICE, then ONE must-pass 10-question TEST. Every skill has a
 * different hands-on practice so nothing repeats:
 *   1 pressure  (ARTIFACT teach + INSPECT)   — the feelings a scammer fakes
 *   2 address   (beats + SORT)               — take a web address apart
 *   3 sender    (beats + UNMASK)             — the name lies, the address doesn't
 *   4 the play  (beats + PROFILE)            — the three-part anatomy + go direct
 *   5 recovery  (beats + BUILD)              — the rescue plan if you get caught
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
      "Check the link and the sender for fakes",
      "Beat the pattern, and bounce back if you slip",
    ],
    wrenLine: "Five skills, then a test to close the case. This test makes you THINK, it won't just ask what I said. So learn it properly. Ready?",
  },

  cycles: [
    /* ------------------------------------------ cycle 1: spot the pressure */
    {
      id: "lure",
      title: "Spot the pressure",
      concept: "Scammers fake a strong feeling to rush you past thinking",
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
          intro: "A brand-new message just landed on Sam's phone. Find every part that's trying to pressure him.",
          device: { app: "TEXTS", owner: "SAM'S PHONE" },
          header: [
            { label: "FROM:", seg: { id: "from", text: "+44 7700 900418 (unknown)" } },
          ],
          body: [
            [{ id: "greet", text: "Hi there!" }],
            [{ id: "win", text: "You've been specially chosen to WIN a £100 voucher!", tellId: "greed" }],
            [{ id: "rush", text: "Claim it in the next 15 minutes, before it's gone.", tellId: "rush" }],
            [{ id: "miss", text: "You really DON'T want to miss out on this one.", tellId: "fomo" }],
            [{ id: "members", text: "This offer is just for our valued members." }],
            [{ id: "reply", text: "Reply YES to claim yours." }],
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
              id: "fomo",
              label: "Fear of missing out",
              why: "Another pressure trick, scaring you that you'll lose out if you don't act fast.",
            },
          ],
          doneLine: "Spot on. Different scam, different bait, same three pressure tricks you just learned: greed, a countdown, and fear of missing out. The other lines are just normal message bits.",
        },
      },
      playAudio: "/audio/wren/m01-c1-play.mp3",
    },

    /* -------------------------------------- cycle 2: take apart the address */
    {
      id: "address",
      title: "Take apart the address",
      concept: "The real owner is the last two chunks before the first slash",
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
          intro: "Six addresses, all claiming to be PixelPlay. Sort each one: really PixelPlay, or a disguise wearing the name? Use the rule.",
          buckets: [
            { id: "real", label: "REALLY PIXELPLAY", hint: "ends in pixelplay.com" },
            { id: "fake", label: "A DISGUISE", hint: "a stranger's site" },
          ],
          items: [
            { id: "a1", label: "account.pixelplay.com", bucket: "real", why: "The last two chunks before any slash are pixelplay.com. That's the real owner. 'account' is just a room inside it." },
            { id: "a2", label: "pixelplay.com/redeem", bucket: "real", why: "Find the first slash, read the two chunks before it: pixelplay.com. Real owner. '/redeem' is only a page inside." },
            { id: "a3", label: "help.pixelplay.com", bucket: "real", why: "Last two chunks: pixelplay.com. 'help' is just a room inside the real site." },
            { id: "a4", label: "pixelplay.com.free-coins.net", bucket: "fake", why: "Read the LAST two chunks: free-coins.net. 'pixelplay.com' is glued on the front to fool you." },
            { id: "a5", label: "login.pixelplay.rewards.io", bucket: "fake", why: "The last two chunks are rewards.io, a stranger. 'pixelplay' is just decoration in the middle." },
            { id: "a6", label: "pixelplay-support.net", bucket: "fake", why: "The owner is pixelplay-support.net, a name a stranger made up. The real one is simply pixelplay.com." },
          ],
          doneLine: "That's the rule in action. Ignore the front, find the first slash, read the two chunks before it. No glued-on name can fool you now.",
        },
      },
      playAudio: "/audio/wren/m01-c2-play.mp3",
    },

    /* -------------------------------------------- cycle 3: check the sender */
    {
      id: "sender",
      title: "Check the sender",
      concept: "The friendly name is a costume; the real address tells the truth",
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
          intro: "Four messages, all signed GameHub. Tap each to reveal the real address, then call it.",
          brand: "GameHub",
          items: [
            { id: "s1", displayName: "GameHub Support", address: "support@gamehub.com", real: true, why: "The real owner is gamehub.com. The name and the address match. Genuine." },
            { id: "s2", displayName: "GameHub Security", address: "alert@gamehub.com.account-check.net", real: false, why: "The real owner is account-check.net, a stranger. 'gamehub.com' is glued on the front to fool you." },
            { id: "s3", displayName: "GameHub Rewards", address: "prizes@gamehub-rewards.net", real: false, why: "gamehub-rewards.net is a made-up name a stranger owns. The real GameHub is simply gamehub.com." },
            { id: "s4", displayName: "GameHub Team", address: "noreply@mail.gamehub.com", real: true, why: "The last two chunks are gamehub.com. 'mail' is just a room inside the real site." },
          ],
          doneLine: "Names lie, addresses don't.",
        },
      },
      playAudio: "/audio/wren/m01-c-sender-play.mp3",
    },

    /* ---------------------------------------- cycle 4: know the play */
    {
      id: "actor",
      title: "Know the play",
      concept: "Every phishing scam is built from the same three parts",
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
            { id: "guess", label: "Tries to guess your password over and over", matches: false },
            { id: "voice", label: "Fakes a friend's voice on a phone call", matches: false },
            { id: "meet", label: "Asks to meet you in person", matches: false },
          ],
          picks: 3,
          doneLine: "That's his pattern. Next time, he'll just be wearing a different disguise.",
        },
      },
      playAudio: "/audio/wren/m01-c3-play.mp3",
    },

    /* ------------------------------------------- cycle 5: if you get caught */
    {
      id: "recover",
      title: "If you get caught",
      concept: "If you slip and click or type your password, fast action keeps you safe",
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
                { id: "off", label: "Turn your phone off and hope", good: false, why: "That changes nothing. The stolen password still works. Change it first." },
                { id: "ignore", label: "Ignore it, it's probably fine", good: false, why: "It isn't. If you typed your password into a fake page, act now." },
              ],
            },
            {
              id: "lock",
              label: "Lock it down harder",
              options: [
                { id: "2fa", label: "Turn on two-step verification", good: true, why: "Now a password alone can't get in. A strong second lock." },
                { id: "same", label: "Set the same password again", good: false, why: "The scammer may already know it. Use a brand-new one, then add two-step." },
                { id: "post", label: "Post about it online", good: false, why: "That doesn't protect your account. Add a real second lock instead." },
              ],
            },
            {
              id: "tell",
              label: "Get help",
              options: [
                { id: "adult", label: "Tell a trusted adult", good: true, why: "Always. They can help you check everything is safe." },
                { id: "secret", label: "Keep it a secret", good: false, why: "Secrets help the scammer. A trusted adult helps you." },
                { id: "wait", label: "Wait and see what happens", good: false, why: "Waiting gives the scammer time. Get help now." },
              ],
            },
            {
              id: "report",
              label: "Protect other people",
              options: [
                { id: "report", label: "Report the scam message", good: true, why: "Reporting gets it taken down, so it can't catch the next person." },
                { id: "forward", label: "Forward it to your friends", good: false, why: "That just spreads the bait. Report it instead." },
                { id: "delete", label: "Delete it and tell no one", good: false, why: "Deleting only hides it. Reporting actually stops it." },
              ],
            },
          ],
          testLine: "PLAN HOLDS: account secured.",
          doneLine: "Change it, lock it, tell someone, report it. That's the rescue plan.",
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
      "Okay Agent, this is the real test. Ten questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned and work out an answer you've never seen before. I won't tell you how you're doing until the very end. Get eight right to close the case. Miss it, and you sit the whole case again. Take your time.",
    pass: 8,
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
          "secure-verify.net, a stranger, StreamNow only appears after the slash",
          "streamnow.com",
          "StreamNow's login page",
          "login.com",
        ],
        answer: 0,
      },
      {
        id: "ct3",
        skill: 2,
        prompt: "An email's sender name says “Netflix Help”. You tap to reveal the real address behind it. Real or fake?",
        evidence: "help@netflix.account-verify.com",
        options: [
          "Fake, the real owner is account-verify.com, a stranger",
          "Real, the address has netflix in it",
          "Real, it came from Netflix Help",
          "You can't tell from the address",
        ],
        answer: 0,
      },
      {
        id: "ct4",
        skill: 3,
        prompt: "An email is a flawless copy of QuickPay: perfect logo, zero spelling mistakes, and it even arrives the day your bill is due. It rushes you to tap a link that goes to quickpay-support.net. Scam or safe?",
        options: [
          "Scam, the rush and the lying link are two of the three parts, a perfect look means nothing",
          "Safe, the logo and spelling are perfect",
          "Safe, it arrived on exactly the right day",
          "Can't tell without phoning QuickPay first",
        ],
        answer: 0,
      },
      {
        id: "ct5",
        skill: 4,
        prompt: "You just typed your password into a fake game site. What's the FIRST thing to do?",
        options: [
          "Change your password on the real site right away",
          "Turn the computer off and wait",
          "See if anything bad happens first",
          "Make a brand-new account",
        ],
        answer: 0,
      },
      {
        id: "ct6",
        skill: 0,
        prompt: "A message says: “You're today's lucky winner, but only for the next 10 minutes, grab it before someone else does!” There's no scary threat at all. Is it using pressure?",
        options: [
          "Yes, it fakes greed and rush, excitement is pressure too",
          "No, it's good news, so it must be safe",
          "No, because nothing bad is being threatened",
          "Only if it also has a link",
        ],
        answer: 0,
      },
      {
        id: "ct7",
        skill: 1,
        prompt: "This link looks long and messy. Using the rule, is it really PlayVault?",
        evidence: "account.security.login.playvault.com/reset",
        options: [
          "Yes, the two chunks before the slash are playvault.com",
          "No, it has far too many words to be real",
          "No, the word 'security' at the front makes it fake",
          "You can't tell when there are this many parts",
        ],
        answer: 0,
      },
      {
        id: "ct8",
        skill: 2,
        prompt: "A message's sender name is “Your School”. Should the name on its own tell you it's safe?",
        options: [
          "No, tap to check the real address behind the name",
          "Yes, the name proves it's your school",
          "Yes, school names can't be copied",
          "Only if there are no spelling mistakes",
        ],
        answer: 0,
      },
      {
        id: "ct9",
        skill: 3,
        prompt: "Your best friend messages you an amazing free-game link. It really is your friend's account. Is it safe to log in through their link?",
        options: [
          "No, open the real game yourself, their account could be hacked",
          "Yes, it's your best friend",
          "Yes, friends never send scams",
          "Only if the link looks normal",
        ],
        answer: 0,
      },
      {
        id: "ct10",
        skill: 4,
        prompt: "You've changed your password after a scam caught you. What else keeps your account safe?",
        options: [
          "Turn on two-step verification and tell a trusted adult",
          "Keep it secret so nobody worries",
          "Set your old password back",
          "Tap the scam link again to check",
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
