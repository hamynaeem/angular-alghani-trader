import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { MyToastService } from '../../../services/toaster.server';

@Component({
  selector: 'app-short-stock',
  templateUrl: './short-stock.component.html',
  styleUrls: ['./short-stock.component.scss'],
})
export class ShortStockComponent implements OnInit {
  @ViewChild('RptTable') RptTable;
  @ViewChild('cmbRoute') cmbRoute : ComboBoxComponent;

  public Filter = {
    City: '',
    Balance: '10'
  };
  setting = {
    Checkbox: false,
    Columns: [
      {
        label: 'ProductName',
        fldName: 'ProductName',
      },

      {
        label: 'Packing',
        fldName: 'Packing',

      },
      {
        label: 'Minimum Stock',
        fldName: 'ShortStock',
      },
      {
        label: 'Stock',
        fldName: 'Stock',
      },
      {
        label: 'PPrice',
        fldName: 'PPrice',
      },
      {
        label: 'SPrice',
        fldName: 'SPrice',
      },


      {
        label: 'Unit',
        fldName: 'UnitName',
      },


    ],
    Actions: [

    ],
    Data: [],
  };

  public Cities:any=[];
  public data: object[];

  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    private myToaster: MyToastService,
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
      "Stock<ShortStock";

    this.http.getData('qrystock?filter=' + filter).then((r: any) => {
      this.data = r;
    });
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Short Stock Report';
    this.ps.PrintData.SubTitle =
      '';

    this.router.navigateByUrl('/print/print-html');
  }
}
