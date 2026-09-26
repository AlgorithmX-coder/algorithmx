import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/resend";

/**
 * POST /api/corporate/enquiry - the /corporate contact form.
 *
 * Same contract as the schools enquiry: validate, log a one-line record so a
 * lost email is still recoverable from the server logs, and email the
 * enquiry with reply-to set to the enquirer. No database table yet: the
 * organisation and seat data model lands with the AI Cleared build, and
 * enquiries can move there then.
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES: Record<string, string> = {
  hr: "HR, people or L&D",
  it: "IT or information security",
  dpo: "DPO, risk or compliance",
  partner: "Partner, director or owner",
  ops: "Operations or office management",
  other: "Other",
};
const SIZES: Record<string, string> = {
  u10: "Under 10 staff",
  "10-49": "10 to 49 staff",
  "50-249": "50 to 249 staff",
  "250-999": "250 to 999 staff",
  "1000+": "1,000+ staff",
};
const TOOLS: Record<string, string> = {
  copilot: "Microsoft 365 Copilot",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
  other: "Other",
  unsure: "Not sure yet",
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
  const company = str("company");
  const role = str("role");
  const size = str("size");
  const message = str("message", 2000);
  const tools = Array.isArray(b.tools)
    ? (b.tools as unknown[]).filter((t): t is string => typeof t === "string" && t in TOOLS).map((t) => TOOLS[t])
    : [];

  if (name.length < 2) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid work email address." }, { status: 400 });
  }
  if (company.length < 2) {
    return NextResponse.json({ error: "Please tell us the name of your firm." }, { status: 400 });
  }
  const record = {
    name,
    email,
    company,
    role: ROLES[role] ?? "Not given",
    size: SIZES[size] ?? "Not given",
    tools: tools.length ? tools.join(", ") : "Not given",
    message,
    at: new Date().toISOString(),
  };
  // Backup record in the server logs; the email is the primary channel.
  console.log("[corporate-enquiry]", JSON.stringify(record));

  const to =
    process.env.CORPORATE_ENQUIRY_TO ?? process.env.SCHOOLS_ENQUIRY_TO ?? "support@algorithmx.co.uk";
  const subject = `AI Cleared enquiry: ${company} (${record.size})`;
  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Email", email],
    ["Firm", company],
    ["Role", record.role],
    ["Headcount", record.size],
    ["AI tools in use", record.tools],
    ["Message", message || "(none)"],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#04050d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e8edff;">
  <div style="max-width:560px;margin:0 auto;background:#0f1530;border:1px solid rgba(125,240,255,0.32);border-radius:16px;padding:24px;">
    <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#7df0ff;font-weight:800;margin-bottom:12px;">AI Cleared enquiry</div>
    <h1 style="margin:0 0 16px;font-size:20px;">${esc(company)}</h1>
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
    console.error("[corporate-enquiry] email failed", err);
    return NextResponse.json(
      { error: "We couldn't send your enquiry just now. Please email admissions@algorithmx.co.uk and we'll pick it up." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
