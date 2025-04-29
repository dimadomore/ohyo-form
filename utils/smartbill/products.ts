import { smartbillFetch } from "./httpClient";
import { SmartbillProduct, SmartbillProductListResponse } from "./types";

// Получить список всех товаров
export async function getProducts(): Promise<SmartbillProductListResponse> {
  return smartbillFetch<SmartbillProductListResponse>(`/product`, {
    method: "GET",
  });
}

// Получить товар по id (если поддерживается API)
export async function getProductById(id: number): Promise<SmartbillProduct> {
  return smartbillFetch<SmartbillProduct>(`/product/${id}`, { method: "GET" });
}

// Создать новый товар
export async function createProduct(
  product: SmartbillProduct,
): Promise<SmartbillProduct> {
  return smartbillFetch<SmartbillProduct>(`/product`, {
    method: "POST",
    body: JSON.stringify(product),
  });
}
