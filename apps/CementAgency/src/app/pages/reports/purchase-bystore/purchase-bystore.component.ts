import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-purchase-bystore',
  templateUrl: './purchase-bystore.component.html',
  styleUrls: ['./purchase-bystore.component.scss'],
})
export class PurchaseBystoreComponent implements OnInit {
  @ViewChild('RptTable') RptTable;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    StoreID: '',
    nWhat: '1',
    CustomerID: '',
  };
  Details = {
    Checkbox: false,
    Columns: [
      {
        label: 'Date',
        fldName: 'Date',
      },
      {
        label: 'Bill No',
        fldName: 'InvoiceID',
      },
      {
        label: 'Account Name',
        fldName: 'CustomerName',
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


    ],
    Actions: [],
    Data: [],
  };
  setting: any = this.Details;
  public data: object[];
  public Accounts: any = this.cachedData.Accounts$;
  public Stores: any = this.cachedData.Stores$;

  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.FilterData();
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title =
      'Purchase By Store ' +
      (this.Filter.CustomerID
        ? ' Customer: ' +
          this.Accounts.find((x) => x.CustomerID == this.Filter.CustomerID)
            .CustomerName
        : '');
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

    if (this.Filter.CustomerID)
      filter += ' and CustomerID=' + this.Filter.CustomerID;

    if (this.Filter.StoreID) filter += ' and StoreID =' + this.Filter.StoreID;

    let flds = '';
    if (this.Filter.nWhat == '1') {
      flds = 'Date,InvoiceID, CustomerName, ProductName,Qty&orderby=Date';
      this.setting = this.Details;
    } else {
      flds = 'UnitName,  Sum(Qty) as Qty&groupby=UnitName';
      this.setting = {
        Columns: [
          {
            fldName: 'UnitName',
            label: 'Unit Name',
          },
          {
            fldName: 'Qty',
            label: 'Quantity',
          },
        ],
      };
    }
    this.setting = {... this.setting};
    this.http
      .getData(`qrypurchasereport?flds=${flds}&filter=${filter}&orderby=InvoiceID`)
      .then((r: any) => {
        this.data = r;

      });
  }
  Clicked(e) {}


}
