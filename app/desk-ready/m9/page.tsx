import type { Metadata } from "next";
import ModuleNine from "./ModuleNine";

/**
 * /desk-ready/m9 - Module 9: Files and sharing (5 lessons in the office's
 * own File Explorer, then three office jobs: sort out the shared folder,
 * share it the right way, and get yesterday's version back). Open during
 * UAT like the rest of the course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 9: Files and sharing | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleNinePage() {
  return <ModuleNine />;
}
