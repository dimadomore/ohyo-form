import { smartbillFetch } from "./httpClient";
// import { SmartbillInvoice } from './types';

// Заготовка для создания счета (реализовать позже по документации)
export async function createInvoice(invoice: any) {
  return smartbillFetch("/invoice", {
    method: "POST",
    body: JSON.stringify(invoice),
  });
}
