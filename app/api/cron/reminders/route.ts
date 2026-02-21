import { NextRequest, NextResponse } from "next/server";
import {
  getProjectSections,
  getSectionTasks,
  parseClientData,
  clientNeedsReminder,
  updateReminderTracking,
} from "@/lib/asana";
import { checkWhatsAppNumber, sendMessage } from "@/lib/evolution";
import { generateReminderMessage } from "@/lib/openai";
import {
  setClientContext,
  addMessage,
  getConversation,
} from "@/lib/conversations";
import { getStockMap } from "@/lib/smartbill";

const ONGOING_SECTION_NAME = "Ongoing support";
const CRON_SECRET = process.env.CRON_SECRET ?? "";
const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://ohyo-form.vercel.app";

export async function GET(request: NextRequest) {
  const dryRun =
    request.nextUrl.searchParams.get("dryRun") === "1" ||
    request.nextUrl.searchParams.get("dryRun") === "true";

  // Verify cron secret (Vercel sends this header for cron invocations)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch live stock map once for all clients (non-fatal if unavailable)
    let stockMap: Map<string, number> | undefined;
    try {
      stockMap = await getStockMap();
    } catch (err) {
      console.warn("Could not fetch SmartBill stocks for reminders:", err);
    }

    // 2. Find the "Ongoing support" section
    const sections = await getProjectSections();
    const ongoingSection = sections.find(
      (s) => s.name === ONGOING_SECTION_NAME,
    );

    if (!ongoingSection) {
      return NextResponse.json({
        message: `Section "${ONGOING_SECTION_NAME}" not found`,
        reminded: 0,
      });
    }

    // 3. Get all tasks with custom fields in one request
    const tasks = await getSectionTasks(ongoingSection.gid);
    const clients = tasks.map(parseClientData);

    // 4. Filter clients who need reminders
    const toRemind = clients.filter(clientNeedsReminder);

    const results: { name: string; status: string }[] = [];

    // 5. Process each client sequentially (to stay within timeout)
    for (const client of toRemind) {
      try {
        if (dryRun) {
          if (!client.phoneNumber?.startsWith("+")) {
            results.push({ name: client.name, status: "no_phone" });
          } else {
            results.push({ name: client.name, status: "ready_to_send" });
          }
          continue;
        }

        // Verify phone number
        if (!client.phoneNumber?.startsWith("+")) {
          results.push({ name: client.name, status: "no_phone" });
          await updateReminderTracking(client.gid, {
            status: "NO_PHONE",
            errorMessage: "Missing phone number or invalid format",
          }).catch(() => {});
          continue;
        }

        // Check WhatsApp availability
        const waCheck = await checkWhatsAppNumber(client.phoneNumber);
        const exists = waCheck?.[0]?.exists;
        if (!exists) {
          results.push({ name: client.name, status: "no_whatsapp" });
          await updateReminderTracking(client.gid, {
            status: "NO_WHATSAPP",
            errorMessage: "Phone number is not registered in WhatsApp",
          }).catch(() => {});
          continue;
        }

        const jid = waCheck[0].jid ?? waCheck[0].number;
        const orderLink = `${APP_BASE_URL}/?gid=${client.gid}`;
        const normalizedPhone = client.phoneNumber.replace(/[^0-9]/g, "");

        // Fetch prior conversation so follow-up reminders differ from the first
        const conversationHistory = await getConversation(normalizedPhone);

        // Generate personalized message (follow-up if history exists)
        const message = await generateReminderMessage(
          client.name,
          client.description,
          orderLink,
          conversationHistory,
        );

        console.log("message:", message);

        if (!message) {
          results.push({ name: client.name, status: "ai_empty" });
          await updateReminderTracking(client.gid, {
            status: "AI_EMPTY",
            errorMessage: "OpenAI returned an empty reminder message",
          }).catch(() => {});
          continue;
        }

        // Send WhatsApp message
        await sendMessage(jid, message);

        // Save conversation context + initial message in Redis
        await setClientContext(normalizedPhone, {
          asanaGid: client.gid,
          clientName: client.name,
          clientDescription: client.description,
          orderLink,
        });
        await addMessage(normalizedPhone, "assistant", message);
        await updateReminderTracking(client.gid, {
          status: "SENT",
          lastReminderDate: new Date().toISOString().slice(0, 10),
          errorMessage: "",
        }).catch(() => {});

        results.push({ name: client.name, status: "sent" });
      } catch (err: any) {
        console.error(`Reminder failed for ${client.name}:`, err);
        results.push({ name: client.name, status: `error: ${err.message}` });
        await updateReminderTracking(client.gid, {
          status: "ERROR",
          errorMessage: String(err.message ?? "Unknown reminder send error"),
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      dryRun,
      total: clients.length,
      reminded: results.filter((r) => r.status === "sent").length,
      readyToSend: results.filter((r) => r.status === "ready_to_send").length,
      results,
    });
  } catch (err: any) {
    console.error("GET /api/cron/reminders error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
