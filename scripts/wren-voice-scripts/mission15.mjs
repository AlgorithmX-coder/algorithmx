/**
 * WREN's spoken scripts for Case 015 ("The Real Site", Block 3 finale, the
 * Console runtime). See mission01.mjs, mission06.mjs, and mission11.mjs for
 * conventions. test.passVoice/failVoice have no text field in case15.ts —
 * recovered by transcription. Both are block-finale variants ("TOP SECRET
 * clearance", "this one really matters"), matching Case 10's Block 2 finale
 * pattern, not the generic template reused by Cases 11-14.
 */
export const mission15VoiceScripts = {
  "/audio/wren/m15c-open-1.mp3":
    "[serious] Final system of the block, Agent, and MIMIC has saved its best trick for last. It can build a fake website that looks EXACTLY like the real one. Pixel for pixel.",
  "/audio/wren/m15c-open-2.mp3":
    "[concerned] Your logo, your colours, your login box, perfect. Type your password into it and you've handed it straight to the thief. So how do you tell the real site from a perfect copy?",
  "/audio/wren/m15c-open-3.mp3":
    "[determined] Seven skills, then a boss and a test to earn your TOP SECRET clearance. The answer isn't in how the page looks. It's in one place a fake can never copy.",

  // skill 1 — a fake can look perfect
  "/audio/wren/m15c-s1-learn.mp3":
    "[serious] Start with the hard truth. Anyone can right-click a real login page and copy every pixel of it, the logo, the colours, the little padlock icon drawn ON the page. So the way a page LOOKS tells you nothing about whether it's real. [warm] A perfect-looking login box can be a thief's box. If your only check is 'it looks right', you've already lost. We need a check the fake can't copy.",
  "/audio/wren/m15c-s1-ok.mp3":
    "[proud] Exactly. The look is the easiest thing in the world to copy, so it proves nothing. Even a padlock drawn on the page is just a picture. We have to check something the copy can't fake, and that's next.",
  "/audio/wren/m15c-s1-bad.mp3":
    "[warm] Looking perfect is exactly what a good fake does. The look can be copied pixel for pixel. Try again.",
  "/audio/wren/m15c-s1-bad2.mp3":
    "[warm] A padlock drawn on the page is just a picture, anyone can add one. That's not the real check. Try again.",
  "/audio/wren/m15c-s1-q2ok.mp3":
    "[proud] Right. The logo, the colours, even a padlock picture are all copyable, so the look proves nothing. The one thing they cannot copy is the real address.",
  "/audio/wren/m15c-s1-q3ok.mp3":
    "[proud] Exactly. Logo, colours, the whole login box, all copyable pixel for pixel. So a page looking right means nothing on its own.",

  // skill 2 — the address bar is the truth
  "/audio/wren/m15c-s2-learn.mp3":
    "[curious] Here's the one thing a fake can never truly copy: the address bar, the real web address at the very top of your browser. A thief can make the PAGE look like your bank, but they cannot make the address bar say your bank's real domain, because that address belongs to your bank and no one else. [determined] So from now on, you don't trust the page. You read the address bar. That's the only place the truth lives.",
  "/audio/wren/m15c-s2-ok.mp3":
    "[proud] Correct. Read a web address right to left, like you learned in Case 1. In B, the real owner is 'secure-login.net', and 'mybank.co.uk' is just words stuck on the front to fool you. A always ends in the real domain. The address bar told the truth.",
  "/audio/wren/m15c-s2-bad.mp3":
    "[warm] That's the trap. Read it right to left: the real owner is secure-login.net, a stranger. 'mybank.co.uk' is just bait glued to the front. Try again.",
  "/audio/wren/m15c-s2-bad2.mp3":
    "[warm] They're not. One is owned by your bank, the other by secure-login.net. The ending is what counts. Try again.",
  "/audio/wren/m15c-s2-q2ok.mp3":
    "[proud] Right. The address bar is the one place a fake cannot fake. The logo and an on-page padlock are only pictures. Read the bar, always.",
  "/audio/wren/m15c-s2-q3ok.mp3":
    "[proud] Exactly. A web address has one owner, and it is your bank, so a thief can copy the look but never the true address. That is why the bar is the truth.",

  // skill 3 — read the address, not the page
  "/audio/wren/m15c-s3-learn.mp3":
    "[warm] So the habit is a flip. Most people glance at the page and trust the look. You do the opposite: ignore the pretty page, and read the address carefully instead. [curious] Look for tiny swaps too, an l that's really a 1, an o that's a zero, an extra word. Fakes hide in details that big to fool a quick glance. A slow read of the address bar beats the best-looking fake there is.",
  "/audio/wren/m15c-s3-ok.mp3":
    "[proud] Nice slow read. A used a number 1 instead of an l, sneaky. C bolted 'verify' on the end, so its real owner is 'paypal-verify.com', a stranger. Only B is the genuine domain. Details like that are exactly what a careful read catches.",
  "/audio/wren/m15c-s3-q2ok.mp3":
    "[proud] Sharp eyes. goog1e uses a number 1, google-login bolts on a word so a stranger owns it, and gooogle sneaks in a letter. Only google.com is real.",
  "/audio/wren/m15c-s3-q3ok.mp3":
    "[proud] Those are the classics: a 1 for an l, a 0 for an o, and an extra word that hands the site to a stranger. A slow read catches all three.",

  // skill 4 — the manager is a lie detector
  "/audio/wren/m15c-s4-learn.mp3":
    "[excited] Here's a beautiful bonus from the vault you built in Case 11. Your password manager remembers exactly which website each password belongs to. So it will only ever offer to fill your bank password on your bank's REAL address. [serious] Land on a perfect-looking fake, and the manager stays silent, it doesn't recognise the domain. That silence is a lie detector. If your manager won't fill it, don't type it.",
  "/audio/wren/m15c-s4-ok.mp3":
    "[proud] Exactly. The manager checks the real address, not the look, and it's telling you this isn't the site your password belongs to. Your eyes can be fooled by a perfect copy. The manager can't. Trust the silence.",
  "/audio/wren/m15c-s4-bad.mp3":
    "[warm] Don't override it, that silence is a warning. The manager won't fill because the address is wrong. Try again.",
  "/audio/wren/m15c-s4-bad2.mp3":
    "[warm] It's not about speed. The manager stays silent because it doesn't recognise the domain, meaning it's a fake. Try again.",
  "/audio/wren/m15c-s4-q2ok.mp3":
    "[proud] Right. The manager fills only when the domain truly matches, so it stays silent on the copy and the look-alike. Its silence is the alarm.",
  "/audio/wren/m15c-s4-q3ok.mp3":
    "[proud] Exactly. Silence means the domain is wrong, so do not type, and read the bar to confirm. The manager cannot be fooled by a pretty page.",

  // skill 5 — don't be sent, arrive
  "/audio/wren/m15c-s5-learn.mp3":
    "[determined] Here's how you dodge the whole trap before it starts. Most fake sites reach you through a link, in a message, an email, a pop-up. So the rule is simple: never log in through a link someone sent you. [encouraging] If you get a message about your bank, don't tap its link. Instead, ARRIVE at your bank yourself, type the address you know, use your bookmark, or open the app. A link can send you anywhere. Arriving yourself sends you to the real place.",
  "/audio/wren/m15c-s5-ok.mp3":
    "[proud] Perfect. That link could go anywhere, including a flawless fake. By arriving at your bank yourself, you know you're at the real place, and if the warning was real, you'll see it there too. Never let a link do your navigating.",
  "/audio/wren/m15c-s5-bad.mp3":
    "[warm] Urgent is the bait. That link can lead to a perfect fake. Don't tap it, go to your bank yourself. Try again.",
  "/audio/wren/m15c-s5-bad2.mp3":
    "[warm] The logo can be copied, remember? Don't trust the link at all, arrive at your bank yourself instead. Try again.",
  "/audio/wren/m15c-s5-q2ok.mp3":
    "[proud] That is arriving: type it, use a bookmark, or open the app. Each one lands you at the real place. A link lets someone else choose where you go.",
  "/audio/wren/m15c-s5-q3ok.mp3":
    "[proud] Right. Arriving yourself, by address or app, always lands you at the real site. Links in messages let a stranger pick your destination.",

  // skill 6 — know MIMIC's play
  "/audio/wren/m15c-s6-learn.mp3":
    "[serious] See MIMIC's fake-site play, four moves. First, copy a real login page perfectly. Second, host it on a look-alike address. Third, send you a link so you never check that address. Fourth, capture whatever you type. [determined] And you break it two ways: arrive yourself so no link chooses your address, and read the address bar so a look-alike can't fool you. [curious] One more thing for your dossier, Agent. Every fake site in this block traces back to the SAME hidden owner. These villains share a workshop.",
  "/audio/wren/m15c-s6-ok.mp3":
    "[proud] That's the one. The page can be a flawless copy, but the address bar shows the true owner, and a thief can't put your bank's real address on their site. Read the bar, arrive yourself, let the manager confirm. The look never fools you again.",
  "/audio/wren/m15c-s6-bad.mp3":
    "[warm] The logo is copied pixel for pixel, it proves nothing. The address bar is the check that can't be faked. Try again.",
  "/audio/wren/m15c-s6-bad2.mp3":
    "[warm] Speed says nothing about real or fake. The address bar is your reliable check. Try again.",
  "/audio/wren/m15c-s6-q2ok.mp3":
    "[proud] That is the whole con: copy, host on a look-alike, send a link, capture your typing. You break it by arriving yourself and reading the bar.",
  "/audio/wren/m15c-s6-q3ok.mp3":
    "[proud] Those two break every move, and remember: every fake in this block traces back to the same hidden owner. These villains share a workshop.",

  // skill 7 — trust the tools
  "/audio/wren/m15c-s7-learn.mp3":
    "[warm] Last skill of the block, and it's a calm one. When a login page appears, don't trust your eyes, trust your tools. One, arrive yourself, never through a link. Two, read the real address in the bar. Three, let your password manager confirm, if it won't fill, don't type. [encouraging] Do those three, and it doesn't matter how perfect a fake looks. You'll be checking the one thing it can never copy.",
  "/audio/wren/m15c-s7-ok.mp3":
    "[proud] That's the whole habit, and it beats the best fake ever built. Arrive yourself, read the bar, let the manager confirm. A copy can fool your eyes, but never all three of those. [excited] TOP SECRET clearance, coming up.",
  "/audio/wren/m15c-s7-bad.mp3":
    "[warm] Careful, you picked one a fake would love. Trusting the logo or a sent link is exactly how the copy wins. Choose only the three checks it can't survive.",
  "/audio/wren/m15c-s7-q2ok.mp3":
    "[proud] Perfect. You never let a page that appeared choose your destination. Arrive yourself, read the bar, then let the manager confirm.",
  "/audio/wren/m15c-s7-q2bad.mp3":
    "[warm] The look is the one thing a fake copies perfectly. Trust your tools, not your eyes. Try again.",
  "/audio/wren/m15c-s7-q2bad2.mp3":
    "[warm] Urgency is the bait. Slow down and run your three checks first. Try again.",
  "/audio/wren/m15c-s7-q3ok.mp3":
    "[proud] That is the habit locked in: arrive yourself, read the bar, let the manager confirm. Do those three and no copy, however perfect, ever fools you.",

  // boss — "Hall of Mirrors"
  "/audio/wren/m15c-boss-intro.mp3":
    "[serious] This is it, Agent, the last case of the block. MIMIC has built five login pages that all look exactly like your bank. Only one is real. No hints from me. [determined] Use the address bar and your manager, and find the real door among the mirrors.",
  "/audio/wren/m15c-boss-win.mp3":
    "[excited] Flawless, Agent, and what a finish. Five pixel-perfect fakes, and you walked straight past every one, because you read the address bar instead of the page, you trusted your manager's silence, and you refused to be led by a link. [proud] MIMIC built a hall of mirrors, and you found the one real door with your eyes shut. That's the whole SYSTEMS block, mastered. TOP SECRET clearance is yours.",

  // test — "Prove it" (block finale)
  "/audio/wren/m15c-test-intro.mp3":
    "[serious] Last thing before your TOP SECRET clearance, the test. Fresh scenarios, no hints, and you'll need most of them right. This is your promotion, so read carefully and think. [excited] Ready?",
  "/audio/wren/m15c-test-pass.mp3":
    "[excited] Yes! Five perfect fakes, and you saw through every one on your own. [proud] TOP SECRET clearance, Agent. The whole Systems block is yours. I'm proud of you.",
  "/audio/wren/m15c-test-fail.mp3":
    "[warm] So close, and this one really matters. Don't sweat it. Even pros miss a couple. [encouraging] Take a breath and run it again. You've got this.",
};
