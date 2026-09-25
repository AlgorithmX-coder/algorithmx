import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 19 - Protecting Family: Family Firewall
 *
 * Rebuilt to the Learn-Loop Build Standard. 30 screens:
 *
 *   video -> alert -> ATLAS briefing -> mission
 *   5 BEATS, each = Learn (info) -> Game -> Prove (quickCheck) -> recap:
 *     1 EXPERT   you know more than they do now    | explainIt        | recall
 *     2 TELLS    help a grown-up see the trick     | clueStamper      | lie
 *     3 QUILT    house rules that are FAIR         | hearthLoom       | recall
 *     4 AFTER    it already happened. now what     | firewallBuilder  | speed
 *     5 FREEZE   say it before the thumb lands     | speakUp          | finish
 *   review (accountRescue) -> boss -> video -> debrief -> stickers -> done
 *
 * WHAT THE REBUILD FIXED. 31 screens and it OPENED ON A GAME, and its reactions
 * map carried 29 keys for those 31 screens, so from index 2 onward every
 * reaction landed on the wrong screen. Now 30 and 30, counted.
 *
 * THE THREE DESIGN PROBLEMS THIS WEEK CARRIED, and what was done about them:
 *
 * 1. `hearthLoom` dragged a thread from a defence charm to the family member it
 *    fitted. A drag on SVG lines, and a match-the-charm verb that Sign Bingo
 *    (W1/W6/W14) and the Memory Match (W1/W7/W13) already spend their whole
 *    three-use caps on. CONVERTED to tap-only and RE-VERBED: it now judges each
 *    proposed house rule for FAIRNESS, which nothing else in the library does.
 *
 * 2. Concept 3 collided with Week 13's "Set It Before You Start". SPLIT: Week 13
 *    is MY plan for MY screen time, decided by me. This is a rule the whole
 *    house lives under, which has to pass a test a personal plan never faces.
 *    Every rule on the loom is SAFE. The question is only whether it is fair.
 *
 * 3. Concept 4 was "The Evening Rounds", a night-time device audit that is
 *    TRIPLE booked: Week 13 shipped it and Week 14 owns the device switches. It
 *    is replaced outright by AFTER IT HAPPENS, which is new ground for the whole
 *    course: nineteen weeks of prevention, and not one minute on what a child
 *    does when it has already gone wrong. That gap was worth more than a fourth
 *    pass at the same audit.
 *
 * ENGINES. Two new, one converted, three re-themes (the option B budget exactly):
 *   explainIt        NEW. Choose HOW to say it. Every answer is true; one is too
 *                    technical, one lands like a telling-off, one actually helps.
 *   clueStamper      RE-THEMED (3rd and final use). W4's scam anatomy, applied
 *                    outward BY the child to a text on Gran's phone.
 *   hearthLoom       CONVERTED + RE-VERBED, as above.
 *   firewallBuilder  RE-THEMED (3rd and final use) on its "wall" skin. The wall
 *                    is not borrowed here: this week is NAMED after it, and the
 *                    bricks, the copy and the lesson are all new.
 *   speakUp          NEW. Two seconds before the thumb lands, what do you say?
 *   accountRescue    RE-THEMED for the review (3rd and final use) on its "moves"
 *                    skin: three people, one problem each, the right power to
 *                    hand them.
 *
 * TONE, and it matters more here than in any week except 11. The child is not
 * the family's police officer. Every beat is help offered to people they love,
 * never a child catching grown-ups out, and the unkind answer in beat 1 is
 * always factually CORRECT so that being right is never the thing being
 * rewarded. A child who wins these games by making their grandmother feel
 * stupid has not protected her: she will stop asking, and the next fake text
 * arrives with nobody left to ask.
 *
 * WARMTH NOTE. Beat 5 asks a child to interrupt an adult, which is genuinely
 * hard and not always safe to get wrong. Saying nothing is offered every single
 * round, it is never punished, and picking it gets "that is what most people
 * do" followed by the sentence to use instead. The villain stays off that beat.
 */
