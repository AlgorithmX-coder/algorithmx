"use client";

import type { CSSProperties, ReactNode } from "react";
import { Part } from "../learn/figures/parts";
import { W } from "../tokens";
import { money, totals, TITLE } from "./admin";
import type { BizDoc, DocParty, Paper } from "./types";

export { money, paperOf, totals } from "./admin";

/* Business paperwork, drawn from data (Module 10): a purchase order, a
 * supplier's invoice, a delivery note with its handwriting, a credit note
 * and a photo of a till receipt. The office's viewer shows them, and the
 * lessons' figures draw the very same page with its parts numbered: each
 * part is wrapped in `Part`, which is plain when there is no figure round
 * it. In a practice task (`pick`) the parts become things to click.
 *
 * The page is a printed A4 look: white, a supplier's own colour, small
 * print. A delivery note is a scan of paper that has been handled, with a
 * signature and a note in pen. */

/* Each supplier's printed colour, so a Harlow page always looks like
 * Harlow's. Invented companies, so their colours live here. */
const BRAND: Record<string, string> = {
  "Harlow Packaging Ltd": "#0b6b62",
  "Northfield Supplies": "#22468f",
  "Kent Flour Mills": "#8a5a12",
  "Brightwater Cups Ltd": "#1f6fb2",
};
const brandOf = (d: BizDoc) => BRAND[d.from.name] ?? W.ink;

export const PEN = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";
const PEN_BLUE = "#1d4fb8";

/* ── the page ────────────────────────────────────────────────────────── */

export type DocPart =
  | "supplier"
  | "buyer"
  | "number"
  | "date"
  | "poRef"
  | "dnRef"
  | "account"
  | "billTo"
  | "shipTo"
  | "lines"
  | "net"
  | "vat"
  | "total"
  | "bank"
  | "due"
  | "signed"
  | "note"
  | "orderedBy";

export interface PickProps {
  /* The parts a learner can click, and what happens when they do. */
  pick?: (k: DocPart) => void;
  /* Parts to mark as picked: green for right, red for wrong. */
  marks?: Partial<Record<DocPart, "right" | "wrong">>;
}

/* One part of the page: numbered in a figure, clickable in a practice. */
function Bit({ k, children, badge = "left", style, block = true, p }: { k: DocPart; children: ReactNode; badge?: "left" | "right" | "top" | "corner"; style?: CSSProperties; block?: boolean; p: PickProps }) {
  if (p.pick) {
    const mark = p.marks?.[k];
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={() => p.pick?.(k)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            p.pick?.(k);
          }
        }}
        className="pw-pick"
        style={{
          display: block ? "block" : "inline-block",
          borderRadius: 4,
          cursor: "pointer",
          outline: mark ? `3px solid ${mark === "right" ? "#1e8e3e" : "#c5221f"}` : undefined,
          outlineOffset: 2,
          background: mark === "right" ? "rgba(30,142,62,0.10)" : mark === "wrong" ? "rgba(197,34,31,0.08)" : undefined,
          ...style,
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <Part k={k} badge={badge} style={style} block={block}>
      {children}
    </Part>
  );
}

const small: CSSProperties = { fontSize: 11, lineHeight: 1.45, color: "#555" };
const label: CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#777" };

function Party({ title, party }: { title: string; party: DocParty }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.5 }}>
      <div style={label}>{title}</div>
      <div style={{ fontWeight: 700, marginTop: 2 }}>{party.name}</div>
      {party.lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
}

