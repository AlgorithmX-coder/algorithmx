/**
 * WREN's spoken scripts for Case 019 ("Static Rising", the WarRoom runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice/failVoice have no text field in case19.ts — recovered by
 * transcription; both are case-specific variants, not the generic template.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress, and two-step verification for the second lock.
 */
export const mission19VoiceScripts = {
  "/audio/wren/m19w-open-1.mp3":
    "[serious] This is a big one, Agent. Until now, you've faced one attacker at a time. Real trouble doesn't work like that. A serious attack is a campaign. It's a chain of stages, run patiently, and often by a whole crew.",
  "/audio/wren/m19w-open-2.mp3":
    "[serious] The board's lighting up on every frequency at once. There's research, bait, a break-in, theft, and spread. Your job today is to see the whole chain, not just one alert, and to learn where to cut it.",
  "/audio/wren/m19w-open-3.mp3":
    "[serious] You'll learn seven skills to read a campaign, stack your defences in layers, and take command when something slips through. Then there's a boss and a test. Let's put the whole programme together.",

  // skill 1 — an attack is a chain
  "/audio/wren/m19w-s1-learn.mp3":
    "[warm] First, here's the big shift. A real attack isn't one trick. It's a chain of stages, each one setting up the next. Recon is where they research the target. The lure is where they bait you in. Access is where they get in. Harvest is where they take what they came for. Spread is where they use you to reach others. Here's the gift in that. A chain has links, and you only have to break one. Stop any single stage, and the whole campaign fails. Let's put the stages in order.",
  "/audio/wren/m19w-s1-ok.mp3":
    "[warm] That's the chain. It runs recon, lure, access, harvest, and spread. Each link depends on the one before it, and that's your advantage. You don't have to be perfect at every stage. You just have to break one link to stop the whole thing.",
  "/audio/wren/m19w-s1-q2ok.mp3":
    "[warm] Exactly. A chain only works if every link holds. Break recon, or the lure, or access, and the whole campaign collapses. You never have to be perfect at all five.",
  "/audio/wren/m19w-s1-q2bad.mp3":
    "[warm] Here's the good news. You don't need all five. One broken link stops the chain. Try again.",
  "/audio/wren/m19w-s1-q2bad2.mp3":
    "[warm] It can be stopped. Break a single stage, and the rest can't follow. Try again.",
  "/audio/wren/m19w-s1-q3ok.mp3":
    "[warm] Right. Recon, access and spread are all real links in the chain. Break any one and the campaign stalls.",

  // skill 2 — stage one: recon
  "/audio/wren/m19w-s2-learn.mp3":
    "[warm] Stage one is recon. Before a skilled attacker sends a single message, they study you. They look at your posts, your school, your friends, and your routine, all those data crumbs from earlier cases. Why? It's so the bait can be personal and believable. A message from your football coach about Saturday works far better than one that starts with Dear user. Your defence at this stage is the smaller footprint you already learned. Less public data means weaker, more generic bait. Recon is where you starve them first.",
  "/audio/wren/m19w-s2-ok.mp3":
    "[warm] Exactly, and it ties the whole programme together. The less you leave public, the more generic and easy-to-spot their bait has to be. A locked-down footprint makes stage one fail before it starts.",
  "/audio/wren/m19w-s2-bad.mp3":
    "[warm] More data doesn't confuse them. It feeds them, and it makes the bait more personal and convincing. Shrink the footprint instead. Try again.",
  "/audio/wren/m19w-s2-bad2.mp3":
    "[warm] You can absolutely weaken it by giving them less to find. A small footprint is a real defence. Try again.",
  "/audio/wren/m19w-s2-q2ok.mp3":
    "[warm] See how ordinary posts become a research file? Each public crumb tells them where you are, when you're there, and who to pretend to be. Less public data means weaker recon.",
  "/audio/wren/m19w-s2-q3ok.mp3":
    "[warm] Right. A friends-only profile and a quiet routine leave recon with almost nothing to work with.",

  // skill 3 — stage two: the lure
  "/audio/wren/m19w-s3-learn.mp3":
    "[warm] Stage two is the lure, the bait that gets you to click, tell, or install. You've met all its faces already. An urgent link saying your account is locked is phishing. A too-good free prize is a scam hook. A cloned voice or a fake video is synthetic media. A flattering offer is recruitment. They're different masks with the same goal, which is to get you to act fast without thinking. Naming the trick behind the bait is how you stay calm. Let's match a few lures to the play behind them.",
  "/audio/wren/m19w-s3-ok.mp3":
    "[warm] Nicely read. Fake urgency is phishing. A too-perfect voice is synthetic media. And paying a fee to claim your prize is the oldest scam there is. The lure changes clothes, but you know every one of them by name now.",
  "/audio/wren/m19w-s3-bad.mp3":
    "[warm] Not quite. A fake-urgent login link is phishing. A suspiciously perfect voice is synthetic media. And paying to claim your prize is an advance-fee scam. Match them up. Try again.",
  "/audio/wren/m19w-s3-q2ok.mp3":
    "[warm] Exactly. Every lure wears a different mask, but they all share one goal. They want you to act fast, before you can think. Slow down, and the trick falls apart.",
  "/audio/wren/m19w-s3-q2bad.mp3":
    "[warm] A name is easy to find in recon. The real tell is the panic and pressure. Try again.",
  "/audio/wren/m19w-s3-q2bad2.mp3":
    "[warm] The time of day means nothing. The manufactured urgency is the giveaway. Try again.",
  "/audio/wren/m19w-s3-q3ok.mp3":
    "[warm] Right. Fake urgency, a fake prize, and a faked voice are all lures in disguise. Name the trick and you stay calm.",

  // skill 4 — stage three: access
  "/audio/wren/m19w-s4-learn.mp3":
    "[warm] Stage three is access, the actual break-in. If the lure works and you hand over a password or run their file, they're in. This is exactly why the basics matter so much. A strong, unique password means one stolen login doesn't open your other doors. And two-step verification, like that code on your phone, stops them even if they have your password. Access is the stage where your everyday habits do the heavy lifting. They're boring defences, with a huge payoff.",
  "/audio/wren/m19w-s4-ok.mp3":
    "[warm] Exactly. Two-step verification blocks them, even with the password. And because you never reuse it, that one leak can't open your other accounts. The access stage dies on your boring, brilliant basics.",
  "/audio/wren/m19w-s4-bad.mp3":
    "[warm] Not if you use unique passwords and two-step verification. Then one leak stays small, and the login still fails. Try again.",
  "/audio/wren/m19w-s4-bad2.mp3":
    "[warm] That's the opposite of a defence, because one leak would then open everything. Unique passwords and two-step verification are the fix. Try again.",
  "/audio/wren/m19w-s4-q2ok.mp3":
    "[warm] That's the access door slammed shut. Unique passwords contain a leak, two-step verification blocks a stolen login, and a password manager makes it all painless.",
  "/audio/wren/m19w-s4-q3ok.mp3":
    "[warm] Right. Unique passwords and two-step verification are the two habits that stop the break-in cold.",

  // skill 5 — stage four: harvest & spread
  "/audio/wren/m19w-s5-learn.mp3":
    "[warm] Stages four and five are harvest and spread. Once they're in, they grab what they want, like data, money, or files. Then they pivot. They use your account to hit your friends, because a message from you is trusted. This is why noticing fast matters so much. Strange logins, messages you didn't send, and money you didn't spend all mean harvest and spread are in progress. Catching it early is the difference between a small mess and a disaster that rolls through everyone you know.",
  "/audio/wren/m19w-s5-ok.mp3":
    "[warm] Right. Your account is being used to spread the attack, and speed is everything now. The faster you notice and act, the fewer of your friends get pulled in. Early spotting shrinks the damage.",
  "/audio/wren/m19w-s5-bad.mp3":
    "[warm] It's very much your problem. Your account is the source, and every minute it spreads further. Act fast to contain it. Try again.",
  "/audio/wren/m19w-s5-bad2.mp3":
    "[warm] Waiting is exactly what lets it roll through your contacts. The spread stage rewards speed, so move now. Try again.",
  "/audio/wren/m19w-s5-q2ok.mp3":
    "[warm] That's reading the attack live. Odd messages mean spread, missing money means harvest, and a strange login means access. Spot them fast and you cut the damage.",
  "/audio/wren/m19w-s5-q3ok.mp3":
    "[warm] Right. Messages you didn't send, strange logins, and purchases you didn't make are all alarms. Catch them early and the mess stays small.",

  // skill 6 — defence in depth
  "/audio/wren/m19w-s6-learn.mp3":
    "[warm] Here's the master idea, defence in depth. You will never be perfect. One day you'll misjudge a message, and everyone does. So the goal isn't a single perfect wall. It's layers, so that when one fails, another catches you. Scepticism catches most lures. Unique passwords limit a leak. Two-step verification blocks a stolen password. Updates close known holes. Backups mean even a disaster isn't the end. Having no single point of failure is how pros stay safe. Let's pin the layers.",
  "/audio/wren/m19w-s6-ok.mp3":
    "[warm] That's depth. Two-step verification, updates, and backups each catch a different failure, so no single slip is fatal. The two you left are the trap. One master password is a single point of failure, and so is believing you'll never be fooled. Layers beat walls.",
  "/audio/wren/m19w-s6-bad.mp3":
    "[warm] Careful, because two of those are single points of failure. One is using one password for everything, and the other is assuming you'll never slip. Pin the moves that add independent layers. Those are two-step verification, updates, and backups.",
  "/audio/wren/m19w-s6-q2ok.mp3":
    "[warm] Exactly. Nobody is perfect forever. Layers mean the day you misjudge one thing, the next defence is still standing between you and disaster.",
  "/audio/wren/m19w-s6-q2bad.mp3":
    "[warm] Any single wall can fail. That's the whole reason for layers. Try again.",
  "/audio/wren/m19w-s6-q2bad2.mp3":
    "[warm] The goal isn't more passwords. It's independent layers that catch different failures. Try again.",
  "/audio/wren/m19w-s6-q3ok.mp3":
    "[warm] That's defence in depth. Each layer catches a different failure, so no single slip can take you down.",

  // skill 7 — take command
  "/audio/wren/m19w-s7-learn.mp3":
    "[warm] This is the last skill, and it's about the moment it goes wrong, because sometimes it will. Don't panic. Take command. There's an order that works. First, contain it. Disconnect, log out everywhere, and stop the bleeding. Next, tell a trusted adult straight away, because you don't handle a real incident alone. Then recover. Change your passwords from a clean device, and restore from a backup. And report it, to the platform and to a grown-up who can escalate it. Stay calm, take it in order, and don't do it alone. That's incident command, and it turns a disaster into a bad afternoon.",
  "/audio/wren/m19w-s7-ok.mp3":
    "[warm] That's command. You contain it, tell an adult, and recover, calmly and in order, never alone and never in secret. The two you left are what make incidents worse. Those are hiding it, and panicking. You just turned a nightmare into a checklist.",
  "/audio/wren/m19w-s7-bad.mp3":
    "[warm] Careful, because two of those make it worse. Keeping it secret means no help, and panicking means mistakes. Pin the calm moves, in order. Contain it, tell an adult, and recover.",
  "/audio/wren/m19w-s7-q2ok.mp3":
    "[warm] Exactly. Contain it first and stop the bleeding. Then tell an adult, and recover. Calm and in order beats panic every time.",
  "/audio/wren/m19w-s7-q2bad.mp3":
    "[warm] Silence lets it spread and means no help. Contain it, then tell a trusted adult. Try again.",
  "/audio/wren/m19w-s7-q2bad2.mp3":
    "[warm] Panic causes mistakes. Take it in order, and contain it first. Try again.",
  "/audio/wren/m19w-s7-q3ok.mp3":
    "[warm] That's incident command. Contain it so it stops, tell an adult so you're not alone, and then recover, calmly and in order.",

  // boss — "All Frequencies"
  "/audio/wren/m19w-boss-intro.mp3":
    "[determined] This is the big one, Agent. Every frequency is lighting up at once. It's a coordinated campaign, hitting you and your friends across all five stages. You're not just a target now. You're the incident commander. Read each alert for its stage, apply the right layer, and command the response. You'll get no hints from me. Stay calm, and break the chain.",
  "/audio/wren/m19w-boss-win.mp3":
    "[proud] Outstanding command, Agent. A coordinated campaign came at you on every frequency at once, through recon, lure, access, harvest, and spread, and you didn't flinch. You named each stage, stacked your layers, and broke the chain. And when one link got through, you took command, calmly, in order, and not alone. That's the whole programme working as one. There's one last thing. Look at the timing, the patience, and the way all five frequencies moved together. That isn't the work of separate crooks. That's one hand conducting them, and we've seen its fingerprint before. It's COORD. Case twenty is where we find out who.",

  // test — "Prove it"
  "/audio/wren/m19w-test-intro.mp3":
    "[warm] There's one last thing before I sign this off, and that's the test. It's a fresh set with no hints, and you need to pass. Put the whole campaign to work, from start to finish. Ready?",
  "/audio/wren/m19w-test-pass.mp3":
    "[proud] Yes! You commanded the whole campaign from start to finish, without panic. That's the entire programme working as one. That was outstanding, Agent.",
  "/audio/wren/m19w-test-fail.mp3":
    "[warm] That was so close. It's a lot to hold in your head at once, and even commanders regroup. Take a breath, and run it again.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
// COORD is short for coordinator, so she says it as a word, not letters.
export const mission19Say = {
  COORD: "co-ord",
};
