import type { WeekContent } from "./types";
import { WEEK_INTROS } from "./weekIntros";

/**
 * Week 7 - In-Game Spending: The Gem Bucks Trap. REBUILT to the Learn-Loop
 * Build Standard v0.10 (2026-09-16, the eighth rebuilt week). World: the Loot
 * Shop (velvet floor, glinting motes, price-tag cards, the cast as shop
 * guards). The week where game coins turn back into real money in front of
 * the child's eyes.
 *
 *   0 video · 1 alert · 2 ATLAS briefing · 3 mission
 *   5 x (Learn -> Game -> Prove -> Recap):
 *     1 MONEY    coins = real money in disguise     | coinCounter    The Coin Counter (COUNT)         | finish
 *     2 LOOT     loot boxes are a built-in gamble    | oddsJar        The Odds Jar (OPEN AND TALLY)    | lie
 *     3 PRESSURE countdowns, "everyone has it"       | truePriceLever The True-Price Lever (HOLD)      | speed
 *     4 ASK      always ask before you buy           | chooseYourPath The Buy Button (PauseDecide)     | recall
 *     5 FREE     free game money does not exist      | stringsAttached Free-Coin Strings (coins skin)  | order
 *   24 review: memoryMatch "The Till Match" · 25 quiz boss (5 questions, pass 4)
 *   26 video · 27 debrief · 28 stickers · 29 completion. 30 screens; the old
 *   screen-4 signature (the lever) now lives behind its lesson as concept 3.
 *
 * Engine reuse (audit-engine-reuse): coinCounter and oddsJar are NEW; the
 * lever is the week's own signature made data-driven. PauseDecide (W1/W2),
 * StringsAttached (W4) and MemoryMatch (W1, review) are re-themes under the
 * amended reuse rule: different skill, non-neighbouring weeks, under cap.
 *
 * Content fixes carried in: no real currency names (Gem Bucks, Robo Coins and
 * Blast Coins are invented), the boss no longer asks the child to "spend a
 * little pride", every item has a readAloud, verdicts are one take with the
 * reason, a teach on every Prove-it, a spoken payoff on every complete beat.
 * Dialogue audited to 0 flags on both layers with
 * `node scripts/audit-narration-flow.mjs --week=7`.
 */
