import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormatDate, GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';

@Component({
  selector: 'app-customer-accounts',
  template: `
    <div class="card border-0">
      <div class="card-header bg-light">
        <h5 class="mb-0">Account Statement</h5>
      </div>
      <div class="card-body">
        <!-- Date Filters -->
        <div *ngIf="showFilters" class="row mb-3">
          <div class="col-md-3">
            <label>From Date:</label>
            <div class="input-group">
              <input
                class="form-control"
                placeholder="yyyy-mm-dd"
                name="dtFrom"
                [(ngModel)]="Filter.FromDate"
                ngbDatepicker
                #dtFrom="ngbDatepicker"
              />
              <div class="input-group-append">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  (click)="dtFrom.toggle()"
                >
                  <i class="fa fa-calendar"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <label>To Date:</label>
            <div class="input-group">
              <input
                class="form-control"
                placeholder="yyyy-mm-dd"
                name="dtTo"
                [(ngModel)]="Filter.ToDate"
                ngbDatepicker
                #dtTo="ngbDatepicker"
              />
              <div class="input-group-append">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  (click)="dtTo.toggle()"
                >
                  <i class="fa fa-calendar"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <label>&nbsp;</label>
            <button
              type="button"
              class="btn btn-primary form-control"
              (click)="FilterData()"
            >
              <i class="fa fa-search"></i> Filter
            </button>
          </div>
        </div>

        <!-- Customer Balance Info -->
        <div class="row mb-3">
          <div class="col-md-4">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <h6>Opening Balance</h6>
                <h4>{{ customer.OpenBalance | currency:'PKR':'symbol':'1.2-2' }}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <h6>Closing Balance</h6>
                <h4>{{ customer.CloseBalance | currency:'PKR':'symbol':'1.2-2' }}</h4>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-warning text-white">
              <div class="card-body text-center">
                <h6>Net Movement</h6>
                <h4>{{ (customer.CloseBalance - customer.OpenBalance) | currency:'PKR':'symbol':'1.2-2' }}</h4>
              </div>
            </div>
          </div>
        </div>

        <!-- Accounts Table -->
        <div class="table-responsive">
          <ft-dynamic-table
            [Settings]="setting"
            [Data]="data"
            (ClickAction)="InvNoClicked($event)">
          </ft-dynamic-table>
        </div>
      </div>
    </div>
  `,
  styleUrls: []
})
export class CustomerAccountsComponent implements OnInit, OnChanges {
  @Input() customerData: any = {};
  @Input() showFilters: boolean = true;

  public data: any = [];
  public customer: any = {};

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
    CustomerID: '',
  };

  setting = {
    Columns: [
      {
        label: 'Date',
        fldName: 'Date',
      },
      {
        label: 'Invoice No',
        fldName: 'RefID',
        button: {
          style: 'link',
          callback: (e: any) => { this.InvNoClicked(e) }
        },
      },
      {
        label: 'Notes',
        fldName: 'Notes',
      },
      {
        label: 'Description',
        fldName: 'Description',
      },
      {
        label: 'Debit',
        fldName: 'Debit',
        sum: true,
        type: 'number'
      },
      {
        label: 'Credit',
        fldName: 'Credit',
        sum: true,
        type: 'number'
      },
      {
        label: 'Balance',
        fldName: 'Balance',
        type: 'number'
      },
    ],
    Actions: [],
    Data: [],
  };

  constructor(private http: HttpBase) {}

  ngOnInit() {
    this.Filter.FromDate.day = 1;
    if (this.customerData && this.customerData.CustomerID) {
      this.customer = { ...this.customerData };
      this.Filter.CustomerID = this.customerData.CustomerID;
      this.FilterData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customerData'] && !changes['customerData'].firstChange) {
      this.customer = { ...this.customerData };
      this.Filter.CustomerID = this.customerData.CustomerID;
      this.FilterData();
    }
  }

  FilterData() {
    if (!this.Filter.CustomerID) {
      return;
    }

    let filter = "Date between '" + JSON2Date(this.Filter.FromDate) + "' and '" + JSON2Date(this.Filter.ToDate) + "'";
    filter += ' and CustomerID=' + this.Filter.CustomerID;

    this.http.getData('qrycustomeraccts?filter=' + filter + '&orderby=DetailID').then((r: any) => {
      this.data = r;
      if (this.data.length > 0) {
        this.customer.OpenBalance = (this.data[0].Balance - this.data[0].Debit) * 1 + this.data[0].Credit * 1;
        this.customer.CloseBalance = this.data[this.data.length - 1].Balance;

        this.data.unshift({
          Date: this.data[0].Date,
          Description: 'Opening Balance...',
          Debit: 0,
          Credit: 0,
          Balance: this.customer.OpenBalance,
        });
      } else {
        // Handle case where no transactions in date range
        let pastFilter = " Date < '" + JSON2Date(this.Filter.FromDate) + "'";
        pastFilter += ' and CustomerID=' + this.Filter.CustomerID;

        this.http.getData('qrycustomeraccts?filter=' + pastFilter + '&orderby=DetailID desc&limit=1').then((r: any) => {
          if (r.length > 0) {
            this.customer.OpenBalance = r[0].Balance;
            this.customer.CloseBalance = r[0].Balance;
          } else {
            this.customer.OpenBalance = 0;
            this.customer.CloseBalance = 0;
          }

          this.data.unshift({
            Date: JSON2Date(this.Filter.FromDate),
            Description: 'Opening Balance...',
            Debit: 0,
            Credit: 0,
            Balance: this.customer.OpenBalance,
          });
        });
      }
    });
  }

  InvNoClicked(e: any) {
    console.log(e);
    if (e.data.RefType == 1) {
      this.http.PrintSaleInvoice(e.data.RefID);
    } else if (e.data.RefType == 2) {
      this.http.PrintPurchaseInvoice(e.data.RefID);
    }
  }

  formatDate(d: any) {
    return FormatDate(JSON2Date(d));
  }
}
