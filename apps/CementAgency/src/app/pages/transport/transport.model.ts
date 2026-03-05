export interface TransportDetail {
  ID?: number;
  Date: any | null;
  TransportID: number;
  Details: string | null;
  Income: number;
  Expense: number;
  Categories?: Array<number | string>; // Array of selected category IDs or labels
}
