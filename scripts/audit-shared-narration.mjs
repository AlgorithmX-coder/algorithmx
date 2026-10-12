/**
 * Shared narration lines must still exist in the app.
 *
 * Most of Sarah's script lives in app/lesson/weekContent/week*.ts, which the
 * generator scans, so content and recordings cannot drift apart. A handful of
 * lines instead live in a COMPONENT and are hand-copied into the generator's
 * shared table. Nothing kept the two in sync.
 *
 * In #385 the finish-mode quick-check prompt was reworded in QuickCheck.tsx
 * ("Can you fill in the missing word?" -> "Can you finish the rule?") and the
 * generator kept recording the old words. The manifest is keyed on the exact
 * text, so the lookup missed, the recording became an orphan, and
 * InfoNarration fell through to the browser's SpeechSynthesis voice - a man on
 * Windows - on one screen in all twenty weeks. Nothing failed: the build was
 * green, the manifest was valid JSON and the clip was still deployed.
 *
 * So: every line the generator records as `shared` must appear verbatim
 * somewhere under app/. A line that does not is a line the app has stopped
 * saying, which means the app is now saying something that was never recorded.
 *
 *   node scripts/audit-shared-narration.mjs
 *
 * Exits non-zero on drift.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const GENERATOR = "scripts/elevenlabs-generate-narration.mjs";

async function sourceFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await sourceFiles(p)));
    else if (/\.(tsx?|mdx?)$/.test(e.name)) out.push(p);
  }
  return out;
}

const gen = await readFile(GENERATOR, "utf8");

// blocks.push({ speaker: "...", lines: ["...", ...], source: "shared..." })
const pushRe =
  /blocks\.push\(\{\s*speaker:\s*"(\w+)",\s*lines:\s*\[([^\]]*)\],\s*source:\s*"(shared[^"]*)"/g;
const shared = [];
for (const m of gen.matchAll(pushRe)) {
  const lines = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((s) =>
    s[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\"),
  );
  // template literals are per-item text, not a fixed shared line
  if (!lines.length || /`|\$\{/.test(m[2])) continue;
  for (const line of lines) shared.push({ line, source: m[3] });
}

const files = await sourceFiles("app");
const haystack = (await Promise.all(files.map((f) => readFile(f, "utf8")))).join("\n");

const missing = shared.filter(({ line }) => !haystack.includes(line));

console.log(`shared narration lines in ${GENERATOR}: ${shared.length}`);
console.log(`still spoken by the app:               ${shared.length - missing.length}`);

if (missing.length) {
  console.error(`\nDRIFT: ${missing.length} recorded line(s) appear nowhere under app/.`);
  console.error("Either the wording changed in the component (copy it here and re-record),");
  console.error("or the line was deleted (drop it here too).\n");
  for (const { line, source } of missing) console.error(`  [${source}] "${line}"`);
  process.exit(1);
}

console.log("\nno drift.");
