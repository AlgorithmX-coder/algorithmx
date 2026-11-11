"use client";

import { useState, type ReactNode } from "react";
import { W } from "../../tokens";
import { ADDRESS_BOOK } from "../admin";
import type { CourierAddress, CourierBooking } from "../types";

/* Hopwell Couriers: an invented courier's website, as the office's Edge
 * shows it (Module 10, criterion ADM-5). Northfield has a business account
 * on it: an address book, collections paid on account (invoiced monthly,
 * so no card details are ever asked for), and a list of bookings that can
 * be cancelled. The booking form is one page in numbered sections, with a
 * summary beside it that says what is still missing, as the better real
 * courier sites do. A booking ends on a confirmation page with its
 * reference.
 *
 * The site never touches the office record itself: Edge passes it the
 * bookings and what to do on Book and Cancel, and a lesson runs the same
 * site with its own pretend bookings. */

export const HOPWELL_HOST = "www.hopwellcouriers.example";
export const HOPWELL = `https://${HOPWELL_HOST}`;

/* The site's own colours: an invented brand, so they live here. */
const C = { green: "#0d5c46", greenDark: "#0a4636", lime: "#c8f169", ink: "#14231d", soft: "#f4f6ef", edge: "#d9dfd3", muted: "#5b6b63", warn: "#a4410e", warnSoft: "#fff1e6" } as const;

/* The working days the form offers, from "today" on the office clock. */
export interface Day {
  iso: string; // "2026-11-13"
  label: string; // "Fri 13 Nov"
  note?: string; // "Today: too late to book"
  closed?: boolean;
}

export const DAYS: Day[] = [
  { iso: "2026-11-12", label: "Thu 12 Nov", note: "Today: book by 12:00", closed: true },
  { iso: "2026-11-13", label: "Fri 13 Nov", note: "Tomorrow" },
  { iso: "2026-11-16", label: "Mon 16 Nov" },
  { iso: "2026-11-17", label: "Tue 17 Nov" },
  { iso: "2026-11-18", label: "Wed 18 Nov" },
  { iso: "2026-11-19", label: "Thu 19 Nov" },
];
export const WINDOWS = [
  { id: "09:00 to 13:00", name: "Morning", extra: 2 },
  { id: "13:00 to 17:00", name: "Afternoon", extra: 2 },
  { id: "09:00 to 17:00", name: "Any time", extra: 0 },
] as const;
const SERVICES = [
  { id: "Next day", what: "Delivered the working day after collection", off: 0 },
  { id: "Economy", what: "Delivered in 2 to 3 working days", off: 2.5 },
] as const;

/* "2026-11-13" as "Fri 13 Nov". */
export function dayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

/* Price per parcel by weight, before VAT. */
const band = (kg: number) => (kg <= 10 ? 7.95 : kg <= 20 ? 10.95 : 14.95);
export function priceOf(b: Pick<CourierBooking, "parcels" | "window" | "service">): number {
  const w = WINDOWS.find((x) => x.id === b.window)?.extra ?? 0;
  const off = SERVICES.find((s) => s.id === b.service)?.off ?? 0;
  const p = b.parcels.reduce((t, x) => t + Math.max(0, band(x.kg) - off), 0) + (b.parcels.length ? w : 0);
  return Math.round(p * 100) / 100;
}
const gbp = (n: number) => `£${n.toFixed(2)}`;

/* A fresh booking reference, easy to read out on the phone. */
export function newRef(): string {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "HW-";
  for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}

interface Draft {
  method: "collect" | "dropoff" | null;
  from: CourierAddress | null;
  to: CourierAddress | null;
  parcels: { kg: string; size: string }[];
  date: string | null;
  window: string | null;
  service: string | null;
}
const EMPTY: Draft = { method: null, from: null, to: null, parcels: [{ kg: "", size: "Medium" }], date: null, window: null, service: "Next day" };
const SIZES = ["Small (up to 45 x 35 x 16 cm)", "Medium (up to 61 x 46 x 46 cm)", "Large (up to 100 x 60 x 60 cm)"];

