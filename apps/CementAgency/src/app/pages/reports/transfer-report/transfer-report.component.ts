import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { CachedDataService } from '../../../services/cacheddata.service';
import { HttpBase } from '../../../services/httpbase.service';
import { PrintDataService } from '../../../services/print.data.services';
import { MyToastService } from '../../../services/toaster.server';

@Component({
  selector: 'app-transfer-report',
  templateUrl: './transfer-report.component.html',
  styleUrls: ['./transfer-report.component.scss'],
})
export class TransferReportComponent implements OnInit {
  @ViewChild('RptTable') RptTable;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    SalesmanID: '',
    RouteID: '',
  };
  Salesman = this.cachedData.Salesman$;
  public Routes = this.cachedData.routes$;
  public data: object[];

  setting = {
    Checkbox: false,
    Columns: [
      {
        label: 'Transfer No',
        fldName: 'TransferID',
      },
      {
        label: 'Date',
        fldName: 'Date',
      },
      {
        label: 'From Store',
        fldName: 'FromStoreName',
      },
      {
        label: 'To Store',
        fldName: 'ToStoreName',
      },
      {
        label: 'Account',
        fldName: 'CustomerName',
      },
      {
        label: 'Status',
        fldName: 'Status',
      },
    ],
    Actions: [
      {
        action: 'print',
        title: 'Print',
        icon: 'print',
        class: 'primary',
      },
      {
        action: 'edit',
        title: 'Edit',
        icon: 'pencil',
        class: 'warning',
      },
      {
        action: 'post',
        title: 'Post',
        icon: 'check',
        class: 'success',
      },
      {
        action: 'delete',
        title: 'Delete',
        icon: 'trash',
        class: 'danger',
      },
    ],
    SubTable: {
      table: 'details',
      Columns: [
        {
          label: 'Product Name',
          fldName: 'ProductName',
        },
        {
          label: 'Qty',
          fldName: 'Qty',
          sum: true,
        },
        {
          label: 'Packing',
          fldName: 'Packing',
        },
        {
          label: 'KGs',
          fldName: 'KGs',
          sum: true,
        },
      ],
    },
  };

  public toolbarOptions: object[];
  constructor(
    private http: HttpBase,
    private ps: PrintDataService,
    private cachedData: CachedDataService,
    private myToaster: MyToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.FilterData();
  }
  PrintReport() {
    this.ps.PrintData.HTMLData = document.getElementById('print-section');
    this.ps.PrintData.Title = 'Transfer Report';
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

    this.http.getData('qrystocktransfer?filter=' + filter).then((r: any) => {
      this.data = r.map((obj: any) => {
        return {
          ...obj,
          details: [],
          Status: obj.IsPosted == 0 ? 'Un-Posted' : 'Posted',
        };
      });
    });
  }
  Clicked(e) {
    console.log(e);
    if (e.action === 'print') {
      this.router.navigateByUrl('/print/printinvoice/' + e.data.TransferID);
    } else if (e.action === 'edit') {
      if (e.data.IsPosted === '1') {
        this.myToaster.Error("Can't edit posted transfer", 'Error', 1);
      } else {
        this.router.navigateByUrl('/sale/transfer/' + e.data.TransferID);
      }
    } else if (e.action === 'post') {
      if (e.data.IsPosted == '1') {
        this.myToaster.Error('Transfer Already Posted', 'Post');
      } else {
        this.http
          .postTask('poststransfer/' + e.data.TransferID, {})
          .then((r) => {
            this.myToaster.Sucess('Transfer is posted', 'Post');
            e.data.IsPosted = '1';
            e.data.Status = 'Posted';
          });
      }
    } else if (e.action === 'delete') {
      if (e.data.IsPosted === '0') {
        swal({
          text: 'Delete this Transfer!',
          icon: 'warning',
          buttons: {
            cancel: true,
            confirm: true,
          },
        }).then((willDelete) => {
          if (willDelete) {
            this.http
              .postTask('delete', { ID: e.data.TransferID, Table: 'S' })
              .then((r) => {
                this.FilterData();
                swal('Deleted!', 'Your data has been deleted!', 'success');
              })
              .catch((er) => {
                swal('Oops!', 'Error while deleting voucher', 'error');
              });
          }
        });
      } else {
        swal('Oops!', 'Can not delete posted data', 'error');
      }
    }
  }
  RowClicked(event) {
    console.log(event);

    if (event.data.details.length == 0) {
      this.http
        .getData(
          'qrytransferdetails?filter=TransferID=' + event.data.TransferID
        )
        .then((r) => {
          event.data['details'] = r;
        });
    }
  }
}
