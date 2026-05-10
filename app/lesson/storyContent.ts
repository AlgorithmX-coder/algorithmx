import type { CutsceneSlide } from "@/app/components/StoryCutscene";

/* ───────── WEEK 1 - Passwords: The Secret Code ───────── */

export const WEEK1_INTRO: CutsceneSlide[] = [
  { text: "CYBER HEROES ACADEMY\nWEEK 1: PASSWORDS", bg: "normal", duration: 3000 },
  { character: "both", characterMood: "excited", text: "Hi there! I'm Adam, and this is Layla. We're Cyber Heroes - and today, YOU'RE joining the team!", sound: "lessonStart", duration: 5500 },
  { character: "both", characterMood: "curious", text: "Do you know what a password is? It's like a secret code that keeps your stuff safe - your games, your photos, everything!", duration: 5500 },
  { character: "both", characterMood: "worried", text: "But there's a BIG problem...", bg: "danger", duration: 3000 },
  { character: "raccoon", characterMood: "idle", text: "Meet Hacker Raccoon. He STEALS passwords from kids and breaks into their accounts!", sound: "bossRoar", bg: "danger", shake: true, duration: 5500 },
  { character: "raccoon", characterMood: "idle", text: "\"Hee hee hee! Weak passwords are SO easy to crack! Nobody can stop me!\"", textColour: "#c084fc", duration: 5000 },
  { character: "adam", characterMood: "excited", text: "Oh yes we CAN! We're going to learn how to make passwords SO strong that Hacker Raccoon can NEVER crack them!", duration: 5500 },
  { character: "layla", characterMood: "thumbsup", text: "And at the end, YOU get to battle Hacker Raccoon yourself! But first, let's learn everything about passwords. Ready?", sound: "select", duration: 6000 },
  { text: "LET'S GO! 🚀", bg: "normal", sound: "confetti", duration: 2000 },
];

export const WEEK1_MID: CutsceneSlide[] = [
  { character: "layla", characterMood: "worried", text: "Oh no! Hacker Raccoon just cracked a weak password and broke into a kid's game account!", bg: "danger", shake: true, sound: "wrong", duration: 4500 },
  { character: "raccoon", characterMood: "idle", text: "\"Too easy! 'password123'? That took me ONE second!\"", textColour: "#c084fc", duration: 4000 },
  { character: "adam", characterMood: "excited", text: "We need to move faster! Let's learn how to build UNBREAKABLE passwords!", sound: "select", duration: 4000 },
];

export const WEEK1_PRE_BOSS: CutsceneSlide[] = [
  { character: "both", characterMood: "idle", text: "You've learned everything about passwords. You know what makes them strong. You know what makes them weak.", duration: 4000 },
  { character: "layla", characterMood: "thinking", text: "But there's one final test. Hacker Raccoon is waiting...", bg: "danger", duration: 3500 },
  { character: "raccoon", characterMood: "idle", text: "\"You think you're smart enough to beat ME? Bring it on!\"", textColour: "#c084fc", sound: "bossRoar", shake: true, duration: 4000 },
  { character: "adam", characterMood: "excited", text: "It's time for the Boss Battle! Answer the questions correctly to defeat Hacker Raccoon!", sound: "select", duration: 4000 },
  { text: "GET READY...", bg: "dark", sound: "phaseChange", duration: 2000 },
];

export const WEEK1_POST_BOSS: CutsceneSlide[] = [
  { character: "both", characterMood: "excited", text: "You DID it! Hacker Raccoon has been defeated... for now!", bg: "victory", sound: "victory", duration: 4500 },
  { character: "raccoon", characterMood: "defeated", text: "\"Impossible! How did they know all that?! I'll be back...\"", textColour: "#c084fc", duration: 4000 },
  { character: "layla", characterMood: "thumbsup", text: "Amazing work! You're officially a Password Protector!", sound: "badgeEarned", duration: 4000 },
  { character: "adam", characterMood: "thumbsup", text: "But Hacker Raccoon will return next week with a NEW plan. See you then, Cyber Hero!", duration: 4500 },
  { text: "WEEK 1 COMPLETE\n⭐ Password Protector Badge Earned!", bg: "victory", sound: "confetti", duration: 3000 },
];

