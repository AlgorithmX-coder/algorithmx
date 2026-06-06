"use client";

import type { SVGProps } from "react";

/**
 * Access Layer icon set — precise inline SVG, never emoji.
 *
 * All icons are 24×24, stroke-based, and inherit `currentColor` so the
 * caller controls colour + state. 1.6 stroke reads crisp on dark glass.
 * Decorative by default (aria-hidden); pass a `title` only where an icon
 * is the sole label.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Identity — a single person. */
export function IconIdentity(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </Base>
  );
}

/** Contact — an @ glyph reads more "system" than an envelope. */
export function IconContact(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M15.2 12v1.4a2.4 2.4 0 0 0 4.8 0V12a8 8 0 1 0-3.1 6.3" />
    </Base>
  );
}

/** Credentials — a lock. */
export function IconCredentials(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <circle cx="12" cy="15" r="1.1" />
    </Base>
  );
}

/** Vault lock — a shield with a keyhole. */
export function IconVault(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3.2l6.5 2.4v5.2c0 4.2-2.8 7.5-6.5 8.8-3.7-1.3-6.5-4.6-6.5-8.8V5.6L12 3.2z" />
      <circle cx="12" cy="11" r="1.4" />
      <path d="M12 12.4V15" />
    </Base>
  );
}

/** Learning hub — a connected node cluster. */
export function IconHub(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="12" cy="4.5" r="1.6" />
      <circle cx="5.6" cy="17" r="1.6" />
      <circle cx="18.4" cy="17" r="1.6" />
      <path d="M12 9.8V6.1M10.3 13.4l-3.2 2.2M13.7 13.4l3.2 2.2" />
    </Base>
  );
}

/** Session / access key. */
export function IconKey(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="8" cy="8" r="3.4" />
      <path d="M10.4 10.4l7 7M15.5 15.9l1.8-1.8M17.6 18l1.8-1.8" />
    </Base>
  );
}

/** Verified — a check. */
export function IconCheck(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M5 12.5l4.2 4.2L19 7" />
    </Base>
  );
}

/** Reveal password. */
export function IconEye(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </Base>
  );
}

/** Hide password. */
export function IconEyeOff(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 4l16 16" />
      <path d="M9.7 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.9 3.6" />
      <path d="M6.4 7.8A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1 0 1.9-.2 2.8-.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Base>
  );
}

/** Forward / execute arrow. */
export function IconArrow(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  );
}

/** Power bolt. */
export function IconBolt(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10.5H13l0-8.5z" />
    </Base>
  );
}
