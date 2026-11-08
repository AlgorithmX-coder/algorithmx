/**
 * WREN's spoken scripts for Case 010 ("The Voice", Block 2 finale). See
 * mission01.mjs and mission06.mjs for conventions. test.passVoice/
 * failVoice have no text field in case10.ts — recovered by transcription.
 * Both are block-finale variants ("Secret clearance", "this one really
 * matters"), not the generic template reused by Cases 6-9.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress. Villains are "he"; Mum is capitalised when used as a name.
 */
export const mission10VoiceScripts = {
  "/audio/wren/m10p-recap.mp3":
    "[warm] Previously on Cyber Explorers, SIREN played the long game, with weeks of trust before the real ask ever showed up. You learned to spot the pattern, even when it moves slowly. Today, your phone rings. The voice on the other end sounds exactly like someone you'd trust.",
  "/audio/wren/m10p-open-1.mp3":
    "[serious] This is the last case of the block, Agent, and MIMIC has saved his scariest trick for the end. He can clone a voice.",
  "/audio/wren/m10p-open-2.mp3":
    "[serious] This isn't a typed message. It's an actual voice. A few seconds of someone talking, grabbed from a video online, is enough for a machine to copy them. It could be your mum or your best friend. MIMIC can make their voice say anything.",
  "/audio/wren/m10p-open-3.mp3":
    "[serious] You'll learn seven skills to stay safe when you can't even trust your own ears. Then you'll face a boss and a test to earn your Secret clearance. This is the big one.",

  // skill 1 — the cloned voice
  "/audio/wren/m10p-s1-learn.mp3":
    "[warm] Here's the scariest trick of all. MIMIC can now clone a voice. A few seconds of someone talking, grabbed from a video or a voice note online, is enough for a machine to copy them exactly. It could be your mum, your best friend, or your brother. A scammer can make their voice say anything at all. So from this moment on, hearing a familiar voice is not proof it's really them.",
  "/audio/wren/m10p-s1-ok.mp3":
    "[warm] That's all four tagged. Saying it's Mum is the claim. Calling it a quick one is the rush. The bank code is the real ask, and promising to explain later dodges any question. The voice sounds right. Everything else about this message doesn't.",
  "/audio/wren/m10p-s1-q2ok.mp3":
    "[warm] Right. Your friend never had to send anyone their voice. A clip from any post is plenty. That's all a machine needs to copy them.",
  "/audio/wren/m10p-s1-q2bad.mp3":
    "[warm] Nope. A few seconds is enough now, not hours. One short clip online can do it. Try again.",
  "/audio/wren/m10p-s1-q2bad2.mp3":
    "[warm] They never had to hand it over. Anything they've posted can be grabbed by anyone, without them ever knowing. Try again.",
  "/audio/wren/m10p-s1-q3ok.mp3":
    "[warm] Exactly. If a voice exists as a recording anywhere, it can be cloned, even the voices of the people you love most. That's why the voice alone can never be your proof.",
  "/audio/wren/m10p-s1-q3bad.mp3":
    "[warm] It's not just them. A short clip of anyone will do. Ordinary voices get cloned all the time. Try again.",
  "/audio/wren/m10p-s1-q3bad2.mp3":
    "[warm] One voice note or video from a family member is enough. Being family doesn't make a voice safe to trust. Try again.",

  // skill 2 — why spotting won't save you
  "/audio/wren/m10p-s2-learn.mp3":
    "[warm] Now, you might think you'll just learn to spot the fakes. And right now, deepfakes do have tells. A cloned voice can sound a bit flat, pause oddly, or struggle with big emotion. A fake video might blink strangely. But here's the trap. Those tells are vanishing, fast. Every month the fakes get better. So if your whole defence is spotting the tell, one day soon it simply won't work. We need something that lasts.",
  "/audio/wren/m10p-s2-ok.mp3":
    "[warm] Yes. You can't win a spotting contest against a machine that keeps improving. You'd lose eventually. So we stop playing that game entirely, and use a defence the fake can't beat, no matter how good it gets.",
  "/audio/wren/m10p-s2-bad.mp3":
    "[warm] Even an expert loses this race, because the tells you learn today are gone next month. You need a defence that doesn't depend on spotting at all. Try again.",
  "/audio/wren/m10p-s2-bad2.mp3":
    "[warm] That's the opposite of safe. Looking good is exactly what a deepfake does. Don't judge by how it looks. Try again.",
  "/audio/wren/m10p-s2-q2ok.mp3":
    "[warm] Right. What looks glitchy today looks perfect next month. If your whole defence is catching the glitch, you lose the second the fakes improve.",
  "/audio/wren/m10p-s2-q2bad.mp3":
    "[warm] Not for long. The glitches are vanishing fast. Soon a fake won't glitch at all. Try again.",
  "/audio/wren/m10p-s2-q2bad2.mp3":
    "[warm] A smooth video isn't proof. That's exactly what a good deepfake looks like. Don't judge it by the glitches. Try again.",
  "/audio/wren/m10p-s2-q3ok.mp3":
    "[warm] Exactly. The blink and the odd pause are both disappearing, month by month. A defence built on tells has a very short shelf life.",
  "/audio/wren/m10p-s2-q3bad.mp3":
    "[warm] It used to, but not for much longer. Betting on one tell is betting on a race you'll lose. Try again.",
  "/audio/wren/m10p-s2-q3bad2.mp3":
    "[warm] Checking harder won't help once the tell is gone. You need a defence that doesn't depend on spotting at all. Try again.",

  // skill 3 — verify, don't spot
  "/audio/wren/m10p-s3-learn.mp3":
    "[warm] So here's the defence that lasts, and you already know it. Verify by source, not by how it looks or sounds. Don't fight a spot-the-fake contest against a machine, because you'll lose. Instead, prove who it really is in a different way. If Mum calls asking for something urgent, you hang up and call Mum back on her real number. The machine can fake her voice all day. It cannot answer her phone.",
  "/audio/wren/m10p-s3-ok.mp3":
    "[warm] That's it. A clone can copy his voice, but it can't pick up when you ring his actual phone. And if your real brother answers, confused, you've caught the fake. Verify the source, and ignore the voice.",
  "/audio/wren/m10p-s3-bad.mp3":
    "[warm] The fear is the weapon. It's there to rush you past checking. And asking you not to tell Mum is a huge flag. Never send it on the voice alone. Try again.",
  "/audio/wren/m10p-s3-bad2.mp3":
    "[warm] A clone will happily prove it in his exact voice, and that's the trap. Don't ask the caller. Check on a channel they can't fake. Try again.",
  "/audio/wren/m10p-s3-q2ok.mp3":
    "[warm] That's it. A clone loves a broken-phone excuse, because it kills your check. So use a channel it can't touch, like her real number or someone who's with her.",
  "/audio/wren/m10p-s3-q2bad.mp3":
    "[warm] That excuse is doing a lot of work. It exists to stop you checking. Verify another way before you trust it. Try again.",
  "/audio/wren/m10p-s3-q2bad2.mp3":
    "[warm] A clone will prove it in her exact voice all day. Don't ask the caller. Check on a channel they can't fake. Try again.",
  "/audio/wren/m10p-s3-q3ok.mp3":
    "[warm] Spot on. The thing that would expose a clone is exactly the thing it's trying to stop you doing. That's your signal to verify, not to trust.",
  "/audio/wren/m10p-s3-q3bad.mp3":
    "[warm] Maybe, but a real person can be reached some other way. Blocking every check is the flag here. Try again.",
  "/audio/wren/m10p-s3-q3bad2.mp3":
    "[warm] Listening harder is spotting, and spotting loses. Verify the person on a channel they can't fake instead. Try again.",

  // skill 4 — the family code word
  "/audio/wren/m10p-s4-learn.mp3":
    "[warm] Here's one of the most valuable things in this whole course. It's a family code word, a secret word your family agrees together, and only you lot know it. Then, if anyone ever calls or messages in a panic, saying they're family and needing money or help fast, you ask for the code word. Real family knows it instantly. A cloned voice has no idea. It's out-of-band verification, made simple enough to use in a scary moment.",
  "/audio/wren/m10p-s4-ok.mp3":
    "[warm] Perfect. Random and silly means no scammer could ever guess it, and no clone could find it online. Your family will remember it, but a machine never will. That word is your family's superpower.",
  "/audio/wren/m10p-s4-bad.mp3":
    "[warm] Your surname is on a hundred forms and profiles, so anyone can find it. A code word has to be secret and unguessable. Try again.",
  "/audio/wren/m10p-s4-bad2.mp3":
    "[warm] Your street is public and easy to look up. The code word must be something only your family would ever know. Try again.",
  "/audio/wren/m10p-s4-q2ok.mp3":
    "[warm] Perfect. Real Mum says it straight back. A clone has no idea what it is. Ask one question, and the whole trick falls apart.",
  "/audio/wren/m10p-s4-q2bad.mp3":
    "[warm] The voice is the one thing a clone can copy. That's exactly why you have a code word, so use it. Try again.",
  "/audio/wren/m10p-s4-q2bad2.mp3":
    "[warm] Never send the word to them, because that hands it to a scammer. They say it to you, not the other way round. Try again.",
  "/audio/wren/m10p-s4-q3ok.mp3":
    "[warm] Exactly. The clone can nail the voice but not the secret. The word is knowledge, and knowledge is the one thing it can't copy.",
  "/audio/wren/m10p-s4-q3bad.mp3":
    "[warm] It can say any word. It just doesn't know the right one. It's about the secret, not the speaking. Try again.",
  "/audio/wren/m10p-s4-q3bad2.mp3":
    "[warm] A code word doesn't protect your voice. It proves the person. That's what beats the clone. Try again.",

  // skill 5 — predict the clone's ask
  "/audio/wren/m10p-s5-learn.mp3":
    "[warm] Now predict what a cloned-voice emergency is really after. It's nearly always the same shape. There's a panic, then a rush, then money, a code or an action, right now, before you can think or check. The voice says it's in trouble, begs you not to tell anyone, and tells you to send it quick. So the second a familiar voice puts panic, urgency and a payment together, that's your cue, not to act, but to stop and verify.",
  "/audio/wren/m10p-s5-ok.mp3":
    "[warm] You saw it coming. There's panic and no time, and it's steering straight at money or a code. Now that you've predicted the ask, it can't ambush you. You already know to stop and verify.",
  "/audio/wren/m10p-s5-bad.mp3":
    "[warm] Nobody opens a normal call by saying there's been an accident and they can't talk long. That's an emergency setup, and it's heading for an ask. Try again.",
  "/audio/wren/m10p-s5-bad2.mp3":
    "[warm] The whole point is the opposite. It wants to rush you so you can't check. It's about to demand something fast. Try again.",
  "/audio/wren/m10p-s5-q2ok.mp3":
    "[warm] You called it. Gift card numbers are just money in disguise, and telling you to be quick and not ask questions is the rush. It's the same shape every time.",
  "/audio/wren/m10p-s5-q2bad.mp3":
    "[warm] This favour is cash, in a rush, with no questions allowed. That's the ask, dressed up. Try again.",
  "/audio/wren/m10p-s5-q2bad2.mp3":
    "[warm] It's the opposite. This call is built to stop you checking, and it's steering hard at a payment. Try again.",
  "/audio/wren/m10p-s5-q3ok.mp3":
    "[warm] Exactly. First comes panic, then no time, then the ask. It's always that shape. Seeing it coming is what stops it working.",
  "/audio/wren/m10p-s5-q3bad.mp3":
    "[warm] Panic and no time are never calm. Something urgent is about to be demanded. Try again.",
  "/audio/wren/m10p-s5-q3bad2.mp3":
    "[warm] This shape doesn't give. It takes. An ask is coming, not an offer. Try again.",

  // skill 6 — know MIMIC's play
  "/audio/wren/m10p-s6-learn.mp3":
    "[warm] Here's MIMIC's voice play. It has four moves, always in order. First, he scrapes a few seconds of the voice from a video or voice note online. Second, he clones it with a machine. Third, he fakes an emergency in that voice. Fourth, he rushes you for money or a code before you can check. And notice this, Agent. To pull it off, MIMIC needed audio someone had scraped and a script someone had written. These villains are not working alone. Put that in your dossier.",
  "/audio/wren/m10p-s6-ok.mp3":
    "[warm] That's the play. It goes scrape, clone, panic, rush. And remember, the scraped audio and the script mean MIMIC has help. That's six villains and one supply chain. The dossier's filling in.",
  "/audio/wren/m10p-s6-bad.mp3":
    "[warm] MIMIC can't fake an emergency in a voice he hasn't cloned yet. Scraping the voice comes first. Try again.",
  "/audio/wren/m10p-s6-bad2.mp3":
    "[warm] You can't clone a voice before you've scraped it. Getting the audio is always move one. Try again.",
  "/audio/wren/m10p-s6-q2ok.mp3":
    "[warm] Right. By the time you hear the panic, the scraping and cloning have already happened offstage. This is move four, the push.",
  "/audio/wren/m10p-s6-q2bad.mp3":
    "[warm] Scraping happened quietly, long before this call. What you're hearing is the final rush. Try again.",
  "/audio/wren/m10p-s6-q2bad2.mp3":
    "[warm] It's the whole point of the play, the rush for money. That's move four. Try again.",
  "/audio/wren/m10p-s6-q3ok.mp3":
    "[warm] Exactly. Someone scraped the audio, and someone wrote the script. It's a supply chain, and it goes straight in your dossier.",
  "/audio/wren/m10p-s6-q3bad.mp3":
    "[warm] The scraped audio and the script came from others. MIMIC had help. Try again.",
  "/audio/wren/m10p-s6-q3bad2.mp3":
    "[warm] They're the fuel for the whole thing, and they show MIMIC has a team. That matters a lot. Try again.",

  // skill 7 — stay calm, run the protocol
  "/audio/wren/m10p-s7-learn.mp3":
    "[warm] This is the last skill of the block. A fake emergency is designed to panic you, because a panicking brain doesn't check. So the skill is to slow down on purpose. Take a breath. Hang up if you need to. Call back on the number you already know. Ask for the code word. And always get a trusted adult involved. Here's the calming truth. A real emergency survives a two-minute check. A scam does not.",
  "/audio/wren/m10p-s7-ok.mp3":
    "[warm] Perfect. You slowed down, went to the number you trust, and looped in an adult. If it's real, Mum's fine and grateful you checked. If it's a clone, you just beat it cold. That's the whole protocol.",
  "/audio/wren/m10p-s7-bad.mp3":
    "[warm] The terror is the trick. It's built to switch off your checking. Real Mum survives a two-minute call-back. Don't send on the voice alone. Try again.",
  "/audio/wren/m10p-s7-bad2.mp3":
    "[warm] Staying on their line is staying in their control. Hang up, call the real number, and tell an adult. That's what beats a clone. Try again.",
  "/audio/wren/m10p-s7-q2ok.mp3":
    "[warm] Exactly. As long as you're on their call, they're steering you. Hang up, ring the number you know, and you take control back.",
  "/audio/wren/m10p-s7-q2bad.mp3":
    "[warm] If it's really her, she'll completely understand a call-back. Begging you not to hang up is the trap, not manners. Try again.",
  "/audio/wren/m10p-s7-q2bad2.mp3":
    "[warm] Staying on the line is staying under their control. Hang up and verify. That's the play. Try again.",
  "/audio/wren/m10p-s7-q3ok.mp3":
    "[warm] That's the one to remember. Checking never hurts a real emergency, but it stops a scam cold. So you can always take the two minutes.",
  "/audio/wren/m10p-s7-q3bad.mp3":
    "[warm] Real help survives a quick call-back just fine. That pressure to act right now is the scam talking. Try again.",
  "/audio/wren/m10p-s7-q3bad2.mp3":
    "[warm] It doesn't. A real one holds up to a check. Slowing down only ever costs the scammer. Try again.",

  // boss — "Caller ID"
  "/audio/wren/m10p-boss-intro.mp3":
    "[determined] This is it, Agent, the last case of the block. Your phone's ringing, and it's a voice you love, in a real panic. Everything in you will want to just help. But you know the trick now. Stay calm, run your protocol, and don't let a machine wearing a voice rush you. Answer it.",
  "/audio/wren/m10p-boss-win.mp3":
    "[proud] That was a perfect run, and what a way to finish the block. You heard a voice that sounded exactly like your mum, with what sounded like a real emergency and real panic. And you didn't send a thing. You stayed calm, you asked for the code word, and when the clone couldn't give it, you hung up and called your real mum. A machine can fake a voice. It can never answer her phone, or know your family's secret word. You just beat the scariest trick MIMIC has.",

  // test — "Prove it" (block-finale variant, own wording)
  "/audio/wren/m10p-test-intro.mp3":
    "[warm] There's one last thing before I close the case and give you your Secret clearance, and that's the test. It's a fresh set with no hints, and you'll need most of them right. This earns your promotion, so take your time and think. Ready?",
  // owner 2026-11-08: test-pass wording stays (Cases 6, 7, 8 and 10)
  "/audio/wren/m10p-test-pass.mp3":
    "[proud] Yes! You cleared the whole Human Factor block without a single slip. Secret clearance, Agent, you've truly earned it. I'm proud of you.",
  "/audio/wren/m10p-test-fail.mp3":
    "[warm] That was so close, and this one really matters. Don't sweat it. Even pros miss a couple. Take a breath and run it again. You've got this.",

  // debrief
  "/audio/wren/m10p-debrief.mp3":
    "[proud] You've earned your Secret clearance.",
};
