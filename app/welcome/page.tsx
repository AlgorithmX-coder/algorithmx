"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * /welcome: the first thing a child sees after a grown-up sets them up.
 * Adam and Layla say hello by name and send them to the mission map.
 *
 * Skin: "Lit Map" (landing lab round 6, v1, 2026-11-23). A short scene in
 * place of the old thirteen-second wait: the frame lands, "Hi {name}!", the
 * three lines arrive as speech bubbles, the Raccoon peeks in, and the
 * button is in place by about 2.8 s. The button is a real link from the
 * first frame. The name still comes from /api/child-profile, as before, and
 * the scene waits for it so the greeting never changes under the child.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import HeroesShell, { Icon } from "@/app/components/heroes-portal/HeroesShell";

const WAVE = (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="wave" data-pop data-delay="900">
    <g fill="currentColor"><rect x="20" y="8" width="9" height="30" rx="4.5" /><rect x="30" y="4" width="9" height="34" rx="4.5" /><rect x="40" y="8" width="9" height="30" rx="4.5" /><rect x="50" y="16" width="8" height="24" rx="4" /><path d="M18 30c-4-6-11-5-11 1 0 4 6 12 9 17 5 8 12 12 21 12 12 0 20-8 20-20V30H18z" /></g>
    <path d="M8 14c-3 3-4 7-3 11M12 9c-2 1.5-3.4 3.3-4 5.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
  </svg>
);

export default function WelcomePage() {
  const [childName, setChildName] = useState("Cyber Hero");
  const [loaded, setLoaded] = useState(false);
  /* A slow network never leaves a child looking at an empty sky: the scene
     starts after 2.5 s whether or not the name has arrived. */
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Fetch child profile. The API returns the schema-shape field
  // (`name`), not the old wizard-local `childName`. Reading the wrong
  // field used to silently fall back to "Cyber Hero".
  useEffect(() => {
    fetch("/api/child-profile")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0 && data[0].name) {
          setChildName(data[0].name);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <HeroesShell ready={loaded || waited}>
      <div className="wl-main">
        <div className="hlm-wrap wl-grid">
          <div className="wl-stage" data-pop data-delay="150">
            <span className="wl-halo" aria-hidden="true" />
            <div className="wl-float">
              <div className="wl-frame">
                <img src="/characters/heroes-hq.webp" alt="Adam and Layla in the Cyber Heroes command centre" width={1205} height={900} />
                <div className="wl-names" aria-hidden="true"><span>Adam</span><span>Layla</span></div>
              </div>
            </div>
            <img className="wl-coon" data-pop data-delay="2300" src="/characters/cast-raccoon.webp" alt="The Hacker Raccoon, peeking in" width={754} height={800} />
          </div>
          <section aria-labelledby="wl-h1">
            <h1 className="wl-hi" id="wl-h1" data-rise data-delay="550"><span className="hlm-grad">Hi {childName}!</span>{WAVE}</h1>
            <div className="wl-says">
              <div className="wl-b" data-rise data-delay="1100"><span className="who"><img src="/cyberheroes/portal/face-adam.webp" alt="" width={46} height={46} /></span><p>We&apos;re Adam and Layla!</p></div>
              <div className="wl-b" data-rise data-delay="1600"><span className="who"><img src="/cyberheroes/portal/face-layla.webp" alt="" width={46} height={46} /></span><p>We need <strong>YOUR</strong> help to learn about cybersecurity and defeat the Hacker Raccoon!</p></div>
              <div className="wl-b big" data-rise data-delay="2100"><span className="who"><img src="/cyberheroes/portal/face-adam.webp" alt="" width={46} height={46} /></span><p>Every week is a new adventure. Are you ready?</p></div>
            </div>
            <div className="wl-cta">
              <Link className="hlm-btn big" href="/dashboard" data-pop data-delay="2600">Let&apos;s Start! <Icon name="arr" /></Link>
              <span className="wl-next" data-rise data-delay="2800">
                <img src="/dashboard/week-art/week-1.webp" alt="" width={52} height={52} />
                <span>First mission<b>Passwords: The Secret Code</b></span>
              </span>
            </div>
          </section>
        </div>
      </div>
    </HeroesShell>
  );
}
