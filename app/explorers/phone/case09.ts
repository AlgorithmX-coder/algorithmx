/**
 * Block 2 · Case 009 "The Long Game", SIREN ③, for THE PHONE runtime.
 *
 * Same framework (7 skills LEARN -> PRACTICE, blind boss, must-pass test); a
 * different game (§0). SIREN's masterpiece is the weeks-long con, so the signature
 * is TRACE: lay the whole con on a timeline (contact -> warmth -> gift -> the turn
 * -> the ask -> the squeeze), find the moment it turns, and exit without shame.
 * Boss = "The Collector". Curriculum row M09: scams-are-a-business / trust-farming
 * + sunk-cost / exit skills.
 *
 * SAFEGUARDING (curriculum §5 M09 + §11, BINDING): the blackmail-abstract rule
 * (skill 7 + boss/test) is stated ABSTRACTLY only, never depicted, no imagery, no
 * romantic or sexual framing, and always exits to a trusted adult with "you are
 * not in trouble, it is not your fault." Needs RSHE/safeguarding sign-off before
 * market.
 */

import type { PhoneCase } from "./case06";

export const case09Phone: PhoneCase = {
  id: "explorers-m09",
  caseNumber: "CASE 009",
  title: "The Long Game",
  actor: "SIREN",
  app: { name: "Bond", accent: "#FFB13D", wall: "radial-gradient(130% 90% at 50% 0%, #2a2110 0%, #0d0c0a 62%)" },
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
        { t: "con", text: "omg we like ALL the same stuff, this is so rare 😭 i feel like i finally found my person", ask: true },
        {
          t: "choose",
          prompt: "That 'we're so alike' feeling. What's the business trick here?",
          options: [
            { label: "They scatter that line to thousands, someone always bites", outcome: "good", then: [{ t: "wren", text: "Right. That line gets copied to thousands, and it only takes a few to believe it. Your shared interests were guessed, not fate.", voice: "/audio/wren/m09p-s1-q2ok.mp3" }] },
            { label: "You two genuinely have loads in common", outcome: "bad", then: [{ t: "wren", text: "In week one, from a stranger? That is a script fishing for a match, not a real bond. Try again.", voice: "/audio/wren/m09p-s1-q2bad.mp3" }] },
            { label: "It means they picked you specially", outcome: "bad", then: [{ t: "wren", text: "A factory has no favourites, only targets. They message thousands the exact same way. Try again.", voice: "/audio/wren/m09p-s1-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Why is 'a scam is a business' actually good news for you?",
          options: [
            { label: "It's not personal, so it's never your fault and easy to walk away", outcome: "good", then: [{ t: "wren", text: "Exactly. A factory was never about you, so getting targeted is never your fault, and walking away is easy.", voice: "/audio/wren/m09p-s1-q3ok.mp3" }] },
            { label: "It means they'll get bored and leave you alone soon", outcome: "bad", then: [{ t: "wren", text: "A business chases every lead, it won't quit on its own. You have to be the one to walk. Try again.", voice: "/audio/wren/m09p-s1-q3bad.mp3" }] },
            { label: "It means the scammer must be really rich", outcome: "bad", then: [{ t: "wren", text: "Rich or not doesn't matter. What matters is it's a business, not a bond. Try again.", voice: "/audio/wren/m09p-s1-q3bad2.mp3" }] },
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
        { t: "con", text: "topped up your account again 😊 don't even mention it, i just like knowing you're happy x", ask: true },
        {
          t: "choose",
          prompt: "Second gift, and still no ask. What is really being built?",
          options: [
            { label: "A debt, so you feel you owe them when the ask comes", outcome: "good", then: [{ t: "wren", text: "That's it. Two gifts, zero asks, that's an investment growing. The bigger the debt feels, the harder the future ask is to refuse.", voice: "/audio/wren/m09p-s2-q2ok.mp3" }] },
            { label: "A real, caring friendship", outcome: "bad", then: [{ t: "wren", text: "A real friend you've never met doesn't buy your trust with top-ups. That's a farmer feeding a crop. Try again.", voice: "/audio/wren/m09p-s2-q2bad.mp3" }] },
            { label: "Nothing, some people are just kind", outcome: "bad", then: [{ t: "wren", text: "Strangers online don't spend money to be kind, they spend it to build a debt. Try again.", voice: "/audio/wren/m09p-s2-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "An online friend sends you a birthday present. A grown-up asks about it. What's the safe move?",
          options: [
            { label: "Tell the trusted adult about the gift and where it came from", outcome: "good", then: [{ t: "wren", text: "Perfect. Telling a trusted adult about gifts from online strangers is exactly right, they can help you see the string attached.", voice: "/audio/wren/m09p-s2-q3ok.mp3" }] },
            { label: "Keep it quiet so the gift isn't taken away", outcome: "bad", then: [{ t: "wren", text: "A gift you have to hide is a warning sign. Tell a trusted adult, a real gift has nothing to keep secret. Try again.", voice: "/audio/wren/m09p-s2-q3bad.mp3" }] },
            { label: "Send an even bigger gift back to be fair", outcome: "bad", then: [{ t: "wren", text: "That just deepens the debt they're farming. Don't repay, tell a trusted adult instead. Try again.", voice: "/audio/wren/m09p-s2-q3bad2.mp3" }] },
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
            { label: "The sunk-cost trap, making leaving feel wasteful", outcome: "good", then: [{ t: "wren", text: "Exactly. It's using the weeks you've spent as a chain. But those weeks are gone whether you stay or go, and staying only costs you more. Guilt is not a reason to keep going. You can leave right now.", voice: "/audio/wren/m09p-s3-ok.mp3" }] },
            { label: "A fair point, you have put a lot in", outcome: "bad", then: [{ t: "wren", text: "It feels fair, and that's the trick. Time already spent can't be saved by spending more. That's the whole trap. Try again.", voice: "/audio/wren/m09p-s3-bad.mp3" }] },
            { label: "Proof that they really do care", outcome: "bad", then: [{ t: "wren", text: "Someone who cares lets you leave freely. Guilt-tripping you to stay is a con protecting its investment. Try again.", voice: "/audio/wren/m09p-s3-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "we've been talking for two whole months now, you can't just throw all that away over one little favour 😔", ask: true },
        {
          t: "choose",
          prompt: "What is that guilt trip actually doing?",
          options: [
            { label: "Using the time you've spent as a chain to keep you stuck", outcome: "good", then: [{ t: "wren", text: "Exactly. Those two months are spent whether you stay or go. Guilt is the chain, and you can snap it any time.", voice: "/audio/wren/m09p-s3-q2ok.mp3" }] },
            { label: "Making a fair point about your friendship", outcome: "bad", then: [{ t: "wren", text: "It feels fair, and that's the trap. Time already gone can't be saved by giving them more. Try again.", voice: "/audio/wren/m09p-s3-q2bad.mp3" }] },
            { label: "Showing they truly value you", outcome: "bad", then: [{ t: "wren", text: "Someone who valued you would let you leave freely, not guilt you into staying. Try again.", voice: "/audio/wren/m09p-s3-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "You feel bad quitting because of all the weeks you put in. What's the truth about those weeks?",
          options: [
            { label: "They're already gone, and staying only costs you more", outcome: "good", then: [{ t: "wren", text: "Right. Spent time can't be un-spent, and staying to protect it just loses you more. Walk away, and if you're unsure, tell a trusted adult.", voice: "/audio/wren/m09p-s3-q3ok.mp3" }] },
            { label: "You can win them back by carrying on", outcome: "bad", then: [{ t: "wren", text: "You can't win back spent time by spending more, that's the whole trap. Try again.", voice: "/audio/wren/m09p-s3-q3bad.mp3" }] },
            { label: "They'd all be wasted if you leave now", outcome: "bad", then: [{ t: "wren", text: "They're already gone either way, so leaving wastes nothing extra. Staying does. Try again.", voice: "/audio/wren/m09p-s3-q3bad2.mp3" }] },
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
        { t: "con", text: "hiii i saw your comment and you seem really cool, wanna be friends? 😊", ask: true },
        {
          t: "choose",
          prompt: "On the con timeline, which stage is this message?",
          options: [
            { label: "Contact, the very first stage", outcome: "good", then: [{ t: "wren", text: "Yes. A friendly hello is contact, stage one. Warmth comes next, then the gift, then the turn. Now you know where you are.", voice: "/audio/wren/m09p-s4-q2ok.mp3" }] },
            { label: "The turn, where it starts taking", outcome: "bad", then: [{ t: "wren", text: "Nothing's been taken yet, this is just the opener. The turn comes later, after warmth and a gift. Try again.", voice: "/audio/wren/m09p-s4-q2bad.mp3" }] },
            { label: "The squeeze, the final pressure", outcome: "bad", then: [{ t: "wren", text: "The squeeze is the last, heaviest push. This is the very first hello. Try again.", voice: "/audio/wren/m09p-s4-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Why does laying a con out on a timeline help you so much?",
          options: [
            { label: "You can see where you are and get off before the ask", outcome: "good", then: [{ t: "wren", text: "Exactly. See the whole shape and you can spot your place on it, then step off before the ask ever lands.", voice: "/audio/wren/m09p-s4-q3ok.mp3" }] },
            { label: "It makes the friendship feel more real", outcome: "bad", then: [{ t: "wren", text: "A timeline does the opposite, it shows the friendly bits are a plan. Try again.", voice: "/audio/wren/m09p-s4-q3bad.mp3" }] },
            { label: "It proves the person is trustworthy", outcome: "bad", then: [{ t: "wren", text: "It shows the opposite, that the warmth is staged to lead somewhere. Try again.", voice: "/audio/wren/m09p-s4-q3bad2.mp3" }] },
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
            { label: "Week 3, the first time they take instead of give", outcome: "good", then: [{ t: "wren", text: "Spot on. Weeks one and two were all giving, warmth and a gift. Week three is the first take, wrapped up as a tiny favour. That's the turn, and it's your cue to walk.", voice: "/audio/wren/m09p-s5-ok.mp3" }] },
            { label: "Week 1, the friendly opener", outcome: "bad", then: [{ t: "wren", text: "That's still giving, pure warmth, no ask. The turn is the first time they take something. Look further down. Try again.", voice: "/audio/wren/m09p-s5-bad.mp3" }] },
            { label: "Week 2, the gift", outcome: "bad", then: [{ t: "wren", text: "A gift is still giving, it's the bait. The turn is the first ask, the first time it takes. Try again.", voice: "/audio/wren/m09p-s5-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "Week 1: you're honestly my favourite person to talk to 💛", ask: true },
        { t: "con", text: "Week 2: made you a little playlist, just because 🎧", ask: true, delay: 900 },
        { t: "con", text: "Week 3: hey could you send me your account login so i can add songs to it? 🙏", ask: true, delay: 900 },
        {
          t: "choose",
          prompt: "Which message is THE turn, from giving to taking?",
          options: [
            { label: "Week 3, the first time they ask you to hand something over", outcome: "good", then: [{ t: "wren", text: "Spot on. Weeks one and two only gave, warmth and a gift. Week three is the first take, asking for your login. That's the turn, and you never share a login.", voice: "/audio/wren/m09p-s5-q2ok.mp3" }] },
            { label: "Week 1, the kind words", outcome: "bad", then: [{ t: "wren", text: "Kind words are still giving, no ask yet. The turn is the first time they take. Look further on. Try again.", voice: "/audio/wren/m09p-s5-q2bad.mp3" }] },
            { label: "Week 2, the playlist gift", outcome: "bad", then: [{ t: "wren", text: "A gift is still giving, it's the bait. The turn is the first ask. Try again.", voice: "/audio/wren/m09p-s5-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "What makes the turn so easy to miss?",
          options: [
            { label: "It's wrapped up gently as a tiny favour inside the friendship", outcome: "good", then: [{ t: "wren", text: "Exactly. It's dressed as a tiny favour so you barely feel it flip. Spot it and you can leave the second it happens.", voice: "/audio/wren/m09p-s5-q3ok.mp3" }] },
            { label: "It always comes with an angry threat", outcome: "bad", then: [{ t: "wren", text: "Not yet, the turn is usually gentle and sweet. Threats only come later if you don't leave. Try again.", voice: "/audio/wren/m09p-s5-q3bad.mp3" }] },
            { label: "It happens in the very first message", outcome: "bad", then: [{ t: "wren", text: "The first message is just contact, giving. The turn comes after weeks of building trust. Try again.", voice: "/audio/wren/m09p-s5-q3bad2.mp3" }] },
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
            { label: "Stop replying, block, and tell an adult, no explanation owed", outcome: "good", then: [{ t: "wren", text: "Perfect. No goodbye, no debate, no shame. You block, you walk, and you tell a trusted adult so they can help. Leaving a con is never rude, and getting fooled is never your fault.", voice: "/audio/wren/m09p-s6-ok.mp3" }] },
            { label: "Politely explain why you're leaving", outcome: "bad", then: [{ t: "wren", text: "You owe a con nothing, not even a reason. Explaining just gives them a chance to reel you back in. Block and walk. Try again.", voice: "/audio/wren/m09p-s6-bad.mp3" }] },
            { label: "Stay, you've come too far to quit now", outcome: "bad", then: [{ t: "wren", text: "That's the sunk-cost trap talking. The time is gone either way, and staying only costs you more. You can always leave. Try again.", voice: "/audio/wren/m09p-s6-bad2.mp3" }] },
          ],
        },
        { t: "con", text: "if you leave now after all this i'll be so hurt. at least tell me what i did wrong 😢", ask: true },
        {
          t: "choose",
          prompt: "They want a reason before you go. What do you owe them?",
          options: [
            { label: "Nothing, you can block and walk with no explanation", outcome: "good", then: [{ t: "wren", text: "Right. A con is owed nothing, not even a reason. Explaining just hands them a way to pull you back in. Block, walk, done.", voice: "/audio/wren/m09p-s6-q2ok.mp3" }] },
            { label: "A polite explanation, it's only fair", outcome: "bad", then: [{ t: "wren", text: "You owe a con no reasons. A goodbye is just another door for them to reel you back through. Try again.", voice: "/audio/wren/m09p-s6-q2bad.mp3" }] },
            { label: "One more chance to make it right", outcome: "bad", then: [{ t: "wren", text: "That's how they keep you. You can leave at any point, no chances owed. Try again.", voice: "/audio/wren/m09p-s6-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "You got pulled into a con for weeks before spotting it. Whose fault is that?",
          options: [
            { label: "The con artist's, so tell a trusted adult and don't carry it alone", outcome: "good", then: [{ t: "wren", text: "Exactly. They're professionals, the shame is all theirs. Tell a trusted adult, getting fooled is never your fault.", voice: "/audio/wren/m09p-s6-q3ok.mp3" }] },
            { label: "Yours, for not noticing sooner", outcome: "bad", then: [{ t: "wren", text: "Never. Con artists trick people for a living, the fault is entirely theirs. Tell a trusted adult. Try again.", voice: "/audio/wren/m09p-s6-q3bad.mp3" }] },
            { label: "Nobody's, so just quietly forget it", outcome: "bad", then: [{ t: "wren", text: "Don't carry it alone. It wasn't your fault, and a trusted adult can help you. Try again.", voice: "/audio/wren/m09p-s6-q3bad2.mp3" }] },
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
        { t: "con", text: "quick one, what's the code that just texted your phone? need it to send you something, keep it between us though 🤫", ask: true },
        {
          t: "choose",
          prompt: "They want your code, and want it kept secret. What do you do?",
          options: [
            { label: "Pause, share the code with no one, and tell a trusted adult", outcome: "good", then: [{ t: "wren", text: "Perfect. A code plus keep it secret is a double alarm. You share codes with no one, and you tell a trusted adult straight away.", voice: "/audio/wren/m09p-s7-q2ok.mp3" }] },
            { label: "Send the code, it's just to receive a gift", outcome: "bad", then: [{ t: "wren", text: "Never send a code from your phone, that's someone breaking into an account. Pause, and tell a trusted adult. Try again.", voice: "/audio/wren/m09p-s7-q2bad.mp3" }] },
            { label: "Refuse, but keep it a secret like they asked", outcome: "bad", then: [{ t: "wren", text: "Good that you refused, but secrets are the trap. Tell a trusted adult, you are never in trouble for it. Try again.", voice: "/audio/wren/m09p-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "An online friend keeps saying \"don't tell your parents about us, they wouldn't get it.\" What does that tell you?",
          options: [
            { label: "A push to keep secrets is a warning, so tell a trusted adult", outcome: "good", then: [{ t: "wren", text: "Exactly. Anyone pushing you to hide a friendship from your parents is a red flag. Tell a trusted adult, secrets are how cons hide.", voice: "/audio/wren/m09p-s7-q3ok.mp3" }] },
            { label: "They just want your friendship to stay private", outcome: "bad", then: [{ t: "wren", text: "Real friends don't need you to hide them from your family. That secret keeps you cut off. Tell a trusted adult. Try again.", voice: "/audio/wren/m09p-s7-q3bad.mp3" }] },
            { label: "They're right, grown-ups wouldn't understand", outcome: "bad", then: [{ t: "wren", text: "That's exactly the line a con uses to isolate you. A trusted adult will understand and help. Try again.", voice: "/audio/wren/m09p-s7-q3bad2.mp3" }] },
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
              { label: "Week 5, the first ask, the first time it takes", outcome: "good" },
              { label: "Week 1, the friendly opener", outcome: "bad", then: [{ t: "con", text: "Week 5: you there? 🙏", delay: 700 }] },
              { label: "Week 3, the gift", outcome: "bad", then: [{ t: "con", text: "Week 5: it's really quick i promise 🙏", delay: 700 }] },
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
          { label: "Stop replying, block, tell an adult, no shame, no explanation owed", correct: true },
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
