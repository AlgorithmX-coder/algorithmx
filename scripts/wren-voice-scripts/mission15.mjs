/**
 * WREN's spoken scripts for Case 015 ("The Real Site", Block 3 finale, the
 * Console runtime). See mission01.mjs, mission06.mjs, and mission11.mjs for
 * conventions. test.passVoice/failVoice have no text field in case15.ts —
 * recovered by transcription. Both are block-finale variants ("Top Secret
 * clearance", "this one really matters"), matching Case 10's Block 2 finale
 * pattern, not the generic template reused by Cases 11-14.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress, and MIMIC is "he". The bank is mybank.com (owner decision:
 * .com everywhere, so the Case 1 rule always finds the owner).
 */
export const mission15VoiceScripts = {
  "/audio/wren/m15c-open-1.mp3":
    "[serious] This is the final system of the block, Agent, and MIMIC has saved his best trick for last. He can build a fake website that looks exactly like the real one, pixel for pixel.",
  "/audio/wren/m15c-open-2.mp3":
    "[serious] The logo, the colours and the login box are all perfect. Type your password into it, and you've handed it straight to the thief. So how do you tell the real site from a perfect copy?",
  "/audio/wren/m15c-open-3.mp3":
    "[serious] You'll learn seven skills, then face a boss and a test to earn your Top Secret clearance. The answer isn't in how the page looks. It's in one place a fake can never copy.",

  // skill 1 — a fake can look perfect
  "/audio/wren/m15c-s1-learn.mp3":
    "[warm] Let's start with the hard truth. Anyone can right-click a real login page and copy every pixel of it. That includes the logo, the colours, and even a little padlock icon drawn on the page. So the way a page looks tells you nothing about whether it's real. A perfect-looking login box can be a thief's box. If your only check is whether it looks right, you've already lost. We need a check the fake can't copy.",
  "/audio/wren/m15c-s1-ok.mp3":
    "[warm] Exactly. The look is the easiest thing in the world to copy, so it proves nothing. Even a padlock drawn on the page is just a picture. We have to check something the copy can't fake, and that's next.",
  "/audio/wren/m15c-s1-bad.mp3":
    "[warm] Looking perfect is exactly what a good fake does. The look can be copied pixel for pixel. Try again.",
  "/audio/wren/m15c-s1-bad2.mp3":
    "[warm] A padlock drawn on the page is just a picture, and anyone can add one. That's not the real check. Try again.",
  "/audio/wren/m15c-s1-q2ok.mp3":
    "[warm] Right. The logo, the colours, even a padlock picture are all copyable, so the look proves nothing. The one thing they cannot copy is the real address.",
  "/audio/wren/m15c-s1-q3ok.mp3":
    "[warm] Exactly. The logo, the colours and the whole login box can all be copied pixel for pixel. So a page looking right means nothing on its own.",

  // skill 2 — the address bar is the truth
  "/audio/wren/m15c-s2-learn.mp3":
    "[warm] Here's the one thing a fake can never truly copy. It's the address bar, which shows the real web address at the very top of your browser. A thief can make the page look like your bank. But they cannot make the address bar show your bank's real domain, because that address belongs to your bank and no one else. So from now on, you don't trust the page. You read the address bar. That's the only place the truth lives.",
  "/audio/wren/m15c-s2-ok.mp3":
    "[warm] Correct. Use the rule from Case 1, where the owner is the last two chunks before the first slash. In Address B, that's secure-login.net. The mybank.com part is just words stuck on the front to fool you. Address A ends in the real domain. The address bar told the truth.",
  "/audio/wren/m15c-s2-bad.mp3":
    "[warm] That's the trap. Take the last two chunks before the first slash, and the real owner is secure-login.net, a stranger. The mybank.com part is just bait glued to the front. Try again.",
  "/audio/wren/m15c-s2-bad2.mp3":
    "[warm] They're not. One is owned by your bank, and the other is owned by secure-login.net. The last two chunks are what count. Try again.",
  "/audio/wren/m15c-s2-q2ok.mp3":
    "[warm] Right. The address bar is the one place a fake cannot fake. The logo and an on-page padlock are only pictures. Always read the bar.",
  "/audio/wren/m15c-s2-q3ok.mp3":
    "[warm] Exactly. Your bank's web address has one owner, so a thief can copy the look but never the true address. That is why the bar is the truth.",

  // skill 3 — read the address, not the page
  "/audio/wren/m15c-s3-learn.mp3":
    "[warm] So the habit is a flip. Most people glance at the page and trust the look. You do the opposite. Ignore the pretty page, and read the address carefully instead. Look for tiny swaps too. A fake might use the number one in place of the letter L, or a zero in place of the letter O. It might add an extra word. Fakes hide in details small enough to slip past a quick glance. A slow read of the address bar beats the best-looking fake there is.",
  "/audio/wren/m15c-s3-ok.mp3":
    "[warm] That was a nice slow read. Address A used the number one instead of the letter L, which is sneaky. Address C bolted the word verify on the end, so its real owner is paypal-verify.com, a stranger. Only Address B is the genuine domain. Details like that are exactly what a careful read catches.",
  "/audio/wren/m15c-s3-q2ok.mp3":
    "[warm] You've got sharp eyes. The address goog1e.com uses the number one, and google-login.com bolts on a word, so a stranger owns it. The address gooogle.com sneaks in an extra letter. Only google.com is real.",
  "/audio/wren/m15c-s3-q3ok.mp3":
    "[warm] Those are the classics. There's the number one for the letter L, a zero for the letter O, and an extra word that hands the site to a stranger. A slow read catches all three.",

  // skill 4 — the manager is a lie detector
  "/audio/wren/m15c-s4-learn.mp3":
    "[warm] Here's a beautiful bonus from the vault you built in Case 11. Your password manager remembers exactly which website each password belongs to. So it will only ever offer to fill your bank password on your bank's real address. Land on a perfect-looking fake, and the manager stays silent, because it doesn't recognise the domain. That silence is a lie detector. If your manager won't fill it, don't type it.",
  "/audio/wren/m15c-s4-ok.mp3":
    "[warm] Exactly. The manager checks the real address, not the look, and it's telling you this isn't the site your password belongs to. Your eyes can be fooled by a perfect copy. The manager can't. Trust the silence.",
  "/audio/wren/m15c-s4-bad.mp3":
    "[warm] Don't override it, because that silence is a warning. The manager won't fill it because the address is wrong. Try again.",
  "/audio/wren/m15c-s4-bad2.mp3":
    "[warm] It's not about speed. The manager stays silent because it doesn't recognise the domain, and that means it's a fake. Try again.",
  "/audio/wren/m15c-s4-q2ok.mp3":
    "[warm] Right. The manager fills only when the domain truly matches, so it stays silent on the copy and the look-alike. Its silence is the alarm.",
  "/audio/wren/m15c-s4-q3ok.mp3":
    "[warm] Exactly. Silence means the domain is wrong, so do not type, and read the bar to confirm. The manager cannot be fooled by a pretty page.",

  // skill 5 — don't be sent, arrive
  "/audio/wren/m15c-s5-learn.mp3":
    "[warm] Here's how you dodge the whole trap before it starts. Most fake sites reach you through a link, in a message, an email, or a pop-up. So the rule is simple. Never log in through a link someone sent you. If you get a message about your bank, don't tap its link. Instead, arrive at your bank yourself. Type the address you know, use your bookmark, or open the app. A link can send you anywhere. Arriving yourself sends you to the real place.",
  "/audio/wren/m15c-s5-ok.mp3":
    "[warm] Perfect. That link could go anywhere, including a flawless fake. By arriving at your bank yourself, you know you're at the real place, and if the warning was real, you'll see it there too. Never let a link do your navigating.",
  "/audio/wren/m15c-s5-bad.mp3":
    "[warm] The urgency is the bait. That link can lead to a perfect fake. Don't tap it. Go to your bank yourself. Try again.",
  "/audio/wren/m15c-s5-bad2.mp3":
    "[warm] The logo can be copied, remember? Don't trust the link at all. Arrive at your bank yourself instead. Try again.",
  "/audio/wren/m15c-s5-q2ok.mp3":
    "[warm] That is arriving. You type it, use a bookmark, or open the app. Each one lands you at the real place. A link lets someone else choose where you go.",
  "/audio/wren/m15c-s5-q3ok.mp3":
    "[warm] Right. Arriving yourself, by address or app, always lands you at the real site. Links in messages let a stranger pick your destination.",

  // skill 6 — know MIMIC's play
  "/audio/wren/m15c-s6-learn.mp3":
    "[warm] Let's look at MIMIC's fake-site play. It has four moves. First, he copies a real login page perfectly. Second, he hosts it on a look-alike address. Third, he sends you a link, so you never check that address. Fourth, he captures whatever you type. And you can break it two ways. Arrive yourself, so no link chooses your address. And read the address bar, so a look-alike can't fool you. Here's one more thing for your dossier, Agent. Every fake site in this block traces back to the same hidden owner. These villains share a workshop.",
  "/audio/wren/m15c-s6-ok.mp3":
    "[warm] That's the one. The page can be a flawless copy, but the address bar shows the true owner. A thief can't put your bank's real address on their site. Read the bar, arrive yourself, and let the manager confirm. The look never fools you again.",
  "/audio/wren/m15c-s6-bad.mp3":
    "[warm] The logo is copied pixel for pixel, so it proves nothing. The address bar is the check that can't be faked. Try again.",
  "/audio/wren/m15c-s6-bad2.mp3":
    "[warm] Speed says nothing about real or fake. The address bar is your reliable check. Try again.",
  "/audio/wren/m15c-s6-q2ok.mp3":
    "[warm] That is the whole con. He copies the page, hosts it on a look-alike, sends a link, and captures your typing. You break it by arriving yourself and reading the bar.",
  "/audio/wren/m15c-s6-q3ok.mp3":
    "[warm] Those two break every move. And remember, every fake in this block traces back to the same hidden owner. These villains share a workshop.",

  // skill 7 — trust the tools
  "/audio/wren/m15c-s7-learn.mp3":
    "[warm] This is the last skill of the block, and it's a calm one. When a login page appears, don't trust your eyes. Trust your tools. One, arrive yourself, never through a link. Two, read the real address in the bar. Three, let your password manager confirm it. If it won't fill, don't type. Do those three, and it doesn't matter how perfect a fake looks. You'll be checking the one thing it can never copy.",
  "/audio/wren/m15c-s7-ok.mp3":
    "[warm] That's the whole habit, and it beats the best fake ever built. Arrive yourself, read the bar, and let the manager confirm. A copy can fool your eyes, but never all three of those. Your Top Secret clearance is coming up.",
  "/audio/wren/m15c-s7-bad.mp3":
    "[warm] Careful, you picked one a fake would love. Trusting the logo or a sent link is exactly how the copy wins. Choose only the three checks it can't survive.",
  "/audio/wren/m15c-s7-q2ok.mp3":
    "[warm] Perfect. You never let a link someone sent choose your destination. Arrive yourself, read the bar, and then let the manager confirm.",
  "/audio/wren/m15c-s7-q2bad.mp3":
    "[warm] The look is the one thing a fake copies perfectly. Trust your tools, not your eyes. Try again.",
  "/audio/wren/m15c-s7-q2bad2.mp3":
    "[warm] Urgency is the bait. Slow down and run your three checks first. Try again.",
  "/audio/wren/m15c-s7-q3ok.mp3":
    "[warm] That is the habit locked in. Arrive yourself, read the bar, and let the manager confirm. Do those three, and no copy, however perfect, will ever fool you.",

  // boss — "Hall of Mirrors"
  "/audio/wren/m15c-boss-intro.mp3":
    "[determined] This is it, Agent, the last case of the block. MIMIC has hidden your bank's real login page among four perfect fakes. All five look exactly the same. You'll get no hints from me. Use the address bar and your manager, and find the real door among the mirrors.",
  "/audio/wren/m15c-boss-win.mp3":
    "[proud] That was flawless, Agent, and what a finish. There were four pixel-perfect fakes, and you walked straight past every one. You read the address bar instead of the page, you trusted your manager's silence, and you refused to be led by a link. MIMIC built a hall of mirrors, and you found the one real door with your eyes shut. You've mastered the whole Systems block. Top Secret clearance is yours.",

  // test — "Prove it" (block finale)
  "/audio/wren/m15c-test-intro.mp3":
    "[warm] There's one last thing before your Top Secret clearance, and that's the test. The scenarios are fresh, there are no hints, and you'll need most of them right. This is your promotion, so read carefully and think. Ready?",
  "/audio/wren/m15c-test-pass.mp3":
    "[proud] Yes! Fake after fake came at you, and you saw through every one on your own. Your Top Secret clearance is confirmed, Agent. The whole Systems block is yours. I'm proud of you.",
  "/audio/wren/m15c-test-fail.mp3":
    "[warm] That was so close, and this one really matters. Don't sweat it. Even pros miss a couple. Take a breath, and run it again. You've got this.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
// The look-alikes are spelled out, so the swapped or extra letter can be heard.
export const mission15Say = {
  "goog1e": "g, o, o, g, one, e",
  "gooogle": "g, o, o, o, g, l, e",
};
