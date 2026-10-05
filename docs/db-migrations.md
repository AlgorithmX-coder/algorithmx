# Database migrations + Neon preview branch

This is the post-launch hardening. Two things changed this session:

1. The local + prod database is now under proper migration control.
2. Vercel preview deploys can be wired to a Neon "preview branch" so
   schema changes can be tested without touching the live DB.

## Why this matters

The launch-blocking signup bug we hit on 2026-05-10 happened because
the prod DB schema lagged behind the deployed Prisma Client by three
fields (`stripeCustomerId`, `stripeStatus`, `stripePaidAt`) and two
tables (`PasswordResetToken`, `WaitlistEntry`). Every signup attempt
on prod 500'd because Prisma generated SQL referencing columns that
didn't exist.

With migrations + a preview branch + the smoke-test action, this kind
of drift is caught:

- **migrations**: `npm run build` on Vercel now runs `prisma migrate
  deploy` first, applying any pending migration before the Next build
  starts. Production schema can never be older than the deployed code.
- **preview branch**: PR previews on Vercel point at a non-production
  Neon branch. Schema-changing PRs land on the branch first; merging
  to main applies the same migration to prod via the build step.
- **smoke test**: `.github/workflows/post-deploy-smoke.yml` POSTs to
  `/api/signup` on prod after every push. A schema mismatch would 500
  and the workflow turns red within 5 minutes of the deploy.

---

## ONE-TIME BOOTSTRAP - run these now

The baseline migration at `prisma/migrations/20260510000000_baseline/`
captures the schema as it currently exists on prod. But because prod
already has every table, running `prisma migrate deploy` would try to
re-create them and fail. We need to mark the baseline as already
applied on prod first.

You will need your **prod pooled DATABASE_URL** for these commands -
the same one you just pasted into Vercel. Get it from Neon's Connect
panel (pooled connection).

### Step 1 - Mark baseline as applied on prod

Open a terminal in this repo. Run, with your real URL substituted:

```bash
DATABASE_URL='postgresql://neondb_owner:YOURPASS@ep-square-scene-a910p769-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require' \
  npx prisma migrate resolve --applied "20260510000000_baseline"
```

You should see:
```
Migration 20260510000000_baseline marked as applied.
```

This adds a row to the `_prisma_migrations` table on prod saying
"this migration is done" without actually running its SQL. Future
`prisma migrate deploy` runs will only apply migrations newer than
this baseline.

### Step 2 - Verify

```bash
DATABASE_URL='<same url>' npx prisma migrate status
```

Should print:
```
Database schema is up to date!
```

If it does, you're done with the bootstrap. From now on the workflow is:

```bash
# Make a schema change in prisma/schema.prisma
npx prisma migrate dev --name <short-description>
# e.g. npx prisma migrate dev --name add_user_avatar
```

This:
1. Generates a new migration file under `prisma/migrations/`.
2. Applies it to your local DB.
3. Regenerates the Prisma Client.

Commit the new migration folder. When the PR merges, Vercel runs
`prisma migrate deploy` on every build → the migration applies to
prod automatically.

---

## Setting up the Neon preview branch (optional but recommended)

This lets every Vercel PR preview deploy use a forked copy of the prod
DB so destructive schema changes can't reach prod customers.

### Step 1 - Create the branch on Neon

1. Go to https://console.neon.tech → your `algorithmx` project.
2. Left sidebar → **Branches**.
3. Click **Create branch**.
4. Source: `production` (the default branch). Compute: keep the
   default `.25–2 CU`. Name it `preview`.
5. Confirm. Neon clones the data structure (copy-on-write, fast).

### Step 2 - Get the preview branch's pooled URL

1. On the Branches list, click `preview`.
2. There's a **Connection string** widget on the branch overview.
3. Toggle **Connection pooling** ON.
4. **Reset password** for the preview branch's role (don't reuse the
   prod password).
5. Click **Show password** → **Copy snippet**.

### Step 3 - Add it to Vercel as a Preview-only env var

1. Vercel → your project → **Settings** → **Environment Variables**.
2. Click **Add Environment Variable**.
3. Key: `DATABASE_URL`.
4. Value: paste the **preview branch** URL.
5. Environment dropdown: tick **Preview** only (NOT Production, NOT
   Development).
6. Tick **Sensitive**.
7. Save.

You will now have THREE `DATABASE_URL` rows on Vercel:
- Production: prod pooled URL
- Preview: preview-branch pooled URL
- Development: the localhost placeholder

Vercel routes each environment to the right one automatically.

### Step 4 - Test it

Open a PR with a no-op change. Vercel deploys a preview. The deploy
URL hits the preview Neon branch instead of prod. Verify by signing
up a test user - it should appear in the preview branch's `User`
table on Neon, not prod.

---

## Running migrations against preview

Vercel preview deploys run `npm run build` which now includes
`prisma migrate deploy`. With the preview branch URL set as
`DATABASE_URL` for Preview environment, **every migration in a PR
is applied to the preview branch automatically when the preview
deploys**. By the time the PR merges to main and prod deploys, the
migration has already been validated against a copy of prod data.

---

## Smoke-test workflow

`.github/workflows/post-deploy-smoke.yml` runs on every push to
`main`. It waits 4 minutes for Vercel to deploy, then POSTs to
`/api/signup` on prod. If the response is 5xx the workflow fails with
a red X on the commit and the GitHub Actions tab shows the error.

You can override the prod URL it pings via repo settings → Secrets
and variables → Actions → Variables → `PROD_URL`.

**It writes nothing.** The POST uses one fixed sentinel address,
`ci-smoke-sentinel@algorithmx-ci.invalid`, which already exists in
prod. `/api/signup` validates the payload, then calls
`prisma.user.findUnique`, then answers 400 "Email already in use" -
so the database round-trip is exercised on every deploy without
creating a row. A pass is that exact 400, or a 201 if the sentinel
has been purged (it is then recreated - one row, self-healing).
Any other 400 fails the build, because those are returned *before*
the database is touched and so prove nothing.

> **History.** Until 2026-10-04 this workflow sent a unique
> `ci-smoke-{timestamp}-{run_id}@...` address per run and relied on a
> cleanup endpoint that was never built. It left one permanent user per
> deploy: 450 of the 468 rows in the prod `User` table. Do not
> reintroduce a per-run email here.

To clear out the historical rows (the sentinel is deliberately
excluded):

```bash
DATABASE_URL='<prod-direct-url>' npx prisma db execute --stdin <<'SQL'
DELETE FROM "User"
WHERE email LIKE 'ci-smoke-%@algorithmx-ci.invalid'
  AND email <> 'ci-smoke-sentinel@algorithmx-ci.invalid';
SQL
```
