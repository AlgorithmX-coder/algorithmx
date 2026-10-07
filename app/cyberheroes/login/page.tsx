import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Log in · Cyber Heroes | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="cyberheroes" mode="login" />;
}
