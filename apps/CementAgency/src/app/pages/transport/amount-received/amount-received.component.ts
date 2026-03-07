import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JSON2Date, getCurDate } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { VoucherModel } from '../../cash/voucher.model';
 
@Component({
  selector: 'app-amount-received',
  templateUrl: './amount-received.component.html',
  styleUrls: ['./amount-received.component.scss'],
})
export class AmountReceivedComponent implements OnInit {

  @ViewChild('cmbCustomer') cmbCustomer: any;

  public Voucher = new VoucherModel();

  Customers: any[] = [];
  curCustomer: any = {};

  displayedBalance: number = 0;
  selectedOrderTotal: number = 0;
  ordersTotal: number = 0;
  totalAmount: number = 0;
  remainingOrderBalance: number = 0;
  selectedDate: string = '';

  constructor(
    private http: HttpBase,
    private alert: MyToastService
  ) {}

  ngOnInit() {
    this.LoadCustomer();
    this.setTodayDate();
    this.ComputeBalance();
  }

  setTodayDate() {
    // Use application login date instead of system today's date
    const appDate = getCurDate() || new Date().toISOString().split('T')[0];
    this.selectedDate = appDate;
    console.log('Using application business date:', appDate);
    // Load today's total when date is set
    if (this.Voucher.CustomerID) {
      this.loadOrderTotal(this.Voucher.CustomerID);
    }
  }

  onDateChange() {
    // Reload total amount when date changes
    if (this.Voucher.CustomerID) {
      this.loadOrderTotal(this.Voucher.CustomerID);
    } else {
      // If no customer selected yet, reset totals
      this.totalAmount = 0;
      this.ordersTotal = 0;
      this.ComputeBalance();
    }
  }

  Reset() {
    this.Voucher = new VoucherModel();
    this.displayedBalance = 0;
    this.ordersTotal = 0;
    this.selectedOrderTotal = 0;
    this.totalAmount = 0;
    this.remainingOrderBalance = 0;
    this.curCustomer = {};
    this.setTodayDate(); // Uses application login date
    this.ComputeBalance();
    
    // Clear customer selection in dropdown
    if (this.cmbCustomer) {
      this.cmbCustomer.clearModel();
    }
  }

  async SaveData() {

    if (!this.Voucher.CustomerID) {
      this.alert.Error('Please select an account', 'Validation', 1);
      return;
    }

    this.Voucher.PrevBalance = this.curCustomer.Balance || 0;
    // Set voucher date to the selected business date
    this.Voucher.Date = this.selectedDate;

    try {

      const r: any = await this.http.postTask('vouchers', this.Voucher);

      const acctPayload: any = {
        CustomerID: this.Voucher.CustomerID,
        Debit: this.Voucher.Debit || 0,
        Credit: this.Voucher.Credit || 0,
        Date: this.selectedDate, // Use the selected business date
        Description: this.Voucher.Description || 'Amount Received',
        RefID: r?.id || 0,
        RefType: this.Voucher.RefType || 0,
      };

      await this.http.postTask('addtosupl', acctPayload);

      /* -------- BALANCE UPDATE LOGIC -------- */

      const paid = Number(this.Voucher.Credit) || 0;
      const oldBalance = Number(this.curCustomer.Balance) || 0;

      const newBalance = oldBalance - paid;

      this.curCustomer.Balance = newBalance;
      this.displayedBalance = newBalance;

      const idx = this.Customers.findIndex(
        c => c.CustomerID == this.Voucher.CustomerID
      );

      if (idx > -1) {
        this.Customers[idx].Balance = newBalance;
      }

      /* -------------------------------------- */

      this.alert.Sucess('Receipt Saved', 'Save', 1);

      this.Reset();

      if (this.cmbCustomer?.focusIn) {
        this.cmbCustomer.focusIn();
      }

    } catch (err: any) {

      console.error('Save error', err);

      const msg =
        err?.error?.message ||
        err?.message ||
        err?.statusText ||
        'Save failed';

      this.alert.Error(msg, 'Error', 1);
    }
  }

  onOrderSelected(order: any) {

    if (!order) return;

    const amt = order.Amount || order.Total || order.OrderAmount || 0;

    this.selectedOrderTotal = Number(amt);
    this.ordersTotal = this.selectedOrderTotal;

    this.Voucher.Credit = 0;

    this.ComputeBalance();
  }

  onOrdersTotal(total: number) {

    this.ordersTotal = Number(total) || 0;
    this.totalAmount = this.ordersTotal;

    this.ComputeBalance();
  }

  async LoadCustomer(refresh: boolean = false) {

    let url =
      'qrycustomers?flds=CustomerName,Address,Balance,CustomerID,City&orderby=CustomerName';

    if (refresh) {
      url += '&t=' + Date.now();
    }

    try {
      const r: any = await this.http.getData(url);
      this.Customers = r;
      return r;
    } catch (err) {
      console.error('Load customer error', err);
      this.alert.Error('Failed to load accounts', 'Error', 1);
    }
  }

  async GetCustomer(e: any) {

    let CustomerID = '';

    if (!e) return;

    if (typeof e === 'object') {
      CustomerID = e.CustomerID || e.CustomerId || e.value || '';
    } else {
      CustomerID = e;
    }

    if (!CustomerID) return;

    try {

      const r: any = await this.http.getData(
        'qrycustomers?filter=CustomerID=' + CustomerID
      );

      this.curCustomer = r[0] || {};

      this.Voucher.AcctTypeID = this.curCustomer.AcctTypeID;

      // Load order total for selected customer
      await this.loadOrderTotal(CustomerID);

    } catch (err) {
      console.error('Customer fetch error', err);
    }
  }

