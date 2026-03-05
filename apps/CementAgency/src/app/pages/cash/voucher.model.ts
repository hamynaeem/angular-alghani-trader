import { getCurDate, GetDateJSON } from '../../factories/utilities';

export class VoucherModel {
  Date: any = GetDateJSON();
  RouteID = "";
  AcctTypeID="";
  CustomerID = "";
  RefID = "";
  Description = "";
  Debit = 0;
  Credit = 0;
  FinYearID = 0;
  IsPosted = 0;
  SalesmanID = "";
  RefType = 1;
  PrevBalance = 0;
  UserID = "";
  ProductID = "";
  ClosingID = "0";
}
