/**
 * Block 4 · Case 016 "The File On You" — PACKRAT ③ — for THE WAR ROOM runtime.
 *
 * Block 4 = THE LONG GAME: synthesis + the arc closes. You're the lead analyst at
 * a violet evidence board, CONNECTING clues across the whole case, not reading one
 * message (B1) or operating one machine (B3). Same framework (7 skills LEARN ->
 * PRACTICE, blind boss, must-pass test). Signature mechanic = CONNECT (link the
 * board) + PIN. Case 16 = the data economy, a self-audit, curation & takedowns.
 * Boss "The Auction": poison your file by cutting its sources before the gavel.
 * Curriculum row M16.
 */

/* ---- shared War Room types (Block 4 cases import from here) ---- */
export type WarStep =
  | { t: "wren"; text: string; voice?: string }
  | { t: "note"; text: string } // a pinned dossier note on the board
  | {
      t: "choose";
      prompt?: string;
      options: { label: string; sub?: string; outcome?: "good" | "bad"; then?: WarStep[] }[];
    }
  | {
      // link each left card to its correct right card (draw the board)
      t: "connect";
      prompt?: string;
      left: { id: string; label: string }[];
      right: { id: string; label: string }[];
      pairs: [string, string][]; // [leftId, rightId] correct links
      ok?: string;
      okVoice?: string;
      bad?: string;
      badVoice?: string;
    }
  | {
      // pick exactly the `need` correct cards to pin (e.g. good privacy moves)
      t: "pin";
      prompt?: string;
      cards: { label: string; good: boolean; sub?: string }[];
      need: number;
      ok?: string;
      okVoice?: string;
      bad?: string;
      badVoice?: string;
    };

export interface WarSkill {
  n: number;
  title: string;
  goal: string;
  board?: string; // the board section label
  learn: WarStep[];
  practice: WarStep[];
}
export interface WarBossPhase { name: string; steps: WarStep[] }
export interface WarBoss {
  board: string;
  intro: string;
  introVoice?: string;
  phases: WarBossPhase[];
  win: string;
  winVoice?: string;
}
export interface WarTestQ {
  scenario: string;
  ask: string;
  options: { label: string; correct?: boolean }[];
}
export interface WarTest {
  intro: string;
  introVoice?: string;
  passVoice?: string;
  failVoice?: string;
  pass: number;
  questions: WarTestQ[];
}
export interface WarCase {
  id: string;
  caseNumber: string;
  title: string;
  actor: string;
  accent?: string;
  open: string[];
  openVoice?: string[];
  skills: WarSkill[];
  boss: WarBoss;
  test: WarTest;
  debrief: { title: string; lines: string[]; move: string };
}

