import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './shared/services/config/app-config.service';

export function setupAppConfigServiceFactory(
  service: AppConfigService
): Function {
  return () => service.load();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: setupAppConfigServiceFactory,
      deps:[
        AppConfigService
      ],
      multi:true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
