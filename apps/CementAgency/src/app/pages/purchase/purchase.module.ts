import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ComboBoxAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FutureTechLibModule } from '../../../../../../libs/future-tech-lib/src';
import { BookingInvoiceComponent } from './booking/booking-invoice.component';
import { OrdersReportComponent } from './orders-list/orders-report.component';
import { PurchaseInvoiceComponent } from './purchase-invoice/purchase-invoice.component';
import { PurchaseReturnComponent } from './purchase-return/purchase-return.component';
// import { FutureTechLibModule } from 'projects/future-tech-lib/src/public-api';

const routes: any = [
  { path: '', redirectTo: 'purchase', pathMatch: 'full' },
  { path: 'invoice', component: BookingInvoiceComponent, data: { breadcrumb: 'Purchase' } },
  { path: 'invoice/:EditID', component: BookingInvoiceComponent, data: { breadcrumb: 'Purchase Edit' } },
  { path: 'booking', component: BookingInvoiceComponent, data: { breadcrumb: 'Booking' } },
  { path: 'booking/:EditID', component: BookingInvoiceComponent, data: { breadcrumb: 'Booking Edit' } },
  { path: 'orders', component: OrdersReportComponent, data: { breadcrumb: 'Orders Report' } },
];

@NgModule({
  declarations: [
    PurchaseReturnComponent,
    PurchaseInvoiceComponent,
    BookingInvoiceComponent,
    OrdersReportComponent
  ],
  imports: [
    CommonModule,
    FutureTechLibModule,
    Ng2SmartTableModule,
    ComboBoxAllModule,
    NgbModule,
    ReactiveFormsModule,
    NgSelectModule ,
    FormsModule,
    ModalModule.forRoot(),
    RouterModule.forChild(routes),
  ],
})
export class PurchaseModule {}
