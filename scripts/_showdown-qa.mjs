// Showdown boss QA driver: plays a week's boss fight end-to-end in a real
// browser, screenshotting every stage. Companion to _week-sweep.mjs (same
// seed + login flow); the per-week step script lives in STEPS below.
//
//   node scripts/_showdown-qa.mjs --week=3 [--base=http://localhost:3100] [--out=scripts/shot-out/w3-boss]
//
// Step DSL: {wait: ms} | {shot: name} | {click: "visible text"} |
//           {clickLabel: "aria-label"} | {hold: "visible text", ms}
import { chromium, request } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=([\s\S]*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  })
);
const week = Number(args.week || 3);
const base = args.base || "http://localhost:3100";
const out = args.out || `scripts/shot-out/w${week}-boss`;
// Viewport (PILOT FEEDBACK: wide screens exposed cast/board overlap —
// QA at both 1280x900 AND a wide viewport before every boss ships).
const vw = Number(args.vw || 1280);
const vh = Number(args.vh || 900);

const TEST_EMAIL = "e2e@algorithmx.test";
const TEST_PASSWORD = "e2e-test-pw";
const CHROME =
  "C:/Users/Asad Jalal/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";
const launchOpts = existsSync(CHROME)
  ? { headless: true, executablePath: CHROME }
  : { headless: true, channel: "msedge" };

/** Per-week playthrough scripts. Boss screen is index 24 in the locked
 *  29-screen week; the fight auto-enters on landing. */
