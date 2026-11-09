import type { Metadata } from "next";
import ModuleZero from "./ModuleZero";

/**
 * /desk-ready/m0 - Module 0: Your computer, your way (6 lessons). Mouse,
 * keyboard, windows, copy and paste, saving files, typing. Skippable for
 * anyone who already uses a computer. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 0: Your computer, your way | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleZeroPage() {
  return <ModuleZero />;
}
