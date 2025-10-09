

export enum OrderStatus {
  CanBeExported = 1,
  Exported = 2,
  Error = 3
}

export interface OrderDataToExport {
  status?: OrderStatus,
  number: string, 
  date: Date, 
  products: any[], 
  customer: any,
  totalPrice: number,
}