"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

/* The parent's yes. A required tick, checked again on the server. */
export default function ConsentForm({ action, child }: { action: (formData: FormData) => void | Promise<void>; child: string }) {
  const [ticked, setTicked] = useState(false);
  return (
    <form action={action} className="axbright-form">
      <label className="axbright-tick">
        <input type="checkbox" name="consent" required checked={ticked} onChange={(e) => setTicked(e.target.checked)} />
        <span>I am {child}&rsquo;s parent or guardian, and I give my consent for {child} to use AlgorithmX.</span>
      </label>
      <Submit label="Give my consent" busy="Saving..." />
    </form>
  );
}

function Submit({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="axbright-btn" disabled={pending}>
      {pending ? busy : label}
    </button>
  );
}
