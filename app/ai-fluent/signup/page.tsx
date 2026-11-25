import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Sign up · AI Fluent | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="fluent" mode="signup" />;
}
