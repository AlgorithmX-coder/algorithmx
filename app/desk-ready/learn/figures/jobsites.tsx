"use client";

import type { CSSProperties, ReactNode } from "react";
import { W } from "../../tokens";
import { FigureFrame, Part, type PartInfo } from "./parts";

/* Job sites, drawn with every part numbered (Module 13): a job advert as
 * the big job boards show one (Indeed and the like), the same kind of
 * advert from a scammer, and the top of a profile on a work networking
 * site (LinkedIn and the like). The sites are invented and drawn plainly;
 * the lessons name the real ones in words. */

const keep: CSSProperties = { whiteSpace: "nowrap" };
const SITE = "#2557a7";
const SITE_SOFT = "#eef3fc";
const WARN = "#a4262c";

function Browser({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div style={{ borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, background: W.page, overflowWrap: "normal" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "0 12px", background: W.sunk, borderRadius: "8px 8px 0 0" }}>
        <span aria-hidden style={{ fontSize: 13, color: W.faint, letterSpacing: 4, ...keep }}>
          ← → ↻
        </span>
        <span style={{ flex: 1, minWidth: 0, padding: "4px 12px", borderRadius: 14, background: W.page, fontSize: 12.5, color: W.body, overflow: "hidden", textOverflow: "ellipsis", ...keep }}>{url}</span>
      </div>
      {children}
    </div>
  );
}

/* ── 1. a job advert ──────────────────────────────────────────────────── */

export type AdPart = "title" | "employer" | "location" | "pay" | "hours" | "details" | "apply" | "alert";

export const AD_PARTS: Record<AdPart, PartInfo> = {
  title: { n: 1, name: "Job title", what: "The job in a few words. Search for the titles offices use: Office Administrator, Receptionist, Data Entry Clerk." },
  employer: { n: 2, name: "Employer", what: "Who you'd work for. Look them up: a real firm has a website, an address and reviews." },
  location: { n: 3, name: "Where", what: "The town, or \"Hybrid\" (some days at home) or \"Remote\". Work out the journey before you apply." },
  pay: { n: 4, name: "Pay", what: "A year's pay, or an hourly rate. Compare a few adverts for the same job to see what's usual where you live." },
  hours: { n: 5, name: "Hours and contract", what: "Full-time or part-time; permanent or temporary; the days and times." },
  details: { n: 6, name: "What you'd do", what: "The work itself. Match your CV's skill lines to the words used here." },
  apply: { n: 7, name: "How to apply", what: "Apply now sends your CV through the site. Some adverts send you to the company's own website." },
  alert: { n: 8, name: "Job alert", what: "Turn it on and the site emails you new jobs like this one, so you don't have to search every day." },
};

export const SCAM_PARTS: Record<AdPart, PartInfo> = {
  title: { n: 1, name: "A vague job", what: "\"Office assistant, work from home\": no team, no product, nothing you could check." },
  employer: { n: 2, name: "No company name", what: "\"Recruiting now\" isn't an employer. A real advert names who you'd work for." },
  location: { n: 3, name: "\"Anywhere\"", what: "No town and no office to visit, so nobody you could ever go and see." },
  pay: { n: 4, name: "Pay too good to be true", what: "£850 a week for two hours a day, no experience. Real office pay is nothing like it." },
  hours: { n: 5, name: "Too easy", what: "\"Pick your own hours\" and \"start today\": made to rush you." },
  details: { n: 6, name: "It asks you for money and bank details", what: "A real employer never charges you to work, and only asks for bank details after a written job offer." },
  apply: { n: 7, name: "Apply by chat app", what: "\"Message Dave\" on a phone number, not through the site or a company's own address." },
  alert: { n: 8, name: "Report job", what: "Every job site has one. Press it, and don't reply." },
};

const REAL = {
  url: "https://www.jobsnearby.example/jobs/office-administrator-leicester",
  title: "Office Administrator",
  employer: "Castlegate Builders Merchants",
  rating: "4.1 ★ · 38 reviews",
  location: "Leicester LE4",
  pay: "£25,500 a year",
  hours: ["Full-time", "Permanent", "Monday to Friday, 8:30 to 5:00"],
  details: ["Answer the phone and the shared inbox", "Keep the orders spreadsheet up to date", "Book deliveries and send out invoices"],
  apply: "Apply now",
  sub: "Posted 3 days ago · Easy apply with your CV",
};

const SCAM = {
  url: "https://www.jobsnearby.example/jobs/office-assistant-work-from-home",
  title: "Office Assistant, work from home!!",
  employer: "Recruiting now",
  rating: "No reviews",
  location: "Anywhere",
  pay: "£850 a week, no experience needed",
  hours: ["2 hours a day", "Pick your own hours", "Start today"],
  details: ["Pay a £45 fee for your starter pack and ID check", "Send your bank details today so we can set up your pay"],
  apply: "Message Dave: 07700 900913",
  sub: "Posted today",
};

