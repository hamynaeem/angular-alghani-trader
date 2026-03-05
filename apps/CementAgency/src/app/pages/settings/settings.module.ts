import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  ComboBoxAllModule,
  DropDownListAllModule,
} from '@syncfusion/ej2-angular-dropdowns';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { UsersListComponent } from './users-list/users-list.component';

import { GridAllModule } from '@syncfusion/ej2-angular-grids';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { QuillModule } from 'ngx-quill';
import { FutureTechLibModule } from '../../../../../../libs/future-tech-lib/src';
import { CompaniesBySalesman } from '../products/companiesbysm/companiesbysm.component';
import { DeptsComponent } from './depts/depts.component';
import { ExpenseheadComponent } from './expensehead/expensehead.component';
import { LabourheadsComponent } from './labourheads/labourheads.component';
import { RoutesComponent } from './routes/routes.component';
import { SalesmanComponent } from './salesman/salesman.component';
import { SetupsComponent } from './setups/setups.component';
import { StoresComponent } from './stores/stores.component';
import { GroupsComponent } from './usergroups/groups.component';
import { WarrantiesComponent } from './warranties/warranties.component';

const routes: any = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'routes',
    component: RoutesComponent,
    data: { breadcrumb: 'Route List' },
  },
  {
    path: 'salesman',
    component: SalesmanComponent,
    data: { breadcrumb: 'Salesman List' },
  },
  {
    path: 'business',
    component: SetupsComponent,
    data: { breadcrumb: 'Bisiness Details' },
  },
  {
    path: 'grouprights',
    component: GroupsComponent,
    data: { breadcrumb: 'Bisiness Details' },
  },
  {
    path: 'expheads',
    component: ExpenseheadComponent,
    data: { breadcrumb: 'Expense Heads' },
  },
  {
    path: 'users',
    component: UsersListComponent,
    data: { breadcrumb: 'Users List' },
  },
  {
    path: 'labourheads',
    component: LabourheadsComponent,
    data: { breadcrumb: 'Labourheads List' },
  },

];

@NgModule({
  declarations: [
    DeptsComponent,
    GroupsComponent,
    UsersListComponent,
    CompaniesBySalesman,
    LabourheadsComponent,
    // DataentryComponent,
    StoresComponent,
    WarrantiesComponent,
    SetupsComponent,
    RoutesComponent,
    SalesmanComponent,
    ExpenseheadComponent,
  ],
  imports: [
    CommonModule,
    ComboBoxAllModule,
    FutureTechLibModule,
    DropDownListAllModule,
    // ComponentsModule,
    NgbModule,
    GridAllModule ,
    TabsModule,
    ReactiveFormsModule,
    TreeViewModule,
    FormsModule,
    ModalModule.forRoot(),
    RouterModule.forChild(routes),
    QuillModule.forRoot(),
  ],
})
export class SettingsModule {}
