/* Answer-disguise rewrites, batch 2: weeks 11-20 (LIVE findings only).
 * Same rule as batch 1 - lengthen the decoys, keep the lesson in the answer. */
import { readFile, writeFile } from "node:fs/promises";

const E = [
  // ---- week 11 bossQuiz c4 ----
  ["week11.ts",
   `{ text: "Delete it fast so it can't scare me again" },
          { text: "Beg them not to ban me, just in case" },`,
   `{ text: "Delete it fast so it can't scare me again tonight" },
          { text: "Beg them not to ban me, just to be safe" },`],

  // ---- week 12, screen 6 recall ----
  ["week12.ts",
   `{ text: "No track, closing the tab wiped it", isCorrect: false,`,
   `{ text: "No track, closing the tab wiped it away", isCorrect: false,`],
  ["week12.ts",
   `{ text: "Half a track, it fades by tomorrow", isCorrect: false,`,
   `{ text: "Half a track, and it fades away by tomorrow", isCorrect: false,`],
  ["week12.ts",
   `{ text: "No track, because nobody saw it", isCorrect: false,`,
   `{ text: "No track, because nobody else ever saw it", isCorrect: false,`],

  // ---- week 12, screen 22 speed ----
  ["week12.ts",
   `{ text: "'Brilliant goal, Sam!'", isCorrect: false,`,
   `{ text: "'Brilliant goal today, Sam, well done!'", isCorrect: false,`],

  // ---- week 12, the Prove gates ----
  ["week12.ts",
   `"The search still printed. Closing the tab only cleared your screen.",
            "Right, closing the tab wipes the whole thing.",
            "Only if you searched it more than once.",`,
   `"The search printed. Closing the tab only cleared your screen.",
            "Right, closing the tab wipes the whole lot of it.",
            "Only if you searched for it more than once, I think.",`],
  ["week12.ts",
   `"Post it, you can always delete it tomorrow.",
            "Post it, because you are right about the ref.",`,
   `"Post it, you can always delete the whole thing tomorrow.",
            "Post it, because you are completely right about the ref.",`],
  ["week12.ts",
   `"Say their goalie was useless, it is funnier.",
            "Say it was no thanks to our defenders.",`,
   `"Say their goalie was completely useless, it is funnier.",
            "Say it was no thanks at all to our hopeless defenders.",`],

  // ---- week 12 bossQuiz c2 ----
  ["week12.ts",
   `{ text: "Exactly one, on my friend's phone" },`,
   `{ text: "Exactly one, sitting on my friend's phone now" },`],

  // ---- week 13, screen 22 speed ----
  ["week13.ts",
   `{ text: "A book with a bookmark in it", isCorrect: false,`,
   `{ text: "A book with a bookmark halfway through it", isCorrect: false,`],
  ["week13.ts",
   `{ text: "A lamp turned down low", isCorrect: false,`,
   `{ text: "A lamp turned down low in the corner", isCorrect: false,`],

  // ---- week 13 bossQuiz c3 ----
  ["week13.ts",
   `{ text: "Under my pillow so it can't get lost" },
          { text: "Inside my sleeping bag to keep it warm" },`,
   `{ text: "Under my pillow so it can't get lost in the night" },
          { text: "Inside my sleeping bag to keep it nice and warm" },`],

  // ---- week 14, screen 6 recall ----
  ["week14.ts",
   `{ text: "The kettle", isCorrect: false,`,
   `{ text: "The kettle on the kitchen side", isCorrect: false,`],
  ["week14.ts",
   `{ text: "The reading lamp", isCorrect: false,`,
   `{ text: "The reading lamp by the bed", isCorrect: false,`],
  ["week14.ts",
   `{ text: "The wind-up alarm clock", isCorrect: false,`,
   `{ text: "The wind-up alarm clock on the shelf", isCorrect: false,`],

  // ---- week 15, screen 13 recall ----
  ["week15.ts",
   `{ text: "Math questions", isCorrect: false,`,
   `{ text: "Math questions about adding up", isCorrect: false,`],
  ["week15.ts",
   `{ text: "Dinosaur facts", isCorrect: false,`,
   `{ text: "Dinosaur facts for a school project", isCorrect: false,`],
  ["week15.ts",
   `{ text: "Spelling words", isCorrect: false,`,
   `{ text: "Spelling words for Friday's test", isCorrect: false,`],

  // ---- week 16, screen 14 lie ----
  ["week16.ts",
   `{ text: "Stickers only go on menus", isCorrect: false,`,
   `{ text: "Stickers only ever go on cafe menus", isCorrect: false,`],
  ["week16.ts",
   `{ text: "Real codes are always crooked", isCorrect: false,`,
   `{ text: "Real codes are always a bit crooked", isCorrect: false,`],

  // ---- week 16, screen 22 speed ----
  ["week16.ts",
   `{ text: "Tap it once, just to see", isCorrect: false,`,
   `{ text: "Tap it once, just to see what it is", isCorrect: false,`],
  ["week16.ts",
   `{ text: "Leave it and never mention it", isCorrect: false,`,
   `{ text: "Leave it there and never mention it again", isCorrect: false,`],

  // ---- week 17, screen 6 recall ----
  ["week17.ts",
   `{ text: "How clever you are", isCorrect: false,`,
   `{ text: "How clever you are for your age", isCorrect: false,`],
  ["week17.ts",
   `{ text: "That you are in trouble", isCorrect: false,`,
   `{ text: "That you are in trouble for something", isCorrect: false,`],
  ["week17.ts",
   `{ text: "That the app is broken", isCorrect: false,`,
   `{ text: "That the app is broken somehow", isCorrect: false,`],

  // ---- week 17, screen 14 lie ----
  ["week17.ts",
   `{ text: "Yes, following back makes it official", isCorrect: false,`,
   `{ text: "Yes, following each other back makes it official", isCorrect: false,`],
  ["week17.ts",
   `{ text: "Yes, if they follow you fast", isCorrect: false,`,
   `{ text: "Yes, if they followed you back really fast", isCorrect: false,`],
  ["week17.ts",
   `{ text: "Yes, if they have lots of followers", isCorrect: false,`,
   `{ text: "Yes, if they have lots and lots of followers", isCorrect: false,`],

  // ---- week 17, screen 22 ----
  ["week17.ts",
   `{ text: "Everybody's life really is better", isCorrect: false,`,
   `{ text: "Everybody's life really is much better than yours", isCorrect: false,`],
  ["week17.ts",
   `{ text: "You need to post more", isCorrect: false,`,
   `{ text: "You need to post a lot more than you already do", isCorrect: false,`],
  ["week17.ts",
   `{ text: "Your day was boring", isCorrect: false,`,
   `{ text: "Your day was just a bit boring today, that's all", isCorrect: false,`],

  // ---- week 18, screen 14 lie ----
  ["week18.ts",
   `{ text: "Yes, so there is no point having one", isCorrect: false,`,
   `{ text: "Yes, so there is really no point having one at all", isCorrect: false,`],
  ["week18.ts",
   `{ text: "Yes, unless your code is really long", isCorrect: false,`,
   `{ text: "Yes, unless your code is really long and tricky", isCorrect: false,`],
  ["week18.ts",
   `{ text: "Yes, locks are only for phones", isCorrect: false,`,
   `{ text: "Yes, locks are only really for phones anyway", isCorrect: false,`],

  // ---- week 18 bossQuiz c5: answer was longest AND the only one arguing ----
  ["week18.ts",
   `{ text: "No thanks, it's a shared computer, so my keys shouldn't live in it" },
          { text: "Save it, a grown-up just said it was fine" },
          { text: "Save it now and delete it before going home" },`,
   `{ text: "No thanks, it's a shared computer, so my keys stay out" },
          { text: "Save it, a grown-up said it was fine, so it must be" },
          { text: "Save it now and then delete it before going home" },`],

  // ---- week 19, screen 10 lie ----
  ["week19.ts",
   `{ text: "Yes, it saves everyone time", isCorrect: false,`,
   `{ text: "Yes, it saves everyone a whole lot of time", isCorrect: false,`],
  ["week19.ts",
   `{ text: "Yes, they would not understand anyway", isCorrect: false,`,
   `{ text: "Yes, they would not understand it anyway", isCorrect: false,`],
  ["week19.ts",
   `{ text: "Yes, as long as you delete it fast", isCorrect: false,`,
   `{ text: "Yes, as long as you delete it really fast", isCorrect: false,`],

  // ---- week 19, screen 14 recall ----
  ["week19.ts",
   `{ text: "It keeps everybody safe", isCorrect: false,`,
   `{ text: "It keeps everybody in the house safe", isCorrect: false,`],
  ["week19.ts",
   `{ text: "A grown-up thought of it", isCorrect: false,`,
   `{ text: "A grown-up came up with it first", isCorrect: false,`],
  ["week19.ts",
   `{ text: "Nobody complains about it", isCorrect: false,`,
   `{ text: "Nobody has complained about it yet", isCorrect: false,`],

  // ---- week 19, screen 22 finish ----
  ["week19.ts",
   `{ text: "long, so they understand properly", isCorrect: false,`,
   `{ text: "long, so that they understand it properly", isCorrect: false,`],
  ["week19.ts",
   `{ text: "loud, so they definitely stop", isCorrect: false,`,
   `{ text: "loud, so that they definitely stop first", isCorrect: false,`],
  ["week19.ts",
   `{ text: "about how they always do this", isCorrect: false,`,
   `{ text: "about how they always do this sort of thing", isCorrect: false,`],

  // ---- week 19 bossQuiz c2 + c3 ----
  ["week19.ts",
   `{ text: "It could be real, small fees are how big prizes usually work" },
          { text: "It's only fake if the spelling has mistakes in it" },`,
   `{ text: "It could be real, small fees are just how big prizes usually work" },
          { text: "It's only fake if the spelling has mistakes somewhere in it" },`],
  ["week19.ts",
   `{ text: "A rule with a grown-up-sized hole in it isn't a firewall, locks are for everyone" },
          { text: "Nothing, grown-ups already know all about locks" },`,
   `{ text: "A rule with a grown-up-sized hole isn't a firewall, locks are for everyone" },
          { text: "Nothing at all, grown-ups already know everything about locks" },`],

  // ---- week 20, screen 6 lie ----
  ["week20.ts",
   `{ text: "Yes, symbols make it much harder", isCorrect: false,`,
   `{ text: "Yes, symbols make it much harder to crack", isCorrect: false,`],
  ["week20.ts",
   `{ text: "Yes, if nobody can guess it", isCorrect: false,`,
   `{ text: "Yes, if nobody can ever guess it", isCorrect: false,`],
  ["week20.ts",
   `{ text: "Yes, as long as you change it often", isCorrect: false,`,
   `{ text: "Yes, as long as you change it quite often", isCorrect: false,`],

  // ---- week 20, screen 10 recall ----
  ["week20.ts",
   `{ text: "See if it looks professional", isCorrect: false,`,
   `{ text: "See if the whole thing looks professional", isCorrect: false,`],
  ["week20.ts",
   `{ text: "Check whether it is free", isCorrect: false,`,
   `{ text: "Check whether it is free to download", isCorrect: false,`],

  // ---- week 20, screen 14 speed: answer was longest AND only one arguing ----
  ["week20.ts",
   `{ text: "1 coin, that is what it says", isCorrect: false,`,
   `{ text: "1 coin, because that is what the deal says", isCorrect: false,`],
  ["week20.ts",
   `{ text: "It depends how many you want", isCorrect: false,`,
   `{ text: "It depends on how many you want to buy", isCorrect: false,`],
  ["week20.ts",
   `{ text: "You cannot tell without asking", isCorrect: false,`,
   `{ text: "You cannot tell without asking somebody", isCorrect: false,`],

  // ---- week 20 bossQuiz c3, c4, c5 ----
  ["week20.ts",
   `{ text: "They're extra clever, and clever players make the best friends" },
          { text: "They must live nearby, so it's fine to keep chatting" },`,
   `{ text: "They're extra clever, and clever players always make the very best friends" },
          { text: "They must live somewhere nearby, so it's perfectly fine to keep chatting" },`],
  ["week20.ts",
   `{ text: "No reply at all, then block and tell, a reaction is what they're fishing for" },
          { text: "One perfect comeback, so everyone can watch you win" },
          { text: "A polite reply asking them very nicely to stop" },`,
   `{ text: "No reply, then block and tell, a reaction is what they're fishing for" },
          { text: "One perfect comeback, so that everyone can watch you win it" },
          { text: "A polite reply asking them really very nicely to stop it" },`],
  ["week20.ts",
   `{ text: "It's safest to wait a week, most scary things fix themselves" },
          { text: "It only counts as worth telling if it happens twice" },`,
   `{ text: "It's safest to wait a week or two, most scary things just fix themselves" },
          { text: "It only really counts as worth telling if it happens more than twice" },`],
];

const base = "app/lesson/weekContent/";
const cache = new Map();
for (let [f, old, next] of E) {
  if (!cache.has(f)) cache.set(f, await readFile(base + f, "utf8"));
  const src = cache.get(f);
  /* the week files are CRLF on this machine - match the real bytes */
  if (src.includes("\r\n")) {
    old = old.split("\n").join("\r\n");
    next = next.split("\n").join("\r\n");
  }
  const n = src.split(old).length - 1;
  if (n !== 1) {
    console.error(`FAIL ${f}: ${n} matches for\n${old.slice(0, 120)}`);
    process.exit(1);
  }
  cache.set(f, src.replace(old, next));
}
for (const [f, src] of cache) await writeFile(base + f, src);
console.log(`applied ${E.length} edits across ${cache.size} files`);
