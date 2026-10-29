/* Build the review page for every week whose films are finished.
 *
 *   node scripts/week-video-page.mjs
 *
 * The page's whole value is the cue sheet beside each film: who speaks, when,
 * and over which picture. That is sixteen rows per week and it is exactly the
 * sort of table that goes stale the moment a line is re-recorded - week 5's
 * "a shield of kind" fix moved every cue after it. So the page is generated
 * from the same two sources the build uses, the week file and the measured
 * mp3s, and the timing maths below is the build's, not a copy of its output.
 *
 * Keep GAP / LEAD / SHOT_TAIL in step with week-video-build.mjs.
 */
import { readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const OUT = "C:/Users/Asad Jalal/code/algorithmx/.w03-publish";
const GAP = 0.4;
const LEAD = 0.6;
const SHOT_TAIL = 0.5;

function probe(file) {
  const e = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8" }).stderr || "";
  const d = /Duration: (\d+):(\d+):([0-9.]+)/.exec(e);
  return d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0;
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/'/g, "&rsquo;").replace(/"/g, "&quot;");

/* A bracketed delivery note is direction, not words the child hears, so it is
 * set apart rather than read as part of the line. */
const say = (t) => esc(t).replace(/^\[([^\]]+)\]\s*/, (_, d) => `<em>[${d}]</em> `);

const weeks = [];
for (const n of (await readdir("scripts/week-videos")).filter((f) => /^w\d\d\.mjs$/.test(f)).sort()) {
  const WW = n.slice(1, 3);
  const wk = await import(`./week-videos/${n}`);
  const films = [];

  for (const video of wk.VIDEOS) {
    const built = `.art-check/w${WW}-video/out/${video.name}.mp4`;
    if (!existsSync(built)) continue;
    /* A week only reaches the page once its film has been compressed into the
     * publish folder. Without this the page happily writes a <video> tag for
     * a file that was never staged, and the reviewer gets a dead player. */
    const kind = video.name.includes("intro") ? "intro" : "outro";
    if (!existsSync(`${OUT}/week-${WW}-${kind}.mp4`)) continue;

    /* The build's layout, re-run: each shot carries its own lines end to end
     * and then lasts whichever is longer, its footage or its words. */
    const native = video.shots.map((s) => probe(`.art-check/w${WW}-video/shots/${s.file}.mp4`));
    const cues = [];
    const spans = [];
    let clock = 0;
    for (let i = 0; i < video.shots.length; i++) {
      const from = clock;
      let cursor = clock + LEAD;
      let lastEnd = clock;
      for (const line of video.lines.filter((l) => l.shot === i + 1)) {
        const dur = probe(`.art-check/w${WW}-video/vo/${line.file}.mp3`);
        cues.push({ ...line, at: cursor, end: cursor + dur });
        lastEnd = cursor + dur;
        cursor = lastEnd + GAP;
      }
      const span = Math.max(native[i], lastEnd + SHOT_TAIL - from);
      spans.push({ from, to: from + span, beat: video.shots[i].beat });
      clock = from + span;
    }

    films.push({
      kind: kind === "intro" ? "Intro" : "Outro",
      src: `week-${WW}-${kind}.mp4`,
      poster: `poster-${WW}-${kind}.jpg`,
      runtime: probe(built),
      cues,
      spans,
    });
  }
  if (films.length) weeks.push({ WW, no: Number(WW), title: wk.TITLE, films });
}

const t = (x) => x.toFixed(1);

const sections = weeks
  .map(
    (w) => `
  <section class="week">
    <div class="week-head">
      <span class="week-no">Week ${w.no}</span>
      <h2>${esc(w.title)}</h2>
    </div>
${w.films
  .map(
    (f) => `
    <div class="film">
      <div class="film-head">
        <span class="tag${f.kind === "Outro" ? " out" : ""}">${f.kind}</span>
        <span class="runtime">${t(f.runtime)}s</span>
      </div>
      <video controls preload="metadata" playsinline poster="${f.poster}">
        <source src="${f.src}" type="video/mp4">
      </video>
      <div class="script">
        <h4>What you hear, and when</h4>
        <div class="cues">
${f.cues
  .map(
    (c) => {
      const cls = c.voice === "CALLUM" ? "callum" : "emma";
      const who = c.voice === "CALLUM" ? "Raccoon" : "Sarah";
      return `          <div class="cue"><span class="t">${t(c.at)} &ndash; ${t(
        c.end
      )}</span><span class="who ${cls}">${who}</span><p class="say">${say(c.text)}</p></div>`;
    }
  )
  .join("\n")}
        </div>
        <div class="shotline">
${f.spans
  .map(
    (s, i) =>
      `          <span class="swatch ${i === 0 ? "a" : "b"}"></span><b>${t(s.from)} &ndash; ${t(
        s.to
      )}</b> ${esc(s.beat)}`
  )
  .join("\n")}
        </div>
      </div>
    </div>`
  )
  .join("\n")}
  </section>`
  )
  .join("\n");

const pending = [2, 3, 4, 5, 6, 7, 8, 9, 10].filter((n) => !weeks.some((w) => w.no === n));

const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cyber Heroes Bookends</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Public+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
  /* A screening room: one committed dark world, because these are dark
     cinematic films and anything else makes the picture the dimmest thing on
     the page. Every colour is painted explicitly so the page holds on either
     host ground. */
  :root{
    --ground:#0e1218; --surface:#151b24; --surface-2:#1b2430; --line:#26323f;
    --text:#e9edf3; --muted:#8f9eb2; --amber:#f2a63b; --teal:#44b8ad;
    --amber-dim:#6b4a1c; --teal-dim:#1d4b48;
  }
  *{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%}
  body{
    margin:0;background:var(--ground);color:var(--text);
    font-family:"Public Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
    font-size:16px;line-height:1.6;
    padding-block:48px 72px;padding-left:16px;padding-right:16px;
  }
  .wrap{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:52px}
  header{display:flex;flex-direction:column;gap:10px}
  .eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;
    letter-spacing:.14em;text-transform:uppercase;color:var(--teal)}
  h1{font-family:Fraunces,Georgia,serif;font-weight:600;
    font-size:clamp(30px,5.5vw,44px);line-height:1.08;margin:0;text-wrap:balance;
    font-variation-settings:"opsz" 96}
  .sub{margin:0;color:var(--muted);max-width:60ch}

  .week{display:flex;flex-direction:column;gap:16px}
  .week-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;
    border-bottom:1px solid var(--line);padding-bottom:10px}
  .week-no{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;
    letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .week-head h2{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:23px;
    margin:0;font-variation-settings:"opsz" 40;flex:1 1 auto}

  .film{background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden}
  .film-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 20px 12px}
  .tag{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;
    letter-spacing:.12em;text-transform:uppercase;padding:4px 9px;border-radius:5px;
    background:var(--teal-dim);color:#aee9e3;border:1px solid #2f6b66}
  .tag.out{background:var(--amber-dim);color:#f6d6a4;border-color:#8a6228}
  .runtime{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13px;
    color:var(--muted);font-variant-numeric:tabular-nums;margin-left:auto}
  video{display:block;width:100%;height:auto;background:#000}

  .script{padding:4px 20px 20px}
  .script h4{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;
    letter-spacing:.14em;text-transform:uppercase;color:var(--muted);
    font-weight:600;margin:18px 0 10px}
  /* The cue sheet is as much the point as the video: it shows who speaks,
     when, and over which picture - the exact thing that was wrong in week 1
     and again, differently, in the first cut of week 3. */
  .cues{display:flex;flex-direction:column;gap:2px}
  .cue{display:grid;grid-template-columns:96px 74px 1fr;gap:12px;align-items:baseline;
    padding:9px 10px;border-radius:7px;background:var(--surface-2)}
  .cue .t{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;
    color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
  .who{font-size:13px;font-weight:700}
  .who.emma{color:var(--amber)}
  .who.callum{color:var(--teal)}
  .say{margin:0;font-size:15px}
  .say em{color:var(--muted);font-style:normal;font-size:13px}

  .shotline{display:flex;flex-direction:column;gap:6px;margin-top:14px;
    padding:10px 12px;border:1px dashed var(--line);border-radius:7px;
    font-size:13px;color:var(--muted)}
  .shotline > span.swatch{display:inline-block}
  .swatch{width:10px;height:10px;border-radius:2px;margin-right:8px;flex:none}
  .swatch.a{background:var(--teal)}
  .swatch.b{background:var(--amber)}
  .shotline b{color:var(--text);font-weight:500}

  .note{border-left:2px solid var(--teal);padding:2px 0 2px 16px;color:var(--muted);
    font-size:15px;display:flex;flex-direction:column;gap:12px}
  .note b{color:var(--text);font-weight:600}
  .note p{margin:0}

  @media (max-width:560px){
    .cue{grid-template-columns:1fr;gap:3px}
    .cue .t{font-size:11px}
  }
</style>
</head>
<body>
<div class="wrap">

  <header>
    <div class="eyebrow">Cyber Heroes &middot; intro and outro films</div>
    <h1>Cyber Heroes Bookends</h1>
    <p class="sub">Two short films per week, built from four pinned shots and eight recorded lines. Only Sarah and the Hacker Raccoon speak; the footage itself is silent.${
      pending.length
        ? ` ${pending.length === 1 ? `Week ${pending[0]} is` : `Weeks ${pending.slice(0, -1).join(", ")} and ${pending.at(-1)} are`} still rendering.`
        : ""
    }</p>
  </header>
${sections}

  <div class="note">
    <p><b>Two things to listen for.</b> No two voices ever speak at once, and no line finishes over a picture its speaker is not in. Both are enforced by the build rather than watched for: the lines are laid end to end from their measured lengths, and each line names the shot it belongs to, so a shot is held on screen until its own words have finished.</p>
    <p>The first cut of week 3 passed the overlap check and still had the Raccoon talking <b>2.7 seconds into the detectives&rsquo; shot</b>. Fixing it showed the opening shot had been ordered at a flat 10 seconds on every week, when the voice needed up to 15. Shot length now comes from the recorded audio.</p>
    <p>Week 3&rsquo;s Raccoon now holds a smiling <b>child&rsquo;s face</b> on a stick rather than a puppy&rsquo;s, since the case a child actually meets is a grown-up pretending to be a kid their own age. Reading all eight scripts together also caught three broken lines: week 5 said &ldquo;a shield of <b>kind</b>&rdquo; and &ldquo;<b>Kind</b> is stronger&rdquo;, and week 6 answered the Raccoon with &ldquo;It is not yours, Cyber Hero&rdquo; &mdash; which reads as telling the <em>child</em> the lobby is not theirs, one line after saying it is.</p>
  </div>

  <div class="note">
    <p><b>What changed at week 11.</b> Weeks 1 to 10 move too slowly, and the cause was not the wording that asked for a &ldquo;slow, smooth&rdquo; shot, though all forty clips did ask for exactly that. It was that a shot was ordered as long as the voice over it needed, so an opening shot carrying three lines ran to <b>fifteen seconds</b> while its two pinned pictures differed by one small gesture. Stretch one gesture across fifteen seconds and the model does not slow it down, it invents drift.</p>
    <p>So a week 11 shot carries <b>one line and one action</b>, and the action has an unmistakable before and after: a beacon goes from blazing to smothered, a lever is hauled down and the lamp bursts, three lights answer across the sea. The intro runs five shots rather than two. Two clips were rejected on the first pass for the old fault and rebuilt, one of which had warped a child&rsquo;s face while it drifted.</p>
    <p>Week 11 is also the week whose subject is hardest. The film never shows a child frightened and never names a helpline: the Raccoon&rsquo;s whole plan is to <b>keep it quiet</b>, and the answer is to light the lamp and have three lights answer back.</p>
  </div>

</div>
</body>
</html>
`;

await writeFile(`${OUT}/index.html`, html);
console.log(`${weeks.length} week(s) on the page: ${weeks.map((w) => w.no).join(", ")}`);
console.log(`${weeks.reduce((a, w) => a + w.films.length, 0)} films, ${
  weeks.reduce((a, w) => a + w.films.reduce((b, f) => b + f.cues.length, 0), 0)
} cues`);
if (pending.length) console.log(`still rendering: ${pending.join(", ")}`);
