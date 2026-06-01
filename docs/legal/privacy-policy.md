> **DRAFT — pending legal review.** This is a first draft prepared for review by a UK
> solicitor experienced in children's-data and EdTech law. Do not publish until
> reviewed. It has not been checked against your final operational facts.

# Privacy Policy — Cyber Heroes Academy / AlgorithmX Ltd

**Last updated:** [INSERT: date] · **Version:** Draft 0.1

## 1. Who we are

AlgorithmX Ltd ("AlgorithmX", "we", "us", "our") operates the cybersecurity-education
platform at algorithmx.co.uk, including the "Cyber Heroes Academy" course. We are the
**data controller** for the personal data described in this policy.

- **Registered company:** AlgorithmX Ltd, registered in England and Wales, company
  number [INSERT: company number].
- **Registered office:** [INSERT: registered office address].
- **ICO registration number:** [INSERT: ICO registration number — see checklist; you
  very likely must register and pay the data protection fee].
- **Contact for data-protection questions and requests:** [INSERT: data-protection
  contact name/role and email, e.g. privacy@algorithmx.co.uk].
- **Data Protection Officer:** [INSERT or state "We have assessed that a statutory DPO
  is not required; our data-protection contact is above." — see the DPO decision].

This policy is written to comply with the **UK GDPR**, the **Data Protection Act 2018**,
and the ICO's **Age Appropriate Design Code (the "Children's Code")**, because we
knowingly process the personal data of children.

## 2. Our approach to children's data (Children's Code)

Cyber Heroes Academy is designed for children (currently aged 6–9). Because of this we
apply the Children's Code standards, which means in practice:

- **The best interests of the child come first** when we design features and decide how
  to use data.
- **We collect the minimum data needed** to run the course and show a child their
  progress.
- **We do not profile children for advertising, and we do not sell or share children's
  data** for marketing.
- **We do not use data to nudge or pressure children** into spending more time on the
  platform or sharing more information.
- **Privacy settings default to the most protective option.**
- **A parent or guardian sets up and controls the account.** Children do not create
  their own accounts.

We maintain (or will maintain before launch) a **Data Protection Impact Assessment
(DPIA)** covering our processing of children's data — this is effectively required for a
service like ours.

## 3. What personal data we collect

**Parent / account holder**
- Email address
- Password (stored only as a secure bcrypt hash — we never store your plain password)
- Account role and sign-in metadata (e.g. when the account was created, email-
  verification status). Your signed-in session is held in a secure cookie rather than a
  stored server record.
- If you sign in with a third-party provider in future (e.g. Google): the identifiers
  that provider returns to us [TO CONFIRM: only relevant once OAuth sign-in is enabled —
  it is scaffolded in our system but not yet live]
- Password-reset tokens (stored hashed) when you request a reset
- Optional accessibility/comfort preferences you set (e.g. reduced motion, narration
  on/off)
- If you join a wait-list for an upcoming course: your email address

**Child (entered by the parent when a course is started)**
- Child's first name
- Child's date of birth (we use this to determine the child's age; we store the date of
  birth as the source of truth)
- Child's favourite colour (used to personalise the experience)
- Learning progress data: which week and screen the child has reached, stars earned, and
  lesson-completion status

**Payments** — [TO CONFIRM WHEN STRIPE LIVE] When paid checkout goes live, payments will
be handled by Stripe. We expect to receive limited transaction confirmation data (e.g.
that a payment succeeded, the amount, and a Stripe reference). **We do not intend to
store full card numbers** — card details are handled by Stripe as a separate
controller/processor. Confirm this against the final Stripe integration.

**Analytics** — We use **Plausible Analytics**, a privacy-focused, **cookieless**
analytics tool, to understand how the course is used (for example, how many people start
a lesson or complete a week). Plausible is configured to receive only non-identifying
gameplay metadata such as week number, screen number and screen type. **We do not send
Plausible any child name, date of birth, email address, answers a child gives, or other
information that identifies a person.** [TO CONFIRM: that the Plausible domain/env is
actually enabled in production; if you never enable it, remove this section.]

## 4. Why we use it, and our lawful basis

| Data | Purpose | Lawful basis (UK GDPR Art. 6) |
|---|---|---|
| Parent email & password | Create and secure the account; sign in; account recovery | **Contract** (Art. 6(1)(b)) |
| Child name, DOB, favourite colour, progress | Deliver and personalise the course; save and show progress | **Contract** (Art. 6(1)(b)) |
| Wait-list email | Tell you when an upcoming course launches | **Consent** (Art. 6(1)(a)) — withdraw any time |
| Analytics (Plausible) | Understand and improve the platform | [DECISION REQUIRED — see §6: **legitimate interests** (Art. 6(1)(f)) + assessment, or consent] |
| Security & fraud prevention | Protect accounts and the platform | **Legitimate interests** (Art. 6(1)(f)) |
| Legal obligations (e.g. tax records once payments are live) | Comply with the law | **Legal obligation** (Art. 6(1)(c)) |

We do **not** intentionally collect special category data (e.g. health, ethnicity).
Please do not enter such information into free-text fields.

## 5. How parental responsibility and a child's own rights work

Because the course is for young children, **a parent or guardian creates and controls
the account and enters the child's details.** The parent is responsible for the
information they provide about their child and for supervising the child's use of the
platform.

