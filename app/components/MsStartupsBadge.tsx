/**
 * The Microsoft for Startups badge, as supplied.
 *
 * The artwork is Microsoft's own website badge, downloaded from their PR
 * toolkit and used unmodified: their guidance is to post the badge as given,
 * and the current wording is "collaborate", not "partner", because they ask
 * partners to keep "partnership" out of public messaging unless their
 * Microsoft contact has cleared it. Do not retype the words as HTML, and do
 * not recolour or crop the image.
 *
 * It sits with the Cyber Essentials and NCSC marks rather than above the
 * headline, and it is held back rather than sharpened: a pale card at full
 * strength punches a hole in a dark page. Opacity settles it into the
 * surface and lifts on hover or focus, so anyone who looks at it gets the
 * badge as issued. No blend mode and no colour wash: those would recolour
 * Microsoft's own logo, which their trademark guidance does not allow.
 *
 * 524x224 is the largest Microsoft serve, so it is drawn at 176px or less
 * and stays sharp on a retina screen.
 */
export default function MsStartupsBadge({ style }: { style?: React.CSSProperties }) {
  return (
    <span className="ms-startups" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/microsoft-for-startups.webp"
        width={524}
        height={224}
        alt="Proud to collaborate with Microsoft for Startups"
        loading="lazy"
        decoding="async"
      />
      <style>{`
        .ms-startups {
          display: inline-flex;
          align-items: center;
          flex: 0 0 auto;
        }
        .ms-startups img {
          display: block;
          width: clamp(142px, 13vw, 176px);
          height: auto;
          /* Opacity only: it settles the pale card into a dark page without
             touching the artwork the way a blend mode or a colour wash would.
             Full strength on hover or focus, so anyone looking at it gets the
             badge as issued. */
          opacity: 0.48;
          transition: opacity 0.35s ease;
        }
        .ms-startups:hover img,
        .ms-startups:focus-within img { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .ms-startups img { transition: none; }
        }
      `}</style>
    </span>
  );
}
