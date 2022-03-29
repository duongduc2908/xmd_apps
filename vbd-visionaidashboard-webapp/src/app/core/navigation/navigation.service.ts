import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationService
{
    private _navigationData: Navigation = null;
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    /**
     * Constructor
     */
    constructor(
      private _httpClient: HttpClient,
      private _userService: UserService,
    )
    {
      this._navigationData = {
        compact: [],
        futuristic: [],
        horizontal: [],
        default: [
          {
            id      : 'analysis-customer',
            title   : 'PHÂN TÍCH KHÁCH HÀNG',
            type    : 'group',
            children: [
              {
                id   : 'analysis-customer.dashboard',
                title: 'Tổng quan',
                type : 'basic',
                icon : 'heroicons_outline:chart-bar',
                link : '/analysis-customer/dashboard'
              },
              {
                id      : 'analysis-customer.store-model',
                title   : 'Mô hình cửa hàng',
                type    : 'collapsable',
                icon    : 'heroicons_outline:view-grid',
                hidden: (): boolean => !this._userService.isAdmin,
                children: [
                  {
                    id   : 'analysis-customer.store-model.vin1s',
                    title: 'Vin1S',
                    type : 'basic',
                    link : '/analysis-customer/store-model/vin1s'
                  },
                  {
                    id   : 'analysis-customer.store-model.vin3s',
                    title: 'Vin3S',
                    type : 'basic',
                    link : '/analysis-customer/store-model/vin3s'
                  },
                ]
              },
              {
                id   : 'analysis-customer.marketing-report',
                title: 'Báo cáo chiển dịch Marketing',
                type : 'basic',
                icon : 'heroicons_outline:document-text',
                link : '/analysis-customer/marketing-report',
                hidden: (): boolean => !this._userService.isAdmin,
              }
            ]
          },
          {
            id      : 'analysis-showroom',
            title   : 'PHÂN TÍCH SHOWROOM',
            type    : 'group',
            children: [
              {
                id   : 'analysis-showroom.staff-quality',
                title: 'Chất lượng nhân viên',
                type : 'basic',
                icon : 'heroicons_outline:clock',
                link : '/analysis-showroom/staff-quality'
              },
              {
                id   : 'analysis-showroom.staff-quality-vin1s',
                title: 'Chất lượng nhân viên Vin1S',
                type : 'basic',
                icon : 'heroicons_outline:clock',
                link : '/analysis-showroom/staff-quality-vin1s',
                hidden: (): boolean => !this._userService.isAdmin,
              },
              {
                id   : 'analysis-showroom.staff-quality-vin3s',
                title: 'Chất lượng nhân viên Vin3S',
                type : 'basic',
                icon : 'heroicons_outline:clock',
                link : '/analysis-showroom/staff-quality-vin3s',
                hidden: (): boolean => !this._userService.isAdmin,
              },
            ]
          },
          {
            id      : 'security',
            title   : 'QUẢN LÝ AN NINH',
            type    : 'group',
            hidden: (): boolean => this._userService.isAdmin,
            children: [
              {
                id   : 'security.restricted-area',
                title: 'Khu vực hạn chế',
                type : 'basic',
                icon : 'heroicons_outline:key',
                link : '/security/restricted-area'
              },
            ]
          },
          {
            id      : 'logs-customer',
            title   : 'Logs khách hàng',
            type    : 'group',
            hidden: (): boolean => this._userService.isAdmin,
            children: [
              {
                id   : 'logs-customer.customer-activities',
                title: 'Hoạt động khách hàng',
                type : 'basic',
                icon : 'heroicons_outline:table',
                link : '/logs-customer/customer-activities'
              },
            ]
          }
        ]
      };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation>
    {
      return new Observable((observer) => {
        this._navigation.next(this._navigationData);
        observer.next(this._navigationData);
        observer.complete();
      });
    }
}
