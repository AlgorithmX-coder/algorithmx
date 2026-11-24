"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * /onboarding: a grown-up sets up their child's Cyber Heroes profile. Name,
 * then age, then favourite colour, then off to /welcome.
 *
 * Skin: "Lit Map" (landing lab round 6, v1, 2026-11-23). A numbered rail,
 * one card per step and a hero card that builds itself as you type. The
 * fields, their order, the "Next appears at two letters" rule and the
 * submit (POST /api/child-profile, then /welcome) are exactly as before.
 */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import HeroesShell, { Icon, PersonIcon, ShieldIcon } from "@/app/components/heroes-portal/HeroesShell";
import { DEFAULT_HERO_COLOUR, HERO_COLOURS, heroColour, inkOn } from "@/app/lib/heroColours";

const AGES = [6, 7, 8, 9, 10];
const RAIL = ["Name", "Age", "Colour"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [avatarColor, setAvatarColor] = useState(DEFAULT_HERO_COLOUR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const h1Ref = useRef<HTMLHeadingElement>(null);

  const goTo = (s: number) => {
    setStep(s);
    requestAnimationFrame(() => h1Ref.current?.focus({ preventScroll: true }));
  };
  const goNext = () => goTo(step + 1);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      /* The API expects the canonical schema shape: `name`,
       *  `dateOfBirth` (ISO date string), `favouriteColour`. The
       *  wizard collects `childName`, `age` (integer years), and
       *  `avatarColor` (a slug), so we translate at the boundary
       *  rather than renaming wizard state.
       *
       *  Age → DOB: store DOB as today minus the given number of
       *  years. The platform reads back via getAge(dob) which
       *  computes age from DOB, so this round-trips correctly (the
       *  child stays the same integer age for one year, then
       *  increments). */
      const ageYears = age ?? 0;
      const today = new Date();
      const dob = new Date(
        today.getFullYear() - ageYears,
        today.getMonth(),
        today.getDate(),
      );

      const res = await fetch("/api/child-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: childName.trim(),
          dateOfBirth: dob.toISOString(),
          favouriteColour: avatarColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/welcome");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const name = childName.trim();
  const colour = heroColour(avatarColor);
  const ink = inkOn(colour.hex);
  const title = step === 0 ? "Welcome to Cyber Heroes!" : step === 1 ? `How old is ${name}?` : `Pick ${name}'s favourite colour!`;
  const lead = step === 0 ? "Tell us about your young hero so we can pick the perfect adventure." : step === 1 ? "Missions are made for ages 6 to 9." : "This will be their profile accent.";
  const showAge = age !== null && step >= 1;

  return (
    <HeroesShell status={loading ? "Setting up your hero's profile" : ""}>
      <div className="ob-main">
        <div className="hlm-wrap ob-grid">
          <section className="ob-flow" aria-labelledby="ob-h1">
            <ol className="ob-rail" aria-label="Set-up steps" data-rise>
              {RAIL.map((t, i) => (
                <RailItem key={t} i={i} t={t} step={step} />
              ))}
            </ol>
            <span className="hlm-eyebrow" data-rise>For grown-ups · set up your hero</span>
            <h1 className="ob-h1" id="ob-h1" ref={h1Ref} tabIndex={-1} data-rise>{title}</h1>
            <p className="hlm-lead" data-rise>{lead}</p>

            <div className="hlm-card lit ob-step" hidden={step !== 0} data-rise>
              <label className="ob-label" htmlFor="ob-name">What&apos;s your child&apos;s name?</label>
              <div className="ob-field">
                <PersonIcon />
                <input
                  className="ob-input"
                  id="ob-name"
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && name.length >= 2) { e.preventDefault(); goNext(); } }}
                  autoFocus
                  autoComplete="off"
                  placeholder="e.g. Oliver"
                  aria-describedby="ob-name-hint"
                />
              </div>
              <p className="ob-hint" id="ob-name-hint">Their first name is plenty. Adam and Layla will use it to say hello.</p>
              {name.length >= 2 ? (
                <div className="ob-row"><button className="hlm-btn" type="button" onClick={goNext}>Next <Icon name="arr" /></button></div>
              ) : null}
            </div>

            <fieldset className="hlm-card lit ob-step" hidden={step !== 1} data-rise style={{ border: "1px solid var(--hlm-line)", marginInline: 0, minWidth: 0 }}>
              <legend className="hlm-sr">Age</legend>
              <ul className="ob-ages">
                {AGES.map((a) => (
                  <li className="ob-age" key={a}>
                    <input type="radio" name="ob-age" id={`ob-age-${a}`} value={a} checked={age === a} onChange={() => setAge(a)} />
                    <label htmlFor={`ob-age-${a}`}><span className="hlm-sr">Age </span>{a}</label>
                  </li>
                ))}
              </ul>
              {age !== null ? (
                <p className="ob-fit"><ShieldIcon /><span>Cyber Heroes, perfect for <b className="nm">{name}</b>!</span></p>
              ) : null}
              <div className="ob-row">
                {age !== null ? <button className="hlm-btn" type="button" onClick={goNext}>Next <Icon name="arr" /></button> : null}
                <button className="hlm-ghost ob-back" type="button" onClick={() => goTo(0)}><Icon name="back" size={18} /> Back</button>
              </div>
            </fieldset>

            <fieldset className="hlm-card lit ob-step" hidden={step !== 2} data-rise style={{ border: "1px solid var(--hlm-line)", marginInline: 0, minWidth: 0 }}>
              <legend className="hlm-sr">Favourite colour</legend>
              <ul className="ob-sws">
                {HERO_COLOURS.map((c) => (
                  <li className="ob-sw" key={c.slug}>
                    <input type="radio" name="ob-colour" id={`ob-c-${c.slug}`} value={c.slug} checked={avatarColor === c.slug} onChange={() => setAvatarColor(c.slug)} />
                    <label htmlFor={`ob-c-${c.slug}`}>
                      <span className="c" style={{ "--c": c.hex, color: inkOn(c.hex) } as React.CSSProperties}><Icon name="tick" /></span>
                      {c.label}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="ob-err" role="alert">{error}</div>
              <div className="ob-row">
                <button className="hlm-btn big" type="button" onClick={handleSubmit} disabled={loading}>{loading ? "Setting up..." : "Start My Adventure!"}</button>
                <button className="hlm-ghost ob-back" type="button" onClick={() => goTo(1)}><Icon name="back" size={18} /> Back</button>
              </div>
            </fieldset>
          </section>

          <aside className="ob-side" aria-label="Profile preview" data-pop data-delay="380">
            <div className="ob-card" style={{ "--kid": colour.hex } as React.CSSProperties}>
              <i className="spark" style={{ left: -6, top: "30%", animationDelay: ".4s" }} aria-hidden="true" />
              <i className="spark" style={{ right: "10%", top: -6, animationDelay: "1.6s" }} aria-hidden="true" />
              <i className="spark" style={{ right: -6, bottom: "24%", animationDelay: "2.4s" }} aria-hidden="true" />
              <div className="art">
                <span className="tag">Hero card</span>
                <img src="/characters/heroes-hq.webp" alt="Adam and Layla, ready to meet your child" width={1205} height={900} />
              </div>
              <div className="ob-who">
                <span className="hlm-ava" style={{ "--kid": colour.hex, color: ink } as React.CSSProperties} aria-hidden="true">{(name[0] || "?").toUpperCase()}</span>
                <div className="nm"><b>{name ? `${name}'s Profile` : "Your hero's profile"}</b><span>{showAge ? `Age ${age} · Cyber Heroes` : "Cyber Heroes"}</span></div>
              </div>
              <dl className="ob-facts">
                <div><dt>Name</dt><dd data-empty={name ? undefined : ""}>{name || "..."}</dd></div>
                <div><dt>Age</dt><dd data-empty={showAge ? undefined : ""}>{showAge ? `Age ${age}` : "..."}</dd></div>
                <div><dt>Colour</dt><dd data-empty={step >= 2 ? undefined : ""}>{step >= 2 ? <><i style={{ "--kid": colour.hex } as React.CSSProperties} />{colour.label}</> : "..."}</dd></div>
              </dl>
              <p className="ob-note">Builds itself as you go. You can change it later.</p>
            </div>
          </aside>
        </div>
      </div>
    </HeroesShell>
  );
}

function RailItem({ i, t, step }: { i: number; t: string; step: number }) {
  const s = i === step ? "on" : i < step ? "done" : "todo";
  return (
    <>
      {i > 0 ? <li className="bar" aria-hidden="true" data-s={i <= step ? "done" : "todo"} /> : null}
      <li data-s={s} aria-current={i === step ? "step" : undefined}><span className="n" aria-hidden="true">{i + 1}</span><span className="t">{t}</span></li>
    </>
  );
}
