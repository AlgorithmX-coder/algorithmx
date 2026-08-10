import type { Metadata } from "next";
import Week1 from "@/app/operators/range/week01";

export const metadata: Metadata = {
  title: "Cyber Ops · Week 1 preview",
  robots: { index: false, follow: false },
};

export default function OperatorsWeek1Page() {
  return <Week1 />;
}
