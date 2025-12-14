import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, signInAnonymously } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideAnalytics, getAnalytics, logEvent } from '@angular/fire/analytics';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AppTitleStrategy } from './title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideHttpClient(withInterceptorsFromDi()),

    
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      signInAnonymously(auth).catch(err => {
        console.log('Auth failed', err);
      });
      return auth;
    }),
    provideAnalytics(() => getAnalytics()),
    provideDatabase(() => getDatabase()),
    
  ],
};
