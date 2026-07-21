import { ImageResponse } from "next/og";

/**
 * Dynamically generated Open Graph / Twitter card for the site root.
 *
 * The landing had no OG image, so shared links (Slack, iMessage, X,
 * WhatsApp) rendered a bare text unfurl. This produces a branded
 * 1200x630 card at build time — no external asset to maintain, and
 * Next auto-emits og:image + twitter:image tags pointing at it.
 *
 * Satori (the renderer) supports flexbox only — every container with
 * more than one child sets display:flex explicitly. No custom font is
 * loaded; the built-in default keeps this self-contained.
 */
export const alt =
  "AlgorithmX — technology education for every stage of life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const INK = "#04050d";
  const CYAN = "#00e5ff";
  const PAPER = "#e8edff";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 84px",
          background: INK,
          backgroundImage: `radial-gradient(900px 520px at 78% 0%, rgba(0,229,255,0.18), rgba(4,5,13,0) 60%), radial-gradient(700px 500px at 8% 108%, rgba(124,92,255,0.16), rgba(4,5,13,0) 62%)`,
          color: PAPER,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 30,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(0,229,255,0.85)",
          }}
        >
          // Six fields · built for the future
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.02,
            maxWidth: 900,
          }}
        >
          Technology education for every stage of life.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 33,
            lineHeight: 1.4,
            color: "rgba(232,237,255,0.72)",
            maxWidth: 860,
          }}
        >
          Six technology streams for ages 6 to adult. Cyber Security is live
          today.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: CYAN,
              boxShadow: "0 0 24px rgba(0,229,255,0.65)",
              marginRight: 20,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            ALGORITHM
            <span style={{ color: CYAN }}>X</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
