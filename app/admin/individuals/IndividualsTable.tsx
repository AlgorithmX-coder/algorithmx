"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { IndividualRow } from "@/app/lib/individualOps";
import { SearchIcon } from "../icons";

/* Client-side search/filter/sort over an already-fetched list. See
 * SchoolsTable.tsx for why this stays in-browser rather than a new
 * API/pagination surface. Filter is by course rather than status -
 * individuals don't have a paid/trial concept the way orgs do. */

type SortKey = "active-desc" | "active-asc" | "name-asc" | "created-desc";

export default function IndividualsTable({ rows }: { rows: IndividualRow[] }) {
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("all");
  const [sort, setSort] = useState<SortKey>("active-desc");

  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

  const courses = useMemo(() => {
    const names = new Set<string>();
    rows.forEach((r) => r.products.forEach((p) => names.add(p.name)));
    return Array.from(names).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (course !== "all" && !r.products.some((p) => p.name === course)) return false;
      if (!needle) return true;
      return (r.name ?? "").toLowerCase().includes(needle) || r.email.toLowerCase().includes(needle);
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "name-asc": return (a.name ?? a.email).localeCompare(b.name ?? b.email);
        case "created-desc": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "active-asc": return new Date(a.lastActive ?? 0).getTime() - new Date(b.lastActive ?? 0).getTime();
        default: return new Date(b.lastActive ?? 0).getTime() - new Date(a.lastActive ?? 0).getTime();
      }
    });
    return out;
  }, [rows, q, course, sort]);

  return (
    <div className="ad-card ad-table-wrap">
      <div className="ad-controls">
        <label className="ad-search">
          <SearchIcon />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" aria-label="Search individuals" />
        </label>
        {courses.length > 1 && (
          <div className="ad-pills" role="group" aria-label="Filter by course">
            <button type="button" className="ad-pill" aria-pressed={course === "all"} onClick={() => setCourse("all")}>All</button>
            {courses.map((c) => (
              <button key={c} type="button" className="ad-pill" aria-pressed={course === c} onClick={() => setCourse(c)}>{c}</button>
            ))}
          </div>
        )}
        <label className="ad-sort">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="active-desc">Last active, newest</option>
            <option value="active-asc">Last active, oldest</option>
            <option value="name-asc">Name, A–Z</option>
            <option value="created-desc">Signed up, newest</option>
          </select>
        </label>
        <span className="ad-count">{filtered.length} of {rows.length}</span>
      </div>

      <table className="ad-table">
        <thead>
          <tr><th>Person</th><th>Courses</th><th>Children</th><th>Signed up</th><th>Last active</th></tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td><Link href={`/admin/individuals/${r.id}`}><b>{r.name ?? r.email}</b></Link><small>{r.name ? r.email : ""}</small></td>
              <td>{r.products.map((p) => p.name).join(", ") || "—"}</td>
              <td>{r.children.length ? r.children.map((c) => c.name).join(", ") : "—"}</td>
              <td>{day(r.createdAt)}</td>
              <td>{day(r.lastActive)}</td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={5} className="ad-empty">{rows.length === 0 ? "No individual sign-ups yet." : "Nothing matches that search."}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
