import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import {
  GetDateJSON,
  JSON2Date
} from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { CachedDataService } from '../../../services/cacheddata.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-cash-book',
  templateUrl: './cash-book.component.html',
  styleUrls: ['./cash-book.component.scss'],
})
export class CashBookComponent implements OnInit {
  @ViewChild('RptTable') RptTable!: ElementRef;
  public data: any = [];

  public Filter = {
    Date: GetDateJSON(),
  };
  setting = {
    Checkbox: false,
    Columns: [
      { label: 'Reference', fldName: 'RefModule' },
      { label: 'Ref No', fldName: 'RefID' },
      { label: 'Customer', fldName: 'Customer', type: 'text' },
       { label: 'Head', fldName: 'Head' },
      { label: 'Description', fldName: 'Details' },
      { label: 'Recvd', fldName: 'Recvd', sum: true },
      { label: 'Paid', fldName: 'Paid', sum: true },
      { label: 'Balance', fldName: 'Balance', type: 'number' },
    ],
    Actions: [],
    Data: [],
  };

  open_balance = 0;
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private router: Router,
    private cachedData: CachedDataService
  ) {}

  ngOnInit() {
    this.FilterData();
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Cash Report';
    this.ps.PrintData.SubTitle = 'Date :' + JSON2Date(this.Filter.Date);

    this.router.navigateByUrl('/print/print-html');
  }
  FilterData() {
    const from = JSON2Date(this.Filter.Date);
    const to = JSON2Date(this.Filter.Date);

    const dateFilter = "Date between '" + from + "' and '" + to + "'";

    // fetch opening balance from last cashbook entry before from-date
    const openBalPromise = this.http.getData(
      "cashbook?filter=Date < '" + from + "'&orderby=Date desc&limit=1"
    );

    const cashPromise = this.http.postData('cashreport', {
      FromDate: from,
      ToDate: to,
    });

    const vouchersPromise = this.http.getData('qryvouchers?filter=' + dateFilter + '&orderby=Date');
    const transportPromise = this.http.getData('transportdetails?filter=' + dateFilter + '&orderby=Date');
    const bookingPromise = this.http.getData('qrybooking?filter=' + dateFilter + '&orderby=Date');
    const customersPromise = this.http.getData('qrycustomers?flds=CustomerID,CustomerName');
    const expensesPromise = this.http.getData('qryexpenses?filter=' + dateFilter + '&orderby=Date')
      .catch(() => this.http.getData('expend?filter=' + dateFilter + '&orderby=Date'));

    Promise.all([openBalPromise, cashPromise, vouchersPromise, transportPromise, bookingPromise, expensesPromise, customersPromise])
      .then((res: any[]) => {
        // opening balance
        try {
          const ob = res[0];
          this.open_balance = Array.isArray(ob) && ob.length > 0 ? Number(ob[0].Balance) || 0 : 0;
        } catch (e) {
          this.open_balance = 0;
        }

        const cashRows = Array.isArray(res[1]) ? res[1] : [];
        const voucherRows = Array.isArray(res[2]) ? res[2] : [];
        const transportRows = Array.isArray(res[3]) ? res[3] : [];
        const bookingRows = Array.isArray(res[4]) ? res[4] : [];
        let customers = Array.isArray(res[6]) ? res[6] : [];
        console.log('Debug: bookingRows count', Array.isArray(bookingRows) ? bookingRows.length : 0);
        console.log('Debug: customers count', Array.isArray(customers) ? customers.length : 0);
        const custMap: any = {};
        if (!customers || customers.length === 0) {
          // fallback to cached accounts
          try {
            this.cachedData.updateAccounts();
            const sub = this.cachedData.Accounts$.subscribe((acctList: any) => {
              const list = Array.isArray(acctList) ? acctList : [];
              for (const c of list) {
                try {
                  const id = c.CustomerID || c.ID || c.Id;
                  if (id !== undefined && id !== null) custMap[String(id)] = c.CustomerName || c.AcctName || '';
                } catch (e) {}
              }
              try { sub.unsubscribe(); } catch (e) {}
            });
          } catch (e) { /* ignore */ }
        } else {
          for (const c of customers) {
            try {
              const id = c.CustomerID || c.ID || c.Id;
              if (id !== undefined && id !== null) custMap[String(id)] = c.CustomerName || c.AcctName || '';
            } catch (e) {}
          }
        }
        const expenseRows = Array.isArray(res[5]) ? res[5] : [];

        const merged: any[] = [];

        // cashbook rows (already have Recvd/Paid)
        for (const r of cashRows) {
          merged.push({
            Date: r.Date,
            RefModule: 'Cashbook',
            RefID: r.ID || r.CashID || 0,
            Head: r.Head || r.AcctID || r.AcctName || '',
            Details: r.Details || r.Description || r.InvoiceNo || '',
            Recvd: Number(r.Recvd) || 0,
            Paid: Number(r.Paid) || 0,
            Source: 'cashbook',
          });
        }

        // vouchers (Credit => Recvd, Debit => Paid)
        for (const v of voucherRows) {
          merged.push({
            Date: v.Date,
            RefModule: 'Voucher',
            RefID: v.VoucherID || 0,
            Head: v.CustomerName || v.CustomerID || '',
            Details: v.Description || v.CustomerName || '',
            Recvd: Number(v.Credit) || 0,
            Paid: Number(v.Debit) || 0,
            Source: 'voucher',
          });
        }

        // transport (Income => Recvd, Expense => Paid)
        for (const t of transportRows) {
          merged.push({
            Date: t.Date,
            RefModule: 'Transport',
            RefID: t.ID || t.TransportID || 0,
            Head: t.TransportName || t.VehicleNo || '',
            Details: t.Description || t.Type || '',
            Recvd: Number(t.Income) || 0,
            Paid: Number(t.Expense) || 0,
            Source: 'transport',
          });
        }

        // bookings: Amount (based on DtCr), carriage as Paid
        for (const b of bookingRows) {
          // ensure we have a customer name from customers map if not present
          try {
            if (!b.CustomerName) {
              const cid = b.CustomerID || b.CustID || b.CID || b.Customer;
              if (cid !== undefined && cid !== null) {
                const name = custMap[String(cid)];
                if (name) b.CustomerName = name;
              }
            }
          } catch (e) {}
          const amount = Number(b.Amount || b.NetAmount || 0);
          if ((b.DtCr || '').toString().toUpperCase() === 'CR') {
            merged.push({
              Date: b.Date,
              RefModule: 'Booking',
              RefID: b.BookingID || 0,
              Head: b.CustomerName || b.SupplierID || '',
              Details: b.InvoiceNo || b.ReceiptNo || 'Booking',
              Recvd: amount,
              Paid: 0,
              Source: 'booking',
            });
          } else {
            merged.push({
              Date: b.Date,
              RefModule: 'Booking',
              RefID: b.BookingID || 0,
              Head: b.CustomerName || b.SupplierID || '',
              Details: b.InvoiceNo || b.ReceiptNo || 'Booking',
              Recvd: 0,
              Paid: amount,
              Source: 'booking',
            });
          }
          const carriage = Number(b.Carriage || 0);
          if (carriage > 0) {
            merged.push({
              Date: b.Date,
              RefModule: 'Booking-Carriage',
              RefID: b.BookingID || 0,
              Head: b.CustomerName || b.SupplierID || '',
              Details: 'Carriage Charges',
              Recvd: 0,
              Paid: carriage,
              Source: 'booking',
            });
          }
        }

        // expenses (Amount => Paid)
        for (const e of expenseRows) {
          merged.push({
            Date: e.Date,
            RefModule: 'Expense',
            RefID: e.ID || e.ExpID || 0,
            Head: e.HeadName || e.HeadID || '',
            Details: e.Description || e.Desc || e.Details || '',
            Recvd: 0,
            Paid: Number(e.Amount) || 0,
            Source: 'expense',
          });
        }

        // sort by date ascending
        merged.sort((a, b) => {
          const da = new Date(a.Date).getTime() || 0;
          const db = new Date(b.Date).getTime() || 0;
          if (da === db) return (a.RefID || 0) - (b.RefID || 0);
          return da - db;
        });

        // compute running balance starting from opening balance
        let bal = Number(this.open_balance) || 0;
        for (const row of merged) {
          const rec = Number(row.Recvd || 0);
          const paid = Number(row.Paid || 0);
          bal += rec - paid;
          row.Balance = bal;
        }

        this.data = merged;
        this.setting.Data = this.data;
      })
      .catch((err) => {
        console.error('Error loading cashbook related data', err);
        this.data = [];
        this.setting.Data = [];
      });
  }

  FindBalance() {
    let bal = Number(this.open_balance) || 0;
    if (Array.isArray(this.data) && this.data.length > 0) {
      for (const row of this.data) {
        const recvd = Number(row.Recvd || row.Received || 0);
        const paid = Number(row.Paid || 0);
        bal += recvd - paid;
      }
    }
    return bal;
  }
  CloseAccounts() {
    swal({
      text: 'Account will be closed, Continue ??',
      icon: 'warning',
      buttons: {
        cancel: true,
        confirm: true,
      },
    }).then((close) => {
      if (close) {
        this.http
          .postTask('CloseAccount/' + this.http.getBusinessID(), {
            ClosingID: this.http.getClosingID(),
            ClosingAmount: this.FindBalance(),
          })
          .then(() => {
            swal(
              'Close Account!',
              'Account was successfully closed, Login to next date',
              'success'
            );
            this.router.navigateByUrl('/auth/login');
          })
          .catch(() => {
            swal('Oops!', 'Error while deleting voucher', 'error');
          });
      }
    });
  }
}
