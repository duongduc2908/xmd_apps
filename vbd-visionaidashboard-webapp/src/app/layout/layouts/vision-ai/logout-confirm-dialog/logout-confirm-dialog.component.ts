import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'vai-logout-confirm-dialog',
  templateUrl: './logout-confirm-dialog.component.html',
  styleUrls: ['./logout-confirm-dialog.component.scss'],
})
export class LogoutConfirmDialogComponent implements OnInit {

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {
  }

  ngOnInit(): void {
  }

  onLogout(): void {
    this._authService.signOut();
    this._router.navigate(['sign-in']);
  }
}
