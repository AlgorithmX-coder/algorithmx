import type { Metadata } from "next";
import ModuleTwo from "./ModuleTwo";

/**
 * /desk-ready/m2 - Module 2: Writing a work email (5 lessons). The pilot
 * module. Open during UAT like the rest of the course; noindex until
 * launch.
 */
export const metadata: Metadata = {
  title: "Module 2: Writing a work email | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleTwoPage() {
  return <ModuleTwo />;
}
