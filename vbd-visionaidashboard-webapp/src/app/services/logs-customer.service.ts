/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { HttpClientService } from './http-client.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class LogsCustomerService {
  public data: Date | null = null;

  constructor(private _httpClient: HttpClientService) { }

  search({ startDate, endDate, byDate, store, pageSize, pageIndex, filterCustomer }): Observable<any> {
    const payload = {
      store: store,
      search_date_by: startDate && endDate ? 'byrange' : byDate ? 'bydate' : null,
      search_date_value: startDate && endDate ? {
        start: startDate ? moment(startDate).format('MM/DD/YYYY') : null,
        end: endDate ? moment(endDate).format('MM/DD/YYYY') : null,
      } : byDate ? byDate : null,
      page: pageIndex,
      per_page: pageSize,
      type_search: filterCustomer
    };
    // eslint-disable-next-line arrow-body-style
    return this._httpClient.post('logs-customer', payload).pipe(switchMap((_response) => {
      return of(_response);
    }));
  }
}
