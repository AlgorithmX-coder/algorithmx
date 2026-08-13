import type { Metadata } from "next";
import LessonPlayer from "./learn/LessonPlayer";
import week01 from "./lessons/week01";

/**
 * /pro - Cyber Pro lesson prototype (Week 1).
 *
 * Behind the site password gate via middleware like everything else;
 * noindex until the tier launches. NOT yet entitlement-gated: the
 * auth() + hasEntitlement(userId, "cyberstart-pro") pair goes in when
 * the surface ships to buyers (see docs/pro/cyber-pro-design.md).
 */
export const metadata: Metadata = {
  title: "Week 1 | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProLessonPage() {
  return <LessonPlayer lesson={week01} />;
}