export interface SiteProps {
  /* The page, as the part of the address after the host: "/", "/book" ... */
  path: string;
  go: (path: string) => void;
  bookings: CourierBooking[];
  onBook: (b: CourierBooking) => void;
  onCancel: (ref: string) => void;
  /* "12/11/2026 15:14": stamped on a booking */
  now: string;
}

export function HopwellSite(p: SiteProps) {
  const page = p.path.replace(/\/+$/, "") || "/";
  const booked = /^\/booking\/(HW-[A-Z0-9]+)$/i.exec(page);
  return (
    <div className="hw" style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: C.soft, color: C.ink, fontFamily: W.font, containerType: "inline-size" }}>
      <style>{SITE_CSS}</style>
      <SiteHeader go={p.go} />
      {page === "/" ? (
        <Home go={p.go} />
      ) : page === "/book" ? (
        <BookForm {...p} />
      ) : booked ? (
        <Confirmed booking={p.bookings.find((b) => b.ref.toUpperCase() === booked[1].toUpperCase())} go={p.go} />
      ) : page === "/account/bookings" ? (
        <MyBookings {...p} />
      ) : (
        <NotFound go={p.go} />
      )}
      <footer style={{ marginTop: "auto", padding: "22px 24px 26px", color: C.muted, fontSize: 12.5, borderTop: `1px solid ${C.edge}`, background: "#fff" }}>Hopwell Couriers · Collections and deliveries across the UK · Business account: Northfield Supplies (NFS-2041) · Help: 01632 960 980</footer>
    </div>
  );
}

export function HopwellMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill={C.green} />
      <path d="M7 21 C 9 9, 19 7, 24 14" fill="none" stroke={C.lime} strokeWidth="3" strokeLinecap="round" />
      <path d="M21 9.5 L25 14.5 L19 15.5" fill="none" stroke={C.lime} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="19" width="9" height="7" rx="1.5" fill="#fff" />
    </svg>
  );
}

function SiteHeader({ go }: { go: (p: string) => void }) {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 24px", background: "#fff", borderBottom: `1px solid ${C.edge}`, flexWrap: "wrap" }}>
      <button type="button" onClick={() => go("/")} className="hw-plain" style={{ display: "inline-flex", alignItems: "center", gap: 9 }} aria-label="Hopwell Couriers home">
        <HopwellMark />
        <b style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em", color: C.green }}>hopwell</b>
      </button>
      <nav aria-label="Hopwell" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <button type="button" className="hw-nav" onClick={() => go("/book")}>
          Book a collection
        </button>
        <button type="button" className="hw-nav" onClick={() => go("/account/bookings")}>
          My bookings
        </button>
      </nav>
      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.muted }}>
        <span aria-hidden style={{ width: 28, height: 28, borderRadius: "50%", background: C.lime, color: C.green, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
          NS
        </span>
        Northfield Supplies
      </span>
    </header>
  );
}

/* The hero's picture: a Hopwell van with two boxes going in. */
function VanArt() {
  return (
    <svg className="hw-van" width="300" height="170" viewBox="0 0 300 170" aria-hidden>
      <ellipse cx="150" cy="156" rx="132" ry="9" fill="rgba(0,0,0,0.22)" />
      <path d="M30 60 Q30 46 44 46 H176 V146 H30 Z" fill="#ffffff" />
      <path d="M176 70 H222 Q232 70 238 80 L262 112 Q266 118 266 126 V146 H176 Z" fill="#f1f4ec" />
      <path d="M186 80 H220 Q226 80 230 86 L246 108 H186 Z" fill="#2c4a5a" />
      <rect x="30" y="118" width="236" height="10" fill={C.lime} />
      <path d="M52 92 C 60 66, 92 60, 108 78" fill="none" stroke={C.green} strokeWidth="6" strokeLinecap="round" />
      <path d="M100 66 L110 79 L95 82" fill="none" stroke={C.green} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="120" y="100" fontFamily="Segoe UI, sans-serif" fontWeight="800" fontSize="22" fill={C.green}>hopwell</text>
      <circle cx="78" cy="148" r="15" fill="#1d2b24" />
      <circle cx="78" cy="148" r="6" fill="#c9d0c4" />
      <circle cx="222" cy="148" r="15" fill="#1d2b24" />
      <circle cx="222" cy="148" r="6" fill="#c9d0c4" />
      <rect x="4" y="112" width="30" height="30" rx="2" fill="#c89b5f" />
      <path d="M4 122 H34 M19 112 V142" stroke="#a87c44" strokeWidth="2" />
      <rect x="10" y="88" width="24" height="24" rx="2" fill="#d8ac6e" />
      <path d="M10 96 H34 M22 88 V112" stroke="#a87c44" strokeWidth="2" />
    </svg>
  );
}

