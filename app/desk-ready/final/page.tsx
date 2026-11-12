import type { Metadata } from "next";
import FinalStart from "./FinalStart";

/**
 * /desk-ready/final - the final task's start page: what Monday morning at
 * the desk is, how long it takes, how it's marked, and the button to start
 * (or carry on, or see the scorecard). Open during UAT like the rest of the
 * course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "The final task: Monday morning at the desk | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskFinalPage() {
  return <FinalStart />;
}
