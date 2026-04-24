import type { CharacterMood } from "@/app/components/CharacterGuide";

export interface CharacterLine {
  mood: CharacterMood;
  message: string;
}

/**
 * One reaction per screen now carries both characters. The speaker gets a
 * non-empty `message`; the listener gets a mood-only entry (`message: ""`).
 * Either field can be `null` to hide that character entirely.
 */
export interface ScreenReaction {
  adam: CharacterLine | null;
  layla: CharacterLine | null;
  /** Delay before showing (ms) — default 500. */
  delay?: number;
}

/**
 * Helper — a character who's present but silent for this screen.
 * Renders the mood image without a speech bubble.
 */
const silent = (mood: CharacterMood): CharacterLine => ({ mood, message: "" });
const speak = (mood: CharacterMood, message: string): CharacterLine => ({ mood, message });

/**
 * Week 1 — Passwords: The Secret Code.
 * Adam and Layla alternate speaking per screen.
 */
export const WEEK1_REACTIONS: Record<number, ScreenReaction> = {
  0:  { adam: speak("excited",  "Welcome to your first mission! Let's learn about passwords!"), layla: silent("excited")  },
  1:  { adam: silent("curious"), layla: speak("curious",  "Did you know? A password is like a secret key to your digital world!") },
  2:  { adam: speak("thinking", "Hmm, what makes a password strong? Let's find out..."),        layla: silent("thinking") },
  3:  { adam: silent("excited"), layla: speak("excited",  "Great question! Let's test what you know!") },
  4:  { adam: speak("thumbsup", "You're doing amazing! Keep going!"),                           layla: silent("thumbsup") },
  5:  { adam: silent("curious"), layla: speak("curious",  "Now let's see if you can spot the strong passwords...") },
  6:  { adam: speak("thumbsup", "Great job! Everyone needs passwords — for games, tablets, and school!"), layla: silent("thumbsup") },
  7:  { adam: silent("thinking"), layla: speak("thinking", "Time to think about what makes passwords easy to guess...") },
  8:  { adam: speak("excited",  "Let's build some super strong passwords together!"),           layla: silent("excited")  },
  9:  { adam: silent("thinking"), layla: speak("curious",  "Can you figure out which passwords are strong and weak?") },
  10: { adam: speak("worried",  "Watch out! Hacker Raccoon is trying to steal passwords!"),    layla: silent("worried")  },
  11: { adam: silent("curious"), layla: speak("thinking", "Let's learn the golden rules of password safety...") },
  12: { adam: speak("excited",  "Time for a challenge! Can you sort these passwords?"),        layla: silent("excited")  },
  13: { adam: silent("worried"), layla: speak("worried",  "Be careful! Some of these emails are trying to trick you!") },
  14: { adam: speak("thumbsup", "You've learned so much! Almost time for the final mission!"), layla: silent("thumbsup") },
  15: { adam: silent("excited"), layla: speak("excited",  "It's boss battle time! Are you ready?") },
  16: { adam: speak("excited",  "You did it! You're a password protection expert now!"),       layla: silent("excited")  },
  17: { adam: silent("thumbsup"), layla: speak("excited", "Your certificate is ready — congratulations, hero!") },
  18: { adam: speak("thumbsup", "Keep going — your adventure continues next week!"),           layla: silent("thumbsup") },
};

/**
 * Week 2 — Privacy Guardian.
 * Adam and Layla alternate through the Week 2 flow.
 */
export const WEEK2_REACTIONS: Record<number, ScreenReaction> = {
  0:  { adam: speak("excited",  "Welcome back, cadet! This week we're learning how to protect private info!"), layla: silent("excited")  },
  1:  { adam: silent("curious"), layla: speak("curious",  "New mission! Something online needs your help — let's go!") },
  2:  { adam: speak("thinking", "What counts as private information? Tap each tile to find out..."),          layla: silent("thinking") },
  3:  { adam: silent("curious"), layla: speak("curious",  "Not everything online should be shared. Let's keep looking!") },
  4:  { adam: speak("worried",  "Spot something risky on this poster — can you find all the dangers?"),      layla: silent("worried")  },
  5:  { adam: silent("thumbsup"), layla: speak("thumbsup","Nice work! You're becoming a privacy pro!") },
  6:  { adam: speak("thinking", "Think carefully — what should you share, and what should you keep secret?"), layla: silent("thinking") },
  7:  { adam: silent("worried"), layla: speak("worried",  "A stranger is chatting with you. Choose your answers carefully!") },
  8:  { adam: speak("thumbsup", "You handled that brilliantly! Safety first, always."),                      layla: silent("thumbsup") },
  9:  { adam: silent("curious"), layla: speak("curious",  "Let's explore what happens when private info gets out...") },
  10: { adam: speak("worried",  "Uh-oh — this post is sharing way too much. Can you fix it?"),              layla: silent("worried")  },
  11: { adam: silent("thinking"), layla: speak("thinking","Time to test your knowledge with a quick quiz!") },
  12: { adam: speak("excited",  "You're almost a Privacy Guardian! Keep going!"),                           layla: silent("excited")  },
  13: { adam: silent("worried"), layla: speak("worried",  "Careful — this message looks like a trick. Can you tell why?") },
  14: { adam: speak("thumbsup", "Excellent detective work! You spotted the danger."),                        layla: silent("thumbsup") },
  15: { adam: silent("excited"), layla: speak("excited",  "Final mission! Use everything you've learned.") },
  16: { adam: speak("thumbsup", "Amazing! You protected your private info like a true Guardian."),          layla: silent("thumbsup") },
  17: { adam: silent("excited"), layla: speak("excited",  "Badge earned — see you next week for another adventure!") },
};

/* Encouraging quips for correct / wrong answers */
export const CORRECT_QUIPS = [
  "Yes! That's right!",
  "Awesome work!",
  "You're so smart!",
  "Perfect!",
  "Nailed it!",
];

export const WRONG_QUIPS = [
  "Hmm, not quite. Try again!",
  "Almost! Think about it...",
  "Let's try that one more time!",
  "Don't worry, you'll get it!",
];
