import type { Metadata } from "next";
import ModuleThree from "./ModuleThree";

/**
 * /desk-ready/m3 - Module 3: Meetings and messages (5 lessons, then three office
 * jobs: book the stock meeting, on the call, and chat or email). Open during UAT like the rest of
 * the course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 3: Meetings and messages | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleThreePage() {
  return <ModuleThree />;
}
