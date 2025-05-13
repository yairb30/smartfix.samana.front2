import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './app/core/interceptors/token.interceptor';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [ {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
    provideRouter(routes),
    importProvidersFrom(HttpClientModule,BrowserAnimationsModule)
  ]
}).catch(err => console.error(err));