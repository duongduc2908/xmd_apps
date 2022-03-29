import { Injectable } from '@angular/core';
import { CONST } from '../app.constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private http: HttpClient) { }

  get(url, params): any {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.http.get(`${CONST.URL.BASE}/${url}`, {headers, params});
  }

  post(url, data, contentType = 'application/json; charset=utf-8'): any {
    const headers = new HttpHeaders();
    headers.set('Content-Type', contentType);
    return this.http.post(`${CONST.URL.BASE}/${url}`, data, {headers});
  }

  delete(url, contentType = 'application/json; charset=utf-8'): any {
    const headers = new HttpHeaders();
    headers.set('Content-Type', contentType);
    return this.http.delete(`${CONST.URL.BASE}/${url}`, {
      headers: headers
    });
  }
}
