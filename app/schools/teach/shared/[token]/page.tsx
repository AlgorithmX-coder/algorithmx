import Link from "next/link";
import type { Metadata } from "next";
import { openShareLink } from "@/app/lib/packShare";
import { getPack } from "../../packs";
import Pack from "../../Pack";

/**
 * A teacher pack shown to somebody with no account.
 *
 * This is the one door into the packs that is not behind a login, so it is
 * deliberately narrow: the link names ONE week, it expires, it can be revoked,
 * and the week picker is not rendered, so holding a link to week 1 does not
 * get you weeks 11 and 20. Nothing here is indexed.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cyber Heroes teacher pack",
  robots: { index: false, follow: false, nocache: true },
};

/** Said to whoever is holding the link, in the terms they can act on. */
const TROUBLE: Record<string, { head: string; body: string }> = {
  expired: {
    head: "This link has expired",
    body: "Links last a few weeks so they do not drift around after a conversation ends. Ask for a fresh one and it will open straight away.",
  },
  revoked: {
    head: "This link has been turned off",
    body: "Whoever sent it has since withdrawn it. If you were expecting to see the pack, ask them for a new link.",
  },
  unknown: {
    head: "This link does not work",
    body: "It is usually a link that got cut in half by an email client. Try copying the whole address from the original message, or ask for it again.",
  },
};

export default async function SharedPackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await openShareLink(token);

  if (!result.ok) {
    const t = TROUBLE[result.reason] ?? TROUBLE.unknown;
    return (
      <div className="axtp">
        <div className="wrap">
          <header className="top">
            <div>
              <div className="brand">Cyber <span>Heroes</span> &middot; <i>Teacher pack</i></div>
            </div>
          </header>
          <div className="brief">
            <h4>{t.head}</h4>
            <p>{t.body}</p>
            <p className="line">
              <Link href="/schools">See what a school licence includes</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pack = getPack(result.week);
  /* A link is only ever minted for a written week, so this is unreachable
     unless a pack were deleted out from under a live link. Say something
     truthful rather than throwing at somebody we invited to look. */
  if (!pack) {
    return (
      <div className="axtp">
        <div className="wrap">
          <div className="brief">
            <h4>This pack is not available</h4>
            <p>The week this link points at is not published. Please ask for a new link.</p>
          </div>
        </div>
      </div>
    );
  }

  /* `weeks` empty renders no picker: the link is for this week and no other. */
  return <Pack pack={pack} weeks={[]} shared />;
}
