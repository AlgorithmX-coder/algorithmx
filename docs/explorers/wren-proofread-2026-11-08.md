# WREN script proofread, 2026-11-08 (Missions 6 to 20)

A line-by-line proofread of every WREN voice script, after the owner caught
"a free Robux generator" spoken as "generators" in Mission 1. Missions 1 to 5
are already fixed (PR #921 for Mission 1, branch feat/wren-block1 for 2 to 5).
Apply the fixes below when each mission is re-scripted to the WREN script
standard; check each one against the screen before changing it. Items marked
**DECIDE** are teaching questions for the owner or Abdullah, not typos.

## Owner decisions (2026-11-08)
1. **Addresses are .com everywhere**, so the Case 1 rule ("the two chunks right before the slash") always finds the owner. No multi-part suffixes (.co.uk, .sch.uk, .org.uk). Mission 5's canteen address is now pay.myschool.com. Still to change, with each case's re-record (its voice reads the address):
   - Case 15: mybank.co.uk becomes mybank.com, and my8ank.co.uk becomes my8ank.com, in console/case15.ts and mission15.mjs.
   - Case 12: the chat line "mybank.co.uk" in console/case12.ts.
2. **Villains are "he".** Cases 11 to 13 change "it" to "he" for SKELETON KEY and PACKRAT.
3. **Test-pass lines stay as they are** (Cases 6, 7, 8 and 10).
4. **Mission 7 Skill 5:** the check question changes from "what did we name the school hamster?" (a school pet is public, like the dog's name Skill 4 warns about) to an inside joke: "what was our team name in the Year 5 quiz?" Priya's real answer is "The Brainy Badgers, obviously". (Not a teacher nickname: Skill 4's right answer already is one.) Update phone/case07.ts lines 228 to 235 and the s5-ok and s5-bad lines (s5-bad becomes "a simple question about a joke you both made up").

## Across the course
- Use "two-step verification" everywhere (Cases 1 and 3 now do).
- **DECIDE:** "ARC": confirm it is said "ark", then add a say-entry if any take spells it.

## Mission 6
- s1-q3bad "Look again. Try again." Drop "Look again."
- s2-q2ok "10 mins": say "ten minutes".
- s4-q2ok "A real Sam" should be "The real Sam".
- s4-q3bad2 "i promise" should be "I promise".

## Mission 7
- s7-learn: "not even if you're only ninety-nine percent sure it's a thief" is backwards. Use "not even if you're ninety-nine percent sure it's really them."
- s7-learn: "you're a rescue" should be "it's a rescue".
- s7-bad2: "gives nothing away for free" reads as pro-arguing. Use "and it wins you nothing."
- Skill 5's hamster question becomes the Year 5 quiz team-name inside joke (see owner decision 4).
- s3-learn: "a different way than" should be "a different way from the one the message came in".

## Mission 8
- s3-q3bad: "specialty" should be "speciality".
- s7-learn: "the rule from last block" should be "the rule from last case".

## Mission 9
- **DECIDE:** Skill 4 lists "the turn" and "the ask" as separate stages; Skill 5 calls the turn "the first ask".

## Mission 10
- test-intro: "before I close the case and your SECRET clearance" should be "and give you your SECRET clearance".
- boss-win: "a real emergency" (it was fake). Use "what sounded like a real emergency".
- "mum" used as a name should be "Mum" (s1-ok, s3-learn, s3-bad, s4-q2ok, s7-ok, s7-bad).
- s2-learn: the comma splice "big emotion, a fake video" should be two sentences.
- s4-learn: "the single most valuable thing in this whole course" clashes with Case 9's blackmail rule. Use "one of the most valuable things".

## Mission 11
- s5-learn: "A code only ever goes in the login box yourself" doesn't parse. Use "You only ever type a code into the login box yourself. Never read it out to a person."
- s1-learn: "forty" should be "forty-one" (s1-q3ok and s3-learn say 41).
- s5-ok: "trying to be the second key" should be "trying to steal your second key".
- s2-bad: "password123": say "password one two three".
- test-pass: "Every defence held on your own" should be "You held every defence on your own".

## Mission 12
- open-2: "this time it isn't stealing accounts". PACKRAT never stole accounts. Use "isn't collecting crumbs from your posts".
- s2-learn: "more combinations than atoms in the universe" is false. Use stars.
- s1-ok: "IFMMP": say it spelled out, I F M M P.
- s4-learn: "envelopes are useless" should be "envelopes are useless to it".
- Single letters (s1-learn "A becomes B", s3-ok "On A"): say "the letter A" or "site A".
- **DECIDE:** "the little padlock, and the s in https". Chrome no longer shows the padlock and hides https.
- test-pass: "stayed sealed on your own" should be "You kept everything you sent sealed, all on your own".

## Mission 13
- s5-ok: "Logging out where you shouldn't be" should be "Logging out of devices you've finished with".
- s3-q2bad: "your real pet" should be "your real pet's name".
- test-pass: "Every door held on your own" should be "You held every door on your own".

## Mission 14
- s6-bad: "You stop it by not installing it, only from official sources" is garbled. Use "by never letting it in: install only from official sources."
- s6-learn: "if it did, it gets no keys" should be "even if it did, it would get no keys".
- s7-learn: "don't install, investigate or ask an adult" should be "don't install it. Investigate, or ask an adult."
- boss-intro: "Four things... one of them is GHOSTWRITER" doesn't match boss-win (three items, two bad).
- s6-q2ok: "Official sources is" should be "Sticking to official sources is".
- s4-q3bad: "un-patched" should be "unpatched".

## Mission 15
- boss-win: "Five pixel-perfect fakes" should be four. In boss-intro, MIMIC didn't build the real page.
- s3-learn: "Fakes hide in details that big to fool a quick glance" doesn't parse.
- s2-q3ok: "A web address has one owner, and it is your bank" should be "Your bank's web address has one owner".
- s2-ok: "A always ends in" should be "A ends in". Say "Address A" and "Address B" for the options.
- open-2: "Your logo, your colours" should be "The logo, the colours".
- s7-q2ok: "a page that appeared" should be "a link someone sent".
- Look-alike spellings (goog1e, gooogle, "an l that's really a 1"): spell them out in a say-entry, or the trick can't be heard.

## Mission 16
- s6-q2ok: "Collect, assemble, sell" drops "package" (four moves).
- s7-bad and s4-bad: "one of those" then two named. Check the options on screen.
- s5-q3ok: "take-downs" should be "takedowns".

## Mission 17
- s7-bad: "one of those" then two named. Check the options on screen.
- s3-q3ok: "one of them away" should be "just one tab away".
- s4-learn: "one cool question" should be "one calm question".

## Mission 18
- open-2: "They call it a recruiter" should be "They call themselves a recruiter".
- s2-ok and s2-bad: "No permission to harm is black hat" is ambiguous. Use "No permission and intent to harm".
- s7-bad: the true statements read as the lies. Split it into "The truth is, ...".
- "COORD" (boss-win in Missions 18 and 19): check how it's said, and add a say-entry.

## Mission 19
- s5-learn: "Stage four and five" should be "Stages four and five".
- s6-learn: "Skepticism" should be "Scepticism".
- s4-q2ok: "a manager" should be "a password manager".
- s2-learn: "a good attacker" should be "a skilled attacker".
- boss-win: "not five separate crooks" clashes with Case 20's four. Use "not separate crooks".

## Mission 20
- s7-q2ok: "stay the analyst instead of becoming one" should be "instead of becoming a rule-breaker yourself".
- test-pass: "kept the Code doing it" should be "kept the Code while doing it".

## Owner proofread, round 2 (2026-11-08)

Applied on feat/wren-block1, voice and screen together:

- SIREN is "he" in Mission 2 (screen-only lines too).
- Mission 17: GHOSTWRITER is "a familiar signature", not new.
- Mission 20: THE FLOOD was never met, so SIREN (Mission 9's scam factory) takes the mass-blast signature. Skill 2 is "The four signatures". Boss intro: "Four signatures you've faced". K-STATIC is "he" once named; before that the coordinator stays "they".
- Mission 7: one wrong-answer line now says "a team name you both made up".
- Mission 5 Skill 6 points to this case's boss (phase three), not "the next case".
- Mission 9 Skill 5: "The turn is the first time they take." The three-sentence blackmail rule stays.
- Mission 11: "two-factor authentication, or 2FA for short. Some apps call it two-step verification." The say map has 2FA = "two F A" (M11, M13). "the 41" is now "the forty-one".
- Mission 12 Skill 3 adds the Chrome sentence: click the address bar and check it starts with https.
- Mission 16 Skill 6 teaches three moves (package folded into sell), matching the board.
- Polish:
  - Boss phases in M3-5 follow M1's "Phase two, the auction." pattern, with eyebrows "Phase 2 · The auction:".
  - Mission 4 says "window" once.
  - Mission 3 says "a name, a year and a symbol".
  - Missions 13-15 test intros end "Ready?".
- Kept on purpose:
  - Real brands in Mission 15 (a lookalike only teaches if the real name is familiar).
  - Shared test-pass and test-fail lines (decision 3).
- Pronunciations confirmed: COORD "co-ord", K-STATIC "Kay Static", ARC "ark".
