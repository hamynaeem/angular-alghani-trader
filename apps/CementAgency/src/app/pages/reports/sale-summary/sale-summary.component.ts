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
  selector: 'app-sale-summary',
  templateUrl: './sale-summary.component.html',
  styleUrls: ['./sale-summary.component.scss'],
})
export class SalesummaryComponent implements OnInit {
  @ViewChild('RptTable') RptTable: any;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    ProductID: '',
    CustomerID: '',
  };
  setting = {
    Checkbox: false,
    GroupBy: '',
    Columns: [
      {
        label: 'Customer',
        fldName: 'CustomerName',
      },
      {
        label: 'Product Name',
        fldName: 'ProductName',
      },
      {

        label: 'Price',
        fldName: 'SPrice',
        sum: true,
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
      {
        label: 'Discount',
        fldName: 'Discount',
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d['Discount']);
        },
      },

      {
        label: 'Received',
        fldName: 'Received',
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d['Received']);
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
  sting = this.setting;
  public data: object[] = [];
  public Items: any;
  public Accounts: any;
  public AccountsList: any[] = [];
  public SelectedCustomerName = '';
  constructor(
    private http: HttpBase,
    private cachedData: CachedDataService,
    private ps: PrintDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.Items = this.cachedData.Products$;
    this.Accounts = this.cachedData.Accounts$;
    this.cachedData.Accounts$.subscribe((a: any[]) => {
      this.AccountsList = a || [];
      if (this.Filter.CustomerID && this.Filter.CustomerID !== '') {
        this.CustomerSelected(this.Filter.CustomerID);
      }
    });
    this.FilterData();
  }

  CustomerSelected(evt: any) {
    const id = evt && evt.CustomerID ? evt.CustomerID : evt;
    const c = this.AccountsList.find((x: any) => x.CustomerID == id);
    this.SelectedCustomerName = c ? c.CustomerName : '';
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Sale Summary Report';
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  FilterData() {
    const from = JSON2Date(this.Filter.FromDate);
    const to   = JSON2Date(this.Filter.ToDate);

    let whereClauses = `s.Date BETWEEN '${from}' AND '${to}'`;
    if (this.Filter.CustomerID && this.Filter.CustomerID !== '') {
      whereClauses += ` AND s.CustomerID=${this.Filter.CustomerID}`;
    }

    if (this.Filter.ProductID && this.Filter.ProductID !== '') {
      whereClauses += ` AND s.ProductID=${this.Filter.ProductID}`;

      const sql = `SELECT s.InvoiceID, s.CustomerName, s.ProductName, s.SPrice, s.Qty,
        s.Amount, s.Discount, COALESCE(b.Carriage, 0) AS Carriage,
        s.Received, (s.Amount - s.Discount - s.Received) AS Balance,
        b.InvoiceNo AS InvoiceNo, b.VehicleNo AS VehicleNo, b.CofNo AS CofNo, b.ReceiptNo AS ReceiptNo, b.BuiltyNo AS BuiltyNo
        FROM qrysalereport s
        LEFT JOIN booking b ON s.BookingID = b.BookingID
        WHERE ${whereClauses}
        ORDER BY s.CustomerName`;

      this.http.getData('MQRY?qrysql=' + encodeURIComponent(sql)).then((r: any) => {
        console.log('sale-summary (product) payload', r);
        this.sting = JSON.parse(JSON.stringify(this.setting));
        // ensure invoice/billing/transport fields appear at the front
        this.sting.Columns.unshift(
          { label: 'Builty No', fldName: 'BuiltyNo' },
          { label: 'Receipt No', fldName: 'ReceiptNo' },
          { label: 'COF No', fldName: 'CofNo' },
          { label: 'Vehicle No', fldName: 'VehicleNo' },
          { label: 'Bill No', fldName: 'InvoiceNo' }
        );
        this.data = Array.isArray(r) ? r : (r && Array.isArray(r.data) ? r.data : []);
      });
    } else {
      const sql = `SELECT s.CustomerName, s.ProductName, s.SPrice, s.Qty,
        s.Amount, s.Discount, COALESCE(b.Carriage, 0) AS Carriage,
        s.Received, (s.Amount - s.Discount - s.Received) AS Balance,
        b.InvoiceNo AS InvoiceNo, b.VehicleNo AS VehicleNo, b.CofNo AS CofNo, b.ReceiptNo AS ReceiptNo, b.BuiltyNo AS BuiltyNo
        FROM qrysalereport s
        LEFT JOIN booking b ON s.BookingID = b.BookingID
        WHERE ${whereClauses}
        ORDER BY s.CustomerName`;

      this.http.getData('MQRY?qrysql=' + encodeURIComponent(sql)).then((r: any) => {
        console.log('sale-summary payload', r);
        this.sting = JSON.parse(JSON.stringify(this.setting));
          this.sting.GroupBy = 'CustomerName';
          // add booking/transport columns for grouped view
          this.sting.Columns.unshift(
            { label: 'Builty No', fldName: 'BuiltyNo' },
            { label: 'Receipt No', fldName: 'ReceiptNo' },
            { label: 'COF No', fldName: 'CofNo' },
            { label: 'Vehicle No', fldName: 'VehicleNo' },
            { label: 'Invoice No', fldName: 'InvoiceNo' }
          );
        this.data = Array.isArray(r) ? r : (r && Array.isArray(r.data) ? r.data : []);
      });
    }
  }
}
