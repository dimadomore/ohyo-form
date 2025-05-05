import type { Client, ClientLocation } from "../store/client";

export type CartOrder = {
  client: string;
  items: { flavor: string; quantity: number }[];
};

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || "";
const ASANA_WEBHOOK_URL = process.env.NEXT_PUBLIC_ASANA_WEBHOOK_URL || "";

if (!WEBHOOK_URL) {
  throw new Error("NEXT_PUBLIC_WEBHOOK_URL is not defined");
}

export async function submitOrder(order: CartOrder) {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error("Eroare la trimiterea comenzii");
  }

  return response.json();
}

export const getAsanaTaskData = async (gid: string) => {
  const response = await fetch(ASANA_WEBHOOK_URL + "/" + gid, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("response:", response);

  if (!response.ok) {
    throw new Error("Eroare la trimiterea comenzii");
  }

  return response.json();
};
