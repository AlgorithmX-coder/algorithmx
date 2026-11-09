/* A screenshot of the app each course part teaches, for the top right of its
 * card (owner 2026-11-09: "can't we get actual screenshots of them? It'll
 * look better"). The screens in public/desk-ready/apps are staged work
 * scenes (a supplier email, an order sheet, a team document library) shot at
 * 960x600, with no vendor logos and no real person's data. Decorative only.
 * Styles are in PREVIEW_CSS, which each page adds to its stylesheet; a page
 * sets the width, the height follows the 16:10 shot. */

export type PreviewKind = "desktop" | "outlook" | "excel" | "sharepoint" | "copilot" | "word";

export default function PartPreview({ kind }: { kind: PreviewKind }) {
  return (
    <span className="dr-pv" aria-hidden>
      <img src={`/desk-ready/apps/${kind}.webp`} alt="" width={960} height={600} loading="lazy" decoding="async" />
    </span>
  );
}

export const PREVIEW_CSS = `
        .dr-pv {
          position: relative; flex-shrink: 0; display: block; width: 250px; aspect-ratio: 16 / 10; border-radius: 10px; overflow: hidden;
          background: #ffffff; border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 18px 36px -14px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.25), 0 0 30px -8px var(--dr-accent);
          transform: rotate(2deg); transition: transform .3s ease;
        }
        .dr-pv img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top left; }
        /* a faint glare, so the shot reads as a lit screen and not a flat sticker */
        .dr-pv::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(125deg, rgba(255,255,255,0.22), transparent 38%); }
        .dr-part:hover .dr-pv { transform: rotate(0deg) translateY(-3px) scale(1.04); }
        /* max-width, so a page that sets a wider width still shrinks on a phone */
        @media (max-width: 640px) { .dr-pv { max-width: 170px; } }
        @media (max-width: 420px) { .dr-pv { max-width: 128px; } }
`;
