import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GridPageComponent } from './components/grid-page/grid-page.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ListItemDirective } from './components/navigation/navigation.directive';
import { FooterComponent } from './components/footer/footer.component';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { SchedulePageComponent } from './components/schedule-page/schedule-page.component';
import { SubjectPageComponent } from './components/subject-page/subject-page.component';
import { GlobalErrorHandler } from 'src/lib/GlobalErrorHandler';
import { GradeWidgetComponent } from './components/grade-widget/grade-widget.component';
import { WidgetComponent } from './components/widget/widget.component';
import { SubjectListPageComponent } from './components/subject-list-page/subject-list-page.component';
import { KwtOptionPageComponent } from './components/kwt-option-page/kwt-option-page.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

@NgModule({
  declarations: [
    AppComponent,
    GridPageComponent,
    NavigationComponent,
    ListItemDirective,
    FooterComponent,
    SettingsPageComponent,
    SchedulePageComponent,
    SubjectPageComponent,
    GradeWidgetComponent,
    WidgetComponent,
    SubjectListPageComponent,
    KwtOptionPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  providers: [InAppBrowser, {
    // processes all errors
    provide: ErrorHandler,
    useClass: GlobalErrorHandler,
  },],
  bootstrap: [AppComponent]
})
export class AppModule { }
