/* Print the exact Kling params for one week's four shots.
 *
 *   node scripts/week-video-kling-plan.mjs --week=4
 *
 * Each shot is pinned at both ends, so every render needs a startFrame, an
 * endFrame, the shot's own motion line and its own duration. That is thirty-two
 * shots across the eight weeks, each one a chance to paste week 5's end frame
 * into week 4's shot, so this assembles the call rather than leaving it to be
 * retyped.
 *
 * ── WHY THE DURATION IS COMPUTED, NOT WRITTEN DOWN ───────────────────────
 * Every week was first ordered as a 10s opening shot and a 7s closer, because
 * that is what week 2 used. Once the build started reporting how long it had
 * to freeze a shot's last frame to let the voice finish, the 10s turned out to
 * be short on all eight weeks - by 1.0s on week 8 and by 4.2s on week 4 - and
 * five of the closers were short too. Nothing was wrong with the pictures; the
 * footage was simply never ordered long enough for the words.
 *
 * So the duration asked of the video model comes from the voice that will go
 * over it: the recorded mp3s for that shot's lines, plus the lead, the gaps
 * and the tail the build will lay them out with. A shot is ordered long enough
 * to hold its own words, and the build's freeze-the-last-frame hold goes back
 * to being a rounding allowance rather than the thing covering a shortfall.
 */
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const weekArg = process.argv.find((a) => a.startsWith("--week="));
const N = Number(weekArg.split("=")[1]);
const WW = String(N).padStart(2, "0");

/* These must match week-video-build.mjs, or a shot is ordered to a length the
 * build then disagrees with. */
const GAP = 0.4;
const LEAD = 0.6;
const SHOT_TAIL = 0.5;
/** Kling's own limits. */
const MIN = 3;
const MAX = 30;

const wk = await import(`./week-videos/w${WW}.mjs`);
const man = JSON.parse(await readFile(".art-check/wk-frames.json", "utf8"));
const frames = man[`w${WW}`] ?? {};

/* Frames whose local copy differs from the CDN original, because the trim pass
 * cut a real letterbox bar off them. Kling must be pinned to THESE, not to the
 * barred originals, or it animates the bar into the film. */
const UPLOADED = JSON.parse(await readFile(".art-check/wk-uploads.json", "utf8").catch(() => "{}"));

function seconds(file) {
  const e = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8" }).stderr || "";
  const d = /Duration: (\d+):(\d+):([0-9.]+)/.exec(e);
  if (!d) throw new Error(`cannot measure ${file}`);
  return +d[1] * 3600 + +d[2] * 60 + +d[3];
}

const ref = (name) => {
  const up = UPLOADED[`w${WW}/${name}`];
  if (up) return { type: "image", id: up.id, label: `w${WW}-${name}`, url: up.url };
  const r = frames[name];
  if (!r) throw new Error(`w${WW}/${name} is not in the manifest`);
  return { type: "image", id: r.id, label: `w${WW}-${name}`, url: man._base + r.f };
};

/* Past this the pinned pair reads as slow motion. Owner, 2026-10-29: "when it
 * shows Adam and Layla is too slow motion." Week 3's opening shot was ordered
 * at 15s to fit three lines, and one gesture spread over 15s is slow motion
 * whatever the prompt says. The three-shot weeks keep every shot under this;
 * the warning is here so a long one can never be ordered unnoticed again. */
const SLOW_RISK = 8;

for (const video of wk.VIDEOS) {
  video.shots.forEach((s, i) => {
    const lines = video.lines.filter((l) => l.shot === i + 1);
    let t = LEAD;
    for (const l of lines) t += seconds(`.art-check/w${WW}-video/vo/${l.file}.mp3`) + GAP;
    const needs = t - GAP + SHOT_TAIL;

    /* `seconds` in the week file is a FLOOR, not a target: a shot may be
     * ordered a little longer than its voice needs so the action has room to
     * play at a natural speed, which is the rest of the owner's note. */
    const floor = s.seconds ?? 0;
    const duration = Math.min(MAX, Math.max(MIN, floor, Math.ceil(needs)));

    console.log(
      `\n@@@ w${WW} ${s.file}  ${duration}s   (voice needs ${needs.toFixed(1)}s, floor ${floor}s: ${lines
        .map((l) => l.file)
        .join(", ")})`
    );
    if (duration > SLOW_RISK) {
      console.log(`!!! ${duration}s is over ${SLOW_RISK}s: SLOW-MOTION RISK, split this shot instead`);
    }
    console.log(
      JSON.stringify({
        prompt: wk.MOTION[s.file],
        duration,
        resolution: "1080p",
        /* A chained shot starts on the previous shot's END frame - the same
         * picture - so the two clips join with no seam and neither has to
         * cover much distance. */
        startFrame: ref(s.startFrom ?? `${s.file}-start`),
        endFrame: ref(`${s.file}-end`),
      })
    );
  });
}
