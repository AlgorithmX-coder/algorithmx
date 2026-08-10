import type { Metadata } from "next";
import FirstCapture from "@/app/operators/range/FirstCapture";

export const metadata: Metadata = {
  title: "Cyber Ops · First Capture preview",
  robots: { index: false, follow: false },
};

export default function OperatorsFirstCapturePage() {
  return <FirstCapture />;
}
