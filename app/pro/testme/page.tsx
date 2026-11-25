import type { Metadata } from "next";
import TestMe from "../learn/TestMe";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /pro/testme - the optional "Test me" self-test.
 *
 * Pulls a handful of questions at random from the topics the learner has
 * finished (or Module 1 as a starter), for them to check what has stuck.
 * Behind the site-password gate via middleware; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Test me | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProTestMePage() {
  await requireCourse("cyberstart-pro", "/pro/testme");
  return <TestMe />;
}
