/**
 * Block 4 · Case 017 "Ghost Stories" — GHOSTWRITER — for THE WAR ROOM runtime.
 *
 * Block 4 = THE LONG GAME. Case 17 = synthetic media + misinformation literacy:
 * fakes are cheap now, tells are unreliable, so verify by LEAVING the page
 * (lateral reading), asking who benefits, and tracing to the original source.
 * Signature mechanic reused from the block: CONNECT (link claim -> check, rumour
 * -> beneficiary) + PIN. Boss "The Rumour Mill": stop a fake story spreading.
 * Curriculum row M17.
 */

import type { WarCase } from "./case16";

export const case17War: WarCase = {
  id: "explorers-m17",
  caseNumber: "CASE 017",
  title: "Ghost Stories",
  actor: "GHOSTWRITER",
  accent: "#B98BFF",
  open: [
    "Back at the board, Agent. New signature on the wire: GHOSTWRITER. This one doesn't steal your password, it steals your belief. It makes things that never happened look completely real.",
    "Fake photos, cloned voices, invented quotes, whole stories built from nothing, and cheap to make now. The goal is to get you to believe it, feel something, and pass it on before you think.",
    "Seven skills to tell real from fake without being fooled or paranoid, then a boss and a test. Let's learn to check before we believe.",
  ],
  openVoice: ["/audio/wren/m17w-open-1.mp3", "/audio/wren/m17w-open-2.mp3", "/audio/wren/m17w-open-3.mp3"],

  skills: [
    /* 1 · synthetic media exists */
    {
      n: 1,
      title: "Fakes are cheap now",
      goal: "Photos, video, voice and text can all be faked convincingly and fast.",
      board: "THE FORGERY DESK",
      learn: [
        { t: "wren", text: "Start with the uncomfortable truth. Today a computer can fake almost anything: a photo of a place you've never been, a video of someone saying words they never said, a voice that sounds exactly like a friend, a whole news story with no truth in it. It's cheap, it's fast, and it's getting better. So 'I saw it with my own eyes' isn't proof any more. Seeing is no longer believing.", voice: "/audio/wren/m17w-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You see a shocking video of a celebrity saying something wild. What should you assume?",
          options: [
            { label: "It could be fake, video can be made now, so I'll check", outcome: "good", then: [{ t: "wren", text: "Exactly the right reflex. Not 'everything is fake', just 'this could be, so I'll verify before I believe or share'. A calm check beats both blind trust and blind panic.", voice: "/audio/wren/m17w-s1-ok.mp3" }] },
            { label: "Video can't be faked, so it must be true", outcome: "bad", then: [{ t: "wren", text: "Video absolutely can be faked now, convincingly. Seeing isn't proof any more. Try again.", voice: "/audio/wren/m17w-s1-bad.mp3" }] },
            { label: "Share it fast so everyone sees", outcome: "bad", then: [{ t: "wren", text: "That's exactly what GHOSTWRITER wants, you spreading it before you check. Slow down first. Try again.", voice: "/audio/wren/m17w-s1-bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the THREE things a computer can convincingly fake now:",
          need: 3,
          cards: [
            { label: "A photo of a place you never went", good: true, sub: "" },
            { label: "A voice that sounds exactly like a friend", good: true, sub: "" },
            { label: "A whole news story with no truth in it", good: true, sub: "" },
            { label: "A face-to-face chat in your kitchen", good: false, sub: "that's real life" },
            { label: "A hug from the friend sitting next to you", good: false, sub: "that's real, not made" },
          ],
          ok: "Right. Photos, voices and whole stories can all be faked now, which is why you check before you believe.",
          okVoice: "/audio/wren/m17w-s1-q2ok.mp3",
        },
        {
          t: "connect",
          prompt: "Link each kind of fake to what it can pull off:",
          left: [
            { id: "photo", label: "A fake photo" },
            { id: "voice", label: "A cloned voice" },
            { id: "story", label: "A fake news story" },
          ],
          right: [
            { id: "place", label: "Shows a place that never happened" },
            { id: "call", label: "Sounds like a friend on a call" },
            { id: "event", label: "Describes an event that never happened" },
          ],
          pairs: [["photo", "place"], ["voice", "call"], ["story", "event"]],
          ok: "Exactly. Image, sound or text, all cheap to fake now, so seeing and hearing aren't proof on their own.",
          okVoice: "/audio/wren/m17w-s1-q3ok.mp3",
        },
      ],
    },

    /* 2 · tells are unreliable (PIN reliable vs unreliable checks) */
    {
      n: 2,
      title: "Tells run out",
      goal: "Hunting for weird hands or glitches fails. You need a reliable method.",
      board: "WHAT ACTUALLY WORKS",
      learn: [
        { t: "wren", text: "People love the 'spot the glitch' game, count the fingers, look for a blurry ear. Here's the problem: the fakes keep getting better, so those little tells vanish. If your whole plan is spotting glitches, you'll be fooled the day the glitch is gone. The reliable checks aren't about the image itself, they're about the source and the story around it. Let's pin the ones that keep working.", voice: "/audio/wren/m17w-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE checks that keep working even on a perfect fake:",
          need: 3,
          cards: [
            { label: "Who first posted it, and are they trustworthy?", good: true, sub: "" },
            { label: "Do reliable sources report the same thing?", good: true, sub: "" },
            { label: "Is there an original, or just a screenshot?", good: true, sub: "" },
            { label: "Count the fingers in the picture", good: false, sub: "tells vanish" },
            { label: "It looks real to me, so it's real", good: false, sub: "fakes look real" },
          ],
          ok: "That's the toolkit. Who posted it, does anyone reliable agree, and is there a real original. Those checks work no matter how perfect the fake looks, because they ask about the source, not the pixels.",
          okVoice: "/audio/wren/m17w-s2-ok.mp3",
          bad: "Careful, one of those relies on spotting a flaw in the image, and flaws vanish as fakes improve. Pin the checks about the source and the story, not the pixels.",
          badVoice: "/audio/wren/m17w-s2-bad.mp3",
        },
        {
          t: "choose",
          prompt: "A friend brags, 'I always catch fakes by looking for blurry ears.' What's the flaw in that plan?",
          options: [
            { label: "As fakes improve, those glitches vanish, so the plan stops working", outcome: "good", then: [{ t: "wren", text: "Right. A plan built on glitches fails the day the glitch is gone. Check the source instead.", voice: "/audio/wren/m17w-s2-q2ok.mp3" }] },
            { label: "Nothing, a glitch always gives a fake away", outcome: "bad", then: [{ t: "wren", text: "Fakes keep getting better and the little tells disappear. Rely on the source, not the pixels. Try again.", voice: "/audio/wren/m17w-s2-q2bad.mp3" }] },
            { label: "Blurry ears prove it's definitely real", outcome: "bad", then: [{ t: "wren", text: "A blur proves nothing either way. The reliable checks are about the source, not the image. Try again.", voice: "/audio/wren/m17w-s2-q2bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each reliable check to what it actually tells you:",
          left: [
            { id: "poster", label: "Check who first posted it" },
            { id: "outlets", label: "Check if reliable outlets agree" },
            { id: "original", label: "Check for an original, not a screenshot" },
          ],
          right: [
            { id: "trust", label: "Tells you if the source is trustworthy" },
            { id: "confirm", label: "Confirms the story beyond one page" },
            { id: "real", label: "Shows there's real proof behind it" },
          ],
          pairs: [["poster", "trust"], ["outlets", "confirm"], ["original", "real"]],
          ok: "That's the method. Every one asks about the source and the story, so they keep working no matter how good the fake looks.",
          okVoice: "/audio/wren/m17w-s2-q3ok.mp3",
        },
      ],
    },

    /* 3 · lateral reading (CONNECT claim -> where to check) */
    {
      n: 3,
      title: "Read sideways",
      goal: "Leave the page. Open new tabs and see what the rest of the web says.",
      board: "LATERAL READING",
      learn: [
        { t: "wren", text: "Here's the single most powerful skill in this case: lateral reading. When something surprises you, don't stare harder at the page trying to decide if it's real. Leave it. Open new tabs, search the claim, the person, the photo, and see what everyone else says. Fact-checkers don't read down a suspicious page, they read sideways across the whole web. Let's connect each claim to the tab that would check it.", voice: "/audio/wren/m17w-s3-learn.mp3" },
      ],
      practice: [
        {
          t: "connect",
          prompt: "Link each thing you want to check to how you'd read sideways:",
          left: [
            { id: "photo", label: "A photo that looks staged" },
            { id: "quote", label: "A shocking quote from a leader" },
            { id: "site", label: "A news site you've never heard of" },
          ],
          right: [
            { id: "rev", label: "Reverse image search it" },
            { id: "news", label: "Search it, do trusted outlets report it too?" },
            { id: "about", label: "Search the site itself, who runs it?" },
          ],
          pairs: [["photo", "rev"], ["quote", "news"], ["site", "about"]],
          ok: "That's reading sideways. A reverse image search shows where a photo really came from; searching a quote shows if anyone reliable reported it; searching a site shows who's really behind it. You left the page, and the truth was one tab away.",
          okVoice: "/audio/wren/m17w-s3-ok.mp3",
          bad: "Not quite. Match the check to the claim: images go to reverse image search, quotes go to a news search, unknown sites you look up directly. Try again.",
          badVoice: "/audio/wren/m17w-s3-bad.mp3",
        },
        {
          t: "choose",
          prompt: "A page makes a wild claim. Where should you look to decide if it's true?",
          options: [
            { label: "Away from the page, in new tabs across the rest of the web", outcome: "good", then: [{ t: "wren", text: "Exactly. That's reading sideways. The page will always vouch for itself, so you check what everyone else says.", voice: "/audio/wren/m17w-s3-q2ok.mp3" }] },
            { label: "Deeper into the same page, reading every word", outcome: "bad", then: [{ t: "wren", text: "Reading the page harder just traps you in its story. Leave it and check elsewhere. Try again.", voice: "/audio/wren/m17w-s3-q2bad.mp3" }] },
            { label: "The page's own 'About Us' section", outcome: "bad", then: [{ t: "wren", text: "A dodgy site will happily lie about itself. Search it from the outside instead. Try again.", voice: "/audio/wren/m17w-s3-q2bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "A post surprises you. Pin the THREE things you'd open a new tab to search:",
          need: 3,
          cards: [
            { label: "The exact claim, to see who else reports it", good: true, sub: "" },
            { label: "The person named in it", good: true, sub: "" },
            { label: "The photo, with a reverse image search", good: true, sub: "" },
            { label: "The same page again, top to bottom", good: false, sub: "still on the page" },
            { label: "Only the comments under the post", good: false, sub: "not the wider web" },
          ],
          ok: "That's reading sideways. New tabs, real searches, and the truth is usually one of them away.",
          okVoice: "/audio/wren/m17w-s3-q3ok.mp3",
        },
      ],
    },

    /* 4 · who benefits (cui bono) */
    {
      n: 4,
      title: "Who benefits?",
      goal: "Every rumour pushes something. Ask who gains if you believe it.",
      board: "CUI BONO",
      learn: [
        { t: "wren", text: "When a story is designed to make you angry or scared, ask one cool question: who benefits if I believe this? Someone selling something, someone wanting your vote, your click, your outrage, or your money. Real information doesn't usually need you frightened right now. If a story's whole job is to make you feel a strong thing and act instantly, follow the benefit, and you'll often find the ghostwriter.", voice: "/audio/wren/m17w-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A viral post screams 'Everyone's deleting this app, it's dangerous!' with a link to a rival app. Who benefits?",
          options: [
            { label: "The rival app, it wins users if you panic and switch", outcome: "good", then: [{ t: "wren", text: "Right. The panic conveniently points you at a competitor. That doesn't prove the first app is safe, it proves the story has a motive. Follow the benefit and verify before you act.", voice: "/audio/wren/m17w-s4-ok.mp3" }] },
            { label: "Nobody, people just share out of kindness", outcome: "bad", then: [{ t: "wren", text: "A post that ends with 'switch to this instead' has a motive built in. Ask who profits. Try again.", voice: "/audio/wren/m17w-s4-bad.mp3" }] },
            { label: "Me, so I should switch right now", outcome: "bad", then: [{ t: "wren", text: "The one thing you shouldn't do is act instantly on a scare with a sales pitch attached. Check first. Try again.", voice: "/audio/wren/m17w-s4-bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the TWO signs a story is built to push something, not just inform you:",
          need: 2,
          cards: [
            { label: "It wants you angry or scared right now", good: true, sub: "" },
            { label: "It ends with 'buy this' or 'switch to that'", good: true, sub: "" },
            { label: "It quietly links to its sources", good: false, sub: "that's a good sign" },
            { label: "It gives you time to check", good: false, sub: "real info can wait" },
          ],
          ok: "Right. A rushed feeling and a built-in sales pitch are the tells that someone gains if you believe it.",
          okVoice: "/audio/wren/m17w-s4-q2ok.mp3",
        },
        {
          t: "connect",
          prompt: "Link each rumour to who really benefits if you believe it:",
          left: [
            { id: "app", label: "'This app is dangerous, use ours!'" },
            { id: "vote", label: "'The other candidate is a monster!'" },
            { id: "cure", label: "'The cure they don't want you to know!'" },
          ],
          right: [
            { id: "rival", label: "The rival app that wins your users" },
            { id: "opp", label: "The opposing side that wants your vote" },
            { id: "seller", label: "The seller making money from the 'cure'" },
          ],
          pairs: [["app", "rival"], ["vote", "opp"], ["cure", "seller"]],
          ok: "Follow the benefit and the ghostwriter appears. Every one has someone who profits if you believe it.",
          okVoice: "/audio/wren/m17w-s4-q3ok.mp3",
        },
      ],
    },

    /* 5 · trace to source */
    {
      n: 5,
      title: "Find the original",
      goal: "A screenshot of a screenshot proves nothing. Trace back to the source.",
      board: "TRACE TO SOURCE",
      learn: [
        { t: "wren", text: "Rumours travel as screenshots, of screenshots, of things nobody can find any more. That's a red flag by itself. Before you believe a claim, find the original: the real post, the real article, the real video, from the real account. If nobody can point to an original and it's all just re-shares of a re-share, treat it as unproven. No source, no belief.", voice: "/audio/wren/m17w-s5-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A screenshot of a tweet is going round, but you can't find the actual tweet anywhere. What's the smart read?",
          options: [
            { label: "Treat it as unproven, no original means no proof", outcome: "good", then: [{ t: "wren", text: "Exactly. A screenshot with no findable original is one of the oldest tricks, because screenshots are trivial to fake. No source, no belief. You keep it in the 'unproven' pile.", voice: "/audio/wren/m17w-s5-ok.mp3" }] },
            { label: "Believe it, screenshots don't lie", outcome: "bad", then: [{ t: "wren", text: "Screenshots are some of the easiest things to fake, anyone can edit text into one. Find the original or don't believe it. Try again.", voice: "/audio/wren/m17w-s5-bad.mp3" }] },
            { label: "Share it and ask if it's true", outcome: "bad", then: [{ t: "wren", text: "Sharing to ask still spreads it, and most people won't see your question. Verify first, share second. Try again.", voice: "/audio/wren/m17w-s5-bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the THREE things that count as a real original source:",
          need: 3,
          cards: [
            { label: "The actual post on the real account", good: true, sub: "" },
            { label: "The full article on the real news site", good: true, sub: "" },
            { label: "The original video from whoever filmed it", good: true, sub: "" },
            { label: "A screenshot someone re-shared", good: false, sub: "not an original" },
            { label: "'My cousin says it's true'", good: false, sub: "not a source" },
          ],
          ok: "Right. A real original is the actual post, article or video from the real source, not a re-shared screenshot.",
          okVoice: "/audio/wren/m17w-s5-q2ok.mp3",
        },
        {
          t: "connect",
          prompt: "Link each rumour to how you'd trace it back to the source:",
          left: [
            { id: "quote", label: "A screenshot of a shocking quote" },
            { id: "clip", label: "A dramatic short video clip" },
            { id: "headline", label: "A screenshot of a news headline" },
          ],
          right: [
            { id: "acct", label: "Find the quote on the real account" },
            { id: "full", label: "Find the full, uncut original video" },
            { id: "site", label: "Find the story on the outlet's own site" },
          ],
          pairs: [["quote", "acct"], ["clip", "full"], ["headline", "site"]],
          ok: "That's tracing to source. If you can't reach a real original, treat it as unproven.",
          okVoice: "/audio/wren/m17w-s5-q3ok.mp3",
        },
      ],
    },

    /* 6 · GHOSTWRITER's play (breadcrumb) */
    {
      n: 6,
      title: "Know GHOSTWRITER's play",
      goal: "Manufacture, seed, amplify, profit. Break it at any link.",
      board: "THREAT MODEL",
      learn: [
        { t: "wren", text: "See GHOSTWRITER's play, four moves. First, manufacture: fake the photo, quote or story. Second, seed it: drop it where it'll catch, an outrage group, a comment thread. Third, amplify: bots and angry sharers spread it faster than the truth. Fourth, profit: clicks, division, a scam, or a belief they wanted planted. Here's your power: the whole machine runs on people sharing before they check. Be the one who checks, and the chain breaks.", voice: "/audio/wren/m17w-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "GHOSTWRITER's whole campaign depends on one thing from ordinary people. What?",
          options: [
            { label: "Sharing before checking, break that and the chain dies", outcome: "good", then: [{ t: "wren", text: "That's the weak link. Manufacturing a fake is easy; getting real people to spread it is the hard part they need YOU for. The moment you check before sharing, you stop being their amplifier.", voice: "/audio/wren/m17w-s6-ok.mp3" }] },
            { label: "Expensive equipment only GHOSTWRITER owns", outcome: "bad", then: [{ t: "wren", text: "The fakes are cheap now, that's the problem. The expensive part for them is your trust and your share. Try again.", voice: "/audio/wren/m17w-s6-bad.mp3" }] },
            { label: "Nothing, it spreads on its own", outcome: "bad", then: [{ t: "wren", text: "It doesn't spread on its own, it needs people to pass it on. That's the link you can break. Try again.", voice: "/audio/wren/m17w-s6-bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each of GHOSTWRITER's moves to what it means:",
          left: [
            { id: "make", label: "Manufacture" },
            { id: "amp", label: "Amplify" },
            { id: "profit", label: "Profit" },
          ],
          right: [
            { id: "fake", label: "Fake the photo, quote or story" },
            { id: "spread", label: "Get bots and angry sharers to spread it" },
            { id: "gain", label: "Cash in on clicks, division or a scam" },
          ],
          pairs: [["make", "fake"], ["amp", "spread"], ["profit", "gain"]],
          ok: "That's the machine. And every stage needs people to pass it on, which is the link you can break.",
          okVoice: "/audio/wren/m17w-s6-q2ok.mp3",
        },
        {
          t: "pin",
          prompt: "Pin the TWO moves that stop you being GHOSTWRITER's amplifier:",
          need: 2,
          cards: [
            { label: "Check a story before you share it", good: true, sub: "" },
            { label: "Refuse to pass on what you can't verify", good: true, sub: "" },
            { label: "Forward anything shocking straight away", good: false, sub: "that's amplifying" },
            { label: "Add an angry comment and re-share", good: false, sub: "still spreads it" },
          ],
          ok: "Right. Check first and refuse to pass on the unverified, and GHOSTWRITER loses the amplifier it needs.",
          okVoice: "/audio/wren/m17w-s6-q3ok.mp3",
        },
      ],
    },

    /* 7 · circuit breaker (PIN) */
    {
      n: 7,
      title: "Be the circuit breaker",
      goal: "Pause before you share. You are the link that stops the spread.",
      board: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill, and it's a habit, not a fact. You are a circuit breaker. Every fake needs people to pass it along, so when something makes you want to share right now, that urge is the signal to pause. Check the source, read sideways, ask who benefits. If it's true, it'll still be true in ten minutes. If it's fake, you just stopped it dead. One calm person who checks is worth a thousand who share.", voice: "/audio/wren/m17w-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE things a circuit breaker does before sharing:",
          need: 3,
          cards: [
            { label: "Pause when it makes you want to share now", good: true, sub: "" },
            { label: "Check the source and read sideways", good: true, sub: "" },
            { label: "Ask who benefits if I believe this", good: true, sub: "" },
            { label: "Share instantly so you're first", good: false, sub: "feeds the mill" },
            { label: "Add 'not sure if true' and post it anyway", good: false, sub: "still spreads it" },
          ],
          ok: "That's a circuit breaker. Pause, check, ask who benefits, then decide. You'll share plenty of real things, but you'll never be the reason a lie went viral. That's real power on the modern internet.",
          okVoice: "/audio/wren/m17w-s7-ok.mp3",
          bad: "Careful, one of those still spreads the fake, sharing 'just in case' or 'not sure if true' still puts it in front of people. Pin only the moves that stop the spread.",
          badVoice: "/audio/wren/m17w-s7-bad.mp3",
        },
        {
          t: "choose",
          prompt: "A post makes you desperate to share it this second. What is that urge, really?",
          options: [
            { label: "A signal to pause and check, that's exactly how fakes spread", outcome: "good", then: [{ t: "wren", text: "Exactly. The stronger the urge to share now, the more it's worth checking first.", voice: "/audio/wren/m17w-s7-q2ok.mp3" }] },
            { label: "A sign it's important, so share it fast", outcome: "bad", then: [{ t: "wren", text: "That urge is the fuel fakes run on. Treat it as a reason to slow down. Try again.", voice: "/audio/wren/m17w-s7-q2bad.mp3" }] },
            { label: "Nothing, a feeling can't be a clue", outcome: "bad", then: [{ t: "wren", text: "That rush is a real clue. It's the moment to pause and check. Try again.", voice: "/audio/wren/m17w-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each moment to the circuit-breaker move it calls for:",
          left: [
            { id: "urge", label: "You feel the urge to share now" },
            { id: "claim", label: "The claim surprises you" },
            { id: "angry", label: "It's clearly built to make you angry" },
          ],
          right: [
            { id: "pause", label: "Pause before you touch share" },
            { id: "side", label: "Read sideways to check it" },
            { id: "who", label: "Ask who benefits if you believe it" },
          ],
          pairs: [["urge", "pause"], ["claim", "side"], ["angry", "who"]],
          ok: "That's the circuit breaker in action. Pause, check, and ask who benefits, and the lie stops with you.",
          okVoice: "/audio/wren/m17w-s7-q3ok.mp3",
        },
      ],
    },
  ],

  boss: {
    board: "THE RUMOUR MILL · GHOSTWRITER",
    intro: "This is it, Agent. GHOSTWRITER has seeded a fake story and it's spreading through your school's group chats right now: a doctored photo, a fake quote, and a screenshot with no original. You're the analyst who can stop it. No hints from me. Check it, trace it, break the chain.",
    introVoice: "/audio/wren/m17w-boss-intro.mp3",
    phases: [
      {
        name: "Is it even real?",
        steps: [
          { t: "note", text: "SPREADING NOW: 'PROOF the new headteacher is a fraud!' · one blurry photo · one shocking quote · a screenshot with no link to any original" },
          {
            t: "choose",
            prompt: "The story is racing through the chats. What's your FIRST move?",
            options: [
              { label: "Read sideways, search the claim and the photo before believing", outcome: "good" },
              { label: "Forward it to warn everyone", outcome: "bad", then: [{ t: "note", text: "SPREAD +400 · you just amplified it" }] },
              { label: "Stare at the photo to decide if it's fake", outcome: "bad", then: [{ t: "note", text: "Still undecided, and the clock's running" }] },
            ],
          },
        ],
      },
      {
        name: "Follow the checks",
        steps: [
          {
            t: "connect",
            prompt: "Link each piece of 'evidence' to the check that debunks it:",
            left: [
              { id: "photo", label: "The blurry photo" },
              { id: "quote", label: "The shocking quote" },
              { id: "shot", label: "The screenshot with no link" },
            ],
            right: [
              { id: "rev", label: "Reverse image search: it's from a different city, years ago" },
              { id: "news", label: "Search it: no real outlet reports the quote" },
              { id: "orig", label: "Ask for the original: none exists" },
            ],
            pairs: [["photo", "rev"], ["quote", "news"], ["shot", "orig"]],
          },
          { t: "note", text: "VERDICT: manufactured. Old photo, invented quote, no source. Now, who benefits?" },
        ],
      },
      {
        name: "Break the chain",
        steps: [
          {
            t: "choose",
            prompt: "You've proven it's fake and you can see who seeded it. What breaks the rumour mill?",
            options: [
              { label: "Don't share it, report it, and calmly post what you verified", outcome: "good" },
              { label: "Share your own angry version to fight back", outcome: "bad", then: [{ t: "note", text: "Now there are two rumours flying, GHOSTWRITER wins" }] },
              { label: "Say nothing and hope it dies", outcome: "bad", then: [{ t: "note", text: "Silence lets the lie keep travelling unchallenged" }] },
            ],
          },
          { t: "note", text: "CHAIN BROKEN · reported · debunk shared with sources · shares collapsing" },
        ],
      },
    ],
    win: "Now THAT is analyst work, Agent. A fake was tearing through the chats, and instead of adding to it, you left the page, read sideways, traced every piece to nothing, and posted the truth with receipts. GHOSTWRITER's whole machine runs on people sharing before they check, and you were the circuit breaker. Seeing isn't believing, checking is.",
    winVoice: "/audio/wren/m17w-boss-win.mp3",
  },

  test: {
    intro: "Last thing before I sign this off, the test. Six fresh ones, no hints, and you need five right. Everything about telling real from fake, put it to work. Ready?",
    introVoice: "/audio/wren/m17w-test-intro.mp3",
    passVoice: "/audio/wren/m17w-test-pass.mp3",
    failVoice: "/audio/wren/m17w-test-fail.mp3",
    pass: 5,
    questions: [
      { scenario: "A very realistic video shows someone famous saying something shocking.", ask: "What's the right assumption?", options: [{ label: "It could be fake, so verify before believing or sharing", correct: true }, { label: "Video can't be faked, it's true" }, { label: "Share it right away" }] },
      { scenario: "You want a check that still works on a flawless fake.", ask: "Which one holds up?", options: [{ label: "Do reliable sources report the same thing?", correct: true }, { label: "Count the fingers in the image" }, { label: "It looks real to me" }] },
      { scenario: "A claim surprises you and you want the truth.", ask: "What is 'reading sideways'?", options: [{ label: "Leave the page and see what the rest of the web says", correct: true }, { label: "Read the suspicious page more slowly" }, { label: "Trust the page's own 'about' text" }] },
      { scenario: "A scary post ends with 'so switch to this other app now'.", ask: "What should you ask?", options: [{ label: "Who benefits if I believe and act on this?", correct: true }, { label: "How fast can I switch?" }, { label: "Nothing, panic is fine" }] },
      { scenario: "A screenshot is going round but the original can't be found.", ask: "How should you treat it?", options: [{ label: "Unproven, no findable original means no proof", correct: true }, { label: "True, screenshots don't lie" }, { label: "Share it to ask if it's real" }] },
      { scenario: "A fake story is spreading and you've confirmed it's false.", ask: "What breaks the rumour mill?", options: [{ label: "Don't share, report it, and post the verified truth", correct: true }, { label: "Share an angrier version" }, { label: "Stay silent and hope" }] },
    ],
  },

  debrief: {
    title: "The ghost, debunked.",
    lines: [
      "Seven skills, a live rumour, and a test, and GHOSTWRITER's fake collapsed the moment you checked it.",
      "You learned that seeing isn't believing, that image glitches aren't a plan, and that the truth is usually one new tab away.",
      "You read sideways, asked who benefits, traced every claim to its source, and became the circuit breaker instead of the amplifier.",
    ],
    move:
      "This week, catch yourself once: the next time a post makes you want to share instantly, pause and read sideways first. Open one new tab and search the claim before you pass it on. That single habit beats almost every fake.",
  },
};
