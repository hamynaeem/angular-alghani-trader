import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormatDate, GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-transport-report',
  templateUrl: './transport-report.component.html',
  styleUrls: ['./transport-report.component.scss'],
})
export class TransportReportComponent implements OnInit {
  @ViewChild('Transport') Transport;
  public data: any = [];
  public Products: object[];
  public Users: object[];

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    TransportID: '',
    ProductID: '',
  };
  setting = {
    Columns: [
      {
        label: 'Date',
        fldName: 'Date',
      },
      {
        label: 'Description',
        fldName: 'Description',
      },

      {
        label: 'Income',
        fldName: 'Income',
        sum: true,
      },
      {
        label: 'Expense',
        fldName: 'Expense',
        sum: true,
      },
      {
        label: 'Balance',
        fldName: 'Balance',
        type: 'number',
      },
    ],
    Actions: [],
    Data: [],
  };

  public toolbarOptions: object[];
  transport: any = {};
  Transports: any;

  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.Filter.FromDate.day = 1;
    this.http.getUsers().then((r: any) => {
      this.Users = r;
    });
    this.http.getData('transports').then((r: any) => {
      this.Transports = r;
    });


    this.FilterData();
  }
  load() {}
  FilterData() {
    let filter =
      "Date between '" +
      JSON2Date(this.Filter.FromDate) +
      "' and '" +
      JSON2Date(this.Filter.ToDate) +
      "'";

    if (this.Filter.TransportID === '' || this.Filter.TransportID === null) {
      return;
    } else {
      filter += ' and TransportID=' + this.Filter.TransportID;
    }

    this.http
      .getData('transportdetails?filter=' + filter + '&orderby=ID')
      .then((r: any) => {
        this.data = r;
        if (this.data.length > 0) {
          this.transport.OpenBalance =
            (this.data[0].Balance - this.data[0].Income) * 1 +
            this.data[0].Expense * 1;
          this.transport.CloseBalance = this.data[this.data.length - 1].Balance;

          this.data.unshift({
            Date: this.data[0].Date,
            Description: 'Opeing Balance ...',
            Income: 0,
            Expense: 0,
            Balance: this.transport.OpenBalance,
          });
        } else {
          filter = " Date < '" + JSON2Date(this.Filter.FromDate) + "'";
          filter += ' and TransportID=' + this.Filter.TransportID;

          this.http
            .getData(
              'transportdetails?filter=' +
                filter +
                '&orderby=ID desc&limit=1'
            )
            .then((r: any) => {
              if (r.length > 0) {
                this.transport.OpenBalance = r[0].Balance;
                this.transport.CloseBalance = r[0].Balance;

              } else {
                this.transport.OpenBalance = 0;
                this.transport.CloseBalance = 0;
              }
              this.data.unshift({
                Date: JSON2Date(this.Filter.FromDate) ,
                Description: 'Opeing Balance ...',
                Income: 0,
                Expense: 0,
                Balance: this.transport.OpenBalance,
              });
            });
        }
      });
  }

  Clicked(e) {}
  PrintReport() {
    this.ps.PrintData.Title = 'Transport Accounts Report';
    this.ps.PrintData.SubTitle = 'From: ' + JSON2Date(this.Filter.FromDate);
    this.ps.PrintData.SubTitle += ' To: ' + JSON2Date(this.Filter.ToDate);
    this.ps.PrintData.TransportName = 'Transport: ' + this.Transport.text;

    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.router.navigateByUrl('/print/print-html');
  }
  DetailReport() {
    this.router.navigateByUrl(
      '/accounts/accountdetails/' +
        JSON2Date(this.Filter.FromDate) +
        '/' +
        JSON2Date(this.Filter.ToDate) +
        '/' +
        this.Filter.TransportID
    );
  }
  TransportSelected(TransportID) {
    if (TransportID) {
      this.http.getData('transports/' + TransportID).then((r) => {
        this.transport = r;

      });
    }
  }
  formatDate(d) {
    return  FormatDate( JSON2Date(d));
  }

}
