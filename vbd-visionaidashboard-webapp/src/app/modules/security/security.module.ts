import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityRestrictedAreaComponent } from './restricted-area/restricted-area.component';
import { Route, RouterModule } from '@angular/router';
import { VaiComponentsModule } from 'app/modules/vai-components/vai-components.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FuseCardModule } from '@fuse/components/card';
import { VideoDialogComponent } from './video-dialog/video-dialog.component';

const routers: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'restricted-area',
  },
  {
    path: 'restricted-area',
    component: SecurityRestrictedAreaComponent,
    data: { breadcrumb: 'Khu vực hạn chế' }
  },
];

@NgModule({
  declarations: [
    SecurityRestrictedAreaComponent,
    VideoDialogComponent
  ],
  imports: [
    RouterModule.forChild(routers),
    CommonModule,
    MatDialogModule,
    MatIconModule,
    VaiComponentsModule,
    FuseCardModule
  ]
})
export class SecurityModule {
}
