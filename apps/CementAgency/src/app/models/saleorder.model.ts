export class SaleOrderModel {
  details: any = '';
  order_id: string = '';
  date: any = '';
  inquiry_id: string = '';
  customer_id: string = '';
  customer_name: string = '';
  contact_no: string = '';
  amount: number = 0;
  discount: number = 0;
  status_id: string = '';
  customer_type: string = '';
  whatsapp_no: string = '';
  email: string = '';
  address: string = '';
  country: string = '';
  product_id: string = '';
  agent_id: string = '';
  branch_id: string = '';
  notes: string = '';
  vat: number = 0;
}

export class OrderDetailsModel {
  detailid = '';
  order_id = '0';
  product_id = '';
  qty = '0';
  price = '0';
  discount = '0';
  vat = '0.0';
  branch_id = '';
  book_ref = '';
  ticket_no = '';
  passport_no = '';
  nationality_id = '';
  travel_date = '';
  origin = '';
  destination = '';
  airline = '';
  oneway = '';
  servicecharges = '';
}
