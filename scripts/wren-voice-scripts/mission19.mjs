/**
 * WREN's spoken scripts for Case 019 ("Static Rising", the WarRoom runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice/failVoice have no text field in case19.ts — recovered by
 * transcription; both are case-specific variants, not the generic template.
 */
export const mission19VoiceScripts = {
  "/audio/wren/m19w-open-1.mp3":
    "[serious] This is a big one, Agent. Until now you've faced one attacker at a time. Real trouble doesn't work like that. A serious attack is a campaign, a chain of stages, run patiently, often by a whole crew.",
  "/audio/wren/m19w-open-2.mp3":
    "[determined] The board's lighting up on every frequency at once: research, bait, break-in, theft, spread. Your job today is to see the whole chain, not one alert, and learn where to cut it.",
  "/audio/wren/m19w-open-3.mp3":
    "[excited] Seven skills to read a campaign, stack your defences in layers, and take command when something slips through, then a boss and a test. Let's put the whole programme together.",

  // skill 1 — an attack is a chain
  "/audio/wren/m19w-s1-learn.mp3":
    "[serious] First, the big shift. A real attack isn't one trick, it's a chain of stages, each one setting up the next. Roughly: recon, they research the target. Lure, they bait you in. Access, they get in. Harvest, they take what they came for. Spread, they use you to reach others. [encouraging] Here's the gift in that: a chain has links, and you only have to break ONE. Stop any single stage and the whole campaign fails. Let's put the stages in order.",
  "/audio/wren/m19w-s1-ok.mp3":
    "[proud] That's the chain: recon, lure, access, harvest, spread. Each link depends on the one before it. And that's your advantage, you don't have to be perfect at every stage, you just have to break one link to stop the whole thing.",
  "/audio/wren/m19w-s1-q2ok.mp3":
    "[proud] Exactly. A chain only works if every link holds. Break recon, or the lure, or access, and the whole campaign collapses. You never have to be perfect at all five.",
  "/audio/wren/m19w-s1-q2bad.mp3":
    "[warm] Good news, you don't need all five. One broken link stops the chain. Try again.",
  "/audio/wren/m19w-s1-q2bad2.mp3":
    "[warm] It can. Break a single stage and the rest can't follow. Try again.",
  "/audio/wren/m19w-s1-q3ok.mp3":
    "[proud] Right. Recon, access and spread are all real links in the chain. Break any one and the campaign stalls.",

  // skill 2 — stage one: recon
  "/audio/wren/m19w-s2-learn.mp3":
    "[curious] Stage one, recon. Before a good attacker sends a single message, they study you, your posts, your school, your friends, your routine, all those data crumbs from earlier cases. Why? So the bait can be personal and believable. 'Hi from your football coach about Saturday' works far better than 'Dear user'. [determined] Your defence at this stage is the smaller footprint you already learned: less public data means weaker, more generic bait. Recon is where you starve them first.",
  "/audio/wren/m19w-s2-ok.mp3":
    "[proud] Exactly, and it ties the whole programme together. The less you leave public, the more generic and easy-to-spot their bait has to be. A locked-down footprint makes stage one fail before it starts.",
  "/audio/wren/m19w-s2-bad.mp3":
    "[warm] More data doesn't confuse them, it feeds them. It makes the bait more personal and convincing. Shrink the footprint instead. Try again.",
  "/audio/wren/m19w-s2-bad2.mp3":
    "[warm] You can absolutely weaken it, by giving them less to find. A small footprint is a real defence. Try again.",
  "/audio/wren/m19w-s2-q2ok.mp3":
    "[proud] See how ordinary posts become a research file? Each public crumb tells them where you are, when, and who to pretend to be. Less public means weaker recon.",
  "/audio/wren/m19w-s2-q3ok.mp3":
    "[proud] Right. A friends-only profile and a quiet routine leave recon with almost nothing to work with.",

  // skill 3 — stage two: the lure
  "/audio/wren/m19w-s3-learn.mp3":
    "[curious] Stage two, the lure, the bait that gets you to click, tell, or install. You've met all its faces already. An urgent 'your account is locked' link, that's phishing. A too-good free prize, that's a scam hook. A cloned voice or fake video, that's synthetic media. A flattering offer, that's recruitment. [serious] Different masks, same goal: get you to act fast without thinking. Naming the trick behind the bait is how you stay calm. Let's match a few lures to the play behind them.",
  "/audio/wren/m19w-s3-ok.mp3":
    "[proud] Nicely read. Fake urgency is phishing; a too-perfect voice is synthetic media; 'pay a fee to claim your prize' is the oldest scam there is. The lure changes clothes, but you know every one of them by name now.",
  "/audio/wren/m19w-s3-bad.mp3":
    "[warm] Not quite. A fake-urgent login link is phishing; a suspiciously perfect voice is synthetic media; 'pay to claim your prize' is an advance-fee scam. Match them up. Try again.",
  "/audio/wren/m19w-s3-q2ok.mp3":
    "[proud] Exactly. Every lure wears a different mask, but they share one goal: make you act fast, before you can think. Slow down and the trick falls apart.",
  "/audio/wren/m19w-s3-q2bad.mp3":
    "[warm] A name is easy to find in recon. The real tell is the panic and pressure. Try again.",
  "/audio/wren/m19w-s3-q2bad2.mp3":
    "[warm] The time of day means nothing. The manufactured urgency is the giveaway. Try again.",
  "/audio/wren/m19w-s3-q3ok.mp3":
    "[proud] Right. Fake urgency, a fake prize, and a faked voice are all lures in disguise. Name the trick and you stay calm.",

  // skill 4 — stage three: access
  "/audio/wren/m19w-s4-learn.mp3":
    "[serious] Stage three, access, the actual break-in. If the lure works and you hand over a password or run their file, they're in. This is exactly why the basics matter so much: a strong, unique password means one stolen login doesn't open your other doors, and a second factor, that code on your phone, stops them even if they have your password. [encouraging] Access is the stage where your everyday habits do the heavy lifting. Boring defences, huge payoff.",
  "/audio/wren/m19w-s4-ok.mp3":
    "[proud] Exactly. Two-factor blocks them even with the password, and because you never reuse it, that one leak can't open your other accounts. The access stage dies on your boring, brilliant basics.",
  "/audio/wren/m19w-s4-bad.mp3":
    "[warm] Not if you use unique passwords and two-factor. Then one leak stays small and the login still fails. Try again.",
  "/audio/wren/m19w-s4-bad2.mp3":
    "[warm] That's the opposite of a defence, one leak would then open everything. Unique passwords and two-factor are the fix. Try again.",
  "/audio/wren/m19w-s4-q2ok.mp3":
    "[proud] That's the access door slammed. Unique passwords contain a leak, two-factor blocks a stolen login, and a manager makes it all painless.",
  "/audio/wren/m19w-s4-q3ok.mp3":
    "[proud] Right. Unique passwords and two-factor are the two habits that stop the break-in cold.",

  // skill 5 — stage four: harvest & spread
  "/audio/wren/m19w-s5-learn.mp3":
    "[serious] Stage four and five, harvest and spread. Once in, they grab what they want, data, money, files, then they pivot: they use your account to hit your friends, because a message from you is trusted. [determined] This is why noticing fast matters so much. Strange logins, messages you didn't send, money you didn't spend, those are harvest-and-spread in progress. Catching it early is the difference between a small mess and a disaster that rolls through everyone you know.",
  "/audio/wren/m19w-s5-ok.mp3":
    "[proud] Right. Your account is being used to spread the attack, and speed is everything now. The faster you notice and act, the fewer of your friends get pulled in. Early spotting shrinks the damage.",
  "/audio/wren/m19w-s5-bad.mp3":
    "[warm] It's very much your problem, your account is the source, and every minute it spreads further. Act fast to contain it. Try again.",
  "/audio/wren/m19w-s5-bad2.mp3":
    "[warm] Waiting is exactly what lets it roll through your contacts. The spread stage rewards speed, move now. Try again.",
  "/audio/wren/m19w-s5-q2ok.mp3":
    "[proud] That's reading the attack live. Odd messages mean spread, missing money means harvest, and a strange login means access. Spot them fast and you cut the damage.",
  "/audio/wren/m19w-s5-q3ok.mp3":
    "[proud] Right. Messages you didn't send, strange logins, and purchases you didn't make are all alarms. Catch them early and the mess stays small.",

  // skill 6 — defence in depth
  "/audio/wren/m19w-s6-learn.mp3":
    "[serious] Here's the master idea, defence in depth. You will never be perfect, you'll misjudge a message one day, everyone does. So the goal isn't a single perfect wall, it's LAYERS, so that when one fails, another catches you. [determined] Skepticism catches most lures. Unique passwords limit a leak. Two-factor blocks a stolen password. Updates close known holes. Backups mean even a disaster isn't the end. No single point of failure, that's how pros stay safe. Let's pin the layers.",
  "/audio/wren/m19w-s6-ok.mp3":
    "[proud] That's depth. Two-factor, updates, and backups each catch a different failure, so no single slip is fatal. The two you left are the trap: one master password and 'I'll never be fooled' are single points of failure. Layers beat walls.",
  "/audio/wren/m19w-s6-bad.mp3":
    "[warm] Careful, two of those are single points of failure, one password for everything, and assuming you'll never slip. Pin the moves that add independent layers: two-factor, updates, backups.",
  "/audio/wren/m19w-s6-q2ok.mp3":
    "[proud] Exactly. Nobody is perfect forever. Layers mean the day you misjudge one thing, the next defence is still standing between you and disaster.",
  "/audio/wren/m19w-s6-q2bad.mp3":
    "[warm] Any single wall can fail. That's the whole reason for layers. Try again.",
  "/audio/wren/m19w-s6-q2bad2.mp3":
    "[warm] The goal isn't more passwords, it's independent layers that catch different failures. Try again.",
  "/audio/wren/m19w-s6-q3ok.mp3":
    "[proud] That's defence in depth. Each layer catches a different failure, so no single slip can take you down.",

  // skill 7 — take command
  "/audio/wren/m19w-s7-learn.mp3":
    "[serious] Last skill, and it's about the moment it goes wrong, because sometimes it will. Don't panic, take command. There's an order that works: contain first, disconnect, log out everywhere, stop the bleeding. Tell a trusted adult straight away, you don't handle a real incident alone. [encouraging] Recover, change passwords from a clean device, restore from backup. And report it, to the platform, and to a grown-up who can escalate. Calm, in order, not alone. That's incident command, and it turns a disaster into a bad afternoon.",
  "/audio/wren/m19w-s7-ok.mp3":
    "[proud] That's command. Contain, tell an adult, recover, calm and in order, not alone and not in secret. The two you left are what makes incidents worse: hiding it, and panicking. You just turned a nightmare into a checklist.",
  "/audio/wren/m19w-s7-bad.mp3":
    "[warm] Careful, two of those make it worse, keeping it secret means no help, and panicking means mistakes. Pin the calm, in-order moves: contain, tell an adult, recover.",
  "/audio/wren/m19w-s7-q2ok.mp3":
    "[proud] Exactly. Contain first, stop the bleeding, then tell an adult and recover. Calm and in order beats panic every time.",
  "/audio/wren/m19w-s7-q2bad.mp3":
    "[warm] Silence lets it spread and means no help. Contain it, then tell a trusted adult. Try again.",
  "/audio/wren/m19w-s7-q2bad2.mp3":
    "[warm] Panic causes mistakes. Take it in order: contain first. Try again.",
  "/audio/wren/m19w-s7-q3ok.mp3":
    "[proud] That's incident command. Contain to stop it, tell an adult so you're not alone, then recover, calm and in order.",

  // boss — "All Frequencies"
  "/audio/wren/m19w-boss-intro.mp3":
    "[serious] This is the big one, Agent. Every frequency is lighting up at once, a coordinated campaign hitting you and your friends across all five stages. You're not just a target now, you're incident commander. Read each alert for its stage, apply the right layer, and command the response. No hints from me. [determined] Stay calm. Break the chain.",
  "/audio/wren/m19w-boss-win.mp3":
    "[excited] Outstanding command, Agent. A coordinated campaign came at you on every frequency at once, recon, lure, access, harvest, spread, and you didn't flinch. You named each stage, stacked your layers, broke the chain, and when one link got through, you took command, calmly, in order, and not alone. [proud] That's the whole programme working as one. [serious] One last thing: the timing, the patience, the way all five frequencies moved together, that's not five separate crooks. That's one hand conducting them. We've seen its fingerprint before. COORD. Case twenty, we find out who.",

  // test — "Prove it"
  "/audio/wren/m19w-test-intro.mp3":
    "[serious] Last thing before I sign this off, the test. A fresh set, no hints, and you need to pass. The whole campaign, start to finish, put it to work. [excited] Ready?",
  "/audio/wren/m19w-test-pass.mp3":
    "[excited] Yes! You commanded the whole campaign start to finish without panic. [proud] That's the entire programme working as one. Outstanding, Agent.",
  "/audio/wren/m19w-test-fail.mp3":
    "[warm] So close. A lot to hold in your head at once, and even commanders regroup. [encouraging] Take a breath and run it again.",
};
