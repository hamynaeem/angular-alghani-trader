import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-bill-summary',
  templateUrl: './bill-summary.component.html',
  styleUrls: ['./bill-summary.component.scss']
})
export class BillSummaryComponent implements OnInit {
  public data: object[];
  public Salesman: any;
  public Routes: any;

  public Filter = {
    Date: GetDateJSON(),
    SalesmanID: '',
    RouteID: '',
  };
  setting = {
    Columns: [
      {
        label: 'Date',
        fldName: 'Date'
      },
      {
        label: 'Customer Name',
        fldName: 'UrduName'
      },
      {
        label: 'Address',
        fldName: 'Address'
      },
      {
        label: 'City',
        fldName: 'City'
      },
      {
        label: 'Prev Balance',
        fldName: 'PrevBalance',
        sum: true
      },
      {
        label: 'This Bill',
        fldName: 'NetAmount',
        sum: true
      },

      {
        label: 'Total Balance',
        fldName: 'TotalBalance',
        sum: true
      },
      {
        label: 'Receieved',
        fldName: '',
      },
      {
        label: 'Description',
        fldName: '',
      }
    ],
    Actions: [



    ],
    Data: []
  };


  public toolbarOptions: object[];
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private myToaster: MyToastService,
    private router: Router
  ) { }

  ngOnInit() {

    this.FilterData();

  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Recovery Sheet';
    this.ps.PrintData.SubTitle = 'Date :' + JSON2Date(this.Filter.Date) + ' Route: '
      + this.Routes.find((x: any) => { return x.RouteID === this.Filter.RouteID; }).RouteName;

    this.router.navigateByUrl('/print/print-html');
  }
  FilterData() {
    // tslint:disable-next-line:quotemark
    let filter = "Date = '" + JSON2Date(this.Filter.Date) + "'";

    if (!(this.Filter.RouteID === '' || this.Filter.RouteID === null)) {
      filter += ' and RouteID=' + this.Filter.RouteID;
    }
    if (!(this.Filter.SalesmanID === '' || this.Filter.SalesmanID === null)) {
      filter += ' and SalesmanID=' + this.Filter.SalesmanID;
    }
    this.http.getData('qryinvoices?filter=' + filter).then((r: any) => {
      this.data = r;
    });
  }

}
