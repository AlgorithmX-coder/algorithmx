import type { Metadata } from "next";
import { FirmAuthPage } from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Reset your password · Cyber Secured | AlgorithmX",
};

export default function Page() {
  return <FirmAuthPage mode="forgot" />;
}
