import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { formatNumber } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { MyToastService } from '../../../services/toaster.server';

@Component({
  selector: 'app-credit-list',
  templateUrl: './credit-list.component.html',
  styleUrls: ['./credit-list.component.scss'],
})
export class CreditlistComponent implements OnInit {
  @ViewChild('RptTable') RptTable!: any;
  @ViewChild('cmbRoute') cmbRoute!: ComboBoxComponent;

  public Filter = {
    City: '',
    Balance: '10'
  };
  setting = {
    Checkbox: false,
    Columns: [
      {
        label: 'C. Code',
        fldName: 'CustomerID',
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
        label: 'Phone No',
        fldName: 'PhoneNo1',
      },
      {
        label: 'NTN',
        fldName: 'NTN',
        valueFormatter: (d: any) => {
          return (
            d['NTN'] || d['NTNNo'] || d['NTNNumber'] || d['TaxNo'] || ''
          );
        },
      },
      {
        label: 'CNIC',
        fldName: 'CNIC',
        valueFormatter: (d: any) => {
          return (
            d['CNIC'] || d['Cnic'] || d['NIC'] || d['NICNo'] || d['CNICNo'] || ''
          );
        },
      },
      {
        label: 'Amount',
        fldName: 'Balance',
        sum: true,
        valueFormatter: (d: any) => {
          return formatNumber(d['Balance']);
        },
      },

    ],
    Actions: [

    ],
    Data: [],
  };

  public Cities:any=[];
  public data: object[] = [];

  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    // private myToaster: MyToastService,
    private router: Router
  ) {
    this.Cities = this.cachedData.routes$;
  }

  ngOnInit() {
    this.http.getData('qrycities?orderby=City').then((a) => {
      this.Cities = a;
    });
    this.FilterData();
  }

  FilterData() {
    let filter =
      "1=1";
    if (this.Filter.City) filter += ` and City='${this.Filter.City}'`
    if (this.Filter.Balance) filter += ' and Balance >=' + this.Filter.Balance

    // request full customer record (flds omitted) so optional fields like NTN/CNIC are included if present
    this.http.getData('qrycustomers?filter=' + filter).then((r: any) => {
      this.data = r;
    });
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Credit List';
    this.ps.PrintData.SubTitle =
      'City: ' + this.cmbRoute.text;

    this.router.navigateByUrl('/print/print-html');
  }
}
