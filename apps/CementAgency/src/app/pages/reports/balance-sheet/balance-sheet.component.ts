import { Component, OnInit } from '@angular/core';
import { getDMYDate } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { Router } from '@angular/router';
import { PrintDataService } from '../../../services/print.data.services';
import { formatNumber } from '../../../factories/utilities';
@Component({
  selector: "app-balance-sheet",
  templateUrl: "./balance-sheet.component.html",
  styleUrls: ["./balance-sheet.component.scss"],
})
export class BalanceSheetComponent implements OnInit {
  public data: object[] = [];
  public Salesman: object[] = [];
  public Routes: object[] = [];

  curCustomer: any = {};
  VouchersList: object[] = [];

  dteDate = getDMYDate();
  setting = {
    Columns: [
      {
        label: "Type",
        fldName: "Type",
      },
      {
        label: "Customer Name",
        fldName: "CustomerName",
      },
      {
        label: "Credit",
        fldName: "Credit",
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d["Credit"]);
          
        },
      },
      {
        label: "Debit",
        fldName: "Debit",
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d["Debit"]);
          
        },
      },
    ],
    Actions: [],
    Data: [],
  };
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.http.getData("balancesheet").then((r: any) => {
      this.data = r;
    });
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById("print-section");
    this.ps.PrintData.Title = "Balance Sheet";
    this.ps.PrintData.SubTitle = "As On  :" + this.dteDate;

    this.router.navigateByUrl("/print/print-html");
  }
}
