/**
 * WREN's spoken scripts for Case 007 ("Borrowed Faces"). See mission01.mjs
 * and mission06.mjs for conventions. test.passVoice/failVoice have no text
 * field in case07.ts, recovered here by transcription, and are spoken only.
 * The fail line is the same generic template as Case 6's, each with its own
 * recording.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress. Test-pass wording kept as it was (owner decision 3). Skill 5's
 * check question is now the supply-teacher inside joke (owner decision 4).
 */
export const mission07VoiceScripts = {
  "/audio/wren/m07p-recap.mp3":
    "[warm] Previously on Cyber Explorers, SIREN tried to rush you, scare you, and guilt you into clicking. He stacked one feeling on another until you weren't thinking straight. You learned to name every lever as it's pulled, and to walk away clean. Today, a friend's account messages you. But is it really them?",
  "/audio/wren/m07p-open-1.mp3":
    "[serious] Here's the next case, Agent, and a new kind of enemy. His name is MIMIC, and MIMIC doesn't send you a dodgy link.",
  "/audio/wren/m07p-open-2.mp3":
    "[serious] MIMIC steals a real account from one of your actual friends, and wears it like a mask. It has the same name, the same photo, and every chat you've ever had. So the message really is from your friend's account. That's what makes it so dangerous.",
  "/audio/wren/m07p-open-3.mp3":
    "[serious] You'll learn seven skills to tell a friend from a thief wearing their face, then take on a boss and a test. Let's make you unfoolable.",

  // skill 1 — trust doesn't transfer
  "/audio/wren/m07p-s1-learn.mp3":
    "[warm] Here's MIMIC's whole trick. When an account gets stolen, the thief inherits everything, from the name and the photo to every chat you two ever had. So the account is real, but the person typing might not be your friend. Trust belongs to your friend, not to the account, and a thief can hold the account. Watch.",
  "/audio/wren/m07p-s1-ok.mp3":
    "[warm] Exactly. It doesn't matter how friendly it is or that it's really her account. The moment a so-called friend asks for something only a thief would want, that's your flag. The ask gives it away, not the tone.",
  "/audio/wren/m07p-s1-bad.mp3":
    "[warm] That's a small nudge, but not the real tell. Look at what she's actually asking you to hand over. Try again.",
  "/audio/wren/m07p-s1-bad2.mp3":
    "[warm] Emojis prove nothing, because thieves use them too. Look at the ask itself, not the decoration. Try again.",
  "/audio/wren/m07p-s1-q2ok.mp3":
    "[warm] Right. The account being real proves nothing. A real friend never asks for your password, so the ask tells you it's a thief.",
  "/audio/wren/m07p-s1-q2bad.mp3":
    "[warm] A thief inherits every old chat the moment they steal the account. Old messages prove the account, not the person. Try again.",
  "/audio/wren/m07p-s1-q2bad2.mp3":
    "[warm] Anyone can tell you to trust them, a thief most of all. Trust is earned by the person, not claimed in a message. Try again.",
  "/audio/wren/m07p-s1-q3ok.mp3":
    "[warm] Exactly. A stolen account keeps the real name, photo and chats, but a thief is holding it now. It's the real account, but the wrong person.",
  "/audio/wren/m07p-s1-q3bad.mp3":
    "[warm] That's the exact trap. A stolen account is real but held by a thief. The account being real proves nothing. Try again.",
  "/audio/wren/m07p-s1-q3bad2.mp3":
    "[warm] The photo stays the same, and that's what makes it dangerous. You judge by the ask, never the picture. Try again.",

  // skill 2 — the weird ask
  "/audio/wren/m07p-s2-learn.mp3":
    "[warm] So how do you tell a friend from a thief wearing their face? It's not by how nice they are, because a thief can be lovely. You tell them apart by the ask. Real friends don't suddenly need your password, a code from your phone, gift cards, or for you to keep it all secret. When the ask gets weird, the friendly face stops mattering.",
  "/audio/wren/m07p-s2-ok.mp3":
    "[warm] You tagged all three. There's money you can't easily get back, and a rush so you don't think. Then there's keeping it from an adult, which is a flag on its own. Any one of those from a friend is odd. All three together is a thief.",
  "/audio/wren/m07p-s2-q2ok.mp3":
    "[warm] Spot on. A code sent to your phone protects your account, never hers. A real friend would never need it.",
  "/audio/wren/m07p-s2-q2bad.mp3":
    "[warm] Codes don't wander off to the wrong phone by accident, and a real friend wouldn't ask for yours. That ask doesn't fit. Try again.",
  "/audio/wren/m07p-s2-q2bad2.mp3":
    "[warm] The emoji is just dressing. The weird bit is asking for a code off your phone. Look at the ask itself. Try again.",
  "/audio/wren/m07p-s2-q3ok.mp3":
    "[warm] That's the one. Money plus secrecy is the classic weird ask, and a real friend needs neither from you.",
  "/audio/wren/m07p-s2-q3bad.mp3":
    "[warm] That's a totally normal favour, nothing odd about it. Look for the ask that doesn't fit a real friend. Try again.",
  "/audio/wren/m07p-s2-q3bad2.mp3":
    "[warm] That's just a friend being a friend. There's no code, no money, and no secrecy. Keep looking for the odd one. Try again.",

  // skill 3 — verify another channel
  "/audio/wren/m07p-s3-learn.mp3":
    "[warm] Here's the most important habit in this whole block, and it has a fancy name, out-of-band verification. It's a simple idea. If a friend's message feels off, check them a different way from the one the message came in. If they DM you, call them, or ask in person. Never check on the same app a thief might be holding, because they'll just tell you it's them.",
  "/audio/wren/m07p-s3-ok.mp3":
    "[warm] That's it. You picked a different channel, one a thief can't reach. If the real Priya answers, confused, you've caught them. If the Priya in the chat is a thief, they never wanted you to make that call.",
  "/audio/wren/m07p-s3-bad.mp3":
    "[warm] That's the same channel the thief controls, so of course they'll say yes. You have to step outside the chat. Try again.",
  "/audio/wren/m07p-s3-bad2.mp3":
    "[warm] The upset is the weapon, and it's there to rush you. That code unlocks your account, not hers. Never send it. Try again.",
  "/audio/wren/m07p-s3-q2ok.mp3":
    "[warm] Yes. The one telling you not to check elsewhere is exactly who you should check on. Step outside this chat.",
  "/audio/wren/m07p-s3-q2bad.mp3":
    "[warm] This chat is the one channel a thief controls. Telling you there's no need to call is a thief's favourite line. Verify a different way. Try again.",
  "/audio/wren/m07p-s3-q2bad2.mp3":
    "[warm] That code unlocks your account, not hers, and the rush is the trap. Never send it. Check her another way first. Try again.",
  "/audio/wren/m07p-s3-q3ok.mp3":
    "[warm] Exactly. Whoever controls the chat controls the answer. A different channel is one the thief can't reach.",
  "/audio/wren/m07p-s3-q3bad.mp3":
    "[warm] It's not about speed. It's that the thief runs this chat and will lie in it. You need a channel they don't hold. Try again.",
  "/audio/wren/m07p-s3-q3bad2.mp3":
    "[warm] That's the trap. Asking in the same chat lets the thief just say yes. Always step outside it. Try again.",

  // skill 4 — the check-question
  "/audio/wren/m07p-s4-learn.mp3":
    "[warm] You can't always call. So your second tool is a check-question, something only the real them would know. Don't use their birthday or their dog's name, because those are on their profile for anyone to read. Pick an inside joke, a shared memory, or where you sat on your first day. If they can't answer it, it isn't them.",
  "/audio/wren/m07p-s4-ok.mp3":
    "[warm] Perfect. That's an inside thing a thief could never find on a profile. The real Priya answers in a second. A thief has no idea.",
  "/audio/wren/m07p-s4-bad.mp3":
    "[warm] A birthday is on her profile and half the internet. A thief can just look it up. Pick something only you two would know. Try again.",
  "/audio/wren/m07p-s4-bad2.mp3":
    "[warm] Her dog's name is probably in a dozen photos she's posted. It's too easy to find. Go for a private, shared memory instead. Try again.",
  "/audio/wren/m07p-s4-q2ok.mp3":
    "[warm] Perfect. That's a private memory only the two of you share. A thief reading her profile has no way to know it.",
  "/audio/wren/m07p-s4-q2bad.mp3":
    "[warm] Her username is right there on the account for anyone to read. That tests nothing. Pick a shared secret instead. Try again.",
  "/audio/wren/m07p-s4-q2bad2.mp3":
    "[warm] Her school is easy to find and probably on her profile. A thief could answer that. Go private and personal. Try again.",
  "/audio/wren/m07p-s4-q3ok.mp3":
    "[warm] Right. Inside jokes and shared memories live only between you two. Nothing on a profile can leak them.",
  "/audio/wren/m07p-s4-q3bad.mp3":
    "[warm] Profile facts are the worst kind, because a thief just reads them off. Go for something private instead. Try again.",
  "/audio/wren/m07p-s4-q3bad2.mp3":
    "[warm] Hard spelling doesn't stop a thief. Only a real answer does. Pick something only the real friend would know. Try again.",

  // skill 5 — read the dodge
  "/audio/wren/m07p-s5-learn.mp3":
    "[warm] When you send a check-question, watch exactly what comes back. The real friend answers it, and probably teases you for asking. A thief can't answer, so they dodge, get annoyed, and push harder. They'll say there's no time for games, and you should just send it. That dodge is the whole con, handed to you.",
  "/audio/wren/m07p-s5-ok.mp3":
    "[warm] You caught it. The real Priya would have laughed and said The Brainy Badgers, obviously. This one can't answer, so it dodges and rushes instead. You can close the case on that account.",
  "/audio/wren/m07p-s5-bad.mp3":
    "[warm] Stress doesn't stop you answering a simple question about a team name you both made up. It dodged and pushed harder, and that's the tell. Try again.",
  "/audio/wren/m07p-s5-bad2.mp3":
    "[warm] You can, actually. A dodge plus a rush, right after a simple check-question, is a thief every time. Try again.",
  "/audio/wren/m07p-s5-q2ok.mp3":
    "[warm] You caught it. A real friend answers in a heartbeat and teases you for asking. A dodge plus a hurry-up is the thief every time.",
  "/audio/wren/m07p-s5-q2bad.mp3":
    "[warm] They're too busy for a one-line answer, but not too busy to demand a code? That's a dodge, not a friend. Try again.",
  "/audio/wren/m07p-s5-q2bad2.mp3":
    "[warm] Look again. They never answered the question at all. They changed the subject and rushed you, and that's the dodge. Try again.",
  "/audio/wren/m07p-s5-q3ok.mp3":
    "[warm] That's the real one. They answer, they laugh, they carry on. There's no dodge and no rush.",
  "/audio/wren/m07p-s5-q3bad.mp3":
    "[warm] That's a dodge and a rush stacked together, the thief's move. The real friend simply answers. Try again.",
  "/audio/wren/m07p-s5-q3bad2.mp3":
    "[warm] That dodges the question and pushes for the code, which is a classic thief move. The real friend would just tell you the answer. Try again.",

  // skill 6 — know MIMIC's play
  "/audio/wren/m07p-s6-learn.mp3":
    "[warm] Step back and see MIMIC's whole play, because it's always the same four moves in the same order. First, steal a real account. Second, wear the friendship, and spend the trust that account already earned. Third, make the weird ask. Fourth, rush you past every check. Learn that shape, and a stolen face can't fool you.",
  "/audio/wren/m07p-s6-ok.mp3":
    "[warm] That's the play, start to finish. It goes steal, wear, ask, then rush. Spot which move you're in, and you always know what's coming next.",
  "/audio/wren/m07p-s6-bad.mp3":
    "[warm] MIMIC can't make the ask before he's stolen the account, because there's no face to hide behind yet. The theft comes first. Try again.",
  "/audio/wren/m07p-s6-bad2.mp3":
    "[warm] That's close, but you can't wear a friendship you haven't stolen yet. Stealing the account is always move one. Try again.",
  "/audio/wren/m07p-s6-q2ok.mp3":
    "[warm] That's it. Before any weird ask, MIMIC leans on the friendship the stolen account already built. That's move two, every time.",
  "/audio/wren/m07p-s6-q2bad.mp3":
    "[warm] The theft already happened, and that's how he got inside the account. This message is him cashing in the friendship. Try again.",
  "/audio/wren/m07p-s6-q2bad2.mp3":
    "[warm] It's not the ask yet, because he only hints at a tiny favour. This is the trust warm-up that comes just before the ask. Try again.",
  "/audio/wren/m07p-s6-q3ok.mp3":
    "[warm] Right. After the weird ask comes the rush, hurrying you so you never verify. Knowing the order means you see it coming.",
  "/audio/wren/m07p-s6-q3bad.mp3":
    "[warm] That was move one, long before the ask. After the ask comes the rush to stop you checking. Try again.",
  "/audio/wren/m07p-s6-q3bad2.mp3":
    "[warm] That happened before the ask, not after. Once the ask is out, MIMIC rushes you past your checks. Try again.",

  // skill 7 — protect and warn
  "/audio/wren/m07p-s7-learn.mp3":
    "[warm] This is the last skill, and it's what to actually do. You never hand over the code or the money, ever, not even if you're ninety-nine percent sure it's really them. You verify another way. And here's the kind part. If a friend's account is stolen, they're a victim too. So warn the real them on another channel, help them lock it back down, and tell an adult. You're not telling tales. It's a rescue.",
  "/audio/wren/m07p-s7-ok.mp3":
    "[warm] Perfect. You handed nothing over, warned the real friend on a safe channel, and looped in an adult so the account gets recovered. That's the whole rescue, done right.",
  "/audio/wren/m07p-s7-bad.mp3":
    "[warm] Being polite to a thief costs you your account. A real friend will thank you for checking. Never send the code. Try again.",
  "/audio/wren/m07p-s7-bad2.mp3":
    "[warm] Arguing just keeps you talking to them, and it wins you nothing. Don't debate a thief. Step out and warn the real friend. Try again.",
  "/audio/wren/m07p-s7-q2ok.mp3":
    "[warm] Exactly. Asking you to keep it secret is the thief's tell, so do the opposite. Hand over nothing, and loop in an adult.",
  "/audio/wren/m07p-s7-q2bad.mp3":
    "[warm] Secrecy is exactly what a thief wants. You never send the code, and you always tell an adult. Try again.",
  "/audio/wren/m07p-s7-q2bad2.mp3":
    "[warm] Deleting them hides the evidence and helps the thief. Keep them, send nothing, and show an adult. Try again.",
  "/audio/wren/m07p-s7-q3ok.mp3":
    "[warm] Perfect. Your friend is a victim too. Reaching the real them on a safe channel is a rescue, not telling tales.",
  "/audio/wren/m07p-s7-q3bad.mp3":
    "[warm] It kind of is, because your friend's been robbed and doesn't know. Warn the real them another way so they can recover it. Try again.",
  "/audio/wren/m07p-s7-q3bad2.mp3":
    "[warm] That only warns the thief holding the chat. Reach the real friend on a different channel instead. Try again.",

  // boss — "Two Best Friends"
  "/audio/wren/m07p-boss-intro.mp3":
    "[determined] This is it, Agent. Two of your best friends just messaged at once, and one of these accounts has been stolen. There are no hints from me now. Spot the weird ask, run your check-question, read the reply, and tell the real friend from the thief. Go.",
  "/audio/wren/m07p-boss-win.mp3":
    "[proud] That's a flawless run, Agent. You spotted the weird ask, ran your check-question, caught the dodge, and told the real friend from the thief, all on your own. You helped Priya, you warned the real Jordan, and you never once sent a code from your own phone. MIMIC doesn't get to wear a face around you.",

  // test — "Prove it"
  "/audio/wren/m07p-test-intro.mp3":
    "[warm] There's one last thing before I close the case, and that's the test. It's a fresh batch you haven't seen, with no hints, and you'll need most of them right. Take everything you learned about stolen faces, and think. Ready?",
  "/audio/wren/m07p-test-pass.mp3":
    "[proud] Yes. Six new tricks and a stolen face didn't fool you once. Case closed, Agent. You've earned it.",
  "/audio/wren/m07p-test-fail.mp3":
    "[warm] That was so close, Agent. Don't sweat it, because even pros miss a couple. Take a breath and run it again. You know this.",

  // debrief: matches the screen title (the old take added "Agent. Well done.")
  "/audio/wren/m07p-debrief.mp3":
    "[proud] You saw through the mask.",
};
