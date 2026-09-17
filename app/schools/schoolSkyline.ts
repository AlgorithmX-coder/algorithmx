/**
 * The school on the horizon of the schools backdrop: a British school at
 * dawn (Victorian bell tower, academy block, sports hall, a village primary
 * with a gable clock, railings, trees and a distant town).
 *
 * The silhouette and its rim light are drawn once per size into an
 * offscreen canvas. Windows, the belfry and the clock faces are painted on
 * top each time something changes, so classrooms can light up as the reader
 * scrolls and the clocks can show the real time. No per-frame work.
 */

export interface SkyWindow {
  x: number;
  y: number;
  w: number;
  h: number;
  /** A pupil's screen (cyan) rather than a classroom light (amber). */
  screen: boolean;
  arch: boolean;
  /** 0..1: windows light up in this order as the page is read. */
  order: number;
  /** The belfry and entrances are lit from the start. */
  always: boolean;
}

export interface SkyClock {
  x: number;
  y: number;
  r: number;
}

export interface Skyline {
  W: number;
  H: number;
  base: HTMLCanvasElement;
  windows: SkyWindow[];
  clocks: SkyClock[];
}

export interface SkySprites {
  amber: HTMLCanvasElement;
  cyan: HTMLCanvasElement;
}

type Rand = () => number;

/** Where the sun sits (and the bell tower stands), as a share of the width. */
export const sunShare = (W: number) => (W < 700 ? 0.5 : 0.63);

/** Skyline canvas height for a viewport. */
export const skylineHeight = (W: number, H: number) =>
  W < 700 ? Math.round(Math.min(130, Math.max(96, H * 0.14))) : Math.round(Math.min(210, Math.max(132, H * 0.2)));

