/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsFilterService, DEFAULT_ANALYTICS_FILTER } from 'app/services/analytics-filter.service';
import { Subject, takeUntil } from 'rxjs';
import { LogsCustomerService } from 'app/services/logs-customer.service';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';

@Component({
  selector: 'logs-customer-customer-activities',
  templateUrl: './customer-activities.component.html',
  styleUrls: ['./customer-activities.component.scss'],
})
export class LogsCustomerCustomerActivitiesComponent implements OnInit, OnDestroy {
  dataSource = [];
  displayedColumns = [
    {
      columName: 'id',
      columnLabel: 'STT',
      type: 'text',
      key: 'id',
    },
    {
      columName: 'image_in',
      columnLabel: 'Hình ảnh vào',
      type: 'image',
      key: 'image_in',
      action: 'play'
    },
    {
      columName: 'image_out',
      columnLabel: 'Hình ảnh ra',
      type: 'image',
      key: 'image_out',
      action:'play'
    },
    {
      columName: 'in_time',
      columnLabel: 'Thời gian vào',
      type: 'time',
      key: 'in_time',
    },
    {
      columName: 'out_time',
      columnLabel: 'Thời gian ra',
      type: 'time',
      key: 'out_time',
    },
    {
      columName: 'total_time',
      columnLabel: 'Tổng thời gian trong cửa hàng',
      type: 'text',
      key: 'total_time',
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
  filterMatching: 'all' | 'matching' = 'all';
  paging = {
    length: 0,
    pageSize: 10,
    pageIndex: 0
  };
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _dialog: MatDialog,
    private _analyticsFilter: AnalyticsFilterService,
    private _logsCustomerService: LogsCustomerService
  ) {

    this._analyticsFilter.customerFilter$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(value => {
        this.filterMatching=value
        this.getLogsData();
      })

    this._analyticsFilter.filterParams$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ isSearch, ..._filterParams }) => {
        if (isSearch) {
          this.filterParams = { ..._filterParams };
          this.paging = {
            ...this.paging,
            pageIndex: 0
          };
          this.getLogsData();
        }
      });
  }

  ngOnInit(): void {
    this.filterMatching = 'all';
    this._analyticsFilter.setFilterParam({
      ...DEFAULT_ANALYTICS_FILTER,
      showroomType: null,
      isSearch: true,
    });
    if (this._logsCustomerService.data){
      var object_filter = Object({
        byDate: 0,
        startDate: this._logsCustomerService.data,
        endDate: this._logsCustomerService.data,
        ageRange: null,
        gender: null,
      });
      this._analyticsFilter.setFilterParam({
        ...object_filter,
        showroomType: null,
        isSearch: true,
      });
      
      this.getLogsData()
    }
  }

  tableAction(event): void {
    if (event.action === 'play') {
      var data = [{image:event.element.image_show_in,thumbImage:event.element.image_show_in ,title: 'Anh vao'},
      {image:event.element.image_show_out,thumbImage:event.element.image_show_out,title: 'Anh ra'}] 
      console.log(data);
      
      this._dialog.open(ImageDialogComponent, {
        width: '65%',
        disableClose: false,
        panelClass: 'image-dialog',
        data: data
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
    this.getLogsData();
  }

  getLogsData(): any {
    this._logsCustomerService.search({
      ...this.filterParams,
      pageIndex: this.paging.pageIndex + 1,
      pageSize: this.paging.pageSize,
      filterCustomer: this.filterMatching
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
            icon: 'assets/images/icons/vision-view.svg',
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
    this._analyticsFilter.updateCustomerFilter('all')
    this._logsCustomerService.data = null;
  }
}
