/**
 * Block 3 · Case 013 "Backdoors" — SKELETON KEY ③ — THE CONSOLE.
 *
 * Systems block. SKELETON KEY stops attacking your password and goes for the BACK
 * door: account recovery. Signature moves = strategic (unguessable) security
 * answers, fresh + secured recovery, session hygiene. Cross-actor synthesis: the
 * answers are guessable from the crumbs PACKRAT-style footprints leak (callback to
 * M04). Boss "The Side Door". Curriculum row M13.
 */

import type { ConsoleCase } from "./case11";

export const case13Console: ConsoleCase = {
  id: "explorers-m13",
  caseNumber: "CASE 013",
  title: "Backdoors",
  actor: "SKELETON KEY",
  accent: "#FFA24D",
  open: [
    "Your locks are strong now, Agent. Unique passwords, 2FA, the lot. So SKELETON KEY has stopped trying the front door entirely.",
    "It's going for the BACK door: account recovery. That 'forgot my password' path, the security questions, the recovery email. If those are weak, your brilliant password doesn't matter one bit.",
    "Seven skills to slam every back door shut, then a boss and a test. Let's find the way in that you never think about, and lock it.",
  ],
  openVoice: ["/audio/wren/m13c-open-1.mp3", "/audio/wren/m13c-open-2.mp3", "/audio/wren/m13c-open-3.mp3"],

  skills: [
    /* 1 · recovery is the back door */
    {
      n: 1,
      title: "The back door",
      goal: "Every account has a second way in: recovery. A weak one undoes a strong password.",
      panel: "RECOVERY PATH",
      learn: [
        { t: "wren", text: "Here's the thing almost everyone forgets. Every account has a SECOND way in, the recovery path, the 'I forgot my password' button. It exists so YOU can get back in. But it's a door too, and if it's weaker than your password, that's the door a thief walks through. A castle with a titanium gate and an open back window isn't safe. So we go find the windows.", voice: "/audio/wren/m13c-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You have a long, unique password AND 2FA. Where does SKELETON KEY attack instead?",
          options: [
            { label: "The recovery path — the 'forgot password' back door", outcome: "good", then: [{ t: "wren", text: "Exactly. Why pick a titanium lock when there's a back door? A thief always goes for the weakest way in, and recovery is the one people never think to strengthen. So we're about to.", voice: "/audio/wren/m13c-s1-ok.mp3" }] },
            { label: "It just tries harder on the password", outcome: "bad", then: [{ t: "wren", text: "A strong unique password with 2FA is a dead end, so it won't waste time there. It looks for a weaker door: recovery. Try again.", voice: "/audio/wren/m13c-s1-bad.mp3" }] },
            { label: "It gives up completely", outcome: "bad", then: [{ t: "wren", text: "SKELETON KEY doesn't give up, it changes doors. The recovery path is the one it's heading for. Try again.", voice: "/audio/wren/m13c-s1-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 2 · security questions are guessable */
    {
      n: 2,
      title: "Guessable answers",
      goal: "Security questions ask for things a stranger can find in your footprint.",
      panel: "RECOVERY · SECURITY QS",
      learn: [
        { t: "wren", text: "Look at what security questions ask: your first pet's name, your mum's maiden name, the street you grew up on. And now remember Case 4, the footprint. Every one of those answers is sitting in your posts, your photos, your relatives' profiles. A security question isn't a secret. It's a quiz a stranger can pass by scrolling your feed. That's the flaw.", voice: "/audio/wren/m13c-s2-learn.mp3" },
        { t: "sys", text: "PROFILE SCRAPE:  dog 'Bailey' in 6 photos · school tagged · mum's maiden name on her profile" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Security question: \"What was your first pet's name?\" Why is that weak?",
          options: [
            { label: "It's all over your posts — a stranger can just look it up", outcome: "good", then: [{ t: "wren", text: "Right. Bailey the dog is in six photos. That 'secret' answer is public. A security question you can answer truthfully is one a thief can answer too. So we're going to stop answering them truthfully.", voice: "/audio/wren/m13c-s2-ok.mp3" }] },
            { label: "It's fine — only you know your pet's name", outcome: "bad", then: [{ t: "wren", text: "Your pet is tagged in half your photos. That answer is public, not secret. Try again.", voice: "/audio/wren/m13c-s2-bad.mp3" }] },
            { label: "Pets can't be security questions", outcome: "bad", then: [{ t: "wren", text: "They very much are, and that's the problem, the answer is easy to find. Try again.", voice: "/audio/wren/m13c-s2-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 3 · answers don't have to be true */
    {
      n: 3,
      title: "Answers can be lies",
      goal: "The fix is simple: security answers don't have to be TRUE, just unguessable.",
      panel: "RECOVERY · HARDEN",
      learn: [
        { t: "wren", text: "Here's the clever fix, and it feels like cheating. Your security answers don't have to be TRUE. Nobody checks whether Bailey was really your first pet. So you make the answer something no one could ever guess, and treat it like a password. First pet's name? Answer: purple-tractor-42. It's unguessable, and your password manager remembers it for you. A lie that only you know is the strongest answer there is.", voice: "/audio/wren/m13c-s3-learn.mp3" },
      ],
      practice: [
        {
          t: "build",
          prompt: "\"What street did you grow up on?\" Build the SAFEST answer. Tap the TWO things that make it strong:",
          need: 2,
          parts: [
            { label: "A made-up answer, not the true one", good: true, sub: "unguessable" },
            { label: "Stored in your password manager", good: true, sub: "so you don't forget it" },
            { label: "Your real street name", good: false, sub: "on a hundred records" },
            { label: "Something in your bio", good: false, sub: "public" },
          ],
          ok: "Perfect. A made-up answer no one can look up, remembered by your manager so you never lose it. Now even a thief who knows your whole life story can't answer your security question, because the answer isn't your life story.",
          okVoice: "/audio/wren/m13c-s3-ok.mp3",
          bad: "Careful. Anything true, or anything public like your bio, is guessable. The strongest answer is a made-up one your manager remembers. Pick those two.",
          badVoice: "/audio/wren/m13c-s3-bad.mp3",
        },
      ],
    },

    /* 4 · keep recovery fresh */
    {
      n: 4,
      title: "Keep recovery fresh",
      goal: "Your recovery email and phone must be current, and locked down themselves.",
      panel: "RECOVERY · CONTACTS",
      learn: [
        { t: "wren", text: "One more back-door check. If your account resets through an OLD email you don't use any more, and someone gets into that dead inbox, they can reset everything through it. So your recovery contact, email or phone, must be current, one you still control, and locked with its own 2FA. A recovery email is a master key. Treat it like one.", voice: "/audio/wren/m13c-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "toggle",
          prompt: "Secure your recovery. Set these ON:",
          switches: [
            { label: "Recovery email is one I still use", sub: "not a dead old account", want: true },
            { label: "2FA is on that recovery email", sub: "it can reset everything", want: true },
            { label: "Leave an old forgotten email as backup", sub: "just in case", want: false },
          ],
          ok: "Locked. A current recovery email you control, with its own second lock, and no dead old inbox hanging around as a way in. Whoever controls your recovery controls your account, so now that's only you.",
          okVoice: "/audio/wren/m13c-s4-ok.mp3",
          bad: "Not quite. Your recovery email must be current AND have 2FA, and an old forgotten inbox is a way in, not a safety net. Fix the switches.",
          badVoice: "/audio/wren/m13c-s4-bad.mp3",
        },
      ],
    },

    /* 5 · session hygiene */
    {
      n: 5,
      title: "Log out the strangers",
      goal: "Old logged-in devices are open doors. Sign out where you shouldn't be.",
      panel: "ACTIVE SESSIONS",
      learn: [
        { t: "wren", text: "Last door: you leave yourself logged in everywhere, and forget. That library computer, a friend's tablet, a phone you sold. Every account keeps a list of devices it's logged in on, and each is a door left open. So two habits: on any shared or public machine, log OUT when you're done, never just close the tab. And now and then, check that device list and kick off anything you don't recognise.", voice: "/audio/wren/m13c-s5-learn.mp3" },
      ],
      practice: [
        {
          t: "toggle",
          prompt: "Review your active sessions. Turn OFF (log out) the ones that shouldn't be there:",
          switches: [
            { label: "Your own phone — home", sub: "keep it", want: true },
            { label: "Library PC · 3 weeks ago", sub: "you never logged out", want: false },
            { label: "Unknown device · another city", sub: "not you", want: false },
          ],
          ok: "Good sweep. Your own phone stays, but the library PC you forgot and a login from a city you've never been to are both doors slammed shut. Logging out where you shouldn't be is a two-second habit that closes real gaps.",
          okVoice: "/audio/wren/m13c-s5-ok.mp3",
          bad: "Not quite. Keep your own phone, but log OUT the forgotten library PC and that unknown device in another city, those aren't you. Fix it.",
          badVoice: "/audio/wren/m13c-s5-bad.mp3",
        },
      ],
    },

    /* 6 · SKELETON KEY's play */
    {
      n: 6,
      title: "Know SKELETON KEY's play",
      goal: "The recovery attack runs four moves — and a hardened back door stops it.",
      panel: "THREAT MODEL",
      learn: [
        { t: "wren", text: "See SKELETON KEY's back-door play, four moves. First, skip your strong password entirely. Second, click 'forgot password'. Third, answer your security questions using facts scraped from your public life. Fourth, reset your password and stroll in. And here's the wall you just built: made-up answers it can't guess, and a locked recovery email it can't reach. Every move fails.", voice: "/audio/wren/m13c-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "SKELETON KEY tries the recovery path with everything it knows about you. Why does it fail?",
          options: [
            { label: "Your security answers are made-up, and recovery is locked", outcome: "good", then: [{ t: "wren", text: "That's the whole defence. It can know your real pet, street, and school, and it still can't answer, because your answers are lies only you know. And it can't hijack your recovery email either. The back door is shut.", voice: "/audio/wren/m13c-s6-ok.mp3" }] },
            { label: "Because it doesn't know your real details", outcome: "bad", then: [{ t: "wren", text: "Assume it knows everything real about you, that's the point. It fails because your ANSWERS aren't the real details. Try again.", voice: "/audio/wren/m13c-s6-bad.mp3" }] },
            { label: "Because recovery paths don't really work", outcome: "bad", then: [{ t: "wren", text: "Recovery works fine, that's why it's a target. It fails because you made the answers unguessable and locked recovery. Try again.", voice: "/audio/wren/m13c-s6-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 7 · slam the side door */
    {
      n: 7,
      title: "Slam the side door",
      goal: "The habit that closes the back door for good.",
      panel: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill, your back-door habit. One, make your security answers unguessable lies your manager remembers. Two, keep your recovery email current and locked with 2FA. Three, log out on shared machines and sweep your device list now and then. Do those, and you've closed the door most people never even knew was open.", voice: "/audio/wren/m13c-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "build",
          prompt: "Build your back-door defence. Tap the THREE moves that shut it:",
          need: 3,
          parts: [
            { label: "Unguessable, made-up security answers", good: true, sub: "" },
            { label: "Current recovery email with 2FA", good: true, sub: "" },
            { label: "Log out on shared machines", good: true, sub: "" },
            { label: "Answer questions truthfully", good: false, sub: "guessable" },
            { label: "Reuse an old email for recovery", good: false, sub: "a way in" },
          ],
          ok: "That's the back door bolted. Made-up answers, locked recovery, clean sessions. A thief can know everything true about you and still be left standing outside every door.",
          okVoice: "/audio/wren/m13c-s7-ok.mp3",
          bad: "Careful, you picked a weak one. True answers and old recovery emails are exactly the gaps a thief uses. Choose only the three that shut the door.",
          badVoice: "/audio/wren/m13c-s7-bad.mp3",
        },
      ],
    },
  ],

  boss: {
    panel: "LIVE ATTACK · SKELETON KEY",
    intro: "This is it, Agent. SKELETON KEY has given up on your password and gone straight for the back door, armed with everything it scraped about your life. No hints from me. Hold the recovery path, and tell me why every attempt bounces.",
    introVoice: "/audio/wren/m13c-boss-intro.mp3",
    phases: [
      {
        name: "The forgot-password click",
        steps: [
          { t: "sys", text: "SKELETON KEY: skipping password… clicking 'Forgot password?'" },
          { t: "sys", text: "SECURITY Q: \"First pet's name?\"   SK scraped answer: 'Bailey'   ENTERED: Bailey" },
          { t: "sys", text: "RESULT: ✗ INCORRECT (your answer: a made-up lie)" },
          {
            t: "choose",
            prompt: "SKELETON KEY knew your real pet's name, and still got it wrong. Why?",
            options: [
              { label: "Your saved answer is a made-up lie, not the true one", outcome: "good" },
              { label: "It spelled Bailey wrong", outcome: "bad", then: [{ t: "sys", text: "SK: spelling verified correct… still ✗" }] },
              { label: "The pet's name changed", outcome: "bad", then: [{ t: "sys", text: "SK: real name confirmed, answer still ✗" }] },
            ],
          },
        ],
      },
      {
        name: "The recovery email",
        steps: [
          { t: "sys", text: "SKELETON KEY: trying to reset via your recovery email…" },
          { t: "sys", text: "TARGET recovery inbox: locked · 2FA required · code on your phone only" },
          {
            t: "choose",
            prompt: "It went for your recovery email instead. Why is that a dead end?",
            options: [
              { label: "Your recovery email is current and 2FA-locked", outcome: "good" },
              { label: "Recovery emails can't be reset", outcome: "bad", then: [{ t: "sys", text: "SK: they can, but this one has 2FA… ✗" }] },
              { label: "It ran out of time", outcome: "bad", then: [{ t: "sys", text: "SK: plenty of time, still locked out by 2FA" }] },
            ],
          },
        ],
      },
      {
        name: "The forgotten door",
        steps: [
          { t: "sys", text: "SKELETON KEY: scanning for old sessions and dead recovery emails to hijack…" },
          { t: "sys", text: "FOUND: none. (old email removed · library PC logged out · sessions clean)" },
          {
            t: "choose",
            prompt: "It went looking for a forgotten open door. Why did it find none?",
            options: [
              { label: "You cleaned up — no old email, no stale sessions left", outcome: "good" },
              { label: "It didn't look hard enough", outcome: "bad", then: [{ t: "sys", text: "SK: searched everything, found no gaps" }] },
              { label: "You got lucky", outcome: "bad", then: [{ t: "sys", text: "SK: not luck, there simply were no open doors" }] },
            ],
          },
        ],
      },
    ],
    win: "Watch that, Agent. SKELETON KEY knew your real pet, your real school, your real street, and it still couldn't get in. Your made-up answers beat its whole scrapbook, your locked recovery email held, and there wasn't a single forgotten door left open. You didn't just lock the front. You bolted every window it knew about.",
    winVoice: "/audio/wren/m13c-boss-win.mp3",
  },

  test: {
    intro: "Last thing before I sign this off, the test. Six fresh ones, no hints, and you need five right. Everything about back doors, put it to work. Ready?",
    introVoice: "/audio/wren/m13c-test-intro.mp3",
    passVoice: "/audio/wren/m13c-test-pass.mp3",
    failVoice: "/audio/wren/m13c-test-fail.mp3",
    pass: 5,
    questions: [
      { scenario: "You have a strong unique password and 2FA.", ask: "Where does a thief attack instead?", options: [{ label: "The account recovery / 'forgot password' path", correct: true }, { label: "They just try the password harder" }, { label: "They give up entirely" }] },
      { scenario: "A security question asks for your first pet's name.", ask: "Why is that a weak secret?", options: [{ label: "It's findable in your posts and photos", correct: true }, { label: "Only you could ever know it" }, { label: "Pets can't be security questions" }] },
      { scenario: "You want a security answer a thief can't guess.", ask: "What's the trick?", options: [{ label: "Use a made-up answer, stored in your manager", correct: true }, { label: "Use your real, true answer" }, { label: "Use something from your bio" }] },
      { scenario: "Your account can reset through an old email you don't use.", ask: "Why is that dangerous?", options: [{ label: "Whoever gets that dead inbox can reset your account", correct: true }, { label: "Old emails are always safe" }, { label: "It's fine as a backup" }] },
      { scenario: "You used a library computer to log into your account.", ask: "What should you do when done?", options: [{ label: "Log out fully, don't just close the tab", correct: true }, { label: "Just close the tab" }, { label: "Leave it, it's fine" }] },
      { scenario: "A thief knows your real pet, street and school, but still can't reset your account.", ask: "Why?", options: [{ label: "Your answers are made-up and recovery is locked", correct: true }, { label: "It doesn't really know your details" }, { label: "Recovery paths don't work" }] },
    ],
  },

  debrief: {
    title: "Every door bolted.",
    lines: [
      "Seven skills, a back-door siege, and a test, and SKELETON KEY's whole scrapbook got it nowhere.",
      "You learned that recovery is a door too, made your security answers unguessable lies, and locked your recovery email.",
      "You swept your sessions clean, so there wasn't a forgotten window left open anywhere.",
    ],
    move:
      "This week, fix the security questions on one important account: swap the true answers for made-up ones your password manager remembers. And check your recovery email is one you still use, with 2FA switched on.",
  },
};
