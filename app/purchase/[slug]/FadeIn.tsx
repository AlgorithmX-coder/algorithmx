"use client";

/**
 * Tiny client wrapper that fades its children in on mount. Kept in its
 * own file so the parent route stays a server component (the entitlement
 * gate must run on the server).
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function FadeIn({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}
