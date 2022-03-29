import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseDrawerModule } from '@fuse/components/drawer';
import { FuseCardModule } from '@fuse/components/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ChartsModule } from '../charts/charts.module';
import { MatTableModule } from '@angular/material/table';
import { AnalyticsQuickFilterComponent } from './analytics-quick-filter/analytics-quick-filter.component';
import { AnalyticsWrapperComponent } from './analytics-wrapper/analytics-wrapper.component';
import { AnalyticsFilterComponent } from './analytics-filter/analytics-filter.component';
import { VisionTableComponent } from './vision-table/vision-table.component';
import { MarketingReportExportPdfComponent } from './marketing-report-export-pdf/marketing-report-export-pdf.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReportViewerHelperComponent } from './report-viewer-helper/report-viewer-helper.component';
import { VisionPagingComponent } from './vision-paging/vision-paging.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { VisionDatepickerComponent } from './vision-datepicker/vision-datepicker.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CONST } from '../../app.constants';


@NgModule({
  declarations: [
    AnalyticsQuickFilterComponent,
    AnalyticsWrapperComponent,
    AnalyticsFilterComponent,
    VisionTableComponent,
    MarketingReportExportPdfComponent,
    ReportViewerHelperComponent,
    VisionPagingComponent,
    VisionDatepickerComponent,
  ],
  exports: [AnalyticsQuickFilterComponent, AnalyticsWrapperComponent, VisionTableComponent, MarketingReportExportPdfComponent, ReportViewerHelperComponent, VisionPagingComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    ChartsModule,
    FuseDrawerModule,
    FuseCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatButtonToggleModule,
    MatSidenavModule,
    MatTableModule,
    MatDialogModule,
    MatPaginatorModule,
    SharedModule
  ],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: CONST.MAT_DATE_FORMATS},
  ]
})
export class VaiComponentsModule { }
