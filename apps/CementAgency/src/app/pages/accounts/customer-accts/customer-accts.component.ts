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
  productMap: any = {};

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
        this.customer.Bookings = [];
        this.customer.BookingTotal = 0;
        this.customer.BookingCount = 0;

        const from = JSON2Date(this.Filter.FromDate);
        const to = JSON2Date(this.Filter.ToDate);
        const cid = e.itemData.CustomerID;
        const dateRange = "Date between '" + from + "' and '" + to + "'";

        // 1. Purchase headers (this customer as supplier)
        const purchaseFlt = dateRange + " and SupplierID=" + cid + " and DtCr='Dr'";
        // 2. Sale details (this customer as buyer)
        const saleFlt = "CustomerID=" + cid + " and " + dateRange;

        Promise.all([
          this.http.getData('qrybooking?filter=' + encodeURIComponent(purchaseFlt) + '&orderby=Date').catch(() => []),
          this.http.getData('qrybookingsale?filter=' + encodeURIComponent(saleFlt)).catch(() => []),
          this.http.getData('qryproducts?flds=ProductID,ProductName').catch(() => []),
        ]).then(([purchaseHeaders, saleDetails, products]: any) => {
          purchaseHeaders = purchaseHeaders || [];
          saleDetails     = saleDetails     || [];

          // Build a ProductID → ProductName lookup map
          const productMap: any = {};
          (products || []).forEach((p: any) => { productMap[String(p.ProductID)] = p.ProductName || ''; });
          // expose for template lookup
          this.productMap = productMap;

          const purchaseIds   = purchaseHeaders.map((b: any) => b.BookingID).filter(Boolean);
          const saleHeaderIds = [...new Set(saleDetails.map((d: any) => d.BookingID).filter(Boolean))] as any[];

          const purchaseDetailsPromise = purchaseIds.length
            ? this.http.getData('qrybookingpurchase?filter=' + encodeURIComponent('BookingID IN (' + purchaseIds.join(',') + ')')).catch(() => [])
            : Promise.resolve([]);

          const saleHeadersPromise = saleHeaderIds.length
            ? this.http.getData('qrybooking?filter=' + encodeURIComponent('BookingID IN (' + saleHeaderIds.join(',') + ')')).catch(() => [])
            : Promise.resolve([]);

          return Promise.all([purchaseDetailsPromise, saleHeadersPromise])
            .then(([purchaseDetails, saleHeaders]: any) => {
              // Map purchase details by BookingID
              const purchDetailMap: any = {};
              (purchaseDetails || []).forEach((d: any) => {
                if (!purchDetailMap[d.BookingID]) purchDetailMap[d.BookingID] = [];
                purchDetailMap[d.BookingID].push(d);
              });

              // Map sale headers by BookingID
              const saleHeaderMap: any = {};
              (saleHeaders || []).forEach((h: any) => { saleHeaderMap[h.BookingID] = h; });

              // Build purchase rows — qrybookingpurchase has ProductName directly
              const purchaseRows = purchaseHeaders.map((b: any) => {
                const details  = purchDetailMap[b.BookingID] || [];
                const amount   = Number(b.NetAmount || b.Amount || 0);
                const received = Number(b.Received || b.AmountReceived || 0);
                return {
                  BookingID:   b.BookingID,
                  Date:        (b.Date || '').substring(0, 10),
                  InvoiceNo:   b.BookingID,
                  ProductName: details.map((d: any) => d.ProductName || productMap[String(d.ProductID)] || '').filter(Boolean).join(', '),
                  Qty:         details.reduce((s: number, d: any) => s + (Number(d.Qty) || 0), 0),
                  Amount:      amount,
                  Received:    received,
                  Balance:     amount - received,
                };
              });

              // Build sale rows — qrybookingsale has ProductID but NOT ProductName, use productMap
              const saleRows = (saleDetails as any[]).map((d: any) => {
                const hdr      = saleHeaderMap[d.BookingID] || {};
                const amount   = Number(d.Amount || 0);
                const received = Number(d.Received || hdr.Received || hdr.AmountReceived || 0);
                return {
                  BookingID:   d.BookingID,
                  Date:        ((hdr.Date || d.Date || '')).substring(0, 10),
                  InvoiceNo:   d.BookingID,
                  ProductID:   d.ProductID,
                  ProductName: productMap[String(d.ProductID)] || '',
                  Qty:         Number(d.Qty) || 0,
                  Amount:      amount,
                  Received:    received,
                  Balance:     amount - received,
                };
              });

              // Combine rows — no qrybookingdetails (view doesn't exist on backend).
              // ProductName is already resolved: purchaseRows via purchDetailMap (qrybookingpurchase),
              // saleRows via productMap (qryproducts). Apply final productMap fallback for any gaps.
              const combined = [...purchaseRows, ...saleRows];

              const finalize = (rows: any[]) => {
                this.customer.Bookings = rows.sort((a: any, b: any) => (a.Date > b.Date ? 1 : -1));
                this.customer.BookingTotal = this.customer.Bookings.reduce((acc: number, b: any) => acc + (Number(b.Amount) || 0), 0);
                this.customer.BookingCount = this.customer.Bookings.length;
              };

              // For any row still missing ProductName, check purchDetailMap first (purchase details
              // already fetched from qrybookingpurchase), then fall back to productMap.
              combined.forEach((r: any) => {
                if (!r.ProductName || r.ProductName === '') {
                  // check purchase detail map (keyed by BookingID)
                  const details = purchDetailMap[r.BookingID] || [];
                  if (details.length) {
                    const match = details.find((x: any) => String(x.ProductID) === String(r.ProductID));
                    if (match) {
                      r.ProductName = match.ProductName || match.ItemName || '';
                    } else {
                      r.ProductName = details.map((x: any) => x.ProductName || x.ItemName || '').filter(Boolean).join(', ');
                    }
                  }
                }
                // final fallback via productMap
                if ((!r.ProductName || r.ProductName === '') && r.ProductID) {
                  r.ProductName = productMap[String(r.ProductID)] || '';
                }
              });

              finalize(combined);
            });
        }).catch((err) => {
          console.error('Failed to load bookings:', err);
          this.customer.Bookings     = [];
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

  bookingProductName(b: any): string {
    if (!b) return '';
    if (b.ProductName && String(b.ProductName).trim() !== '') return b.ProductName;
    const pid = b.ProductID || b.ProductId || b.Product || b.ItemID || b.ItemId;
    if (pid && this.productMap && this.productMap[String(pid)]) return this.productMap[String(pid)];
    return '';
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
