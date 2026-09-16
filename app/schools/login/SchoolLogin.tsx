"use client";

import { useState } from "react";
import Link from "next/link";
import GlobalBackdrop from "@/app/components/landing-v2/GlobalBackdrop";

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

  const onPupilSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!CODE_RE.test(c)) {
      setMsg({ kind: "warn", text: "Type the code exactly as it is on your card, like OAK-4." });
      return;
    }
    // No class can resolve until the first school is onboarded.
    setMsg({
      kind: "info",
      text: "We can't find that class yet. Ask your teacher to check the code on your card.",
    });
  };

  return (
    <>
      <GlobalBackdrop />
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
      `}</style>
    </>
  );
}
