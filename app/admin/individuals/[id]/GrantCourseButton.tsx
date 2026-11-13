"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface GrantableCourse {
  slug: string;
  name: string;
}

/**
 * Give this person a course, free.
 *
 * The missing half of Revoke. Staff could take a course away and had no way
 * to give one, so every comped account, every tester and every goodwill fix
 * meant editing the database by hand. It is also the thing that makes
 * gating a course safe: a tester locked out by a new gate can be let back
 * in from here in ten seconds.
 *
 * Only courses this person does not already hold are offered, so the
 * control cannot be used to quietly rewrite a purchase as a freebie.
 */
export default function GrantCourseButton({
  userId,
  courses,
}: {
  userId: string;
  courses: GrantableCourse[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  if (courses.length === 0) {
    return <p className="ad-note" style={{ margin: 0 }}>They already have every course.</p>;
  }

  async function grant() {
    setBusy(true);
    setErr(null);
    setDone(null);
    try {
      const res = await fetch("/api/admin/individuals/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productSlug: slug }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; course?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      setDone(`${j.course} is on their account now, free.`);
      setSlug("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="ad-row">
        <label>
          Give them a course, free
          <select
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setErr(null);
              setDone(null);
            }}
          >
            <option value="" disabled>
              Pick a course
            </option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            type="button"
            className="ad-btn ad-btn-pri"
            onClick={grant}
            disabled={busy || !slug}
          >
            {busy ? "Granting…" : "Grant"}
          </button>
        </div>
      </div>
      <p className="ad-note" style={{ margin: "8px 0 0" }}>
        Recorded as a free staff grant, never as a purchase, and emailed to ops.
      </p>
      {err && <div className="ad-err">{err}</div>}
      {done && <div className="ad-made">{done}</div>}
    </div>
  );
}
