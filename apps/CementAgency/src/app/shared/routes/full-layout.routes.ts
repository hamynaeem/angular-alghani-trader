import { Routes } from '@angular/router';
import { AuthGuard } from '../../gaurds/auth.gaurd';

//Route for content layout with sidebar, navbar and footer.

export const Full_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../../pages/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../../pages/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },

  {  canActivateChild: [AuthGuard],
    path: 'transport',
    loadChildren: () =>
      import('../../pages/transport/transport.module').then(
        (m) => m.TransportModule
      ),
  },
  {
    canActivateChild: [AuthGuard],
    path: 'purchase',
    loadChildren: () =>
      import('../../pages/purchase/purchase.module').then(
        (m) => m.PurchaseModule
      ),
  },
  {
    canActivateChild: [AuthGuard],
    path: 'transfer',
    loadChildren: () =>
      import('../../pages/transfer/transfer.module').then(
        (m) => m.TransferModule
      ),
  },
  {
    canActivateChild: [AuthGuard],
    path: 'cash',
    loadChildren: () =>
      import('../../pages/cash/cash.module').then(
        (m) => m.CashModule
      ),
  },
  {
    canActivateChild: [AuthGuard],
    path: 'reports',
    loadChildren: () =>
      import('../../pages/reports/reports.module').then(
        (m) => m.ReportsModule
      ),
  },
  {
    canActivateChild: [AuthGuard],
    path: 'settings',
    loadChildren: () =>
      import('../../pages/settings/settings.module').then(
        (m) => m.SettingsModule
      ),
  },
  {
    canActivateChild: [AuthGuard],
    path: 'products',
    loadChildren: () =>
      import('../../pages/products/products.module').then(
        (m) => m.ProductsModule
      ),
  },
  {

    path: 'not-allowed',
    loadChildren: () =>
      import('../../pages/not-allowed/not-allowed.module').then(
        (m) => m.NotAllowedModule
      ),
  },
  {
    canActivateChild: [AuthGuard],
    path: 'accounts',
    loadChildren: () =>
      import('../../pages/accounts/acounts.module').then(
        (m) => m.AccountsModule
      ),
  },

];