export function JobAdFigure({ focus, title, what, note, scam }: { focus?: AdPart[]; title?: string; what?: Partial<Record<AdPart, string>>; note?: string; scam?: boolean }) {
  const ad = scam ? SCAM : REAL;
  const info = { ...(scam ? SCAM_PARTS : AD_PARTS) } as Record<AdPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as AdPart[]) info[k] = { ...info[k], what: what![k]! };
  const bad = (on: boolean): CSSProperties => (scam && on ? { color: WARN } : {});
  return (
    <FigureFrame info={info} focus={focus} title={title ?? (scam ? "A fake job advert" : "A job advert")} note={note} minWidth={560}>
      <Browser url={ad.url}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 46, padding: "0 16px", borderBottom: `1px solid ${W.edge}` }}>
          <b style={{ fontSize: 17, color: SITE, letterSpacing: "-0.01em" }}>jobsnearby</b>
          <span style={{ flex: 1, minWidth: 0, display: "flex", gap: 6 }}>
            <span style={{ flex: 1, minWidth: 0, padding: "5px 10px", border: `1px solid ${W.edge}`, borderRadius: 6, fontSize: 13, color: W.body, overflow: "hidden", textOverflow: "ellipsis", ...keep }}>{scam ? "office work from home" : "office administrator"}</span>
            <span style={{ padding: "5px 10px", border: `1px solid ${W.edge}`, borderRadius: 6, fontSize: 13, color: W.body, ...keep }}>Leicester</span>
          </span>
        </div>
        <div style={{ padding: "16px 22px 20px 56px", display: "grid", gap: 10 }}>
          <Part k="title">
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, ...bad(true) }}>{ad.title}</div>
          </Part>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 48px", alignItems: "center" }}>
            <Part k="employer" block={false}>
              <span style={{ fontSize: 15, ...keep }}>
                <span style={{ color: SITE, textDecoration: scam ? "none" : "underline", fontWeight: 600, ...bad(true) }}>{ad.employer}</span>
                <span style={{ color: W.muted, fontSize: 13 }}> · {ad.rating}</span>
              </span>
            </Part>
            <Part k="location" block={false}>
              <span style={{ fontSize: 15, ...keep, ...bad(true) }}>{ad.location}</span>
            </Part>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 48px", alignItems: "center" }}>
            <Part k="pay" block={false}>
              <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, background: SITE_SOFT, fontSize: 14.5, fontWeight: 600, ...bad(true) }}>{ad.pay}</span>
            </Part>
            <Part k="hours" block={false}>
              <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
                {ad.hours.map((h) => (
                  <span key={h} style={{ padding: "4px 10px", borderRadius: 6, background: W.chrome, fontSize: 13.5, ...keep, ...bad(true) }}>
                    {h}
                  </span>
                ))}
              </span>
            </Part>
          </div>
          <Part k="details">
            <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>
              <b style={{ display: "block", fontSize: 15 }}>{scam ? "About the role" : "What you'll do"}</b>
              <ul style={{ listStyle: "none", margin: "4px 0 0", padding: 0 }}>
                {ad.details.map((d) => (
                  <li key={d} style={{ position: "relative", paddingLeft: 16, ...bad(true) }}>
                    <span aria-hidden style={{ position: "absolute", left: 2 }}>•</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </Part>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 48px", alignItems: "center", marginTop: 4 }}>
            <Part k="apply" block={false}>
              <span style={{ display: "inline-flex", alignItems: "center", minHeight: 38, padding: "0 18px", borderRadius: 8, background: scam ? "#25a35a" : SITE, color: "#fff", fontWeight: 700, fontSize: 14.5, ...keep }}>{ad.apply}</span>
            </Part>
            <Part k="alert" block={false}>
              {scam ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 34, padding: "0 12px", borderRadius: 8, border: `1px solid ${W.edge}`, fontSize: 13.5, ...keep }}>⚑ Report job</span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 34, padding: "0 12px", borderRadius: 8, border: `1px solid ${W.edge}`, fontSize: 13.5, ...keep }}>
                  <span aria-hidden style={{ width: 30, height: 16, borderRadius: 8, background: SITE, position: "relative", display: "inline-block" }}>
                    <span style={{ position: "absolute", right: 2, top: 2, width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
                  </span>
                  Email me jobs like this
                </span>
              )}
            </Part>
          </div>
          <span style={{ fontSize: 12.5, color: W.muted }}>{ad.sub}</span>
        </div>
      </Browser>
    </FigureFrame>
  );
}

/* A small advert card for a Try lab: no numbers, just the advert. */
export function MiniAd({ ad }: { ad: { title: string; employer: string; location: string; pay: string; hours: string; text: string; apply: string } }) {
  return (
    <div style={{ background: W.page, color: W.ink, borderRadius: 8, border: `1px solid ${W.edge}`, boxShadow: W.float, padding: "14px 16px", fontFamily: W.font, overflowWrap: "normal" }}>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.25 }}>{ad.title}</div>
      <div style={{ marginTop: 4, fontSize: 14.5 }}>
        <span style={{ color: SITE, fontWeight: 600 }}>{ad.employer}</span>
        <span style={{ color: W.muted }}> · {ad.location}</span>
      </div>
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span style={{ padding: "3px 9px", borderRadius: 6, background: SITE_SOFT, fontSize: 13.5, fontWeight: 600 }}>{ad.pay}</span>
        <span style={{ padding: "3px 9px", borderRadius: 6, background: W.chrome, fontSize: 13.5 }}>{ad.hours}</span>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.5, color: W.body }}>{ad.text}</p>
      <span style={{ display: "inline-flex", alignItems: "center", marginTop: 10, minHeight: 34, padding: "0 14px", borderRadius: 8, background: SITE, color: "#fff", fontWeight: 700, fontSize: 13.5 }}>{ad.apply}</span>
    </div>
  );
}

