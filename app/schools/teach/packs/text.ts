/**
 * Pack copy as plain text, for the places that cannot take markup: a tooltip,
 * a page title, an <option>, a line React renders as text.
 *
 * Pack fields are authored HTML (see ./types.ts), so a title like
 * "Let&rsquo;s build one" printed straight through React shows the teacher
 * the entity itself. This turns line breaks into spaces, drops the tags and
 * decodes the handful of entities the packs actually use. It is not a general
 * HTML decoder and does not need to be: the copy is ours and checked in.
 */
const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  middot: "·", ndash: "–", hellip: "…", pound: "£",
  times: "×", rarr: "→", larr: "←",
};

export function plain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === "#") {
        const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return NAMED[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
}