export const WEEK_19: WeekContent = {
  weekNumber: 19,
  title: "Protecting Family: Family Firewall",
  topic: "protecting-family",
  badgeName: "Family Firewall",
  badgeIcon: "🏠",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 19: THE FAMILY FIREWALL", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the expert in the house
    { type: "video", videoPlaceholder: "Week 19: The Expert in the House", videoSrc: "/videos/module-19-intro.mp4" },

    // 1 - ALERT: incident report
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-19.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon has given up on YOU. Eighteen weeks of walls, locks and popped balloons taught him that lesson. So he has turned his tricks on your FAMILY: a prize text for Gran, an urgent parcel message for Dad, a free-coins machine for your little brother. Same tricks, bigger letters. But he has forgotten the most important thing in the whole house. It has an EXPERT in it now. This week the roles flip: you explain, you spot, you speak up, and together you raise the Family Firewall.",
      photoCaption: "Wk 19 - The Expert in the House",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Cyber Hero, this incident report is not about you. Read it with me.",
          "The Raccoon has given up on YOU. Eighteen weeks of walls, locks and popped balloons taught him that lesson. So he has turned his tricks on your FAMILY: a prize text for Gran, an urgent parcel message for Dad, a free-coins machine for your little brother.",
          "But he has forgotten the most important thing in that house. It has an EXPERT in it now.",
          "[whispers] Same tricks. He has only changed who he points them at.",
          "[warmly] By the end of today, your whole family will be as hard to trick as you are.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing
    { type: "weekIntro", ...WEEK_INTROS[19] },

    // 3 - Mission brief
    {
      type: "mission",
      objectives: [
        "Explain it so they can actually use it",
        "Agree house rules that are fair on everybody",
        "Have a sentence ready before the thumb lands",
      ],
    },

    /* ─────────── BEAT 1 · YOU'RE THE EXPERT NOW ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "You're the Expert Now",
      content:
        "Nineteen weeks in, you know more about this than most of the grown-ups in your house. That is simply true. But knowing a thing and being able to hand it to somebody else are two different skills, and the second one is harder. When Gran asks you why a text looks wrong, being RIGHT is the easy half. The hard half is saying it so she can use it tomorrow without you standing there. Short words, about the thing rather than about her, and no showing off.",
      bullets: [
        "You genuinely know more than they do",
        "Knowing and explaining are different skills",
        "Short words beat clever words",
        "Talk about the thing, not the person",
        "They should be able to do it without you",
      ],
      bulletIcons: ["🎓", "🧠", "💬", "👪", "💪"],
      emblem: "🎓",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Something has happened over these nineteen weeks, Cyber Hero, and I want to name it.",
          "You know more about this than most of the grown-ups in your house. That is just true now.",
          "[thinking] But here is the tricky bit. Knowing a thing and handing it to somebody else are two different skills.",
          "When Gran asks you why a text looks wrong, being right is the easy half.",
          "The hard half is saying it so she can do it herself tomorrow, without you standing there.",
          "[excited] Come and answer some questions with me. Every answer is true, so that is not the test!",
        ],
      },
    },
    // 5 - Game: EXPERT (ExplainIt, NEW). Every answer is TRUE. Sarah speaks the
    // good answer's why and the clumsy ones' explanation, never both.
    {
      type: "explainIt",
      introTitle: "You're the Expert Now",
      introSubtitle: "They asked YOU. Every answer here is true, so pick the one that actually helps.",
      introIcon: "🎓",
      askerLabel: "SOMEBODY IS ASKING YOU",
      askPrompt: "What do you say?",
      answersLabel: "ALL THREE ARE TRUE",
      counterLabel: "Question",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here we go. Somebody in the house asks you a question, and you get three answers.",
          "Every single one of them is TRUE. That is the whole point, so do not go hunting for the right one.",
          "Pick the one that would actually help THEM. Short, kind, and about the thing.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Ask yourself one thing about each answer. Could they do it on their own tomorrow?",
        ],
      },
      threat: {
        raccoonLine: "Go on, use the big words! Baffle them! A confused grown-up is my favourite kind.",
      },
      questions: [
        {
          id: "q-gran-text",
          who: "GRAN",
          icon: "👪",
          asks: "This text says I've won a prize draw I don't remember entering. Is that bad?",
          readAloud: "Gran has a text about a prize draw she does not remember entering, and she is asking you if it is bad.",
          answers: [
            {
              id: "a-gran-kind",
              text: "You can't win something you never entered. That one's a trick.",
              good: true,
              why: "Short, and it is a test Gran can run herself on the next one without you in the room.",
            },
            {
              id: "a-gran-tech",
              text: "It's a phishing campaign using a spoofed sender header and a shortened redirect URL.",
              explanation: "Every word of that is right, and Gran cannot use one of them. She will nod, delete it, and be stuck again next week.",
            },
            {
              id: "a-gran-rude",
              text: "Gran, honestly, everyone knows those are fake. Don't you know anything?",
              explanation: "True, and it costs you the thing you actually want. She will not ask you next time, and next time might matter more.",
            },
          ],
        },
        {
          id: "q-dad-password",
          who: "DAD",
          icon: "👤",
          asks: "Why can't I just use the same password for everything? It's easier.",
          readAloud: "Dad wants to know why he cannot just use the same password everywhere, because it is easier.",
          answers: [
            {
              id: "a-dad-kind",
              text: "If one place leaks it, they can open all the others with it.",
              good: true,
              why: "One sentence, and it gives Dad the reason rather than the rule, so he can work out the next one himself.",
            },
            {
              id: "a-dad-tech",
              text: "Credential stuffing means a breach at one service gets replayed against every other service.",
              explanation: "Completely correct, and completely unusable. Dad now knows a phrase instead of a reason.",
            },
            {
              id: "a-dad-rude",
              text: "Because it's lazy, Dad. I learned this in week one.",
              explanation: "Also true, and now this is about who knows more instead of about his passwords. He will stop listening at the word lazy.",
            },
          ],
        },
        {
          id: "q-brother-coins",
          who: "YOUR LITTLE BROTHER",
          icon: "🦸",
          asks: "This website says I can get free coins for my game. Can I?",
          readAloud: "Your little brother has found a website promising free coins for his game, and he wants to know if he can have them.",
          answers: [
            {
              id: "a-bro-kind",
              text: "Free coins aren't free. They want your password for them.",
              good: true,
              why: "He is six and he understood every word, and now he knows what they are actually after.",
            },
            {
              id: "a-bro-tech",
              text: "That's a credential harvesting page monetised through account resale.",
              explanation: "True, and he is six. He heard nothing, and he will click it the moment you leave the room.",
            },
            {
              id: "a-bro-rude",
              text: "Obviously not. That's so obviously fake, how did you not see that?",
              explanation: "True, and he did not see it, which is why he came to you. Say that twice and he stops coming.",
            },
          ],
        },
        {
          id: "q-mum-public",
          who: "MUM",
          icon: "👪",
          asks: "Should I really bother making my account private? I've got nothing to hide.",
          readAloud: "Mum is asking whether making her account private is worth bothering with, since she has nothing to hide.",
          answers: [
            {
              id: "a-mum-kind",
              text: "It's not about hiding. It's about choosing who gets to look.",
              good: true,
              why: "It answers the thing she actually said, and it leaves her feeling sensible rather than told off.",
            },
            {
              id: "a-mum-tech",
              text: "Public profiles get scraped and aggregated into data broker records.",
              explanation: "Right on the facts, and it answers a question she did not ask. She said nothing to hide, and that is the bit to answer.",
            },
            {
              id: "a-mum-rude",
              text: "Everyone says that until something happens to them.",
              explanation: "Fair enough, and it is a warning rather than an answer. She asked why, and this tells her she will be sorry.",
            },
          ],
        },
      ],
      hints: {
        tier1: "Do not look for the true one. They are all true. Look for the one THEY could use.",
        tier2: "Rule out the one with the long words, then rule out the one that makes them feel small. What is left is the answer.",
      },
      completeTitle: "Explained it!",
      completeLine: "Being right was the easy bit, Cyber Hero. You made it land.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Four questions, and every answer you gave was one they could actually use tomorrow.",
          "You never used a long word and you never made anybody feel small.",
          "[warmly] That is why they will come and ask you again. And they are going to need to.",
        ],
      },
    },
    // 6 - Prove
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Gran asks why a text looks wrong. What makes a GOOD answer?",
      choices: [
        { text: "She could use it herself next time", isCorrect: true },
        { text: "It uses the proper technical words", isCorrect: false, why: "The proper words are correct and useless. She cannot do anything with a word she has never heard." },
        { text: "It shows how much you know", isCorrect: false, why: "She did not ask how much you know. She asked about her text." },
        { text: "It is as long as possible", isCorrect: false, why: "Long answers get lost. The ones that stick are short." },
      ],
      praise: "She could use it herself next time. ✓",
      nudge: "Think about tomorrow, when you are at school and another text arrives.",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That's it!",
          "A good explanation leaves something behind.",
          "She should be able to do it on her own tomorrow.",
          "[warmly] That is the whole test.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "You know more than they do now, and the skill is handing it over in words they can use without you standing there.",
      next: "how to help a grown-up see a trick for themselves",
      emblem: "🎓",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] One power down, Cyber Hero. You explain like somebody who wants to be understood.",
          "Short words, about the thing, and nobody feeling small.",
          "[whispers] Now. That text on Gran's phone is still sitting there...",
          "Next, we'll learn how to help a grown-up see a trick for themselves. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · SHOW THEM THE TELLS ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "Show Them the Tells",
      content:
        "Back in Week 4 you learned the tells: a stranger's address, a rush, a prize nobody entered, a link that does not match. Grown-ups mostly never learned them, because nobody taught them. So when a trick lands on Gran's phone you do not say it is fake. You point at the tells, one at a time, and let her see it herself. A person who has been shown four tells can find the fifth one on their own. A person who has been told it is fake can only wait for you.",
      bullets: [
        "Grown-ups were never taught the tells",
        "Point at them, do not announce the answer",
        "A stranger's address",
        "A rush, and a prize nobody entered",
        "Shown four, they find the fifth alone",
      ],
      bulletIcons: ["🔍", "👆", "✉️", "⏱️", "💡"],
      emblem: "🔍",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] Cast your mind right back to Week 4, Cyber Hero. The tells.",
          "A stranger's address. A rush. A prize nobody entered. A link that does not match.",
          "[warmly] Here is the thing about grown-ups. Most of them never learned those, because nobody ever taught them.",
          "So when a trick lands on Gran's phone, we do not say it is fake.",
          "We point at the tells, one at a time, and let her spot it herself. Then she can do the next one alone.",
          "[excited] Come and stamp some evidence with me!",
        ],
      },
    },
    // 9 - Game: TELLS (ClueStamper, 3rd and final use, re-themed to the
    // kitchen table). LANE: W4 taught the child to spot these FOR THEMSELVES;
    // here the child is walking somebody else through them.
    {
      type: "clueStamper",
      introTitle: "The Kitchen Table",
      introSubtitle: "A message on somebody else's phone. Stamp every tell, then call it.",
      introIcon: "🔍",
      stampLabel: "STAMP THE TELL",
      closeLabel: "THAT'S ALL OF THEM",
      boardPrompt: "Which bits would you point at?",
      realSeal: "NOTHING WRONG",
      fakeSeal: "IT'S A TRICK",
      realToast: "ALL CLEAR!",
      fakeToast: "SPOTTED!",
      wrongTitle: "Have another look at that one",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Right. Somebody hands you their phone across the kitchen table and asks what you think.",
          "Read the whole message first, then stamp every bit you would point at.",
          "When you have stamped them all, say what it is.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Stamp the evidence, not the feeling. You want bits she can SEE.",
        ],
      },
      threat: {
        raccoonLine: "Bigger letters, friendlier words, and a nice old phone to land on. Grown-ups never check ANYTHING.",
      },
      cases: [
        {
          id: "case-gran-prize",
          handle: "Gran's phone",
          avatar: "👪",
          pitch: "CONGRATULATIONS! You have won our monthly prize draw. Claim within 2 hours or it goes to someone else. Tap here: prize-claim-uk-winners.net",
          readAloud: "First one. Gran's phone, and a text saying she has won a monthly prize draw.",
          clues: [
            { id: "what", evidence: "You have won our monthly prize draw", isRedFlag: true, teach: "Ask her one question first. Did she enter any prize draw at all? She did not, and you cannot win one you never went into." },
            { id: "when", evidence: "Claim within 2 hours", isRedFlag: true, teach: "Two hours is not a deadline, it is a way of stopping her thinking. Real prizes wait." },
            { id: "how", evidence: "prize-claim-uk-winners.net", isRedFlag: true, teach: "That address belongs to nobody she has ever dealt with. It just has hopeful words in it." },
            { id: "who", evidence: "No company name anywhere in it", isRedFlag: true, teach: "A real prize company puts its name on things. This one never says who it is." },
          ],
          rightWhy: "Four tells on one text, and Gran spotted every one of them once you pointed. She can run that check herself now.",
        },
        {
          id: "case-dad-parcel",
          handle: "Dad's phone",
          avatar: "👤",
          pitch: "Royal Post: your parcel is held pending a 1.99 fee. Pay now to release: royalpost-redelivery-fee.co",
          readAloud: "Next one. Dad's phone, and a message about a parcel being held for a small fee.",
          clues: [
            { id: "how", evidence: "royalpost-redelivery-fee.co", isRedFlag: true, teach: "Look at the end of that parcel address with him. It is not the real post office, it just starts like it." },
            { id: "what", evidence: "a 1.99 fee", isRedFlag: true, teach: "The tiny amount is the trick. It feels too small to bother checking, and it is not really about the two pounds." },
            { id: "when", evidence: "Pay now to release", isRedFlag: true, teach: "Now again. Every one of these wants the thinking skipped." },
            { id: "who", evidence: "Dad is not expecting a parcel", isRedFlag: true, teach: "Ask him first. If no parcel is coming, there is nothing to release and the whole thing falls over." },
          ],
          rightWhy: "A wrong address, a tiny fee, a rush, and no parcel. Dad would have paid it in about four seconds.",
        },
        {
          id: "case-mum-real",
          handle: "Mum's phone",
          avatar: "👪",
          pitch: "Hi love, running 10 mins late for pickup, stuck behind the bin lorry on Chapel Street. See you outside the usual gate. Aunty Jo",
          readAloud: "And this one. Mum's phone, a message from Aunty Jo about running late for pickup.",
          clues: [
            { id: "who", evidence: "Aunty Jo", isRedFlag: false, teach: "That is a real person Mum knows, saved in her phone under her own name." },
            { id: "what", evidence: "running 10 mins late for pickup", isRedFlag: false, teach: "Nothing is being asked for. It is somebody telling her a thing, which is what messages are mostly for." },
            { id: "how", evidence: "No link anywhere in it", isRedFlag: false, teach: "There is nothing to tap. A message with no door in it cannot take her anywhere." },
            { id: "when", evidence: "stuck behind the bin lorry on Chapel Street", isRedFlag: false, teach: "A detail nobody would invent, about a street they both know. That is what a real message sounds like." },
          ],
          rightWhy: "A real person, nothing asked for, no link and a detail only Aunty Jo would say. Not everything is a trick, and saying so matters just as much.",
        },
      ],
      hints: {
        tier1: "Read the whole message first, then go back and stamp the bits you would actually point at.",
        tier2: "Look for four things: who it is really from, what it wants, how fast it wants it, and where the link goes.",
      },
      completeTitle: "Tells stamped!",
      completeLine: "You did not tell them it was fake, Cyber Hero. You showed them, and now they can look for themselves.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Three phones, and you pointed at every tell on all of them.",
          "And that last one was real, and you said so. That matters as much as catching the other two.",
          "[warmly] A house where everything is a scare is just as stuck as a house where nothing is.",
        ],
      },
    },
    // 10 - Prove
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "The Raccoon says: 'Just tell them it's fake and delete it. They don't need to know why!' Is he right?",
      choices: [
        { text: "No. Showing them why means they can spot the next one", isCorrect: true },
        { text: "Yes, it saves everyone time", isCorrect: false, why: "It saves time once, and costs it every time after, because they will need you again for every single message." },
        { text: "Yes, they would not understand anyway", isCorrect: false, why: "They understood perfectly when you pointed at the tells. Nobody had ever pointed before." },
        { text: "Yes, as long as you delete it fast", isCorrect: false, why: "Deleting this one changes nothing about the next one, and there is always a next one." },
      ],
      praise: "No. Showing them why means they can spot the next one. ✓",
      nudge: "Think about what happens the day you are at school and another text arrives.",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] You saw straight through that!",
          "He would love you to be the only one in the house who can check.",
          "Then he only has to wait until you are out.",
          "[warmly] Show them the tells, and there is nobody left to wait for.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Grown-ups were never taught the tells, so you point at them one at a time instead of announcing the answer.",
      next: "how a whole house agrees on rules everybody can live with",
      emblem: "🔍",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Two powers down, Cyber Hero. Three phones checked and nobody made to feel silly.",
          "Point at the evidence. Let them spot it. That is how it sticks.",
          "[thinking] Now, the house wants to write some rules about all this...",
          "Next, we'll learn how a whole house agrees on rules everybody can live with. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · THE FAMILY QUILT ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Rules the Whole House Can Live With",
      content:
        "Back in Week 13 you made a plan for your own screen time. A house rule is a different animal, because other people have to live under it too. Every rule you are about to see is perfectly SAFE, so that is not the question. The question is whether it is FAIR: does it cover everybody, grown-ups included, and would the person it lands hardest on still agree to it? A rule that singles one person out is not a rule, it is a punishment wearing a rule's coat, and nobody keeps one of those for long.",
      bullets: [
        "A house rule binds everybody in the house",
        "Safe is not the same as fair",
        "Does it cover the grown-ups too?",
        "Would the person it lands on agree?",
        "A rule naming one person is a punishment",
      ],
      bulletIcons: ["🏠", "📏", "👪", "🤝", "🚫"],
      emblem: "🧩",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Remember Week 13, when you made a plan for your own screen time? This is different.",
          "A house rule has other people living under it, so it has to pass a harder test.",
          "[thinking] Every rule you are about to see is perfectly safe. So safe is not the question tonight.",
          "The question is whether it is FAIR. Does it cover everybody, grown-ups as well?",
          "Because a rule that names one person is not a rule at all. It is a punishment in a rule's coat.",
          "[excited] Come and help the house sew its quilt!",
        ],
      },
    },
    // 13 - Game: QUILT (HearthLoom, converted signature, TAP-ONLY, RE-VERBED).
    // EVERY rule here is SAFE. Judged on fairness only.
    {
      type: "hearthLoom",
      introTitle: "The Family Quilt",
      introSubtitle: "The house is writing its rules. Every one is safe. Only some of them are fair.",
      introIcon: "👪",
      quiltLabel: "THE QUILT SO FAR",
      weaveLabel: "WEAVE IT IN",
      unpickLabel: "UNPICK IT",
      askPrompt: "Is that one fair on everybody?",
      counterLabel: "Square",
      proposedLabel: "SUGGESTED BY",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Here is the loom, and here comes the first square.",
          "Somebody in the house suggests a rule. Read it, then decide.",
          "Weave it into the quilt if it is fair on everybody. Unpick it if it lands on one person.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Every rule here is safe. So ask the other question: who does it actually land on?",
        ],
      },
      threat: {
        raccoonLine: "Ooh, make LOADS of rules! Great big unfair ones! Nothing falls apart faster than a house arguing about rules.",
      },
      rules: [
        {
          id: "r-table",
          text: "No screens at the dinner table",
          proposedBy: "Mum",
          icon: "🏠",
          readAloud: "First square, from Mum. No screens at the dinner table.",
          fair: true,
          why: "That lands on everybody at that table, Mum included, which is exactly what makes it a rule.",
          explanation: "Count who it covers. Every single person sitting down, grown-ups as well. That is a fair rule.",
        },
        {
          id: "r-sam-only",
          text: "Only Sam has to ask before going online",
          proposedBy: "Sam's big sister",
          icon: "👤",
          readAloud: "Next square, from Sam's big sister. Only Sam has to ask before going online.",
          fair: false,
          why: "Perfectly safe, and it names one person, so it is a punishment with a rule's coat on. Sam will not keep it.",
          explanation: "Read the first word again. Only Sam. Nothing unsafe about it, and nothing fair about it either.",
        },
        {
          id: "r-ask-first",
          text: "Anybody buying anything online checks with somebody else first",
          proposedBy: "Dad",
          icon: "💎",
          readAloud: "This one is from Dad. Anybody buying anything online checks with somebody else first.",
          fair: true,
          why: "Anybody means Dad too, and he suggested it knowing that. A rule the grown-ups sign up to is one that lasts.",
          explanation: "Look at the word anybody. It does not leave a gap for the person who wrote it.",
        },
        {
          id: "r-kids-bedtime",
          text: "Children put devices away at eight. Grown-ups keep theirs",
          proposedBy: "Nobody will admit to it",
          icon: "⏱️",
          readAloud: "Here is one nobody will admit to suggesting. Children put devices away at eight, and grown-ups keep theirs.",
          fair: false,
          why: "Sensible and safe, and it splits the house in two, so the children will spend all their time arguing about it instead of keeping it.",
          explanation: "Read the second half. The grown-ups kept theirs. That is the bit that will sink it.",
        },
        {
          id: "r-tell-anyone",
          text: "Anybody can say they got tricked and nobody laughs",
          proposedBy: "Gran",
          icon: "🤝",
          readAloud: "Gran suggested this one. Anybody can say they got tricked, and nobody laughs.",
          fair: true,
          why: "Gran wrote the rule that protects Gran, and it protects everybody else too. That is the best square on the whole quilt.",
          explanation: "Think about who needs that rule most. Everybody, eventually, which is what makes it fair.",
        },
        {
          id: "r-read-messages",
          text: "Mum can read everybody's messages whenever she likes",
          proposedBy: "Mum, hopefully joking",
          icon: "👀",
          readAloud: "And the last square, from Mum, who is hopefully joking. She can read everybody's messages whenever she likes.",
          fair: false,
          why: "Safe as houses, and only one person in the house is exempt from it, which is the thing that makes it unfair.",
          explanation: "Ask who does NOT have to follow that one. Only the person who wrote it, and that is the test it fails.",
        },
      ],
      hints: {
        tier1: "Do not ask if it is safe. They all are. Ask who it lands on.",
        tier2: "If it names one person, or leaves the grown-ups out, unpick it. If it covers everybody, weave it in.",
      },
      completeTitle: "Quilt finished!",
      completeLine: "Safe was never the hard part, Cyber Hero. Fair is what makes a rule stick.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at that quilt. Every square in it covers the whole house, grown-ups and all.",
          "And the ones that singled somebody out never went in, which is why this quilt will still be here at Christmas.",
          "[warmly] Gran's square is my favourite. Anybody can say they got tricked, and nobody laughs.",
        ],
      },
    },
    // 14 - Prove
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "What makes a house rule FAIR?",
      choices: [
        { text: "It covers everybody, grown-ups included", isCorrect: true },
        { text: "It keeps everybody safe", isCorrect: false, why: "Every rule on that loom was safe. Safe was never the question tonight." },
        { text: "A grown-up thought of it", isCorrect: false, why: "Two of the unfair ones came from grown-ups. Who suggested it changes nothing." },
        { text: "Nobody complains about it", isCorrect: false, why: "People complain about fair rules all the time. That is not how you tell." },
      ],
      praise: "It covers everybody, grown-ups included. ✓",
      nudge: "Think about the rule that said only Sam. What was wrong with it?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Exactly!",
          "Safe and fair are two different tests.",
          "A rule that leaves the grown-ups out never lasts a fortnight.",
          "[warmly] The ones that cover everybody are still up at Christmas.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "House rules are judged on fairness rather than safety, and a rule that names one person is a punishment in a rule's coat.",
      next: "what to do when something has already gone wrong",
      emblem: "🧩",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers down, Cyber Hero. That quilt covers the whole house.",
          "Gran's square especially. Anybody can say they got tricked, and nobody laughs.",
          "[thinking] Which is handy. Because sometimes somebody has already been tricked...",
          "Next, we'll learn what to do when something has already gone wrong. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · IT ALREADY HAPPENED ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "When It Already Happened",
      content:
        "Nineteen weeks of stopping things before they start, and here is the week we finally say the other thing out loud: sometimes it happens anyway. Somebody taps the link, types the password, sends the money. That is not the end of anything, and it is absolutely not the moment for I told you so. It is the moment for three fast moves: tell somebody who can actually help, change the password on that account, and tell the bank if money is involved. Fast beats clever here. The first hour matters more than anything you say afterwards.",
      bullets: [
        "Sometimes it happens anyway",
        "It is never the end of anything",
        "Never I told you so, ever",
        "Tell a grown-up who can help, right away",
        "Fast matters more than clever",
      ],
      bulletIcons: ["⚠️", "💪", "🤝", "📣", "⏱️"],
      emblem: "🧱",
      narration: {
        speaker: "adam",
        lines: [
          "[thinking] Nineteen weeks of stopping things before they start. Now let's say the other bit out loud.",
          "Sometimes it happens anyway. Somebody taps the link. Types the password. Sends the money.",
          "[warmly] And that is not the end of anything, Cyber Hero. It really is not.",
          "But it is absolutely not the moment for I told you so. Nobody has ever been helped by that.",
          "It is the moment to move fast. Tell somebody who can help, change the password, ring the bank.",
          "[excited] Come and build the wall of what we actually do!",
        ],
      },
    },
    // 17 - Game: AFTER (FirewallBuilder, 3rd and final use, "wall" skin). The
    // wall is this week's own metaphor, not a borrowed one: the week is named
    // after it. Good bricks are the fast moves; bad ones are the tempting ones.
    {
      type: "firewallBuilder",
      skin: "wall",
      introTitle: "The Morning After Wall",
      introSubtitle: "Dad clicked the parcel link and typed his password. Build the wall of what happens now.",
      introIcon: "🧱",
      wallLabel: "THE WALL",
      binLabel: "NOT THAT ONE",
      layToast: "GOOD BRICK!",
      binToast: "BINNED!",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] Here is the situation. Dad clicked the parcel link and typed his password in.",
          "It has happened. Now we build the wall of what we do about it, one brick at a time.",
          "Read each brick. Lay it if it helps right now. Bin it if it does not.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Ask one thing about every brick. Does that make the next hour better for Dad?",
        ],
      },
      threat: {
        raccoonLine: "He's mortified! Now tell him how silly he was, go on. An embarrassed grown-up never tells ANYBODY.",
      },
      bricks: [
        {
          id: "b-tell",
          text: "Tell Mum straight away, tonight",
          good: true,
          readAloud: "First brick. Tell Mum straight away, tonight.",
          why: "The first hour is worth more than everything else put together, and Dad should not be carrying this on his own.",
          whyWrong: "Have another think about telling somebody tonight. Who else in the house could actually do something about it?",
        },
        {
          id: "b-password",
          text: "Change that password now, and anywhere else he used it",
          good: true,
          readAloud: "Next brick. Change that password now, and anywhere else he used it.",
          why: "They have the old one, so the old one has to stop working. Anywhere else is the bit people forget.",
          whyWrong: "Look at it again. They have his password right now. What is the one thing that makes it useless?",
        },
        {
          id: "b-told-you-so",
          text: "Remind him you said that link looked wrong",
          good: false,
          readAloud: "Here is a brick. Remind him you said that link looked wrong.",
          why: "You did say the link looked wrong, and saying so now helps nobody. It makes him wish he had not told you, and next time he will not.",
          whyWrong: "It is true that you said it. Ask yourself what saying it NOW actually does for the next hour.",
        },
        {
          id: "b-bank",
          text: "Ring the bank if any money went anywhere",
          good: true,
          readAloud: "This brick says: ring the bank if any money went anywhere.",
          why: "Banks can stop and reverse money, and they are far better at it in the first hour than the next day.",
          whyWrong: "Think about who has the power to actually undo a payment. It is not anybody in your house.",
        },
        {
          id: "b-say-nothing",
          text: "Say nothing and hope it was fine",
          good: false,
          readAloud: "And this brick says: say nothing, and hope it was fine.",
          why: "Hoping it was fine is the one move that uses up the hour that mattered. It is also exactly what he is counting on.",
          whyWrong: "Have another look at hoping it was fine. What is actually happening to Dad's account while everybody waits?",
        },
        {
          id: "b-check-together",
          text: "Sit with him and check the account together",
          good: true,
          readAloud: "Next brick. Sit with him and check the account together.",
          why: "Together is the word doing the work there. He is embarrassed, and nobody checks anything properly on their own while embarrassed.",
          whyWrong: "Read it once more. The useful bit is not the checking, it is that he is not doing it alone.",
        },
        {
          id: "b-pay-them",
          text: "Pay the small fee so they go away",
          good: false,
          readAloud: "Careful with this brick. Pay the small fee so they go away.",
          why: "They never go away. Paying only tells them somebody at this address pays, and the next message will be bigger.",
          whyWrong: "Think about what paying actually proves to them. It proves the address works.",
        },
      ],
      hints: {
        tier1: "One question per brick. Does that make the next hour better for Dad?",
        tier2: "Telling somebody, changing the password and ringing the bank are all bricks. Anything about how he feels is not.",
      },
      completeTitle: "Wall built!",
      completeLine: "Fast, kind, and not one I told you so in it. That is what a Family Firewall is actually made of.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Look at that wall. Tell somebody, change it, ring the bank, sit with him.",
          "And the bricks you binned were the tempting ones. Especially that first one.",
          "[warmly] Because the whole thing only works if people tell you when it goes wrong. Make that easy and you have already won.",
        ],
      },
    },
    // 18 - Prove
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Dad just typed his password into a fake page. What is the FIRST thing?",
      choices: [
        { text: "Tell somebody who can help, right now", isCorrect: true },
        { text: "Work out exactly how it happened", isCorrect: false, why: "That can wait until tomorrow. The account cannot." },
        { text: "Tell him he should have checked", isCorrect: false, why: "He knows. It costs the one thing you need, which is him telling you next time." },
        { text: "Delete the message so nobody sees", isCorrect: false, why: "Deleting the message changes nothing. They already have the password." },
      ],
      praise: "Tell somebody who can help, right now. ✓",
      nudge: "Which move makes the next hour better?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Straight in!",
          "The first hour is worth more than the whole rest of the week.",
          "Tell somebody, change it, ring the bank.",
          "[warmly] And never, ever, I told you so.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "When it has already happened the moves are fast and kind: tell somebody who can help, change the password, ring the bank, and never say I told you so.",
      next: "how to stop it in the two seconds before it happens at all",
      emblem: "🧱",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Four powers down, Cyber Hero. That wall goes up fast and it goes up kindly.",
          "Tell somebody, change it, ring the bank, and sit with them while they check.",
          "[thinking] Although... it would be even better to catch it two seconds earlier...",
          "Next, we'll learn how to stop it in the two seconds before it happens at all. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · FREEZE THE MOMENT ─────────── */
    // WARMTH NOTE: this beat asks a child to interrupt an adult, which is hard
    // and sometimes not safe to get wrong. Saying nothing is offered every
    // round and is NEVER punished. The villain stays OFF this beat.
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "Say It Before the Thumb Lands",
      content:
        "Here is the hardest thing this whole course asks of you. Somebody you love is about to tap the thing, and you have about two seconds. Knowing it is a trick is not the skill any more. Saying so, out loud, to a busy grown-up, is. And it works best when the sentence is short, about the THING rather than about them, and asks instead of tells: Wait, can I look at that with you first? Have that sentence ready and you will use it. Have only a worried feeling and you will stand there saying nothing, which is what almost everybody does.",
      bullets: [
        "You get about two seconds",
        "Keep it short, six or seven words",
        "About the thing, never about them",
        "Ask, do not tell: can I look with you?",
        "Having the sentence ready is the trick",
      ],
      bulletIcons: ["⏸️", "💬", "🔍", "🤝", "🧠"],
      emblem: "✋",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] This is the hardest thing the whole course asks of you, Cyber Hero. I want to say that first.",
          "Somebody you love is about to tap the thing, and you have about two seconds.",
          "[thinking] Knowing it is a trick is not the skill any more. You have known that for weeks.",
          "Saying it out loud, to a grown-up in a hurry, is the skill. And it needs to be short.",
          "About the thing, never about them, and asking rather than telling. Wait, can I look at that with you first?",
          "[excited] Come and practise the words with me. Just the words.",
        ],
      },
    },
    // 21 - Game: FREEZE (SpeakUp, NEW). NO `threat`: the villain is off this
    // beat. Saying nothing is offered every round and never punished.
    {
      type: "speakUp",
      introTitle: "Freeze the Moment",
      introSubtitle: "Their thumb is already moving. You have two seconds. What do you say?",
      introIcon: "✋",
      frozenLabel: "FROZEN, RIGHT NOW",
      askPrompt: "What do you say?",
      linesLabel: "PICK YOUR WORDS",
      counterLabel: "Moment",
      narration: {
        speaker: "adam",
        lines: [
          "[warmly] I am going to freeze each one right at the moment it matters.",
          "Their thumb is already moving. Have a look at what is happening, then pick what you say.",
          "And listen. Saying nothing is on there every time, because that is what most people really do.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Short, about the thing, and asking rather than telling. That is the whole recipe.",
        ],
      },
      scenes: [
        {
          id: "s-gran-prize",
          scene: "THE KITCHEN, SATURDAY MORNING",
          icon: "👪",
          doing: "Gran has the prize text open and her finger is over the link.",
          readAloud: "The kitchen, Saturday morning. Gran has the prize text open, and her finger is hovering over the link.",
          lines: [
            {
              id: "s1-works",
              says: "Gran, wait. Can I look at that with you?",
              works: true,
              why: "Six words, about the text, and it asks. Gran stopped because you gave her a reason to, not a telling-off.",
            },
            {
              id: "s1-quiet",
              says: "Say nothing. She is busy and it feels rude to butt in.",
              explanation: "That is honestly what most people do, and it is not a failing. Next time try six words: Gran, wait, can I look at that with you?",
            },
            {
              id: "s1-accuse",
              says: "Gran, don't! You always fall for these!",
              explanation: "It would stop her, and it would also make her cross and embarrassed. She will not show you the next one.",
            },
          ],
        },
        {
          id: "s-dad-pay",
          scene: "THE HALLWAY, ON HIS WAY OUT",
          icon: "👤",
          doing: "Dad is typing his card number into the parcel fee page, one-handed, keys in the other.",
          readAloud: "The hallway, and Dad is on his way out. He is typing his card number into the parcel fee page one-handed.",
          lines: [
            {
              id: "s2-works",
              says: "Dad, hang on. Were you expecting a parcel?",
              works: true,
              why: "One short question, about the parcel rather than about him, and it is the exact question that makes the whole thing fall over.",
            },
            {
              id: "s2-quiet",
              says: "Say nothing. He is in a rush and he knows what he is doing.",
              explanation: "Completely understandable, and he was not concentrating, which is exactly when it lands. Seven words would have done it.",
            },
            {
              id: "s2-long",
              says: "Dad, that address doesn't match the real post office, it just starts the same and then it says dot co at the end which is a different...",
              explanation: "Every word true, and he has already typed it by the time you finish. Long is the same as silent when the thumb is moving.",
            },
          ],
        },
        {
          id: "s-brother-coins",
          scene: "THE FRONT ROOM, AFTER SCHOOL",
          icon: "🦸",
          doing: "Your little brother is about to type his game password into the free-coins site.",
          readAloud: "The front room after school. Your little brother is about to type his game password into the free coins site.",
          lines: [
            {
              id: "s3-works",
              says: "Stop! That one wants your password.",
              works: true,
              why: "Five words, and it names the thing it is after. He is six, and he understood it instantly.",
            },
            {
              id: "s3-quiet",
              says: "Say nothing. He never listens to you anyway.",
              explanation: "He does, more than he lets on. And five words would have been enough here: stop, that one wants your password.",
            },
            {
              id: "s3-mock",
              says: "Ha, you're not actually falling for that, are you?",
              explanation: "He was, and now he is embarrassed as well, so he will do it later when you are not in the room.",
            },
          ],
        },
        {
          id: "s-mum-public",
          scene: "THE SOFA, SUNDAY",
          icon: "👪",
          doing: "Mum is about to post the school photo with the class name and the gate in it.",
          readAloud: "The sofa on Sunday. Mum is about to post the school photo, with the class name and the front gate in it.",
          lines: [
            {
              id: "s4-works",
              says: "Mum, can we crop the gate out first?",
              works: true,
              why: "It is a small ask about the photo, so she can say yes without any of it being a big deal. Nobody had to be wrong.",
            },
            {
              id: "s4-quiet",
              says: "Say nothing. It is her photo and her account.",
              explanation: "It is, and you are still allowed to ask. One small question about the photo is not the same as telling her what to do.",
            },
            {
              id: "s4-lecture",
              says: "You shouldn't post that, we did this in week seventeen.",
              explanation: "Right again, and it turns a photo into a lesson she did not ask for. Ask about the gate instead and she will just crop it.",
            },
          ],
        },
      ],
      hints: {
        tier1: "Count the words. The one that works is always the short one.",
        tier2: "It should be about the THING on the screen, and it should ask rather than tell.",
      },
      completeTitle: "You said it!",
      completeLine: "Short, about the thing, and asked rather than told. That sentence is yours now.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Four moments, and you had a sentence ready for every single one.",
          "Not one of them was clever, and not one of them made anybody feel small. They were just short, and in time.",
          "[warmly] And if you ever do freeze and say nothing, that is alright too. You get the next one.",
        ],
      },
    },
    // 22 - Prove
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Somebody is about to tap a bad link. Finish the rule: the sentence that works is...",
      choices: [
        { text: "short, about the thing, and asks rather than tells", isCorrect: true },
        { text: "long, so they understand properly", isCorrect: false, why: "They will have tapped it before you finish. Long is the same as silent when the thumb is moving." },
        { text: "loud, so they definitely stop", isCorrect: false, why: "Loud makes people jump and then defend themselves. Short does the job without any of that." },
        { text: "about how they always do this", isCorrect: false, why: "That is about them rather than the screen, and it is the fastest way to lose the argument you were not having." },
      ],
      praise: "Short, about the thing, and asks rather than tells. ✓",
      nudge: "Think about the six words that stopped Gran.",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] That is it exactly!",
          "Wait, can I look at that with you?",
          "Six words, and nobody had to be wrong about anything.",
          "[warmly] Keep that sentence. It works on absolutely everybody.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5 (promises the REVIEW, not the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "A short sentence about the thing, asked rather than told, stops a thumb in the two seconds you actually get.",
      next: "take the whole house one more time, one person at a time",
      emblem: "✋",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Five powers down, Cyber Hero, and this was the hardest week yet.",
          "Explaining, spotting, agreeing, fixing, and saying the thing out loud.",
          "[warmly] Now let's walk round the house one last time and put them all to work.",
          "Next, we'll take the whole house one more time, one person at a time. Come and see!",
        ],
      },
    },

    // 24 - REVIEW: the whole week, one family member at a time (AccountRescue,
    // "moves" skin, 3rd and final use). Each person has one problem, and the
    // child hands them the right power from the week.
    {
      type: "accountRescue",
      skin: "moves",
      tileLayout: "row",
      countLabel: "SORTED",
      duplicateToast: "Somebody else needs that one",
      introTitle: "The Family Rescue Board",
      introSubtitle: "Three people, one problem each. Hand each of them the right power.",
      introIcon: "🏠",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Last walk of the house, Cyber Hero, and everybody needs something different.",
          "Tap a person to hear what has happened to them.",
          "Then hand them the one power from this week that actually fits.",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: [
          "Each power goes to one person only, so read all three before you start handing them out.",
        ],
      },
      threat: {
        raccoonLine: "Three of them at once! One of you and three of them. Good luck, expert.",
      },
      accounts: [
        {
          id: "gran",
          label: "Gran",
          icon: "👪",
          readAloud: "Gran has a text she is not sure about, and she has not tapped anything yet. She is asking you what you think.",
          correctMoveId: "m-tells",
          why: "Nothing has happened to that text yet, so this is the moment to show her the tells and let her spot it herself.",
          whyWrong: "Look at that text again. She is still deciding whether to tap, so what does she need from you right now?",
        },
        {
          id: "dad",
          label: "Dad",
          icon: "👤",
          readAloud: "Dad already typed his password into the parcel page. It has happened, and he is quite embarrassed about it.",
          correctMoveId: "m-after",
          why: "It has already happened, so it is the fast moves: tell somebody, change it, ring the bank, and not one word of I told you so.",
          whyWrong: "Read what happened to Dad again. He has already typed it in, so showing him the tells is a day too late.",
        },
        {
          id: "brother",
          label: "Your brother",
          icon: "🦸",
          readAloud: "Your little brother is on the sofa right now with his thumb over a free coins button.",
          correctMoveId: "m-freeze",
          why: "His thumb is moving right now, so this is the two second one. Five short words, about the button.",
          whyWrong: "Look at when this is happening. Right now, thumb already moving. Which power works in two seconds?",
        },
      ],
      passwordBank: [
        { id: "m-tells", text: "Show them the tells", icon: "🔍" },
        { id: "m-after", text: "The morning after moves", icon: "🧱" },
        { id: "m-freeze", text: "Say the short sentence NOW", icon: "✋" },
      ],
      hints: {
        tier1: "The question is always WHEN. Has it not happened, is it happening, or has it already happened?",
        tier2: "Not yet means show the tells. Right now means the short sentence. Already done means the morning after moves.",
      },
      completeTitle: "House covered!",
      completeLine: "Three people, three different moments, and the right power for each. That is a Family Firewall.",
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Gran got the tells, your brother got the sentence, and Dad got the morning after.",
          "Same house, same week, three completely different moments, and you read every one of them right.",
          "[excited] Which is just as well, because there is somebody waiting at the end of the hall.",
        ],
      },
    },

    // 25 - Boss
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the whole house covered
    { type: "video", videoPlaceholder: "Week 19: Family Firewall", videoSrc: "/videos/module-19-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "expert", label: "The Explainer", accent: "#7eff97", icon: "🎓", summary: "Short words they can use without you there." },
        { id: "tells", label: "Tell Spotter", accent: "#7df0ff", icon: "🔍", summary: "Point at the evidence, do not announce the answer." },
        { id: "quilt", label: "Quilt Maker", accent: "#ffd158", icon: "🧩", summary: "A fair rule covers everybody, grown-ups included." },
        { id: "after", label: "Wall Builder", accent: "#c084fc", icon: "🧱", summary: "Tell somebody, change it, ring the bank. Never I told you so." },
        { id: "freeze", label: "Moment Freezer", accent: "#ff5fb3", icon: "✋", summary: "Six words, about the thing, asked not told." },
      ],
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "Explaining it kindly, pointing at tells, sewing a fair quilt,",
          "building the morning-after wall... and saying it out loud in time.",
          "[laughs] He went after your family and walked straight into the expert.",
          "[excited] Sticker time, Cyber Hero!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "the-explainer", name: "The Explainer", icon: "🎓", description: "Says it so they can use it tomorrow." },
        { id: "quilt-maker", name: "Quilt Maker", icon: "🧩", description: "Knows fair from merely safe." },
        { id: "moment-freezer", name: "Moment Freezer", icon: "✋", description: "Has the sentence ready before the thumb lands." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#ffb26b",
    theme: {
      topic: "Protecting Family",
      motifs: ["🏠", "👪", "🛡️", "🔒", "🔔", "⚠️", "💬", "🚫"],
    },
    intro: {
      slug: "quiz-w19-intro",
      text: "Pah! I'm done trying to trick YOU, hero. Your grandma, though? Your dad? Your tiny brother? Easy pickings! Unless you really think you can guard the whole family at once!",
    },
    victory: {
      slug: "quiz-w19-victory",
      text: "Outsmarted by the kid, out-ruled by the quilt, and now the GRANDMA spots my tricks before I finish typing them?! This entire family is closed for raccoon business!",
    },
    // 5 questions, one per skill, 4 right to pass (owner decision, UAT batch 2).
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w19-c1",
        key: "quiz-w19-c1-1",
        label: "You're the Expert Now",
        ask: {
          slug: "quiz-w19-ask-c1-1",
          text: "Grandma waves you over: this computer thing is asking me something strange! After all your hero training, who's the right helper for this job?",
        },
        options: [
          { text: "You are, and an expert explains kindly" },
          { text: "Only another grown-up can help a grown-up" },
          { text: "Nobody, computers usually sort themselves out" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "The roles have flipped!",
          explanation: "After all these weeks of training, YOU know the tells better than most grown-ups do. Experts help the moment they're asked, and they explain kindly, never with a tease.",
        },
        villainRight: {
          slug: "quiz-w19-right-c1-1",
          text: "The KID is the expert?! Who flipped the roles?! I demand they flip back!",
        },
        villainWrong: {
          slug: "quiz-w19-wrong-c1-1",
          text: "Wait for another grown-up, sure, take your time! Strange little windows love a nice long wait!",
        },
      },
      {
        phaseId: "phase-w19-c2",
        key: "quiz-w19-c2-1",
        label: "Same Tricks, Bigger Font",
        ask: {
          slug: "quiz-w19-ask-c2-1",
          text: "Grandad's email says he WON a big vacation, he just pays a small fee to release the prize. But he never entered any contest. What do you show him?",
        },
        options: [
          { text: "You can't win a contest you never entered, and real prizes never ask for a fee" },
          { text: "It could be real, small fees are how big prizes usually work" },
          { text: "It's only fake if the spelling has mistakes in it" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Prizes never send a bill!",
          explanation: "Perfect spelling can't make a prize real. A win from a contest he never entered is bait, and pay-a-little-to-get-a-lot is the trap hiding inside it. Two tells in one email.",
        },
        villainRight: {
          slug: "quiz-w19-right-c2-1",
          text: "He never even ENTERED! You showed him the one thing my vacation can't survive!",
        },
        villainWrong: {
          slug: "quiz-w19-wrong-c2-1",
          text: "Pay the little fee, Grandad! Then a littler fee! Then my favorite fee, the BIG one!",
        },
      },
      {
        phaseId: "phase-w19-c3",
        key: "quiz-w19-c3-1",
        label: "Rules You Sew Together",
        ask: {
          slug: "quiz-w19-ask-c3-1",
          text: "A note appears on the fridge: NEW RULE, only the KIDS lock their devices, grown-ups don't have to bother. What's wrong with it?",
        },
        options: [
          { text: "A rule with a grown-up-sized hole in it isn't a firewall, locks are for everyone" },
          { text: "Nothing, grown-ups already know all about locks" },
          { text: "It's backwards, grown-ups should lock up while kids go free" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "No holes in the firewall!",
          explanation: "Dad's unlocked phone is a door into the family, same as anyone's, and flipping who gets left out doesn't fix that. A real family rule covers every single person, grown-ups included.",
        },
        villainRight: {
          slug: "quiz-w19-right-c3-1",
          text: "Who told you about the grown-up-sized hole?! I FIT through the grown-up-sized hole!",
        },
        villainWrong: {
          slug: "quiz-w19-wrong-c3-1",
          text: "Leave the grown-ups unlocked! I only need ONE open phone, and dads leave theirs on the couch!",
        },
      },
      {
        phaseId: "phase-w19-c4",
        key: "quiz-w19-c4-1",
        label: "The Evening Rounds",
        ask: {
          slug: "quiz-w19-ask-c4-1",
          text: "On the evening rounds you find your little brother's game lets ANY player message him. Which setting shuts that window?",
        },
        options: [
          { text: "Friends he knows only, so he keeps playing while strangers stay out" },
          { text: "Messages from everyone, because more chat means more friends" },
          { text: "Deleting the game, since a game he doesn't have can't message him" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Friends-only shuts the window!",
          explanation: "He shouldn't have to lose his favorite game to be safe, and open-to-everyone leaves a window any stranger can climb through. Friends-only keeps the fun and shuts the window. Flip it together!",
        },
        villainRight: {
          slug: "quiz-w19-right-c4-1",
          text: "Friends-only?! But I had SUCH a good opening line ready for that kid!",
        },
        villainWrong: {
          slug: "quiz-w19-wrong-c4-1",
          text: "Messages from EVERYONE! And guess who has a hundred accounts and no bedtime!",
        },
      },
      {
        phaseId: "phase-w19-c5",
        key: "quiz-w19-c5-1",
        label: "Freeze the Moment",
        ask: {
          slug: "quiz-w19-ask-c5-1",
          text: "Your little brother is about to type Mom's card number into a FREE ROBUX box. When does the expert speak up?",
        },
        options: [
          { text: "Right now, kindly, before the tap lands" },
          { text: "Right after the tap, so he sees what happens first" },
          { text: "At bedtime, when everyone is calm and cozy" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Freeze the moment!",
          explanation: "After the tap, the card number is already gone, and bedtime is hours too late. Some traps need a hero in the room at the exact right second: notice it, speak up kindly, freeze it.",
        },
        villainRight: {
          slug: "quiz-w19-right-c5-1",
          text: "He froze the MOMENT! One more second and that card was mine, digit by beautiful digit!",
        },
        villainWrong: {
          slug: "quiz-w19-wrong-c5-1",
          text: "Let the tap land! Lessons stick better AFTER the money's gone! Ask anyone! Ask me!",
        },
      },
    
    ],
  },

  badgeArt: "/cyberheroes/badges/week-19-family-firewall.png",

  // Week-lane attack theatre: tricks aimed at the FAMILY only (kid-aimed
  // scams = W4, doors = W16, save-balloons = W18).
  bossAttacks: [
    { name: "GRANDMA-TRAP TEXT", icon: "✉️", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)", tag: "Same tricks, bigger font", emblemColor: 0xffd158 },
    { name: "ROTARY RINGER", icon: "🔔", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Contacts-only calls", emblemColor: 0xc084fc },
    { name: "BOSSY RULEBOOK", icon: "👑", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Rules cover everyone", emblemColor: 0xff5fb3 },
  ],

  // Placeholder quiz boss (the bespoke W19 fight - defend the whole house
  // at once - is designed with the boss batch).
  bossQuestions: {
    easy: [
      { question: "After eighteen weeks of powers, who's the house expert?", answers: ["You - and experts teach kindly", "Nobody", "Only grown-ups", "The Raccoon"], correctIndex: 0, explanation: "The roles flip: you know the tells now, so you share them - kindly, never teasing." },
      { question: "Grandma gets a 'you won a gift card!' text. You...", answers: ["Say 'wait - can I show you something?'", "Stay quiet - it's her phone", "Laugh at her", "Tap it for her, quickly"], correctIndex: 0, explanation: "Speak up kindly, right then - then walk through the tells together." },
      { question: "A TOGETHER rule is one that...", answers: ["Everyone signs - even Dad", "Only kids follow", "One person shouts", "Nobody follows"], correctIndex: 0, explanation: "Rules everyone sews beat rules one person sets - and they cover the whole family." },
    ],
    medium: [
      { question: "Why do grown-ups need the expert's help with scams?", answers: ["They get MORE scam texts than kids - same tricks, bigger font", "They can't read", "They don't - grown-ups can't be tricked", "Because they're silly"], correctIndex: 0, explanation: "Fake banks, packages and prizes aim at grown-ups all day - and you know all four tells." },
      { question: "On the evening rounds you find Grandma's phone set to 'ANYONE can video-call'. That's...", answers: ["An open window - flip it to contacts-only", "Fine - Grandma loves surprises", "Safe - tricksters never video-call", "A together rule"], correctIndex: 0, explanation: "Video-call scammers love an open line - contacts-only means only real faces ring through." },
      { question: "The golden patch on the family quilt says...", answers: ["Tell, don't hide - and nobody gets shouted at for telling", "Keep problems secret", "No screens ever again", "Rules are only for kids"], correctIndex: 0, explanation: "The firewall only works if telling is always safe - no blame, just help." },
    ],
    hard: [
      { question: "Little brother is about to type Mom's card into a FREE ROBUX box. The expert's three moves are...", answers: ["Notice → speak up kindly → fix it together", "Grab the tablet and yell", "Wait and tell Mom next week", "Type the card in faster"], correctIndex: 0, explanation: "Freeze the moment BEFORE the tap - then fix it together so he learns the trap too." },
      { question: "Why does teasing break the firewall even when the teach is right?", answers: ["Next time they won't show you the text at all", "It doesn't - teasing is fine", "Because it's too loud", "Because experts never talk"], correctIndex: 0, explanation: "The firewall runs on people SHOWING you things - kindness is what keeps that door open." },
      { question: "The fake bank text says 'Your acount is BLOCKED - act in 10 minutes!' Which tells has it shown?", answers: ["Panic clock AND sloppy spelling - two tells at once", "Just the panic clock - the spelling is fine", "None - it's real", "That Grandma should stop banking"], correctIndex: 0, explanation: "Real banks never race you and always check their spelling - two loose threads on one costume." },
    ],
  },

  // Keyed by SCREEN INDEX (0-28). Must stay in lock-step with `screens` above -
  // if a screen is inserted/removed, shift these too (the trailing labels help).
  // The 5 "recap" checkpoints (after each Prove beat) are indices 6/10/14/18/22.

  // Keyed by SCREEN INDEX (0-29), and there are exactly 30 screens above.
  // The shipped week carried 29 keys for 31 screens, so from index 2 onward
  // every reaction landed on the wrong screen. Counted and re-checked on the
  // rebuild: if a screen is ever inserted or removed, shift these with it.
  // The 5 recap checkpoints are indices 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 19 - the family firewall!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "He's gone after your FAMILY..." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command has the layout." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Roles flip today. You teach." } }, // mission brief
    4: { adam: null, layla: { mood: "thinking", message: "You know more than they do now." } }, // learn: expert
    5: { adam: null, layla: { mood: "curious", message: "All true - pick the one that HELPS." } }, // game: explainIt
    6: { adam: { mood: "thumbsup", message: "What makes a good answer?" }, layla: null }, // prove: recall
    7: { adam: { mood: "excited", message: "They'll come and ask you again!" }, layla: null }, // recap 1
    8: { adam: { mood: "thinking", message: "Nobody ever taught them the tells." }, layla: null }, // learn: tells
    9: { adam: { mood: "curious", message: "Stamp what you'd point at!" }, layla: null }, // game: clueStamper
    10: { adam: { mood: "worried", message: "Careful - is he fibbing? Listen close!" }, layla: null }, // prove: lie
    11: { adam: null, layla: { mood: "excited", message: "Three phones, nobody made to feel silly!" } }, // recap 2
    12: { adam: null, layla: { mood: "thinking", message: "Safe and fair aren't the same." } }, // learn: quilt
    13: { adam: null, layla: { mood: "curious", message: "Who does that one land on?" } }, // game: hearthLoom
    14: { adam: { mood: "thumbsup", message: "What makes a rule FAIR?" }, layla: null }, // prove: recall
    15: { adam: { mood: "excited", message: "That quilt covers the whole house!" }, layla: null }, // recap 3
    16: { adam: { mood: "thinking", message: "Sometimes it happens anyway." }, layla: null }, // learn: after
    17: { adam: { mood: "curious", message: "Build the wall - fast and kind!" }, layla: null }, // game: firewallBuilder
    18: { adam: null, layla: { mood: "thumbsup", message: "Quick - what's the FIRST thing?" } }, // prove: speed
    19: { adam: null, layla: { mood: "excited", message: "Not one I told you so!" } }, // recap 4
    20: { adam: null, layla: { mood: "thinking", message: "Two seconds. That's all you get." } }, // learn: freeze
    21: { adam: null, layla: { mood: "curious", message: "Short words. Say it now." } }, // game: speakUp (villain OFF)
    22: { adam: { mood: "thumbsup", message: "Finish the sentence rule!" }, layla: null }, // prove: finish
    23: { adam: { mood: "excited", message: "All five - one last walk round!" }, layla: null }, // recap 5
    24: { adam: { mood: "excited", message: "Three people, three moments!" }, layla: null }, // review: accountRescue
    25: { adam: { mood: "worried", message: "He came for your family. Go." }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "The whole house is covered!" } }, // outro video
    27: { adam: null, layla: { mood: "thumbsup", message: "Look at everything you mastered!" } }, // debrief
    28: { adam: { mood: "excited", message: "Stickers earned, Family Firewall!" }, layla: null }, // stickers
    29: { adam: { mood: "thumbsup", message: "Family Firewall badge earned!" }, layla: null }, // completion
  },
};
