/**
 * WREN's spoken scripts for Case 016 ("The File On You", Block 4 opener, the
 * WarRoom runtime). See mission01.mjs, mission06.mjs, and mission11.mjs for
 * conventions. test.passVoice/failVoice have no text field in case16.ts —
 * recovered by transcription. failVoice is the generic template reused
 * across cases.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress. PACKRAT is "he".
 */
export const mission16VoiceScripts = {
  "/audio/wren/m16w-open-1.mp3":
    "[serious] You have the highest clearance now, Agent. Welcome to the War Room. From here, you don't just spot one attack. You see the whole picture, and connect it.",
  "/audio/wren/m16w-open-2.mp3":
    "[serious] Our first target is the file. Right now, companies you've never heard of keep a file on you. It shows what you like, where you go, and who you know, and they trade it. PACKRAT's whole business is building and selling that file.",
  "/audio/wren/m16w-open-3.mp3":
    "[serious] You'll learn seven skills to take control of your own data, then face a boss and a test. Let's find out what your file says, and start cutting it down.",

  // skill 1 — the data economy
  "/audio/wren/m16w-s1-learn.mp3":
    "[warm] Start with the big secret of the internet. A lot of free apps and sites aren't really free, because you pay with data. As you browse, tap, and post, trackers quietly note what you like, where you go, and who you talk to. That gets bundled into a file about you, and companies buy and sell those files to target you. When something's free, quite often, the product being sold is you.",
  "/audio/wren/m16w-s1-ok.mp3":
    "[warm] Yes, that's very likely. If you can't see how something makes money, the answer is often your data. That's not a reason to panic. It's a reason to know what you're handing over, and to hand over less, which is exactly what we'll do.",
  "/audio/wren/m16w-s1-bad.mp3":
    "[warm] Companies rarely run big apps out of kindness. If there's no obvious payment, the product is usually your data. Try again.",
  "/audio/wren/m16w-s1-bad2.mp3":
    "[warm] Ha, there's no magic here. Free usually means you're paying with data. Try again.",
  "/audio/wren/m16w-s1-q2ok.mp3":
    "[warm] Right. When it's free, you usually pay with your data and your attention. Now you can see the real price.",
  "/audio/wren/m16w-s1-q3ok.mp3":
    "[warm] See the pattern? Free almost always means your data is the product being sold.",

  // skill 2 — what's in your file
  "/audio/wren/m16w-s2-learn.mp3":
    "[warm] So what's actually in a file about you? It's not one big secret. It's lots of tiny crumbs, each giving away a piece. Your posts show your face and friends. Your location tags show where you are. Your searches show what you're into, and your purchases show what you buy. On their own, they seem harmless. Connected on a board, they draw a scarily complete picture. Let's connect a few and see.",
  "/audio/wren/m16w-s2-ok.mp3":
    "[warm] See how fast it builds? Each crumb is small, but once they're connected, they reveal where you live, everything you're into, and every account that's really you. That's a file. And a file made of crumbs can be taken apart, crumb by crumb.",
  "/audio/wren/m16w-s2-bad.mp3":
    "[warm] Not quite. Look again at what each crumb gives away. A location tag reveals a place, a repeated username links your accounts, and purchases reveal your habits. Match them up.",
  "/audio/wren/m16w-s2-q2ok.mp3":
    "[warm] Exactly. One post can carry your face, your friends, where you were and when. That's a lot of crumbs in one bite.",
  "/audio/wren/m16w-s2-q2bad.mp3":
    "[warm] That one's nearly harmless. Look for the post stacked with crumbs, like your face, a place, a date, and your friends. Try again.",
  "/audio/wren/m16w-s2-q3ok.mp3":
    "[warm] Right. Check-ins, searches and friends are all real crumbs that build the file.",

  // skill 3 — audit your own trail
  "/audio/wren/m16w-s3-learn.mp3":
    "[warm] Here's a powerful move. Audit yourself, the same way an attacker would. Search your own name and usernames. Look at your profiles the way a stranger sees them, logged out. You'll be surprised what's public, like an old post, a tagged photo, or a visible friends list. You can't fix what you can't see, so the self-audit is always step one. See your own file before anyone else uses it.",
  "/audio/wren/m16w-s3-ok.mp3":
    "[warm] Exactly. You can't tidy a trail you've never looked at. Searching yourself and viewing your profiles as a stranger shows you the real file. Once you can see it, you can start cutting it down.",
  "/audio/wren/m16w-s3-bad.mp3":
    "[warm] That's drastic and usually unnecessary. Start by seeing what's actually out there, then fix the real gaps. Audit first. Try again.",
  "/audio/wren/m16w-s3-bad2.mp3":
    "[warm] You can, and that's the point. Search yourself and view your profiles logged out to see what a stranger sees. Try again.",
  "/audio/wren/m16w-s3-q2ok.mp3":
    "[warm] That's a proper self-audit. Search yourself, look logged out, and check what's public.",
  "/audio/wren/m16w-s3-q3ok.mp3":
    "[warm] Exactly. Seeing it was the whole point. Now you can fix it on purpose.",
  "/audio/wren/m16w-s3-q3bad.mp3":
    "[warm] You audited your trail for a reason, and that reason was to act. Deal with the posts you don't want public. Try again.",

  // skill 4 — cut it down
  "/audio/wren/m16w-s4-learn.mp3":
    "[warm] Now comes the satisfying part, which is cutting the file down. You have more control than you think. Set profiles to private so only friends see them. Turn off location sharing. Delete old posts you've outgrown. Trim your public info. Every crumb you remove is one less thing in the file. You're not deleting yourself. You're curating, and deciding on purpose what the world gets to see.",
  "/audio/wren/m16w-s4-ok.mp3":
    "[warm] That's real control. Your profiles are private, your location is off, and your old posts are gone. Each one is a crumb the file no longer has. You didn't disappear. You decided what's yours to share and what isn't. That's curation.",
  "/audio/wren/m16w-s4-bad.mp3":
    "[warm] Careful, two of those make your file bigger. Posting your birthday and address, or reusing one public handle, feeds the file. Pin only the moves that shrink it.",
  "/audio/wren/m16w-s4-q2ok.mp3":
    "[warm] Right. Private means only people you approve can see. One switch makes a big difference.",
  "/audio/wren/m16w-s4-q2bad.mp3":
    "[warm] More posts mean more crumbs, not fewer. Go private instead. Try again.",
  "/audio/wren/m16w-s4-q3ok.mp3":
    "[warm] Every setting is a crumb removed. That's you shrinking the file on purpose.",

  // skill 5 — ask it down
  "/audio/wren/m16w-s5-learn.mp3":
    "[warm] Sometimes data about you sits on a site you don't even control. It might be an old account, a page that mentions you, or a data broker's list. Here's the good news. You often have the right to ask for it to be taken down, and most services have a delete-my-data or privacy request option. It's not instant and it's not perfect, but asking works more often than people think. If in doubt, a trusted adult can help you send the request.",
  "/audio/wren/m16w-s5-ok.mp3":
    "[warm] Exactly. Most sites have a way to delete an account, or to request that your data be removed. It won't fix everything overnight, but every takedown is a real crumb gone. And an adult can help with the trickier ones.",
  "/audio/wren/m16w-s5-bad.mp3":
    "[warm] That's not true. You often have the right to have data removed, and most sites have a delete option. Asking works more often than you'd think. Try again.",
  "/audio/wren/m16w-s5-bad2.mp3":
    "[warm] Posting more just adds to the file. The move is to remove the old data, not pile new data on top. Try again.",
  "/audio/wren/m16w-s5-q2ok.mp3":
    "[warm] Right. Use the delete option, and ask a trusted adult for the tricky ones. Both really work.",
  "/audio/wren/m16w-s5-q3ok.mp3":
    "[warm] Exactly. Some takedowns are fiddly, and an adult can help. You never have to do it alone.",
  "/audio/wren/m16w-s5-q3bad.mp3":
    "[warm] That just makes more mess and more data. Get help removing the real account. Try again.",

  // skill 6 — know PACKRAT's play
  "/audio/wren/m16w-s6-learn.mp3":
    "[warm] Let's see PACKRAT's data play. It has three moves. First, he collects your crumbs from everywhere. Second, he assembles them into a file. Third, he packages the file and sells it to whoever pays. And here's your power. The file is only as rich as the crumbs feeding it. Cut the sources, lock your profiles, delete old data, and request takedowns, and the file starves. You can't stop every crumb, but you can make PACKRAT's file thin and nearly worthless.",
  "/audio/wren/m16w-s6-ok.mp3":
    "[warm] That's the whole strategy. You can't chase down every copy of your data, but you can turn off the taps feeding it. Fewer crumbs going in means a thinner, weaker, less valuable file. Starve the source.",
  "/audio/wren/m16w-s6-bad.mp3":
    "[warm] You can't buy back every copy, and it just keeps rebuilding. Cut the sources instead so it can't be refilled. Try again.",
  "/audio/wren/m16w-s6-bad2.mp3":
    "[warm] They can, and that's what this whole case is about. Cut the sources and the file shrinks. Try again.",
  "/audio/wren/m16w-s6-q2ok.mp3":
    "[warm] That's the machine. He collects, assembles and sells, and it all runs on the crumbs you can cut off.",
  "/audio/wren/m16w-s6-q3ok.mp3":
    "[warm] Starve the source. Lock your profiles, turn off your location, and delete old data, and the file goes thin.",

  // skill 7 — own your trail
  "/audio/wren/m16w-s7-learn.mp3":
    "[warm] This is the last skill, and it's about ownership. Your data trail is yours to shape. So a few times a year, audit yourself. Search your name, and view your profiles as a stranger. Lock down what should be private, delete what you've outgrown, and ask sites to remove the rest. You'll never be invisible, and that's fine. The goal is simple. You decide what's out there, not PACKRAT.",
  "/audio/wren/m16w-s7-ok.mp3":
    "[warm] That's ownership. You audit, lock down, and take down, on repeat. You'll never be a ghost, but you'll be the one holding the pen, deciding what your file says. That's exactly where you want to be.",
  "/audio/wren/m16w-s7-bad.mp3":
    "[warm] Careful, two of those feed the file instead of shrinking it. Sharing your location and reusing a public handle both grow it. Pin only the habits that keep it yours.",
  "/audio/wren/m16w-s7-q2ok.mp3":
    "[warm] Perfect. It's not something you do once and forget. It's a habit. A quick check a few times a year keeps the file small.",
  "/audio/wren/m16w-s7-q2bad.mp3":
    "[warm] New crumbs pile up over time. Owning your trail means checking now and then. Try again.",
  "/audio/wren/m16w-s7-q3ok.mp3":
    "[warm] That's ownership. You audit, lock down, and take down, on repeat, and the pen stays in your hand.",

  // boss — "The Auction"
  "/audio/wren/m16w-boss-intro.mp3":
    "[determined] This is it, Agent. PACKRAT is about to auction the file he built on you. You can't stop the sale, but you can wreck what's for sale. Cut the sources feeding the file before the gavel falls. You'll get no hints from me. Starve it.",
  "/audio/wren/m16w-boss-win.mp3":
    "[proud] Now that is a win, Agent. PACKRAT put your whole life up for auction, and by the time the gavel fell, there was almost nothing left to sell. You didn't chase every copy. You cut the sources, and a file with no fresh crumbs is worthless. You just proved the most important thing in this block. Your data trail is yours to shape.",

  // test — "Prove it"
  "/audio/wren/m16w-test-intro.mp3":
    "[warm] There's one last thing before I sign this off, and that's the test. The scenarios are fresh, there are no hints, and you'll need most of them right. Put everything you know about owning your data to work. Ready?",
  "/audio/wren/m16w-test-pass.mp3":
    "[proud] Yes! You saw the whole picture and cut it down to nearly nothing, all on your own. PACKRAT's file on you is worthless now. Excellent work, Agent.",
  "/audio/wren/m16w-test-fail.mp3":
    "[warm] That was so close, Agent. Don't sweat it, because even pros miss a couple. Take a breath and run it again. You know this.",
};