function Home({ go }: { go: (p: string) => void }) {
  return (
    <main>
      <section style={{ position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`, color: "#fff", padding: "34px 28px 38px" }}>
        <p style={{ margin: 0, color: C.lime, fontWeight: 700, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase" }}>Business account</p>
        <VanArt />
        <h1 style={{ margin: "8px 0 0", fontSize: 32, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-0.02em", maxWidth: 520 }}>We collect from your door, and deliver across the UK.</h1>
        <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.5, maxWidth: 520, opacity: 0.92 }}>Book by 12:00 for a collection the same day. Pay on your monthly account.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button type="button" className="hw-cta lime" onClick={() => go("/book")}>
            Book a collection
          </button>
          <button type="button" className="hw-ghost" onClick={() => go("/account/bookings")}>
            My bookings
          </button>
        </div>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, padding: "22px 24px" }}>
        {[
          ["Choose a time", "Morning, afternoon or any time between 09:00 and 17:00."],
          ["Up to 30 kg a parcel", "Weigh each box, and tell us its size. Our driver brings the labels."],
          ["Booked in minutes", "You get a booking reference straight away. Keep it to track or change it."],
        ].map(([h, t]) => (
          <div key={h} style={{ background: "#fff", border: `1px solid ${C.edge}`, borderRadius: 12, padding: "16px 16px 18px" }}>
            <b style={{ fontSize: 16 }}>{h}</b>
            <p style={{ margin: "6px 0 0", fontSize: 14.5, lineHeight: 1.5, color: C.muted }}>{t}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

/* ── the booking form ────────────────────────────────────────────────── */

function Section({ n, title, done, children }: { n: number; title: string; done: boolean; children: ReactNode }) {
  return (
    <section aria-label={title} style={{ background: "#fff", border: `1px solid ${C.edge}`, borderRadius: 12, padding: "16px 18px 18px" }}>
      <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, fontSize: 17, fontWeight: 700 }}>
        <span aria-hidden style={{ width: 26, height: 26, borderRadius: "50%", background: done ? C.green : C.soft, color: done ? C.lime : C.muted, border: done ? "none" : `1.5px solid ${C.edge}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
          {done ? "✓" : n}
        </span>
        {title}
      </h2>
      <div style={{ marginTop: 12 }}>{children}</div>
    </section>
  );
}

function Choice({ on, onClick, children, disabled, label }: { on: boolean; onClick: () => void; children: ReactNode; disabled?: boolean; label?: string }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} disabled={disabled} onClick={onClick} className={on ? "hw-choice on" : "hw-choice"}>
      {children}
    </button>
  );
}

function AddressText({ a }: { a: CourierAddress }) {
  return (
    <span style={{ display: "block", textAlign: "left", fontSize: 13.5, lineHeight: 1.45 }}>
      <b style={{ display: "block", fontSize: 14.5 }}>{a.name}</b>
      {[...a.lines, a.postcode].join(", ")}
      {a.contact && <span style={{ display: "block", color: C.muted }}>{[a.contact, a.phone].filter(Boolean).join(" · ")}</span>}
    </span>
  );
}

