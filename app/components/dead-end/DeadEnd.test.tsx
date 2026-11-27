import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/font/google", () => {
  const font = () => ({ variable: "font-var", className: "font-class" });
  return { Fredoka: font, Geist_Mono: font, Inter: font, Space_Grotesk: font };
});
vi.mock("next/navigation", () => ({ usePathname: () => "/schools/clases" }));

import DeadEnd from "./DeadEnd";
import NotFound from "../../not-found";

const hrefs = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);

describe("DeadEnd", () => {
  it("draws the caller's words, the accent and the red chip for a failure", () => {
    const html = renderToStaticMarkup(
      <DeadEnd tone="school" lockup="school" err eyebrow="Teacher invite" title="That invite link is not valid" glyph="unlink">
        <p>Ask AlgorithmX for a fresh one.</p>
      </DeadEnd>,
    );
    expect(html).toContain('data-c="school"');
    expect(html).toContain("data-err");
    expect(html).toContain("That invite link is not valid");
    expect(html).toContain("Ask AlgorithmX for a fresh one.");
  });

  it("gives a pupil no link at all when the lockup is not a link", () => {
    const html = renderToStaticMarkup(
      <DeadEnd tone="pupil" lockup="school" lockupLink={false} eyebrow="Ask your teacher" title="This one is not open for you right now" glyph="wave"
        actions={<form><button type="submit" className="r8-btn">Sign out</button></form>}>
        <p>Ask your teacher to check your class. Nothing you have done is lost.</p>
      </DeadEnd>,
    );
    expect(hrefs(html)).toEqual([]);
    expect(html).toContain("Sign out");
    expect(html).not.toMatch(/£|price/i);
  });

  it("shows who is signed in with their sign-out control", () => {
    const html = renderToStaticMarkup(
      <DeadEnd lockup="school" eyebrow="For schools" title="t" glyph="lock" who={{ label: "Signed in as someone", signOut: <button type="submit">Sign out</button> }} />,
    );
    expect(html).toContain("r8-who");
    expect(html).toContain("Signed in as someone");
  });
});

describe("the 404", () => {
  it("names the missed address and offers the four ways back in, Sign in going to /login", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain("/schools/clases");
    const ways = [...html.matchAll(/<a [^>]*class="r8-way"[^>]*>/g)].map((m) => /href="([^"]+)"/.exec(m[0])?.[1]);
    expect(ways).toEqual(["/", "/schools", "/corporate", "/login"]);
    expect(html).toContain("mailto:support@algorithmx.co.uk");
  });
});
