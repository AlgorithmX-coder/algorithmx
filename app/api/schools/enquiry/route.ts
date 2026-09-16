import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/resend";

/**
 * POST /api/schools/enquiry - the /schools contact form.
 *
 * Validates the form, logs a one-line record (so a lost email is still
 * recoverable from the server logs) and emails the enquiry to the schools
 * inbox with reply-to set to the enquirer. No database table yet: the
 * schools data model (schools, classes, pupils) lands with the pilot build,
 * and enquiries can move there then.
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES: Record<string, string> = {
  head: "Headteacher or principal",
  slt: "Deputy head or SLT",
  computing: "Computing or online-safety lead",
  teacher: "Class teacher",
  it: "IT or network manager",
  other: "Other",
};
const PHASES: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  both: "Primary and secondary",
};
const SIZES: Record<string, string> = {
  "u100": "Under 100 pupils",
  "100-300": "100 to 300 pupils",
  "300-600": "300 to 600 pupils",
  "600+": "600+ pupils",
};
const WANTS: Record<string, string> = {
  pilot: "A free half-term pilot",
  demo: "A demo",
  onboarding: "To find out about the onboarding process",
};

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
  const want = str("want");
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
  if (!(want in WANTS)) {
    return NextResponse.json({ error: "Please tell us what you would like." }, { status: 400 });
  }

  const record = {
    name,
    email,
    school,
    role: ROLES[role] ?? "Not given",
    phase: PHASES[phase],
    size: SIZES[size] ?? "Not given",
    want: WANTS[want],
    message,
    at: new Date().toISOString(),
  };
  // Backup record in the server logs; the email is the primary channel.
  console.log("[schools-enquiry]", JSON.stringify(record));

  const to = process.env.SCHOOLS_ENQUIRY_TO ?? "support@algorithmx.co.uk";
  const subject = `School enquiry: ${school} (${record.phase}, ${record.want.toLowerCase()})`;
  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Email", email],
    ["School", school],
    ["Role", record.role],
    ["Phase", record.phase],
    ["Size", record.size],
    ["Wants", record.want],
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
  } catch (err) {
    console.error("[schools-enquiry] email failed", err);
    return NextResponse.json(
      { error: "We couldn't send your enquiry just now. Please email support@algorithmx.co.uk and we'll pick it up." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
