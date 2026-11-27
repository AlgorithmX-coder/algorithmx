import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const h = vi.hoisted(() => ({
  invite: null as null | { email: string; userId: string | null; org: { name: string } },
  session: null as null | { user: { id: string; email: string } },
  target: null as null | { orgName: string; kind: "SCHOOL"; lockedTo: string | null },
  verdict: { state: "join" } as { state: string; why?: string },
}));

vi.mock("next/font/google", () => {
  const font = () => ({ variable: "font-var", className: "font-class" });
  return { Fredoka: font, Geist_Mono: font, Inter: font, Space_Grotesk: font };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, refresh: () => {} }) }));
vi.mock("@/app/lib/auth", () => ({ auth: async () => h.session }));
vi.mock("@/app/lib/prisma", () => ({ prisma: { teacherInvite: { findUnique: async () => h.invite } } }));
vi.mock("@/app/lib/staffLink", () => ({ findStaffLink: async () => h.target, judgeStaffLink: async () => h.verdict }));
vi.mock("@/app/schools/signOut.actions", () => ({ leaveSchoolPortal: async () => {} }));

import SchoolJoinPage from "./page";

/** Renders the page, resolving the one nested async component (the staff link landing). */
async function render(token: string) {
  let el = (await SchoolJoinPage({ params: Promise.resolve({ token }), searchParams: Promise.resolve({}) })) as ReactElement;
  if (typeof el.type === "function" && el.type.constructor.name === "AsyncFunction") {
    el = await (el.type as (p: unknown) => Promise<ReactElement>)(el.props);
  }
  return renderToStaticMarkup(el);
}
const count = (html: string, s: string) => html.split(s).length - 1;

beforeEach(() => {
  h.invite = { email: "new.teacher@oakwood-test.sch.uk", userId: null, org: { name: "Lindon Primary school" } };
  h.session = null;
  h.target = { orgName: "Lindon Primary school", kind: "SCHOOL", lockedTo: null };
  h.verdict = { state: "join" };
});

describe("/schools/join/[token]", () => {
  it("signed out: the light house, the invited address once in the eyebrow, both doors back here", async () => {
    const html = await render("oakwood-invite-test-1");
    expect(html).toContain('class="r8 ');
    expect(html).not.toContain("r6-");
    expect(count(html, "new.teacher@oakwood-test.sch.uk")).toBe(1);
    expect(html).toContain("Lindon Primary school has a teacher place waiting for you");
    expect(html).toContain("/signup?callbackUrl=%2Fschools%2Fjoin%2Foakwood-invite-test-1");
    expect(html).toContain("/login?callbackUrl=%2Fschools%2Fjoin%2Foakwood-invite-test-1");
    expect(html).not.toContain("r8-who");
  });

  it("signed in and claimable: the address shows once, in the strip, beside Sign out", async () => {
    h.session = { user: { id: "u1", email: "jones@oakwood-test.sch.uk" } };
    const html = await render("oakwood-invite-test-1");
    expect(count(html, "jones@oakwood-test.sch.uk")).toBe(1);
    expect(html).toMatch(/r8-who[\s\S]*Signed in as <b>jones@oakwood-test.sch.uk<\/b>[\s\S]*Sign out/);
    expect(html).toContain("Teacher invite");
    expect(html).toContain("Welcome to Lindon Primary school");
    expect(html).toContain("Set up my teacher account at Lindon Primary school");
  });

  it("a bad token is the unlink dead end", async () => {
    h.invite = null;
    const html = await render("nope");
    expect(html).toContain("That invite link is not valid");
    expect(html).toContain("data-err");
  });

  it("staff link, signed in: the eyebrow names the link and the address shows once", async () => {
    h.session = { user: { id: "u1", email: "jones@oakwood-test.sch.uk" } };
    h.invite = null;
    const html = await render("staff-abc");
    expect(html).toContain("Teacher link");
    expect(html).toContain("Join Lindon Primary school as a teacher");
    expect(count(html, "jones@oakwood-test.sch.uk")).toBe(1);
  });

  it("staff link, wrong domain: a lock, the existing sentences, the address still once", async () => {
    h.session = { user: { id: "u1", email: "someone@gmail.example" } };
    h.target = { orgName: "Lindon Primary school", kind: "SCHOOL", lockedTo: "oakwood-test.sch.uk" };
    h.verdict = { state: "refused", why: "wrong_domain" };
    h.invite = null;
    const html = await render("staff-abc");
    expect(html).toContain("Use your Lindon Primary school address");
    expect(html).toContain("You are signed in as someone@gmail.example.");
    expect(count(html, "someone@gmail.example")).toBe(1);
    expect(html).toContain('data-kind="ghost"');
  });
});
