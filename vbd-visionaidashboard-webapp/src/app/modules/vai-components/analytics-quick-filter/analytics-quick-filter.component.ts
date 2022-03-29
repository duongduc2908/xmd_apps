import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import * as textMask from 'vanilla-text-mask/dist/vanillaTextMask.js';
import { AnalyticsFilterService } from '../../../services/analytics-filter.service';
import { ConfigService } from '../../../services/config.service';
import { CONST } from '../../../app.constants';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'vai-analytics-quick-filter',
  templateUrl: './analytics-quick-filter.component.html',
  styleUrls: ['./analytics-quick-filter.component.scss'],
})
export class AnalyticsQuickFilterComponent implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  @ViewChild('inputFromDate', { read: ViewContainerRef, static: true }) public inputFromDate;
  @ViewChild('inputToDate', { read: ViewContainerRef, static: true }) public inputToDate;
  @Input() isFilterLayout = true;
  @Input() isFilterDate = false;
  @Input() isFilterCustomer = false;
  times = [];
  currentTime = null;
  filterParams = {
    byDate: null,
    startDate: null,
    endDate: null,
  };
  maskedInputFromController;
  maskedInputToController;
  dateForm: FormGroup;
  manualTimeRangeID;

  filterCustomerDefine = [
    {
      label: 'Tất cả',
      value: 'all'
    },
    {
      label: 'Đã match',
      value: 'matching'
    }
  ]
  filterCustomerValue: 'all' | 'matching';

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _analyticsFilterService: AnalyticsFilterService,
    private _configService: ConfigService,
    private _formBuilder: FormBuilder,
    private changeDetector: ChangeDetectorRef,
  ) {
    this._analyticsFilterService.customerFilter$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(value => {
        this.filterCustomerValue = value;
      })

    this._configService.timeRanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_timeRanges) => {
        this.times = _timeRanges;
      });

    this._analyticsFilterService.filterParams$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ isSearch, ..._filterParams }) => {
        if (isSearch) {
          this.currentTime = moment().format('HH:mm - DD/MM/YYYY');
        }
        this.filterParams.byDate = _filterParams.byDate || null;
        this.filterParams.startDate = _filterParams.startDate || null;
        this.filterParams.endDate = _filterParams.endDate || null;
      });
      
    this.dateForm = this._formBuilder.group({
      startDate: [],
      endDate: [],
    });
    this.manualTimeRangeID = CONST.TIME_RANGE_MANUAL_ID;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.maskedInputFromController = textMask.maskInput({
        inputElement: this.inputFromDate.element.nativeElement,
        mask: CONST.DATE_INPUT_FORMAT,
        guide: false,
      });
      this.maskedInputToController = textMask.maskInput({
        inputElement: this.inputToDate.element.nativeElement,
        mask: CONST.DATE_INPUT_FORMAT,
        guide: false,
      });
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }


  onFilterChange({ value }): void {
    this._analyticsFilterService.setFilterParam({
      byDate: value,
      endDate: null,
      startDate: null,
      gender: null,
      ageRange: null,
      isSearch: true,
    });
  }

  maxStartDate(): any {
    if (this.filterParams.endDate) {
      return this.filterParams.endDate;
    }
    return this.maxEndDate();
  }

  minStartDate(): any {
    if (this.filterParams.endDate) {
      return moment(this.filterParams.endDate).subtract(90, 'days');
    }
    return null;
  }

  minEnDate(): any {
    if (this.filterParams.startDate) {
      return this.filterParams.startDate;
    }
    return null;
  }

  maxEndDate(): any {
    return moment();
  }

  dayCalculator(): any {
    const today = moment().unix();
    const startDate = this.filterParams.startDate;
    const endDate = this.filterParams.endDate;
    if ((startDate && today < startDate.unix()) || (endDate && today < endDate.unix())) {
      return 'Thời gian lấy dữ liệu là bất kỳ nhưng không được vượt quá ngày hôm nay';
    }
    const days = endDate?.diff(startDate, 'days');
    if (days > 90) {
      return 'Thời gian lấy dữ liệu là bất kỳ nhưng không được vượt quá 90 ngày';
    }
    if (startDate && endDate && startDate.unix() > endDate.unix()) {
      return 'Từ ngày không được vượt quá đến ngày';
    }
  }

  onForceUpdate(): void {
    this._analyticsFilterService.setFilterParam({
      t: (new Date()).getTime(),
      isSearch: true,
    });
  }

  onSearch(): void {
    this._analyticsFilterService.setFilterParam({
      ...this.filterParams,
      byDate: null,
      isSearch: true,
    });

    console.log(this.filterParams.endDate);
  }

  onChange(event, key): void {
    const params = this.changeParams(key);
    this.filterParams = {
      ...params,
      [key]: event,
    };
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    this.maskedInputFromController.destroy();
    this.maskedInputToController.destroy();
  }

  private changeParams(key): any {
    const params = {
      ...this.filterParams,
      byDate:
        (key === 'startDate' || key === 'endDate') && this.filterParams.byDate
          ? null
          : this.filterParams.byDate,
      startDate: key === 'byDate' && this.filterParams.startDate ? null : this.filterParams.startDate,
      endDate: key === 'byDate' && this.filterParams.endDate ? null : this.filterParams.endDate
    };
    return params;
  }

  onFilterCustomer({ value }) {
    this._analyticsFilterService.updateCustomerFilter(value);
  }
  
}
