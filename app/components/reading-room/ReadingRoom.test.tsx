import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/font/google", () => {
  const font = () => ({ variable: "font-var", className: "font-class" });
  return { Inter: font, JetBrains_Mono: font, Space_Grotesk: font };
});

import ReadingRoom, { DocSection } from "./ReadingRoom";

/* The words a reader sees in the document blocks, in order, as the PR's
   before/after diff reads them. */
const legal = (html: string) =>
  [...html.matchAll(/<(\w+)[^>]*data-legal=""[^>]*>([\s\S]*?)<\/\1>/g)]
    .map((m) => m[2].replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&"))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean);

describe("ReadingRoom", () => {
  it("renders a plain document's own words, numbered, with a contents entry and anchor per section", () => {
    const html = renderToStaticMarkup(
      <ReadingRoom variant="plain" route="/terms" title="Terms of Service" updated="Last updated: April 2026">
        <DocSection title="Your account"><p>One account per household.</p></DocSection>
        <DocSection title="Changes to these terms"><p>We will email you first.</p></DocSection>
      </ReadingRoom>,
    );
    expect(legal(html)).toEqual("Terms of Service Last updated: April 2026 Your account One account per household. Changes to these terms We will email you first.".split(" "));
    expect(html).toContain('id="your-account"');
    expect(html).toContain('href="#changes-to-these-terms"');
    expect(html).toContain(">01<");
    expect(html).toContain(">02<");
    expect(html).toContain("<b>2</b> sections");
    /* the related card marks this page, the footer carries the TRUST column */
    expect(html).toMatch(/<a (?=[^>]*aria-current="page")(?=[^>]*href="\/terms")[^>]*>/);
    expect(html).toContain(">TRUST<");
  });

  it("passes the corporate eyebrow, lede, points and as-of line through untouched", () => {
    const html = renderToStaticMarkup(
      <ReadingRoom
        variant="corp"
        route="/corporate/uk-gdpr"
        eyebrow="// Regulation · UK GDPR"
        title={<>What the ICO expects <span className="corp-sub-grad">when staff use AI.</span></>}
        lede="The UK has no AI literacy statute yet."
        asOf="26 September 2026"
        maps={["The policy: one.", "The record: two."]}
        mapsHeading="// Where Cyber Secured fits"
        asofLine={<>As of 26 September 2026.</>}
      >
        <DocSection title="The duties"><ul><li>Article 5.</li></ul></DocSection>
      </ReadingRoom>,
    );
    expect(legal(html)).toEqual(
      "// Regulation · UK GDPR What the ICO expects when staff use AI. The UK has no AI literacy statute yet. The duties Article 5. // Where Cyber Secured fits The policy: one. The record: two. As of 26 September 2026.".split(" "),
    );
    expect(html).toMatch(/<a (?=[^>]*aria-current="page")(?=[^>]*href="\/corporate\/uk-gdpr")[^>]*>/);
    expect(html).toContain("Get in touch");
  });
});
