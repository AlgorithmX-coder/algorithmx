import type { Metadata } from "next";

import { prisma } from "@/app/lib/prisma";
import { landingRouteFor } from "@/app/lib/courseLandings";

import CatalogueDeck, { type CatalogueTrack } from "./CatalogueDeck";

/**
 * /cybersecurity — the subject browse page (the catalogue).
 *
 * Sits between the homepage's Cybersecurity stream and the four individual
 * track landing pages. Parents come here to see the full age progression
 * across a single subject and choose by their child's age. It is also where
 * a signed-in account lands when it does not own what it asked for
 * (CATALOGUE in app/lib/courseIntent.ts), so it stays public with NO
 * entitlement gate. Browse-not-buy: every card's CTA is "View course",
 * pointing at the track's landing page, where the purchase flow lives.
 *
 * Round 6 (owner, 2026-11-23, "Code Deck"): the page joins the Hologram
 * house, the homepage's light style, with the 3D live-typing code panes in
 * the hero. The data below is unchanged: the four tracks come from the
 * catalogue by slug, in age order, with the same display overrides.
 *
 * Rendered dynamically: this page reads the catalogue from the DB, so it
 * can't be a static prerender (the build has no database).
 */
export const dynamic = "force-dynamic";

const CYBER_TRACK_SLUGS = [
  "cyber-heroes",
  "cyberexplorers",
  "cyberstart",
  "cyberstart-pro",
] as const;

/* Track-level taglines NOT in the DB (the DB carries weekly content
 * only). Keyed by slug so a change here lands without a migration. */
const TRACK_BLURBS: Record<string, string> = {
  "cyber-heroes":
    "A confident, safe start in technology. Through animated missions with Adam and Layla, children learn strong passwords, scam-spotting and smart online habits they can use every day.",
  cyberexplorers:
    "A spy thriller they play for real. As an agent of ARC, your child cracks 20 story missions with a voice-acted handler, learning to spot phishing, fake voices and data tricks for life.",
  cyberstart:
    "Real, hands-on security done safely. Recruited as a junior operator, your teen runs weekly engagements in a sealed range (break in, defend, respond) and finishes with a portfolio, not just a certificate.",
  "cyberstart-pro":
    "Develop career-grade cyber capability through pen-testing, threat modelling, and security projects built for university, work, and professional growth.",
};

/* Display-layer overrides for track name + age range. The DB still
 * carries the seeded names ("Cyber Heroes Academy", "CyberStart",
 * "CyberStart Pro") and original age bands; overriding at render time
 * avoids touching the DB / Stripe / entitlement plumbing, which is keyed
 * on slug, not name. */
const TRACK_DISPLAY_OVERRIDES: Record<string, { name: string; ageRange: string }> = {
  "cyber-heroes": { name: "Cyber Heroes", ageRange: "6–9" },
  cyberexplorers: { name: "Cyber Explorers", ageRange: "10–13" },
  cyberstart: { name: "Cyber Ops", ageRange: "14–17" },
  "cyberstart-pro": { name: "Cyber Pro", ageRange: "18+" },
};

/* Display-layer status overrides: Cyber Explorers and Cyber Ops are LIVE in
 * the product but their DB rows still say COMING_SOON pending the checkout
 * flip, so the browse card shouldn't under-sell a live course. */
const TRACK_STATUS_OVERRIDES: Record<string, "ACTIVE" | "COMING_SOON"> = {
  cyberexplorers: "ACTIVE",
  cyberstart: "ACTIVE",
};

/* Feature tag shown under the chips. */
const TRACK_KICKERS: Record<string, string> = {
  "cyber-heroes": "Animation-led · Adam & Layla",
  cyberexplorers: "Story-driven · Agent WREN vs SIREN",
  cyberstart: "Hands-on · a live cyber range",
  "cyberstart-pro": "Career-grade · pen-testing",
};

/* Spec chips on the two older-age cards. */
const TRACK_SPECS: Record<string, string[]> = {
  cyberstart: ["Live range", "Attack + defend", "Real portfolio"],
  "cyberstart-pro": ["Pen-testing", "Threat modelling", "Security projects"],
};

export const metadata: Metadata = {
  title: "Cybersecurity. Tracks for Every Age, 6 to 18+ | AlgorithmX",
  description:
    "Four cybersecurity tracks covering ages 6 to 18+. From spotting scams as a child to portfolio-grade pen-testing as an adult. For your child's journey, or your own.",
  alternates: { canonical: "https://algorithmx.io/cybersecurity" },
  openGraph: {
    title: "Cybersecurity for every age | AlgorithmX",
    description:
      "Four cybersecurity tracks. Ages 6 to 18+. One subject, every stage.",
    url: "https://algorithmx.io/cybersecurity",
    siteName: "AlgorithmX",
    type: "website",
  },
};

export default async function CybersecurityPage() {
  /* Real DB fetch. The seed order maps to ascending ageMin, so ordering by
   * ageMin gives the age-progression layout the page is built around. */
  const products = await prisma.product.findMany({
    where: { slug: { in: CYBER_TRACK_SLUGS as unknown as string[] } },
    orderBy: { ageMin: "asc" },
  });

  const tracks: CatalogueTrack[] = products.map((p) => {
    const display = TRACK_DISPLAY_OVERRIDES[p.slug];
    return {
      slug: p.slug,
      name: display?.name ?? p.name,
      ageRange: display?.ageRange ?? p.ageRange,
      status: TRACK_STATUS_OVERRIDES[p.slug] ?? (p.status as "ACTIVE" | "COMING_SOON"),
      /* every cyber track has a landing page; fall back to this catalogue so
       * a future schema change can never render a dead href */
      href: landingRouteFor(p.slug) ?? "/cybersecurity",
      blurb: TRACK_BLURBS[p.slug] ?? "Hands-on cybersecurity at the right level for this age.",
      kicker: TRACK_KICKERS[p.slug],
      specs: TRACK_SPECS[p.slug],
    };
  });

  return <CatalogueDeck tracks={tracks} />;
}
