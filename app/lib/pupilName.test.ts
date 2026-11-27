import { describe, expect, it } from "vitest";
import { fullName, shownNames, splitPupilList, splitPupilName, tooLongPart } from "./pupilName";

describe("splitPupilName", () => {
  it("one word is a first name with no family name", () => {
    expect(splitPupilName("Ada")).toEqual({ name: "Ada", familyName: null });
  });

  it("two words are a first name and a family name", () => {
    expect(splitPupilName("Tom Baker")).toEqual({ name: "Tom", familyName: "Baker" });
  });

  it("three words keep the family name whole", () => {
    expect(splitPupilName("Lily van Dyke")).toEqual({ name: "Lily", familyName: "van Dyke" });
  });

  it("stray spaces and tabs are tidied away", () => {
    expect(splitPupilName("   Tom \t  Baker  ")).toEqual({ name: "Tom", familyName: "Baker" });
    expect(splitPupilName("Lily   van    Dyke")).toEqual({ name: "Lily", familyName: "van Dyke" });
    expect(splitPupilName("   ")).toBeNull();
  });
});

describe("splitPupilList", () => {
  it("commas, semicolons and line breaks all separate pupils", () => {
    expect(splitPupilList("Tom Baker, Tom Reid; Priya Nair\nAda\n\n,")).toEqual([
      { name: "Tom", familyName: "Baker" },
      { name: "Tom", familyName: "Reid" },
      { name: "Priya", familyName: "Nair" },
      { name: "Ada", familyName: null },
    ]);
  });

  it("does not try to read Surname, First: the comma splits two pupils", () => {
    expect(splitPupilList("Baker, Tom")).toEqual([
      { name: "Baker", familyName: null },
      { name: "Tom", familyName: null },
    ]);
  });
});

describe("tooLongPart", () => {
  it("is null when both parts fit", () => {
    expect(tooLongPart([{ name: "a".repeat(30), familyName: "b".repeat(30) }])).toBeNull();
  });

  it("names a first name that is too long", () => {
    expect(tooLongPart([{ name: "a".repeat(31), familyName: null }])).toEqual({ part: "first", text: "a".repeat(31) });
  });

  it("names a family name that is too long", () => {
    const long = "b".repeat(31);
    expect(tooLongPart([{ name: "Tom", familyName: "Baker" }, { name: "Sam", familyName: long }])).toEqual({
      part: "family",
      text: long,
    });
  });
});

describe("fullName", () => {
  it("joins the two parts, or gives the first name alone", () => {
    expect(fullName({ name: "Tom", familyName: "Baker" })).toBe("Tom Baker");
    expect(fullName({ name: "Ada", familyName: null })).toBe("Ada");
    expect(fullName({ name: "Ada" })).toBe("Ada");
  });
});

describe("shownNames", () => {
  it("shows first names when nobody shares one", () => {
    const shown = shownNames([
      { id: "1", name: "Priya", familyName: "Nair" },
      { id: "2", name: "Sam", familyName: null },
    ]);
    expect(shown.get("1")).toBe("Priya");
    expect(shown.get("2")).toBe("Sam");
  });

  it("adds an initial, no full stop, only where a first name is shared", () => {
    const shown = shownNames([
      { id: "1", name: "Tom", familyName: "Baker" },
      { id: "2", name: "Tom", familyName: "Reid" },
      { id: "3", name: "Priya", familyName: "Nair" },
    ]);
    expect([shown.get("1"), shown.get("2"), shown.get("3")]).toEqual(["Tom B", "Tom R", "Priya"]);
  });

  it("matches the first name case-insensitively", () => {
    const shown = shownNames([
      { id: "1", name: "tom", familyName: "baker" },
      { id: "2", name: "TOM", familyName: "Reid" },
    ]);
    expect(shown.get("1")).toBe("tom B");
    expect(shown.get("2")).toBe("TOM R");
  });

  it("a shared first name with no family name stays a first name", () => {
    const shown = shownNames([
      { id: "1", name: "Tom", familyName: "Baker" },
      { id: "2", name: "Tom", familyName: null },
    ]);
    expect(shown.get("1")).toBe("Tom B");
    expect(shown.get("2")).toBe("Tom");
  });

  it("never returns the family name itself", () => {
    const shown = shownNames([
      { id: "1", name: "Lily", familyName: "van Dyke" },
      { id: "2", name: "Lily", familyName: "Okafor" },
    ]);
    for (const v of shown.values()) {
      expect(v).not.toContain("Dyke");
      expect(v).not.toContain("Okafor");
    }
    expect(shown.get("1")).toBe("Lily V");
  });
});
