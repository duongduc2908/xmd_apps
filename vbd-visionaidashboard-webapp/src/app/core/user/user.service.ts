import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, ReplaySubject, tap } from 'rxjs';
import { User } from 'app/core/user/user.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for user
   *
   * @param value
   */
  get user$(): any {
    try {
      const user = localStorage.getItem('user');
      return JSON.parse(user);
    } catch (error) {
      return '';
    }
  }

  get isAdmin(): any {
    try {
      return this.user$.role === 'admin_user';
    } catch (error) {
      return false;
    }
  }

  set user(value) {
    localStorage.setItem('user', JSON.stringify(value));
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get the current logged in user data
   */
  get(): Observable<User> {
    const user: User = {
      id: '1',
      name: 'vision',
      email: 'admin@ai-vision.com'
    };
    return of(user);
  }

  /**
   * Update the user
   *
   * @param user
   */
  update(user: User): Observable<any> {
    return this._httpClient.patch<User>('api/common/user', { user }).pipe(
      map((response) => {
        this._user.next(response);
      })
    );
  }
}
