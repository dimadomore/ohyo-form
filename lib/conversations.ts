import { getRedis } from "./redis";

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

export interface ConversationContext {
  asanaGid: string;
  clientName: string;
  clientDescription?: string;
  orderLink: string;
}

const CONV_PREFIX = "conv:";
const CTX_PREFIX = "ctx:";
const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

function convKey(phone: string) {
  return `${CONV_PREFIX}${phone}`;
}

function ctxKey(phone: string) {
  return `${CTX_PREFIX}${phone}`;
}

export async function getConversation(phone: string): Promise<ChatMessage[]> {
  const data = await getRedis().get<ChatMessage[]>(convKey(phone));
  return data ?? [];
}

export async function addMessage(
  phone: string,
  role: ChatMessage["role"],
  content: string,
): Promise<void> {
  const messages = await getConversation(phone);
  messages.push({ role, content });

  const trimmed = messages.slice(-100);
  await getRedis().set(convKey(phone), trimmed, { ex: TTL_SECONDS });
}

export async function clearConversation(phone: string): Promise<void> {
  await getRedis().del(convKey(phone));
}

export async function setClientContext(
  phone: string,
  ctx: ConversationContext,
): Promise<void> {
  await getRedis().set(ctxKey(phone), ctx, { ex: TTL_SECONDS });
}

export async function getClientContext(
  phone: string,
): Promise<ConversationContext | null> {
  return getRedis().get<ConversationContext>(ctxKey(phone));
}

export async function markOrderPlaced(phone: string): Promise<void> {
  await getRedis().set(`order_placed:${phone}`, "1", { ex: TTL_SECONDS });
}

export async function wasOrderPlaced(phone: string): Promise<boolean> {
  const val = await getRedis().get(`order_placed:${phone}`);
  return val === "1";
}
