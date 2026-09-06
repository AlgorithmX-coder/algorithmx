/**
 * Block 3 · Case 012 "Unreadable", PACKRAT ②, CIPHER debut, THE CONSOLE.
 *
 * Systems block, console container. Signature = CIPHER: codes and keys, the
 * padlock, postcards vs sealed envelopes, and who can read your traffic on open
 * wi-fi. Boss "The Intercept": PACKRAT sniffs the cafe network; you seal your
 * traffic so all it grabs is gibberish. Curriculum row M12.
 */

import type { ConsoleCase } from "./case11";

export const case12Console: ConsoleCase = {
  id: "explorers-m12",
  caseNumber: "CASE 012",
  title: "Unreadable",
  actor: "PACKRAT",
  accent: "#FF9E3D",
  open: [
    "New system to master, Agent. This one's about secrets, how to send a message so that only the right person can read it.",
    "PACKRAT is back, and this time it isn't stealing accounts. It's LISTENING, sitting quietly on networks, reading whatever travels past unprotected.",
    "Seven skills in codes, keys, and sealed messages, then a boss and a test. Let's make your words unreadable to anyone but the person you meant.",
  ],
  openVoice: ["/audio/wren/m12c-open-1.mp3", "/audio/wren/m12c-open-2.mp3", "/audio/wren/m12c-open-3.mp3"],

  skills: [
    /* 1 · what a cipher is */
    {
      n: 1,
      title: "Scramble it with a key",
      goal: "A cipher turns a message into gibberish that only a key can unlock.",
      panel: "CIPHER LAB",
      learn: [
        { t: "wren", text: "Start with the oldest trick in security: a cipher. You scramble a message using a key, a secret rule, and now anyone who grabs it just sees nonsense. Only someone with the key can turn it back. Here's a baby one: shift every letter forward by one. A becomes B, B becomes C. So the key is 'shift by one'. Let's crack a message that used it.", voice: "/audio/wren/m12c-s1-learn.mp3" },
        { t: "sys", text: "INTERCEPTED (key = shift back by 1):  IFMMP" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Shift each letter BACK by one. What does IFMMP say?",
          options: [
            { label: "HELLO", outcome: "good", then: [{ t: "wren", text: "Cracked it. I-F-M-M-P shifted back one letter is H-E-L-L-O. With the key, gibberish becomes a message. Without it, PACKRAT just sees IFMMP and learns nothing. That's the whole power of a cipher.", voice: "/audio/wren/m12c-s1-ok.mp3" }] },
            { label: "WORLD", outcome: "bad", then: [{ t: "wren", text: "Not quite. Take each letter and step it back one: I to H, F to E. Try again.", voice: "/audio/wren/m12c-s1-bad.mp3" }] },
            { label: "IFMMP is already English", outcome: "bad", then: [{ t: "wren", text: "It's scrambled, that's the point. Apply the key, shift each letter back one, and read what appears. Try again.", voice: "/audio/wren/m12c-s1-bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "A cipher needs two things to work. Tap the TWO you need to read a scrambled message:",
          need: 2,
          parts: [
            { label: "The scrambled message", good: true, sub: "" },
            { label: "The secret key", good: true, sub: "the rule that unlocks it" },
            { label: "Good eyesight", good: false, sub: "the key does the work, not your eyes" },
            { label: "A lucky guess", good: false, sub: "guessing isn't reading" },
          ],
          ok: "Right. A message plus its key. Without the key it stays gibberish, and that is exactly the point of a cipher.",
          okVoice: "/audio/wren/m12c-s1-q2ok.mp3",
        },
        {
          t: "toggle",
          prompt: "You're passing a secret note in class. Set ON the moves that keep it unreadable:",
          switches: [
            { label: "Scramble the words with your key", sub: "", want: true },
            { label: "Give the key only to your friend, quietly", sub: "", want: true },
            { label: "Write the key at the bottom of the note", sub: "anyone who finds it can read it", want: false },
          ],
          ok: "Perfect. Scramble with the key, and share the key just between you two. A key written on the note is no secret at all.",
          okVoice: "/audio/wren/m12c-s1-q3ok.mp3",
        },
      ],
    },

    /* 2 · why simple ciphers fall, real ones don't */
    {
      n: 2,
      title: "Why real codes hold",
      goal: "A shift is easy to crack; real encryption uses keys too huge to ever guess.",
      panel: "CIPHER LAB",
      learn: [
        { t: "wren", text: "That shift cipher is fun, but useless against a computer. There are only 25 shifts, so a machine tries all 25 in a blink. Real encryption fixes that with a key so enormous, more combinations than atoms in the universe, that not even every computer on Earth working for billions of years could guess it. That's the difference between a toy and a lock.", voice: "/audio/wren/m12c-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Why is a simple shift cipher useless against PACKRAT's computer?",
          options: [
            { label: "There are only 25 shifts, it tries them all instantly", outcome: "good", then: [{ t: "wren", text: "Exactly. A tiny number of keys means no key at all to a computer. Strong encryption wins by having so many possible keys that guessing is hopeless. Size is the whole game.", voice: "/audio/wren/m12c-s2-ok.mp3" }] },
            { label: "Computers can't read letters", outcome: "bad", then: [{ t: "wren", text: "Computers read letters faster than you ever could. The real weakness is there are only 25 shifts to try. Try again.", voice: "/audio/wren/m12c-s2-bad.mp3" }] },
            { label: "It isn't, a shift cipher is unbreakable", outcome: "bad", then: [{ t: "wren", text: "A shift falls in an instant, only 25 options. Real strength comes from a mountain of possible keys. Try again.", voice: "/audio/wren/m12c-s2-bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "What makes an encryption key strong against guessing? Tap the TWO:",
          need: 2,
          parts: [
            { label: "A huge number of possible keys", good: true, sub: "" },
            { label: "A key so long no computer could try them all", good: true, sub: "" },
            { label: "A short, simple key", good: false, sub: "few options, cracked fast" },
            { label: "A key everyone already knows", good: false, sub: "then it's not secret" },
          ],
          ok: "Right. Strength is size: so many possible keys that trying them all is hopeless, even for a computer.",
          okVoice: "/audio/wren/m12c-s2-q2ok.mp3",
        },
        {
          t: "toggle",
          prompt: "Set ON the things that actually make a code hard to crack:",
          switches: [
            { label: "Millions upon millions of possible keys", sub: "", want: true },
            { label: "Only a handful of possible keys", sub: "a computer tries them all in a blink", want: false },
            { label: "A key too long to ever guess", sub: "", want: true },
          ],
          ok: "That's it. A mountain of possible keys and a key too long to guess. A handful of options is no protection at all.",
          okVoice: "/audio/wren/m12c-s2-q3ok.mp3",
        },
      ],
    },

    /* 3 · the padlock */
    {
      n: 3,
      title: "The padlock",
      goal: "The padlock (https) means the line between you and a site is sealed.",
      panel: "BROWSER · CONNECTION",
      learn: [
        { t: "wren", text: "You don't have to do the encrypting yourself, your browser does it, and it tells you when. See the little padlock, and the s in https? That means the whole conversation between you and that site is sealed, encrypted, unreadable to anyone in between. No padlock, no s, and the line is wide open. Learn to glance for that padlock, every time you type anything private.", voice: "/audio/wren/m12c-s3-learn.mp3" },
      ],
      practice: [
        { t: "sys", text: "A: http://shop-deals.net   (no padlock)      B: https://shop-deals.net 🔒  (padlock)" },
        {
          t: "choose",
          prompt: "You're about to type your details. Which connection is sealed?",
          options: [
            { label: "B, it has https and the padlock", outcome: "good", then: [{ t: "wren", text: "Right. The s and the padlock mean sealed. On A, with plain http, everything you type travels in the open for anyone listening to read. Padlock first, then type.", voice: "/audio/wren/m12c-s3-ok.mp3" }] },
            { label: "A, shorter address, must be simpler", outcome: "bad", then: [{ t: "wren", text: "Shorter isn't safer. Plain http has no padlock and no seal, everything you send is readable. Look for the s and the lock. Try again.", voice: "/audio/wren/m12c-s3-bad.mp3" }] },
            { label: "They're the same, the padlock is decoration", outcome: "bad", then: [{ t: "wren", text: "That padlock is doing real work, it means the line is encrypted. Without it, there's no seal at all. Try again.", voice: "/audio/wren/m12c-s3-bad2.mp3" }] },
          ],
        },
        { t: "sys", text: "ADDRESS BAR:  🔒 https://mail.example.com" },
        {
          t: "build",
          prompt: "Tap the TWO signs that tell you a connection is sealed:",
          need: 2,
          parts: [
            { label: "A padlock icon 🔒", good: true, sub: "" },
            { label: "https, with the s", good: true, sub: "" },
            { label: "A short web address", good: false, sub: "length says nothing about safety" },
            { label: "A colourful, friendly page", good: false, sub: "looks are not a seal" },
          ],
          ok: "Exactly. The padlock and the s in https. Those two, and nothing else, tell you the line is encrypted.",
          okVoice: "/audio/wren/m12c-s3-q2ok.mp3",
        },
        {
          t: "toggle",
          prompt: "Set your typing habits ON:",
          switches: [
            { label: "Type my details when I see the padlock 🔒", sub: "", want: true },
            { label: "Type my details on a plain http page", sub: "no lock, no seal", want: false },
            { label: "Glance for the padlock before anything private", sub: "", want: true },
          ],
          ok: "That's the reflex. Padlock first, then type. On a plain http page, whatever you enter travels in the open.",
          okVoice: "/audio/wren/m12c-s3-q3ok.mp3",
        },
      ],
    },

    /* 4 · postcards vs sealed envelopes */
    {
      n: 4,
      title: "Postcards vs envelopes",
      goal: "Unsealed messages travel like postcards; anyone on the route can read them.",
      panel: "TRAFFIC VIEW",
      learn: [
        { t: "wren", text: "Here's the picture that makes it click. A message sent without encryption is a postcard, every person who handles it on the way can read the whole thing. A sealed, encrypted message is a letter in an envelope, they can see it's going somewhere, but not what it says. When PACKRAT listens, postcards are a gift and envelopes are useless. So seal everything that matters.", voice: "/audio/wren/m12c-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You send your password over a plain, unencrypted connection. What is that, really?",
          options: [
            { label: "A postcard, anyone on the route can read it", outcome: "good", then: [{ t: "wren", text: "Exactly. No envelope, no seal, so every stop between you and the site can read your password in plain sight. Encryption is the envelope. Never post secrets on a postcard.", voice: "/audio/wren/m12c-s4-ok.mp3" }] },
            { label: "A sealed letter, passwords are always private", outcome: "bad", then: [{ t: "wren", text: "Only encryption seals it. On a plain connection your password is a postcard, readable by anyone handling it. Try again.", voice: "/audio/wren/m12c-s4-bad.mp3" }] },
            { label: "Safe, because it's travelling fast", outcome: "bad", then: [{ t: "wren", text: "Speed doesn't hide it. Unsealed means readable, however fast it goes. Try again.", voice: "/audio/wren/m12c-s4-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Sort the traffic. Set ON only the messages that travel as SEALED envelopes:",
          switches: [
            { label: "A login sent over https 🔒", sub: "", want: true },
            { label: "A password typed on a plain http page", sub: "that's a postcard", want: false },
            { label: "A private chat over an encrypted connection", sub: "", want: true },
          ],
          ok: "Right. Encrypted connections are envelopes, sealed shut. A plain http page is a postcard anyone on the route can read.",
          okVoice: "/audio/wren/m12c-s4-q2ok.mp3",
        },
        {
          t: "build",
          prompt: "Which things belong in a sealed envelope, never on a postcard? Tap the THREE:",
          need: 3,
          parts: [
            { label: "Your password", good: true, sub: "" },
            { label: "Your bank details", good: true, sub: "" },
            { label: "A private message", good: true, sub: "" },
            { label: "A poster you want everyone to see", good: false, sub: "meant to be public" },
            { label: "A public 'hello world' post", good: false, sub: "no secret to seal" },
          ],
          ok: "Exactly. Anything private, passwords, bank details, private messages, goes in a sealed envelope. Public things don't need one, but secrets always do.",
          okVoice: "/audio/wren/m12c-s4-q3ok.mp3",
        },
      ],
    },

    /* 5 · public wi-fi */
    {
      n: 5,
      title: "Who's on the wi-fi",
      goal: "On open public wi-fi, others can snoop. The padlock still protects each site.",
      panel: "NETWORK · CAFE-FREE-WIFI",
      learn: [
        { t: "wren", text: "Now the danger zone: free public wi-fi. On an open network, other people connected to it can try to listen to the traffic flying around, that's PACKRAT's favourite spot. The good news: any site with the padlock is still sealed, even on dodgy wi-fi. The rule is simple. On public wi-fi, stick to padlocked sites, and never send anything private over a connection with no lock.", voice: "/audio/wren/m12c-s5-learn.mp3" },
      ],
      practice: [
        {
          t: "toggle",
          prompt: "You're on CAFE-FREE-WIFI. Set your safe habits ON:",
          switches: [
            { label: "Only use sites with the padlock 🔒", sub: "", want: true },
            { label: "Check my bank on the plain http site", sub: "no lock", want: false },
            { label: "Save anything private for a network I trust", sub: "", want: true },
          ],
          ok: "That's the safe setup. Padlocked sites stay sealed even here, so those are fine. But a no-lock site on open wi-fi is a postcard read aloud in a crowd, so that switch stays OFF. Good instincts.",
          okVoice: "/audio/wren/m12c-s5-ok.mp3",
          bad: "Careful. On open wi-fi, stick to padlocked sites and leave anything private for a network you trust. Turn the risky one back OFF.",
          badVoice: "/audio/wren/m12c-s5-bad.mp3",
        },
        {
          t: "choose",
          prompt: "You're on free cafe wi-fi. Is it safe to log into a padlocked https site?",
          options: [
            { label: "Yes, the padlock keeps it sealed even here", outcome: "good", then: [{ t: "wren", text: "Right. Open wi-fi is risky, but a padlocked site stays sealed even there. The lock does its job wherever you are.", voice: "/audio/wren/m12c-s5-q2ok.mp3" }] },
            { label: "No, nothing is ever safe on public wi-fi", outcome: "bad", then: [{ t: "wren", text: "The good news is the padlock still seals each site, even on open wi-fi. Try again.", voice: "/audio/wren/m12c-s5-q2bad.mp3" }] },
            { label: "Only if the wi-fi has a password", outcome: "bad", then: [{ t: "wren", text: "A wi-fi password doesn't seal your traffic. The site's padlock is what keeps it sealed. Try again.", voice: "/audio/wren/m12c-s5-q2bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "On open public wi-fi, tap the TWO safe moves:",
          need: 2,
          parts: [
            { label: "Stick to padlocked sites", good: true, sub: "" },
            { label: "Save private stuff for a network you trust", good: true, sub: "" },
            { label: "Log into your bank on a no-lock site", good: false, sub: "a postcard in a crowd" },
            { label: "Trust the wi-fi because it's busy", good: false, sub: "busy doesn't mean safe" },
          ],
          ok: "That's the rule for open wi-fi. Padlocked sites only, and leave anything private for a network you trust.",
          okVoice: "/audio/wren/m12c-s5-q3ok.mp3",
        },
      ],
    },

    /* 6 · PACKRAT's play */
    {
      n: 6,
      title: "Know PACKRAT's play",
      goal: "Interception runs the same four moves, and the padlock breaks it.",
      panel: "THREAT MODEL",
      learn: [
        { t: "wren", text: "See PACKRAT's listening play, four moves. First, sit on an open network, like free cafe wi-fi. Second, quietly capture the traffic flowing past. Third, read anything that isn't sealed, postcards. Fourth, sell what it finds. And here's how you break it: every padlock turns your postcard into a sealed envelope, so all PACKRAT captures is gibberish. The lock does the whole job.", voice: "/audio/wren/m12c-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "PACKRAT captures all your traffic on the cafe wi-fi. Why does it still get nothing useful?",
          options: [
            { label: "Everything private went over padlocked, sealed connections", outcome: "good", then: [{ t: "wren", text: "That's the defence in a sentence. It can capture all the traffic it likes, but sealed is sealed, all it reads is gibberish. The padlock beat the listener before it even sat down.", voice: "/audio/wren/m12c-s6-ok.mp3" }] },
            { label: "Because PACKRAT is bad at its job", outcome: "bad", then: [{ t: "wren", text: "It captured everything just fine, it simply can't read sealed traffic. The padlock is why. Try again.", voice: "/audio/wren/m12c-s6-bad.mp3" }] },
            { label: "Because the cafe wi-fi was too slow", outcome: "bad", then: [{ t: "wren", text: "Speed has nothing to do with it. What stops PACKRAT reading your traffic is that it was encrypted. Try again.", voice: "/audio/wren/m12c-s6-bad2.mp3" }] },
          ],
        },
        { t: "sys", text: "THREAT MODEL · PACKRAT listening play, reconstructed…" },
        {
          t: "build",
          prompt: "Tap the FOUR moves in PACKRAT's listening play:",
          need: 4,
          parts: [
            { label: "Sit on an open network", good: true, sub: "" },
            { label: "Capture the traffic flowing past", good: true, sub: "" },
            { label: "Read anything that isn't sealed", good: true, sub: "" },
            { label: "Sell what it finds", good: true, sub: "" },
            { label: "Politely ask you for your password", good: false, sub: "it listens, it doesn't ask" },
            { label: "Guess every password by hand", good: false, sub: "that's a cracking rig, not a listener" },
          ],
          ok: "That's the whole play. Sit, capture, read the unsealed, sell it. Notice it never has to ask, it just listens.",
          okVoice: "/audio/wren/m12c-s6-q2ok.mp3",
        },
        {
          t: "toggle",
          prompt: "Set ON the habits that beat PACKRAT's play:",
          switches: [
            { label: "Send private things only over a padlock 🔒", sub: "", want: true },
            { label: "Send private info in plain http on open wi-fi", sub: "PACKRAT reads it instantly", want: false },
            { label: "Treat every open network as if someone's listening", sub: "", want: true },
          ],
          ok: "That's how you beat the play. Padlock everything private, and assume open networks are being watched, because with PACKRAT, they are.",
          okVoice: "/audio/wren/m12c-s6-q3ok.mp3",
        },
      ],
    },

    /* 7 · seal your traffic */
    {
      n: 7,
      title: "Seal your traffic",
      goal: "The habit that beats every listener: look for the lock, mind the network.",
      panel: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill, the everyday habit that beats every listener. One: before you type anything private, glance for the padlock. Two: on public wi-fi, stick to padlocked sites and save the private stuff for a network you trust. Do those two things and it doesn't matter who's listening, all they'll ever get is sealed nonsense. Simple, and it protects you for life.", voice: "/audio/wren/m12c-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "build",
          prompt: "Build your 'unreadable' habit. Tap the THREE moves that keep you sealed:",
          need: 3,
          parts: [
            { label: "Check for the padlock 🔒", good: true, sub: "" },
            { label: "Prefer networks you trust", good: true, sub: "" },
            { label: "Save secrets for a sealed connection", good: true, sub: "" },
            { label: "Type your password on any http site", good: false, sub: "no lock = postcard" },
            { label: "Trust free wi-fi with anything", good: false, sub: "PACKRAT's home turf" },
          ],
          ok: "That's the whole habit, and it's a strong one. Padlock, trusted network, secrets only over a sealed line. Do that and PACKRAT can listen all day and hear nothing.",
          okVoice: "/audio/wren/m12c-s7-ok.mp3",
          bad: "Careful, you picked a risky one. A no-lock site or blind trust in free wi-fi is exactly what a listener wants. Choose only the sealing moves.",
          badVoice: "/audio/wren/m12c-s7-bad.mp3",
        },
        {
          t: "choose",
          prompt: "You're about to type your password on public wi-fi. What's the FIRST thing you do?",
          options: [
            { label: "Glance for the padlock before typing anything", outcome: "good", then: [{ t: "wren", text: "Exactly. The padlock glance comes first, every time, before a single private letter is typed.", voice: "/audio/wren/m12c-s7-q2ok.mp3" }] },
            { label: "Type it fast so no one can catch it", outcome: "bad", then: [{ t: "wren", text: "Speed doesn't seal it. Only the padlock does. Check for the lock first. Try again.", voice: "/audio/wren/m12c-s7-q2bad.mp3" }] },
            { label: "Type it, then check the padlock after", outcome: "bad", then: [{ t: "wren", text: "Check first. Once it's sent unsealed, it's already out. Try again.", voice: "/audio/wren/m12c-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Set your everyday 'unreadable' habit ON:",
          switches: [
            { label: "Look for the padlock before typing private info", sub: "", want: true },
            { label: "Save secrets for a network you trust", sub: "", want: true },
            { label: "Send private info over any open connection", sub: "no lock means readable", want: false },
          ],
          ok: "That's the habit for life. Padlock first, private stuff only on trusted networks, and never anything secret over an open, unlocked line.",
          okVoice: "/audio/wren/m12c-s7-q3ok.mp3",
        },
      ],
    },
  ],

  boss: {
    panel: "LIVE INTERCEPT · PACKRAT",
    intro: "This is it, Agent. You're on the cafe wi-fi, and PACKRAT is on it too, capturing everything that moves. No hints from me. Keep your traffic sealed, and tell me exactly why it walks away empty-handed.",
    introVoice: "/audio/wren/m12c-boss-intro.mp3",
    phases: [
      {
        name: "The listener sits down",
        steps: [
          { t: "sys", text: "PACKRAT: joined CAFE-FREE-WIFI · capturing all traffic…" },
          { t: "sys", text: "CAPTURED from the person at table 4:  \"login: max  pass: buster99\"  (sent over http, no lock)" },
          {
            t: "choose",
            prompt: "PACKRAT just read someone's password in plain text. Why?",
            options: [
              { label: "They used a no-padlock http site, a postcard", outcome: "good" },
              { label: "PACKRAT guessed it", outcome: "bad", then: [{ t: "sys", text: "PACKRAT: no guessing needed, it was sent in the open" }] },
              { label: "The wi-fi was too fast", outcome: "bad", then: [{ t: "sys", text: "PACKRAT: speed is irrelevant, the traffic was unsealed" }] },
            ],
          },
        ],
      },
      {
        name: "Your turn",
        steps: [
          { t: "sys", text: "YOU: logging into your bank on https://mybank.co.uk 🔒" },
          { t: "sys", text: "PACKRAT CAPTURED from you:  \"x9$#a2!!Kd…Q7z\"  (unreadable)" },
          {
            t: "choose",
            prompt: "PACKRAT captured YOUR login too, but it's gibberish. Why?",
            options: [
              { label: "The padlock sealed it, encrypted end to end", outcome: "good" },
              { label: "You typed too fast for it to read", outcome: "bad", then: [{ t: "sys", text: "PACKRAT: it captured every byte, it just can't decode them" }] },
              { label: "PACKRAT left already", outcome: "bad", then: [{ t: "sys", text: "PACKRAT: still capturing, still reading gibberish" }] },
            ],
          },
        ],
      },
      {
        name: "The last try",
        steps: [
          { t: "sys", text: "A pop-up: \"Free wi-fi is slow! Switch to FASTER-CAFE-WIFI (no lock) to speed up.\"" },
          {
            t: "choose",
            prompt: "What do you do?",
            options: [
              { label: "Ignore it, never move private stuff to an unsealed network", outcome: "good" },
              { label: "Switch, faster sounds better", outcome: "bad", then: [{ t: "sys", text: "PACKRAT: that 'faster' network is mine…" }] },
              { label: "Switch, but only for the bank", outcome: "bad", then: [{ t: "sys", text: "PACKRAT: the bank is exactly what I want unsealed" }] },
            ],
          },
        ],
      },
    ],
    win: "Beautifully done, Agent. PACKRAT sat on the network and captured every single thing you sent, and walked away with a fistful of gibberish. Your padlocked connections stayed sealed, you never posted a secret on a postcard, and you didn't fall for the fake 'faster' network. The listener heard everything, and understood nothing.",
    winVoice: "/audio/wren/m12c-boss-win.mp3",
  },

  test: {
    intro: "Last thing before I sign this off, the test. A fresh batch, no hints, and you need to get most of them right. Everything about keeping things sealed, put it to work. Ready?",
    introVoice: "/audio/wren/m12c-test-intro.mp3",
    passVoice: "/audio/wren/m12c-test-pass.mp3",
    failVoice: "/audio/wren/m12c-test-fail.mp3",
    pass: 11,
    questions: [
      { scenario: "A message is scrambled with a secret key so only the right person can read it.", ask: "What's that called?", options: [{ label: "A cipher, encryption", correct: true }, { label: "A password" }, { label: "A firewall" }] },
      { scenario: "A shift cipher just moves each letter along by a fixed amount.", ask: "Why is it useless against a computer?", options: [{ label: "There are only 25 shifts to try", correct: true }, { label: "Computers can't read letters" }, { label: "It's actually unbreakable" }] },
      { scenario: "You're about to enter your details on a website.", ask: "What tells you the connection is sealed?", options: [{ label: "The padlock and https", correct: true }, { label: "A short web address" }, { label: "A colourful page" }] },
      { scenario: "You send a password over a plain, unencrypted connection.", ask: "What's it like?", options: [{ label: "A postcard anyone on the route can read", correct: true }, { label: "A sealed letter" }, { label: "Totally private, always" }] },
      { scenario: "You're on free cafe wi-fi and want to log in somewhere.", ask: "What's the safe rule?", options: [{ label: "Only use padlocked sites; save private stuff for a trusted network", correct: true }, { label: "Anything's fine on wi-fi" }, { label: "Plain http is faster, use that" }] },
      { scenario: "A listener captures all your traffic on open wi-fi, but gets only gibberish.", ask: "Why?", options: [{ label: "Your connections were padlocked and sealed", correct: true }, { label: "The listener was incompetent" }, { label: "The wi-fi was slow" }] },
      { scenario: "A friend hands you a note scrambled with a secret rule, but never tells you what the rule is.", ask: "Can you read it?", options: [{ label: "No, without the key it stays gibberish", correct: true }, { label: "Yes, scrambled notes are easy to read" }, { label: "Yes, if you read it fast enough" }] },
      { scenario: "Two locks: one has only a handful of possible keys, the other has more keys than there are atoms in the universe.", ask: "Which one is safe from a computer trying every key?", options: [{ label: "The lock with a handful of keys, fewer to remember" }, { label: "The lock with a mountain of possible keys", correct: true }, { label: "Both crack just as fast" }] },
      { scenario: "A shopping page wants your card number, but there's no padlock and the address begins with plain http.", ask: "What should you do?", options: [{ label: "Type it fast, before anyone notices" }, { label: "Type it, the page looks friendly enough" }, { label: "Don't type your card, the line isn't sealed", correct: true }] },
      { scenario: "You want to post a funny meme for everyone to see, and also send your bank details to a shop.", ask: "Which one MUST go in a sealed envelope?", options: [{ label: "The meme, so no one copies it" }, { label: "The bank details", correct: true }, { label: "Neither, a postcard is fine for both" }] },
      { scenario: "You're on the airport's open wi-fi and need to send a private message, but there's no padlock in sight.", ask: "Best move?", options: [{ label: "Wait and send it on a network you trust", correct: true }, { label: "Send it now, airports are safe places" }, { label: "Send it, a busy place is a safe place" }] },
      { scenario: "PACKRAT sits quietly on an open network, reading whatever flies past.", ask: "How does it get people's secrets?", options: [{ label: "By politely asking each person for their password" }, { label: "By guessing every password by hand" }, { label: "By listening to unsealed traffic, it never has to ask", correct: true }] },
      { scenario: "You sit down at a cafe and want to log into your email.", ask: "What's the very first thing to do?", options: [{ label: "Type your password as fast as you can" }, { label: "Glance for the padlock before typing anything private", correct: true }, { label: "Turn the screen brightness up" }] },
      { scenario: "You've finished your drink and want to do your online banking, but you're still on the cafe's open wi-fi.", ask: "Best move?", options: [{ label: "Save the banking for a network you trust", correct: true }, { label: "Do it now on the open wi-fi, it's quicker" }, { label: "Do it, just don't tell anyone" }] },
    ],
  },

  debrief: {
    title: "Sealed and unreadable.",
    lines: [
      "Seven skills, a live intercept, and a test, and PACKRAT captured everything you sent and could read none of it.",
      "You cracked a cipher, learned why real encryption holds, and made the padlock your reflex.",
      "You know a postcard from a sealed envelope now, and you keep your secrets in envelopes.",
    ],
    move:
      "This week, glance for the padlock before you type anything private, it's right there in the address bar. And on free wi-fi, stick to padlocked sites and leave the private stuff for a network you trust.",
  },
};
