/* Answer-disguise rewrites, batch 1: weeks 1, 7, 8, 9 (LIVE findings only).
 * Decoys are lengthened rather than the right answer gutted, so the teaching
 * survives and the wrong options get more tempting - which is the point. */
import { readFile, writeFile } from "node:fs/promises";

const E = [
  // week 1, screen 14 recall - decoys were half the answer's length
  ["week1.ts",
   `{ text: "My best friend", isCorrect: false, why: "Even a best friend`,
   `{ text: "My best friend, if they promise", isCorrect: false, why: "Even a best friend`],
  ["week1.ts",
   `{ text: "My whole class", isCorrect: false, why: "A whole class`,
   `{ text: "My whole class, we all share it", isCorrect: false, why: "A whole class`],
  ["week1.ts",
   `{ text: "Anyone who asks", isCorrect: false, why: "Anyone who asks`,
   `{ text: "Anyone who asks me nicely", isCorrect: false, why: "Anyone who asks`],

  // week 7, screen 18 recall
  ["week7.ts",
   `{ text: "Your best friend", isCorrect: false, why: "A friend cannot`,
   `{ text: "Your best friend, they have coins", isCorrect: false, why: "A friend cannot`],
  ["week7.ts",
   `{ text: "The game's shop", isCorrect: false, why: "The shop wants`,
   `{ text: "The game's shop, it just needs a tap", isCorrect: false, why: "The shop wants`],
  ["week7.ts",
   `{ text: "Nobody, if it is small", isCorrect: false, why: "Small buys`,
   `{ text: "Nobody, if the price is tiny", isCorrect: false, why: "Small buys`],

  // week 7 bossQuiz c1 - the answer was the only one arguing its own case
  ["week7.ts",
   `{ text: "He's right, money stops being real once it turns into coins" },`,
   `{ text: "He's right, coins stop being real money because the game made them" },`],

  // week 8, the five Prove gates
  ["week8.ts",
   `"Phew! Delete fixes everything.",
            "I'll delete it twice, just to be sure.",`,
   `"Phew! Deleting it fixes the whole thing.",
            "I'll delete it twice, that makes it really gone.",`],
  ["week8.ts",
   `"Yes! She'll think it's funny later.",`,
   `"Yes! It's funny, so she'll laugh about it later.",`],
  ["week8.ts",
   `"OK, the number makes it look cool!",`,
   `"OK, it looks cool, so the number can stay!",`],
  ["week8.ts",
   `"OK, it's only the group chat.",
            "Only if everyone promises not to share it.",`,
   `"OK, it's only the group chat, nobody else.",
            "Only if everyone in the chat promises not to share it.",`],

  // week 8, screen 14 speed round
  ["week8.ts",
   `{ text: "The balloons behind you", isCorrect: false,`,
   `{ text: "The balloons tied behind you", isCorrect: false,`],
  ["week8.ts",
   `{ text: "The sunny sky", isCorrect: false,`,
   `{ text: "The sunny sky up above you", isCorrect: false,`],

  // week 8 bossQuiz
  ["week8.ts",
   `{ text: "Send it, family chats don't count" },
          { text: "Send just the funniest wobbly bit" },`,
   `{ text: "Send it, family chats don't count as sharing" },
          { text: "Send just the funniest wobbly bit of it" },`],
  ["week8.ts",
   `{ text: "The pool's name on the wall, it shows where she swims every week" },
          { text: "The shiny medal around her neck" },
          { text: "The stripy towel over her shoulder" },`,
   `{ text: "The pool's name on the wall behind her" },
          { text: "The shiny medal hanging around her neck" },
          { text: "The stripy towel draped over her shoulder" },`],
  ["week8.ts",
   `{ text: "THINK: where is it going, and is it OK for anyone, forever?" },
          { text: "Post it now, looking was enough" },
          { text: "Add music first so it gets more likes" },`,
   `{ text: "THINK: where is it going, and is it OK forever?" },
          { text: "Post it now, having a look was enough." },
          { text: "Add some music first so it gets more likes!" },`],

  // week 9
  ["week9.ts",
   `{ text: "The one with 4 million downloads", isCorrect: false,`,
   `{ text: "The one by Starlight Games, with 4 million downloads", isCorrect: false,`],
  ["week9.ts",
   `{ text: "Neither, the app names match", isCorrect: false,`,
   `{ text: "Neither, the app names match exactly", isCorrect: false,`],
  ["week9.ts",
   `{ text: "Free to start isn't free to play: the coin shop costs real money", isCorrect: true,`,
   `{ text: "Free to start isn't free to play", isCorrect: true,`],
  ["week9.ts",
   `{ text: "Close it, and check for updates in the real app store with a grown-up" },
          { text: "Tap it quickly, updates keep games safe" },`,
   `{ text: "Close it, and check the real app store with a grown-up" },
          { text: "Tap it quickly, updates like this keep games safe" },`],
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
