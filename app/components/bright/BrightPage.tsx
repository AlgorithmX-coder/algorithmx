import Link from "next/link";
import type { ReactNode } from "react";
import "./bright-page.css";

/* A calm, bright page for the grown-up side of an under-13's account: the
 * parent's consent page and the child's "waiting for your grown-up" page.
 * The front door is bright (owner, 2026-11-25), so these follow the
 * Daylight Console look of the crash screens: a pale grid ground, one white
 * card with a cyan-to-violet seam. Scoped under .axbright. */
export default function BrightPage({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children: ReactNode }) {
  return (
    <div className="axbright">
      <div className="axbright-grid" aria-hidden="true" />
      <header className="axbright-chrome">
        <Link className="axbright-word" href="/" aria-label="AlgorithmX home">
          Algorithm<b>X</b>
        </Link>
      </header>
      <main className="axbright-stage">
        <section className="axbright-card">
          {eyebrow && <p className="axbright-eyebrow">{eyebrow}</p>}
          <h1 className="axbright-title">{title}</h1>
          {children}
        </section>
      </main>
    </div>
  );
}
