import { describe, expect, it } from "vitest";
import { askLine, defaultTeamDomain, domainAllows, emailDomain, isFreeEmailDomain, newTeamToken, seatsTakenLine, teamJoinDecision, type TeamJoinInput, type TeamSeat } from "./teamLink";

const at = new Date("2026-11-20T10:00:00Z");
const seat = (over: Partial<TeamSeat> = {}): TeamSeat => ({ id: "s1", email: "hannah@kestrel.co.uk", userId: null, claimedAt: null, removedAt: null, ...over });
const input = (over: Partial<TeamJoinInput> = {}): TeamJoinInput => ({
  revoked: false,
  seatsPurchased: 50,
  used: 32,
  teamDomain: "kestrel.co.uk",
  userId: "u1",
  email: "hannah@kestrel.co.uk",
  seats: [],
  ...over,
});

describe("free email providers", () => {
  it.each(["gmail.com", "googlemail.com", "outlook.com", "hotmail.co.uk", "live.co.uk", "msn.com", "yahoo.com", "yahoo.co.uk", "icloud.com", "me.com", "aol.com", "proton.me", "protonmail.com", "gmx.de", "gmx.com", "btinternet.com"])("%s is free", (d) => {
    expect(isFreeEmailDomain(d)).toBe(true);
  });
  it.each(["kestrel.co.uk", "mail.kestrel.co.uk", "outlook-partners.com", "meridian.com", "nhs.net"])("%s is a firm's", (d) => {
    expect(isFreeEmailDomain(d)).toBe(false);
  });
});

describe("defaultTeamDomain", () => {
  it("locks to the lead's firm domain, lowercased", () => {
    expect(defaultTeamDomain(" Amara@Kestrel.CO.UK ")).toBe("kestrel.co.uk");
  });
  it("is off for a lead on a free provider", () => {
    expect(defaultTeamDomain("amara.k@gmail.com")).toBeNull();
    expect(defaultTeamDomain("amara@hotmail.co.uk")).toBeNull();
  });
  it("is off when there is no usable address", () => {
    expect(defaultTeamDomain(null)).toBeNull();
    expect(defaultTeamDomain("not-an-address")).toBeNull();
    expect(defaultTeamDomain("someone@localhost")).toBeNull();
  });
});

describe("domainAllows", () => {
  it("lets the firm's domain and its subdomains through", () => {
    expect(domainAllows("kestrel.co.uk", "tom@kestrel.co.uk")).toBe(true);
    expect(domainAllows("kestrel.co.uk", "tom@UK.Kestrel.co.uk")).toBe(true);
  });
  it("stops other domains, including lookalikes", () => {
    expect(domainAllows("kestrel.co.uk", "tom@gmail.com")).toBe(false);
    expect(domainAllows("kestrel.co.uk", "tom@notkestrel.co.uk")).toBe(false);
    expect(domainAllows("kestrel.co.uk", "tom@kestrel.co.uk.evil.com")).toBe(false);
  });
  it("lets everyone through when the lock is off", () => {
    expect(domainAllows(null, "tom@gmail.com")).toBe(true);
  });
  it("reads the domain after the last @", () => {
    expect(emailDomain("a@b@kestrel.co.uk")).toBe("kestrel.co.uk");
    expect(emailDomain("nobody")).toBe("");
  });
});

describe("newTeamToken", () => {
  it("is long, prefixed and from the unambiguous alphabet", () => {
    const t = newTeamToken();
    expect(t).toMatch(/^team-[a-hj-km-np-z2-9]{24}$/);
    expect(newTeamToken()).not.toBe(t);
  });
});

