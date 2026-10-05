import type { Metadata } from "next";
import Module1 from "@/app/operators/range/module01";

export const metadata: Metadata = {
  title: "Cyber Ops · Module 1 preview",
  robots: { index: false, follow: false },
};

export default function OperatorsModule1Page() {
  return <Module1 />;
}
