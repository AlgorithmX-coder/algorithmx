"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CYBER_PALETTE } from "@/app/components/scene/cyberTokens";

/* Back from Stripe a moment before Stripe's confirmation reaches us. Asks
 * the server again every few seconds; the page swaps to the success view
 * by itself once the course is theirs. After a minute it stops and says
 * what to do, rather than spinning for ever. */
const EVERY_MS = 3000;
const TRIES = 20;

export default function AwaitPayment() {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= TRIES) return;
    const id = window.setTimeout(() => {
      router.refresh();
      setTries((t) => t + 1);
    }, EVERY_MS);
    return () => window.clearTimeout(id);
  }, [tries, router]);

  if (tries < TRIES) return null;
  return (
    <p style={{ margin: 0, color: CYBER_PALETTE.amber, fontSize: 14, lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      This is taking longer than usual. Your payment is safe. Refresh this page in a minute, or email support@algorithmx.co.uk and we will open your course for you.
    </p>
  );
}
