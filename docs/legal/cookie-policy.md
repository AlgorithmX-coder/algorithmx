> **DRAFT — pending legal review.** First draft for review by a UK solicitor. Based on
> your confirmed position (strictly-necessary cookies only) and your codebase (cookieless
> Plausible analytics). Cookie names/lifetimes below are taken from the current code and
> should be re-verified before publishing. Do not publish until reviewed.

# Cookie Policy — AlgorithmX Ltd / algorithmx.io

**Last updated:** [INSERT: date] · **Version:** Draft 0.1

## 1. What this policy covers

This policy explains the cookies and similar technologies we use on algorithmx.io. It
sits alongside our Privacy Policy.

## 2. Our cookie position (current)

**We use only strictly-necessary cookies.** These are required to operate the platform
and keep you signed in securely — without them the service cannot work. Under the
**Privacy and Electronic Communications Regulations (PECR)**, strictly-necessary cookies
**do not require your consent**, so we do **not** show a cookie consent banner. We still
tell you about them here, for transparency.

| Cookie | Set by | Purpose | Type | Roughly how long |
|---|---|---|---|---|
| `authjs.session-token` (on HTTPS: `__Secure-authjs.session-token`) | AlgorithmX (NextAuth) | Keeps you securely signed in (your session is held in this signed cookie) | Strictly necessary | Up to ~30 days [CONFIRM expiry] |
| `authjs.csrf-token` (on HTTPS: `__Host-authjs.csrf-token`) | AlgorithmX (NextAuth) | Security — protects sign-in against cross-site request forgery | Strictly necessary | Session |
| `authjs.callback-url` (on HTTPS: `__Secure-authjs.callback-url`) | AlgorithmX (NextAuth) | Remembers where to send you after sign-in | Strictly necessary | Session |
| `site_auth` | AlgorithmX | Pre-launch access gate — lets in visitors who entered the site password while the site is private | Strictly necessary | 30 days |

[CONFIRM before publishing: exact NextAuth v5 cookie names depend on configuration and
HTTPS; the `__Secure-`/`__Host-` prefixed names are used in production. The `site_auth`
cookie is part of the temporary pre-launch password gate — remove this row once the gate
is removed at public launch. Re-verify session expiry against your NextAuth config.]

## 3. Analytics — and why we still don't use cookies for it

We use **Plausible Analytics** to understand how the platform is used (e.g. how many
people start a lesson). Plausible is **cookieless** — it does **not** set any cookies on
your device, does not track you across websites, and does not build an advertising
profile. We send it only non-identifying information such as which week or screen was
reached — never a child's name, age, email, or answers.

Because Plausible sets no cookies and does not store or read information on your device
in the way tracking cookies do, **we do not consider it to require a cookie consent
banner.** [SOLICITOR TO CONFIRM: the PECR position on cookieless analytics for a
children's service — see Privacy Policy §6. If your solicitor advises consent is needed,
this policy and the site must add a consent mechanism — see the alternative scenario
below.]

## 4. We do **not** use

- Advertising or marketing cookies
- Third-party tracking or social-media cookies
- Cross-site profiling

## 5. Managing cookies

Because we only use strictly-necessary cookies, there is nothing to switch off without
breaking sign-in. You can still control cookies through your browser settings, but
blocking our session cookies will prevent you from logging in.

## 6. Changes

If we ever introduce non-essential cookies or tracking, we will update this policy
**and** add a proper consent mechanism (see below) before doing so.

---

## Appendix — Alternative scenario (KEEP ONLY IF you later add tracking/analytics cookies)

> Include this version **instead** of the above only if you start using cookie-based
> analytics (e.g. Google Analytics) or any non-essential cookies. It is here so you're
> ready.

If we use non-essential cookies (analytics, performance, or marketing), then under PECR
and UK GDPR we must:
- Obtain your **opt-in consent before** setting them (no pre-ticked boxes; consent banner
  required);
- Let you **accept, reject, or choose** categories, with reject as easy as accept;
- Let you **change your mind** at any time;
- Not deploy those cookies until you've consented.

[If this scenario applies, list each non-essential cookie, its provider, purpose, and
duration in a table here, and describe the consent tool used.]
