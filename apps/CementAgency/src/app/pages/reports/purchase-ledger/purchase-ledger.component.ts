import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date, getYMDDate } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-purchase-ledger',
  templateUrl: './purchase-ledger.component.html',
  styleUrls: ['./purchase-ledger.component.scss'],
})
export class PurchaseLedgerComponent implements OnInit {
  @ViewChild('RptTable') RptTable: any;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    ItemID: '',

    SupplierID: '',
  };
  setting = {
    Checkbox: false,
    Columns: [
      {
        label: 'Date',
        fldName: 'Date',
      },
      {
        label: 'Bill No',
        fldName: 'BookingID',
      },
      {
        label: 'Product Name',
        fldName: 'ProductName',
      },

      {
        label: 'Qty (Tons)',
        fldName: 'Qty',
        sum: true,
      },
      {
        label: 'Price',
        fldName: 'PPrice',
      },
      {
        label: 'Amount',
        fldName: 'Amount',
        sum: true,
      },
    ],
    Actions: [],
    Data: [],
  };

  nWhat = '1';
  Items: any = [{ ItemID: '1', ItemName: 'Test Item' }];

  public data: object[] = [];
  public Suppliers: any;
  public SuppliersList: any[] = [];
  public selectedCustomer: any = {};
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    private router: Router
  ) {
    this.Suppliers = this.cachedData.Suppliers$;
  }

  ngOnInit() {
    try { this.cachedData.updateSuppliers(); } catch (e) {}
    // subscribe to suppliers and provide a concrete array for the template
    try {
      (this.Suppliers || this.cachedData.Suppliers$).subscribe((s: any[]) => {
        this.SuppliersList = s || [];
        // fallback to Accounts if suppliers are empty
        if ((!this.SuppliersList || this.SuppliersList.length === 0) && this.cachedData.Accounts$) {
          try {
            this.cachedData.Accounts$.subscribe((a: any[]) => {
              const list = (a || []).map((ac: any) => ({ SupplierID: ac.CustomerID || ac.ID || ac.Id || '', SupplierName: ac.CustomerName || ac.AcctName || ac.Name || ac.Acct || '', City: ac.City || '' }));
              if (list && list.length && (!this.SuppliersList || this.SuppliersList.length === 0)) this.SuppliersList = list;
            });
          } catch (e) {}
        }
      });
    } catch (e) {}

    this.LoadItems();
    this.FilterData();
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title =
      'Purchase Ledger ' +
      (this.Filter.SupplierID
        ? ' Supplier: ' + (this.selectedCustomer.SupplierName || this.selectedCustomer.CustomerName)
        : '');
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  CustomerSelected(e: any) {
    console.log(e);
    this.selectedCustomer = e;
  }
  SupplierSelected(e: any) {
    console.log('supplier selected', e);
    this.selectedCustomer = e || {};
  }
  FilterData() {
    // Use zero-padded Y-m-d format to avoid SQL parsing issues
    const fromDate = new Date(
      this.Filter.FromDate.year,
      this.Filter.FromDate.month - 1,
      this.Filter.FromDate.day
    );
    const toDate = new Date(
      this.Filter.ToDate.year,
      this.Filter.ToDate.month - 1,
      this.Filter.ToDate.day
    );

    let filter =
      "Date between '" +
      getYMDDate(fromDate) +
      "' and '" +
      getYMDDate(toDate) +
      "'";

    if (this.Filter.SupplierID)
      filter += ' and SupplierID=' + this.Filter.SupplierID;

    if (this.Filter.ItemID)
      if (this.nWhat == '1') filter += ' and ProductID=' + this.Filter.ItemID;
      else filter += ' and UnitID=' + this.Filter.ItemID;

    let flds =
      'Date,BookingID, ProductName, Qty, PPrice, Amount';

    this.http
      .getData(
        `qrypurchasereport?orderby=Date,BookingID&flds=${flds}&filter=${encodeURIComponent(filter)}`
      )
      .then((r: any) => {
        this.data = r;
      })
      .catch((err) => {
        console.error('Purchase ledger error', err);
        // If backend fails on SupplierID filter, first try an MQRY SQL that joins booking
        if (err && err.status === 500 && this.Filter?.SupplierID) {
          console.log('Server returned 500 for supplier-filtered purchase query — trying MQRY SQL with booking join');
          const sid = String(this.Filter.SupplierID);
          const mqrySql = `SELECT p.Date, p.BookingID, p.ProductName, p.Qty, p.PPrice, p.Amount FROM qrypurchasereport p LEFT JOIN booking b ON p.BookingID = b.BookingID WHERE p.Date between '${getYMDDate(fromDate)}' and '${getYMDDate(toDate)}' AND b.SupplierID = ${sid} ORDER BY p.Date, p.BookingID`;
          this.http
            .getData('MQRY?qrysql=' + encodeURIComponent(mqrySql))
            .then((mq: any) => {
              const rows = Array.isArray(mq) ? mq : (mq && Array.isArray(mq.data) ? mq.data : []);
              this.data = rows;
            })
            .catch((mqErr) => {
              console.error('MQRY fallback failed', mqErr);
              // last-resort: retry date-only and filter client-side
              try {
                console.log('Retrying qrypurchasereport without SupplierID and filtering client-side');
                const dateOnlyFilter = "Date between '" + getYMDDate(fromDate) + "' and '" + getYMDDate(toDate) + "'";
                this.http
                  .getData(`qrypurchasereport?orderby=Date,BookingID&flds=${flds}&filter=${encodeURIComponent(dateOnlyFilter)}`)
                  .then((rows: any) => {
                    const purchases = Array.isArray(rows) ? rows : (rows && Array.isArray(rows.data) ? rows.data : []);
                    try {
                      const filtered = (purchases || []).filter((row: any) => {
                        const id = row?.SupplierID ?? row?.Supplier ?? row?.CustomerID ?? row?.AccountID ?? row?.Account ?? row?.Customer ?? '';
                        return id !== undefined && id !== null && String(id) === sid;
                      });
                      this.data = filtered;
                    } catch (e) {
                      this.data = purchases;
                    }
                  })
                  .catch((e2) => {
                    console.error('Retry without SupplierID failed', e2);
                    try {
                      const msg = err.error || err.message || JSON.stringify(err);
                      alert('Server error: ' + msg);
                    } catch (e) {
                      alert('Server error. Check console for details.');
                    }
                  });
              } catch (ex) {
                try {
                  const msg = err.error || err.message || JSON.stringify(err);
                  alert('Server error: ' + msg);
                } catch (ee) {
                  alert('Server error. Check console for details.');
                }
              }
            });
          return;
        }
        try {
          const msg = err.error || err.message || JSON.stringify(err);
          alert('Server error: ' + msg);
        } catch (e) {
          alert('Server error. Check console for details.');
        }
      });
  }
  Clicked(e: unknown) {}

  ItemSelected(e: unknown) {}
  ItemChange(e: unknown) {
    this.LoadItems();
  }
  async LoadItems() {
    this.Items = [];
    if (this.nWhat == '1') {
      this.cachedData.Products$.subscribe((r: any) => {
        r.forEach((m: any) => {
          this.Items.push({
            ItemID: m.ProductID,
            ItemName: m.ProductName,
          });
        });
        this.Items = [...this.Items];
        console.log(this.Items);
      });
    } else if (this.nWhat == '2') {
      this.http.getData('units').then((r: any) => {
        r.forEach((m: any) => {
          this.Items.push({
            ItemID: m.ID,
            ItemName: m.UnitName,
          });
          this.Items = [...this.Items];
        });
      });
    }
  }
}
