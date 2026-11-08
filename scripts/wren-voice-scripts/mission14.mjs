/**
 * WREN's spoken scripts for Case 014 ("The Update Trap", the Console runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice has no text field in case14.ts — recovered by transcription.
 * test.failVoice is the generic template reused across cases.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress, and GHOSTWRITER is "he" (the malware stays "it").
 */
export const mission14VoiceScripts = {
  "/audio/wren/m14c-open-1.mp3":
    "[serious] Here's a new system, Agent. Every app you install is handed powers on your device, like your camera, your files, and your location. Today you'll learn to control exactly what you hand over.",
  "/audio/wren/m14c-open-2.mp3":
    "[serious] GHOSTWRITER is back, and he's stopped writing messages. Now he writes fake installers. That's malware dressed up as a game you want, or an update you need.",
  "/audio/wren/m14c-open-3.mp3":
    "[serious] You'll learn seven skills to control what runs on your machine, then face a boss and a test. Let's decide what gets in, and what stays out.",

  // skill 1 — a download is powers
  "/audio/wren/m14c-s1-learn.mp3":
    "[warm] Here's what an install really is. When you add an app, you don't just get the app. You hand it powers over your device. That can mean permission to use your camera, read your files, see your location, or reach your contacts. Some apps genuinely need some of those. But every power you grant is a power that app, or whoever's behind it, now holds. So installing isn't just saying yes. It's handing over the keys to those rooms.",
  "/audio/wren/m14c-s1-ok.mp3":
    "[warm] Exactly. Tapping Allow is you handing over keys. That's fine when the app needs that room, and a problem when it doesn't. From here on, you decide which keys it gets, not the app.",
  "/audio/wren/m14c-s1-bad.mp3":
    "[warm] There's more to it. Each time you tap Allow, you grant a real power over your device. That's the part we're learning to control. Try again.",
  "/audio/wren/m14c-s1-bad2.mp3":
    "[warm] They can, but only what you grant. That's why permissions matter so much. Try again.",
  "/audio/wren/m14c-s1-q2ok.mp3":
    "[warm] Right. Your camera, files and location are real keys to real rooms on your device. Every tap on Allow hands one over.",
  "/audio/wren/m14c-s1-q3ok.mp3":
    "[warm] Exactly. That request is the app reaching for keys, your camera and your mic. Installing is never just getting the app. It is handing over powers.",
  "/audio/wren/m14c-s1-q3bad.mp3":
    "[warm] It is more than a hello. It is a reach for real powers on your device. Try again.",
  "/audio/wren/m14c-s1-q3bad2.mp3":
    "[warm] Asking for powers proves nothing about safety. It only shows what the app wants to hold. Try again.",

  // skill 2 — does it need that?
  "/audio/wren/m14c-s2-learn.mp3":
    "[warm] So how do you decide? Ask one question. Does the app actually need this power to do its job? A camera app needs the camera, obviously. A map needs your location. But what about a torch app that wants your contacts, your microphone, and your text messages? A torch turns a light on. It needs none of that. When the powers don't match the job, that's your warning light.",
  "/audio/wren/m14c-s2-ok.mp3":
    "[warm] That's spot on. A torch needs the flash, full stop. So why does it want your contacts, texts and location? That's an app harvesting your life under cover of a light switch. Powers that don't match the job are the whole tell.",
  "/audio/wren/m14c-s2-bad.mp3":
    "[warm] What feature of a torch needs your text messages? None of them do. Those powers don't match the job, and that's the red flag. Try again.",
  "/audio/wren/m14c-s2-bad2.mp3":
    "[warm] They really don't. A good app asks only for what its job needs. Over-asking is the warning sign. Try again.",
  "/audio/wren/m14c-s2-q2ok.mp3":
    "[warm] Exactly. A weather app needs your location to know where you are, and nothing else. Contacts and camera don't fit the job, so they stay off.",
  "/audio/wren/m14c-s2-q3ok.mp3":
    "[warm] Right. A notes app stores words, and your location adds nothing to that. A power that doesn't fit the job is one to refuse.",
  "/audio/wren/m14c-s2-q3bad.mp3":
    "[warm] Notes are just words, and your location adds nothing to them. When a power doesn't fit the job, deny it. Try again.",
  "/audio/wren/m14c-s2-q3bad2.mp3":
    "[warm] Allowing things just in case is how apps collect what they don't need. If the job doesn't need it, the app doesn't get it. Try again.",

  // skill 3 — grant only what fits
  "/audio/wren/m14c-s3-learn.mp3":
    "[warm] Here's the good news. You're in charge of every switch. You can grant the powers an app truly needs, deny the rest, and change your mind any time. Take a map app. It needs your location to give directions, which is fair enough. It does not need your microphone or your photos to draw a map. So grant the one that fits the job, and deny the ones that don't. Let's set it.",
  "/audio/wren/m14c-s3-ok.mp3":
    "[warm] Perfect. Location is on, so it can guide you. Everything else is off, because a map has no business in your microphone or your photos. Grant what fits the job, and deny the rest. That's permission control.",
  "/audio/wren/m14c-s3-bad.mp3":
    "[warm] Not quite. A map needs your location, but it has no reason to hear you or see your photos. Grant only the one that fits the job.",
  "/audio/wren/m14c-s3-q2ok.mp3":
    "[warm] Exactly. A video call really does need to see and hear you, so those two fit the job. Granting isn't bad. Granting what doesn't fit is.",
  "/audio/wren/m14c-s3-q2bad.mp3":
    "[warm] Denying everything breaks the app, because a video call truly needs the camera and mic to work. Grant what fits the job. Try again.",
  "/audio/wren/m14c-s3-q2bad2.mp3":
    "[warm] A call with no sound isn't much of a call, so it needs the mic too. Grant the powers the job needs. Try again.",
  "/audio/wren/m14c-s3-q3ok.mp3":
    "[warm] Perfect. The camera, saving photos and the mic all fit what a camera does. Contacts and location don't, so they get denied. Grant what fits, and deny the rest.",

  // skill 4 — updates are armour
  "/audio/wren/m14c-s4-learn.mp3":
    "[warm] Now for the boring switch that saves you the most, which is updates. Every app and device has flaws, like tiny holes. When one is found, the makers fix it and push out an update that patches the hole. Attackers love the people who never update, because the hole is still wide open for them. So updates aren't nagging. They're armour. Turn on automatic updates, and let the patches keep coming.",
  "/audio/wren/m14c-s4-ok.mp3":
    "[warm] Exactly. Every update you skip leaves a known hole open for anyone who knows about it. Installing it is patching your armour. Best of all, turn on automatic updates so it just happens.",
  "/audio/wren/m14c-s4-bad.mp3":
    "[warm] Skipping updates leaves known holes open, and those are exactly what attackers target. Updates are armour, so install them. Try again.",
  "/audio/wren/m14c-s4-bad2.mp3":
    "[warm] The longer you wait, the longer the hole stays open. That's the un-updated device an attacker walks into. Try again.",
  "/audio/wren/m14c-s4-q2ok.mp3":
    "[warm] That's locked in. With auto-updates on across your system, apps and browser, holes get patched the moment a fix exists. There's no nagging, and no forgetting.",
  "/audio/wren/m14c-s4-q3ok.mp3":
    "[warm] Exactly. Attackers hunt for known holes, and the un-updated tablet still has every one of them open. Updates are what close the door.",
  "/audio/wren/m14c-s4-q3bad.mp3":
    "[warm] Features aren't holes. The attacker wants the unpatched tablet, because its known holes are still open. Try again.",
  "/audio/wren/m14c-s4-q3bad2.mp3":
    "[warm] They make all the difference. The un-updated one is the easy target. Try again.",

  // skill 5 — the fake installer
  "/audio/wren/m14c-s5-learn.mp3":
    "[warm] Here's GHOSTWRITER's trick. He takes malware and dresses it up as something you'd happily install. It might be a free version of a game, a pop-up saying you must update now, or a cracked app. He even uses the old lure tricks of urgency and free stuff. The defence is the source. Install only from the official app store or the maker's real site. A download from a random link or a pop-up is a stranger's parcel, so don't open it.",
  "/audio/wren/m14c-s5-ok.mp3":
    "[warm] Exactly. Real updates come through your device's own settings or the official store. They never come from a scary pop-up linking to some random site. That so-called update is GHOSTWRITER's malware in a hi-vis jacket. Close it, and don't click it.",
  "/audio/wren/m14c-s5-bad.mp3":
    "[warm] The urgency and the random site are the tell. Real updates never arrive as a panic pop-up from fast-fix-now.net. That's a fake installer. Try again.",
  "/audio/wren/m14c-s5-bad2.mp3":
    "[warm] If you click and run that file, it very much can. Only install from official sources, and never from a pop-up's link. Try again.",
  "/audio/wren/m14c-s5-q2ok.mp3":
    "[warm] Right. Trust the official store and the maker's real site, and switch off anything from a random link or a cracked-app site.",
  "/audio/wren/m14c-s5-q3ok.mp3":
    "[warm] That's the fake-installer fingerprint. It's a random source, panic urgency, and a too-good freebie. Spot those three, and you close the lid before it opens.",

  // skill 6 — know GHOSTWRITER's play
  "/audio/wren/m14c-s6-learn.mp3":
    "[warm] Let's look at GHOSTWRITER's malware play. It has four moves. First, he dresses the malware as something you want, like a game, an update, or a freebie. Second, he gets you to install it. Third, the malware grabs powers it should never have, like your files, your camera, and your messages. Fourth, it does the damage. And you break it at move two. Install only from official sources, and grant only the powers that fit the job. The malware never gets in, and even if it did, it would get no keys.",
  "/audio/wren/m14c-s6-ok.mp3":
    "[warm] That's the one. Malware has to get installed to do anything, and it lives on random links and pop-ups, not the official store. Stick to official sources and you close the door at move two. Checking permissions is your backup lock.",
  "/audio/wren/m14c-s6-bad.mp3":
    "[warm] By the time it's installed, the damage can be done. You stop it by never letting it in. Install only from official sources. Try again.",
  "/audio/wren/m14c-s6-bad2.mp3":
    "[warm] Don't leave it to hope. The reliable move is your own habit of using official sources only. Try again.",
  "/audio/wren/m14c-s6-q2ok.mp3":
    "[warm] Right. Sticking to official sources is the front door, and matching permissions is the backup lock. Malware that sneaks in still gets no camera, no files, and no keys.",
  "/audio/wren/m14c-s6-q2bad.mp3":
    "[warm] There is a backup. Tight permissions mean even installed malware gets no keys. Try again.",
  "/audio/wren/m14c-s6-q2bad2.mp3":
    "[warm] That just adds risk. Your backup lock is careful permissions, not more apps. Try again.",
  "/audio/wren/m14c-s6-q3ok.mp3":
    "[warm] Those two together break the whole play. Official sources stop it getting in, and tight permissions mean it gets nothing even if it does.",

  // skill 7 — install smart
  "/audio/wren/m14c-s7-learn.mp3":
    "[warm] This last skill is your install habit. One, only ever install from the official store or the maker's real site. Two, check the permissions, grant what fits the job, and deny the rest. Three, keep automatic updates on, so your armour stays fresh. And when something feels off, don't install it. Investigate, or ask an adult. Do these, and your machine stays yours.",
  "/audio/wren/m14c-s7-ok.mp3":
    "[warm] That's the whole habit, and it's a strong one. You have official sources, matching permissions, and fresh armour. Bad software can't get in, and anything you do install gets only the keys it truly needs.",
  "/audio/wren/m14c-s7-bad.mp3":
    "[warm] Careful, you picked a risky one. Cracked apps from random links, or tapping Allow on everything, are exactly how malware gets in. Choose only the three safe moves.",
  "/audio/wren/m14c-s7-q2ok.mp3":
    "[warm] Exactly. A gut feeling that something is off is worth listening to. Stop, investigate, or ask an adult before anything installs.",
  "/audio/wren/m14c-s7-q2bad.mp3":
    "[warm] By then the damage may be done. If it feels off, stop and check first. Try again.",
  "/audio/wren/m14c-s7-q2bad2.mp3":
    "[warm] Rushing past warnings is how malware gets in. Slow down and investigate. Try again.",
  "/audio/wren/m14c-s7-q3ok.mp3":
    "[warm] That's the whole habit, switched on for good. You have trusted sources, matching permissions, and fresh armour. Your machine stays yours.",

  // boss — "Trojan Delivery"
  "/audio/wren/m14c-boss-intro.mp3":
    "[determined] This is it, Agent. Three things want onto your device right now, and GHOSTWRITER is hiding behind more than one of them. You'll get no hints from me. Check the source and the powers on each one. Then decide whether to install, deny, or investigate.",
  "/audio/wren/m14c-boss-win.mp3":
    "[proud] That was cleanly done, Agent. You installed the real update from your own settings. You denied the so-called free game that wanted powers no game needs, and you slammed the panic pop-up shut. You checked the source and the powers on every one, and GHOSTWRITER's disguise didn't get a single click. Your machine's still yours.",

  // test — "Prove it"
  "/audio/wren/m14c-test-intro.mp3":
    "[warm] There's one last thing before I sign this off, and that's the test. The questions are all fresh, there are no hints, and you need most of them right. Put everything you know about controlling what runs on your machine to work. Ready?",
  "/audio/wren/m14c-test-pass.mp3":
    "[proud] Yes! You spotted every disguise on your own, and nothing bad got a single click. Your machine stays yours, Agent.",
  "/audio/wren/m14c-test-fail.mp3":
    "[warm] That was so close, Agent. Don't sweat it, because even pros miss a couple. Take a breath and run it again. You know this.",
};
