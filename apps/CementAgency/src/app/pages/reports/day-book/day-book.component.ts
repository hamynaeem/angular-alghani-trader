import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import swal from 'sweetalert';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintBillService } from '../../../services/print-bill.service';
import { PrintDataService } from '../../../services/print.data.services';
import { BookingSetting } from './booking.settings';
import { ExpenseSetting } from './expense.setting';
import { VoucherSetting } from './vouchers.settings';
import { CustomerAuthService, CustomerUser } from '../../customers-data/services/customer-auth.service';

const SalesSetting = {
  Checkbox: false,
  Columns: [
    { label: 'Customer', fldName: 'CustomerName' },
    { label: 'Product Name', fldName: 'ProductName' },
    { label: 'Invoice No', fldName: 'InvoiceNo' },
    { label: 'Vehicle No', fldName: 'VehicleNo' },
    { label: 'Builty No', fldName: 'BuiltyNo' },
    { label: 'Price', fldName: 'SPrice', sum: true },
    { label: 'Qty', fldName: 'Qty', sum: true },
    { label: 'Amount', fldName: 'Amount', sum: true },
    { label: 'Received', fldName: 'Received', sum: true },
    { label: 'Balance', fldName: 'Balance', sum: true },
    { label: 'Status', fldName: 'Posted' },
  ],
  Actions: [
    { action: 'post', title: 'Post', icon: 'check', class: 'warning' },
  ],
  Data: [],
};

const PurchaseSetting = {
  Checkbox: false,
  Columns: [
    { label: 'Supplier', fldName: 'SupplierName' },
    { label: 'Product Name', fldName: 'ProductName' },
    { label: 'Price', fldName: 'PPrice', sum: true },
    { label: 'Qty', fldName: 'Qty', sum: true },
    { label: 'Amount', fldName: 'Amount', sum: true },
  ],
  Actions: [],
  Data: [],
};

const TransportSetting = {
  Columns: [
    { label: 'ID', fldName: 'ID' },
    { label: 'Date', fldName: 'Date' },
    { label: 'Transport', fldName: 'TransportName' },
    { label: 'Description', fldName: 'Description' },
    { label: 'Income', fldName: 'Income', sum: true },
    { label: 'Expense', fldName: 'Expense', sum: true },
    { label: 'Status', fldName: 'Posted' },
  ],
  Actions: [
    { action: 'edit', title: 'Edit', icon: 'pencil', class: 'primary' },
    { action: 'post', title: 'Post', icon: 'check', class: 'warning' },
    { action: 'print', title: 'Print', icon: 'print', class: 'success' },
    { action: 'delete', title: 'Delete', icon: 'trash', class: 'danger' },
  ],
  Data: [],
};

