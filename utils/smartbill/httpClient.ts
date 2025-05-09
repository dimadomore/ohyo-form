const API_URL = "https://ws.smartbill.ro/SBORO/api";
const BMW = "MDAzfDc1YWNhYWZiODcyMjQ5MmEzZTc5NWZhN2E0NjRiNTQ1";
const USER = "ohyopartners@gmail.com";
const BASIC_AUTH = Buffer.from(`${USER}:${atob(BMW)}`).toString("base64");

export async function smartbillFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${BASIC_AUTH}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "SmartBill API error");
  }
  return res.json();
}
