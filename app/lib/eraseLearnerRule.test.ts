import { describe, expect, it } from "vitest";
import { eraseRefusal, isFirmSeatEntitlement, planSeats, type EraseEntitlement, type EraseFacts } from "./eraseLearnerRule";

/* Who the staff erase tool may remove. A firm learner always holds BUNDLE
 * entitlements to every Cyber Secured track (claiming a seat grants them),
 * so those must not block the erase; a consumer PURCHASE always must. */

const bundle = (slug: string, name: string): EraseEntitlement => ({ source: "BUNDLE", productSlug: slug, productName: name });
const FIRM_SEAT: EraseEntitlement[] = [bundle("ai-cleared", "AI Cleared"), bundle("ai-fluent", "AI Fluent"), bundle("cyber-awareness", "Cyber Awareness")];
const facts = (over: Partial<EraseFacts> = {}): EraseFacts => ({ role: "learner", entitlements: [], children: 0, proProgress: 0, classesTaught: 0, teacherInvites: 0, ...over });

describe("eraseRefusal", () => {
  it("allows a firm learner whose only entitlements came from the seat", () => {
    expect(eraseRefusal(facts({ entitlements: FIRM_SEAT }))).toBeNull();
  });

  it("allows someone with no entitlements at all (invited, never claimed)", () => {
    expect(eraseRefusal(facts())).toBeNull();
  });

  it("refuses a consumer who paid, and says why", () => {
    const msg = eraseRefusal(facts({ entitlements: [{ source: "PURCHASE", productSlug: "cyberstart-pro", productName: "Cyber Pro" }] }));
    expect(msg).toMatch(/bought Cyber Pro as an individual/);
    expect(msg).toMatch(/refund/);
    expect(msg).toMatch(/Nothing has been deleted\./);
  });

  it("refuses a firm learner who ALSO paid for a consumer course (mixed)", () => {
    const msg = eraseRefusal(facts({ entitlements: [...FIRM_SEAT, { source: "PURCHASE", productSlug: "cyberstart-pro", productName: "Cyber Pro" }] }));
    expect(msg).toMatch(/bought Cyber Pro/);
  });

  it("refuses a PURCHASE even on a firm track slug (only the seat's BUNDLE counts)", () => {
    expect(eraseRefusal(facts({ entitlements: [{ source: "PURCHASE", productSlug: "ai-cleared", productName: "AI Cleared" }] }))).toMatch(/bought AI Cleared/);
  });

  it("refuses a firm learner who also has free or staff-granted access of their own", () => {
    const msg = eraseRefusal(facts({ entitlements: [...FIRM_SEAT, { source: "MANUAL", productSlug: "desk-ready", productName: "Desk Ready" }] }));
    expect(msg).toMatch(/its own access to Desk Ready/);
  });

  it("refuses a BUNDLE that is not a Cyber Secured track (a school place)", () => {
    expect(eraseRefusal(facts({ entitlements: [bundle("cyber-heroes", "Cyber Heroes")] }))).toMatch(/its own access to Cyber Heroes/);
  });

  it("refuses an account with child profiles", () => {
    expect(eraseRefusal(facts({ entitlements: FIRM_SEAT, children: 2 }))).toMatch(/2 child profiles/);
  });

  it("refuses a school teacher, whose erase would delete their classes", () => {
    expect(eraseRefusal(facts({ entitlements: FIRM_SEAT, classesTaught: 1 }))).toMatch(/teaches a class/);
    expect(eraseRefusal(facts({ teacherInvites: 1 }))).toMatch(/school's staff/);
  });

  it("refuses an account with its own Cyber Pro progress", () => {
    expect(eraseRefusal(facts({ entitlements: FIRM_SEAT, proProgress: 3 }))).toMatch(/Cyber Pro progress/);
  });

  it("refuses a staff account", () => {
    expect(eraseRefusal(facts({ role: "staff", entitlements: FIRM_SEAT }))).toMatch(/staff account/);
  });

  it("names the PURCHASE before anything else, so staff see the money first", () => {
    expect(eraseRefusal(facts({ children: 1, entitlements: [{ source: "PURCHASE", productSlug: "cyber-heroes", productName: "Cyber Heroes" }] }))).toMatch(/bought Cyber Heroes/);
  });
});

describe("isFirmSeatEntitlement", () => {
  it("is BUNDLE on a Cyber Secured track and nothing else", () => {
    for (const e of FIRM_SEAT) expect(isFirmSeatEntitlement(e)).toBe(true);
    expect(isFirmSeatEntitlement({ source: "MANUAL", productSlug: "ai-cleared", productName: "AI Cleared" })).toBe(false);
    expect(isFirmSeatEntitlement({ source: "PURCHASE", productSlug: "ai-fluent", productName: "AI Fluent" })).toBe(false);
    expect(isFirmSeatEntitlement(bundle("cyberstart", "Cyber Ops"))).toBe(false);
  });
});

describe("planSeats", () => {
  const d = (n: number) => new Date(2026, 0, n);

  it("keeps a claimed seat (still used) and removes an unclaimed invite", () => {
    const plan = planSeats([
      { id: "claimed", orgId: "a", course: "CYBER_SECURED", claimedAt: d(5), invitedAt: d(1) },
      { id: "pending", orgId: "b", course: "CYBER_SECURED", claimedAt: null, invitedAt: d(2) },
    ]);
    expect(plan).toEqual({ anonymise: ["claimed"], remove: ["pending"] });
  });

  it("keeps an old Cleared and Fluent seat at one firm together (one person, one seat)", () => {
    const plan = planSeats([
      { id: "cleared", orgId: "a", course: "AI_CLEARED", claimedAt: d(3), invitedAt: d(1) },
      { id: "fluent", orgId: "a", course: "AI_FLUENT", claimedAt: d(4), invitedAt: d(2) },
    ]);
    expect(plan.anonymise.sort()).toEqual(["cleared", "fluent"]);
    expect(plan.remove).toEqual([]);
  });

  it("drops the later of two claimed seats on the same course at one firm", () => {
    const plan = planSeats([
      { id: "second", orgId: "a", course: "CYBER_SECURED", claimedAt: d(9), invitedAt: d(2) },
      { id: "first", orgId: "a", course: "CYBER_SECURED", claimedAt: d(3), invitedAt: d(1) },
    ]);
    expect(plan).toEqual({ anonymise: ["first"], remove: ["second"] });
  });
});
