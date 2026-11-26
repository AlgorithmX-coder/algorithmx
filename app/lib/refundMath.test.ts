import { describe, expect, it } from "vitest";
import { consumerFullyRefunded, lowerCount, refundedUnits } from "./refundMath";

describe("refundedUnits", () => {
  it("is every unit on a full refund", () => {
    expect(refundedUnits({ units: 50, paidPence: 300000, refundedPence: 300000 })).toBe(50);
    expect(refundedUnits({ units: 50, paidPence: 300000, refundedPence: 1, fully: true })).toBe(50);
  });

  it("is the share of the money, rounded down, on a partial refund", () => {
    expect(refundedUnits({ units: 50, paidPence: 300000, refundedPence: 150000 })).toBe(25);
    expect(refundedUnits({ units: 50, paidPence: 300000, refundedPence: 5999 })).toBe(0);
    expect(refundedUnits({ units: 10, paidPence: 100000, refundedPence: 99999 })).toBe(9);
  });

  it("is nothing when nothing is refunded or nothing was paid", () => {
    expect(refundedUnits({ units: 10, paidPence: 100000, refundedPence: 0 })).toBe(0);
    expect(refundedUnits({ units: 10, paidPence: 0, refundedPence: 0 })).toBe(0);
  });

  it("never exceeds the units bought", () => {
    expect(refundedUnits({ units: 10, paidPence: 100000, refundedPence: 200000 })).toBe(10);
  });
});

describe("lowerCount", () => {
  it("takes the refunded units off", () => {
    expect(lowerCount({ current: 100, remove: 50, inUse: 20 })).toEqual({ next: 50, removed: 50, clamped: false });
  });

  it("stops at what is in use, and says so", () => {
    expect(lowerCount({ current: 100, remove: 50, inUse: 70 })).toEqual({ next: 70, removed: 30, clamped: true });
    expect(lowerCount({ current: 50, remove: 50, inUse: 50 })).toEqual({ next: 50, removed: 0, clamped: true });
  });

  it("never raises a count that is already below what is in use", () => {
    expect(lowerCount({ current: 10, remove: 5, inUse: 12 })).toEqual({ next: 10, removed: 0, clamped: true });
  });

  it("changes nothing when nothing comes off", () => {
    expect(lowerCount({ current: 10, remove: 0, inUse: 3 })).toEqual({ next: 10, removed: 0, clamped: false });
  });
});

describe("consumerFullyRefunded", () => {
  it("is true only when the whole payment is back", () => {
    expect(consumerFullyRefunded({ paidPence: 9900, refundedPence: 9900 })).toBe(true);
    expect(consumerFullyRefunded({ paidPence: 9900, refundedPence: 1000 })).toBe(false);
    expect(consumerFullyRefunded({ paidPence: 9900, refundedPence: 1000, fully: true })).toBe(true);
    expect(consumerFullyRefunded({ paidPence: 0, refundedPence: 0 })).toBe(false);
  });
});
