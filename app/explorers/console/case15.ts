/**
 * Block 3 · Case 015 "The Real Site", MIMIC ③, BLOCK FINALE, THE CONSOLE.
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
            { label: "No, a thief can copy every pixel of the look", outcome: "good", then: [{ t: "wren", text: "Exactly. The look is the easiest thing in the world to copy, so it proves nothing. Even a padlock drawn on the page is just a picture. We have to check something the copy can't fake, and that's next.", voice: "/audio/wren/m15c-s1-ok.mp3" }] },
            { label: "Yes, it looks perfect, so it must be real", outcome: "bad", then: [{ t: "wren", text: "Looking perfect is exactly what a good fake does. The look can be copied pixel for pixel. Try again.", voice: "/audio/wren/m15c-s1-bad.mp3" }] },
            { label: "Yes, the padlock on the page proves it", outcome: "bad", then: [{ t: "wren", text: "A padlock drawn on the page is just a picture, anyone can add one. That's not the real check. Try again.", voice: "/audio/wren/m15c-s1-bad2.mp3" }] },
          ],
        },
        { t: "sys", text: "MIMIC: cloning mybank.co.uk login page… logo ✓ colours ✓ padlock icon ✓" },
        {
          t: "toggle",
          prompt: "MIMIC just copied the page. Switch ON everything a thief CAN copy onto a fake:",
          switches: [
            { label: "The bank's logo", sub: "just an image", want: true },
            { label: "The colours and layout", sub: "easy to copy", want: true },
            { label: "A padlock drawn on the page", sub: "just a picture", want: true },
            { label: "The real web address at the top", sub: "belongs to the bank", want: false },
          ],
          ok: "Right. The logo, the colours, even a padlock picture are all copyable, so the look proves nothing. The one thing they cannot copy is the real address.",
          okVoice: "/audio/wren/m15c-s1-q2ok.mp3",
        },
        {
          t: "build",
          prompt: "Tap the THREE things a fake page can copy perfectly:",
          need: 3,
          parts: [
            { label: "The bank's logo", good: true, sub: "" },
            { label: "The exact colours", good: true, sub: "" },
            { label: "The whole login box design", good: true, sub: "" },
            { label: "The bank's real web address", good: false, sub: "cannot be copied" },
            { label: "Your actual password", good: false, sub: "the thief wants it, does not have it" },
          ],
          ok: "Exactly. Logo, colours, the whole login box, all copyable pixel for pixel. So a page looking right means nothing on its own.",
          okVoice: "/audio/wren/m15c-s1-q3ok.mp3",
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
            { label: "A, mybank.co.uk", outcome: "good", then: [{ t: "wren", text: "Correct. Read a web address right to left, like you learned in Case 1. In B, the real owner is 'secure-login.net', and 'mybank.co.uk' is just words stuck on the front to fool you. A always ends in the real domain. The address bar told the truth.", voice: "/audio/wren/m15c-s2-ok.mp3" }] },
            { label: "B, it says 'secure-login', sounds safer", outcome: "bad", then: [{ t: "wren", text: "That's the trap. Read it right to left: the real owner is secure-login.net, a stranger. 'mybank.co.uk' is just bait glued to the front. Try again.", voice: "/audio/wren/m15c-s2-bad.mp3" }] },
            { label: "They're the same site", outcome: "bad", then: [{ t: "wren", text: "They're not. One is owned by your bank, the other by secure-login.net. The ending is what counts. Try again.", voice: "/audio/wren/m15c-s2-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Where does the TRUTH about a website live? Switch ON the only place that cannot be faked:",
          switches: [
            { label: "The address bar at the top", sub: "the real domain", want: true },
            { label: "The logo on the page", sub: "copyable", want: false },
            { label: "A padlock drawn in the page", sub: "just a picture", want: false },
          ],
          ok: "Right. The address bar is the one place a fake cannot fake. The logo and an on-page padlock are only pictures. Read the bar, always.",
          okVoice: "/audio/wren/m15c-s2-q2ok.mp3",
        },
        {
          t: "build",
          prompt: "Why can a thief never put your bank's REAL address on their fake page? Tap the TWO true reasons:",
          need: 2,
          parts: [
            { label: "That address belongs to your bank alone", good: true, sub: "" },
            { label: "Only one owner can hold a domain", good: true, sub: "" },
            { label: "Because the logo is copyrighted", good: false, sub: "that is the look, not the address" },
            { label: "Because fake sites load slowly", good: false, sub: "speed proves nothing" },
          ],
          ok: "Exactly. A web address has one owner, and it is your bank, so a thief can copy the look but never the true address. That is why the bar is the truth.",
          okVoice: "/audio/wren/m15c-s2-q3ok.mp3",
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
            { label: "B, paypal.com", outcome: "good", then: [{ t: "wren", text: "Nice slow read. A used a number 1 instead of an l, sneaky. C bolted 'verify' on the end, so its real owner is 'paypal-verify.com', a stranger. Only B is the genuine domain. Details like that are exactly what a careful read catches.", voice: "/audio/wren/m15c-s3-ok.mp3" }] },
            { label: "A, paypa1.com", outcome: "bad", then: [{ t: "wren", text: "Look very closely, that's a number 1, not an l. A classic look-alike. The real one is paypal.com. Try again.", voice: "/audio/wren/m15c-s3-bad.mp3" }] },
            { label: "C, paypal-verify.com", outcome: "bad", then: [{ t: "wren", text: "Read it right to left: the owner is 'paypal-verify.com', not PayPal. The real site is just paypal.com. Try again.", voice: "/audio/wren/m15c-s3-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Your real site is google.com. Switch ON every address that is a FAKE look-alike:",
          switches: [
            { label: "google.com", sub: "the real one", want: false },
            { label: "goog1e.com", sub: "that is a number 1", want: true },
            { label: "google-login.com", sub: "extra word, new owner", want: true },
            { label: "gooogle.com", sub: "sneaky extra letter", want: true },
          ],
          ok: "Sharp eyes. goog1e uses a number 1, google-login bolts on a word so a stranger owns it, and gooogle sneaks in a letter. Only google.com is real.",
          okVoice: "/audio/wren/m15c-s3-q2ok.mp3",
        },
        {
          t: "build",
          prompt: "Tap the THREE sneaky tricks a fake address hides:",
          need: 3,
          parts: [
            { label: "A number 1 in place of an l", good: true, sub: "" },
            { label: "A zero in place of an o", good: true, sub: "" },
            { label: "An extra word bolted on the end", good: true, sub: "" },
            { label: "The correct spelling of the real domain", good: false, sub: "that is the real one" },
            { label: "Starting with https", good: false, sub: "real and fake sites both use it" },
          ],
          ok: "Those are the classics: a 1 for an l, a 0 for an o, and an extra word that hands the site to a stranger. A slow read catches all three.",
          okVoice: "/audio/wren/m15c-s3-q3ok.mp3",
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
            { label: "The domain is wrong, it's a fake, don't type your password", outcome: "good", then: [{ t: "wren", text: "Exactly. The manager checks the real address, not the look, and it's telling you this isn't the site your password belongs to. Your eyes can be fooled by a perfect copy. The manager can't. Trust the silence.", voice: "/audio/wren/m15c-s4-ok.mp3" }] },
            { label: "The manager is glitching, just type it manually", outcome: "bad", then: [{ t: "wren", text: "Don't override it, that silence is a warning. The manager won't fill because the address is wrong. Try again.", voice: "/audio/wren/m15c-s4-bad.mp3" }] },
            { label: "It means the page loaded too slowly", outcome: "bad", then: [{ t: "wren", text: "It's not about speed. The manager stays silent because it doesn't recognise the domain, meaning it's a fake. Try again.", voice: "/audio/wren/m15c-s4-bad2.mp3" }] },
          ],
        },
        { t: "sys", text: "PASSWORD MANAGER: comparing this page's domain to your saved logins…" },
        {
          t: "toggle",
          prompt: "Your manager fills only on the real domain. Switch ON when it WILL offer your bank password:",
          switches: [
            { label: "You are on your bank's real address", sub: "domain matches", want: true },
            { label: "You are on a perfect-looking copy", sub: "wrong domain", want: false },
            { label: "You are on a look-alike with a number 1", sub: "wrong domain", want: false },
          ],
          ok: "Right. The manager fills only when the domain truly matches, so it stays silent on the copy and the look-alike. Its silence is the alarm.",
          okVoice: "/audio/wren/m15c-s4-q2ok.mp3",
        },
        {
          t: "build",
          prompt: "Your manager stays silent on a login page. Tap the TWO smart responses:",
          need: 2,
          parts: [
            { label: "Do not type your password", good: true, sub: "" },
            { label: "Read the address bar for the real domain", good: true, sub: "" },
            { label: "Type it in by hand anyway", good: false, sub: "ignores the warning" },
            { label: "Assume the manager is broken", good: false, sub: "it is a lie detector, trust it" },
          ],
          ok: "Exactly. Silence means the domain is wrong, so do not type, and read the bar to confirm. The manager cannot be fooled by a pretty page.",
          okVoice: "/audio/wren/m15c-s4-q3ok.mp3",
        },
      ],
    },

    /* 5 · don't be sent, arrive */
    {
      n: 5,
      title: "Don't be sent, arrive",
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
            { label: "Ignore the link, open your bank yourself, by app or bookmark", outcome: "good", then: [{ t: "wren", text: "Perfect. That link could go anywhere, including a flawless fake. By arriving at your bank yourself, you know you're at the real place, and if the warning was real, you'll see it there too. Never let a link do your navigating.", voice: "/audio/wren/m15c-s5-ok.mp3" }] },
            { label: "Tap the link quickly, it sounds urgent", outcome: "bad", then: [{ t: "wren", text: "Urgent is the bait. That link can lead to a perfect fake. Don't tap it, go to your bank yourself. Try again.", voice: "/audio/wren/m15c-s5-bad.mp3" }] },
            { label: "Tap the link but check the logo first", outcome: "bad", then: [{ t: "wren", text: "The logo can be copied, remember? Don't trust the link at all, arrive at your bank yourself instead. Try again.", voice: "/audio/wren/m15c-s5-bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "Tap the THREE safe ways to ARRIVE at your bank yourself:",
          need: 3,
          parts: [
            { label: "Type the address you know", good: true, sub: "" },
            { label: "Use your saved bookmark", good: true, sub: "" },
            { label: "Open the official app", good: true, sub: "" },
            { label: "Tap the link in the message", good: false, sub: "a link can go anywhere" },
            { label: "Click the pop-up that appeared", good: false, sub: "pop-ups lead to fakes" },
          ],
          ok: "That is arriving: type it, use a bookmark, or open the app. Each one lands you at the real place. A link lets someone else choose where you go.",
          okVoice: "/audio/wren/m15c-s5-q2ok.mp3",
        },
        {
          t: "toggle",
          prompt: "Messages and emails often hold login links. Switch ON only the ways it is safe to reach your account:",
          switches: [
            { label: "Type the web address yourself", sub: "you pick the destination", want: true },
            { label: "Open your bank's app", sub: "goes to the real place", want: true },
            { label: "Tap the link in a text message", sub: "could be a fake", want: false },
            { label: "Tap a link inside an email", sub: "could be a fake", want: false },
          ],
          ok: "Right. Arriving yourself, by address or app, always lands you at the real site. Links in messages let a stranger pick your destination.",
          okVoice: "/audio/wren/m15c-s5-q3ok.mp3",
        },
      ],
    },

    /* 6 · MIMIC's play */
    {
      n: 6,
      title: "Know MIMIC's play",
      goal: "The fake-site con runs four moves, and it isn't working alone.",
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
        { t: "sys", text: "THREAT MODEL: MIMIC fake-site kit loaded · sourced from one hidden workshop" },
        {
          t: "build",
          prompt: "Tap the FOUR moves in MIMIC's fake-site play:",
          need: 4,
          parts: [
            { label: "Copy a real login page perfectly", good: true, sub: "" },
            { label: "Host it on a look-alike address", good: true, sub: "" },
            { label: "Send you a link so you skip the address", good: true, sub: "" },
            { label: "Capture whatever you type", good: true, sub: "" },
            { label: "Politely ask your bank for your password", good: false, sub: "that never happens" },
            { label: "Guess your password a million times", good: false, sub: "that is a different attack" },
          ],
          ok: "That is the whole con: copy, host on a look-alike, send a link, capture your typing. You break it by arriving yourself and reading the bar.",
          okVoice: "/audio/wren/m15c-s6-q2ok.mp3",
        },
        {
          t: "toggle",
          prompt: "You beat MIMIC with two habits. Switch ON the moves that break the con:",
          switches: [
            { label: "Arrive at the site yourself", sub: "no link picks your address", want: true },
            { label: "Read the real address in the bar", sub: "a look-alike cannot fool you", want: true },
            { label: "Trust the page because it looks right", sub: "the look is copied", want: false },
            { label: "Tap the link to save time", sub: "that is the trap", want: false },
          ],
          ok: "Those two break every move, and remember: every fake in this block traces back to the same hidden owner. These villains share a workshop.",
          okVoice: "/audio/wren/m15c-s6-q3ok.mp3",
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
        {
          t: "choose",
          prompt: "A login page appears out of nowhere. Following your habit, what's your FIRST move?",
          options: [
            { label: "Don't trust my eyes, arrive at the site myself", outcome: "good", then: [{ t: "wren", text: "Perfect. You never let a page that appeared choose your destination. Arrive yourself, read the bar, then let the manager confirm.", voice: "/audio/wren/m15c-s7-q2ok.mp3" }] },
            { label: "Trust it if it looks exactly right", outcome: "bad", then: [{ t: "wren", text: "The look is the one thing a fake copies perfectly. Trust your tools, not your eyes. Try again.", voice: "/audio/wren/m15c-s7-q2bad.mp3" }] },
            { label: "Type my password fast before it times out", outcome: "bad", then: [{ t: "wren", text: "Urgency is the bait. Slow down and run your three checks first. Try again.", voice: "/audio/wren/m15c-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Trust your tools, not your eyes. Switch ON the three checks that beat any fake:",
          switches: [
            { label: "Arrive yourself, never via a link", sub: "you pick the site", want: true },
            { label: "Read the real address in the bar", sub: "shows the true owner", want: true },
            { label: "Let the password manager confirm", sub: "it checks the domain", want: true },
            { label: "Trust it because the logo looks right", sub: "logos are copied", want: false },
          ],
          ok: "That is the habit locked in: arrive yourself, read the bar, let the manager confirm. Do those three and no copy, however perfect, ever fools you.",
          okVoice: "/audio/wren/m15c-s7-q3ok.mp3",
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
              { label: "1, mybank.co.uk", outcome: "good" },
              { label: "3, it says mybank.co.uk at the start", outcome: "bad", then: [{ t: "sys", text: "READ RIGHT TO LEFT: real owner = login-secure.com ✗" }] },
              { label: "4, my8ank.co.uk", outcome: "bad", then: [{ t: "sys", text: "LOOK CLOSER: that's an 8, not a b ✗" }] },
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
              { label: "Don't type, the silence means it's a fake", outcome: "good" },
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
              { label: "Ignore the link, open my bank myself, by app or bookmark", outcome: "good" },
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
    intro: "Last thing before your TOP SECRET clearance, the test. Fresh scenarios, no hints, and you'll need most of them right. This is your promotion, so read carefully and think. Ready?",
    introVoice: "/audio/wren/m15c-test-intro.mp3",
    passVoice: "/audio/wren/m15c-test-pass.mp3",
    failVoice: "/audio/wren/m15c-test-fail.mp3",
    pass: 11,
    questions: [
      { scenario: "A login page looks exactly like your bank's, logo and all.", ask: "Does the look prove it's real?", options: [{ label: "No, every pixel can be copied", correct: true }, { label: "Yes, a perfect look means real" }, { label: "Yes, the padlock on the page proves it" }] },
      { scenario: "Two addresses: mybank.co.uk and mybank.co.uk.secure-login.net.", ask: "Which is really your bank?", options: [{ label: "mybank.co.uk", correct: true }, { label: "mybank.co.uk.secure-login.net" }, { label: "They're the same" }] },
      { scenario: "You're logging into PayPal and see paypa1.com.", ask: "What's wrong with it?", options: [{ label: "That's a number 1, not an l, a look-alike fake", correct: true }, { label: "Nothing, it's fine" }, { label: "It's the mobile version" }] },
      { scenario: "A perfect-looking login page appears, but your password manager won't autofill.", ask: "What does the silence mean?", options: [{ label: "The domain is wrong, it's a fake, don't type", correct: true }, { label: "The manager is glitching, type it manually" }, { label: "The page is just slow" }] },
      { scenario: "You get a message with a link to 'fix' your locked bank account.", ask: "What's the safe way to check?", options: [{ label: "Ignore the link and open your bank yourself", correct: true }, { label: "Tap the link, it sounds urgent" }, { label: "Tap it but check the logo" }] },
      { scenario: "A fake site copies your bank perfectly.", ask: "What's the one check that never fails?", options: [{ label: "Read the real address in the address bar", correct: true }, { label: "Check the logo matches" }, { label: "See how fast it loads" }] },
      { scenario: "A game's login page copies the real one perfectly, right down to the moving background.", ask: "What does that flawless look prove about it?", options: [{ label: "It's the official page, only they could build it" }, { label: "Nothing, even a moving background can be copied", correct: true }, { label: "It's real as long as it loads with no errors" }] },
      { scenario: "A thief clones your email login but can't make the bar show your email's real address.", ask: "Why can the thief copy the look but never the true address?", options: [{ label: "A web address has one owner, and it isn't the thief", correct: true }, { label: "Because the logo is copyrighted" }, { label: "Because fake pages always load slowly" }] },
      { scenario: "You're signing into your streaming account and spot netf1ix.com in the bar.", ask: "What's the sneaky trick hidden in that address?", options: [{ label: "Nothing, that's the normal spelling" }, { label: "It's just the version made for phones" }, { label: "It uses a number 1 in place of an l", correct: true }] },
      { scenario: "Your password manager fills instantly on one shop but stays silent on a look-alike.", ask: "What is that silence telling you?", options: [{ label: "The silent one only needs a quick refresh" }, { label: "Both are fine, managers are unreliable" }, { label: "The silent one has the wrong domain, so it's a fake", correct: true }] },
      { scenario: "A pop-up warns your game account will be deleted unless you log in through its button now.", ask: "What's the safest way to reach your account?", options: [{ label: "Click the button fast before it's deleted" }, { label: "Ignore the pop-up and open the game's app yourself", correct: true }, { label: "Click the button, then check the page looks right" }] },
      { scenario: "MIMIC copies a login page, hosts it on a look-alike address, then texts you the link.", ask: "What is MIMIC counting on you doing next?", options: [{ label: "Reading the address bar slowly and carefully" }, { label: "Tapping the link and typing your password on the copy", correct: true }, { label: "Opening the real site from your own bookmark" }] },
      { scenario: "You want to be sure a login page is real, however good it looks.", ask: "Which set of checks actually does the job?", options: [{ label: "Arrive yourself, read the address bar, let the manager confirm", correct: true }, { label: "Check the logo, the colours, and the padlock picture" }, { label: "See how fast it loads and whether it shows ads" }] },
      { scenario: "Your eyes say a page is clearly real, but you haven't run a single check.", ask: "Why shouldn't you trust your eyes here?", options: [{ label: "Your eyes are always right about websites" }, { label: "Because a slow page would look different" }, { label: "The look is the one thing a fake copies perfectly", correct: true }] },
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