  async loadOrderTotal(CustomerID: string) {
    try {
      let filter = `CustomerID=${CustomerID}`;
      
      // Add date filter - use selected date or today
      if (this.selectedDate) {
        filter += ` and OrderDate='${this.selectedDate}'`;
      }
      
      console.log('Loading orders with filter:', filter);
      
      // Try different possible order table/endpoint names
      const possibleEndpoints = [
        `orders?filter=${filter}&orderby=OrderDate desc`,
        `qryorders?filter=${filter}&orderby=OrderDate desc`,
        `customerorders?filter=${filter}&orderby=OrderDate desc`,
        `order?filter=${filter}&orderby=OrderDate desc`
      ];
      
      let orders: any = null;
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          orders = await this.http.getData(endpoint);
          if (orders && orders.length > 0) {
            console.log('Success with endpoint:', endpoint);
            break;
          }
        } catch (endpointError) {
          console.log('Endpoint failed:', endpoint, endpointError);
          continue;
        }
      }
      
      if (!orders) {
        console.log('All endpoints failed, trying without date filter');
        // Try without date filter to see if customer has any orders
        const basicFilter = `CustomerID=${CustomerID}`;
        try {
          orders = await this.http.getData(`orders?filter=${basicFilter}`);
          console.log('Orders without date filter:', orders?.length || 0);
        } catch (e) {
          orders = [];
        }
      }
      
      console.log('Orders found:', orders?.length || 0, orders);
      
      // Calculate total amount from orders for the specific date
      const total = (orders || []).reduce((sum: number, order: any) => {
        // Check if order matches our selected date
        const orderDate = order.OrderDate || order.Date || order.order_date;
        if (this.selectedDate && orderDate !== this.selectedDate) {
          return sum; // Skip orders that don't match selected date
        }
        
        const amount = Number(order.Amount || order.Total || order.OrderAmount || order.NetAmount || order.amount || 0);
        console.log('Order date:', orderDate, 'Amount:', amount);
        return sum + amount;
      }, 0);
      
      console.log('Total calculated:', total);
      
      this.totalAmount = total;
      this.ordersTotal = total;
      this.ComputeBalance();
      
    } catch (err) {
      console.error('Error loading order total:', err);
      this.totalAmount = 0;
      this.ordersTotal = 0;
      this.ComputeBalance();
    }
  }

  ComputeBalance() {

    const paid = Number(this.Voucher.Credit) || 0;
    const total = Number(this.totalAmount) || 0;

    // Balance = Total Amount - Paid Amount
    this.displayedBalance = total - paid;

    this.remainingOrderBalance = this.displayedBalance;
  }

  Round(amnt: number) {
    return Math.round(amnt);
  }

  PrintReceipt() {
    if (!this.Voucher.CustomerID || !this.curCustomer || !this.Voucher.Credit) {
      this.alert.Error('Please ensure account is selected and paid amount is entered', 'Print Error', 1);
      return;
    }

    // Create printable receipt content
    const receiptContent = this.generateReceiptHTML();
    
    // Open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Print after content loads
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  private generateReceiptHTML(): string {
    const currentDate = new Date().toLocaleString();
    const businessDate = this.selectedDate;
    const paidAmount = Number(this.Voucher.Credit) || 0;
    const totalAmount = Number(this.totalAmount) || 0;
    const balanceAmount = Number(this.displayedBalance) || 0;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transport Amount Receipt</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
            line-height: 1.4;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
        }
        .company-name { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 5px; 
        }
        .receipt-title { 
            font-size: 16px; 
            font-weight: bold; 
            margin: 10px 0; 
        }
        .content { 
            margin: 20px 0; 
        }
        .row { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0; 
            padding: 4px 0;
        }
        .label { 
            font-weight: bold; 
            width: 150px; 
        }
        .value { 
            text-align: right; 
            flex: 1; 
        }
        .amount { 
            font-size: 14px; 
            font-weight: bold; 
        }
        .total-section {
            border-top: 1px solid #333;
            margin-top: 15px;
            padding-top: 10px;
        }
        .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 10px; 
            color: #666; 
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            text-align: center;
            border-top: 1px solid #333;
            padding-top: 5px;
            width: 150px;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">Recovery Amount</div>
        <div class="receipt-title">AMOUNT RECEIVED RECEIPT</div>
        <div>Date: ${currentDate}</div>
    </div>
    
    <div class="content">
        <div class="row">
            <span class="label">Receipt Date:</span>
            <span class="value">${currentDate}</span>
        </div>
        <div class="row">
            <span class="label">Business Date:</span>
            <span class="value">${businessDate}</span>
        </div>
        <div class="row">
            <span class="label">Customer Name:</span>
            <span class="value">${this.curCustomer.CustomerName || ''}</span>
        </div>
        <div class="row">
            <span class="label">Address:</span>
            <span class="value">${this.curCustomer.Address || ''}</span>
        </div>
        <div class="row">
            <span class="label">City:</span>
            <span class="value">${this.curCustomer.City || ''}</span>
        </div>
        
        <div class="total-section">
            <div class="row">
                <span class="label">Total Amount:</span>
                <span class="value amount">Rs. ${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="row">
                <span class="label">Amount Received:</span>
                <span class="value amount">Rs. ${paidAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="row">
                <span class="label">Balance Amount:</span>
                <span class="value amount">Rs. ${balanceAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
        </div>
    </div>
 
</body>
</html>
    `;
  }
}