import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Log in · Cyber Explorers | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="cyberexplorers" mode="login" />;
}
