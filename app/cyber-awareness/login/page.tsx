import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Log in · Cyber Awareness | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="awareness" mode="login" />;
}
