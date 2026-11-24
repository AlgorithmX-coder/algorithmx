import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Reset your password · AI Fluent | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="fluent" mode="forgot" />;
}
