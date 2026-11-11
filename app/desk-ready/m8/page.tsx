import type { Metadata } from "next";
import ModuleEight from "./ModuleEight";

/**
 * /desk-ready/m8 - Module 8: Documents (5 lessons in the office's own Word,
 * then three office jobs: a letter on the letterhead, book your holiday,
 * and review the delivery procedure). Open during UAT like the rest of the
 * course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 8: Documents | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleEightPage() {
  return <ModuleEight />;
}
