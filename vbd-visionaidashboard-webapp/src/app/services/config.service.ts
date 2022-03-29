import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, tap, BehaviorSubject } from 'rxjs';
import { HttpClientService } from './http-client.service';
import moment from 'moment';
import { CONST } from '../app.constants';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _config = new ReplaySubject<boolean>(1);
  private _timeRanges = new BehaviorSubject<any[]>([
    {
      id: 1,
      value: {
        from: moment().toDate(),
        to: moment().toDate(),
      },
      label: 'Hôm nay',
    },
    {
      id: 7,
      value: {
        from: moment().subtract(6, 'day'),
        to: moment().toDate(),
      },
      label: '7 ngày gần đây',
    },
    {
      id: 30,
      value: {
        from: moment().subtract(29, 'day'),
        to: moment().toDate(),
      },
      label: '30 ngày gần đây',
    },
  ]);
  private _localTimeRanges: any[];
  constructor(private _httpClient: HttpClientService) {
    this._timeRanges.subscribe(_timeRanges => this._localTimeRanges = _timeRanges);
  }

  get config$(): Observable<any> {
    return this._config.asObservable();
  }

  set config(value: any) {
    this._config.next(value);
  }

  get timeRanges$(): Observable<any[]> {
    return this._timeRanges.asObservable();
  }

  addManualTimeRange(timeRange): void {
    const timeRangeClone = [...this._localTimeRanges];
    const indexRemove = timeRangeClone.findIndex(_timeRange => _timeRange.id === CONST.TIME_RANGE_MANUAL_ID);
    if (indexRemove !== -1) {
      timeRangeClone.splice(indexRemove, 1);
    }
    timeRangeClone.push({
      ...timeRange,
      id: CONST.TIME_RANGE_MANUAL_ID
    });
    this._timeRanges.next(timeRangeClone);
  }

  removeManualTimeRange(): void {
    const indexRemove = this._localTimeRanges.findIndex(_timeRange => _timeRange.id === CONST.TIME_RANGE_MANUAL_ID);
    if (indexRemove !== -1) {
      const newTimeRange = [...this._localTimeRanges];
      newTimeRange.splice(indexRemove, 1);
      this._timeRanges.next(newTimeRange);
    }
  }

  getConfig(): Observable<any> {
    return this._httpClient.get('config', {}).pipe(
      tap((config: any) => {
        this.config = {
          ...config.data,
          gender: config.data.genders,
          age: config.data.age_types,
          charts: config.data.charts,
          colorCompares: config.data.color_compares,
          timesRange:  [
            {
              id: 1,
              value: {
                from: moment().toDate(),
                to: moment().toDate(),
              },
              label: 'Hôm nay',
            },
            {
              id: 7,
              value: {
                from: moment().subtract(6, 'day'),
                to: moment().toDate(),
              },
              label: '7 ngày gần đây',
            },
            {
              id: 30,
              value: {
                from: moment().subtract(29, 'day'),
                to: moment().toDate(),
              },
              label: '30 ngày gần đây',
            },
          ],
        };
      })
    );
  }
}
