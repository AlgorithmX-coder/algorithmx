"use client";

/**
 * A sticker's picture, wherever it is shown.
 *
 * A sticker appears twice: on the screen that awards it at the end of a
 * week, and on the wall in Cyber HQ. Those were two separate bits of
 * rendering, so the collection could look nothing like the thing the child
 * had just been given. This is the one component, so it cannot.
 *
 * A week with bespoke art gets it; a week without falls back to its PixIcon,
 * which is what every week showed before. That fallback is why art can be
 * added one week at a time instead of all twenty at once.
 */

import type { CSSProperties } from "react";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface StickerArtProps {
  /** The sticker's emoji, used when it has no bespoke art. */
  icon: string;
  /** Path to the bespoke art under /public, if the week has it. */
  art?: string;
  /** Rendered height in px. The art keeps its own aspect ratio. */
  size?: number;
  /** Greyed and dimmed, for a sticker not earned yet. */
  locked?: boolean;
  alt?: string;
  style?: CSSProperties;
}

export default function StickerArt({
  icon,
  art,
  size = 60,
  locked = false,
  alt = "",
  style,
}: StickerArtProps) {
  if (!art || locked) {
    return <PixIcon emoji={locked ? "🔒" : icon} size={size} style={style} alt={alt} />;
  }
  return (
    <img
      src={art}
      alt={alt}
      /* Height drives it and width follows, because the cast are drawn at
       * whatever width their pose needs - Layla with a key held high is far
       * wider than Adam standing square. Fixing the width instead would
       * squash one of them. */
      style={{
        height: size,
        width: "auto",
        maxWidth: "100%",
        objectFit: "contain",
        display: "block",
        ...style,
      }}
    />
  );
}
