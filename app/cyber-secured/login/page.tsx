import type { Metadata } from "next";
import { FirmAuthPage } from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Sign in · Cyber Secured | AlgorithmX",
};

export default function Page() {
  return <FirmAuthPage mode="login" />;
}
