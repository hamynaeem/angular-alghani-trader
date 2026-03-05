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
    GroupBy: 'StoreName',
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
        label: 'Qty',
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
      const id = this.Filter.SupplierID;
      if (!id) return '';
      const found = (this.Suppliers || []).find((s: any) => String(s.SupplierID) === String(id) || String(s.CustomerID) === String(id) || String(s.ID) === String(id));
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
    // tslint:disable-next-line:quotemark
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";

    if (this.Filter.ProductID && this.Filter.ProductID != '')
      filter += ' And ProductID=' + this.Filter.ProductID

    if (this.Filter.SupplierID && this.Filter.SupplierID != '')
      filter += ' And SupplierID=' + this.Filter.SupplierID

    // fetch purchase rows first, but try to use cached Accounts as suppliers if available
    // prepare a fallback filter without SupplierID in case backend view doesn't expose it
    const filterNoSupplier = ("Date between '" + JSON2Date(this.Filter.FromDate) + "' and '" + JSON2Date(this.Filter.ToDate) + "'") +
      (this.Filter.ProductID && this.Filter.ProductID != '' ? ' And ProductID=' + this.Filter.ProductID : '');
    // request full filter first (may include SupplierID) and fallback to a safe filter without SupplierID
    const queryUrl = 'qrypurchasereport?flds=ProductName,PPrice,Qty,Amount&filter=' + encodeURIComponent(filter);
    const fallbackUrl = 'qrypurchasereport?flds=ProductName,PPrice,Qty,Amount&filter=' + encodeURIComponent(filterNoSupplier);

    this.http
      .getData(queryUrl)
      .then((r: any) => {
        const process = (purchasesRaw: any) => {
          // if user selected a supplier, filter client-side because backend query may omit SupplierID
          let purchases = purchasesRaw || [];
          try {
            if (this.Filter && this.Filter.SupplierID && String(this.Filter.SupplierID) !== '') {
              const sid = String(this.Filter.SupplierID);
              purchases = (purchasesRaw || []).filter((row: any) => {
                const id = row.SupplierID || row.Supplier || row.CustomerID || row.AccountID || row.Account || row.Customer;
                return id !== undefined && id !== null && String(id) === sid;
              });
            }
          } catch (e) { purchases = purchasesRaw || []; }
          console.log('Purchase rows:', purchases);
          // try to use cached accounts as suppliers immediately
          let suppliers: any[] = Array.isArray(this.Suppliers) ? this.Suppliers.slice() : [];
          if ((!suppliers || suppliers.length === 0) && this.Accounts && this.Accounts.length) {
            try {
              suppliers = (this.Accounts || []).map((ac: any) => {
                const id = ac.CustomerID || ac.ID || ac.Id || '';
                const displayName = ac.CustomerName || ac.AcctName || ac.Name || ac.Acct || '';
                return Object.assign({}, ac, { SupplierID: id, displayName });
              });
              this.Suppliers = suppliers;
              console.log('Using cached Accounts as Suppliers:', this.Suppliers);
            } catch (e) { suppliers = []; }
          }

          const mapAndSet = (supList: any[]) => {
            const mapped = purchases.map((row: any) => {
              let name = '';
              try {
                const id = row.SupplierID || row.Supplier || row.CustomerID || row.AccountID || row.Account || row.Customer;
                if (id !== undefined && id !== null && id !== '') {
                  const found = (supList || []).find((sup: any) => String(sup.SupplierID) == String(id) || String(sup.CustomerID) == String(id) || String(sup.SupplierID) == String(row.SupplierID));
                  if (found) name = found.SupplierName || found.CustomerName || found.AcctName || found.displayName || '';
                }
              } catch (e) { name = ''; }

              // fallback to cached accounts if supplier not found
              if (!name && this.Accounts && this.Accounts.length) {
                try {
                  const id = row.CustomerID || row.AccountID || row.Account || row.SupplierID || row.Supplier || row.Customer;
                  if (id !== undefined && id !== null && id !== '') {
                    const foundA = this.Accounts.find((ac: any) => String(ac.CustomerID) == String(id) || String(ac.ID) == String(id));
                    if (foundA) name = foundA.CustomerName || foundA.AcctName || '';
                  }
                } catch (e) { name = ''; }
              }

              row.SupplierName = name || this.firstAvailable(row, [
                'SupplierName',
                'CustomerName',
                'Customer',
                'Supplier',
                'CustName',
                'AccountName',
                'Account',
                'CustomerID',
              ]);
              // if still missing and user has selected a supplier, show that name
              try {
                if ((!row.SupplierName || String(row.SupplierName).trim() === '') && this.Filter && this.Filter.SupplierID) {
                  const rowId = row.SupplierID || row.Supplier || row.CustomerID || row.AccountID || row.Account || row.Customer || '';
                  if (rowId !== undefined && rowId !== null && String(rowId) === String(this.Filter.SupplierID)) {
                    row.SupplierName = this.selectedSupplierName || '';
                  }
                }
              } catch (e) {}
              try { row.Qty = Number(row.Qty || row.Quantity || row.QtyOrdered || row.QtySold || 0); } catch (e) { row.Qty = 0; }
              return row;
            });
            this.data = mapped;
          };

          if (suppliers && suppliers.length) {
            // we have suppliers from cache, map immediately
            mapAndSet(suppliers);
          } else {
            // otherwise fetch suppliers from backend then map
            this.http.getData('qrysuppliers')
              .then((s: any) => {
                const raw: any = s || [];
                let backendSup: any[] = [];
                if (Array.isArray(raw)) backendSup = raw;
                else if (raw && Array.isArray(raw.data)) backendSup = raw.data;
                else backendSup = [];
                try {
                  this.Suppliers = backendSup.map((sup: any) => {
                    const id = sup.SupplierID || sup.CustomerID || sup.ID || sup.Id || '';
                    const displayName = sup.SupplierName || sup.CustomerName || sup.AcctName || sup.Name || sup.Acct || '';
                    return Object.assign({}, sup, { SupplierID: id, displayName });
                  });
                } catch (e) { this.Suppliers = backendSup || []; }
                mapAndSet(this.Suppliers || backendSup);
              })
              .catch(() => {
                // finally fallback to cached accounts mapping
                mapAndSet(this.Accounts || []);
              });
          }
        };

        // If server returned an error structure (e.g., unknown column), retry using fallback if SupplierID was present
        if (r && r.result && String(r.result).toLowerCase() === 'error') {
          console.warn('qrypurchasereport returned error payload, attempting fallback', r);
          if (this.Filter && this.Filter.SupplierID && String(this.Filter.SupplierID) !== '') {
            this.http.getData(fallbackUrl).then((r2: any) => process(Array.isArray(r2) ? r2 : (r2 && Array.isArray(r2.data) ? r2.data : []))).catch((e: any) => { console.error('Fallback purchase query failed', e); this.data = []; });
            return;
          } else {
            process([]);
            return;
          }
        }

        // Normal path
        process(Array.isArray(r) ? r : (r && Array.isArray(r.data) ? r.data : []));
      })
      .catch((err: any) => {
        console.error('Purchase summary error', err);
        // If server error and we included SupplierID in the filter, retry without SupplierID and filter client-side
        if (err && err.status === 500 && this.Filter.SupplierID && this.Filter.SupplierID !== '') {
          console.log('Retrying purchase query without SupplierID due to server error');
          this.http.getData(fallbackUrl)
            .then((r2: any) => {
              const purchases = Array.isArray(r2) ? r2 : (r2 && Array.isArray(r2.data) ? r2.data : []);
              // map suppliers as before then client-side filter by SupplierID
              const supplierIdStr = String(this.Filter.SupplierID);
              const filtered = (purchases || []).filter((row: any) => {
                const id = row.SupplierID || row.Supplier || row.CustomerID || row.AccountID || row.Account || row.Customer;
                return id !== undefined && id !== null && String(id) === supplierIdStr;
              });
              // reuse existing mapping logic to set SupplierName for rows
              const mapped = (filtered || []).map((row: any) => {
                let name = '';
                try {
                  const id = row.SupplierID || row.Supplier || row.CustomerID || row.AccountID || row.Account || row.Customer;
                  if (id !== undefined && id !== null && id !== '') {
                    const found = (this.Suppliers || []).find((sup: any) => String(sup.SupplierID) == String(id) || String(sup.CustomerID) == String(id) || String(sup.SupplierID) == String(row.SupplierID));
                    if (found) name = found.SupplierName || found.CustomerName || found.AcctName || found.displayName || '';
                  }
                } catch (e) { name = ''; }
                if (!name && this.Accounts && this.Accounts.length) {
                  try {
                    const id = row.CustomerID || row.AccountID || row.Account || row.SupplierID || row.Supplier || row.Customer;
                    if (id !== undefined && id !== null && id !== '') {
                      const foundA = this.Accounts.find((ac: any) => String(ac.CustomerID) == String(id) || String(ac.ID) == String(id));
                      if (foundA) name = foundA.CustomerName || foundA.AcctName || '';
                    }
                  } catch (e) { name = ''; }
                }
                row.SupplierName = name || this.firstAvailable(row, [
                  'SupplierName','CustomerName','Customer','Supplier','CustName','AccountName','Account','CustomerID'
                ]);
                try {
                  if ((!row.SupplierName || String(row.SupplierName).trim() === '') && this.Filter && this.Filter.SupplierID) {
                    const rowId = row.SupplierID || row.Supplier || row.CustomerID || row.AccountID || row.Account || row.Customer || '';
                    if (rowId !== undefined && rowId !== null && String(rowId) === String(this.Filter.SupplierID)) {
                      row.SupplierName = this.selectedSupplierName || '';
                    }
                  }
                } catch (e) {}
                try { row.Qty = Number(row.Qty || row.Quantity || row.QtyOrdered || row.QtySold || 0); } catch (e) { row.Qty = 0; }
                return row;
              });
              this.data = mapped;
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
