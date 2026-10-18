/**
 * WREN's spoken scripts for Case 012 ("Unreadable", the Console runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice/failVoice have no text field in case12.ts — recovered by
 * transcription.
 */
export const mission12VoiceScripts = {
  "/audio/wren/m12c-open-1.mp3":
    "[curious] New system to master, Agent. This one's about secrets, how to send a message so that only the right person can read it.",
  "/audio/wren/m12c-open-2.mp3":
    "[serious] PACKRAT is back, and this time it isn't stealing accounts. It's LISTENING, sitting quietly on networks, reading whatever travels past unprotected.",
  "/audio/wren/m12c-open-3.mp3":
    "[determined] Seven skills in codes, keys, and sealed messages, then a boss and a test. Let's make your words unreadable to anyone but the person you meant.",

  // skill 1 — scramble it with a key
  "/audio/wren/m12c-s1-learn.mp3":
    "[curious] Start with the oldest trick in security, a cipher. You scramble a message using a key, a secret rule, and now anyone who grabs it just sees nonsense. Only someone with the key can turn it back. [warm] Here's a baby one, shift every letter forward by one. A becomes B, B becomes C. So the key is 'shift by one'. Let's crack a message that used it.",
  "/audio/wren/m12c-s1-ok.mp3":
    "[proud] Cracked it. I-F-M-M-P shifted back one letter is H-E-L-L-O. With the key, gibberish becomes a message. Without it, PACKRAT just sees IFMMP and learns nothing. That's the whole power of a cipher.",
  "/audio/wren/m12c-s1-q2ok.mp3":
    "[proud] Right. A message plus its key. Without the key it stays gibberish, and that is exactly the point of a cipher.",
  "/audio/wren/m12c-s1-q3ok.mp3":
    "[proud] Perfect. Scramble with the key, and share the key just between you two. A key written on the note is no secret at all.",

  // skill 2 — why real codes hold
  "/audio/wren/m12c-s2-learn.mp3":
    "[curious] That shift cipher is fun, but useless against a computer. There are only 25 shifts, so a machine tries all 25 in a blink. [determined] Real encryption fixes that with a key so enormous, more combinations than atoms in the universe, that not even every computer on Earth working for billions of years could guess it. That's the difference between a toy and a lock.",
  "/audio/wren/m12c-s2-ok.mp3":
    "[proud] Exactly. A tiny number of keys means no key at all to a computer. Strong encryption wins by having so many possible keys that guessing is hopeless. Size is the whole game.",
  "/audio/wren/m12c-s2-bad.mp3":
    "[warm] Computers read letters faster than you ever could. The real weakness is there are only 25 shifts to try. Try again.",
  "/audio/wren/m12c-s2-bad2.mp3":
    "[warm] A shift falls in an instant, only 25 options. Real strength comes from a mountain of possible keys. Try again.",
  "/audio/wren/m12c-s2-q2ok.mp3":
    "[proud] Right. Strength is size, so many possible keys that trying them all is hopeless, even for a computer.",
  "/audio/wren/m12c-s2-q3ok.mp3":
    "[proud] That's it. A mountain of possible keys and a key too long to guess. A handful of options is no protection at all.",

  // skill 3 — the padlock
  "/audio/wren/m12c-s3-learn.mp3":
    "[warm] You don't have to do the encrypting yourself, your browser does it, and it tells you when. See the little padlock, and the s in https? That means the whole conversation between you and that site is sealed, encrypted, unreadable to anyone in between. [determined] No padlock, no s, and the line is wide open. Learn to glance for that padlock, every time you type anything private.",
  "/audio/wren/m12c-s3-ok.mp3":
    "[proud] Right. The s and the padlock mean sealed. On A, with plain http, everything you type travels in the open for anyone listening to read. Padlock first, then type.",
  "/audio/wren/m12c-s3-bad.mp3":
    "[warm] Shorter isn't safer. Plain http has no padlock and no seal, everything you send is readable. Look for the s and the lock. Try again.",
  "/audio/wren/m12c-s3-bad2.mp3":
    "[warm] That padlock is doing real work, it means the line is encrypted. Without it, there's no seal at all. Try again.",
  "/audio/wren/m12c-s3-q2ok.mp3":
    "[proud] Exactly. The padlock and the s in https. Those two, and nothing else, tell you the line is encrypted.",
  "/audio/wren/m12c-s3-q3ok.mp3":
    "[proud] That's the reflex. Padlock first, then type. On a plain http page, whatever you enter travels in the open.",

  // skill 4 — postcards vs envelopes
  "/audio/wren/m12c-s4-learn.mp3":
    "[curious] Here's the picture that makes it click. A message sent without encryption is a postcard, every person who handles it on the way can read the whole thing. A sealed, encrypted message is a letter in an envelope, they can see it's going somewhere, but not what it says. [serious] When PACKRAT listens, postcards are a gift and envelopes are useless. So seal everything that matters.",
  "/audio/wren/m12c-s4-ok.mp3":
    "[proud] Exactly. No envelope, no seal, so every stop between you and the site can read your password in plain sight. Encryption is the envelope. Never post secrets on a postcard.",
  "/audio/wren/m12c-s4-bad.mp3":
    "[warm] Only encryption seals it. On a plain connection your password is a postcard, readable by anyone handling it. Try again.",
  "/audio/wren/m12c-s4-bad2.mp3":
    "[warm] Speed doesn't hide it. Unsealed means readable, however fast it goes. Try again.",
  "/audio/wren/m12c-s4-q2ok.mp3":
    "[proud] Right. Encrypted connections are envelopes, sealed shut. A plain http page is a postcard anyone on the route can read.",
  "/audio/wren/m12c-s4-q3ok.mp3":
    "[proud] Exactly. Anything private, passwords, bank details, private messages, goes in a sealed envelope. Public things don't need one, but secrets always do.",

  // skill 5 — who's on the wi-fi
  "/audio/wren/m12c-s5-learn.mp3":
    "[serious] Now the danger zone, free public wi-fi. On an open network, other people connected to it can try to listen to the traffic flying around, that's PACKRAT's favourite spot. [encouraging] The good news, any site with the padlock is still sealed, even on dodgy wi-fi. The rule is simple. On public wi-fi, stick to padlocked sites, and never send anything private over a connection with no lock.",
  "/audio/wren/m12c-s5-ok.mp3":
    "[proud] That's the safe setup. Padlocked sites stay sealed even here, so those are fine. But a no-lock site on open wi-fi is a postcard read aloud in a crowd, so that switch stays OFF. Good instincts.",
  "/audio/wren/m12c-s5-bad.mp3":
    "[warm] Careful. On open wi-fi, stick to padlocked sites and leave anything private for a network you trust. Turn the risky one back OFF.",
  "/audio/wren/m12c-s5-q2ok.mp3":
    "[proud] Right. Open wi-fi is risky, but a padlocked site stays sealed even there. The lock does its job wherever you are.",
  "/audio/wren/m12c-s5-q2bad.mp3":
    "[warm] The good news is the padlock still seals each site, even on open wi-fi. Try again.",
  "/audio/wren/m12c-s5-q2bad2.mp3":
    "[warm] A wi-fi password doesn't seal your traffic. The site's padlock is what keeps it sealed. Try again.",
  "/audio/wren/m12c-s5-q3ok.mp3":
    "[proud] That's the rule for open wi-fi. Padlocked sites only, and leave anything private for a network you trust.",

  // skill 6 — know PACKRAT's play
  "/audio/wren/m12c-s6-learn.mp3":
    "[serious] See PACKRAT's listening play, four moves. First, sit on an open network, like free cafe wi-fi. Second, quietly capture the traffic flowing past. Third, read anything that isn't sealed, postcards. Fourth, sell what it finds. [determined] And here's how you break it, every padlock turns your postcard into a sealed envelope, so all PACKRAT captures is gibberish. The lock does the whole job.",
  "/audio/wren/m12c-s6-ok.mp3":
    "[proud] That's the defence in a sentence. It can capture all the traffic it likes, but sealed is sealed, all it reads is gibberish. The padlock beat the listener before it even sat down.",
  "/audio/wren/m12c-s6-bad.mp3":
    "[warm] It captured everything just fine, it simply can't read sealed traffic. The padlock is why. Try again.",
  "/audio/wren/m12c-s6-bad2.mp3":
    "[warm] Speed has nothing to do with it. What stops PACKRAT reading your traffic is that it was encrypted. Try again.",
  "/audio/wren/m12c-s6-q2ok.mp3":
    "[proud] That's the whole play. Sit, capture, read the unsealed, sell it. Notice it never has to ask, it just listens.",
  "/audio/wren/m12c-s6-q3ok.mp3":
    "[proud] That's how you beat the play. Padlock everything private, and assume open networks are being watched, because with PACKRAT, they are.",

  // skill 7 — seal your traffic
  "/audio/wren/m12c-s7-learn.mp3":
    "[warm] Last skill, the everyday habit that beats every listener. One, before you type anything private, glance for the padlock. Two, on public wi-fi, stick to padlocked sites and save the private stuff for a network you trust. [encouraging] Do those two things and it doesn't matter who's listening, all they'll ever get is sealed nonsense. Simple, and it protects you for life.",
  "/audio/wren/m12c-s7-ok.mp3":
    "[proud] That's the whole habit, and it's a strong one. Padlock, trusted network, secrets only over a sealed line. Do that and PACKRAT can listen all day and hear nothing.",
  "/audio/wren/m12c-s7-bad.mp3":
    "[warm] Careful, you picked a risky one. A no-lock site or blind trust in free wi-fi is exactly what a listener wants. Choose only the sealing moves.",
  "/audio/wren/m12c-s7-q2ok.mp3":
    "[proud] Exactly. The padlock glance comes first, every time, before a single private letter is typed.",
  "/audio/wren/m12c-s7-q2bad.mp3":
    "[warm] Speed doesn't seal it. Only the padlock does. Check for the lock first. Try again.",
  "/audio/wren/m12c-s7-q2bad2.mp3":
    "[warm] Check first. Once it's sent unsealed, it's already out. Try again.",
  "/audio/wren/m12c-s7-q3ok.mp3":
    "[proud] That's the habit for life. Padlock first, private stuff only on trusted networks, and never anything secret over an open, unlocked line.",

  // boss — "The Intercept"
  "/audio/wren/m12c-boss-intro.mp3":
    "[serious] This is it, Agent. You're on the cafe wi-fi, and PACKRAT is on it too, capturing everything that moves. No hints from me. [determined] Keep your traffic sealed, and tell me exactly why it walks away empty-handed.",
  "/audio/wren/m12c-boss-win.mp3":
    "[excited] Beautifully done, Agent. PACKRAT sat on the network and captured every single thing you sent, and walked away with a fistful of gibberish. Your padlocked connections stayed sealed, you never posted a secret on a postcard, and you didn't fall for the fake 'faster' network. [proud] The listener heard everything, and understood nothing.",

  // test — "Prove it"
  "/audio/wren/m12c-test-intro.mp3":
    "[serious] Last thing before I sign this off, the test. A fresh batch, no hints, and you need to get most of them right. [determined] Everything about keeping things sealed, put it to work. [excited] Ready?",
  "/audio/wren/m12c-test-pass.mp3":
    "[excited] Yes! Everything you sent stayed sealed on your own. [proud] PACKRAT listened all day and learned nothing. Nicely done, Agent.",
  "/audio/wren/m12c-test-fail.mp3":
    "[warm] So close. Don't sweat it. Even pros miss a couple. [encouraging] Take a breath and run it again. You know this.",
};
