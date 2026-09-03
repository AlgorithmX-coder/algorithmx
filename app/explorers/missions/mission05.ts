/**
 * Mission 05 — "Signal Storm" (Block 1: Signals — BLOCK FINALE).
 * Actor: PHANTOM HOOK ②. Built to the LOCKED case framework
 * (see docs/explorers/case-framework-locked.md) — Case 001 is the reference.
 *
 * SEVEN skills, each LEARN -> PRACTICE, then ONE blind must-pass TEST. As the
 * Block 1 finale it SYNTHESISES the block: the M01 actor returns, now hitting
 * every channel at once, spoofing senders at header level, and hiding one
 * researched spear in the spray.
 *   1 the costume change  (beats + INSPECT) — one hook, many channels
 *   2 read the address    (beats + UNMASK)  — display name vs real address
 *   3 the QR costume      (beats + UNMASK)  — a square hides its destination
 *   4 spray vs spear      (beats + DECIDE)  — SIGNATURE: targeted beats loud
 *   5 work the queue      (beats + SORT)    — triage by severity, not volume
 *   6 know PHANTOM HOOK    (beats + PROFILE) — costumes, borrowed names, the ask
 *   7 the two-check habit (beats + BUILD)   — the storm drill
 *
 * Season arc — breadcrumb ②: the spear-phish in the boss carries personal
 * details that match the file PACKRAT auctioned in M04. The actors are
 * connected. Ends Block 1: CONFIDENTIAL clearance confirmed in the debrief.
 */

import Mission05Incident from "../incidents/Mission05Incident";
import type { MissionManifest } from "../engine/types";

