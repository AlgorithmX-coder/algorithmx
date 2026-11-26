import Link from "next/link";
import Frame from "./Frame";
import { consumerCourse, formatPence, purchasePath } from "@/app/lib/consumerCatalogue";
import type { SecuredTrackSlug } from "@/app/lib/cyberSecured";

/* What a signed-in person without a seat or a purchase sees on AI Cleared,
 * AI Fluent or Cyber Awareness. Since 2026-11-26 one person can buy each of
 * these for themselves (app/lib/consumerCatalogue.ts), so the screen leads
 * with that and keeps the firm route for people whose employer holds a
 * Cyber Secured licence. */
export default function IndividualOffer({ course, email }: { course: SecuredTrackSlug; email: string }) {
  const c = consumerCourse(course);
  if (!c) return null;
  const price = formatPence(c.pence);
  return (
    <Frame course={course} meta={<span className="cf-meta">{email}</span>}>
      <span className="cf-eyebrow">Ready when you are</span>
      <h1 className="cf-h1">
        Take {c.name} for yourself. Then you are <span className="cf-grad">in</span>.
      </h1>
      <p className="cf-lead">
        {c.line} One payment of {price}, VAT included, and it is yours for life. If your firm holds a Cyber Secured licence, open the invite link from your admin while signed in as {email} and your seat is waiting.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href={purchasePath(c.slug)} className="cf-btn cf-btn-pri">
          Get {c.name}, {price}
        </Link>
        <Link href="/corporate" className="cf-btn">
          Cyber Secured for firms
        </Link>
      </div>
    </Frame>
  );
}
