import type { ReactNode } from "react";

/**
 * The marks a legal page carries while it waits for a person to sign it off.
 *
 * Two different kinds of unfinished, and they must not be confused:
 *
 * `DraftBanner` says the whole document is not in force. It goes on
 * anything contractual, which here is the school data processing terms.
 *
 * `Blank` marks a single FACT that only the owner holds: the registered
 * company name, the ICO registration number, the address a notice is served
 * at. A privacy notice that invents any of those is worse than one that
 * shows a gap, because a school checks them against the register.
 *
 * Both are deleted when the real text and the real facts land. A page that
 * still renders either is not ready to be linked from anywhere a customer
 * can reach, which is why the PR that introduces them is held rather than
 * merged.
 *
 * The same pattern exists on the corporate side (app/corporate/SolicitorNote.tsx,
 * on the unmerged #417). Collapse the two into this one when that branch is
 * picked back up.
 */
const box = {
  margin: "14px 0",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(180, 83, 9, 0.7)",
  background: "rgba(245, 158, 11, 0.12)",
  fontSize: 14.5,
  lineHeight: 1.55,
  color: "#5c3a06",
} as const;

export function DraftBanner({ children }: { children: ReactNode }) {
  return (
    <p style={box} role="note">
      <strong>DRAFT. NOT IN FORCE.</strong> {children}
    </p>
  );
}

/**
 * A fact the owner has to supply, shown in place so it cannot be missed.
 * Deliberately ugly.
 */
export function Blank({ what }: { what: string }) {
  return (
    <mark
      style={{
        background: "rgba(245, 158, 11, 0.35)",
        border: "1px dashed rgba(180, 83, 9, 0.8)",
        borderRadius: 5,
        padding: "0 6px",
        fontWeight: 700,
        color: "#5c3a06",
      }}
    >
      [{what}]
    </mark>
  );
}
