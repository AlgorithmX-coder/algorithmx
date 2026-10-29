/* Re-download a week's frames from the manifest.
 *
 *   node scripts/week-video-fetch-frames.mjs --week=3
 *
 * Every generated frame's source URL is recorded in .art-check/wk-frames.json
 * when it is made. The local copies get rewritten in place by the trim pass,
 * so when a trim turns out to have been wrong the original has to come back
 * from somewhere other than another 40 credits of generation.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";

const weekArg = process.argv.find((a) => a.startsWith("--week="));
const WW = String(Number(weekArg.split("=")[1])).padStart(2, "0");
const man = JSON.parse(await readFile(".art-check/wk-frames.json", "utf8"));
const week = man[`w${WW}`];
if (!week) {
  console.error(`no manifest entry for w${WW}`);
  process.exit(1);
}
const dir = `.art-check/w${WW}-video/frames`;
await mkdir(dir, { recursive: true });
for (const [name, rec] of Object.entries(week)) {
  const resp = await fetch(man._base + rec.f);
  if (!resp.ok) {
    console.log(`${name}  HTTP ${resp.status}`);
    continue;
  }
  await writeFile(`${dir}/${name}.png`, Buffer.from(await resp.arrayBuffer()));
  console.log(`${name.padEnd(18)} restored`);
}
