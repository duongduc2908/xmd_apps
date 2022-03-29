import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent, } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { LogoutConfirmDialogComponent } from '../logout-confirm-dialog/logout-confirm-dialog.component';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { MAT_FORM_FIELD } from '@angular/material/form-field';
import { ConfigService } from 'app/services/config.service';
import { AnalyticsFilterService } from 'app/services/analytics-filter.service';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'vision-ai-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: MAT_SELECT_CONFIG,
      useValue: {overlayPanelClass: 'keep-light'},
    },
    {
      provide: MAT_FORM_FIELD,
      useValue: {overlayPanelClass: 'keep-light'},
    },
  ],
})
export class VinAIHeaderComponent implements OnInit, OnDestroy {
  navigation: Navigation;
  isScreenSmall: boolean;
  stores = [];
  store = null;
  showroomType = null;
  userName: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _navigationService: NavigationService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService,
    private _configService: ConfigService,
    private _analyticsFilterService: AnalyticsFilterService,
    private _router: Router,
    public _dialog: MatDialog,
    public _userService: UserService
  ) {
    this._configService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(_config => this.stores = _config.stores);
    this._analyticsFilterService.filterParams$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((_filterParams) => {
        this.store = _filterParams.store;
        this.showroomType = _filterParams.showroomType;
      });
  }

  ngOnInit(): void {
    this._navigationService.navigation$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((navigation: Navigation) => {
        this.navigation = navigation;
      });

    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({matchingAliases}) => {
        this.isScreenSmall = !matchingAliases.includes('md');
      });
  }

  toggleNavigation(name: string): void {
    const navigation =
      this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
        name
      );

    if (navigation) {
      navigation.toggle();
    }
  }

  goHome(): void {
    this._router.navigate(['/']);
  }

  onSelectionChange({value}): void {
    this._analyticsFilterService.setFilterParam({
      store: value,
      isSearch: true,
    });
  }

  onClickLogout(): void {
    this._dialog.open(LogoutConfirmDialogComponent, {
      panelClass: 'keep-light',
      autoFocus: false
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