describe("teamJoinDecision", () => {
  it("gives a newcomer at the firm's domain a new seat", () => {
    expect(teamJoinDecision(input())).toEqual({ ok: true, kind: "new-seat" });
  });

  it("never gives the same person a second seat", () => {
    const d = teamJoinDecision(input({ seats: [seat({ userId: "u1", claimedAt: at })] }));
    expect(d).toEqual({ ok: true, kind: "already-in", seatId: "s1" });
  });

  it("recognises the person by account even under another address", () => {
    const d = teamJoinDecision(input({ email: "hannah.price@kestrel.co.uk", seats: [seat({ email: "h.price@kestrel.co.uk", userId: "u1", claimedAt: at })] }));
    expect(d).toEqual({ ok: true, kind: "already-in", seatId: "s1" });
  });

  it("matches the address whatever its case", () => {
    const d = teamJoinDecision(input({ email: "Hannah@Kestrel.co.uk", seats: [seat({ email: "hannah@kestrel.co.uk" })] }));
    expect(d).toEqual({ ok: true, kind: "claim-invite", seatId: "s1" });
  });

  it("lets someone already in through even when the seats are full and the domain has changed", () => {
    const d = teamJoinDecision(input({ used: 50, teamDomain: "other.com", seats: [seat({ userId: "u1", claimedAt: at })] }));
    expect(d.ok).toBe(true);
  });

  it("takes the invite already sent to them rather than a new seat, even when full", () => {
    const d = teamJoinDecision(input({ used: 50, seats: [seat()] }));
    expect(d).toEqual({ ok: true, kind: "claim-invite", seatId: "s1" });
  });

  it("honours an invite sent to an off-domain address", () => {
    const d = teamJoinDecision(input({ email: "sam@gmail.com", seats: [seat({ email: "sam@gmail.com" })] }));
    expect(d).toEqual({ ok: true, kind: "claim-invite", seatId: "s1" });
  });

  it("keeps a removed person out", () => {
    const d = teamJoinDecision(input({ seats: [seat({ userId: "u1", claimedAt: at, removedAt: at })] }));
    expect(d).toEqual({ ok: false, reason: "removed" });
  });

  it("lets a removed person back in once the lead invites them again", () => {
    const d = teamJoinDecision(input({ seats: [seat({ userId: "u1", claimedAt: null, removedAt: null })] }));
    expect(d).toEqual({ ok: true, kind: "claim-invite", seatId: "s1" });
  });

  it("refuses an address whose seat another account already claimed", () => {
    const d = teamJoinDecision(input({ seats: [seat({ userId: "u2", claimedAt: at })] }));
    expect(d).toEqual({ ok: false, reason: "taken" });
  });

  it("refuses an address outside the firm's domain", () => {
    expect(teamJoinDecision(input({ email: "tom@gmail.com" }))).toEqual({ ok: false, reason: "wrong-domain" });
  });

  it("lets any address in when the lock is off", () => {
    expect(teamJoinDecision(input({ teamDomain: null, email: "tom@gmail.com" }))).toEqual({ ok: true, kind: "new-seat" });
  });

  it("refuses a newcomer once every seat is used", () => {
    expect(teamJoinDecision(input({ used: 50 }))).toEqual({ ok: false, reason: "full" });
    expect(teamJoinDecision(input({ used: 49 }))).toEqual({ ok: true, kind: "new-seat" });
    expect(teamJoinDecision(input({ seatsPurchased: 0, used: 0 }))).toEqual({ ok: false, reason: "full" });
  });

  it("checks the domain before the count, so the message names the real problem", () => {
    expect(teamJoinDecision(input({ used: 50, email: "tom@gmail.com" }))).toEqual({ ok: false, reason: "wrong-domain" });
  });

  it("hands out nothing at a closed firm, even to someone already in", () => {
    expect(teamJoinDecision(input({ revoked: true, seats: [seat({ userId: "u1", claimedAt: at })] }))).toEqual({ ok: false, reason: "closed" });
  });
});

describe("words", () => {
  it("says how many seats are taken", () => {
    expect(seatsTakenLine(50)).toBe("All 50 seats are taken.");
    expect(seatsTakenLine(1)).toBe("The one seat is taken.");
    expect(seatsTakenLine(0)).toBe("There are no seats to give out yet.");
  });
  it("names the lead, or falls back to the admin", () => {
    expect(askLine("Amara Okafor", "for more.")).toBe("Ask Amara Okafor for more.");
    expect(askLine("  ", "for more.")).toBe("Ask your firm's admin for more.");
  });
});
