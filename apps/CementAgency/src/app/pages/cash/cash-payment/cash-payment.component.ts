import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Buttons } from '../../../../../../../libs/future-tech-lib/src/lib/components/navigator/navigator.component';
import {
  GetDateJSON,
  JSON2Date,
  getCurDate,
} from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { VoucherModel } from '../voucher.model';

@Component({
  selector: 'app-cash-payment',
  templateUrl: './cash-payment.component.html',
  styleUrls: ['./cash-payment.component.scss'],
})
export class CashPaymentComponent implements OnInit {
  @ViewChild('cmbCustomer') cmbCustomer;
  public Voucher = new VoucherModel();
  Customers = [];
  AcctTypes = [];
  EditID = '';
  public Ino = '';

  curCustomer: any = {};
  constructor(
    private http: HttpBase,
    private alert: MyToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.LoadCustomer('');

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params.EditID) {
        this.EditID = params.EditID;
        this.Ino = this.EditID;
        this.http
          .getData('qryvouchers?filter=VoucherID=' + this.EditID)
          .then((r: any) => {
            this.Voucher = r[0];
            this.Voucher.Date = GetDateJSON(new Date(r[0].Date));
            this.LoadCustomer({ AcctTypeID: r[0].AcctTypeID });
            this.GetCustomer(this.Voucher.CustomerID);
          });
      } else {
        this.EditID = '';
      }
      console.log(this.EditID);
    });
  }
  async FindINo() {
    let voucher: any = await this.http.getData('vouchers/' + this.Ino);
    if (voucher.Credit > 0)
      this.router.navigate(['/cash/cashreceipt/', this.Ino]);
    else this.router.navigate(['/cash/cashpayment/', this.Ino]);
  }
  LoadCustomer(event) {
    this.http
      .getData(
        'qrycustomers?flds=CustomerName,Address, Balance, CustomerID&orderby=CustomerName'
      )
      .then((r: any) => {
        this.Customers = r;
      });
  }
  SaveData() {
    let voucherid = '';
    this.Voucher.PrevBalance = this.curCustomer.Balance;
    this.Voucher.Date = JSON2Date(this.Voucher.Date);
    if (this.EditID != '') {
      voucherid = '/' + this.EditID;
    }

    console.log(this.Voucher);
    this.http
      .postTask('vouchers' + voucherid, this.Voucher)
      .then((r) => {
        this.alert.Sucess('Payment Saved', 'Save', 1);
        if (this.EditID != '') {
          this.router.navigateByUrl('/cash/cashpayment/');
        } else {
          this.Voucher = new VoucherModel();
          this.cmbCustomer.focusIn();
        }
      })
      .catch((err) => {
        this.Voucher.Date = GetDateJSON(getCurDate());
        this.alert.Error(err.error.msg, 'Error');
      });
  }
  GetCustomer(CustomerID) {
    console.log(CustomerID);
    if (CustomerID && CustomerID !== '') {
      this.http
        .getData('qrycustomers?filter=CustomerID=' + CustomerID)
        .then((r: any) => {
          this.curCustomer = r[0];
        });
    }
  }
  Round(amnt) {
    return Math.round(amnt);
  }
  NavigatorClicked(e) {
    let billNo = 240000001;
    switch (Number(e.Button)) {
      case Buttons.First:
        this.http.getData('getvouchno/P/0/F').then((r: any) => {
          this.router.navigateByUrl('/cash/cashpayment/' + r.Vno);
        });
        break;
      case Buttons.Previous:
        this.http
          .getData('getvouchno/P/' + this.EditID + '/B')
          .then((r: any) => {
            this.router.navigateByUrl('/cash/cashpayment/' + r.Vno);
          });
        break;
      case Buttons.Next:
        this.http
          .getData('getvouchno/P/' + this.EditID + '/N')
          .then((r: any) => {
            this.router.navigateByUrl('/cash/cashpayment/' + r.Vno);
          });
        break;
      case Buttons.Last:
        this.http.getData('getvouchno/P/0/L').then((r: any) => {
          this.router.navigateByUrl('/cash/cashpayment/' + r.Vno);
        });
        break;
      default:
        break;
    }
    //this.router.navigateByUrl('/sale/wholesale/' + billNo);
  }
  Add() {
    this.router.navigateByUrl('/cash/cashpayment');
  }
  Cancel() {
    this.Voucher = new VoucherModel();
    this.router.navigateByUrl('/cash/cashpayment');
  }
}
