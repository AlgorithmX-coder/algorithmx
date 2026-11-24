import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Reset your password · Desk Ready | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="desk" mode="forgot" />;
}
