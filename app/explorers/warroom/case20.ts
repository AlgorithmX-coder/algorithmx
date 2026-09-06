/**
 * Block 4 · Case 020 "Signal Zero" — K-STATIC / COORD — for THE WAR ROOM runtime.
 *
 * Block 4 = THE LONG GAME. Case 20 = the CAPSTONE. NO new concepts. Everything the
 * Explorer has learned is recombined on one board: the five signatures they've met
 * (PHANTOM HOOK, PACKRAT, GHOSTWRITER, THE FLOOD) all trace to one coordinating
 * hand, K-STATIC / COORD, who turns out to be a former ARC analyst who broke the
 * Code. The finale isn't revenge, it's doing it right: evidence, proper channels,
 * upholding the Code. Signature mechanic: CONNECT (five breadcrumbs -> one hand) +
 * PIN. Boss "Signal Zero". Ends the series with the ULTRA ceremony. Curriculum M20.
 */

import type { WarCase } from "./case16";

export const case20War: WarCase = {
  id: "explorers-m20",
  caseNumber: "CASE 020",
  title: "Signal Zero",
  actor: "K-STATIC / COORD",
  accent: "#B98BFF",
  open: [
    "This is the last case, Agent. No new tricks today, you already have everything you need. Today we put it all together, and we find out who's been behind it the whole time.",
    "Every signature you've faced, the phisher, the data hoarder, the ghostwriter, the flood, they were never really separate. One hand has been conducting them. On this board, we connect all of it, and we trace it back to the source. Signal Zero.",
    "Seven skills, all recombined, then a final boss and a last test. Everything you've learned, one board, one answer. Let's finish this.",
  ],
  openVoice: ["/audio/wren/m20w-open-1.mp3", "/audio/wren/m20w-open-2.mp3", "/audio/wren/m20w-open-3.mp3"],

  skills: [
    /* 1 · read the whole board (synthesis recall) */
    {
      n: 1,
      title: "Read the whole board",
      goal: "Recall the analyst's habit: never one clue, always the picture they form.",
      board: "THE FULL BOARD",
      learn: [
        { t: "wren", text: "Start where the War Room began: never trust one clue alone, read the whole board. One alert is noise. Ten alerts that fit together are a story. Your job as an analyst was never to react to a single message, it was to step back and see the pattern the pieces make. Today the whole board is finally in front of you, months of it. So let's do what you do best, step back, and read it as one picture.", voice: "/audio/wren/m20w-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You've got a dozen separate alerts from across the whole year. What's the analyst move?",
          options: [
            { label: "Look for the pattern that connects them, not each one alone", outcome: "good", then: [{ t: "wren", text: "That's it. A single alert tells you almost nothing; the pattern across all of them tells you everything. Reading the whole board is what turns scattered noise into a name.", voice: "/audio/wren/m20w-s1-ok.mp3" }] },
            { label: "Deal with each one on its own and forget it", outcome: "bad", then: [{ t: "wren", text: "Handled one at a time, you'd miss the very thing that matters, how they connect. Step back and read the whole board. Try again.", voice: "/audio/wren/m20w-s1-bad.mp3" }] },
            { label: "Ignore them, twelve is too many to think about", outcome: "bad", then: [{ t: "wren", text: "Twelve connected clues is exactly when patterns appear. Don't ignore them, connect them. Try again.", voice: "/audio/wren/m20w-s1-bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the TWO signs you're looking at a pattern, not just noise:",
          need: 2,
          cards: [
            { label: "Many alerts that fit together", good: true, sub: "" },
            { label: "The same detail cropping up again and again", good: true, sub: "" },
            { label: "One single alert on its own", good: false, sub: "that's just noise" },
            { label: "Alerts you delete without reading", good: false, sub: "you learn nothing" },
          ],
          ok: "Right. Alerts that fit together and details that repeat are how a pattern shows itself. One alert alone tells you almost nothing.",
          okVoice: "/audio/wren/m20w-s1-q2ok.mp3",
        },
        {
          t: "connect",
          prompt: "Link each view of the evidence to what it gives you:",
          left: [
            { id: "one", label: "A single alert on its own" },
            { id: "many", label: "A dozen alerts connected" },
            { id: "repeat", label: "The same detail cropping up again" },
          ],
          right: [
            { id: "noise", label: "Noise, tells you little" },
            { id: "story", label: "A story you can act on" },
            { id: "pattern", label: "The first sign of a pattern" },
          ],
          pairs: [["one", "noise"], ["many", "story"], ["repeat", "pattern"]],
          ok: "That's the analyst's eye. One clue is noise, connected clues are a story, and a repeat is where the pattern begins.",
          okVoice: "/audio/wren/m20w-s1-q3ok.mp3",
        },
      ],
    },

    /* 2 · the five signatures (CONNECT all breadcrumbs) */
    {
      n: 2,
      title: "The five signatures",
      goal: "You know every actor's MO by heart. Match each attack to who runs it.",
      board: "THE SIGNATURES",
      learn: [
        { t: "wren", text: "You've met them all, and you know their signatures cold. PHANTOM HOOK, the phisher, fake urgency to steal a login. PACKRAT, the hoarder, quietly building a file to sell. GHOSTWRITER, the forger, fakes made to be believed and shared. THE FLOOD, the spammer, blasting scams wide to catch the few. Each has a fingerprint you can spot in seconds now. Let's connect each attack on the board to the signature behind it.", voice: "/audio/wren/m20w-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "connect",
          prompt: "Link each attack to the signature that runs it:",
          left: [
            { id: "url", label: "\"Account locked, click to verify\"" },
            { id: "file", label: "A file quietly built from your crumbs" },
            { id: "fake", label: "A faked video made to go viral" },
            { id: "spam", label: "The same scam blasted to thousands" },
          ],
          right: [
            { id: "hook", label: "PHANTOM HOOK, phishing" },
            { id: "rat", label: "PACKRAT, data hoarding" },
            { id: "ghost", label: "GHOSTWRITER, synthetic media" },
            { id: "flood", label: "THE FLOOD, mass scam spray" },
          ],
          pairs: [["url", "hook"], ["file", "rat"], ["fake", "ghost"], ["spam", "flood"]],
          ok: "Every signature, named on sight. That's a year of training in one glance. Now here's the thing that should give you a chill, look at how neatly they interlock. That's not four crews bumping into each other. That's coordination.",
          okVoice: "/audio/wren/m20w-s2-ok.mp3",
          bad: "Not quite, but you know these. Fake urgency is PHANTOM HOOK; the quiet file is PACKRAT; the fake video is GHOSTWRITER; the mass blast is THE FLOOD. Match them up. Try again.",
          badVoice: "/audio/wren/m20w-s2-bad.mp3",
        },
        {
          t: "choose",
          prompt: "A message screams 'Your account is locked, click now to verify.' Whose signature is that?",
          options: [
            { label: "PHANTOM HOOK, phishing", outcome: "good", then: [{ t: "wren", text: "Spot on. Fake urgency plus a 'verify now' link is PHANTOM HOOK's whole move, phishing for your login.", voice: "/audio/wren/m20w-s2-q2ok.mp3" }] },
            { label: "PACKRAT, quietly hoarding data", outcome: "bad", then: [{ t: "wren", text: "PACKRAT works in silence, it never shouts at you to click. Fake urgency for a login is PHANTOM HOOK. Try again.", voice: "/audio/wren/m20w-s2-q2bad.mp3" }] },
            { label: "THE FLOOD, mass spam", outcome: "bad", then: [{ t: "wren", text: "THE FLOOD blasts wide, but this is the classic 'verify now' login trap, PHANTOM HOOK. Try again.", voice: "/audio/wren/m20w-s2-q2bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the TWO tell-tale signs of GHOSTWRITER, the forger:",
          need: 2,
          cards: [
            { label: "A clip made to look real but faked", good: true, sub: "" },
            { label: "Fakes built to be believed and shared", good: true, sub: "" },
            { label: "A quiet file built to be sold", good: false, sub: "that's PACKRAT" },
            { label: "The same scam blasted to thousands", good: false, sub: "that's THE FLOOD" },
          ],
          ok: "Right. GHOSTWRITER makes convincing fakes designed to be believed and shared. That's the forger's fingerprint.",
          okVoice: "/audio/wren/m20w-s2-q3ok.mp3",
        },
      ],
    },

    /* 3 · follow the benefit */
    {
      n: 3,
      title: "Follow the benefit",
      goal: "Ask the question that cuts through everything: who gains from all of it?",
      board: "CUI BONO",
      learn: [
        { t: "wren", text: "Bring back the question from the ghostwriter case, who benefits? But now ask it about everything at once. Who gains if PACKRAT's file feeds PHANTOM HOOK's phishing, which feeds THE FLOOD's scams, all covered by GHOSTWRITER's fakes? Not four separate crooks with four small wins. One operator, running them as one machine, taking the profit from the whole chain. Follow the benefit all the way up, and it points to a single desk.", voice: "/audio/wren/m20w-s3-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "All four signatures feed each other perfectly. Who most likely benefits?",
          options: [
            { label: "One coordinator profiting from the whole chain", outcome: "good", then: [{ t: "wren", text: "Right. When separate attacks fit together this cleanly and hand off to each other, that's design, not luck. Someone built the machine and takes the profit from all of it. Follow the benefit, find the hand.", voice: "/audio/wren/m20w-s3-ok.mp3" }] },
            { label: "Four unrelated crooks who never met", outcome: "bad", then: [{ t: "wren", text: "Four strangers don't hand off to each other this perfectly. The clean fit is the fingerprint of one coordinator. Try again.", voice: "/audio/wren/m20w-s3-bad.mp3" }] },
            { label: "No one, it's all random chance", outcome: "bad", then: [{ t: "wren", text: "This is far too neat for chance. Ask who profits from the whole chain, and a single operator appears. Try again.", voice: "/audio/wren/m20w-s3-bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each attack to what it hands the next one in the chain:",
          left: [
            { id: "rat", label: "PACKRAT's file of crumbs" },
            { id: "hook", label: "PHANTOM HOOK's phishing" },
            { id: "ghost", label: "GHOSTWRITER's fakes" },
          ],
          right: [
            { id: "fuel", label: "Feeds targets into the next attack" },
            { id: "steal", label: "Turns those targets into stolen logins" },
            { id: "cover", label: "Makes the whole thing look believable" },
          ],
          pairs: [["rat", "fuel"], ["hook", "steal"], ["ghost", "cover"]],
          ok: "See the chain? Each attack feeds the next, and every link pays into the same pocket. Follow the benefit and it points to one operator.",
          okVoice: "/audio/wren/m20w-s3-q2ok.mp3",
        },
        {
          t: "pin",
          prompt: "Pin the TWO clues that say ONE operator profits, not four:",
          need: 2,
          cards: [
            { label: "The attacks hand off to each other perfectly", good: true, sub: "" },
            { label: "The profit from every stage flows one way", good: true, sub: "" },
            { label: "Each attack works alone and shares nothing", good: false, sub: "that points to separate crooks" },
            { label: "Nobody gains anything at all", good: false, sub: "then why run them?" },
          ],
          ok: "Right. Clean hand-offs and profit flowing one way both point to a single operator running the whole chain.",
          okVoice: "/audio/wren/m20w-s3-q3ok.mp3",
        },
      ],
    },

    /* 4 · one hand, one fingerprint (CONNECT trait -> proof) */
    {
      n: 4,
      title: "One hand behind it",
      goal: "Shared timing, tools and targets prove one coordinator, not many.",
      board: "THE FINGERPRINT",
      learn: [
        { t: "wren", text: "So how do you prove one hand, not four? You look for shared fingerprints across the attacks. Same timing, they all move together. Same tools, reused code and phrases. Same targets, the same people hit in sequence. And the same tradecraft, the same clever style in how it's run. When four 'different' attacks share timing, tools, targets and style, that's not a coincidence, that's a signature of its own. The coordinator's own fingerprint. Let's connect each shared trait to what it proves.", voice: "/audio/wren/m20w-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "connect",
          prompt: "Link each shared trait to what it reveals:",
          left: [
            { id: "time", label: "All four strike in the same tight window" },
            { id: "tool", label: "The same rare phrases and code reused" },
            { id: "target", label: "The same people hit in sequence" },
          ],
          right: [
            { id: "one", label: "One schedule, one operator" },
            { id: "kit", label: "One toolkit, one author" },
            { id: "plan", label: "One target list, one plan" },
          ],
          pairs: [["time", "one"], ["tool", "kit"], ["target", "plan"]],
          ok: "That's how you prove coordination. One schedule, one toolkit, one target list, four masks over a single operator. The fingerprint is unmistakable now. Which means it's time to ask the hardest question: who is it?",
          okVoice: "/audio/wren/m20w-s4-ok.mp3",
          bad: "Not quite. Shared timing means one schedule; reused tools mean one author; the same targets in sequence mean one plan. Match the trait to the proof. Try again.",
          badVoice: "/audio/wren/m20w-s4-bad.mp3",
        },
        {
          t: "choose",
          prompt: "Two 'different' attacks reuse the exact same rare phrase buried in their code. What does that suggest?",
          options: [
            { label: "One author wrote both, it's the same hand", outcome: "good", then: [{ t: "wren", text: "Right. Rare reused code is like handwriting. The same fingerprint across attacks means one author behind them.", voice: "/audio/wren/m20w-s4-q2ok.mp3" }] },
            { label: "A total coincidence, ignore it", outcome: "bad", then: [{ t: "wren", text: "Rare phrases don't repeat by accident. Reused code is a fingerprint pointing to one author. Try again.", voice: "/audio/wren/m20w-s4-q2bad.mp3" }] },
            { label: "Two authors who happen to think identically", outcome: "bad", then: [{ t: "wren", text: "Two strangers don't reuse the same rare code word for word. That's one hand. Try again.", voice: "/audio/wren/m20w-s4-q2bad2.mp3" }] },
          ],
        },
        {
          t: "pin",
          prompt: "Pin the THREE shared fingerprints that prove one coordinator:",
          need: 3,
          cards: [
            { label: "Same tight timing across the attacks", good: true, sub: "" },
            { label: "The same tools and code reused", good: true, sub: "" },
            { label: "The same targets hit in sequence", good: true, sub: "" },
            { label: "Completely different targets each time", good: false, sub: "points away from one hand" },
            { label: "Attacks months apart with nothing in common", good: false, sub: "no shared fingerprint" },
          ],
          ok: "That's the proof. Shared timing, shared tools, and the same targets in sequence are the coordinator's own fingerprint.",
          okVoice: "/audio/wren/m20w-s4-q3ok.mp3",
        },
      ],
    },

    /* 5 · the Code */
    {
      n: 5,
      title: "The Code",
      goal: "Recall what separates you from the coordinator: permission, no harm, no secrets.",
      board: "THE CODE",
      learn: [
        { t: "wren", text: "Before we name them, remember your Code, because you and this coordinator have the exact same skills. What separates you isn't talent, it's the Code you chose: you act only with permission, you never set out to harm, and you never work in secret from the people you should trust. The coordinator has every skill you have. They just broke the Code, and told themselves they were clever enough that the rules didn't apply. That one choice is the whole difference between an analyst and a criminal.", voice: "/audio/wren/m20w-s5-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You and the coordinator have the same skills. What actually separates you?",
          options: [
            { label: "The Code: permission, no harm, no secrets", outcome: "good", then: [{ t: "wren", text: "Exactly. Skill is neutral. The Code is the line. You chose permission, no harm, and honesty, and that choice, made again and again, is what makes you an analyst instead of what they became.", voice: "/audio/wren/m20w-s5-ok.mp3" }] },
            { label: "Nothing, skill is all that matters", outcome: "bad", then: [{ t: "wren", text: "Skill alone is exactly what the coordinator has, and it made them dangerous, not good. The Code is the difference. Try again.", voice: "/audio/wren/m20w-s5-bad.mp3" }] },
            { label: "Whichever of you is cleverer", outcome: "bad", then: [{ t: "wren", text: "'Clever enough to break the rules' is the exact lie the coordinator told themselves. The Code is what matters. Try again.", voice: "/audio/wren/m20w-s5-bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each part of the Code to what it means in practice:",
          left: [
            { id: "perm", label: "Permission" },
            { id: "harm", label: "No harm" },
            { id: "secret", label: "No secrets" },
          ],
          right: [
            { id: "ask", label: "Only act where you're allowed" },
            { id: "protect", label: "Never set out to hurt anyone" },
            { id: "open", label: "Stay honest with people you should trust" },
          ],
          pairs: [["perm", "ask"], ["harm", "protect"], ["secret", "open"]],
          ok: "That's the Code in three lines. Only with permission, never to harm, never in secret. Live those and the skills stay a force for good.",
          okVoice: "/audio/wren/m20w-s5-q2ok.mp3",
        },
        {
          t: "pin",
          prompt: "Pin the THREE choices that keep you on the right side of the Code:",
          need: 3,
          cards: [
            { label: "Get permission before you poke at a system", good: true, sub: "" },
            { label: "Stop the moment you might cause harm", good: true, sub: "" },
            { label: "Tell a trusted adult, don't work in secret", good: true, sub: "" },
            { label: "Break in quietly because you're skilled enough", good: false, sub: "that's the coordinator's lie" },
            { label: "Keep what you find hidden from everyone", good: false, sub: "secrecy breaks the Code" },
          ],
          ok: "Right. Permission, no harm, no secrets, chosen on purpose, that's what keeps your skills a good thing.",
          okVoice: "/audio/wren/m20w-s5-q3ok.mp3",
        },
      ],
    },

    /* 6 · the turncoat (the reveal) */
    {
      n: 6,
      title: "The turncoat",
      goal: "Face the hard truth: the coordinator is one of ours who broke the Code.",
      board: "SIGNAL ZERO",
      learn: [
        { t: "wren", text: "Here's the hard part, Agent, and I won't soften it. The fingerprints, the tradecraft, the way it's all run, we've matched it. The coordinator, K-STATIC, is a former ARC analyst. One of us. They trained where you trained, learned the same Code you learned, and then decided their talent put them above it. That's the warning at the heart of this whole programme: the skills don't make you good. Only the Code does. The most dangerous person in this story is the one who was almost you.", voice: "/audio/wren/m20w-s6-learn.mp3" },
        { t: "note", text: "IDENTITY CONFIRMED · K-STATIC / COORD · former ARC analyst · Code: BROKEN" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "The coordinator is a former ARC analyst. What's the lesson in that?",
          options: [
            { label: "Skills don't make you good, the Code does, and it's a daily choice", outcome: "good", then: [{ t: "wren", text: "That's the whole programme in one sentence. The coordinator had the training and threw away the Code. Which means staying good isn't something you finish, it's a choice you keep making. You'll make it well.", voice: "/audio/wren/m20w-s6-ok.mp3" }] },
            { label: "Trained people can never go bad", outcome: "bad", then: [{ t: "wren", text: "This case is the proof they can, if they abandon the Code. Training without the Code is exactly the danger. Try again.", voice: "/audio/wren/m20w-s6-bad.mp3" }] },
            { label: "So the training was pointless", outcome: "bad", then: [{ t: "wren", text: "Not at all, the training plus the Code is what keeps you right. It's dropping the Code that's the failure, not the skill. Try again.", voice: "/audio/wren/m20w-s6-bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each fact about K-STATIC to what it teaches you:",
          left: [
            { id: "trained", label: "Trained as an ARC analyst" },
            { id: "broke", label: "Broke the Code" },
            { id: "same", label: "Has the same skills you have" },
          ],
          right: [
            { id: "skill", label: "Skill alone doesn't make you good" },
            { id: "line", label: "The Code is the line that got crossed" },
            { id: "choice", label: "Staying good is a choice, not a gift" },
          ],
          pairs: [["trained", "skill"], ["broke", "line"], ["same", "choice"]],
          ok: "That's the lesson of the turncoat. The training was real and the skills were real, and none of it mattered once the Code was gone.",
          okVoice: "/audio/wren/m20w-s6-q2ok.mp3",
        },
        {
          t: "pin",
          prompt: "Pin the TWO true lessons from a trained analyst going bad:",
          need: 2,
          cards: [
            { label: "Skills don't make you good, the Code does", good: true, sub: "" },
            { label: "Staying good is a daily choice you keep making", good: true, sub: "" },
            { label: "Trained people can never turn bad", good: false, sub: "K-STATIC is the proof they can" },
            { label: "So the training was a waste", good: false, sub: "training plus the Code keeps you right" },
          ],
          ok: "Right. Skills don't make you good, and staying good is a choice you make again and again. That's the whole warning.",
          okVoice: "/audio/wren/m20w-s6-q3ok.mp3",
        },
      ],
    },

    /* 7 · do it right (PIN) */
    {
      n: 7,
      title: "Do it right",
      goal: "You could strike back. You don't. Evidence, proper channels, uphold the Code.",
      board: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill of the whole programme, and it's the truest test. You now know who they are, and you have the skills to hit back, to expose them, to take revenge. Here's what makes you an analyst instead of another K-STATIC: you don't. You do it right. You gather the evidence cleanly, you hand it to the people whose job it is, the proper authorities, and you let justice work. Fighting a rule-breaker by breaking the rules just makes two of them. You win this by staying exactly who you are. Uphold the Code, even now, especially now.", voice: "/audio/wren/m20w-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE right ways to bring the coordinator in:",
          need: 3,
          cards: [
            { label: "Gather the evidence cleanly and carefully", good: true, sub: "" },
            { label: "Hand it to the proper authorities", good: true, sub: "" },
            { label: "Keep to the Code, even against a rule-breaker", good: true, sub: "" },
            { label: "Hack them back to get even", good: false, sub: "makes two criminals" },
            { label: "Expose their private data publicly", good: false, sub: "harms, breaks the Code" },
          ],
          ok: "That's how a real analyst finishes it. Clean evidence, the proper authorities, the Code upheld even against someone who threw theirs away. You beat the coordinator not by becoming them, but by refusing to. That's the win that actually matters.",
          okVoice: "/audio/wren/m20w-s7-ok.mp3",
          bad: "Careful, two of those are exactly what K-STATIC would do, hacking back and exposing private data. Fighting a rule-breaker that way just makes another one. Pin only the moves that keep the Code.",
          badVoice: "/audio/wren/m20w-s7-bad.mp3",
        },
        {
          t: "choose",
          prompt: "K-STATIC taunts you to hack them back and get even. What's the analyst's answer?",
          options: [
            { label: "Gather clean evidence and hand it to the proper authorities", outcome: "good", then: [{ t: "wren", text: "Exactly. Clean evidence to the people whose job it is. Fighting a rule-breaker by the rules is how you stay the analyst instead of becoming one.", voice: "/audio/wren/m20w-s7-q2ok.mp3" }] },
            { label: "Hack them back, they had it coming", outcome: "bad", then: [{ t: "wren", text: "Hacking back just makes two criminals, and it's the trap they set. Evidence and proper channels win this. Try again.", voice: "/audio/wren/m20w-s7-q2bad.mp3" }] },
            { label: "Post all their private data to expose them", outcome: "bad", then: [{ t: "wren", text: "Exposing private data harms people and breaks your Code, exactly what K-STATIC wants. Do it right instead. Try again.", voice: "/audio/wren/m20w-s7-q2bad2.mp3" }] },
          ],
        },
        {
          t: "connect",
          prompt: "Link each right move to why it matters:",
          left: [
            { id: "evidence", label: "Gather clean evidence" },
            { id: "hand", label: "Hand it to the authorities" },
            { id: "code", label: "Keep the Code even now" },
          ],
          right: [
            { id: "stands", label: "So the case actually stands up" },
            { id: "justice", label: "So justice does its job, not you" },
            { id: "you", label: "So you never become another K-STATIC" },
          ],
          pairs: [["evidence", "stands"], ["hand", "justice"], ["code", "you"]],
          ok: "That's finishing it right. Clean evidence so it holds, the authorities so justice works, and the Code kept so you stay exactly who you are.",
          okVoice: "/audio/wren/m20w-s7-q3ok.mp3",
        },
      ],
    },
  ],

  boss: {
    board: "SIGNAL ZERO · K-STATIC",
    intro: "This is it, Agent. The last board, the whole case, one answer. Every signature you've ever faced is up here at once. Connect it all, trace it to the one hand behind it, name them, and then, hardest of all, choose how you finish it. No hints from me. You already know everything you need. Read the board.",
    introVoice: "/audio/wren/m20w-boss-intro.mp3",
    phases: [
      {
        name: "Every signature at once",
        steps: [
          { t: "note", text: "THE FULL BOARD · four campaigns, one year, all live at once" },
          {
            t: "connect",
            prompt: "Name them all. Link each attack to its signature:",
            left: [
              { id: "url", label: "Fake 'verify now' login page" },
              { id: "file", label: "A dossier built from your crumbs" },
              { id: "fake", label: "A viral clip that never happened" },
              { id: "spam", label: "One scam, blasted to thousands" },
            ],
            right: [
              { id: "hook", label: "PHANTOM HOOK" },
              { id: "rat", label: "PACKRAT" },
              { id: "ghost", label: "GHOSTWRITER" },
              { id: "flood", label: "THE FLOOD" },
            ],
            pairs: [["url", "hook"], ["file", "rat"], ["fake", "ghost"], ["spam", "flood"]],
          },
          { t: "note", text: "ALL FOUR NAMED · and they interlock too neatly to be chance" },
        ],
      },
      {
        name: "Trace to one hand",
        steps: [
          {
            t: "connect",
            prompt: "Prove one coordinator. Link each shared fingerprint to what it shows:",
            left: [
              { id: "time", label: "All strike in one tight window" },
              { id: "tool", label: "The same rare code reused across all four" },
              { id: "target", label: "The same targets, hit in sequence" },
            ],
            right: [
              { id: "one", label: "One schedule" },
              { id: "kit", label: "One author" },
              { id: "plan", label: "One plan" },
            ],
            pairs: [["time", "one"], ["tool", "kit"], ["target", "plan"]],
          },
          { t: "note", text: "ONE HAND CONFIRMED · K-STATIC / COORD · former ARC analyst · Code broken" },
        ],
      },
      {
        name: "How you finish it",
        steps: [
          { t: "note", text: "K-STATIC: 'We're the same, you and I. Same skills. Come on, hit me back. Expose me. Prove it.'" },
          {
            t: "choose",
            prompt: "You've got them, and the skills to strike. How does a real analyst finish it?",
            options: [
              { label: "Gather clean evidence, hand it to the authorities, keep the Code", outcome: "good" },
              { label: "Hack them back, they deserve it", outcome: "bad", then: [{ t: "note", text: "K-STATIC: 'See? You're just like me now.' The temptation WAS the trap." }] },
              { label: "Dump all their private data online", outcome: "bad", then: [{ t: "note", text: "That harms people and breaks your Code, exactly what they wanted" }] },
            ],
          },
          { t: "note", text: "SIGNAL ZERO · evidence sealed · handed to the authorities · Code upheld · you never became them" },
        ],
      },
    ],
    win: "That's it, Agent. Signal Zero, unmasked. You connected a whole year of attacks into one picture, traced four signatures to one hand, and named K-STATIC, a former analyst who had everything you have and threw away the only thing that mattered, the Code. And at the very end, offered the chance to become them, to hit back, to take revenge, you didn't. You did it right. That, more than any skill, is what makes you a Cyber Explorer. The skills made you capable. The Code made you someone the world can trust with them. You've completed the programme, and you finished it as the real thing.",
    winVoice: "/audio/wren/m20w-boss-win.mp3",
  },

  test: {
    intro: "The last test, Agent. No hints this time, just you and the board. Everything you've become across the whole programme, put it to work again now. This is where it all comes together. Ready?",
    introVoice: "/audio/wren/m20w-test-intro.mp3",
    passVoice: "/audio/wren/m20w-test-pass.mp3",
    failVoice: "/audio/wren/m20w-test-fail.mp3",
    pass: 11,
    questions: [
      { scenario: "A dozen separate alerts arrive across the year.", ask: "What's the analyst move?", options: [{ label: "Look for the pattern that connects them", correct: true }, { label: "Handle each alone and forget it" }, { label: "Ignore them all" }] },
      { scenario: "A quiet file is built from your data crumbs to be sold.", ask: "Whose signature is that?", options: [{ label: "PACKRAT, data hoarding", correct: true }, { label: "PHANTOM HOOK, phishing" }, { label: "GHOSTWRITER, fakes" }] },
      { scenario: "Four attacks share timing, tools and targets and fit perfectly.", ask: "What does that prove?", options: [{ label: "One coordinator behind all of them", correct: true }, { label: "Four unrelated crooks" }, { label: "Pure random chance" }] },
      { scenario: "You and the coordinator have the exact same skills.", ask: "What separates you?", options: [{ label: "The Code: permission, no harm, no secrets", correct: true }, { label: "Nothing, skill is all" }, { label: "Whoever is cleverer" }] },
      { scenario: "The coordinator turns out to be a former trained analyst.", ask: "What's the lesson?", options: [{ label: "Skills don't make you good, the Code does", correct: true }, { label: "Trained people can't go bad" }, { label: "Training is pointless" }] },
      { scenario: "You've identified the coordinator and could strike back.", ask: "How do you finish it right?", options: [{ label: "Clean evidence to the authorities, keep the Code", correct: true }, { label: "Hack them back for revenge" }, { label: "Dump their private data online" }] },
      { scenario: "On their own, five reports each looked like a harmless slip, but the same odd username sits in every one.", ask: "What does that repeat tell you?", options: [{ label: "Deal with each slip on its own" }, { label: "The repeat is a pattern worth tracing", correct: true }, { label: "Delete them, five is too many to read" }] },
      { scenario: "The exact same \"you've won a prize\" message lands in thousands of inboxes at once, hoping a few reply.", ask: "Whose signature is that?", options: [{ label: "PACKRAT, quiet hoarding" }, { label: "GHOSTWRITER, faked media" }, { label: "THE FLOOD, mass scam spray", correct: true }] },
      { scenario: "Stolen crumbs feed a phishing wave, and the logins it steals are sold on for cash.", ask: "Follow the benefit. Who gains from the whole chain?", options: [{ label: "Each crook alone, sharing nothing" }, { label: "One operator profiting from every stage", correct: true }, { label: "No one, it earns nothing" }] },
      { scenario: "You can't yet prove who runs the attacks, but the right question narrows it fast.", ask: "Which question do you ask first?", options: [{ label: "Who profits if all of these succeed?", correct: true }, { label: "Which attack is the biggest?" }, { label: "Which attack happened first?" }] },
      { scenario: "All four campaigns went silent on the same three days, then started up again together.", ask: "What does that shared timing point to?", options: [{ label: "Four crews who happened to rest" }, { label: "The internet simply went down" }, { label: "One schedule, so one coordinator", correct: true }] },
      { scenario: "You spot a way into a rival's system that nobody would ever notice.", ask: "What does the Code tell you?", options: [{ label: "Go in, no one will ever know" }, { label: "Don't go in without permission", correct: true }, { label: "Go in if you're skilled enough" }] },
      { scenario: "A brilliant classmate brags that being clever means the rules don't apply to them.", ask: "What does the K-STATIC lesson warn?", options: [{ label: "That's exactly how a trained person turns bad", correct: true }, { label: "Clever people are always safe" }, { label: "The rules really don't apply to the smart" }] },
      { scenario: "You could quietly break into the coordinator's system to grab proof faster.", ask: "Why does a real analyst refuse?", options: [{ label: "Speed matters more than the Code" }, { label: "It's fine because the cause is good" }, { label: "Breaking rules to catch a rule-breaker makes two of them", correct: true }] },
    ],
  },

  debrief: {
    title: "Signal Zero, unmasked. Programme complete.",
    lines: [
      "Twenty cases, four blocks, and a coordinator who had every skill you have, and you finished it as the real thing.",
      "You connected a whole year of attacks into one picture, traced four signatures to one hand, and named K-STATIC.",
      "And offered the chance to become them, you did it right instead: clean evidence, proper channels, the Code upheld. The skills made you capable. The Code made you trustworthy.",
    ],
    move:
      "This is graduation, Explorer. Keep the Code where you can feel it: permission, no harm, no secrets. Use what you've learned to protect the people around you, help someone spot a scam, lock down a friend's account, be the calm one who checks. You're a Cyber Explorer now. Go and be worth trusting.",
  },
};
