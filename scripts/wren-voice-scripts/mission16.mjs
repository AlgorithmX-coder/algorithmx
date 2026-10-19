/**
 * WREN's spoken scripts for Case 016 ("The File On You", Block 4 opener, the
 * WarRoom runtime). See mission01.mjs, mission06.mjs, and mission11.mjs for
 * conventions. test.passVoice/failVoice have no text field in case16.ts —
 * recovered by transcription. failVoice is the generic template reused
 * across cases.
 */
export const mission16VoiceScripts = {
  "/audio/wren/m16w-open-1.mp3":
    "[serious] Highest clearance now, Agent. Welcome to the War Room. From here you don't just spot one attack, you see the whole picture, and connect it.",
  "/audio/wren/m16w-open-2.mp3":
    "[curious] First target: the file. Right now, companies you've never heard of keep a file on you, what you like, where you go, who you know, and they trade it. PACKRAT's whole business is building and selling that file.",
  "/audio/wren/m16w-open-3.mp3":
    "[determined] Seven skills to take control of your own data, then a boss and a test. Let's find out what your file says, and start cutting it down.",

  // skill 1 — the data economy
  "/audio/wren/m16w-s1-learn.mp3":
    "[curious] Start with the big secret of the internet. A lot of 'free' apps and sites aren't really free, you pay with data. As you browse, tap, and post, trackers quietly note what you like, where you go, and who you talk to. [serious] That gets bundled into a file about YOU, and companies buy and sell those files to target you. When something's free, quite often, the product being sold is you.",
  "/audio/wren/m16w-s1-ok.mp3":
    "[proud] Very likely, yes. If you can't see how something makes money, the answer is often your data. That's not a reason to panic, it's a reason to know what you're handing over, and to hand over less. Which is exactly what we'll do.",
  "/audio/wren/m16w-s1-bad.mp3":
    "[warm] Companies rarely run big apps out of kindness. If there's no obvious payment, the product is usually your data. Try again.",
  "/audio/wren/m16w-s1-bad2.mp3":
    "[warm] Ha, no magic here. Free usually means you're paying with data. Try again.",
  "/audio/wren/m16w-s1-q2ok.mp3":
    "[proud] Right. When it's free, you usually pay with your data and your attention. Now you can see the real price.",
  "/audio/wren/m16w-s1-q3ok.mp3":
    "[proud] See the pattern? Free almost always means your data is the product being sold.",

  // skill 2 — what's in your file
  "/audio/wren/m16w-s2-learn.mp3":
    "[curious] So what's actually in a file about you? Not one big secret, lots of tiny crumbs, each giving away a piece. Your posts show your face and friends, your location tags show where you are, your searches show what you're into, your purchases show what you buy. [serious] On their own they seem harmless. Connected on a board, they draw a scarily complete picture. Let's connect a few and see.",
  "/audio/wren/m16w-s2-ok.mp3":
    "[proud] See how fast it builds? Each crumb is small, but connected they reveal where you live, everything you're into, and every account that's really you. That's a file. And a file made of crumbs can be taken apart, crumb by crumb.",
  "/audio/wren/m16w-s2-bad.mp3":
    "[warm] Not quite, look again at what each crumb gives away. A location tag reveals a place; a repeated username links your accounts; purchases reveal your habits. Match them up.",
  "/audio/wren/m16w-s2-q2ok.mp3":
    "[proud] Exactly. One post can carry your face, your friends, where you were and when. That's a lot of crumbs in one bite.",
  "/audio/wren/m16w-s2-q2bad.mp3":
    "[warm] That one's nearly harmless. Look for the post stacked with crumbs, face, place, date, friends. Try again.",
  "/audio/wren/m16w-s2-q3ok.mp3":
    "[proud] Right. Check-ins, searches and friends are all real crumbs that build the file.",

  // skill 3 — audit your own trail
  "/audio/wren/m16w-s3-learn.mp3":
    "[determined] Here's a powerful move: audit yourself, the same way an attacker would. Search your own name and usernames. Look at your profiles the way a stranger sees them, logged out. [warm] You'll be surprised what's public, an old post, a tagged photo, a visible friends list. You can't fix what you can't see, so the self-audit is always step one. See your own file before anyone else uses it.",
  "/audio/wren/m16w-s3-ok.mp3":
    "[proud] Exactly. You can't tidy a trail you've never looked at. Searching yourself and viewing your profiles as a stranger shows you the real file. Once you can see it, you can start cutting it down.",
  "/audio/wren/m16w-s3-bad.mp3":
    "[warm] That's drastic and usually unnecessary. Start by seeing what's actually out there, then fix the real gaps. Audit first. Try again.",
  "/audio/wren/m16w-s3-bad2.mp3":
    "[warm] You can, that's the point. Search yourself and view your profiles logged out to see what a stranger sees. Try again.",
  "/audio/wren/m16w-s3-q2ok.mp3":
    "[proud] That's a proper self-audit. Search yourself, look logged out, and check what's public.",
  "/audio/wren/m16w-s3-q3ok.mp3":
    "[proud] Exactly. Seeing it was the whole point. Now you can fix it on purpose.",
  "/audio/wren/m16w-s3-q3bad.mp3":
    "[warm] You audited it for a reason, to act. Deal with the ones you don't want public. Try again.",

  // skill 4 — cut it down
  "/audio/wren/m16w-s4-learn.mp3":
    "[encouraging] Now the satisfying part, cutting the file down. You have more control than you think. Set profiles to private so only friends see them. Turn off location sharing. Delete old posts you've outgrown. [warm] Trim your public info. Every crumb you remove is one less thing in the file. You're not deleting yourself, you're curating, deciding on purpose what the world gets to see.",
  "/audio/wren/m16w-s4-ok.mp3":
    "[proud] That's real control. Private profiles, location off, old posts gone, each one is a crumb the file no longer has. You didn't disappear, you decided what's yours to share and what isn't. That's curation.",
  "/audio/wren/m16w-s4-bad.mp3":
    "[warm] Careful, one of those makes your file BIGGER. Posting your birthday and address, or reusing one public handle, feeds the file. Pin only the moves that shrink it.",
  "/audio/wren/m16w-s4-q2ok.mp3":
    "[proud] Right. Private means only people you approve can see. One switch, big difference.",
  "/audio/wren/m16w-s4-q2bad.mp3":
    "[warm] More posts means more crumbs, not fewer. Go private instead. Try again.",
  "/audio/wren/m16w-s4-q3ok.mp3":
    "[proud] Every setting is a crumb removed. That's you shrinking the file on purpose.",

  // skill 5 — ask it down
  "/audio/wren/m16w-s5-learn.mp3":
    "[serious] Sometimes data about you sits on a site you don't even control, an old account, a page that mentions you, a data broker's list. [encouraging] Good news: you often have the right to ask for it to be taken down, and most services have a delete-my-data or privacy request option. It's not instant and it's not perfect, but asking works more often than people think. If in doubt, a trusted adult can help you send the request.",
  "/audio/wren/m16w-s5-ok.mp3":
    "[proud] Exactly. Most sites have a way to delete an account or request your data be removed. It won't fix everything overnight, but every takedown is a real crumb gone. And an adult can help with the trickier ones.",
  "/audio/wren/m16w-s5-bad.mp3":
    "[warm] Not true. You often have the right to have data removed, and most sites have a delete option. Asking works more than you'd think. Try again.",
  "/audio/wren/m16w-s5-bad2.mp3":
    "[warm] Posting more just adds to the file. The move is to remove the old data, not pile new data on top. Try again.",
  "/audio/wren/m16w-s5-q2ok.mp3":
    "[proud] Right. The delete option, and a trusted adult for the tricky ones. Both really work.",
  "/audio/wren/m16w-s5-q3ok.mp3":
    "[proud] Exactly. Some take-downs are fiddly, and an adult can help. You never have to do it alone.",
  "/audio/wren/m16w-s5-q3bad.mp3":
    "[warm] That just makes more mess and more data. Get help removing the real account. Try again.",

  // skill 6 — know PACKRAT's play
  "/audio/wren/m16w-s6-learn.mp3":
    "[serious] See PACKRAT's data play, four moves. First, collect your crumbs from everywhere. Second, assemble them into a file. Third, package that file up. Fourth, sell it to whoever pays. [determined] And here's your power: the file is only as rich as the crumbs feeding it. Cut the sources, lock your profiles, delete old data, request takedowns, and the file starves. You can't stop every crumb, but you can make PACKRAT's file thin and nearly worthless.",
  "/audio/wren/m16w-s6-ok.mp3":
    "[proud] That's the whole strategy. You can't chase down every copy of your data, but you CAN turn off the taps feeding it. Fewer crumbs in means a thinner, weaker, less valuable file. Starve the source.",
  "/audio/wren/m16w-s6-bad.mp3":
    "[warm] You can't buy back every copy, and it just keeps rebuilding. Cut the sources instead so it can't be refilled. Try again.",
  "/audio/wren/m16w-s6-bad2.mp3":
    "[warm] They can, that's this whole case. Cut the sources and the file shrinks. Try again.",
  "/audio/wren/m16w-s6-q2ok.mp3":
    "[proud] That's the machine. Collect, assemble, sell, and it all runs on the crumbs you can cut off.",
  "/audio/wren/m16w-s6-q3ok.mp3":
    "[proud] Starve the source. Lock down, location off, delete old data, and the file goes thin.",

  // skill 7 — own your trail
  "/audio/wren/m16w-s7-learn.mp3":
    "[warm] Last skill, and it's about ownership. Your data trail is yours to shape. So a few times a year, audit yourself, search your name, view your profiles as a stranger. Lock down what should be private, delete what you've outgrown, and ask sites to remove the rest. [encouraging] You'll never be invisible, and that's fine. The goal is simple: you decide what's out there, not PACKRAT.",
  "/audio/wren/m16w-s7-ok.mp3":
    "[proud] That's ownership. Audit, lock down, take down, on repeat. You'll never be a ghost, but you'll be the one holding the pen, deciding what your file says. That's exactly where you want to be.",
  "/audio/wren/m16w-s7-bad.mp3":
    "[warm] Careful, one of those feeds the file instead of shrinking it. Sharing location or reusing a public handle both grow it. Pin only the habits that keep it yours.",
  "/audio/wren/m16w-s7-q2ok.mp3":
    "[proud] Perfect. Not once and forget, a habit. A quick check a few times a year keeps the file small.",
  "/audio/wren/m16w-s7-q2bad.mp3":
    "[warm] New crumbs pile up over time. Owning your trail means checking now and then. Try again.",
  "/audio/wren/m16w-s7-q3ok.mp3":
    "[proud] That's ownership. Audit, lock down, take down, on repeat, and the pen stays in your hand.",

  // boss — "The Auction"
  "/audio/wren/m16w-boss-intro.mp3":
    "[serious] This is it, Agent. PACKRAT is about to auction the file it built on you. You can't stop the sale, but you can wreck what's for sale, cut the sources feeding the file before the gavel falls. No hints from me. [determined] Starve it.",
  "/audio/wren/m16w-boss-win.mp3":
    "[excited] Now THAT is a win, Agent. PACKRAT put your whole life up for auction, and by the time the gavel fell, there was almost nothing left to sell. [proud] You didn't chase every copy, you cut the sources, and a file with no fresh crumbs is worthless. You just proved the most important thing in this block: your data trail is yours to shape.",

  // test — "Prove it"
  "/audio/wren/m16w-test-intro.mp3":
    "[serious] Last thing before I sign this off, the test. Fresh scenarios, no hints, and you'll need most of them right. Everything about owning your data, put it to work. [excited] Ready?",
  "/audio/wren/m16w-test-pass.mp3":
    "[excited] Yes! You saw the whole picture and cut it down to nearly nothing, all on your own. [proud] PACKRAT's file on you is worthless now. Excellent work, Agent.",
  "/audio/wren/m16w-test-fail.mp3":
    "[warm] So close. Don't sweat it. Even pros miss a couple. [encouraging] Take a breath and run it again. You know this.",
};
