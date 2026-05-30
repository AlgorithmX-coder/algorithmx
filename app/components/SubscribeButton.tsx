"use client";

import { motion } from "framer-motion";

/**
 * SubscribeButton - navigates the browser to the cyber-heroes purchase
 * page.  Used on the dashboard upsell card and the cyberheroes
 * "Enrol Now - £99" button when the user is signed in.
 *
 * Why a client component: framer-motion hover/tap animations require
 * a client boundary, and we drive navigation via window.location.href.
 *
 * TODO: Real Stripe checkout will reintroduce the fetch + Checkout
 * Session redirect in a later batch.
 */
export default function SubscribeButton({
  label = "Enrol - £99 →",
  className,
  style,
}: {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const onClick = () => {
    window.location.href = "/purchase/cyber-heroes";
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={className}
      style={{
        cursor: "pointer",
        ...style,
      }}
    >
      {label}
    </motion.button>
  );
}
