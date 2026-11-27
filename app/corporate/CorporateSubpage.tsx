"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import ReadingRoom, { DocSection } from "@/app/components/reading-room/ReadingRoom";

/**
 * The chrome for a /corporate sub-page: the reading room (contents rail,
 * anchors, print, copy link) with the Cyber Secured capsule and Cyber Secured
 * as the way back. Built for the regulation pages, which are read rather than
 * scanned.
 */

export interface SubSection {
  heading: string;
  body: ReactNode;
}

export default function CorporateSubpage({
  eyebrow,
  title,
  lede,
  sections,
  maps,
  mapsHeading = "// Where Cyber Secured fits",
  asOf,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: string;
  sections: SubSection[];
  /** Where Cyber Secured fits the duty, as short points. */
  maps: string[];
  /** The aside heading over those points. */
  mapsHeading?: string;
  /** The date the reading was checked. */
  asOf: string;
}) {
  const route = usePathname();
  /* The round 7 reading room (landing lab r7-misc-security.html and its two
     siblings). Only the layout changed: the eyebrow, title, lede, every
     section, the points and the as-of line are passed through word for word. */
  return (
    <ReadingRoom
      variant="corp"
      route={route}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      asOf={asOf}
      maps={maps}
      mapsHeading={mapsHeading}
      asofLine={<>This page sets out our reading of the position as of {asOf}. It is general information for firms, and your own legal advice governs.</>}
    >
      {sections.map((s) => (
        <DocSection key={s.heading} title={s.heading}>{s.body}</DocSection>
      ))}
    </ReadingRoom>
  );
}
