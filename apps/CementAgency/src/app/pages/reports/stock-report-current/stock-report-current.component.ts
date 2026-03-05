import { Component, OnInit } from '@angular/core';
import { formatNumber } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
@Component({
  selector: 'app-stock-report-current',
  templateUrl: './stock-report-current.component.html',
  styleUrls: ['./stock-report-current.component.scss'],
})
export class StockReportCurrentComponent implements OnInit {
  public data: object[];
  public Filter = {
    StoreID: '',
    nWhat: '1',
  };
  setting: any = {
    Columns: [],
    Actions: [],
  };
  Columns = [
    {
      label: 'ProductName',
      fldName: 'ProductName',
    },

    {
      label: 'Category',
      fldName: 'CategoryName',
    },

    {
      label: 'Stock',
      fldName: 'Stock',
      sum: true,
    },
    {
      label: 'SPrice',
      fldName: 'SPrice',
      sum: true,
      valueFormatter: (d) => {
        return formatNumber(d['SPrice']);
      },
    },

    {
      label: 'Sale Value',
      fldName: 'SaleValue',
      sum: true,
      valueFormatter: (d) => {
        return formatNumber(d['SaleValue']);
      },
    },
  ];

  Stores$ = this.cachedData.Stores$;
  Categories$ = this.cachedData.Categories$;

  constructor(private http: HttpBase, private cachedData: CachedDataService) {}

  ngOnInit() {
    this.setting.Columns = this.Columns;
    this.FilterData();
  }
  FilterData() {
    let filter = ' Stock > 0 ';
    if (this.Filter.StoreID !== '')
      filter += ' AND StoreID=' + this.Filter.StoreID;

    let flds = '*';
    if (this.Filter.nWhat == '2') {
      flds =
        'UnitName,sum(Stock) as Qty, Sum(Stock)/1000 as Tons &groupby=UnitName';
      this.setting.Columns = [
        { label: 'UnitName', fldName: 'UnitName' },
        { label: 'Qty', fldName: 'Qty', sum: true },
        { label: 'In Tons', fldName: 'Tons', sum: true },
      ];
    } else {
      this.setting.Columns = this.Columns;
    }

    this.http
      .getData('qrystock_current?filter=' + filter + '&flds=' + flds)
      .then((r: any) => {
        this.data = r;
      });
  }
  Clicked(e) {}
}
