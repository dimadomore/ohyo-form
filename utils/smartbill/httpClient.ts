const SMARTBILL_API_URL = "https://ws.smartbill.ro/SBORO/api";
const API_KEY = process.env.NEXT_PUBLIC_SMARTBILL_API_KEY || "";

export async function smartbillFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${SMARTBILL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${API_KEY}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "SmartBill API error");
  }
  return res.json();
}
