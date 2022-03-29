/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { HttpClientService } from './http-client.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MarketingService {

  constructor(private _httpClient: HttpClientService) { }

  search(payload): Observable<any> {
    return this._httpClient
      .post('reports', payload)
      .pipe(switchMap(_response => of(_response)));
  }

  save(formData: FormData): Observable<any> {
    // eslint-disable-next-line arrow-body-style
    return this._httpClient
      .post('reports/create', formData, 'multipart/form-data')
      .pipe(switchMap(_response => of(_response)));
  }

  delete(id): Observable<any> {
    return this._httpClient
      .delete(`report/${id}/delete`)
      .pipe(switchMap(_response => of(_response)));
  }

  get(id: string): Observable<any> {
    return this._httpClient
      .get('report/' + id, {})
      .pipe(switchMap(_response => of(_response)));
  }
}
