import { describe, expect, it } from "vitest";
import { backTarget } from "./backTarget";

const HOME = { href: "/", label: "Back to home" };

describe("backTarget", () => {
  it.each([
    ["/schools/overview/billing", "/schools/overview", "Back to your school"],
    ["/schools/classes/abc123", "/schools/classes", "Back to your classes"],
    ["/schools/teach/week-1", "/schools/classes", "Back to your classes"],
    ["/admin/schools/42", "/admin", "Back to the console"],
    ["/admin-login", "/admin", "Back to the console"],
    ["/cyberhq/badges", "/cyberhq", "Back to HQ"],
    ["/lesson/3", "/cyberhq", "Back to HQ"],
    ["/lesson", "/cyberhq", "Back to HQ"],
    ["/explorers/missions/1", "/explorers", "Back to Explorers"],
    ["/operators/range/2", "/operators/portfolio", "Back to Ops"],
    ["/pro/course/m/2", "/pro/course", "Back to the course"],
    ["/pro/testme", "/pro/course", "Back to the course"],
    ["/pro/code/lab", "/pro/course", "Back to the course"],
    ["/desk-ready/learn/1", "/desk-ready/course", "Back to the course"],
    ["/desk-ready/lessons/4", "/desk-ready/course", "Back to the course"],
    ["/desk-ready/office/mail", "/desk-ready/course", "Back to the course"],
    ["/ai-cleared/m/1", "/ai-cleared", "Back to the course"],
    ["/ai-fluent/desks/3", "/ai-fluent", "Back to the course"],
    ["/cyber-awareness/m/2", "/cyber-awareness", "Back to the course"],
    ["/cyber-secured/admin", "/cyber-secured", "Back to the course"],
    ["/dashboard/settings", "/dashboard", "Back to your dashboard"],
  ])("%s goes to %s", (path, href, label) => {
    expect(backTarget(path)).toEqual({ href, label });
  });

  it("prefers the longest prefix", () => {
    expect(backTarget("/schools/overview").href).toBe("/");
    expect(backTarget("/schools/overview/x").label).toBe("Back to your school");
    expect(backTarget("/schools/overviewing").label).toBe("Back to your classes");
    expect(backTarget("/admin-login").href).toBe("/admin");
  });

  it("matches whole segments only", () => {
    expect(backTarget("/administer")).toEqual(HOME);
    expect(backTarget("/dashboards")).toEqual(HOME);
    expect(backTarget("/pro/courses")).toEqual(HOME);
  });

  it("never sends the visitor straight back into the page that crashed", () => {
    for (const p of ["/schools/classes", "/schools/overview", "/admin", "/cyberhq", "/explorers", "/operators/portfolio", "/pro/course", "/desk-ready/course", "/ai-cleared", "/dashboard", "/dashboard/"]) {
      expect(backTarget(p)).toEqual(HOME);
    }
  });

  it("falls back to home for public and unknown pages", () => {
    for (const p of ["/", "", "/schools", "/pro", "/cybersecurity", "/login", "/desk-ready", "/operators"]) {
      expect(backTarget(p)).toEqual(HOME);
    }
  });
});
