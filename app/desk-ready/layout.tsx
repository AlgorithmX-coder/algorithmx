import type { ReactNode } from "react";

/* Desk Ready uses the site's own fonts (Inter and Geist Mono, set on <body>
 * by the root layout), so this layout adds nothing. Each surface sets its
 * own ground: the landing is the landing-v2 sand-and-night page, the course
 * is the dark desk (SHELL_CSS .dr-shell), and the auth pages draw their own
 * backdrop. A ground here would show through the landing's sections. */
export default function DeskReadyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
