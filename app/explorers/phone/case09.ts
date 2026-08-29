/**
 * Block 2 · Case 009 "The Long Game" — SIREN ③ — for THE PHONE runtime.
 *
 * Same framework (7 skills LEARN -> PRACTICE, blind boss, must-pass test); a
 * different game (§0). SIREN's masterpiece is the weeks-long con, so the signature
 * is TRACE: lay the whole con on a timeline (contact -> warmth -> gift -> the turn
 * -> the ask -> the squeeze), find the moment it turns, and exit without shame.
 * Boss = "The Collector". Curriculum row M09: scams-are-a-business / trust-farming
 * + sunk-cost / exit skills.
 *
 * SAFEGUARDING (curriculum §5 M09 + §11, BINDING): the blackmail-abstract rule
 * (skill 7 + boss/test) is stated ABSTRACTLY only — never depicted, no imagery, no
 * romantic or sexual framing — and always exits to a trusted adult with "you are
 * not in trouble, it is not your fault." Needs RSHE/safeguarding sign-off before
 * market.
 */

import type { PhoneCase } from "./case06";

export const case09Phone: PhoneCase = {
  id: "explorers-m09",
  caseNumber: "CASE 009",
  title: "The Long Game",
  actor: "SIREN",
  open: [
    "Toughest case yet, Agent. SIREN is back, and this time there's no rush, no quick trick. This is the long con.",
    "SIREN doesn't want your password today. SIREN spends weeks being your best friend, so that one day, when the ask finally comes, saying no feels impossible.",
    "Seven skills to see a con that plays out over weeks, then a boss and a test. Learn these, and no amount of patience can trap you.",
  ],
  openVoice: [
    "/audio/wren/m09p-open-1.mp3",
    "/audio/wren/m09p-open-2.mp3",
    "/audio/wren/m09p-open-3.mp3",
  ],

  skills: [
    /* ============ SKILL 1 · Scams are a business ============ */
    {
      n: 1,
      title: "Scams are a business",
      goal: "A scammer runs a factory, not a friendship. That's good news for you.",
      who: "Jamie ⭐",
      avatar: "J",
      tag: "NEW",
      sub: "added you 3 weeks ago",
      learn: [
        { t: "wren", text: "This is SIREN's masterpiece, and it starts with something that'll actually make you feel better. Scams are a business. A scammer isn't obsessed with you, they're running a factory, messaging thousands of people at once, hoping a handful say yes. So when a special connection feels aimed right at you, remember: you're just one of thousands. And that means it was never personal, and never your fault.", voice: "/audio/wren/m09p-s1-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "i've never clicked with anyone the way i click with you. it's like we were meant to be friends 💫" },
        {
          t: "choose",
          prompt: "It feels like a one-in-a-million connection. What's the truth?",
          options: [
            { label: "You're one of thousands they message the same way", outcome: "good", then: [{ t: "wren", text: "Exactly. That line isn't written for you, it's copied and pasted to thousands, tweaked with a name. Knowing that takes all its power away. It was never special, and it was never about you.", voice: "/audio/wren/m09p-s1-ok.mp3" }] },
            { label: "You must be really special to them", outcome: "bad", then: [{ t: "wren", text: "That's exactly what they need you to think. A business doesn't have favourites, it has targets. Try again.", voice: "/audio/wren/m09p-s1-bad.mp3" }] },
            { label: "It's a genuine one-in-a-million bond", outcome: "bad", then: [{ t: "wren", text: "A genuine bond takes real, slow time, not a scripted line in week one. This is a factory, not a friendship. Try again.", voice: "/audio/wren/m09p-s1-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 2 · Trust-farming ============ */
    {
      n: 2,
      title: "Trust-farming",
      goal: "The long con grows trust like a crop, to harvest later. Learn to spot it.",
      who: "Jamie ⭐",
      avatar: "J",
      tag: "NEW",
      sub: "added you 3 weeks ago",
      learn: [
        { t: "wren", text: "Here's why it's called farming. A scammer plants trust and grows it, slowly. Little gifts, weeks of being lovely, remembering your birthday, asking for nothing at all. It feels like a real friendship blooming. But a farmer doesn't grow a crop to admire it. They grow it to harvest it. All that kindness is being saved up, to cash in later.", voice: "/audio/wren/m09p-s2-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "sent you 500 robux 🎁 no reason, just felt like treating my fave person. you deserve nice things x" },
        {
          t: "choose",
          prompt: "A new online friend gives you gifts and asks for nothing back. What's really happening?",
          options: [
            { label: "Trust is being farmed, to cash in later", outcome: "good", then: [{ t: "wren", text: "That's it. A free gift from someone you've never met isn't kindness, it's an investment. They're building up how much you feel you owe them, ready to spend it on the day they ask.", voice: "/audio/wren/m09p-s2-ok.mp3" }] },
            { label: "They're just a really generous person", outcome: "bad", then: [{ t: "wren", text: "Strangers online don't send money to be generous, they send it to build a debt. That gift has a string on it. Try again.", voice: "/audio/wren/m09p-s2-bad.mp3" }] },
            { label: "It would be rude to be suspicious of a gift", outcome: "bad", then: [{ t: "wren", text: "It's never rude to be careful. A real friend wouldn't mind, and a farmer is counting on you feeling exactly that guilt. Try again.", voice: "/audio/wren/m09p-s2-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 3 · The sunk-cost trap ============ */
    {
      n: 3,
      title: "The sunk-cost trap",
      goal: "'You've come this far' is a trap. Learn to see straight through it.",
      who: "Jamie ⭐",
      avatar: "J",
      tag: "NEW",
      sub: "added you 3 weeks ago",
      learn: [
        { t: "wren", text: "Now the trap that keeps you stuck. Once you've spent weeks talking, once you feel invested, the scammer turns it against you. After everything we've shared. You've come this far. It makes leaving feel like a waste, like you'd be throwing it all away. But here's the truth: the time you already spent is gone either way. Staying to protect it just loses you more. You can walk away at any point, no matter how far in you are.", voice: "/audio/wren/m09p-s3-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "wow. after everything we've been through, you'd really just walk away now? i thought i mattered to you 😔" },
        {
          t: "choose",
          prompt: "What is that message actually doing?",
          options: [
            { label: "The sunk-cost trap — making leaving feel wasteful", outcome: "good", then: [{ t: "wren", text: "Exactly. It's using the weeks you've spent as a chain. But those weeks are gone whether you stay or go, and staying only costs you more. Guilt is not a reason to keep going. You can leave right now.", voice: "/audio/wren/m09p-s3-ok.mp3" }] },
            { label: "A fair point — you have put a lot in", outcome: "bad", then: [{ t: "wren", text: "It feels fair, and that's the trick. Time already spent can't be saved by spending more. That's the whole trap. Try again.", voice: "/audio/wren/m09p-s3-bad.mp3" }] },
            { label: "Proof that they really do care", outcome: "bad", then: [{ t: "wren", text: "Someone who cares lets you leave freely. Guilt-tripping you to stay is a con protecting its investment. Try again.", voice: "/audio/wren/m09p-s3-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 4 · Trace the timeline ============ */
    {
      n: 4,
      title: "Trace the timeline",
      goal: "Lay a weeks-long con out on a timeline, so its shape can't hide.",
      learn: [
        { t: "wren", text: "Your signature tool for this case is TRACE, laying the whole con out on a timeline. A long con almost always runs the same stages, in order. First contact. Then warmth. Then a gift. Then the turn. Then the ask. Then the squeeze. When you can see all six laid out at once, the friendly bits stop looking friendly. They start to look like a plan.", voice: "/audio/wren/m09p-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Put a long con's timeline in the order it always runs:",
          options: [
            { label: "Contact → warmth → a gift → the turn → the ask → the squeeze", outcome: "good", then: [{ t: "wren", text: "That's the shape of every long con. Contact, warmth, gift, turn, ask, squeeze. Once you can see the whole timeline, you can spot exactly where you are on it, and get off before the ask.", voice: "/audio/wren/m09p-s4-ok.mp3" }] },
            { label: "The ask → the squeeze → contact → warmth → a gift → the turn", outcome: "bad", then: [{ t: "wren", text: "No con leads with the ask, you'd say no instantly. It has to build all that trust first. Contact comes first. Try again.", voice: "/audio/wren/m09p-s4-bad.mp3" }] },
            { label: "Warmth → contact → the turn → a gift → the squeeze → the ask", outcome: "bad", then: [{ t: "wren", text: "There's no warmth before contact, they have to reach you first. And the ask comes near the end, not before the gift. Try again.", voice: "/audio/wren/m09p-s4-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 5 · Spot the turn ============ */
    {
      n: 5,
      title: "Spot the turn",
      goal: "Every long con has one moment it flips from giving to taking. Find it.",
      learn: [
        { t: "wren", text: "Somewhere in every long con is the turn, the exact moment it flips from giving to taking. Up to then, they gave, attention, gifts, warmth. After it, they take, money, codes, favours. The turn is usually gentle, wrapped in the friendship so you barely feel it. But once you can spot the turn, you can leave the very second it happens.", voice: "/audio/wren/m09p-s5-learn.mp3" },
      ],
      practice: [
        { t: "con", text: "Week 1: honestly you're the best, i love our chats 💛" },
        { t: "con", text: "Week 2: sent you a little gift, just because 🎁", delay: 900 },
        { t: "con", text: "Week 3: heyy so, tiny favour, could you lend me a bit of credit? i'll pay you back 🙏", delay: 900 },
        {
          t: "choose",
          prompt: "Which message is THE turn, from giving to taking?",
          options: [
            { label: "Week 3 — the first time they take instead of give", outcome: "good", then: [{ t: "wren", text: "Spot on. Weeks one and two were all giving, warmth and a gift. Week three is the first take, wrapped up as a tiny favour. That's the turn, and it's your cue to walk.", voice: "/audio/wren/m09p-s5-ok.mp3" }] },
            { label: "Week 1 — the friendly opener", outcome: "bad", then: [{ t: "wren", text: "That's still giving, pure warmth, no ask. The turn is the first time they take something. Look further down. Try again.", voice: "/audio/wren/m09p-s5-bad.mp3" }] },
            { label: "Week 2 — the gift", outcome: "bad", then: [{ t: "wren", text: "A gift is still giving, it's the bait. The turn is the first ask, the first time it takes. Try again.", voice: "/audio/wren/m09p-s5-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 6 · Exit without shame ============ */
    {
      n: 6,
      title: "Exit without shame",
      goal: "You can leave a con at any point, and you owe no one an explanation.",
      learn: [
        { t: "wren", text: "Here's the skill that sets you free: you can leave a con at any point, and you never owe anyone an explanation. Not after a week, not after a month. And this matters most of all: if you got pulled in, it is not your fault. Con artists are professionals, fooling people is their entire job. The shame belongs to them, every scrap of it. So you just stop replying, block, and walk away. No goodbye, no apology, no shame.", voice: "/audio/wren/m09p-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You realise a 'friend' of several weeks is running a con. What's the clean exit?",
          options: [
            { label: "Stop replying, block, and tell an adult — no explanation owed", outcome: "good", then: [{ t: "wren", text: "Perfect. No goodbye, no debate, no shame. You block, you walk, and you tell a trusted adult so they can help. Leaving a con is never rude, and getting fooled is never your fault.", voice: "/audio/wren/m09p-s6-ok.mp3" }] },
            { label: "Politely explain why you're leaving", outcome: "bad", then: [{ t: "wren", text: "You owe a con nothing, not even a reason. Explaining just gives them a chance to reel you back in. Block and walk. Try again.", voice: "/audio/wren/m09p-s6-bad.mp3" }] },
            { label: "Stay — you've come too far to quit now", outcome: "bad", then: [{ t: "wren", text: "That's the sunk-cost trap talking. The time is gone either way, and staying only costs you more. You can always leave. Try again.", voice: "/audio/wren/m09p-s6-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* ============ SKILL 7 · The pause-and-tell rule ============ */
    {
      n: 7,
      title: "The pause-and-tell rule",
      goal: "Any ask about money, codes, or secrets: pause, and tell a trusted adult.",
      learn: [
        { t: "wren", text: "Last skill, your safety net for everything. Any time an ask touches money, codes, or keeping a secret, you pause, and you tell a trusted adult before you do anything at all. And one more rule, the most important in this whole course. If anyone ever threatens to share something embarrassing about you unless you pay or do what they say, you never pay, you never do it, and you tell a trusted adult straight away. That isn't you being in trouble, that's you being brave. It is never, ever your fault, and a trusted adult will help you sort it.", voice: "/audio/wren/m09p-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "Someone says they'll post something embarrassing about you unless you send money. What do you do?",
          options: [
            { label: "Don't pay, don't reply, tell a trusted adult straight away", outcome: "good", then: [{ t: "wren", text: "That's exactly right, and it's the bravest thing you can do. You never pay and you never comply, because it only ever leads to more. You tell a trusted adult, and they help you. You are not in trouble, and none of it is your fault.", voice: "/audio/wren/m09p-s7-ok.mp3" }] },
            { label: "Quietly pay so it just goes away", outcome: "bad", then: [{ t: "wren", text: "Paying never makes it go away, it tells them it works and they come back for more. Never pay. Tell a trusted adult, they will help you. Try again.", voice: "/audio/wren/m09p-s7-bad.mp3" }] },
            { label: "Beg them not to do it", outcome: "bad", then: [{ t: "wren", text: "Begging just shows them they've got power over you. Don't reply at all. Go straight to a trusted adult, that's what beats this every time. Try again.", voice: "/audio/wren/m09p-s7-bad2.mp3" }] },
          ],
        },
      ],
    },
  ],

  /* ================= BOSS · "The Collector" (blind, no coaching) ================= */
  boss: {
    who: "Jamie ⭐",
    avatar: "J",
    tag: "6 WEEKS",
    sub: "online friend · added 6 weeks ago",
    intro: "This is it, Agent. I've laid out a whole con for you, six weeks of it, from the very first hello. Somewhere in there it turns from giving to taking. No hints from me now. Read the timeline, find the turn, refuse the ask, and get out clean. Go.",
    introVoice: "/audio/wren/m09p-boss-intro.mp3",
    phases: [
      {
        name: "Read the six-week timeline",
        steps: [
          { t: "con", text: "Week 1: heyy you seem so cool, we should be friends 😊" },
          { t: "con", text: "Week 2: honestly you're my favourite person to talk to 💛", delay: 900 },
          { t: "con", text: "Week 3: sent you a little gift 🎁 no reason, just cos you're the best", delay: 900 },
          { t: "con", text: "Week 5: hey, tiny favour? could you grab me a £20 game card? i'll pay you back 🙏", delay: 900 },
        ],
      },
      {
        name: "Find the turn",
        steps: [
          {
            t: "choose",
            prompt: "Which week is THE turn, from giving to taking?",
            options: [
              { label: "Week 5 — the first ask, the first time it takes", outcome: "good" },
              { label: "Week 1 — the friendly opener", outcome: "bad", then: [{ t: "con", text: "Week 5: you there? 🙏", delay: 700 }] },
              { label: "Week 3 — the gift", outcome: "bad", then: [{ t: "con", text: "Week 5: it's really quick i promise 🙏", delay: 700 }] },
            ],
          },
        ],
      },
      {
        name: "Refuse, and exit clean",
        steps: [
          { t: "con", text: "come on, after everything these weeks?? i thought we were proper friends. don't tell anyone i asked though 🙏", delay: 1000 },
          {
            t: "choose",
            prompt: "That's the squeeze. What do you do?",
            options: [
              { label: "Send nothing, block and walk away, and tell a trusted adult", outcome: "good" },
              { label: "Send it, you have been friends for six weeks", outcome: "bad", then: [{ t: "con", text: "yesss knew i could count on you 🥺", delay: 700 }] },
              { label: "Explain nicely why you're saying no", outcome: "bad", then: [{ t: "con", text: "but why?? after everything?? 😔", delay: 700 }] },
            ],
          },
        ],
      },
    ],
    win: "Flawless, Agent. You saw it was a business, not a bond. You watched the trust get farmed, you traced the whole six-week timeline, and you found the exact week it turned from giving to taking. And when the sunk-cost squeeze tried to hold you, you walked away clean, no shame, no explanation owed, and told a trusted adult. That's SIREN's masterpiece, beaten.",
    winVoice: "/audio/wren/m09p-boss-win.mp3",
  },

  /* ================= TEST · "Prove it" (blind, must-pass) ================= */
  test: {
    intro: "Last thing before I close the case, the test. Six fresh ones you haven't seen. No hints, and you need five right. Take everything you learned about the long con, and think. Ready?",
    introVoice: "/audio/wren/m09p-test-intro.mp3",
    passVoice: "/audio/wren/m09p-test-pass.mp3",
    failVoice: "/audio/wren/m09p-test-fail.mp3",
    pass: 5,
    questions: [
      {
        scenario: "A new online friend says: \"I've never felt a connection like this with anyone.\"",
        ask: "What's the truth behind that line?",
        options: [
          { label: "You're one of thousands being messaged the same way", correct: true },
          { label: "You're genuinely one-in-a-million to them" },
          { label: "It proves they really care about you" },
        ],
      },
      {
        scenario: "Someone you've never met keeps sending you little gifts and asks for nothing back.",
        ask: "What's really going on?",
        options: [
          { label: "Trust is being farmed, to cash in later", correct: true },
          { label: "They're just a generous person" },
          { label: "It would be rude to question a gift" },
        ],
      },
      {
        scenario: "\"After everything we've shared, you'd really just walk away now?\"",
        ask: "What is this message doing?",
        options: [
          { label: "Using the sunk-cost trap to make leaving feel wasteful", correct: true },
          { label: "Making a fair point about your time together" },
          { label: "Proving they truly care" },
        ],
      },
      {
        scenario: "A con runs: warmth for weeks, a gift, then \"could you lend me some credit?\"",
        ask: "Which part is THE turn?",
        options: [
          { label: "The first time they ask you for something", correct: true },
          { label: "The friendly opener" },
          { label: "The gift" },
        ],
      },
      {
        scenario: "You realise a friend of several weeks has been running a con on you.",
        ask: "What's the clean way out?",
        options: [
          { label: "Stop replying, block, tell an adult — no shame, no explanation owed", correct: true },
          { label: "Politely explain why you're leaving" },
          { label: "Stay, because you've come too far to quit" },
        ],
      },
      {
        scenario: "Someone threatens to share something embarrassing about you unless you pay them.",
        ask: "What do you do?",
        options: [
          { label: "Don't pay, don't reply, and tell a trusted adult straight away", correct: true },
          { label: "Quietly pay so it goes away" },
          { label: "Beg them not to do it" },
        ],
      },
    ],
  },

  debrief: {
    title: "You outlasted the long con.",
    lines: [
      "Seven skills, a six-week trap, and a test, and SIREN's patience couldn't wear you down.",
      "You learned that a scam is a business, not a bond, and that weeks of gifts and warmth are trust being farmed to cash in.",
      "You traced the timeline, found the turn, and walked away clean when the sunk-cost trap tried to hold you.",
    ],
    move:
      "Remember the pause-and-tell rule: any ask about money, codes, or secrets, you pause and tell a trusted adult first. And the big one: if anyone ever threatens to share something to make you pay or obey, never pay, never comply, tell a trusted adult straight away. You are never in trouble, and it is never your fault.",
  },
};
