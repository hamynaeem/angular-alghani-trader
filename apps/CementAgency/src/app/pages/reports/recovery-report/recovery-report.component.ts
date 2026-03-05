import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';

@Component({
  selector: 'app-recovery-report',
  templateUrl: './recovery-report.component.html',
  styleUrls: ['./recovery-report.component.scss']
})
export class RecoveryReportComponent implements OnInit {
  public data: any = [];
  public AcctTypes: any = [];


  public Filter = {
    
    AcctTypeID: '',
  };
  setting = {
    Checkbox: false,
    Columns: [

      {
        label: 'Customer Name',
        fldName: 'CustomerName'
      },
      {
        label: 'Address',
        fldName: 'Address'
      },
      {
        label: 'Address',
        fldName: 'Address'
      },
      {
        label: 'Balance',
        fldName: 'Balance',
        sum: true
      },
      

    ],
    Actions: [

    ],
    Data: []
  };


  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private router: Router
  ) { }

  ngOnInit() {
    
this.http.getData('accttypes').then ((r:any) =>{
  this.AcctTypes = r; 
})
    this.FilterData();

  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    

    this.ps.PrintData.SubTitle = '';   // 'From :' + JSON2Date(this.Filter.FromDate) + ' To: ' + JSON2Date(this.Filter.ToDate);
    console.log(this.Filter);

    this.router.navigateByUrl('/print/print-html');
  }
 
  FilterData() {
    // tslint:disable-next-line:quotemark
    let filter = " 1=1 ";

    
    if (!(this.Filter.AcctTypeID === '' || this.Filter.AcctTypeID === null)) {
      filter += ' and AcctTypeID=' + this.Filter.AcctTypeID;
    }

    this.http.getData('qrycustomers?flds=CustomerName,Address,City,PhoneNo1,AcctType,Balance&filter=' + filter).then((r: any) => {
      this.data = r;
    });
  }
}
