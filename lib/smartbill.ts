const API_URL =
  process.env.SMARTBILL_API_URL ?? "https://ws.smartbill.ro/SBORO/api";
const USER = process.env.SMARTBILL_USER ?? "";
const TOKEN = process.env.SMARTBILL_TOKEN ?? "";
const CIF = "RO46277850";
const WAREHOUSE = "TRAMAR";

type SmartbillProduct = {
  productName: string;
  quantity: number;
};

type SmartbillWarehouseEntry = {
  warehouse: { warehouseName: string };
  products: SmartbillProduct[];
};

type SmartbillStocksResponse = {
  list: SmartbillWarehouseEntry[];
};

export async function fetchSmartbillStocks(): Promise<SmartbillStocksResponse> {
  const basicAuth = Buffer.from(`${USER}:${TOKEN}`).toString("base64");
  const params = new URLSearchParams({
    cif: CIF,
    date: new Date().toISOString().slice(0, 10),
    warehouseName: WAREHOUSE,
  });

  const res = await fetch(`${API_URL}/stocks?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SmartBill API ${res.status}: ${text}`);
  }

  return res.json() as Promise<SmartbillStocksResponse>;
}

/**
 * Returns a map of lowercase smartbillProductName → quantity for the TRAMAR warehouse.
 */
export async function getStockMap(): Promise<Map<string, number>> {
  const data = await fetchSmartbillStocks();
  const warehouseEntry = data.list.find(
    (entry) => entry.warehouse.warehouseName === WAREHOUSE,
  );

  const map = new Map<string, number>();
  for (const product of warehouseEntry?.products ?? []) {
    map.set(product.productName.trim().toLowerCase(), product.quantity);
  }
  return map;
}
