/**
 * Block 3 · Case 012 "Unreadable" — PACKRAT ② — CIPHER debut — THE CONSOLE.
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
            { label: "There are only 25 shifts — it tries them all instantly", outcome: "good", then: [{ t: "wren", text: "Exactly. A tiny number of keys means no key at all to a computer. Strong encryption wins by having so many possible keys that guessing is hopeless. Size is the whole game.", voice: "/audio/wren/m12c-s2-ok.mp3" }] },
            { label: "Computers can't read letters", outcome: "bad", then: [{ t: "wren", text: "Computers read letters faster than you ever could. The real weakness is there are only 25 shifts to try. Try again.", voice: "/audio/wren/m12c-s2-bad.mp3" }] },
            { label: "It isn't, a shift cipher is unbreakable", outcome: "bad", then: [{ t: "wren", text: "A shift falls in an instant, only 25 options. Real strength comes from a mountain of possible keys. Try again.", voice: "/audio/wren/m12c-s2-bad2.mp3" }] },
          ],
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
            { label: "B — it has https and the padlock", outcome: "good", then: [{ t: "wren", text: "Right. The s and the padlock mean sealed. On A, with plain http, everything you type travels in the open for anyone listening to read. Padlock first, then type.", voice: "/audio/wren/m12c-s3-ok.mp3" }] },
            { label: "A — shorter address, must be simpler", outcome: "bad", then: [{ t: "wren", text: "Shorter isn't safer. Plain http has no padlock and no seal, everything you send is readable. Look for the s and the lock. Try again.", voice: "/audio/wren/m12c-s3-bad.mp3" }] },
            { label: "They're the same, the padlock is decoration", outcome: "bad", then: [{ t: "wren", text: "That padlock is doing real work, it means the line is encrypted. Without it, there's no seal at all. Try again.", voice: "/audio/wren/m12c-s3-bad2.mp3" }] },
          ],
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
            { label: "A postcard — anyone on the route can read it", outcome: "good", then: [{ t: "wren", text: "Exactly. No envelope, no seal, so every stop between you and the site can read your password in plain sight. Encryption is the envelope. Never post secrets on a postcard.", voice: "/audio/wren/m12c-s4-ok.mp3" }] },
            { label: "A sealed letter — passwords are always private", outcome: "bad", then: [{ t: "wren", text: "Only encryption seals it. On a plain connection your password is a postcard, readable by anyone handling it. Try again.", voice: "/audio/wren/m12c-s4-bad.mp3" }] },
            { label: "Safe, because it's travelling fast", outcome: "bad", then: [{ t: "wren", text: "Speed doesn't hide it. Unsealed means readable, however fast it goes. Try again.", voice: "/audio/wren/m12c-s4-bad2.mp3" }] },
          ],
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
      ],
    },

    /* 6 · PACKRAT's play */
    {
      n: 6,
      title: "Know PACKRAT's play",
      goal: "Interception runs the same four moves — and the padlock breaks it.",
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
              { label: "They used a no-padlock http site — a postcard", outcome: "good" },
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
              { label: "The padlock sealed it — encrypted end to end", outcome: "good" },
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
              { label: "Ignore it — never move private stuff to an unsealed network", outcome: "good" },
              { label: "Switch — faster sounds better", outcome: "bad", then: [{ t: "sys", text: "PACKRAT: that 'faster' network is mine…" }] },
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
    intro: "Last thing before I sign this off, the test. Six fresh ones, no hints, and you need five right. Everything about keeping things sealed, put it to work. Ready?",
    introVoice: "/audio/wren/m12c-test-intro.mp3",
    passVoice: "/audio/wren/m12c-test-pass.mp3",
    failVoice: "/audio/wren/m12c-test-fail.mp3",
    pass: 5,
    questions: [
      { scenario: "A message is scrambled with a secret key so only the right person can read it.", ask: "What's that called?", options: [{ label: "A cipher — encryption", correct: true }, { label: "A password" }, { label: "A firewall" }] },
      { scenario: "A shift cipher just moves each letter along by a fixed amount.", ask: "Why is it useless against a computer?", options: [{ label: "There are only 25 shifts to try", correct: true }, { label: "Computers can't read letters" }, { label: "It's actually unbreakable" }] },
      { scenario: "You're about to enter your details on a website.", ask: "What tells you the connection is sealed?", options: [{ label: "The padlock and https", correct: true }, { label: "A short web address" }, { label: "A colourful page" }] },
      { scenario: "You send a password over a plain, unencrypted connection.", ask: "What's it like?", options: [{ label: "A postcard anyone on the route can read", correct: true }, { label: "A sealed letter" }, { label: "Totally private, always" }] },
      { scenario: "You're on free cafe wi-fi and want to log in somewhere.", ask: "What's the safe rule?", options: [{ label: "Only use padlocked sites; save private stuff for a trusted network", correct: true }, { label: "Anything's fine on wi-fi" }, { label: "Plain http is faster, use that" }] },
      { scenario: "A listener captures all your traffic on open wi-fi, but gets only gibberish.", ask: "Why?", options: [{ label: "Your connections were padlocked and sealed", correct: true }, { label: "The listener was incompetent" }, { label: "The wi-fi was slow" }] },
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
