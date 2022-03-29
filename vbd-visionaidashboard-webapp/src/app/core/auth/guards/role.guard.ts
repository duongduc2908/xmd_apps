import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from 'app/core/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private _userService: UserService, private _router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isAdmin = route.data.isAdmin;
    return this._check('', isAdmin);
  }

  private _check(redirectURL: string, isAdmin: any): boolean {
    if (isAdmin && !this._userService.isAdmin) {
      this._router.navigate([redirectURL]);
      return false;
    }
    if (!isAdmin && this._userService.isAdmin) {
      this._router.navigate([redirectURL]);
      return false;
    }
    return true;
  }
}
