import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function getFromAddress(): string {
  // IMPORTANT:
  // - You cannot reliably send "from" a vercel.app domain (you don't own it / can't verify it).
  // - Prefer setting RESEND_FROM to an address on a verified domain in Resend.
  // - Fallback uses Resend's dev sender.
  return (
    process.env.RESEND_FROM?.trim() ||
    "OHYO Orders <onboarding@resend.dev>"
  );
}

interface OrderItem {
  flavor: string;
  quantity: number;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildOrderEmailHtml(
  clientName: string,
  items: OrderItem[],
  location?: string,
): string {
  const safeClientName = escapeHtml(clientName);
  const safeLocation = location ? escapeHtml(location) : "";

  const itemsRowsHtml = items
    .map((i) => {
      const flavor = escapeHtml(i.flavor);
      const qty = Number(i.quantity) || 0;

      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="font-weight: 700; color: #222;">${flavor}</span>
          </td>
          <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; white-space: nowrap;">
            <span style="font-weight: 800; color: #ee798d;">${qty}</span>
            <span style="color: #666;"> buc.</span>
          </td>
        </tr>
      `.trim();
    })
    .join("");

  const preheader = `Comandă nouă de la ${safeClientName}`;

  const locationBlock = safeLocation
    ? `
      <tr>
        <td style="padding-top: 14px;">
          <div style="display: inline-block; background: #fff1f4; border: 1px solid #ffd7df; color: #7b2e41; border-radius: 999px; padding: 8px 12px; font-weight: 700;">
            📍 ${safeLocation}
          </div>
        </td>
      </tr>
    `.trim()
    : "";

  return `<!DOCTYPE html>
<html lang="ro">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <title>Comandă nouă</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f6f6f6;">
    <!-- Preheader -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background:#ffffff; border-radius: 22px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
            <!-- Top bar -->
            <tr>
              <td style="padding: 18px 22px; background: linear-gradient(90deg, #ee798d 0%, #f9c66d 100%);">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #fff; font-weight: 900; letter-spacing: 0.5px; font-size: 14px; text-transform: uppercase;">
                  OHYO × MOTI
                </div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 22px;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                  <div style="font-size: 22px; font-weight: 900; color: #222; margin: 0 0 6px;">
                    Comandă nouă primită
                  </div>
                  <div style="font-size: 14px; color: #666; margin: 0 0 16px;">
                    Detalii comandă pentru manager.
                  </div>

                  <div style="background:#fafafa; border: 1px solid #f0f0f0; border-radius: 16px; padding: 14px 16px; margin-bottom: 14px;">
                    <div style="font-size: 12px; color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;">
                      Client
                    </div>
                    <div style="font-size: 16px; color: #222; font-weight: 900; margin-top: 4px;">
                      ${safeClientName}
                    </div>
                  </div>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="font-size: 12px; color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; padding: 6px 0 8px;">
                        Produse
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                          ${itemsRowsHtml}
                        </table>
                      </td>
                    </tr>
                    ${locationBlock}
                  </table>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 16px 22px; background:#ffffff; border-top: 1px solid #f2f2f2;">
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; color:#999;">
                  OHYO Distribution · notificare automată
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendOrderNotificationToManager(
  clientName: string,
  items: OrderItem[],
  location?: string,
) {
  const managerEmail = process.env.MANAGER_EMAIL ?? "";
  if (!managerEmail) {
    console.warn("MANAGER_EMAIL not set, skipping email");
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return;
  }

  const html = buildOrderEmailHtml(clientName, items, location);

  const result = await getResend().emails.send({
    from: getFromAddress(),
    to: [managerEmail],
    subject: `Comandă nouă de la ${clientName}`,
    html,
  });

  // Resend returns { data, error } (not always thrown)
  // Make failures visible in Vercel logs.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (result as any)?.error;
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);

  return result;
}

export async function sendOrderConfirmationToClient(
  clientEmail: string,
  clientName: string,
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return;
  }

  const safeClientName = escapeHtml(clientName);

  const result = await getResend().emails.send({
    from: getFromAddress(),
    to: [clientEmail],
    subject: "Comanda dumneavoastră a fost primită",
    html: `
      <!DOCTYPE html>
      <html lang="ro">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="color-scheme" content="light only" />
          <title>Confirmare comandă</title>
        </head>
        <body style="margin: 0; padding: 0; background: #f6f6f6;">
          <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
            Comanda a fost primită. Vă contactăm în curând.
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6; padding: 24px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background:#ffffff; border-radius: 22px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
                  <tr>
                    <td style="padding: 18px 22px; background: linear-gradient(90deg, #91c57e 0%, #ee798d 100%);">
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #fff; font-weight: 900; letter-spacing: 0.5px; font-size: 14px; text-transform: uppercase;">
                        OHYO × MOTI
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 22px;">
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                        <div style="font-size: 22px; font-weight: 900; color: #222; margin: 0 0 8px;">
                          Mulțumim, ${safeClientName}!
                        </div>
                        <div style="font-size: 14px; color: #666; margin: 0 0 14px;">
                          Comanda dumneavoastră a fost primită și se află în procesare.
                        </div>
                        <div style="background:#fafafa; border: 1px solid #f0f0f0; border-radius: 16px; padding: 14px 16px;">
                          <div style="font-size: 14px; color: #333; margin: 0;">
                            Echipa OHYO vă va contacta în curând pentru confirmare.
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 16px 22px; background:#ffffff; border-top: 1px solid #f2f2f2;">
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; color:#999;">
                        OHYO Distribution
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (result as any)?.error;
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);

  return result;
}
