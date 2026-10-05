"use client";

/* Reads the [week] route param (this Next resolves params client-side via
 * useParams, matching the Cyber Heroes lesson route) and hands the number to
 * the persisted PlayClient. */

import { useParams } from "next/navigation";
import PlayClient from "@/app/operators/range/PlayClient";

export default function PlayRoute() {
  const params = useParams<{ week: string }>();
  const week = Number(params?.week);
  return <PlayClient week={Number.isInteger(week) && week > 0 ? week : 1} />;
}
