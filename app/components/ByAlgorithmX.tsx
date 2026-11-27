import type { CSSProperties } from "react";
import "./by-algorithmx.css";

/**
 * ByAlgorithmX: the "by AlgorithmX" byline every course and product lockup
 * carries under its name (owner ruling 2026-11-27, landing lab r9 design 3,
 * "Bracket core"). The words come first and the cube sits at the very end: a
 * small wire-frame cube turning slowly with the coder's </> glowing at its
 * centre, its edge exactly 1em of the byline font, so it is text height.
 *
 * It inherits font, size, colour and letter-spacing from the byline it sits
 * in; the lockup keeps its own type. `wordClassName` / `wordStyle` go on the
 * words, so a lockup keeps its own dim (".dim" or an inline opacity). Pure
 * CSS motion; reduced motion shows it still at a three-quarter angle.
 */
export default function ByAlgorithmX({
  by = "by",
  brand = "AlgorithmX",
  wordClassName,
  wordStyle,
}: {
  by?: string;
  brand?: string;
  wordClassName?: string;
  wordStyle?: CSSProperties;
}) {
  return (
    <span className="axby">
      <span className={wordClassName} style={wordStyle}>{by} {brand}</span>
      <BracketCube />
    </span>
  );
}

/** The cube on its own: six wire faces and a flat </> that faces the reader. */
export function BracketCube() {
  return (
    <span className="axby-cube" aria-hidden="true">
      <span className="axby-rot">
        <span className="axby-f" />
        <span className="axby-f" />
        <span className="axby-f" />
        <span className="axby-f" />
        <span className="axby-f" />
        <span className="axby-f" />
      </span>
      <svg className="axby-code" viewBox="0 0 22 14" fill="none" stroke="#00e5ff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <path d="M7 2.5 2.5 7 7 11.5M12.8 1.5 9.2 12.5M15 2.5 19.5 7 15 11.5" />
      </svg>
    </span>
  );
}
