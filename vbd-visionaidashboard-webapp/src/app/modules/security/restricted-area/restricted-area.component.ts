/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsFilterService, DEFAULT_ANALYTICS_FILTER } from 'app/services/analytics-filter.service';
import { Subject, takeUntil } from 'rxjs';
import { VideoDialogComponent } from '../video-dialog/video-dialog.component';
import { SecurityService } from 'app/services/security.service';

@Component({
  selector: 'security-restricted-area',
  templateUrl: './restricted-area.component.html',
  styleUrls: ['./restricted-area.component.scss'],
})
export class SecurityRestrictedAreaComponent implements OnInit, OnDestroy {
  dataSource = [];
  displayedColumns = [
    {
      columName: 'id',
      columnLabel: 'STT',
      type: 'text',
      key: 'id',
    },
    {
      columName: 'image',
      columnLabel: 'Hình ảnh',
      type: 'image',
      key: 'image',
    },
    {
      columName: 'time',
      columnLabel: 'Thời gian',
      type: 'time',
      key: 'time',
    },
    {
      columName: 'location',
      columnLabel: 'Vị trí',
      type: 'text',
      key: 'location',
    },
    {
      columName: 'gender',
      columnLabel: 'Giới tính',
      type: 'text',
      key: 'gender',
    },
    {
      columName: 'age',
      columnLabel: 'Tuổi',
      type: 'text',
      key: 'age',
    },
    {
      columName: 'action',
      columnLabel: 'Hành động',
      type: 'action',
      key: 'action',
    },
  ];
  filterParams;
  paging = {
    length: 0,
    pageSize: 10,
    pageIndex: 0
  };
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _dialog: MatDialog,
    private _analyticsFilter: AnalyticsFilterService,
    private _securityService: SecurityService
  ) {

    this._analyticsFilter.filterParams$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ isSearch, ..._filterParams }) => {
        if (isSearch) {
          this.filterParams = { ..._filterParams };
          this.paging = {
            ...this.paging,
            pageIndex: 0
          };
          this.getSecurityData();
        }
      });
  }

  ngOnInit(): void {
    this._analyticsFilter.setFilterParam({
      ...DEFAULT_ANALYTICS_FILTER,
      showroomType: null,
      isSearch: true,
    });
  }

  tableAction(event): void {
    if (event.action === 'play') {
      this._dialog.open(VideoDialogComponent, {
        width: '720px',
        disableClose: true,
        panelClass: 'video-dialog',
        data: event.element.link
      });
    }
  }

  onPageChange(e): void {
    const {pageSize, pageIndex} = e;
    this.paging = {
      ...this.paging,
      pageSize,
      pageIndex: pageSize !== this.paging.pageSize ? 0 : pageIndex,
    };
    this.getSecurityData();
  }

  getSecurityData(): any {
    this._securityService.search({
      ...this.filterParams,
      pageIndex: this.paging.pageIndex + 1,
      pageSize: this.paging.pageSize,
    }).subscribe((_securityData) => {
      if (_securityData.status === 'SUCCESS') {
        const {data: {result, ...paging}} = _securityData;
        this.paging = {
          ...this.paging,
          length: paging.count
        };
        this.dataSource = result.map(item => ({
          ...item,
          action: [{
            icon: 'assets/images/icons/vision-play.svg',
            action: 'play'
          }]
        }));
        return;
      }
      this.paging.length = 0;
      this.dataSource = [];
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
