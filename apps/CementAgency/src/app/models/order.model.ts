import { GetDateJSON } from "../factories/utilities";

export class OrderModel {
  ID: number = 0;
  OrderID: number = 0;
  InvoiceID: number = 0;
  CustomerID: number|null = null;
  Salesman: string = '';
  ConfirmedBy: string = '';
  ConfirmedDate: any = GetDateJSON();
  OrderDate: any = GetDateJSON();
  ShippedDate: any = '';
  ShipName: string = '';
  ShipAddress: string = '';
  ShipCity: string = '';
  ShipRoute: string = '';
  CRNo: string = '';
  NoofCN: number = 0;
  Freight: number = 0;
  Carriage: number = 0;
  Note: string = '';
  Status: number = 0;
  SubOrderNo: number = 0;
  ConfirmedVia: any = '';
  FinYear: number = 0;
  UserID : number = 0;
  Amount: number = 0;
  Discount: number = 0;
  NetAmount: number = 0;

details : any;

  constructor(ono=0, custid=null, sm='') {
      this.Salesman = sm;
      this.OrderDate = GetDateJSON();
      this.CustomerID = custid;
      this.OrderID = ono;
  }
}


export class OrderDetails {
OrderDetailID: number = 0;
OrderID: number = 0;
InvoiceID: number = 0;
ProductID: number|null = null;
ProductName: string = "";
Code: string = "";
Brand: string = "";

UnitPrice: number = 0;
Quantity: number = 0;
Delivered: number = 0;
DiscRatio : number = 0;
Discount: number = 0;
SaleTax: number = 0;
NoOfCtrn: number = 0;
FinYear: number = 0;
}
