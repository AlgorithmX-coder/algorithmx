import type { Metadata } from "next";
import ModuleTen from "./ModuleTen";

/**
 * /desk-ready/m10 - Module 10: Admin in practice (5 lessons, then four office
 * jobs: check an invoice, a timesheet and an expense, take a phone message,
 * book a courier). Open during UAT like the rest of the course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 10: Admin in practice | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleTenPage() {
  return <ModuleTen />;
}
