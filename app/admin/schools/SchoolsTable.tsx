"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SchoolRow } from "@/app/lib/schoolOps";
import { trialStatus } from "@/app/lib/trialStatus";
import { paidState, paidLabel, canToggle, hasPaid } from "@/app/lib/paidState";
import { SearchIcon } from "../icons";

/* Client-side search/filter/sort over an already-fetched list. Schools
 * are a few dozen rows at most - no pagination or server-side query
 * needed, so this stays a plain in-browser filter rather than new API
 * surface. */

/* Two different questions, deliberately kept apart.
 *
 * ACCESS is what the organisation can do today: on a trial, the trial has
 * run out, access closed by staff, or holding a licence. PAID is whether
 * the money arrived, which is paidState() and nothing else.
 *
 * They used to be one column, and that column answered the second question
 * with the first one's evidence: anything not revoked and not on a trial
 * was chipped "Paid (manual)", including a school onboarded five minutes
 * ago that had paid nothing. */
type Access = "licence" | "trial" | "expired" | "revoked";
type Filter = "all" | Access | "unpaid";
type SortKey = "activity-desc" | "activity-asc" | "name-asc" | "pupils-desc" | "created-desc";

function accessOf(r: SchoolRow): Access {
  if (r.revokedAt) return "revoked";
  const s = trialStatus(r.trialExpiresAt ? new Date(r.trialExpiresAt) : null);
  return s === "active" ? "trial" : s === "expired" ? "expired" : "licence";
}

/** The chase list: holds a licence, money has not arrived. A trial owes
 *  nothing, so it is never "not paid". */
function isChaseable(r: SchoolRow): boolean {
  return accessOf(r) === "licence" && !hasPaid(r);
}

function matches(r: SchoolRow, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "unpaid") return isChaseable(r);
  return accessOf(r) === f;
}

function statusChip(r: SchoolRow) {
  const s = accessOf(r);
  if (s === "revoked") return <span className="ad-chip expired">Access closed</span>;
  if (s === "trial") {
    const days = Math.max(0, Math.ceil((new Date(r.trialExpiresAt!).getTime() - Date.now()) / 86400000));
    return <span className="ad-chip trial">Trial &middot; {days}d left</span>;
  }
  if (s === "expired") return <span className="ad-chip expired">Trial ended</span>;
  return <span className="ad-chip paid">Licence</span>;
}

const FILTERS = ["all", "licence", "unpaid", "trial", "expired", "revoked"] as const;
const FILTER_LABEL: Record<Filter, string> = {
  all: "All",
  licence: "Licence",
  unpaid: "Not paid",
  trial: "Trial",
  expired: "Expired",
  revoked: "Revoked",
};

/** The tick itself. Optimistic, because staff tick down a list and a
 *  round trip per row would make that feel broken; it puts the old value
 *  back and says so if the write is refused. */
function PaidTick({ row }: { row: SchoolRow }) {
  const router = useRouter();
  const [paidAt, setPaidAt] = useState<string | null>(row.paidAt);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const state = paidState({ stripeCustomerId: row.stripeCustomerId, paidAt });
  const label = paidLabel(state);

  if (!canToggle(state)) {
    return <span className="ad-paid is-card" title="Paid by card through Stripe">{label}</span>;
  }

  async function toggle() {
    const before = paidAt;
    const next = before ? null : new Date().toISOString();
    setPaidAt(next);
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: row.id, paid: next !== null }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setPaidAt(before);
        setErr(j.error ?? "That did not save.");
        return;
      }
      router.refresh();
    } catch {
      setPaidAt(before);
      setErr("That did not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="ad-paid"
        role="switch"
        aria-checked={paidAt !== null}
        aria-label={`${row.name}: ${label}`}
        disabled={busy}
        onClick={toggle}
      >
        <span className="ad-paid-box" aria-hidden="true">
          {paidAt !== null && (
            <svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
        </span>
        {label}
      </button>
      {err && <small className="ad-paid-err">{err}</small>}
    </>
  );
}

export default function SchoolsTable({ rows, basePath = "/admin/schools", noun = "school" }: { rows: SchoolRow[]; basePath?: string; noun?: string }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("activity-desc");

  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (!matches(r, status)) return false;
      if (!needle) return true;
      return r.name.toLowerCase().includes(needle) || (r.sector ?? "").toLowerCase().includes(needle) || (r.contactName ?? "").toLowerCase().includes(needle);
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "pupils-desc": return b.pupilsUsed - a.pupilsUsed;
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
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${noun}s…`} aria-label={`Search ${noun}s`} />
        </label>
        <div className="ad-pills" role="group" aria-label="Filter">
          {FILTERS.map((s) => (
            <button key={s} type="button" className="ad-pill" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {FILTER_LABEL[s]}
            </button>
          ))}
        </div>
        <label className="ad-sort">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="activity-desc">Last activity, newest</option>
            <option value="activity-asc">Last activity, oldest</option>
            <option value="name-asc">Name, A–Z</option>
            <option value="pupils-desc">Most pupils</option>
            <option value="created-desc">Signed up, newest</option>
          </select>
        </label>
        <span className="ad-count">{filtered.length} of {rows.length}</span>
      </div>

      <table className="ad-table">
        <thead>
          <tr><th>School</th><th>Pupils</th><th>Classes</th><th>Status</th><th>Paid</th><th>Signed up</th><th>Last activity</th></tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td><Link href={`${basePath}/${r.slug}`}><b>{r.name}</b></Link><small>{r.sector ?? "—"}{r.contactName ? ` · ${r.contactName}` : ""}</small></td>
              <td>{r.pupilsUsed} / {r.seatsPurchased}</td>
              <td>{r.classes}</td>
              <td>{statusChip(r)}</td>
              <td><PaidTick row={r} /></td>
              <td>{day(r.createdAt)}</td>
              <td>{day(r.lastActivity)}</td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={7} className="ad-empty">{rows.length === 0 ? `No ${noun}s yet. Create one below.` : "Nothing matches that search."}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
