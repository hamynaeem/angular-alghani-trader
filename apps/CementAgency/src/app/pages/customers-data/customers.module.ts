import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FutureTechLibModule } from "../../../../../../libs/future-tech-lib/src/lib/future-tech-lib.module";
import { AccountsModule } from "../accounts/acounts.module";

// Components
import { CustomerLoginComponent } from "./auth/customer-login/customer-login.component";
import { CustomerAccountsComponent } from "./customer-accounts/customer-accounts.component";
import { CustomerDashboardComponent } from "./customer-dashboard/customer-dashboard.component";
import { CustomerDetailsComponent } from "./customer-details/customer-details.component";
import { CustomerLayoutComponent } from "./customer-layout/customer-layout.component";
import { CustomerLedgerComponent } from "./customer-ledger/customer-ledger.component";
import { CustomerOrderFormComponent } from "./customer-order-form/customer-order-form.component";
import { CustomerOrderHistoryComponent } from "./customer-order-history/customer-order-history.component";

// Services & Guards
import { NgSelectModule } from "@ng-select/ng-select";
import { CustomerAuthGuard, CustomerGuestGuard } from "./guards/customer-auth.guard";
import { CustomerAuthService } from "./services/customer-auth.service";

const routes: any = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // Authentication routes (no layout)
  {
    path: 'auth/login',
    component: CustomerLoginComponent,
    canActivate: [CustomerGuestGuard],
    data: { breadcrumb: 'Login' }
  },

  // Protected routes with layout
  {
    path: '',
    component: CustomerLayoutComponent,
    canActivate: [CustomerAuthGuard],
    children: [
      {
        path: 'dashboard',
        component: CustomerDashboardComponent,
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'accounts',
        component: CustomerDetailsComponent, // Reuse existing component in accounts tab
        data: { breadcrumb: 'Account Statement', activeTab: 'accounts' }
      },
      {
        path: 'ledger',
        component: CustomerLedgerComponent, // New dedicated ledger component
        data: { breadcrumb: 'Account Ledger' }
      },
      {
        path: 'orders',
        component: CustomerDetailsComponent, // Reuse existing component in orders tab
        data: { breadcrumb: 'Place Order', activeTab: 'orders' }
      },
      {
        path: 'history',
        component: CustomerDetailsComponent, // Reuse existing component in history tab
        data: { breadcrumb: 'Order History', activeTab: 'history' }
      },
      {
        path: 'profile',
        component: CustomerDashboardComponent, // Placeholder for profile
        data: { breadcrumb: 'Profile' }
      }
    ]
  },

  // Legacy route - redirect to new structure
  {
    path: "customers",
    redirectTo: '/customers/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    FutureTechLibModule,
    AccountsModule,
    RouterModule.forChild(routes),
  ],
  exports: [],
  declarations: [
    CustomerDetailsComponent,
    CustomerAccountsComponent,
    CustomerOrderFormComponent,
    CustomerOrderHistoryComponent,
    CustomerLayoutComponent,
    CustomerLoginComponent,
    CustomerDashboardComponent,
    CustomerLedgerComponent
  ],
  providers: [
    CustomerAuthService,
    CustomerAuthGuard,
    CustomerGuestGuard
  ],
})
export class CustomersModule { }
