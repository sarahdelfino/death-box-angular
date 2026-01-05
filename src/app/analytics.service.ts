import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp } from '@angular/fire/app';

type Analytics = import('firebase/analytics').Analytics;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private firebaseApp = inject(FirebaseApp);

  private analytics: Analytics | null = null;
  private initPromise: Promise<void> | null = null;

  // small queue so early events aren’t lost
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
      this.queue = [];
      this.analytics = null;
      this.initPromise = null;
      return;
    }

    void this.initIfAllowed();
  }

  /**
   * CRITICAL: dynamic import ensures Firebase registers the "analytics" component
   * before getAnalytics() is called (avoids "Component analytics has not been registered yet").
   */
  initIfAllowed(): Promise<void> {
    if (!this.isBrowser()) return Promise.resolve();
    if (!this.hasConsent()) return Promise.resolve();
    if (this.analytics) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const mod = await import('firebase/analytics');

        if (!(await mod.isSupported())) return;

        // after importing, the component is registered
        this.analytics = mod.getAnalytics(this.firebaseApp);

        // flush queued events
        if (this.queue.length) {
          for (const e of this.queue) mod.logEvent(this.analytics, e.name, e.params);
          this.queue = [];
        }
      } catch (err) {
        // swallow — analytics should never break gameplay
        // console.debug('[AnalyticsService] init failed', err);
        this.analytics = null;
        this.queue = [];
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
      // load logEvent lazily
      void import('firebase/analytics').then((m) => m.logEvent(this.analytics!, name, params));
      return;
    }

    // queue while initializing
    if (this.queue.length < this.MAX_QUEUE) this.queue.push({ name, params });
    void this.initIfAllowed();
  }
}
