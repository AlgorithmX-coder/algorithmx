import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Sign up · AI Cleared | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="cleared" mode="signup" />;
}
