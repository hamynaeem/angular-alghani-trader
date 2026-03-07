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
    { label: 'Price', fldName: 'SPrice', sum: true },
    { label: 'Qty', fldName: 'Qty', sum: true },
    { label: 'Amount', fldName: 'Amount', sum: true },
  ],
  Actions: [],
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
  nWhat = '2';
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
    } else if (this.nWhat === '2') {
      this.settings = BookingSetting;
      // request CustomerName from backend so booking rows include customer/supplier name
      // Note: `Description` does not exist in qrybooking, remove it to avoid SQL error
      table = 'qrybooking?orderby=BookingID&flds=BookingID,Date,CustomerName,InvoiceNo,VehicleNo,BuiltyNo,Amount,Discount,Carriage,NetAmount,DtCr,IsPosted';
    } else if (this.nWhat === '3') {
      this.settings = VoucherSetting;
      table = 'qryvouchers?orderby=VoucherID ';
    } else if (this.nWhat === '4') {
      this.settings = SalesSetting;
      table = 'qrysalereport?orderby=Date,BookingID&flds=CustomerName,ProductName,SPrice,Qty as Qty,Amount as Amount ';
    } else if (this.nWhat === '5') {
      this.settings = PurchaseSetting;
      table = 'qrypurchasereport?orderby=Date,BookingID&flds=ProductName,PPrice,Qty,Amount ';
    } else if (this.nWhat === '6') {
      this.settings = TransportSetting;
      table = 'transportdetails?orderby=ID ';
    }

    const queryUrl = table + '&filter=' + filter;

    const processResponse = (r: any) => {
      // normalize rows and ensure Posted flag exists
      const normalizePosted = (row: any) => {
        if ('IsPosted' in row) {
          row.IsPosted == '1' ? (row.Posted = 'Posted') : (row.Posted = 'Unposted');
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

            return row;
          });
          // log sample to help debug missing fields
          try {
            console.log('Booking normalized sample:', normalized && normalized.length ? normalized.slice(0, 5) : normalized);
          } catch (e) {}
          this.data = normalized;
        } else if (this.nWhat === '5') {
          // For purchase report: ensure product exists and try to resolve supplier name
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

          // attempt to map suppliers from backend list (qrysuppliers)
          const mapAndSet = (suppliers: any) => {
            const supList = Array.isArray(suppliers) ? suppliers : (suppliers && suppliers.data) || [];
            const mappedRows = (purchases || []).map((row: any) => {
              // try several possible id fields to match supplier
              const id = row.SupplierID || row.Supplier || row.AccountID || row.Account || row.CustomerID || row.CustID || row.Supplier_Id;
              let name = '';
              if (id !== undefined && id !== null && id !== '') {
                const found = supList.find((s: any) => String(s.SupplierID || s.CustomerID || s.ID || s.Id) === String(id));
                if (found) name = found.SupplierName || found.CustomerName || found.AcctName || found.Name || found.Acct || '';
              }
              row.SupplierName = name || this.firstAvailable(row, ['SupplierName', 'CustomerName', 'Customer', 'Supplier', 'CustName', 'AccountName', 'Account', 'CustomerID']);
              return row;
            });
            this.data = mappedRows;
          };

          // try cached suppliers first (from cachedData) then backend
          try {
            if (this.cachedData && this.cachedData.Suppliers$) {
              // if Suppliers$ observable exists, subscribe once to get list
              const sub = this.cachedData.Suppliers$.subscribe((list: any[]) => {
                if (list && list.length) {
                  console.log('Using cached suppliers:', list.length, 'items');
                  mapAndSet(list);
                } else {
                  console.log('No cached suppliers, fetching from backend');
                  this.http.getData('qrysuppliers').then((s: any) => mapAndSet(s)).catch(() => mapAndSet([]));
                }
                try { sub.unsubscribe(); } catch (e) {}
              });
            } else {
              // fallback to direct backend fetch
              console.log('No cached suppliers service, fetching from backend');
              this.http.getData('qrysuppliers').then((s: any) => mapAndSet(s)).catch(() => mapAndSet([]));
            }
          } catch (e) {
            console.log('Error accessing suppliers service, falling back to backend:', e);
            this.http.getData('qrysuppliers').then((s: any) => mapAndSet(s)).catch(() => mapAndSet([]));
          }
        } else {
          this.data = mapped;
        }
        this.computeTransportTotals(this.data);
      }
    };

    // If purchase report, try to include SupplierID first (safe fallback if backend doesn't expose it)
    if (this.nWhat === '5') {
      const tryUrl = table.replace('flds=ProductName,PPrice,Qty,Amount', 'flds=SupplierID,ProductName,PPrice,Qty,Amount') + '&filter=' + filter;
      this.http
        .getData(tryUrl)
        .catch(() => this.http.getData(queryUrl))
        .then((r: any) => processResponse(r))
        .catch((err: any) => {
          console.error('Purchase fetch error', err);
          processResponse([]);
        });
    } else {
      this.http
        .getData(queryUrl)
        .then((r: any) => processResponse(r))
        .catch((err: any) => {
          console.error('Fetch error', err);
          try {
            swal('Oops!', (err && err.error && err.error.message) || 'Server error while fetching report', 'error');
          } catch (e) {}
          this.data = [];
        });
    }
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
        } else if (this.nWhat === '2') {
          url = 'postbooking/' + e.data.BookingID;
        } else if (this.nWhat === '3') {
          url = 'postvouchers/' + e.data.VoucherID;
        } else if (this.nWhat === '6') {
          const id = e.data.ID || e.data.id;
          if (id) url = 'posttransport/' + id;
        }

        this.http.postTask(url, {}).then((_r) => {
          e.data.IsPosted = '1';
          e.data.Posted = 'Posted';
          swal('Post!', 'Your data has been posted!', 'success');
          this.FilterData();
        }).catch((err) => {
          console.error('Post error', err);
          const msg = (err && err.error && err.error.message) || (err && err.message) || '';
          // If server reports it's already posted, treat as success and update UI
          if (typeof msg === 'string' && msg.toLowerCase().includes('post')) {
            e.data.IsPosted = '1';
            e.data.Posted = 'Posted';
            swal('Info', 'Record already posted. Marked as Posted.', 'info');
            this.FilterData();
            return;
          }
          swal('Oops!', msg || 'Error while posting', 'error');
        });
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
          } else if (this.nWhat === '2') {
            uurl = 'unpostbooking/' + e.data.BookingID;
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
          this.http.postTask(uurl, {}).then((_r) => {
            e.data.IsPosted = '0';
            e.data.Posted = 'Unposted';
            swal('Unpost!', 'Your data has been unposted!', 'success');
            this.FilterData();
          }).catch((err) => {
            console.error('Unpost error', err);
            swal('Oops!', (err && err.error && err.error.message) || 'Error while unposting', 'error');
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
