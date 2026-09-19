/**
 * The Microsoft for Startups mark, in the same pill as the other trust marks.
 *
 * The owner swapped the artwork: this is the Microsoft + Microsoft for
 * Startups lockup rather than the pastel "Proud to collaborate with" card
 * from Microsoft's PR toolkit. It carries no tagline, which sidesteps their
 * rule about the word "partnership" entirely, and it takes the Cyber
 * Essentials treatment: a white plate inside the cyan-outlined pill, because
 * the artwork is dark on white and would vanish on a dark ground.
 *
 * The line beside it reads "Microsoft for Startups member", NOT "partnered
 * with Microsoft". Microsoft ask startups to keep "partner" and
 * "partnership" out of public messaging unless a Microsoft contact has
 * cleared it, and membership of the programme is not a partnership in the
 * sense their legal guidance means. Change it only with that clearance.
 *
 * Used unmodified apart from trimming its white margin. Do not recolour it,
 * do not knock it out to white, and do not retype the words as HTML.
 */
export default function MsStartupsBadge({ style }: { style?: React.CSSProperties }) {
  return (
    <span className="ms-startups" style={style}>
      <span className="ms-startups-plate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/microsoft-for-startups.webp"
          width={424}
          height={65}
          alt="Microsoft for Startups"
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="ms-startups-text">Microsoft for Startups member</span>
      <style>{`
        .ms-startups {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          flex: 0 0 auto;
          padding: 6px 16px 6px 7px;
          border-radius: 999px;
          background: rgba(13,15,24,0.55);
          border: 1px solid rgba(159,245,255,0.28);
          box-shadow: 0 0 30px -16px rgba(159,245,255,0.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .ms-startups-plate {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #fff;
        }
        .ms-startups-text {
          font-family: var(--lv2-font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lv2-cyan-soft, #9ff5ff);
          white-space: nowrap;
        }
        .ms-startups-plate img {
          display: block;
          width: clamp(128px, 13vw, 158px);
          height: auto;
        }
      `}</style>
    </span>
  );
}
