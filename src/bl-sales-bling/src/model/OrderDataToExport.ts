

export interface ProductInfo {
  id: number,
  profile: string,
  code: string,
  value: number,
  description: string,
  stockQuantity: number,
}

export interface CustomerInfo {
  id: number,
  profile: string,
  name: string,
  code: string,
  documentNumber: string,
  phone: string,
}


export enum OrderStatus {
  NotStartedYet,
  Loading,
  CanBeExported,
  Exported,
  Error,
}

export interface OrderDataToExport {
  status: OrderStatus,
  statusMessage?: string,
  number: number,
  id: number,
  profile: string,
  date: Date, 
  products: any[],
  customer: any,
  totalPrice: number,
  errors: string[],
  warnings: string[]

  processStatus(availableProducts: ProductInfo[]) : Promise<void>;
}