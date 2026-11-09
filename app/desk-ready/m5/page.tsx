import type { Metadata } from "next";
import ModuleFive from "./ModuleFive";

/**
 * /desk-ready/m5 - Module 5: Putting business data in (5 lessons), the
 * second pilot module. Open during UAT like the rest of the course;
 * noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 5: Putting business data in | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleFivePage() {
  return <ModuleFive />;
}
