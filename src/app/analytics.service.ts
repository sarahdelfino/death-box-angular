import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp } from '@angular/fire/app';
import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private firebaseApp = inject(FirebaseApp);

  private analytics: Analytics | null = null;
  private initPromise: Promise<void> | null = null;

  // tiny queue so early events aren’t lost
  private queue: Array<{ name: string; params?: Record<string, any> }> = [];
  private readonly MAX_QUEUE = 50;

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private hasConsent(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem('dbx_analytics_consent') === 'granted';
  }

  setConsent(granted: boolean): void {
    if (!this.isBrowser()) return;

    localStorage.setItem('dbx_analytics_consent', granted ? 'granted' : 'denied');

    if (!granted) {
      // stop future events; keep queue empty
      this.queue = [];
      // we can also drop the instance reference
      this.analytics = null;
    } else {
      void this.initIfAllowed();
    }
  }

  initIfAllowed(): Promise<void> {
    if (!this.isBrowser()) return Promise.resolve();
    if (!this.hasConsent()) return Promise.resolve();
    if (this.analytics) return Promise.resolve();

    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (!(await isSupported())) return;
        this.analytics = getAnalytics(this.firebaseApp);

        // flush queued events
        if (this.analytics && this.queue.length) {
          for (const e of this.queue) logEvent(this.analytics, e.name, e.params);
          this.queue = [];
        }
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  track(name: string, params?: Record<string, any>): void {
    if (!this.isBrowser()) return;
    if (!this.hasConsent()) return;

    if (this.analytics) {
      logEvent(this.analytics, name, params);
      return;
    }

    // queue while initializing
    if (this.queue.length < this.MAX_QUEUE) this.queue.push({ name, params });
    void this.initIfAllowed();
  }
}
