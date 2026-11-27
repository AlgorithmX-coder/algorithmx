import { describe, expect, it } from "vitest";
import { STREAM_COLOURS, streamPath, streamZones } from "./frontFx";

describe("front door streams", () => {
  it("uses both side margins when each is wide enough", () => {
    /* 1366 wide, a 444 console centred */
    const zs = streamZones(1366, { left: 461, right: 905, bottom: 600 });
    expect(zs).not.toBeNull();
    expect(zs).toHaveLength(2);
    const [l, r] = zs!;
    expect(l.side).toBe(-1);
    expect(r.side).toBe(1);
    /* never under the console: the left zone ends before it, the right starts after it */
    expect(l.x + l.w).toBeLessThan(461);
    expect(r.x).toBeGreaterThan(905);
  });

  it("falls back to the phone strip when a margin is too narrow", () => {
    expect(streamZones(390, { left: 16, right: 374, bottom: 600 })).toBeNull();
    /* a wide console with one roomy side still falls back: the six need both */
    expect(streamZones(1366, { left: 120, right: 1100, bottom: 600 })).toBeNull();
  });

  it("draws each path from just below the bottom edge up to the top line", () => {
    const pts = streamPath(200, 300, 120, 768, 0, -1);
    expect(pts).toHaveLength(141);
    expect(pts[0].y).toBe(774);
    expect(pts[140].y).toBeCloseTo(120);
    expect(pts[0].x).toBe(200);
  });

  it("has one colour per course stream", () => {
    expect(STREAM_COLOURS).toHaveLength(6);
    for (const c of STREAM_COLOURS) expect(c).toMatch(/^\d{1,3},\d{1,3},\d{1,3}$/);
  });
});