/* ───────── WEEK 2 - Private Information: Privacy Guardian ───────── */

export const WEEK2_INTRO: CutsceneSlide[] = [
  { text: "CYBER HEROES ACADEMY\nWEEK 2: PRIVATE INFORMATION", bg: "normal", duration: 3000 },
  { character: "both", characterMood: "excited", text: "Welcome back, Cyber Hero! Great to see you again!", sound: "lessonStart", duration: 4500 },
  { character: "layla", characterMood: "worried", text: "We've got a new problem. Hacker Raccoon is back - and this time he's after something REALLY dangerous...", bg: "danger", duration: 5500 },
  { character: "raccoon", characterMood: "idle", text: "\"Forget passwords - I want your NAME, your ADDRESS, your SCHOOL! Tell me EVERYTHING!\"", textColour: "#c084fc", sound: "bossRoar", shake: true, duration: 5500 },
  { character: "adam", characterMood: "worried", text: "Your private information is super valuable. If the wrong person gets it, they could find you, trick you, or pretend to be you!", duration: 5500 },
  { character: "layla", characterMood: "excited", text: "But don't worry! Today we're going to learn EXACTLY what's safe to share and what must stay secret!", duration: 5500 },
  { character: "adam", characterMood: "thumbsup", text: "And at the end - another Boss Battle against Hacker Raccoon! Let's do this!", sound: "select", duration: 5000 },
  { text: "LET'S GO! 🚀", bg: "normal", sound: "confetti", duration: 2000 },
];

export const WEEK2_MID: CutsceneSlide[] = [
  { character: "adam", characterMood: "worried", text: "Alert! Hacker Raccoon tricked a kid into sharing their home address online!", bg: "danger", shake: true, sound: "wrong", duration: 4500 },
  { character: "raccoon", characterMood: "idle", text: "\"They just GAVE it to me! Some kids make it too easy!\"", textColour: "#c084fc", duration: 4000 },
  { character: "layla", characterMood: "thinking", text: "We need to learn which information is safe to share and which must NEVER be shared!", sound: "select", duration: 4500 },
];

export const WEEK2_PRE_BOSS: CutsceneSlide[] = [
  { character: "both", characterMood: "idle", text: "You now know exactly which information is private and which is safe to share.", duration: 4000 },
  { character: "adam", characterMood: "thinking", text: "Hacker Raccoon won't be able to trick you anymore...", bg: "danger", duration: 3500 },
  { character: "raccoon", characterMood: "idle", text: "\"You think you can protect your secrets from ME?!\"", textColour: "#c084fc", sound: "bossRoar", shake: true, duration: 4000 },
  { character: "layla", characterMood: "excited", text: "Time for another Boss Battle! Show Hacker Raccoon what you've learned!", sound: "select", duration: 4000 },
  { text: "GET READY...", bg: "dark", sound: "phaseChange", duration: 2000 },
];

export const WEEK2_POST_BOSS: CutsceneSlide[] = [
  { character: "both", characterMood: "excited", text: "Hacker Raccoon is defeated AGAIN! Your private information is safe!", bg: "victory", sound: "victory", duration: 4500 },
  { character: "raccoon", characterMood: "defeated", text: "\"Not again! These kids are too smart!\"", textColour: "#c084fc", duration: 4000 },
  { character: "adam", characterMood: "thumbsup", text: "You're officially a Privacy Guardian now!", sound: "badgeEarned", duration: 4000 },
  { character: "layla", characterMood: "thumbsup", text: "But be careful - Hacker Raccoon always comes back. See you next week!", duration: 4500 },
  { text: "WEEK 2 COMPLETE\n⭐ Privacy Guardian Badge Earned!", bg: "victory", sound: "confetti", duration: 3000 },
];
