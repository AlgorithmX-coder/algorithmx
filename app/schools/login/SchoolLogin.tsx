"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import PicturePassword from "./PicturePassword";
import "./auth.css";

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
 * The look lives in auth.css. The two doors are deliberately different
 * temperatures, cool and warm, so a child can tell which half is theirs
 * from across a classroom before reading a word.
 */

const CODE_RE = /^[A-Z0-9]{2,8}(-[A-Z0-9]{1,4})?$/;

export default function SchoolLogin() {
  const [code, setCode] = useState("");
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

  const onPupilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
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
  };

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
    <div className="sxa">
      <main className="sxa-main">
        <div className="sxa-wrap">
          <div className="sxa-rail">
            <Link href="/schools" className="sxa-eyebrow">
              <span aria-hidden>&larr;</span> AlgorithmX for Schools
            </Link>
            <span className="sxa-eyebrow sxa-dim">algorithmx.io</span>
          </div>

          <h1 className="sxa-h1">
            Sign in to <span className="sxa-grad">AlgorithmX</span>
          </h1>
          <p className="sxa-lede">
            Teachers and leaders sign in on the left. Children use the code on their login card on
            the right, then tap three pictures. No child needs an email address or a password.
          </p>

          <div className="sxa-doors">
            {/* ── ADULTS ─────────────────────────────────────────────── */}
            <section className="sxa-door teacher" aria-labelledby="sxa-teacher-h">
              <p className="sxa-eyebrow">Teachers and leaders</p>
              <h2 id="sxa-teacher-h" className="sxa-h2">Sign in with your email</h2>
              {/* One door, two destinations. /schools/overview sends a
                  teacher on to their own classes, so nobody has to know
                  which URL is theirs, and this copy has to be true of
                  both of them. */}
              <p className="sxa-body">
                Your account is ready from onboarding. Sign in and you land where you work: your
                own classes, or your whole school if you hold the licence.
              </p>
              <div className="sxa-foot">
                <Link href="/login?callbackUrl=%2Fschools%2Foverview" className="sxa-btn sxa-btn-go">
                  Sign in
                </Link>
              </div>
            </section>

            {/* ── CHILDREN ───────────────────────────────────────────── */}
            <section className="sxa-door pupil" aria-labelledby="sxa-pupil-h">
              <p className="sxa-eyebrow">Children</p>

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
                  <h2 id="sxa-pupil-h" className="sxa-h2">Who are you?</h2>
                  <p className="sxa-body">Tap your name. You are in {lookup.className}.</p>
                  <div className="sxa-names">
                    {lookup.pupils.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="sxa-name"
                        onClick={() => { setChosen(p); setAuthError(null); }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="sxa-plain"
                    onClick={() => { setLookup(null); setCode(""); }}
                  >
                    &larr; Different class
                  </button>
                </>
              ) : (
                /* Step one: the code off the card. */
                <>
                  <h2 id="sxa-pupil-h" className="sxa-h2">Type your class code</h2>
                  <p className="sxa-body">It&rsquo;s the big code at the top of your login card.</p>
                  <form onSubmit={onPupilSubmit} noValidate className="sxa-foot">
                    <label htmlFor="sxa-class-code" className="sxa-label">Class code</label>
                    <input
                      id="sxa-class-code"
                      className="sxa-code"
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
                    <button type="submit" className="sxa-btn sxa-btn-kid" disabled={busy}>
                      {busy ? "Looking…" : "Find my class"}
                    </button>
                    {msg && (
                      <p
                        id="sxa-class-msg"
                        role={msg.kind === "warn" ? "alert" : "status"}
                        className={`sxa-msg${msg.kind === "warn" ? " warn" : ""}`}
                      >
                        {msg.text}
                      </p>
                    )}
                  </form>
                </>
              )}
            </section>
          </div>

          <p className="sxa-tail">
            New to AlgorithmX? <Link href="/schools#enquiry">Ask about a free trial</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
