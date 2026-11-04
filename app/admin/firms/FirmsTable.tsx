"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FirmRow } from "@/app/lib/aiClearedOps";
import { trialStatus } from "@/app/lib/trialStatus";
import { SearchIcon } from "../icons";

/* Client-side search/filter/sort over an already-fetched list. See
 * SchoolsTable.tsx for why this stays in-browser rather than a new
 * API/pagination surface. */

type StatusFilter = "all" | "paid" | "trial" | "expired";
type SortKey = "activity-desc" | "activity-asc" | "name-asc" | "seats-desc" | "cleared-desc" | "created-desc";

const PLAN: Record<string, string> = { TEAM: "Team", FIRM: "Firm", ENTERPRISE: "Enterprise" };

function statusOf(r: FirmRow): StatusFilter {
  const s = trialStatus(r.trialExpiresAt ? new Date(r.trialExpiresAt) : null);
  return s === "active" ? "trial" : s === "expired" ? "expired" : "paid";
}

function statusChip(r: FirmRow) {
  const s = statusOf(r);
  if (s === "trial") {
    const days = Math.max(0, Math.ceil((new Date(r.trialExpiresAt!).getTime() - Date.now()) / 86400000));
    return <span className="ad-chip trial">Trial &middot; {days}d left</span>;
  }
  if (s === "expired") return <span className="ad-chip expired">Trial ended</span>;
  return <span className="ad-chip paid">{r.paidVia === "stripe" ? "Paid (Stripe)" : "Paid (manual)"}</span>;
}

export default function FirmsTable({ rows }: { rows: FirmRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("activity-desc");

  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (status !== "all" && statusOf(r) !== status) return false;
      if (!needle) return true;
      return r.name.toLowerCase().includes(needle) || (r.sector ?? "").toLowerCase().includes(needle) || (r.contactName ?? "").toLowerCase().includes(needle);
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "seats-desc": return b.seatsPurchased - a.seatsPurchased;
        case "cleared-desc": return b.cleared - a.cleared;
        case "created-desc": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "activity-asc": return new Date(a.lastActivity ?? 0).getTime() - new Date(b.lastActivity ?? 0).getTime();
        default: return new Date(b.lastActivity ?? 0).getTime() - new Date(a.lastActivity ?? 0).getTime();
      }
    });
    return out;
  }, [rows, q, status, sort]);

  return (
    <div className="ad-card ad-table-wrap">
      <div className="ad-controls">
        <label className="ad-search">
          <SearchIcon />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search firms…" aria-label="Search firms" />
        </label>
        <div className="ad-pills" role="group" aria-label="Filter by status">
          {(["all", "paid", "trial", "expired"] as const).map((s) => (
            <button key={s} type="button" className="ad-pill" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "All" : s === "paid" ? "Paid" : s === "trial" ? "Trial" : "Expired"}
            </button>
          ))}
        </div>
        <label className="ad-sort">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="activity-desc">Last activity, newest</option>
            <option value="activity-asc">Last activity, oldest</option>
            <option value="name-asc">Name, A–Z</option>
            <option value="seats-desc">Most seats</option>
            <option value="cleared-desc">Most cleared</option>
            <option value="created-desc">Signed up, newest</option>
          </select>
        </label>
        <span className="ad-count">{filtered.length} of {rows.length}</span>
      </div>

      <table className="ad-table">
        <thead>
          <tr><th>Firm</th><th>Plan</th><th>Cleared seats</th><th>Claimed</th><th>Cleared</th><th>Fluent seats</th><th>Certs</th><th>Status</th><th>Last activity</th></tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td><Link href={`/ai-cleared/ops/${r.slug}`}><b>{r.name}</b></Link><small>{r.sector ?? "—"}{r.contactName ? ` · ${r.contactName}` : ""}</small></td>
              <td>{PLAN[r.plan]}</td>
              <td>{r.invited} / {r.seatsPurchased}</td>
              <td>{r.claimed}</td>
              <td>{r.cleared}</td>
              <td>{r.fluentSeats || r.fluentInvited ? `${r.fluentInvited} / ${r.fluentSeats}` : "—"}</td>
              <td>{r.certificates}</td>
              <td>{statusChip(r)}</td>
              <td>{day(r.lastActivity)}</td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={9} className="ad-empty">{rows.length === 0 ? "No firms yet. Create one below." : "Nothing matches that search."}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
