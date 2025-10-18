

export enum OrderStatus {
  Loading,
  CanBeExported,
  Exported,
  Error,
}

export interface OrderDataToExport {
  status: OrderStatus,
  statusMessage?: string,
  number: string,
  id: string,
  profile: string,
  date: Date, 
  products: any[], 
  customer: any,
  totalPrice: number,

  processStatus() : Promise<void>;
}