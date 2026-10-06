"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import SchoolsGlobe from "@/app/schools/SchoolsGlobe";
import PicturePassword from "./PicturePassword";

/**
 * /schools/login - the front door for schools. Two doors:
 *
 *  - Teachers use the normal account sign-in (their accounts are created
 *    during onboarding).
 *  - Pupils enter the class code printed on their login card. The class and
 *    pupil model ships with the pilot build; until a school is onboarded no
 *    code can resolve, and the form says so honestly rather than pretending.
 */

const CODE_RE = /^[A-Z0-9]{2,8}(-[A-Z0-9]{1,4})?$/;

const card: React.CSSProperties = {
  position: "relative",
  padding: "30px 28px 28px",
  borderRadius: 20,
  background: "linear-gradient(180deg, rgba(24,29,56,0.82), rgba(14,17,34,0.82))",
  border: "1px solid rgba(159,245,255,0.28)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 70px -40px rgba(0,229,255,0.5)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.26em",
  textTransform: "uppercase",
};

const h2: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--lv2-font-display)",
  fontSize: "1.6rem",
  fontWeight: 500,
  letterSpacing: "-0.015em",
  color: "#e8edff",
};

const body: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--lv2-font-display)",
  fontSize: 15,
  lineHeight: 1.6,
  color: "rgba(232,237,255,0.74)",
};

const pill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 50,
  padding: "0 24px",
  borderRadius: 999,
  border: "none",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
};

