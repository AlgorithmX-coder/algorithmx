import * as Sentry from "@sentry/nextjs";
import { sendEmail } from "@/app/lib/resend";

/* When a paid firm is not set up, an invite or a welcome does not go out,
 * or a certificate email fails, a person hears about it: an email to the
 * ops address and a Sentry event tagged for an alert rule. Never throws;
 * an alert that cannot be sent is logged and the caller carries on. */

export const OPS_ALERT_TO = process.env.OPS_ALERT_TO ?? process.env.CORPORATE_ENQUIRY_TO ?? "admissions@algorithmx.co.uk";

export async function opsAlert(args: { what: string; detail: Record<string, unknown>; error?: unknown }): Promise<void> {
  const message = args.error instanceof Error ? args.error.message : args.error ? String(args.error) : "";
  try {
    Sentry.captureException(args.error instanceof Error ? args.error : new Error(args.what), { tags: { area: "corporate-ops" }, extra: { ...args.detail, what: args.what } });
  } catch (err) {
    console.error("[ops-alert] sentry failed", err instanceof Error ? err.message : err);
  }
  const lines = Object.entries(args.detail).map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
  const text = `${args.what}\n\n${lines.join("\n")}${message ? `\n\nError: ${message}` : ""}\n\nSent by the site; reply to nobody.`;
  const html = `<div style="font-family:ui-monospace,Consolas,monospace;font-size:13px;line-height:1.5;color:#14161d;max-width:640px;margin:0 auto;padding:24px"><p style="font-size:15px;font-weight:600;margin:0 0 12px">${esc(args.what)}</p><pre style="white-space:pre-wrap;margin:0">${esc(lines.join("\n"))}${message ? `\n\nError: ${esc(message)}` : ""}</pre></div>`;
  try {
    await sendEmail({ to: OPS_ALERT_TO, subject: `[AlgorithmX ops] ${args.what}`, html, text });
  } catch (err) {
    console.error("[ops-alert] email failed", err instanceof Error ? err.message : err, "|", args.what, JSON.stringify(args.detail));
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
