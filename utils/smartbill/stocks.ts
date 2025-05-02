import { smartbillFetch } from "./httpClient";

// Тип для ответа на запрос stock (можно уточнить по документации)
export interface SmartbillStockResponse {
  // TODO: уточнить структуру ответа
  [key: string]: any;
}

/**
 * Получить остатки товаров на складе
 * @param cif - CIF компании (например, RO46277850)
 * @param date - Дата в формате YYYY-MM-DD
 * @param warehouseName - Название склада
 */
export async function getStocks({
  cif,
  date,
  warehouseName,
}: {
  cif: string;
  date: string;
  warehouseName: string;
}): Promise<SmartbillStockResponse> {
  const params = new URLSearchParams({
    cif,
    date,
    warehouseName,
  });
  return smartbillFetch<SmartbillStockResponse>(
    `/stocks?${params.toString()}`,
    {
      method: "GET",
    },
  );
}