export const case16War: WarCase = {
  id: "explorers-m16",
  caseNumber: "CASE 016",
  title: "The File On You",
  actor: "PACKRAT",
  accent: "#B98BFF",
  open: [
    "Highest clearance now, Agent. Welcome to the War Room. From here you don't just spot one attack, you see the whole picture, and connect it.",
    "First target: the file. Right now, companies you've never heard of keep a file on you, what you like, where you go, who you know, and they trade it. PACKRAT's whole business is building and selling that file.",
    "Seven skills to take control of your own data, then a boss and a test. Let's find out what your file says, and start cutting it down.",
  ],
  openVoice: ["/audio/wren/m16w-open-1.mp3", "/audio/wren/m16w-open-2.mp3", "/audio/wren/m16w-open-3.mp3"],

  skills: [
    /* 1 · the data economy */
    {
      n: 1,
      title: "The data economy",
      goal: "Companies quietly keep a file on you — and buy and sell it.",
      board: "THE MARKET",
      learn: [
        { t: "wren", text: "Start with the big secret of the internet. A lot of 'free' apps and sites aren't really free, you pay with data. As you browse, tap, and post, trackers quietly note what you like, where you go, and who you talk to. That gets bundled into a file about YOU, and companies buy and sell those files to target you. When something's free, quite often, the product being sold is you.", voice: "/audio/wren/m16w-s1-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "A game is completely free, no ads you can see. How is it likely making money?",
          options: [
            { label: "By collecting and selling data about you", outcome: "good", then: [{ t: "wren", text: "Very likely, yes. If you can't see how something makes money, the answer is often your data. That's not a reason to panic, it's a reason to know what you're handing over, and to hand over less. Which is exactly what we'll do.", voice: "/audio/wren/m16w-s1-ok.mp3" }] },
            { label: "It isn't making money, it's just kind", outcome: "bad", then: [{ t: "wren", text: "Companies rarely run big apps out of kindness. If there's no obvious payment, the product is usually your data. Try again.", voice: "/audio/wren/m16w-s1-bad.mp3" }] },
            { label: "Magic", outcome: "bad", then: [{ t: "wren", text: "Ha, no magic here. Free usually means you're paying with data. Try again.", voice: "/audio/wren/m16w-s1-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 2 · what's in your file (CONNECT) */
    {
      n: 2,
      title: "What's in your file",
      goal: "Small crumbs each reveal something. Connect them to see the picture.",
      board: "DOSSIER · SOURCES",
      learn: [
        { t: "wren", text: "So what's actually in a file about you? Not one big secret, lots of tiny crumbs, each giving away a piece. Your posts show your face and friends, your location tags show where you are, your searches show what you're into, your purchases show what you buy. On their own they seem harmless. Connected on a board, they draw a scarily complete picture. Let's connect a few and see.", voice: "/audio/wren/m16w-s2-learn.mp3" },
      ],
      practice: [
        {
          t: "connect",
          prompt: "Link each crumb to what it quietly reveals:",
          left: [
            { id: "loc", label: "Location tags on your posts" },
            { id: "handle", label: "Same username everywhere" },
            { id: "buys", label: "Your purchase history" },
          ],
          right: [
            { id: "where", label: "Where you live and go" },
            { id: "link", label: "Links all your accounts together" },
            { id: "habits", label: "What you like and can afford" },
          ],
          pairs: [["loc", "where"], ["handle", "link"], ["buys", "habits"]],
          ok: "See how fast it builds? Each crumb is small, but connected they reveal where you live, everything you're into, and every account that's really you. That's a file. And a file made of crumbs can be taken apart, crumb by crumb.",
          okVoice: "/audio/wren/m16w-s2-ok.mp3",
          bad: "Not quite, look again at what each crumb gives away. A location tag reveals a place; a repeated username links your accounts; purchases reveal your habits. Match them up.",
          badVoice: "/audio/wren/m16w-s2-bad.mp3",
        },
      ],
    },

    /* 3 · audit yourself (TRACE) */
    {
      n: 3,
      title: "Audit your own trail",
      goal: "Turn Case 4's method on yourself: search you, see what a stranger sees.",
      board: "SELF-AUDIT",
      learn: [
        { t: "wren", text: "Here's a powerful move: audit yourself, the same way an attacker would. Search your own name and usernames. Look at your profiles the way a stranger sees them, logged out. You'll be surprised what's public, an old post, a tagged photo, a visible friends list. You can't fix what you can't see, so the self-audit is always step one. See your own file before anyone else uses it.", voice: "/audio/wren/m16w-s3-learn.mp3" },
        { t: "note", text: "SELF-AUDIT (logged out):  old public posts ✓  location on ✓  friends list visible ✓  full birthday shown ✓" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "What's the FIRST step to taking control of your data trail?",
          options: [
            { label: "Audit yourself — search your name, view your profiles logged out", outcome: "good", then: [{ t: "wren", text: "Exactly. You can't tidy a trail you've never looked at. Searching yourself and viewing your profiles as a stranger shows you the real file. Once you can see it, you can start cutting it down.", voice: "/audio/wren/m16w-s3-ok.mp3" }] },
            { label: "Delete all your accounts immediately", outcome: "bad", then: [{ t: "wren", text: "That's drastic and usually unnecessary. Start by seeing what's actually out there, then fix the real gaps. Audit first. Try again.", voice: "/audio/wren/m16w-s3-bad.mp3" }] },
            { label: "Nothing, you can't see your own file", outcome: "bad", then: [{ t: "wren", text: "You can, that's the point. Search yourself and view your profiles logged out to see what a stranger sees. Try again.", voice: "/audio/wren/m16w-s3-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 4 · curate (PIN) */
    {
      n: 4,
      title: "Cut it down",
      goal: "You can lock down, delete, and correct. Make your file smaller on purpose.",
      board: "DOSSIER · CURATE",
      learn: [
        { t: "wren", text: "Now the satisfying part, cutting the file down. You have more control than you think. Set profiles to private so only friends see them. Turn off location sharing. Delete old posts you've outgrown. Trim your public info. Every crumb you remove is one less thing in the file. You're not deleting yourself, you're curating, deciding on purpose what the world gets to see.", voice: "/audio/wren/m16w-s4-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE moves that shrink your file:",
          need: 3,
          cards: [
            { label: "Set profiles to private", good: true, sub: "" },
            { label: "Turn off location sharing", good: true, sub: "" },
            { label: "Delete old public posts", good: true, sub: "" },
            { label: "Post your full birthday and address", good: false, sub: "adds to the file" },
            { label: "Use the same public handle everywhere", good: false, sub: "links it all" },
          ],
          ok: "That's real control. Private profiles, location off, old posts gone, each one is a crumb the file no longer has. You didn't disappear, you decided what's yours to share and what isn't. That's curation.",
          okVoice: "/audio/wren/m16w-s4-ok.mp3",
          bad: "Careful, one of those makes your file BIGGER. Posting your birthday and address, or reusing one public handle, feeds the file. Pin only the moves that shrink it.",
          badVoice: "/audio/wren/m16w-s4-bad.mp3",
        },
      ],
    },

    /* 5 · takedowns */
    {
      n: 5,
      title: "Ask it down",
      goal: "You can request data be removed. Rights and settings are on your side.",
      board: "DOSSIER · TAKEDOWN",
      learn: [
        { t: "wren", text: "Sometimes data about you sits on a site you don't even control, an old account, a page that mentions you, a data broker's list. Good news: you often have the right to ask for it to be taken down, and most services have a delete-my-data or privacy request option. It's not instant and it's not perfect, but asking works more often than people think. If in doubt, a trusted adult can help you send the request.", voice: "/audio/wren/m16w-s5-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "You find an old profile with your data on a site you forgot about. What can you do?",
          options: [
            { label: "Use its delete/privacy option to remove it — ask an adult if stuck", outcome: "good", then: [{ t: "wren", text: "Exactly. Most sites have a way to delete an account or request your data be removed. It won't fix everything overnight, but every takedown is a real crumb gone. And an adult can help with the trickier ones.", voice: "/audio/wren/m16w-s5-ok.mp3" }] },
            { label: "Nothing — once it's online it's out of your hands", outcome: "bad", then: [{ t: "wren", text: "Not true. You often have the right to have data removed, and most sites have a delete option. Asking works more than you'd think. Try again.", voice: "/audio/wren/m16w-s5-bad.mp3" }] },
            { label: "Post more to bury it", outcome: "bad", then: [{ t: "wren", text: "Posting more just adds to the file. The move is to remove the old data, not pile new data on top. Try again.", voice: "/audio/wren/m16w-s5-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 6 · PACKRAT's play (CONNECT breadcrumb) */
    {
      n: 6,
      title: "Know PACKRAT's play",
      goal: "The data-broker con runs four moves — and you can starve it at the source.",
      board: "THREAT MODEL",
      learn: [
        { t: "wren", text: "See PACKRAT's data play, four moves. First, collect your crumbs from everywhere. Second, assemble them into a file. Third, package that file up. Fourth, sell it to whoever pays. And here's your power: the file is only as rich as the crumbs feeding it. Cut the sources, lock your profiles, delete old data, request takedowns, and the file starves. You can't stop every crumb, but you can make PACKRAT's file thin and nearly worthless.", voice: "/audio/wren/m16w-s6-learn.mp3" },
      ],
      practice: [
        {
          t: "choose",
          prompt: "PACKRAT's file on you is built from crumbs. What's the best way to fight it?",
          options: [
            { label: "Starve it — cut the sources so there are fewer crumbs to collect", outcome: "good", then: [{ t: "wren", text: "That's the whole strategy. You can't chase down every copy of your data, but you CAN turn off the taps feeding it. Fewer crumbs in means a thinner, weaker, less valuable file. Starve the source.", voice: "/audio/wren/m16w-s6-ok.mp3" }] },
            { label: "Try to buy your own file back", outcome: "bad", then: [{ t: "wren", text: "You can't buy back every copy, and it just keeps rebuilding. Cut the sources instead so it can't be refilled. Try again.", voice: "/audio/wren/m16w-s6-bad.mp3" }] },
            { label: "Ignore it, files can't be reduced", outcome: "bad", then: [{ t: "wren", text: "They can, that's this whole case. Cut the sources and the file shrinks. Try again.", voice: "/audio/wren/m16w-s6-bad2.mp3" }] },
          ],
        },
      ],
    },

    /* 7 · own your trail */
    {
      n: 7,
      title: "Own your trail",
      goal: "The habit that keeps your file small and in your hands.",
      board: "ACTION PLAN",
      learn: [
        { t: "wren", text: "Last skill, and it's about ownership. Your data trail is yours to shape. So a few times a year, audit yourself, search your name, view your profiles as a stranger. Lock down what should be private, delete what you've outgrown, and ask sites to remove the rest. You'll never be invisible, and that's fine. The goal is simple: you decide what's out there, not PACKRAT.", voice: "/audio/wren/m16w-s7-learn.mp3" },
      ],
      practice: [
        {
          t: "pin",
          prompt: "Pin the THREE habits that keep your file yours:",
          need: 3,
          cards: [
            { label: "Audit yourself now and then", good: true, sub: "" },
            { label: "Lock down and delete what's private", good: true, sub: "" },
            { label: "Request takedowns of old data", good: true, sub: "" },
            { label: "Share your location publicly", good: false, sub: "feeds the file" },
            { label: "Reuse one public handle everywhere", good: false, sub: "links it all" },
          ],
          ok: "That's ownership. Audit, lock down, take down, on repeat. You'll never be a ghost, but you'll be the one holding the pen, deciding what your file says. That's exactly where you want to be.",
          okVoice: "/audio/wren/m16w-s7-ok.mp3",
          bad: "Careful, one of those feeds the file instead of shrinking it. Sharing location or reusing a public handle both grow it. Pin only the habits that keep it yours.",
          badVoice: "/audio/wren/m16w-s7-bad.mp3",
        },
      ],
    },
  ],

  boss: {
    board: "THE AUCTION · PACKRAT",
    intro: "This is it, Agent. PACKRAT is about to auction the file it built on you. You can't stop the sale, but you can wreck what's for sale, cut the sources feeding the file before the gavel falls. No hints from me. Starve it.",
    introVoice: "/audio/wren/m16w-boss-intro.mp3",
    phases: [
      {
        name: "The file goes up",
        steps: [
          { t: "note", text: "AUCTION LOT: 'Complete profile' · home area (location tags) · full name (public posts) · all accounts (one handle) · daily routine (check-ins)" },
          {
            t: "choose",
            prompt: "The file is rich because it has many live sources. What's your move before the gavel?",
            options: [
              { label: "Cut the sources feeding it — starve the file", outcome: "good" },
              { label: "Bid on it yourself", outcome: "bad", then: [{ t: "note", text: "PACKRAT: I'll just rebuild it from your live sources…" }] },
              { label: "Do nothing, it's too late", outcome: "bad", then: [{ t: "note", text: "GAVEL RISING… the file is still full" }] },
            ],
          },
        ],
      },
      {
        name: "Cut the sources",
        steps: [
          {
            t: "connect",
            prompt: "Link each part of the file to the source you'll cut:",
            left: [
              { id: "home", label: "Your home area" },
              { id: "accts", label: "All your accounts linked" },
              { id: "routine", label: "Your daily routine" },
            ],
            right: [
              { id: "loc", label: "Turn off location tags" },
              { id: "handle", label: "Stop reusing one public handle" },
              { id: "checkin", label: "Stop public check-ins" },
            ],
            pairs: [["home", "loc"], ["accts", "handle"], ["routine", "checkin"]],
          },
          { t: "note", text: "SOURCES CUT · location off · handles split · check-ins private" },
        ],
      },
      {
        name: "The gavel",
        steps: [
          { t: "note", text: "AUCTION LOT now reads: 'name only · everything else: no recent data'" },
          {
            t: "choose",
            prompt: "The gavel falls. Why did the file sell for almost nothing?",
            options: [
              { label: "You cut its sources — the file starved to nearly empty", outcome: "good" },
              { label: "Nobody was interested that day", outcome: "bad", then: [{ t: "note", text: "BIDDERS: keen as ever — the file was just empty" }] },
              { label: "PACKRAT felt generous", outcome: "bad", then: [{ t: "note", text: "PACKRAT: I'd have sold it gladly — there was nothing left to sell" }] },
            ],
          },
        ],
      },
    ],
    win: "Now THAT is a win, Agent. PACKRAT put your whole life up for auction, and by the time the gavel fell, there was almost nothing left to sell. You didn't chase every copy, you cut the sources, and a file with no fresh crumbs is worthless. You just proved the most important thing in this block: your data trail is yours to shape.",
    winVoice: "/audio/wren/m16w-boss-win.mp3",
  },

  test: {
    intro: "Last thing before I sign this off, the test. Six fresh ones, no hints, and you need five right. Everything about owning your data, put it to work. Ready?",
    introVoice: "/audio/wren/m16w-test-intro.mp3",
    passVoice: "/audio/wren/m16w-test-pass.mp3",
    failVoice: "/audio/wren/m16w-test-fail.mp3",
    pass: 5,
    questions: [
      { scenario: "A game is totally free with no visible ads.", ask: "How is it most likely making money?", options: [{ label: "Collecting and selling data about you", correct: true }, { label: "Pure kindness" }, { label: "It isn't, and never will" }] },
      { scenario: "Location tags, one reused username, and purchase history.", ask: "What do these together reveal?", options: [{ label: "Where you are, all your linked accounts, and your habits", correct: true }, { label: "Nothing useful" }, { label: "Only your favourite colour" }] },
      { scenario: "You want to take control of your data trail.", ask: "What's the first step?", options: [{ label: "Audit yourself — search your name, view profiles logged out", correct: true }, { label: "Delete every account at once" }, { label: "Nothing, you can't see your file" }] },
      { scenario: "You want to shrink the file companies hold on you.", ask: "Which move helps?", options: [{ label: "Set profiles private, location off, delete old posts", correct: true }, { label: "Post your birthday and address" }, { label: "Reuse one public handle everywhere" }] },
      { scenario: "You find old data about you on a site you forgot.", ask: "What can you do?", options: [{ label: "Use its delete/privacy option; ask an adult if stuck", correct: true }, { label: "Nothing, it's permanent" }, { label: "Post more to bury it" }] },
      { scenario: "A data broker's file on you is built from many crumbs.", ask: "What's the best way to fight it?", options: [{ label: "Cut the sources so fewer crumbs feed it", correct: true }, { label: "Buy the file back" }, { label: "Ignore it — files can't shrink" }] },
    ],
  },

  debrief: {
    title: "The file, starved.",
    lines: [
      "Seven skills, a live auction, and a test, and PACKRAT's file on you sold for almost nothing.",
      "You learned that 'free' often means you're the product, and that a file is just crumbs you can take back.",
      "You audited yourself, cut the sources, and requested takedowns, until there was barely anything left to sell.",
    ],
    move:
      "This week, do a self-audit: search your own name and usernames, and view your main profile logged out. Then fix one thing, set it private, turn off location, or delete an old post you've outgrown. You hold the pen.",
  },
};
