/**
 * The ASDAN mark, in the same pill as the other trust marks.
 *
 * White plate because the supplied artwork is dark on light, then the claim
 * to its right, the way Cyber Essentials reads. "Aligned with ASDAN" matches
 * how /cyberheroes already describes it: an alignment, not an award we hold.
 * Do not upgrade the wording to "accredited by" without something in writing.
 */
export default function AsdanBadge({ style }: { style?: React.CSSProperties }) {
  return (
    <span className="asdan-mark" style={style}>
      <span className="asdan-mark-plate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/asdan.jpg" width={263} height={61} alt="ASDAN" loading="lazy" decoding="async" />
      </span>
      <span className="asdan-mark-text">Aligned with ASDAN</span>
      <style>{`
        .asdan-mark {
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
        .asdan-mark-plate {
          display: inline-flex;
          align-items: center;
          padding: 7px 10px;
          border-radius: 999px;
          background: #fff;
        }
        .asdan-mark-plate img { display: block; width: 94px; height: auto; }
        .asdan-mark-text {
          font-family: var(--lv2-font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lv2-cyan-soft, #9ff5ff);
          white-space: nowrap;
        }
      `}</style>
    </span>
  );
}
