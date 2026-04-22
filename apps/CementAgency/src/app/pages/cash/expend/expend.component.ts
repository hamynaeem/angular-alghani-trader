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
  public Expenses: any[] = [];
  public showExpenses = false;
  public showAll = false;
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

    // restore persisted showAll preference
    try {
      const val = localStorage.getItem('expend_showAll');
      this.showAll = val === '1';
    } catch (e) {}

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
      // refresh list if visible
      if (this.showExpenses) this.loadExpenses();
    });
  }

  toggleShowExpenses() {
    this.showExpenses = !this.showExpenses;
    if (this.showExpenses) this.loadExpenses();
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
    try { localStorage.setItem('expend_showAll', this.showAll ? '1' : '0'); } catch (e) {}
    if (this.showExpenses) this.loadExpenses();
  }

  loadExpenses() {
    // if showAll true, fetch all expenses, otherwise fetch recent / filtered
    const url = this.showAll ? 'expend?all=1' : 'expend';
    this.http.getData(url).then((r: any) => {
      const raw: any = r || [];
      let list: any[] = [];
      if (Array.isArray(raw)) list = raw;
      else if (raw && Array.isArray(raw.data)) list = raw.data;
      else list = [];
      // normalize date to JS Date if possible
      this.Expenses = list.map((it: any) => {
        try { it.Date = new Date(it.Date); } catch (e) {}
        // resolve Head name from loaded ExpenseHeads or fallback properties
        try {
          let hid: any = undefined;
          if (it) {
            if (it.HeadID !== undefined && it.HeadID !== null) hid = it.HeadID;
            else if (it.HeadId !== undefined && it.HeadId !== null) hid = it.HeadId;
            else if (it.Head !== undefined && it.Head !== null) hid = it.Head;
          }
          const foundHead = (this.ExpenseHeads || []).find((h: any) => {
            try {
              const candidate = h && (h.HeadID !== undefined ? h.HeadID : (h.ID !== undefined ? h.ID : (h.Id !== undefined ? h.Id : undefined)));
              return String(candidate) === String(hid);
            } catch (e) { return false; }
          });
          it.HeadName = foundHead ? (foundHead.Head || foundHead.HeadName || foundHead.Name || '') : (it.HeadName || it.Head || it.ExpenseHead || '');
        } catch (e) { it.HeadName = it.HeadName || it.Head || it.ExpenseHead || ''; }
        return it;
      });
    }).catch((_e) => {
      this.Expenses = [];
    });
  }

  Round(amnt: number): number {
    return Math.round(amnt);
  }
}
