import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../../../../../../libs/future-tech-lib/src/lib/components/services/modal.service';
import { GetDate } from '../../../../../../../libs/future-tech-lib/src/lib/utilities/utilities';
import {
  GetDateJSON,
  JSON2Date,
  getCurDate,
} from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { LabourAddForm, LabourRptStngs } from './labour-report.settings';

@Component({
  selector: 'app-labour-report',
  templateUrl: './labour-report.component.html',
  styleUrls: ['./labour-report.component.scss'],
})
export class LabourReportComponent implements OnInit {
  @ViewChild('RptTable') RptTable;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),

    HeadID: '',
  };
  LabourHaeds: any = [];
  public data: object[];
  settings = LabourRptStngs;
  addform = LabourAddForm;

  public toolbarOptions: object[];
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private modalSrvc: ModalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.http.getData('labourheads').then((r) => {
      this.LabourHaeds = r;
    });
    this.FilterData();
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Labour Report';
    this.ps.PrintData.SubTitle =
      'From :' +
      JSON2Date(this.Filter.FromDate) +
      ' To: ' +
      JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  FilterData() {
    // tslint:disable-next-line:quotemark
    let filter = {
      FromDate: JSON2Date(this.Filter.FromDate),
      ToDate: JSON2Date(this.Filter.ToDate),
      HeadID: '0',
    };
    if (this.Filter.HeadID && this.Filter.HeadID != '')
      filter.HeadID = this.Filter.HeadID;

    this.http.postData('labourreport', filter).then((r: any) => {
      this.data = r;
    });
  }
  AddLabour() {
    this.http
      .openForm(this.addform, {
        Date: GetDate(new Date(getCurDate())),
      })
      .then((r: any) => {
        if (r == 'save') {
          this.FilterData();
        }
      });
  }

  Clicked(e) {
    console.log(e);
    if (e.action === 'edit' && e.data.LabourID > 0) {
      const data = {
        LabourID: e.data.LabourID,
        Date: e.data.Date,
        LabourHeadID: e.data.LabourHeadID,
        Amount: e.data.Labour,
        Description: e.data.Description,
      };
      console.log(data);

      this.http.openForm(this.addform, data).then((r: any) => {
        if (r == 'save') {
          this.FilterData();
        }
      });
    }
  }
}
