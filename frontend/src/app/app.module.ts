import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from './shared/components/header/header.component';
import { SideNavComponent } from './shared/components/side-nav/side-nav.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { FeatureModule } from './features/feature.module';
import { TruncatePipe } from './core/pipes/truncate.pipe';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './core/toast.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SideNavComponent,
    FooterComponent,
    TruncatePipe,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    FontAwesomeModule,
    FontAwesomeModule,
    FeatureModule,
    CommonModule
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule { }
