import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  GetDateJSON,
  JSON2Date
} from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { CachedDataService } from '../../../services/cacheddata.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-booking-report',
  templateUrl: './booking-report.component.html',
  styleUrls: ['./booking-report.component.scss'],
})
export class BookingReportComponent implements OnInit {
  @ViewChild('RptTable') RptTable: any;

  public Accounts: any[] = [];

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    Balance: '0',
    RouteID: '',
  };

  public data: object[] = [];

  setting: any = {
    Checkbox: false,
    Columns: [
      {
      label: "Booking No",
      fldName: "BookingID",
    },
    {
      label: "Date",
      fldName: "Date",
    },
    {
      label: "Supplier Name",
      fldName: "CustomerName",
    },

    {
      label: "Invoice No",
      fldName: "InvoiceNo",
    },
    {
      label: "Vehicle No",
      fldName: "VehicleNo",
    },
    {
      label: "Builty No",
      fldName: "BuiltyNo",
    },
    {
      label: "Amount",
      fldName: "Amount",
      sum: true,

    },
    {
      label: "Discount",
      fldName: "Discount",
      sum: true,

    },
    {
      label: "Carriage",
      fldName: "Carriage",
      sum: true,

    },

    {
      label: "Net Amount",
      fldName: "NetAmount",
      sum: true,

    },

    {
      label: "Type",
      fldName: "DtCr",
    },
    {
      label: "Posted",
      fldName: "IsPosted",
    },
  ],

    Actions: [

    ],
    Data: [],
    SubTable: {
      table: 'details',

      Columns: [
        {
          label: 'Type',
          fldName: 'Type',
        },
        {
          label: 'Product Name',
          fldName: 'ProductName',
        },
        {
          label: 'Customer Name',
          fldName: 'CustomerName',
        },
        {
          label: 'PurchasePrice',
          fldName: 'Price',
        },
        {
          label: 'Purchase Qty',
          fldName: 'PurchaseQty',
          sum: true,
        },
        {
          label: 'Sale Qty',
          fldName: 'SaleQty',
          sum: true,
        },

        {
          label: 'Purchase Amount',
          fldName: 'PAmount',
          sum: true,
        },
        {
          label: 'Sale Amount',
          fldName: 'SAmount',
          sum: true,
        },
      ],
    },
  };

  public rowBackgroundConfig = {
    subRowBackgroundConfig: {
      // Multiple conditions with priority (as expected by getSubRowBackgroundColor)
      conditions: [

        {
            // Purchase type
            condition: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) => subRow.Type === 'Purchase',
            color: '#ffcccc', // light red
            priority: 10
          },
          {
          // Sale type
          condition: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) => subRow.Type === 'Sale',
          color: 'lightgreen',
          priority: 5
        }
      ],
      // Fallback single condition (optional, for backward compatibility)
      condition: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) =>
        subRow.Type === 'Purchase' || subRow.Type === 'Sale',
      color: (subRow: any, subIndex: number, parentRow: any, parentIndex: number) =>
        subRow.Type === 'Purchase' ? 'red' : 'lightgreen',
      // Default color if no condition matches
      defaultColor: 'white'
    }
  };

  public toolbarOptions: object[] = [];
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private router: Router,
    private cachedData: CachedDataService
  ) {}

  ngOnInit() {
    this.FilterData();
    // keep a local copy of accounts to map CustomerID -> CustomerName quickly
    this.cachedData.Accounts$.subscribe((a: any[]) => {
      this.Accounts = a || [];
    });
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Booking Report';
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  FilterData() {
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";

    this.http.getData('qrybooking?filter=' + filter).then((r: any) => {
      console.log('qrybooking payload', r && r.length ? r[0] : r);
      this.data = r.map((obj: any) => {
        const invoiceVal = (obj.InvoiceNo || obj.InvNo || obj.InvoiceID || obj.Invoice || obj.RefNo || '') + '';
        const invoiceIdVal = (obj.InvoiceID || obj.InvoiceNo || obj.InvNo || obj.Invoice || obj.RefID || '') + '';
        const vehicleVal = (obj.VehicleNo || obj.VehNo || obj.VehICLENo || obj.Veh || '') + '';
        const builtyVal = (obj.BuiltyNo || obj.Builty || obj.Bilty || obj.BuiltyNo || '') + '';

        return {
          ...obj,
          // normalize alternate field names so the table shows values
          InvoiceID: invoiceIdVal,
          InvoiceNo: invoiceVal,
          InvNo: invoiceVal,
          VehicleNo: vehicleVal,
          VehNo: vehicleVal,
          BuiltyNo: builtyVal,
          Builty: builtyVal,
          details: [],
          Status: obj.IsPosted == 0 ? 'Un-Posted' : 'Posted',
          Date: obj.Date ? obj.Date.substring(0, 10) : obj.Date,
        };
      });

      // Provide the fetched data to the report table settings so the table component can render it
      this.setting.Data = this.data;
    });
  }
  Clicked(e: any) {
    console.log(e);
    if (e.action === 'print') {
      this.router.navigateByUrl('/print/printinvoice/' + e.data.InvoiceID);
    }
  }

  RowClicked(event: any) {
    console.log(event);
    if (event.data.details.length == 0) {
      this.http
        .getData('qrybookingdetails?filter=BookingID=' + event.data.BookingID)
        .then((r: any) => {
          const details = (r || []).map((d: any) => {
            const customerName = (d.CustomerName || d.Customer || d.CustName || d.SupplierName || d.Supplier || '') + '';
            return {
              ...d,
              CustomerName: customerName,
            };
          });

          event.data['details'] = details;

          // Try to fetch sale-row customer info from qrybookingsale and merge into details
          this.http
            .getData('qrybookingsale?filter=BookingID=' + event.data.BookingID)
            .then((sales: any) => {
              (sales || []).forEach((s: any) => {
                // find a matching detail row for this sale entry
                const match = details.find((d: any) => {
                  if ((d.Type || '').toString().toLowerCase() !== 'sale') return false;
                  if (s.ProductID && d.ProductID && s.ProductID == d.ProductID) return true;
                  if (s.ProductName && d.ProductName && s.ProductName == d.ProductName) return true;
                  // fallback: match by sale qty or amount if present
                  if (s.Qty && d.SaleQty && +s.Qty === +d.SaleQty) return true;
                  if (s.Total && d.SAmount && +s.Total === +d.SAmount) return true;
                  return false;
                });
                if (match) {
                  match.CustomerName = match.CustomerName || s.CustomerName || s.CustName || '';
                }
              });
            })
            .catch(() => {
              // ignore errors from optional merge
            })
            .finally(() => {
              // continue with resolving any remaining missing names
            });

          // Resolve missing customer names from cached Accounts first
          const pendingLookups: Array<{ id: any; row: any }> = [];
          const idFields = [
            'CustomerID',
            'CustID',
            'CustId',
            'CustomerId',
            'AcctID',
            'AccountID',
            'AcctNo',
            'PartyID',
            'RefID',
            'RefId',
            'SoldToID',
            'SaleCustomerID',
            'BuyerID',
          ];

          details.forEach((d: any) => {
            if (!d.CustomerName || d.CustomerName.trim() === '') {
              let id: any = null;
              for (const f of idFields) {
                if (d[f] !== undefined && d[f] !== null && d[f] !== '') {
                  id = d[f];
                  break;
                }
              }

              if (id) {
                const acct = this.Accounts.find(
                  (a: any) =>
                    a.CustomerID == id || a.AcctID == id || a.AcctNo == id || a.AccountID == id || a.CustomerCode == id
                );
                if (acct && acct.CustomerName) {
                  d.CustomerName = acct.CustomerName;
                } else {
                  pendingLookups.push({ id, row: d });
                }
              }
            }
          });

          // Fallback to API lookups only for those still unresolved
          if (pendingLookups.length > 0) {
            Promise.all(
              pendingLookups.map((l) =>
                this.http
                  .getData('qrycustomers?filter=CustomerID=' + l.id + '&flds=CustomerID,CustomerName')
                  .then((res: any) => {
                    if (res && res.length > 0) {
                      l.row.CustomerName = res[0].CustomerName || l.row.CustomerName || '';
                    }
                  })
              )
            )
              .catch((err) => console.warn('Customer name lookup failed', err))
              .finally(() => {
                // Force table refresh so UI shows the resolved names
                try {
                  this.setting.Data = Array.isArray(this.setting.Data)
                    ? this.setting.Data.map((d: any) => (d.BookingID === event.data.BookingID ? event.data : d))
                    : this.setting.Data;
                } catch (e) {
                  // ignore
                }
              });
          } else {
            // No pending lookups — still refresh to ensure rendering
            try {
              this.setting.Data = Array.isArray(this.setting.Data)
                ? this.setting.Data.map((d: any) => (d.BookingID === event.data.BookingID ? event.data : d))
                : this.setting.Data;
            } catch (e) {
              // ignore
            }
          }
        });
    }
  }
}
