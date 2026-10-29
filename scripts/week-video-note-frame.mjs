/* Record a generated frame's source URL in the manifest.
 *
 *   node scripts/week-video-note-frame.mjs 4 intro-shot1-start <id> <filename>
 *
 * Paired with week-video-fetch-frames.mjs: the trim pass rewrites frames in
 * place, so without this the only way back from a bad trim is to pay for the
 * picture twice.
 */
import { readFile, writeFile } from "node:fs/promises";
const [week, name, id, f] = process.argv.slice(2);
const path = ".art-check/wk-frames.json";
const man = JSON.parse(await readFile(path, "utf8"));
const key = `w${String(Number(week)).padStart(2, "0")}`;
(man[key] ??= {})[name] = { id, f };
await writeFile(path, JSON.stringify(man, null, 2) + "\n");
console.log(`${key}/${name} -> ${f}`);
