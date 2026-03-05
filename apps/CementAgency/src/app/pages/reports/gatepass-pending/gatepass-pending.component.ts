import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { GPSetting } from './gatepass.settings';

@Component({
  selector: 'app-gatepass-pending',
  templateUrl: './gatepass-pending.component.html',
  styleUrls: ['./gatepass-pending.component.scss'],
})
export class GatepasPendingComponent implements OnInit {
  @ViewChild('dataList') dataList;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    StoreID: '',
  };
  public data: any = [];
  public details: any = [];
  public setting = GPSetting;

  Stores: Observable<any[]>;

  public toolbarOptions: object[];
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private modalService: BsModalService,
    private cachedData: CachedDataService,
    private router: Router
  ) {
    this.Stores= this.cachedData.Stores$;
  }

  ngOnInit() {
    setTimeout(() => {
       this.FilterData();
    }, 500);

  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Gatepass Report';
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

    this.http.getData('pendinggatepass?filter=' + filter).then((r:any)=>{
      this.data = r.map((obj: any) => {
        return {
          ...obj,
          details: [],

        };
      });
    })
  }

  Clicked(e) {
    console.log(e);
    if (e.action === 'print') {

      // const initialState: any = {
      //   initialState: {
      //     InvoiceID: e.data.InvoiceID,
      //     StoreID: e.data.StoreID,
      //   },
      //   class: 'modal-lg',

      //   ignoreBackdropClick: false,
      // };
      // this.modalService.show(PrintGatepassComponent, initialState);
      window.open('/#/print/gatepass/' + e.data.InvoiceID + '/' + e.data.StoreID);

    }
  }
  RowClicked(event) {
    console.log(event);
    if (event.data.details.length == 0) {
      this.http
        .getData('qryinvoicedetails?filter=InvoiceID=' + event.data.InvoiceID + " and StoreID = " + event.data.StoreID)
        .then((r) => {
          event.data['details'] = r;
        });
    }
  }
}
