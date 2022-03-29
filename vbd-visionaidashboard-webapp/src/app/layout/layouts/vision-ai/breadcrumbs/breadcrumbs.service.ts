import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  private _breadcrumbs$ = new BehaviorSubject<any>([]);
  constructor(private router: Router, private route: ActivatedRoute) {
  }

  get breadcrumbs$(): Observable<any> {
    return this._breadcrumbs$.asObservable();
  }

  public addBreadcrumb(root, [], breadcrumbs): void {
    this.selfAddBreadcrumb(root, [], breadcrumbs);
    this._breadcrumbs$.next(breadcrumbs);
  }

  private selfAddBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs): void {
    if (route) {
      const routeUrl = parentUrl.concat(route.url.map(url => url.path));
      if (route.data.breadcrumb) {
        const breadcrumb = {
          label: this.getLabel(route.data),
          url: '/' + routeUrl.join('/')
        };
        if (!breadcrumbs.length) {
          breadcrumbs.push(breadcrumb);
        } else if (breadcrumbs[breadcrumbs.length - 1].url !== breadcrumb.url) {
          breadcrumbs.push(breadcrumb);
        }
      }
      this.selfAddBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
    }
  }

  private getLabel(data): any {
    return typeof data.breadcrumb === 'function' ? data.breadcrumb(data) : data.breadcrumb;
  }
}
