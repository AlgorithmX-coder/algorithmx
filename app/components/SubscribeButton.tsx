"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * SubscribeButton — POSTs to /api/checkout and redirects the browser
 * to the Stripe-hosted Checkout page.  Used on the dashboard upsell
 * card and (future) the cyberheroes "Enrol Now — £99" button when
 * the user is signed in.
 *
 * Why a client component: we need to issue a fetch and then do
 * `window.location.href = url`.  Server components can't.
 */
export default function SubscribeButton({
  label = "Enrol — £99 →",
  className,
  style,
}: {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.05, y: -2 }}
        whileTap={loading ? {} : { scale: 0.97 }}
        className={className}
        style={{
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          ...style,
        }}
      >
        {loading ? "Opening checkout…" : label}
      </motion.button>
      {error && (
        <p style={{ color: "#ff8aa3", fontSize: 13, fontWeight: 700 }}>
          {error}
        </p>
      )}
    </div>
  );
}
