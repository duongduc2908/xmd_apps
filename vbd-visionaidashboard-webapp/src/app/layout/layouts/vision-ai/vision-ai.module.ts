import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FuseFullscreenModule } from '@fuse/components/fullscreen';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { LanguagesModule } from 'app/layout/common/languages/languages.module';
import { MessagesModule } from 'app/layout/common/messages/messages.module';
import { NotificationsModule } from 'app/layout/common/notifications/notifications.module';
import { QuickChatModule } from 'app/layout/common/quick-chat/quick-chat.module';
import { SearchModule } from 'app/layout/common/search/search.module';
import { ShortcutsModule } from 'app/layout/common/shortcuts/shortcuts.module';
import { UserModule } from 'app/layout/common/user/user.module';
import { SharedModule } from 'app/shared/shared.module';
import { VisionAiLayoutComponent } from 'app/layout/layouts/vision-ai/vision-ai.component';
import { VinAIHeaderComponent } from './header/header.component';
import { MatSelectModule } from '@angular/material/select';
import { LogoutConfirmDialogComponent } from './logout-confirm-dialog/logout-confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';

@NgModule({
  declarations: [
    VisionAiLayoutComponent,
    VinAIHeaderComponent,
    LogoutConfirmDialogComponent,
    BreadcrumbsComponent
  ],
  imports: [
    HttpClientModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    FuseFullscreenModule,
    FuseLoadingBarModule,
    FuseNavigationModule,
    LanguagesModule,
    MessagesModule,
    NotificationsModule,
    QuickChatModule,
    SearchModule,
    ShortcutsModule,
    UserModule,
    SharedModule,
    MatSelectModule,
    MatDialogModule,
  ],
  exports: [
    VisionAiLayoutComponent,
    BreadcrumbsComponent
  ]
})
export class VisionAiModule {
}
