"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { WAIVER_TEXT } from "@/app/purchase/[slug]/BuyForm";

/* A parent paying for their child's course. The same 14-day cancellation
 * tick as the buy page (Consumer Contracts Regulations 2013, reg. 37),
 * required here and checked again on the server. */
export default function ParentPayForm({ action, price }: { action: (formData: FormData) => void | Promise<void>; price: string }) {
  const [ticked, setTicked] = useState(false);
  return (
    <form action={action} className="axbright-form">
      <label className="axbright-tick">
        <input type="checkbox" name="waiver" required checked={ticked} onChange={(e) => setTicked(e.target.checked)} />
        <span>{WAIVER_TEXT}</span>
      </label>
      <Pay price={price} />
    </form>
  );
}

function Pay({ price }: { price: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="axbright-btn" disabled={pending}>
      {pending ? "Opening secure checkout..." : `Pay ${price} securely`}
    </button>
  );
}
