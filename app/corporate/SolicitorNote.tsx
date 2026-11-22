import type { ReactNode } from "react";

/**
 * The marks a draft legal page carries while it waits for the solicitor:
 * a banner at the top saying it is a draft, and a note at each point the
 * solicitor has to decide. Both are deleted when the reviewed text
 * replaces the draft; a page that still renders either is not ready to
 * link from anywhere.
 */

const box = {
  margin: "14px 0",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px dashed rgba(180, 83, 9, 0.7)",
  background: "rgba(245, 158, 11, 0.1)",
  fontSize: 14.5,
  lineHeight: 1.55,
} as const;

export function DraftBanner({ children }: { children: ReactNode }) {
  return (
    <p style={{ ...box, borderStyle: "solid", fontWeight: 500 }} role="note">
      <strong>DRAFT FOR THE SOLICITOR. NOT IN FORCE.</strong> {children}
    </p>
  );
}

export function SolicitorNote({ children }: { children: ReactNode }) {
  return (
    <p style={box} role="note">
      <strong>FOR THE SOLICITOR:</strong> {children}
    </p>
  );
}
