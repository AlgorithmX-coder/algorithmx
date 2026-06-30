// Horizontally flip PNG(s) in place. Used to normalise the Hacker Raccoon
// poses so they all face LEFT (toward the hero) in the boss face-off — the
// idle/hurt/defeated renders came out facing right.
// Usage: node scripts/_flop.mjs <file.png> [more.png ...]
import sharp from "sharp";
for (const f of process.argv.slice(2)) {
  const buf = await sharp(f).flop().toBuffer(); // read fully before writing back
  await sharp(buf).toFile(f);
  console.log("flopped", f);
}
