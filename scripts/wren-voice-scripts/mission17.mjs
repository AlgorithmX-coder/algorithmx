/**
 * WREN's spoken scripts for Case 017 ("Ghost Stories", the WarRoom runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice/failVoice have no text field in case17.ts — recovered by
 * transcription. failVoice here is a case-specific variant ("read it
 * sideways"), not the generic template reused elsewhere.
 */
export const mission17VoiceScripts = {
  "/audio/wren/m17w-open-1.mp3":
    "[serious] Back at the board, Agent. New signature on the wire: GHOSTWRITER. This one doesn't steal your password, it steals your belief. It makes things that never happened look completely real.",
  "/audio/wren/m17w-open-2.mp3":
    "[concerned] Fake photos, cloned voices, invented quotes, whole stories built from nothing, and cheap to make now. The goal is to get you to believe it, feel something, and pass it on before you think.",
  "/audio/wren/m17w-open-3.mp3":
    "[determined] Seven skills to tell real from fake without being fooled or paranoid, then a boss and a test. Let's learn to check before we believe.",

  // skill 1 — fakes are cheap now
  "/audio/wren/m17w-s1-learn.mp3":
    "[serious] Start with the uncomfortable truth. Today a computer can fake almost anything: a photo of a place you've never been, a video of someone saying words they never said, a voice that sounds exactly like a friend, a whole news story with no truth in it. [warm] It's cheap, it's fast, and it's getting better. So 'I saw it with my own eyes' isn't proof any more. Seeing is no longer believing.",
  "/audio/wren/m17w-s1-ok.mp3":
    "[proud] Exactly the right reflex. Not 'everything is fake', just 'this could be, so I'll verify before I believe or share'. A calm check beats both blind trust and blind panic.",
  "/audio/wren/m17w-s1-bad.mp3":
    "[warm] Video absolutely can be faked now, convincingly. Seeing isn't proof any more. Try again.",
  "/audio/wren/m17w-s1-bad2.mp3":
    "[warm] That's exactly what GHOSTWRITER wants, you spreading it before you check. Slow down first. Try again.",
  "/audio/wren/m17w-s1-q2ok.mp3":
    "[proud] Right. Photos, voices and whole stories can all be faked now, which is why you check before you believe.",
  "/audio/wren/m17w-s1-q3ok.mp3":
    "[proud] Exactly. Image, sound or text, all cheap to fake now, so seeing and hearing aren't proof on their own.",

  // skill 2 — tells run out
  "/audio/wren/m17w-s2-learn.mp3":
    "[curious] People love the 'spot the glitch' game, count the fingers, look for a blurry ear. Here's the problem: the fakes keep getting better, so those little tells vanish. [serious] If your whole plan is spotting glitches, you'll be fooled the day the glitch is gone. The reliable checks aren't about the image itself, they're about the source and the story around it. Let's pin the ones that keep working.",
  "/audio/wren/m17w-s2-ok.mp3":
    "[proud] That's the toolkit. Who posted it, does anyone reliable agree, and is there a real original. Those checks work no matter how perfect the fake looks, because they ask about the source, not the pixels.",
  "/audio/wren/m17w-s2-bad.mp3":
    "[warm] Careful, one of those relies on spotting a flaw in the image, and flaws vanish as fakes improve. Pin the checks about the source and the story, not the pixels.",
  "/audio/wren/m17w-s2-q2ok.mp3":
    "[proud] Right. A plan built on glitches fails the day the glitch is gone. Check the source instead.",
  "/audio/wren/m17w-s2-q2bad.mp3":
    "[warm] Fakes keep getting better and the little tells disappear. Rely on the source, not the pixels. Try again.",
  "/audio/wren/m17w-s2-q2bad2.mp3":
    "[warm] A blur proves nothing either way. The reliable checks are about the source, not the image. Try again.",
  "/audio/wren/m17w-s2-q3ok.mp3":
    "[proud] That's the method. Every one asks about the source and the story, so they keep working no matter how good the fake looks.",

  // skill 3 — read sideways
  "/audio/wren/m17w-s3-learn.mp3":
    "[excited] Here's the single most powerful skill in this case: lateral reading. When something surprises you, don't stare harder at the page trying to decide if it's real. Leave it. [curious] Open new tabs, search the claim, the person, the photo, and see what everyone else says. Fact-checkers don't read down a suspicious page, they read sideways across the whole web. Let's connect each claim to the tab that would check it.",
  "/audio/wren/m17w-s3-ok.mp3":
    "[proud] That's reading sideways. A reverse image search shows where a photo really came from; searching a quote shows if anyone reliable reported it; searching a site shows who's really behind it. You left the page, and the truth was one tab away.",
  "/audio/wren/m17w-s3-bad.mp3":
    "[warm] Not quite. Match the check to the claim: images go to reverse image search, quotes go to a news search, unknown sites you look up directly. Try again.",
  "/audio/wren/m17w-s3-q2ok.mp3":
    "[proud] Exactly. That's reading sideways. The page will always vouch for itself, so you check what everyone else says.",
  "/audio/wren/m17w-s3-q2bad.mp3":
    "[warm] Reading the page harder just traps you in its story. Leave it and check elsewhere. Try again.",
  "/audio/wren/m17w-s3-q2bad2.mp3":
    "[warm] A dodgy site will happily lie about itself. Search it from the outside instead. Try again.",
  "/audio/wren/m17w-s3-q3ok.mp3":
    "[proud] That's reading sideways. New tabs, real searches, and the truth is usually one of them away.",

  // skill 4 — who benefits
  "/audio/wren/m17w-s4-learn.mp3":
    "[curious] When a story is designed to make you angry or scared, ask one cool question: who benefits if I believe this? Someone selling something, someone wanting your vote, your click, your outrage, or your money. [serious] Real information doesn't usually need you frightened right now. If a story's whole job is to make you feel a strong thing and act instantly, follow the benefit, and you'll often find the ghostwriter.",
  "/audio/wren/m17w-s4-ok.mp3":
    "[proud] Right. The panic conveniently points you at a competitor. That doesn't prove the first app is safe, it proves the story has a motive. Follow the benefit and verify before you act.",
  "/audio/wren/m17w-s4-bad.mp3":
    "[warm] A post that ends with 'switch to this instead' has a motive built in. Ask who profits. Try again.",
  "/audio/wren/m17w-s4-bad2.mp3":
    "[warm] The one thing you shouldn't do is act instantly on a scare with a sales pitch attached. Check first. Try again.",
  "/audio/wren/m17w-s4-q2ok.mp3":
    "[proud] Right. A rushed feeling and a built-in sales pitch are the tells that someone gains if you believe it.",
  "/audio/wren/m17w-s4-q3ok.mp3":
    "[proud] Follow the benefit and the ghostwriter appears. Every one has someone who profits if you believe it.",

  // skill 5 — find the original
  "/audio/wren/m17w-s5-learn.mp3":
    "[serious] Rumours travel as screenshots, of screenshots, of things nobody can find any more. That's a red flag by itself. Before you believe a claim, find the original: the real post, the real article, the real video, from the real account. [determined] If nobody can point to an original and it's all just re-shares of a re-share, treat it as unproven. No source, no belief.",
  "/audio/wren/m17w-s5-ok.mp3":
    "[proud] Exactly. A screenshot with no findable original is one of the oldest tricks, because screenshots are trivial to fake. No source, no belief. You keep it in the 'unproven' pile.",
  "/audio/wren/m17w-s5-bad.mp3":
    "[warm] Screenshots are some of the easiest things to fake, anyone can edit text into one. Find the original or don't believe it. Try again.",
  "/audio/wren/m17w-s5-bad2.mp3":
    "[warm] Sharing to ask still spreads it, and most people won't see your question. Verify first, share second. Try again.",
  "/audio/wren/m17w-s5-q2ok.mp3":
    "[proud] Right. A real original is the actual post, article or video from the real source, not a re-shared screenshot.",
  "/audio/wren/m17w-s5-q3ok.mp3":
    "[proud] That's tracing to source. If you can't reach a real original, treat it as unproven.",

  // skill 6 — know GHOSTWRITER's play
  "/audio/wren/m17w-s6-learn.mp3":
    "[serious] See GHOSTWRITER's play, four moves. First, manufacture: fake the photo, quote or story. Second, seed it: drop it where it'll catch, an outrage group, a comment thread. Third, amplify: bots and angry sharers spread it faster than the truth. Fourth, profit: clicks, division, a scam, or a belief they wanted planted. [determined] Here's your power: the whole machine runs on people sharing before they check. Be the one who checks, and the chain breaks.",
  "/audio/wren/m17w-s6-ok.mp3":
    "[proud] That's the weak link. Manufacturing a fake is easy; getting real people to spread it is the hard part they need YOU for. The moment you check before sharing, you stop being their amplifier.",
  "/audio/wren/m17w-s6-bad.mp3":
    "[warm] The fakes are cheap now, that's the problem. The expensive part for them is your trust and your share. Try again.",
  "/audio/wren/m17w-s6-bad2.mp3":
    "[warm] It doesn't spread on its own, it needs people to pass it on. That's the link you can break. Try again.",
  "/audio/wren/m17w-s6-q2ok.mp3":
    "[proud] That's the machine. And every stage needs people to pass it on, which is the link you can break.",
  "/audio/wren/m17w-s6-q3ok.mp3":
    "[proud] Right. Check first and refuse to pass on the unverified, and GHOSTWRITER loses the amplifier it needs.",

  // skill 7 — be the circuit breaker
  "/audio/wren/m17w-s7-learn.mp3":
    "[warm] Last skill, and it's a habit, not a fact. You are a circuit breaker. Every fake needs people to pass it along, so when something makes you want to share right now, that urge is the signal to pause. [encouraging] Check the source, read sideways, ask who benefits. If it's true, it'll still be true in ten minutes. If it's fake, you just stopped it dead. One calm person who checks is worth a thousand who share.",
  "/audio/wren/m17w-s7-ok.mp3":
    "[proud] That's a circuit breaker. Pause, check, ask who benefits, then decide. You'll share plenty of real things, but you'll never be the reason a lie went viral. That's real power on the modern internet.",
  "/audio/wren/m17w-s7-bad.mp3":
    "[warm] Careful, one of those still spreads the fake, sharing 'just in case' or 'not sure if true' still puts it in front of people. Pin only the moves that stop the spread.",
  "/audio/wren/m17w-s7-q2ok.mp3":
    "[proud] Exactly. The stronger the urge to share now, the more it's worth checking first.",
  "/audio/wren/m17w-s7-q2bad.mp3":
    "[warm] That urge is the fuel fakes run on. Treat it as a reason to slow down. Try again.",
  "/audio/wren/m17w-s7-q2bad2.mp3":
    "[warm] That rush is a real clue. It's the moment to pause and check. Try again.",
  "/audio/wren/m17w-s7-q3ok.mp3":
    "[proud] That's the circuit breaker in action. Pause, check, and ask who benefits, and the lie stops with you.",

  // boss — "The Rumour Mill"
  "/audio/wren/m17w-boss-intro.mp3":
    "[serious] This is it, Agent. GHOSTWRITER has seeded a fake story and it's spreading through your school's group chats right now: a doctored photo, a fake quote, and a screenshot with no original. You're the analyst who can stop it. No hints from me. [determined] Check it, trace it, break the chain.",
  "/audio/wren/m17w-boss-win.mp3":
    "[excited] Now THAT is analyst work, Agent. A fake was tearing through the chats, and instead of adding to it, you left the page, read sideways, traced every piece to nothing, and posted the truth with receipts. [proud] GHOSTWRITER's whole machine runs on people sharing before they check, and you were the circuit breaker. Seeing isn't believing, checking is.",

  // test — "Prove it"
  "/audio/wren/m17w-test-intro.mp3":
    "[serious] Last thing before I sign this off, the test. A fresh batch of scenarios, no hints, and you need to get most of them right. Everything about telling real from fake, put it to work. [excited] Ready?",
  "/audio/wren/m17w-test-pass.mp3":
    "[excited] Yes! You told real from fake without being fooled or paranoid, every time. [proud] GHOSTWRITER's lies died the moment they reached you. Brilliant work, Agent.",
  "/audio/wren/m17w-test-fail.mp3":
    "[warm] So close. Even careful people miss one. [encouraging] Take a breath, read it sideways, and run it again. You've got this.",
};
