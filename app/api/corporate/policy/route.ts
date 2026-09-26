import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/resend";
import { APPROVED, BANNED, SECTORS, buildPolicy, policyToHtml, policyToText, type PolicyProfile, type SectorId } from "@/app/corporate/policyText";

/**
 * POST /api/corporate/policy - the free AI use policy.
 *
 * Builds the policy from the profile answers with the same function the page
 * uses, emails it to the requester, and emails the profile to the enquiry
 * inbox as a lead. A backup record goes to the server logs. Honeypot as on
 * the enquiry routes.
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const ids = (k: string, allowed: ReadonlyArray<readonly [string, string]>) =>
    Array.isArray(b[k]) ? (b[k] as unknown[]).filter((x): x is string => typeof x === "string" && allowed.some(([v]) => v === x)) : [];

  if (str("website")) return NextResponse.json({ ok: true });

  const name = str("name");
  const email = str("email");
  const sectorRaw = str("sector");
  const sector = (SECTORS.some(([v]) => v === sectorRaw) ? sectorRaw : "other") as SectorId;
  const profile: PolicyProfile = {
    firm: str("firm", 120),
    sector,
    approved: ids("approved", APPROVED),
    banned: ids("banned", BANNED),
    contactName: str("contactName", 120),
    contactRole: str("contactRole", 120),
  };

  if (profile.firm.length < 2) {
    return NextResponse.json({ error: "Please tell us the name of your firm, so the policy can carry it." }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid work email address." }, { status: 400 });
  }

  const policy = buildPolicy(profile);
  const text = policyToText(policy);
  console.log("[corporate-policy]", JSON.stringify({ name, email, ...profile, at: new Date().toISOString() }));

  const policyHtml = policyToHtml(policy, {
    footer: `A starting point for your own review, written from the answers ${name} gave at algorithmx.io/corporate. The training that goes with it is AI Cleared by AlgorithmX. Reply to this email and a real person will pick it up.`,
  });

  const to = process.env.CORPORATE_ENQUIRY_TO ?? process.env.SCHOOLS_ENQUIRY_TO ?? "support@algorithmx.co.uk";
  const leadRows: Array<[string, string]> = [
    ["Name", name],
    ["Email", email],
    ["Firm", profile.firm],
    ["Sector", SECTORS.find(([v]) => v === sector)?.[1] ?? sector],
    ["Approved", profile.approved.map((id) => APPROVED.find(([v]) => v === id)?.[1] ?? id).join(", ") || "(none)"],
    ["Not allowed", profile.banned.map((id) => BANNED.find(([v]) => v === id)?.[1] ?? id).join(", ") || "(none)"],
    ["Contact", [profile.contactName, profile.contactRole].filter(Boolean).join(", ") || "(none)"],
  ];
  const leadHtml = `<!doctype html><html><body style="margin:0;padding:24px;background:#04050d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e8edff;">
  <div style="max-width:560px;margin:0 auto;background:#0f1530;border:1px solid rgba(125,240,255,0.32);border-radius:16px;padding:24px;">
    <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#7df0ff;font-weight:800;margin-bottom:12px;">AI policy generated</div>
    <h1 style="margin:0 0 16px;font-size:20px;">${esc(profile.firm)}</h1>
    <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.5;">
      ${leadRows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#8fa0c8;vertical-align:top;white-space:nowrap;">${esc(k)}</td><td style="padding:6px 0;">${esc(v)}</td></tr>`).join("")}
    </table>
    <p style="margin:18px 0 0;font-size:12px;color:#8fa0c8;">They have the policy. Reply to this email to follow up about AI Cleared for the firm.</p>
  </div></body></html>`;

  try {
    await sendEmail({ to: email, subject: policy.title, html: policyHtml, text, replyTo: to });
    await sendEmail({ to, subject: `AI policy generated: ${profile.firm}`, html: leadHtml, text: leadRows.map(([k, v]) => `${k}: ${v}`).join("\n"), replyTo: email });
  } catch (err) {
    console.error("[corporate-policy] email failed", err);
    return NextResponse.json(
      { error: "We couldn't send the policy just now. Use Copy text to keep it, and email support@algorithmx.co.uk if you would like a copy." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
