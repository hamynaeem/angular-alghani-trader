import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormatDate, GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-customer-accts',
  templateUrl: './customer-accts.component.html',
  styleUrls: ['./customer-accts.component.scss'],
})
export class CustomerAcctsComponent implements OnInit {
  @ViewChild('Customer') Customer!: any;
  public data: any[] = [];
  public Products: object[] = [];
  public Users: object[] = [];

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    CustomerID: '',
    ProductID: '',
  };
  setting = {
    Columns: [
      {
        label: 'Date',
        fldName: 'Date',
      },
      
     
      {
        label: 'Description',
        fldName: 'Description',
      },

      

      {
        label: 'Debit',
        fldName: 'Debit',
        sum: true,
      },
      {
        label: 'Credit',
        fldName: 'Credit',
        sum: true,
      },
      {
        label: 'Balance',
        fldName: 'Balance',
      },
    ],
    Actions: [],
    Data: [],
  };

  public toolbarOptions: object[] = [];
  customer: any = {};
  Customers: any;

  constructor(
    private http: HttpBase,
    private cache: CachedDataService,
    private ps: PrintDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.Filter.FromDate.day = 1;
    this.http.getUsers().then((r: any) => {
      this.Users = r;
    });
    this.Customers = this.cache.Accounts$;
    this.FilterData();
  }
  load() {}
  FilterData() {
    // tslint:disable-next-line:quotemark
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";

    if (this.Filter.CustomerID === '' || this.Filter.CustomerID === null) {
      return;
    } else {
      filter += ' and CustomerID=' + this.Filter.CustomerID;
    }

    this.http
      .getData('qrycustomeraccts?filter=' + filter + '&orderby=DetailID')
      .then((r: any) => {
        this.data = r;
        if (this.data.length > 0) {
          this.customer.OpenBalance =
            (this.data[0].Balance - this.data[0].Debit) * 1 +
            this.data[0].Credit * 1;
          this.customer.CloseBalance = this.data[this.data.length - 1].Balance;

          this.data.unshift({
            Date: this.data[0].Date,
            Description: 'Opeing Balance ...',
            Debit: 0,
            Credit: 0,
            Balance: this.customer.OpenBalance,
          });
        } else {
          filter = " Date < '" + JSON2Date(this.Filter.FromDate) + "'";
          filter += ' and CustomerID=' + this.Filter.CustomerID;

          this.http
            .getData(
              'qrycustomeraccts?filter=' +
                filter +
                '&orderby=DetailID desc&limit=1'
            )
            .then((r: any) => {
              if (r.length > 0) {
                this.customer.OpenBalance = r[0].Balance;
                this.customer.CloseBalance = r[0].Balance;

              } else {
                this.customer.OpenBalance = 0;
                this.customer.CloseBalance = 0;
              }
              this.data.unshift({
                Date: JSON2Date(this.Filter.FromDate) ,
                Description: 'Opeing Balance ...',
                Debit: 0,
                Credit: 0,
                Balance: this.customer.OpenBalance,
              });
            });
        }
      });
  }

  Clicked(e: any): void {}
  PrintReport() {
    this.ps.PrintData.Title = 'Customer Accounts Report';
    this.ps.PrintData.SubTitle = 'From: ' + JSON2Date(this.Filter.FromDate);
    this.ps.PrintData.SubTitle += ' To: ' + JSON2Date(this.Filter.ToDate);
    this.ps.PrintData.CustomerName = 'Customer: ' + this.Customer.text;

    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.router.navigateByUrl('/print/print-html');
  }
  DetailReport() {
    this.router.navigateByUrl(
      '/accounts/accountdetails/' +
        JSON2Date(this.Filter.FromDate) +
        '/' +
        JSON2Date(this.Filter.ToDate) +
        '/' +
        this.Filter.CustomerID
    );
  }
  CustomerSelected(e: any): void {
    if (e.itemData) {
      this.http.getData('customers/' + e.itemData.CustomerID).then((r) => {
        this.customer = r;
        this.customer.OpenBalance = 0;
        this.customer.CloseBalance = 0;
        // load booking summary for selected customer within the current date range
        const from = JSON2Date(this.Filter.FromDate);
        const to = JSON2Date(this.Filter.ToDate);
        // Purchase bookings where this customer is the supplier
        const purchaseFilter = "Date between '" + from + "' and '" + to + "' and SupplierID=" + e.itemData.CustomerID;
        const purchaseParams = { filter: purchaseFilter, flds: 'BookingID,Date,InvoiceNo,Amount,NetAmount', bid: this.http.getBusinessID && this.http.getBusinessID() };

        // Sales bookings (details) where this customer is the buyer
        const saleFilter = 'CustomerID=' + e.itemData.CustomerID;
        const saleParams = { filter: saleFilter, flds: 'BookingID,Amount', bid: this.http.getBusinessID && this.http.getBusinessID() };

        Promise.all([
          this.http.getData('qrybooking', purchaseParams).catch((err) => {
            console.error('qrybooking purchase load failed:', err, err && err.error);
            return [];
          }),
          this.http.getData('qrybookingsale', saleParams).catch((err) => {
            console.error('qrybookingsale load failed:', err, err && err.error);
            return [];
          }),
        ])
          .then(([purchases, sales]: any) => {
            purchases = purchases || [];
            sales = sales || [];

            // Normalize sales rows to match booking shape (no Date/InvoiceNo available in view)
            const salesNorm = (sales || []).map((s: any) => ({ BookingID: s.BookingID, Date: s.Date || null, InvoiceNo: s.InvoiceNo || '', Amount: s.Amount || 0 }));

            // Combine purchases and sales into a single list
            this.customer.Bookings = purchases.concat(salesNorm);

            // fetch booking details (product names) for all booking ids and attach them
            const bookingIds = (this.customer.Bookings || []).map((b: any) => b.BookingID).filter((v: any) => v != null && v !== '');
            const uniqIds = Array.from(new Set(bookingIds));
            if (uniqIds.length > 0) {
              const idsFilter = 'BookingID in (' + uniqIds.join(',') + ')';
              const detailParams = { filter: idsFilter, flds: 'BookingID,ProductName', bid: this.http.getBusinessID && this.http.getBusinessID() };
              this.http.getData('qrybookingdetails', detailParams).then((d: any) => {
                const m: any = {};
                (d || []).forEach((r: any) => {
                  const id = r.BookingID;
                  if (!m[id]) m[id] = [];
                  m[id].push(r.ProductName || r.Product || r.ItemName || '');
                });
                (this.customer.Bookings || []).forEach((b: any) => {
                  b.ProductName = (m[b.BookingID] || []).filter((x: any) => x).join(', ');
                });
              }).catch((err) => {
                console.error('qrybookingdetails load failed:', err, err && err.error);
              });

              // fetch booking headers (Date, InvoiceNo) to fill missing Date/Invoice for sale rows
              const headerParams = { filter: idsFilter, flds: 'BookingID,Date,', bid: this.http.getBusinessID && this.http.getBusinessID() };
              this.http.getData('qrybooking', headerParams).then((hdrs: any) => {
                const hmap: any = {};
                (hdrs || []).forEach((r: any) => {
                  hmap[r.BookingID] = r;
                });
                (this.customer.Bookings || []).forEach((b: any) => {
                  if ((!b.Date || b.Date === null || b.Date === '') && hmap[b.BookingID]) {
                    b.Date = hmap[b.BookingID].Date || b.Date;
                  }
                  if ((!b.InvoiceNo || b.InvoiceNo === null || b.InvoiceNo === '') && hmap[b.BookingID]) {
                    b.InvoiceNo = hmap[b.BookingID].InvoiceNo || b.InvoiceNo;
                  }
                });
              }).catch((err) => {
                console.error('qrybooking headers load failed:', err, err && err.error);
              });
            }

            const total = (this.customer.Bookings || []).reduce((acc: number, b: any) => {
              const amt = (b.NetAmount != null ? b.NetAmount : b.Amount) || 0;
              return acc + Number(amt);
            }, 0);
            this.customer.BookingTotal = total;
            this.customer.BookingCount = (this.customer.Bookings || []).length;
          })
          .catch((err) => {
            console.error('Failed to load bookings for customer (combined):', err, err && err.error);
            this.customer.Bookings = [];
            this.customer.BookingTotal = 0;
            this.customer.BookingCount = 0;
          });
      });
    }
  }
  formatDate(d: any): string {
    if (!d) return '';
    // if d is JSON date object {year,month,day}
    if (d.year && d.month && d.day) {
      return FormatDate(JSON2Date(d));
    }
    // otherwise assume it's a date string or Date
    return FormatDate(d);
  }
  InvNoClicked(e: any): void {
    console.log(e);
    if (e.RefType == 1){
      this.http.PrintSaleInvoice(e.RefID);
    } else  if (e.RefType == 2){
      this.http.PrintPurchaseInvoice(e.RefID);
    }
  }
}
