import { HERO_HTML_B64 } from "./hero-data";

/*
 * The Cyber Ops page-one marketing hero — a self-contained, play-in-browser
 * motion piece with the soundtrack (music + narration) inlined.
 *
 * It is served from a GATED, extension-less route on purpose. Anything in
 * /public bypasses the site-password gate (the middleware matcher excludes
 * `.*\..*`), and Cyber Ops must not be publicly reachable before trademark
 * clearance. This route sits behind the gate like every other /operators
 * preview. The base64 blob lives in a server-only module, so the ~1MB payload
 * is returned as an HTTP body on request and never enters any client bundle.
 */

const BASE =
  '<!doctype html><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  Buffer.from(HERO_HTML_B64, "base64").toString("utf8");

// When embedded (?embed=1) inside the /cyberstart hero, fill the iframe edge to
// edge: drop the standalone page's padding, controls line and stage chrome so
// the parent panel provides the frame.
const EMBED_OVERRIDE =
  "<style>html,body{height:100%;margin:0}" +
  ".wrap{padding:0!important;min-height:100%!important;height:100%!important;gap:0!important}" +
  ".controls{display:none!important}" +
  ".stage{width:100%!important;height:100%!important;max-width:none!important;border-radius:0!important;border:0!important;box-shadow:none!important}</style>";

export async function GET(request: Request) {
  const embed = new URL(request.url).searchParams.get("embed");
  const html = embed ? BASE + EMBED_OVERRIDE : BASE;
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
