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
      <style>{`
        .ms-startups {
          display: inline-flex;
          align-items: center;
          flex: 0 0 auto;
          padding: 6px 13px;
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
          padding: 6px 12px;
          border-radius: 999px;
          background: #fff;
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
