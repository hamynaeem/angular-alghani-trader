import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date, formatNumber } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: "app-purchase-report",
  templateUrl: "./purchase-report.component.html",
  styleUrls: ["./purchase-report.component.scss"],
})
export class PurchaseReportComponent implements OnInit {
  public data: object[];
  public Salesman: object[];
  public Customers: object[];

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    CustomerID: "",
  };
  setting = {
    Columns: [
      {
        label: "  Invoice No",
        fldName: "InvoiceID",
      },
      {
        label: "Date",
        fldName: "Date",
      },
      {
        label: "Account Name",
        fldName: "CustomerName",
      },
      {
        label: "Address",
        fldName: "Address",
      },
      {
        label: "City",
        fldName: "City",
      },

      {
        label: "Net Amount",
        fldName: "NetAmount",
        sum: true,
        valueFormatter: (d) => {
          return formatNumber(d["NetAmount"]);
        },
      },
      {
        label: "Amount Paid",
        fldName: "AmountPaid",
        sum: true,
        valueFormatter: (d) => {
          return formatNumber(d["AmountPaid"]);
        },
      },
      {
        label: "Balance",
        fldName: "Balance",
        sum: true,
        valueFormatter: (d) => {
          return formatNumber(d["Balance"]);
        },
      },
      {
        label: "Type",
        fldName: "DtCr",
      },
    ],
    Actions: [
      {
        action: "print",
        title: "Print",
        icon: "print",
        class: "primary",
      },
    ],
    SubTable: {
      table: 'details',
      Columns: [
        {
          label: 'Store',
          fldName: 'StoreName',
        },
        {
          label: 'Product Name',
          fldName: 'ProductName',
        },
        {
          label: 'Qty',
          fldName: 'Qty',
          sum: true,
        },
        {
          label: 'Packing',
          fldName: 'Packing',
        },
        {
          label: 'KGs',
          fldName: 'KGs',
          sum: true,
        },
        {
          label: 'Tons',
          fldName: 'Tons',
          sum: true,
          valueFormatter: (d) => {
            const v = Number(d['Tons'] || 0) || 0;
            return v.toFixed(3);
          },
        },
        {
          label: 'Purchase Price',
          fldName: 'PPrice',
        },
        {
          label: 'Amount',
          fldName: 'Amount',
          sum: true,
        },
      ],
    },
  };

  AcctTypes = this.cachedData.AcctTypes$

  constructor(
    private http: HttpBase,
    private cachedData: CachedDataService,
    private ps: PrintDataService,
    private router: Router
  ) {}

  ngOnInit() {

    this.FilterData();
  }
  getAccounts(type) {

    this.http.getAcctstList(type).then((res: any) => {
      this.Customers = res;
    });
  }

  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById("print-section");
    this.ps.PrintData.Title = "Purchase Report";
    this.ps.PrintData.SubTitle =
      "From :" +
      JSON2Date(this.Filter.FromDate) +
      " To: " +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl("/print/print-html");
  }
  FilterData() {
    // tslint:disable-next-line:quotemark
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";

    if (!(this.Filter.CustomerID === "" || this.Filter.CustomerID === null)) {
      filter += " and CustomerID=" + this.Filter.CustomerID;
    }

    this.http.getData("qrypinvoices?filter=" + filter).then((r: any) => {
      this.data = r.map((obj: any) => {
        return {
          ...obj,
          details: [],

        };
      });
    });
  }
  Clicked(e) {
    console.log(e);
    if (e.action === "print") {
      console.log(e.action);
      this.router.navigateByUrl("/print/printpurchase/" + e.data.InvoiceID);
    }
  }
      RowClicked(event) {
        console.log(event);
        if (event.data.details.length == 0) {
          this.http
            .getData('qrypinvoicedetails?filter=InvoiceID=' + event.data.InvoiceID)
            .then((r: any) => {
              // compute KGs and Tons for each detail row
              event.data['details'] = (r || []).map((row: any) => {
                const Qty = Number(row.Qty) || 0;
                const Packing = Number(row.Packing) || 0;
                const KGs = Number(row.KGs) || 0;
                const totalKg = Qty * Packing + KGs;
                row.KGs = totalKg;
                row.Tons = totalKg / 1000; // convert kilograms to tons
                return row;
              });
            });
        }
      }
}
