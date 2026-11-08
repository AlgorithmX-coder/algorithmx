"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TRIAL_LENGTHS, DEFAULT_TRIAL_DAYS, DEFAULT_TRIAL_PLACES } from "@/app/lib/trialTerms";

/**
 * Two separate things, in two separate boxes.
 *
 * They used to be one form with a checkbox, and that hid the difference that
 * matters: a licence is a sale with a number of places somebody agreed to
 * buy, and a trial is a time-boxed look with an allowance to try with.
 * Worse, the checkbox silently posted a hardcoded 30 places, so a trial
 * school was emailed "30 places are ready" when nobody had chosen 30, or any
 * number at all. Both numbers are now on screen where they are set.
 *
 * Both boxes post to /api/admin/schools, which creates the Organisation,
 * the SchoolProfile and the first teacher's invite. The trial box then calls
 * /api/admin/trial to stamp the expiry.
 */

type Made = { name: string; slug: string; link: string; emailed: boolean; trialDays?: number };

/** The invite link, with the one control staff actually want next to it. */
function MadeBox({ made }: { made: Made }) {
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(made.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setFallback(made.link);
    }
  };
  return (
    <div className="ad-made">
      <b>
        {made.name} is set up
        {made.trialDays ? `, on a ${made.trialDays}-day trial` : ""}.
      </b>{" "}
      Invite link{made.emailed ? ", also emailed" : " (email not sent, copy it)"}:
      <code>{made.link}</code>
      <span>
        <button type="button" className="ad-btn" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
        <a className="ad-btn" href={`/admin/schools/${made.slug}`}>Open the school</a>
      </span>
      {fallback && <div className="ad-err">Copy this link: {fallback}</div>}
    </div>
  );
}

const BLANK = { name: "", country: "", sector: "", safeguardingContact: "", contactName: "", contactRole: "", teacherEmail: "" };