@Component({
  selector: 'app-day-book',
  templateUrl: './day-book.component.html',
  styleUrls: ['./day-book.component.scss'],
})
export class DayBookComponent implements OnInit {
  public data: object[] = [];
  public transportIncome = 0;
  public transportExpenses = 0;
  Salesman: Observable<any[]>;
  public Routes: Observable<any[]>;
  public Customers: Observable<any[]>;
  public Suppliers: Observable<any[]>;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    SalesmanID: '',
    RouteID: '',
    CustomerID: '',
    SupplierID: '',
  };
  settings: any = BookingSetting;
  nWhat = '4';
  // when true, clicking a row will open customer ledger for that row (if it has CustomerID)
  public openLedgerOnSelect = false;
  constructor(
    private http: HttpBase,
    private cachedData: CachedDataService,
    private ps: PrintDataService,
    private router: Router,
    private bill: PrintBillService
    , private customerAuth: CustomerAuthService
  ) {
    this.Salesman = this.cachedData.Salesman$;
    this.Routes = this.cachedData.routes$;
    this.Customers = this.cachedData.Accounts$;
    this.Suppliers = this.cachedData.Suppliers$;
  }

  ngOnInit() {
    // Initialize cached data
    this.cachedData.updateSuppliers();
    this.FilterData();
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
        // try common object props
        const pick = this.getValueFromPath(val, 'No') || this.getValueFromPath(val, 'no') || this.getValueFromPath(val, 'Number') || this.getValueFromPath(val, 'number') || this.getValueFromPath(val, 'ID') || this.getValueFromPath(val, 'Id');
        if (pick) return String(pick);
        try { return JSON.stringify(val); } catch { continue; }
      }
    }
    return '';
  }

  FilterData() {
    let table = '';
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "' ";

    if (!(this.Filter.CustomerID === '' || this.Filter.CustomerID === null)) {
      filter += ' and CustomerID=' + this.Filter.CustomerID;
    }

    if (!(this.Filter.SupplierID === '' || this.Filter.SupplierID === null)) {
      filter += ' and (SupplierID=' + this.Filter.SupplierID + ' or CustomerID=' + this.Filter.SupplierID + ')';
    }

    if (this.nWhat === '1') {
      this.settings = ExpenseSetting;
      table = 'qryexpense?orderby=ExpendID ';
    } else if (this.nWhat === '3') {
      this.settings = VoucherSetting;
      table = 'qryvouchers?orderby=VoucherID ';
    } else if (this.nWhat === '4') {
      this.settings = SalesSetting;
      const salesSql = `SELECT s.BookingID, s.CustomerName, s.ProductName, b.InvoiceNo, b.VehicleNo, b.BuiltyNo, s.SPrice, s.Qty, s.Amount, s.Received, (s.Amount - s.Received) as Balance, b.IsPosted FROM qrysalereport s LEFT JOIN booking b ON s.BookingID = b.BookingID WHERE s.Date BETWEEN '${JSON2Date(this.Filter.FromDate)}' AND '${JSON2Date(this.Filter.ToDate)}' ORDER BY s.Date, s.BookingID`;
      table = 'MQRY?qrysql=' + encodeURIComponent(salesSql);
      filter = '1=1';
    } else if (this.nWhat === '5') {
      this.settings = PurchaseSetting;
      table = 'qrypurchasereport?orderby=Date,BookingID&flds=BookingID,ProductName,PPrice,Qty,Amount ';
    } else if (this.nWhat === '6') {
      this.settings = TransportSetting;
      table = 'transportdetails?orderby=ID ';
    }

    const queryUrl = table + '&filter=' + filter;

    const processResponse = (r: any) => {
      // normalize rows and ensure Posted flag exists
      const normalizePosted = (row: any) => {
        // Only log first few rows to avoid console spam
        const shouldLog = (r?.indexOf && r.indexOf(row) < 2) || false;
        if (shouldLog) {
          console.log('Normalizing row:', {
            BookingID: row.BookingID,
            IsPosted: row.IsPosted,
            IsPostedType: typeof row.IsPosted,
            keys: Object.keys(row)
          });
        }
        
        if ('IsPosted' in row) {
          // Handle multiple possible formats from backend
          const isPostedValue = row.IsPosted;
          const isPosted = (isPostedValue === '1' || 
                          isPostedValue === 1 || 
                          isPostedValue === true || 
                          isPostedValue === 'true' ||
                          isPostedValue === 'True' ||
                          (typeof isPostedValue === 'string' && isPostedValue.toLowerCase() === 'posted'));
          
          row.Posted = isPosted ? 'Posted' : 'Unposted';
          // Normalize IsPosted to string format for consistency
          row.IsPosted = isPosted ? '1' : '0';
        } else {
          // Check for alternative field names that might contain posting status
          const altFields = ['posted', 'is_posted', 'PostingStatus', 'Status'];
          let found = false;
          
          for (const field of altFields) {
            if (field in row) {
              const val = row[field];
              const isPosted = (val === '1' || val === 1 || val === true || val === 'true' || val === 'Posted');
              row.IsPosted = isPosted ? '1' : '0';
              row.Posted = isPosted ? 'Posted' : 'Unposted';
              found = true;
              break;
            }
          }
          
          if (!found) {
            // Default to Unposted if no posting field exists
            row.IsPosted = '0';
            row.Posted = 'Unposted';
          }
        }
        
        return row;
      };

      if (this.nWhat === '6') {
        // transport rows: ensure TransportName and Description are present by loading transports
        this.http.getData('transports').then((tr: any) => {
          const map: any = {};
          (tr || []).forEach((t: any) => {
            if (t && (t.TransportID !== undefined)) map[t.TransportID] = t.TransportName || t.TransportID;
          });

          const mapped = (r || []).map((row: any) => {
            row = normalizePosted(row);
            row.TransportName = row.TransportName || map[row.TransportID] || map[(row.TransportID || '').toString()] || '';
            row.Description = row.Description || row.Details || row.DetailsString || '';
            // expose ID consistently
            row.ID = row.ID || row.id || row.TransportDetailID || row.TransportID;
            return row;
          });
          this.data = mapped;
          this.computeTransportTotals(mapped);
        }).catch(() => {
          // fallback: still normalize posted and description
          const mapped = (r || []).map((row: any) => {
            row = normalizePosted(row);
            row.Description = row.Description || row.Details || row.DetailsString || '';
            row.ID = row.ID || row.id || row.TransportDetailID || row.TransportID;
            return row;
          });
          this.data = mapped;
          this.computeTransportTotals(mapped);
        });
      } else {
        const mapped = (r || []).map((x: any) => normalizePosted(x));
        
        // Debug: log the first few mapped entries to see the status detection
        console.log('Raw data from backend:', (r || []).slice(0, 3));
        console.log('Mapped data after normalization:', mapped.slice(0, 3));
        
        // For bookings ensure common fields exist so table shows InvoiceNo/VehicleNo/BuiltyNo
        if (this.nWhat === '2') {
          const normalized = mapped.map((row: any) => {
            // ensure CustomerName exists on booking rows (try several candidate fields)
            row.CustomerName = this.firstAvailable(row, [
              'CustomerName',
              'Customer',
              'SupplierName',
              'Supplier',
              'CustName',
              'AccountName',
              'Account'
            ]);
            row.InvoiceNo = this.firstAvailable(row, [
              'InvoiceNo',
              'InvoiceID',
              'InvNo',
              'Invoice',
              'InvoiceNumber',
              'Invoice_No',
              'invoice_no',
              'BookingInvoice',
              'Booking_Invoice',
              'Invoice.No',
              'Invoice.number',
            ]);

            row.VehicleNo = this.firstAvailable(row, [
              'VehicleNo',
              'Vehicle',
              'VehNo',
              'VehiclePlate',
              'Vehicle_RegNo',
              'Vehicle_No',
              'vehicle_no',
              'Vehicle.No',
              'Vehicle.Plate',
            ]);

            row.BuiltyNo = this.firstAvailable(row, [
              'BuiltyNo',
              'BiltyNo',
              'Builty',
              'Builty_No',
              'builty_no',
              'Bilty_No',
              'Builty.Number',
              'Builty.No',
            ]);

            // Keep booking report robust: compute Received/Balance client-side
            // because SQL expressions in `flds` can fail on some backend setups.
            const receivedRaw = this.firstAvailable(row, [
              'Received',
              'RecvAmount',
              'PaidAmount',
              'Paid',
              'CashReceived',
            ]);
            const netAmount = Number(row.NetAmount || row.Amount || 0) || 0;
            const received = Number(receivedRaw || 0) || 0;
            row.Received = received;
            row.Balance = netAmount - received;

            return row;
          });
          // log sample to help debug missing fields
          try {
            console.log('Booking normalized sample:', normalized && normalized.length ? normalized.slice(0, 5) : normalized);
          } catch (e) {}

          // Load received values from booking sales and merge by BookingID.
          const bookingIds = normalized
            .map((row: any) => Number(row.BookingID || 0))
            .filter((id: number) => id > 0);

          if (bookingIds.length > 0) {
            const salesFilter = 'BookingID in (' + bookingIds.join(',') + ')';
            this.http
              .getData(
                'qrybookingsale?flds=BookingID,CustomerName,Amount,Total,NetAmount,Received,PaidAmount,RecvAmount&filter=' +
                  salesFilter
              )
              .then((sales: any) => {
                const receivedByBooking: any = {};
                const amountByBooking: any = {};
                const customerByBooking: any = {};

                (sales || []).forEach((s: any) => {
                  const bid = Number(
                    this.firstAvailable(s, ['BookingID', 'bookingID', 'BookingId']) || 0
                  );
                  const amt = Number(
                    this.firstAvailable(s, ['Amount', 'Total', 'NetAmount']) || 0
                  ) || 0;
                  const rec = Number(
                    this.firstAvailable(s, [
                      'Received',
                      'RecvAmount',
                      'PaidAmount',
                      'Paid',
                      'CashReceived',
                    ]) || 0
                  );

                  if (bid > 0) {
                    receivedByBooking[bid] =
                      (Number(receivedByBooking[bid] || 0) || 0) +
                      (Number(rec || 0) || 0);

                    amountByBooking[bid] =
                      (Number(amountByBooking[bid] || 0) || 0) +
                      (Number(amt || 0) || 0);

                    if (!customerByBooking[bid]) {
                      customerByBooking[bid] = this.firstAvailable(s, [
                        'CustomerName',
                        'Customer',
                        'CustName',
                      ]);
                    }
                  }
                });

                const merged = normalized.map((row: any) => {
                  const bid = Number(row.BookingID || 0);
                  const currentReceived = Number(row.Received || 0) || 0;
                  const mergedReceived =
                    currentReceived > 0
                      ? currentReceived
                      : Number(receivedByBooking[bid] || 0) || 0;
                  const salesAmount = Number(amountByBooking[bid] || 0) || 0;
                  const netAmount = salesAmount > 0
                    ? salesAmount
                    : Number(row.NetAmount || row.Amount || 0) || 0;

                  // Booking view should show sales-side values only.
                  row.CustomerName = customerByBooking[bid] || row.CustomerName;
                  row.Amount = netAmount;
                  row.NetAmount = netAmount;
                  row.Discount = 0;
                  row.Carriage = 0;
                  row.Received = mergedReceived;
                  row.Balance = netAmount - mergedReceived;
                  return row;
                });

                this.data = merged;
              })
              .catch(() => {
                // Fallback to normalized data if booking-sale query fails.
                this.data = normalized;
              });
          } else {
            this.data = normalized;
          }
          
          // Debug: Check if any entries actually have Posted status from backend
          const postedCount = normalized.filter((row: any) => row.Posted === 'Posted').length;
          console.log(`Found ${postedCount} posted entries out of ${normalized.length} total entries`);
          
          // Temporary debugging: Log specific fields we're checking
          normalized.slice(0, 2).forEach((row: any, index: number) => {
            console.log(`Row ${index} debug:`, {
              BookingID: row.BookingID,
              IsPosted: row.IsPosted,
              Posted: row.Posted,
              allKeys: Object.keys(row)
            });
          });
        } else if (this.nWhat === '5') {
          // For purchase report: resolve supplier names via qrybooking (which joins booking.SupplierID -> customers.CustomerName)
          const purchases = mapped.map((row: any) => {
            row.ProductName = this.firstAvailable(row, [
              'ProductName',
              'Product',
              'PName',
              'ItemName',
              'Product_Name',
            ]);
            return row;
          });

          // Fetch booking records to get supplier names (qrybooking.CustomerName = supplier name)
          const bookingFilter = "Date between '" + JSON2Date(this.Filter.FromDate) + "' and '" + JSON2Date(this.Filter.ToDate) + "'";
          this.http.getData('qrybooking?flds=BookingID,SupplierID,CustomerName&filter=' + bookingFilter)
            .then((bookings: any) => {
              const bookingMap: any = {};
              (bookings || []).forEach((b: any) => {
                if (b.BookingID) {
                  bookingMap[String(b.BookingID)] = b.CustomerName || '';
                }
              });

              const mappedRows = purchases.map((row: any) => {
                // First try to get supplier name from booking map using BookingID
                const bookingId = row.BookingID || row.bookingID;
                if (bookingId && bookingMap[String(bookingId)]) {
                  row.SupplierName = bookingMap[String(bookingId)];
                } else {
                  row.SupplierName = this.firstAvailable(row, ['SupplierName', 'CustomerName', 'Supplier', 'Customer']);
                }
                return row;
              });
              this.data = mappedRows;
            })
            .catch(() => {
              // Fallback: try resolving from supplier list
              const sub = this.cachedData.Suppliers$.subscribe((list: any[]) => {
                const supList = list || [];
                const mappedRows = purchases.map((row: any) => {
                  const id = row.SupplierID || row.CustomerID;
                  let name = '';
                  if (id) {
                    const found = supList.find((s: any) => String(s.CustomerID || s.SupplierID) === String(id));
                    if (found) name = found.CustomerName || found.SupplierName || '';
                  }
                  row.SupplierName = name || this.firstAvailable(row, ['SupplierName', 'CustomerName', 'Supplier', 'Customer']);
                  return row;
                });
                this.data = mappedRows;
                try { sub.unsubscribe(); } catch (e) {}
              });
            });
        } else {
          this.data = mapped;
        }
        this.computeTransportTotals(this.data);
      }
    };

    this.http
      .getData(queryUrl)
      .then((r: any) => processResponse(r))
      .catch((err: any) => {
        console.error('Fetch error', err);
        console.error('Error details:', {
          message: err?.message,
          status: err?.status,
          statusText: err?.statusText,
          error: err?.error,
          url: queryUrl
        });
        try {
          const errorMsg = (err && err.error && err.error.message) || 
                         (err && err.message) || 
                         `Server error (${err?.status || 'Unknown'}): ${err?.statusText || 'Failed to fetch booking data'}`;
          swal('Data Load Error', errorMsg, 'error');
        } catch (e) {}
        this.data = [];
      });
  }

  computeTransportTotals(rows: any[]) {
    try {
      let inc = 0;
      let exp = 0;
      if (!rows || !Array.isArray(rows)) {
        this.transportIncome = 0;
        this.transportExpenses = 0;
        return;
      }

      rows.forEach((row: any) => {
        const combined = Object.keys(row || {})
          .map((k) => (row[k] || '').toString())
          .join(' ')

        if (!combined.includes('transport')) return;

        const credit = Number(row.Credit || row.credit || row.Cr || row.CR || 0) || 0;
        const debit = Number(row.Debit || row.debit || row.Dr || row.DR || 0) || 0;
        const amount = Number(row.Amount || row.amount || row.Value || 0) || 0;

        if (credit > 0) inc += credit;
        else if (debit > 0) exp += debit;
        else if (amount > 0) {
          // heuristics: if row has a positive Amount but no explicit debit/credit, treat as income
          inc += amount;
        }
      });

      this.transportIncome = inc;
      this.transportExpenses = exp;
    } catch (e) {
      this.transportIncome = 0;
      this.transportExpenses = 0;
      console.error('computeTransportTotals error', e);
    }
  }
  Clicked(e: any) {
    let table: any = {};
    let url = '';
    console.log(e);
    
    // Validate event data
    if (!e || !e.data || !e.action) {
      console.error('Invalid event data:', e);
      swal('Error', 'Invalid action data', 'error');
      return;
    }
    
    if (e.action === 'delete') {
      console.log(e.action);

      // build delete payload based on current type
      if (this.nWhat === '3') {
        table = { ID: e.data.VoucherID, Table: 'V' };
      } else if (this.nWhat === '2') {
        table = { ID: e.data.InvoiceID, Table: 'P' };
      } else if (this.nWhat === '1') {
        table = { ID: e.data.ExpendID, Table: 'E' };
      } else if (this.nWhat === '6') {
        // transport: use transportdetails delete endpoint
        const id = e.data.ID || e.data.id;
        const doDeleteTransport = () => {
          if (!id) {
            swal('Error', 'Invalid transport delete payload (missing ID)', 'error');
            return;
          }
          swal({ text: 'Delete this record!', icon: 'warning', buttons: { cancel: true, confirm: true } }).then((willDelete) => {
            if (willDelete) {
              this.http.Delete('transportdetails', id.toString()).then(() => {
                this.FilterData();
                swal('Deleted!', 'Your data has been deleted!', 'success');
              }).catch((er) => {
                swal('Oops!', (er && er.error && er.error.message) || 'Error while deleting transport record', 'error');
              });
            }
          });
        };

        if (Number(e.data.IsPosted) === 0) {
          doDeleteTransport();
        } else {
          swal({ title: 'Posted Record', text: 'This record is posted. Forcing delete will remove the source row but will NOT automatically reverse accounting entries. Continue?', icon: 'warning', buttons: { cancel: true, confirm: { text: 'Force Delete', value: true } } }).then((force) => {
            if (force) doDeleteTransport();
          });
        }
        return;
      }

      const doDelete = () => {
        // validate payload
        if (!table || !table.ID) {
          console.error('Invalid delete payload', table);
          swal('Error', 'Invalid delete payload (missing ID)', 'error');
          return;
        }

        swal({
          text: 'Delete this record!',
          icon: 'warning',
          buttons: {
            cancel: true,
            confirm: true,
          },
        }).then((willDelete) => {
          if (willDelete) {
            console.log('Deleting', table);
            this.http
              .postTask('delete', table)
              .then((res) => {
                console.log('Delete response', res);
                this.FilterData();
                swal('Deleted!', 'Your data has been deleted!', 'success');
              })
              .catch((er) => {
                console.error('Delete error', er);
                // show server error message when available
                const msg = (er && er.error && er.error.message) || (er && er.message) || 'Error while deleting voucher';
                swal('Oops!', msg, 'error');
              });
          }
        });
      };

      if (Number(e.data.IsPosted) === 0) {
        doDelete();
      } else {
        // warn user and allow forced delete if they confirm
        swal({
          title: 'Posted Record',
          text:
            'This record is posted. Forcing delete will remove the source row but will NOT automatically reverse accounting entries. Continue?',
          icon: 'warning',
          buttons: {
            cancel: true,
            confirm: { text: 'Force Delete', value: true },
          },
        }).then((force) => {
          if (force) {
            doDelete();
          }
        });
      }
    } else if (e.action === 'print') {
      if (this.nWhat === '1') {
        if (e.data.Type == '1')
          this.router.navigateByUrl('/print/printinvoice/' + e.data.InvoiceID);
        else {
          this.http.getData('printbill/' + e.data.InvoiceID).then((d: any) => {
            d.Business = this.http.GetBData();
            console.log(d);
            this.bill.PrintPDFBill_A5(d);
            // this.bill.printTest();
          });
        }
      } else if (this.nWhat === '2') {
          this.router.navigateByUrl('/print/printpurchase/' + e.data.InvoiceID);
        } else if (this.nWhat === '3') {
          this.router.navigateByUrl('/print/printvoucher/' + e.data.VoucherID);
        } else if (this.nWhat === '6') {
          const id = e.data.ID || e.data.id;
          if (id) this.router.navigateByUrl('/transport/expense/' + id);
        }
    } else if (e.action === 'edit') {
        if (Number(e.data.IsPosted) === 0) {
        if (this.nWhat === '1') {

            this.router.navigateByUrl('/cash/expense/' + e.data.ExpendID);
            // this.http.openModal(CreditSaleComponent, {EditID: e.data.InvoiceID})

        } else if (this.nWhat === '2') {
          this.router.navigateByUrl('/purchase/booking/' + e.data.BookingID);
        } else if (this.nWhat === '3') {
          if (e.data.Credit > 0) {
            this.router.navigateByUrl('/cash/cashreceipt/' + e.data.VoucherID);
          } else {
            this.router.navigateByUrl('/cash/cashpayment/' + e.data.VoucherID);
          }
        } else if (this.nWhat === '6') {
          const id = e.data.ID || e.data.id;
          if (id) this.router.navigateByUrl('/transport/expense/' + id);
        }
      } else {
        swal('Oops!', 'Can not edit posted data', 'error');
      }
    } else if (e.action === 'post') {
      // toggle post/unpost depending on current IsPosted
        if (Number(e.data.IsPosted) === 0) {
        if (this.nWhat === '1') {
          url = 'postexpense/' + e.data.ExpendID;
        } else if (this.nWhat === '2' || this.nWhat === '4') {
          // Try different booking post endpoints that might exist
          const bookingId = e.data.BookingID;
          if (!bookingId) {
            swal('Error', 'Invalid BookingID for posting', 'error');
            return;
          }
          
          // Try the standard postbooking endpoint first, but prepare to try alternatives
          url = 'postbooking/' + bookingId;
          console.log('Attempting to post booking:', bookingId, 'URL:', url);
          console.log('Full booking data:', e.data);
          console.log('Available booking fields:', Object.keys(e.data));
          console.log('BookingID existence check:', {
            exists: !!bookingId,
            value: bookingId,
            type: typeof bookingId
          });
        } else if (this.nWhat === '3') {
          url = 'postvouchers/' + e.data.VoucherID;
        } else if (this.nWhat === '6') {
          const id = e.data.ID || e.data.id;
          if (id) url = 'posttransport/' + id;
        }

        // Validate URL was set
        if (!url) {
          swal('Error', 'Unable to determine posting URL', 'error');
          return;
        }

        // Prepare posting payload with required accounting fields
        let postPayload: any = {};
        
        if (this.nWhat === '1') {
          // For expenses, prepare debit payload
          const amount = Number(e.data.Amount) || Number(e.data.NetAmount) || 0;
          postPayload = {
            ExpendID: e.data.ExpendID,
            Debit: amount,
            Credit: 0,
            Amount: amount,
            AccountID: e.data.AccountID || e.data.CustomerID || 0,
            Description: e.data.Description || `Expense #${e.data.ExpendID}`,
            Type: 'DR'
          };
        } else if (this.nWhat === '2' || this.nWhat === '4') {
          // For bookings, use empty payload since backend doesn't read POST data
          // It only uses the ID from the URL parameter
          postPayload = {};
          
          console.log('Booking post payload (empty - backend reads from URL):', postPayload);
        } else if (this.nWhat === '3') {
          // For vouchers, prepare debit/credit payload based on voucher type
          const amount = Number(e.data.Amount) || Number(e.data.NetAmount) || 0;
          const credit = Number(e.data.Credit) || 0;
          const debit = Number(e.data.Debit) || 0;
          
          if (credit > 0) {
            postPayload = {
              VoucherID: e.data.VoucherID,
              Debit: 0,
              Credit: credit,
              Amount: credit,
              AccountID: e.data.AccountID || e.data.CustomerID || 0,
              Description: e.data.Description || `Voucher #${e.data.VoucherID}`,
              Type: 'CR'
            };
          } else {
            postPayload = {
              VoucherID: e.data.VoucherID,
              Debit: debit || amount,
              Credit: 0,
              Amount: debit || amount,
              AccountID: e.data.AccountID || e.data.CustomerID || 0,
              Description: e.data.Description || `Voucher #${e.data.VoucherID}`,
              Type: 'DR'
            };
          }
        } else if (this.nWhat === '6') {
          // For transport, prepare payload
          const income = Number(e.data.Income) || 0;
          const expense = Number(e.data.Expense) || 0;
          const amount = income || expense;
          
          postPayload = {
            ID: e.data.ID || e.data.id,
            Debit: expense,
            Credit: income,
            Amount: amount,
            AccountID: e.data.TransportID || 0,
            Description: e.data.Description || e.data.Details || `Transport #${e.data.ID || e.data.id}`,
            Type: income > 0 ? 'CR' : 'DR'
          };
        }

        // Show loading message
        swal({
          title: 'Posting...',
          text: 'Please wait while we post your entry.',
          icon: 'info',
          buttons: false as any,
          closeOnClickOutside: false,
          closeOnEsc: false
        });

        // Posting function with fallback for bookings
        const attemptPost = (apiUrl: string, payload: any, isRetry = false) => {
          console.log('=== POSTING DEBUG ===');
          console.log('URL:', apiUrl);
          console.log('Payload:', payload);
          console.log('Is Retry:', isRetry);
          console.log('BookingID:', e.data.BookingID);
          
          this.http.postTask(apiUrl, payload).then((response: any) => {
            console.log('=== POST RESPONSE DEBUG ===');
            console.log('Raw response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', response ? Object.keys(response) : 'No keys');
            
            // Check for various success/error indicators
            const isError = response && (
              response.error === true || 
              response.status === 'error' || 
              response.success === false ||
              (response.message && typeof response.message === 'string' && 
               (response.message.toLowerCase().includes('error') || 
                response.message.toLowerCase().includes('failed') ||
                response.message.toLowerCase().includes('exception')))
            );
            
            const hasHttpError = response && response.statusCode && response.statusCode >= 400;
            const isSuccess = !isError && !hasHttpError;
            
            console.log('Success determination:', { 
              isError, 
              hasHttpError, 
              isSuccess, 
              responseMsg: response?.msg || response?.message 
            });
            
            if (isSuccess || (response && response.msg && response.msg.includes('posted'))) {
              console.log('✅ Post successful, updating local data');
              
              // Update the local data immediately
              e.data.IsPosted = '1';
              e.data.Posted = 'Posted';
              
              // Also update in the main data array to ensure consistency
              const dataIndex = this.data.findIndex((item: any) => {
                if (this.nWhat === '1') return item.ExpendID === e.data.ExpendID;
                if (this.nWhat === '2' || this.nWhat === '4') return item.BookingID === e.data.BookingID;
                if (this.nWhat === '3') return item.VoucherID === e.data.VoucherID;
                if (this.nWhat === '6') return (item.ID || item.id) === (e.data.ID || e.data.id);
                return false;
              });
              
              if (dataIndex !== -1) {
                (this.data as any[])[dataIndex].IsPosted = '1';
                (this.data as any[])[dataIndex].Posted = 'Posted';
                console.log('Updated local data at index:', dataIndex, 'New status:', (this.data as any[])[dataIndex].Posted);
              }
              
              swal('Posted!', 'Your entry has been successfully posted!', 'success');
              
              // Refresh data to ensure server sync - with longer delay for server processing
              setTimeout(() => {
                console.log('Refreshing data after posting...');
                this.FilterData();
              }, 2000); // Increased delay
            } else {
              console.log('❌ Post response indicates failure:', response);
              
              // If this is the first attempt for a booking, try direct endpoint call
              if ((this.nWhat === '2' || this.nWhat === '4') && !isRetry) {
                console.log('Trying direct postbooking endpoint...');
                attemptPost(`postbooking/${e.data.BookingID}`, {}, true);
                return;
              }
              
              swal('Warning', `Post request completed but may have failed. Server response: ${JSON.stringify(response)}`, 'warning');
              
              // Still refresh to see actual server state
              setTimeout(() => {
                this.FilterData();
              }, 1500);
            }
          }).catch((err) => {
            console.error('Post error', err);
            
            // For bookings, try alternative method on error
            if ((this.nWhat === '2' || this.nWhat === '4') && !isRetry) {
              console.log('Primary booking post failed, trying simpler payload...');
              // Don't use putTask as it doesn't exist, try with empty payload instead
              this.http.postTask(`postbooking/${e.data.BookingID}`, {}).then((altResponse: any) => {
                console.log('Alternative post response:', altResponse);
                e.data.IsPosted = '1';
                e.data.Posted = 'Posted';
                
                const dataIndex = this.data.findIndex((item: any) => item.BookingID === e.data.BookingID);
                if (dataIndex !== -1) {
                  (this.data as any[])[dataIndex].IsPosted = '1';
                  (this.data as any[])[dataIndex].Posted = 'Posted';
                }
                
                swal('Posted!', 'Your entry has been successfully posted!', 'success');
                setTimeout(() => this.FilterData(), 1000);
              }).catch((altErr) => {
                console.error('Alternative post also failed:', altErr);
                
                // Better error message extraction
                let errorMessage = '';
                if (err && err.error) {
                  if (typeof err.error === 'string') {
                    errorMessage = err.error;
                  } else if (err.error.message) {
                    errorMessage = err.error.message;
                  } else {
                    errorMessage = JSON.stringify(err.error);
                  }
                } else if (err && err.message) {
                  errorMessage = err.message;
                } else if (typeof err === 'string') {
                  errorMessage = err;
                } else {
                  errorMessage = 'Unknown server error';
                }
                
                // Check if error indicates it's already posted
                if (errorMessage.toLowerCase().includes('already') && errorMessage.toLowerCase().includes('post')) {
                  e.data.IsPosted = '1';
                  e.data.Posted = 'Posted';
                  
                  // Update in main data array too
                  const dataIndex = this.data.findIndex((item: any) => {
                    if (this.nWhat === '1') return item.ExpendID === e.data.ExpendID;
                    if (this.nWhat === '2' || this.nWhat === '4') return item.BookingID === e.data.BookingID;
                    if (this.nWhat === '3') return item.VoucherID === e.data.VoucherID;
                    if (this.nWhat === '6') return (item.ID || item.id) === (e.data.ID || e.data.id);
                    return false;
                  });
                  
                  if (dataIndex !== -1) {
                    (this.data as any[])[dataIndex].IsPosted = '1';
                    (this.data as any[])[dataIndex].Posted = 'Posted';
                  }
                  
                  swal('Posted!', 'Entry was already posted on server. Status updated.', 'success');
                  this.FilterData();
                  return;
                }
                
                swal('Error!', `Failed to post entry: ${errorMessage}`, 'error');
              });
              return;
            }
            
            // Standard error handling for non-booking types
            let errorMessage = '';
            if (err && err.error) {
              if (typeof err.error === 'string') {
                errorMessage = err.error;
              } else if (err.error.message) {
                errorMessage = err.error.message;
              } else {
                errorMessage = JSON.stringify(err.error);
              }
            } else if (err && err.message) {
              errorMessage = err.message;
            } else if (typeof err === 'string') {
              errorMessage = err;
            } else {
              errorMessage = 'Unknown server error';
            }
            
            // Check if error indicates it's already posted
            if (errorMessage.toLowerCase().includes('already') && errorMessage.toLowerCase().includes('post')) {
              e.data.IsPosted = '1';
              e.data.Posted = 'Posted';
              
              // Update in main data array too
              const dataIndex = this.data.findIndex((item: any) => {
                if (this.nWhat === '1') return item.ExpendID === e.data.ExpendID;
                if (this.nWhat === '2' || this.nWhat === '4') return item.BookingID === e.data.BookingID;
                if (this.nWhat === '3') return item.VoucherID === e.data.VoucherID;
                if (this.nWhat === '6') return (item.ID || item.id) === (e.data.ID || e.data.id);
                return false;
              });
              
              if (dataIndex !== -1) {
                (this.data as any[])[dataIndex].IsPosted = '1';
                (this.data as any[])[dataIndex].Posted = 'Posted';
              }
              
              swal('Posted!', 'Entry was already posted on server. Status updated.', 'success');
              this.FilterData();
              return;
            }
            
            swal('Error!', `Failed to post entry: ${errorMessage}`, 'error');
          });
        };

        // Start the posting attempt
        attemptPost(url, postPayload);
      } else {
        // currently posted: ask to unpost
        swal({
          text: 'This record is already posted. Do you want to unpost it?',
          icon: 'warning',
          buttons: { cancel: true, confirm: true },
        }).then((confirm) => {
          if (!confirm) return;
          let uurl = '';
          if (this.nWhat === '1') {
            uurl = 'unpostexpense/' + (e.data.ExpendID || e.data.ExpID || e.data.ID || e.data.id);
          } else if (this.nWhat === '2' || this.nWhat === '4') {
            uurl = 'unpostbooking/' + e.data.BookingID;
            console.log('Unposting booking with BookingID:', e.data.BookingID);
          } else if (this.nWhat === '3') {
            uurl = 'unpostvouchers/' + e.data.VoucherID;
          } else if (this.nWhat === '6') {
            const id = e.data.ID || e.data.id;
            if (id) uurl = 'unposttransport/' + id;
          }
          if (!uurl) {
            swal('Error', 'Unpost not supported for this type', 'error');
            return;
          }
          
          // Prepare unpost payload with transaction ID
          let unpostPayload: any = {};
          if (this.nWhat === '1') {
            unpostPayload = { ExpendID: e.data.ExpendID, ID: e.data.ExpendID };
          } else if (this.nWhat === '2' || this.nWhat === '4') {
            unpostPayload = { BookingID: e.data.BookingID, ID: e.data.BookingID };
          } else if (this.nWhat === '3') {
            unpostPayload = { VoucherID: e.data.VoucherID, ID: e.data.VoucherID };
          } else if (this.nWhat === '6') {
            const id = e.data.ID || e.data.id;
            unpostPayload = { ID: id, TransportID: id };
          }
          
          this.http.postTask(uurl, unpostPayload).then((_r) => {
            // Update the local data immediately
            e.data.IsPosted = '0';
            e.data.Posted = 'Unposted';
            
            // Also update in the main data array to ensure consistency
            const dataIndex = this.data.findIndex((item: any) => {
              if (this.nWhat === '1') return item.ExpendID === e.data.ExpendID;
              if (this.nWhat === '2' || this.nWhat === '4') return item.BookingID === e.data.BookingID;
              if (this.nWhat === '3') return item.VoucherID === e.data.VoucherID;
              if (this.nWhat === '6') return (item.ID || item.id) === (e.data.ID || e.data.id);
              return false;
            });
            
            if (dataIndex !== -1) {
              (this.data as any[])[dataIndex].IsPosted = '0';
              (this.data as any[])[dataIndex].Posted = 'Unposted';
              console.log('Updated local data at index:', dataIndex, 'New status:', (this.data as any[])[dataIndex].Posted);
            }
            
            swal('Unpost!', 'Your data has been unposted!', 'success');
            
            // Refresh data to ensure server sync
            setTimeout(() => {
              console.log('Refreshing data after unposting...');
              this.FilterData();
            }, 500);
          }).catch((err) => {
            console.error('Unpost error', err);
            
            // Better error message extraction
            let errorMessage = '';
            if (err && err.error) {
              if (typeof err.error === 'string') {
                errorMessage = err.error;
              } else if (err.error.message) {
                errorMessage = err.error.message;
              } else {
                errorMessage = JSON.stringify(err.error);
              }
            } else if (err && err.message) {
              errorMessage = err.message;
            } else if (typeof err === 'string') {
              errorMessage = err;
            } else {
              errorMessage = 'Unknown server error';
            }
            
            swal('Oops!', `Failed to unpost entry: ${errorMessage}`, 'error');
          });
        });
      }
    } else if (e.action === 'fullpay' && this.nWhat === '1') {
      if (Number(e.data.IsPosted) === 1) {
        swal('Oops!', 'Can not pay posted invoice', 'error');
        return;
      }
      swal({
        text: 'Full pay this invoice ?',
        icon: 'warning',
        buttons: {
          cancel: true,
          confirm: true,
        },
      }).then((willPay) => {
        if (willPay) {
          this.http
            .postTask('payinvoice', {
              InvoiceID: e.data.InvoiceID,
              Amount: e.data.Balance,
            })
            .then((_r) => {
              this.FilterData();
              swal('Paid!', 'Your data has been paid!', 'success');
            })
            .catch((_er) => {
              swal('Oops!', 'Error while paying invoice', 'error');
            });
        }
      });
    } else if (e.action === 'partialpay' && this.nWhat === '1') {
      if (Number(e.data.IsPosted) === 1) {
        swal('Oops!', 'Can not pay posted invoice', 'error');
        return;
      }
      swal({
        text: 'Full pay this invoice ?',
        icon: 'warning',
        content: { element: 'input' },
      }).then((willPay) => {
        if (willPay) {
          console.log(willPay);

          this.http
            .postTask('payinvoice', {
              InvoiceID: e.data.InvoiceID,
              Amount: willPay,
            })
            .then((r) => {
              this.FilterData();
              swal('Paid!', 'Your data has been paid!', 'success');
            })
            .catch((er) => {
              swal('Oops!', 'Error while paying invoice', 'error');
            });
        }
      });
    } else if (e.action === 'return' && this.nWhat === '1') {
      swal({
        text: 'Full return this invoice ?',
        icon: 'warning',
        buttons: {
          cancel: true,
          confirm: true,
        },
      }).then((_res) => {
        if (e.data.DtCr === 'DT') {
          swal({
            text: 'Invalid Invoice type',
            icon: 'error',
          });
          return;
        }
        this.http
          .postTask('makereturn', { InvoiceID: e.data.InvoiceID })
          .then((r: any) => {
            this.FilterData();
            swal(
              'Return!',
              'Return Invoice have been created. Invoice # ' + r.id,
              'success'
            );
          })
          .catch((_er) => {
            swal('Oops!', 'Error while paying invoice', 'error');
          });
      });
    }
  }
  RowClicked(e: any) {
    // when user clicks a row: if openLedgerOnSelect is enabled, open ledger for customer; otherwise
    // if we're showing Expenses (nWhat==='1'), post the expense
    try {
      const row = e && e.data ? e.data : null;
      if (!row) return;

      if (this.nWhat === '2') {
        const bookingId = row.BookingID || row.BookingId || row.bookingID || row.ID;
        if (!bookingId) {
          swal('Info', 'Booking ID not found for this row.', 'info');
          return;
        }

        this.http
          .getData(
            'qrybookingsale?filter=BookingID=' + bookingId
          )
          .then((sales: any) => {
            const rows = (sales || []).map((s: any) => {
              const customer = this.firstAvailable(s, [
                'CustomerName',
                'Customer',
                'CustName',
              ]);
              const product = this.firstAvailable(s, [
                'ProductName',
                'Product',
                'PName',
              ]);
              const qty = Number(
                this.firstAvailable(s, ['Qty', 'SaleQty', 'Quantity']) || 0
              ) || 0;
              const price = Number(
                this.firstAvailable(s, ['Price', 'Rate', 'SPrice']) || 0
              ) || 0;
              const amount = Number(
                this.firstAvailable(s, ['Amount', 'Total', 'NetAmount']) ||
                  qty * price
              ) || 0;
              const received = Number(
                this.firstAvailable(s, [
                  'Received',
                  'RecvAmount',
                  'PaidAmount',
                  'Paid',
                ]) || 0
              ) || 0;

              return {
                customer,
                product,
                qty,
                price,
                amount,
                received,
              };
            });

            if (!rows.length) {
              swal('Sale Details', 'No sale details found for this booking.', 'info');
              return;
            }

            const totalAmount = rows.reduce((acc: number, x: any) => acc + (x.amount || 0), 0);
            const totalReceived = rows.reduce((acc: number, x: any) => acc + (x.received || 0), 0);

            const body = rows
              .map(
                (x: any) =>
                  '<tr>' +
                  '<td style="padding:4px;border:1px solid #ddd;">' + (x.customer || '') + '</td>' +
                  '<td style="padding:4px;border:1px solid #ddd;">' + (x.product || '') + '</td>' +
                  '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + x.qty.toFixed(2) + '</td>' +
                  '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + x.price.toFixed(2) + '</td>' +
                  '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + x.amount.toFixed(2) + '</td>' +
                  '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + x.received.toFixed(2) + '</td>' +
                  '</tr>'
              )
              .join('');

            const html =
              '<div style="max-height:320px;overflow:auto;text-align:left;">' +
              '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
              '<thead><tr>' +
              '<th style="padding:6px;border:1px solid #ddd;">Customer</th>' +
              '<th style="padding:6px;border:1px solid #ddd;">Product</th>' +
              '<th style="padding:6px;border:1px solid #ddd;">Qty</th>' +
              '<th style="padding:6px;border:1px solid #ddd;">Price</th>' +
              '<th style="padding:6px;border:1px solid #ddd;">Amount</th>' +
              '<th style="padding:6px;border:1px solid #ddd;">Received</th>' +
              '</tr></thead>' +
              '<tbody>' + body + '</tbody>' +
              '<tfoot><tr>' +
              '<td colspan="4" style="padding:6px;border:1px solid #ddd;text-align:right;"><b>Totals</b></td>' +
              '<td style="padding:6px;border:1px solid #ddd;text-align:right;"><b>' + totalAmount.toFixed(2) + '</b></td>' +
              '<td style="padding:6px;border:1px solid #ddd;text-align:right;"><b>' + totalReceived.toFixed(2) + '</b></td>' +
              '</tr></tfoot>' +
              '</table>' +
              '</div>';

            swal({
              title: 'Booking #' + bookingId + ' Sale Details',
              content: {
                element: 'div',
                attributes: {
                  innerHTML: html,
                },
              },
            });
          })
          .catch((err: any) => {
            const msg =
              (err && err.error && err.error.message) ||
              (err && err.message) ||
              'Could not load sale details.';
            swal('Error', msg, 'error');
          });

        return;
      }

      if (this.openLedgerOnSelect) {
        const custId = row.CustomerID || row.CustID || row.AccountID || row.AccountId || row.CustId;
        const custName = row.CustomerName || row.Customer || row.CustName || row.Name || '';
        if (custId) {
          const user: CustomerUser = {
            CustomerID: custId.toString(),
            CustomerName: custName || 'Customer',
            PhoneNo1: (row.PhoneNo || row.ContactNo || '')
          };
          this.customerAuth.setCustomer(user);
          this.router.navigateByUrl('/customers/ledger');
          return;
        } else {
          swal('Info', 'Selected row has no customer id', 'info');
          return;
        }
      }

      if (this.nWhat !== '1') return;
      const row2 = row;
      if (Number(row2.IsPosted) === 1) {
        swal('Info', 'This expense is already posted', 'info');
        return;
      }

      const id = row2.ExpendID || row2.ExpID || row2.ID || row2.id;
      if (!id) {
        swal('Error', 'Expense ID not found', 'error');
        return;
      }

      swal({
        text: 'Post this expense now?',
        icon: 'warning',
        buttons: { cancel: true, confirm: true },
      }).then((confirm) => {
        if (!confirm) return;
        this.http.postTask('postexpense/' + id, {}).then((_r) => {
          swal('Posted!', 'Expense has been posted.', 'success');
          this.FilterData();
        }).catch((err) => {
          console.error('Post expense error', err);
          const msg = (err && err.error && err.error.message) || (err && err.message) || 'Error while posting expense';
          swal('Oops!', msg, 'error');
        });
      });
    } catch (ex) {
      console.error('RowClicked handler error', ex);
    }
  }
  TypeChange(_e: any) {
    this.FilterData();
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
          })
          .then((_r) => {
            swal(
              'Close Account!',
              'Account was successfully closed, Login to next date',
              'success'
            );
            this.router.navigateByUrl('/auth/login');
          })
          .catch((_er) => {
            swal('Oops!', 'Error while clsoing account', 'error');
          });
      }
    });
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Daybook Report' ;
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);


      if (this.nWhat === '1') {
        this.ps.PrintData.Title += ' - Sale Report';
      } else if (this.nWhat === '2') {
        this.ps.PrintData.Title += ' - Purchase Report';
      } else if (this.nWhat === '3') {
        this.ps.PrintData.Title += ' - Voucher Report';
      } else if (this.nWhat === '4') {
        this.ps.PrintData.Title += ' - Product Sales Report';
      } else if (this.nWhat === '5') {
        this.ps.PrintData.Title += ' - Product Purchase Report';
      } else if (this.nWhat === '6') {
        this.ps.PrintData.Title += ' - Transport Report';
      }

    this.router.navigateByUrl('/print/print-html');
  }

  
}
