import type { CSSProperties } from "react";
import Link from "next/link";
import DeskHeader from "./DeskHeader";
import { FINAL, PARTS } from "./syllabus";
import { D } from "./tokens";

/* The Desk Ready landing: who it is for, how it works, what you learn and
 * the price. Written for an adult who is new to computers: short words,
 * large type, one obvious button. House copy rules: no em-dashes, no
 * emoji, state the benefit. Price arrives from the Product row. */

const CTA = "/desk-ready/signup";

const button: CSSProperties = {
  display: "inline-block",
  background: D.accent,
  color: D.onAccent,
  fontFamily: D.display,
  fontWeight: 600,
  fontSize: 18,
  padding: "15px 26px",
  borderRadius: 12,
  textDecoration: "none",
  boxShadow: "0 10px 26px rgba(43,89,195,0.28)",
};

const eyebrow: CSSProperties = { margin: 0, fontSize: 15, fontWeight: 700, color: D.accent, letterSpacing: "0.04em", textTransform: "uppercase" };
const h2: CSSProperties = { margin: "8px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: "clamp(1.6rem, 3.6vw, 2.15rem)", lineHeight: 1.2, color: D.ink };

/* A drawn (not photographed) taste of the course: an email being written
 * beside a small sheet of stock data. Pure markup, so it is crisp at any
 * size and needs no image file. */
function DeskPreview() {
  const cell: CSSProperties = { padding: "7px 10px", borderRight: `1px solid ${D.edge}`, borderBottom: `1px solid ${D.edge}`, fontSize: 14, whiteSpace: "nowrap" };
  const head: CSSProperties = { ...cell, background: D.sunk, fontWeight: 700, color: D.muted, fontSize: 12.5 };
  const rows = [
    ["Pallet labels", "120", "Sam"],
    ["Stretch wrap", "36", "Priya"],
    ["Safety boots", "14", "Sam"],
  ];
  return (
    <div aria-hidden style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ background: D.panel, border: `1px solid ${D.edge}`, borderRadius: 14, boxShadow: D.lift, overflow: "hidden", maxWidth: 380 }}>
        <div style={{ background: D.outlook, color: D.onAccent, padding: "8px 14px", fontSize: 13, fontWeight: 700 }}>New message</div>
        <div style={{ padding: "12px 16px", fontSize: 15, lineHeight: 1.6, color: D.body }}>
          <div style={{ borderBottom: `1px solid ${D.edgeSoft}`, paddingBottom: 6 }}>
            <span style={{ color: D.faint }}>To </span>sarah.jones@northfield.co.uk
          </div>
          <div style={{ borderBottom: `1px solid ${D.edgeSoft}`, padding: "6px 0" }}>
            <span style={{ color: D.faint }}>Subject </span>
            <b>Delivery 4417 is two pallets short</b>
          </div>
          <div style={{ paddingTop: 10 }}>
            Hi Sarah,
            <br />
            Could you check order 4417 for me? We received 10 pallets, not 12.
            <br />
            <br />
            Kind regards,
            <br />
            Dave
          </div>
        </div>
      </div>
      {/* tucked under the email's bottom-right corner, clear of its text */}
      <div style={{ alignSelf: "flex-end", marginTop: -26, position: "relative", background: D.panel, border: `1px solid ${D.edge}`, borderRadius: 14, boxShadow: D.lift, overflow: "hidden" }}>
        <div style={{ background: D.excel, color: D.onAccent, padding: "8px 14px", fontSize: 13, fontWeight: 700 }}>Stock list</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", color: D.body }}>
          <div style={head}>Item</div>
          <div style={head}>Qty</div>
          <div style={head}>Ordered by</div>
          {rows.flat().map((v, i) => (
            <div key={i} style={cell}>
              {v}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const WHO = [
  { title: "You work on your feet", body: "On a line, in a warehouse, on a shop floor or in care, and you want a job at a desk." },
  { title: "You live on your phone", body: "You have used a phone for years, but not much of a computer, and offices expect one." },
  { title: "You are going back to work", body: "You have been away a while and the office has moved on. Catch up in weeks." },
];

const HOW = [
  { n: "1", title: "Learn", body: "Short lessons in plain English, one idea at a time, with examples from real workplaces." },
  { n: "2", title: "Practise", body: "Try it straight away in a pretend inbox and a pretend spreadsheet. Nothing breaks and nothing gets sent." },
  { n: "3", title: "Prove it", body: "Finish with a real morning's work you can show an employer." },
];

export default function DeskReadyLanding({ priceGBP }: { priceGBP: number }) {
  const price = `£${Math.round(priceGBP / 100)}`;
  return (
    <>
      <DeskHeader link={{ href: "/desk-ready/login", label: "Sign in" }} />
      <main>
        {/* hero */}
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 16px 56px", display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", alignItems: "center" }}>
          <div>
            <p style={eyebrow}>For anyone moving from the floor to a desk</p>
            <h1 style={{ margin: "12px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: "clamp(2.2rem, 5.5vw, 3.3rem)", lineHeight: 1.08, color: D.ink }}>
              The computer skills every desk job expects.
            </h1>
            <p style={{ margin: "18px 0 0", fontSize: 19, lineHeight: 1.6, color: D.body, maxWidth: 540 }}>
              Emails, spreadsheets, files and AI, taught from the very start. Short lessons, then practice in a pretend office until it feels normal.
            </p>
            <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
              <Link href={CTA} style={button}>
                Create your account
              </Link>
              <span style={{ fontSize: 17, color: D.muted }}>
                <b style={{ color: D.ink }}>{price}</b> once, yours for life
              </span>
            </div>
          </div>
          <DeskPreview />
        </section>

        {/* who it is for */}
        <section style={{ background: D.panel, borderTop: `1px solid ${D.edgeSoft}`, borderBottom: `1px solid ${D.edgeSoft}` }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 16px" }}>
            <p style={eyebrow}>Who it is for</p>
            <h2 style={h2}>Made for people who have never worked at a desk</h2>
            <div style={{ marginTop: 22, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
              {WHO.map((w) => (
                <div key={w.title} style={{ background: D.panelSoft, border: `1px solid ${D.edge}`, borderRadius: 14, padding: "18px 18px 20px" }}>
                  <h3 style={{ margin: 0, fontFamily: D.display, fontWeight: 600, fontSize: 19, color: D.ink }}>{w.title}</h3>
                  <p style={{ margin: "8px 0 0", fontSize: 16.5, lineHeight: 1.55, color: D.body }}>{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* how it works */}
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "52px 16px" }}>
          <p style={eyebrow}>How it works</p>
          <h2 style={h2}>Learn it, try it, prove it</h2>
          <ol style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
            {HOW.map((h) => (
              <li key={h.n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: D.accent, color: D.onAccent, fontFamily: D.display, fontWeight: 700, fontSize: 18 }}>
                  {h.n}
                </span>
                <div>
                  <h3 style={{ margin: "6px 0 0", fontFamily: D.display, fontWeight: 600, fontSize: 19, color: D.ink }}>{h.title}</h3>
                  <p style={{ margin: "6px 0 0", fontSize: 16.5, lineHeight: 1.55, color: D.body }}>{h.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* what you learn */}
        <section id="learn" style={{ background: D.panel, borderTop: `1px solid ${D.edgeSoft}`, borderBottom: `1px solid ${D.edgeSoft}` }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 16px" }}>
            <p style={eyebrow}>What you will learn</p>
            <h2 style={h2}>14 modules, from switching on to getting the job</h2>
            <div style={{ marginTop: 22, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}>
              {PARTS.map((p) => (
                <div key={p.id} style={{ border: `1px solid ${D.edge}`, borderRadius: 14, padding: "18px 18px 20px", background: D.panelSoft }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: D.faint, textTransform: "uppercase", letterSpacing: "0.04em" }}>{p.label}</p>
                  <h3 style={{ margin: "4px 0 0", fontFamily: D.display, fontWeight: 600, fontSize: 20, color: D.ink }}>{p.title}</h3>
                  <ul style={{ margin: "10px 0 0", paddingLeft: 20, fontSize: 16, lineHeight: 1.6, color: D.body }}>
                    {p.modules.map((m) => (
                      <li key={m.id}>{m.title}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div style={{ border: `1px solid rgba(43,89,195,0.35)`, borderRadius: 14, padding: "18px 18px 20px", background: D.accentSoft }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: D.accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>Final task</p>
                <h3 style={{ margin: "4px 0 0", fontFamily: D.display, fontWeight: 600, fontSize: 20, color: D.ink }}>{FINAL.title}</h3>
                <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.55, color: D.body }}>{FINAL.promise}</p>
              </div>
            </div>
          </div>
        </section>

        {/* price */}
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "56px 16px 80px", textAlign: "center" }}>
          <p style={eyebrow}>The price</p>
          <h2 style={{ ...h2, fontSize: "clamp(2.4rem, 6vw, 3.2rem)" }}>{price}, once</h2>
          <p style={{ margin: "12px auto 0", fontSize: 18, lineHeight: 1.6, color: D.body, maxWidth: 520 }}>
            Every module and every update, yours for life. VAT included. Learn on any computer, whenever suits you.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link href={CTA} style={button}>
              Create your account
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
