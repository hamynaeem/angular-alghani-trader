import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ComboBoxAllModule, DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridAllModule } from '@syncfusion/ej2-angular-grids';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FutureTechLibModule } from '../../../../../../libs/future-tech-lib/src';
import { TransportExpenseComponent } from './transport-expense/transport-expense.component';
import { TransportIncomeComponent } from './transport-income/transport-income.component';
import { TransportReportComponent } from './transport-report/transport-report.component';
import { TransportsComponent } from './trasnport/transports.component';

const routes: any = [
  { path: '', redirectTo: 'invoice', pathMatch: 'full' },
  { path: 'transport', component: TransportsComponent },
  { path: 'income', component: TransportIncomeComponent },
  { path: 'expense', component: TransportExpenseComponent },
  { path: 'report', component: TransportReportComponent }
];

@NgModule({
  declarations: [
    TransportsComponent,
    TransportIncomeComponent,
    TransportExpenseComponent,
    TransportReportComponent
  ],
  imports: [
    CommonModule,
       ComboBoxAllModule,
       FutureTechLibModule,
       DropDownListAllModule,
       NgSelectModule,
       // ComponentsModule,
       NgbModule,
       GridAllModule ,
       TabsModule,
       ReactiveFormsModule,
       FormsModule,
       ModalModule.forRoot(),
       RouterModule.forChild(routes),
  ],
})
export class TransportModule {}
