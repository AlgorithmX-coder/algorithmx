"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import SchoolBrand from "@/app/schools/SchoolBrand";
import CampusShell, { BackLink } from "@/app/components/campus-console/CampusShell";
import PicturePassword from "./PicturePassword";

/**
 * /schools/login - the front door for schools and organisations. Two doors:
 *
 *  - Adults use the normal account sign-in (their accounts are created when
 *    they claim the invite we email during onboarding).
 *  - Children enter the class code printed on their login card, pick their
 *    own name, and tap three pictures. Nothing on this page ever holds an
 *    email address for a child; the pupil provider resolves the account on
 *    the server from the profile id alone.
 *
 * The look is the round 6 Campus Console (campus-console.css): both doors sit
 * inside one glass console on the campus night, and they are deliberately
 * different temperatures, cool and warm, so a child can tell which half is
 * theirs from across a classroom before reading a word.
 */

const CODE_RE = /^[A-Z0-9]{2,8}(-[A-Z0-9]{1,4})?$/;

const rise = (i: number) => ({ "data-rise": "", style: { "--i": i } as CSSProperties });
const WARN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
);
const INFO = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
const BACK_ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
const GO = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export default function SchoolLogin({ initialCode = null }: { initialCode?: string | null }) {
  const [code, setCode] = useState(initialCode ? initialCode.toUpperCase() : "");
  const [msg, setMsg] = useState<null | { kind: "warn" | "info"; text: string }>(null);

  /* The three steps a child goes through: the code off their card, their own
     name from the list, then three pictures. */
  const [lookup, setLookup] = useState<null | {
    className: string;
    pupils: { id: string; name: string; colour: string; needsSetup: boolean }[];
  }>(null);
  const [chosen, setChosen] = useState<null | { id: string; name: string; needsSetup: boolean }>(null);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /* One lookup, two ways in: the child typing the code, and the short
     link /c/ABCD-EFG that a teacher puts on the board, which arrives as
     ?class= and runs this on arrival so the child never types at all. */
  const findClass = useCallback(async (raw: string) => {
    const c = raw.trim().toUpperCase();
    if (!CODE_RE.test(c)) {
      setMsg({ kind: "warn", text: "Type the code exactly as it is on your card, like OAK-4." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/schools/class", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      if (!res.ok) {
        setMsg({ kind: "info", text: "We cannot find that class. Check the code on your card, or ask your teacher." });
        return;
      }
      const found = await res.json();
      if (!found.pupils?.length) {
        setMsg({ kind: "info", text: "Nobody is in that class yet. Ask your teacher to add you." });
        return;
      }
      setLookup(found);
    } catch {
      setMsg({ kind: "warn", text: "Something went wrong. Try again in a moment." });
    } finally {
      setBusy(false);
    }
  }, []);

  const onPupilSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void findClass(code);
  };

  /* Arrived by the short link: find the class straight away, so the first
     thing on screen is the list of names rather than a box to type in. */
  useEffect(() => {
    /* a fetch on arrival, not derived state: the lookup sets busy and the result as it goes */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialCode) void findClass(initialCode);
  }, [initialCode, findClass]);

  const onPictures = async (sequence: string[]) => {
    if (!chosen) return;
    setBusy(true);
    setAuthError(null);
    const res = await signIn("pupil", {
      childProfileId: chosen.id,
      sequence: JSON.stringify(sequence),
      redirect: false,
    });
    setBusy(false);
    if (res?.error) {
      setAuthError("Those were not your three pictures. Have another go, or ask your teacher.");
      return;
    }
    /* Straight to their own work, which is what they came for. The course
       is whichever one their class runs, so the destination is worked out
       server-side by /schools/play rather than hardcoded here: this used
       to be "/cyberhq", which sent an Explorers or Ops class to the Cyber
       Heroes hub. */
    window.location.href = "/schools/play";
  };

  return (
    <CampusShell
      family="schools"
      page="login"
      lockup={<span className="r6-brand"><SchoolBrand /></span>}
      lockupHref="/schools"
      lockupLabel="Cyber School by AlgorithmX"
      right={<><span className="r6-meta">algorithmx.io</span><BackLink href="/schools">AlgorithmX for Schools</BackLink></>}
      width={920}
    >
      <div className="r6-head" style={{ marginBottom: 4 }}>
        <h1 className="r6-title" id="r6-title" {...rise(0)}>
          Sign in to <span className="grad">AlgorithmX</span>
        </h1>
        <p className="r6-sub" {...rise(1)}>
          Teachers and leaders sign in on the left. Children use the code on their login card on
          the right, then tap three pictures. No child needs an email address or a password.
        </p>
      </div>

      <div className="r6-doors">
        {/* ── ADULTS ─────────────────────────────────────────────── */}
        <section className="r6-door teacher" aria-labelledby="sxa-teacher-h" {...rise(2)}>
          <p className="r6-eyebrow">Teachers and leaders</p>
          <h2 id="sxa-teacher-h" className="r6-h2">Sign in with your email</h2>
          {/* One door, two destinations. /schools/overview sends a
              teacher on to their own classes, so nobody has to know
              which URL is theirs, and this copy has to be true of
              both of them. */}
          <p className="r6-body">
            Your account is ready from onboarding. Sign in and you land where you work: your
            own classes, or your whole school if you hold the licence.
          </p>
          <div className="r6-foot">
            <Link href="/login?callbackUrl=%2Fschools%2Foverview" className="r6-btn pri wide">
              <span className="lbl">Sign in</span>{GO}
            </Link>
          </div>
        </section>

        {/* ── CHILDREN ───────────────────────────────────────────── */}
        <section className="r6-door pupil" aria-labelledby="sxa-pupil-h" {...rise(3)}>
          <p className="r6-eyebrow">Children</p>

          {chosen ? (
            /* Step three: the pictures. */
            <PicturePassword
              pupilName={chosen.name}
              setup={chosen.needsSetup}
              busy={busy}
              error={authError}
              onDone={onPictures}
              onBack={() => { setChosen(null); setAuthError(null); }}
            />
          ) : lookup ? (
            /* Step two: find yourself in the list. Their own name is the
               only thing a child has to recognise. */
            <>
              <h2 id="sxa-pupil-h" className="r6-h2">Who are you?</h2>
              <p className="r6-body">Tap your name. You are in {lookup.className}.</p>
              <div className="r6-names">
                {lookup.pupils.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="r6-name"
                    onClick={() => { setChosen(p); setAuthError(null); }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="r6-plain"
                onClick={() => { setLookup(null); setCode(""); }}
              >
                {BACK_ARROW} Different class
              </button>
            </>
          ) : (
            /* Step one: the code off the card. */
            <>
              <h2 id="sxa-pupil-h" className="r6-h2">Type your class code</h2>
              <p className="r6-body">It&rsquo;s the big code at the top of your login card.</p>
              <form onSubmit={onPupilSubmit} noValidate className="r6-foot">
                <label htmlFor="sxa-class-code" className="r6-label" style={{ margin: 0 }}>Class code</label>
                <input
                  id="sxa-class-code"
                  className="r6-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    if (msg) setMsg(null);
                  }}
                  placeholder="OAK-4"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={13}
                  aria-describedby={msg ? "sxa-class-msg" : undefined}
                />
                <button type="submit" className="r6-btn kid wide" disabled={busy} aria-busy={busy}>
                  <span className="lbl">{busy ? "Looking…" : "Find my class"}</span>
                </button>
                {msg && (
                  <p
                    id="sxa-class-msg"
                    role={msg.kind === "warn" ? "alert" : "status"}
                    className={`r6-msg show ${msg.kind === "warn" ? "warn" : "info"}`}
                    style={{ margin: 0 }}
                  >
                    {msg.kind === "warn" ? WARN : INFO}<span>{msg.text}</span>
                  </p>
                )}
              </form>
            </>
          )}
        </section>
      </div>

      <p className="r6-tail" {...rise(4)}>
        New to AlgorithmX? <Link href="/schools#enquiry">Ask about a free trial</Link>.
      </p>
    </CampusShell>
  );
}
