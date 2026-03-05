import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-stock-accts',
  templateUrl: './stock-accts.component.html',
  styleUrls: ['./stock-accts.component.scss'],
})
export class StockAcctsComponent implements OnInit {
  @ViewChild('cmbProduct') cmbProduct: any;
  public data: object[] = [];

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    StoreID: '',
    ItemID: '',
    What: '2',
  };
  colProducts = [
    {
      label: 'Date',
      fldName: 'Date',
    },
    {
      label: 'Invoice No',
      fldName: 'RefID',
    },
    {
      label: 'Customer Name',
      fldName: 'CustomerName',
    },
    {
      label: 'Stock In',
      fldName: 'QtyIn',
    },
    {
      label: 'Stock Out',
      fldName: 'QtyOut',
    },
    {
      label: 'Balance',
      fldName: 'Balance',
    },
  ];
  colUnits = [
    {
      label: 'Date',
      fldName: 'Date',
    },

    {
      label: 'Customer Name',
      fldName: 'CustomerName',
    },
    {
      label: 'Stock In',
      fldName: 'QtyIn',
    },
    {
      label: 'Stock Out',
      fldName: 'QtyOut',
    },
  ];
  setting: any = {
    Columns: [],
    Actions: [],
    Data: [],
  };
  lstDataRource: any = [];
  stores$: Observable<any[]>;

  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    private router: Router
  ) {
    this.stores$ = this.cachedData.Stores$;
  }

  ngOnInit() {
    this.Filter.FromDate.day = 1;
    this.http
      .getData(
        'qryproducts?flds=ProductID as ItemID, ProductName as ItemName&orderby=ProductName'
      )
      .then((r) => {
        this.lstDataRource = r;
      });
    this.FilterData();
  }

  FilterData() {
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";

    if (this.Filter.StoreID !== '' && this.Filter.StoreID !== null) {
      filter += ' and StoreID = ' + this.Filter.StoreID;
    }

    if (!(this.Filter.ItemID === '' || this.Filter.ItemID === null)) {
      if (this.Filter.What == '1') {
        this.LoadProductsData(filter);
      } else {
        this.LoadUnitsData(filter);
      }
    }
  }
  LoadUnitsData(filter: string) {
    filter += " and UnitName = '" + this.Filter.ItemID + "'";

    this.http
      .getData(
        'qrystockaccts?flds=Date,RefID,CustomerName, QtyIn, QtyOut' +
          ' &filter=' +
          filter +
          '&orderby=AcctID'
      )
      .then((r: any) => {
        this.setting.Columns = this.colUnits;
        this.data = r;
      });
  }
  LoadProductsData(filter: string) {
    // tslint:disable-next-line:quotemark

    filter += ' and ProductID = ' + this.Filter.ItemID;

    this.http
      .getData(
        'qrystockaccts?flds=Date, RefID, CustomerName, QtyIn, QtyOut, Balance' +
          ' &filter=' +
          filter +
          '&orderby=AcctID'
      )
      .then((r: any) => {
        this.setting.Columns = this.colProducts;
        this.data = r;
      });
  }
  Clicked(e: any): void {}
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Product Accounts';
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate) +
      ' Product: ' +
      this.cmbProduct.text;
    this.router.navigateByUrl('/print/print-html');
  }
  CustomerSelected(e: any): void {}
  formatDate(d: any): string {
    return JSON2Date(d);
  }
}
