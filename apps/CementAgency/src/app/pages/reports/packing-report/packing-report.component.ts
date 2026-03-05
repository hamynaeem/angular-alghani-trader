import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { PackingRptStngs } from './packing-report.settings';

@Component({
  selector: 'app-packing-report',
  templateUrl: './packing-report.component.html',
  styleUrls: ['./packing-report.component.scss'],
})
export class PackingReportComponent implements OnInit {
  @ViewChild('RptTable') RptTable;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),

    What: '1',
  };
  PackingHaeds: any = [];
  public data: object[];
  settings = PackingRptStngs;

  public toolbarOptions: object[];
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.http.getData('packingheads').then((r) => {
      this.PackingHaeds = r;
    });
    this.FilterData();
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Packing Report';
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  FilterData() {
    let filter = `Date Between '${JSON2Date(
      this.Filter.FromDate
    )}' and  '${JSON2Date(this.Filter.ToDate)}'`;

    this.settings = JSON.parse(JSON.stringify(PackingRptStngs));
    if (this.Filter.What == '1') {
      this.settings.Columns.push({
        label: 'Packing',
        fldName: 'PackingCharges',
        sum: true,
      });
      filter += ' and PackingCharges > 0';
    } else {
      this.settings.Columns.push({
        label: 'Delivery',
        fldName: 'DeliveryCharges',
        sum: true,
      });
      filter += ' and DeliveryCharges > 0';
    }

    this.http
      .getData(
        'qryinvoices?flds=Date,InvoiceID,CustomerName,PackingCharges,DeliveryCharges&filter=' +
          filter
      )
      .then((r: any) => {

        let i = 1;
       this.data = r.map(x=>{
          return {
            ...x,
            SNo:i++
          }
        })

      });
  }
}
