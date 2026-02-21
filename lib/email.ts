import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

interface OrderItem {
  flavor: string;
  quantity: number;
}

function buildOrderEmailHtml(
  clientName: string,
  items: OrderItem[],
  location?: string,
): string {
  const itemsHtml = items
    .map((i) => `<li><strong>${i.flavor}</strong> – ${i.quantity} buc.</li>`)
    .join("");

  const locationHtml = location
    ? `<p><strong>Locație de ridicare:</strong><br/>📍${location}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { font-family: "Helvetica Neue", sans-serif; background-color: #fff6f7; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; width: 100%; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { padding: 20px; text-align: center; background: white; }
    .header img { background: white; padding: 10px 20px 0; border-radius: 12px; max-width: 80%; height: auto; max-height: 80px; }
    .content { padding: 20px 30px; }
    .content h2 { color: rgb(226, 133, 152); margin: 5px 0 15px; font-size: 20px; }
    .item-list { margin-top: 10px; padding-left: 20px; }
    .footer { padding: 15px 20px; font-size: 13px; color: #888; text-align: center; }
    @media only screen and (max-width: 480px) {
      .content { padding: 15px 20px; }
      .content h2 { font-size: 18px; }
      .item-list { padding-left: 15px; }
      .header img { height: auto; padding: 10px 20px 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://ohyo-form.vercel.app/mochi-logo.avif" alt="OHYO x MOTI Logo"/>
    </div>
    <div class="content">
      <h2>Comandă nouă primită!</h2>
      <p>Ați primit o nouă comandă de mochi.<br/>Detaliile comenzii sunt următoarele:</p>
      <p><strong>Nume client:</strong> ${clientName}</p>
      <p><strong>Listă de produse:</strong></p>
      <ul class="item-list">${itemsHtml}</ul>
      ${locationHtml}
    </div>
    <div class="footer">OHYO Distribution</div>
  </div>
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

  const html = buildOrderEmailHtml(clientName, items, location);

  return getResend().emails.send({
    from: "OHYO Orders <orders@ohyo-form.vercel.app>",
    to: [managerEmail],
    subject: `Comandă nouă de la ${clientName}`,
    html,
  });
}

export async function sendOrderConfirmationToClient(
  clientEmail: string,
  clientName: string,
) {
  return getResend().emails.send({
    from: "OHYO <orders@ohyo-form.vercel.app>",
    to: [clientEmail],
    subject: "Comanda dumneavoastră a fost primită",
    html: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 500px; margin: auto; padding: 30px; background: white; border-radius: 8px;">
        <h2 style="color: rgb(226, 133, 152);">Mulțumim, ${clientName}!</h2>
        <p>Comanda dumneavoastră a fost primită și se află în procesare.</p>
        <p>Echipa OHYO vă va contacta în curând pentru confirmare.</p>
        <br/>
        <p style="color: #888; font-size: 13px;">OHYO Distribution</p>
      </div>
    `,
  });
}
