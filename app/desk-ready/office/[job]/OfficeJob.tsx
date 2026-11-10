"use client";

import dynamic from "next/dynamic";
import { jobBySlug } from "../jobs";

/* A job holds functions (its seed and checks), so it is looked up here on
 * the client. The office reads its saved record from this browser's
 * storage as it mounts, so it renders on the client only. */
const Office = dynamic(() => import("../Office"), { ssr: false, loading: () => <div style={{ minHeight: "100svh", background: "#070b17" }} /> });

export default function OfficeJob({ slug }: { slug: string }) {
  const job = jobBySlug(slug);
  return job ? <Office job={job} /> : null;
}
