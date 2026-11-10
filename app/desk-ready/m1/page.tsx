import type { Metadata } from "next";
import ModuleOne from "./ModuleOne";

/**
 * /desk-ready/m1 - Module 1: The work inbox (5 lessons, then two office
 * jobs: Monday's inbox and Reply all). Open during UAT like the rest of
 * the course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 1: The work inbox | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleOnePage() {
  return <ModuleOne />;
}
