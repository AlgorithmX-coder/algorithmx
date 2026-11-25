import { ImageResponse } from "next/og";

/**
 * The default share card for the whole site (1200x630), generated at build
 * time. Next adds og:image for every route that does not set its own
 * openGraph block, and the root layout's twitter card picks the same image
 * up, so a shared link unfurls as a branded card instead of bare text.
 *
 * Pages that set their own openGraph block without an `images` field
 * replace this one rather than inherit it (Next merges openGraph shallowly),
 * so give those pages an image of their own.
 *
 * Satori renders this: every element with more than one child sets
 * display:flex, and no web font is loaded so the build has nothing to fetch.
 */
export const alt = "AlgorithmX: cyber and AI skills for people, schools and firms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#04050d";
const CYAN = "#00e5ff";
const VIOLET = "#7c5cff";
const PAPER = "#e8edff";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: INK,
          backgroundImage:
            "radial-gradient(900px 520px at 82% 0%, rgba(0,229,255,0.20), rgba(4,5,13,0) 60%), radial-gradient(720px 520px at 6% 110%, rgba(124,92,255,0.22), rgba(4,5,13,0) 62%)",
          color: PAPER,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none" stroke={CYAN} strokeWidth="1.6" strokeLinejoin="round">
            <polygon points="16,2 28.12,9 28.12,23 16,30 3.88,23 3.88,9" />
            <path d="M16 16 L28.12 9 M16 16 L3.88 9 M16 16 L16 30" />
          </svg>
          <div style={{ display: "flex", marginLeft: 22, fontSize: 44, fontWeight: 800, letterSpacing: "0.16em" }}>
            ALGORITHM
            <span style={{ color: CYAN }}>X</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.04, maxWidth: 1000 }}>
            Cyber and AI skills for people, schools and firms.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, lineHeight: 1.4, color: "rgba(232,237,255,0.74)", maxWidth: 940 }}>
            Interactive cybersecurity courses from age 6 to adult, plus AI training for every member of staff.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 26, letterSpacing: "0.2em", color: "rgba(232,237,255,0.6)" }}>
          <div style={{ display: "flex", width: 14, height: 14, borderRadius: 4, background: VIOLET, marginRight: 16 }} />
          ALGORITHMX.IO · UK
        </div>
      </div>
    ),
    { ...size },
  );
}
