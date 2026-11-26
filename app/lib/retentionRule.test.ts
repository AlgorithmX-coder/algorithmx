import { describe, expect, it } from "vitest";
import { RETENTION, SIGN_IN_CLOCK_START, daysBefore, individualVerdict, lastSeen, licenceEndedAt, pastGrace } from "./retentionRule";

const now = new Date("2029-06-01T00:00:00Z");
const ago = (days: number) => daysBefore(now, days);
const person = (over: Partial<Parameters<typeof individualVerdict>[0]> = {}) => ({
  lastSignInAt: ago(10),
  createdAt: ago(1000),
  retentionWarnedAt: null,
  purchasedAt: [],
  ...over,
});

describe("lastSeen", () => {
  it("uses the recorded sign-in when there is one", () => {
    expect(lastSeen({ lastSignInAt: ago(5), createdAt: ago(900) })).toEqual(ago(5));
  });
  it("never counts an unrecorded account from before the clock started", () => {
    expect(lastSeen({ lastSignInAt: null, createdAt: new Date("2025-01-01") })).toEqual(SIGN_IN_CLOCK_START);
  });
});

describe("individualVerdict", () => {
  it("keeps somebody who signed in this month", () => {
    expect(individualVerdict(person(), now)).toBe("keep");
  });
  it("warns at 700 days quiet, and not before", () => {
    expect(individualVerdict(person({ lastSignInAt: ago(699) }), now)).toBe("keep");
    expect(individualVerdict(person({ lastSignInAt: ago(701) }), now)).toBe("warn");
  });
  it("never deletes cold: a long-silent account with no warning is warned first", () => {
    expect(individualVerdict(person({ lastSignInAt: ago(900) }), now)).toBe("warn");
  });
  it("deletes once warned 30 days ago and still silent", () => {
    expect(individualVerdict(person({ lastSignInAt: ago(760), retentionWarnedAt: ago(31) }), now)).toBe("delete");
  });
  it("waits out the full 30 days after the warning", () => {
    expect(individualVerdict(person({ lastSignInAt: ago(760), retentionWarnedAt: ago(10) }), now)).toBe("keep");
  });
  it("a sign-in after the warning cancels it", () => {
    /* signed in 701 days ago, warned 800 days ago: the warning is stale */
    expect(individualVerdict(person({ lastSignInAt: ago(701), retentionWarnedAt: ago(800) }), now)).toBe("warn");
  });
  it("holds an account with a purchase under six years old", () => {
    expect(
      individualVerdict(person({ lastSignInAt: ago(760), retentionWarnedAt: ago(40), purchasedAt: [ago(800)] }), now),
    ).toBe("hold_payment");
    expect(
      individualVerdict(person({ lastSignInAt: ago(760), retentionWarnedAt: ago(40), purchasedAt: [ago(RETENTION.paymentDays + 1)] }), now),
    ).toBe("delete");
  });
});

describe("licenceEndedAt and pastGrace", () => {
  it("a running licence has no end", () => {
    expect(licenceEndedAt({ revokedAt: null, trialExpiresAt: null }, now)).toBeNull();
    expect(licenceEndedAt({ revokedAt: null, trialExpiresAt: daysBefore(now, -5) }, now)).toBeNull();
  });
  it("ends at closing, or at an unconverted trial's end, whichever came first", () => {
    expect(licenceEndedAt({ revokedAt: ago(10), trialExpiresAt: ago(50) }, now)).toEqual(ago(50));
    expect(licenceEndedAt({ revokedAt: ago(10), trialExpiresAt: null }, now)).toEqual(ago(10));
  });
  it("is past grace only after 90 days", () => {
    expect(pastGrace({ revokedAt: ago(89), trialExpiresAt: null }, 90, now)).toBe(false);
    expect(pastGrace({ revokedAt: ago(91), trialExpiresAt: null }, 90, now)).toBe(true);
    expect(pastGrace({ revokedAt: null, trialExpiresAt: null }, 90, now)).toBe(false);
  });
});
