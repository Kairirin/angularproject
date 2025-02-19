import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { baseUrlInterceptor } from './shared/interceptors/base-url.interceptor';
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { provideGoogleId } from './auth/google-login/google-login.config';
import { provideFacebookId } from './auth/facebook-login/facebook-login.config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(withInterceptors([baseUrlInterceptor, authInterceptor]), withFetch()),
    provideClientHydration(withEventReplay()),
    provideGoogleId(''),
    provideFacebookId('', 'v21.0'), provideClientHydration(withEventReplay()), //APP_ID
  ],
};
