import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject, BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';
import { UserService } from 'app/core/user/user.service';
import moment from 'moment';
import { CONST } from '../app.constants';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsFilterService {
  private _filterParams = new Subject<any>();
  private _localFilterParams = null;
  private _isOpenFilter = new ReplaySubject<boolean>(1);
  private _defaultStore;
  private _customerFilter$ = new BehaviorSubject<'all' | 'matching'>('all');
  public customerFilter$ = this._customerFilter$.asObservable()
 
  constructor(
    private _configService: ConfigService,
    private _userService: UserService,
    ) {
    this._filterParams.subscribe(_filterParams => this._localFilterParams = _filterParams);
    this._configService.config$.subscribe((config) => {
      if (config?.stores?.length) {
        this._defaultStore = _userService.isAdmin ? config.stores[0].id : Number(_userService.user$.id);
        this.setFilterParam({
          store: this._defaultStore,
          isSearch: false
        });
      }
    });
  }

  updateCustomerFilter(value: 'all' | 'matching') {
    this._customerFilter$.next(value);
  }

  get isOpenFilter$(): Observable<boolean> {
    return this._isOpenFilter.asObservable();
  }

  get filterParams$(): Observable<any> {
    return this._filterParams.asObservable();
  }

  set isOpenFilter(value: boolean) {
    this._isOpenFilter.next(value);
  }

  setFilterParam(params): void {
    this._filterParams.next({
      ...this._localFilterParams,
      ...params,
    });
    const {byDate, startDate, endDate} = params;
    if (!byDate && (startDate || endDate)) {
      let label = startDate ? `Từ ngày: ${moment(startDate).format(CONST.DATE_FORMAT)}` : '';
      label += endDate ? ` ${startDate ? 'đến ngày ' : 'Đến ngày: '}${moment(endDate).format(CONST.DATE_FORMAT)}` : '';
      const newTimeRange = {
        value: {
          from: startDate,
          to: endDate,
        },
        label
      };
      this._configService.addManualTimeRange(newTimeRange);
    }
    if (byDate) {
      this._configService.removeManualTimeRange();
    }
  }

  revert(): void {
    this._filterParams.next({
      ...DEFAULT_ANALYTICS_FILTER,
      store: this._defaultStore,
      isSearch: true,
    });
    this._configService.removeManualTimeRange();
  }
}

/* eslint-disable @typescript-eslint/naming-convention */
export const DEFAULT_ANALYTICS_FILTER = Object.freeze({
  // showroomType: 'vin1s',
  byDate: 1,
  startDate: null,
  endDate: null,
  ageRange: null,
  gender: null,
});
