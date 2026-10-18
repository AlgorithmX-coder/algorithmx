/* Compose one reference image per week: Adam and Layla side by side in that
 * week's costume, flattened onto white.
 *
 * One image rather than two halves the uploads and, more usefully, shows the
 * model both characters together in the pose the badge wants - which is what
 * keeps them on-model and in the right costume for the week.
 *
 * Transparent PNGs are flattened first: a reference with an alpha channel
 * confuses the model about what the background should be, and the badge is
 * generated on pure white so it can be keyed afterwards.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const OUT = process.env.REF_DIR;
await mkdir(OUT, { recursive: true });

const COSTUME = {
  1: "locksmith", 2: "forgeapron", 3: "detective", 4: "fisher", 5: "artist",
  6: "esports", 7: "guard", 8: "photographer", 9: "inspector", 10: "rescue",
  11: "captain", 12: "ranger", 13: "pj", 14: "scout", 15: "reporter",
  16: "inspector", 17: "knight", 18: "pajama", 19: "cardigan", 20: "gradsuit",
};

const H = 760;
for (let w = 1; w <= 20; w++) {
  const ww = String(w).padStart(2, "0");
  const c = COSTUME[w];
  const a = `public/game/characters/w${ww}/adam-${c}-celebrate.png`;
  const l = `public/game/characters/w${ww}/layla-${c}-celebrate.png`;
  if (!existsSync(a) || !existsSync(l)) { console.log(`w${ww}  MISSING sprite(s)`); continue; }

  const [ab, lb] = await Promise.all([
    sharp(a).resize({ height: H, withoutEnlargement: true }).toBuffer(),
    sharp(l).resize({ height: H, withoutEnlargement: true }).toBuffer(),
  ]);
  const [am, lm] = await Promise.all([sharp(ab).metadata(), sharp(lb).metadata()]);
  const gap = 40, pad = 40;
  const width = am.width + gap + lm.width + pad * 2;
  const height = H + pad * 2;

  const file = `${OUT}/w${ww}-ref.png`;
  await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
    .composite([
      { input: ab, left: pad, top: pad },
      { input: lb, left: pad + am.width + gap, top: pad },
    ])
    .png()
    .toFile(file);
  console.log(`w${ww}  ${c.padEnd(13)} ${width}x${height}`);
}
