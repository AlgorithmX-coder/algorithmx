import Script from "next/script";

/**
 * Plausible Analytics - lightweight, privacy-friendly, GDPR-compliant.
 * No cookies, no PII, no compliance work to use it on a kids' site
 * (huge upside for a £99 product targeting children under 13).
 *
 * Only renders when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, so dev runs
 * without the env var don't ship the script. Can also be disabled in
 * staging by leaving the env unset on Vercel preview deploys.
 *
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to the domain you registered in
 * Plausible (e.g. "algorithmx.co.uk").
 */
export default function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      strategy="afterInteractive"
      data-domain={domain}
      src="https://plausible.io/js/script.js"
    />
  );
}
