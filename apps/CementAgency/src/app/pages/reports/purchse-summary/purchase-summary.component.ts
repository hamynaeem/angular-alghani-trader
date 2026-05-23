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
        label: 'Vehicle No',
        fldName: 'TransportNo',
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
      {
        label: 'Received amount',
        fldName: 'ReceivedAmount',
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d['ReceivedAmount']);
        },

      },
      {
        label: 'Balance',
        fldName: 'Balance',
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d['Balance']);
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
      b.Transport AS Transport, b.TransportNo AS TransportNo, b.VehicleNo AS VehicleNo,
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

      // client-side filter for ProductID when server-side SQL wasn't used
      try {
        if (this.Filter?.ProductID && String(this.Filter.ProductID) !== '') {
          const pid = String(this.Filter.ProductID);
          filtered = (filtered || []).filter((row: any) => {
            const rid = row?.ProductID ?? row?.ProductId ?? row?.Product ?? '';
            return rid !== undefined && rid !== null && String(rid) === pid;
          });
        }
      } catch (e) { /* ignore and keep existing filtered set */ }

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
        // Derive TransportNo from several possible fields returned by different backends
        try {
          row.TransportNo = this.firstAvailable(row, ['TransportNo', 'Transport', 'VehicleNo', 'TruckNo', 'Transport_No', 'Truck_No']);
        } catch (e) { row.TransportNo = this.firstAvailable(row, ['TransportNo', 'Transport', 'VehicleNo']); }
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
        // initialize Received/Balance so table has values even before aggregation
        try { row.ReceivedAmount = Number(row?.ReceivedAmount ?? row?.Received ?? 0); } catch (e) { row.ReceivedAmount = 0; }
        try {
          const amt = Number(row?.Amount || 0);
          const rec = Number(row?.ReceivedAmount || 0);
          row.Balance = Number(row?.Balance ?? (amt - rec));
        } catch (e) { row.Balance = Number(row?.Amount || 0); }
        return row;
      });

      // Fetch booking detail Received values for the displayed BookingIDs and merge
      try {
        const bookingIds = (mapped || []).map((r: any) => r?.BookingID).filter((v: any) => v !== undefined && v !== null && String(v) !== '');
        const uniq = Array.from(new Set(bookingIds));
        if (uniq.length > 0) {
          const idsFilter = 'BookingID in (' + uniq.join(',') + ')';
          const flds = 'BookingID,Received';
          // Prefer an MQRY aggregation to avoid 500s when a view doesn't expose Received
          const mqrySql = `SELECT BookingID, IFNULL(SUM(Received),0) AS Received FROM booking_details WHERE BookingID IN (${uniq.join(',')}) GROUP BY BookingID`;
          const attempts = [
            `MQRY?qrysql=${encodeURIComponent(mqrySql)}`,
            `qrybookingdetails?filter=${encodeURIComponent(idsFilter)}&flds=${flds}`,
            `qrybookingsale?filter=${encodeURIComponent(idsFilter)}&flds=${flds}`,
            `qrybookingpurchase?filter=${encodeURIComponent(idsFilter)}&flds=${flds}`,
            `booking_details?filter=${encodeURIComponent(idsFilter)}&flds=${flds}`,
          ];

          const tryNext = (i: number): Promise<any[]> => {
            if (i >= attempts.length) return Promise.resolve([]);
            const u = attempts[i];
            return this.http.getData(u).then((d: any) => {
              const rowsD: any[] = Array.isArray(d) ? d : (d && Array.isArray(d.data) ? d.data : []);
              if (rowsD && rowsD.length > 0) return rowsD;
              // empty response -> try next
              return tryNext(i + 1);
            }).catch((err: any) => {
              return tryNext(i + 1);
            });
          };

          tryNext(0).then((rowsD: any[]) => {
            const recvMap: any = {};
            (rowsD || []).forEach((rd: any) => {
              const id = rd && (rd.BookingID ?? rd.BookingId ?? rd.bookingid);
              const val = Number(rd?.Received ?? rd?.Recvd ?? rd?.received ?? 0) || 0;
              if (id !== undefined && id !== null) recvMap[String(id)] = (recvMap[String(id)] || 0) + val;
            });
            (mapped || []).forEach((m: any) => {
              try {
                const v = Number(recvMap[String(m.BookingID)] || 0);
                m.ReceivedAmount = v;
                m.Balance = Number(m.Amount || 0) - v;
              } catch (e) {}
            });
            this.data = mapped;
          }).catch(() => { this.data = mapped; });
        } else {
          this.data = mapped;
        }
      } catch (e) {
        this.data = mapped;
      }
    };

    // Primary attempt: fetch the fallback view first (safer). Only use MQRY as last-resort.
    this.http
      .getData(fallbackUrl)
      .then((r2: any) => {
        const rows = Array.isArray(r2) ? r2 : (r2 && Array.isArray(r2.data) ? r2.data : []);
        // Enrich rows with transport fields by fetching bookings and merging
        this.fetchBookingRows()
          .then((bookings: any[]) => {
            const bmap: any = {};
            (bookings || []).forEach((b: any) => {
              if (b && (b.BookingID !== undefined && b.BookingID !== null)) bmap[String(b.BookingID)] = b;
            });
            (rows || []).forEach((row: any) => {
              try {
                const bid = row?.BookingID ?? row?.BookingId ?? row?.Booking ?? '';
                const b = bmap[String(bid)];
                if (b) {
                  row.Transport = row.Transport || b.Transport || '';
                  row.TransportNo = row.TransportNo || b.TransportNo || b.Transport_No || '';
                  row.VehicleNo = row.VehicleNo || b.VehicleNo || '';
                  row.TruckNo = row.TruckNo || b.TruckNo || b.Truck_No || '';
                  // Merge supplier identifier from booking so later mapping can resolve display name
                  row.SupplierID = row.SupplierID || row.Supplier || row.CustomerID || b.SupplierID || b.Supplier || b.CustomerID || row.SupplierID;
                }
              } catch (e) {}
            });
            process(rows);
          })
          .catch((_bkErr: any) => {
            // If booking fetch fails, still process base rows
            process(rows);
          });
      })
      .catch((mqErr: any) => {
        // Fallback fetch failed; as last-resort try MQRY (some deployments support it)
        console.warn('Fallback view failed, attempting MQRY as last-resort', mqErr);
        this.http
          .getData('MQRY?qrysql=' + encodeURIComponent(sql))
          .then((r: any) => {
            const payload = Array.isArray(r) ? r : (r && Array.isArray(r.data) ? r.data : []);
            process(payload);
          })
          .catch((err: any) => {
            console.error('Purchase summary MQRY error', err);
            this.data = [];
          });
      });
  }

  ngOnDestroy() {
    try { if (this.accountsSub && this.accountsSub.unsubscribe) this.accountsSub.unsubscribe(); } catch (e) {}
  }

  private fetchBookingRows(): Promise<any[]> {
    // Try multiple endpoints to fetch booking rows safely
    // Try endpoints without `flds` first (some deployments reject requested fields),
    // then try the flds variants as a last-resort.
    const attempts = [
      'qrybooking',
      'booking',
      'qrybooking?flds=BookingID,Transport,TransportNo,VehicleNo,TruckNo',
      'booking?flds=BookingID,Transport,TransportNo,VehicleNo,TruckNo',
    ];

    const tryNext = (idx: number): Promise<any[]> => {
      if (idx >= attempts.length) return Promise.resolve([]);
      const url = attempts[idx];
      return this.http.getData(url).then((res: any) => {
        const rows = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        return rows;
      }).catch((err: any) => {
        console.warn('fetchBookingRows endpoint failed:', attempts[idx], err && err.message ? err.message : err);
        return tryNext(idx + 1);
      });
    };

    return tryNext(0);
  }
}
