import type { CSSProperties } from "react";

/* Twelve little bars, one per week, newest on the right. Pure markup:
 * admin.css grows each bar from the baseline with a per-bar stagger. A
 * flat series still draws a faint floor, so an empty segment reads as
 * "quiet", not "broken". */
export default function Sparkbars({ values, label }: { values: number[]; label?: string }) {
  const max = Math.max(0, ...values);
  return (
    <div className="ad-spark" role="img" aria-label={label ?? `Sign-ups over the last ${values.length} weeks`}>
      {values.map((v, i) => {
        const pct = max > 0 ? Math.max(8, Math.round((v / max) * 100)) : 8;
        return <span key={i} style={{ "--h": `${pct}%`, opacity: max > 0 && v === 0 ? 0.3 : undefined } as CSSProperties} />;
      })}
    </div>
  );
}
