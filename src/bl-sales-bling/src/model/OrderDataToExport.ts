

export interface ProductInfo {
  id: number,
  profile: string,
  code: string,
  value: number,
  targetStoreValue: number | undefined,
  description: string,
  stockQuantity: number,
  original: any,
}

export interface CustomerInfo {
  id: number,
  profile: string,
  name: string,
  code: string,
  documentNumber: string,
  phone: string,
  original: any,
}


export enum OrderStatus {
  NotStartedYet,
  Loading,
  CanBeExported,
  StockEnouth,
  Exported,
  Error,
}

export interface OrderDataToExport {
  status: OrderStatus,
  number: number,
  orderStoreNumber: string,
  id: number,
  profile: string,
  date: Date, 
  products: ProductInfo[],
  productsToExport: ProductInfo[],
  customer: CustomerInfo,
  totalPrice: number,
  targetStoreTotalPrice: number | undefined,
  errors: string[],
  warnings: string[],
  success: string[],
  original: any,

  processStatus(availableProducts: ProductInfo[], productsToExport: ProductInfo[]) : Promise<void>;
  resetStatus() : void;
}