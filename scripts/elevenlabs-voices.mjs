// One-shot script: list every voice on this ElevenLabs account.
// Outputs a compact table. Reads the key from .env.local via Node's
// built-in --env-file flag (Node 20+).

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY missing");
  process.exit(1);
}

const resp = await fetch("https://api.elevenlabs.io/v1/voices", {
  headers: { "xi-api-key": key },
});
if (!resp.ok) {
  console.error(`API error ${resp.status}: ${await resp.text()}`);
  process.exit(2);
}

const data = await resp.json();
const voices = data.voices ?? [];
console.log(`Total voices on account: ${voices.length}\n`);

// Compact one-liner per voice. We deliberately don't print the key.
for (const v of voices) {
  const labels = v.labels ?? {};
  const bits = [
    labels.gender,
    labels.age,
    labels.accent,
    labels.description,
    labels.use_case,
  ]
    .filter(Boolean)
    .join(" · ");
  const desc = (v.description || "").trim().slice(0, 80);
  console.log(`- ${v.name.padEnd(22)} [${v.voice_id}]`);
  if (bits) console.log(`    ${bits}`);
  if (desc) console.log(`    "${desc}${desc.length === 80 ? "…" : ""}"`);
}
