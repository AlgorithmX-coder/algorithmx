import { SECURED_TRACK_SLUGS } from "@/app/lib/cyberSecured";

/* Who the staff "remove this person's data" tool may erase, and why not
 * when it refuses. Kept free of Prisma so the rule can be unit-tested on
 * its own; eraseLearner in aiClearedOps.ts gathers the facts and asks.
 *
 * The tool exists for a firm's written request about one of its people.
 * Claiming a Cyber Secured seat always grants a BUNDLE entitlement to
 * every track (enrolOnEveryTrack in aiCleared.ts), so those entitlements
 * are the firm's and go with the person. Anything else on the account is
 * the person's own business with us, outside what a firm can ask us to
 * delete:
 *   - a course they PAID for as an individual (source PURCHASE): wiping it
 *     destroys something they bought, and the money side (refunds, Stripe)
 *     has to be settled first;
 *   - any other course access (a free sign-up grant, a staff grant, a
 *     school place), child profiles, Cyber Pro progress of their own;
 *   - school teaching: deleting a teacher deletes the classes they teach.
 * Every refusal says what was found and that nothing was deleted. */

export type EraseEntitlement = {
  source: "MANUAL" | "PURCHASE" | "BUNDLE";
  productSlug: string;
  productName: string;
};

export type EraseFacts = {
  role: string;
  entitlements: readonly EraseEntitlement[];
  children: number;
  proProgress: number;
  classesTaught: number;
  teacherInvites: number;
};

const NOTHING_DELETED = "Nothing has been deleted.";

const SECURED = new Set<string>(SECURED_TRACK_SLUGS);

/* True for an entitlement a Cyber Secured seat claim grants. */
export function isFirmSeatEntitlement(e: EraseEntitlement): boolean {
  return e.source === "BUNDLE" && SECURED.has(e.productSlug);
}

function names(list: readonly EraseEntitlement[]): string {
  const n = Array.from(new Set(list.map((e) => e.productName)));
  return n.length > 1 ? `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}` : n[0] ?? "";
}

/* Null when the account may be erased; otherwise the message staff see. */
export function eraseRefusal(f: EraseFacts): string | null {
  if (f.role === "staff") return `That is a staff account; remove the staff flag first. ${NOTHING_DELETED}`;

  const bought = f.entitlements.filter((e) => e.source === "PURCHASE");
  if (bought.length) {
    return `That account bought ${names(bought)} as an individual. A paid consumer course is not the firm's to delete, so this tool will not erase it. Treat it as a consumer deletion request: settle any refund in Stripe first, then remove the account with care. ${NOTHING_DELETED}`;
  }

  if (f.children > 0) {
    return `That account also holds ${f.children === 1 ? "a child profile" : `${f.children} child profiles`} (a family or school pupil account), which is not the firm's to delete. Treat it as a consumer deletion request. ${NOTHING_DELETED}`;
  }

  if (f.classesTaught > 0 || f.teacherInvites > 0) {
    return `That person is also on a school's staff${f.classesTaught > 0 ? ` and teaches ${f.classesTaught === 1 ? "a class" : `${f.classesTaught} classes`}` : ""}. Erasing them would delete the school's classes, so move the classes to another teacher and handle it as a school request. ${NOTHING_DELETED}`;
  }

  const other = f.entitlements.filter((e) => !isFirmSeatEntitlement(e));
  if (other.length) {
    return `That account also has its own access to ${names(other)}, outside the firm's seat. That is not the firm's to delete. Treat it as a consumer deletion request. ${NOTHING_DELETED}`;
  }

  if (f.proProgress > 0) {
    return `That account also has its own Cyber Pro progress, outside the firm's seat. That is not the firm's to delete. Treat it as a consumer deletion request. ${NOTHING_DELETED}`;
  }

  return null;
}

/* What happens to the person's seats. A CLAIMED seat stays on the firm's
 * register and still counts as used: the firm spent it on this person,
 * and a firm admin cannot free a claimed seat either (DELETE
 * /api/org/seats refuses), so erasing someone must not hand the firm a
 * seat back. It is anonymised: every claimed seat the person held at one
 * firm gets the SAME removed address, because the seat cap (seatsLeft)
 * and the register (onePerPerson) count distinct addresses as people, so
 * one person stays one seat. Should two claimed seats at a firm share a
 * course (one sent to a work address, one to a personal one), the extra
 * one goes, since the anonymised pair would collide on the register's
 * unique key. An UNCLAIMED invite is removed outright, freeing the place,
 * exactly as the firm's admin could do themselves: it holds nothing but
 * the address and a live link. */
export type EraseSeat = { id: string; orgId: string; course: string; claimedAt: Date | null; invitedAt: Date };

export function planSeats(seats: readonly EraseSeat[]): { anonymise: string[]; remove: string[] } {
  const anonymise: string[] = [];
  const remove: string[] = [];
  const kept = new Set<string>();
  const at = (d: Date | null) => d?.getTime() ?? Infinity;
  const ordered = [...seats].sort((a, b) => at(a.claimedAt) - at(b.claimedAt) || a.invitedAt.getTime() - b.invitedAt.getTime());
  for (const s of ordered) {
    const key = `${s.orgId}:${s.course}`;
    if (s.claimedAt && !kept.has(key)) {
      kept.add(key);
      anonymise.push(s.id);
    } else {
      remove.push(s.id);
    }
  }
  return { anonymise, remove };
}
