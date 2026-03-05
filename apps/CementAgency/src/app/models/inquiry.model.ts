import { getYMDDate } from '../factories/utilities';

export class InquiryModel {
  customer_id = '';
  customer_type = '';
  customer_name = '';
  cell_no = '';
  whatsapp_no = '';
  email = '';
  address = '';

  status = '';
  balance = '';
  branch_id = '';
  date: any = getYMDDate();
  description: string = '';
  user_id: string = '';
  assigned_to: string = '';
  status_id: string = '0';
}
