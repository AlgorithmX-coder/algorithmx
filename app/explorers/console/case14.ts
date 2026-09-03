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
  accent: "#FFC24B",
  open: [
    "New system, Agent. Every app you install is handed POWERS on your device, your camera, your files, your location. Today you learn to control exactly what you hand over.",
    "GHOSTWRITER is back, and it's stopped writing messages. Now it writes fake installers, malware dressed up as a game you want or an update you need.",
    "Seven skills to control what runs on your machine, then a boss and a test. Let's decide what gets in, and what stays out.",
  ],
  openVoice: ["/audio/wren/m14c-open-1.mp3", "/audio/wren/m14c-open-2.mp3", "/audio/wren/m14c-open-3.mp3"],

  skills: [
    /* 1 · a download is powers */
    {
      n: 1,
      title: "A download is powers",
      goal: "Installing an app hands it real powers on your device. Know what you're granting.",
      panel: "INSTALL · PERMISSIONS",
      learn: [
        { t: "wren", text: "Here's what an install really is. When you add an app, you don't just get the app, you HAND it powers over your device. Permission to use your camera, read your files, see your location, reach your contacts. Some apps genuinely need some of those. But every power you grant is a power that app, or whoever's behind it, now holds. So installing isn't just 'yes'. It's 'here are the keys to these rooms'.", voice: "/audio/wren/m14c-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "What are you really doing when you install an app and tap 'Allow'?",
          options: [
            { label: "Granting it powers, like your camera, files, or location", outcome: "good", then: [{ t: "wren", text: "Exactly. 'Allow' is you handing over keys. Which is fine when the app needs that room, and a problem when it doesn't. From here, you decide which keys it gets, not the app.", voice: "/audio/wren/m14c-s1-ok.mp3" }] },
            { label: "Just getting the app, nothing more", outcome: "bad", then: [{ t: "wren", text: "There's more to it. Each 'Allow' grants a real power over your device. That's the part we're learning to control. Try again.", voice: "/audio/wren/m14c-s1-bad.mp3" }] },
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
          ok: "Right. Camera, files, location, those are real keys to real rooms on your device. Every 'Allow' hands one over.",
          okVoice: "/audio/wren/m14c-s1-q2ok.mp3",
        },
        {
          t: "choose",
          prompt: "A new drawing app opens and requests your camera and microphone. What is that request really?",
          options: [
            { label: "The app asking you to hand over real powers on your device", outcome: "good", then: [{ t: "wren", text: "Exactly. That request is the app reaching for keys, your camera and your mic. Installing is never just getting the app, it is handing over powers.", voice: "/audio/wren/m14c-s1-q3ok.mp3" }] },
            { label: "Just a friendly hello from the app", outcome: "bad", then: [{ t: "wren", text: "It is more than hello, it is a reach for real powers on your device. Try again.", voice: "/audio/wren/m14c-s1-q3bad.mp3" }] },
            { label: "Proof the app is safe and official", outcome: "bad", then: [{ t: "wren", text: "Asking for powers proves nothing about safety, it only shows what it wants to hold. Try again.", voice: "/audio/wren/m14c-s1-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 2 · does it NEED that? */
    {
      n: 2,
      title: "Does it need that?",
      goal: "Judge a permission by one question: does the app need it to do its job?",
      panel: "PERMISSION AUDIT",
      learn: [
        { t: "wren", text: "So how do you decide? One question: does the app actually NEED this power to do its job? A camera app needs the camera, obviously. A map needs your location. But a torch app that wants your contacts, your microphone, and your text messages? A torch turns a light on. It needs none of that. When the powers don't match the job, that's your warning light.", voice: "/audio/wren/m14c-s2-learn.mp3" },
        { t: "sys", text: "APP: 'Super Torch'   REQUESTS:  ☑ Camera flash   ☒ Your contacts   ☒ Your text messages   ☒ Your location" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "'Super Torch' wants your contacts, texts, and location. What does that tell you?",
          options: [
            { label: "It's asking for powers a torch can't possibly need, a red flag", outcome: "good", then: [{ t: "wren", text: "Spot on. A torch needs the flash, full stop. Contacts, texts, location? That's an app harvesting your life under cover of a light switch. Powers that don't match the job are the whole tell.", voice: "/audio/wren/m14c-s2-ok.mp3" }] },
            { label: "It must need them for extra features", outcome: "bad", then: [{ t: "wren", text: "What feature of a torch needs your text messages? None. Those powers don't match the job, that's the red flag. Try again.", voice: "/audio/wren/m14c-s2-bad.mp3" }] },
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
            { label: "Yes, everything needs your location", outcome: "bad", then: [{ t: "wren", text: "Notes are just words, your location adds nothing to them. When a power doesn't fit the job, deny it. Try again.", voice: "/audio/wren/m14c-s2-q3bad.mp3" }] },
            { label: "Maybe, better to allow it just in case", outcome: "bad", then: [{ t: "wren", text: "'Just in case' is how apps collect what they don't need. If the job doesn't need it, it doesn't get it. Try again.", voice: "/audio/wren/m14c-s2-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 3 · grant only what fits */
    {
      n: 3,
      title: "Grant only what fits",
      goal: "Give an app the powers its job needs, deny the rest. You're in charge.",
      panel: "PERMISSIONS · MAP APP",
      learn: [
        { t: "wren", text: "Good news: you're in charge of every switch. You can grant the powers an app truly needs and deny the rest, and change your mind any time. Take a map app. It needs your location to give directions, fair enough. It does NOT need your microphone or your photos to draw a map. So grant the one that fits the job, deny the ones that don't. Let's set it.", voice: "/audio/wren/m14c-s3-learn.mp3" },
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
          ok: "Perfect. Location on, so it can guide you, and everything else off, because a map has no business in your microphone or your photos. Grant what fits the job, deny the rest. That's permission control.",
          okVoice: "/audio/wren/m14c-s3-ok.mp3",
          bad: "Not quite. A map needs your location, but it has no reason to hear you or see your photos. Grant only the one that fits the job.",
          badVoice: "/audio/wren/m14c-s3-bad.mp3",
        },
        {
          t: "choose",
          prompt: "A video-call app asks for your camera and microphone. What should you grant?",
          options: [
            { label: "Both, a video call genuinely needs to see and hear you", outcome: "good", then: [{ t: "wren", text: "Exactly. A video call really does need to see and hear you, so those two fit the job. Granting isn't bad, granting what doesn't fit is.", voice: "/audio/wren/m14c-s3-q2ok.mp3" }] },
            { label: "Neither, deny everything to be safe", outcome: "bad", then: [{ t: "wren", text: "Deny-all breaks the app, a video call truly needs camera and mic to work. Grant what fits the job. Try again.", voice: "/audio/wren/m14c-s3-q2bad.mp3" }] },
            { label: "Camera only, calls don't need sound", outcome: "bad", then: [{ t: "wren", text: "A call with no sound isn't much of a call, it needs the mic too. Grant the powers the job needs. Try again.", voice: "/audio/wren/m14c-s3-q2bad2.mp3" }] },
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
          ok: "Perfect. Camera, saving photos and mic all fit what a camera does. Contacts and location don't, so they get denied. Grant what fits, deny the rest.",
          okVoice: "/audio/wren/m14c-s3-q3ok.mp3",
        },
      ],
    },

    /* 4 · updates are armor */
    {
      n: 4,
      title: "Updates are armour",
      goal: "Updates patch the holes attackers use. The un-updated are the easy targets.",
      panel: "SYSTEM · UPDATES",
      learn: [
        { t: "wren", text: "Now the boring switch that saves you the most: updates. Every app and device has flaws, tiny holes. When one's found, the makers fix it and push out an update, patching the hole. Attackers love the people who never update, because the hole is still wide open for them. So updates aren't nagging, they're armour. Turn on automatic updates and let the patches keep coming.", voice: "/audio/wren/m14c-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A pop-up says a security update is ready. What's the smart move?",
          options: [
            { label: "Install it, updates patch holes attackers exploit", outcome: "good", then: [{ t: "wren", text: "Exactly. Every update you skip leaves a known hole open for anyone who knows about it. Installing it is patching your armour. Best of all, turn on automatic updates so it just happens.", voice: "/audio/wren/m14c-s4-ok.mp3" }] },
            { label: "Ignore it, updates just change things around", outcome: "bad", then: [{ t: "wren", text: "Skipping updates leaves known holes open, and those are exactly what attackers target. Updates are armour, install them. Try again.", voice: "/audio/wren/m14c-s4-bad.mp3" }] },
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
          ok: "Locked in. With auto-updates on across your system, apps and browser, holes get patched the moment a fix exists. No nagging, no forgetting.",
          okVoice: "/audio/wren/m14c-s4-q2ok.mp3",
        },
        {
          t: "choose",
          prompt: "Two identical tablets: one is fully updated, one hasn't updated in a year. Which does an attacker go for?",
          options: [
            { label: "The one that hasn't updated, its old holes are still wide open", outcome: "good", then: [{ t: "wren", text: "Exactly. Attackers hunt for known holes, and the un-updated tablet still has every one of them open. Updates are what close the door.", voice: "/audio/wren/m14c-s4-q3ok.mp3" }] },
            { label: "The updated one, it has more features to attack", outcome: "bad", then: [{ t: "wren", text: "Features aren't holes. The attacker wants the un-patched tablet, its known holes are still open. Try again.", voice: "/audio/wren/m14c-s4-q3bad.mp3" }] },
            { label: "Neither, updates make no difference", outcome: "bad", then: [{ t: "wren", text: "They make all the difference, the un-updated one is the easy target. Try again.", voice: "/audio/wren/m14c-s4-q3bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 5 · the fake installer */
    {
      n: 5,
      title: "The fake installer",
      goal: "GHOSTWRITER dresses malware as a game you want or an update you need.",
      panel: "DOWNLOAD · VERIFY SOURCE",
      learn: [
        { t: "wren", text: "Here's GHOSTWRITER's trick. It takes malware and dresses it up as something you'd happily install: a free version of a game, a 'you must update NOW' pop-up, a cracked app. It even uses the old lure tricks, urgency and free stuff. The defence is the SOURCE. Install only from the official app store or the maker's real site. A download from a random link or a pop-up is a stranger's parcel. Don't open it.", voice: "/audio/wren/m14c-s5-learn.mp3" },
        { t: "sys", text: "POP-UP: \"⚠ Your device is out of date! Download UPDATE.exe from fast-fix-now.net to fix it NOW!\"" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "That pop-up wants you to download UPDATE.exe from fast-fix-now.net. What is it?",
          options: [
            { label: "A fake installer, real updates never come from random pop-ups", outcome: "good", then: [{ t: "wren", text: "Exactly. Real updates come through your device's own settings or the official store, never a scary pop-up linking to some random site. That 'update' is GHOSTWRITER's malware in a hi-vis jacket. Close it, don't click it.", voice: "/audio/wren/m14c-s5-ok.mp3" }] },
            { label: "A real update, better install it fast", outcome: "bad", then: [{ t: "wren", text: "The urgency and the random site are the tell. Real updates never arrive as a panic pop-up from fast-fix-now dot net. That's a fake installer. Try again.", voice: "/audio/wren/m14c-s5-bad.mp3" }] },
            { label: "Harmless, pop-ups can't install anything", outcome: "bad", then: [{ t: "wren", text: "If you click and run that file, it very much can. Only install from official sources, never a pop-up's link. Try again.", voice: "/audio/wren/m14c-s5-bad2.mp3" }] },
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
          ok: "That's the fake-installer fingerprint. Random source, panic urgency, and a too-good freebie. Spot those three and you close the lid before it opens.",
          okVoice: "/audio/wren/m14c-s5-q3ok.mp3",
        },
      ],
    },

    /* 6 · GHOSTWRITER's play */
    {
      n: 6,
      title: "Know GHOSTWRITER's play",
      goal: "The malware con runs four moves, and checking source + permissions breaks it.",
      panel: "THREAT MODEL",
      learn: [
        { t: "wren", text: "See GHOSTWRITER's malware play, four moves. First, dress the malware as something you want, a game, an update, a freebie. Second, get you to install it. Third, grab powers it should never have, your files, your camera, your messages. Fourth, do the damage. And you break it at move two: install only from official sources, and grant only the powers that fit the job. It never gets in, and if it did, it gets no keys.", voice: "/audio/wren/m14c-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "What's the ONE habit that stops GHOSTWRITER's malware before it ever runs?",
          options: [
            { label: "Only install from official sources", outcome: "good", then: [{ t: "wren", text: "That's the one. Malware has to get installed to do anything, and it lives on random links and pop-ups, not the official store. Stick to official sources and you close the door at move two. Checking permissions is your backup lock.", voice: "/audio/wren/m14c-s6-ok.mp3" }] },
            { label: "Install everything, then delete the bad ones", outcome: "bad", then: [{ t: "wren", text: "By the time it's installed, the damage can be done. You stop it by not installing it, only from official sources. Try again.", voice: "/audio/wren/m14c-s6-bad.mp3" }] },
            { label: "Hope your device catches it", outcome: "bad", then: [{ t: "wren", text: "Don't leave it to hope. The reliable move is your own habit: official sources only. Try again.", voice: "/audio/wren/m14c-s6-bad2.mp3" }] },
          ],
        },
        {
          t: "choose",
          prompt: "Say something slipped through and installed anyway. What's your BACKUP lock that limits the damage?",
          options: [
            { label: "Grant only the powers that fit the job, so it gets no keys", outcome: "good", then: [{ t: "wren", text: "Right. Official sources is the front door, and matching permissions is the backup lock. Malware that sneaks in still gets no camera, no files, no keys.", voice: "/audio/wren/m14c-s6-q2ok.mp3" }] },
            { label: "Nothing can be done once it's installed", outcome: "bad", then: [{ t: "wren", text: "There is a backup: tight permissions mean even installed malware gets no keys. Try again.", voice: "/audio/wren/m14c-s6-q2bad.mp3" }] },
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
      panel: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill, your install habit. One, only ever install from the official store or the maker's real site. Two, check the permissions, grant what fits the job, deny the rest. Three, keep automatic updates on so your armour stays fresh. And when something feels off, don't install, investigate or ask an adult. Do these, and your machine stays yours.", voice: "/audio/wren/m14c-s7-learn.mp3" },
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
          ok: "That's the whole habit, and it's a strong one. Official sources, matching permissions, fresh armour. Bad software can't get in, and anything you do install gets only the keys it truly needs.",
          okVoice: "/audio/wren/m14c-s7-ok.mp3",
          bad: "Careful, you picked a risky one. Cracked apps from random links, or blanket 'Allow', are exactly how malware gets in. Choose only the three safe moves.",
          badVoice: "/audio/wren/m14c-s7-bad.mp3",
        },
        {
          t: "choose",
          prompt: "An install just feels off: wrong source, way too many permissions. What's the move?",
          options: [
            { label: "Stop, don't install, and investigate or ask an adult", outcome: "good", then: [{ t: "wren", text: "Exactly. A gut 'this feels off' is worth listening to. Stop, investigate, or ask an adult, before anything installs.", voice: "/audio/wren/m14c-s7-q2ok.mp3" }] },
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
          ok: "That's the whole habit, switched on for good. Trusted sources, matching permissions, fresh armour. Your machine stays yours.",
          okVoice: "/audio/wren/m14c-s7-q3ok.mp3",
        },
      ],
    },
  ],

  boss: {
    panel: "PENDING INSTALLS · TRIAGE",
    intro: "This is it, Agent. Four things want onto your device right now, and one of them is GHOSTWRITER in disguise. No hints from me. Check the source and the powers on each, and decide: install, deny, or investigate.",
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
          { t: "sys", text: "2/3 · 'FREE FORTNITE V-BUCKS.exe' · SOURCE: free-vbucks-now.link · PERMISSIONS: ☒ contacts ☒ camera ☒ messages ☒ files" },
          {
            t: "choose",
            prompt: "A 'free v-bucks' app from a random link, wanting contacts, camera, and messages. What is it?",
            options: [
              { label: "Deny, random source AND powers no game needs. It's malware", outcome: "good" },
              { label: "Install, free v-bucks!", outcome: "bad", then: [{ t: "sys", text: "GHOSTWRITER: yes, install me…" }] },
              { label: "Install, then turn the permissions off after", outcome: "bad", then: [{ t: "sys", text: "GHOSTWRITER: once I'm in, the damage is done…" }] },
            ],
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
    win: "Cleanly done, Agent. You installed the real update from your own settings, denied the 'free' game that wanted powers no game needs, and slammed the panic pop-up shut. You checked the SOURCE and the POWERS on every one, and GHOSTWRITER's disguise didn't get a single click. Your machine's still yours.",
    winVoice: "/audio/wren/m14c-boss-win.mp3",
  },

  test: {
    intro: "Last thing before I sign this off, the test. Six fresh ones, no hints, and you need five right. Everything about controlling what runs on your machine, put it to work. Ready?",
    introVoice: "/audio/wren/m14c-test-intro.mp3",
    passVoice: "/audio/wren/m14c-test-pass.mp3",
    failVoice: "/audio/wren/m14c-test-fail.mp3",
    pass: 5,
    questions: [
      { scenario: "You install an app and tap 'Allow' on its requests.", ask: "What are you really doing?", options: [{ label: "Granting it powers over your device", correct: true }, { label: "Just getting the app, nothing else" }, { label: "Nothing, apps can't reach your stuff" }] },
      { scenario: "A torch app asks for your contacts, texts and location.", ask: "What does that tell you?", options: [{ label: "It wants powers a torch can't need, a red flag", correct: true }, { label: "It needs them for features" }, { label: "All apps need everything" }] },
      { scenario: "A map app asks for your location and your microphone.", ask: "Which should you grant?", options: [{ label: "Location only, a map doesn't need to listen", correct: true }, { label: "Both, to be safe" }, { label: "Neither" }] },
      { scenario: "A pop-up offers a security update.", ask: "Why do updates matter?", options: [{ label: "They patch holes attackers exploit, they're armour", correct: true }, { label: "They just move things around" }, { label: "They don't, ignore them" }] },
      { scenario: "\"Your device is out of date! Download UPDATE.exe from fast-fix-now.net!\"", ask: "What is it?", options: [{ label: "A fake installer, real updates don't come from pop-ups", correct: true }, { label: "A real update, install it fast" }, { label: "Harmless" }] },
      { scenario: "You want to stop malware before it can ever run.", ask: "What's the key habit?", options: [{ label: "Only install from official sources", correct: true }, { label: "Install everything, delete the bad ones" }, { label: "Hope your device catches it" }] },
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
