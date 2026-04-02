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

  // Transaction-related balances
  transactionBalance: number = 0;  // Remaining balance for this transaction (total - paid)
  totalAmount: number = 0;         // Total amount for selected date
  
  // Customer account balance
  customerAccountBalance: number = 0;   // Customer's actual account balance
  
  // Date range filter properties
  fromDate: string = '';
  toDate: string = '';
  
  // Legacy properties (keeping for compatibility)
  displayedBalance: number = 0;
  selectedDate: string = ''; // Keeping for backward compatibility

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
    
    // Initialize date range - default to current date for both from and to
    this.fromDate = appDate;
    this.toDate = appDate;
    
    // Keep selectedDate for backward compatibility
    this.selectedDate = appDate;
    
    console.log('Using application business date range:', { fromDate: this.fromDate, toDate: this.toDate });
  }

  onDateChange() {
    // Validate date range
    if (this.fromDate && this.toDate) {
      if (new Date(this.fromDate) > new Date(this.toDate)) {
        this.alert.Error('From Date cannot be greater than To Date', 'Date Range Error', 1);
        return;
      }
    }
    
    // Update selectedDate for backward compatibility (use fromDate as primary)
    this.selectedDate = this.fromDate || this.toDate;
    
    // Reset total amount when date range changes
    this.totalAmount = 0;
    this.ComputeBalance();
  }

  onFromDateChange() {
    this.onDateChange();
  }

  onToDateChange() {
    this.onDateChange();
  }

  Reset() {
    this.Voucher = new VoucherModel();
    
    // Reset all balance-related properties
    this.transactionBalance = 0;
    this.customerAccountBalance = 0;
    this.displayedBalance = 0;
    this.totalAmount = 0;
    
    this.curCustomer = {};
    this.setTodayDate(); // Uses application login date and sets date range
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
    // Set voucher date to the selected business date (use fromDate as primary)
    this.Voucher.Date = this.fromDate || this.selectedDate;
    
    // Add total amount to voucher for reference
    this.Voucher.Debit = this.totalAmount; // Record the order total as debit
    
    // Create description with date range information
    const dateRangeText = this.fromDate === this.toDate 
      ? this.fromDate 
      : `${this.fromDate} to ${this.toDate}`;
      
    this.Voucher.Description = `Amount Received: Rs.${this.Voucher.Credit} against Rs.${this.totalAmount} orders from ${dateRangeText}`;

    try {

      const r: any = await this.http.postTask('vouchers', this.Voucher);

      const acctPayload: any = {
        CustomerID: this.Voucher.CustomerID,
        Debit: this.totalAmount || 0,  // Record order total as debit (amount owed)
        Credit: this.Voucher.Credit || 0,  // Record payment as credit
        Date: this.fromDate || this.selectedDate,
        Description: `Orders: Rs.${this.totalAmount} (${dateRangeText}) | Payment: Rs.${this.Voucher.Credit} | Date: ${this.fromDate || this.selectedDate}`,
        RefID: r?.id || 0,
        RefType: this.Voucher.RefType || 0,
      };

      await this.http.postTask('addtosupl', acctPayload);

      /* -------- BALANCE UPDATE LOGIC -------- */

      const paidAmount = Number(this.Voucher.Credit) || 0;
      const totalOrderAmount = Number(this.totalAmount) || 0;
      const previousBalance = Number(this.curCustomer.Balance) || 0;
      
      // Correct balance calculation: previous balance - total orders + payment received
      const newCustomerBalance = previousBalance - totalOrderAmount + paidAmount;
      
      // Update customer balance in the database
      const balanceUpdatePayload = {
        CustomerID: this.Voucher.CustomerID,
        Balance: newCustomerBalance
      };
      
      try {
        // Update customer balance in database
        await this.http.postTask('updatecustomerbalance', balanceUpdatePayload);
        console.log('Customer balance updated in database:', newCustomerBalance);
      } catch (balanceError) {
        console.warn('Balance update failed, using direct customer update:', balanceError);
        // Fallback: try updating customer record directly using postTask 
        try {
          const customerUpdatePayload = {
            CustomerID: this.Voucher.CustomerID,
            Balance: newCustomerBalance,
            UpdateType: 'balance'
          };
          await this.http.postTask('updatecustomer', customerUpdatePayload);
        } catch (directUpdateError) {
          console.error('Direct balance update also failed:', directUpdateError);
          // If both fail, we'll rely on the local update only
          console.log('Using local balance update only');
        }
      }
      
      // Update local customer object
      this.curCustomer.Balance = newCustomerBalance;
      this.customerAccountBalance = newCustomerBalance;
      
      // Update customers array for consistency
      const customerIndex = this.Customers.findIndex(
        c => c.CustomerID == this.Voucher.CustomerID
      );
      
      if (customerIndex > -1) {
        this.Customers[customerIndex].Balance = newCustomerBalance;
      }
      
      // Reset transaction balance since payment is complete
      this.transactionBalance = 0;
      this.displayedBalance = newCustomerBalance;  // Show final customer balance
      
      console.log('Balance Updated:', {
        previousBalance,
        totalOrderAmount,
        paidAmount,
        newCustomerBalance: newCustomerBalance,
        calculation: `${previousBalance} - ${totalOrderAmount} + ${paidAmount} = ${newCustomerBalance}`
      });

      /* -------------------------------------- */

      this.alert.Sucess('Receipt Saved - Balance Updated to ' + newCustomerBalance.toFixed(2), 'Save', 1);

      this.Reset();

      // Refresh customer list to ensure accounts list shows updated balance
      await this.LoadCustomer(true);

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

  async LoadCustomer(refresh: boolean = false) {

    let url =
      'qrycustomers?flds=CustomerName,Address,Balance,CustomerID,City&orderby=CustomerName';

    if (refresh) {
      url += '&t=' + Date.now();
    }

    try {
      const r: any = await this.http.getData(url);
      this.Customers = r;
      console.log('Customers loaded:', r?.length, 'customers');
      
      // Emit event to notify other components about customer data refresh
      this.notifyCustomerDataUpdated();
      
      return r;
    } catch (err) {
      console.error('Load customer error', err);
      this.alert.Error('Failed to load accounts', 'Error', 1);
    }
  }

  // Method to notify other components about customer balance updates
  private notifyCustomerDataUpdated() {
    // Emit a custom event that can be listened to by the accounts list component
    window.dispatchEvent(new CustomEvent('customerBalanceUpdated', { 
      detail: { 
        timestamp: Date.now(),
        updatedCustomers: this.Customers
      } 
    }));
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
      
      // Update customer account balance
      this.customerAccountBalance = Number(this.curCustomer.Balance) || 0;

      this.Voucher.AcctTypeID = this.curCustomer.AcctTypeID;

      // Recompute balance to include previous balance
      this.ComputeBalance();

    } catch (err) {
      console.error('Customer fetch error', err);
    }
  }

  ComputeBalance() {
    const paid = Number(this.Voucher.Credit) || 0;
    const total = Number(this.totalAmount) || 0;
    const previousCustomerBalance = Number(this.curCustomer.Balance) || 0;

    // Calculate balance: Total Amount + Previous Balance - Paid Amount
    this.transactionBalance = total + previousCustomerBalance - paid;
    
    // Customer balance should show the actual previous balance (before transaction)
    this.customerAccountBalance = previousCustomerBalance;
    
    // Show transaction balance as the displayed balance amount
    this.displayedBalance = this.transactionBalance;
    
    console.log('Balance Calculation:', {
      totalAmount: total,
      paidAmount: paid,
      previousCustomerBalance: previousCustomerBalance,
      transactionBalance: this.transactionBalance,
      displayedBalance: this.displayedBalance,
      calculation: `Transaction Balance: ${total} + ${previousCustomerBalance} - ${paid} = ${this.transactionBalance}`
    });
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
    const dateRangeText = this.fromDate === this.toDate 
      ? this.fromDate 
      : `${this.fromDate} to ${this.toDate}`;
    const paidAmount = Number(this.Voucher.Credit) || 0;
    const totalAmount = Number(this.totalAmount) || 0;
    const transactionBalance = Number(this.transactionBalance) || 0;
    const customerBalance = Number(this.customerAccountBalance) || 0;

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
        <div style="font-size: 14px; font-weight: 600;">Al-Ghani Traders Kanal Road Lila Town (M.B.DIN)</div>
        <div style="font-size: 12px;">+92 300 7749830 / +92 345 7749830</div>
        <div>Date: ${currentDate}</div>
    </div>
    
    <div class="content">
        <div class="row">
            <span class="label">Receipt Date:</span>
            <span class="value">${currentDate}</span>
        </div>
        <div class="row">
            <span class="label">Business Date Range:</span>
            <span class="value">${dateRangeText}</span>
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
                <span class="label">Balance amount :</span>
                <span class="value amount">Rs. ${transactionBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="row">
                <span class="label">Previous Account Balance:</span>
                <span class="value amount">Rs. ${customerBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
        </div>
    </div>
 
</body>
</html>
    `;
  }
}