import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, signInAnonymously } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      signInAnonymously(auth).catch(err => {
        console.log('Auth failed', err);
      });
      return auth;
    }),
    provideDatabase(() => getDatabase()),
    // provideFirestore(() => getFirestore()),
  ],
};
