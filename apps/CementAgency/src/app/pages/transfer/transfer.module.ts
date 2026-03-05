import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {  NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {TransferItemComponent} from './transferitems/transferitems.component';
import {TransferlistComponent} from './transferlist/transferlist.component';
import { ComboBoxAllModule } from '@syncfusion/ej2-angular-dropdowns';

export const routes:any = [
  { path: '', redirectTo: 'transfer', pathMatch: 'full' },
  { path: 'transferitems', component: TransferItemComponent, data: { breadcrumb: 'Transfer' } },
  { path: 'transferitems/:EditID', component: TransferItemComponent, data: { breadcrumb: 'Transfer' } },
  { path: 'transferlist', component: TransferlistComponent, data: { breadcrumb: 'Transfer' } },
];

@NgModule({
  imports: [
    CommonModule,
    Ng2SmartTableModule,
    ComboBoxAllModule,
    FormsModule, ReactiveFormsModule,

    RouterModule.forChild(routes),
    NgbModule
  ],

  declarations: [TransferItemComponent,
    TransferlistComponent
  ]
})
export class TransferModule { }
