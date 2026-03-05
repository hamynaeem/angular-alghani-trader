import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
// import swal from 'sweetalert'; // Removed unused import
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-expense-report',
  templateUrl: './expense-report.component.html',
  styleUrls: ['./expense-report.component.scss']
})
export class ExpenseReportComponent implements OnInit {
  public data: object[] = [];
  public Heads: object[] = [];

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    HeadID: '',

  };
  setting = {
    Columns: [
      {
        label: 'Date',
        fldName: 'Date'
      },
      {
        label: 'Head',
        fldName: 'HeadName'
      },
      {
        label: 'Description',
        fldName: 'Description'
      },

      {
        label: 'Amount',
        fldName: 'Amount',
        sum: true
      },

    ],
    Actions: [
    ],
    Data: []
  };


  public toolbarOptions: object[] = [];
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    // private myToaster: MyToastService, // Removed unused parameter
    private router: Router
  ) { }

  ngOnInit() {
    // load expense heads (table name is expenseheads)
    this.http.getData('expenseheads').then((r: any) => {
      this.Heads = r;
    });

    this.FilterData();

  }
  getHeadName(): string {
    try {
      if (!this.Heads || !this.Filter.HeadID) return '';
      const id = String(this.Filter.HeadID);
      const h: any = (this.Heads as any[]).find((x: any) => String(x.HeadID || x.id || x.ID) === id);
      return h ? (h.HeadName || h.Head || '') : '';
    } catch (e) {
      return '';
    }
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Expense Report';
    this.ps.PrintData.SubTitle = 'From :' + JSON2Date(this.Filter.FromDate) + ' To: ' + JSON2Date(this.Filter.ToDate);

    this.router.navigateByUrl('/print/print-html');
  }
  FilterData() {
    // tslint:disable-next-line:quotemark
    let filter = "Date between '" + JSON2Date(this.Filter.FromDate) +
      '\' and \'' + JSON2Date(this.Filter.ToDate) + '\'';


    if (!(this.Filter.HeadID === '' || this.Filter.HeadID === null)) {
      filter += ' and HeadID=' + this.Filter.HeadID;
    }
    // qryexpenses view may not exist on all DBs; request raw `expend` rows and map HeadName client-side
    this.http.getData('expend?filter=' + filter).then((r: any) => {
      // map fields to expected names
      const headsMap = {} as any;
      (this.Heads || []).forEach((h: any) => {
        headsMap[h.HeadID || h.HeadId || h.id || h.ID] = h.Head || h.HeadName || h.head || '';
      });

      this.data = (r || []).map((row: any) => {
        return {
          Date: row.Date,
          HeadName: headsMap[row.headid] || headsMap[row.HeadID] || '',
          Description: row.Desc || row.Description || row.Descp || '',
          Amount: row.Amount || 0,
        };
      });
    });
  }
  Clicked(e: any) {
    console.log(e);

  }
}
