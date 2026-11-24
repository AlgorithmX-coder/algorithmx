import type { Metadata } from "next";
import CourseAuthPage from "@/app/components/course-auth/CourseAuthPage";

export const metadata: Metadata = {
  title: "Choose a new password · Cyber Awareness | AlgorithmX",
};

export default function Page() {
  return <CourseAuthPage course="awareness" mode="reset" />;
}
