"use client";

import AuthReactorFallback from "./AuthReactorFallback";

/**
 * Shown while the (client-only) Canvas chunk loads. Reuses the premium static
 * fallback so there's never a blank canvas — the form is already interactive.
 */
export default function AuthReactorLoading() {
  return <AuthReactorFallback stage={0} />;
}
