import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/font/google", () => {
  const font = () => ({ variable: "font-var", className: "font-class" });
  return { Geist_Mono: font, Inter: font, Space_Grotesk: font };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, refresh: () => {} }) }));

import PasswordGatePage from "./page";
import GateLock from "./GateLock";
import { GATE_ARCS, GATE_STREAMS, seatedArcs } from "./lockRules";

const onCount = (html: string, cls: string) => (html.match(new RegExp(`class="${cls} on"`, "g")) ?? []).length;

describe("seatedArcs", () => {
  it("seats nothing for an empty field", () => {
    expect(seatedArcs(0, false)).toBe(0);
  });

  it("seats one arc per two characters", () => {
    expect(seatedArcs(1, false)).toBe(1);
    expect(seatedArcs(2, false)).toBe(1);
    expect(seatedArcs(3, false)).toBe(2);
    expect(seatedArcs(8, false)).toBe(4);
  });

  it("never seats the sixth from typing alone", () => {
    expect(seatedArcs(10, false)).toBe(5);
    expect(seatedArcs(400, false)).toBe(5);
  });

  it("seats all six once the server opens the gate", () => {
    expect(seatedArcs(1, true)).toBe(6);
    expect(seatedArcs(0, true)).toBe(6);
  });
});

describe("GateLock", () => {
  it("draws six arcs in the six stream colours", () => {
    expect(GATE_ARCS).toHaveLength(6);
    const html = renderToStaticMarkup(<GateLock seated={0} open={false} />);
    for (const c of GATE_STREAMS) expect(html).toContain(c);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Sealed");
  });

  it("lights the seated arcs, nodes and count bars only", () => {
    const html = renderToStaticMarkup(<GateLock seated={3} open={false} />);
    expect(onCount(html, "arc")).toBe(3);
    expect(onCount(html, "node")).toBe(3);
    expect((html.match(/<i class="on"/g) ?? []).length).toBe(3);
  });

  it("says Open when the gate is open", () => {
    const html = renderToStaticMarkup(<GateLock seated={6} open />);
    expect(onCount(html, "arc")).toBe(6);
    expect(html).toContain("Open");
  });
});

describe("the gate page", () => {
  const html = renderToStaticMarkup(<PasswordGatePage />);

  it("starts sealed, with the live copy", () => {
    expect(html).toContain('data-gate="sealed"');
    expect(html).toContain("Invited guests only");
    expect(html).toContain("The gate is <em>sealed</em>");
    expect(html).toContain("AlgorithmX is still being built. Enter your access password to step inside.");
    expect(html).toContain("Enter the password to continue.");
    expect(html).toContain("Open the gate");
    expect(html).toContain('href="mailto:support@algorithmx.co.uk"');
  });

  it("keeps the password field's id and label, with no name attribute", () => {
    expect(html).toContain(`<label for="gate-password">Access password</label>`);
    const input = html.match(/<input[^>]*id="gate-password"[^>]*>/)?.[0] ?? "";
    expect(input).toContain('type="password"');
    expect(input).toContain('autoComplete="current-password"');
    expect(input).not.toContain(" name=");
  });

  it("keeps the submit button disabled until something is typed", () => {
    expect(html).toMatch(/<button class="agt-btn" type="submit" disabled=""/);
  });

  it("offers a Pause control", () => {
    expect(html).toContain('aria-label="Pause motion"');
  });
});
