import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreditInvoiceComponent } from './credit-invoice/credit-invoice.component';
import { PrintGatepassComponent } from "./print-gate-pass/print-gatepass.component";
import { PrintHtmlComponent } from './print-html/print-html.component';
import { PrintPurchaseComponent } from "./print-purchase/print-purchase.component";
import { PrintStockTransferComponent } from "./print-stock-transfer/print-stocktransfer.component";
import { ThermalInvoiceComponent } from "./print-thermal/thermal-invoice.component";
import { PrintTitleComponent } from './print-title/print-title.component';
import { PrintBookingComponent } from "./print-booking/print-booking.component";

const routes:any = [
  { path: '', redirectTo: 'saleorder', pathMatch: 'full' },
  { path: 'print-gatepass/:invoiceID/:storeID', component: PrintGatepassComponent, data: { breadcrumb: 'Print' }, },
  { path: "printinvoice/:id", component: CreditInvoiceComponent ,data: { breadcrumb: 'Print' }},
  { path: "thermalinvoice/:id", component: ThermalInvoiceComponent ,data: { breadcrumb: 'Print' }},
  { path: "gatepass/:id/:storeID", component: PrintGatepassComponent ,data: { breadcrumb: 'Print' }},
  { path: "printpurchase/:id", component: PrintPurchaseComponent, data: { breadcrumb: 'Print' } },
  { path: "stocktransfer/:id", component: PrintStockTransferComponent, data: { breadcrumb: 'Print' } },
  { path: "print-html", component: PrintHtmlComponent, data: { breadcrumb: 'Print' } },
  { path: "print-booking/:id", component: PrintBookingComponent, data: { breadcrumb: 'Booking Print' } },
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [],
  declarations: [
    PrintGatepassComponent,
    PrintTitleComponent,
    PrintPurchaseComponent,
    CreditInvoiceComponent,
    PrintStockTransferComponent,
    PrintHtmlComponent,
    ThermalInvoiceComponent,
    PrintBookingComponent
  ],
  providers: [],
})
export class PrintModule { }
