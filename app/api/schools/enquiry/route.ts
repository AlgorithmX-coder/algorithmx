import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/resend";
import { prisma } from "@/app/lib/prisma";
import { opsAlert } from "@/app/lib/opsAlert";
import { PHASE_LABELS, roleLabel, sizeLabel } from "@/app/lib/schoolEnquiries";

/**
 * POST /api/schools/enquiry - the /schools contact form.
 *
 * WRITTEN DOWN FIRST, THEN EMAILED. This used to do exactly one thing with
 * an enquiry: send it to the schools inbox, with a console.log as the only
 * backup. If Resend was down, or the mailbox had moved, or somebody deleted
 * the message, the lead was gone and nothing anywhere knew it had arrived.
 * For the one form on the site whose whole job is to produce customers,
 * that was the wrong order of operations.
 *
 * The row is now saved before the email is attempted, and a failed email no
 * longer fails the request: the enquiry IS safe, and telling a head teacher
 * to go and email support instead, when we already hold everything they
 * typed, would be a lie that costs a sale. Ops is told instead, and the row
 * is flagged `emailed: false` so staff can find exactly the ones nobody was
 * notified about.
 *
 * If the SAVE itself fails, the old behaviour stands: try the email anyway,
 * and only refuse if both fail. Two independent ways to keep a lead is the
 * point of the change.
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* The labels moved to app/lib/schoolEnquiries.ts when the staff console
   started reading these rows too. Two readers of the same stored key have
   to turn it into the same words, or a staff member sees "slt" where the
   email they were sent said "Deputy head". */
const PHASES = PHASE_LABELS;
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const b = (raw ?? {}) as Record<string, unknown>;
  const str = (k: string, max = 200) =>
    typeof b[k] === "string" ? (b[k] as string).trim().slice(0, max) : "";

  // Honeypot: real users never see this field. Pretend success to bots.
  if (str("website")) return NextResponse.json({ ok: true });

  const name = str("name");
  const email = str("email");
  const school = str("school");
  const role = str("role");
  const phase = str("phase");
  const size = str("size");
  const message = str("message", 2000);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (school.length < 2) {
    return NextResponse.json({ error: "Please tell us the name of your school." }, { status: 400 });
  }
  if (!(phase in PHASES)) {
    return NextResponse.json({ error: "Please choose primary, secondary or both." }, { status: 400 });
  }
  const record = {
    name,
    email,
    school,
    role: roleLabel(role),
    phase: PHASES[phase],
    size: sizeLabel(size),
    message,
    at: new Date().toISOString(),
  };
  // Still logged. It costs nothing and it is the one record that survives
  // the database being the thing that is broken.
  console.log("[schools-enquiry]", JSON.stringify(record));

  /* THE LEAD IS SAVED BEFORE ANYTHING IS SENT. The raw form keys go in, not
     the prettified labels: the labels are presentation and can change, the
     keys are what was chosen. */
  let savedId: string | null = null;
  try {
    const saved = await prisma.schoolEnquiry.create({
      data: {
        name,
        email,
        school,
        role: role || null,
        phase,
        size: size || null,
        message: message || null,
      },
      select: { id: true },
    });
    savedId = saved.id;
  } catch (err) {
    /* Not fatal. The email below is now the only copy, which is exactly the
       situation this change exists to end, so it is worth waking somebody
       for even though the enquirer will see success. */
    console.error("[schools-enquiry] save failed", err);
    await opsAlert({
      what: "School enquiry could not be saved",
      detail: { school, email, name },
      error: err,
    });
  }

  const to = process.env.SCHOOLS_ENQUIRY_TO ?? "support@algorithmx.co.uk";
  const subject = `School enquiry: ${school} (${record.phase})`;
  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Email", email],
    ["School", school],
    ["Role", record.role],
    ["Phase", record.phase],
    ["Size", record.size],
    ["Message", message || "(none)"],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#04050d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e8edff;">
  <div style="max-width:560px;margin:0 auto;background:#0f1530;border:1px solid rgba(125,240,255,0.32);border-radius:16px;padding:24px;">
    <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#7df0ff;font-weight:800;margin-bottom:12px;">School enquiry</div>
    <h1 style="margin:0 0 16px;font-size:20px;">${esc(school)}</h1>
    <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.5;">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#8fa0c8;vertical-align:top;white-space:nowrap;">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap;">${esc(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="margin:18px 0 0;font-size:12px;color:#8fa0c8;">Reply to this email to answer ${esc(name)} directly.</p>
  </div></body></html>`;

  try {
    await sendEmail({ to, subject, html, text, replyTo: email });
    if (savedId) {
      /* Best effort. The enquiry is already safe, so failing to record that
         we emailed it must not turn into a failed enquiry. */
      await prisma.schoolEnquiry
        .update({ where: { id: savedId }, data: { emailed: true } })
        .catch((err: unknown) => console.error("[schools-enquiry] emailed flag failed", err));
    }
  } catch (err) {
    console.error("[schools-enquiry] email failed", err);
    if (!savedId) {
      /* Both ways of keeping it failed, so this is the only honest answer:
         we really have lost it, and the enquirer needs to do something. */
      return NextResponse.json(
        { error: "We couldn't send your enquiry just now. Please email support@algorithmx.co.uk and we'll pick it up." },
        { status: 502 },
      );
    }
    /* Saved but not sent. The lead is safe and the head teacher is told the
       truth, which is that we have it. Ops is told the part they need: that
       nobody got the email, and the enquiry is sitting in /admin waiting. */
    await opsAlert({
      what: "School enquiry saved but the email failed",
      detail: { school, email, name, enquiry: savedId, inbox: to },
      error: err,
    });
  }

  return NextResponse.json({ ok: true });
}
