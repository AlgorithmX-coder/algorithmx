"use client";

import dynamic from "next/dynamic";
import { MorningPanel } from "../../office/apps/Morning";
import { mondayMorning } from "../../office/jobs/monday/morning";
import type { Job } from "../../office/types";

/* The job holds functions (its seed, checks and live panel), so it is put
 * together here on the client. The office reads its saved record from this
 * browser's storage as it mounts, so it renders on the client only. */
const Office = dynamic(() => import("../../office/Office"), { ssr: false, loading: () => <div style={{ minHeight: "100svh", background: "#070b17" }} /> });

const JOB: Job = { ...mondayMorning, live: { ...mondayMorning.live!, Panel: MorningPanel } };

export default function MorningOffice() {
  return <Office job={JOB} />;
}
