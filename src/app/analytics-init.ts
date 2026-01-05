// analytics-init.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp } from '@angular/fire/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

export async function initAnalyticsIfSupported(): Promise<Analytics | null> {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return null; // SSR / node

  // optional: also require user consent before continuing
  // if (!hasAnalyticsConsent()) return null;

  if (!(await isSupported())) return null;

  const app = inject(FirebaseApp);
  return getAnalytics(app);
}
