import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisShowroomStaffQualityComponent } from './staff-quality/staff-quality.component';
import { AnalysisShowroomStaffQualityVin1sComponent } from './staff-quality-vin1s/staff-quality-vin1s.component';
import { VaiComponentsModule } from 'app/modules/vai-components/vai-components.module';
import { ChartsModule } from 'app/modules/charts/charts.module';
import { Route, RouterModule } from '@angular/router';
import { RoleGuard } from 'app/core/auth/guards/role.guard';

const routers: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'staff-quality',
  },
  {
    path: 'staff-quality',
    component: AnalysisShowroomStaffQualityComponent,
    data: {
      breadcrumb: 'Chất lượng nhân viên',
      searchType: 'store'
    },
  },
  {
    path: 'staff-quality-vin1s',
    component: AnalysisShowroomStaffQualityVin1sComponent,
    data: {
      breadcrumb: 'Chất lượng nhân viên Vin1s',
      showroomType: 'vin1s',
      searchType: 'showroom_type',
      isAdmin: true,
    },
    canActivate: [RoleGuard]
  },
  {
    path: 'staff-quality-vin3s',
    component: AnalysisShowroomStaffQualityVin1sComponent,
    data: {
      breadcrumb: 'Chất lượng nhân viên Vin3s',
      showroomType: 'vin3s',
      searchType: 'showroom_type',
      isAdmin: true,
    },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  declarations: [
    AnalysisShowroomStaffQualityComponent,
    AnalysisShowroomStaffQualityVin1sComponent,
  ],
  imports: [
    RouterModule.forChild(routers),
    CommonModule,
    VaiComponentsModule,
    ChartsModule,
  ],
})
export class AnalysisShowroomModule {}
