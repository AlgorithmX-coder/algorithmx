/**
 * Block 3 · Case 015 "The Real Site" — MIMIC ③ — BLOCK FINALE — THE CONSOLE.
 *
 * Systems block finale. A login page's LOOK can't authenticate it; only the
 * ADDRESS BAR (the real domain) can, and your password manager is a lie detector
 * that won't autofill on the wrong site. Boss "Hall of Mirrors": five login pages,
 * one real. Ends: TOP SECRET ceremony. Breadcrumb (4): every mirror was registered
 * by the same hidden entity, linking all six actors to one signature.
 * Curriculum row M15.
 */

import type { ConsoleCase } from "./case11";

export const case15Console: ConsoleCase = {
  id: "explorers-m15",
  caseNumber: "CASE 015",
  title: "The Real Site",
  actor: "MIMIC",
  accent: "#FFB23E",
  open: [
    "Final system of the block, Agent, and MIMIC has saved its best trick for last. It can build a fake website that looks EXACTLY like the real one. Pixel for pixel.",
    "Your logo, your colours, your login box, perfect. Type your password into it and you've handed it straight to the thief. So how do you tell the real site from a perfect copy?",
    "Seven skills, then a boss and a test to earn your TOP SECRET clearance. The answer isn't in how the page looks. It's in one place a fake can never copy.",
  ],
  openVoice: ["/audio/wren/m15c-open-1.mp3", "/audio/wren/m15c-open-2.mp3", "/audio/wren/m15c-open-3.mp3"],

  skills: [
    /* 1 · a fake can look perfect */
    {
      n: 1,
      title: "A fake can look perfect",
      goal: "How a login page LOOKS proves nothing. A copy can be flawless.",
      panel: "BROWSER · PAGE",
      learn: [
        { t: "wren", text: "Start with the hard truth. Anyone can right-click a real login page and copy every pixel of it, the logo, the colours, the little padlock icon drawn ON the page. So the way a page LOOKS tells you nothing about whether it's real. A perfect-looking login box can be a thief's box. If your only check is 'it looks right', you've already lost. We need a check the fake can't copy.", voice: "/audio/wren/m15c-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A login page looks exactly like your bank's, logo and all. Does that prove it's real?",
          options: [
            { label: "No — a thief can copy every pixel of the look", outcome: "good", then: [{ t: "wren", text: "Exactly. The look is the easiest thing in the world to copy, so it proves nothing. Even a padlock drawn on the page is just a picture. We have to check something the copy can't fake, and that's next.", voice: "/audio/wren/m15c-s1-ok.mp3" }] },
            { label: "Yes — it looks perfect, so it must be real", outcome: "bad", then: [{ t: "wren", text: "Looking perfect is exactly what a good fake does. The look can be copied pixel for pixel. Try again.", voice: "/audio/wren/m15c-s1-bad.mp3" }] },
            { label: "Yes — the padlock on the page proves it", outcome: "bad", then: [{ t: "wren", text: "A padlock drawn on the page is just a picture, anyone can add one. That's not the real check. Try again.", voice: "/audio/wren/m15c-s1-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 2 · the address bar is the truth */
    {
      n: 2,
      title: "The address bar is the truth",
      goal: "The one thing a fake can't fake: the real web address at the top.",
      panel: "BROWSER · ADDRESS BAR",
      learn: [
        { t: "wren", text: "Here's the one thing a fake can never truly copy: the address bar, the real web address at the very top of your browser. A thief can make the PAGE look like your bank, but they cannot make the address bar say your bank's real domain, because that address belongs to your bank and no one else. So from now on, you don't trust the page. You read the address bar. That's the only place the truth lives.", voice: "/audio/wren/m15c-s2-learn.mp3" },
        { t: "sys", text: "Which address is your REAL bank?    A: mybank.co.uk    B: mybank.co.uk.secure-login.net" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Read the address bar. Which is your REAL bank?",
          options: [
            { label: "A — mybank.co.uk", outcome: "good", then: [{ t: "wren", text: "Correct. Read a web address right to left, like you learned in Case 1. In B, the real owner is 'secure-login.net', and 'mybank.co.uk' is just words stuck on the front to fool you. A always ends in the real domain. The address bar told the truth.", voice: "/audio/wren/m15c-s2-ok.mp3" }] },
            { label: "B — it says 'secure-login', sounds safer", outcome: "bad", then: [{ t: "wren", text: "That's the trap. Read it right to left: the real owner is secure-login.net, a stranger. 'mybank.co.uk' is just bait glued to the front. Try again.", voice: "/audio/wren/m15c-s2-bad.mp3" }] },
            { label: "They're the same site", outcome: "bad", then: [{ t: "wren", text: "They're not. One is owned by your bank, the other by secure-login.net. The ending is what counts. Try again.", voice: "/audio/wren/m15c-s2-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 3 · read the address, not the page */
    {
      n: 3,
      title: "Read the address, not the page",
      goal: "Ignore how it looks. Read the real domain carefully, every time.",
      panel: "BROWSER · ADDRESS BAR",
      learn: [
        { t: "wren", text: "So the habit is a flip. Most people glance at the page and trust the look. You do the opposite: ignore the pretty page, and read the address carefully instead. Look for tiny swaps too, an l that's really a 1, an o that's a zero, an extra word. Fakes hide in details that big to fool a quick glance. A slow read of the address bar beats the best-looking fake there is.", voice: "/audio/wren/m15c-s3-learn.mp3" },
      ],
      practice: [
        { t: "sys", text: "A: paypa1.com    B: paypal.com    C: paypal-verify.com" },
        {
          t: "choose",
          prompt: "You're logging into PayPal. Which address is the REAL one?",
          options: [
            { label: "B — paypal.com", outcome: "good", then: [{ t: "wren", text: "Nice slow read. A used a number 1 instead of an l, sneaky. C bolted 'verify' on the end, so its real owner is 'paypal-verify.com', a stranger. Only B is the genuine domain. Details like that are exactly what a careful read catches.", voice: "/audio/wren/m15c-s3-ok.mp3" }] },
            { label: "A — paypa1.com", outcome: "bad", then: [{ t: "wren", text: "Look very closely, that's a number 1, not an l. A classic look-alike. The real one is paypal.com. Try again.", voice: "/audio/wren/m15c-s3-bad.mp3" }] },
            { label: "C — paypal-verify.com", outcome: "bad", then: [{ t: "wren", text: "Read it right to left: the owner is 'paypal-verify.com', not PayPal. The real site is just paypal.com. Try again.", voice: "/audio/wren/m15c-s3-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 4 · the manager is a lie detector */
    {
      n: 4,
      title: "The manager is a lie detector",
      goal: "Your password manager only fills on the real domain. Silence means fake.",
      panel: "VAULT · AUTOFILL",
      learn: [
        { t: "wren", text: "Here's a beautiful bonus from the vault you built in Case 11. Your password manager remembers exactly which website each password belongs to. So it will only ever offer to fill your bank password on your bank's REAL address. Land on a perfect-looking fake, and the manager stays silent, it doesn't recognise the domain. That silence is a lie detector. If your manager won't fill it, don't type it.", voice: "/audio/wren/m15c-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A login page looks perfect, but your password manager won't offer to fill it. What does that mean?",
          options: [
            { label: "The domain is wrong — it's a fake, don't type your password", outcome: "good", then: [{ t: "wren", text: "Exactly. The manager checks the real address, not the look, and it's telling you this isn't the site your password belongs to. Your eyes can be fooled by a perfect copy. The manager can't. Trust the silence.", voice: "/audio/wren/m15c-s4-ok.mp3" }] },
            { label: "The manager is glitching — just type it manually", outcome: "bad", then: [{ t: "wren", text: "Don't override it, that silence is a warning. The manager won't fill because the address is wrong. Try again.", voice: "/audio/wren/m15c-s4-bad.mp3" }] },
            { label: "It means the page loaded too slowly", outcome: "bad", then: [{ t: "wren", text: "It's not about speed. The manager stays silent because it doesn't recognise the domain, meaning it's a fake. Try again.", voice: "/audio/wren/m15c-s4-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 5 · don't be sent, arrive */
    {
      n: 5,
      title: "Don't be sent — arrive",
      goal: "Never log in via a link someone sent. Go to the site yourself.",
      panel: "BROWSER · NAVIGATE",
      learn: [
        { t: "wren", text: "Here's how you dodge the whole trap before it starts. Most fake sites reach you through a link, in a message, an email, a pop-up. So the rule is simple: never log in through a link someone sent you. If you get a message about your bank, don't tap its link. Instead, ARRIVE at your bank yourself, type the address you know, use your bookmark, or open the app. A link can send you anywhere. Arriving yourself sends you to the real place.", voice: "/audio/wren/m15c-s5-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You get a message: \"Your bank account is locked, log in here to fix it.\" What do you do?",
          options: [
            { label: "Ignore the link — open your bank yourself, by app or bookmark", outcome: "good", then: [{ t: "wren", text: "Perfect. That link could go anywhere, including a flawless fake. By arriving at your bank yourself, you know you're at the real place, and if the warning was real, you'll see it there too. Never let a link do your navigating.", voice: "/audio/wren/m15c-s5-ok.mp3" }] },
            { label: "Tap the link quickly, it sounds urgent", outcome: "bad", then: [{ t: "wren", text: "Urgent is the bait. That link can lead to a perfect fake. Don't tap it, go to your bank yourself. Try again.", voice: "/audio/wren/m15c-s5-bad.mp3" }] },
            { label: "Tap the link but check the logo first", outcome: "bad", then: [{ t: "wren", text: "The logo can be copied, remember? Don't trust the link at all, arrive at your bank yourself instead. Try again.", voice: "/audio/wren/m15c-s5-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 6 · MIMIC's play */
    {
      n: 6,
      title: "Know MIMIC's play",
      goal: "The fake-site con runs four moves — and it isn't working alone.",
      panel: "THREAT MODEL",
      learn: [
        { t: "wren", text: "See MIMIC's fake-site play, four moves. First, copy a real login page perfectly. Second, host it on a look-alike address. Third, send you a link so you never check that address. Fourth, capture whatever you type. And you break it two ways: arrive yourself so no link chooses your address, and read the address bar so a look-alike can't fool you. One more thing for your dossier, Agent. Every fake site in this block traces back to the SAME hidden owner. These villains share a workshop.", voice: "/audio/wren/m15c-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A fake site copies your bank perfectly. What's the ONE check that never fails?",
          options: [
            { label: "Read the real address in the address bar", outcome: "good", then: [{ t: "wren", text: "That's the one. The page can be a flawless copy, but the address bar shows the true owner, and a thief can't put your bank's real address on their site. Read the bar, arrive yourself, let the manager confirm. The look never fools you again.", voice: "/audio/wren/m15c-s6-ok.mp3" }] },
            { label: "Check the logo matches", outcome: "bad", then: [{ t: "wren", text: "The logo is copied pixel for pixel, it proves nothing. The address bar is the check that can't be faked. Try again.", voice: "/audio/wren/m15c-s6-bad.mp3" }] },
            { label: "See if the page loads fast", outcome: "bad", then: [{ t: "wren", text: "Speed says nothing about real or fake. The address bar is your reliable check. Try again.", voice: "/audio/wren/m15c-s6-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 7 · trust the tools */
    {
      n: 7,
      title: "Trust the tools",
      goal: "The habit that beats the best fake ever made.",
      panel: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill of the block, and it's a calm one. When a login page appears, don't trust your eyes, trust your tools. One, arrive yourself, never through a link. Two, read the real address in the bar. Three, let your password manager confirm, if it won't fill, don't type. Do those three, and it doesn't matter how perfect a fake looks. You'll be checking the one thing it can never copy.", voice: "/audio/wren/m15c-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "build",
          prompt: "Build your 'real site' habit. Tap the THREE checks a fake can't survive:",
          need: 3,
          parts: [
            { label: "Arrive yourself, not via a link", good: true, sub: "" },
            { label: "Read the real address in the bar", good: true, sub: "" },
            { label: "Let the manager confirm the site", good: true, sub: "" },
            { label: "Trust it if the logo looks right", good: false, sub: "logos are copied" },
            { label: "Log in through the link you were sent", good: false, sub: "leads to fakes" },
          ],
          ok: "That's the whole habit, and it beats the best fake ever built. Arrive yourself, read the bar, let the manager confirm. A copy can fool your eyes, but never all three of those. TOP SECRET clearance, coming up.",
          okVoice: "/audio/wren/m15c-s7-ok.mp3",
          bad: "Careful, you picked one a fake would love. Trusting the logo or a sent link is exactly how the copy wins. Choose only the three checks it can't survive.",
          badVoice: "/audio/wren/m15c-s7-bad.mp3",
        },
      ],
    },
  ],

  boss: {
    panel: "HALL OF MIRRORS · MIMIC",
    intro: "This is it, Agent, the last case of the block. MIMIC has built five login pages that all look exactly like your bank. Only one is real. No hints from me. Use the address bar and your manager, and find the real door among the mirrors.",
    introVoice: "/audio/wren/m15c-boss-intro.mp3",
    phases: [
      {
        name: "Five perfect copies",
        steps: [
          { t: "sys", text: "MIMIC: five login pages loaded, all pixel-identical to mybank.co.uk…" },
          { t: "sys", text: "1: mybank.co.uk   2: mybank-co-uk.net   3: mybank.co.uk.login-secure.com   4: my8ank.co.uk   5: mybank.verify-account.co" },
          {
            t: "choose",
            prompt: "They look identical. Which address is the REAL bank?",
            options: [
              { label: "1 — mybank.co.uk", outcome: "good" },
              { label: "3 — it says mybank.co.uk at the start", outcome: "bad", then: [{ t: "sys", text: "READ RIGHT TO LEFT: real owner = login-secure.com ✗" }] },
              { label: "4 — my8ank.co.uk", outcome: "bad", then: [{ t: "sys", text: "LOOK CLOSER: that's an 8, not a b ✗" }] },
            ],
          },
        ],
      },
      {
        name: "The manager confirms",
        steps: [
          { t: "sys", text: "You land on page 5 (mybank.verify-account.co). It looks perfect." },
          { t: "sys", text: "PASSWORD MANAGER: no saved login for this domain · autofill NOT offered" },
          {
            t: "choose",
            prompt: "The page looks perfect, but your manager won't fill it. What do you do?",
            options: [
              { label: "Don't type — the silence means it's a fake", outcome: "good" },
              { label: "Type your password in manually", outcome: "bad", then: [{ t: "sys", text: "MIMIC: yes, type it in… (the manager knew it was fake)" }] },
              { label: "Refresh the page and try again", outcome: "bad", then: [{ t: "sys", text: "MANAGER: still won't fill, the domain is still wrong" }] },
            ],
          },
        ],
      },
      {
        name: "The link in the message",
        steps: [
          { t: "sys", text: "MESSAGE: \"Suspicious login on your bank! Secure it now:\" [tap here]" },
          {
            t: "choose",
            prompt: "A message wants you to tap a link to 'secure' your bank. How do you check it safely?",
            options: [
              { label: "Ignore the link — open my bank myself, by app or bookmark", outcome: "good" },
              { label: "Tap the link, it might be real", outcome: "bad", then: [{ t: "sys", text: "MIMIC: that link is my sixth mirror…" }] },
              { label: "Tap it, then read the address bar there", outcome: "bad", then: [{ t: "sys", text: "SAFER: never tap at all, arrive yourself" }] },
            ],
          },
        ],
      },
    ],
    win: "Flawless, Agent, and what a finish. Five pixel-perfect fakes, and you walked straight past every one, because you read the address bar instead of the page, you trusted your manager's silence, and you refused to be led by a link. MIMIC built a hall of mirrors, and you found the one real door with your eyes shut. That's the whole SYSTEMS block, mastered. TOP SECRET clearance is yours.",
    winVoice: "/audio/wren/m15c-boss-win.mp3",
  },

  test: {
    intro: "Last thing before your TOP SECRET clearance, the test. Six fresh ones, no hints, and you need five right. This one's your promotion, so read carefully and think. Ready?",
    introVoice: "/audio/wren/m15c-test-intro.mp3",
    passVoice: "/audio/wren/m15c-test-pass.mp3",
    failVoice: "/audio/wren/m15c-test-fail.mp3",
    pass: 5,
    questions: [
      { scenario: "A login page looks exactly like your bank's, logo and all.", ask: "Does the look prove it's real?", options: [{ label: "No — every pixel can be copied", correct: true }, { label: "Yes, a perfect look means real" }, { label: "Yes, the padlock on the page proves it" }] },
      { scenario: "Two addresses: mybank.co.uk and mybank.co.uk.secure-login.net.", ask: "Which is really your bank?", options: [{ label: "mybank.co.uk", correct: true }, { label: "mybank.co.uk.secure-login.net" }, { label: "They're the same" }] },
      { scenario: "You're logging into PayPal and see paypa1.com.", ask: "What's wrong with it?", options: [{ label: "That's a number 1, not an l — a look-alike fake", correct: true }, { label: "Nothing, it's fine" }, { label: "It's the mobile version" }] },
      { scenario: "A perfect-looking login page appears, but your password manager won't autofill.", ask: "What does the silence mean?", options: [{ label: "The domain is wrong — it's a fake, don't type", correct: true }, { label: "The manager is glitching, type it manually" }, { label: "The page is just slow" }] },
      { scenario: "You get a message with a link to 'fix' your locked bank account.", ask: "What's the safe way to check?", options: [{ label: "Ignore the link and open your bank yourself", correct: true }, { label: "Tap the link, it sounds urgent" }, { label: "Tap it but check the logo" }] },
      { scenario: "A fake site copies your bank perfectly.", ask: "What's the one check that never fails?", options: [{ label: "Read the real address in the address bar", correct: true }, { label: "Check the logo matches" }, { label: "See how fast it loads" }] },
    ],
  },

  debrief: {
    title: "TOP SECRET clearance earned.",
    lines: [
      "You've cleared the whole Systems block. Seven skills, a hall of five perfect fakes, and a test, and not one copy fooled you.",
      "You learned that a page's look proves nothing, and that only the address bar tells the truth, backed by your manager as a lie detector.",
      "And your dossier just grew: every fake site in this block traced to one hidden owner. All six villains share a workshop.",
    ],
    move:
      "This week, make it a reflex: before you type a password, read the address in the bar, slowly. And never log in through a link someone sent, arrive at the site yourself, by app or bookmark. The look can lie. The address bar can't.",
  },
};