export function buildSkyline(W: number, H: number, dpr: number, rand: Rand): Skyline {
  const s = H / 230; // design units: the bell tower's vane sits 234 units up
  const G = H; // ground line
  const sunX = W * sunShare(W);
  const back: Path2D[] = [];
  const front: Path2D[] = [];
  const windows: SkyWindow[] = [];
  const clocks: SkyClock[] = [];
  const distantLights: [number, number][] = [];

  const rect = (list: Path2D[], x: number, y: number, w: number, h: number) => {
    const p = new Path2D();
    p.rect(x, y, w, h);
    list.push(p);
  };
  const poly = (list: Path2D[], pts: number[]) => {
    const p = new Path2D();
    p.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]);
    p.closePath();
    list.push(p);
  };
  const circle = (list: Path2D[], x: number, y: number, r: number) => {
    const p = new Path2D();
    p.arc(x, y, r, 0, Math.PI * 2);
    list.push(p);
  };
  const win = (x: number, y: number, w: number, h: number, screen = false, arch = false, always = false) => {
    windows.push({ x, y, w, h, screen, arch, always, order: rand() });
  };

  // The Victorian main school: two gables, chimneys and a bell tower with a
  // clock, standing in front of the sun.
  const victorian = (cx: number): [number, number] => {
    const bw = 360 * s;
    const wall = 64 * s;
    const x0 = cx - bw / 2;
    const top = G - wall;
    rect(front, x0, top, bw, wall + 1);
    poly(front, [x0 - 6 * s, top + 1, x0 + 24 * s, top - 24 * s, x0 + bw - 24 * s, top - 24 * s, x0 + bw + 6 * s, top + 1]);
    for (const gx of [x0 + 54 * s, x0 + bw - 54 * s]) {
      poly(front, [gx - 44 * s, top + 2 * s, gx, top - 50 * s, gx + 44 * s, top + 2 * s]);
      rect(front, gx - 1.2 * s, top - 60 * s, 2.4 * s, 12 * s);
      for (const dx of [-16, 0, 16]) {
        const tall = dx === 0 ? 32 : 26;
        win(gx + dx * s - 5 * s, top + (dx === 0 ? 8 : 14) * s, 10 * s, tall * s, false, true);
      }
    }
    for (const chx of [x0 + 104 * s, x0 + bw - 116 * s]) {
      rect(front, chx, top - 42 * s, 12 * s, 20 * s);
      rect(front, chx - 2 * s, top - 45 * s, 16 * s, 4 * s);
    }
    for (const [a, b] of [
      [x0 + 104 * s, cx - 30 * s],
      [cx + 30 * s, x0 + bw - 104 * s],
    ]) {
      for (let x = a; x + 9 * s <= b; x += 18 * s) win(x, top + 16 * s, 9 * s, 22 * s, false, true);
    }
    // Bell tower.
    rect(front, cx - 19 * s, top - 76 * s, 38 * s, 77 * s);
    rect(front, cx - 23 * s, top - 81 * s, 46 * s, 5 * s);
    rect(front, cx - 16 * s, top - 109 * s, 32 * s, 29 * s);
    rect(front, cx - 20 * s, top - 114 * s, 40 * s, 5 * s);
    poly(front, [cx - 19 * s, top - 113 * s, cx, top - 152 * s, cx + 19 * s, top - 113 * s]);
    rect(front, cx - 1 * s, top - 170 * s, 2 * s, 19 * s);
    poly(front, [
      cx - 9 * s, top - 164.5 * s,
      cx + 7 * s, top - 164.5 * s,
      cx + 7 * s, top - 167.5 * s,
      cx + 12.5 * s, top - 163.5 * s,
      cx + 7 * s, top - 159.5 * s,
      cx + 7 * s, top - 162.5 * s,
      cx - 9 * s, top - 162.5 * s,
    ]);
    win(cx - 8 * s, top - 106 * s, 16 * s, 22 * s, false, true, true); // belfry
    clocks.push({ x: cx, y: top - 52 * s, r: 10 * s });
    win(cx - 6 * s, top - 34 * s, 12 * s, 26 * s, false, true);
    win(cx - 10 * s, G - 30 * s, 20 * s, 30 * s, false, true, true); // entrance
    return [x0 - 6 * s, x0 + bw + 6 * s];
  };

  // A modern academy block with a glazed stair core. Returns its left edge.
  const academy = (right: number) => {
    const bw = 250 * s;
    const hgt = 58 * s;
    const x = right - bw;
    const top = G - hgt;
    rect(front, x, top, bw, hgt + 1);
    rect(front, x - 4 * s, top - 5 * s, bw + 8 * s, 5 * s);
    rect(front, x + 16 * s, top - 34 * s, 54 * s, 35 * s);
    rect(front, x + 13 * s, top - 38 * s, 60 * s, 4 * s);
    for (const cy of [top - 27 * s, top - 15 * s]) {
      for (const cx of [x + 24 * s, x + 47 * s]) win(cx, cy, 15 * s, 8 * s, rand() < 0.5);
    }
    for (const cy of [top + 12 * s, top + 32 * s]) {
      for (let cx = x + 24 * s; cx + 15 * s <= x + bw - 14 * s; cx += 22 * s) win(cx, cy, 15 * s, 11 * s, rand() < 0.55);
    }
    return x - 4 * s;
  };

  // A sports hall with a barrel roof. Returns its right edge.
  const hall = (left: number) => {
    const bw = 190 * s;
    const hgt = 42 * s;
    const top = G - hgt;
    rect(front, left, top, bw, hgt + 1);
    const p = new Path2D();
    p.moveTo(left - 4 * s, top + 1);
    p.quadraticCurveTo(left + bw / 2, top - 48 * s, left + bw + 4 * s, top + 1);
    p.closePath();
    front.push(p);
    for (let i = 0; i < 7; i++) win(left + 18 * s + i * 23 * s, top + 9 * s, 14 * s, 7 * s);
    return left + bw + 4 * s;
  };

  // A village primary with a clock in its gable. Returns its right edge.
  const primary = (left: number) => {
    const bw = 176 * s;
    const hgt = 38 * s;
    const top = G - hgt;
    const cx = left + bw / 2;
    rect(front, left, top, bw, hgt + 1);
    poly(front, [left - 5 * s, top + 1, left + 18 * s, top - 20 * s, left + bw - 18 * s, top - 20 * s, left + bw + 5 * s, top + 1]);
    poly(front, [cx - 32 * s, top + 2 * s, cx, top - 42 * s, cx + 32 * s, top + 2 * s]);
    clocks.push({ x: cx, y: top - 14 * s, r: 7.5 * s });
    for (let x = left + 14 * s; x + 13 * s <= left + bw - 12 * s; x += 24 * s) {
      if (Math.abs(x + 6.5 * s - cx) < 22 * s) continue;
      win(x, top + 11 * s, 13 * s, 15 * s, rand() < 0.3);
    }
    win(cx - 8 * s, G - 24 * s, 16 * s, 24 * s, false, true);
    return left + bw + 5 * s;
  };

  const house = (left: number) => {
    const bw = (40 + rand() * 26) * s;
    const hgt = (24 + rand() * 12) * s;
    const top = G - hgt;
    rect(front, left, top, bw, hgt + 1);
    poly(front, [left - 3 * s, top + 1, left + bw / 2, top - bw * 0.46, left + bw + 3 * s, top + 1]);
    rect(front, left + bw * 0.66, top - bw * 0.4, 6 * s, bw * 0.26);
    const n = bw > 52 * s ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const wx = n === 1 ? left + bw / 2 - 4 * s : left + bw * (0.27 + 0.46 * i) - 4 * s;
      win(wx, top + 8 * s, 8 * s, 8 * s, rand() < 0.2);
    }
    return left + bw + 3 * s;
  };

  const tree = (x: number, size: number) => {
    const k = size * s;
    rect(front, x - 2 * k, G - 16 * k, 4 * k, 17 * k);
    circle(front, x, G - 34 * k, 16 * k);
    circle(front, x - 12 * k, G - 24 * k, 12 * k);
    circle(front, x + 12 * k, G - 26 * k, 13 * k);
    return x + 26 * k;
  };

  const poplar = (x: number, size: number) => {
    const k = size * s;
    rect(front, x - 1.5 * k, G - 10 * k, 3 * k, 11 * k);
    const p = new Path2D();
    p.ellipse(x, G - 36 * k, 9 * k, 28 * k, 0, 0, Math.PI * 2);
    front.push(p);
    return x + 11 * k;
  };

  const railings = (a: number, b: number) => {
    rect(front, a, G - 13 * s, b - a, 1.6 * s);
    rect(front, a, G - 5 * s, b - a, 1.6 * s);
    for (let x = a; x <= b; x += 7 * s) rect(front, x, G - 17 * s, 1.5 * s, 17 * s);
  };

  // Distant town behind the school.
  for (let bx = -10 * s; bx < W; ) {
    const r = rand();
    const segW = (30 + rand() * 60) * s;
    const hgt = (44 + rand() * 40) * s;
    if (r < 0.1) {
      rect(back, bx, G - hgt, segW * 0.8, hgt + 1);
      const tw = 16 * s;
      const tx = bx + segW * 0.8 - tw;
      rect(back, tx, G - hgt - 34 * s, tw, 35 * s);
      poly(back, [tx - 2 * s, G - hgt - 33 * s, tx + tw / 2, G - hgt - 84 * s, tx + tw + 2 * s, G - hgt - 33 * s]);
    } else if (r < 0.2) {
      const fh = hgt + (40 + rand() * 30) * s;
      const fw = segW * 0.6;
      rect(back, bx, G - fh, fw, fh + 1);
      for (let yy = G - fh + 8 * s; yy < G - 20 * s; yy += 10 * s) {
        for (let xx = bx + 5 * s; xx < bx + fw - 5 * s; xx += 9 * s) if (rand() < 0.22) distantLights.push([xx, yy]);
      }
    } else if (r < 0.62) {
      rect(back, bx, G - hgt, segW, hgt + 1);
      poly(back, [bx - 2 * s, G - hgt + 1, bx + segW / 2, G - hgt - segW * 0.3, bx + segW + 2 * s, G - hgt + 1]);
      if (rand() < 0.4) distantLights.push([bx + segW * 0.3, G - hgt + 10 * s]);
    } else {
      const k = (0.9 + rand() * 0.8) * s;
      circle(back, bx + 14 * k, G - hgt * 0.8, 20 * k);
      circle(back, bx + 34 * k, G - hgt * 0.7, 16 * k);
      rect(back, bx, G - hgt * 0.72, 50 * k, hgt * 0.72 + 1);
    }
    bx += segW + rand() * 8 * s;
  }

  // The campus, built outward from the bell tower.
  const [schoolL, schoolR] = victorian(sunX);
  const academyL = academy(schoolL - 22 * s);
  tree(schoolL - 11 * s, 0.7);
  const hallR = hall(schoolR + 26 * s);
  poplar(schoolR + 13 * s, 0.85);
  railings(academyL - 30 * s, hallR + 30 * s);

  let placedPrimary = false;
  for (let x = -20 * s; x < academyL - 60 * s; ) {
    const r = rand();
    if (!placedPrimary && r < 0.45 && x + 200 * s < academyL - 40 * s) {
      x = primary(x + 12 * s) + 18 * s;
      placedPrimary = true;
    } else if (r < 0.6) x = tree(x + 16 * s, 0.8 + rand() * 0.5) + 6 * s;
    else if (r < 0.72) x = poplar(x + 8 * s, 0.8 + rand() * 0.5) + 6 * s;
    else if (x + 70 * s < academyL - 40 * s) x = house(x + 6 * s) + 6 * s;
    else x = tree(x + 16 * s, 0.7) + 6 * s;
  }
  for (let x = hallR + 24 * s; x < W + 20 * s; ) {
    const r = rand();
    if (!placedPrimary && r < 0.4 && x + 190 * s < W) {
      x = primary(x + 10 * s) + 16 * s;
      placedPrimary = true;
    } else if (r < 0.55) x = tree(x + 16 * s, 0.8 + rand() * 0.5) + 6 * s;
    else if (r < 0.7) x = poplar(x + 8 * s, 0.8 + rand() * 0.5) + 6 * s;
    else x = house(x + 6 * s) + 6 * s;
  }

  // Pre-render: distant town in dawn haze, then the rim-lit silhouette.
  const base = document.createElement("canvas");
  base.width = Math.max(1, Math.round(W * dpr));
  base.height = Math.max(1, Math.round(H * dpr));
  const c = base.getContext("2d");
  if (c) {
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const reach = Math.max(W * 0.55, 420);
    const haze = c.createRadialGradient(sunX, G, 0, sunX, G, reach);
    haze.addColorStop(0, "rgb(112,66,116)");
    haze.addColorStop(0.45, "rgb(62,42,96)");
    haze.addColorStop(1, "rgb(30,26,66)");
    c.fillStyle = haze;
    for (const p of back) c.fill(p);
    c.fillStyle = "rgba(255,200,140,0.55)";
    for (const [lx, ly] of distantLights) c.fillRect(lx, ly, 2 * s, 2 * s);

    const rim = c.createRadialGradient(sunX, G, 0, sunX, G, Math.max(W * 0.5, 380));
    rim.addColorStop(0, "rgba(255,196,124,0.95)");
    rim.addColorStop(0.35, "rgba(255,142,108,0.5)");
    rim.addColorStop(1, "rgba(150,140,255,0.16)");
    c.strokeStyle = rim;
    c.lineWidth = 2.4;
    c.lineJoin = "round";
    for (const p of front) c.stroke(p);
    const ink = c.createLinearGradient(0, G - 180 * s, 0, G);
    ink.addColorStop(0, "#16112d");
    ink.addColorStop(1, "#06070f");
    c.fillStyle = ink;
    for (const p of front) c.fill(p);
  }

  return { W, H, base, windows, clocks };
}

