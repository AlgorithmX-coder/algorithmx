import type { Metadata } from "next";
import CodeLab from "./CodeLab";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /pro/code - the Code Lab: a free, in-browser JavaScript playground with
 * small security-flavoured challenges. The hands-on home of the scripting
 * strand. Behind the site-password gate; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Code Lab | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProCodePage() {
  await requireCourse("cyberstart-pro", "/pro/code");
  return <CodeLab />;
}
