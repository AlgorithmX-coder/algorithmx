import type { CSSProperties } from "react";

/**
 * CubeMark — the AlgorithmX brand cube as a small, flat line mark.
 *
 * The animated nav logo (BrandCube) and the favicon are the full treatment;
 * this is the lightweight stamp for the little square badges that used to
 * read "AX" (auth pages, the Cyber Heroes footer). It draws the same
 * isometric cube — a hexagon silhouette with the three front edges meeting
 * at the near corner — in a single colour, so it inherits whatever ink the
 * badge gave the "AX" text. `code` adds the </> core where the badge is big
 * enough to show it.
 */
export default function CubeMark({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.6,
  code = false,
  className,
  style,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  code?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    >
      <polygon
        points="12,3.4 19.6,7.7 19.6,16.3 12,20.6 4.4,16.3 4.4,7.7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M12 12 L19.6 7.7 M12 12 L4.4 7.7 M12 12 L12 20.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {code ? (
        <text
          x="12"
          y="16.4"
          textAnchor="middle"
          fontFamily="ui-monospace, Menlo, Consolas, monospace"
          fontWeight="700"
          fontSize="5"
          fill={color}
        >
          {"</>"}
        </text>
      ) : null}
    </svg>
  );
}
