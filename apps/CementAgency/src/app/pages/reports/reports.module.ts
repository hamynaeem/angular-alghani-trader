import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComboBoxAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { DataTablesModule } from 'angular-datatables';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxPrintModule } from 'ngx-print';
import { FilterProductPipe } from '../../pipes/filter-product.pipe';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { BillSummaryComponent } from './bill-summary/bill-summary.component';
import { CashBookComponent } from './cash-book/cash-book.component';
import { CloseAccountComponent } from './close-account/close-account.component';
import { DayBookComponent } from './day-book/day-book.component';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { ExpReportComponent } from './expreport/expreport.component';
import { ProfitReportComponent } from "./profit-report/profit-report.component";
import { PurchaseReportComponent } from './purchase-report/purchase-report.component';
import { RecoveryReportComponent } from './recovery-report/recovery-report.component';
import { StockAcctsComponent } from './stock-accts/stock-accts.component';
import { StockReportComponent } from './stock-report/stock-report.component';
//import { ComponentsModule } from '../components/components.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FutureTechLibModule } from '../../../../../../libs/future-tech-lib/src';
import { BookingReportComponent } from './booking-report/booking-report.component';
import { CreditlistComponent } from './credit-list/credit-list.component';
import { GatepasPendingComponent } from './gatepass-pending/gatepass-pending.component';
import { GatepassDeliveryComponent } from './gatepass-report/gatepass-delivery/gatepass-delivery.component';
import { GatepassReportComponent } from './gatepass-report/gatepass-report.component';
import { LabourReportComponent } from './labour-report/labour-report.component';
import { PackingReportComponent } from './packing-report/packing-report.component';
import { PendingReportComponent } from './pending-report/pending-report.component';
import { ProfitByBillComponent } from './profit-bybill/profit-bybill.component';
import { PurchaseBystoreComponent } from './purchase-bystore/purchase-bystore.component';
import { PurchaseLedgerComponent } from './purchase-ledger/purchase-ledger.component';
import { PurchasesummaryComponent } from './purchse-summary/purchase-summary.component';
import { SaleLedgerComponent } from './sale-ledger/sale-ledger.component';
import { SalesummaryComponent } from './sale-summary/sale-summary.component';
import { ShortStockComponent } from './short-stock/short-stock.component';
import { StockByDateComponent } from './stock-bydate/stock-bydate.component';
import { StockReportCurrentComponent } from './stock-report-current/stock-report-current.component';
import { TransferReportComponent } from './transfer-report/transfer-report.component';


const routes:any= [
  { path: '', redirectTo: 'daybook', pathMatch: 'full' },
  { path: 'daybook', component: DayBookComponent, data: { breadcrumb: 'Day Book' } },
  { path: 'salesummary', component: SalesummaryComponent, data: { breadcrumb: 'Sale Summary' } },
  { path: 'purchasesummary', component: PurchasesummaryComponent, data: { breadcrumb: 'Purchase Summary' } },
  { path: 'gatepass', component: GatepassReportComponent, data: { breadcrumb: 'Gatepass Report' } },
  { path: 'pendingstock', component: PendingReportComponent, data: { breadcrumb: 'Pending Report' } },
  { path: 'labourreport', component: LabourReportComponent, data: { breadcrumb: 'Labour Report' } },
  { path: 'packingreport', component: PackingReportComponent, data: { breadcrumb: 'Packing Report' } },
  { path: 'purchasereport', component: PurchaseReportComponent, data: { breadcrumb: 'Purchase Report' } },
  { path: 'stockreport', component: StockReportComponent, data: { breadcrumb: 'Stock Report' } },
  { path: 'stockreport2', component: StockReportCurrentComponent, data: { breadcrumb: 'Stock Report' } },
  { path: 'stock-transfer', component: TransferReportComponent, data: { breadcrumb: ' Transfer Report' } },
  { path: 'creditlist', component: CreditlistComponent, data: { breadcrumb: 'Credit Report' } },
  { path: 'expensereport', component: ExpenseReportComponent, data: { breadcrumb: 'Expense Report' } },
  { path: 'closeaccount', component: CloseAccountComponent, data: { breadcrumb: 'Close Account' } },
  { path: 'recoverysheet', component: BillSummaryComponent, data: { breadcrumb: 'Recovery Sheet' } },
  { path: 'cashbook', component: CashBookComponent, data: { breadcrumb: 'Cash Book' } },
  { path: 'balancesheet', component: BalanceSheetComponent, data: { breadcrumb: 'Balance Sheet' } },
  { path: 'stockaccts', component: StockAcctsComponent, data: { breadcrumb: 'Stock Accts' } },
  { path: 'profit', component: ProfitReportComponent, data: { breadcrumb: 'Profit Report' } },
  { path: 'profitbybill', component: ProfitByBillComponent, data: { breadcrumb: 'Profit By Bill' } },
  { path: 'expreport', component: ExpReportComponent, data: { breadcrumb: 'Frenchiser Report' } },
  { path: 'sale-ledger', component: SaleLedgerComponent, data: { breadcrumb: 'Sale Ledger' } },
  { path: 'purchase-ledger', component: PurchaseLedgerComponent, data: { breadcrumb: 'Purchase Ledger' } },
  { path: 'purchase-bystore', component: PurchaseBystoreComponent, data: { breadcrumb: 'Purchase Ledger' } },
  { path: 'stock-bydate', component: StockByDateComponent, data: { breadcrumb: 'Purchase Ledger' } },
  { path: 'gatepass-pending', component: GatepasPendingComponent, data: { breadcrumb: 'Purchase Ledger' } },
  { path: 'short-stock', component: ShortStockComponent, data: { breadcrumb: 'Purchase Ledger' } },
  { path: 'booking', component: BookingReportComponent, data: { breadcrumb: 'Booking Report' } },


];
@NgModule({
  declarations: [
    BookingReportComponent,
    GatepassReportComponent,
    SalesummaryComponent,
    PurchaseReportComponent,
    StockReportComponent,
    RecoveryReportComponent,
    ExpenseReportComponent,
    CloseAccountComponent,
    BillSummaryComponent,
    DayBookComponent,
    ExpReportComponent,
    CashBookComponent,
    BalanceSheetComponent,
    StockAcctsComponent,
    FilterProductPipe,
    ProfitReportComponent,
    CreditlistComponent,
    SaleLedgerComponent,
    ProfitByBillComponent,
    TransferReportComponent,
    GatepassDeliveryComponent,
    PendingReportComponent,
    LabourReportComponent,
    PackingReportComponent,
    PurchaseLedgerComponent,
    PurchasesummaryComponent,
    PurchaseBystoreComponent,
    StockReportCurrentComponent,
    StockByDateComponent,
    GatepasPendingComponent,
    ShortStockComponent
  ],

  imports: [
    CommonModule,
    FutureTechLibModule,
    Ng2SmartTableModule,
    ComboBoxAllModule,
    DataTablesModule,
    NgxPrintModule,
    NgSelectModule,
    NgbModule,
    FormsModule,
    ModalModule.forRoot(),
    RouterModule.forChild(routes)
  ], providers: []
})
export class ReportsModule { }
