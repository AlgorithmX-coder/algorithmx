"use client";

/* Reads the [module] route param (this Next resolves params client-side via
 * useParams, matching the Cyber Heroes lesson route) and hands the number to
 * the persisted PlayClient. */

import { useParams } from "next/navigation";
import PlayClient from "@/app/operators/range/PlayClient";

export default function PlayRoute() {
  const params = useParams<{ module: string }>();
  const moduleNo = Number(params?.module);
  return <PlayClient module={Number.isInteger(moduleNo) && moduleNo > 0 ? moduleNo : 1} />;
}
