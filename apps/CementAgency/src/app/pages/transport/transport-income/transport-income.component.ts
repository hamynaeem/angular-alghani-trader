import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';
import { TransportDetail } from '../transport.model';

@Component({
  selector: 'app-transport-income',
  templateUrl: './transport-income.component.html',
  styleUrls: ['./transport-income.component.scss'],
})
export class TransportIncomeComponent implements OnInit {
  @ViewChild('cmbCustomer') cmbCustomer: any;
  public Voucher: TransportDetail = {
    Date: new Date(),
    TransportID: 0,
    Details: null,
    Income: 0,
    Expense: 0,
  };
  AcctTypes = [];
  EditID = '';
  public Ino = '';
  private AcctTypeID = '';
  curVehicle: any = {};
  Products: any = [];
  Vehicles: any = [];
  constructor(
    private http: HttpBase,
    private alert: MyToastService,
    private router: Router,

    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.Cancel();

    this.LoadVehicles();

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params.EditID) {
        this.EditID = params.EditID;
        this.Ino = this.EditID;
        this.http
          .getData('qryvouchers?filter=VoucherID=' + this.EditID)
          .then((r: any) => {
            this.Voucher = r[0];
            this.Voucher.Date = GetDateJSON(new Date(r[0].Date));
            this.GetVehicle(this.Voucher.TransportID);
          });
      } else {
        this.EditID = '';
      }
      console.log(this.EditID);
    });
  }
  async FindINo() {
    let voucher: any = await this.http.getData('transportdetails/' + this.Ino);
    if (voucher.Income > 0)
      this.router.navigate(['/transport/income/', this.Ino]);
    else this.router.navigate(['/transport/expense/', this.Ino]);
  }
  LoadVehicles() {
    console.log('in vehicles');

    this.http.getData('transports').then((r: any) => {
      this.Vehicles = r;
    });
  }


  SaveData() {
    let voucherid = '';

    this.Voucher.Date = JSON2Date(this.Voucher.Date);
    if (this.EditID != '') {
      voucherid = '/' + this.EditID;
    }

    console.log(this.Voucher);
    // Prepare payload with correct types to match backend expectations
    const payload: any = Object.assign({}, this.Voucher);
    payload.TransportID = Number(payload.TransportID) || 0;
    payload.Income = Number(payload.Income) || 0;
    payload.Expense = Number(payload.Expense) || 0;
    payload.Details = payload.Details || '';

    this.http
      .postTask('transportvoucher' + voucherid, payload)
      .then((r) => {
        this.alert.Sucess('Income Saved', 'Save', 1);
        if (this.EditID != '') {
          this.router.navigateByUrl('/transport/income/');
        } else {
          this.Cancel()

        }
      })
      .catch((err) => {
        this.Voucher.Date = GetDateJSON();
        console.log('SaveData error:', err);
        let msg = 'Internal Server Error';
        try {
          if (err && err.error) {
            msg = typeof err.error === 'string' ? err.error : err.error.message || JSON.stringify(err.error);
          } else if (err && err.statusText) {
            msg = err.statusText;
          }
        } catch (e) {
          msg = 'Unexpected error';
        }

        this.alert.Error(msg, 'Error', 1);
      });
  }
  GetVehicle(VehicleID: number) {
    console.log(VehicleID);

    if (VehicleID && VehicleID !== 0) {
      this.http
        .getData('transports?filter=TransportID=' + VehicleID)
        .then((r: any) => {
          this.curVehicle = r[0];
        });
    }
  }
  Round(amnt: number) {
    return Math.round(amnt);
  }

  Cancel() {
    this.Voucher = {
      Date: GetDateJSON(new Date()),
      TransportID: 0,
      Details: null,
      Income: 0,
      Expense: 0,
    };

    this.router.navigateByUrl('/transport/income');
  }
}
