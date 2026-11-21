import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { getOverview, type Section } from "./overviewData";
import { SchoolIcon, OrganisationIcon, FirmIcon, IndividualsIcon, ArrowIcon } from "./icons";
import CountUp from "./CountUp";
import Sparkbars from "./Sparkbars";

/* /admin: the overview. Four segment tiles with live counts and a
 * twelve-week sign-up trend each, the last few sign-ups across every
 * segment, and the short list of things that are waiting on a person.
 * All of it from createdAt and a handful of counts - see overviewData. */
export const dynamic = "force-dynamic";

const TILES: { section: Section; href: string; label: string; note: string; Icon: typeof SchoolIcon }[] = [
  { section: "schools", href: "/admin/schools", label: "Schools", note: "School licences and trials", Icon: SchoolIcon },
  { section: "organisations", href: "/admin/organisations", label: "Organisations", note: "Youth clubs, councils, charities", Icon: OrganisationIcon },
  { section: "firms", href: "/admin/firms", label: "Firms", note: "Cyber Secured seats and trials", Icon: FirmIcon },
  { section: "individuals", href: "/admin/individuals", label: "Individuals", note: "Direct course sign-ups", Icon: IndividualsIcon },
];

const SECTION_LABEL: Record<Section, string> = { schools: "School", organisations: "Organisation", firms: "Firm", individuals: "Individual" };

function ago(d: Date, now: number): string {
  const s = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 14) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function AdminIndexPage() {
  const [session, data] = await Promise.all([auth(), getOverview()]);
  const now = Date.now();

  const london = new Date(now);
  const hour = Number(london.toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }));
  const greeting = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = (session?.user?.name ?? "").trim().split(/\s+/)[0] || "there";
  const today = london.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" });
  const total = Object.values(data.counts).reduce((a, b) => a + b, 0);
  const thisMonth = Object.values(data.series).reduce((a, s) => a + s.slice(-4).reduce((x, y) => x + y, 0), 0);

  return (
    <div>
      <div className="ad-hero">
        <div>
          <p className="ad-kicker"><b>Mission control</b> &middot; {today}</p>
          <h1 className="ad-h1">{greeting}, {first}.</h1>
          <p className="ad-note">
            <b>{total}</b> customer{total === 1 ? "" : "s"} across four segments &middot; <b>{thisMonth}</b> new in the last four weeks &middot; every number here is read live.
          </p>
        </div>
      </div>

      <div className="ad-tiles">
        {TILES.map((t) => {
          const series = data.series[t.section];
          const last4 = series.slice(-4).reduce((a, b) => a + b, 0);
          return (
            <Link key={t.href} href={t.href} className={`ad-tile ${t.section}`}>
              <span className="ad-tile-top">
                <span className="ad-tile-icon"><t.Icon /></span>
                <span className="ad-tile-arrow"><ArrowIcon /></span>
              </span>
              <span className="ad-tile-count"><CountUp value={data.counts[t.section]} /></span>
              <span className="ad-tile-label">{t.label}</span>
              <span className="ad-tile-note">{t.note}</span>
              <span className="ad-tile-foot">
                <Sparkbars values={series} label={`${t.label} sign-ups, last 12 weeks`} />
                <span className="ad-tile-trend"><b>+{last4}</b> 4 wks</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="ad-grid-2">
        <section className="ad-card">
          <div className="ad-panel-head">
            <h2 className="ad-h2">Recent</h2>
            <span className="ad-count">Newest sign-ups, every segment</span>
          </div>
          <div className="ad-feed">
            {data.recent.map((r) => (
              <Link key={r.key} href={r.href} className={`ad-feed-item ${r.section}`}>
                <span className="ad-feed-avatar" aria-hidden="true">{r.name.trim().charAt(0).toUpperCase() || "?"}</span>
                <span className="ad-feed-main"><b>{r.name}</b><small>{r.sub}</small></span>
                <span className="ad-feed-side">
                  <span className="ad-feed-tag">{SECTION_LABEL[r.section]}</span>
                  <span className="ad-feed-when">{ago(r.at, now)}</span>
                </span>
              </Link>
            ))}
            {data.recent.length === 0 && <div className="ad-clear">Nobody has signed up yet.</div>}
          </div>
        </section>

        <section className="ad-card">
          <div className="ad-panel-head">
            <h2 className="ad-h2">Needs attention</h2>
            <span className="ad-count">{data.attention.length === 0 ? "Nothing waiting" : `${data.attention.length} item${data.attention.length === 1 ? "" : "s"}`}</span>
          </div>
          {data.attention.length > 0 ? (
            <div className="ad-attn">
              {data.attention.map((a) => (
                <Link key={a.key} href={a.href} className={`ad-attn-item ${a.tone}`}>
                  <span className="ad-attn-dot" aria-hidden="true" />
                  <span className="ad-attn-main"><b>{a.title}</b><small>{a.sub}</small></span>
                  <span className="ad-attn-go">{a.go} &rarr;</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="ad-clear"><span className="ad-attn-dot" aria-hidden="true" />All clear. No enquiries waiting, no trials about to end, nothing closed.</div>
          )}
        </section>
      </div>
    </div>
  );
}
