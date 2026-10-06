"use client";

/* Module 3 — The Web Surface. First new engine: a request-tamper inspector. The
 * learner sees the real HTTP request the browser is about to send, edits a field
 * in it, and the simulated server honours the tampered value — proving the
 * client can't be trusted. Teaches requests/responses + dev tools, then the
 * golden rule: all security decisions belong on the server. */

import { useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";

const LIST_PRICE = 149.0;

function RequestTamperAct({ onCapture }: { onCapture: () => void }) {
  const [price, setPrice] = useState(LIST_PRICE.toFixed(2));
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<null | { total: number; tampered: boolean }>(null);

  function send() {
    const total = Number(price);
    if (!Number.isFinite(total)) return;
    const tampered = total < LIST_PRICE;
    setResult({ total, tampered });
    if (tampered) onCapture();
  }

  const reqLine: React.CSSProperties = { fontFamily: MONO, fontSize: 12.5, color: "#8fa0c8", lineHeight: 1.7 };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* the "shop" */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
          <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>shop.calderafreight.range · parts store</span>
        </div>
        <div style={{ padding: 18, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 54, height: 54, borderRadius: 10, background: "linear-gradient(135deg,#1b2140,#111528)", border: `1px solid ${C.line}`, display: "grid", placeItems: "center", fontSize: 24 }}>📡</div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontFamily: "var(--font-chakra),system-ui", fontWeight: 700, fontSize: 16 }}>Fleet GPS unit</div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: C.indigo2, marginTop: 3 }}>£{LIST_PRICE.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* the request inspector */}
      <div style={{ background: C.carbon, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: `1px solid ${C.lineSoft}`, background: C.panel }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", color: C.indigo, fontWeight: 700 }}>⌦ OUTGOING REQUEST</span>
          <button onClick={() => setEditing((v) => !v)} style={{ background: "none", border: `1px solid ${C.line}`, color: C.indigo2, fontFamily: MONO, fontSize: 11, cursor: "pointer", padding: "3px 10px", borderRadius: 6 }}>
            {editing ? "editing" : "edit request"}
          </button>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={reqLine}>POST /api/order</div>
          <div style={reqLine}>Content-Type: application/json</div>
          <div style={{ ...reqLine, marginTop: 8 }}>{"{"}</div>
          <div style={reqLine}>&nbsp;&nbsp;&quot;item&quot;: &quot;gps-unit&quot;,</div>
          <div style={reqLine}>&nbsp;&nbsp;&quot;qty&quot;: 1,</div>
          <div style={{ ...reqLine, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            &nbsp;&nbsp;&quot;unitPrice&quot;:{" "}
            {editing ? (
              <input value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: 90, padding: "2px 8px", borderRadius: 6, background: "#0c0e18", color: C.amber, border: `1px solid ${C.amber}`, fontFamily: MONO, fontSize: 12.5 }} />
            ) : (
              <span style={{ color: C.amber }}>{price}</span>
            )}
          </div>
          <div style={reqLine}>{"}"}</div>
          <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Btn tone="g" onClick={send}>SEND REQUEST →</Btn>
            <button onClick={() => { setEditing(true); setPrice("0.00"); }} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? reveal</button>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ padding: "13px 16px", borderRadius: 11, border: `1px solid ${result.tampered ? C.green : C.line}`, background: result.tampered ? "rgba(74,222,128,0.08)" : C.panel, fontFamily: MONO, fontSize: 13 }}>
          {result.tampered ? (
            <span style={{ color: C.green }}>✓ 200 OK · Order confirmed — total £{result.total.toFixed(2)}. The server took the price you sent.</span>
          ) : (
            <span style={{ color: C.soft }}>200 OK · Order confirmed at £{result.total.toFixed(2)}. That&rsquo;s the real price — change what the browser sends to prove the point.</span>
          )}
        </div>
      )}
    </div>
  );
}

function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

