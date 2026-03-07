import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JSON2Date } from '../../../factories/utilities';
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
  remainingOrderBalance: number = 0;

  constructor(
    private http: HttpBase,
    private alert: MyToastService
  ) {}

  ngOnInit() {
    this.LoadCustomer();
  }

  Reset() {
    this.Voucher = new VoucherModel();
    this.displayedBalance = 0;
    this.ordersTotal = 0;
    this.selectedOrderTotal = 0;
    this.remainingOrderBalance = 0;
  }

  async SaveData() {

    if (!this.Voucher.CustomerID) {
      this.alert.Error('Please select an account', 'Validation', 1);
      return;
    }

    this.Voucher.PrevBalance = this.curCustomer.Balance || 0;
    this.Voucher.Date = JSON2Date(this.Voucher.Date);

    try {

      const r: any = await this.http.postTask('vouchers', this.Voucher);

      const acctPayload: any = {
        CustomerID: this.Voucher.CustomerID,
        Debit: this.Voucher.Debit || 0,
        Credit: this.Voucher.Credit || 0,
        Date: this.Voucher.Date,
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

      /* FIX: always show current balance */
      this.displayedBalance = Number(this.curCustomer.Balance) || 0;

      this.ordersTotal = 0;

    } catch (err) {
      console.error('Customer fetch error', err);
    }
  }

  ComputeBalance() {

    const received = Number(this.Voucher.Credit) || 0;

    const base = Number(this.curCustomer?.Balance) || 0;

    this.displayedBalance = base - received;

    if (this.displayedBalance < 0) {
      this.displayedBalance = 0;
    }

    this.remainingOrderBalance = this.displayedBalance;
  }

  Round(amnt: number) {
    return Math.round(amnt);
  }

}