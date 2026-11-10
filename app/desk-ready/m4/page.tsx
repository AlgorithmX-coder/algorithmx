import type { Metadata } from "next";
import ModuleFour from "./ModuleFour";

/**
 * /desk-ready/m4 - Module 4: What a spreadsheet is (5 lessons, then two office
 * jobs: Fix the stock count and Start December's rota). Open during UAT like the rest of
 * the course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 4: What a spreadsheet is | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleFourPage() {
  return <ModuleFour />;
}
