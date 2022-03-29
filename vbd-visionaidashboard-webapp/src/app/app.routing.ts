import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { RoleGuard } from 'app/core/auth/guards/role.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

  // Redirect empty path to '/example'
  { path: '', pathMatch: 'full', redirectTo: 'analysis-customer/dashboard' },

  // Redirect signed in user to the '/example'
  //
  // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
  // path. Below is another redirection for that path to redirect the user to the desired
  // location. This is a small convenience to keep all main routes together here on this file.
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'analysis-customer/dashboard' },

  // Auth routes for guests
  {
    path: '',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
      schema: 'light',
    },
    children: [
      { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule) },
    ]
  },

  // Auth routes for authenticated users
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty'
    }
  },

  // Admin routes
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      {
        path: 'analysis-customer',
        data: { breadcrumb: 'Phân tích khách hàng' },
        loadChildren: () => import('app/modules/analysis-customer/analysis-customer.module').then(m => m.AnalysisCustomerModule)
      },
      {
        path: 'analysis-showroom',
        data: { breadcrumb: 'Phân tích showroom' },
        loadChildren: () => import('app/modules/analysis-showroom/analysis-showroom.module').then(m => m.AnalysisShowroomModule)
      },
      {
        path: 'security',
        data: { breadcrumb: 'Quản lý an ninh', isAdmin: false },
        canActivate: [RoleGuard],
        loadChildren: () => import('app/modules/security/security.module').then(m => m.SecurityModule)
      },
      {
        path: 'logs-customer',
        data: { breadcrumb: 'Logs khách hàng', isAdmin: false },
        canActivate: [RoleGuard],
        loadChildren: () => import('app/modules/logs-customer/logs-customer.module').then(m => m.LogsCustomerModule)
      },
    ]
  }
];
