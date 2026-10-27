/**
 * WREN's spoken scripts for Case 010 ("The Voice", Block 2 finale). See
 * mission01.mjs and mission06.mjs for conventions. test.passVoice/
 * failVoice have no text field in case10.ts — recovered by transcription.
 * Both are block-finale variants ("SECRET clearance", "this one really
 * matters"), not the generic template reused by Cases 6-9.
 */
export const mission10VoiceScripts = {
  "/audio/wren/m10p-recap.mp3":
    "[warm] Previously on Cyber Explorers... SIREN played the long game, weeks of trust before the real ask ever showed up. You learned to spot the pattern even when it moves slowly. [curious] Today, your phone rings. The voice on the other end sounds exactly like someone you'd trust.",
  "/audio/wren/m10p-open-1.mp3":
    "[serious] Last case of the block, Agent, and MIMIC has saved its scariest trick for the end. It can clone a voice.",
  "/audio/wren/m10p-open-2.mp3":
    "[concerned] Not a typed message, an actual voice. A few seconds of someone talking, grabbed from a video online, is enough for a machine to copy them. Your mum, your best friend. It can make their voice say anything.",
  "/audio/wren/m10p-open-3.mp3":
    "[determined] Seven skills to stay safe when you can't even trust your own ears, then a boss and a test to earn your SECRET clearance. This is the big one.",

  // skill 1 — the cloned voice
  "/audio/wren/m10p-s1-learn.mp3":
    "[serious] Here's the scariest trick of all. MIMIC can now clone a voice. A few seconds of someone talking, grabbed from a video or a voice note online, is enough for a machine to copy them exactly. Your mum, your best friend, your brother. A scammer can make their voice say anything at all. [determined] So from this moment on, hearing a familiar voice is not proof it's really them.",
  "/audio/wren/m10p-s1-ok.mp3":
    "[proud] All four, tagged. 'It's mum' is the claim, 'quick one' is the rush, the bank code is the real ask, and 'I'll explain later' dodges any question. The voice sounds right. Everything else about this message doesn't.",
  "/audio/wren/m10p-s1-q2ok.mp3":
    "[proud] Right. Your friend never had to send anyone their voice, a clip from any post is plenty. That's all a machine needs to copy them.",
  "/audio/wren/m10p-s1-q2bad.mp3":
    "[warm] Nope, a few seconds is enough now, not hours. One short clip online can do it. Try again.",
  "/audio/wren/m10p-s1-q2bad2.mp3":
    "[warm] They never had to. Anything they've posted can be grabbed by anyone, without them ever knowing. Try again.",
  "/audio/wren/m10p-s1-q3ok.mp3":
    "[proud] Exactly. If a voice exists as a recording anywhere, it can be cloned, even the people you love most. That's why the voice alone can never be your proof.",
  "/audio/wren/m10p-s1-q3bad.mp3":
    "[warm] Not just them, a short clip of anyone will do. Ordinary voices get cloned all the time. Try again.",
  "/audio/wren/m10p-s1-q3bad2.mp3":
    "[warm] One voice note or video from a family member is enough. Being family doesn't make a voice safe to trust. Try again.",

  // skill 2 — why spotting won't save you
  "/audio/wren/m10p-s2-learn.mp3":
    "[curious] Now, you might think, I'll just learn to spot the fakes. And right now deepfakes do have tells, a cloned voice can sound a bit flat, pause oddly, or struggle with big emotion, a fake video might blink strangely. [serious] But here's the trap, those tells are vanishing, fast. Every month the fakes get better. So if your whole defence is spotting the tell, one day soon it simply won't work. We need something that lasts.",
  "/audio/wren/m10p-s2-ok.mp3":
    "[encouraging] Yes. You can't win a spotting contest against a machine that keeps improving, you'd lose eventually. So we stop playing that game entirely, and use a defence the fake can't beat, no matter how good it gets.",
  "/audio/wren/m10p-s2-bad.mp3":
    "[warm] Even an expert loses this race, the tells you learn today are gone next month. You need a defence that doesn't depend on spotting at all. Try again.",
  "/audio/wren/m10p-s2-bad2.mp3":
    "[warm] That's the opposite of safe, looking good is exactly what a deepfake does. Don't judge by how it looks. Try again.",
  "/audio/wren/m10p-s2-q2ok.mp3":
    "[proud] Right. What looks glitchy today looks perfect next month. If your whole defence is catching the glitch, you lose the second the fakes improve.",
  "/audio/wren/m10p-s2-q2bad.mp3":
    "[warm] Not for long, the glitches are vanishing fast. Soon a fake won't glitch at all. Try again.",
  "/audio/wren/m10p-s2-q2bad2.mp3":
    "[warm] A smooth video isn't proof, that's exactly what a good deepfake looks like. Don't judge it by the glitches. Try again.",
  "/audio/wren/m10p-s2-q3ok.mp3":
    "[proud] Exactly. The blink, the odd pause, they're all disappearing month by month. A defence built on tells has a very short shelf life.",
  "/audio/wren/m10p-s2-q3bad.mp3":
    "[warm] It used to, but not for much longer. Betting on one tell is betting on a race you'll lose. Try again.",
  "/audio/wren/m10p-s2-q3bad2.mp3":
    "[warm] Checking harder won't help once the tell is gone. You need a defence that doesn't depend on spotting at all. Try again.",

  // skill 3 — verify, don't spot
  "/audio/wren/m10p-s3-learn.mp3":
    "[determined] So here's the defence that lasts, and you already know it. Verify by source, not by how it looks or sounds. Don't fight a spot-the-fake contest against a machine, you'll lose. Instead, prove who it really is, a different way. [warm] If mum calls asking for something urgent, you hang up and call mum back on her real number. The machine can fake her voice all day. It cannot answer her phone.",
  "/audio/wren/m10p-s3-ok.mp3":
    "[proud] That's it. A clone can copy his voice, but it can't pick up when you ring his actual phone. And if the real him answers, confused, you've caught the fake. Verify the source, ignore the voice.",
  "/audio/wren/m10p-s3-bad.mp3":
    "[concerned] The fear is the weapon, it's there to rush you past checking. And 'don't tell mum' is a huge flag. Never send it on the voice alone. Try again.",
  "/audio/wren/m10p-s3-bad2.mp3":
    "[warm] A clone will happily 'prove' it in his exact voice, that's the trap. Don't ask the caller, check on a channel they can't fake. Try again.",
  "/audio/wren/m10p-s3-q2ok.mp3":
    "[proud] That's it. A clone loves a broken-phone excuse, it kills your check. So use a channel it can't touch, her real number or someone who's with her.",
  "/audio/wren/m10p-s3-q2bad.mp3":
    "[warm] That excuse is doing a lot of work, it exists to stop you checking. Verify another way before you trust it. Try again.",
  "/audio/wren/m10p-s3-q2bad2.mp3":
    "[warm] A clone will 'prove' it in her exact voice all day. Don't ask the caller, check on a channel they can't fake. Try again.",
  "/audio/wren/m10p-s3-q3ok.mp3":
    "[proud] Spot on. The thing that would expose a clone is exactly the thing it's trying to stop you doing. That's your signal to verify, not to trust.",
  "/audio/wren/m10p-s3-q3bad.mp3":
    "[warm] Maybe, but a real person can be reached some other way. Blocking every check is the flag here. Try again.",
  "/audio/wren/m10p-s3-q3bad2.mp3":
    "[warm] Listening harder is spotting, and spotting loses. Verify the person on a channel they can't fake instead. Try again.",

  // skill 4 — the family code word
  "/audio/wren/m10p-s4-learn.mp3":
    "[warm] Here's the single most valuable thing in this whole course, a family code word. It's a secret word your family agrees together, and only you lot know it. [encouraging] Then, if anyone ever calls or messages in a panic, saying they're family and needing money or help fast, you ask for the code word. Real family knows it instantly. A cloned voice has no idea. It's out-of-band verification, made simple enough to use in a scary moment.",
  "/audio/wren/m10p-s4-ok.mp3":
    "[proud] Perfect. Random and silly means no scammer could ever guess it, and no clone could find it online. Your family will remember it, a machine never will. That word is your family's superpower.",
  "/audio/wren/m10p-s4-bad.mp3":
    "[warm] Your surname is on a hundred forms and profiles, anyone can find it. A code word has to be secret and unguessable. Try again.",
  "/audio/wren/m10p-s4-bad2.mp3":
    "[warm] Your street is public and easy to look up. The code word must be something only your family would ever know. Try again.",
  "/audio/wren/m10p-s4-q2ok.mp3":
    "[proud] Perfect. Real mum says it straight back. A clone has no idea what it is. One question, and the whole trick falls apart.",
  "/audio/wren/m10p-s4-q2bad.mp3":
    "[warm] The voice is the one thing a clone can copy. That's exactly why you have a code word, so use it. Try again.",
  "/audio/wren/m10p-s4-q2bad2.mp3":
    "[warm] Never send the word to them, that hands it to a scammer. They say it to you, not the other way round. Try again.",
  "/audio/wren/m10p-s4-q3ok.mp3":
    "[proud] Exactly. The clone can nail the voice but not the secret. The word is knowledge, and knowledge is the one thing it can't copy.",
  "/audio/wren/m10p-s4-q3bad.mp3":
    "[warm] It can say any word, it just doesn't know the right one. It's about the secret, not the speaking. Try again.",
  "/audio/wren/m10p-s4-q3bad2.mp3":
    "[warm] A code word doesn't protect your voice, it proves the person. That's what beats the clone. Try again.",

  // skill 5 — predict the clone's ask
  "/audio/wren/m10p-s5-learn.mp3":
    "[curious] Predict what a cloned-voice emergency is FOR. It's nearly always the same shape, a panic, then a rush, then money or a code or an action, right now, before you can think or check. I'm in trouble, don't tell anyone, just send it quick. [determined] So the second a familiar voice puts panic, urgency, and a payment together, that's your cue. Not to act, but to stop and verify.",
  "/audio/wren/m10p-s5-ok.mp3":
    "[proud] You saw it coming. Panic, no time, and it's steering straight at money or a code. Now that you've predicted the ask, it can't ambush you. You already know to stop and verify.",
  "/audio/wren/m10p-s5-bad.mp3":
    "[warm] Nobody opens a normal call with there's been an accident, I can't talk long. That's an emergency setup, and it's heading for an ask. Try again.",
  "/audio/wren/m10p-s5-bad2.mp3":
    "[warm] The whole point is the opposite, to rush you so you can't check. It's about to demand something fast. Try again.",
  "/audio/wren/m10p-s5-q2ok.mp3":
    "[proud] You called it. Gift card numbers are just money in disguise, and be quick, don't ask is the rush. Same shape every time.",
  "/audio/wren/m10p-s5-q2bad.mp3":
    "[warm] A favour that's cash, in a rush, with no questions allowed. That's the ask, dressed up. Try again.",
  "/audio/wren/m10p-s5-q2bad2.mp3":
    "[warm] The opposite, it's built to stop you checking. It's steering hard at a payment. Try again.",
  "/audio/wren/m10p-s5-q3ok.mp3":
    "[proud] Exactly. Panic, then no time, then the ask, it's always that shape. Seeing it coming is what stops it working.",
  "/audio/wren/m10p-s5-q3bad.mp3":
    "[warm] Panic and no time are never calm. Something urgent is about to be demanded. Try again.",
  "/audio/wren/m10p-s5-q3bad2.mp3":
    "[warm] This shape doesn't give, it takes. An ask is coming, not an offer. Try again.",

  // skill 6 — know MIMIC's play
  "/audio/wren/m10p-s6-learn.mp3":
    "[serious] MIMIC's voice play, four moves, always in order. First, scrape a few seconds of the voice, from a video or voice note online. Second, clone it with a machine. Third, fake an emergency in that voice. Fourth, rush you for money or a code before you can check. [curious] And Agent, notice this, to pull it off, MIMIC needed audio someone had scraped, and a script someone had written. These villains are not working alone. Put that in your dossier.",
  "/audio/wren/m10p-s6-ok.mp3":
    "[proud] That's the play. Scrape, clone, panic, rush. And remember, the scraped audio and the script mean MIMIC has help. Six villains, one supply chain. The dossier's filling in.",
  "/audio/wren/m10p-s6-bad.mp3":
    "[warm] It can't fake an emergency in a voice it hasn't cloned yet. Scraping the voice comes first. Try again.",
  "/audio/wren/m10p-s6-bad2.mp3":
    "[warm] You can't clone a voice before you've scraped it. Getting the audio is always move one. Try again.",
  "/audio/wren/m10p-s6-q2ok.mp3":
    "[proud] Right. By the time you hear the panic, the scraping and cloning already happened offstage. This is move four, the push.",
  "/audio/wren/m10p-s6-q2bad.mp3":
    "[warm] Scraping happened quietly, long before this call. What you're hearing is the final rush. Try again.",
  "/audio/wren/m10p-s6-q2bad2.mp3":
    "[warm] It's the whole point of the play, the rush for money. That's move four. Try again.",
  "/audio/wren/m10p-s6-q3ok.mp3":
    "[proud] Exactly. Someone scraped the audio, someone wrote the script. It's a supply chain, and it goes straight in your dossier.",
  "/audio/wren/m10p-s6-q3bad.mp3":
    "[warm] The scraped audio and the script came from others. MIMIC had help. Try again.",
  "/audio/wren/m10p-s6-q3bad2.mp3":
    "[warm] They're the fuel for the whole thing, and they show MIMIC has a team. That matters a lot. Try again.",

  // skill 7 — stay calm, run the protocol
  "/audio/wren/m10p-s7-learn.mp3":
    "[warm] Last skill of the block. A fake emergency is designed to panic you, because a panicking brain doesn't check. So the skill is to slow down on purpose. Take a breath. Hang up if you need to. Call back on the number you already know. Ask the code word. And get a trusted adult involved, always. [encouraging] Here's the calming truth, a real emergency survives a two-minute check. A scam does not.",
  "/audio/wren/m10p-s7-ok.mp3":
    "[proud] Perfect. You slowed down, went to the number you trust, and looped in an adult. If it's real, mum's fine and grateful you checked. If it's a clone, you just beat it cold. That's the whole protocol.",
  "/audio/wren/m10p-s7-bad.mp3":
    "[concerned] The terror is the trick, it's built to switch off your checking. Real mum survives a two-minute call-back. Don't send on the voice alone. Try again.",
  "/audio/wren/m10p-s7-bad2.mp3":
    "[warm] Staying on their line is staying in their control. Hang up, call the real number, tell an adult. That's what beats a clone. Try again.",
  "/audio/wren/m10p-s7-q2ok.mp3":
    "[proud] Exactly. As long as you're on their call, they're steering you. Hang up, ring the number you know, and you take control back.",
  "/audio/wren/m10p-s7-q2bad.mp3":
    "[warm] If it's really her, she'll completely understand a call-back. Don't hang up is the trap, not manners. Try again.",
  "/audio/wren/m10p-s7-q2bad2.mp3":
    "[warm] Staying on the line is staying under their control. Hang up and verify, that's the play. Try again.",
  "/audio/wren/m10p-s7-q3ok.mp3":
    "[proud] That's the one to remember. Checking never hurts a real emergency, but it stops a scam cold. So you can always take the two minutes.",
  "/audio/wren/m10p-s7-q3bad.mp3":
    "[warm] Real help survives a quick call-back just fine. The can't wait pressure is the scam talking. Try again.",
  "/audio/wren/m10p-s7-q3bad2.mp3":
    "[warm] It doesn't, a real one holds up to a check. Slowing down only ever costs the scammer. Try again.",

  // boss — "Caller ID"
  "/audio/wren/m10p-boss-intro.mp3":
    "[serious] This is it, Agent, the last case of the block. Your phone's ringing, and it's a voice you love, in a real panic. Everything in you will want to just help. [determined] But you know the trick now. Stay calm, run your protocol, and don't let a machine wearing a voice rush you. Answer it.",
  "/audio/wren/m10p-boss-win.mp3":
    "[excited] Perfect run, and what a way to finish the block. A voice that sounded exactly like your mum, a real emergency, real panic, and you didn't send a thing. You stayed calm, you asked for the code word, and when the clone couldn't give it, you hung up and called the real her. [proud] A machine can fake a voice. It can never answer her phone, or know your family's secret word. You just beat the scariest trick MIMIC has.",

  // test — "Prove it" (block-finale variant, own wording)
  "/audio/wren/m10p-test-intro.mp3":
    "[serious] Last thing before I close the case and your SECRET clearance, the test. A fresh set, no hints, and you'll need most of them right. [determined] This earns your promotion, so take your time and think. [excited] Ready?",
  "/audio/wren/m10p-test-pass.mp3":
    "[excited] Yes! You cleared the whole Human Factor block without a single slip. [proud] SECRET clearance, Agent, you've truly earned it. I'm proud of you.",
  "/audio/wren/m10p-test-fail.mp3":
    "[warm] So close, and this one really matters. Don't sweat it. Even pros miss a couple. [encouraging] Take a breath and run it again. You've got this.",

  // debrief
  "/audio/wren/m10p-debrief.mp3":
    "[proud] SECRET clearance earned.",
};
