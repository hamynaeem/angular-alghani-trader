import { GetDateJSON, getYMDDate } from "../factories/utilities";

export class InvoiceModel {
  details: any = [];
  invoice_id = "";
  date: any = GetDateJSON();
  customer_type = "";
  customer_id = "";
  amount = 0;
  discount = 0;
  vat = 0;
  status_id = "";
  agent_id = "";
  branch_id = "";
  notes = "";

}

export class InvoiceDetailsModel {
  detailid = 3;
  order_id = 0;
  product_id = "";
  description = "";
  qty = 0;
  price = 0;
  supllier_id = 0;
  cost = 0;
  discount = 0;
  vat = 0.0;
  branch_id = "";

}
