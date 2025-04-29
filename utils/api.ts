export type OrderPayload = {
  clientName: string;
  address: string;
  flavor: string;
  quantity: number;
};

const WEBHOOK_URL =
  "https://dimadomore.app.n8n.cloud/webhook-test/25489fee-333a-4354-927c-a019e1da2887";

export async function submitOrder(order: OrderPayload) {
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error("Ошибка при отправке заказа");
  }

  return response.json();
}
