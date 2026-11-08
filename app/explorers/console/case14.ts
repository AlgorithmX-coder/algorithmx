/**
 * Block 3 · Case 014 "The Update Trap", GHOSTWRITER ②, THE CONSOLE.
 *
 * Systems block. Signature = permissions as POWERS: a download is a set of
 * capabilities you grant; updates are armour; and GHOSTWRITER dresses malware as
 * a real installer or update. Boss "Trojan Delivery": triage a batch of pending
 * installs (install / deny / investigate). Curriculum row M14.
 */

import type { ConsoleCase } from "./case11";

export const case14Console: ConsoleCase = {
  id: "explorers-m14",
  caseNumber: "CASE 014",
  title: "The Update Trap",
  actor: "GHOSTWRITER",
  accent: "#3ECF8E",
  theme: { backdrop: "install", matrix: ["#3ECF8E", "#8CFFC1", "#1FA36A"], accentHi: "#8CFFC1" },
  open: [
    "Here's a new system, Agent. Every app you install is handed powers on your device, like your camera, your files, and your location. Today you'll learn to control exactly what you hand over.",
    "GHOSTWRITER is back, and he's stopped writing messages. Now he writes fake installers. That's malware dressed up as a game you want, or an update you need.",
    "You'll learn seven skills to control what runs on your machine, then face a boss and a test. Let's decide what gets in, and what stays out.",
  ],
  openVoice: ["/audio/wren/m14c-open-1.mp3", "/audio/wren/m14c-open-2.mp3", "/audio/wren/m14c-open-3.mp3"],

  skills: [
    /* 1 · a download is powers */
    {
      n: 1,
      title: "A download is powers",
      goal: "Installing an app hands it real powers on your device. Know what you're granting.",
      journalNote: "Installing an app is like handing someone a set of keys to rooms in your house. Each permission is one more room they can walk into. Camera, contacts, files, every 'Allow' opens a door. Always notice what powers you're actually handing over.",
      panel: "INSTALL · PERMISSIONS",
      learn: [
        { t: "wren", text: "Here's what an install really is. When you add an app, you don't just get the app. You hand it powers over your device. That can mean permission to use your camera, read your files, see your location, or reach your contacts. Some apps genuinely need some of those. But every power you grant is a power that app, or whoever's behind it, now holds. So installing isn't just saying yes. It's handing over the keys to those rooms.", voice: "/audio/wren/m14c-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "What are you really doing when you install an app and tap 'Allow'?",
          options: [
            { label: "Granting it powers, like your camera, files, or location", outcome: "good", then: [{ t: "wren", text: "Exactly. Tapping Allow is you handing over keys. That's fine when the app needs that room, and a problem when it doesn't. From here on, you decide which keys it gets, not the app.", voice: "/audio/wren/m14c-s1-ok.mp3" }] },
            { label: "Just getting the app, nothing more", outcome: "bad", then: [{ t: "wren", text: "There's more to it. Each time you tap Allow, you grant a real power over your device. That's the part we're learning to control. Try again.", voice: "/audio/wren/m14c-s1-bad.mp3" }] },
            { label: "Nothing, apps can't access your stuff", outcome: "bad", then: [{ t: "wren", text: "They can, but only what you grant. That's why permissions matter so much. Try again.", voice: "/audio/wren/m14c-s1-bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "Tap the THREE real powers an app can be handed when you install it:",
          need: 3,
          parts: [
            { label: "Your camera", good: true, sub: "" },
            { label: "Your files", good: true, sub: "" },
            { label: "Your location", good: true, sub: "" },
            { label: "Today's weather", good: false, sub: "not yours to grant" },
            { label: "Your favourite colour", good: false, sub: "not a device power" },
          ],
          ok: "Right. Your camera, files and location are real keys to real rooms on your device. Every tap on Allow hands one over.",
          okVoice: "/audio/wren/m14c-s1-q2ok.mp3",
        },
        {
          t: "choose",
          prompt: "A new drawing app opens and requests your camera and microphone. What is that request really?",
          options: [
            { label: "The app asking you to hand over real powers on your device", outcome: "good", then: [{ t: "wren", text: "Exactly. That request is the app reaching for keys, your camera and your mic. Installing is never just getting the app. It is handing over powers.", voice: "/audio/wren/m14c-s1-q3ok.mp3" }] },
            { label: "Just a friendly hello from the app", outcome: "bad", then: [{ t: "wren", text: "It is more than a hello. It is a reach for real powers on your device. Try again.", voice: "/audio/wren/m14c-s1-q3bad.mp3" }] },
            { label: "Proof the app is safe and official", outcome: "bad", then: [{ t: "wren", text: "Asking for powers proves nothing about safety. It only shows what the app wants to hold. Try again.", voice: "/audio/wren/m14c-s1-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 2 · does it NEED that? */
    {
      n: 2,
      title: "Does it need that?",
      goal: "Judge a permission by one question: does the app need it to do its job?",
      journalNote: "A single question sorts every permission request: does this app's actual job need this room? A torch app wanting your contacts is a stranger asking for keys to a room it has no reason to enter. Ask 'does it need that?' before tapping Allow.",
      panel: "PERMISSION AUDIT",
      learn: [
        { t: "wren", text: "So how do you decide? Ask one question. Does the app actually need this power to do its job? A camera app needs the camera, obviously. A map needs your location. But what about a torch app that wants your contacts, your microphone, and your text messages? A torch turns a light on. It needs none of that. When the powers don't match the job, that's your warning light.", voice: "/audio/wren/m14c-s2-learn.mp3" },
        { t: "sys", text: "APP: 'Super Torch'   REQUESTS:  ☑ Camera flash   ☒ Your contacts   ☒ Your text messages   ☒ Your location" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "'Super Torch' wants your contacts, texts, and location. What does that tell you?",
          options: [
            { label: "It's asking for powers a torch can't possibly need, a red flag", outcome: "good", then: [{ t: "wren", text: "That's spot on. A torch needs the flash, full stop. So why does it want your contacts, texts and location? That's an app harvesting your life under cover of a light switch. Powers that don't match the job are the whole tell.", voice: "/audio/wren/m14c-s2-ok.mp3" }] },
            { label: "It must need them for extra features", outcome: "bad", then: [{ t: "wren", text: "What feature of a torch needs your text messages? None of them do. Those powers don't match the job, and that's the red flag. Try again.", voice: "/audio/wren/m14c-s2-bad.mp3" }] },
            { label: "All apps need all permissions", outcome: "bad", then: [{ t: "wren", text: "They really don't. A good app asks only for what its job needs. Over-asking is the warning sign. Try again.", voice: "/audio/wren/m14c-s2-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "A WEATHER app lists its requests. Flip ON only what its job actually needs:",
          switches: [
            { label: "Location", sub: "for your local forecast", want: true },
            { label: "Your contacts", sub: "weather doesn't need people", want: false },
            { label: "Your camera", sub: "weather doesn't take photos", want: false },
          ],
          ok: "Exactly. A weather app needs your location to know where you are, and nothing else. Contacts and camera don't fit the job, so they stay off.",
          okVoice: "/audio/wren/m14c-s2-q2ok.mp3",
        },
        {
          t: "choose",
          prompt: "A simple notes app asks for your location. Does it need it?",
          options: [
            { label: "No. Writing notes has nothing to do with where you are", outcome: "good", then: [{ t: "wren", text: "Right. A notes app stores words, and your location adds nothing to that. A power that doesn't fit the job is one to refuse.", voice: "/audio/wren/m14c-s2-q3ok.mp3" }] },
            { label: "Yes, everything needs your location", outcome: "bad", then: [{ t: "wren", text: "Notes are just words, and your location adds nothing to them. When a power doesn't fit the job, deny it. Try again.", voice: "/audio/wren/m14c-s2-q3bad.mp3" }] },
            { label: "Maybe, better to allow it just in case", outcome: "bad", then: [{ t: "wren", text: "Allowing things just in case is how apps collect what they don't need. If the job doesn't need it, the app doesn't get it. Try again.", voice: "/audio/wren/m14c-s2-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 3 · grant only what fits */
    {
      n: 3,
      title: "Grant only what fits",
      goal: "Give an app the powers its job needs, deny the rest. You're in charge.",
      journalNote: "Granting permissions is like being the one holding every key in the house. You choose exactly who gets which room, and you can take a key back any time. A map app gets location, not your microphone. Give each app only the keys its job needs.",
      panel: "PERMISSIONS · MAP APP",
      learn: [
        { t: "wren", text: "Here's the good news. You're in charge of every switch. You can grant the powers an app truly needs, deny the rest, and change your mind any time. Take a map app. It needs your location to give directions, which is fair enough. It does not need your microphone or your photos to draw a map. So grant the one that fits the job, and deny the ones that don't. Let's set it.", voice: "/audio/wren/m14c-s3-learn.mp3" },
      ],
      practice: [
        {
          t: "toggle",
          prompt: "Set the map app's permissions, grant only what a map needs:",
          switches: [
            { label: "Location", sub: "needed to give directions", want: true },
            { label: "Microphone", sub: "a map doesn't listen", want: false },
            { label: "Your photos", sub: "a map doesn't need them", want: false },
          ],
          ok: "Perfect. Location is on, so it can guide you. Everything else is off, because a map has no business in your microphone or your photos. Grant what fits the job, and deny the rest. That's permission control.",
          okVoice: "/audio/wren/m14c-s3-ok.mp3",
          bad: "Not quite. A map needs your location, but it has no reason to hear you or see your photos. Grant only the one that fits the job.",
          badVoice: "/audio/wren/m14c-s3-bad.mp3",
        },
        {
          t: "choose",
          prompt: "A video-call app asks for your camera and microphone. What should you grant?",
          options: [
            { label: "Both, a video call genuinely needs to see and hear you", outcome: "good", then: [{ t: "wren", text: "Exactly. A video call really does need to see and hear you, so those two fit the job. Granting isn't bad. Granting what doesn't fit is.", voice: "/audio/wren/m14c-s3-q2ok.mp3" }] },
            { label: "Neither, deny everything to be safe", outcome: "bad", then: [{ t: "wren", text: "Denying everything breaks the app, because a video call truly needs the camera and mic to work. Grant what fits the job. Try again.", voice: "/audio/wren/m14c-s3-q2bad.mp3" }] },
            { label: "Camera only, calls don't need sound", outcome: "bad", then: [{ t: "wren", text: "A call with no sound isn't much of a call, so it needs the mic too. Grant the powers the job needs. Try again.", voice: "/audio/wren/m14c-s3-q2bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "A CAMERA app is installing. Tap the THREE powers that fit its job:",
          need: 3,
          parts: [
            { label: "Camera", good: true, sub: "to take photos" },
            { label: "Save to your photos", good: true, sub: "to store the pictures" },
            { label: "Microphone", good: true, sub: "for video sound" },
            { label: "Your contacts", good: false, sub: "a camera doesn't need people" },
            { label: "Your location", good: false, sub: "not needed to take a photo" },
          ],
          ok: "Perfect. The camera, saving photos and the mic all fit what a camera does. Contacts and location don't, so they get denied. Grant what fits, and deny the rest.",
          okVoice: "/audio/wren/m14c-s3-q3ok.mp3",
        },
      ],
    },

    /* 4 · updates are armor */
    {
      n: 4,
      title: "Updates are armour",
      goal: "Updates patch the holes attackers use. The un-updated are the easy targets.",
      journalNote: "An update patches a crack in the wall before anyone can use it to break in, so an out-of-date device is a wall full of known cracks. Attackers look for the devices nobody's patched. Install real updates promptly, from your own settings.",
      panel: "SYSTEM · UPDATES",
      learn: [
        { t: "wren", text: "Now for the boring switch that saves you the most, which is updates. Every app and device has flaws, like tiny holes. When one is found, the makers fix it and push out an update that patches the hole. Attackers love the people who never update, because the hole is still wide open for them. So updates aren't nagging. They're armour. Turn on automatic updates, and let the patches keep coming.", voice: "/audio/wren/m14c-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A pop-up says a security update is ready. What's the smart move?",
          options: [
            { label: "Install it, updates patch holes attackers exploit", outcome: "good", then: [{ t: "wren", text: "Exactly. Every update you skip leaves a known hole open for anyone who knows about it. Installing it is patching your armour. Best of all, turn on automatic updates so it just happens.", voice: "/audio/wren/m14c-s4-ok.mp3" }] },
            { label: "Ignore it, updates just change things around", outcome: "bad", then: [{ t: "wren", text: "Skipping updates leaves known holes open, and those are exactly what attackers target. Updates are armour, so install them. Try again.", voice: "/audio/wren/m14c-s4-bad.mp3" }] },
            { label: "Put it off forever, it's annoying", outcome: "bad", then: [{ t: "wren", text: "The longer you wait, the longer the hole stays open. That's the un-updated device an attacker walks into. Try again.", voice: "/audio/wren/m14c-s4-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Turn ON automatic updates so your armour stays fresh:",
          switches: [
            { label: "Your phone's system", sub: "patches the whole device", want: true },
            { label: "Your apps", sub: "each one gets fixed too", want: true },
            { label: "Your web browser", sub: "your window to the internet", want: true },
          ],
          ok: "That's locked in. With auto-updates on across your system, apps and browser, holes get patched the moment a fix exists. There's no nagging, and no forgetting.",
          okVoice: "/audio/wren/m14c-s4-q2ok.mp3",
        },
        {
          t: "choose",
          prompt: "Two identical tablets: one is fully updated, one hasn't updated in a year. Which does an attacker go for?",
          options: [
            { label: "The one that hasn't updated, its old holes are still wide open", outcome: "good", then: [{ t: "wren", text: "Exactly. Attackers hunt for known holes, and the un-updated tablet still has every one of them open. Updates are what close the door.", voice: "/audio/wren/m14c-s4-q3ok.mp3" }] },
            { label: "The updated one, it has more features to attack", outcome: "bad", then: [{ t: "wren", text: "Features aren't holes. The attacker wants the unpatched tablet, because its known holes are still open. Try again.", voice: "/audio/wren/m14c-s4-q3bad.mp3" }] },
            { label: "Neither, updates make no difference", outcome: "bad", then: [{ t: "wren", text: "They make all the difference. The un-updated one is the easy target. Try again.", voice: "/audio/wren/m14c-s4-q3bad2.mp3" }] },
          ],
        },
        {
          t: "flip",
          prompt: "GHOSTWRITER has a known exploit for an old hole. Flip the switch, then flip the card to watch him try your device.",
          you: {
            kind: "toggle",
            label: "Your device · simulator",
            sub: "compare a year of skipped updates to being fully patched",
            off: "SIMULATING: a year behind on updates",
            on: "YOUR REAL SETUP: fully updated, auto-updates on",
          },
          them: {
            label: "GHOSTWRITER's exploit attempt",
            whenBad: "HOLE FOUND · known exploit works · device compromised",
            whenGood: "HOLE PATCHED · exploit fails · nothing gets through",
          },
          ask: {
            prompt: "Same exploit, same device model, one gets in and one doesn't. Why?",
            options: [
              { label: "The update already patched that exact hole", outcome: "good" },
              { label: "GHOSTWRITER picked the wrong device", outcome: "bad", then: [{ t: "sys", text: "GHOSTWRITER: right device, right exploit, just already patched" }] },
              { label: "The exploit only works on weekends", outcome: "bad", then: [{ t: "sys", text: "GHOSTWRITER: works any day, on any device that hasn't patched this hole" }] },
            ],
          },
        },
      ],
    },

    /* 5 · the fake installer */
    {
      n: 5,
      title: "The fake installer",
      goal: "GHOSTWRITER dresses malware as a game you want or an update you need.",
      journalNote: "GHOSTWRITER dressing malware as a free game is like a thief wearing a delivery uniform to walk past your front desk. It's the disguise that gets them in, not a broken lock. A scary pop-up or a 'free' download can be the same trick. Judge the source, not the costume.",
      panel: "DOWNLOAD · VERIFY SOURCE",
      learn: [
        { t: "wren", text: "Here's GHOSTWRITER's trick. He takes malware and dresses it up as something you'd happily install. It might be a free version of a game, a pop-up saying you must update now, or a cracked app. He even uses the old lure tricks of urgency and free stuff. The defence is the source. Install only from the official app store or the maker's real site. A download from a random link or a pop-up is a stranger's parcel, so don't open it.", voice: "/audio/wren/m14c-s5-learn.mp3" },
        { t: "sys", text: "POP-UP: \"⚠ Your device is out of date! Download UPDATE.exe from fast-fix-now.net to fix it NOW!\"" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "That pop-up wants you to download UPDATE.exe from fast-fix-now.net. What is it?",
          options: [
            { label: "A fake installer, real updates never come from random pop-ups", outcome: "good", then: [{ t: "wren", text: "Exactly. Real updates come through your device's own settings or the official store. They never come from a scary pop-up linking to some random site. That so-called update is GHOSTWRITER's malware in a hi-vis jacket. Close it, and don't click it.", voice: "/audio/wren/m14c-s5-ok.mp3" }] },
            { label: "A real update, better install it fast", outcome: "bad", then: [{ t: "wren", text: "The urgency and the random site are the tell. Real updates never arrive as a panic pop-up from fast-fix-now.net. That's a fake installer. Try again.", voice: "/audio/wren/m14c-s5-bad.mp3" }] },
            { label: "Harmless, pop-ups can't install anything", outcome: "bad", then: [{ t: "wren", text: "If you click and run that file, it very much can. Only install from official sources, and never from a pop-up's link. Try again.", voice: "/audio/wren/m14c-s5-bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Flip ON only the sources you can trust for a download:",
          switches: [
            { label: "The official app store", sub: "the safe source", want: true },
            { label: "The maker's own website", sub: "also trustworthy", want: true },
            { label: "A random pop-up link", sub: "a stranger's parcel", want: false },
            { label: "A cracked-app site", sub: "malware's home", want: false },
          ],
          ok: "Right. Trust the official store and the maker's real site, and switch off anything from a random link or a cracked-app site.",
          okVoice: "/audio/wren/m14c-s5-q2ok.mp3",
        },
        {
          t: "build",
          prompt: "Tap the THREE warning signs that a download is a fake installer:",
          need: 3,
          parts: [
            { label: "Comes from a random pop-up or link", good: true, sub: "" },
            { label: "Screams that you must act NOW", good: true, sub: "urgency lure" },
            { label: "Promises a free or cracked version", good: true, sub: "free-stuff lure" },
            { label: "Comes from the official app store", good: false, sub: "that's the safe source" },
            { label: "Was made by the app's real maker", good: false, sub: "that's legit" },
          ],
          ok: "That's the fake-installer fingerprint. It's a random source, panic urgency, and a too-good freebie. Spot those three, and you close the lid before it opens.",
          okVoice: "/audio/wren/m14c-s5-q3ok.mp3",
        },
      ],
    },

    /* 6 · GHOSTWRITER's play */
    {
      n: 6,
      title: "Know GHOSTWRITER's play",
      goal: "The malware con runs four moves, and checking source + permissions breaks it.",
      journalNote: "A download from a random link is like a parcel from a stranger with no return address. You don't open it just because it looks exciting. Checking the source and the permissions catches the disguise every time. Always check WHO sent it and WHAT it's asking for.",
      panel: "THREAT MODEL",
      learn: [
        { t: "wren", text: "Let's look at GHOSTWRITER's malware play. It has four moves. First, he dresses the malware as something you want, like a game, an update, or a freebie. Second, he gets you to install it. Third, the malware grabs powers it should never have, like your files, your camera, and your messages. Fourth, it does the damage. And you break it at move two. Install only from official sources, and grant only the powers that fit the job. The malware never gets in, and even if it did, it would get no keys.", voice: "/audio/wren/m14c-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "What's the ONE habit that stops GHOSTWRITER's malware before it ever runs?",
          options: [
            { label: "Only install from official sources", outcome: "good", then: [{ t: "wren", text: "That's the one. Malware has to get installed to do anything, and it lives on random links and pop-ups, not the official store. Stick to official sources and you close the door at move two. Checking permissions is your backup lock.", voice: "/audio/wren/m14c-s6-ok.mp3" }] },
            { label: "Install everything, then delete the bad ones", outcome: "bad", then: [{ t: "wren", text: "By the time it's installed, the damage can be done. You stop it by never letting it in. Install only from official sources. Try again.", voice: "/audio/wren/m14c-s6-bad.mp3" }] },
            { label: "Hope your device catches it", outcome: "bad", then: [{ t: "wren", text: "Don't leave it to hope. The reliable move is your own habit of using official sources only. Try again.", voice: "/audio/wren/m14c-s6-bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Say something slipped through and installed anyway. What's your BACKUP lock that limits the damage?",
          options: [
            { label: "Grant only the powers that fit the job, so it gets no keys", outcome: "good", then: [{ t: "wren", text: "Right. Sticking to official sources is the front door, and matching permissions is the backup lock. Malware that sneaks in still gets no camera, no files, and no keys.", voice: "/audio/wren/m14c-s6-q2ok.mp3" }] },
            { label: "Nothing can be done once it's installed", outcome: "bad", then: [{ t: "wren", text: "There is a backup. Tight permissions mean even installed malware gets no keys. Try again.", voice: "/audio/wren/m14c-s6-q2bad.mp3" }] },
            { label: "Install ten more apps to hide it", outcome: "bad", then: [{ t: "wren", text: "That just adds risk. Your backup lock is careful permissions, not more apps. Try again.", voice: "/audio/wren/m14c-s6-q2bad2.mp3" }] },
          ],
        },
        {
          t: "build",
          prompt: "Tap the TWO habits that break GHOSTWRITER's malware play:",
          need: 2,
          parts: [
            { label: "Install only from official sources", good: true, sub: "blocks it at move two" },
            { label: "Grant only permissions that fit", good: true, sub: "gives it no keys" },
            { label: "Tap 'Allow' on everything", good: false, sub: "hands over the keys" },
            { label: "Install any free app you find", good: false, sub: "invites it in" },
          ],
          ok: "Those two together break the whole play. Official sources stop it getting in, and tight permissions mean it gets nothing even if it does.",
          okVoice: "/audio/wren/m14c-s6-q3ok.mp3",
        },
      ],
    },

    /* 7 · install smart */
    {
      n: 7,
      title: "Install smart",
      goal: "The habit that keeps bad software off your machine for good.",
      journalNote: "The habit that keeps your machine yours is two questions on repeat: is this from a real source, and does it need these powers? Skip either check and GHOSTWRITER gets a way in. Before any install, check the source first, the permissions second.",
      panel: "ACTION PLAN",
      learn: [
        { t: "wren", text: "This last skill is your install habit. One, only ever install from the official store or the maker's real site. Two, check the permissions, grant what fits the job, and deny the rest. Three, keep automatic updates on, so your armour stays fresh. And when something feels off, don't install it. Investigate, or ask an adult. Do these, and your machine stays yours.", voice: "/audio/wren/m14c-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "build",
          prompt: "Build your safe-install habit. Tap the THREE moves that keep bad software out:",
          need: 3,
          parts: [
            { label: "Install only from official sources", good: true, sub: "" },
            { label: "Grant only permissions that fit the job", good: true, sub: "" },
            { label: "Keep automatic updates on", good: true, sub: "" },
            { label: "Download cracked apps from random links", good: false, sub: "malware's home" },
            { label: "Tap 'Allow' on everything", good: false, sub: "hands over the keys" },
          ],
          ok: "That's the whole habit, and it's a strong one. You have official sources, matching permissions, and fresh armour. Bad software can't get in, and anything you do install gets only the keys it truly needs.",
          okVoice: "/audio/wren/m14c-s7-ok.mp3",
          bad: "Careful, you picked a risky one. Cracked apps from random links, or tapping Allow on everything, are exactly how malware gets in. Choose only the three safe moves.",
          badVoice: "/audio/wren/m14c-s7-bad.mp3",
        },
        {
          t: "choose",
          prompt: "An install just feels off: wrong source, way too many permissions. What's the move?",
          options: [
            { label: "Stop, don't install, and investigate or ask an adult", outcome: "good", then: [{ t: "wren", text: "Exactly. A gut feeling that something is off is worth listening to. Stop, investigate, or ask an adult before anything installs.", voice: "/audio/wren/m14c-s7-q2ok.mp3" }] },
            { label: "Install it anyway, you can remove it later", outcome: "bad", then: [{ t: "wren", text: "By then the damage may be done. If it feels off, stop and check first. Try again.", voice: "/audio/wren/m14c-s7-q2bad.mp3" }] },
            { label: "Tap 'Allow' fast to get past the warnings", outcome: "bad", then: [{ t: "wren", text: "Rushing past warnings is how malware gets in. Slow down and investigate. Try again.", voice: "/audio/wren/m14c-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "toggle",
          prompt: "Set your safe-install habit. Flip every switch ON:",
          switches: [
            { label: "Official sources only", sub: "the front door", want: true },
            { label: "Permissions that fit the job", sub: "no spare keys", want: true },
            { label: "Automatic updates on", sub: "fresh armour", want: true },
          ],
          ok: "That's the whole habit, switched on for good. You have trusted sources, matching permissions, and fresh armour. Your machine stays yours.",
          okVoice: "/audio/wren/m14c-s7-q3ok.mp3",
        },
      ],
    },
  ],

  boss: {
    panel: "PENDING INSTALLS · TRIAGE",
    intro: "This is it, Agent. Three things want onto your device right now, and GHOSTWRITER is hiding behind more than one of them. You'll get no hints from me. Check the source and the powers on each one. Then decide whether to install, deny, or investigate.",
    introVoice: "/audio/wren/m14c-boss-intro.mp3",
    phases: [
      {
        name: "The official update",
        steps: [
          { t: "sys", text: "1/3 · SOURCE: your device's own Settings > Software Update · PERMISSIONS: none new" },
          {
            t: "choose",
            prompt: "A security update from your device's own Settings. What do you do?",
            options: [
              { label: "Install it, official source, it's your armour", outcome: "good" },
              { label: "Deny, all updates are suspicious", outcome: "bad", then: [{ t: "sys", text: "REMINDER: this one's from your own Settings, that's the safe source" }] },
              { label: "Download it again from a website first", outcome: "bad", then: [{ t: "sys", text: "REMINDER: it's already here, from the official source" }] },
            ],
          },
        ],
      },
      {
        name: "The 'free' game",
        steps: [
          {
            t: "flip",
            prompt: "Decide, then flip the card to see what GHOSTWRITER does with your answer.",
            you: {
              kind: "choice",
              label: "'FREE FORTNITE V-BUCKS.exe'",
              sub: "free-vbucks-now.link · wants contacts, camera, messages, files",
              prompt: "A 'free v-bucks' app from a random link, wanting contacts, camera, and messages. What do you do?",
              options: [
                { label: "Deny, random source AND powers no game needs. It's malware", outcome: "good" },
                { label: "Install, free v-bucks!", outcome: "bad" },
                { label: "Install, then turn the permissions off after", outcome: "bad" },
              ],
            },
            them: {
              label: "GHOSTWRITER's side",
              whenBad: "INSTALLED · reading your contacts, camera, messages, files…",
              whenGood: "DENIED · never got a single permission",
            },
          },
        ],
      },
      {
        name: "The panic pop-up",
        steps: [
          { t: "sys", text: "3/3 · POP-UP: \"⚠ VIRUS DETECTED! Install SUPER-CLEAN.exe from safe-pc-fix.net NOW!\"" },
          {
            t: "choose",
            prompt: "A pop-up screaming to install SUPER-CLEAN.exe from a random site right now. What do you do?",
            options: [
              { label: "Deny and close it, real warnings never work like this", outcome: "good" },
              { label: "Install it fast before the virus spreads", outcome: "bad", then: [{ t: "sys", text: "GHOSTWRITER: the panic is the trick…" }] },
              { label: "Click to see what it does", outcome: "bad", then: [{ t: "sys", text: "GHOSTWRITER: one click is all I need…" }] },
            ],
          },
        ],
      },
    ],
    win: "That was cleanly done, Agent. You installed the real update from your own settings. You denied the so-called free game that wanted powers no game needs, and you slammed the panic pop-up shut. You checked the source and the powers on every one, and GHOSTWRITER's disguise didn't get a single click. Your machine's still yours.",
    winVoice: "/audio/wren/m14c-boss-win.mp3",
  },

  test: {
    intro: "There's one last thing before I sign this off, and that's the test. The questions are all fresh, there are no hints, and you need most of them right. Put everything you know about controlling what runs on your machine to work. Ready?",
    introVoice: "/audio/wren/m14c-test-intro.mp3",
    passVoice: "/audio/wren/m14c-test-pass.mp3",
    failVoice: "/audio/wren/m14c-test-fail.mp3",
    pass: 11,
    questions: [
      { scenario: "You install an app and tap 'Allow' on its requests.", ask: "What are you really doing?", options: [{ label: "Granting it powers over your device", correct: true }, { label: "Just getting the app, nothing else" }, { label: "Nothing, apps can't reach your stuff" }] },
      { scenario: "A torch app asks for your contacts, texts and location.", ask: "What does that tell you?", options: [{ label: "Those powers don't fit a torch, a red flag", correct: true }, { label: "It needs them for extra features, like a timer" }, { label: "Nothing, all apps need everything to work" }] },
      { scenario: "A map app asks for your location and your microphone.", ask: "Which should you grant?", options: [{ label: "Location only, a map doesn't listen", correct: true }, { label: "Both, so the map works at its very best" }, { label: "Neither, deny everything just to be safe" }] },
      { scenario: "A pop-up offers a security update.", ask: "Why do updates matter?", options: [{ label: "They patch holes that attackers use", correct: true }, { label: "They just move the buttons around" }, { label: "They don't, so it's fine to ignore them" }] },
      { scenario: "\"Your device is out of date! Download UPDATE.exe from fast-fix-now.net!\"", ask: "What is it?", options: [{ label: "A fake installer dressed up as an update", correct: true }, { label: "A real update, best install it quickly" }, { label: "Harmless, pop-ups can't install anything" }] },
      { scenario: "You want to stop malware before it can ever run.", ask: "What's the key habit?", options: [{ label: "Only install from official sources", correct: true }, { label: "Install everything, delete the bad ones" }, { label: "Hope your device catches it" }] },
      { scenario: "You download a new game and it lists the powers it wants before it opens.", ask: "Agreeing to that list does what?", options: [{ label: "Only lets the game download its own pictures" }, { label: "Hands the game real powers over your device", correct: true }, { label: "Nothing, that list is only there for show" }] },
      { scenario: "A calculator app asks to use your microphone and your contacts.", ask: "Does it need them?", options: [{ label: "Yes, every app needs those to work properly" }, { label: "Maybe, so grant them anyway just in case" }, { label: "No, a calculator only works with numbers", correct: true }] },
      { scenario: "A music app asks to use your storage to save songs, and also your location.", ask: "Which should you grant?", options: [{ label: "Storage only, location isn't needed", correct: true }, { label: "Both, just to be safe in case it needs them" }, { label: "Neither, deny everything it asks for" }] },
      { scenario: "You have skipped your favourite app's updates for months.", ask: "What's the risk?", options: [{ label: "Nothing, older versions are safer and steadier" }, { label: "Its known holes stay wide open for attackers", correct: true }, { label: "You just miss out on new colours and stickers" }] },
      { scenario: "A message links you to a \"free\" copy of a paid game on a site you've never heard of.", ask: "What should you think?", options: [{ label: "Grab it fast, before the free offer ends" }, { label: "It's safe, a real person shared it with you" }, { label: "Treat it as a fake installer, it's a lure", correct: true }] },
      { scenario: "A bad app slipped through, but you'd granted it no camera and no file access.", ask: "What limited the damage?", options: [{ label: "Tight permissions, so it got no keys to use", correct: true }, { label: "Nothing, it was already far too late by then" }, { label: "The app fixed itself, so no harm was done" }] },
      { scenario: "You're setting up the habit that keeps bad software off your machine.", ask: "Which set of habits does that?", options: [{ label: "Official store, allow every request, updates off" }, { label: "Official store, permissions that fit, auto-updates on", correct: true }, { label: "Any free app site, permissions that fit, auto-updates on" }] },
      { scenario: "A download looks tempting, but its source and permissions both seem wrong.", ask: "What's the safest response?", options: [{ label: "Install it now, then decide later if it's safe" }, { label: "Rush past the warnings, they're usually wrong" }, { label: "Don't install it, investigate or ask an adult", correct: true }] },
    ],
  },

  debrief: {
    title: "Your machine, your rules.",
    lines: [
      "Seven skills, a batch of trojan installs, and a test, and GHOSTWRITER's disguise never got a click.",
      "You learned an install hands over powers, and to grant only the ones that fit the job.",
      "You made updates your armour, and you spot a fake installer by its source, not its shiny promise.",
    ],
    move:
      "This week, do two things: run any updates that are waiting, and open one app's permissions to check it isn't holding powers it doesn't need. If it is, switch them off.",
  },
};
