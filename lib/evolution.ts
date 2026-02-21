const API_URL = process.env.EVOLUTION_API_URL ?? "";
const API_KEY = process.env.EVOLUTION_API_KEY ?? "";
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? "ohyo_ro";

async function evoFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      apikey: API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Evolution API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface WhatsAppCheckResult {
  exists: boolean;
  jid: string;
  number: string;
}

export async function checkWhatsAppNumber(
  phoneNumber: string,
): Promise<WhatsAppCheckResult[]> {
  return evoFetch<WhatsAppCheckResult[]>(
    `/chat/whatsappNumbers/${INSTANCE}`,
    {
      method: "POST",
      body: JSON.stringify({ numbers: [phoneNumber] }),
    },
  );
}

export async function sendMessage(remoteJid: string, text: string) {
  return evoFetch(`/message/sendText/${INSTANCE}`, {
    method: "POST",
    body: JSON.stringify({
      number: remoteJid,
      text,
    }),
  });
}

export async function sendManagerNotification(text: string) {
  const managerWa = process.env.MANAGER_WHATSAPP ?? "";
  if (!managerWa) return;
  return sendMessage(managerWa, text);
}
