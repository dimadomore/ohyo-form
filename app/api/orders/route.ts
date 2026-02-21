import { NextRequest, NextResponse } from "next/server";
import {
  getTask,
  parseClientData,
  updateLastOrderDate,
  updateReminderTracking,
  updateOrderStatus,
} from "@/lib/asana";
import { sendOrderNotificationToManager } from "@/lib/email";
import { sendManagerNotification, sendMessage } from "@/lib/evolution";
import { markOrderPlaced } from "@/lib/conversations";

interface OrderBody {
  client: string;
  gid: string;
  items: { flavor: string; quantity: number }[];
  location?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderBody = await request.json();

    if (!body.client || !body.gid || !body.items?.length) {
      return NextResponse.json(
        { error: "Missing required fields: client, gid, items" },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const itemsSummary = body.items
      .map((i) => `${i.flavor}: ${i.quantity} buc.`)
      .join("\n");

    // Run independent operations in parallel
    const tasks: Promise<any>[] = [];

    // 1. Email to manager
    tasks.push(
      sendOrderNotificationToManager(body.client, body.items, body.location)
        .catch((err) => console.error("Email send failed:", err)),
    );

    // 2. Update Asana lastOrderDate
    tasks.push(
      updateLastOrderDate(body.gid, today)
        .catch((err) => console.error("Asana update failed:", err)),
    );

    tasks.push(
      updateReminderTracking(body.gid, {
        status: "ORDER_RECEIVED",
        errorMessage: "",
      }).catch((err) =>
        console.error("Asana reminder status update failed:", err),
      ),
    );

    tasks.push(
      updateOrderStatus(body.gid, "ORDER_RECEIVED").catch((err) =>
        console.error("Asana order status update failed:", err),
      ),
    );

    // 3. WhatsApp notification to manager
    const managerMsg = `📦 Comandă nouă de la *${body.client}*\n\n${itemsSummary}${body.location ? `\n\n📍 ${body.location}` : ""}`;
    tasks.push(
      sendManagerNotification(managerMsg)
        .catch((err) => console.error("Manager WA notification failed:", err)),
    );

    // 4. Get client phone from Asana and send thank-you WhatsApp
    tasks.push(
      getTask(body.gid)
        .then((task) => {
          const client = parseClientData(task);
          const phonePromises: Promise<any>[] = [];

          if (client.phoneNumber) {
            // Mark order as placed in Redis (for AI context)
            const normalizedPhone = client.phoneNumber.replace(/[^0-9]/g, "");
            phonePromises.push(
              markOrderPlaced(normalizedPhone).catch(() => {}),
            );

            // Send thank-you message
            phonePromises.push(
              sendMessage(
                client.phoneNumber,
                `Mulțumim pentru comandă, ${body.client}! 🎉\nComanda dumneavoastră a fost primită și se află în procesare. Vă vom contacta în curând pentru confirmare.`,
              ).catch((err) =>
                console.error("Thank-you WA message failed:", err),
              ),
            );
          }

          return Promise.all(phonePromises);
        })
        .catch((err) => console.error("Client WA notification failed:", err)),
    );

    await Promise.all(tasks);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