Our primary lawful basis for delivering the course is **contract**, not consent — so the
UK GDPR "age of consent" rule (which applies when an online service relies on a child's
*consent*) does not gate the core service. However, you must still decide on the **age
threshold** for any feature that *does* rely on consent (e.g. analytics, or future
tracks for teenagers):

> **[DECISION REQUIRED — age of consent for information society services]**
> Under the Data Protection Act 2018 the UK has set the age at which a child can give
> their **own** consent to an online service at **13** (the UK GDPR baseline is 16; the
> UK lowered it to 13). For your current 6–9 product everyone is under 13, so **parental
> consent/authority always applies** and this is moot. It becomes a live decision for
> the planned **10–18+** tracks: decide whether 13–15-year-olds (or 16–18) can consent
> for themselves to consent-based processing, or whether you require parental
> involvement for under-16s as policy. **Do not treat 13 as automatically settled for
> older tracks.**

## 6. Analytics — the decision you need to make

> **[DECISION REQUIRED — analytics lawful basis & PECR]**
> Plausible is cookieless and does not store or read information on the user's device in
> the way ordinary cookies do, and it does not receive personal data from us by design.
> On the prevailing view this means **no PECR consent banner is required.** However:
> - You must choose a **lawful basis** for the analytics processing itself (most
>   operators use **legitimate interests** with a documented assessment; some choose
>   consent to be conservative, especially with children involved).
> - The ICO has **not definitively ruled** that cookieless analytics escapes PECR in
>   every case. Because this is a children's service, your solicitor should confirm
>   whether you can rely on legitimate interests / the strictly-necessary view, or
>   should obtain consent anyway.
> See the **Cookie Policy** for the cookie position (you currently set only strictly-
> necessary cookies).

## 7. Who we share data with (processors)

We do not sell personal data and we do not use third-party advertising networks. We
share data only with service providers ("processors") who help us run the platform under
contract:

- **Hosting / application:** Vercel [TO CONFIRM: hosting region; Vercel is a US company —
  see transfers below].
- **Database:** Neon (PostgreSQL), hosted in [INSERT/CONFIRM: EU/UK region].
- **Analytics:** Plausible Analytics [CONFIRM: Plausible Cloud is EU-hosted; if you self-
  host, state where].
- **Payments:** Stripe [TO CONFIRM WHEN STRIPE LIVE].
- **Email delivery:** [INSERT: email provider used for verification / password-reset /
  wait-list emails].

[INSERT: confirm the full, final list of processors before publishing.]

## 8. International transfers

We aim to keep personal data within the **UK and/or European Economic Area (EEA)**. The
UK recognises the EEA as providing adequate protection, so EEA hosting is permitted.

- Our database (Neon) is hosted in [INSERT/CONFIRM: UK/EU region].
- Plausible analytics is [CONFIRM: EU-hosted].
- Some providers (e.g. **Vercel**, and **Stripe** once live) are US-headquartered and
  may process or route data outside the UK/EEA. Where that happens, we rely on
  appropriate safeguards such as the **UK International Data Transfer Agreement (IDTA)**
  or the UK Addendum to the EU Standard Contractual Clauses, and/or a relevant adequacy
  mechanism. [TO CONFIRM: which mechanism applies to each US-based provider.]

## 9. How long we keep data (retention)

[INSERT: retention periods — do not publish placeholders. Structure to set with your
solicitor:]
- **Account & child profile data:** kept while the account is active. Because you sell
  *lifetime access*, set a clear policy for dormant accounts — [INSERT: e.g. "we may
  delete inactive accounts after X years of inactivity, after contacting you"].
- **Progress data:** [INSERT].
- **Wait-list emails:** [INSERT: deleted after the course launches or after X months].
- **Password-reset tokens:** short-lived, expire/delete automatically.
- **Payment / financial records:** [TO CONFIRM WHEN STRIPE LIVE — UK tax law generally
  requires keeping financial records for 6 years].
- **Analytics:** aggregate, non-identifying.

Data-minimisation and storage-limitation are Children's Code obligations, so these
periods must be real and justified.

## 10. Your rights and your child's rights

You can ask us to:
- **Access** the personal data we hold about you and your child;
- **Correct** inaccurate data (e.g. fix a name or date of birth);
- **Delete** your account and your child's data ("right to erasure");
- **Restrict or object** to certain processing;
- **Port** your data to another service where applicable;
- **Withdraw consent** where we relied on consent (e.g. wait-list emails).

A parent/guardian exercises these rights on behalf of their child. To make a request,
contact **[INSERT: data-protection contact email]**. We will respond within **one
month** as required by law. We may need to verify your identity (and your relationship to
the child account) before acting, to protect the child's data.

You also have the right to complain to the **Information Commissioner's Office (ICO)** —
ico.org.uk — though we'd appreciate the chance to resolve concerns first.

## 11. How we protect data

- Passwords are stored as bcrypt hashes; password-reset tokens are stored hashed.
- Access to personal data is restricted to those who need it to run the service.
- Data is hosted with reputable providers using encryption in transit.
- [INSERT: any additional measures — encryption at rest, access logging, backup policy,
  breach-response process. State your breach-notification commitment: serious breaches
  reported to the ICO within 72 hours where required.]

## 12. Changes to this policy

We may update this policy. If we make material changes affecting how we use children's
data, we will [INSERT: notify parents by email / on sign-in].

## 13. Contact

[INSERT: AlgorithmX Ltd, registered office, data-protection contact email.]
