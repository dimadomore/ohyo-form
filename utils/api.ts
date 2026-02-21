export type CartOrder = {
  client: string;
  items: { flavor: string; quantity: number }[];
  gid: string;
  location?: string;
};

export async function submitOrder(order: CartOrder) {
  const response = await fetch("/api/orders", {
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
  const response = await fetch(`/api/asana/task/${gid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Eroare la obținerea datelor clientului");
  }

  return response.json();
};
