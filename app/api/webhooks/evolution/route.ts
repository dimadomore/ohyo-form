import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/evolution";
import {
  getConversation,
  addMessage,
  getClientContext,
  wasOrderPlaced,
} from "@/lib/conversations";
import { generateConversationReply } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Evolution API sends various event types; we only care about messages.upsert
    const event = body.event;
    if (event !== "messages.upsert") {
      return NextResponse.json({ ok: true });
    }

    const messageData = body.data;
    if (!messageData) {
      return NextResponse.json({ ok: true });
    }

    // Extract message details
    const message = messageData.message;
    const key = messageData.key;

    // Skip messages sent by us (fromMe) or non-text messages
    if (key?.fromMe) {
      return NextResponse.json({ ok: true });
    }

    const text =
      message?.conversation ??
      message?.extendedTextMessage?.text;

    if (!text) {
      return NextResponse.json({ ok: true });
    }

    const senderJid: string = key?.remoteJid ?? "";
    if (!senderJid || !senderJid.includes("@s.whatsapp.net")) {
      return NextResponse.json({ ok: true });
    }

    // Normalize phone number (remove @s.whatsapp.net)
    const phone = senderJid.replace("@s.whatsapp.net", "");

    // Look up client context
    const context = await getClientContext(phone);
    if (!context) {
      // Unknown sender -- not a client we've contacted. Ignore silently.
      return NextResponse.json({ ok: true });
    }

    // Save the user's incoming message
    await addMessage(phone, "user", text);

    // Load full conversation history
    const history = await getConversation(phone);

    // Check if an order has been placed
    const orderPlaced = await wasOrderPlaced(phone);

    // Generate AI response
    const reply = await generateConversationReply(
      history,
      context,
      orderPlaced,
    );

    if (reply) {
      // Send response via WhatsApp
      await sendMessage(senderJid, reply);

      // Save assistant's reply
      await addMessage(phone, "assistant", reply);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("POST /api/webhooks/evolution error:", err);
    // Always return 200 to Evolution to prevent retries
    return NextResponse.json({ ok: true });
  }
}
