import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { baseUrlInterceptor } from './shared/interceptors/base-url.interceptor';
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { provideGoogleId } from './auth/google-login/google-login.config';
import { provideFacebookId } from './auth/facebook-login/facebook-login.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(withInterceptors([baseUrlInterceptor, authInterceptor])),
    provideGoogleId('1161264609-p0pct0u7g1b72j2riaqp1mlh284l4smk.apps.googleusercontent.com'),//''
    provideFacebookId('3885915868319779', 'v21.0') //APP_ID
  ],
};