export const mission05: MissionManifest = {
  id: "explorers-m05",
  caseNumber: "CASE 005",
  title: "Signal Storm",
  block: 1,
  classification: "CONFIDENTIAL",
  actor: {
    codename: "PHANTOM HOOK",
    mo: "Same trick, a costume cut to fit you, fired at every channel at once.",
    portrait: "/explorers/actors/phantom-hook.png",
  },

  hook: "Fake alerts are flooding every channel at once, and one of them knows your name. Analysts don't panic. They triage.",
  scene: "/explorers/scenes/m05-cold-open.jpg",

  transmission: {
    headline: "STORM WARNING",
    lines: [
      "Agent, PHANTOM HOOK is back, and he's done being subtle. Texts, QR posters, DMs, emails. Every screen you own, all at once.",
      "Volume is the weapon, and panic is the plan. 'Tick tock, player,' he says, hoping you'll tap before you think.",
      "But here's the thing. Analysts don't panic in a storm. They work the queue. Tonight we read every costume, and find the one hook cut just for you.",
    ],
  },

  briefing: {
    summary:
      "Same trick, three costumes, three hundred targets, and one costume cut to fit you. Read the fingerprints, read the addresses, and triage by danger, not by noise.",
    objectives: [
      "See one scam wearing every costume across every channel",
      "Read the address, not the name tag, and spot the spear in the spray",
      "Work the queue by severity, and drill the two-check habit",
    ],
    wrenLine: "Seven skills, then a test to close the case, and close out Block One. One rule tonight, Agent. His storm is loud, so slow down. Ready?",
  },

  cycles: [
    /* --------------------------------------------- cycle 1: the costume change (INSPECT) */
    {
      id: "costume",
      title: "The costume change",
      concept: "The same scam wears a different costume on every channel",
      checkpoint: {
        questions: [
          { id: "m05-c1-chk1", question: "You get an email AND an Instagram DM the same afternoon, both saying your account is locked and both linking to secure-fix-now.net. What does that tell you?", options: ["One scammer running the same play in two costumes", "Two unrelated companies happened to contact you", "Proof the warning must be real, since it came twice"], answer: 0, ok: "Right. Same link, same story, two channels. That is one author swapping costumes, not two real alerts.", okVoice: "/audio/wren/m05-c1-chk1-ok.mp3" },
          { id: "m05-c1-chk2", question: "PHANTOM HOOK jumps from a text to a QR poster to a DM. Why keep changing costume like that?", options: ["Because posters simply cost him money", "Because he prefers one channel over another", "To hide that it is all one scam with the same moves underneath"], answer: 2, ok: "Exactly. The costume keeps changing, the moves stay the same. Match the moves and the whole storm becomes one case.", okVoice: "/audio/wren/m05-c1-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to see one scam wearing three costumes at once.",
      instruction: "Tap the 3 fingerprints every channel shares. One message is genuinely fine.",
      intel: {
        beats: [
          "A text. A QR poster. A DM. Three different screens, three different costumes, and one very busy quick-change artist behind all of them.",
          "Underneath every costume is one author, running one play. He swaps the costume because it's cheap. He keeps the MOVES, because they work.",
          "And moves leave fingerprints. The same ticking clock. The same weird verify-website. The same one ask: hand over your login.",
          "So don't get lost in the costumes. Match the fingerprints, and a whole screaming storm collapses into one single case.",
        ],
        beatAudio: [
          "/audio/wren/m05-c1-b1.mp3",
          "/audio/wren/m05-c1-b2.mp3",
          "/audio/wren/m05-c1-b3.mp3",
          "/audio/wren/m05-c1-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "INSPECT",
        payload: {
          intro: "The channel monitor, last twenty minutes. Tap the 3 fingerprints every scam channel shares. One message is a genuine school alert.",
          device: { app: "CHANNEL MONITOR", owner: "ARC INTERCEPTS · LAST 20 MIN" },
          header: [
            { label: "FEED:", seg: { id: "feed", text: "three channels, one storm" } },
          ],
          body: [
            [{ id: "sms", text: "[SMS] LIBRARY ALERT: account locked, fix it within 12 hours", tellId: "clock" }],
            [{ id: "qr", text: "[QR POSTER] scan to keep your canteen balance → pay-canteen-verify.net", tellId: "domain", mono: true }],
            [{ id: "dm", text: "[DM] your game account is flagged!! log in here quick to keep it", tellId: "ask" }],
            [{ id: "ok", text: "[SCHOOL APP] football trials moved to Friday · Mr. Ortega" }],
          ],
          tells: [
            { id: "clock", label: "The countdown", why: "The same ticking clock on every channel. Twelve hours here, six there. That's one author, not three." },
            { id: "domain", label: "The verify-domain", why: "The same weird 'verify' website family shows up under every single costume." },
            { id: "ask", label: "The ask", why: "Three channels, one ask: hand over your login. That's the whole play, every time." },
          ],
          doneLine: "Three costumes, one signature: the clock, the verify-site, the login ask. Tick tock, PHANTOM HOOK. Your storm is one case now.",
          doneAudio: "/audio/wren/m05-c1-review.mp3",
        },
      },
      playAudio: "/audio/wren/m05-c1-play.mp3",
    },

    /* --------------------------------------------- cycle 2: read the address (UNMASK) */
    {
      id: "senders",
      title: "Read the address, not the name",
      concept: "The sender's name is a costume too; the address underneath is the truth",
      checkpoint: {
        questions: [
          { id: "m05-c2-chk1", question: "A DM's name tag reads 'Head Teacher Office', but it comes from mrsp-school-alerts.co. Should the name make you trust it?", evidence: "from: mrsp-school-alerts.co", options: ["Yes, only a real teacher could set that name", "No, anyone can type that name, so read the address", "Yes, because it clearly mentions the school"], answer: 1, ok: "That is it. The name tag is typed by whoever sent it. The address, mrsp-school-alerts dot co, is the giveaway.", okVoice: "/audio/wren/m05-c2-chk1-ok.mp3" },
          { id: "m05-c2-chk2", question: "An email says 'StreamBox Billing'. You peel back the name and the real address is billing@streambox.com. Real or fake?", evidence: "billing@streambox.com", options: ["Real, the address is the genuine streambox.com", "Fake, billing teams never send emails", "Fake, the name sounds far too friendly"], answer: 0, ok: "Correct. Name and address agree, and the address is the real streambox.com. This one genuinely is them.", okVoice: "/audio/wren/m05-c2-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn why the sender's name proves absolutely nothing.",
      instruction: "Tap each sender to reveal the real address, then call REAL or FAKE.",
      intel: {
        beats: [
          "Every message arrives wearing a name tag. 'GameHub Support.' 'Library Desk.' Even your head teacher's name. And you read the tag and relax.",
          "Here's the catch you've been missing. The name tag is typed by whoever SENT the message. Anyone can type anything. PHANTOM HOOK types whatever fits you.",
          "The address underneath, though? That's much harder to fake. 'GameHub Support' can send from a random verify-site, but it can't magic up the real gamehub.com.",
          "So do what an analyst does. Ignore the name. Peel it back, read the actual address, and let THAT tell you who really sent it.",
        ],
        beatAudio: [
          "/audio/wren/m05-c2-b1.mp3",
          "/audio/wren/m05-c2-b2.mp3",
          "/audio/wren/m05-c2-b3.mp3",
          "/audio/wren/m05-c2-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "UNMASK",
        payload: {
          intro: "Five messages, all wearing the 'GameHub' name tag. Tap each to read the real address, then call REAL or FAKE.",
          brand: "GameHub",
          items: [
            { id: "u1", displayName: "GameHub Support", address: "help@gamehub.com", real: true, why: "The address is the real gamehub.com. This one genuinely is them." },
            { id: "u2", displayName: "GameHub Support", address: "support@gamehub-verify.net", real: false, why: "Friendly name, but the address is a random 'verify' site, not gamehub.com. A costume." },
            { id: "u3", displayName: "GameHub Security Team", address: "no-reply@gamehub-security.info", real: false, why: "'gamehub-security dot info' is a look-alike bolted on. The real one is just gamehub.com." },
            { id: "u4", displayName: "GameHub", address: "noreply@gamehub.com", real: true, why: "Real domain, gamehub.com, under an official-looking name. Genuine." },
            { id: "u5", displayName: "GameHub Rewards", address: "team@gamehub.account-fix.ru", real: false, why: "The real domain here is 'account-fix dot ru', with gamehub only pasted in front. Fake." },
          ],
          doneLine: "Names are costume, addresses are fingerprints. Two of those were really GameHub. The other three were PHANTOM HOOK, wearing GameHub's name tag.",
          doneAudio: "/audio/wren/m05-c2-review.mp3",
        },
      },
      playAudio: "/audio/wren/m05-c2-play.mp3",
    },

    /* --------------------------------------------- cycle 3: the QR costume (UNMASK) */
    {
      id: "qr",
      title: "The QR costume",
      concept: "A QR code hides its destination completely, so a swapped sticker sends you anywhere",
      checkpoint: {
        questions: [
          { id: "m05-c3-chk1", question: "Why can a scammer stick a fake QR sticker over a real one and fool almost everyone?", options: ["Because QR codes need a special camera", "Because stickers are really hard to make", "Because you cannot see where a square leads until you scan it"], answer: 2, ok: "Right. A square hides its destination. Swap the sticker and the same-looking code now points at his site.", okVoice: "/audio/wren/m05-c3-chk1-ok.mp3" },
          { id: "m05-c3-chk2", question: "You scan a bus-stop QR to buy a ticket, and it previews buytickets.city-transit-verify.net. What now?", evidence: "buytickets.city-transit-verify.net", options: ["Pay quickly, the bus is nearly here", "Do not go; that is a stranger's verify-site, so type the real address yourself", "Scan it a second time just to be sure"], answer: 1, ok: "Good call. The preview showed a stranger's verify-site, not the real one. Type the real address in yourself instead.", okVoice: "/audio/wren/m05-c3-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to never trust a square you can't read.",
      instruction: "Tap each code to scan the real address, then call REAL or FAKE.",
      intel: {
        beats: [
          "Here's PHANTOM HOOK's newest costume. A QR code. A little square you point your camera at, and it whisks you off somewhere. But WHERE? You can't read a square.",
          "That's the whole trick. A QR code hides its destination completely. You just have to trust it, and he is absolutely counting on that trust.",
          "So he prints stickers and slaps them over the real ones. On posters, on tables, on the canteen machine itself. Same square, brand-new destination: his.",
          "The rule? Never trust a square blind. Scan to PREVIEW the address first, and if it's not the place's real website, don't go. When in doubt, type the address in yourself.",
        ],
        beatAudio: [
          "/audio/wren/m05-c3-b1.mp3",
          "/audio/wren/m05-c3-b2.mp3",
          "/audio/wren/m05-c3-b3.mp3",
          "/audio/wren/m05-c3-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "UNMASK",
        payload: {
          intro: "Four canteen top-up QR codes from around school. Scan each to preview the real address, then call REAL or FAKE.",
          brand: "the school canteen",
          sourceLabel: "QR CODE",
          revealText: "▸ TAP TO SCAN THE CODE",
          items: [
            { id: "qr1", displayName: "Canteen top-up (on the wall by the hall)", address: "pay.myschool.sch.uk/canteen", real: true, why: "Scans to the school's own real website, ending sch.uk. Genuine." },
            { id: "qr2", displayName: "Canteen top-up (sticker on the machine)", address: "canteen-pay-verify.net", real: false, why: "A random 'verify' site stuck over the real one. The classic QR swap." },
            { id: "qr3", displayName: "URGENT: re-verify your canteen account", address: "myschool-canteen-secure.info", real: false, why: "Urgent, plus a look-alike domain. Your school never says 'urgent, re-verify'." },
            { id: "qr4", displayName: "Lunch balance top-up", address: "myschool.canteen-topup.ru", real: false, why: "The real domain is 'canteen-topup dot ru'. Nothing to do with your school. Fake." },
          ],
          doneLine: "Only the one on the wall went to the school's real site. The three stickers were PHANTOM HOOK, pasted over the top. Never trust a square blind.",
          doneAudio: "/audio/wren/m05-c3-review.mp3",
        },
      },
      playAudio: "/audio/wren/m05-c3-play.mp3",
    },

    /* --------------------------------------------- cycle 4: spray vs spear (DECIDE — signature) */
    {
      id: "spear",
      title: "Spray vs spear",
      concept: "A message that KNOWS things about you is more dangerous than one blasted to everyone",
      checkpoint: {
        questions: [
          { id: "m05-c4-chk1", question: "Two messages arrive. One went to your whole year group. One uses your first name, your club, and last week's match score. Which is the bigger threat?", options: ["The one that knows your name and details", "The one sent to the whole year group", "They are exactly equal, both are messages"], answer: 0, ok: "Yes. Personal details mean someone did homework on you. That is a spear, and it outranks the mass blast.", okVoice: "/audio/wren/m05-c4-chk1-ok.mp3" },
          { id: "m05-c4-chk2", question: "Why does a spear-phish worry an analyst more than a spray blast, even though the blast reaches more people?", options: ["Because it always has a scarier logo", "Because it usually arrives faster", "Because someone chose to target you and put real effort in"], answer: 2, ok: "Exactly. Spray is cheap guessing. A spear cost effort, which means someone decided you were worth the aim.", okVoice: "/audio/wren/m05-c4-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn why the quiet, personal message is the real threat.",
      instruction: "Three flagged messages, one of you. Make the call: which goes to the top?",
      intel: {
        beats: [
          "In a storm, every message is screaming for your attention. So an analyst doesn't answer the loudest one. They rank them by how dangerous they really are.",
          "And loud is not the same as dangerous. A message blasted to the whole school is SPRAY. It's just guessing, hoping someone panics.",
          "But a message that knows your name, your form room, your teacher? That's a SPEAR. Someone did real homework on YOU to write it.",
          "Spray is cheap and it's guessing. A spear cost effort, which means someone decided you were worth targeting. Targeted beats loud, every single time.",
        ],
        beatAudio: [
          "/audio/wren/m05-c4-b1.mp3",
          "/audio/wren/m05-c4-b2.mp3",
          "/audio/wren/m05-c4-b3.mp3",
          "/audio/wren/m05-c4-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "DECIDE",
        payload: {
          intro: "Three messages are flagged and the storm is live. The queue is yours, Agent. Which do you handle first?",
          situation:
            "Three flagged messages land together. One is blasted to every inbox in school. One names your exact form class and your teacher. One is full of typos, promising a free jetpack.",
          prompt: "YOUR CALL, AGENT:",
          options: [
            {
              id: "spray",
              label: "The blast sent to every inbox in school",
              outcome:
                "Dangerous, but shallow. That's spray, and spray is just guessing. The one that KNOWS things about you outranks it every time.",
            },
            {
              id: "spear",
              label: "The one that names your form class and your teacher",
              correct: true,
              outcome:
                "Correct. Personal details mean someone did real homework on you. That's a spear, not spray. Straight to the top of the queue.",
            },
            {
              id: "typos",
              label: "The one full of typos promising a free jetpack",
              outcome:
                "Almost funny, that free jetpack. Log it and move on. Severity first: the queue doesn't care what's entertaining.",
            },
          ],
        },
      },
      playAudio: "/audio/wren/m05-c4-play.mp3",
    },

    /* --------------------------------------------- cycle 5: work the queue (SORT) */
    {
      id: "queue",
      title: "Work the queue",
      concept: "In a flood, rank messages by severity, not by how loud they shout",
      checkpoint: {
        questions: [
          { id: "m05-c5-chk1", question: "Your inbox floods. A message in all caps with rocket emojis shouts 'FREE CONSOLE!!!'. Where does it go in your queue?", options: ["Straight to the top, it is the loudest", "Log it and ignore it, because loud is not dangerous", "Reply fast to claim before it expires"], answer: 1, ok: "Right. Loud and asking for nothing real is just noise. Log it and move to the threats that matter.", okVoice: "/audio/wren/m05-c5-chk1-ok.mp3" },
          { id: "m05-c5-chk2", question: "In the same flood, which quiet message should jump to the top of the queue?", options: ["A short message asking you to log in to unlock your account", "A 'you have 2 new likes' notification", "A friend asking about tonight's homework"], answer: 0, ok: "That is the one. It asks for your login, which is the whole scam. Quiet and specific beats loud every time.", okVoice: "/audio/wren/m05-c5-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn to handle the real threats first and let the noise wait.",
      instruction: "Sort the flood: handle now, or log and ignore?",
      intel: {
        beats: [
          "When the storm hits, your inbox is a wall of noise, and every message wants to be first. Don't let the volume set your order. YOU set the order.",
          "Loud is not dangerous. A message shouting 'FREE JETPACK' in ten emojis is loud, and asks for nothing real. That's noise. Log it, move on.",
          "The dangerous ones are usually quieter and more specific. The one asking for your login. The one that knows your name. Those go straight to the top.",
          "So work the queue like a pro. Real threats first, noise last, and never, ever let the flood rush you into tapping something.",
        ],
        beatAudio: [
          "/audio/wren/m05-c5-b1.mp3",
          "/audio/wren/m05-c5-b2.mp3",
          "/audio/wren/m05-c5-b3.mp3",
          "/audio/wren/m05-c5-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "SORT",
        payload: {
          intro: "The flood is live. Sort each message: is it a real threat to handle now, or just noise to log and ignore?",
          buckets: [
            { id: "now", label: "HANDLE NOW", hint: "a real threat" },
            { id: "noise", label: "LOG & IGNORE", hint: "just noise" },
          ],
          items: [
            { id: "m1", label: "'Log in here to unlock your locked account'", bucket: "now", why: "Asks for your login. That's the whole scam. Top of the queue." },
            { id: "m2", label: "'FREE JETPACK, tap now!!!' with twelve emojis", bucket: "noise", why: "Loud, silly, and asks for nothing real. Log it and move on." },
            { id: "m3", label: "A text that knows your name and your form room", bucket: "now", why: "Personal details mean someone researched YOU. A spear. Handle it now." },
            { id: "m4", label: "'You have 3 new followers' notification", bucket: "noise", why: "Ordinary app noise. Nothing to action here." },
            { id: "m5", label: "'Your parcel needs a £2 fee in 24 hrs' + a weird link", bucket: "now", why: "A countdown, a payment, and a strange link. A real phishing attempt." },
            { id: "m6", label: "A friend messaging 'did you see the match?'", bucket: "noise", why: "An actual friend, an actual chat. Not a threat at all." },
            { id: "m7", label: "'Library account locked, verify in 12 hrs' → lib-verify.net", bucket: "now", why: "A countdown plus a verify-site. PHANTOM HOOK's signature. Handle it." },
          ],
          doneLine: "That's the queue, worked. The loud stuff is just noise. The quiet, specific, login-asking messages are the real threats, and they always go first.",
        },
      },
      playAudio: "/audio/wren/m05-c5-play.mp3",
    },

    /* --------------------------------------------- cycle 6: know PHANTOM HOOK's play (PROFILE) */
    {
      id: "play",
      title: "Know PHANTOM HOOK's play",
      concept: "Many costumes, a borrowed name, and always the same ask; sometimes armed with a bought file",
      checkpoint: {
        questions: [
          { id: "m05-c6-chk1", question: "Across texts, QR codes and DMs, what is the ONE thing PHANTOM HOOK always ends up asking for?", options: ["Your favourite colour", "A funny meme to share", "Your login"], answer: 2, ok: "Yes. The costume changes and the channel changes, but the ask never does. It is always your login.", okVoice: "/audio/wren/m05-c6-chk1-ok.mp3" },
          { id: "m05-c6-chk2", question: "One of his messages knew your name and your form room. How did his scam turn into a spear?", options: ["He guessed both of them by pure luck", "He bought a file of details about you first", "The school posted them somewhere public"], answer: 1, ok: "Exactly. A bought file turned a blind blast into a hook aimed at you. Remember who sells those files.", okVoice: "/audio/wren/m05-c6-chk2-ok.mp3" },
        ],
      },
      promise: "You'll learn PHANTOM HOOK's whole play, and the upgrade that makes it a spear.",
      instruction: "Tap the 3 moves that are really PHANTOM HOOK's.",
      intel: {
        beats: [
          "Let's name PHANTOM HOOK's whole play, because you've now seen every part of it. Move one, MANY COSTUMES. The same hook by text, by QR, by DM, by email. Wherever you look, a costume is waiting.",
          "Move two, a BORROWED NAME. He types a trusted name on the tag, GameHub, the library, your head teacher, while the address underneath is pure him.",
          "Move three, THE ASK. Every costume, every channel, ends the exact same way: hand over your login. That's the only thing he ever actually wants.",
          "And the scariest upgrade? Sometimes he BUYS a file on you first, so the hook already knows your name. That's when he stops being spray and becomes a spear. Remember that. It matters next case.",
        ],
        beatAudio: [
          "/audio/wren/m05-c6-b1.mp3",
          "/audio/wren/m05-c6-b2.mp3",
          "/audio/wren/m05-c6-b3.mp3",
          "/audio/wren/m05-c6-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "PROFILE",
        payload: {
          intro: "Everything you've seen tonight, on one board. Tap the 3 moves that are really PHANTOM HOOK's.",
          evidence: [
            "The same hook arrived by text, QR, DM and email",
            "Every sender name was borrowed; the address never matched",
            "One message knew a name it should never have had",
          ],
          behaviors: [
            { id: "costumes", label: "Wears a new costume on every channel", matches: true },
            { id: "borrow", label: "Borrows a trusted name, fakes the address", matches: true },
            { id: "ask", label: "Always ends with 'hand over your login'", matches: true },
            { id: "guess", label: "Runs a rig to guess your password", matches: false },
            { id: "collect", label: "Quietly collects your public crumbs", matches: false },
            { id: "prize", label: "Hands out free prizes with no strings", matches: false },
          ],
          picks: 3,
          doneLine: "Costumes, a borrowed name, the same ask, and a bought file to aim it. That's PHANTOM HOOK. And that bought file? Remember who sells those.",
        },
      },
      playAudio: "/audio/wren/m05-c6-play.mp3",
    },

    /* --------------------------------------------- cycle 7: the two-check habit (BUILD) */
    {
      id: "drill",
      title: "The two-check habit",
      concept: "The storm drill: pause, check the address, open the real app, tell an adult if it's still off",
      checkpoint: {
        questions: [
          { id: "m05-c7-chk1", question: "An urgent 'your account is locked' text lands with a 10-minute timer. What is step one of the drill?", options: ["Pause, and do not tap anything yet", "Tap the link before the timer ends", "Reply to ask if it is genuine"], answer: 0, ok: "Right. The timer is fake and the pause beats it. Nothing gets tapped until you have checked.", okVoice: "/audio/wren/m05-c7-chk1-ok.mp3" },
          { id: "m05-c7-chk2", question: "You paused, and the address looks off. What is the safe way to check whether the alert is real?", options: ["Tap the link in the message to see", "Reply and ask the sender to prove it", "Open the real app yourself and look there"], answer: 2, ok: "That is the second check. If it is real it will be in your actual account. His link only ever goes to his page.", okVoice: "/audio/wren/m05-c7-chk2-ok.mp3" },
        ],
      },
      promise: "You'll build the ten-second drill that beats any costume on any channel.",
      instruction: "Build the storm drill. Pick the right move for each step.",
      intel: {
        beats: [
          "So how do you beat a storm that hits every channel at once? Not with panic. With a drill. The same four steps, every single time, no matter which costume it's wearing.",
          "First, the hardest one. PAUSE. Don't tap anything. The ticking clock is fake, and the pause is what beats him.",
          "Then two quick checks. Check one, does the ADDRESS match the name? Check two, open the REAL app yourself, not his link, and see if it's actually there.",
          "And if it still feels off after both? Tell an adult you trust. Two checks and a grown-up. Ten seconds, and his whole storm is just noise.",
        ],
        beatAudio: [
          "/audio/wren/m05-c7-b1.mp3",
          "/audio/wren/m05-c7-b2.mp3",
          "/audio/wren/m05-c7-b3.mp3",
          "/audio/wren/m05-c7-b4.mp3",
        ],
      },
      fieldwork: {
        verb: "BUILD",
        payload: {
          intro: "Build your storm drill. For each step, pick the move an analyst actually makes.",
          target: "Your storm drill",
          slots: [
            {
              id: "pause",
              label: "When an urgent message lands",
              options: [
                { id: "p1", label: "Stop, and don't tap anything yet", good: true, why: "Panic is his whole plan. The pause is what beats the clock." },
                { id: "p2", label: "Tap fast before the timer runs out", good: false, why: "The timer is fake, and rushing is exactly what he wants." },
              ],
            },
            {
              id: "check1",
              label: "First check",
              options: [
                { id: "a1", label: "Does the address match the name?", good: true, why: "Names are typed, addresses are hard to fake. This catches most of them." },
                { id: "a2", label: "Does it have the right logo?", good: false, why: "Logos are copy-paste. A logo proves absolutely nothing." },
              ],
            },
            {
              id: "check2",
              label: "Second check",
              options: [
                { id: "b1", label: "Open the real app yourself and look there", good: true, why: "If it's real, it'll be in your actual account. If not, it never was." },
                { id: "b2", label: "Tap the link in the message to check", good: false, why: "His link goes to his page. Never check a message using the message's own link." },
              ],
            },
            {
              id: "escalate",
              label: "If it still feels off",
              options: [
                { id: "c1", label: "Tell an adult you trust", good: true, why: "A second pair of eyes catches what panic misses. Never the wrong move." },
                { id: "c2", label: "Ignore it and hope for the best", good: false, why: "Hoping isn't a plan, and a real spear won't just go away. Say something." },
              ],
            },
          ],
          testLine: "Pause, check the address, open the real app, and tell someone if it's still weird. Two checks and a grown-up. Ten seconds flat.",
          doneLine: "That's the drill, and it fits any channel and any costume. Run it every time an urgent message tries to rush you, and PHANTOM HOOK has got nothing.",
        },
      },
      playAudio: "/audio/wren/m05-c7-play.mp3",
    },
  ],

  incident: {
    title: "The Flood",
    phases: 3,
    phaseNames: ["Hold the queue", "Find the spear", "Trace the data"],
    component: Mission05Incident,
  },

  catchThem: {
    intro:
      "Okay Agent, this is the real test, and it closes out Block One. Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take everything you learned this block and work out an answer you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. Take your time.",
    pass: 15,
    voice: {
      intro: "/audio/wren/m05-catch-intro.mp3",
      pass: "/audio/wren/m01-catch-pass.mp3",
      fail: "/audio/wren/m01-catch-fail.mp3",
    },
    // 19 fresh, think-for-yourself questions across the 7 skills. Options shuffle
    // at render; lengths balanced so the correct one is never the giveaway-longest.
    // skill: 0 costume · 1 read-the-address · 2 QR · 3 spray-vs-spear
    //        4 work-the-queue · 5 PHANTOM-HOOK's-play · 6 two-check-drill.
    scenarios: [
      { id: "cq1", skill: 0, prompt: "A scary text AND a matching QR poster land the same day. How do you read it?", options: ["One scam wearing two costumes", "Two separate scammers at work", "A coincidence, so ignore both", "Proof it must be genuine"], answer: 0 },
      { id: "cq2", skill: 0, prompt: "When PHANTOM HOOK changes costume, what stays exactly the SAME?", options: ["The pressure and the ask", "The colours and the logos used", "The channel it arrives on", "The exact wording each time"], answer: 0 },
      { id: "cq3", skill: 0, prompt: "Why send the same scam by text AND poster AND DM?", options: ["To reach you everywhere", "Because posters are more fun", "Each one is a different scammer", "To make it look more official"], answer: 0 },
      { id: "cq4", skill: 1, prompt: "A message swears it's from your head teacher. What actually proves that?", options: ["The real address underneath", "The official-looking name", "The use of school colours", "That it sounds quite strict"], answer: 0 },
      { id: "cq5", skill: 1, prompt: "Who actually types the display name on a message?", options: ["Whoever sent the message", "The phone company itself", "The school's IT office", "Nobody; it's automatic"], answer: 0 },
      { id: "cq6", skill: 1, prompt: "'GameHub Support' emails you from gamehub-verify.net. Real or fake?", options: ["Fake; it's not gamehub.com", "Real; it clearly says GameHub", "Real; 'support' is in the name", "You can't ever tell from an email"], answer: 0 },
      { id: "cq7", skill: 2, prompt: "Why is a QR code sticker such a good disguise?", options: ["You can't see where it leads", "It looks nicer than a link", "It works without any camera", "It can never be faked at all"], answer: 0 },
      { id: "cq8", skill: 2, prompt: "The QR on the canteen machine leads to canteen-pay-verify.net. Your move?", options: ["Don't go; use the real site", "Scan it; it's on the machine", "Pay quickly before it expires", "Share it with the whole class"], answer: 0 },
      { id: "cq9", skill: 2, prompt: "Safest way to top up your canteen balance?", options: ["Type in the real address", "Scan whichever QR is closest", "Tap the link a text sent you", "Use the first result you find"], answer: 0 },
      { id: "cq10", skill: 3, prompt: "Which is a SPEAR, not spray?", options: ["One that names your form room", "A blast sent to the whole school", "A generic 'you've won!' message", "A typo-filled free-prize offer"], answer: 0 },
      { id: "cq11", skill: 3, prompt: "Why is a personal, researched message MORE dangerous?", options: ["Someone targeted you", "It is always much longer", "It arrives later at night", "It uses fancier language"], answer: 0 },
      { id: "cq12", skill: 3, prompt: "'Spray' scam messages work by:", options: ["Guessing, blasted to everyone", "Carefully researching each person", "Only ever using QR codes", "Arriving one at a time"], answer: 0 },
      { id: "cq13", skill: 4, prompt: "In a flood of messages, an analyst's first move is to:", options: ["Rank them by real danger", "Answer the loudest one first", "Reply to every single one", "Turn the phone off for good"], answer: 0 },
      { id: "cq14", skill: 4, prompt: "Which flagged message do you handle FIRST?", options: ["The one asking for your login", "The one with the most emojis", "The one promising a free prize", "The one that arrived earliest"], answer: 0 },
      { id: "cq15", skill: 5, prompt: "PHANTOM HOOK's every scam, on every channel, ends by asking you to:", options: ["Hand over your login", "Guess a new password", "Share a funny meme", "Post a public quiz"], answer: 0 },
      { id: "cq16", skill: 5, prompt: "How did his spear message know your name and form room?", options: ["He bought a file about you", "He simply made a lucky guess", "The school told him directly", "It was in the newsletter"], answer: 0 },
      { id: "cq17", skill: 5, prompt: "Which is NOT one of PHANTOM HOOK's moves?", options: ["Guessing your password", "Wearing a costume on each channel", "Faking the sender's real address", "Always asking for your login"], answer: 0 },
      { id: "cq18", skill: 6, prompt: "An urgent message rushes you. What's the very FIRST thing to do?", options: ["Pause; don't tap anything", "Tap fast before it expires", "Reply and ask if it's real", "Forward it to your friends"], answer: 0 },
      { id: "cq19", skill: 6, prompt: "To check if an 'account locked' message is real, you should:", options: ["Open the real app yourself", "Tap the link it gave you", "Reply to the message asking", "Trust it if the logo fits"], answer: 0 },
    ],
  },

  debrief: {
    report: [
      "You reduced a whole screaming storm to one case: shared clock, shared verify-sites, shared login ask, across every channel he owns.",
      "You read senders at header level, treated names and QR squares as costume, and drilled the two-check habit.",
      "You found the spear in the spray, traced its details to a bought file, and closed Block One. CONFIDENTIAL clearance confirmed.",
    ],
    realWorldMove:
      "This week: when an urgent message lands, run the drill. Pause. Does the address match the name? Then open the real app yourself and check there. Two checks, ten seconds. Still feels off? Tell an adult you trust.",
    wrenLine: "Block One, closed. PHANTOM HOOK's storm is one filed case, Agent. CONFIDENTIAL clearance, confirmed. Wear it well.",
  },

  voice: {
    transmission: "/audio/wren/m05-transmission.mp3",
    briefing: "/audio/wren/m05-briefing.mp3",
    debrief: "/audio/wren/m05-debrief.mp3",
  },

  dossier: {
    mo: "One trick, a costume cut to fit each target, fired at every channel at once, with a spear hidden in the spray.",
    defeatedBy: "Anyone who matches the fingerprints across every costume, reads the address instead of the name, and triages by danger instead of panicking.",
    breadcrumb:
      "CROSS-REF: the spear's personal lines match the file PACKRAT auctioned in CASE 004. Two actors, one supply chain. Filed as breadcrumb ②.",
  },
};
