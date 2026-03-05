

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FindTotal, GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { PrintDataService } from '../../../services/print.data.services';
import { formatNumber } from '../../../factories/utilities';
@Component({
  selector: "app-profit-report",
  templateUrl: "./profit-report.component.html",
  styleUrls: ["./profit-report.component.scss"],
})
export class ProfitReportComponent implements OnInit {
  @ViewChild("RptTable") RptTable;
  public data:any= [];
  public Salesman:any=[];
  public Routes:any=[];

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
  };
  setting = {
    Checkbox: false,
    Columns: [
      {
        label: "Product Name",
        fldName: "ProductName",
      },

      {
        label: "Qty Sold",
        fldName: "QtySold",
      },
      {
        label: "Amount",
        fldName: "Amount",
        sum: true,
        valueFormatter: (d) => {
          return formatNumber(d["Amount"]);
        },
      },
      {
        label: "Cost",
        fldName: "Cost",
        sum: true,
        valueFormatter: (d) => {
          return formatNumber(d["Cost"]);
        },
      },
      {
        label: "Profit",
        fldName: "Profit",
        sum: true,
        valueFormatter: (d) => {
          return formatNumber(d["Profit"]);
        },
      },
    ],
    Actions: [],
    Data: [],
  };
  expenses: any = [];
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private myToaster: MyToastService,
    private router: Router
  ) {}

  ngOnInit() {

    this.FilterData();
  }
  PrintReport() {

    this.ps.PrintData.HTMLData = document.getElementById("print-section");
    this.ps.PrintData.Title = "Profit Report";
    this.ps.PrintData.SubTitle =
      "From :" +
      JSON2Date(this.Filter.FromDate) +
      " To: " +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl("/print/print-html");
  }
  FilterData() {
    // tslint:disable-next-line:quotemark
    this.http
      .getData(
        "profitreport/" +
          JSON2Date(this.Filter.FromDate) +
          "/" +
          JSON2Date(this.Filter.ToDate)
      )
      .then((r: any) => {
        this.data = r;
      });
    this.http
      .getData(
        "qryexpenses?flds=HeadName,Sum(Amount) as Amount&groupby=HeadName&filter=Date Between '" +
          JSON2Date(this.Filter.FromDate) +
          "' and '" +
          JSON2Date(this.Filter.ToDate) + "'"
      )
      .then((r: any) => {
        this.expenses = r;
      });
  }
  FindTotal(d, fld){
      return FindTotal(d,fld);
  }
}