export const WEEK_7: WeekContent = {
  weekNumber: 7,
  title: "In-Game Spending: The Gem Bucks Trap",
  topic: "in-game-spending",
  badgeName: "Wallet Guard",
  badgeIcon: "🔒",

  introCutscene: [
    { text: "CYBER HEROES ACADEMY\nWEEK 7: THE GEM BUCKS TRAP", bg: "normal", duration: 2600 },
  ],

  screens: [
    // 0 - OPENING VIDEO: the shop that drained an account
    { type: "video", videoPlaceholder: "Week 7: The Gem Bucks Trap", videoSrc: "/videos/module-07-intro.mp4" },

    // 1 - ALERT: incident report (Sarah reads the caption word for word, then reacts)
    {
      type: "alert",
      photoSrc: "/cyberheroes/alerts/week-07.png",
      title: "ALERT INCOMING",
      badge: "Incident Report",
      caption: "The Raccoon's 'LIMITED-TIME bundle!' and 'FREE Gem Bucks generator!' drained a family's account. Real money, gone. This week you learn what game coins REALLY cost.",
      photoCaption: "Wk 7 - The Gem Bucks Trap",
      ctaLabel: "See the Mission →",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Cyber Hero, keep your coins close and read this incident report with me.",
          "The Raccoon's 'LIMITED-TIME bundle!' and 'FREE Gem Bucks generator!' drained a family's account. Real money, gone. This week you learn what game coins REALLY cost.",
          "[whispers] A bundle and a generator. That is all it took to empty a wallet.",
          "[warmly] By the end of today, every shiny pack will show you its real price.",
          "Let's see what Mission Command has for us!",
        ],
      },
    },

    // 2 - WEEK INTRO: ATLAS (Mission Command) briefing, plays after the alert
    { type: "weekIntro", ...WEEK_INTROS[7] },

    // 3 - Mission brief (learn this, so you're protected from that)
    {
      type: "mission",
      objectives: [
        "Count game coins back into real money",
        "See what a loot box and a countdown are really doing",
        "Ask before every buy, and spot fake free coins",
      ],
    },

    /* ─────────── BEAT 1 · GAME COINS ARE REAL MONEY ─────────── */
    // 4 - Learn
    {
      type: "info",
      conceptNumber: 1,
      conceptTotal: 5,
      title: "Game Coins Are Real Money",
      content:
        "Gem Bucks, Robo Coins, Blast Coins: games give their money fun names and bright colours so it FEELS like play money. Here is the secret: every coin pack is bought with real money, money someone in your family worked for. Count the coins back into the piggy bank, and the costume falls off.",
      bullets: [
        "Game coins are bought with real money",
        "Fun names make it FEEL like play money",
        "That is on purpose: it is easier to spend",
        "It is someone's real, worked-for money",
        "Count it out, and the costume falls off",
      ],
      bulletIcons: ["💎", "🎭", "🪤", "👪", "🔢"],
      emblem: "💎",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Welcome back, Cyber Hero. Today we open the game shop!",
          "Gem Bucks. Robo Coins. Blast Coins. Fun names, bright colours!",
          "[whispers] But every single coin is bought with real money.",
          "Money someone in your family worked for.",
          "[warmly] Fun names are a costume, and counting takes the costume off.",
          "[excited] Come and pay for a pack with real coins, one tap at a time!",
        ],
      },
    },
    // 5 - Game: COUNT "The Coin Counter" (coinCounter, new engine)
    {
      type: "coinCounter",
      threat: {
        raccoonLine:
          "Nobody counts! Five hundred gems sounds like a bargain when it is called gems. Call it real coins and suddenly everyone gets careful. Boring!",
      },
      introTitle: "The Coin Counter",
      introSubtitle: "A gem pack, a till and a piggy bank of real coins. Tap coins into the till until the pack is paid, and watch what it really costs.",
      introIcon: "💎",
      shopLabel: "Gem shop",
      tillLabel: "Till",
      bankLabel: "Piggy bank",
      coinWord: "coins",
      stopLabel: "I CAN'T AFFORD IT",
      paidToast: "PAID! REAL MONEY.",
      stopToast: "SMART STOP!",
      fullNote: "That was real money",
      shortNote: "Not enough coins in the bank",
      completeTitle: "Every pack counted!",
      completeLine: "Gems in, real coins out. The costume is off.",
      startBank: 20,
      packs: [
        {
          id: "starter",
          name: "Starter Gem Pack",
          gems: 500,
          price: 5,
          readAloud: "First pack on the counter: the Starter Gem Pack, five hundred gems. Tap coins into the till until it is paid.",
          receipt: "500 gems = 5 real coins. That was real money.",
          why: "Five real coins left the piggy bank for five hundred pretend gems. The costume came off the moment you counted.",
        },
        {
          id: "mega",
          name: "Mega Gem Chest",
          gems: 1000,
          price: 8,
          readAloud: "Next: the Mega Gem Chest, one thousand gems. Count the coins in, and keep an eye on the piggy bank.",
          receipt: "1,000 gems = 8 real coins. Real money again.",
          why: "Eight more coins gone. Two packs in, and the piggy bank is already looking thin.",
        },
        {
          id: "vault",
          name: "Legendary Vault",
          gems: 2500,
          price: 12,
          readAloud: "Last: the Legendary Vault, two and a half thousand gems. Count it out, and see if the bank can even pay.",
          receipt: "2,500 gems = 12 real coins. The bank had 7. Not enough.",
          why: "The bank ran dry before the price. When the real coins run out, the answer is to stop, not to find more.",
        },
      ],
      hints: {
        tier1: "Tap one coin at a time and watch the till count up.",
        tier2: "When the piggy bank is empty and the till is still short, tap I CAN'T AFFORD IT.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your first challenge, you count real coins at the Coin Counter!",
          "This game is all about seeing what a gem pack really costs.",
          "Out in the real world, the shop shows you gems and hides the coins.",
          "Here is what you do. A gem pack lands on the counter. Tap coins from the piggy bank into the till, one at a time, until the pack is paid. The receipt prints what it really cost. If the bank runs out before the price, tap I CAN'T AFFORD IT.",
          "[warmly] Count every pack, and the costume falls off for good. Ready? First pack!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Here is your first pack. Tap a coin to pay it into the till."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every pack counted, Cyber Hero! You saw the real coins behind every gem.",
          "[warmly] Out in the real world, when a shop shows you gems, count them back into coins in your head. The price is always real money.",
        ],
      },
    },
    // 6 - Prove: FINISH
    {
      type: "quickCheck",
      mode: "finish",
      prompt: "Game coins are really ___.",
      choices: [
        { text: "money", isCorrect: true },
        { text: "points", isCorrect: false, why: "Points are earned by playing. Coins are bought with real money." },
        { text: "stickers", isCorrect: false, why: "Stickers are free fun. Coin packs cost someone real money." },
        { text: "free", isCorrect: false, why: "Nothing about a coin pack is free. Every one is paid for with real money." },
      ],
      praise: "Real money, every time. Now you see it! ✓",
      nudge: "What left the piggy bank when you paid for the packs?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Game coins are really money.",
          "Fun names and bright colours are the costume.",
          "[warmly] Count them out, and the costume falls off.",
        ],
      },
    },
    // 7 - Recap · Concept 1 of 5
    {
      type: "recap",
      concept: 1,
      total: 5,
      learned: "Game coins are real money in disguise. Every pack costs real coins someone worked for.",
      next: "what is really hiding inside a loot box",
      emblem: "💎",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] What a counter, Cyber Hero. Every pack rang up at its real price.",
          "Fun names, bright colours, real coins underneath.",
          "[whispers] But the shop has a box it will not let you count. It is a mystery, on purpose.",
          "Next, we'll learn what is really hiding inside a loot box. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 2 · LOOT BOXES ARE A GAMBLE ─────────── */
    // 8 - Learn
    {
      type: "info",
      conceptNumber: 2,
      conceptTotal: 5,
      title: "The Loot Box Gamble",
      content:
        "A loot box is a mystery: you pay, but you do not know what you will get. That is not bad luck, it is built that way ON PURPOSE. The super-rare prize is usually about one in a hundred. The 'SO close!' feeling is designed. And box number ten has exactly the same tiny chance as box number one. Boxes have no memory.",
      bullets: [
        "You pay real money for a MYSTERY",
        "The rare prize is usually about one in a hundred",
        "The 'SO close!' feeling is designed",
        "Each new box has the SAME tiny chance",
        "Boxes have no memory",
      ],
      bulletIcons: ["🎁", "🎲", "⚡", "🌀", "🧠"],
      emblem: "🎲",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Open a loot box, and what do you find? Not a prize. A jar of marbles!",
          "A hundred marbles. Ninety-nine grey. ONE gold.",
          "[whispers] You pay real money to pull one out, and you do not know which.",
          "That 'SO close!' feeling? Designed on purpose.",
          "[warmly] And box number ten has the same tiny chance as box number one. Boxes have no memory.",
          "[excited] Come and open the jar with me, and count what it costs!",
        ],
      },
    },
    // 9 - Game: OPEN AND TALLY "The Odds Jar" (oddsJar, new engine)
    {
      type: "oddsJar",
      threat: {
        raccoonLine:
          "One gold marble in a hundred, and I never have to hide it! Kids open and open, sure the next one is theirs. The jar never changes. The spent counter does!",
      },
      introTitle: "The Odds Jar",
      introSubtitle: "A jar of a hundred marbles, one of them gold. Tap OPEN, watch the grey marbles roll out and the spent counter climb, then tap what is true.",
      introIcon: "🎲",
      openLabel: "OPEN",
      spentLabel: "Spent",
      costPerOpen: 1,
      coinWord: "coins",
      marbleTotal: 100,
      jarNote: "100 marbles. 1 gold.",
      trueToast: "TRUE!",
      wrongTitle: "That's the fib",
      completeTitle: "The odds never moved!",
      completeLine: "Opening more never makes the next one due.",
      rounds: [
        {
          id: "dragon",
          prize: "Dragon Pet",
          oddsLine: "1 gold marble in 100",
          readAloud: "The Dragon Pet box. One gold marble in a hundred. Tap OPEN ten times, and count what you spend.",
          opens: 10,
          cardPrompt: "So what is true?",
          cards: [
            { text: "The odds never changed: still one in a hundred.", isTrue: true, whyWrong: "" },
            { text: "The next one HAS to be gold now.", isTrue: false, whyWrong: "Boxes have no memory. Box eleven does not know about the other ten. Same jar, same odds." },
            { text: "You were SO close that time.", isTrue: false, whyWrong: "Close is a feeling the box is built to give you. A grey marble is a grey marble." },
          ],
          why: "Ten coins spent, ten grey marbles, and the gold one never moved. The odds are built in, and opening more does not change them.",
        },
        {
          id: "blaster",
          prize: "Golden Blaster",
          oddsLine: "1 gold marble in 100",
          readAloud: "The Golden Blaster box. Same jar, same one gold marble. Six more opens. Watch the spent counter climb.",
          opens: 6,
          cardPrompt: "So what is true?",
          cards: [
            { text: "Six more coins, and the jar is exactly the same.", isTrue: true, whyWrong: "" },
            { text: "Two boxes in a row means a win is due.", isTrue: false, whyWrong: "Nothing is ever due. Every open is the same jar with the same ninety-nine grey marbles." },
            { text: "Opening faster gives better odds.", isTrue: false, whyWrong: "Speed changes nothing. The odds live in the jar, not in your fingers." },
          ],
          why: "Sixteen coins across two boxes, and the gold marble is still in the jar. That is a gamble, built that way on purpose.",
        },
      ],
      hints: {
        tier1: "Look at the jar. Did the gold marble move? Did the odds?",
        tier2: "Every open is the same jar: one gold, ninety-nine grey. Nothing is ever due, close or faster.",
      },
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your second challenge, you open the Odds Jar!",
          "This game is all about seeing that the odds never move, however many boxes you open.",
          "Out in the real world, the jar is hidden inside the box, so the spent counter is the only thing you see growing.",
          "Here is what you do. Tap OPEN. A marble rolls out and the spent counter climbs. Keep tapping until the OPEN button stops. Then three cards appear. Tap the one that is TRUE.",
          "[warmly] Watch the gold marble the whole time. Ready? First jar!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Tap OPEN and watch the marble roll out."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] The odds never moved, Cyber Hero! Sixteen opens, and the gold marble stayed home.",
          "[warmly] Out in the real world, a loot box is a jar you cannot see. Remember the one gold marble, and the next one is never due.",
        ],
      },
    },
    // 10 - Prove: LIE
    {
      type: "quickCheck",
      mode: "lie",
      prompt: "Is that true?",
      raccoonLine: "open enough boxes and the rare prize is GUARANTEED, that's just maths!",
      choices: [
        { text: "TRUE", isCorrect: false, why: "Boxes have no memory. Every open is the same jar with the same one gold marble in a hundred." },
        { text: "FALSE", isCorrect: true },
      ],
      praise: "Busted! Boxes have no memory. Nothing is ever guaranteed. ✓",
      nudge: "Did the gold marble move when you opened ten boxes?",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "Busted. Boxes have no memory.",
          "Ten boxes or a hundred, the jar is the same every time.",
          "[warmly] Nothing is ever due, and nothing is ever guaranteed.",
        ],
      },
    },
    // 11 - Recap · Concept 2 of 5
    {
      type: "recap",
      concept: 2,
      total: 5,
      learned: "Loot boxes are a designed gamble. One gold marble in a hundred, and the odds never change, however many you open.",
      next: "the shop tricks that make your heart race",
      emblem: "🎲",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Two powers, Cyber Hero. You saw through the shine to the jar.",
          "One gold marble. Ninety-nine grey. No memory.",
          "[whispers] But the shop does not only hide things. Sometimes it shouts. Countdowns. Only four left!",
          "Next, we'll learn the shop tricks that make your heart race. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 3 · PRESSURE TRICKS ─────────── */
    // 12 - Learn
    {
      type: "info",
      conceptNumber: 3,
      conceptTotal: 5,
      title: "Shop Pressure Tricks",
      content:
        "LIMITED TIME! ONLY 4 LEFT! EVERYONE HAS IT! Game shops use countdown clocks and 'everyone else' talk to make you buy FAST, because fast buyers do not stop to think. Here is the truth: 'limited' items come back, 'everyone has it' is never true, and a racing heart at the shop means the trick is working. Freeze the clock, read the real price.",
      bullets: [
        "Countdown clocks are the rush trick",
        "'Everyone has it!' is the left-out trick",
        "Fast buyers do not stop to think",
        "'Limited' things almost always come back",
        "Racing heart at the shop? Trick detected",
      ],
      bulletIcons: ["🔔", "🎭", "⚡", "🌀", "💡"],
      emblem: "⚡",
      narration: {
        speaker: "adam",
        lines: [
          "[nervous] Here they come, the tricks that set your heart racing. LIMITED TIME! Only FOUR left! Everyone already has it!",
          "[warmly] Feel your heart speed up? The shop did that on purpose.",
          "Fast buyers do not stop to think.",
          "[whispers] But 'limited' things come back, and 'everyone has it' is never true.",
          "Freeze the clock, read the real price, then decide.",
          "[excited] Come and pull the lever that prints the truth!",
        ],
      },
    },
    // 13 - Game: HOLD "The True-Price Lever" (the week's signature, data-driven)
    {
      type: "truePriceLever",
      threat: {
        raccoonLine:
          "A ticking clock and a sign that says EVERYONE HAS IT. Kids buy before they read. Nobody ever pulls the lever and adds it up!",
      },
      introTitle: "The True-Price Lever",
      introSubtitle: "A deal flashes with a countdown. Pull and hold the brass lever, read the real total, then BUY or WALK AWAY.",
      introIcon: "🏷️",
      shopLabel: "THE LOOT SHOP",
      leverHint: "Pull the TRUTH LEVER and HOLD it to print the real price!",
      buyLabel: "BUY",
      walkLabel: "WALK AWAY",
      fakeStamp: "FAKE",
      completeTitle: "Every true price printed!",
      completeLine: "The receipt never lies. The countdown always does.",
      startCoins: 5,
      deals: [
        {
          id: "hat",
          name: "Cool Hat",
          art: "hat",
          priceTag: "2 coins",
          advertised: 2,
          trueCost: 2,
          receipt: [
            { label: "Cool Hat", amount: "2 coins", bad: false },
            { label: "Hidden tricks", amount: "none!", bad: false },
            { label: "Rush", amount: "none, here all season", bad: false },
          ],
          totalLabel: "TRUE PRICE: 2 coins",
          stamp: "FAIR!",
          rightMove: "buy",
          readAloud: "First deal: a Cool Hat, two coins, sitting calmly on the shelf. Pull the lever and hold it.",
          why: "A calm price, no tricks, and coins to spare. That is what a fair deal looks like, so a hero can say yes.",
          teach: {
            title: "That one was fair",
            body: "Walking away is never a disaster. But look at the receipt: no tricks, no rush, coins to spare. A calm, fair deal is one a hero can take.",
            tip: "Fair price, no rush, coins to spare: you can buy it.",
          },
        },
        {
          id: "cape",
          name: "Golden Cape",
          art: "cape",
          priceTag: "3 coins",
          pressure: "GONE FOREVER IN 3:00!",
          countdown: true,
          advertised: 3,
          trueCost: 3,
          receipt: [
            { label: "Golden Cape", amount: "3 coins", bad: false },
            { label: "Countdown", amount: "FAKE, it resets", bad: true },
            { label: "Gone forever?", amount: "back next week", bad: true },
          ],
          totalLabel: "TRUE PRICE: 3 coins, and no rush at all",
          stamp: "TRICK!",
          rightMove: "walk",
          readAloud: "Next: a Golden Cape, gone forever in three minutes, says the sign. Pull the lever and see if the clock is real.",
          why: "The clock was paint. Gone forever capes come back all the time, and a deal that cannot wait for you was never a real deal.",
          teach: {
            title: "The clock made the choice",
            body: "A countdown on a shop is there to stop your thinking. The receipt showed it was fake and the cape comes back. Buying under a rush is the trick working.",
            tip: "See a countdown? Pull the lever, freeze the clock, walk away.",
          },
        },
        {
          id: "box",
          name: "Mystery Box",
          art: "box",
          priceTag: "1 coin!!",
          pressure: "EVERYONE HAS ONE!",
          // No clock on this one, so the banner carries the stamp: without it
          // the lever looked broken on deal 3 (Abdullah, retest 3b).
          pressureFake: true,
          advertised: 1,
          trueCost: 5,
          receipt: [
            { label: "Mystery Box", amount: "1 coin", bad: true },
            { label: "No dragon! Try again", amount: "+1", bad: true },
            { label: "Still no dragon", amount: "+1", bad: true },
            { label: "Just one more", amount: "+1", bad: true },
            { label: "And one more", amount: "+1", bad: true },
          ],
          totalLabel: "TRUE PRICE: 5 coins (no dragon!)",
          stamp: "TRICK!",
          rightMove: "walk",
          readAloud: "A Mystery Box for one coin, and everyone has one, says the sign. Pull the lever and print the real total.",
          why: "One coin became five, and no shop can know what everyone has. The receipt showed the trap before it could gobble the pouch.",
          teach: {
            title: "The box gobbled your pouch!",
            body: "Mystery boxes keep whispering one more try. That is how a one-coin box empties a whole pouch, and no shop can know what everyone has.",
            tip: "Lucky this is just practice! Trust the receipt, not the sign.",
          },
        },
        {
          id: "pass",
          name: "Mega Pass",
          art: "pass",
          priceTag: "only 1 coin a DAY!",
          pressure: "ONLY 4 LEFT!",
          countdown: true,
          advertised: 1,
          trueCost: 7,
          receipt: [
            { label: "Day 1", amount: "1 coin", bad: true },
            { label: "Day 2", amount: "+1", bad: true },
            { label: "Day 3", amount: "+1", bad: true },
            { label: "Day 4", amount: "+1", bad: true },
            { label: "Day 5", amount: "+1", bad: true },
            { label: "It never stops", amount: "+1 +1 +1", bad: true },
          ],
          totalLabel: "TRUE PRICE: 7 coins in week ONE",
          stamp: "TRICK!",
          rightMove: "walk",
          readAloud: "Last deal: the Mega Pass, only one coin a day, and only four left. Pull the lever and add up the days.",
          why: "Tiny prices grow huge. A coin every day is seven coins in a week, and the four left sign is just the rush trick in new paint.",
          teach: {
            title: "Tiny prices grow HUGE!",
            body: "A coin every day sounds tiny, but the drip never stops. In one week it costs more than your whole pouch, and the four left sign is there to hurry you.",
            tip: "Lucky this is just practice! When a price repeats every day, add it up first.",
          },
        },
      ],
      hints: {
        tier1: "Read the receipt, not the sign. Red lines mean the price keeps growing.",
        tier2: "A countdown, a gone forever, an everyone has it: pressure. Walk away. A calm price with coins to spare: fair.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your third challenge, you work the True-Price Lever!",
          "This game is all about freezing the rush and reading what a deal really costs.",
          "Out in the real world, the sign flashes and the clock ticks so you buy before you read.",
          "Here is what you do. A deal appears with its shiny tag. Pull the brass lever down and HOLD it. The receipt prints the real total, line by line, and any countdown freezes. Then tap BUY or WALK AWAY.",
          "[warmly] Hold the lever until the stamp lands, every time. Ready? First deal!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Pull the lever down and hold it until the receipt is printed."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every true price printed, Cyber Hero! The clock never rushed you once.",
          "[warmly] Out in the real world, when a shop counts down at you, that is your signal to slow down and read the real price.",
        ],
      },
    },
    // 14 - Prove: SPEED
    {
      type: "quickCheck",
      mode: "speed",
      prompt: "Quick! Which one is a PRESSURE trick?",
      speedMs: 5000,
      choices: [
        { text: "'Only 4 minutes left, BUY NOW!'", isCorrect: true },
        { text: "'In the shop whenever you're ready'", isCorrect: false, why: "Whenever you're ready is zero rush. A fair offer can wait for you." },
        { text: "'Here all season, take your time'", isCorrect: false, why: "Take your time is the opposite of a rush. That is what honest looks like." },
      ],
      praise: "Spotted at full speed! No countdown gets past you. ✓",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "A countdown with BUY NOW is the rush trick.",
          "Fair offers can wait for you.",
          "[warmly] Racing heart at the shop? Freeze the clock and read the price.",
        ],
      },
    },
    // 15 - Recap · Concept 3 of 5
    {
      type: "recap",
      concept: 3,
      total: 5,
      learned: "Countdowns and 'everyone has it' make you buy fast. Freeze the clock, read the real price. Fair offers can wait.",
      next: "the golden rule that guards every wallet",
      emblem: "⚡",
      narration: {
        speaker: "layla",
        lines: [
          "[proud] Three powers, Cyber Hero. Every clock froze, every receipt printed.",
          "Countdowns, gone forever, only four left. All paint.",
          "[whispers] Even a fair deal has one more step before you tap BUY. Whose money is it?",
          "Next, we'll learn the golden rule that guards every wallet. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 4 · ALWAYS ASK BEFORE YOU BUY ─────────── */
    // 16 - Learn
    {
      type: "info",
      conceptNumber: 4,
      conceptTotal: 5,
      title: "Always Ask Before You Buy",
      content:
        "Here is the golden wallet rule: it is not your money, so it is not your call alone. Before ANY buy, coins, skins, passes, boxes, you ask the grown-up whose money it is. Every time, even for 'tiny' ones. And when they say yes, buying is fine! Asking is not babyish. It is what keeps the shop fun instead of scary.",
      bullets: [
        "It is not your money, so ask first",
        "Every buy, every time",
        "Even the 'tiny' ones, they add up",
        "The grown-up whose money it is decides",
        "When they say yes, buying is fine",
      ],
      bulletIcons: ["👪", "✅", "💎", "🔒", "⭐"],
      emblem: "👪",
      narration: {
        speaker: "layla",
        lines: [
          "[warmly] Time for the golden wallet rule, the one that guards everything.",
          "It is not your money, so it is not your call alone.",
          "Before ANY buy, coins, skins, boxes, you ask the grown-up whose money it is.",
          "[whispers] Every time. Even the tiny ones.",
          "And when they say yes? Then buying is fine!",
          "[excited] Come and decide some buy moments with me!",
        ],
      },
    },
    // 17 - Game: DECIDE "The Buy Button" (PauseDecide re-theme: neutral cards, shuffled sides)
    {
      type: "chooseYourPath",
      presentation: "device",
      speakScenarios: true,
      introTitle: "The Buy Button",
      introSubtitle: "A buy prompt pops up. Two same-looking cards: which one is the hero move? Sometimes buying is fine, because a grown-up already said yes.",
      introIcon: "⏸️",
      threat: {
        raccoonLine:
          "A saved card and a big yellow YES. Kids tap before anyone can say no. Asking first is my worst enemy!",
      },
      scenarios: [
        {
          setup: "Mid-game, a box pops up: 'Unlock the GOLDEN BLASTER for 7.99. Card already saved, just tap YES!'",
          frame: { appName: "Mega Blasters", icon: "🎮" },
          safeKind: "ask",
          wrongTitle: "Hmm, saved is not the same as allowed",
          wrongTip: "A saved card is real money with a shortcut button. Nobody said yes to THIS buy yet.",
          choices: [
            { text: "Tap YES, the card is already saved", isSafe: false, consequence: "That saved card is a real person's real money, and they did not get a say. Saved does not mean allowed." },
            { text: "Pause the game and ask first", isSafe: true, consequence: "Hero move! Maybe they say yes, maybe no, but it was THEIR call, and the shop stays fun." },
          ],
        },
        {
          setup: "The shop flashes: 'MEGA DEAL ends in 5 minutes! Ask later and you LOSE it!'",
          frame: { appName: "Gem shop", icon: "💎" },
          safeKind: "ask",
          wrongTitle: "Hmm, the countdown made that choice",
          wrongTip: "Rush plus money means double-check. A deal that cannot wait five minutes for a grown-up is not a deal.",
          choices: [
            { text: "Buy now, explain later, there's no time", isSafe: false, consequence: "The countdown made the choice, not you. And that mega deal was back the very next week." },
            { text: "Ask anyway, a real deal can wait five minutes", isSafe: true, consequence: "Exactly. Rush plus money means double-check. Any deal that cannot wait for a grown-up is a trick." },
          ],
        },
        {
          setup: "Your best friend says: 'Just buy the coins, my parents never notice small ones!'",
          frame: { appName: "Team chat", icon: "💬" },
          safeKind: "ask",
          wrongTitle: "Hmm, small ones still count",
          wrongTip: "Not noticing is not the same as saying yes. Tiny buys need an ask too.",
          choices: [
            { text: "Do it, small ones don't count", isSafe: false, consequence: "Small ones still count. They add up in secret until someone gets a shock. Not noticing is not the same as saying yes." },
            { text: "Nope, I ask first, every time", isSafe: true, consequence: "Rule held, even with a friend pushing. THAT is a Wallet Guard. Every buy gets an ask, tiny ones too." },
          ],
        },
        {
          setup: "Mum is sitting right next to you. She says: 'Yes, you can get the season pass, go ahead.' The shop asks: Buy season pass?",
          frame: { appName: "Mega Blasters", icon: "🎮" },
          safeKind: "go",
          wrongTitle: "Hmm, one yes covers one buy",
          wrongTip: "When the grown-up whose money it is says yes, buying that one thing is fine. Nothing extra sneaks in.",
          choices: [
            { text: "Tap BUY, the grown-up whose money it is said yes", isSafe: true, consequence: "Perfect. She said yes, she is right there, and it is her money. Asking first is what makes buying fine." },
            { text: "Sneak a gem pack in while she's saying yes", isSafe: false, consequence: "She said yes to the season pass, not to a gem pack. One yes covers one buy. Anything extra needs its own ask." },
          ],
        },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] On your fourth challenge, you face the Buy Button!",
          "This game is all about asking before you buy, and knowing when a yes has already been given.",
          "Out in the real world, the buy button is always big, bright and one tap away.",
          "Here is what you do. A buy moment appears on the screen. Below it, two cards that look the same. Read both. Tap the hero move. Sometimes that is asking first, and sometimes it is buying, because a grown-up already said yes.",
          "[warmly] Feel the push to tap fast? That is your signal to read the cards. Ready? First moment!",
        ],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Every buy moment decided, Cyber Hero! You asked first, and you knew a real yes when you saw one.",
          "[warmly] Out in the real world, the ask takes ten seconds and keeps the shop fun for everyone. Their money, their call, every time.",
        ],
      },
    },
    // 18 - Prove: RECALL
    {
      type: "quickCheck",
      mode: "recall",
      prompt: "Who do you ask before ANY buy?",
      choices: [
        { text: "The grown-up whose money it is", isCorrect: true },
        { text: "Your best friend", isCorrect: false, why: "A friend cannot say yes to someone else's money. Only the grown-up whose money it is can." },
        { text: "The game's shop", isCorrect: false, why: "The shop wants the sale. It will always say yes. That is not an ask." },
        { text: "Nobody, if it is small", isCorrect: false, why: "Small buys add up in secret. Every buy gets an ask, tiny ones too." },
      ],
      praise: "Their money, their call, every single time. ✓",
      teachNarration: {
        speaker: "layla",
        lines: [
          "[proud] Well done!",
          "You ask the grown-up whose money it is.",
          "Not a friend, not the shop, and not nobody.",
          "[warmly] Every buy, every time, even the tiny ones.",
        ],
      },
    },
    // 19 - Recap · Concept 4 of 5
    {
      type: "recap",
      concept: 4,
      total: 5,
      learned: "It is not your money, so it is not your call alone. Ask before every buy, and a real yes makes buying fine.",
      next: "the greediest trap of all: 'FREE' coins",
      emblem: "👪",
      narration: {
        speaker: "adam",
        lines: [
          "[proud] Four powers, Cyber Hero. The golden rule is locked in.",
          "Ask first. Every buy. Even the tiny ones.",
          "[whispers] One trap is left, and it does not even ask for money. It says the word FREE.",
          "Next, we'll learn why free game money does not exist. Come and see!",
        ],
      },
    },

    /* ─────────── BEAT 5 · "FREE" CURRENCY IS A SCAM ─────────── */
    // 20 - Learn
    {
      type: "info",
      conceptNumber: 5,
      conceptTotal: 5,
      title: "'FREE Coins' Are Never Free",
      content:
        "FREE Gem Bucks! FREE Robo Coins! Just log in HERE! Listen carefully: free game money does not exist. Coins cost the game company real money, so nobody gives them away. Every 'generator' and 'free coins' pop-up is after one thing: your account, or a grown-up's card. Real rewards come from INSIDE the game and ask for nothing. Anything else: close it, do not tap, tell a grown-up.",
      bullets: [
        "Free game money does NOT exist",
        "Coins cost the game company real money",
        "'Generators' are account thieves",
        "Real rewards live inside the game and ask for nothing",
        "Do not tap, close it, tell a grown-up",
      ],
      bulletIcons: ["🚫", "💎", "🪤", "🎁", "✋"],
      emblem: "🪤",
      narration: {
        speaker: "adam",
        lines: [
          "[excited] Does free game money exist? Let's find out. FREE Gem Bucks! FREE Robo Coins! Just log in here!",
          "[warmly] Listen carefully, Cyber Hero. There is no such thing as free game money.",
          "Coins cost the game company real money. Nobody gives them away.",
          "[whispers] Every free coins pop-up wants one thing: your account, or a grown-up's card.",
          "Real rewards come from inside the game, and they ask for nothing.",
          "[excited] Come and follow the strings on some free offers!",
        ],
      },
    },
    // 21 - Game: CONNECT "Free-Coin Strings" (stringsAttached re-theme, coins skin, W4 engine)
    {
      type: "stringsAttached",
      skin: "coins",
      threat: {
        raccoonLine:
          "The word FREE does all my work. Kids see free coins and type their password before they read the rest. The string is right there. Nobody follows it!",
      },
      introTitle: "Free-Coin Strings",
      introSubtitle: "Three FREE offers float over the counter, each on a string. Tap one, then tap what its string really leads to. One of them is a real reward.",
      introIcon: "🎁",
      tokenLabels: {
        password: "Your password",
        money: "A grown-up's card",
        tap: "Your tap (install)",
        nothing: "Nothing, it's real",
      },
      scamToast: "STRING FOLLOWED: A TRICK!",
      fairToast: "NO STRINGS: A REAL REWARD!",
      completeTitle: "Every string followed!",
      completeLine: "Free coins want your account or a grown-up's card. Real rewards want nothing.",
      offers: [
        {
          id: "generator",
          text: "FREE 10,000 Gem Bucks! Log in HERE to claim",
          readAloud: "A gold coin floats up: FREE ten thousand Gem Bucks! Log in here to claim. Where does its string lead?",
          wants: "password",
          why: "Log in here is the whole trick. The coins are bait, and your password is the catch. Nobody hands out ten thousand of anything.",
          nudge: "Read the small words on that coin. What does log in here want you to type before the Gem Bucks arrive?",
        },
        {
          id: "daily",
          text: "Daily reward: 50 coins for logging in, inside the game",
          readAloud: "A gold coin floats up: daily reward, fifty coins for logging in, inside the game. Where does its string lead?",
          wants: "nothing",
          why: "It lives inside the real game, it asks for nothing, and fifty coins a day is the kind of small reward real games give. That one is real.",
          nudge: "A daily reward that lives inside the game and pays you for logging in. Does it ask you for anything before you get it?",
        },
        {
          id: "doubler",
          text: "Coin DOUBLER: install this and watch your balance grow!",
          readAloud: "A gold coin floats up: coin doubler, install this and watch your balance grow. Where does its string lead?",
          wants: "tap",
          why: "Nothing can double game coins from outside the game. Install this is the string, and the tap lets the thief in.",
          nudge: "Install this, says the doubler. What is the one thing it needs you to do before your balance grows?",
        },
        {
          id: "spinner",
          text: "FREE skin spinner! Every spin wins! Add a grown-up's card to unlock",
          readAloud: "A gold coin floats up: free skin spinner, every spin wins, add a grown-up's card to unlock. Where does its string lead?",
          wants: "money",
          why: "Free, then add a card. Every spin wins means every spin costs, and the card is what the spinner was fishing for.",
          nudge: "It says free. Then what does it ask you to add?",
        },
        {
          id: "levelup",
          text: "Level 10 bonus: 100 coins, from the game itself",
          readAloud: "A gold coin floats up: level ten bonus, one hundred coins, from the game itself. Where does its string lead?",
          wants: "nothing",
          why: "You earned it by playing, the game handed it over, and it asks for nothing. Real rewards feel exactly like that.",
          nudge: "A level ten bonus, straight out of the game. You earned it by playing. Does it ask you for anything at all?",
        },
        {
          id: "lucky",
          text: "Lucky player! Enter your username and password for 5,000 coins",
          readAloud: "A gold coin floats up: lucky player! Enter your username and password for five thousand coins. Where does its string lead?",
          wants: "password",
          why: "Lucky player is the flattery, and the password box is the trap. The coins were never going to arrive.",
          nudge: "Why would a prize need your password before it can be given?",
        },
      ],
      hints: {
        tier1: "Read what the offer asks you to DO: log in, install, add a card, or nothing.",
        tier2: "Log in or password: your password. Add a card: a grown-up's card. Install: your tap. From inside the game, asks for nothing: it's real.",
      },
      narration: {
        speaker: "adam",
        lines: [
          "[excited] On your last challenge, you follow the Free-Coin Strings!",
          "This game is all about seeing what a free offer really wants.",
          "Out in the real world, the word FREE is printed big and the string is printed small.",
          "Here is what you do. Three offers float over the counter. Tap one, and I will read it. Then tap the token its string really leads to: your password, a grown-up's card, your tap, or nothing because it is real. Right, and the string snaps to the truth. Wrong, and I help you look again.",
          "[warmly] Follow every string, and free will never fool you. Ready? First offer!",
        ],
      },
      coachLines: {
        speaker: "adam",
        lines: ["Tap an offer, then tap what its string really leads to."],
      },
      completeNarration: {
        speaker: "adam",
        lines: [
          "[proud] Every string followed, Cyber Hero! Four tricks exposed, two real rewards kept.",
          "[warmly] Out in the real world, free game money does not exist, but real rewards inside the game do. Follow the string before you tap.",
        ],
      },
    },
    // 22 - Prove: PUT-IN-ORDER
    {
      type: "quickCheck",
      mode: "order",
      prompt: "A 'FREE coins' pop-up appears. Tap the hero steps IN ORDER:",
      choices: [
        { text: "Don't tap CLAIM", isCorrect: true },
        { text: "Close the pop-up", isCorrect: true },
        { text: "Tell a grown-up", isCorrect: true },
      ],
      praise: "Hands off, close it, tell. Free coins never get you! ✓",
      nudge: "What must you NOT do first, before anything else?",
      nudgeNext: "What comes straight after the step you just did?",
      teachNarration: {
        speaker: "adam",
        lines: [
          "[proud] Well done!",
          "Don't tap CLAIM. Close the pop-up. Tell a grown-up.",
          "Hands off first, because the shiny button is the trap.",
          "[warmly] Then close it, and let a grown-up know.",
        ],
      },
    },
    // 23 - Recap · Concept 5 of 5 (promises the review, never the boss)
    {
      type: "recap",
      concept: 5,
      total: 5,
      learned: "Free game money does not exist. Free-coin offers want your account or a grown-up's card. Real rewards live inside the game.",
      next: "one quick review to make it all stick",
      emblem: "🪤",
      narration: {
        speaker: "layla",
        lines: [
          "[excited] That's all FIVE wallet powers, Cyber Hero!",
          "Coins counted, odds seen, clocks frozen, asks made, strings followed.",
          "[whispers] The Raccoon's whole shop is glass to you now.",
          "One quick review to make it all stick, then he opens his quiz counter. Come on!",
        ],
      },
    },

    // 24 - Consolidation: "The Till Match" (memoryMatch re-theme, W1 engine)
    {
      type: "memoryMatch",
      threat: {
        raccoonLine:
          "Five tricks on one till! Surely a kid cannot remember the hero move for every single one!",
      },
      introTitle: "The Till Match",
      introWelcome: "Ring it up!",
      introSubtitle: "Flip the cards and match each shop trick to its hero move. Fewer flips earn more stars.",
      pairs: [
        { term: "500 gems for sale", match: "Real money in disguise", colour: "#ffd158", why: "Gems are coins with a costume on. Five hundred gems is real money, every time." },
        { term: "'One more loot box!'", match: "Same odds, no memory", colour: "#c084fc", why: "Boxes have no memory. The next one has the same one-in-a-hundred chance as the last." },
        { term: "'Only 3 minutes left!'", match: "A fake clock, walk away", colour: "#ff5fb3", why: "A countdown on a shop is paint. Freeze it, read the price, walk away." },
        { term: "'Card already saved'", match: "Still ask first", colour: "#00e5ff", why: "Saved is not allowed. Nobody said yes to this buy, so you ask the grown-up whose money it is." },
        { term: "'FREE coins, log in here'", match: "An account thief", colour: "#ff7a59", why: "Free game money does not exist. Log in here is fishing for your password." },
        { term: "Grown-up said yes, real shop", match: "The one safe way to buy", colour: "#7eff97", why: "Inside the real game, with a real yes from the grown-up whose money it is. That is the one safe way." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Time for your review: the Till Match!",
          "This game is all about pairing each shop trick with its hero move.",
          "Out in the real world, the tricks come one at a time, so the moves have to be ready in any order.",
          "Here is what you do. The cards are face down. Flip two. If a shop trick meets its hero move, they stay up and I tell you why. If not, they flip back and you try again. Fewer flips, more stars.",
          "[warmly] Six pairs, one till, one fortress. Ready? Flip a card!",
        ],
      },
      coachLines: {
        speaker: "layla",
        lines: ["Flip any card to start, then find its matching move."],
      },
      completeNarration: {
        speaker: "layla",
        lines: [
          "[proud] Till matched, Cyber Hero! Every shop trick met its hero move.",
          "[warmly] Out in the real world, your wallet has a guard on every trick now, and you know which move to make.",
        ],
      },
    },

    // 25 - BOSS: the standard quiz (5 questions, pass 4)
    { type: "bossBattle" },

    // 26 - CLOSING VIDEO: the trap shop shuts down
    { type: "video", videoPlaceholder: "Week 7: The Shop Shuts Down", videoSrc: "/videos/module-07-outro.mp4" },

    // 27 - Mission Debrief
    {
      type: "missionDebrief",
      title: "Mission Complete!",
      subtitle: "Here's everything you mastered this week.",
      concepts: [
        { id: "money", label: "Real-Money Eyes", accent: "#ffd158", icon: "💎", summary: "Game coins are real money in disguise. You count them out now." },
        { id: "loot", label: "Odds Seer", accent: "#c084fc", icon: "🎲", summary: "One gold marble, ninety-nine grey, and no memory. A designed gamble." },
        { id: "pressure", label: "Clock Freezer", accent: "#ff5fb3", icon: "⚡", summary: "Countdowns and 'everyone has it' are paint. Fair offers can wait." },
        { id: "ask", label: "Ask-First Rule", accent: "#00e5ff", icon: "👪", summary: "Not your money, not your call alone. Every buy gets an ask." },
        { id: "free", label: "Free-Coin Radar", accent: "#7eff97", icon: "🪤", summary: "Free game money does not exist. Follow the string, close it, tell." },
      ],
      narration: {
        speaker: "layla",
        lines: [
          "[excited] Look at EVERYTHING you mastered this week!",
          "You count the real coins, you see the odds in the jar,",
          "no countdown can rush you, you ask before every buy...",
          "[warmly] and free-coin strings lead you straight to the trick.",
          "[excited] The trap shop is OUT of business. Sticker time!",
        ],
      },
    },

    // 28 - Sticker Unlock
    {
      type: "stickerUnlock",
      title: "Stickers Unlocked!",
      stickers: [
        { id: "coin-counter", name: "Coin Counter", icon: "💎", description: "Sees the real price every time." },
        { id: "odds-seer", name: "Odds Seer", icon: "🎲", description: "Knows the jar never changes." },
        { id: "ask-first-buyer", name: "Ask-First Buyer", icon: "👪", description: "Never buys without asking." },
      ],
    },

    // 29 - Completion
    { type: "completion" },
  ],
  /* ──────────────── THE STANDARD QUIZ BOSS (week-ending test) ────────────────
     5 apply-the-skill questions, one per taught concept, 4 right to pass
     (owner decision, UAT batch 2). Every villain line is distinct. Recorded
     via the narration generator (week7.ts is in LEARN_LOOP_WEEKS). */
  bossQuiz: {
    villain: { name: "HACKER RACCOON", sprite: "raccoon" },
    accent: "#ffd158",
    theme: {
      topic: "In-Game Spending",
      motifs: ["🎁", "💎", "🔒", "🎯", "⏸️", "⭐", "🚫", "👍"],
    },
    intro: {
      slug: "quiz-w7-intro",
      text: "Welcome to my quiz emporium, tiny customer! Five questions, and every wrong answer feeds my piggy bank. Ready to spend a little... courage?",
    },
    victory: {
      slug: "quiz-w7-victory",
      text: "You spent NOTHING and won EVERYTHING?! My piggy bank is wheezing! Keep your coins, I'm off to sell rocks to pigeons!",
    },
    passMark: 4,
    questions: [
      {
        phaseId: "phase-w7-c1",
        key: "quiz-w7-c1-1",
        label: "Game Coins Are Real Money",
        ask: {
          slug: "quiz-w7-ask-c1-1",
          text: "Adam says buying a 999-coin pack is fine because 'coins aren't real money'. What's the truth?",
        },
        options: [
          { text: "Real money bought them, so they're real money in a costume" },
          { text: "He's right, money stops being real once it turns into coins" },
          { text: "Only the giant coin packs count as real money" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Coins are money in disguise!",
          explanation: "Every coin pack, big or small, is bought with real money someone in your family worked for. The fun name and bright colours are just the costume. Count the coins out, every time.",
        },
        villainRight: {
          slug: "quiz-w7-right-c1-1",
          text: "You counted the coins?! But I hand-painted every gem to look like candy!",
        },
        villainWrong: {
          slug: "quiz-w7-wrong-c1-1",
          text: "Not real! Not real at all! Now hand over nine hundred not-real coins!",
        },
      },
      {
        phaseId: "phase-w7-c2",
        key: "quiz-w7-c2-1",
        label: "The Loot Box Gamble",
        ask: {
          slug: "quiz-w7-ask-c2-1",
          text: "Layla opened nine loot boxes chasing the dragon pet. Her friend says the tenth HAS to win. What's true?",
        },
        options: [
          { text: "Box ten has the exact same tiny chance as box one" },
          { text: "Her friend is right, ten tries earns the prize" },
          { text: "The chance doubles with every box she opens" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Boxes have no memory!",
          explanation: "Box ten doesn't know the other nine ever happened. Same jar, same ninety-nine grey marbles, same one gold, every single time. Nobody 'earns' the rare prize by opening more boxes.",
        },
        villainRight: {
          slug: "quiz-w7-right-c2-1",
          text: "No memory?! But the 'lucky number ten' speech is my best seller!",
        },
        villainWrong: {
          slug: "quiz-w7-wrong-c2-1",
          text: "One more box! Then one more! Then ONE more! Music to my fuzzy ears!",
        },
      },
      {
        phaseId: "phase-w7-c3",
        key: "quiz-w7-c3-1",
        label: "Shop Pressure Tricks",
        ask: {
          slug: "quiz-w7-ask-c3-1",
          text: "The shop flashes: 'GOLDEN CAPE, gone FOREVER in 3 minutes!' Layla loves it. What should she know?",
        },
        options: [
          { text: "'Gone forever' deals almost always come back, real deals can wait" },
          { text: "The timer is real, forever really means forever" },
          { text: "She can buy it now and return it if she changes her mind" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Countdowns are pressure paint!",
          explanation: "Shops put clocks on things so you buy before you think, and 'forever gone' capes come back all the time. A deal that can't wait for you was never a real deal.",
        },
        villainRight: {
          slug: "quiz-w7-right-c3-1",
          text: "The cape came BACK?! Who reset my forever clock?!",
        },
        villainWrong: {
          slug: "quiz-w7-wrong-c3-1",
          text: "Tick tock, tick tock! Rushed brains buy the SHINIEST junk!",
        },
      },
      {
        phaseId: "phase-w7-c4",
        key: "quiz-w7-c4-1",
        label: "Always Ask Before You Buy",
        ask: {
          slug: "quiz-w7-ask-c4-1",
          text: "Mid-game, a box pops up: 'GOLDEN BLASTER, 7.99, card already saved, just tap YES!' What's the hero move?",
        },
        options: [
          { text: "Pause the game and ask the grown-up whose money it is" },
          { text: "Tap YES, a saved card means it's already allowed" },
          { text: "Buy it now and pay it back from his piggy bank later" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Saved isn't allowed!",
          explanation: "A saved card is real money with a shortcut button, and nobody said yes to THIS buy. Piggy-bank paybacks skip the ask too. Every buy starts with asking the grown-up whose money it is.",
        },
        villainRight: {
          slug: "quiz-w7-right-c4-1",
          text: "You PAUSED?! Nobody pauses in my shop! The music is too exciting!",
        },
        villainWrong: {
          slug: "quiz-w7-wrong-c4-1",
          text: "Tap tap tap! The saved card sings, and NOBODY had to say yes! Beautiful!",
        },
      },
      {
        phaseId: "phase-w7-c5",
        key: "quiz-w7-c5-1",
        label: "'FREE Coins' Are Never Free",
        ask: {
          slug: "quiz-w7-ask-c5-1",
          text: "A site promises Layla 10,000 free Gem Bucks if she types her username and password. What is the site really for?",
        },
        options: [
          { text: "Stealing accounts, free game money doesn't exist" },
          { text: "Sharing leftover coins the game company didn't sell" },
          { text: "Real coins, they just take a few weeks to arrive" },
        ],
        correctIndex: 0,
        teachOnWrong: {
          title: "Free coins are bait!",
          explanation: "Coins cost the game company real money, so nobody hands out ten thousand for free. The 'prize' is your password. Close the page and tell a trusted grown-up.",
        },
        villainRight: {
          slug: "quiz-w7-right-c5-1",
          text: "Closed?! But I painted every one of those free Gem Bucks MYSELF!",
        },
        villainWrong: {
          slug: "quiz-w7-wrong-c5-1",
          text: "Ten thousand pretend coins for one real password? Best trade in raccoon history!",
        },
      },
    ],
  },
  badgeArt: "/cyberheroes/badges/week-07-wallet-guard.png",

  // Week-lane attack theatre: money tricks only (message scams = W4;
  // game-lobby people tricks = W6).
  bossAttacks: [
    { name: "LEFT-OUT BUNDLE", icon: "🎁", color: "#ffd158", glow: "rgba(255, 209, 88, 0.55)",  tag: "Fair offers can wait",      emblemColor: 0xffd158 },
    { name: "LOOT GAMBLE",    icon: "🎲", color: "#c084fc", glow: "rgba(192, 132, 252, 0.55)", tag: "Boxes have no memory",      emblemColor: 0xc084fc },
    { name: "FREE-COIN TRAP", icon: "🪤", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)",  tag: "Free coins don't exist",    emblemColor: 0xff5fb3 },
  ],

  // Legacy question pool, required by the WeekContent type; the quiz boss above
  // is what renders.
  bossQuestions: {
    easy: [
      { question: "What are Gem Bucks and Robo Coins REALLY?", answers: ["Real money in disguise", "Free points", "Just pretend", "Points you earn by playing"], correctIndex: 0, explanation: "Every coin pack is bought with real money someone worked for." },
      { question: "What's inside a loot box?", answers: ["A mystery with tiny odds, about one in a hundred", "Always the rare skin", "A better prize every time you open one", "Nothing"], correctIndex: 0, explanation: "One gold marble, ninety-nine grey, designed that way on purpose." },
      { question: "Before ANY buy, you...", answers: ["Ask the grown-up whose money it is", "Tap yes quickly", "Ask a friend", "Buy small ones secretly"], correctIndex: 0, explanation: "Not your money, not your call alone. Every buy gets an ask." },
    ],
    medium: [
      { question: "'Only 4 minutes left, BUY NOW!' What's really going on?", answers: ["The rush trick: fast buyers don't think", "A genuine emergency", "The shop is closing forever", "A helpful reminder"], correctIndex: 0, explanation: "Countdowns exist to stop your thinking. Real deals can wait." },
      { question: "You opened 9 loot boxes. What are box 10's odds?", answers: ["Exactly the same as box 1", "Guaranteed rare now", "Double the chance", "A little bit better than before"], correctIndex: 0, explanation: "Boxes have no memory. The jar resets every single time." },
      { question: "'FREE Gem Bucks, just enter your password!' What do they want?", answers: ["Your account", "To be generous", "Only your username, nothing important", "Nothing"], correctIndex: 0, explanation: "Free game money doesn't exist. The password IS the prize they're after." },
    ],
    hard: [
      { question: "Why do games give money fun names like Gem Bucks?", answers: ["So it feels like play money and spends easier", "To be creative", "Because fun names are easier to remember", "For no reason"], correctIndex: 0, explanation: "Fun names hide the real money. Counting the coins out is your superpower." },
      { question: "'My parents never notice small buys!' What's wrong with that?", answers: ["Small buys add up in secret until someone gets a shock", "Nothing, small ones are free", "It's fine if you pay them back later", "Small buys don't count"], correctIndex: 0, explanation: "Not noticing isn't the same as saying yes. Tiny buys need asks too." },
      { question: "What does the 'SO close!' feeling after a loot box mean?", answers: ["The box was designed to make you want one more", "You nearly won", "Try one more", "Your luck is building up"], correctIndex: 0, explanation: "'Almost' is part of the machine. It's how they sell the next box." },
    ],
  },

  // Keyed by SCREEN INDEX (0-29), in lock-step with `screens` above.
  // The 5 recap checkpoints are 7 / 11 / 15 / 19 / 23.
  reactions: {
    0: { adam: { mood: "excited", message: "Mission 7: the Gem Bucks trap!" }, layla: null }, // intro video
    1: { adam: { mood: "worried", message: "Real money, gone. Let's learn why." }, layla: null }, // alert
    2: { adam: null, layla: { mood: "curious", message: "Mission Command is calling." } }, // ATLAS briefing
    3: { adam: null, layla: { mood: "curious", message: "Here's the plan for today." } }, // mission brief
    4: { adam: { mood: "thinking", message: "Fun names. Real coins." }, layla: null }, // learn: money
    5: { adam: { mood: "excited", message: "Count the coins into the till!" }, layla: null }, // game: Coin Counter
    6: { adam: null, layla: { mood: "thumbsup", message: "Finish the rule!" } }, // prove: finish
    7: { adam: null, layla: { mood: "excited", message: "One power down, four to go!" } }, // recap 1
    8: { adam: null, layla: { mood: "curious", message: "Let's see inside the shiny box." } }, // learn: loot
    9: { adam: { mood: "curious", message: "Watch the gold marble. It never moves." }, layla: null }, // game: Odds Jar
    10: { adam: null, layla: { mood: "worried", message: "Is he fibbing? Listen close!" } }, // prove: lie
    11: { adam: { mood: "thumbsup", message: "Odds seen. No memory." }, layla: null }, // recap 2
    12: { adam: { mood: "thinking", message: "A racing heart at the shop? Trick." }, layla: null }, // learn: pressure
    13: { adam: { mood: "excited", message: "Pull the lever and HOLD it!" }, layla: null }, // game: True-Price Lever
    14: { adam: null, layla: { mood: "excited", message: "Quick! Spot the pressure!" } }, // prove: speed
    15: { adam: null, layla: { mood: "excited", message: "Pressure-proof: certified!" } }, // recap 3
    16: { adam: null, layla: { mood: "thinking", message: "Whose money is it? They decide." } }, // learn: ask
    17: { adam: { mood: "curious", message: "Feel the push to buy? Read the cards." }, layla: null }, // game: Buy Button
    18: { adam: null, layla: { mood: "thumbsup", message: "Who do you ask?" } }, // prove: recall
    19: { adam: { mood: "thumbsup", message: "The golden rule, locked in." }, layla: null }, // recap 4
    20: { adam: { mood: "thinking", message: "Free coins don't exist. Full stop." }, layla: null }, // learn: free
    21: { adam: { mood: "curious", message: "Follow the string, Cyber Hero." }, layla: null }, // game: Free-Coin Strings
    22: { adam: null, layla: { mood: "thumbsup", message: "Put the hero steps in order!" } }, // prove: order
    23: { adam: null, layla: { mood: "excited", message: "All five powers. Review time!" } }, // recap 5
    24: { adam: null, layla: { mood: "excited", message: "Match every trick to its move!" } }, // review: Till Match
    25: { adam: { mood: "worried", message: "His trap shop is OPEN. Close it!" }, layla: null }, // boss
    26: { adam: null, layla: { mood: "excited", message: "Watch the shop shut down!" } }, // outro video
    27: { adam: { mood: "thumbsup", message: "Look at everything you mastered!" }, layla: null }, // debrief
    28: { adam: null, layla: { mood: "excited", message: "Stickers earned, off to Cyber HQ!" } }, // stickers
    29: { adam: { mood: "thumbsup", message: "Wallet Guard badge earned!" }, layla: null }, // completion
  },
};
