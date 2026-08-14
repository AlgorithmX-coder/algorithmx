import type { Metadata } from "next";
import WeekPlayer from "./learn/WeekPlayer";
import week01 from "./lessons/week01";

/**
 * /pro - Cyber Pro (Week 1: Passwords & account security).
 *
 * A week is a group of topics; WeekPlayer shows the week map and runs one
 * topic at a time. Behind the site password gate via middleware; noindex
 * until the tier launches. NOT yet entitlement-gated: the auth() +
 * hasEntitlement(userId, "cyberstart-pro") pair goes in when the surface
 * ships to buyers (see docs/pro/cyber-pro-design.md).
 */
export const metadata: Metadata = {
  title: "Week 1: Passwords & account security | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProWeekPage() {
  return <WeekPlayer week={week01} />;
}
