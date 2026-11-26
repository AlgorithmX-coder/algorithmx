import { beforeEach, describe, expect, it, vi } from "vitest";

/* Signing out of a course lands on that course's own sign-in page; a school
 * pupil still goes to the school door. auth, signOut and the pupil check are
 * stubbed so the test sees only where signOut was sent. */

const m = vi.hoisted(() => ({ auth: vi.fn(), signOut: vi.fn(), isSchoolPupil: vi.fn() }));
vi.mock("@/app/lib/auth", () => ({ auth: m.auth, signOut: m.signOut }));
vi.mock("@/app/lib/pupilAuth", () => ({ isSchoolPupil: m.isSchoolPupil }));

import { signOutOfCourse } from "./courseSignOut.actions";

const form = (course: string) => {
  const f = new FormData();
  f.set("course", course);
  return f;
};

describe("signOutOfCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.auth.mockResolvedValue({ user: { id: "u1" } });
    m.isSchoolPupil.mockResolvedValue(false);
  });

  for (const [course, to] of [
    ["cyber-heroes", "/cyberheroes/login"],
    ["cyberexplorers", "/cyberexplorers/login"],
    ["cyberstart", "/ops/login"],
    ["cyberstart-pro", "/pro/login"],
    ["desk-ready", "/desk-ready/login"],
  ] as const) {
    it(`${course} returns to ${to}`, async () => {
      await signOutOfCourse(form(course));
      expect(m.signOut).toHaveBeenCalledWith({ redirectTo: to });
    });
  }

  it("a school pupil goes back to the school door", async () => {
    m.isSchoolPupil.mockResolvedValue(true);
    await signOutOfCourse(form("cyberexplorers"));
    expect(m.signOut).toHaveBeenCalledWith({ redirectTo: "/schools/login" });
  });

  it("an unknown course falls back to the general sign-in", async () => {
    await signOutOfCourse(form("constructor"));
    expect(m.signOut).toHaveBeenCalledWith({ redirectTo: "/login" });
  });
});
