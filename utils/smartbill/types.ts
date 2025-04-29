export type SmartbillProduct = {
  id?: number;
  name: string;
  code?: string;
  isService?: boolean;
  measurementUnitName?: string;
  currency?: string;
  price?: number;
  vatName?: string;
  vatPercent?: number;
  isTaxIncluded?: boolean;
  description?: string;
  // ...добавьте другие поля по необходимости
};

export type SmartbillProductResponse = SmartbillProduct & {
  // дополнительные поля ответа, если есть
};

export type SmartbillProductListResponse = SmartbillProductResponse[];
