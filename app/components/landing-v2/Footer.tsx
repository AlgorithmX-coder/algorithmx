"use client";

import Link from "next/link";

/**
 * Footer - dark 4-column. Brand / Subjects / Company / Legal.
 */
export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        /* Blend into the page background instead of stamping an opaque
         * slab with a hard top edge. The old `rgba(2,3,8,0.96)` fill +
         * 1px cyan borderTop drew a visible horizontal seam where the
         * footer met the (transparent) FinalCTA section above, cutting
         * across the fixed cosmic backdrop. Now the fill is a vertical
         * gradient that starts fully transparent at the very top — so
         * the cosmic bg / code panel read straight THROUGH the seam —
         * and deepens to near-opaque ink by ~26% down, well before the
         * footer columns, so the text keeps its dark, legible bed. The
         * hard border is gone; the fade IS the divider. */
        background:
          "linear-gradient(to bottom, " +
          "rgba(2,3,8,0) 0%, " +
          "rgba(2,3,8,0.5) 10%, " +
          "rgba(2,3,8,0.88) 26%, " +
          "rgba(2,3,8,0.97) 100%)",
        color: "rgba(232,237,255,0.7)",
        /* Extra bottom clearance (+72px) so the fixed Algo chip
         * (bottom-right of the viewport) floats over empty space at
         * page end instead of covering the copyright line. */
        padding:
          "calc(var(--lv2-rail) * 2.4) var(--lv2-rail) calc(var(--lv2-rail) * 1 + 72px)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lv2-footer-grid">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: "var(--lv2-cyan)",
                  boxShadow: "0 0 14px rgba(0,229,255,0.7)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "var(--lv2-paper)",
                }}
              >
                ALGORITHMX
              </span>
            </div>
            <p
              style={{
                color: "rgba(232,237,255,0.55)",
                fontSize: 13,
                lineHeight: 1.6,
                maxWidth: 260,
              }}
            >
              Technology education for every stage of life.
            </p>
          </div>

          <FooterColumn
            label="Subjects"
            links={[
              { name: "Cybersecurity", href: "/cybersecurity" },
              { name: "Cyber Heroes", href: "/cyberheroes" },
              { name: "Cyber Explorers", href: "/cyberexplorers" },
            ]}
            note="+ 5 more streams — encrypted until launch"
          />
          {/* HONESTY PASS (2026-07-17): dead `href="#"` links removed —
           * About / For Parents / For Teens / Pricing and the entire
           * Legal column (Privacy / Terms / Cookies / Safeguarding) all
           * pointed nowhere. A dead Safeguarding link is the worst
           * possible signal for this audience, and Privacy/Cookies pages
           * are legally required for a UK company processing children's
           * data — SHIP THE REAL PAGES, then restore the links here. */}
          <FooterColumn
            label="Company"
            links={[
              { name: "Contact", href: "mailto:support@algorithmx.co.uk" },
            ]}
          />
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(0,229,255,0.1)",
            margin: "40px 0 22px",
          }}
        />
        <div className="lv2-footer-bottom">
          <a
            href="mailto:support@algorithmx.co.uk"
            style={{
              /* Bumped from 0.45 -> 0.7 alpha so the support email
               * meets WCAG AA contrast (~4.5:1) on the dark backdrop. */
              color: "rgba(232,237,255,0.7)",
              fontSize: 12,
              fontFamily: "var(--lv2-font-mono)",
              letterSpacing: "0.06em",
              textDecoration: "none",
            }}
          >
            support@algorithmx.co.uk
          </a>
          <p
            style={{
              /* Bumped from 0.4 -> 0.65 alpha so the copyright line
               * meets WCAG AA contrast on the dark backdrop. */
              color: "rgba(232,237,255,0.65)",
              fontSize: 11,
              fontFamily: "var(--lv2-font-mono)",
              letterSpacing: "0.06em",
            }}
          >
            &copy; 2026 AlgorithmX Ltd. Registered in England and Wales.
          </p>
        </div>
      </div>

      <style jsx>{`
        .lv2-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
        }
        .lv2-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        @media (max-width: 760px) {
          .lv2-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .lv2-footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}

function FooterColumn({
  label,
  links,
  note,
}: {
  label: string;
  links: Array<{ name: string; href: string }>;
  /** Muted, non-interactive line after the links (e.g. encrypted-streams hint). */
  note?: string;
}) {
  return (
    <div>
      <p
        style={{
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(232,237,255,0.55)",
          marginBottom: 14,
        }}
      >
        {label}
      </p>
      {links.map((l) =>
        l.href.startsWith("mailto:") || l.href === "#" || l.href.startsWith("http") ? (
          <a
            key={l.name}
            href={l.href}
            style={footerLink}
          >
            {l.name}
          </a>
        ) : (
          <Link key={l.name} href={l.href} style={footerLink}>
            {l.name}
          </Link>
        ),
      )}
      {note && (
        <p
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11.5,
            letterSpacing: "0.04em",
            color: "rgba(232,237,255,0.42)",
            marginTop: 4,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

const footerLink: React.CSSProperties = {
  display: "block",
  color: "rgba(232,237,255,0.72)",
  fontSize: 13.5,
  textDecoration: "none",
  marginBottom: 9,
  fontFamily: "var(--lv2-font-display)",
};
