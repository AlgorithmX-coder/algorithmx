"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CYBER_GRAD, CYBER_PALETTE, CYBER_SHADOW } from "@/app/components/scene/cyberTokens";

const C = CYBER_PALETTE;

/* The UK's 14-day cancellation step for digital content (Consumer
 * Contracts Regulations 2013, reg. 37): the course may start inside the
 * cancellation period only if the buyer asks for that and acknowledges
 * they lose the right to cancel. The tick is required here and checked
 * again on the server, which records the time on the purchase. Wording
 * agreed by the owner, 2026-11-26; do not change it without them. */
export const WAIVER_TEXT = "Start my course now. I understand I lose my 14-day right to cancel once I start.";

export default function BuyForm({ action, price }: { action: (formData: FormData) => void | Promise<void>; price: string }) {
  const [ticked, setTicked] = useState(false);
  return (
    <form action={action} style={{ display: "grid", gap: 14 }}>
      <label
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          padding: "14px 16px",
          borderRadius: 14,
          border: `1px solid ${ticked ? `${C.lime}66` : `${C.cyan}33`}`,
          background: "rgba(8, 10, 22, 0.4)",
          color: C.text,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          name="waiver"
          required
          checked={ticked}
          onChange={(e) => setTicked(e.target.checked)}
          style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: C.lime }}
        />
        <span>{WAIVER_TEXT}</span>
      </label>
      <PayButton price={price} />
    </form>
  );
}

function PayButton({ price }: { price: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "15px 22px",
        borderRadius: 14,
        border: "none",
        background: CYBER_GRAD.hero,
        color: C.abyss,
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontWeight: 900,
        fontSize: 17,
        letterSpacing: "0.01em",
        cursor: pending ? "progress" : "pointer",
        opacity: pending ? 0.75 : 1,
        boxShadow: CYBER_SHADOW.buttonGlow,
      }}
    >
      {pending ? "Opening secure checkout..." : `Pay ${price} securely`}
    </button>
  );
}
