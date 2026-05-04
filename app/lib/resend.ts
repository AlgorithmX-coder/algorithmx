import { Resend } from "resend";

/**
 * Server-side Resend SDK singleton.
 *
 * Lives outside `app/` route handlers so it's only ever instantiated
 * once per server process.  RESEND_API_KEY is required in any environment
 * that actually sends mail; in dev without the key set we fall back to
 * console-logging the message so the password-reset flow still works
 * end-to-end on localhost.
 */

const globalForResend = globalThis as unknown as { resend: Resend | undefined };

function getResend(): Resend | null {
  if (globalForResend.resend) return globalForResend.resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const client = new Resend(key);
  if (process.env.NODE_ENV !== "production") {
    globalForResend.resend = client;
  }
  return client;
}

/* ─── Configuration ─────────────────────────────────────────────────── */

/** Verified sender — must match a domain you've added + verified in Resend. */
export const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "AlgorithmX <hello@algorithmx.co.uk>";

/* ─── Templated emails ──────────────────────────────────────────────── */

export interface SendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Reply-to override (defaults to FROM_ADDRESS). */
  replyTo?: string;
}

/**
 * Send a transactional email via Resend.
 *
 * In dev without RESEND_API_KEY: logs to console and returns ok-without-id
 * so the calling flow continues. Production callers should treat a null
 * id as a genuine send (it isn't) only in dev — do not rely on it for
 * real receipts.
 */
export async function sendEmail(opts: SendOptions): Promise<{ id: string | null }> {
  const client = getResend();

  if (!client) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is not set — cannot send email in production",
      );
    }
    // Dev fallback so the rest of the flow can be exercised.
    // eslint-disable-next-line no-console
    console.log("\n[resend:dev-fallback] Email would have been sent:");
    // eslint-disable-next-line no-console
    console.log(`  To:      ${opts.to}`);
    // eslint-disable-next-line no-console
    console.log(`  From:    ${FROM_ADDRESS}`);
    // eslint-disable-next-line no-console
    console.log(`  Subject: ${opts.subject}`);
    // eslint-disable-next-line no-console
    console.log(`  HTML:\n${opts.html}\n`);
    return { id: null };
  }

  const { data, error } = await client.emails.send({
    from: FROM_ADDRESS,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  });

  if (error) {
    // Don't leak the API error verbatim to callers — log + rethrow generic.
    // eslint-disable-next-line no-console
    console.error("[resend] send failed", error);
    throw new Error("Email send failed");
  }
  return { id: data?.id ?? null };
}

/* ─── Specific templates ─────────────────────────────────────────────── */

export function passwordResetTemplate(args: {
  resetUrl: string;
  expiryMinutes: number;
}): { subject: string; html: string; text: string } {
  const { resetUrl, expiryMinutes } = args;
  const subject = "Reset your AlgorithmX password";
  const text = [
    "Hi,",
    "",
    "You asked to reset your AlgorithmX password.",
    "",
    `Open this link within ${expiryMinutes} minutes to set a new password:`,
    resetUrl,
    "",
    "If you didn't request this, you can safely ignore this email — your password won't change.",
    "",
    "AlgorithmX",
  ].join("\n");

  // Inline-styled HTML so it renders cleanly in every mail client.  No
  // images, no external CSS.  Cyber palette stays consistent with the
  // rest of the brand.
  const html = `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width">
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#04050d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#04050d;padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#0f1530;border-radius:18px;overflow:hidden;border:1px solid rgba(125,240,255,0.32);">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <div style="font-size:11px;letter-spacing:5px;text-transform:uppercase;color:#7df0ff;font-weight:800;font-family:ui-monospace,'JetBrains Mono',Menlo,monospace;margin-bottom:14px;">
                  &#9674; Password Reset &#9674;
                </div>
                <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.25;color:#e8edff;font-weight:900;letter-spacing:-0.5px;">
                  Reset your password
                </h1>
                <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#c5cdf0;">
                  You asked to reset your AlgorithmX password. Click the button below to choose a new one. This link expires in <strong style="color:#7df0ff;">${expiryMinutes} minutes</strong>.
                </p>
                <p style="margin:0 0 28px 0;text-align:center;">
                  <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#00e5ff,#7c5cff);color:#080a16;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;letter-spacing:1px;text-transform:uppercase;">
                    Reset Password
                  </a>
                </p>
                <p style="margin:0 0 12px 0;font-size:13px;line-height:1.55;color:rgba(197,205,240,0.78);">
                  Or copy this link into your browser:
                </p>
                <p style="margin:0 0 22px 0;font-size:12px;font-family:ui-monospace,'JetBrains Mono',Menlo,monospace;word-break:break-all;color:#7df0ff;background:rgba(0,229,255,0.06);padding:10px 14px;border-radius:10px;border:1px solid rgba(125,240,255,0.18);">
                  ${resetUrl}
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(197,205,240,0.65);">
                  Didn&rsquo;t request this? You can safely ignore this email &mdash; your password won&rsquo;t change.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:rgba(8,10,22,0.6);border-top:1px solid rgba(125,240,255,0.12);">
                <p style="margin:0;font-size:12px;color:rgba(197,205,240,0.55);">
                  AlgorithmX &middot; Cyber Heroes Academy &middot; <a href="https://www.algorithmx.co.uk" style="color:#7df0ff;text-decoration:none;">algorithmx.co.uk</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
