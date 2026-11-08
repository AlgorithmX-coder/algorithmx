/**
 * WREN's spoken scripts for Case 009 ("The Long Game"). See mission01.mjs
 * and mission06.mjs for conventions. test.passVoice/failVoice have no text
 * field in case09.ts — recovered by transcription.
 *
 * SAFEGUARDING: skill 7 covers the blackmail-abstract rule (curriculum §5
 * M09 + §11, BINDING). Every skill-7 line is [warm], never playful or
 * flippant, matching the on-screen text's own careful, non-shaming framing.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress. SIREN is "he". The skill-7 rewording only splits sentences and
 * adds joining words; every rule (never pay, never comply, tell a trusted
 * adult, not in trouble, never your fault) is kept as it was.
 */
export const mission09VoiceScripts = {
  "/audio/wren/m09p-recap.mp3":
    "[warm] Previously on Cyber Explorers, GHOSTWRITER used AI to write you a flawless message, with no mistakes to catch and no clumsy tells. You learned that perfect writing isn't proof of anything. In today's case, someone has been messaging you for weeks, slowly and patiently, and all on purpose.",
  "/audio/wren/m09p-open-1.mp3":
    "[serious] This is our toughest case yet, Agent. SIREN is back, and this time there's no rush and no quick trick. This is the long con.",
  "/audio/wren/m09p-open-2.mp3":
    "[serious] SIREN doesn't want your password today. He spends weeks being your best friend, so that one day, when the ask finally comes, saying no feels impossible.",
  "/audio/wren/m09p-open-3.mp3":
    "[serious] You'll learn seven skills to see a con that plays out over weeks, then face a boss and a test. Learn these, and no amount of patience can trap you.",

  // skill 1 — scams are a business
  "/audio/wren/m09p-s1-learn.mp3":
    "[warm] This is SIREN's masterpiece, and it starts with something that'll actually make you feel better. Scams are a business. A scammer isn't obsessed with you. They're running a factory, messaging thousands of people at once and hoping a handful say yes. So when a special connection feels aimed right at you, remember that you're just one of thousands. And that means it was never personal, and never your fault.",
  "/audio/wren/m09p-s1-ok.mp3":
    "[warm] Exactly. That line isn't written for you. It's copied and pasted to thousands, tweaked with a name. Knowing that takes all its power away. It was never special, and it was never about you.",
  "/audio/wren/m09p-s1-bad.mp3":
    "[warm] That's exactly what they need you to think. A business doesn't have favourites. It has targets. Try again.",
  "/audio/wren/m09p-s1-bad2.mp3":
    "[warm] A genuine bond takes real, slow time, not a scripted line in week one. This is a factory, not a friendship. Try again.",
  "/audio/wren/m09p-s1-q2ok.mp3":
    "[warm] Right. That line gets copied to thousands, and it only takes a few to believe it. Your shared interests were a guess, not fate.",
  "/audio/wren/m09p-s1-q2bad.mp3":
    "[warm] This is week one, and they're a stranger. That is a script fishing for a match, not a real bond. Try again.",
  "/audio/wren/m09p-s1-q2bad2.mp3":
    "[warm] A factory has no favourites, only targets. They message thousands the exact same way. Try again.",
  "/audio/wren/m09p-s1-q3ok.mp3":
    "[warm] Exactly. A factory was never about you, so getting targeted is never your fault, and walking away is easy.",
  "/audio/wren/m09p-s1-q3bad.mp3":
    "[warm] A business chases every lead, and it won't quit on its own. You have to be the one to walk. Try again.",
  "/audio/wren/m09p-s1-q3bad2.mp3":
    "[warm] Whether they're rich doesn't matter. What matters is that it's a business, not a bond. Try again.",

  // skill 2 — trust-farming
  "/audio/wren/m09p-s2-learn.mp3":
    "[warm] Here's why it's called farming. A scammer plants trust and grows it, slowly. They send little gifts, spend weeks being lovely, remember your birthday, and ask for nothing at all. It feels like a real friendship blooming. But a farmer doesn't grow a crop to admire it. They grow it to harvest it. All that kindness is being saved up, to cash in later.",
  "/audio/wren/m09p-s2-ok.mp3":
    "[warm] That's it. A free gift from someone you've never met isn't kindness. It's an investment. They're building up how much you feel you owe them, ready to spend it on the day they ask.",
  "/audio/wren/m09p-s2-bad.mp3":
    "[warm] Strangers online don't send money to be generous. They send it to build a debt. That gift has a string on it. Try again.",
  "/audio/wren/m09p-s2-bad2.mp3":
    "[warm] It's never rude to be careful. A real friend wouldn't mind, and a farmer is counting on you feeling exactly that guilt. Try again.",
  "/audio/wren/m09p-s2-q2ok.mp3":
    "[warm] That's it. Two gifts with zero asks means an investment is growing. The bigger the debt feels, the harder the future ask is to refuse.",
  "/audio/wren/m09p-s2-q2bad.mp3":
    "[warm] A real friend you've never met doesn't buy your trust with top-ups. That's a farmer feeding a crop. Try again.",
  "/audio/wren/m09p-s2-q2bad2.mp3":
    "[warm] Strangers online don't spend money to be kind. They spend it to build a debt. Try again.",
  "/audio/wren/m09p-s2-q3ok.mp3":
    "[warm] Perfect. Telling a trusted adult about gifts from online strangers is exactly right. They can help you see the string attached.",
  "/audio/wren/m09p-s2-q3bad.mp3":
    "[warm] A gift you have to hide is a warning sign. Tell a trusted adult, because a real gift has nothing to keep secret. Try again.",
  "/audio/wren/m09p-s2-q3bad2.mp3":
    "[warm] That just deepens the debt they're farming. Don't repay them. Tell a trusted adult instead. Try again.",

  // skill 3 — the sunk-cost trap
  "/audio/wren/m09p-s3-learn.mp3":
    "[warm] Now here's the trap that keeps you stuck. Once you've spent weeks talking, and once you feel invested, the scammer turns it against you. They remind you of everything you've shared, and tell you that you've come this far. It makes leaving feel like a waste, like you'd be throwing it all away. But here's the truth. The time you already spent is gone either way. Staying to protect it just loses you more. You can walk away at any point, no matter how far in you are.",
  "/audio/wren/m09p-s3-ok.mp3":
    "[warm] Exactly. It's using the weeks you've spent as a chain. But those weeks are gone whether you stay or go, and staying only costs you more. Guilt is not a reason to keep going. You can leave right now.",
  "/audio/wren/m09p-s3-bad.mp3":
    "[warm] It feels fair, and that's the trick. Time already spent can't be saved by spending more. That's the whole trap. Try again.",
  "/audio/wren/m09p-s3-bad2.mp3":
    "[warm] Someone who cares lets you leave freely. Guilt-tripping you to stay is a con protecting its investment. Try again.",
  "/audio/wren/m09p-s3-q2ok.mp3":
    "[warm] Exactly. Those two months are spent whether you stay or go. Guilt is the chain, and you can snap it any time.",
  "/audio/wren/m09p-s3-q2bad.mp3":
    "[warm] It feels fair, and that's the trap. Time already gone can't be saved by giving them more. Try again.",
  "/audio/wren/m09p-s3-q2bad2.mp3":
    "[warm] Someone who valued you would let you leave freely, not guilt you into staying. Try again.",
  "/audio/wren/m09p-s3-q3ok.mp3":
    "[warm] Right. Spent time can't be un-spent, and staying to protect it just loses you more. Walk away, and if you're unsure, tell a trusted adult.",
  "/audio/wren/m09p-s3-q3bad.mp3":
    "[warm] You can't win back spent time by spending more. That's the whole trap. Try again.",
  "/audio/wren/m09p-s3-q3bad2.mp3":
    "[warm] They're already gone either way, so leaving wastes nothing extra. Staying does. Try again.",

  // skill 4 — trace the timeline
  "/audio/wren/m09p-s4-learn.mp3":
    "[warm] Your signature tool for this case is TRACE, which means laying the whole con out on a timeline. A long con almost always runs through the same stages, in order. First comes contact, then warmth, then a gift. After that come the turn, the ask, and the squeeze. When you can see all six laid out at once, the friendly bits stop looking friendly. They start to look like a plan.",
  "/audio/wren/m09p-s4-ok.mp3":
    "[warm] That's the shape of every long con. It goes contact, warmth, gift, turn, ask, and squeeze. Once you can see the whole timeline, you can spot exactly where you are on it, and get off before the ask.",
  "/audio/wren/m09p-s4-bad.mp3":
    "[warm] No con leads with the ask, because you'd say no instantly. It has to build all that trust first. Contact comes first. Try again.",
  "/audio/wren/m09p-s4-bad2.mp3":
    "[warm] There's no warmth before contact, because they have to reach you first. And the ask comes near the end, not before the gift. Try again.",
  "/audio/wren/m09p-s4-q2ok.mp3":
    "[warm] Yes. A friendly hello is contact, stage one. Warmth comes next, then the gift, then the turn. Now you know where you are.",
  "/audio/wren/m09p-s4-q2bad.mp3":
    "[warm] Nothing's been taken yet. This is just the opener. The turn comes later, after warmth and a gift. Try again.",
  "/audio/wren/m09p-s4-q2bad2.mp3":
    "[warm] The squeeze is the last, heaviest push. This is the very first hello. Try again.",
  "/audio/wren/m09p-s4-q3ok.mp3":
    "[warm] Exactly. See the whole shape and you can spot your place on it, then step off before the ask ever lands.",
  "/audio/wren/m09p-s4-q3bad.mp3":
    "[warm] A timeline does the opposite. It shows the friendly bits are a plan. Try again.",
  "/audio/wren/m09p-s4-q3bad2.mp3":
    "[warm] It shows the opposite. The warmth is staged to lead somewhere. Try again.",

  // skill 5 — spot the turn
  "/audio/wren/m09p-s5-learn.mp3":
    "[warm] Somewhere in every long con is the turn, the exact moment it flips from giving to taking. Up to then, they give you attention, gifts, and warmth. After it, they take money, codes, and favours. The turn is usually gentle, wrapped in the friendship so you barely feel it. But once you can spot the turn, you can leave the very second it happens.",
  "/audio/wren/m09p-s5-ok.mp3":
    "[warm] Spot on. Weeks one and two were all giving, with warmth and a gift. Week three is the first take, wrapped up as a tiny favour. That's the turn, and it's your cue to walk.",
  "/audio/wren/m09p-s5-q2ok.mp3":
    "[warm] Spot on. Weeks one and two only gave you warmth and a gift. Week three is the first take. It asks for your login. That's the turn, and you never share a login.",
  "/audio/wren/m09p-s5-q2bad.mp3":
    "[warm] Kind words are still giving, and there's no ask yet. The turn is the first time they take. Look further on. Try again.",
  "/audio/wren/m09p-s5-q2bad2.mp3":
    "[warm] A gift is still giving. It's the bait. The turn is the first time they take. Try again.",
  "/audio/wren/m09p-s5-q3ok.mp3":
    "[warm] Exactly. It's dressed as a tiny favour so you barely feel it flip. Spot it and you can leave the second it happens.",
  "/audio/wren/m09p-s5-q3bad.mp3":
    "[warm] No, the turn is usually gentle and sweet. Threats only come later, if you don't leave. Try again.",
  "/audio/wren/m09p-s5-q3bad2.mp3":
    "[warm] The first message is just contact, and it's still giving. The turn comes after weeks of building trust. Try again.",

  // skill 6 — exit without shame
  "/audio/wren/m09p-s6-learn.mp3":
    "[warm] Here's the skill that sets you free. You can leave a con at any point, and you never owe anyone an explanation. You don't owe one after a week, and you don't owe one after a month. And this matters most of all. If you got pulled in, it is not your fault. Con artists are professionals, and fooling people is their entire job. The shame belongs to them, every scrap of it. So you just stop replying, block, and walk away. There's no goodbye, no apology, and no shame.",
  "/audio/wren/m09p-s6-ok.mp3":
    "[warm] Perfect. There's no goodbye, no debate, and no shame. You block, you walk, and you tell a trusted adult so they can help. Leaving a con is never rude, and getting fooled is never your fault.",
  "/audio/wren/m09p-s6-bad.mp3":
    "[warm] You owe a con nothing, not even a reason. Explaining just gives them a chance to reel you back in. Block and walk. Try again.",
  "/audio/wren/m09p-s6-bad2.mp3":
    "[warm] That's the sunk-cost trap talking. The time is gone either way, and staying only costs you more. You can always leave. Try again.",
  "/audio/wren/m09p-s6-q2ok.mp3":
    "[warm] Right. A con is owed nothing, not even a reason. Explaining just hands them a way to pull you back in. Block them, walk away, and you're done.",
  "/audio/wren/m09p-s6-q2bad.mp3":
    "[warm] You owe a con no reasons. A goodbye is just another door for them to reel you back through. Try again.",
  "/audio/wren/m09p-s6-q2bad2.mp3":
    "[warm] That's how they keep you. You can leave at any point, and you don't owe them another chance. Try again.",
  "/audio/wren/m09p-s6-q3ok.mp3":
    "[warm] Exactly. They're professionals, so the shame is all theirs. Tell a trusted adult, because getting fooled is never your fault.",
  "/audio/wren/m09p-s6-q3bad.mp3":
    "[warm] It's never your fault. Con artists trick people for a living, so the fault is entirely theirs. Tell a trusted adult. Try again.",
  "/audio/wren/m09p-s6-q3bad2.mp3":
    "[warm] Don't carry it alone. It wasn't your fault, and a trusted adult can help you. Try again.",

  // skill 7 — the pause-and-tell rule (safeguarding-critical, see file header)
  "/audio/wren/m09p-s7-learn.mp3":
    "[warm] This is the last skill, and it's your safety net for everything. Any time an ask touches money, codes, or keeping a secret, you pause, and you tell a trusted adult before you do anything at all. And here's one more rule, the most important in this whole course. If anyone ever threatens to share something embarrassing about you unless you pay or do what they say, here's what you do. You never pay, and you never do it. You tell a trusted adult straight away. That isn't you being in trouble. That's you being brave. It is never, ever your fault, and a trusted adult will help you sort it.",
  "/audio/wren/m09p-s7-ok.mp3":
    "[warm] That's exactly right, and it's the bravest thing you can do. You never pay and you never comply, because it only ever leads to more. You tell a trusted adult, and they help you. You are not in trouble, and none of it is your fault.",
  "/audio/wren/m09p-s7-bad.mp3":
    "[warm] Paying never makes it go away. It tells them it works, and they come back for more. Never pay. Tell a trusted adult, and they will help you. Try again.",
  "/audio/wren/m09p-s7-bad2.mp3":
    "[warm] Begging just shows them they've got power over you. Don't reply at all. Go straight to a trusted adult, because that's what beats this every time. Try again.",
  "/audio/wren/m09p-s7-q2ok.mp3":
    "[warm] Perfect. A request for a code, plus a request to keep it secret, is a double alarm. You share codes with no one, and you tell a trusted adult straight away.",
  "/audio/wren/m09p-s7-q2bad.mp3":
    "[warm] Never send a code from your phone. That's how someone breaks into an account. Pause, and tell a trusted adult. Try again.",
  "/audio/wren/m09p-s7-q2bad2.mp3":
    "[warm] It's good that you refused, but secrets are the trap. Tell a trusted adult. You are never in trouble for it. Try again.",
  "/audio/wren/m09p-s7-q3ok.mp3":
    "[warm] Exactly. Anyone pushing you to hide a friendship from your parents is a red flag. Tell a trusted adult, because secrets are how cons hide.",
  "/audio/wren/m09p-s7-q3bad.mp3":
    "[warm] Real friends don't need you to hide them from your family. That secret keeps you cut off. Tell a trusted adult. Try again.",
  "/audio/wren/m09p-s7-q3bad2.mp3":
    "[warm] That's exactly the line a con uses to isolate you. A trusted adult will understand and help. Try again.",

  // boss — "The Collector"
  "/audio/wren/m09p-boss-intro.mp3":
    "[determined] This is it, Agent. I've laid out a whole con for you, six weeks of it, from the very first hello. Somewhere in there, it turns from giving to taking. There are no hints from me now. Read the timeline, find the turn, refuse the ask, and get out clean. Go.",
  "/audio/wren/m09p-boss-win.mp3":
    "[proud] That was flawless, Agent. You saw it was a business, not a bond. You watched the trust get farmed, you traced the whole six-week timeline, and you found the exact week it turned from giving to taking. And when the sunk-cost squeeze tried to hold you, you walked away clean and told a trusted adult. You felt no shame, and you owed no explanation. You beat SIREN's masterpiece.",

  // test — "Prove it"
  "/audio/wren/m09p-test-intro.mp3":
    "[warm] There's one last thing before I close the case, and that's the test. It's a fresh batch you haven't seen, with no hints. Get enough of them right, and the case is closed for good. Take everything you learned about the long con, and think. Ready?",
  // words kept to match the owner-approved test-pass lines of Cases 6, 7, 8 and 10
  "/audio/wren/m09p-test-pass.mp3":
    "[proud] Yes! Six new tricks and all of SIREN's patience got you nowhere. Case closed, Agent. You've earned it.",
  "/audio/wren/m09p-test-fail.mp3":
    "[warm] That was so close, Agent. Don't sweat it, because even pros miss a couple. Take a breath and run it again. You know this.",

  // debrief
  "/audio/wren/m09p-debrief.mp3":
    "[proud] You outlasted the long con.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
// TRACE is the signature tool's name on screen; said as a plain word so it
// isn't read as a shouted stress word.
export const mission09Say = {
  "TRACE": "Trace",
};
