import { Component, OnInit, ViewChild } from '@angular/core';
import { JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { VoucherModel } from '../voucher.model';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import swal from 'sweetalert';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss']
})
export class AddExpenseComponent implements OnInit {
  @ViewChild('cmbCustomer') cmbCustomer: DropDownListComponent;
  public Voucher = new VoucherModel();
  Customers = [];
  Salesmen = [];
  Routes = [];

  curCustomer: any = {};
  VouchersList: object[];

  setting = {
    Columns: [
      {
        label: 'Date',
        fldName: 'Date'
      },
      {
        label: 'Customer Name',
        fldName: 'CustomerName'
      },
      {
        label: 'Address',
        fldName: 'Address'
      },
      {
        label: 'City',
        fldName: 'City'
      },
      {
        label: 'Amount Paid',
        fldName: 'Debit',
        sum: true
      }
    ],
    Actions: [
      {
        action: 'Delete',
        title: '',
        icon: 'trash'

      }
    ],
    Data: []
  };
  constructor(
    private http: HttpBase,
    private alert: MyToastService
  ) { }

  ngOnInit() {
    this.http.getData('qrycustomers').then((r: any) => {
        this.Customers = r;
      });

    this.LoadVouchers();

  }
  SaveData() {
    const vm: any = { smID: this.Voucher.SalesmanID, rtID: this.Voucher.RouteID };
    this.Voucher.Date = JSON2Date(this.Voucher.Date);
    this.Voucher.PrevBalance = this.curCustomer.Balance;
    console.log(this.Voucher);
    this.http.postTask('vouchers', this.Voucher).then(r => {
      this.alert.Sucess('Payment Saved', 'Save', 1);
      this.Voucher = new VoucherModel();

      this.Voucher.RouteID = vm.rtID;
      this.cmbCustomer.focusIn();
      this.LoadVouchers();
    });
  }
  GetCustomer(e) {
    console.log(e);
    if (e.itemData && e.itemData.CustomerID !== '') {
      this.http.getData('qrycustomers?filter=CustomerID=' + e.itemData.CustomerID).then((r: any) => {
        this.curCustomer = r[0];
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
      })
        .then(willDelete => {
          if (willDelete) {
            this.http.getData('delete/vouchers/' + e.data.VoucherID).then(r => {
              this.LoadVouchers();
              swal('Deleted!', 'Your voucher has been deleted!', 'success');

            }).catch(er => {
              swal('Oops!', 'Error while deleting voucher', 'error');
            });

          }
        });
    }

  }
  LoadVouchers() {
    this.http.getData('qryvouchers?filter=Date=\'' + JSON2Date(this.Voucher.Date) +
      '\' and Debit>0 ').then((r: any) => {
        this.VouchersList = r;
      });
  }
  Round(amnt) {
    return Math.round(amnt);
  }
}
