/**
 * WREN's spoken scripts for Case 018 ("The Recruiter", the WarRoom runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice/failVoice have no text field in case18.ts — recovered by
 * transcription; failVoice is a case-specific variant ("you know your line").
 *
 * SAFEGUARDING: this case covers the recruitment-con / ethics content
 * (curriculum M18, scam-framed per safeguarding policy). Tags are
 * deliberately kept serious/warm/encouraging/determined only — never
 * playful or flippant — matching the on-screen text's own careful,
 * non-shaming framing, same convention as mission09.mjs skill 7. No
 * wording changed anywhere.
 */
export const mission18VoiceScripts = {
  "/audio/wren/m18w-open-1.mp3":
    "[serious] Sensitive one today, Agent, so I want you sharp. You've learned real skills in this programme, and skills are power. Power can protect people, or it can hurt them. The difference is a choice you make.",
  "/audio/wren/m18w-open-2.mp3":
    "[serious] Out there, some people go looking for talented kids and try to pull that power the wrong way. They call it a recruiter, an offer, a team. It's a con, and it uses the very influence levers you already know.",
  "/audio/wren/m18w-open-3.mp3":
    "[warm] Seven skills on doing this right, spotting a bad offer, and getting out safely, then a boss and a test. And a promise up front: whenever an offer feels off, the answer is always to tell a trusted adult.",

  // skill 1 — same skill, two paths
  "/audio/wren/m18w-s1-learn.mp3":
    "[serious] Start with the big idea, dual-use. The same skill can do good or harm. Knowing how a lock works helps a locksmith help people, and helps a burglar break in. It's not the skill that's good or bad, it's what you do with it. [determined] Two things decide which path you're on: permission, do you have the owner's okay, and intent, are you trying to help or to take. Keep those two straight and you'll almost always know the right move.",
  "/audio/wren/m18w-s1-ok.mp3":
    "[warm] Exactly. With the owner's permission and the goal of helping, testing a system is a real job people get paid for. Without permission, the same actions are just breaking in. Consent and intent, every time.",
  "/audio/wren/m18w-s1-bad.mp3":
    "[warm] Cleverness doesn't make it right. A brilliant break-in is still a break-in. What matters is permission and intent. Try again.",
  "/audio/wren/m18w-s1-bad2.mp3":
    "[warm] Not getting caught doesn't make something okay, it just means you weren't caught. Judge it by permission and intent. Try again.",
  "/audio/wren/m18w-s1-q2ok.mp3":
    "[warm] Right. Permission and a helping intent are what make it okay. Clever or secret has nothing to do with it.",
  "/audio/wren/m18w-s1-q3ok.mp3":
    "[warm] Exactly. With permission and a helping goal it's a job. Without them, the same actions are just breaking in.",

  // skill 2 — white, grey, black
  "/audio/wren/m18w-s2-learn.mp3":
    "[serious] People in security talk about hats. A white hat tests systems with permission and reports what they find, that's a real, respected job. A black hat breaks in without permission to steal or damage, that's a crime. [warm] And grey hat is the risky middle, poking at systems uninvited even if they mean no harm, which is still against the rules and can get them in serious trouble. Aim to be a white hat, always. Let's sort a few.",
  "/audio/wren/m18w-s2-ok.mp3":
    "[warm] That's the map. Permission and intent to help is white hat, a real career. No permission to harm is black hat, a crime. And 'just curious' without permission is grey hat, still off-limits, still risky. When in doubt, get permission or don't touch it.",
  "/audio/wren/m18w-s2-bad.mp3":
    "[warm] Not quite. The test is permission and intent: hired and helping is white; no permission to harm is black; uninvited 'curiosity' is grey. Try again.",
  "/audio/wren/m18w-s2-q2ok.mp3":
    "[warm] Exactly. White hat is the real, respected job: permission first, and you help by reporting flaws. That's the path to aim for.",
  "/audio/wren/m18w-s2-q2bad.mp3":
    "[warm] Grey hat is still against the rules, even with good intentions, and it can land you in serious trouble. Aim for white hat. Try again.",
  "/audio/wren/m18w-s2-q2bad2.mp3":
    "[warm] That's a crime, plain and simple. The path to aim for is white hat: permission and helping. Try again.",
  "/audio/wren/m18w-s2-q3ok.mp3":
    "[warm] Right. Permission first, then report what you find. That's the white hat, and it's a real career.",

  // skill 3 — found a flaw? report it
  "/audio/wren/m18w-s3-learn.mp3":
    "[serious] Here's what a real good guy does. Say you accidentally notice a weakness, a login that lets you see other people's info, a door left unlocked online. The right move is responsible disclosure: quietly tell the owner or a trusted adult so they can fix it, and don't use it, don't brag about it, don't post it publicly where crooks can grab it. [warm] Reporting a flaw makes you the hero. Exploiting it makes you the villain. Same discovery, opposite choice.",
  "/audio/wren/m18w-s3-ok.mp3":
    "[warm] That's exactly right, and it's genuinely admirable. You tell someone who can fix it, you don't snoop, you don't share it around. That's responsible disclosure, the mark of a real white hat.",
  "/audio/wren/m18w-s3-bad.mp3":
    "[warm] A door being open doesn't make walking through it okay. Looking at private data without permission is the wrong side of the line. Report it instead. Try again.",
  "/audio/wren/m18w-s3-bad2.mp3":
    "[warm] Posting it publicly hands the flaw to every crook before it's fixed, and hurts the very people whose data is exposed. Report it privately. Try again.",
  "/audio/wren/m18w-s3-q2ok.mp3":
    "[warm] That's it. Report it privately, don't use it, don't post it. Same discovery, hero's choice.",
  "/audio/wren/m18w-s3-q3ok.mp3":
    "[warm] See the fork? Reporting protects people. Using or posting it hurts them. Report every time.",

  // skill 4 — the recruiter's levers
  "/audio/wren/m18w-s4-learn.mp3":
    "[serious] Now the con. A bad recruiter, someone trying to pull your skills the wrong way, doesn't say 'come do crime'. They flatter you, they promise easy money, they call it 'just a test', they swear you to secrecy, and they whisper 'us versus them, the rules are for suckers'. [determined] Recognise those? They're the exact influence levers you learned earlier, dressed up as an offer. When you feel a lever being pulled, that IS the warning. Let's connect the pitch to the lever.",
  "/audio/wren/m18w-s4-ok.mp3":
    "[warm] See it clearly now? Flattery, easy money, secrecy, they're influence levers, the same ones you learned to spot in a scam. A real opportunity doesn't need to butter you up or swear you to silence. When you feel a lever, slow down and tell someone.",
  "/audio/wren/m18w-s4-bad.mp3":
    "[warm] Not quite. Flattery hooks your ego; 'easy money' is the reward lever; 'tell no one' is the secrecy lever that isolates you. Match them up. Try again.",
  "/audio/wren/m18w-s4-q2ok.mp3":
    "[warm] Exactly. Feeling a lever pulled IS the warning. A real opportunity doesn't need to butter you up or swear you to silence.",
  "/audio/wren/m18w-s4-q2bad.mp3":
    "[warm] Flattery and secrecy are influence levers, not proof it's real. When you feel them, slow down and tell someone. Try again.",
  "/audio/wren/m18w-s4-q2bad2.mp3":
    "[warm] Secrecy is the lever doing its job, cutting you off from help. The move is to tell a trusted adult. Try again.",
  "/audio/wren/m18w-s4-q3ok.mp3":
    "[warm] That's the pitch laid bare. Flattery, easy money, secrecy, the same levers as any scam, dressed as an offer.",

  // skill 5 — red flags of a bad offer
  "/audio/wren/m18w-s5-learn.mp3":
    "[serious] So how do you spot a bad offer fast? Look for these red flags. It's secret, tell no one. It's urgent, decide right now. It pays you for access or for doing something against the rules. And it needs you to break a rule or hide it from a trusted adult. [warm] A real, honest opportunity is the opposite: it's fine in daylight, an adult can know about it, and it never asks you to harm anyone. Let's pin the warning signs.",
  "/audio/wren/m18w-s5-ok.mp3":
    "[warm] That's the alarm set. Secrecy, pressure, and paying for access or rule-breaking, any one of those means walk away and tell someone. The two you left are actually the signs of an honest offer: it survives daylight and welcomes an adult.",
  "/audio/wren/m18w-s5-bad.mp3":
    "[warm] Careful, two of those are GOOD signs, an honest offer is happy for an adult to know and tells you exactly who they are. Pin only the warning signs: secrecy, pressure, paying for access.",
  "/audio/wren/m18w-s5-q2ok.mp3":
    "[warm] Right, that's the red flag. Secrecy plus pressure is the tell. An honest offer is happy to wait and happy for an adult to know.",
  "/audio/wren/m18w-s5-q2bad.mp3":
    "[warm] That's actually a good sign, an honest offer welcomes a trusted adult. Look for the one pushing secrecy and speed. Try again.",
  "/audio/wren/m18w-s5-q2bad2.mp3":
    "[warm] That's an honest sign, not a red flag. The warning is the message demanding secrecy and a snap decision. Try again.",
  "/audio/wren/m18w-s5-q3ok.mp3":
    "[warm] That's the alarm. Secrecy, pressure, and money for access, any one means walk away and tell someone.",

  // skill 6 — know the recruiter's play
  "/audio/wren/m18w-s6-learn.mp3":
    "[serious] See the recruiter's play, five moves, and it's a slow one, that's why it's dangerous. First, spot talent, they find a skilled kid. Second, flatter, make you feel special and understood. Third, the small ask, something tiny and almost harmless. Fourth, the bigger ask, now you've done one, why not more. Fifth, trapped, 'you already helped, you can't back out now'. [determined] Here's your power: it all collapses if you refuse the small ask and tell a trusted adult. There's no such thing as too late to stop. Refuse early, and there's nothing to trap you with.",
  "/audio/wren/m18w-s6-ok.mp3":
    "[warm] That's the move, and it works every time. The small ask is the hook for the big one. Say no to the first step and tell someone, and the trap has nothing to grip. You're never in too deep to stop.",
  "/audio/wren/m18w-s6-bad.mp3":
    "[warm] The tiny favour is the whole point, it's the first link they use to pull you to bigger ones. Refuse it and tell an adult. Try again.",
  "/audio/wren/m18w-s6-bad2.mp3":
    "[warm] Secrecy is exactly the trap. The one thing that breaks their play is bringing a trusted adult in. Try again.",
  "/audio/wren/m18w-s6-q2ok.mp3":
    "[warm] That's the slow play. It only works if you take the small ask, so that's exactly where you refuse.",
  "/audio/wren/m18w-s6-q3ok.mp3":
    "[warm] Right. Refuse the first step and tell someone, and the trap has nothing to grip. You're never in too deep to stop.",

  // skill 7 — your line, your exit
  "/audio/wren/m18w-s7-learn.mp3":
    "[serious] Last skill, and it's the most important in the whole programme. You decide who you are. Your skills are real, and the good path is wide open, ethical hacking is a genuine, respected, well-paid job. So set your line now, before anyone tests it: I don't harm people, I don't do it in secret, and I don't work without permission. [warm] And always keep your exit: whenever an offer feels off, you stop, you say no, and you tell a trusted adult. No shame, no 'too late'. That exit is always open.",
  "/audio/wren/m18w-s7-ok.mp3":
    "[warm] That's your line, and it'll keep you safe and on the right side for the rest of your life. Permission, no harm, no secrets, and an exit that's always open. You're not just skilled now, Agent. You're trustworthy. That's rarer and worth more.",
  "/audio/wren/m18w-s7-bad.mp3":
    "[warm] Careful, two of those are the LIES a recruiter tells, you can always back out, and cleverness never puts you above the rules. Pin only the true parts of holding your line.",
  "/audio/wren/m18w-s7-q2ok.mp3":
    "[warm] That's the exit, and it's always open. No shame, no 'too late'. Stop, say no, and bring in a trusted adult.",
  "/audio/wren/m18w-s7-q2bad.mp3":
    "[warm] You can always back out, that's the whole point of an exit. Stop and tell an adult. Try again.",
  "/audio/wren/m18w-s7-q2bad2.mp3":
    "[warm] Secrecy keeps you alone with them, that's not safe. Telling a trusted adult is the exit. Try again.",
  "/audio/wren/m18w-s7-q3ok.mp3":
    "[warm] That's your line beating their lies. Permission over rule-breaking, daylight over secrecy, and an exit that's always open.",

  // boss — "The Offer"
  "/audio/wren/m18w-boss-intro.mp3":
    "[serious] This is it, Agent, and it's personal. A slick 'recruiter' has been watching your work and slides into your messages with an offer. It's going to sound flattering and easy. Read the levers, spot the red flags, and find your exit. No hints from me. [determined] Remember your line.",
  "/audio/wren/m18w-boss-win.mp3":
    "[warm] That's the strongest thing you've done in this whole programme, Agent. A recruiter pulled every lever, flattery, easy money, secrecy, and pushed the classic small-ask trap. And you named every lever, refused the first step, and walked straight out the exit to a trusted adult. [serious] Your skills are real, and now everyone can see you can be trusted with them. That's what makes a true white hat. And one more thing: the way that offer was run, the levers, the patience, it matches a hand we've been tracking. COORD. Keep that in mind.",

  // test — "Prove it"
  "/audio/wren/m18w-test-intro.mp3":
    "[serious] Last thing before I sign this off, the test. All fresh scenarios, no hints, and you'll need a clear pass. Everything about doing this right and getting out safely, put it to work. [warm] Ready?",
  "/audio/wren/m18w-test-pass.mp3":
    "[warm] Yes. You held your line under real pressure and found the exit every time. You're not just skilled now, Agent, you're trustworthy. That's the whole point.",
  "/audio/wren/m18w-test-fail.mp3":
    "[warm] So close. This one's important, so let's nail it. Take a breath and run it again. You know your line.",
};
