import type { Metadata } from "next";
import SchoolLogin from "./SchoolLogin";

export const metadata: Metadata = {
  title: "School login | AlgorithmX for Schools",
  description:
    "Teachers sign in with their school email. Pupils log in with the class code on their login card.",
  robots: { index: false, follow: false },
};

export default function SchoolLoginPage() {
  return <SchoolLogin />;
}
