/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MarketingService } from 'app/services/marketing.service';
import { DialogConfirmRemoveComponent } from '../dialog-confirm-remove/dialog-confirm-remove.component';
import { AnalyticsFilterService } from 'app/services/analytics-filter.service';
import { Subject, takeUntil } from 'rxjs';
import { ReportViewerHelperComponent } from '../../../vai-components/report-viewer-helper/report-viewer-helper.component';

@Component({
  selector: 'vai-list-marketing-report',
  templateUrl: './list-marketing-report.component.html',
  styleUrls: ['./list-marketing-report.component.scss']
})
export class ListMarketingReportComponent implements OnInit, OnDestroy {
  @ViewChild('reportViewerHelper', { static: true })
  reportViewerHelper: ReportViewerHelperComponent;

  dataSource = [];
  displayedColumns = [
    {
      columName: 'index',
      class: 'text-center',
      columnLabel: 'STT',
      type: 'text',
      key: 'index',
    },
    {
      columName: 'name',
      columnLabel: 'Tên báo cáo',
      class: 'row-fixed-width',
      type: 'link',
      action: 'view',
      key: 'name',
    },
    {
      columName: 'showroom',
      class: 'row-fixed-width',
      columnLabel: 'Showroom áp dụng',
      type: 'text',
      key: 'showroom',
    },
    {
      columName: 'time_range',
      columnLabel: 'Thời gian chạy chiến dịch',
      type: 'time',
      key: 'time_range',
    },
    {
      columName: 'time',
      columnLabel: 'Thời gian tạo',
      type: 'time',
      key: 'time',
    },
    {
      columName: 'action',
      columnLabel: 'Hành động',
      type: 'action',
      key: 'action',
    },
  ];
  paging = {
    length: 0,
    pageSize: 10,
    pageIndex: 0
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private _dialog: MatDialog,
    private _analyticsFilter: AnalyticsFilterService,
    private _marketingService: MarketingService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this._analyticsFilter.setFilterParam({
      showroomType: 'all',
    });
    this.getMarketingReportData();
  }


  tableAction(event): any {
    if (event.action === 'remove') {
      const dialogRef = this._dialog.open(DialogConfirmRemoveComponent, {
        panelClass: 'keep-light',
        autoFocus: false,
        data: { id: event.element.id, name: event.element.name }
      });
      dialogRef.afterClosed().subscribe((_result) => {
        if (_result.event === 'delete' && _result.status === 'SUCCESS') {
          this.getMarketingReportData();
        }
      });
    } else if (event.action === 'view') {
      this.openReportViewer(event.element.id, false);
    } else if (event.action === 'download') {
      this.openReportViewer(event.element.id, true);
    }
  }

  getMarketingReportData(): any {
    this._marketingService.search({
      page: this.paging.pageIndex + 1,
      per_page: this.paging.pageSize,
    })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_marketingReportData) => {
        const {data: {result, ...paging}} = _marketingReportData;
        this.paging = {
          ...this.paging,
          length: paging.count
        };
        this.dataSource = result.map(item => ({
          ...item,
          action: [
            {
              icon: 'assets/images/icons/vision-view.svg',
              action: 'view'
            },
            {
              icon: 'assets/images/icons/vision-download.svg',
              action: 'download'
            },
            {
              icon: 'assets/images/icons/vision-remove.svg',
              action: 'remove'
            }
          ]
        }));
      });
  }

  onPageChange(e): void {
    const {pageSize, pageIndex} = e;
    this.paging = {
      ...this.paging,
      pageSize,
      pageIndex: pageSize !== this.paging.pageSize ? 0 : pageIndex,
    };
    this.getMarketingReportData();
  }

  onCreateReport(): void {
    this._router.navigate(['create'], { relativeTo: this._activatedRoute });
  }

  openReportViewer(id, isDownload): void {
    this._marketingService.get(id)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_detail) => {
        const reportData = _detail.data[0];
        if (isDownload) {
          this.reportViewerHelper.exportPDF(reportData).subscribe();
        } else {
          const reportViewer = this.reportViewerHelper.openReportViewer(reportData, false);
          reportViewer.saveClick
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
              this.reportViewerHelper.exportPDF(reportData).subscribe();
              this.reportViewerHelper.dialogRef.close();
          });
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
