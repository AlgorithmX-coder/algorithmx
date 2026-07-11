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
  // W1 VaultBoss full playthrough (rewrap QA): locksmith outfits, no
  // mid-fight narrator, Sarah vault-victory, Password Protector badge.
  1: [
    { wait: 3000 }, { shot: "01-entrance" },
    { wait: 2000 }, { shot: "02-select" },              // locksmith outfits!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-wall" },
    { wait: 2400 }, { shot: "04-play-wall" },
    { click: "dragon" },
    { wait: 900 },
    { click: "taco" },
    { wait: 900 },
    { click: "comet" },                                 // wall built → phaseClear
    { wait: 1800 }, { shot: "05-phase-clear" },
    { wait: 2400 }, { shot: "06-announce-scrambler" },
    { wait: 2000 }, { shot: "07-play-scrambler" },
    { click: "BIG letters" },
    { wait: 900 },
    { click: "A number" },
    { wait: 900 },
    { click: "A symbol" },                              // decoder kaboom
    { wait: 800 }, { shot: "08-decoder-kaboom" },
    { wait: 3600 }, { shot: "09-announce-cover" },
    // No pre-hold play shot: at 2560x1440 a screenshot costs ~2s, and the
    // ones between phase mount and the press pushed mouse.down past spy-eye
    // 1's open window — "He peeked!" fired at an untouched button and the
    // teach modal dead-ended the run. Press the moment the button mounts
    // (the hold locator waits for it); the mid-hold shot documents the
    // phase. 24.5s spans all 3 snoops (last closes ≈22.8s after mount) and
    // releases inside the phase-clear window.
    { hold: "HOLD TO COVER", ms: 24500, shotDuring: "10-covering", engagedWhenGone: true },
    { wait: 600 }, { shot: "11-phase-clear-cover" },
    { wait: 2400 }, { shot: "12-announce-feed" },
    { wait: 2200 }, { shot: "13-play-feed" },
    { click: "123456" },
    { wait: 1000 },
    { clickExact: "password" },                         // header says "Passwords:"
    { wait: 1000 },
    { click: "qwerty" },                                // Guess-o-Tron overload
    { wait: 800 }, { shot: "14-guessotron-full" },
    { wait: 3600 }, { shot: "15-announce-final" },
    { wait: 2400 }, { shot: "16-play-final" },
    { hold: "HOLD TO FORGE", ms: 4800, shotDuring: "16b-forging", engagedWhenGone: true },
    { wait: 1300 }, { shot: "17-sweet-talk" },
    { click: "Never! It's secret!" },
    // 2400 raced the phaseClear→victory hop (2600ms) and shot the tail of
    // PHASE CLEAR at both viewports; 4800 clears the hop AND the victory
    // column's 0.5s-delayed entrance.
    { wait: 4800 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },         // Password Protector medal
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  // W2 ProfileForgeBoss full playthrough (rewrap QA): blacksmith forge
  // aprons, Sarah forge-victory, Privacy Guardian badge. LAYLA week.
  2: [
    { wait: 3000 }, { shot: "01-entrance" },            // THE PROFILE FORGE slam
    { wait: 2000 }, { shot: "02-select" },              // forge-apron outfits!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-whack" },
    { wait: 2400 }, { shot: "04-play-whack" },          // wave 1 launching
    { click: "42 Rainbow Road" },                       // private → WHACK
    { wait: 2600 },
    { click: "Maple Hill School" },                     // private → WHACK
    { wait: 2000 }, { shot: "05-whack-wave1" },         // "Loves blue" flying to dock
    { wait: 10500 },
    { click: "555-0123" },                              // wave 2: private
    // Shot mid-wave-2, NOT at the wave-3 transition: a 2560x1440 screenshot
    // costs ~2.5s, and capturing while the FINAL WAVE timers are being
    // scheduled froze the wave (banner stuck, flyers never launched).
    { wait: 600 }, { shot: "06-whack-wave2" },
    { click: "Alex Morgan Reed" },                      // wave 2: private
    { wait: 8000 },
    { click: "At the park right now" },                 // final wave: private
    { wait: 4500 }, { shot: "07-whack-endgame" },       // "Draws dragons" docking
    { wait: 3000 }, { shot: "08-phase-clear-whack" },
    { wait: 2600 }, { shot: "09-announce-hand" },
    { wait: 2400 }, { shot: "10-play-hand" },           // six dealt cards
    { click: "Pizza fan" },
    { wait: 900 },
    { click: "Dragon artist" },
    { wait: 900 },
    { click: "Space Racers superfan" },                 // 3/3 safe picked
    { wait: 1400 }, { shot: "11-phase-clear-hand" },
    { wait: 2600 }, { shot: "12-announce-grill" },
    { wait: 2400 }, { shot: "13-play-grill" },          // "security bot" demand
    { click: "WHY?" },
    { wait: 1100 },
    { click: "WHY?" },
    { wait: 1100 },
    { click: "WHY?" },                                  // bot collapses
    { wait: 800 }, { shot: "14-bot-collapse" },
    { wait: 1600 }, { shot: "15-phase-clear-grill" },
    { wait: 2600 }, { shot: "16-announce-assemble" },
    { wait: 2400 }, { shot: "17-play-assemble" },       // tile pile w/ trap tiles
    { click: "Comet" },
    { wait: 900 },
    { click: "Wizard" },
    { wait: 900 },
    // exact — the score readout can contain "77" (e.g. SCORE 2775)
    { clickExact: "77" },
    { wait: 900 }, { shot: "18-name-sealed" },          // CometWizard77 — SEALED!
    { wait: 1700 }, { shot: "19-phase-clear-assemble" },
    { wait: 2600 }, { shot: "20-announce-rapid" },
    // Click demand 1 straight off the announce shot: the 7s rapid timer
    // starts at play-mount, and two wide screenshots (~2.5s each) before
    // the first click guarantee a "Too slow!" timeout. Shots ride BETWEEN
    // clicks instead — each demand's timer restarts on advance.
    // exact — the phase hint contains "NOPE the private ones, SHARE the
    // safe ones", so substring clicks would hit the hint text first.
    { clickExact: "✋ NOPE!" },                          // school → NOPE
    { wait: 600 }, { shot: "21-play-rapid" },
    { wait: 600 },
    { clickExact: "💬 SHARE" },                         // favorite color → safe
    { wait: 600 }, { shot: "22-rapid-fire" },
    { wait: 600 },
    { clickExact: "✋ NOPE!" },                          // street → NOPE
    { wait: 1200 },
    { clickExact: "💬 SHARE" },                         // best game → safe
    { wait: 1200 },
    { clickExact: "✋ NOPE!" },                          // birthday → NOPE
    { wait: 1200 },
    { clickExact: "✋ NOPE!" },                          // "grown-up said yes" → NOPE
    { wait: 1600 }, { shot: "23-phase-clear-rapid" },
    { wait: 2800 }, { shot: "24-victory" },             // blank intel report + Sarah
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "25-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "26-badge-scene" },         // Privacy Guardian medal
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "27-debrief" },
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
  13: [
    { wait: 3000 }, { shot: "01-entrance" },            // BATTERY LEECH nameplate
    { wait: 2000 }, { shot: "02-select" },              // pajama heroes!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // ONE MORE EPISODE telegraph
    { wait: 2400 },
    { shot: "04-play-shieldhold" },                     // the auto-next spiral
    { hold: "YOU CHOOSE THE ENDING", ms: 6800, shotDuring: "04b-holding" },
    { wait: 400 }, { shot: "05-burnout" },              // credits roll
    { wait: 1800 }, { shot: "06-weakpoint-1" },
    { click: "They're built that way - so YOU choose the ending" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // UNDER-THE-COVERS SCREEN
    { wait: 2200 },
    { shot: "09-play-taptell" },                        // the dark bedroom
    { click: "A teddy bear on the pillow" },            // deliberate wrong → teach
    { wait: 700 }, { shot: "10-teach-glow" },
    { click: "Got it!" },
    { click: "A tablet hiding under the duvet" },
    { wait: 1400 },
    { click: "A game screen tucked under the pillow" },
    { wait: 1400 },
    { click: "A screen still streaming behind the curtain" }, // → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "In the charging garage, outside the bedroom" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // BATTERY DRAIN
    { wait: 2200 },
    { shot: "13-play-deflect" },                        // refills vs drains
    { click: "DRAIN - LET IT BOUNCE" },                 // deliberate wrong on sleep
    { wait: 700 }, { shot: "14-teach-refill" },
    { click: "Got it!" },
    { click: "CATCH THE REFILL!" },                     // sleep ✓
    { wait: 1400 },
    { click: "DRAIN - LET IT BOUNCE" },                 // one more episode ✓
    { wait: 1400 },
    { click: "CATCH THE REFILL!" },                     // catch outside ✓
    { wait: 1400 },
    { click: "DRAIN - LET IT BOUNCE" },                 // muted cartoons ✓
    { wait: 1400 },
    { click: "CATCH THE REFILL!" },                     // board games ✓
    { wait: 1400 },
    { click: "DRAIN - LET IT BOUNCE" },                 // midnight scroll ✓ → playDone
    { wait: 1600 }, { shot: "15-weakpoint-3" },
    { click: "Sleep, snacks, moving and your people" },
    { wait: 3900 },
    { shot: "16-wobbling" },
    { wait: 1700 },
    { shot: "17-finisher-ring" },
    { hold: "CHARGE THE POWER-DOWN", ms: 5600, shotDuring: "17b-charging" },
    { wait: 800 }, { shot: "18-payoff" },               // POWERED DOWN!
    { wait: 2200 }, { shot: "19-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "20-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "21-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "22-debrief" },
  ],
  14: [
    { wait: 3000 }, { shot: "01-entrance" },            // LISTENING POST nameplate
    { wait: 2000 }, { shot: "02-select" },              // settings-scout vests!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // THE LONG EAR telegraph
    { wait: 2400 },
    { shot: "04-play-taptell" },                        // rooms slide past
    { click: "A teddy bear flopped on the sofa" },      // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-ears" },
    { click: "Got it!" },
    { click: "The smart speaker - its ring is glowing" },
    { wait: 1400 },
    { click: "The smart display on the counter" },
    { wait: 1400 },
    { click: "Robo-Pup - he answers when you call him" }, // → playDone
    { wait: 1600 }, { shot: "06-weakpoint-1" },
    { click: "Hearing its name" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // GLASS EYE
    { wait: 2200 },
    { shot: "09-play-deflect" },                        // glints in the dark
    { click: "THAT'S A LENS - SPOT IT!" },              // doorbell ✓
    { wait: 1400 },
    { click: "THAT'S A LENS - SPOT IT!" },              // deliberate wrong on fairy lights
    { wait: 700 }, { shot: "10-teach-twinkle" },
    { click: "Got it!" },
    { click: "JUST A TWINKLE - LET IT GLOW" },          // fairy lights ✓
    { wait: 1400 },
    { click: "THAT'S A LENS - SPOT IT!" },              // toy robot lens ✓
    { wait: 1400 },
    { click: "JUST A TWINKLE - LET IT GLOW" },          // fireflies ✓
    { wait: 1400 },
    { click: "THAT'S A LENS - SPOT IT!" },              // mystery camera ✓
    { wait: 1400 },
    { click: "JUST A TWINKLE - LET IT GLOW" },          // glitter sticker ✓ → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "The doorbell lens watching the front step" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // MEGAPHONE MOUTH
    { wait: 2200 },
    { shot: "13-play-countercard" },                    // the lit speaker ring
    { click: "WHISPER IT IN ANOTHER ROOM" },
    { wait: 1700 }, { shot: "14-weakpoint-3" },
    { click: "On paper, in a whisper away, or in another room" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE MASTER SWITCH", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // UNPLUGGED!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  15: [
    { wait: 3000 }, { shot: "01-entrance" },            // KNOW-IT-ALL 9000 nameplate
    { wait: 2000 }, { shot: "02-select" },              // reporter caps!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // CONFIDENT FIB telegraph
    { wait: 2400 },
    { shot: "04-play-taptell" },                        // three "facts", one fib
    { click: "Volcanoes are mountains with melted rock inside" }, // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-book" },
    { click: "Got it!" },
    { click: "Volcanoes spray ice cream in winter" },
    { wait: 1400 },
    { click: "Spiders build webs out of spaghetti" },
    { wait: 1400 },
    { click: "The moon is stored indoors at night" },   // → playDone
    { wait: 1600 }, { shot: "06-weakpoint-1" },
    { click: "Check a real source anyway" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // FRIENDLY ROBOT
    { wait: 2200 },
    { shot: "09-play-countercard" },                    // "Bestie!! What's your school?"
    { click: "ZIP IT - A TOOL DOESN'T NEED THAT" },
    { wait: 1700 }, { shot: "10-weakpoint-2" },
    { click: "Zip it - bots don't need that to help" },
    { wait: 4300 },
    { shot: "11-announce-trick3" },                     // SIX-FINGER FAKE
    { wait: 2200 },
    { shot: "12-play-deflect" },                        // the photo parade
    { click: "REAL PHOTO - LET IT PASS" },              // deliberate wrong on six fingers
    { wait: 700 }, { shot: "13-teach-fingers" },
    { click: "Got it!" },
    { click: "FAKE - ZAP IT!" },                        // six-finger hand ✓
    { wait: 1400 },
    { click: "REAL PHOTO - LET IT PASS" },              // crooked candles ✓
    { wait: 1400 },
    { click: "FAKE - ZAP IT!" },                        // melted banner ✓
    { wait: 1400 },
    { click: "REAL PHOTO - LET IT PASS" },              // blurry zoomies ✓
    { wait: 1400 },
    { click: "FAKE - ZAP IT!" },                        // backwards shadows ✓
    { wait: 1400 },
    { click: "REAL PHOTO - LET IT PASS" },              // class photo ✓ → playDone
    { wait: 1600 }, { shot: "14-weakpoint-3" },
    { click: "A hand with six fingers" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE TOOL STAMP", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // A TOOL, NOT A FRIEND!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  16: [
    { wait: 3000 }, { shot: "01-entrance" },            // PAINT SHOP nameplate
    { wait: 2000 }, { shot: "02-select" },              // inspector vests!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // PAINTED DOOR telegraph
    { wait: 2400 },
    { shot: "04-play-taptell" },                        // three doors, one lying sign
    { click: "Sign: CUTE PUPPIES - plaque reads cute-puppies.com" }, // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-match" },
    { click: "Got it!" },
    { click: "Sign: CUTE PUPPIES - plaque reads prize-grab.win" },   // lying sign ✓
    { wait: 1400 },
    { click: "Sign: CLASS PHOTOS - plaque reads foto-prize.biz" },   // ✓
    { wait: 1400 },
    { click: "Sign: KID GAMES - plaque reads k1dgames.com" },        // ✓ → playDone
    { wait: 1600 }, { shot: "06-weakpoint-1" },
    { click: "The plaque - paint can say anything at all" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // STICKY SWAP
    { wait: 2200 },
    { shot: "09-play-deflect" },                        // the QR peel-test
    { click: "PRINTED ON - LET IT STAY" },              // deliberate wrong on lifted corner
    { wait: 700 }, { shot: "10-teach-corner" },
    { click: "Got it!" },
    { click: "OVER-STICKER - PEEL IT!" },               // lifted corner ✓
    { wait: 1400 },
    { click: "PRINTED ON - LET IT STAY" },              // movie poster ✓
    { wait: 1400 },
    { click: "OVER-STICKER - PEEL IT!" },               // air bubble ✓
    { wait: 1400 },
    { click: "PRINTED ON - LET IT STAY" },              // pizza menu ✓
    { wait: 1400 },
    { click: "OVER-STICKER - PEEL IT!" },               // shiny-on-faded ✓
    { wait: 1400 },
    { click: "PRINTED ON - LET IT STAY" },              // zoo map ✓ → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "The one with a lifted corner and an air bubble" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // FROSTED LINK
    { wait: 2200 },
    { shot: "13-play-countercard" },                    // bit.ly/mystery-prize
    { click: "CAN'T SEE THROUGH? ASK A GROWN-UP" },
    { wait: 1700 }, { shot: "14-weakpoint-3" },
    { click: "Can't check it? A grown-up opens it, not you" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE BIG SHUTTER", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // SHOP CLOSED!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  17: [
    { wait: 3000 }, { shot: "01-entrance" },            // HALL OF MIRRORS nameplate
    { wait: 2000 }, { shot: "02-select" },              // knight armour!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // HIGHLIGHT REEL telegraph
    { wait: 2400 },
    { shot: "04-play-taptell" },                        // glossy posters, backstage truths
    { click: "Backstage: it really was sunny every single second" }, // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-reel" },
    { click: "Got it!" },
    { click: "Backstage: it rained all weekend - this was the ONE sunny minute" }, // ✓
    { wait: 1400 },
    { click: "Backstage: take 94 of 94 - the floor is covered in misses" },        // ✓
    { wait: 1400 },
    { click: "Backstage: a 6am alarm, an hour of fixing, and cold toast" },        // ✓ → playDone
    { wait: 1600 }, { shot: "06-weakpoint-1" },
    { click: "The one shiny minute - with the backstage cut out" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // FOLLOWER FLOOD
    { wait: 2200 },
    { shot: "09-play-deflect" },                        // the velvet heart-rope
    { click: "CLOSE THE ROPE!" },                       // deliberate wrong on cousin
    { wait: 700 }, { shot: "10-teach-cousin" },
    { click: "Got it!" },
    { click: "REAL FRIEND - COME UNDER" },              // cousin ✓
    { wait: 1400 },
    { click: "CLOSE THE ROPE!" },                       // talent scout ✓
    { wait: 1400 },
    { click: "REAL FRIEND - COME UNDER" },              // school friend ✓
    { wait: 1400 },
    { click: "CLOSE THE ROPE!" },                       // CoolGamer_9000 ✓
    { wait: 1400 },
    { click: "REAL FRIEND - COME UNDER" },              // grandma ✓
    { wait: 1400 },
    { click: "CLOSE THE ROPE!" },                       // fan club flood ✓ → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "No - a friend is someone you know in real life" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // OPEN MIRROR
    { wait: 2200 },
    { shot: "13-play-shieldhold" },                     // the frost-breath stand
    { hold: "FROST THE MIRROR", ms: 6800, shotDuring: "13b-frosting" },
    { wait: 1600 }, { shot: "14-weakpoint-3" },
    { click: "Friends and family you know - strangers get frosted glass" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE SHIELD RING", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // EVERY MIRROR DIMMED!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  18: [
    { wait: 3000 }, { shot: "01-entrance" },            // TAB GOBLIN nameplate
    { wait: 2000 }, { shot: "02-select" },              // pajama-hero locksmiths!
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // LEFT-OPEN TAB telegraph
    { wait: 2400 },
    { shot: "04-play-orderstrike" },                    // the Log-Out Relay, as a boss
    { click: "LOG OUT of the art app" },                // deliberate wrong (game comes first) → teach
    { wait: 700 }, { shot: "05-teach-relay" },
    { click: "Got it!" },
    { click: "LOG OUT of the game" },                   // ✓ relay leg 1
    { wait: 900 },
    { click: "LOG OUT of the art app" },                // ✓ relay leg 2
    { wait: 900 },
    { click: "LOG OUT of the chat" },                   // ✓ relay leg 3 → playDone
    { wait: 2000 }, { shot: "06-weakpoint-1" },
    { click: "Logging out - Home just hides the apps" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // SNEAKY PEEK
    { wait: 2200 },
    { shot: "09-play-countercard" },                    // sister's diary glows
    { click: "ONE TINY PEEK - IT WAS OPEN ANYWAY" },    // deliberate wrong → teach
    { wait: 700 }, { shot: "10-teach-peek" },
    { click: "Got it!" },
    { click: "DUST-AND-CLOSE - CLOSED CHESTS STAY CLOSED" }, // ✓
    { wait: 1700 }, { shot: "11-weakpoint-2" },
    { click: "Closes it without reading - and tells her" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // STICKY BALLOON
    { wait: 2200 },
    { shot: "13-play-deflect" },                        // balloons across the house
    { click: "POP IT - NO!" },                          // kitchen tablet ✓
    { wait: 1400 },
    { click: "ASK MOM FIRST" },                         // dinosaur-sticker tablet ✓
    { wait: 1400 },
    { click: "POP IT - NO!" },                          // library computer ✓
    { wait: 1400 },
    { click: "ASK MOM FIRST" },                         // birthday drawing pad ✓
    { wait: 1400 },
    { click: "POP IT - NO!" },                          // cousin's phone ✓
    { wait: 1400 },
    { click: "ASK MOM FIRST" },                         // own game player ✓ → playDone
    { wait: 1600 }, { shot: "14-weakpoint-3" },
    { click: "Pop it with a NO - shared screens never keep your keys" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE FORGE HAMMER", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // EVERY DOOR CLICKED SHUT!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  19: [
    { wait: 3000 }, { shot: "01-entrance" },            // HOUSE RATTLER nameplate
    { wait: 2000 }, { shot: "02-select" },              // family-crest cardigans!
    { clickLabel: "Play as ADAM" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // GRANDMA-TRAP TEXT telegraph
    { wait: 2400 },
    { shot: "04-play-taptell" },                        // sit with Grandma, tap the tells
    { click: "FastBank's own helpline" },               // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-tell" },
    { click: "Got it!" },
    { click: "A stranger: +44 7999 000111 in a bank costume" }, // ✓ round 1
    { wait: 1400 },
    { click: "The panic clock - real banks never race you" },  // ✓ round 2
    { wait: 1400 },
    { click: "'Acount' - real banks check their spelling" },   // ✓ round 3 → playDone
    { wait: 1600 }, { shot: "06-weakpoint-1" },
    { click: "Race you - a calm minute unmasks every trick" },
    { wait: 1300 }, { shot: "07-gear-popped" },
    { wait: 3000 },
    { shot: "08-announce-trick2" },                     // ROTARY RINGER
    { wait: 2200 },
    { shot: "09-play-deflect" },                        // supper-time calls on the tablet
    { click: "DECLINE THE MASK" },                      // deliberate wrong on Mom → teach
    { wait: 700 }, { shot: "10-teach-mom" },
    { click: "Got it!" },
    { click: "ANSWER - REAL FACE" },                    // mom ✓
    { wait: 1400 },
    { click: "DECLINE THE MASK" },                      // prize department ✓
    { wait: 1400 },
    { click: "ANSWER - REAL FACE" },                    // rosa ✓
    { wait: 1400 },
    { click: "DECLINE THE MASK" },                      // gas inspector ✓
    { wait: 1400 },
    { click: "ANSWER - REAL FACE" },                    // cousin ✓
    { wait: 1400 },
    { click: "DECLINE THE MASK" },                      // bank video desk ✓ → playDone
    { wait: 1600 }, { shot: "11-weakpoint-2" },
    { click: "Only real faces she knows can ring through" },
    { wait: 4300 },
    { shot: "12-announce-trick3" },                     // BOSSY RULEBOOK
    { wait: 2200 },
    { shot: "13-play-countercard" },                    // the nailed-on rulebook
    { click: "SEW A TOGETHER-RULE - RULES COVER EVERYONE" }, // ✓ straight
    { wait: 1700 }, { shot: "14-weakpoint-3" },
    { click: "A together-rule the whole family sews and signs" },
    { wait: 3900 },
    { shot: "15-wobbling" },
    { wait: 1700 },
    { shot: "16-finisher-ring" },
    { hold: "CHARGE THE FAMILY DOME", ms: 5600, shotDuring: "16b-charging" },
    { wait: 800 }, { shot: "17-payoff" },               // THE FAMILY FIREWALL IS UP!
    { wait: 2200 }, { shot: "18-victory" },
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "19-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "20-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "21-debrief" },
  ],
  // WEEK 20 — THE EVERY-MACHINE (THE DAWN SHOWDOWN, the finale). LAYLA week.
  // P1 THE RUSH (4 era callbacks) → P2 PANIC CLOCK shield → P3 LAST DOOR
  // peek-then-choose → Graduate's Protocol ORDER-STRIKE → seal charge.
  20: [
    { wait: 3000 }, { shot: "01-entrance" },
    { wait: 2000 }, { shot: "02-select" },
    { clickLabel: "Play as LAYLA" },
    { wait: 900 }, { shot: "03-announce-trick1" },      // THE FULL HEIST telegraph
    { wait: 2400 },
    { shot: "04-rush-beat1" },                          // W4 phishing callback
    { click: "The coins - games never give coins" },    // deliberate wrong → teach
    { wait: 700 }, { shot: "05-teach-coins" },
    { click: "Got it!" },
    { click: "That address - fastp1ay hides a sneaky number 1" }, // ✓ beat 1
    { wait: 600 }, { shot: "05b-rush-callback" },       // WEEK 4'S POWER banner
    { wait: 1300 },
    { click: "ZAP IT - a copycat in the real game's costume" },   // ✓ beat 2 (W9)
    { wait: 1900 },
    { hold: "HOLD THE PAUSE", ms: 2900, shotDuring: "06-rush-hold-pause" }, // ✓ beat 3 (W10)
    { wait: 1700 },
    { hold: "FROST THE MIRROR", ms: 2900 },             // ✓ beat 4 (W17) → playDone
    { wait: 2700 }, { shot: "07-weakpoint-1" },
    { click: "Twenty weeks of powers - you know every costume by heart" },
    { wait: 1300 }, { shot: "08-gear-popped" },
    { wait: 3000 },
    { shot: "09-announce-trick2" },                     // PANIC CLOCK
    { wait: 2200 },
    { shot: "10-play-panicclock" },                     // the barrage rages
    { hold: "HOLD THE CALM SHIELD", ms: 6600, shotDuring: "10b-shield-charging" },
    { wait: 400 }, { shot: "11-clock-cracked" },        // burnout panel
    { wait: 2600 }, { shot: "12-weakpoint-2" },
    { click: "A calm held minute - real life never rushes you" },
    { wait: 4300 },
    { shot: "13-announce-trick3" },                     // THE LAST DOOR
    { wait: 2200 },
    { shot: "14-lastdoor-peek" },                       // the beautiful door + peek hold
    { hold: "HOLD TO PEEK THE PLAQUE", ms: 2900 },      // ✓ peek beat
    { wait: 600 }, { shot: "15-plaque-blank" },         // the BLANK plaque callback
    { wait: 1400 }, { shot: "16-graduate-call" },       // the three-way choice
    { click: "NO PLAQUE, NO WALK-THROUGH" },            // ✓ → playDone
    { wait: 2700 }, { shot: "17-weakpoint-3" },
    { click: "No real address, no walk-through - however pretty the paint" },
    { wait: 3900 },
    { shot: "18-wobbling" },
    { wait: 2300 },
    { shot: "19-protocol" },                            // the Graduate's Protocol
    { click: "STOP" },
    { click: "SCREENSHOT" },
    { click: "BLOCK" },
    { click: "TELL" },
    { click: "COACH" },                                 // → protocol done
    { wait: 1400 }, { shot: "20-finisher-ring" },
    { hold: "CHARGE THE HERO SEAL", ms: 5600, shotDuring: "20b-seal-charging" },
    { wait: 800 }, { shot: "21-payoff" },               // CERTIFIED CYBER HERO!
    { wait: 2200 }, { shot: "22-victory" },             // the defeat send-off
    { click: "Claim the win" },
    { wait: 2500 }, { shot: "23-outro-video" },
    { click: "Skip video" },
    { wait: 1800 }, { shot: "24-badge-scene" },
    { click: "Claim Badge" },
    { wait: 2200 }, { shot: "25-debrief" },
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
    // Exact whole-text match — for click targets whose label is a
    // substring of page chrome (W1: the junk card "password" vs the
    // lesson header "Week 1: Passwords: The Secret Code").
    if (step.clickExact) {
      await page.getByText(step.clickExact, { exact: true }).first().click({ timeout: 8000, force: true });
      console.log(`click exact "${step.clickExact}"`);
    }
    if (step.hold) {
      const el = page.getByText(step.hold, { exact: false }).first();
      const press = async () => {
        const box = await el.boundingBox();
        if (!box) throw new Error(`no box for "${step.hold}"`);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
      };
      await press();
      // Opt-in engage check: some hold buttons swap their label while held
      // (HOLD TO COVER → COVERING…), so the resting label still being
      // visible means the press landed mid stage-transition and didn't
      // stick (chronic at 2560x1440) — lift and re-press until it does.
      if (step.engagedWhenGone) {
        for (let i = 0; i < 8; i++) {
          await page.waitForTimeout(250);
          if (!(await el.isVisible().catch(() => true))) break;
          await page.mouse.up();
          await page.waitForTimeout(400);
          console.log(`re-press "${step.hold}" (${i + 1})`);
          await press();
        }
      }
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
