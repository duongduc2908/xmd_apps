import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisCustomerDashboardComponent } from './dashboard/dashboard.component';
import { Route, RouterModule } from '@angular/router';
import { AnalysisCustomerVin1sComponent } from './vin1s/vin1s.component';
import { ChartsModule } from '../charts/charts.module';
import { MatButtonModule } from '@angular/material/button';
import { VaiComponentsModule } from '../vai-components/vai-components.module';
import { RoleGuard } from 'app/core/auth/guards/role.guard';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from '../../shared/shared.module';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';
import { FuseCardModule } from '@fuse/components/card';
import { ListMarketingReportComponent } from './marketing-report/list-marketing-report/list-marketing-report.component';
import { FormMarketingReportComponent } from './marketing-report/form-marketing-report/form-marketing-report.component';
import { DialogConfirmRemoveComponent } from './marketing-report/dialog-confirm-remove/dialog-confirm-remove.component';
import { TextMaskModule } from 'angular2-text-mask';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CONST } from '../../app.constants';


const routers: Route[] = [
  {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
  {
    path: 'dashboard',
    component: AnalysisCustomerDashboardComponent,
    data: {breadcrumb: 'Tổng quan'}
  },
  {
    path: 'store-model/vin1s',
    component: AnalysisCustomerVin1sComponent,
    data: {
      showroomType: 'vin1s',
      breadcrumb: 'Vin1s',
      isAdmin: true,
    },
    canActivate: [RoleGuard]
  },
  {
    path: 'store-model/vin3s',
    component: AnalysisCustomerVin1sComponent,
    data: {
      showroomType: 'vin3s',
      breadcrumb: 'Vin3s',
      isAdmin: true,
    },
    canActivate: [RoleGuard]
  },
  {
    path: 'marketing-report',
    pathMatch: 'prefix',
    data: {breadcrumb: 'Báo cáo chiến dịch Marketing'},
    children: [{
      path: '',
      component: ListMarketingReportComponent,
    }, {
      path: 'create',
      data: {breadcrumb: 'Tạo báo cáo'},
      component: FormMarketingReportComponent,
    }]
  },
];

@NgModule({
  declarations: [
    AnalysisCustomerDashboardComponent,
    AnalysisCustomerVin1sComponent,
    ListMarketingReportComponent,
    DialogConfirmRemoveComponent,
    FormMarketingReportComponent,
  ],
  imports: [
    RouterModule.forChild(routers),
    CommonModule,
    ChartsModule,
    VaiComponentsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FuseCardModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    SharedModule,
    MatMomentDateModule,
    TextMaskModule
    
  ],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: CONST.MAT_DATE_FORMATS},
  ]
})
export class AnalysisCustomerModule {
}
