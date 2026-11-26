import { describe, expect, it } from "vitest";
import {
  CONFIRM_TTL_MS,
  checkJoinConfirm,
  domainAccepts,
  emailDomain,
  makeJoinConfirm,
  newStaffLinkToken,
  schoolDomainFrom,
} from "./staffLinkRule";

describe("schoolDomainFrom", () => {
  it("takes the school's own domain from the lead's address", () => {
    expect(schoolDomainFrom("Head@Oakwood.sch.uk")).toBe("oakwood.sch.uk");
  });
  it("gives no domain for a free provider, so the link cannot be locked", () => {
    for (const e of ["a@gmail.com", "a@outlook.com", "a@hotmail.co.uk", "a@icloud.com", "a@proton.me", "a@yahoo.com", "a@aol.com", "a@live.com"]) {
      expect(schoolDomainFrom(e)).toBeNull();
    }
  });
  it("gives no domain for something that is not an address", () => {
    expect(schoolDomainFrom("nobody")).toBeNull();
    expect(schoolDomainFrom(null)).toBeNull();
    expect(emailDomain("@x.com")).toBeNull();
  });
});

describe("domainAccepts", () => {
  it("lets anybody in when the link is unlocked", () => {
    expect(domainAccepts(null, "someone@gmail.com")).toBe(true);
  });
  it("lets in the domain and its subdomains", () => {
    expect(domainAccepts("oakwood.sch.uk", "t@oakwood.sch.uk")).toBe(true);
    expect(domainAccepts("oakwood.sch.uk", "T@Staff.Oakwood.sch.uk")).toBe(true);
  });
  it("keeps out other domains and look-alikes", () => {
    expect(domainAccepts("oakwood.sch.uk", "t@gmail.com")).toBe(false);
    expect(domainAccepts("oakwood.sch.uk", "t@notoakwood.sch.uk")).toBe(false);
    expect(domainAccepts("oakwood.sch.uk", "t@oakwood.sch.uk.evil.com")).toBe(false);
    expect(domainAccepts("oakwood.sch.uk", null)).toBe(false);
  });
});

describe("newStaffLinkToken", () => {
  it("is prefixed, long and different every time", () => {
    const a = newStaffLinkToken();
    expect(a).toMatch(/^staff-[a-z2-9]{20}$/);
    expect(newStaffLinkToken()).not.toBe(a);
  });
});

describe("join confirmation", () => {
  const secret = "s3cret";
  const now = 1_800_000_000_000;
  it("accepts its own signature for the same link and person", () => {
    const c = makeJoinConfirm(secret, "staff-abc", "u1", now);
    expect(checkJoinConfirm(secret, "staff-abc", "u1", c, now + 1000)).toBe(true);
  });
  it("refuses another person, a new link, a wrong secret or a late click", () => {
    const c = makeJoinConfirm(secret, "staff-abc", "u1", now);
    expect(checkJoinConfirm(secret, "staff-abc", "u2", c, now)).toBe(false);
    expect(checkJoinConfirm(secret, "staff-new", "u1", c, now)).toBe(false);
    expect(checkJoinConfirm("other", "staff-abc", "u1", c, now)).toBe(false);
    expect(checkJoinConfirm(secret, "staff-abc", "u1", c, now + CONFIRM_TTL_MS + 1)).toBe(false);
  });
  it("refuses junk and an empty secret", () => {
    expect(checkJoinConfirm(secret, "staff-abc", "u1", "nope", now)).toBe(false);
    expect(checkJoinConfirm(secret, "staff-abc", "u1", null, now)).toBe(false);
    const c = makeJoinConfirm("", "staff-abc", "u1", now);
    expect(checkJoinConfirm("", "staff-abc", "u1", c, now)).toBe(false);
  });
});
