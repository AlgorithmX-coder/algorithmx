// Pull full details for a single voice. Usage:
//   node --env-file=.env.local scripts/elevenlabs-show-voice.mjs <voice_id>

const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error("ELEVENLABS_API_KEY missing"); process.exit(1); }

const id = process.argv[2];
if (!id) { console.error("Usage: ... <voice_id>"); process.exit(1); }

const r = await fetch(`https://api.elevenlabs.io/v1/voices/${id}`, {
  headers: { "xi-api-key": key },
});
if (!r.ok) {
  console.error(`API ${r.status}: ${await r.text()}`);
  process.exit(2);
}

const v = await r.json();
console.log(`Name:        ${v.name}`);
console.log(`Voice ID:    ${v.voice_id}`);
console.log(`Category:    ${v.category}`);
console.log(`Description: ${v.description ?? "(none)"}`);
console.log("Labels:");
for (const [k, val] of Object.entries(v.labels ?? {})) {
  console.log(`  ${k.padEnd(14)} ${val}`);
}
console.log(`Preview MP3: ${v.preview_url ?? "(none)"}`);
