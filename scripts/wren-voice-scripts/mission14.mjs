/**
 * WREN's spoken scripts for Case 014 ("The Update Trap", the Console runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice has no text field in case14.ts — recovered by transcription.
 * test.failVoice is the generic template reused across cases.
 */
export const mission14VoiceScripts = {
  "/audio/wren/m14c-open-1.mp3":
    "[curious] New system, Agent. Every app you install is handed POWERS on your device, your camera, your files, your location. Today you learn to control exactly what you hand over.",
  "/audio/wren/m14c-open-2.mp3":
    "[serious] GHOSTWRITER is back, and it's stopped writing messages. Now it writes fake installers, malware dressed up as a game you want or an update you need.",
  "/audio/wren/m14c-open-3.mp3":
    "[determined] Seven skills to control what runs on your machine, then a boss and a test. Let's decide what gets in, and what stays out.",

  // skill 1 — a download is powers
  "/audio/wren/m14c-s1-learn.mp3":
    "[serious] Here's what an install really is. When you add an app, you don't just get the app, you HAND it powers over your device. Permission to use your camera, read your files, see your location, reach your contacts. [warm] Some apps genuinely need some of those. But every power you grant is a power that app, or whoever's behind it, now holds. So installing isn't just 'yes'. It's 'here are the keys to these rooms'.",
  "/audio/wren/m14c-s1-ok.mp3":
    "[proud] Exactly. 'Allow' is you handing over keys. Which is fine when the app needs that room, and a problem when it doesn't. From here, you decide which keys it gets, not the app.",
  "/audio/wren/m14c-s1-bad.mp3":
    "[warm] There's more to it. Each 'Allow' grants a real power over your device. That's the part we're learning to control. Try again.",
  "/audio/wren/m14c-s1-bad2.mp3":
    "[warm] They can, but only what you grant. That's why permissions matter so much. Try again.",
  "/audio/wren/m14c-s1-q2ok.mp3":
    "[proud] Right. Camera, files, location, those are real keys to real rooms on your device. Every 'Allow' hands one over.",
  "/audio/wren/m14c-s1-q3ok.mp3":
    "[proud] Exactly. That request is the app reaching for keys, your camera and your mic. Installing is never just getting the app, it is handing over powers.",
  "/audio/wren/m14c-s1-q3bad.mp3":
    "[warm] It is more than hello, it is a reach for real powers on your device. Try again.",
  "/audio/wren/m14c-s1-q3bad2.mp3":
    "[warm] Asking for powers proves nothing about safety, it only shows what it wants to hold. Try again.",

  // skill 2 — does it NEED that?
  "/audio/wren/m14c-s2-learn.mp3":
    "[curious] So how do you decide? One question: does the app actually NEED this power to do its job? A camera app needs the camera, obviously. A map needs your location. [serious] But a torch app that wants your contacts, your microphone, and your text messages? A torch turns a light on. It needs none of that. When the powers don't match the job, that's your warning light.",
  "/audio/wren/m14c-s2-ok.mp3":
    "[proud] Spot on. A torch needs the flash, full stop. Contacts, texts, location? That's an app harvesting your life under cover of a light switch. Powers that don't match the job are the whole tell.",
  "/audio/wren/m14c-s2-bad.mp3":
    "[warm] What feature of a torch needs your text messages? None. Those powers don't match the job, that's the red flag. Try again.",
  "/audio/wren/m14c-s2-bad2.mp3":
    "[warm] They really don't. A good app asks only for what its job needs. Over-asking is the warning sign. Try again.",
  "/audio/wren/m14c-s2-q2ok.mp3":
    "[proud] Exactly. A weather app needs your location to know where you are, and nothing else. Contacts and camera don't fit the job, so they stay off.",
  "/audio/wren/m14c-s2-q3ok.mp3":
    "[proud] Right. A notes app stores words, and your location adds nothing to that. A power that doesn't fit the job is one to refuse.",
  "/audio/wren/m14c-s2-q3bad.mp3":
    "[warm] Notes are just words, your location adds nothing to them. When a power doesn't fit the job, deny it. Try again.",
  "/audio/wren/m14c-s2-q3bad2.mp3":
    "[warm] 'Just in case' is how apps collect what they don't need. If the job doesn't need it, it doesn't get it. Try again.",

  // skill 3 — grant only what fits
  "/audio/wren/m14c-s3-learn.mp3":
    "[encouraging] Good news: you're in charge of every switch. You can grant the powers an app truly needs and deny the rest, and change your mind any time. [warm] Take a map app. It needs your location to give directions, fair enough. It does NOT need your microphone or your photos to draw a map. So grant the one that fits the job, deny the ones that don't. Let's set it.",
  "/audio/wren/m14c-s3-ok.mp3":
    "[proud] Perfect. Location on, so it can guide you, and everything else off, because a map has no business in your microphone or your photos. Grant what fits the job, deny the rest. That's permission control.",
  "/audio/wren/m14c-s3-bad.mp3":
    "[warm] Not quite. A map needs your location, but it has no reason to hear you or see your photos. Grant only the one that fits the job.",
  "/audio/wren/m14c-s3-q2ok.mp3":
    "[proud] Exactly. A video call really does need to see and hear you, so those two fit the job. Granting isn't bad, granting what doesn't fit is.",
  "/audio/wren/m14c-s3-q2bad.mp3":
    "[warm] Deny-all breaks the app, a video call truly needs camera and mic to work. Grant what fits the job. Try again.",
  "/audio/wren/m14c-s3-q2bad2.mp3":
    "[warm] A call with no sound isn't much of a call, it needs the mic too. Grant the powers the job needs. Try again.",
  "/audio/wren/m14c-s3-q3ok.mp3":
    "[proud] Perfect. Camera, saving photos and mic all fit what a camera does. Contacts and location don't, so they get denied. Grant what fits, deny the rest.",

  // skill 4 — updates are armour
  "/audio/wren/m14c-s4-learn.mp3":
    "[serious] Now the boring switch that saves you the most: updates. Every app and device has flaws, tiny holes. When one's found, the makers fix it and push out an update, patching the hole. Attackers love the people who never update, because the hole is still wide open for them. [encouraging] So updates aren't nagging, they're armour. Turn on automatic updates and let the patches keep coming.",
  "/audio/wren/m14c-s4-ok.mp3":
    "[proud] Exactly. Every update you skip leaves a known hole open for anyone who knows about it. Installing it is patching your armour. Best of all, turn on automatic updates so it just happens.",
  "/audio/wren/m14c-s4-bad.mp3":
    "[warm] Skipping updates leaves known holes open, and those are exactly what attackers target. Updates are armour, install them. Try again.",
  "/audio/wren/m14c-s4-bad2.mp3":
    "[warm] The longer you wait, the longer the hole stays open. That's the un-updated device an attacker walks into. Try again.",
  "/audio/wren/m14c-s4-q2ok.mp3":
    "[proud] Locked in. With auto-updates on across your system, apps and browser, holes get patched the moment a fix exists. No nagging, no forgetting.",
  "/audio/wren/m14c-s4-q3ok.mp3":
    "[proud] Exactly. Attackers hunt for known holes, and the un-updated tablet still has every one of them open. Updates are what close the door.",
  "/audio/wren/m14c-s4-q3bad.mp3":
    "[warm] Features aren't holes. The attacker wants the un-patched tablet, its known holes are still open. Try again.",
  "/audio/wren/m14c-s4-q3bad2.mp3":
    "[warm] They make all the difference, the un-updated one is the easy target. Try again.",

  // skill 5 — the fake installer
  "/audio/wren/m14c-s5-learn.mp3":
    "[serious] Here's GHOSTWRITER's trick. It takes malware and dresses it up as something you'd happily install: a free version of a game, a 'you must update NOW' pop-up, a cracked app. It even uses the old lure tricks, urgency and free stuff. [determined] The defence is the SOURCE. Install only from the official app store or the maker's real site. A download from a random link or a pop-up is a stranger's parcel. Don't open it.",
  "/audio/wren/m14c-s5-ok.mp3":
    "[proud] Exactly. Real updates come through your device's own settings or the official store, never a scary pop-up linking to some random site. That 'update' is GHOSTWRITER's malware in a hi-vis jacket. Close it, don't click it.",
  "/audio/wren/m14c-s5-bad.mp3":
    "[warm] The urgency and the random site are the tell. Real updates never arrive as a panic pop-up from fast-fix-now dot net. That's a fake installer. Try again.",
  "/audio/wren/m14c-s5-bad2.mp3":
    "[warm] If you click and run that file, it very much can. Only install from official sources, never a pop-up's link. Try again.",
  "/audio/wren/m14c-s5-q2ok.mp3":
    "[proud] Right. Trust the official store and the maker's real site, and switch off anything from a random link or a cracked-app site.",
  "/audio/wren/m14c-s5-q3ok.mp3":
    "[proud] That's the fake-installer fingerprint. Random source, panic urgency, and a too-good freebie. Spot those three and you close the lid before it opens.",

  // skill 6 — know GHOSTWRITER's play
  "/audio/wren/m14c-s6-learn.mp3":
    "[serious] See GHOSTWRITER's malware play, four moves. First, dress the malware as something you want, a game, an update, a freebie. Second, get you to install it. Third, grab powers it should never have, your files, your camera, your messages. Fourth, do the damage. [determined] And you break it at move two: install only from official sources, and grant only the powers that fit the job. It never gets in, and if it did, it gets no keys.",
  "/audio/wren/m14c-s6-ok.mp3":
    "[proud] That's the one. Malware has to get installed to do anything, and it lives on random links and pop-ups, not the official store. Stick to official sources and you close the door at move two. Checking permissions is your backup lock.",
  "/audio/wren/m14c-s6-bad.mp3":
    "[warm] By the time it's installed, the damage can be done. You stop it by not installing it, only from official sources. Try again.",
  "/audio/wren/m14c-s6-bad2.mp3":
    "[warm] Don't leave it to hope. The reliable move is your own habit: official sources only. Try again.",
  "/audio/wren/m14c-s6-q2ok.mp3":
    "[proud] Right. Official sources is the front door, and matching permissions is the backup lock. Malware that sneaks in still gets no camera, no files, no keys.",
  "/audio/wren/m14c-s6-q2bad.mp3":
    "[warm] There is a backup: tight permissions mean even installed malware gets no keys. Try again.",
  "/audio/wren/m14c-s6-q2bad2.mp3":
    "[warm] That just adds risk. Your backup lock is careful permissions, not more apps. Try again.",
  "/audio/wren/m14c-s6-q3ok.mp3":
    "[proud] Those two together break the whole play. Official sources stop it getting in, and tight permissions mean it gets nothing even if it does.",

  // skill 7 — install smart
  "/audio/wren/m14c-s7-learn.mp3":
    "[warm] Last skill, your install habit. One, only ever install from the official store or the maker's real site. Two, check the permissions, grant what fits the job, deny the rest. Three, keep automatic updates on so your armour stays fresh. [encouraging] And when something feels off, don't install, investigate or ask an adult. Do these, and your machine stays yours.",
  "/audio/wren/m14c-s7-ok.mp3":
    "[proud] That's the whole habit, and it's a strong one. Official sources, matching permissions, fresh armour. Bad software can't get in, and anything you do install gets only the keys it truly needs.",
  "/audio/wren/m14c-s7-bad.mp3":
    "[warm] Careful, you picked a risky one. Cracked apps from random links, or blanket 'Allow', are exactly how malware gets in. Choose only the three safe moves.",
  "/audio/wren/m14c-s7-q2ok.mp3":
    "[proud] Exactly. A gut 'this feels off' is worth listening to. Stop, investigate, or ask an adult, before anything installs.",
  "/audio/wren/m14c-s7-q2bad.mp3":
    "[warm] By then the damage may be done. If it feels off, stop and check first. Try again.",
  "/audio/wren/m14c-s7-q2bad2.mp3":
    "[warm] Rushing past warnings is how malware gets in. Slow down and investigate. Try again.",
  "/audio/wren/m14c-s7-q3ok.mp3":
    "[proud] That's the whole habit, switched on for good. Trusted sources, matching permissions, fresh armour. Your machine stays yours.",

  // boss — "Trojan Delivery"
  "/audio/wren/m14c-boss-intro.mp3":
    "[serious] This is it, Agent. Four things want onto your device right now, and one of them is GHOSTWRITER in disguise. No hints from me. [determined] Check the source and the powers on each, and decide: install, deny, or investigate.",
  "/audio/wren/m14c-boss-win.mp3":
    "[excited] Cleanly done, Agent. You installed the real update from your own settings, denied the 'free' game that wanted powers no game needs, and slammed the panic pop-up shut. [proud] You checked the SOURCE and the POWERS on every one, and GHOSTWRITER's disguise didn't get a single click. Your machine's still yours.",

  // test — "Prove it"
  "/audio/wren/m14c-test-intro.mp3":
    "[serious] Last thing before I sign this off, the test. All fresh, no hints, and you need most of them right. Everything about controlling what runs on your machine, put it to work. [excited] Ready?",
  "/audio/wren/m14c-test-pass.mp3":
    "[excited] Yes! Every disguise spotted on your own and nothing bad got a single click. [proud] Your machine stays yours, Agent.",
  "/audio/wren/m14c-test-fail.mp3":
    "[warm] So close. Don't sweat it. Even pros miss a couple. [encouraging] Take a breath and run it again. You know this.",
};