const STEPS = {
  // W1 VaultBoss overlap spot-check: one shot of the wall play board.
  1: [
    { wait: 5000 },
    { clickLabel: "Play as ADAM" },
    { wait: 3600 },
    { shot: "01-wall-play" },
  ],
  3: [
    { wait: 3000 }, { shot: "01-entrance" },            // nameplate reveal
    { wait: 2000 }, { shot: "02-select" },              // detective outfits!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // FAKE PROFILE telegraph
    { wait: 2400 },
    { shot: "04-play-taptell" },                        // round 1 board
    { click: "Plays racing games" },                    // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-panel" },
    { click: "Got it!" },
    { click: "Joined YESTERDAY" },                      // round 1 tell
    { wait: 1400 }, { shot: "06-taptell-round2" },
    { click: "0 friends you know" },                    // round 2 tell
    { wait: 1400 },
    { click: "Photo stolen from a poster" },            // round 3 tell → playDone
    { wait: 1600 }, { shot: "07-weakpoint-1" },         // CORE EXPOSED
    { click: "Too friendly too fast - a fake-profile tell" },
    { wait: 1300 }, { shot: "08-gear-popped" },         // phaseClear
    { wait: 3000 },                                     // → announce P2 mid-window
    { shot: "09-announce-trick2" },
    { wait: 2200 },                                     // → play mounted
    { shot: "10-play-countercard" },                    // SECRET ASK cards
    { click: "TELL A GROWN-UP" },
    { wait: 1700 },
    { click: "Safe friends never need secrets from your grown-ups" }, // weak point 2
    { wait: 4300 },                                     // clear + → announce P3
    { shot: "11-announce-trick3" },
    { wait: 2200 },
    { shot: "12-play-shieldhold" },                     // MEET-UP TRAP barrage
    { hold: "HOLD THE SHIELD", ms: 6800 },              // burn it out
    { wait: 400 }, { shot: "13-burnout" },
    { wait: 1800 }, { shot: "14-weakpoint-3" },
    { click: "Never meet - and tell a grown-up" },
    { wait: 3900 },                                     // gear 3 clear → wobbling
    { shot: "15-wobbling" },
    { wait: 1700 },                                     // → finisher mounted
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE SPOTLIGHT", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },
    { wait: 2200 }, { shot: "18-victory" },
    // PILOT FEEDBACK flow: fight -> outro video -> badge scene -> debrief.
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  4: [
    { wait: 3000 }, { shot: "01-entrance" },            // BAIT CASTER nameplate
    { wait: 2000 }, { shot: "02-select" },              // fisher raincoats!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // FAKE PRIZE telegraph
    { wait: 2400 },
    { shot: "04-play-deflect" },                        // first item: V-BUCKS bait
    { click: "CUT IT LOOSE!" },                         // correct: act on bait
    { wait: 1400 },                                     // → Grandma's postcard
    { click: "CUT IT LOOSE!" },                         // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-panel" },
    { click: "Got it!" },
    { click: "REEL IT IN" },                            // correct: pass Grandma
    { wait: 1400 },
    { click: "CUT IT LOOSE!" },                         // FREE iPhone bait
    { wait: 1400 },
    { click: "REEL IT IN" },                            // school letter
    { wait: 1400 },
    { click: "CUT IT LOOSE!" },                         // visitor 1,000,000
    { wait: 1400 },
    { click: "REEL IT IN" },                            // in-app update → playDone
    { wait: 1600 }, { shot: "06-weakpoint-1" },
    { click: "Bait - too good to be true" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // COUNTDOWN SCARE
    { wait: 2200 },
    { shot: "09-play-shieldhold" },
    { hold: "HOLD THE CALM", ms: 6800 },
    { wait: 400 }, { shot: "10-burnout" },              // clock hits zero, nothing
    { wait: 1800 }, { shot: "11-weakpoint-2" },
    { click: "A racing heart doesn't stop to think" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // LOOKALIKE
    { wait: 2200 },
    { shot: "13-play-taptell" },
    { click: "Has the red logo" },                      // deliberate wrong → teach
    { wait: 700 }, { shot: "14-teach-lookalike" },
    { click: "Got it!" },
    { click: "That O is a ZERO" },                      // round 1 tell
    { wait: 1400 }, { shot: "15-taptell-round2" },
    { click: "Sent from prizes-4u.biz" },               // round 2 tell → playDone
    { wait: 1600 }, { shot: "16-weakpoint-3" },
    { click: "R0BLOX Rewards - gift@roblox-rewards.club" },
    { wait: 3900 },
    { shot: "17-wobbling" },
    { wait: 1700 },
    { shot: "18-finisher-ring" },
    { hold: "CHARGE THE SCAM STAMP", ms: 5600, shotDuring: "18b-charging" },
    { wait: 800 }, { shot: "19-payoff" },               // STAMPED: SCAM!
    { wait: 2200 }, { shot: "20-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "21-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "22-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "23-debrief" },
  ],
  5: [
    { wait: 3000 }, { shot: "01-entrance" },            // ECHO MACHINE nameplate
    { wait: 2000 }, { shot: "02-select" },              // artist overalls!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // PILE-ON telegraph
    { wait: 2400 },
    { shot: "04-play-countercard" },
    { click: "Just watch quietly" },                    // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-panel" },
    { click: "Got it!" },
    { click: "STAND BY THE KID" },                      // upstander card
    { wait: 1700 }, { shot: "06-weakpoint-1" },
    { click: "More people joining in - so don't" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // MEAN ECHO
    { wait: 2200 },
    { shot: "09-play-deflect" },                        // first echo bubble
    { click: "MUTE IT" },                               // echo-build ✓
    { wait: 1400 },
    { click: "MUTE IT" },                               // deliberate wrong on reply-caps
    { wait: 700 }, { shot: "10-teach-echo" },
    { click: "Got it!" },
    { click: "LET IT DRIFT" },                          // reply-caps ✓
    { wait: 1400 },
    { click: "MUTE IT" },                               // echo-team ✓
    { wait: 1400 },
    { click: "LET IT DRIFT" },                          // reply-comeback ✓
    { wait: 1400 },
    { click: "MUTE IT" },                               // echo-quit ✓
    { wait: 1400 },
    { click: "LET IT DRIFT" },                          // reply-meaner ✓ → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "It feeds the fire and makes it all worse" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // LONELY CLOUD
    { wait: 2200 },
    { shot: "13-play-orderstrike" },
    { click: "DON'T REPLY" },
    { wait: 900 },
    { click: "KEEP the mean message" },
    { wait: 900 },
    { click: "TELL a grown-up" },                       // → playDone
    { wait: 1600 }, { shot: "14-weakpoint-3" },
    { click: "No - telling is how the hurting stops" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE COLOR WAVE", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // THE WALL BLOOMS!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  6: [
    { wait: 3000 }, { shot: "01-entrance" },            // LOBBY PHANTOM nameplate
    { wait: 2000 }, { shot: "02-select" },              // esports jerseys!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // INFO FISHING telegraph
    { wait: 2400 },
    { shot: "04-play-deflect" },                        // chat item 1: school ask
    { click: "SHUT IT DOWN!" },                         // school ✓
    { wait: 1400 },
    { click: "SHUT IT DOWN!" },                         // deliberate wrong on 'GG!'
    { wait: 700 }, { shot: "05-teach-panel" },
    { click: "Got it!" },
    { click: "GAME TALK - OK" },                        // gg ✓
    { wait: 1400 },
    { click: "SHUT IT DOWN!" },                         // home alone ✓
    { wait: 1400 },
    { click: "GAME TALK - OK" },                        // rematch ✓
    { wait: 1400 },
    { click: "SHUT IT DOWN!" },                         // real name ✓
    { wait: 1400 },
    { click: "GAME TALK - OK" },                        // tactic ✓ → playDone
    { wait: 1600 }, { shot: "06-weakpoint-1" },
    { click: "Game talk - tactics and rematches" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // SNEAK-OUT CHAT
    { wait: 2200 },
    { shot: "09-play-countercard" },
    { click: "STAY WHERE THE GUARDS ARE" },
    { wait: 1700 }, { shot: "10-weakpoint-2" },
    { click: "Rules, mods and report buttons can't follow them" },
    { wait: 4300 },
    { shot: "11-announce-trick3" },                     // FREE-MOD TRAP
    { wait: 2200 },
    { shot: "12-play-taptell" },
    { click: "It glows really bright" },                // deliberate wrong → teach
    { wait: 700 }, { shot: "13-teach-parcel" },
    { click: "Got it!" },
    { click: "NOT from the game's shop" },              // round 1 tell
    { wait: 1400 },
    { click: "Asks for your PASSWORD" },                // round 2 tell
    { wait: 1400 },
    { click: "'UNLIMITED everything, forever!'" },      // round 3 tell → playDone
    { wait: 1600 }, { shot: "14-weakpoint-3" },
    { click: "The account isn't yours anymore" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE REPORT BUTTON", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // PHANTOM REPORTED!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  7: [
    { wait: 3000 }, { shot: "01-entrance" },            // COIN VACUUM nameplate
    { wait: 2000 }, { shot: "02-select" },              // vault-guard uniforms!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // LEFT-OUT BUNDLE telegraph
    { wait: 2400 },
    { shot: "04-play-shieldhold" },                     // FOMO siren rages
    { hold: "HOLD THE WALLET SHUT", ms: 6800 },
    { wait: 400 }, { shot: "05-burnout" },              // ...and it RELISTS
    { wait: 1800 }, { shot: "06-weakpoint-1" },
    { click: "The rush trick - fast buyers don't think" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // LOOT GAMBLE
    { wait: 2200 },
    { shot: "09-play-taptell" },
    { click: "It sparkles like crazy" },                // deliberate wrong → teach
    { wait: 700 }, { shot: "10-teach-lootbox" },
    { click: "Got it!" },
    { click: "Tiny tag: '1-in-100 chance'" },           // round 1 tell
    { wait: 1400 },
    { click: "Boxes have NO memory" },                  // round 2 tell
    { wait: 1400 },
    { click: "'Almost' is DESIGNED to sell more" },     // round 3 tell → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "Exactly the same as box 1" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // FREE-COIN TRAP
    { wait: 2200 },
    { shot: "13-play-deflect" },
    { click: "SPRING THE TRAP!" },                      // generator ✓
    { wait: 1400 },
    { click: "SPRING THE TRAP!" },                      // deliberate wrong on demo
    { wait: 700 }, { shot: "14-teach-free" },
    { click: "Got it!" },
    { click: "TRULY FREE - OK" },                       // demo ✓
    { wait: 1400 },
    { click: "SPRING THE TRAP!" },                      // card ask ✓
    { wait: 1400 },
    { click: "TRULY FREE - OK" },                       // free weekend ✓
    { wait: 1400 },
    { click: "SPRING THE TRAP!" },                      // password ask ✓
    { wait: 1400 },
    { click: "TRULY FREE - OK" },                       // login star ✓ → playDone
    { wait: 1600 }, { shot: "15-weakpoint-3" },
    { click: "Your account" },
    { wait: 3900 },
    { shot: "16-wobbling" },
    { wait: 1700 },
    { shot: "17-finisher-ring" },
    { hold: "CHARGE THE PIGGY-BANK LOCK", ms: 5600, shotDuring: "17b-charging" },
    { wait: 800 }, { shot: "18-payoff" },               // COINS RAINED BACK!
    { wait: 2200 }, { shot: "19-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "20-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "21-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "22-debrief" },
  ],
  8: [
    { wait: 3000 }, { shot: "01-entrance" },            // SNAPSHOT CLAW nameplate
    { wait: 2000 }, { shot: "02-select" },              // photographer vests!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // COPY PIGEONS telegraph
    { wait: 2400 },
    { shot: "04-play-shieldhold" },                     // SHARE gale rages
    { hold: "HOLD THE CAGE DOOR", ms: 6800 },
    { wait: 400 }, { shot: "05-burnout" },
    { wait: 1800 }, { shot: "06-weakpoint-1" },
    { click: "Only YOUR copy disappears" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // CLUE LEAK
    { wait: 2200 },
    { shot: "09-play-taptell" },
    { click: "Your big smile" },                        // deliberate wrong → teach
    { wait: 700 }, { shot: "10-teach-clue" },
    { click: "Got it!" },
    { click: "The school CREST on the shirt" },         // round 1 tell
    { wait: 1400 },
    { click: "The STREET SIGN behind you" },            // round 2 tell
    { wait: 1400 },
    { click: "The banner with your NAME and AGE" },     // round 3 tell → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "Together they're a stranger's map to you" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // SNEAKY SNAP
    { wait: 2200 },
    { shot: "13-play-countercard" },
    { click: "Snap it and post it" },                   // deliberate wrong → teach
    { wait: 700 }, { shot: "14-teach-snap" },
    { click: "Got it!" },
    { click: "ASK THEM FIRST" },
    { wait: 1700 }, { shot: "15-weakpoint-3" },
    { click: "Keep it - just-for-me means just-for-me" },
    { wait: 3900 },
    { shot: "16-wobbling" },
    { wait: 1700 },
    { shot: "17-finisher-ring" },
    { hold: "CHARGE THE GOLDEN FRAME", ms: 5600, shotDuring: "17b-charging" },
    { wait: 800 }, { shot: "18-payoff" },               // NOTHING TO STEAL!
    { wait: 2200 }, { shot: "19-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "20-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "21-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "22-debrief" },
  ],
  9: [
    { wait: 3000 }, { shot: "01-entrance" },            // COPYCAT CANNON nameplate
    { wait: 2000 }, { shot: "02-select" },              // inspector aprons!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // COPYCAT APP telegraph
    { wait: 2400 },
    { shot: "04-play-deflect" },                        // Blast Birdz incoming
    { click: "ZAP THE COPYCAT!" },                      // birdz ✓
    { wait: 1400 },
    { click: "ZAP THE COPYCAT!" },                      // deliberate wrong on real Birds
    { wait: 700 }, { shot: "05-teach-panel" },
    { click: "Got it!" },
    { click: "REAL - SHELVE IT" },                      // birds ✓
    { wait: 1400 },
    { click: "ZAP THE COPYCAT!" },                      // Pixel Pets FREE ✓
    { wait: 1400 },
    { click: "REAL - SHELVE IT" },                      // Pixel Pets ✓
    { wait: 1400 },
    { click: "ZAP THE COPYCAT!" },                      // R0bo ✓
    { wait: 1400 },
    { click: "REAL - SHELVE IT" },                      // Robo ✓ → playDone
    { wait: 1600 }, { shot: "06-weakpoint-1" },
    { click: "A copycat in a costume" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // PERMISSION GRAB
    { wait: 2200 },
    { shot: "09-play-taptell" },
    { click: "Turn the light ON and OFF" },             // deliberate wrong → teach
    { wait: 700 }, { shot: "10-teach-keys" },
    { click: "Got it!" },
    { click: "See YOUR CONTACTS" },                     // row 1 greedy
    { wait: 1400 },
    { click: "Track YOUR LOCATION" },                   // row 2 greedy
    { wait: 1400 },
    { click: "Listen with YOUR MICROPHONE" },           // row 3 greedy → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "Block them - its job only needs the light" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // FAKE FREE
    { wait: 2200 },
    { shot: "13-play-countercard" },
    { click: "FLIP THE TAG - check what it costs inside" },
    { wait: 1700 }, { shot: "14-weakpoint-3" },
    { click: "Your time and attention" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE HIGH-FIVE", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // SHUTTERS DOWN!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  10: [
    { wait: 3000 }, { shot: "01-entrance" },            // WHIRLPOOL ROOM nameplate
    { wait: 2000 }, { shot: "02-select" },              // life-vest rescue gear!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // AUTOPLAY BELT telegraph
    { wait: 2400 },
    { shot: "04-play-shieldhold" },                     // the belt pulls
    { hold: "HOLD THE PAUSE", ms: 6800, shotDuring: "04b-holding" },
    { wait: 400 }, { shot: "05-burnout" },              // the belt sparks out
    { wait: 1800 }, { shot: "06-weakpoint-1" },
    { click: "The autoplay machine" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // WILD CLAIM
    { wait: 2200 },
    { shot: "09-play-deflect" },                        // moon-cheese incoming
    { click: "ZAP THE WILD CLAIM!" },                   // cheese ✓
    { wait: 1400 },
    { click: "ZAP THE WILD CLAIM!" },                   // deliberate wrong on volcano doc
    { wait: 700 }, { shot: "10-teach-panel" },
    { click: "Got it!" },
    { click: "CHECKABLE - LET IT PASS" },               // volcano ✓
    { wait: 1400 },
    { click: "ZAP THE WILD CLAIM!" },                   // dogs-stairs ✓
    { wait: 1400 },
    { click: "CHECKABLE - LET IT PASS" },               // bread ✓
    { wait: 1400 },
    { click: "ZAP THE WILD CLAIM!" },                   // banned Fridays ✓
    { wait: 1400 },
    { click: "CHECKABLE - LET IT PASS" },               // museum ✓ → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "Weigh it against a real source" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // COMMENT HOOK
    { wait: 2200 },
    { shot: "13-play-countercard" },
    { click: "JUST WATCH - NEVER REPLY TO STRANGERS" },
    { wait: 1700 }, { shot: "14-weakpoint-3" },
    { click: "A fishing comment - never answer" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE BACK BUTTON", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // UP AND OUT!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  11: [
    { wait: 3000 }, { shot: "01-entrance" },            // BOULDER PRESS nameplate
    { wait: 2000 }, { shot: "02-select" },              // team-captain hoodies!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // BLAME BOULDER telegraph
    { wait: 2400 },
    { shot: "04-play-countercard" },
    { click: "Maybe a little bit my fault" },           // deliberate wrong → gentle teach
    { wait: 700 }, { shot: "05-teach-panel" },
    { click: "Got it!" },
    { click: "THE SENDER CHOSE TO SEND IT - NEVER MY FAULT" },
    { wait: 1700 }, { shot: "06-weakpoint-1" },
    { click: "Theirs - they chose to send it" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // SECRET WEIGHT
    { wait: 2200 },
    { shot: "09-play-taptell" },                        // the sagging backpack
    { click: "My spelling homework" },                  // deliberate wrong → teach
    { wait: 700 }, { shot: "10-teach-weights" },
    { click: "Got it!" },
    { click: "A mean message I never told anyone about" },
    { wait: 1400 },
    { click: "A game chat that made me feel weird" },
    { wait: 1400 },
    { click: "A picture someone said to keep secret" }, // → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "Carrying it alone grows the worry - telling shares the weight" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // DELETE TRICK
    { wait: 2200 },
    { shot: "13-play-orderstrike" },                    // camera BEFORE door
    { click: "STOP - don't reply" },
    { wait: 900 },
    { click: "SCREENSHOT - freeze the proof" },
    { wait: 900 },
    { click: "BLOCK the sender" },
    { wait: 900 },
    { click: "TELL your team" },                        // → playDone
    { wait: 1600 }, { shot: "14-weakpoint-3" },
    { click: "Screenshot - freeze the proof" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE TEAM BEACON", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // TEAM LIT!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  12: [
    { wait: 3000 }, { shot: "01-entrance" },            // TRACK HOUND nameplate
    { wait: 2000 }, { shot: "02-select" },              // winter ranger parkas!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // RAGE BAIT telegraph
    { wait: 2400 },
    { shot: "04-play-shieldhold" },                     // the rage-post burns
    { hold: "HOLD THE MIRROR-SHIELD", ms: 6800, shotDuring: "04b-holding" },
    { wait: 400 }, { shot: "05-burnout" },              // the rage fizzles cold
    { wait: 1800 }, { shot: "06-weakpoint-1" },
    { click: "Will future-me smile at this track?" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // COPY SNOWBALL
    { wait: 2200 },
    { shot: "09-play-countercard" },                    // the teetering snowball
    { click: "Push it - it's only a tiny snowball" },   // deliberate wrong → teach
    { wait: 700 }, { shot: "10-teach-snowball" },
    { click: "Got it!" },
    { click: "THINK BEFORE YOU ROLL - COPIES NEVER COME BACK" },
    { wait: 1700 }, { shot: "11-weakpoint-2" },
    { click: "They keep rolling - delete only cleans YOUR snow" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // TRAIL TRAP
    { wait: 2200 },
    { shot: "13-play-deflect" },                        // tracks light the ridge
    { click: "SWEEP THE POINTY TRACK!" },               // bio ✓
    { wait: 1400 },
    { click: "SWEEP THE POINTY TRACK!" },               // deliberate wrong on the dragon
    { wait: 700 }, { shot: "14-teach-golden" },
    { click: "Got it!" },
    { click: "GOLDEN TRACK - LET IT SHINE" },           // dragon ✓ (it stays!)
    { wait: 1400 },
    { click: "SWEEP THE POINTY TRACK!" },               // Friday pattern ✓
    { wait: 1400 },
    { click: "GOLDEN TRACK - LET IT SHINE" },           // kind goal comment ✓
    { wait: 1400 },
    { click: "SWEEP THE POINTY TRACK!" },               // front-door photo ✓
    { wait: 1400 },
    { click: "GOLDEN TRACK - LET IT SHINE" },           // marble-run ✓ → playDone
    { wait: 1600 }, { shot: "15-weakpoint-3" },
    { click: "a pattern a stranger can use" },
    { wait: 3900 },
    { shot: "16-wobbling" },
    { wait: 1700 },
    { shot: "17-finisher-ring" },
    { hold: "CHARGE THE SHREDDER", ms: 5600, shotDuring: "17b-charging" },
    { wait: 800 }, { shot: "18-payoff" },               // MAP SHREDDED!
    { wait: 2200 }, { shot: "19-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "20-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "21-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "22-debrief" },
  ],
};

const steps = STEPS[week];
if (!steps) {
  console.error(`No playthrough script for week ${week} yet.`);
  process.exit(1);
}
mkdirSync(out, { recursive: true });

// Seed + login (same flow as _week-sweep.mjs).
const api = await request.newContext({ baseURL: base });
const seedRes = await api.post("/api/test/seed");
if (!seedRes.ok()) {
  console.error(`seed failed (${seedRes.status()}): ${await seedRes.text()}`);
  process.exit(1);
}
await api.dispose();

const browser = await chromium.launch(launchOpts);
const context = await browser.newContext({ baseURL: base, viewport: { width: vw, height: vh } });
await context.addCookies([
  { name: "site_auth", value: "true", domain: new URL(base).hostname, path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
]);
const page = await context.newPage();
page.on("dialog", (d) => d.dismiss().catch(() => {}));
await page.goto(`${base}/login`, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForSelector("#login-email", { timeout: 20000 });
await page.waitForTimeout(1200);
let authed = false;
for (let attempt = 0; attempt < 3 && !authed; attempt++) {
  await page.locator("#login-email").fill(TEST_EMAIL);
  await page.locator("#login-password").fill(TEST_PASSWORD);
  await page.locator("#login-password").press("Enter");
  for (let i = 0; i < 40 && !authed; i++) {
    authed = (await context.cookies()).some((c) => c.name.includes("authjs.session-token"));
    if (!authed) await page.waitForTimeout(250);
  }
  if (!authed) await page.reload({ waitUntil: "networkidle" }).catch(() => {});
}
if (!authed) {
  console.error("login failed");
  process.exit(1);
}

// Enter the boss screen (auto-enters the fight on landing).
await page.goto(`${base}/lesson/${week}?screen=24`, { waitUntil: "domcontentloaded" });

let shots = 0;
for (const step of steps) {
  try {
    if (step.wait) await page.waitForTimeout(step.wait);
    if (step.shot) {
      await page.screenshot({ path: `${out}/${step.shot}.png` });
      shots++;
      console.log(`shot ${step.shot}`);
    }
    // force: true — game buttons pulse forever (framer scale loops), so
    // Playwright's stability check would never pass.
    if (step.click) {
      await page.getByText(step.click, { exact: false }).first().click({ timeout: 8000, force: true });
      console.log(`click "${step.click}"`);
    }
    if (step.clickLabel) {
      await page.getByLabel(step.clickLabel).first().click({ timeout: 8000, force: true });
      console.log(`click [${step.clickLabel}]`);
    }
    if (step.hold) {
      const el = page.getByText(step.hold, { exact: false }).first();
      const box = await el.boundingBox();
      if (!box) throw new Error(`no box for "${step.hold}"`);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      if (step.shotDuring) {
        await page.waitForTimeout(Math.round(step.ms / 2));
        await page.screenshot({ path: `${out}/${step.shotDuring}.png` });
        shots++;
        console.log(`shot ${step.shotDuring} (mid-hold)`);
        await page.waitForTimeout(step.ms - Math.round(step.ms / 2));
      } else {
        await page.waitForTimeout(step.ms);
      }
      await page.mouse.up();
      console.log(`held "${step.hold}" for ${step.ms}ms`);
    }
  } catch (err) {
    console.error(`STEP FAILED ${JSON.stringify(step)}: ${err.message}`);
    await page.screenshot({ path: `${out}/FAILED-${shots}.png` }).catch(() => {});
    break;
  }
}

await browser.close();
console.log(`\nDone: ${shots} shots -> ${out}`);