/* ── 2. a profile on a work networking site ───────────────────────────── */

export type ProfilePart = "photo" | "name" | "headline" | "location" | "open" | "about" | "skills";

export const PROFILE_PARTS: Record<ProfilePart, PartInfo> = {
  photo: { n: 1, name: "Photo", what: "Optional. If you add one: your face, plain background, as you'd look at work." },
  name: { n: 2, name: "Your name", what: "The same name as on your CV, so an employer knows it's you." },
  headline: { n: 3, name: "Headline", what: "The line under your name: the job you want and what you bring, not just \"Looking for work\"." },
  location: { n: 4, name: "Location", what: "Your town, so local employers find you. Never your street." },
  open: { n: 5, name: "Open to work", what: "Tells recruiters which jobs you want. You choose whether everyone sees it, or recruiters only." },
  about: { n: 6, name: "About", what: "Your CV's profile, a little longer, in your own voice." },
  skills: { n: 7, name: "Skills", what: "The skills recruiters search for. Add the ones you can show: Excel, Outlook, customer service." },
};

export function ProfileFigure({ focus, title = "The top of a profile", what, note }: { focus?: ProfilePart[]; title?: string; what?: Partial<Record<ProfilePart, string>>; note?: string }) {
  const info = { ...PROFILE_PARTS } as Record<ProfilePart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as ProfilePart[]) info[k] = { ...info[k], what: what![k]! };
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={540}>
      <Browser url="https://www.worknet.example/in/jordan-miles">
        <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 42, padding: "0 16px", borderBottom: `1px solid ${W.edge}` }}>
          <b style={{ fontSize: 16, color: "#0a66c2" }}>worknet</b>
          <span style={{ fontSize: 13, color: W.muted }}>Home · Jobs · Messages</span>
        </div>
        <div style={{ background: "#f4f2ee", padding: "14px 16px 18px" }}>
          <div style={{ background: W.page, borderRadius: 8, border: `1px solid ${W.edge}`, overflow: "visible" }}>
            <div style={{ height: 64, borderRadius: "8px 8px 0 0", background: "linear-gradient(120deg, #a7c4e8, #d9e5f3)" }} />
            <div style={{ padding: "0 20px 16px 56px", marginTop: -40 }}>
              <Part k="photo" style={{ display: "inline-block", borderRadius: "50%" }}>
                <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden style={{ display: "block", borderRadius: "50%", border: "3px solid #fff", background: "#dfe7f1" }}>
                  <circle cx="42" cy="34" r="15" fill="#8d6e63" />
                  <path d="M14 84 C16 62 30 54 42 54 C54 54 68 62 70 84 Z" fill="#37597a" />
                </svg>
              </Part>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <Part k="name">
                  <div style={{ fontSize: 22, fontWeight: 700 }}>Jordan Miles</div>
                </Part>
                <Part k="headline">
                  <div style={{ fontSize: 15, lineHeight: 1.4 }}>Office administrator | Excel, Outlook and Word | Calm with customers</div>
                </Part>
                <Part k="location" style={{ display: "inline-block", justifySelf: "start" }}>
                  <span style={{ fontSize: 13.5, color: W.muted, ...keep }}>Leicester, England</span>
                </Part>
                <Part k="open" style={{ justifySelf: "start" }}>
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "#e7f3e9", fontSize: 13.5, lineHeight: 1.4 }}>
                    <b style={{ display: "block" }}>Open to work</b>
                    Office Administrator, Receptionist and Data Entry Clerk roles
                  </div>
                </Part>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, background: W.page, borderRadius: 8, border: `1px solid ${W.edge}`, padding: "12px 20px 14px 56px", display: "grid", gap: 12 }}>
            <Part k="about">
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                <b style={{ display: "block", fontSize: 16, marginBottom: 2 }}>About</b>
                Six years on a busy shop till, now trained in office work. I keep records tidy in Excel, write clear emails and stay calm when it&apos;s busy.
              </div>
            </Part>
            <Part k="skills">
              <div style={{ fontSize: 14 }}>
                <b style={{ display: "block", fontSize: 16, marginBottom: 6 }}>Skills</b>
                <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Microsoft Excel", "Microsoft Outlook", "Customer service", "Data entry"].map((s) => (
                    <span key={s} style={{ padding: "3px 10px", borderRadius: 99, border: `1px solid ${W.edge}`, ...keep }}>
                      {s}
                    </span>
                  ))}
                </span>
              </div>
            </Part>
          </div>
        </div>
      </Browser>
    </FigureFrame>
  );
}
