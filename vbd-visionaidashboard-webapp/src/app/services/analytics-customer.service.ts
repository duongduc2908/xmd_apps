import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { HttpClientService } from './http-client.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsCustomerService {
  constructor(private _httpClient: HttpClientService) {}
  /* eslint-disable */
  search({ startDate, endDate, searchValue, byDate, ageRange, showroomType, gender, store }, path): Observable<any> {
    const payload = {
      search_by: showroomType ? 'showroom_type' : 'store',
      search_value: showroomType || store,
      age_range: ageRange,
      gender,
      search_date_by: byDate ? 'bydate' : (startDate && endDate) ? 'byrange' : null,
      search_date_value: byDate ? byDate : (startDate && endDate) ? {
        start: startDate ? moment(startDate).format('MM/DD/YYYY') : null,
        end: endDate ? moment(endDate).format('MM/DD/YYYY') : null,
      } : null,
    };
    return this._httpClient
      .post(path, payload)
      .pipe(switchMap((_response) => {
      return of(_response);
    }))
  }
}
