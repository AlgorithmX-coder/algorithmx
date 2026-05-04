# AlgorithmX — Production deploy checklist

Everything that needs to be true before you flip the switch on
`https://www.algorithmx.co.uk`. Tick each box once it's done in the
prod environment (Vercel + the live DB + the third-party dashboards).

The code is ready. Most of these are dashboard signups + env-var
copies. None require new code from me.

---

## 1. Database (Prisma) — REQUIRED

The Prisma schema has gained several models since the last prod
deploy and the prod DB needs to be brought into sync once.

```bash
# From your local machine, with prod DATABASE_URL set in your shell
npx prisma db push
```

Adds the following to your prod DB:

- `User.stripeCustomerId`, `User.stripeStatus`, `User.stripePaidAt`
- `WaitlistEntry` table
- `PasswordResetToken` table

Without this, the app will hit Prisma errors on first prod load
("Unknown field stripeStatus", etc.).

⚠ Important: `prisma db push` is irreversible for column drops. The
above are all additive (new columns, new tables) so it's safe. If
you ever change column types in future schema edits, switch to
`prisma migrate` for proper migration history.

---

## 2. Stripe — REQUIRED to take payment

### 2a. Switch to LIVE keys when going live

Currently your `.env.local` has TEST keys (`sk_test_…`, `pk_test_…`).
For production:

- Stripe Dashboard → Developers → API keys → toggle "View live keys"
- Copy the secret key (`sk_live_…`) and publishable key (`pk_live_…`)
- Set in Vercel → Project Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_live_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_…
```

### 2b. Create the production webhook endpoint

- Stripe Dashboard → Developers → Webhooks → "Add endpoint"
- Endpoint URL: `https://www.algorithmx.co.uk/api/stripe/webhook`
- Subscribe to events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
- Save → reveal "Signing secret" → copy (`whsec_…`)
- Set in Vercel:

```
STRIPE_WEBHOOK_SECRET=whsec_…
```

### 2c. Test on Stripe's test cards before going live

Even with live keys set, you can use test cards in test mode first.
Recommended: do one full purchase round-trip in test mode, confirm
the user's `stripeStatus` flips to `active` in your prod DB, then
flip to live keys.

---

## 3. Email (Resend) — REQUIRED for password resets

Without this, anyone who forgets their password is permanently
locked out and has to email you for support.

### 3a. Sign up + verify sending domain

- https://resend.com → create account
- Domains → Add Domain → `algorithmx.co.uk`
- Add the DNS records (SPF / DKIM) Resend gives you to your domain
  registrar. Wait for verification (typically <30 min).

### 3b. Create API key + set Vercel env

- Resend Dashboard → API Keys → Create new key
- Set in Vercel:

```
RESEND_API_KEY=re_…
RESEND_FROM=AlgorithmX <hello@algorithmx.co.uk>
```

`RESEND_FROM` must match the verified domain in 3a.

### 3c. Test the flow

Once deployed:

1. Visit `/forgot-password`
2. Enter the email of an account in your prod DB
3. Check that inbox — should arrive within 30 seconds
4. Click the link → reset password → log in with new password

If no email arrives, check Resend Dashboard → Logs.

---

## 4. Sentry — Strongly recommended

Without Sentry you launch blind. A kid hits an uncaught error in
the lesson player and you never know.

### 4a. Sign up + create project

- https://sentry.io → create org if new
- Create project → platform: "Next.js"
- Copy the DSN

### 4b. Set Vercel env

```
NEXT_PUBLIC_SENTRY_DSN=https://…@…ingest.sentry.io/…
SENTRY_DSN=https://…@…ingest.sentry.io/…
```

(Both are set to the same value. The `NEXT_PUBLIC_` one is exposed
to the browser bundle for client-side errors; the unprefixed one is
used by server-side code.)

### 4c. Optional — source-map upload

For readable stack traces in Sentry (vs minified gibberish):

- Sentry → User Settings → Auth Tokens → create token with
  `project:releases` scope
- Set in Vercel:

```
SENTRY_AUTH_TOKEN=…
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

Without these, the SDK still reports errors — you just see minified
stack traces. Add later if Sentry becomes critical for debugging.

---

## 5. Plausible Analytics — Strongly recommended

Without analytics you can't tell if signups / lessons / payments
are actually happening.

### 5a. Sign up + add site

- https://plausible.io → 30-day free trial, $9/mo after
- Add site → enter `algorithmx.co.uk`

### 5b. Set Vercel env

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=algorithmx.co.uk
```

That's it. No banner needed (no cookies, no PII = COPPA-compliant
out of the box for a kids' site).

---

## 6. Vercel deploy hooks

Once all the above env vars are set, redeploy from Vercel:

- Vercel Dashboard → Deployments → "..." on the latest → Redeploy

(Setting env vars doesn't auto-redeploy — you have to trigger it.)

---

## 7. Post-deploy smoke test

Run this checklist on production after the first deploy:

- [ ] Visit `https://www.algorithmx.co.uk` — landing page loads, no
      errors in browser console
- [ ] Visit `/cyberheroes` — landing loads, video plays, "Enrol Now"
      button is visible
- [ ] Click "Enrol Now" — redirects to /signup or stripe checkout
- [ ] Sign up with a test email
- [ ] Check Sentry for any errors during signup
- [ ] Verify the Plausible dashboard shows the page view
- [ ] Sign in
- [ ] Click "Forgot password" from /login
- [ ] Enter your email — check inbox for reset email
- [ ] Reset password, sign in with new one
- [ ] (If you've set Stripe live keys) Try a real-card purchase using
      a test card 4242 4242 4242 4242 in **test mode** first.  Confirm
      `stripeStatus` flips to `active` in your prod DB.  Confirm
      `/lesson` becomes accessible after payment.

---

## What I've already done (for reference)

The code side is complete:

- ✅ Stripe Checkout Session creation (/api/checkout)
- ✅ Stripe webhook handler with signature verification (/api/stripe/webhook)
- ✅ User schema with stripe fields
- ✅ /lesson paywall gate (with DEV_BYPASS_PAYWALL escape hatch for local)
- ✅ Resend SDK integration with dev fallback (logs to console without API key)
- ✅ /api/forgot-password + /api/reset-password routes
- ✅ /reset-password page
- ✅ PasswordResetToken Prisma model with hash-only storage
- ✅ Sentry SDK + instrumentation + next.config wrapper
- ✅ Plausible script in root layout

All of these are env-var-driven — they no-op if the corresponding
env var is unset, so dev runs without keys cost nothing and ship
nothing.
