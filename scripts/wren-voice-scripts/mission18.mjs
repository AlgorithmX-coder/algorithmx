/**
 * WREN's spoken scripts for Case 018 ("The Recruiter", the WarRoom runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice/failVoice have no text field in case18.ts — recovered by
 * transcription; failVoice is a case-specific variant ("you know your line").
 *
 * SAFEGUARDING: this case covers the recruitment-con / ethics content
 * (curriculum M18, scam-framed per safeguarding policy). Delivery stays
 * calm and careful, never playful or flippant, matching the on-screen
 * text's own non-shaming framing (same convention as mission09.mjs skill 7).
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role ([warm], [proud] only for boss-win and
 * test-pass, [determined] for boss-intro, [serious] for the opening),
 * complete sentences, no quote marks, no capitals for stress. The safety
 * message is unchanged: stop, say no, and tell a trusted adult.
 */
export const mission18VoiceScripts = {
  "/audio/wren/m18w-open-1.mp3":
    "[serious] This is a sensitive one today, Agent, so I want you sharp. You've learned real skills in this programme, and skills are power. Power can protect people, or it can hurt them. The difference is a choice you make.",
  "/audio/wren/m18w-open-2.mp3":
    "[serious] Out there, some people go looking for talented kids, and try to pull that power the wrong way. They call themselves a recruiter or a team, and they call it an offer. It's a con, and it uses the very influence levers you already know.",
  "/audio/wren/m18w-open-3.mp3":
    "[serious] You'll learn seven skills for doing this right, spotting a bad offer, and getting out safely, then face a boss and a test. And here's a promise up front. Whenever an offer feels off, the answer is always to tell a trusted adult.",

  // skill 1 — same skill, two paths
  "/audio/wren/m18w-s1-learn.mp3":
    "[warm] Start with the big idea, which is dual-use. The same skill can do good or harm. Knowing how a lock works helps a locksmith help people, and helps a burglar break in. It's not the skill that's good or bad. It's what you do with it. Two things decide which path you're on. The first is permission. Do you have the owner's okay? The second is intent. Are you trying to help, or to take? Keep those two straight, and you'll almost always know the right move.",
  "/audio/wren/m18w-s1-ok.mp3":
    "[warm] Exactly. With the owner's permission and the goal of helping, testing a system is a real job people get paid for. Without permission, the same actions are just breaking in. It comes down to consent and intent, every time.",
  "/audio/wren/m18w-s1-bad.mp3":
    "[warm] Cleverness doesn't make it right. A brilliant break-in is still a break-in. What matters is permission and intent. Try again.",
  "/audio/wren/m18w-s1-bad2.mp3":
    "[warm] Not getting caught doesn't make something okay. It just means you weren't caught. Judge it by permission and intent. Try again.",
  "/audio/wren/m18w-s1-q2ok.mp3":
    "[warm] Right. Permission and a helping intent are what make it okay. Being clever or secret has nothing to do with it.",
  "/audio/wren/m18w-s1-q3ok.mp3":
    "[warm] Exactly. With permission and a helping goal, it's a job. Without them, the same actions are just breaking in.",

  // skill 2 — white, grey, black
  "/audio/wren/m18w-s2-learn.mp3":
    "[warm] People in security talk about hats. A white hat tests systems with permission and reports what they find. That's a real, respected job. A black hat breaks in without permission to steal or damage, and that's a crime. And grey hat is the risky middle. Grey hats poke at systems uninvited, even if they mean no harm, which is still against the rules and can get them in serious trouble. Aim to be a white hat, always. Let's sort a few.",
  "/audio/wren/m18w-s2-ok.mp3":
    "[warm] That's the map. Permission and intent to help is white hat, and that's a real career. No permission and intent to harm is black hat, and that's a crime. And poking around out of curiosity, without permission, is grey hat. It's still off-limits, and still risky. When in doubt, get permission or don't touch it.",
  "/audio/wren/m18w-s2-bad.mp3":
    "[warm] Not quite. The test is permission and intent. Hired and helping is white. No permission and intent to harm is black. Uninvited curiosity is grey. Try again.",
  "/audio/wren/m18w-s2-q2ok.mp3":
    "[warm] Exactly. White hat is the real, respected job. Permission comes first, and you help by reporting flaws. That's the path to aim for.",
  "/audio/wren/m18w-s2-q2bad.mp3":
    "[warm] Grey hat is still against the rules, even with good intentions, and it can land you in serious trouble. Aim for white hat. Try again.",
  "/audio/wren/m18w-s2-q2bad2.mp3":
    "[warm] That's a crime, plain and simple. The path to aim for is white hat, which means permission and helping. Try again.",
  "/audio/wren/m18w-s2-q3ok.mp3":
    "[warm] Right. Get permission first, then report what you find. That's the white hat, and it's a real career.",

  // skill 3 — found a flaw? report it
  "/audio/wren/m18w-s3-learn.mp3":
    "[warm] Here's what a real good guy does. Say you accidentally notice a weakness, like a login that lets you see other people's info, or a door left unlocked online. The right move is responsible disclosure. Quietly tell the owner or a trusted adult so they can fix it. Don't use it, don't brag about it, and don't post it publicly where crooks can grab it. Reporting a flaw makes you the hero. Exploiting it makes you the villain. It's the same discovery, with the opposite choice.",
  "/audio/wren/m18w-s3-ok.mp3":
    "[warm] That's exactly right, and it's genuinely admirable. You tell someone who can fix it, you don't snoop, and you don't share it around. That's responsible disclosure, the mark of a real white hat.",
  "/audio/wren/m18w-s3-bad.mp3":
    "[warm] A door being open doesn't make walking through it okay. Looking at private data without permission is the wrong side of the line. Report it instead. Try again.",
  "/audio/wren/m18w-s3-bad2.mp3":
    "[warm] Posting it publicly hands the flaw to every crook before it's fixed, and hurts the very people whose data is exposed. Report it privately. Try again.",
  "/audio/wren/m18w-s3-q2ok.mp3":
    "[warm] That's it. Report it privately, don't use it, and don't post it. It's the same discovery, and the hero's choice.",
  "/audio/wren/m18w-s3-q3ok.mp3":
    "[warm] See the fork? Reporting protects people. Using or posting it hurts them. Report it every time.",

  // skill 4 — the recruiter's levers
  "/audio/wren/m18w-s4-learn.mp3":
    "[warm] Now for the con. A bad recruiter is someone trying to pull your skills the wrong way, and they don't ask you to come and do crime. They flatter you, they promise easy money, and they call it just a test. They swear you to secrecy, and they whisper that it's us versus them, and that the rules are for suckers. Do you recognise those? They're the exact influence levers you learned earlier, dressed up as an offer. When you feel a lever being pulled, that is the warning. Let's connect the pitch to the lever.",
  "/audio/wren/m18w-s4-ok.mp3":
    "[warm] Do you see it clearly now? Flattery, easy money and secrecy are influence levers, the same ones you learned to spot in a scam. A real opportunity doesn't need to butter you up or swear you to silence. When you feel a lever, slow down and tell someone.",
  "/audio/wren/m18w-s4-bad.mp3":
    "[warm] Not quite. Flattery hooks your ego. Easy money is the reward lever. And asking you to tell no one is the secrecy lever that isolates you. Match them up. Try again.",
  "/audio/wren/m18w-s4-q2ok.mp3":
    "[warm] Exactly. Feeling a lever pulled is the warning. A real opportunity doesn't need to butter you up or swear you to silence.",
  "/audio/wren/m18w-s4-q2bad.mp3":
    "[warm] Flattery and secrecy are influence levers, not proof it's real. When you feel them, slow down and tell someone. Try again.",
  "/audio/wren/m18w-s4-q2bad2.mp3":
    "[warm] Secrecy is the lever doing its job, cutting you off from help. The move is to tell a trusted adult. Try again.",
  "/audio/wren/m18w-s4-q3ok.mp3":
    "[warm] That's the pitch laid bare. Flattery, easy money and secrecy are the same levers as any scam, dressed up as an offer.",

  // skill 5 — red flags of a bad offer
  "/audio/wren/m18w-s5-learn.mp3":
    "[warm] So how do you spot a bad offer fast? Look for these red flags. It's secret, and you're told to tell no one. It's urgent, and you have to decide right now. It pays you for access, or for doing something against the rules. And it needs you to break a rule, or hide it from a trusted adult. A real, honest opportunity is the opposite. It's fine in daylight, an adult can know about it, and it never asks you to harm anyone. Let's pin the warning signs.",
  "/audio/wren/m18w-s5-ok.mp3":
    "[warm] That's the alarm set. If you see secrecy, pressure, or payment for access or rule-breaking, any one of those means you walk away and tell someone. The two you left are actually the signs of an honest offer. It survives daylight and welcomes an adult.",
  "/audio/wren/m18w-s5-bad.mp3":
    "[warm] Careful, two of those are good signs. An honest offer is happy for an adult to know, and tells you exactly who they are. Pin only the warning signs, which are secrecy, pressure, and paying for access.",
  "/audio/wren/m18w-s5-q2ok.mp3":
    "[warm] Right, that's the red flag. Secrecy plus pressure is the tell. An honest offer is happy to wait and happy for an adult to know.",
  "/audio/wren/m18w-s5-q2bad.mp3":
    "[warm] That's actually a good sign, because an honest offer welcomes a trusted adult. Look for the one pushing secrecy and speed. Try again.",
  "/audio/wren/m18w-s5-q2bad2.mp3":
    "[warm] That's an honest sign, not a red flag. The warning is the message demanding secrecy and a snap decision. Try again.",
  "/audio/wren/m18w-s5-q3ok.mp3":
    "[warm] That's the alarm. If there's secrecy, pressure, or money for access, any one of them means you walk away and tell someone.",

  // skill 6 — know the recruiter's play
  "/audio/wren/m18w-s6-learn.mp3":
    "[warm] Let's see the recruiter's play. It has five moves, and it's a slow one, which is why it's dangerous. First, they spot talent, and find a skilled kid. Second, they flatter you, and make you feel special and understood. Third comes the small ask, something tiny and almost harmless. Fourth comes the bigger ask. Now that you've done one, why not more? Fifth, you're trapped. They tell you that you already helped, so you can't back out now. Here's your power. It all collapses if you refuse the small ask and tell a trusted adult. There's no such thing as too late to stop. Refuse early, and there's nothing to trap you with.",
  "/audio/wren/m18w-s6-ok.mp3":
    "[warm] That's the move, and it works every time. The small ask is the hook for the big one. Say no to the first step and tell someone, and the trap has nothing to grip. You're never in too deep to stop.",
  "/audio/wren/m18w-s6-bad.mp3":
    "[warm] The tiny favour is the whole point. It's the first link they use to pull you towards bigger ones. Refuse it and tell an adult. Try again.",
  "/audio/wren/m18w-s6-bad2.mp3":
    "[warm] Secrecy is exactly the trap. The one thing that breaks their play is bringing a trusted adult in. Try again.",
  "/audio/wren/m18w-s6-q2ok.mp3":
    "[warm] That's the slow play. It only works if you take the small ask, so that's exactly where you refuse.",
  "/audio/wren/m18w-s6-q3ok.mp3":
    "[warm] Right. Refuse the first step and tell someone, and the trap has nothing to grip. You're never in too deep to stop.",

  // skill 7 — your line, your exit
  "/audio/wren/m18w-s7-learn.mp3":
    "[warm] This is the last skill, and it's the most important in the whole programme. You decide who you are. Your skills are real, and the good path is wide open. Ethical hacking is a genuine, respected, well-paid job. So set your line now, before anyone tests it. Tell yourself this. I don't harm people, I don't do it in secret, and I don't work without permission. And always keep your exit. Whenever an offer feels off, you stop, you say no, and you tell a trusted adult. There's no shame, and it's never too late. That exit is always open.",
  "/audio/wren/m18w-s7-ok.mp3":
    "[warm] That's your line, and it'll keep you safe and on the right side for the rest of your life. It's permission, no harm, no secrets, and an exit that's always open. You're not just skilled now, Agent. You're trustworthy. That's rarer and worth more.",
  "/audio/wren/m18w-s7-bad.mp3":
    "[warm] Careful, two of those are lies a recruiter tells. The truth is, you can always back out, and cleverness never puts you above the rules. Pin only the true parts of holding your line.",
  "/audio/wren/m18w-s7-q2ok.mp3":
    "[warm] That's the exit, and it's always open. There's no shame, and it's never too late. Stop, say no, and bring in a trusted adult.",
  "/audio/wren/m18w-s7-q2bad.mp3":
    "[warm] You can always back out, and that's the whole point of an exit. Stop and tell an adult. Try again.",
  "/audio/wren/m18w-s7-q2bad2.mp3":
    "[warm] Secrecy keeps you alone with them, and that's not safe. Telling a trusted adult is the exit. Try again.",
  "/audio/wren/m18w-s7-q3ok.mp3":
    "[warm] That's your line beating their lies. You chose permission over rule-breaking, daylight over secrecy, and an exit that's always open.",

  // boss — "The Offer"
  "/audio/wren/m18w-boss-intro.mp3":
    "[determined] This is it, Agent, and it's personal. A slick fake recruiter has been watching your work, and now they're in your messages with an offer. It's going to sound flattering and easy. Read the levers, spot the red flags, and find your exit. You'll get no hints from me. Remember your line.",
  "/audio/wren/m18w-boss-win.mp3":
    "[proud] That's the strongest thing you've done in this whole programme, Agent. A recruiter pulled every lever, from flattery to easy money to secrecy, and pushed the classic small-ask trap. And you named every lever, refused the first step, and walked straight out the exit to a trusted adult. Your skills are real, and now everyone can see you can be trusted with them. That's what makes a true white hat. And there's one more thing. The way that offer was run, with the levers and the patience, matches a hand we've been tracking. That hand belongs to COORD. Keep that in mind.",

  // test — "Prove it"
  "/audio/wren/m18w-test-intro.mp3":
    "[warm] There's one last thing before I sign this off, and that's the test. The scenarios are all fresh, there are no hints, and you'll need a clear pass. Put everything you know about doing this right and getting out safely to work. Ready?",
  "/audio/wren/m18w-test-pass.mp3":
    "[proud] Yes. You held your line under real pressure, and found the exit every time. You're not just skilled now, Agent. You're trustworthy. That's the whole point.",
  "/audio/wren/m18w-test-fail.mp3":
    "[warm] That was so close. This one's important, so let's nail it. Take a breath and run it again. You know your line.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
// COORD is short for coordinator (Case 20 calls it "the coordinator").
export const mission18Say = {
  COORD: "co-ord",
};
