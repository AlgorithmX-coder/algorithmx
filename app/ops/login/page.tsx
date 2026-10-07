import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Log in · Cyber Ops | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="ops" mode="login" />;
}
