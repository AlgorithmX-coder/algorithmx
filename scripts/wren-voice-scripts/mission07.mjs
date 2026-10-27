/**
 * WREN's spoken scripts for Case 007 ("Borrowed Faces"). See mission01.mjs
 * and mission06.mjs for conventions. test.passVoice/failVoice have no text
 * field in case07.ts — recovered here by transcription. The fail line
 * ("So close. Don't sweat it...") is an identical generic template reused
 * across cases (confirmed against Case 6's), each with its own recording.
 */
export const mission07VoiceScripts = {
  "/audio/wren/m07p-recap.mp3":
    "[warm] Previously on Cyber Explorers... SIREN tried to rush you, scare you, and guilt you into clicking, stacking one feeling on another until you weren't thinking straight. You learned to name every lever as it's pulled, and to walk away clean. [curious] Today, a friend's account messages you. Only... is it really them?",
  "/audio/wren/m07p-open-1.mp3":
    "[serious] Next case, Agent, and a new kind of enemy. This one's name is MIMIC, and MIMIC doesn't send you a dodgy link.",
  "/audio/wren/m07p-open-2.mp3":
    "[concerned] MIMIC steals a real account, one of your actual friends, and wears it like a mask. Same name, same photo, every chat you've ever had. So the message really is from your friend's account. That's what makes it so dangerous.",
  "/audio/wren/m07p-open-3.mp3":
    "[excited] Seven skills to tell a friend from a thief wearing their face, then a boss and a test. Let's make you unfoolable.",

  // skill 1 — trust doesn't transfer
  "/audio/wren/m07p-s1-learn.mp3":
    "[curious] Here's MIMIC's whole trick. When an account gets stolen, the thief inherits everything, the name, the photo, every chat you two ever had. So the account is real. The person typing might not be. [serious] Trust belongs to your friend, not to the account, and a thief can hold the account. Watch.",
  "/audio/wren/m07p-s1-ok.mp3":
    "[proud] Exactly. It doesn't matter how friendly it is or that it's really her account. The moment a 'friend' asks for something only a thief would want, that's your flag. The ask gives it away, not the tone.",
  "/audio/wren/m07p-s1-bad.mp3":
    "[warm] That's a small nudge, but not the real tell. Look at what she's actually asking you to hand over. Try again.",
  "/audio/wren/m07p-s1-bad2.mp3":
    "[warm] Emojis prove nothing, thieves use them too. Look at the ask itself, not the decoration. Try again.",
  "/audio/wren/m07p-s1-q2ok.mp3":
    "[proud] Right. The account being real proves nothing. A real friend never asks for your password, so the ask tells you it's a thief.",
  "/audio/wren/m07p-s1-q2bad.mp3":
    "[warm] A thief inherits every old chat the moment they steal the account. Old messages prove the account, not the person. Try again.",
  "/audio/wren/m07p-s1-q2bad2.mp3":
    "[warm] Anyone can type 'trust me', a thief most of all. Trust is earned by the person, not claimed in a message. Try again.",
  "/audio/wren/m07p-s1-q3ok.mp3":
    "[proud] Exactly. A stolen account keeps the real name, photo and chats, but a thief is holding it now. Real account, wrong person.",
  "/audio/wren/m07p-s1-q3bad.mp3":
    "[warm] That's the exact trap. A stolen account is real but held by a thief. The account being real proves nothing. Try again.",
  "/audio/wren/m07p-s1-q3bad2.mp3":
    "[warm] The photo stays the same, that's what makes it dangerous. You judge by the ask, never the picture. Try again.",

  // skill 2 — the weird ask
  "/audio/wren/m07p-s2-learn.mp3":
    "[curious] So how do you tell a friend from a thief wearing their face? Not by how nice they are, a thief can be lovely. You tell them by the ASK. [serious] Real friends don't suddenly need your password, a code from your phone, gift cards, or for you to keep it all secret. When the ask gets weird, the friendly face stops mattering.",
  "/audio/wren/m07p-s2-ok.mp3":
    "[proud] All three, tagged. Money you can't easily get back, a rush so you don't think, and 'don't tell an adult', which is a flag on its own. Any one of those from a friend is odd. All three together is a thief.",
  "/audio/wren/m07p-s2-q2ok.mp3":
    "[proud] Spot on. A code sent to your phone protects your account, never hers. A real friend would never need it.",
  "/audio/wren/m07p-s2-q2bad.mp3":
    "[warm] Codes don't wander off to the wrong phone by accident, and a real friend wouldn't ask for yours. That ask doesn't fit. Try again.",
  "/audio/wren/m07p-s2-q2bad2.mp3":
    "[warm] The emoji is just dressing. The weird bit is asking for a code off your phone. Look at the ask itself. Try again.",
  "/audio/wren/m07p-s2-q3ok.mp3":
    "[proud] That's the one. Money plus secrecy is the classic weird ask, and a real friend needs neither from you.",
  "/audio/wren/m07p-s2-q3bad.mp3":
    "[warm] That's a totally normal favour, nothing odd about it. Look for the ask that doesn't fit a real friend. Try again.",
  "/audio/wren/m07p-s2-q3bad2.mp3":
    "[warm] That's just a friend being a friend. No code, no money, no secrecy. Keep looking for the odd one. Try again.",

  // skill 3 — verify another channel
  "/audio/wren/m07p-s3-learn.mp3":
    "[warm] Here's the most important habit in this whole block, and it has a fancy name, out-of-band verification. Simple idea. If a friend's message feels off, check them a DIFFERENT way than the message came. [determined] They DM you? Call them, or ask in person. Never check on the same app a thief might be holding, because they'll just type 'yes it's me!'.",
  "/audio/wren/m07p-s3-ok.mp3":
    "[proud] That's it. A different channel a thief can't reach. If the real Priya answers, confused, you've caught them. If 'Priya' in the chat is a thief, they never wanted you to make that call.",
  "/audio/wren/m07p-s3-bad.mp3":
    "[warm] That's the same channel the thief controls, so of course they'll say yes. You have to step OUTSIDE the chat. Try again.",
  "/audio/wren/m07p-s3-bad2.mp3":
    "[concerned] The upset is the weapon, it's there to rush you. And that code unlocks YOUR account, not hers. Never send it. Try again.",
  "/audio/wren/m07p-s3-q2ok.mp3":
    "[proud] Yes. The one telling you not to check elsewhere is exactly who you should check on. Step outside this chat.",
  "/audio/wren/m07p-s3-q2bad.mp3":
    "[warm] This chat is the one channel a thief controls. 'No need to call' is a thief's favourite line. Verify a different way. Try again.",
  "/audio/wren/m07p-s3-q2bad2.mp3":
    "[warm] That code unlocks your account, not hers, and the rush is the trap. Never send it, check her another way first. Try again.",
  "/audio/wren/m07p-s3-q3ok.mp3":
    "[proud] Exactly. Whoever controls the chat controls the answer. A different channel is one the thief can't reach.",
  "/audio/wren/m07p-s3-q3bad.mp3":
    "[warm] It's not about speed. It's that the thief runs this chat and will lie in it. You need a channel they don't hold. Try again.",
  "/audio/wren/m07p-s3-q3bad2.mp3":
    "[warm] That's the trap. Asking in the same chat lets the thief just say 'yes'. Always step outside it. Try again.",

  // skill 4 — the check-question
  "/audio/wren/m07p-s4-learn.mp3":
    "[curious] You can't always call. So your second tool is a check-question, something only the real them would know. Not their birthday or their dog's name, those are on their profile for anyone to read. [warm] Pick an inside joke, a shared memory, where you sat on your first day. If they can't answer it, it isn't them.",
  "/audio/wren/m07p-s4-ok.mp3":
    "[proud] Perfect. An inside thing a thief could never find on a profile. The real Priya answers in a second. A thief has no idea.",
  "/audio/wren/m07p-s4-bad.mp3":
    "[warm] A birthday is on her profile and half the internet. A thief can just look it up. Pick something only you two would know. Try again.",
  "/audio/wren/m07p-s4-bad2.mp3":
    "[warm] Her dog's name is probably in a dozen photos she's posted. Too easy to find. Go for a private, shared memory instead. Try again.",
  "/audio/wren/m07p-s4-q2ok.mp3":
    "[proud] Perfect. A private memory only the two of you share. A thief reading her profile has no way to know it.",
  "/audio/wren/m07p-s4-q2bad.mp3":
    "[warm] Her username is right there on the account for anyone to read. That tests nothing. Pick a shared secret instead. Try again.",
  "/audio/wren/m07p-s4-q2bad2.mp3":
    "[warm] Her school is easy to find and probably on her profile. A thief could answer that. Go private and personal. Try again.",
  "/audio/wren/m07p-s4-q3ok.mp3":
    "[proud] Right. Inside jokes and shared memories live only between you two. Nothing on a profile can leak them.",
  "/audio/wren/m07p-s4-q3bad.mp3":
    "[warm] Profile facts are the worst kind, a thief just reads them off. Go for something private instead. Try again.",
  "/audio/wren/m07p-s4-q3bad2.mp3":
    "[warm] Hard spelling doesn't stop a thief, only a real answer does. Pick something only the real friend would know. Try again.",

  // skill 5 — read the dodge
  "/audio/wren/m07p-s5-learn.mp3":
    "[curious] When you send a check-question, watch exactly what comes back. The real friend answers it, and probably teases you for asking. [serious] A thief can't answer, so they DODGE, get annoyed, and push harder, 'no time for games, just send it!'. That dodge is the whole con, handed to you.",
  "/audio/wren/m07p-s5-ok.mp3":
    "[excited] Caught. The real Priya would've said 'Sir Nibbles, obviously' and laughed. This one can't answer, so it dodges and rushes instead. [proud] Case closed on that account.",
  "/audio/wren/m07p-s5-bad.mp3":
    "[warm] Stress doesn't stop you answering a one-word question about your own hamster. It dodged and pushed harder, that's the tell. Try again.",
  "/audio/wren/m07p-s5-bad2.mp3":
    "[warm] You can, actually. A dodge plus a rush, right after a simple check-question, is a thief every time. Try again.",
  "/audio/wren/m07p-s5-q2ok.mp3":
    "[proud] Caught. A real friend answers in a heartbeat and teases you for asking. A dodge plus 'hurry up' is the thief every time.",
  "/audio/wren/m07p-s5-q2bad.mp3":
    "[warm] Too busy for a one-line answer, but not too busy to demand a code? That's a dodge, not a friend. Try again.",
  "/audio/wren/m07p-s5-q2bad2.mp3":
    "[warm] Look again, they never answered the question at all. They changed the subject and rushed you, that's the dodge. Try again.",
  "/audio/wren/m07p-s5-q3ok.mp3":
    "[proud] That's the real one. They answer, they laugh, they carry on. No dodge, no rush.",
  "/audio/wren/m07p-s5-q3bad.mp3":
    "[warm] That's a dodge and a rush stacked together, the thief's move. The real friend simply answers. Try again.",
  "/audio/wren/m07p-s5-q3bad2.mp3":
    "[warm] That dodges the question and pushes for the code, classic thief. The real friend would just tell you the answer. Try again.",

  // skill 6 — know MIMIC's play
  "/audio/wren/m07p-s6-learn.mp3":
    "[serious] Step back and see MIMIC's whole play, because it's always the same four moves in the same order. First, steal a real account. Second, wear the friendship, spend the trust that account already earned. Third, make the weird ask. Fourth, rush you past every check. [determined] Learn that shape, and a stolen face can't fool you.",
  "/audio/wren/m07p-s6-ok.mp3":
    "[proud] That's the play, start to finish. Steal, wear, ask, rush. Spot which move you're in, and you always know what's coming next.",
  "/audio/wren/m07p-s6-bad.mp3":
    "[warm] They can't make the ask before they've stolen the account, there's no face to hide behind yet. The theft comes first. Try again.",
  "/audio/wren/m07p-s6-bad2.mp3":
    "[warm] Close, but you can't wear a friendship you haven't stolen yet. Stealing the account is always move one. Try again.",
  "/audio/wren/m07p-s6-q2ok.mp3":
    "[proud] That's it. Before any weird ask, MIMIC leans on the friendship the stolen account already built. Move two, every time.",
  "/audio/wren/m07p-s6-q2bad.mp3":
    "[warm] The theft already happened, that's how they're inside the account. This message is them cashing in the friendship. Try again.",
  "/audio/wren/m07p-s6-q2bad2.mp3":
    "[warm] Not yet, they only hint at 'a tiny favour'. This is the trust warm-up that comes just before the ask. Try again.",
  "/audio/wren/m07p-s6-q3ok.mp3":
    "[proud] Right. After the weird ask comes the rush, hurrying you so you never verify. Knowing the order means you see it coming.",
  "/audio/wren/m07p-s6-q3bad.mp3":
    "[warm] That was move one, long before the ask. After the ask comes the rush to stop you checking. Try again.",
  "/audio/wren/m07p-s6-q3bad2.mp3":
    "[warm] That happened before the ask, not after. Once the ask is out, MIMIC rushes you past your checks. Try again.",

  // skill 7 — protect and warn
  "/audio/wren/m07p-s7-learn.mp3":
    "[warm] Last skill, what to actually DO. You never hand over the code or the money, ever, not even if you're only ninety-nine percent sure it's a thief. You verify another way. [encouraging] And here's the kind part, if a friend's account is stolen, they're a victim too. So warn the REAL them on another channel, help them lock it back down, and tell an adult. You're not telling tales, you're a rescue.",
  "/audio/wren/m07p-s7-ok.mp3":
    "[proud] Perfect. Nothing handed over, the real friend warned on a safe channel, and an adult looped in so the account gets recovered. That's the whole rescue, done right.",
  "/audio/wren/m07p-s7-bad.mp3":
    "[warm] Being 'polite' to a thief costs you your account. A real friend will thank you for checking. Never send the code. Try again.",
  "/audio/wren/m07p-s7-bad2.mp3":
    "[warm] Arguing just keeps you talking to them and gives nothing away for free. Don't debate a thief, step out and warn the real friend. Try again.",
  "/audio/wren/m07p-s7-q2ok.mp3":
    "[proud] Exactly. 'Keep it secret' is the thief's tell, so do the opposite, hand over nothing and loop in an adult.",
  "/audio/wren/m07p-s7-q2bad.mp3":
    "[warm] Secrecy is exactly what a thief wants. You never send the code, and you always tell an adult. Try again.",
  "/audio/wren/m07p-s7-q2bad2.mp3":
    "[warm] Deleting them hides the evidence and helps the thief. Keep them, send nothing, and show an adult. Try again.",
  "/audio/wren/m07p-s7-q3ok.mp3":
    "[proud] Perfect. Your friend is a victim too. Reaching the real them on a safe channel is a rescue, not telling tales.",
  "/audio/wren/m07p-s7-q3bad.mp3":
    "[warm] It kind of is, your friend's been robbed and doesn't know. Warn the real them another way so they can recover it. Try again.",
  "/audio/wren/m07p-s7-q3bad2.mp3":
    "[warm] That only warns the thief holding the chat. Reach the real friend on a different channel instead. Try again.",

  // boss — "Two Best Friends"
  "/audio/wren/m07p-boss-intro.mp3":
    "[serious] This is it, Agent. Two of your best friends just messaged at once, and one of these accounts has been stolen. No hints from me now. [determined] Spot the weird ask, run your check-question, read the reply, and tell the real friend from the thief. Go.",
  "/audio/wren/m07p-boss-win.mp3":
    "[excited] That's a flawless run, Agent. You spotted the weird ask, ran your check-question, caught the dodge, and told the real friend from the thief, all on your own. [proud] You helped Priya, you warned the real Jordan, and you never once sent a code from your own phone. MIMIC doesn't get to wear a face around you.",

  // test — "Prove it"
  "/audio/wren/m07p-test-intro.mp3":
    "[serious] Last thing before I close the case, the test. A fresh batch you haven't seen, no hints, and you'll need most of them right. [determined] Take everything you learned about stolen faces, and think. [excited] Ready?",
  "/audio/wren/m07p-test-pass.mp3":
    "[excited] Yes. Six new tricks and a stolen face didn't fool you once. [proud] Case closed, Agent. You've earned it.",
  "/audio/wren/m07p-test-fail.mp3":
    "[warm] So close. Don't sweat it. Even pros miss a couple. [encouraging] Take a breath and run it again. You know this.",

  // debrief
  "/audio/wren/m07p-debrief.mp3":
    "[proud] You saw through the mask.",
};
