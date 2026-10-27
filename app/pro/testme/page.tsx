import type { Metadata } from "next";
import TestMe from "../learn/TestMe";

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

export default function ProTestMePage() {
  return <TestMe />;
}
