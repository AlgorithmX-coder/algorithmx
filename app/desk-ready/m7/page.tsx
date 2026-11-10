import type { Metadata } from "next";
import ModuleSeven from "./ModuleSeven";

/**
 * /desk-ready/m7 - Module 7: What the numbers mean (5 lessons, then two office
 * jobs: answer the manager's question, and the number that can't be right). Open during UAT like the rest of
 * the course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 7: What the numbers mean | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleSevenPage() {
  return <ModuleSeven />;
}
