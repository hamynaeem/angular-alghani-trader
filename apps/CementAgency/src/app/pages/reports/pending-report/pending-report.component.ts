import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { StngsPendingReport } from './pending-report.settings';

@Component({
  selector: 'app-pending-report',
  templateUrl: './pending-report.component.html',
  styleUrls: ['./pending-report.component.scss'],
})
export class PendingReportComponent implements OnInit {
  @ViewChild('RptTable') RptTable;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    StoreID: '',
  };
  public data: object[];
  public setting = StngsPendingReport;
  public nWhats = '1'
  Stores = this.cachedData.Stores$;

  public toolbarOptions: object[];
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
    this.ps.PrintData.Title = 'Pending Report';
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
      "' ";
    if (this.Filter.StoreID && this.Filter.StoreID != '')
      filter += ' and StoreID = ' + this.Filter.StoreID;

    if (this.nWhats == '1'){
      filter += ' and Qty >0 ';
    }
    this.http.getData('qrypendingdetails?filter=' + filter).then((r: any) => {
      this.data = r;
    });
  }

  Clicked(e) {
    console.log(e);
    if (e.action === 'print') {
      this.router.navigateByUrl(
        `/print/print-gatepass/${e.data.InvoiceID}/${e.data.StoreID}`
      );
    } else if (e.action == 'deliver') {
      Swal.fire({
        title: "Quantity Deliverred!",
        text: "Input the Qantity Deliverred:",
        input: 'number',
        showCancelButton: true
    }).then((result) => {
        if (result.value) {
            console.log("Result: " + result.value);

          if ((result.value) >Number( e.data.Qty) ){
            Swal.fire({
              title: "Invalid Quantity!",
              text: `Only ${e.data.Qty} is available`,

          })
          return;
          }
          this.http.postData('pendingdetails/' + e.data.DetailID,{
            Qty: e.data.Qty - result.value
          }).then(r=>{
            this.FilterData();
          })



        }
    });

    }
  }
}
