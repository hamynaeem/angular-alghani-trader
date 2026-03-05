import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { MyToastService } from '../../../services/toaster.server';

class ExpenseModel {
  Date: any = GetDateJSON();
  HeadID = '';
  Desc = '';
  Amount = 0;
}
@Component({
  selector: 'app-expend',
  templateUrl: './expend.component.html',
  styleUrls: ['./expend.component.scss'],
})
export class ExpendComponent implements OnInit {
  @ViewChild('cmbHeads') cmbHeads: any;
  public Voucher = new ExpenseModel();
  ExpenseHeads = [];
  EditID = '';
  curCustomer: any = {};
  constructor(
    private http: HttpBase,
    private alert: MyToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.http.getData('expenseheads').then((r: any) => {
      this.ExpenseHeads = r;
    });

    this.activatedRoute.params.subscribe((params: Params) => {
      if (params.EditID) {
        this.EditID = params.EditID;
        this.http
          .getData('expend/' + this.EditID)
          .then((r: any) => {
            if (r) {
              this.Voucher = r;
              this.Voucher.Date = GetDateJSON(new Date(r.Date));
            }
          }).catch((_err) => {
            this.alert.Error('Not found', 'Error', 1);
          });
      } else {
        this.EditID = '';
      }
    });
  }
  SaveData() {
    this.Voucher.Date = JSON2Date(this.Voucher.Date);
    console.log(this.Voucher);


    this.http.postData('expend' + (this.EditID ? '/' + this.EditID : ''), this.Voucher).then((_r) => {
      this.alert.Sucess('Expense Saved', 'Save', 1);
      this.Voucher = new ExpenseModel();
      this.router.navigateByUrl('/cash/expense' );
      this.cmbHeads.focusIn();
    });
  }

  Round(amnt: number): number {
    return Math.round(amnt);
  }
}
