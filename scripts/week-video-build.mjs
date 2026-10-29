/* Assemble one week's bookend videos: join the shots, lay the voice over them.
 *
 *   node scripts/week-video-build.mjs --week=3
 *
 * ── THE BUG THIS SCRIPT EXISTS TO MAKE IMPOSSIBLE ────────────────────────
 * Owner, 2026-10-28: "Make it clear when the video is speaking and when 11
 * Labs is speaking. When you're doing the voiceover, you don't want them to
 * counteract each other, because that's the mistake that was in week one."
 *
 * Week 1 wrote the start second of every line by hand:
 *
 *     { file: "intro-5", at: 13.9 },  // 2.85s -> 16.75  (Callum)
 *     { file: "intro-6", at: 14.9 },  // 5.49s -> 20.39  (Emma)
 *
 * Callum is still talking until 16.75 and Emma starts at 14.9: 1.85 seconds
 * of two voices at once, both at full volume. The comments even show it;
 * nobody added up. It is not a typo, it is the method - hand-placing a line
 * means redoing mental arithmetic against the measured length of the line
 * before it, every time, for nineteen more weeks.
 *
 * So no line carries a start time. The script MEASURES each recorded mp3 and
 * lays the lines end to end, which makes an overlap unrepresentable.
 *
 * ── AND THE SECOND HALF OF THE SAME BUG ──────────────────────────────────
 * Not overlapping is not the same as landing on the right picture. Week 3
 * built clean and still had this:
 *
 *     intro-3  CALLUM  8.53 -> 12.74      (shot 1 is 10.04s long)
 *
 * The Raccoon's line starts on the Raccoon and finishes 2.7 seconds into the
 * detectives' shot: he is talking over a picture he is not in. The old guard
 * only looked at where a line STARTED, so it passed.
 *
 * The cause was that a line's picture was implied - by a hand-written
 * `notBefore`, checked against a shot length nobody had measured yet. So now
 * each line NAMES its shot, and a shot is held on its last frame until its
 * own lines have finished. A line cannot run past its picture, because the
 * picture waits for the line. Footage length stops being a deadline and
 * becomes a minimum.
 *
 * ── THE THIRD THING THAT IS CHECKED ──────────────────────────────────────
 * The clips must come back SILENT. The models are told not to generate
 * speech, but "told not to" is not a guarantee, so the joined video is probed
 * for an audio stream and the build stops if it finds one. Without that, a
 * model's own voice track would play underneath ours - the same two-voices
 * problem arriving by yet another door.
 */
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { existsSync, mkdirSync } from "node:fs";

const weekArg = process.argv.find((a) => a.startsWith("--week="));
const WEEK = weekArg ? Number(weekArg.split("=")[1]) : null;
if (!WEEK) {
  console.error("usage: node scripts/week-video-build.mjs --week=N");
  process.exit(1);
}
const WW = String(WEEK).padStart(2, "0");
const wk = await import(`./week-videos/w${WW}.mjs`);

const DIR = `.art-check/w${WW}-video`;
const VO = `${DIR}/vo`;
const SHOTS = `${DIR}/shots`;
mkdirSync(`${DIR}/out`, { recursive: true });

/** Silence between one line ending and the next beginning. Long enough that a
 *  child hears two separate people, short enough that it is not a pause. */
const GAP = 0.4;
/** Breath before the first word of a shot, so the picture lands before the
 *  voice does. The cut itself is the cue that the speaker has changed. */
const LEAD = 0.6;
/** Quiet held after a shot's last word before cutting to the next picture. */
const SHOT_TAIL = 0.5;
/** Quiet after the very last word, before the fade finishes. */
const TAIL_PAD = 1.0;
/** Length of the fade to black. */
const FADE = 1.2;

function ff(args, label) {
  const r = spawnSync(ffmpegPath, args, { maxBuffer: 1 << 28 });
  if (r.status !== 0) {
    console.log(`  ${label} FAILED (exit ${r.status})`);
    console.log(String(r.stderr || "").split("\n").slice(-14).join("\n"));
    process.exit(1);
  }
  return r;
}

