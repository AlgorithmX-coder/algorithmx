# Legal pages — DRAFTS pending solicitor review

**None of these documents is final. Do not publish any of them until a UK solicitor
experienced in children's-data / EdTech law has reviewed them.** They are strong,
platform-specific first drafts written against what the codebase and product actually
do — not generic templates — but they contain decisions you must make and facts you
must insert.

## Files

| File | Document |
|---|---|
| [privacy-policy.md](privacy-policy.md) | Privacy Policy (UK GDPR + ICO Children's Code) |
| [terms-and-conditions.md](terms-and-conditions.md) | Terms & Conditions (UK consumer digital product) |
| [cookie-policy.md](cookie-policy.md) | Cookie Policy (strictly-necessary cookies; cookieless analytics) |
| [safeguarding-statement.md](safeguarding-statement.md) | Safeguarding Statement |

## Two things found in the codebase that shaped these drafts

1. **Analytics is present.** `app/components/PlausibleScript.tsx` + `app/lib/analytics.ts`
   load **Plausible** (cookieless, non-PII) when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set.
   So the **Cookie Policy** stays "strictly-necessary cookies only" (Plausible sets no
   cookies), but the **Privacy Policy** discloses the analytics. If you never enable
   Plausible in production, remove the analytics sections.
2. **The data model collects more than the original brief listed.** Per
   `prisma/schema.prisma`: child **date of birth** (not just age), child **favourite
   colour**, per-account **accessibility preferences**, **wait-list emails**, and
   password-reset tokens. All folded into the Privacy Policy.

Cookie facts were taken from `app/lib/auth.ts` (NextAuth v5, JWT sessions),
`middleware.ts` and `app/api/password/route.ts` (the pre-launch `site_auth` gate).

---

## (a) Facts you must insert — do not publish with placeholders

- Company number; registered office address
- ICO registration number (see decision 4)
- Data-protection contact name/role + email; safeguarding contact name/role + email
- **Retention periods** for each data type (account, progress, wait-list, payments,
  dormant "lifetime" accounts)
- Confirm **database region** (Neon) and **Plausible hosting** location
- Email provider used for verification / reset / wait-list emails
- Content age-appropriateness review process + named safeguarding-responsible person
- Final processor list

## (b) Decisions you must make

1. **Digital-content cancellation model (Terms §4):** Option A (instant access +
   explicit waiver of the 14-day right) vs Option B (honour the full 14 days).
2. **Age of consent for consent-based processing (Privacy §5):** moot for 6–9
   (parental authority always applies); a real decision for planned 10–18+ tracks.
   UK statutory floor is 13 — don't treat it as automatically settled.
3. **Analytics lawful basis (Privacy §6):** legitimate interests (+ assessment) vs
   consent, for cookieless Plausible on a children's service. Also confirm you intend
   to run Plausible in production at all.
4. **ICO registration / data protection fee:** you almost certainly must register and
   pay the fee as a commercial controller processing children's data.
5. **DPO:** likely not statutorily required at your scale, but document that
   assessment and name a responsible contact.
6. **"Lifetime access" definition (Terms §2/§9):** what happens if a course or the
   company is discontinued.
7. **Liability cap (Terms §10)** and any **goodwill refund policy (Terms §5)**.

## (c) Things a solicitor specifically must check

- Whether cookieless **Plausible** falls outside PECR consent for a children's service,
  and whether the chosen analytics lawful basis holds.
- That the **§4 cancellation clause** is lawful and the checkout actually captures
  express consent + acknowledgement (if Option A); no other page contradicts it.
- That the **liability limitation** is fair/enforceable against a consumer (unfair
  terms are void under the Consumer Rights Act 2015).
- Whether a **DPIA** is required (almost certainly yes for children's data) — ideally
  review it.
- **International transfer** mechanisms for Vercel and Stripe (US-based): IDTA / SCC +
  UK Addendum coverage.
- That the **lawful-basis table** (contract vs consent) is correct per data type.
- The **safeguarding statement's** referral language, named DSL-equivalent, and any
  vetting commitments against your accreditation body's (e.g. ASDAN) expectations.
