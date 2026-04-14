import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp } from '@angular/fire/app';
import { Analytics, getAnalytics, isSupported, logEvent } from 'firebase/analytics';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly firebaseApp = inject(FirebaseApp);

  private analytics: Analytics | null = null;
  private initPromise: Promise<void> | null = null;

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (!isPlatformBrowser(this.platformId)) return;

      const supported = await isSupported().catch(() => false);
      if (!supported) return;

      this.analytics = getAnalytics(this.firebaseApp);
    })();

    return this.initPromise;
  }

  async track(name: string, params?: Record<string, string | number | boolean | null>): Promise<void> {
    await this.init();

    if (!this.analytics) return;

    try {
      logEvent(this.analytics, name, params);
    } catch (err) {
      console.error('Analytics logEvent failed', err);
    }
  }
}