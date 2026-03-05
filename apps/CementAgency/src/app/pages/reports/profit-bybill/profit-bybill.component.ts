import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-profit-bybill',
  templateUrl: './profit-bybill.component.html',
  styleUrls: ['./profit-bybill.component.scss'],
})
export class ProfitByBillComponent implements OnInit {


  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    SalesmanID: '',
    RouteID: '',
  };
  public Salesman: any;
  public Routes: any;
  public data: object[] = [];


  setting = {
    Checkbox: false,
    Columns: [
      {
        label: 'I No',
        fldName: 'INo',
      },
      {
        label: 'Date',
        fldName: 'Date',
      },
      {
        label: 'Customer Name',
        fldName: 'CustomerName',
      },
      {
        label: 'Address',
        fldName: 'Address',
      },
      {
        label: 'City',
        fldName: 'City',
      },

      {
        label: 'Net Amount',
        fldName: 'NetAmount',
        sum: true,

      },
      {
        label: 'Cost',
        fldName: 'Cost',
        sum: true,
      },
      {
        label: 'Profit',
        fldName: 'Profit',
        sum: true,

      },
      {
        label: 'Type',
        fldName: 'DtCr',
      },
    ],
    Actions: [
    ],
    Data: [],
  };


  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,

    private router: Router
  ) { }

  ngOnInit() {
    this.Salesman = this.cachedData.Salesman$;
    this.Routes = this.cachedData.routes$;
    this.FilterData();
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Profit Report';
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
      if (this.Filter.RouteID && this.Filter.RouteID != '') filter += " and Routeid = " + this.Filter.RouteID
      if (this.Filter.SalesmanID && this.Filter.SalesmanID != '') filter += " and SalesmanID = " + this.Filter.SalesmanID

    this.http.getData('profitbybill?filter=' + filter).then((r: any) => {
      this.data = r;
    });
  }
  Clicked(e: any) {
    console.log(e);

  }
}