export const MODULE3: ModuleDef = {
  code: "M-03",
  moduleNo: 3,
  title: "The Web Surface",
  client: "Caldera Freight",
  brief:
    "Caldera’s parts store is about to open to drivers. The dev team says the checkout is solid. Your job: understand how the web actually works under the hood, then test whether the price a customer pays is really decided by Caldera — or by the customer.",
  lesson: {
    blocks: [
      { h: "The web is requests and responses", body: "Every web action is a message. Your browser sends an HTTP request — a method (GET to fetch, POST to send), a path like /api/order, some headers, and often a body of data — and the server sends a response back. That’s the whole conversation. A web app is just a very long series of these." },
      { h: "You can see and change the request", body: "Your browser’s developer tools (and tools called proxies) let you watch every request leave — and pause and edit one before it’s sent. The browser runs on your computer, under your control. So anything it sends, you can change: form fields, hidden values, prices, the lot." },
      { h: "The golden rule: never trust the client", body: "Because the user controls the browser, the server can never assume the request is honest. If the checkout believes a price the browser sent, a customer can send any price they like. Every security decision — what something costs, who you are, what you’re allowed to do — must be made and checked on the server." },
    ],
    example: {
      caption: "A hidden field looks locked on the page, but it’s just data in the request. Change it before it sends and a trusting server accepts it.",
      lines: [
        { t: "<!-- what the page shows -->" },
        { t: '<input type="hidden" name="price" value="149.00">' },
        { t: "" },
        { t: "<!-- what the attacker sends -->" },
        { t: 'price = 0.00   // edited in dev tools before submit', leak: true },
      ],
    },
    check: {
      q: "Why can’t a server trust a hidden form field’s value?",
      options: [
        { text: "Hidden fields are encrypted, so they’re safe.", feedback: "“Hidden” only means not drawn on screen — it isn’t encrypted or protected at all." },
        { text: "The client controls the whole request and can change any field before it’s sent.", correct: true, feedback: "Exactly. Hidden just means not shown; the value is ordinary data the browser can rewrite." },
        { text: "Hidden fields don’t get sent to the server.", feedback: "They are sent — that’s their purpose. They’re just not displayed." },
      ],
    },
  },
  scope: {
    target: "shop.calderafreight.range — the parts store checkout",
    inScope: "the order request and its fields",
    offLimits: "other customers’ orders, payment processors, real money",
    timebox: "this session",
  },
  handler: "Open the order request before it sends. If the checkout trusts the price the browser hands it, you’ll be able to buy a £149 unit for whatever you like. Prove it.",
  hint: "Hit “edit request”, change unitPrice to something lower (0.00 works), then send. If the order still confirms, the server trusted the client.",
  Act: RequestTamperAct,
  flag: "flag{cl1ent_s3ts_the_pr1ce}",
  defend: {
    blocks: [
      { h: "The fix: re-decide on the server", body: "The server must never accept a price from the browser. When an order arrives, it should look up the real price for that item in its own database and use that — ignoring any price the client sent entirely. The same goes for discounts, quantities with limits, and totals: the server owns the truth." },
      { h: "A whole class of bugs", body: "This is called parameter tampering, and the lesson generalises: identity, permissions, prices, feature flags — if the client sends it and the server trusts it, it can be forged. Real breaches have handed attackers free goods, other people’s data, and admin rights this exact way. The defence is always the same: validate and decide server-side." },
    ],
    check: {
      q: "What’s the correct fix for the checkout?",
      options: [
        { text: "Make the price field read-only on the page.", feedback: "The attacker edits the request, not the page — a read-only field changes nothing." },
        { text: "The server looks up the real price by item ID and ignores any price the client sends.", correct: true, feedback: "Right. The server owns the price; the client’s value is never trusted." },
        { text: "Encrypt the price field in the form.", feedback: "The client would still control the plaintext before sending; the server must re-derive the price itself." },
      ],
    },
  },
  finding: {
    title: "Price trusted from client input (parameter tampering)",
    where: "shop.calderafreight.range · POST /api/order · unitPrice field",
    severity: "High",
    cvss: "7.5",
    impact: "The checkout accepts the price sent by the browser, so any customer can edit the request and buy items for any amount, including £0.",
    fix: "Never trust client-supplied prices. The server must look up the authoritative price by item ID and ignore the client’s value; validate all order fields server-side.",
  },
  rep: 35,
  repRank: "Recruit",
  repTo: "90 / 100 to Junior Operator",
  next: "NEXT MODULE · Broken Authentication →",
};

export default function Module3() {
  return <Engagement mod={MODULE3} />;
}
