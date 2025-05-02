export type CartOrder = {
  client: string;
  items: { flavor: string; quantity: number }[];
};

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || "";

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
