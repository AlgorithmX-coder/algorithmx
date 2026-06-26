"use client";

/**
 * PixIcon — renders a generated 3D Pixar-style icon image in place of an
 * emoji, so Cyber Heroes never shows a "cheap" system emoji. Falls back to
 * the raw emoji glyph when a mapping doesn't exist, so every call site is
 * always safe to convert.
 *
 * Icons live in /public/cyberheroes/icons (sliced + keyed from the OpenArt
 * grids). Keep MAP in sync with that folder.
 */

import type { CSSProperties } from "react";

const BASE = "/cyberheroes/icons";

// Emoji → icon filename (without extension). Variation-selector forms (with
// and without U+FE0F) both map, since authored data uses either.
const MAP: Record<string, string> = {
  // security objects
  "🔑": "key",
  "🗝️": "skeleton-key",
  "🗝": "skeleton-key",
  "🛡️": "shield",
  "🛡": "shield",
  "🔒": "padlock",
  "🔐": "padlock-key",
  "🔓": "padlock-open",
  "🆔": "id-card",
  // characters / investigate
  "🦝": "raccoon",
  "🧠": "brain",
  "🔍": "magnifier",
  "🕵️": "detective",
  "🕵": "detective",
  "👪": "family",
  "👨‍👩‍👧‍👦": "family",
  // password strength
  "📏": "ruler",
  "🎲": "dice",
  "🔢": "number-blocks",
  "🔠": "letter-blocks",
  "🔡": "lowercase-blocks",
  "🔣": "symbol-keys",
  "🎨": "palette",
  // password-repair toolbox
  "🗑️": "trash",
  "🗑": "trash",
  "🔀": "shuffle",
  "📋": "clipboard",
  "🔗": "link",
  "⚙️": "gear",
  "⚙": "gear",
  // secrecy / obvious
  "🤫": "shush",
  "🤐": "zipper-mouth",
  "🙈": "shush",
  "🚫": "no-entry",
  "🌀": "swirl",
  "🏷️": "name-tag",
  "🏷": "name-tag",
  "🎂": "cake",
  "⌨️": "keyboard",
  // rewards / feedback
  "🎉": "party",
  "✅": "check-badge",
  "✔️": "check-badge",
  "🎯": "target",
  "⭐": "star",
  "🌟": "star",
  "💫": "star",
  "✨": "sparkles",
  "🌠": "sparkles",
  "🏆": "trophy",
  "🏅": "medal",
  "🥇": "medal",
  // energy / boss / misc
  "⚡": "lightning",
  "💎": "diamond",
  "🪤": "mouse-trap",
  "🔨": "hammer",
  "🏥": "hospital",
  "🚪": "door",
  "💪": "muscle",
  "🚀": "rocket",
  "🎁": "gift",
  "💀": "skull",
  "🏠": "home",
  "👍": "thumbs-up",
  "💡": "lightbulb",
  "🔔": "bell",
  "👀": "eye",
  "👁️": "eye",
  "👁": "eye",
};

/** Resolve an emoji to its icon path, or null if there's no mapping. */
export function iconFor(emoji: string): string | null {
  const name = MAP[emoji];
  return name ? `${BASE}/${name}.png` : null;
}

export interface PixIconProps {
  emoji: string;
  size?: number;
  style?: CSSProperties;
  alt?: string;
  className?: string;
}

export default function PixIcon({
  emoji,
  size = 24,
  style,
  alt = "",
  className,
}: PixIconProps) {
  const src = iconFor(emoji);
  if (!src) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1, ...style }}>
        {emoji}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
}
