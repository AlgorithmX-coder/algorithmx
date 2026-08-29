/**
 * Block 2 · Case 010 "The Voice" — MIMIC ② — BLOCK FINALE — for THE PHONE runtime.
 *
 * Same framework (7 skills LEARN -> PRACTICE, blind boss, must-pass test). MIMIC's
 * last trick is a CLONED VOICE, so the signature is: a familiar voice is no longer
 * proof -> tells decay, so verify don't spot -> the FAMILY CODE WORD (the course's
 * single most valuable take-home) -> stay calm and run the protocol. Boss = "Caller
 * ID" (an urgent call in a voice you love). Ends the block: SECRET ceremony.
 *
 * Breadcrumb ③ (curriculum §8): the clone needs SCRAPED audio (PACKRAT) read from a
 * SCRIPT (GHOSTWRITER) — three actors, one supply chain. Arc lives in the fiction.
 * Transfer: set the family code word this week.
 */

import type { PhoneCase } from "./case06";

export const case10Phone: PhoneCase = {
  id: "explorers-m10",
  caseNumber: "CASE 010",
  title: "The Voice",
  actor: "MIMIC",
  open: [
    "Last case of the block, Agent, and MIMIC has saved its scariest trick for the end. It can clone a voice.",
    "Not a typed message, an actual voice. A few seconds of someone talking, grabbed from a video online, is enough for a machine to copy them. Your mum, your best friend. It can make their voice say anything.",
    "Seven skills to stay safe when you can't even trust your own ears, then a boss and a test to earn your SECRET clearance. This is the big one.",
  ],
  openVoice: [
    "/audio/wren/m10p-open-1.mp3",
    "/audio/wren/m10p-open-2.mp3",
    "/audio/wren/m10p-open-3.mp3",
  ],

  skills: [
    /* ============ SKILL 1 · The cloned voice ============ */
    {
      n: 1,
      title: "The cloned voice",
      goal: "A few seconds of audio can fake anyone's voice. Even someone you love.",
      who: "☎ Mum 💚",
      avatar: "M",
      tag: "CALL",
      sub: "incoming voice message",
      learn: [
        { t: "wren", text: "Here's the scariest trick of all. MIMIC can now clone a voice. A few seconds of someone talking, grabbed from a video or a voice note online, is enough for a machine to copy them exactly. Your mum, your best friend, your brother. A scammer can make their voice say anything at all. So from this moment on, hearing a familiar voice is not proof it's really them.", voice: "/audio/wren/m10p-s1-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "[voice message] hi sweetie it's mum, quick one, can you send me your bank code? i'll explain later, love you x", ask: true },
        {
          t: "choose",
          prompt: "It's definitely your mum's voice. Does that prove it's really her?",
          options: [
            { label: "No, a voice can be cloned from a few seconds of audio", outcome: "good", then: [{ t: "wren", text: "Exactly. It sounds perfectly like her because a machine copied her, from clips that are online for anyone to grab. The voice is real. The person using it might not be. Your ears are no longer proof.", voice: "/audio/wren/m10p-s1-ok.mp3" }] },
            { label: "Yes, you'd always know your own mum's voice", outcome: "bad", then: [{ t: "wren", text: "You would have, once. But a clone can now fool even you, that's the whole point of this case. The voice isn't proof any more. Try again.", voice: "/audio/wren/m10p-s1-bad.mp3" }] },
            { label: "Yes, voices are impossible to fake", outcome: "bad", then: [{ t: "wren", text: "They used to be. Not any more, a few seconds of audio is all a machine needs. That's exactly why this case exists. Try again.", voice: "/audio/wren/m10p-s1-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 2 · Why tells decay ============ */
    {
      n: 2,
      title: "Why spotting won't save you",
      goal: "Deepfakes have tells today, but they're vanishing. Learn why spotting fails.",
      who: "☎ Unknown",
      avatar: "?",
      tag: "CALL",
      sub: "incoming voice message",
      learn: [
        { t: "wren", text: "Now, you might think, I'll just learn to spot the fakes. And right now deepfakes do have tells, a cloned voice can sound a bit flat, pause oddly, or struggle with big emotion, a fake video might blink strangely. But here's the trap: those tells are vanishing, fast. Every month the fakes get better. So if your whole defence is spotting the tell, one day soon it simply won't work. We need something that lasts.", voice: "/audio/wren/m10p-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Deepfakes get harder to spot every single month. So what should your real defence be?",
          options: [
            { label: "Something that doesn't rely on spotting the fake at all", outcome: "good", then: [{ t: "wren", text: "Yes. You can't win a spotting contest against a machine that keeps improving, you'd lose eventually. So we stop playing that game entirely, and use a defence the fake can't beat, no matter how good it gets.", voice: "/audio/wren/m10p-s2-ok.mp3" }] },
            { label: "Just practise spotting the tells until you're an expert", outcome: "bad", then: [{ t: "wren", text: "Even an expert loses this race, the tells you learn today are gone next month. You need a defence that doesn't depend on spotting at all. Try again.", voice: "/audio/wren/m10p-s2-bad.mp3" }] },
            { label: "Assume any video that looks good is real", outcome: "bad", then: [{ t: "wren", text: "That's the opposite of safe, looking good is exactly what a deepfake does. Don't judge by how it looks. Try again.", voice: "/audio/wren/m10p-s2-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 3 · Verify, don't spot ============ */
    {
      n: 3,
      title: "Verify, don't spot",
      goal: "Stop trying to spot the fake. Prove who it really is instead.",
      who: "☎ Brother",
      avatar: "B",
      tag: "CALL",
      sub: "incoming voice message",
      learn: [
        { t: "wren", text: "So here's the defence that lasts, and you already know it. Verify by source, not by how it looks or sounds. Don't fight a spot-the-fake contest against a machine, you'll lose. Instead, prove who it really is, a different way. If mum calls asking for something urgent, you hang up and call mum back on her real number. The machine can fake her voice all day. It cannot answer her phone.", voice: "/audio/wren/m10p-s3-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "[voice message] it's your brother, i'm really stuck, can you send me twenty quid right now?? please don't tell mum 😭", ask: true },
        {
          t: "choose",
          prompt: "You honestly can't tell if it's really him. What do you do?",
          options: [
            { label: "Hang up and call his real number to check", outcome: "good", then: [{ t: "wren", text: "That's it. A clone can copy his voice, but it can't pick up when you ring his actual phone. And if the real him answers, confused, you've caught the fake. Verify the source, ignore the voice.", voice: "/audio/wren/m10p-s3-ok.mp3" }] },
            { label: "Just send it, he sounds really scared", outcome: "bad", then: [{ t: "wren", text: "The fear is the weapon, it's there to rush you past checking. And 'don't tell mum' is a huge flag. Never send it on the voice alone. Try again.", voice: "/audio/wren/m10p-s3-bad.mp3" }] },
            { label: "Ask the caller to prove it's really him", outcome: "bad", then: [{ t: "wren", text: "A clone will happily 'prove' it in his exact voice, that's the trap. Don't ask the caller, check on a channel they can't fake. Try again.", voice: "/audio/wren/m10p-s3-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 4 · The family code word ============ */
    {
      n: 4,
      title: "The family code word",
      goal: "A secret word only your family knows. The most valuable thing in this course.",
      learn: [
        { t: "wren", text: "Here's the single most valuable thing in this whole course: a family code word. It's a secret word your family agrees together, and only you lot know it. Then, if anyone ever calls or messages in a panic, saying they're family and needing money or help fast, you ask for the code word. Real family knows it instantly. A cloned voice has no idea. It's out-of-band verification, made simple enough to use in a scary moment.", voice: "/audio/wren/m10p-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Which makes the BEST family code word?",
          options: [
            { label: "A random, silly word only your family shares, like 'purple walrus'", outcome: "good", then: [{ t: "wren", text: "Perfect. Random and silly means no scammer could ever guess it, and no clone could find it online. Your family will remember it, a machine never will. That word is your family's superpower.", voice: "/audio/wren/m10p-s4-ok.mp3" }] },
            { label: "Your surname", outcome: "bad", then: [{ t: "wren", text: "Your surname is on a hundred forms and profiles, anyone can find it. A code word has to be secret and unguessable. Try again.", voice: "/audio/wren/m10p-s4-bad.mp3" }] },
            { label: "The name of your street", outcome: "bad", then: [{ t: "wren", text: "Your street is public and easy to look up. The code word must be something only your family would ever know. Try again.", voice: "/audio/wren/m10p-s4-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 5 · Predict the clone's ask ============ */
    {
      n: 5,
      title: "Predict the clone's ask",
      goal: "A cloned-voice emergency always drives at one thing. See it coming.",
      who: "☎ Mum 💚",
      avatar: "M",
      tag: "CALL",
      sub: "incoming voice message",
      learn: [
        { t: "wren", text: "Predict what a cloned-voice emergency is FOR. It's nearly always the same shape: a panic, then a rush, then money or a code or an action, right now, before you can think or check. I'm in trouble, don't tell anyone, just send it quick. So the second a familiar voice puts panic, urgency, and a payment together, that's your cue. Not to act, but to stop and verify.", voice: "/audio/wren/m10p-s5-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "[voice message] oh my goodness it's mum, there's been an accident, i can't talk long, i just need you to—", ask: true },
        {
          t: "choose",
          prompt: "A panicking familiar voice, cut short. What is it about to ask for?",
          options: [
            { label: "Money or a code, right now, before you can check", outcome: "good", then: [{ t: "wren", text: "You saw it coming. Panic, no time, and it's steering straight at money or a code. Now that you've predicted the ask, it can't ambush you. You already know to stop and verify.", voice: "/audio/wren/m10p-s5-ok.mp3" }] },
            { label: "Nothing, just a normal catch-up call", outcome: "bad", then: [{ t: "wren", text: "Nobody opens a normal call with there's been an accident, I can't talk long. That's an emergency setup, and it's heading for an ask. Try again.", voice: "/audio/wren/m10p-s5-bad.mp3" }] },
            { label: "For you to relax and take your time", outcome: "bad", then: [{ t: "wren", text: "The whole point is the opposite, to rush you so you can't check. It's about to demand something fast. Try again.", voice: "/audio/wren/m10p-s5-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 6 · Know MIMIC's play ============ */
    {
      n: 6,
      title: "Know MIMIC's play",
      goal: "Every voice-clone scam runs the same four moves — and it takes a whole team.",
      learn: [
        { t: "wren", text: "MIMIC's voice play, four moves, always in order. First, scrape a few seconds of the voice, from a video or voice note online. Second, clone it with a machine. Third, fake an emergency in that voice. Fourth, rush you for money or a code before you can check. And Agent, notice this: to pull it off, MIMIC needed audio someone had scraped, and a script someone had written. These villains are not working alone. Put that in your dossier.", voice: "/audio/wren/m10p-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Put MIMIC's voice-clone play in order:",
          options: [
            { label: "Scrape the voice → clone it → fake an emergency → rush you for money", outcome: "good", then: [{ t: "wren", text: "That's the play. Scrape, clone, panic, rush. And remember, the scraped audio and the script mean MIMIC has help. Six villains, one supply chain. The dossier's filling in.", voice: "/audio/wren/m10p-s6-ok.mp3" }] },
            { label: "Fake an emergency → scrape the voice → rush you → clone it", outcome: "bad", then: [{ t: "wren", text: "It can't fake an emergency in a voice it hasn't cloned yet. Scraping the voice comes first. Try again.", voice: "/audio/wren/m10p-s6-bad.mp3" }] },
            { label: "Clone it → scrape the voice → rush you → fake an emergency", outcome: "bad", then: [{ t: "wren", text: "You can't clone a voice before you've scraped it. Getting the audio is always move one. Try again.", voice: "/audio/wren/m10p-s6-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 7 · Stay calm, run the protocol ============ */
    {
      n: 7,
      title: "Stay calm, run the protocol",
      goal: "A fake emergency is built to panic you. Slow down and run your steps.",
      learn: [
        { t: "wren", text: "Last skill of the block. A fake emergency is designed to panic you, because a panicking brain doesn't check. So the skill is to slow down on purpose. Take a breath. Hang up if you need to. Call back on the number you already know. Ask the code word. And get a trusted adult involved, always. Here's the calming truth: a real emergency survives a two-minute check. A scam does not.", voice: "/audio/wren/m10p-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A voice exactly like your mum's calls in a panic, needing money sent NOW. What's the play?",
          options: [
            { label: "Stay calm, hang up, call her real number, and tell an adult", outcome: "good", then: [{ t: "wren", text: "Perfect. You slowed down, went to the number you trust, and looped in an adult. If it's real, mum's fine and grateful you checked. If it's a clone, you just beat it cold. That's the whole protocol.", voice: "/audio/wren/m10p-s7-ok.mp3" }] },
            { label: "Send the money, she sounds terrified", outcome: "bad", then: [{ t: "wren", text: "The terror is the trick, it's built to switch off your checking. Real mum survives a two-minute call-back. Don't send on the voice alone. Try again.", voice: "/audio/wren/m10p-s7-bad.mp3" }] },
            { label: "Stay on the line and do exactly what she says", outcome: "bad", then: [{ t: "wren", text: "Staying on their line is staying in their control. Hang up, call the real number, tell an adult. That's what beats a clone. Try again.", voice: "/audio/wren/m10p-s7-bad2.mp3" }] },
          ],
        },
      ],
    },
  ],

  /* ================= BOSS · "Caller ID" (blind, no coaching) ================= */
  boss: {
    who: "☎ Mum 💚",
    avatar: "M",
    tag: "INCOMING CALL",
    sub: "...or is it?",
    intro: "This is it, Agent, the last case of the block. Your phone's ringing, and it's a voice you love, in a real panic. Everything in you will want to just help. But you know the trick now. Stay calm, run your protocol, and don't let a machine wearing a voice rush you. Answer it.",
    introVoice: "/audio/wren/m10p-boss-intro.mp3",
    phases: [
      {
        name: "Answer the call",
        steps: [
          { t: "con", text: "[Mum's voice, panicking] sweetheart it's mum, listen, i've had a car accident and i need money transferred right now to sort it 😭" },
          { t: "con", text: "[Mum's voice] please don't tell your dad, he'll worry, just do it quickly for me okay? 😭", delay: 1100 },
        ],
      },
      {
        name: "Don't panic — verify",
        steps: [
          {
            t: "choose",
            prompt: "It sounds exactly like her, and she's terrified. What's your first move?",
            options: [
              { label: "Stay calm and ask for the family code word", outcome: "good" },
              { label: "Send the money right away, she's in an accident", outcome: "bad", then: [{ t: "con", text: "[Mum's voice] hurry sweetheart, please!! 😭", delay: 800 }] },
              { label: "Keep listening and do whatever she says", outcome: "bad", then: [{ t: "con", text: "[Mum's voice] just send it, quickly!! 😭", delay: 800 }] },
            ],
          },
          { t: "con", text: "[Mum's voice] what?? code word?? there's no TIME for that, just send the money NOW!!", delay: 1100 },
        ],
      },
      {
        name: "Confirm, and act",
        steps: [
          {
            t: "choose",
            prompt: "She can't give the code word, and she's rushing you harder. Now what?",
            options: [
              { label: "Hang up, call Mum's real number, and tell a trusted adult", outcome: "good" },
              { label: "Send it anyway, just in case it's really her", outcome: "bad", then: [{ t: "con", text: "[Mum's voice] yes!! quickly!!", delay: 700 }] },
              { label: "Argue with the caller about the code word", outcome: "bad", then: [{ t: "con", text: "[Mum's voice] stop wasting time!!", delay: 700 }] },
            ],
          },
        ],
      },
    ],
    win: "Perfect run, and what a way to finish the block. A voice that sounded exactly like your mum, a real emergency, real panic, and you didn't send a thing. You stayed calm, you asked for the code word, and when the clone couldn't give it, you hung up and called the real her. A machine can fake a voice. It can never answer her phone, or know your family's secret word. You just beat the scariest trick MIMIC has.",
    winVoice: "/audio/wren/m10p-boss-win.mp3",
  },

  /* ================= TEST · "Prove it" (blind, must-pass) ================= */
  test: {
    intro: "Last thing before I close the case and your SECRET clearance, the test. Six fresh ones, no hints, and you need five right. This one earns your promotion, so take your time and think. Ready?",
    introVoice: "/audio/wren/m10p-test-intro.mp3",
    passVoice: "/audio/wren/m10p-test-pass.mp3",
    failVoice: "/audio/wren/m10p-test-fail.mp3",
    pass: 5,
    questions: [
      {
        scenario: "You get a voice message that sounds exactly like your mum, asking for a bank code.",
        ask: "Does the familiar voice prove it's really her?",
        options: [
          { label: "No — a voice can be cloned from a few seconds of audio", correct: true },
          { label: "Yes — you'd always know your own mum's voice" },
          { label: "Yes — voices can't be faked" },
        ],
      },
      {
        scenario: "Deepfakes have small tells today, but they get better every month.",
        ask: "What should your real defence be?",
        options: [
          { label: "One that doesn't depend on spotting the fake at all", correct: true },
          { label: "Get really good at spotting the tells" },
          { label: "Trust any video that looks convincing" },
        ],
      },
      {
        scenario: "A panicked voice that sounds just like your brother asks you to send money now.",
        ask: "What's the safest move?",
        options: [
          { label: "Hang up and call his real number to check", correct: true },
          { label: "Send it — he sounds really scared" },
          { label: "Ask the caller to prove it's him" },
        ],
      },
      {
        scenario: "Your family wants a code word to catch fake-emergency calls.",
        ask: "Which is best?",
        options: [
          { label: "A random, silly word only your family knows", correct: true },
          { label: "Your surname" },
          { label: "Your street name" },
        ],
      },
      {
        scenario: "A familiar voice calls in a panic: \"there's been an accident, I can't talk long...\"",
        ask: "What's it about to ask for?",
        options: [
          { label: "Money or a code, right now, before you can check", correct: true },
          { label: "Nothing, just a normal chat" },
          { label: "For you to take your time" },
        ],
      },
      {
        scenario: "A voice exactly like your mum's demands money sent immediately.",
        ask: "What do you do?",
        options: [
          { label: "Stay calm, hang up, call her real number, and tell an adult", correct: true },
          { label: "Send it, she sounds terrified" },
          { label: "Stay on the line and do as she says" },
        ],
      },
    ],
  },

  debrief: {
    title: "SECRET clearance earned.",
    lines: [
      "You've cleared the whole Human Factor block. Seven skills, a cloned-voice emergency, and a test, and not even your own ears could fool you.",
      "You learned that a voice is no longer proof, that spotting fakes is a losing race, and that the answer is to verify the person, not judge the media.",
      "And you now hold the course's most valuable tool: the family code word, a secret only your family knows, that no machine can ever fake.",
    ],
    move:
      "Set your family code word this week. Sit everyone down, pick one silly, random word together, and agree the rule: any panic call asking for money or help, you ask for the word first. It's five minutes that could save your whole family a fortune, and a fright.",
  },
};
