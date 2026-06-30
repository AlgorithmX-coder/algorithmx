import sharp from "sharp";
const names = ["shield", "telescope", "rocket", "building", "lock", "galaxy", "family"];
const cell = 280, cols = 4, rows = 2, pad = 10;
const W = cols * cell, H = rows * cell;
const bg = { r: 13, g: 19, b: 44, alpha: 1 };
const base = sharp({ create: { width: W, height: H, channels: 4, background: bg } });
const comps = [];
for (let i = 0; i < names.length; i++) {
  const buf = await sharp(`art-review/hub-${names[i]}.png`)
    .resize(cell - 2 * pad, cell - 2 * pad, { fit: "contain", background: bg })
    .toBuffer();
  const col = i % cols, row = (i / cols) | 0;
  comps.push({ input: buf, left: col * cell + pad, top: row * cell + pad });
}
await base.composite(comps).png().toFile("art-review/_hub-contact.png");
console.log("contact sheet -> art-review/_hub-contact.png");
