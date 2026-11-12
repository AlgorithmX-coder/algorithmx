import type { Metadata } from "next";
import ModuleTwelve from "./ModuleTwelve";

/**
 * /desk-ready/m12 - Module 12: AI as your assistant (5 lessons, then three
 * office jobs: let Copilot draft it then check it, what not to paste, and
 * explain this formula). Open during UAT like the rest of the course;
 * noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 12: AI as your assistant | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleTwelvePage() {
  return <ModuleTwelve />;
}