export default function SchoolLogin() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<null | { kind: "warn" | "info"; text: string }>(null);

  /* The three steps a child goes through: the code off their card, their own
     name from the list, then three pictures. Nothing here ever holds an email
     address; the pupil provider resolves the account on the server. */
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
    /* straight to their own progress, which is what they came for */
    window.location.href = "/cyberhq";
  };

  return (
    <>
      <SchoolsGlobe />
      <main
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "calc(var(--lv2-rail) * 1.2) var(--lv2-rail)",
          color: "#e8edff",
        }}
      >
        <div style={{ width: "100%", maxWidth: 960 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
            <Link
              href="/schools"
              style={{ ...eyebrow, color: "var(--lv2-cyan-soft)", textDecoration: "none" }}
            >
              <span aria-hidden>←</span> AlgorithmX for Schools
            </Link>
            <Link href="/" style={{ ...eyebrow, color: "rgba(232,237,255,0.55)", textDecoration: "none" }}>
              algorithmx.io
            </Link>
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(2rem, 4.2vw, 3rem)",
              fontWeight: 400,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            School <span className="sch-grad">login</span>
          </h1>
          <p style={{ ...body, marginBottom: 30, maxWidth: 560 }}>
            Teachers sign in on the left. Pupils use the code on their login card on the right.
          </p>

          <div className="sch-login-grid">
            {/* TEACHERS */}
            <section style={card} aria-labelledby="sch-teacher-h">
              <p style={{ ...eyebrow, color: "var(--lv2-cyan-soft)" }}>Teachers</p>
              <h2 id="sch-teacher-h" style={h2}>Sign in with your school email</h2>
              <p style={body}>
                Your account is ready from onboarding. Sign in to see your classes and every pupil&rsquo;s progress.
              </p>
              <div style={{ marginTop: "auto", paddingTop: 6 }}>
                <Link
                  href="/login?callbackUrl=%2Fhub"
                  style={{
                    ...pill,
                    background: "linear-gradient(135deg, #2af0ff 0%, #00cfff 55%, #00b4f0 100%)",
                    color: "#04050d",
                    boxShadow: "0 12px 30px -12px rgba(0,229,255,0.7)",
                  }}
                >
                  Teacher sign in
                </Link>
              </div>
            </section>

            {/* PUPILS */}
            <section style={{ ...card, borderColor: "rgba(255,179,71,0.4)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 70px -40px rgba(255,179,71,0.55)" }} aria-labelledby="sch-pupil-h">
              <p style={{ ...eyebrow, color: "#ffb347" }}>Pupils</p>

              {/* Step three: the pictures. */}
              {chosen ? (
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
                   only thing a child has to recognise, which is why the
                   colour they picked is on the button too. */
                <>
                  <h2 id="sch-pupil-h" style={h2}>Who are you?</h2>
                  <p style={body}>Tap your name. You are in {lookup.className}.</p>
                  <div className="sch-names">
                    {lookup.pupils.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="sch-name"
                        onClick={() => { setChosen(p); setAuthError(null); }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="sch-plain"
                    onClick={() => { setLookup(null); setCode(""); }}
                  >
                    &larr; Different class
                  </button>
                </>
              ) : (
              <>
              <h2 id="sch-pupil-h" style={h2}>Type your class code</h2>
              <p style={body}>It&rsquo;s the big code at the top of your login card.</p>
              <form onSubmit={onPupilSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: "auto", paddingTop: 6 }}>
                <label htmlFor="sch-class-code" style={{ ...eyebrow, color: "rgba(232,237,255,0.6)" }}>
                  Class code
                </label>
                <input
                  id="sch-class-code"
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
                  aria-describedby={msg ? "sch-class-msg" : undefined}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#ffb347"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,179,71,0.18)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,179,71,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
                  style={{
                    height: 58,
                    borderRadius: 14,
                    padding: "0 16px",
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textAlign: "center",
                    color: "#e8edff",
                    background: "rgba(8,10,22,0.78)",
                    border: "1.5px solid rgba(255,179,71,0.4)",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    ...pill,
                    background: "linear-gradient(135deg, #ffd27a 0%, #ffb347 60%, #ff9f2e 100%)",
                    color: "#1a1004",
                    boxShadow: "0 12px 30px -12px rgba(255,179,71,0.7)",
                  }}
                >
                  Find my class
                </button>
                {msg && (
                  <p
                    id="sch-class-msg"
                    role={msg.kind === "warn" ? "alert" : "status"}
                    style={{ ...body, fontSize: 14, color: msg.kind === "warn" ? "#f4b878" : "rgba(232,237,255,0.8)" }}
                  >
                    {msg.text}
                  </p>
                )}
              </form>
              </>
              )}
            </section>
          </div>

          <p style={{ ...body, marginTop: 28, fontSize: 14, color: "rgba(232,237,255,0.55)" }}>
            New to AlgorithmX for Schools?{" "}
            <Link href="/schools#enquiry" style={{ color: "var(--lv2-cyan-soft)", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Request a free pilot
            </Link>
            .
          </p>
        </div>
      </main>

      <style>{`
        .sch-login-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }
        @media (max-width: 760px) {
          .sch-login-grid { grid-template-columns: 1fr; }
        }
        .sch-grad {
          background: linear-gradient(92deg, #7df0ff 0%, #b98bff 55%, #ff8ad4 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        main :is(a, button):focus-visible { outline: 2px solid #00e5ff; outline-offset: 3px; }
        /* ---- picking your name, and your three pictures ---- */
        /* Everything here is sized for a six year old on a shared machine:
           big targets, no small print, nothing to read quickly. */
        .sch-names {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px; margin: 14px 0 12px; max-height: 300px; overflow-y: auto;
        }
        .sch-name {
          min-height: 56px; padding: 10px 14px; border-radius: 14px; cursor: pointer;
          font-family: var(--lv2-font-display, inherit); font-size: 20px; font-weight: 700;
          color: #e8edff; background: rgba(8,10,22,0.72);
          border: 1.5px solid rgba(255,179,71,0.38);
        }
        .sch-name:hover { border-color: #ffb347; background: rgba(255,179,71,0.12); }
        .sch-plain {
          background: none; border: 0; cursor: pointer; padding: 6px 0;
          color: rgba(232,237,255,0.6); font-size: 14px; text-align: left;
        }
        .sch-plain:hover { color: #e8edff; }

        .pp { display: flex; flex-direction: column; gap: 8px; }
        .ppback {
          align-self: flex-start; background: none; border: 0; cursor: pointer;
          color: rgba(232,237,255,0.6); font-size: 14px; padding: 0 0 4px;
        }
        .ppback:hover { color: #e8edff; }
        .pphead {
          margin: 0; font-family: var(--lv2-font-display, inherit);
          font-size: 26px; font-weight: 700; color: #e8edff; line-height: 1.15;
        }
        .ppunder { margin: 0 0 4px; color: rgba(232,237,255,0.72); font-size: 15px; }
        /* progress as dots, never as the pictures themselves: the screen
           must not show the answer back to the room */
        .ppdots { display: flex; gap: 8px; margin: 2px 0 6px; }
        .ppdot {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,179,71,0.5); transition: background .12s;
        }
        .ppdot.on { background: #ffb347; border-color: #ffb347; }
        .pperr { margin: 0 0 4px; color: #f4b878; font-size: 15px; font-weight: 600; }
        .ppbusy { margin: 6px 0 0; color: rgba(232,237,255,0.72); font-size: 15px; }
        .ppgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .ppcell {
          aspect-ratio: 1 / 1; border-radius: 16px; cursor: pointer; padding: 10px;
          background: rgba(8,10,22,0.72); border: 1.5px solid rgba(255,179,71,0.3);
          display: grid; place-items: center; transition: transform .1s, border-color .1s;
        }
        .ppcell:hover { border-color: #ffb347; }
        .ppcell:active { transform: scale(0.94); }
        .ppcell img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
        .ppcell:disabled { opacity: .5; cursor: default; }
        @media (prefers-reduced-motion: reduce) {
          .ppcell, .ppdot { transition: none; }
          .ppcell:active { transform: none; }
        }
      `}</style>
    </>
  );
}
