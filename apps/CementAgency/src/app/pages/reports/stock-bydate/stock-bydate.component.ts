import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-stock-bydate',
  templateUrl: './stock-bydate.component.html',
  styleUrls: ['./stock-bydate.component.scss'],
})
export class StockByDateComponent implements OnInit {
  @ViewChild('RptTable') RptTable;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    StoreID: '1',
    nWhat: '1',
  };
  Salesman = this.cachedData.Salesman$;
  public Routes = this.cachedData.routes$;
  public data: object[];
  public stores$ = this.cachedData.Stores$;

  setting = {
    Checkbox: false,
    GroupBy: 'UnitName',
    OnlyGroups: true,
    Columns: [
      {
        label: 'ProductName',
        fldName: 'ProductName',
      },
      {
        label: 'Unit',
        fldName: 'UnitName',
      },
      {
        label: 'Opening Stock',
        fldName: 'OpenStock',
        sum: true,
      },
      {
        label: 'Purchase',
        fldName: 'Purchase',
        sum: true,
      },
      {
        label: 'Sale',
        fldName: 'Sale',
        sum: true,
      },

      {
        label: 'Closing Stock',
        fldName: 'ClosingStock',
        sum: true,
      },
    ],
    Actions: [],
  };
  setting2 = this.setting;
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
    this.ps.PrintData.Title = 'Stock By Date Report';
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
    if (this.Filter.StoreID && this.Filter.StoreID != '')
      filter += ' and StoreID = ' + this.Filter.StoreID;

    this.http
      .postData('stockbydate', {
        StoreID: this.Filter.StoreID,
        FromDate: JSON2Date(this.Filter.FromDate),
        ToDate: JSON2Date(this.Filter.ToDate),
        Type: this.Filter.nWhat,
      })
      .then((r: any) => {
        if (this.Filter.nWhat == '2'){
          this.setting2.Columns = this.setting.Columns.filter(x=>{
            return x.fldName != 'ProductName'
          })
        } else {
          this.setting2 = this.setting;

        }
        this.data = r;
      });
  }
}
