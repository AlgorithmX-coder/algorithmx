import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Reset your password · Cyber Pro | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="pro" mode="forgot" />;
}