/* A company's printed mark: its initials in a tile, and its name. */
function Letterhead({ d }: { d: BizDoc }) {
  const c = brandOf(d);
  const initials = d.from.name
    .replace(/ Ltd$/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span aria-hidden style={{ width: 34, height: 34, borderRadius: 6, background: c, color: "#fff", fontWeight: 800, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, letterSpacing: "0.02em" }}>
        {initials}
      </span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: c, letterSpacing: "-0.01em" }}>{d.from.name}</div>
        <div style={small}>
          {d.from.lines.join(", ")}
          {d.from.phone && (
            <>
              <br />
              {d.from.phone}
              {d.from.email ? ` · ${d.from.email}` : ""}
            </>
          )}
          {d.from.vatNo && (
            <>
              <br />
              VAT reg no {d.from.vatNo}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ name, value, strong }: { name: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 12, lineHeight: 1.7 }}>
      <span style={{ color: "#666" }}>{name}</span>
      <span style={{ fontWeight: strong ? 800 : 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

/* Sheets of paper look like paper wherever they are drawn. */
const sheet = (scan: boolean): CSSProperties => ({
  position: "relative",
  background: scan ? W.paper : W.page,
  color: "#222",
  fontFamily: W.font,
  padding: "26px 34px 30px",
  boxShadow: scan ? "inset 0 0 60px rgba(120,100,60,0.10), 0 1px 3px rgba(0,0,0,0.18)" : "0 1px 3px rgba(0,0,0,0.18)",
  minWidth: 0,
});

export function DocSheet({ doc, ...p }: { doc: BizDoc } & PickProps) {
  if (doc.kind === "receipt") return <ReceiptPhoto doc={doc} />;
  const c = brandOf(doc);
  const t = totals(doc);
  const isDn = doc.kind === "delivery";
  const isPo = doc.kind === "po";
  const priced = !isDn;
  const ref = (name: string) => doc.refs.find(([k]) => k === name)?.[1];
  const poRef = ref("Your order") ?? ref("PO number");
  const dnRef = ref("Delivery note");
  const account = ref("Account");
  return (
    <div style={sheet(isDn)} className="pw-sheet">
      {/* the top: who it's from, what it is, its numbers */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Bit k={isPo ? "buyer" : "supplier"} p={p} style={{ maxWidth: 290 }}>
          <Letterhead d={doc} />
        </Bit>
        <div style={{ minWidth: 190 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: c, textAlign: "right", marginBottom: 6 }}>{TITLE[doc.kind]}</div>
          <Bit k="number" badge="right" p={p}>
            <MetaRow name={`${TITLE[doc.kind]} no`} value={doc.number} strong />
          </Bit>
          <Bit k="date" badge="right" p={p}>
            <MetaRow name="Date" value={doc.date} />
          </Bit>
          {poRef && (
            <Bit k="poRef" badge="right" p={p}>
              <MetaRow name={isPo ? "PO number" : "Your order"} value={poRef} strong />
            </Bit>
          )}
          {dnRef && (
            <Bit k="dnRef" badge="right" p={p}>
              <MetaRow name="Delivery note" value={dnRef} />
            </Bit>
          )}
          {account && (
            <Bit k="account" badge="right" p={p}>
              <MetaRow name="Account" value={account} />
            </Bit>
          )}
          {doc.refs
            .filter(([k]) => !["Your order", "PO number", "Delivery note", "Account"].includes(k))
            .map(([k, v]) => (
              <MetaRow key={k} name={k} value={v} />
            ))}
        </div>
      </div>

      {/* who it's to, and where it goes */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, marginTop: 18, flexWrap: "wrap" }}>
        <Bit k={isPo ? "supplier" : "billTo"} p={p} style={{ minWidth: 170 }}>
          <Party title={isPo ? "Supplier" : isDn ? "Customer" : doc.kind === "credit" ? "Credit to" : "Invoice to"} party={doc.to} />
        </Bit>
        {doc.shipTo && (
          <Bit k="shipTo" badge="right" p={p} style={{ minWidth: 170 }}>
            <Party title="Deliver to" party={doc.shipTo} />
          </Bit>
        )}
      </div>

      {/* the lines */}
      <Bit k="lines" p={p} style={{ marginTop: 18 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr style={{ background: isDn ? "transparent" : `color-mix(in srgb, ${c} 10%, #fff)` }}>
              {["Code", "Description", isDn ? "Ordered" : "Qty", ...(isDn ? ["Delivered"] : ["Unit", "Unit price", isPo ? "Total" : "Net"])].map((h, i) => (
                <th key={h} style={{ textAlign: i < 2 ? "left" : "right", padding: "6px 7px", borderBottom: `1.5px solid ${isDn ? "#333" : c}`, fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase", color: isDn ? "#333" : c, whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doc.lines.map((l, i) => (
              <tr key={i}>
                <td style={td(0)}>{l.code ?? ""}</td>
                <td style={td(1)}>{l.item}</td>
                <td style={td(2)}>{l.qty}</td>
                {isDn ? (
                  <td style={{ ...td(3), position: "relative" }}>
                    {l.delivered ?? l.qty}
                    {l.delivered !== undefined && l.delivered !== l.qty && (
                      <span aria-hidden style={{ position: "absolute", inset: "1px -2px", border: `2px solid ${PEN_BLUE}`, borderRadius: "50%", transform: "rotate(-4deg)" }} />
                    )}
                  </td>
                ) : (
                  <>
                    <td style={td(3)}>{l.unit ?? "each"}</td>
                    <td style={td(4)}>{money(l.price ?? 0)}</td>
                    <td style={td(5)}>{money(l.qty * (l.price ?? 0))}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Bit>

      {/* the sums */}
      {priced && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <div style={{ width: 230 }}>
            {isPo ? (
              <Bit k="total" badge="right" p={p}>
                <MetaRow name="Total before VAT" value={money(t.net)} strong />
              </Bit>
            ) : (
              <>
                <Bit k="net" badge="right" p={p}>
                  <MetaRow name="Net total" value={money(t.net)} />
                </Bit>
                <Bit k="vat" badge="right" p={p}>
                  <MetaRow name={`VAT at ${Math.round((doc.vatRate ?? 0) * 100)}%`} value={money(t.vat)} />
                </Bit>
                <Bit k="total" badge="right" p={p} style={{ marginTop: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "5px 7px", background: c, color: "#fff", fontSize: 13, fontWeight: 800, borderRadius: 3 }}>
                    <span>{doc.kind === "credit" ? "Total credit" : "Total due"}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{money(t.gross)}</span>
                  </div>
                </Bit>
              </>
            )}
          </div>
        </div>
      )}

      {/* the bottom: who ordered or signed, when to pay and where */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, marginTop: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
        {isPo && doc.signed && (
          <Bit k="signed" p={p}>
            <Signature name={doc.signed} role={doc.signedRole ?? ""} title="Authorised by" />
          </Bit>
        )}
        {isDn && (
          <Bit k="signed" p={p}>
            <Signature name={doc.signed ?? ""} role={doc.signedRole ?? ""} title="Received by" />
          </Bit>
        )}
        {(doc.terms || doc.due) && (
          <Bit k="due" p={p} style={{ maxWidth: 250 }}>
            <div style={{ fontSize: 12, lineHeight: 1.55 }}>
              <div style={label}>Payment</div>
              {doc.terms && <div>{doc.terms}</div>}
              {doc.due && (
                <div>
                  Please pay by <b>{doc.due}</b>
                </div>
              )}
            </div>
          </Bit>
        )}
        {doc.bank && (
          <Bit k="bank" badge="right" p={p}>
            <div style={{ fontSize: 12, lineHeight: 1.55, padding: "8px 10px", border: `1px solid ${c}`, borderRadius: 4 }}>
              <div style={label}>Pay by bank transfer to</div>
              <div>{doc.bank.name}</div>
              <div style={{ fontVariantNumeric: "tabular-nums" }}>
                Sort code {doc.bank.sortCode} · Account {doc.bank.account}
              </div>
              <div>Reference: {doc.number}</div>
            </div>
          </Bit>
        )}
        {isDn && doc.note && (
          <Bit k="note" badge="right" p={p}>
            <div style={{ fontFamily: PEN, fontSize: 17, color: PEN_BLUE, transform: "rotate(-3deg)", transformOrigin: "left", lineHeight: 1.35, maxWidth: 230, padding: "0 4px" }}>{doc.note}</div>
          </Bit>
        )}
      </div>
      {doc.footer && <p style={{ ...small, margin: "16px 0 0", borderTop: "1px solid #ddd", paddingTop: 8 }}>{doc.footer}</p>}
    </div>
  );
}

const td = (i: number): CSSProperties => ({ textAlign: i < 2 ? "left" : "right", padding: "7px 7px", borderBottom: "1px solid #e4e4e4", verticalAlign: "top" });

function Signature({ name, role, title }: { name: string; role: string; title: string }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.45, minWidth: 170 }}>
      <div style={label}>{title}</div>
      <div style={{ fontFamily: PEN, fontSize: 21, color: PEN_BLUE, lineHeight: 1.2, padding: "4px 2px 0", minHeight: 30 }}>{name ? signatureOf(name) : ""}</div>
      <div style={{ borderTop: "1px solid #444", paddingTop: 3, color: "#555" }}>
        {name}
        {role ? `, ${role}` : ""}
      </div>
    </div>
  );
}

/* "Daniel Okafor" signs as "D Okafor". */
const signatureOf = (name: string) => {
  const [first, ...rest] = name.split(" ");
  return rest.length ? `${first[0]} ${rest.join(" ")}` : name;
};

/* ── a photo of a receipt ───────────────────────────────────────────── */

/* A till or ticket-office receipt, photographed on a desk: a narrow slip
 * of thermal paper, slightly turned, on a dark wood background. */
export function ReceiptPhoto({ doc, scale = 1 }: { doc: BizDoc; scale?: number }) {
  const r = doc.receipt;
  return (
    <div style={{ background: "radial-gradient(120% 90% at 30% 20%, #6b4a32, #3b271a 70%)", padding: `${22 * scale}px ${16 * scale}px`, display: "flex", justifyContent: "center", borderRadius: 3 }}>
      <div
        style={{
          width: 230 * scale,
          background: "linear-gradient(180deg, #fbfaf6, #f1efe8)",
          color: "#2b2b2b",
          fontFamily: "'Courier New', ui-monospace, monospace",
          fontSize: 11.5 * scale,
          lineHeight: 1.45,
          padding: `${14 * scale}px ${14 * scale}px ${18 * scale}px`,
          transform: "rotate(-2.2deg)",
          boxShadow: "0 10px 20px -6px rgba(0,0,0,0.55)",
          clipPath: "polygon(0 0, 100% 0, 100% 97%, 94% 100%, 88% 97%, 82% 100%, 76% 97%, 70% 100%, 64% 97%, 58% 100%, 52% 97%, 46% 100%, 40% 97%, 34% 100%, 28% 97%, 22% 100%, 16% 97%, 10% 100%, 4% 97%, 0 100%)",
        }}
      >
        <div style={{ textAlign: "center", fontWeight: 800, fontSize: 13.5 * scale, letterSpacing: "0.06em" }}>{doc.from.name.toUpperCase()}</div>
        {doc.from.lines.map((l) => (
          <div key={l} style={{ textAlign: "center" }}>
            {l}
          </div>
        ))}
        <div style={{ borderTop: "1px dashed #999", margin: `${7 * scale}px 0` }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{doc.date}</span>
          <span>No {doc.number}</span>
        </div>
        {r && (
          <>
            <div style={{ fontWeight: 800, marginTop: 6 * scale }}>{r.title}</div>
            {r.lines.map(([a, b]) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{a}</span>
                <span>{b}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px dashed #999", margin: `${7 * scale}px 0` }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 13 * scale }}>
              <span>TOTAL</span>
              <span>{r.total}</span>
            </div>
            <div>{r.paid}</div>
          </>
        )}
        {doc.footer && <div style={{ textAlign: "center", marginTop: 8 * scale }}>{doc.footer}</div>}
      </div>
    </div>
  );
}

/* The few styles a class can carry (hover and focus on a clickable part). */
export const PAPERWORK_CSS = `
  .pw-pick:hover { background: rgba(15,108,189,0.08); }
  .pw-pick:focus-visible { outline: 2px solid ${W.outlook}; outline-offset: 2px; }
`;

/* A picture as it sits on a sheet (Insert > Pictures): what the photo
 * shows, scaled down, or a plain placeholder for a photo with nothing
 * drawn. */
export function SheetPictureView({ paper, name, width = 220 }: { paper?: Paper; name: string; width?: number }) {
  if (paper?.doc?.kind === "receipt") return <ReceiptPhoto doc={paper.doc} scale={width / 260} />;
  return (
    <div style={{ width, height: width * 0.75, display: "flex", alignItems: "center", justifyContent: "center", background: W.sunk, color: W.muted, fontFamily: W.font, fontSize: 13, textAlign: "center", padding: 10, boxSizing: "border-box" }}>
      {name}
    </div>
  );
}