const windowPath = (ctx: CanvasRenderingContext2D, wd: SkyWindow) => {
  ctx.beginPath();
  if (wd.arch) {
    const r = wd.w / 2;
    ctx.moveTo(wd.x, wd.y + wd.h);
    ctx.lineTo(wd.x, wd.y + r);
    ctx.arc(wd.x + r, wd.y + r, r, Math.PI, 0);
    ctx.lineTo(wd.x + wd.w, wd.y + wd.h);
    ctx.closePath();
  } else {
    ctx.rect(wd.x, wd.y, wd.w, wd.h);
  }
};

/**
 * Paints the skyline: silhouette, then windows. `lit` (0..1) is the share of
 * classrooms with their lights on; `off` holds windows briefly switched off.
 */
export function paintSkyline(
  ctx: CanvasRenderingContext2D,
  sky: Skyline,
  lit: number,
  off: Set<number>,
  sprites: SkySprites,
  now: Date,
) {
  ctx.clearRect(0, 0, sky.W, sky.H);
  ctx.drawImage(sky.base, 0, 0, sky.W, sky.H);

  for (let i = 0; i < sky.windows.length; i++) {
    const wd = sky.windows[i];
    const on = wd.always || (wd.order < lit && !off.has(i));
    if (on) {
      const g = Math.max(wd.w, wd.h) * (wd.always ? 4.4 : 3.2);
      ctx.globalAlpha = wd.screen ? 0.3 : 0.38;
      ctx.drawImage(wd.screen ? sprites.cyan : sprites.amber, wd.x + wd.w / 2 - g / 2, wd.y + wd.h / 2 - g / 2, g, g);
      ctx.globalAlpha = 1;
      ctx.fillStyle = wd.screen ? "rgba(150,238,255,0.92)" : "rgba(255,208,138,0.95)";
    } else {
      ctx.fillStyle = "rgba(150,160,220,0.09)";
    }
    windowPath(ctx, wd);
    ctx.fill();
    if (on && wd.arch && wd.w >= 7) {
      ctx.fillStyle = "rgba(22,17,45,0.55)";
      ctx.fillRect(wd.x + wd.w / 2 - 0.5, wd.y + wd.w * 0.55, 1, wd.h - wd.w * 0.55);
    }
  }

  const hours = (now.getHours() % 12) + now.getMinutes() / 60;
  const minutes = now.getMinutes();
  for (const k of sky.clocks) {
    const g = k.r * 5;
    ctx.globalAlpha = 0.45;
    ctx.drawImage(sprites.amber, k.x - g / 2, k.y - g / 2, g, g);
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,238,204,0.96)";
    ctx.fill();
    const ma = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
    const ha = (hours / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = "#1c1432";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1, k.r * 0.16);
    ctx.beginPath();
    ctx.moveTo(k.x, k.y);
    ctx.lineTo(k.x + Math.cos(ma) * k.r * 0.78, k.y + Math.sin(ma) * k.r * 0.78);
    ctx.moveTo(k.x, k.y);
    ctx.lineTo(k.x + Math.cos(ha) * k.r * 0.5, k.y + Math.sin(ha) * k.r * 0.5);
    ctx.stroke();
  }
}
