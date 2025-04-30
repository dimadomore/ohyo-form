export type OrderPayload = {
  clientName: string;
  address: string;
  flavor: string;
  quantity: number;
};

const WEBHOOK_URL =
  "https://dimadomore.app.n8n.cloud/webhook-test/51325d47-a256-4057-a3be-ca64c1e1f55b";

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