function AddressPick({ value, onChange, which }: { value: CourierAddress | null; onChange: (a: CourierAddress | null) => void; which: "from" | "to" }) {
  const [typing, setTyping] = useState(false);
  const [f, setF] = useState({ name: "", line: "", town: "", postcode: "", contact: "", phone: "" });
  const ok = f.name.trim() && f.line.trim() && f.town.trim() && /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i.test(f.postcode.trim());
  if (typing)
    return (
      <div style={{ display: "grid", gap: 8 }}>
        {(
          [
            ["name", "Company or name"],
            ["line", "Address"],
            ["town", "Town or city"],
            ["postcode", "Postcode"],
            ["contact", "Contact name (optional)"],
            ["phone", "Contact phone (optional)"],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className="hw-field">
            <span>{l}</span>
            <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-label={`${which === "from" ? "Collect from" : "Deliver to"}: ${l}`} />
          </label>
        ))}
        {f.postcode.trim() && !/^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i.test(f.postcode.trim()) && <p className="hw-warn">That doesn&apos;t look like a UK postcode, like LE4 5AQ.</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="hw-cta small"
            disabled={!ok}
            onClick={() => {
              onChange({ name: f.name.trim(), lines: [f.line.trim(), f.town.trim()], postcode: f.postcode.trim().toUpperCase(), contact: f.contact.trim() || undefined, phone: f.phone.trim() || undefined });
              setTyping(false);
            }}
          >
            Use this address
          </button>
          <button type="button" className="hw-link" onClick={() => setTyping(false)}>
            Back to the address book
          </button>
        </div>
      </div>
    );
  const custom = value && !ADDRESS_BOOK.some((a) => a.name === value.name && a.postcode === value.postcode);
  return (
    <div>
      <p style={{ margin: "0 0 8px", fontSize: 13.5, color: C.muted }}>From your address book:</p>
      <div className="hw-grid">
        {[...ADDRESS_BOOK, ...(custom && value ? [value] : [])].map((a) => {
          const on = !!value && value.name === a.name && value.postcode === a.postcode;
          return (
            <Choice key={`${a.name}${a.postcode}`} on={on} onClick={() => onChange(on ? null : a)} label={`${which === "from" ? "Collect from" : "Deliver to"} ${a.name}, ${a.postcode}`}>
              <AddressText a={a} />
            </Choice>
          );
        })}
      </div>
      <button type="button" className="hw-link" style={{ marginTop: 8 }} onClick={() => setTyping(true)}>
        + Type a new address
      </button>
    </div>
  );
}

function BookForm({ go, onBook, now }: SiteProps) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const kgs = d.parcels.map((x) => Number(x.kg.replace(",", ".")));
  const badKg = kgs.findIndex((k) => !(k > 0 && k <= 30));
  const parcels = d.parcels.map((x, i) => ({ kg: kgs[i], cm: x.size }));
  const draftBooking = { parcels: badKg < 0 ? parcels : [], window: d.window ?? "", service: d.service ?? "" };
  const net = priceOf(draftBooking);
  const missing = [
    !d.method && "How we get your parcels",
    !d.from && (d.method === "dropoff" ? "Who is sending it" : "Where to collect from"),
    !d.to && "Where it's going",
    badKg >= 0 && `A weight for parcel ${badKg + 1} (up to 30 kg)`,
    !d.date && (d.method === "dropoff" ? "The day you drop off" : "The collection day"),
    d.method !== "dropoff" && !d.window && "A time window",
    !d.service && "A service",
  ].filter((x): x is string => !!x);

  const book = () => {
    setTried(true);
    if (missing.length || !d.method || !d.from || !d.to || !d.date || !d.service) return;
    const b: CourierBooking = {
      ref: newRef(),
      status: "booked",
      method: d.method,
      from: d.from,
      to: d.to,
      date: d.date,
      window: d.method === "dropoff" ? "Drop off at a Hopwell Point" : (d.window ?? ""),
      parcels,
      service: d.service,
      price: net,
      booked: now,
    };
    onBook(b);
    go(`/booking/${b.ref}`);
  };

  return (
    <main style={{ padding: "20px 24px 28px" }}>
      <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: "-0.02em" }}>Book a collection</h1>
      <p style={{ margin: "4px 0 0", fontSize: 14.5, color: C.muted }}>Fill in each part. The summary shows anything still missing.</p>
      <div className="hw-book">
        <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
          <Section n={1} title="How should we get your parcels?" done={!!d.method}>
            <div className="hw-grid">
              <Choice on={d.method === "collect"} onClick={() => set({ method: "collect" })}>
                <b style={{ display: "block", fontSize: 15 }}>We collect from you</b>
                <span style={{ fontSize: 13.5, color: C.muted }}>A driver comes to your address in the time you choose.</span>
              </Choice>
              <Choice on={d.method === "dropoff"} onClick={() => set({ method: "dropoff", window: null })}>
                <b style={{ display: "block", fontSize: 15 }}>You drop off at a Hopwell Point</b>
                <span style={{ fontSize: 13.5, color: C.muted }}>You take the parcels to a shop near you.</span>
              </Choice>
            </div>
          </Section>
          <Section n={2} title={d.method === "dropoff" ? "Who is sending it" : "Collect from"} done={!!d.from}>
            <AddressPick which="from" value={d.from} onChange={(from) => set({ from })} />
          </Section>
          <Section n={3} title="Deliver to" done={!!d.to}>
            <AddressPick which="to" value={d.to} onChange={(to) => set({ to })} />
          </Section>
          <Section n={4} title="Your parcels" done={badKg < 0}>
            <div style={{ display: "grid", gap: 10 }}>
              {d.parcels.map((x, i) => (
                <div key={i} className="hw-parcel">
                  <b style={{ fontSize: 14.5, minWidth: 70 }}>Parcel {i + 1}</b>
                  <label className="hw-field inline">
                    <span>Weight</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <input inputMode="decimal" value={x.kg} onChange={(e) => set({ parcels: d.parcels.map((y, j) => (j === i ? { ...y, kg: e.target.value } : y)) })} aria-label={`Parcel ${i + 1} weight in kg`} style={{ width: 80 }} />
                      kg
                    </span>
                  </label>
                  <label className="hw-field inline">
                    <span>Size</span>
                    <select value={x.size} onChange={(e) => set({ parcels: d.parcels.map((y, j) => (j === i ? { ...y, size: e.target.value } : y)) })} aria-label={`Parcel ${i + 1} size`}>
                      {SIZES.map((s) => (
                        <option key={s} value={s.split(" ")[0]}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  {d.parcels.length > 1 && (
                    <button type="button" className="hw-link" onClick={() => set({ parcels: d.parcels.filter((_, j) => j !== i) })} aria-label={`Remove parcel ${i + 1}`}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {kgs.some((k, i) => d.parcels[i].kg.trim() && !(k > 0 && k <= 30)) && <p className="hw-warn">Each parcel must weigh more than 0 kg and no more than 30 kg.</p>}
              <div>
                <button type="button" className="hw-link" onClick={() => d.parcels.length < 10 && set({ parcels: [...d.parcels, { kg: "", size: "Medium" }] })}>
                  + Add another parcel
                </button>
              </div>
            </div>
          </Section>
          <Section n={5} title={d.method === "dropoff" ? "Drop-off day" : "Collection day and time"} done={!!d.date && (d.method === "dropoff" || !!d.window)}>
            <div className="hw-days">
              {DAYS.map((x) => (
                <Choice key={x.iso} on={d.date === x.iso} disabled={x.closed} onClick={() => set({ date: x.iso })} label={`${x.label}${x.closed ? ", too late to book" : ""}`}>
                  <b style={{ display: "block", fontSize: 14.5 }}>{x.label}</b>
                  <span style={{ fontSize: 12, color: C.muted }}>{x.closed ? "Too late for today" : (x.note ?? "")}&nbsp;</span>
                </Choice>
              ))}
            </div>
            {d.method !== "dropoff" && (
              <>
                <p style={{ margin: "14px 0 8px", fontSize: 13.5, color: C.muted }}>When can the driver come?</p>
                <div className="hw-grid three">
                  {WINDOWS.map((w) => (
                    <Choice key={w.id} on={d.window === w.id} onClick={() => set({ window: w.id })} label={`${w.name}, ${w.id}`}>
                      <b style={{ display: "block", fontSize: 14.5 }}>{w.name}</b>
                      <span style={{ fontSize: 13.5 }}>{w.id}</span>
                      <span style={{ display: "block", fontSize: 12, color: C.muted }}>{w.extra ? `+ ${gbp(w.extra)}` : "No extra charge"}</span>
                    </Choice>
                  ))}
                </div>
              </>
            )}
          </Section>
          <Section n={6} title="Service" done={!!d.service}>
            <div className="hw-grid">
              {SERVICES.map((s) => (
                <Choice key={s.id} on={d.service === s.id} onClick={() => set({ service: s.id })}>
                  <b style={{ display: "block", fontSize: 15 }}>{s.id}</b>
                  <span style={{ fontSize: 13.5, color: C.muted }}>{s.what}</span>
                </Choice>
              ))}
            </div>
          </Section>
        </div>

        {/* the summary */}
        <aside aria-label="Your booking" className="hw-summary">
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Your booking</h2>
          <dl style={{ margin: "10px 0 0", display: "grid", gap: 8, fontSize: 13.5, lineHeight: 1.4 }}>
            <Sum k={d.method === "dropoff" ? "Sender" : "Collect from"} v={d.from ? `${d.from.name}, ${d.from.postcode}` : null} />
            <Sum k="Deliver to" v={d.to ? `${d.to.name}, ${d.to.postcode}` : null} />
            <Sum k="Parcels" v={badKg < 0 ? parcels.map((x) => `${x.kg} kg`).join(", ") : null} />
            <Sum k={d.method === "dropoff" ? "Drop off" : "Collection"} v={d.date ? `${dayLabel(d.date)}${d.method !== "dropoff" && d.window ? `, ${d.window}` : ""}` : null} />
            <Sum k="Service" v={d.service} />
          </dl>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.edge}`, fontSize: 13.5, display: "grid", gap: 3 }}>
            <Row a="Price" b={badKg < 0 ? gbp(net) : "-"} />
            <Row a="VAT at 20%" b={badKg < 0 ? gbp(net * 0.2) : "-"} />
            <Row a={<b>Total, on account</b>} b={<b>{badKg < 0 ? gbp(net * 1.2) : "-"}</b>} />
          </div>
          {tried && missing.length > 0 && (
            <div role="alert" style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: C.warnSoft, color: C.warn, fontSize: 13.5, lineHeight: 1.45 }}>
              <b>Still needed:</b>
              <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          <button type="button" className="hw-cta" style={{ width: "100%", marginTop: 14 }} onClick={book}>
            Book {d.method === "dropoff" ? "drop-off" : "collection"}
          </button>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.4 }}>Charged to your business account. You can cancel free of charge until 17:00 the day before.</p>
        </aside>
      </div>
    </main>
  );
}

function Sum({ k, v }: { k: string; v: string | null }) {
  return (
    <div>
      <dt style={{ color: C.muted, fontSize: 12 }}>{k}</dt>
      <dd style={{ margin: 0, fontWeight: v ? 600 : 400, color: v ? C.ink : C.muted }}>{v ?? "Not chosen yet"}</dd>
    </div>
  );
}

function Row({ a, b }: { a: ReactNode; b: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span>{a}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{b}</span>
    </div>
  );
}

/* ── after booking ───────────────────────────────────────────────────── */

export function BookingDetails({ b }: { b: CourierBooking }) {
  return (
    <dl className="hw-details">
      <dt>{b.method === "dropoff" ? "Drop off" : "Collection"}</dt>
      <dd>
        {dayLabel(b.date)}, {b.window}
      </dd>
      <dt>{b.method === "dropoff" ? "Sender" : "Collect from"}</dt>
      <dd>
        <AddressText a={b.from} />
      </dd>
      <dt>Deliver to</dt>
      <dd>
        <AddressText a={b.to} />
      </dd>
      <dt>Parcels</dt>
      <dd>
        {b.parcels.length} {b.parcels.length === 1 ? "parcel" : "parcels"}: {b.parcels.map((x) => `${x.kg} kg`).join(", ")}
      </dd>
      <dt>Service</dt>
      <dd>
        {b.service} · {gbp(b.price * 1.2)} including VAT, on account
      </dd>
    </dl>
  );
}

function Confirmed({ booking, go }: { booking?: CourierBooking; go: (p: string) => void }) {
  const [copied, setCopied] = useState(false);
  if (!booking) return <NotFound go={go} />;
  const cancelled = booking.status === "cancelled";
  return (
    <main style={{ padding: "24px 24px 30px", maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span aria-hidden style={{ width: 44, height: 44, borderRadius: "50%", background: cancelled ? C.edge : C.green, color: cancelled ? C.muted : C.lime, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
          {cancelled ? "✕" : "✓"}
        </span>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{cancelled ? "This booking was cancelled" : booking.method === "dropoff" ? "Drop-off booked" : "Collection booked"}</h1>
      </div>
      <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: "#fff", border: `2px solid ${C.green}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, color: C.muted }}>Your booking reference</span>
        <b data-ref style={{ fontFamily: "Consolas, ui-monospace, monospace", fontSize: 26, letterSpacing: "0.06em", userSelect: "all" }}>
          {booking.ref}
        </b>
        <button
          type="button"
          className="hw-ghost dark"
          style={{ marginLeft: "auto" }}
          onClick={() => {
            try {
              void navigator.clipboard?.writeText(booking.ref);
            } catch {
              /* copying is a convenience; the reference is on screen */
            }
            setCopied(true);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 14.5, color: C.muted }}>Keep this reference. You need it to track, change or cancel the booking.</p>
      <BookingDetails b={booking} />
      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button type="button" className="hw-cta small" onClick={() => go("/account/bookings")}>
          See all my bookings
        </button>
        <button type="button" className="hw-link" onClick={() => go("/book")}>
          Book another collection
        </button>
      </div>
    </main>
  );
}

function MyBookings({ bookings, onCancel, go }: SiteProps) {
  const [asking, setAsking] = useState<string | null>(null);
  const list = bookings.slice().reverse();
  return (
    <main style={{ padding: "20px 24px 28px" }}>
      <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: "-0.02em" }}>My bookings</h1>
      {list.length === 0 ? (
        <p style={{ margin: "12px 0 0", fontSize: 15, color: C.muted }}>
          No bookings yet.{" "}
          <button type="button" className="hw-link" onClick={() => go("/book")}>
            Book a collection
          </button>
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {list.map((b) => (
            <div key={b.ref} style={{ background: "#fff", border: `1px solid ${C.edge}`, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", opacity: b.status === "cancelled" ? 0.6 : 1 }}>
              <button type="button" className="hw-link" style={{ fontFamily: "Consolas, ui-monospace, monospace", fontSize: 17, fontWeight: 700 }} onClick={() => go(`/booking/${b.ref}`)}>
                {b.ref}
              </button>
              <span style={{ fontSize: 14, lineHeight: 1.4, flex: "1 1 260px" }}>
                <b>
                  {dayLabel(b.date)}, {b.window}
                </b>
                <br />
                {b.from.name} to {b.to.name} · {b.parcels.length} {b.parcels.length === 1 ? "parcel" : "parcels"}
              </span>
              <span className={b.status === "booked" ? "hw-tag" : "hw-tag off"}>{b.status === "cancelled" ? "Cancelled" : b.status === "collected" ? "Collected" : "Booked"}</span>
              {b.status === "booked" &&
                (asking === b.ref ? (
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 13.5 }}>
                    Cancel {b.ref}?
                    <button
                      type="button"
                      className="hw-cta small danger"
                      onClick={() => {
                        onCancel(b.ref);
                        setAsking(null);
                      }}
                    >
                      Yes, cancel it
                    </button>
                    <button type="button" className="hw-link" onClick={() => setAsking(null)}>
                      Keep it
                    </button>
                  </span>
                ) : (
                  <button type="button" className="hw-ghost dark" onClick={() => setAsking(b.ref)}>
                    Cancel booking
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function NotFound({ go }: { go: (p: string) => void }) {
  return (
    <main style={{ padding: "30px 24px" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Sorry, we can&apos;t find that page</h1>
      <p style={{ margin: "8px 0 0", fontSize: 15, color: C.muted }}>
        <button type="button" className="hw-link" onClick={() => go("/")}>
          Go to the Hopwell home page
        </button>
      </p>
    </main>
  );
}

const SITE_CSS = `
  .hw button { font-family: inherit; }
  .hw-plain { border: none; background: none; padding: 0; cursor: pointer; }
  .hw-nav { min-height: 38px; padding: 0 12px; border: none; border-radius: 8px; background: transparent; color: ${C.ink}; font-size: 14.5px; font-weight: 600; cursor: pointer; }
  .hw-nav:hover { background: ${C.soft}; }
  .hw-cta { min-height: 46px; padding: 0 22px; border: none; border-radius: 999px; background: ${C.lime}; color: ${C.greenDark}; font-size: 16px; font-weight: 800; cursor: pointer; }
  .hw main .hw-cta:not(.lime), .hw aside .hw-cta { background: ${C.green}; color: #fff; }
  .hw .hw-cta:hover { filter: brightness(1.08); }
  .hw .hw-cta:disabled { opacity: 0.45; cursor: not-allowed; }
  .hw .hw-cta.small { min-height: 40px; padding: 0 16px; font-size: 14.5px; }
  .hw .hw-cta.danger { background: ${C.warn}; }
  .hw-ghost { min-height: 46px; padding: 0 20px; border: 1.5px solid rgba(255,255,255,0.7); border-radius: 999px; background: transparent; color: #fff; font-size: 15.5px; font-weight: 700; cursor: pointer; }
  .hw-ghost.dark { min-height: 38px; border-color: ${C.edge}; color: ${C.ink}; background: #fff; font-size: 14px; padding: 0 14px; }
  .hw-link { border: none; background: none; padding: 4px 0; color: ${C.green}; font-size: 14.5px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; min-height: 36px; }
  .hw-choice { min-height: 52px; padding: 10px 12px; border: 1.5px solid ${C.edge}; border-radius: 10px; background: #fff; color: ${C.ink}; text-align: left; cursor: pointer; transition: border-color .15s ease, background .15s ease; }
  .hw-choice:hover:not(:disabled) { border-color: ${C.green}; }
  .hw-choice.on { border-color: ${C.green}; background: color-mix(in srgb, ${C.lime} 22%, #fff); box-shadow: inset 0 0 0 1px ${C.green}; }
  .hw-choice:disabled { opacity: 0.5; cursor: not-allowed; background: ${C.soft}; }
  .hw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px; }
  .hw-grid.three { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  .hw-days { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; }
  .hw-parcel { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; padding: 10px 12px; border: 1px solid ${C.edge}; border-radius: 10px; }
  .hw-field { display: grid; gap: 4px; font-size: 13px; color: ${C.muted}; }
  .hw-field.inline { display: inline-flex; align-items: center; gap: 8px; }
  .hw-field input, .hw-field select { min-height: 40px; padding: 4px 10px; border: 1.5px solid ${C.edge}; border-radius: 8px; font-family: inherit; font-size: 15px; color: ${C.ink}; background: #fff; }
  .hw-field input:focus, .hw-field select:focus { outline: 2px solid ${C.green}; outline-offset: 1px; }
  .hw-warn { margin: 0; color: ${C.warn}; font-size: 13.5px; }
  .hw-book { display: grid; grid-template-columns: minmax(0, 1fr) 270px; gap: 16px; align-items: start; margin-top: 16px; }
  .hw-summary { position: sticky; top: 12px; background: #fff; border: 1px solid ${C.edge}; border-radius: 12px; padding: 16px; }
  .hw-tag { padding: 3px 10px; border-radius: 999px; background: color-mix(in srgb, ${C.lime} 40%, #fff); color: ${C.greenDark}; font-size: 12.5px; font-weight: 700; }
  .hw-tag.off { background: ${C.edge}; color: ${C.muted}; }
  .hw-van { position: absolute; right: 28px; bottom: 26px; }
  .hw-details { margin: 16px 0 0; display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 10px 14px; background: #fff; border: 1px solid ${C.edge}; border-radius: 12px; padding: 14px 16px; font-size: 14px; }
  .hw-details dt { color: ${C.muted}; }
  .hw-details dd { margin: 0; }
  .hw :is(button, input, select):focus-visible { outline: 2px solid ${C.green}; outline-offset: 2px; }
  @container (max-width: 860px) { .hw-van { display: none; } }
  @container (max-width: 720px) {
    .hw-book { grid-template-columns: 1fr; }
    .hw-summary { position: static; }
    .hw-details { grid-template-columns: 1fr; gap: 2px; }
    .hw-details dd { margin-bottom: 8px; }
  }
`;
