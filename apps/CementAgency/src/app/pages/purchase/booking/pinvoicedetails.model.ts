import { GetDateJSON, getCurDate } from '../../../factories/utilities';

export class PInvoiceDetails {
  public ProductName = '';
  public StoreName= '';
  public DetailID = '';
  public StoreID = '';
  public ProductID = '';
  public StockID = '';
  public Qty = 0;
  public Packing = 0;
  public KGs = 0;
  public Bonus = 0;
  public DiscRatio = 0;
  public PPrice = 0;
  public SPrice = 0;
  public RateUnit = 0;
  public BusinessID = '';

}

export class PInvoice {
  public InvoiceID = 0;
  public CustomerID = '';
  public Date: any = GetDateJSON(new Date(getCurDate()));
  public InvoiceNo = '';
  public Amount = 0;
  public Discount = 0;
  public FrieghtCharges = 0;
  public PackingCharges = 0;
  public Labour = 0;
  public AmountPaid = 0;
  public ClosingID = 0;;
  public Type = 1;
  public DtCr = 'CR';
  public Notes = '';
  public IsPosted = 0;
  public Pending = 0;
  public UserID = 0;
  public FinYearID = 0;
  public details = [];
  public NetAmount = 0;
  public BusinessID = '';
}
