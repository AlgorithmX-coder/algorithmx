import { describe, expect, it } from "vitest";
import { PASSWORD_MAX, passwordProblem, passwordRules } from "./passwordPolicy";

/* One rule for signup and reset alike. */

describe("passwordProblem", () => {
  it("accepts eight characters with a capital and a special character", () => {
    expect(passwordProblem("Secret!1")).toBeNull();
  });
  it("refuses short passwords and anything that is not a string", () => {
    expect(passwordProblem("Se!1")).toMatch(/at least 8/);
    expect(passwordProblem(undefined)).toMatch(/at least 8/);
    expect(passwordProblem(12345678)).toMatch(/at least 8/);
  });
  it("refuses a password with no capital", () => {
    expect(passwordProblem("secret!12")).toMatch(/capital/);
  });
  it("refuses a password with no special character", () => {
    expect(passwordProblem("Secret123")).toMatch(/special/);
  });
  it("refuses the weak password a reset used to allow", () => {
    expect(passwordProblem("password")).not.toBeNull();
  });
  it("refuses absurdly long input", () => {
    expect(passwordProblem(`A!${"x".repeat(PASSWORD_MAX)}`)).toMatch(/at most/);
  });
});

describe("passwordRules", () => {
  it("reports each rule for the form checklist", () => {
    expect(passwordRules("abc")).toEqual({ length: false, upper: false, special: false });
    expect(passwordRules("Abcdefg!")).toEqual({ length: true, upper: true, special: true });
  });
});
