/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AnalyticsFilterService } from 'app/services/analytics-filter.service';
import { ConfigService } from 'app/services/config.service';
import { Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { UserService } from '../../../core/user/user.service';
import * as textMask from 'vanilla-text-mask/dist/vanillaTextMask';
import { CONST } from '../../../app.constants';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'vai-analytics-filter',
  templateUrl: './analytics-filter.component.html',
  styleUrls: ['./analytics-filter.component.scss'],
})
export class AnalyticsFilterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputFromDate', { read: ViewContainerRef, static: true }) public inputFromDate;
  @ViewChild('inputToDate', { read: ViewContainerRef, static: true }) public inputToDate;
  genders = [];
  ages = [];
  stores = [];
  times = [];
  filterParams = {
    showroomType: null,
    store: null,
    startDate: null,
    endDate: null,
    byDate: null,
    gender: null,
    ageRange: null,
  };
  dateForm: FormGroup;
  maskedInputFromController;
  maskedInputToController;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _analyticsFilterService: AnalyticsFilterService,
    private _configService: ConfigService,
    public _userService: UserService,
    private _formBuilder: FormBuilder,
  ) {
    this._analyticsFilterService.filterParams$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_filterParams) => {
        this.filterParams = _filterParams;
      });

    this._configService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_config) => {
        this.stores = _config.stores;
        this.ages = _config.age_types;
        this.genders = _config.genders.filter(gender => gender.is_search);
      });

    this._configService.timeRanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_timeRanges) => {
        this.times = !_timeRanges ? [] : _timeRanges
          .filter(_timeRange => _timeRange.id !== CONST.TIME_RANGE_MANUAL_ID);
      });

    this.dateForm = this._formBuilder.group({
      startDate: [],
      endDate: [],
    });
  }

  ngOnInit(): void { }

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

  onFilter(): void {
    this._analyticsFilterService.setFilterParam({
      ...this.filterParams,
      isSearch: true,
    });
  }

  revert(): void {
    this._analyticsFilterService.revert();
  }

  closeFilter(): void {
    this._analyticsFilterService.isOpenFilter = false;
  }

  onChange(event, key): void {
    const params = this.changeParams(key);
    this.filterParams = {
      ...params,
      [key]: event,
    };
  }

  onChangeByDate(event): void {
    this.onChange(event, 'byDate');
    const time = this.times.find(_time => _time.id === event);
    if (!time) { return; }
    this.filterParams.startDate = time.value.from;
    this.filterParams.endDate = time.value.to;
    this.setFormDateValue('startDate', time.value.from);
    this.setFormDateValue('endDate', time.value.to);
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
    const startDate = moment(this.filterParams.startDate);
    const endDate = moment(this.filterParams.endDate);

    if ((startDate && today < startDate.unix()) || (endDate && today < endDate.unix())) {
      return 'Thời gian lấy dữ liệu là bất kỳ nhưng không được vượt quá ngày hôm nay';
    }
    const days = endDate.diff(startDate, 'days');
    if (days > 90) {
      return 'Thời gian lấy dữ liệu là bất kỳ nhưng không được vượt quá 90 ngày';
    }
    if (startDate && endDate && startDate.unix() > endDate.unix()) {
      return 'Từ ngày không được vượt quá đến ngày';
    }
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

  private setFormDateValue(key, value): any {
    if (!value) {
      this.dateForm.get(key).setValue(null);
      return;
    }
    this.dateForm.get(key).setValue(moment(value));
  }
}
