import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormatDate, GetDateJSON, JSON2Date } from '../../../factories/utilities';
import { HttpBase } from '../../../services/httpbase.service';
import { CustomerAuthService } from '../services/customer-auth.service';

@Component({
  selector: 'app-customer-ledger',
  template: `
    <div class="container-fluid">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-gradient-primary text-white">
          <div class="d-flex align-items-center">
            <i class="fas fa-file-invoice-dollar me-2"></i>
            <h5 class="mb-0">Account Ledger</h5>
          </div>
        </div>
        <div class="card-body">
          <!-- Customer Selection Dropdown -->
          <div class="row mb-4">
            <div class="col-md-6">
              <label class="form-label">Select Customer:</label>
              <ng-select
                [items]="customersList"
                bindLabel="CustomerName"
                bindValue="CustomerID"
                [(ngModel)]="selectedCustomerID"
                (change)="onCustomerSelected($event)"
                placeholder="Search and select a customer..."
                [loading]="loadingCustomers"
                [searchable]="true"
                [clearable]="true"
              >
                <ng-template ng-label-tmp let-item="item">
                  {{ item.CustomerName }} - {{ item.PhoneNo1 }}
                </ng-template>
                <ng-template ng-option-tmp let-item="item">
                  <div>
                    <strong>{{ item.CustomerName }}</strong>
                    <span class="ms-2 text-muted">{{ item.PhoneNo1 }}</span>
                  </div>
                </ng-template>
              </ng-select>
            </div>
          </div>

          <!-- Date Filters -->
          <div class="row mb-4">
            <div class="col-md-3">
              <label class="form-label">From Date:</label>
              <div class="input-group">
                <input
                  class="form-control"
                  placeholder="yyyy-mm-dd"
                  name="dtFrom"
                  [(ngModel)]="Filter.FromDate"
                  ngbDatepicker
                  #dtFrom="ngbDatepicker"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  (click)="dtFrom.toggle()"
                >
                  <i class="fas fa-calendar"></i>
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">To Date:</label>
              <div class="input-group">
                <input
                  class="form-control"
                  placeholder="yyyy-mm-dd"
                  name="dtTo"
                  [(ngModel)]="Filter.ToDate"
                  ngbDatepicker
                  #dtTo="ngbDatepicker"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  (click)="dtTo.toggle()"
                >
                  <i class="fas fa-calendar"></i>
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label">&nbsp;</label>
              <button
                type="button"
                class="btn btn-primary form-control"
                (click)="FilterData()"
                [disabled]="loading"
              >
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i *ngIf="!loading" class="fas fa-search me-2"></i>
                {{ loading ? 'Loading...' : 'Filter' }}
              </button>
            </div>
            <div class="col-md-3">
              <label class="form-label">&nbsp;</label>
              <button
                type="button"
                class="btn btn-outline-secondary form-control"
                (click)="exportData()"
                [disabled]="data.length === 0"
              >
                <i class="fas fa-download me-2"></i>
                Export
              </button>
            </div>
          </div>

          <!-- Balance Summary Cards -->
          <div class="row mb-4">
            <div class="col-md-4">
              <div class="card bg-info text-white">
                <div class="card-body text-center">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="mb-1">Opening Balance</h6>
                      <h4 class="mb-0">{{ customer?.OpenBalance | currency:'PKR':'symbol':'1.2-2' }}</h4>
                    </div>
                    <i class="fas fa-balance-scale fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-success text-white">
                <div class="card-body text-center">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="mb-1">Closing Balance</h6>
                      <h4 class="mb-0">{{ customer?.CloseBalance | currency:'PKR':'symbol':'1.2-2' }}</h4>
                    </div>
                    <i class="fas fa-chart-line fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card" [ngClass]="getNetMovementClass()">
                <div class="card-body text-center text-white">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="mb-1">Net Movement</h6>
                      <h4 class="mb-0">{{ getNetMovement() | currency:'PKR':'symbol':'1.2-2' }}</h4>
                    </div>
                    <i class="fas fa-exchange-alt fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ledger Table -->
          <div class="table-responsive">
            <div *ngIf="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Loading account data...</p>
            </div>

            <div *ngIf="!loading && data.length === 0" class="text-center py-4">
              <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
              <p class="text-muted">No transactions found for the selected date range.</p>
            </div>

            <ft-dynamic-table
              *ngIf="!loading && data.length > 0"
              [Settings]="setting"
              [Data]="data"
              (ClickAction)="InvNoClicked($event)">
            </ft-dynamic-table>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./customer-ledger.component.scss']
})
export class CustomerLedgerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public data: any = [];
  public customer: any = null;
  public loading: boolean = false;
  public showAllLedger: boolean = false;
  public customersList: any[] = [];
  public selectedCustomerID: any = null;
  public loadingCustomers: boolean = false;

  public Filter = {
    FromDate: GetDateJSON(),
    ToDate: GetDateJSON(),
  };

  setting = {
    Columns: [
      {
        label: 'Type',
        fldName: 'TypeLabel',
        html: true,
        valueFormatter: (r: any) => {
          const t = (r.TypeLabel || '').toString();
          if (!t) return '';
          let cls = 'badge bg-secondary';
          if (t.toLowerCase() === 'purchase') cls = 'badge bg-danger';
          if (t.toLowerCase() === 'sale') cls = 'badge bg-success';
          if (t.toLowerCase() === 'received' || t.toLowerCase() === 'paid') cls = 'badge bg-warning text-dark';
          if (t.toLowerCase() === 'expense') cls = 'badge bg-danger';
          return '<span class="' + cls + '">' + t + '</span>';
        }
      },
      {
        label: 'Date',
        fldName: 'Date',
        type: 'date'
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
        label: 'Booking',
        fldName: 'Booking'
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
        type: 'currency',
        align: 'right'
      },
      {
        label: 'Credit',
        fldName: 'Credit',
        sum: true,
        type: 'currency',
        align: 'right'
      },
      {
        label: 'Balance',
        fldName: 'Balance',
        type: 'currency',
        align: 'right'
      },
    ],
    Actions: [],
    Data: [],
  };

  constructor(
    private http: HttpBase,
    private authService: CustomerAuthService
  ) {}

  ngOnInit() {
    // Set filter to current month by default
    this.Filter.FromDate.day = 1;

    // Load all customers for the dropdown
    this.loadCustomers();

    // Subscribe to authentication state changes
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        if (authState.isAuthenticated && authState.user) {
          this.customer = authState.user;
          this.selectedCustomerID = authState.user.CustomerID;
          // Show full ledger when a customer is selected
          this.FilterData(true);
        } else {
          this.customer = null;
          this.data = [];
        }
      });
  }

  loadCustomers() {
    this.loadingCustomers = true;
    this.http.getData('customers?orderby=CustomerName').then((r: any) => {
      this.customersList = r || [];
      this.loadingCustomers = false;
    }).catch(error => {
      console.error('Error loading customers:', error);
      this.loadingCustomers = false;
    });
  }

  onCustomerSelected(selectedCustomer: any) {
    if (selectedCustomer) {
      this.customer = {
        CustomerID: selectedCustomer.CustomerID,
        CustomerName: selectedCustomer.CustomerName,
        PhoneNo1: selectedCustomer.PhoneNo1,
        Address: selectedCustomer.Address,
        Email: selectedCustomer.Email,
        Balance: selectedCustomer.Balance,
      };
      this.FilterData(true);
    } else {
      this.customer = null;
      this.data = [];
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  FilterData(all: boolean = false) {
    this.showAllLedger = all;
    if (!all && (!this.customer || !this.customer.CustomerID)) {
      return;
    }

    this.loading = true;

    let filter = '';
    if (all) {
      // when `all` is true and a customer is selected, filter by that customer;
      // when `all` is true and no customer selected, leave filter empty to fetch all customers
      filter = (this.customer && this.customer.CustomerID) ? ('CustomerID=' + this.customer.CustomerID) : '';
    } else {
      filter = "Date between '" + JSON2Date(this.Filter.FromDate) + "' and '" + JSON2Date(this.Filter.ToDate) + "'";
      filter += ' and CustomerID=' + this.customer.CustomerID;
    }

    const url = filter ? ('qrycustomeraccts?filter=' + filter + '&orderby=DetailID') : 'qrycustomeraccts?orderby=DetailID';

    this.http.getData(url).then((r: any) => {
      this.data = (r || []).map((row: any) => {
        // normalize booking field to `Booking` so table can always show it
        row.Booking = row.Booking || row.BookingNo || row.BookingID || row.BookingRef || '';
        // determine human-friendly type label and row class (purchase/sale/received/expense)
        row.TypeLabel = this.determineTypeLabel(row);
        row.rowClass = this.determineRowClass(row);
        return row;
      });
      console.log('Customer ledger rows sample:', this.data && this.data.length ? this.data.slice(0,5) : this.data);

      if (this.data.length > 0) {
        // If we have a selected customer, calculate opening/closing balances and add opening row
        if (this.customer && this.customer.CustomerID) {
          this.customer.OpenBalance = (this.data[0].Balance - this.data[0].Debit) * 1 + this.data[0].Credit * 1;
          this.customer.CloseBalance = this.data[this.data.length - 1].Balance;

          // Add opening balance row
          this.data.unshift({
            Date: this.data[0].Date,
            Description: 'Opening Balance',
            RefID: '',
            Booking: '',
            Notes: '',
            Debit: 0,
            Credit: 0,
            Balance: this.customer.OpenBalance,
          });
          // Ensure booking column is present when booking fields exist in data
          this.ensureBookingColumn();
        }
      } else {
        // Handle case where no transactions in date range for a selected customer
        if (!all && this.customer && this.customer.CustomerID) {
          this.getOpeningBalance();
        }
      }

      this.loading = false;
    }).catch(error => {
      console.error('Error loading account data:', error);
      this.loading = false;
      // Show error message to user if needed
    });
  }

  private getOpeningBalance() {
    if (!this.customer || !this.customer.CustomerID) {
      return;
    }

    let pastFilter = " Date < '" + JSON2Date(this.Filter.FromDate) + "'";
    pastFilter += ' and CustomerID=' + this.customer.CustomerID;

    this.http.getData('qrycustomeraccts?filter=' + pastFilter + '&orderby=DetailID desc&limit=1').then((r: any) => {
      if (r && r.length > 0) {
        this.customer.OpenBalance = r[0].Balance;
        this.customer.CloseBalance = r[0].Balance;
      } else {
        this.customer.OpenBalance = 0;
        this.customer.CloseBalance = 0;
      }

      // Add opening balance row
      this.data.unshift({
        Date: JSON2Date(this.Filter.FromDate),
        Description: 'Opening Balance',
        RefID: '',
        Booking: '',
        Notes: '',
        Debit: 0,
        Credit: 0,
        Balance: this.customer.OpenBalance,
      });
      // Ensure booking column is present when booking fields exist in data
      this.ensureBookingColumn();
    }).catch(error => {
      console.error('Error loading opening balance:', error);
      this.customer.OpenBalance = 0;
      this.customer.CloseBalance = 0;
    });
  }

  private ensureBookingColumn() {
    if (!this.data || this.data.length === 0) return;
    const sample = this.data.find((d: any) => d && Object.keys(d).length > 0);
    if (!sample) return;
    const possibleKeys = ['BookingNo', 'BookingID', 'BookingRef', 'Booking'];
    for (const key of possibleKeys) {
      if (Object.prototype.hasOwnProperty.call(sample, key)) {
        const exists = this.setting.Columns.some((c: any) => c.fldName === key);
        if (!exists) {
          const idx = this.setting.Columns.findIndex((c: any) => c.fldName === 'RefID');
          const col = {
            label: 'Booking',
            fldName: key,
            html: true,
            valueFormatter: (r: any) => {
              const val = r[key] || '';
              if (!val) return '';
              return '<a href="/#/print/print-booking/' + val + '" target="_blank">' + val + '</a>';
            }
          };
          if (idx >= 0) this.setting.Columns.splice(idx + 1, 0, col);
          else this.setting.Columns.push(col);
        }
        break;
      }
    }
  }

  private determineTypeLabel(row: any): string {
    try {
      if (row.RefType === 1) return 'Sale';
      if (row.RefType === 2) return 'Purchase';
      // Received / payment
      if (row.Credit && Number(row.Credit) > 0) return 'Received';
      // Expense or charge without RefID
      if (row.Debit && Number(row.Debit) > 0 && (!row.RefID || Number(row.RefID) === 0)) return 'Expense';
      // fallback to Description keywords
      const desc = (row.Description || '').toString().toLowerCase();
      if (desc.includes('expense')) return 'Expense';
      if (desc.includes('paid') || desc.includes('received')) return 'Received';
      return '';
    } catch (e) {
      return '';
    }
  }

  private determineRowClass(row: any): string {
    const t = (row.TypeLabel || '').toString().toLowerCase();
    if (t === 'sale') return 'row-sale';
    if (t === 'purchase') return 'row-purchase';
    if (t === 'received' || t === 'paid') return 'row-received';
    if (t === 'expense') return 'row-expense';
    return '';
  }

  InvNoClicked(e: any) {
    if (e && e.data && e.data.RefID && e.data.RefType) {
      if (e.data.RefType == 1) {
        this.http.PrintSaleInvoice(e.data.RefID);
      } else if (e.data.RefType == 2) {
        this.http.PrintPurchaseInvoice(e.data.RefID);
      }
    }
  }

  getNetMovement(): number {
    if (!this.customer) return 0;
    return (this.customer.CloseBalance || 0) - (this.customer.OpenBalance || 0);
  }

  getNetMovementClass(): string {
    const movement = this.getNetMovement();
    if (movement > 0) return 'bg-success';
    if (movement < 0) return 'bg-danger';
    return 'bg-warning';
  }

  exportData() {
    if (this.data.length === 0) return;

    // Create CSV content from current column settings (keeps booking column if present)
    const headers = this.setting.Columns.map((c: any) => c.label || c.fldName);
    const csvRows = this.data.map((row: any) => this.setting.Columns.map((c: any) => {
      const val = row[c.fldName];
      if (c.type === 'date') return this.formatDate(val);
      if (typeof val === 'string') return val.replace(/,/g, ';');
      return (val === undefined || val === null) ? '' : val;
    }).join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = this.showAllLedger
      ? `ledger-${this.customer?.CustomerName || 'customer'}-all.csv`
      : `ledger-${this.customer?.CustomerName || 'customer'}-${JSON2Date(this.Filter.FromDate)}-to-${JSON2Date(this.Filter.ToDate)}.csv`;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private formatDate(d: any): string {
    return FormatDate(JSON2Date(d));
  }
}
