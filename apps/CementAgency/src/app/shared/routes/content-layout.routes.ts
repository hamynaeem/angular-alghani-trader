import { Routes } from '@angular/router';

//Route for content layout without sidebar, navbar and footer for pages like Login, Registration etc...

export const CONTENT_ROUTES: Routes = [
     { path: 'auth', loadChildren: () => import('../../pages/content-pages/content-pages.module').then(m => m.ContentPagesModule) },
     { path: 'print', loadChildren: () => import('../../pages/print/print-module').then(m => m.PrintModule) },
    { path: 'customers', loadChildren: () => import('../../pages/customers-data/customers.module').then(m => m.CustomersModule) },

];
