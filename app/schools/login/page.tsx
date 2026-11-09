import type { Metadata } from "next";
import SchoolLogin from "./SchoolLogin";

export const metadata: Metadata = {
  title: "School login | AlgorithmX for Schools",
  description:
    "Teachers sign in with their school email. Pupils log in with the class code on their login card.",
  robots: { index: false, follow: false },
};

/* ?class=ABCD-EFG arrives from /c/ABCD-EFG, the short link a teacher puts
   on the board. Read here, on the server, and handed down as a prop: a
   client component reading it itself would need a Suspense boundary round
   the whole sign-in for the sake of one string. */
export default async function SchoolLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const { class: fromLink } = await searchParams;
  return <SchoolLogin initialCode={typeof fromLink === "string" ? fromLink : null} />;
}
