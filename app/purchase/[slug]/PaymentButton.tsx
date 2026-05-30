"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CYBER_PALETTE, CYBER_GRAD, CYBER_SHADOW } from "@/app/components/scene/cyberTokens";
import { startCheckoutAction } from "./actions";

const C = CYBER_PALETTE;

/**
 * Stub payment button.
 *
 * Stays purely presentational + dispatches the server action. All
 * gating + the actual grant happen server-side in startCheckoutAction.
 * The "Test mode" badge only renders outside production builds so
 * nobody mistakes it for live checkout.
 */
export default function PaymentButton({
  slug,
  priceLabel,
}: {
  slug: string;
  priceLabel: string;
}) {
  const reduced = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [errored, setErrored] = useState(false);

  const handleClick = () => {
    if (pending) return;
    setErrored(false);
    startTransition(async () => {
      try {
        await startCheckoutAction(slug);
        // startCheckoutAction redirects on success; if it returns
        // without redirecting something is wrong upstream — log it.
        // (Server actions throw a special NEXT_REDIRECT marker which
        // Next intercepts, so the catch below only fires on real
        // errors, not the redirect itself.)
      } catch (err) {
        // Filter out the redirect "error" Next.js uses internally;
        // anything else means the grant failed and we should surface
        // it to the user instead of silently retrying.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (err as any)?.digest;
        if (typeof code === "string" && code.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        setErrored(true);
        // eslint-disable-next-line no-console
        console.error("[purchase] startCheckoutAction failed", err);
      }
    });
  };

  const showTestBadge = process.env.NODE_ENV !== "production";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={pending}
        whileHover={pending || reduced ? undefined : { y: -2, scale: 1.02 }}
        whileTap={pending ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        aria-busy={pending || undefined}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 14,
          background: CYBER_GRAD.hero,
          color: C.abyss,
          border: "none",
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontWeight: 900,
          fontSize: 17,
          letterSpacing: "0.01em",
          cursor: pending ? "wait" : "pointer",
          boxShadow: CYBER_SHADOW.buttonGlow,
          opacity: pending ? 0.85 : 1,
          transition: "opacity 200ms ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          {pending && (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `2px solid ${C.abyss}44`,
                borderTopColor: C.abyss,
                animation: reduced ? undefined : "pbSpin 0.7s linear infinite",
              }}
            />
          )}
          {pending ? "Processing…" : `Pay ${priceLabel}`}
        </span>
      </motion.button>

      {showTestBadge && (
        <div
          style={{
            display: "inline-flex",
            alignSelf: "center",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 999,
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: C.amber,
            background: `${C.amber}1a`,
            border: `1px solid ${C.amber}66`,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.amber,
              boxShadow: `0 0 8px ${C.amber}`,
            }}
          />
          Test mode · No real payment taken
        </div>
      )}

      {errored && (
        <div
          role="alert"
          style={{
            color: C.ember,
            fontSize: 13.5,
            fontWeight: 700,
            textAlign: "center",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          Something went wrong starting checkout. Please try again or email{" "}
          support@algorithmx.co.uk.
        </div>
      )}

      <style>{`
        @keyframes pbSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
