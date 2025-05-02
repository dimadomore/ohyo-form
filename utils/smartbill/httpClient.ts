const SMARTBILL_API_URL = "https://ws.smartbill.ro/SBORO/api";
const API_KEY = process.env.NEXT_PUBLIC_SMARTBILL_API_KEY || "";
const SMARTBILL_USER = "ohyopartners@gmail.com";
const BASIC_AUTH = Buffer.from(`${SMARTBILL_USER}:${API_KEY}`).toString(
  "base64",
);
console.log("API_KEY:", API_KEY);

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
      Authorization: `Basic ${BASIC_AUTH}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "SmartBill API error");
  }
  return res.json();
}
