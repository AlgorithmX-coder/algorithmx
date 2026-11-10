import type { Metadata } from "next";
import ModuleSix from "./ModuleSix";

/**
 * /desk-ready/m6 - Module 6: Making it do the maths (5 lessons, then three office
 * jobs: order totals, a VAT quote and a COUNTIF). Open during UAT like the rest of
 * the course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 6: Making it do the maths | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleSixPage() {
  return <ModuleSix />;
}
