import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  GetDateJSON,
  JSON2Date,
  formatNumber,
} from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { MyToastService } from '../../../services/toaster.server';

@Component({
  selector: 'app-purchase-summary',
  templateUrl: './purchase-summary.component.html',
  styleUrls: ['./purchase-summary.component.scss'],
})
export class PurchasesummaryComponent implements OnInit {
  @ViewChild('RptTable') RptTable: any;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    ProductID: '',
    SupplierID: '',
  };
  public Suppliers: any = [];
  setting = {
    Checkbox: false,
    GroupBy: 'SupplierName',
    Columns: [
      {
        label: 'Product Name',
        fldName: 'ProductName',
      },

      {
        label: 'Supplier',
        fldName: 'SupplierName',
      },
      {
        label: 'Price',
        fldName: 'PPrice',
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d['PPrice']);
        },
      },
      {
        label: 'Tons',
        fldName: 'Qty',
        sum: true,
      },
      {
        label: 'Amount',
        fldName: 'Amount',
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d['Amount']);
        },
      },
    ],
    Actions: [],
    Data: [],
  };

  public data!: object[];
  public Items: any;
  public Accounts: any = [];
  private accountsSub: any;

  constructor(
    private http: HttpBase,
    private cachedData: CachedDataService,
    private ps: PrintDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.Items = this.cachedData.Products$;
    // preload suppliers for the dropdown and normalize display name
    try {
      this.http
        .getData('qrysuppliers')
        .then((s: any) => {
          const raw: any = s || [];
          let list: any[] = [];
          if (Array.isArray(raw)) list = raw;
          else if (raw && Array.isArray(raw.data)) list = raw.data;
          else list = [];
          this.Suppliers = list.map((sup: any) => {
            const id = sup.SupplierID || sup.CustomerID || sup.ID || sup.Id || '';
            const displayName =
              sup.SupplierName || sup.CustomerName || sup.AcctName || sup.Name || sup.Acct || '';
            return Object.assign({}, sup, { SupplierID: id, displayName });
          });
          console.log('Preloaded Suppliers:', this.Suppliers);
        })
        .catch(() => {
          this.Suppliers = [];
        });
    } catch (e) {
      this.Suppliers = [];
    }
    // if no suppliers from qrysuppliers, try fetching accounts/customers directly as fallback
    try {
      if (!this.Suppliers || this.Suppliers.length === 0) {
        this.http.getData('qrycustomers?flds=CustomerID,CustomerName')
          .then((c: any) => {
            const rawc: any = c || [];
            let listc: any[] = [];
            if (Array.isArray(rawc)) listc = rawc;
            else if (rawc && Array.isArray(rawc.data)) listc = rawc.data;
            else listc = [];
            if (listc && listc.length) {
              try {
                this.Suppliers = listc.map((sup: any) => {
                  const id = sup.CustomerID || sup.ID || sup.Id || '';
                  const displayName = sup.CustomerName || sup.AcctName || '';
                  return Object.assign({}, sup, { SupplierID: id, displayName });
                });
                console.log('Fallback Suppliers from qrycustomers:', this.Suppliers);
              } catch (e) { /* ignore */ }
            }
          })
          .catch(() => { /* ignore */ });
      }
    } catch (e) { /* ignore */ }
    // ensure accounts are loaded and subscribe so we can map CustomerID -> CustomerName
    try { this.cachedData.updateAccounts(); } catch (e) {}
    this.accountsSub = this.cachedData.Accounts$.subscribe((a: any) => {
    this.Accounts = a || [];
    console.log('Cached Accounts:', this.Accounts);
      // if suppliers not loaded from backend, populate from cached accounts
      try {
        if ((!this.Suppliers || !this.Suppliers.length) && this.Accounts && this.Accounts.length) {
          this.Suppliers = (this.Accounts || []).map((ac: any) => {
            const id = ac.CustomerID || ac.ID || ac.Id || '';
            const displayName = ac.CustomerName || ac.AcctName || ac.Name || ac.Acct || '';
            return Object.assign({}, ac, { SupplierID: id, displayName });
          });
        }
      } catch (e) {}
    });
    this.FilterData();
  }

  get selectedSupplierName(): string {
    try {
      const id = this.Filter?.SupplierID;
      if (!id) return '';
      const found = (this.Suppliers || []).find((s: any) => String(s?.SupplierID) === String(id) || String(s?.CustomerID) === String(id) || String(s?.ID) === String(id));
      return (found && (found.displayName || found.SupplierName || found.CustomerName || found.AcctName)) || '';
    } catch (e) {
      return '';
    }
  }

  // Helper: get nested value by dot path
  private getValueFromPath(obj: any, path: string): any {
    try {
      if (!obj) return null;
      const parts = path.split('.');
      let cur: any = obj;
      for (const p of parts) {
        if (cur == null) return null;
        if (typeof cur === 'object' && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
        else return null;
      }
      return cur;
    } catch (e) {
      return null;
    }
  }

  // Helper: return first non-empty string value from a list of candidate keys (supports dot paths)
  private firstAvailable(row: any, candidates: string[]): string {
    for (const key of candidates) {
      const val = this.getValueFromPath(row, key);
      if (val === undefined || val === null) continue;
      if (typeof val === 'string' && val.trim() !== '') return val.trim();
      if (typeof val === 'number') return String(val);
      if (typeof val === 'object') {
        const pick = this.getValueFromPath(val, 'No') || this.getValueFromPath(val, 'no') || this.getValueFromPath(val, 'Number') || this.getValueFromPath(val, 'number') || this.getValueFromPath(val, 'ID') || this.getValueFromPath(val, 'Id');
        if (pick) return String(pick);
        try { return JSON.stringify(val); } catch { continue; }
      }
    }
    return '';
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Purchase Summary Report';
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  FilterData() {
    const from = JSON2Date(this.Filter?.FromDate);
    const to = JSON2Date(this.Filter?.ToDate);

    let where = `p.Date BETWEEN '${from}' AND '${to}'`;
    if (this.Filter?.ProductID) {
      where += ` AND p.ProductID = ${this.Filter.ProductID}`;
    }
    if (this.Filter?.SupplierID) {
      where += ` AND b.SupplierID = ${this.Filter.SupplierID}`;
    }

    const sql = `SELECT p.BookingID, p.ProductName, c.CustomerName AS SupplierName,
      p.PPrice, p.Qty, (p.PPrice * p.Qty) AS Amount
      FROM qrypurchasereport p
      LEFT JOIN booking b ON p.BookingID = b.BookingID
      LEFT JOIN customers c ON b.SupplierID = c.CustomerID
      WHERE ${where}
      ORDER BY c.CustomerName, p.ProductName`;

    const fallbackUrl = 'qrypurchasereport';

    const process = (rows: any[]) => {
      const purchases = Array.isArray(rows) ? rows.slice() : [];

      // client-side filter if SupplierID is present
      let filtered = purchases;
      try {
        if (this.Filter?.SupplierID && String(this.Filter.SupplierID) !== '') {
          const sid = String(this.Filter.SupplierID);
          filtered = (purchases || []).filter((row: any) => {
            const id = row?.SupplierID ?? row?.Supplier ?? row?.CustomerID ?? row?.AccountID ?? row?.Account ?? row?.Customer ?? '';
            return id !== undefined && id !== null && String(id) === sid;
          });
        }
      } catch (e) { /* ignore and use unfiltered purchases */ }

      // prepare suppliers list (prefer preloaded Suppliers, fallback to Accounts)
      let suppliersList: any[] = Array.isArray(this.Suppliers) ? this.Suppliers.slice() : [];
      if ((!suppliersList || suppliersList.length === 0) && Array.isArray(this.Accounts) && this.Accounts.length) {
        try {
          suppliersList = (this.Accounts || []).map((ac: any) => {
            const id = ac?.CustomerID ?? ac?.ID ?? ac?.Id ?? '';
            const displayName = ac?.CustomerName || ac?.AcctName || ac?.Name || ac?.Acct || '';
            return Object.assign({}, ac, { SupplierID: id, displayName });
          });
          this.Suppliers = suppliersList;
        } catch (e) { suppliersList = []; }
      }

      const mapped = (filtered || []).map((row: any) => {
        let name = '';
        try {
          const id = row?.SupplierID ?? row?.Supplier ?? row?.CustomerID ?? row?.AccountID ?? row?.Account ?? row?.Customer ?? '';
          if (id !== undefined && id !== null && String(id) !== '') {
            const found = (suppliersList || []).find((sup: any) => String(sup?.SupplierID) === String(id) || String(sup?.CustomerID) === String(id) || String(sup?.ID) === String(id));
            if (found) name = found.SupplierName || found.CustomerName || found.AcctName || found.displayName || '';
          }
        } catch (e) { name = ''; }

        if (!name && Array.isArray(this.Accounts) && this.Accounts.length) {
          try {
            const id = row?.CustomerID ?? row?.AccountID ?? row?.Account ?? row?.SupplierID ?? row?.Supplier ?? row?.Customer ?? '';
            if (id !== undefined && id !== null && String(id) !== '') {
              const foundA = (this.Accounts || []).find((ac: any) => String(ac?.CustomerID) === String(id) || String(ac?.ID) === String(id));
              if (foundA) name = foundA.CustomerName || foundA.AcctName || '';
            }
          } catch (e) { name = ''; }
        }

        row.SupplierName = name || this.firstAvailable(row, [
          'SupplierName', 'CustomerName', 'Customer', 'Supplier', 'CustName', 'AccountName', 'Account', 'CustomerID'
        ]);

        try {
          if ((!row.SupplierName || String(row.SupplierName).trim() === '') && this.Filter?.SupplierID) {
            const rowId = row?.SupplierID ?? row?.Supplier ?? row?.CustomerID ?? row?.AccountID ?? row?.Account ?? row?.Customer ?? '';
            if (rowId !== undefined && rowId !== null && String(rowId) === String(this.Filter.SupplierID)) {
              row.SupplierName = this.selectedSupplierName || '';
            }
          }
        } catch (e) { /* ignore */ }

        try { row.Qty = Number(row?.Qty ?? row?.Quantity ?? row?.QtyOrdered ?? row?.QtySold ?? 0); } catch (e) { row.Qty = 0; }
        return row;
      });

      this.data = mapped;
    };

    // Primary attempt: run SQL via MQRY
    this.http.getData('MQRY?qrysql=' + encodeURIComponent(sql))
      .then((r: any) => {
        // some backends return { result: 'error', ... }
        const payload = Array.isArray(r) ? r : (r && Array.isArray(r.data) ? r.data : []);
        process(payload);
      })
      .catch((err: any) => {
        console.error('Purchase summary error', err);
        // If server error and we included SupplierID in the filter, retry using fallback and client-side filter
        if (err && err.status === 500 && this.Filter?.SupplierID && String(this.Filter.SupplierID) !== '') {
          console.log('Retrying purchase query without SupplierID due to server error');
          this.http.getData(fallbackUrl)
            .then((r2: any) => {
              const rows = Array.isArray(r2) ? r2 : (r2 && Array.isArray(r2.data) ? r2.data : []);
              process(rows);
            })
            .catch((e2: any) => {
              console.error('Fallback purchase query failed', e2);
              this.data = [];
            });
        } else {
          this.data = [];
        }
      });
  }

  ngOnDestroy() {
    try { if (this.accountsSub && this.accountsSub.unsubscribe) this.accountsSub.unsubscribe(); } catch (e) {}
  }
}