function probe(file) {
  const r = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8" });
  const err = r.stderr || "";
  const d = /Duration: (\d+):(\d+):([0-9.]+)/.exec(err);
  return {
    seconds: d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0,
    hasAudio: /Stream #\d+:\d+.*: Audio:/.test(err),
    size: /, (\d+x\d+)/.exec(err)?.[1] ?? "?",
  };
}

let failures = 0;

for (const video of wk.VIDEOS) {
  console.log(`\n${"=".repeat(72)}\n${video.name}\n${"=".repeat(72)}`);

  const shotFiles = video.shots.map((s) => `${SHOTS}/${s.file}.mp4`);
  const missing = shotFiles.filter((s) => !existsSync(s));
  if (missing.length) {
    console.log(`  waiting on footage: ${missing.map((m) => m.split("/").pop()).join(", ")}`);
    failures++;
    continue;
  }

  /* Every line must name a shot, and the lines must run in shot order: the
   * voice-over is read in the order it is written. */
  let badShot = false;
  let prevShot = 0;
  for (const line of video.lines) {
    const s = line.shot;
    if (!Number.isInteger(s) || s < 1 || s > video.shots.length) {
      console.log(`  ${line.file}: shot ${JSON.stringify(s)} is not one of 1..${video.shots.length}`);
      badShot = true;
    } else if (s < prevShot) {
      console.log(`  ${line.file}: shot ${s} comes after shot ${prevShot}; lines must run in shot order`);
      badShot = true;
    } else prevShot = s;
  }
  if (badShot) {
    failures++;
    continue;
  }

  /* ── 1. measure the footage ────────────────────────────────────────── */
  /* MEASURED, not assumed: the model returns 7.04s for a 7s request, and
   * assuming the round number puts every later cut in the wrong place. */
  const native = shotFiles.map((f) => probe(f).seconds);

  /* ── 2. pace the voice, shot by shot ───────────────────────────────── */
  /* Each shot starts where the previous one ended, carries its own lines end
   * to end, and then lasts whichever is longer: its own footage, or long
   * enough to finish what is said over it. */
  const cues = [];
  const starts = [];
  const durs = [];
  let clock = 0;
  let voMissing = false;

  for (let i = 0; i < video.shots.length && !voMissing; i++) {
    starts[i] = clock;
    let cursor = clock + LEAD;
    let lastEnd = clock;

    for (const line of video.lines.filter((l) => l.shot === i + 1)) {
      const file = `${VO}/${line.file}.mp3`;
      if (!existsSync(file)) {
        console.log(`  MISSING VOICE ${file} - run week-video-vo.mjs --week=${WEEK}`);
        voMissing = true;
        break;
      }
      const { seconds } = probe(file);
      const at = cursor;
      cues.push({ ...line, at, dur: seconds, end: at + seconds });
      lastEnd = at + seconds;
      cursor = lastEnd + GAP;
    }

    /* The picture waits for the voice, never the other way round. */
    durs[i] = Math.max(native[i], lastEnd + SHOT_TAIL - starts[i]);
    clock = starts[i] + durs[i];
  }
  if (voMissing) {
    failures++;
    continue;
  }

  /* ── 3. the guards ─────────────────────────────────────────────────── */
  let clash = false;
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].at < cues[i - 1].end) {
      console.log(
        `  OVERLAP ${cues[i - 1].file} (${cues[i - 1].voice}) ends ${cues[i - 1].end.toFixed(2)} ` +
          `but ${cues[i].file} (${cues[i].voice}) starts ${cues[i].at.toFixed(2)}`
      );
      clash = true;
    }
  }
  /* The one week 3 needed: a line must finish on the picture it began on. */
  for (const c of cues) {
    const from = starts[c.shot - 1];
    const to = from + durs[c.shot - 1];
    if (c.at < from - 1e-6 || c.end > to + 1e-6) {
      console.log(
        `  STRADDLE ${c.file} (${c.voice}) runs ${c.at.toFixed(2)}-${c.end.toFixed(2)} ` +
          `but shot ${c.shot} is ${from.toFixed(2)}-${to.toFixed(2)}`
      );
      clash = true;
    }
  }
  if (clash) {
    failures++;
    continue;
  }

  /* ── 4. the timeline, printed so it can be read rather than trusted ── */
  const lastWord = cues.length ? cues[cues.length - 1].end : 0;
  const total = Math.max(clock, lastWord + TAIL_PAD);
  durs[durs.length - 1] += total - clock;

  console.log(
    `  ${"line".padEnd(10)} ${"who".padEnd(7)} ${"in".padStart(6)} ${"out".padStart(7)} ${"gap".padStart(6)}   shot`
  );
  cues.forEach((c, i) => {
    const gap = i === 0 ? c.at : c.at - cues[i - 1].end;
    console.log(
      `  ${c.file.padEnd(10)} ${c.voice.padEnd(7)} ${c.at.toFixed(2).padStart(6)} ${c.end
        .toFixed(2)
        .padStart(7)} ${gap.toFixed(2).padStart(6)}   ${c.shot}`
    );
  });
  video.shots.forEach((s, i) => {
    const holdFor = durs[i] - native[i];
    console.log(
      `  shot ${i + 1} ${s.file.padEnd(13)} ${starts[i].toFixed(2).padStart(6)} -> ${(starts[i] + durs[i])
        .toFixed(2)
        .padStart(6)}   footage ${native[i].toFixed(2)}s` +
        (holdFor > 0.01 ? `  + held ${holdFor.toFixed(2)}s on its last frame` : "")
    );
  });
  console.log(`  total ${total.toFixed(2)}s`);

  /* ── 5. join the shots, each held as long as its lines need ────────── */
  const joined = `${DIR}/out/${video.name}.silent.mp4`;
  const inputs = shotFiles.flatMap((s) => ["-i", s]);
  const scale =
    "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24";
  const chain = shotFiles
    .map((_, i) => {
      const hold = durs[i] - native[i];
      const pad = hold > 0.01 ? `,tpad=stop_mode=clone:stop_duration=${hold.toFixed(2)}` : "";
      return `[${i}:v]${scale}${pad}[v${i}]`;
    })
    .join(";");
  /* a=0 drops every input's audio, so a model that returned a voice track
   * cannot leak one into the finished video. */
  const cat = `${shotFiles.map((_, i) => `[v${i}]`).join("")}concat=n=${shotFiles.length}:v=1:a=0[cat]`;
  const faded = `[cat]fade=t=out:st=${(total - FADE).toFixed(2)}:d=${FADE}[outv]`;
  ff(
    ["-y", "-v", "error", ...inputs, "-filter_complex", `${chain};${cat};${faded}`, "-map", "[outv]",
     "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", joined],
    "join"
  );

  const silent = probe(joined);
  if (silent.hasAudio) {
    console.log("  ABORT: the joined footage has an audio stream. A model generated sound.");
    failures++;
    continue;
  }
  console.log(`  joined: ${silent.size}, ${silent.seconds.toFixed(2)}s, no audio stream`);

  /* ── 6. lay the voice on ───────────────────────────────────────────── */
  const voInputs = cues.flatMap((c) => ["-i", `${VO}/${c.file}.mp3`]);
  const delays = cues
    .map((c, i) => `[${i + 1}:a]adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)},volume=1.6[a${i}]`)
    .join(";");
  /* normalize=0 keeps a line at full volume. In week 1 that turned an overlap
   * into two voices shouting; with the lines laid end to end there is never
   * more than one speaking, so it only preserves level. */
  const mix = `${cues.map((_, i) => `[a${i}]`).join("")}amix=inputs=${cues.length}:normalize=0:dropout_transition=0[vo]`;
  const out = `${DIR}/out/${video.name}.mp4`;
  ff(
    ["-y", "-v", "error", "-i", joined, ...voInputs,
     "-filter_complex", `${delays};${mix};[vo]apad[voa]`,
     "-map", "0:v", "-map", "[voa]", "-shortest",
     "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", out],
    "voice"
  );

  const fin = probe(out);
  console.log(`  -> ${out}  ${fin.size}  ${fin.seconds.toFixed(2)}s  audio: ${fin.hasAudio ? "yes" : "NONE (bad)"}`);
  if (!fin.hasAudio) failures++;
  if (Math.abs(fin.seconds - total) > 0.6) {
    console.log(`  WARNING: finished length ${fin.seconds.toFixed(2)}s differs from planned ${total.toFixed(2)}s`);
  }
}

console.log(failures ? `\n${failures} problem(s).` : "\nAll videos built: no overlaps, no line off its picture.");
process.exit(failures ? 1 : 0);