/** Everything both boxes ask for. Only the places and the term differ. */
function SharedFields({ f, set, w }: { f: typeof BLANK; set: (k: keyof typeof BLANK, v: string) => void; w: OrgWords }) {
  return (
    <>
      <div className="ad-row">
        <label>{w.Noun} name <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder={w.namePlaceholder} /></label>
        <label>Country <input value={f.country} onChange={(e) => set("country", e.target.value)} placeholder="United Kingdom" /></label>
      </div>
      <div className="ad-row">
        <label>Sector <input value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder={w.sectorPlaceholder} /></label>
        <label>Safeguarding contact <input value={f.safeguardingContact} onChange={(e) => set("safeguardingContact", e.target.value)} placeholder="Who a disclosure goes to" /></label>
      </div>
      <div className="ad-row">
        <label>Contact name <input value={f.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder={w.contactPlaceholder} /></label>
        <label>Contact role <input value={f.contactRole} onChange={(e) => set("contactRole", e.target.value)} placeholder="Head of Computing" /></label>
      </div>
      <label>{w.firstPerson}&rsquo;s email <input type="email" value={f.teacherEmail} onChange={(e) => set("teacherEmail", e.target.value)} placeholder={w.emailHint} /></label>
    </>
  );
}

/** The words a tab uses. Schools and organisations run on the same
 *  machinery, so only the vocabulary and the examples change. */
export interface OrgWords {
  kind: "SCHOOL" | "ORGANISATION";
  /** "School" / "Organisation", for headings. */
  Noun: string;
  /** "school" / "organisation", mid-sentence. */
  noun: string;
  namePlaceholder: string;
  sectorPlaceholder: string;
  contactPlaceholder: string;
  emailHint: string;
  /** What the first person invited is called. */
  firstPerson: string;
}

export default function AdminSchoolsPanel({ w }: { w: OrgWords }) {
  const router = useRouter();

  /* A licence: a school that has bought a number of places. */
  const [lf, setLf] = useState({ ...BLANK });
  const [places, setPlaces] = useState("50");
  const [lBusy, setLBusy] = useState(false);
  const [lMade, setLMade] = useState<Made | null>(null);
  const [lErr, setLErr] = useState<string | null>(null);

  /* A trial: a look at the product, for a set number of days. */
  const [tf, setTf] = useState({ ...BLANK });
  const [trialDays, setTrialDays] = useState(String(DEFAULT_TRIAL_DAYS));
  const [trialPlaces, setTrialPlaces] = useState(String(DEFAULT_TRIAL_PLACES));
  const [tBusy, setTBusy] = useState(false);
  const [tMade, setTMade] = useState<Made | null>(null);
  const [tErr, setTErr] = useState<string | null>(null);

  async function post(body: Record<string, unknown>): Promise<Made> {
    const res = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) throw new Error((j.error as string) ?? "Something went wrong.");
    return { name: j.name as string, slug: j.slug as string, link: j.link as string, emailed: !!j.emailed };
  }

  async function createLicence() {
    setLBusy(true); setLErr(null); setLMade(null);
    try {
      setLMade(await post({ ...lf, kind: w.kind, seatsPurchased: Number(places) }));
      setLf({ ...BLANK }); setPlaces("50");
      router.refresh();
    } catch (e) {
      setLErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setLBusy(false); }
  }

  async function createTrial() {
    setTBusy(true); setTErr(null); setTMade(null);
    try {
      const days = Number(trialDays);
      /* trialDays rides along so the invite email leads with the trial
         rather than announcing places nobody agreed to buy. */
      const made = await post({ ...tf, kind: w.kind, seatsPurchased: Number(trialPlaces), trialDays: days });
      const tRes = await fetch("/api/admin/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: made.slug, days }),
      });
      if (!tRes.ok) {
        setTErr("The school was created but the trial expiry did not save. Set it from the school's page.");
      }
      setTMade({ ...made, trialDays: tRes.ok ? days : undefined });
      setTf({ ...BLANK }); setTrialDays(String(DEFAULT_TRIAL_DAYS)); setTrialPlaces(String(DEFAULT_TRIAL_PLACES));
      router.refresh();
    } catch (e) {
      setTErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setTBusy(false); }
  }

  const ready = (f: typeof BLANK) => f.name.trim() !== "" && f.teacherEmail.trim() !== "";

  return (
    <>
      <div className="ad-card ad-form">
        <h2 className="ad-h2">New {w.noun}, on a licence</h2>
        <p className="ad-note">
          A {w.noun} that has agreed to buy. Set the pupil places they bought. The {w.firstPerson.toLowerCase()} gets an invite by email, and the link shows here too.
        </p>
        <SharedFields f={lf} set={(k, v) => setLf({ ...lf, [k]: v })} w={w} />
        <label>Pupil places <input type="number" min={1} value={places} onChange={(e) => setPlaces(e.target.value)} /></label>
        <button
          type="button"
          className="ad-btn ad-btn-pri"
          onClick={createLicence}
          disabled={lBusy || !ready(lf) || Number(places) < 1}
        >
          {lBusy ? "Creating…" : `Create ${w.noun} and invite`}
        </button>
        {lMade && <MadeBox made={lMade} />}
        {lErr && <div className="ad-err">{lErr}</div>}
      </div>

      <div className="ad-card ad-form">
        <h2 className="ad-h2">Grant a free trial</h2>
        <p className="ad-note">
          A look at the product for a set number of days, with places to try with. Nothing has been
          bought, and the invite email says so. A personal address is fine here. When the days run
          out the {w.noun} is locked out until you set a licence up on its own page.
        </p>
        <SharedFields f={tf} set={(k, v) => setTf({ ...tf, [k]: v })} w={w} />
        <div className="ad-row">
          <label>
            Trial length
            <select value={trialDays} onChange={(e) => setTrialDays(e.target.value)}>
              {TRIAL_LENGTHS.map((d) => (
                <option key={d} value={String(d)}>{d === 1 ? "1 day" : `${d} days`}</option>
              ))}
            </select>
          </label>
          <label>
            Pupil places to try with
            <input type="number" min={1} value={trialPlaces} onChange={(e) => setTrialPlaces(e.target.value)} />
          </label>
        </div>
        <button
          type="button"
          className="ad-btn ad-btn-pri"
          onClick={createTrial}
          disabled={tBusy || !ready(tf) || Number(trialPlaces) < 1}
        >
          {tBusy ? "Creating…" : "Grant trial and send invite"}
        </button>
        {tMade && <MadeBox made={tMade} />}
        {tErr && <div className="ad-err">{tErr}</div>}
      </div>
    </>
  );
}
