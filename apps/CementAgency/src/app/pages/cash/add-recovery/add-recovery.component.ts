import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import { AddFormButton, AddLookupFld } from '../../../../../../../libs/future-tech-lib/src/lib/components/crud-form/crud-form-helper';
import { FindTotal, getCurDate, getYMDDate } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';

@Component({
  selector: 'app-add-recovery',
  templateUrl: './add-recovery.component.html',
  styleUrls: ['./add-recovery.component.scss'],
})
export class AddRecoveryComponent implements OnInit {
  @ViewChild('cmbCustomer')

  VouchersList = [];
  Filter: any = {};

  FilterForm = {
    CrudButton: false,
    title: 'Filter Data',
    columns: [


      AddLookupFld("SalesmanID", "Salesman", "salesman", "SalesmanID", "SalesmanName", 3, [], false),
      AddLookupFld("RouteID", "Route", "routes", "RouteID", "RouteName", 3, [], false),
      AddFormButton("Filter", (e) => {
        this.FilterData();
      }, 2, 'search', 'primary'),
      AddFormButton("Save Recovery", (e) => {
        this.SaveVouchers();
      }, 2, 'save', 'success')
    ]

  }


  constructor(
    private http: HttpBase,
    private alert: MyToastService,
    private router: Router
  ) { }

  ngOnInit() {


  }

  FilterData() {

    let filter = "";


    filter += ' RouteID = ' + this.Filter.RouteID;
    filter += ' and Balance > 10'
    this.http.getData('qrycustomers?flds=CustomerID,CustomerName,Address,City,Balance as Amount,\'0.0\' as Recovery,  Balance&filter=' + filter)
      .then((d: any) => {
        this.VouchersList = d;
      })
  }

  SaveVouchers() {


    swal({
      text: 'Save All Vouchers ?',
      icon: 'warning',
      buttons: {
        cancel: true,
        confirm: true,
      },
    })
      .then(willPay => {
        if (willPay) {
          const VocuherData = {
            Date: getYMDDate(new Date(getCurDate())),
            SalesmanID: this.Filter.SalesmanID,
            RouteID: this.Filter.RouteID,
            ClosingID: this.http.getClosingID(),
            Data: this.VouchersList
          }

          console.log(VocuherData);

          this.http.postTask('addrecovery', VocuherData).then(s => {
            this.alert.Sucess('Recovery Saved', 'Add recovery')
          }).catch(err => {
            this.alert.Error(err.Error.msg, "Error")
          })
          this.VouchersList = [];

        }
      });




  }
  FindTotal(fld) {
    FindTotal(this.VouchersList, fld)
  }
  SalesmanChange(e) {
    if (e.itemData && e.itemData.SalesmanID !== '') {
      this.LoadVouchers(e.itemData.SalesmanID);
    }
  }
  RouteChange(e) {
    console.log(e);
    if (e.itemData && e.itemData.RouteID !== '') {
      this.http.getAcctstList(e.itemData.RouteID).then((r: any) => {
        this.VouchersList = r;


      });
    }
  }
  Clicked(e) {
    console.log(e);
    if (e.action === 'Delete') {
      swal({
        text: 'Delete this voucher!',
        icon: 'warning',
        buttons: {
          cancel: true,
          confirm: true,
        },
      }).then((willDelete) => {
        if (willDelete) {
          this.http
            .getData('delete/vouchers/' + e.data.VoucherID)
            .then((r) => {

              swal('Deleted!', 'Your voucher has been deleted!', 'success');
            })
            .catch((er) => {
              swal('Oops!', 'Error while deleting voucher', 'error');
            });
        }
      });
    }
  }
  LoadVouchers(smID) {

  }

  CashRecvd(d) {
    d.Recovery = d.Amount;

  }
  Round(amnt) {
    return Math.round(amnt);
  }
}
