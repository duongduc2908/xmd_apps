import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsCustomerCustomerActivitiesComponent } from './customer-activities/customer-activities.component';
import { Route, RouterModule } from '@angular/router';
import { VaiComponentsModule } from 'app/modules/vai-components/vai-components.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FuseCardModule } from '@fuse/components/card';
import { ImageDialogComponent } from './image-dialog/image-dialog.component';
import { NgImageSliderModule } from 'ng-image-slider';

const routers: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'customer-activities',
    component: LogsCustomerCustomerActivitiesComponent,
  },
  {
    path: 'customer-activities',
    component: LogsCustomerCustomerActivitiesComponent,
    data: { breadcrumb: 'Hoạt dộng khách hàng' }
  },
];

@NgModule({
  declarations: [
    LogsCustomerCustomerActivitiesComponent,
    ImageDialogComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    CommonModule,
    MatDialogModule,
    MatIconModule,
    VaiComponentsModule,
    FuseCardModule,
    NgImageSliderModule
  ]
})
export class LogsCustomerModule {
}
